/* Coleta local: metadados estruturados, sem publicar conversas ou saídas. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const readline = require('node:readline');
const normalRepo = value => {
  const s = String(value || '').trim().replace(/\.git\/?$/i, '').replace(/\/$/, '');
  const m = s.match(/github\.com[/:]([^/]+\/[^/]+)$/i);
  return m ? m[1].toLowerCase() : '';
};
const limparCaminho = value => String(value || '').replace(/^\\\\\?\\/, '');
function caminhos(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out;
  if (Array.isArray(obj)) { for (const v of obj) caminhos(v, out); return out; }
  for (const [k, v] of Object.entries(obj)) {
    if (['path', 'cwd', 'workdir', 'file_path', 'filePath'].includes(k) && typeof v === 'string') out.push(v);
    else if (v && typeof v === 'object') caminhos(v, out);
  }
  return out;
}
function mesclar(ledger, novos) {
  const result = structuredClone(ledger);
  const byId = new Map(result.registros.map(r => [r.id, r]));
  for (const r of novos) {
    const old = byId.get(r.id);
    if (old) {
      for (const key of ['aplicativoId', 'atribuicao', 'grupo', 'referencia']) if (old[key] !== r[key]) throw Error('Identidade de evento mudou: ' + r.id);
      old.instantes = [...new Set([...old.instantes, ...r.instantes])].sort();
    } else { const copy = structuredClone(r); byId.set(copy.id, copy); result.registros.push(copy); }
  }
  result.registros.sort((a, b) => a.id.localeCompare(b.id));
  return result;
}
function selecionarRepos(sinais, repoSessao) {
  const unique = [...new Set(sinais.filter(Boolean))];
  if (unique.length > 1) return { repo: '', motivo: 'turno com vários repositórios' };
  if (unique.length === 1) return { repo: unique[0], motivo: 'caminho estruturado com remote Git verificado' };
  return { repo: repoSessao, motivo: repoSessao ? 'remote Git da sessão' : 'sem vínculo verificável' };
}
function resolvedorGit() {
  const cache = new Map();
  return function repoCaminho(value, cwd = process.cwd()) {
    if (!value || /(?:\.env|credential|secret|cookie)/i.test(value)) return '';
    let p = limparCaminho(value);
    if (!path.isAbsolute(p)) p = path.resolve(limparCaminho(cwd), p);
    try { if (!fs.statSync(p).isDirectory()) p = path.dirname(p); } catch { return ''; }
    const visited = [];
    let repo = '';
    while (true) {
      if (cache.has(p)) { repo = cache.get(p); break; }
      visited.push(p);
      if (fs.existsSync(path.join(p, '.git'))) {
        try { repo = normalRepo(cp.execFileSync('git', ['-C', p, 'config', '--get', 'remote.origin.url'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 3000 })); } catch { /* Não inferir. */ }
        break;
      }
      const parent = path.dirname(p); if (parent === p) break; p = parent;
    }
    for (const v of visited) cache.set(v, repo);
    return repo;
  };
}
function coletarCodex({ catalogo, home = os.homedir(), ate = Date.now(), ignorarThreads = [] }) {
  const { DatabaseSync } = require('node:sqlite');
  const statePath = path.join(home, '.codex', 'state_5.sqlite');
  const historyPath = path.join(home, '.codex', 'thread_history_1.sqlite');
  if (!fs.existsSync(statePath) || !fs.existsSync(historyPath)) return { registros: [], limites: { codexIndisponivel: true } };
  const state = new DatabaseSync(statePath, { readOnly: true });
  const hist = new DatabaseSync(historyPath, { readOnly: true });
  const porRepo = new Map(catalogo.map(c => [normalRepo('https://github.com/' + c.repo), c]));
  const corteMin = Math.min(...catalogo.flatMap(c => c.base.projetos.map(p => Date.parse(p.corte_em)))) + 1;
  const importsPath = path.join(home, '.codex', 'external_agent_session_imports.json');
  const imported = new Set(fs.existsSync(importsPath) ? (JSON.parse(fs.readFileSync(importsPath, 'utf8')).records || []).map(r => r.imported_thread_id) : []);
  const ignorar = new Set(ignorarThreads);
  const repoCaminho = resolvedorGit();
  const stmt = hist.prepare(`SELECT turn_id,created_at_ms,item_type,CASE
    WHEN item_type='fileChange' THEN json_extract(item_json,'$.changes')
    WHEN item_type='commandExecution' THEN json_object('cwd',json_extract(item_json,'$.cwd'))
    WHEN item_type='mcpToolCall' THEN json_extract(item_json,'$.arguments') ELSE NULL END metadata
    FROM thread_items WHERE thread_id=? AND created_at_ms>=? AND created_at_ms<=?
    AND item_type IN ('userMessage','agentMessage','fileChange','commandExecution','mcpToolCall') ORDER BY rollout_ordinal`);
  const result = [], limites = { importados: 0, subagentes: 0, coordenacao: 0, semVinculo: 0, multiplosRepositorios: 0, multiplosDestinos: 0 };
  try {
    for (const s of state.prepare('SELECT id,cwd,git_origin_url,source FROM threads WHERE updated_at>=?').iterate(Math.floor(corteMin / 1000))) {
      if (imported.has(s.id)) { limites.importados++; continue; }
      if (/subagent|guardian/i.test(s.source)) { limites.subagentes++; continue; }
      if (ignorar.has(s.id)) { limites.coordenacao++; continue; }
      const repoSessao = normalRepo(s.git_origin_url) || repoCaminho(s.cwd, s.cwd);
      const byTurn = new Map();
      for (const row of stmt.iterate(s.id, corteMin, ate)) {
        if (!byTurn.has(row.turn_id)) byTurn.set(row.turn_id, { instantes: [], paths: [] });
        const turn = byTurn.get(row.turn_id); turn.instantes.push(row.created_at_ms);
        if (row.metadata) { try { caminhos(JSON.parse(row.metadata), turn.paths); } catch { /* Metadado não reconhecido não é evidência. */ } }
      }
      for (const [turnId, turn] of byTurn) {
        const signals = [...new Set(turn.paths)].map(p => repoCaminho(p, s.cwd));
        const selection = selecionarRepos(signals, repoSessao);
        if (!selection.repo) { limites[selection.motivo.startsWith('turno') ? 'multiplosRepositorios' : 'semVinculo']++; continue; }
        const c = porRepo.get(selection.repo); if (!c) continue;
        if (c.base.projetos.length !== 1) { limites.multiplosDestinos++; continue; }
        const b = c.base.projetos[0];
        const instantes = [...new Set(turn.instantes)].filter(t => t > Date.parse(b.corte_em)).sort((a, b) => a - b).map(t => new Date(t).toISOString());
        if (instantes.length < 2) continue;
        const id = 'codex-' + crypto.createHash('sha256').update(s.id + ':' + turnId + ':' + b.aplicativoId).digest('hex').slice(0, 40);
        result.push({ id, aplicativoId: b.aplicativoId, atribuicao: 'aplicativo', grupo: b.nome, instantes, referencia: '.sistema/esforco-eventos.json#' + id });
      }
    }
  } finally { state.close(); hist.close(); }
  return { registros: result, limites };
}
async function coletarClaude({ catalogo, home = os.homedir(), ate = Date.now() }) {
  const root = path.join(home, '.claude', 'projects');
  const registros = [], limites = { claudeSemVinculo: 0, claudeMultiplosRepositorios: 0, claudeMultiplosDestinos: 0 };
  if (!fs.existsSync(root)) return { registros, limites: { claudeIndisponivel: true } };
  const porRepo = new Map(catalogo.map(c => [normalRepo('https://github.com/' + c.repo), c]));
  const corteMin = Math.min(...catalogo.flatMap(c => c.base.projetos.map(p => Date.parse(p.corte_em))));
  const repoCaminho = resolvedorGit();
  function salvar(t) {
    if (!t || t.instantes.length < 2) return;
    const selection = selecionarRepos([...new Set(t.paths)].map(p => repoCaminho(p, t.cwd)), repoCaminho(t.cwd));
    if (!selection.repo) { limites[selection.motivo.startsWith('turno') ? 'claudeMultiplosRepositorios' : 'claudeSemVinculo']++; return; }
    const c = porRepo.get(selection.repo); if (!c) return;
    if (c.base.projetos.length !== 1) { limites.claudeMultiplosDestinos++; return; }
    const b = c.base.projetos[0];
    const instantes = [...new Set(t.instantes)].filter(x => x > Date.parse(b.corte_em)).sort((a, b) => a - b).map(x => new Date(x).toISOString());
    if (instantes.length < 2) return;
    const id = 'claude-' + crypto.createHash('sha256').update(t.file + ':' + t.id + ':' + b.aplicativoId).digest('hex').slice(0, 40);
    registros.push({ id, aplicativoId: b.aplicativoId, atribuicao: 'aplicativo', grupo: b.nome, instantes, referencia: '.sistema/esforco-eventos.json#' + id });
  }
  for (const dir of fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory())) {
    for (const name of fs.readdirSync(path.join(root, dir.name)).filter(n => n.endsWith('.jsonl') && !n.startsWith('agent-'))) {
      const file = path.join(root, dir.name, name);
      // Apenas evita arquivos anteriores ao período. mtime nunca vira duração.
      if (fs.statSync(file).mtimeMs < corteMin) continue;
      let t = null, lineNumber = 0;
      for await (const line of readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity })) {
        lineNumber++; let j; try { j = JSON.parse(line); } catch { continue; }
        const ts = Date.parse(j.timestamp); if (!Number.isFinite(ts) || ts > ate || j.isSidechain) continue;
        const content = j.message?.content;
        const human = j.type === 'user' && (typeof content === 'string' || (Array.isArray(content) && content.some(x => x.type === 'text') && !content.some(x => x.type === 'tool_result')));
        if (human) { salvar(t); t = { file: name, id: j.uuid || String(lineNumber), cwd: j.cwd || '', instantes: [], paths: [] }; }
        if (!t) continue;
        if (!t.cwd && j.cwd) t.cwd = j.cwd;
        if (ts > corteMin && ['user', 'assistant', 'system', 'progress'].includes(j.type)) t.instantes.push(ts);
        if (j.type === 'assistant' && Array.isArray(content)) for (const block of content) if (block.type === 'tool_use') caminhos(block.input, t.paths);
      }
      salvar(t);
    }
  }
  return { registros, limites };
}
async function main() {
  const dir = __dirname;
  const base = JSON.parse(fs.readFileSync(path.join(dir, 'esforco-base.json'), 'utf8'));
  const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
  const match = readme.match(/Repositório:\s*\*\*([^*]+)\*\*/);
  if (!match) throw Error('Repositório não identificado na documentação da integração.');
  const ledgerPath = path.join(dir, 'esforco-eventos.json');
  const ledgerOriginal = fs.readFileSync(ledgerPath, 'utf8');
  const old = JSON.parse(ledgerOriginal);
  const options = { catalogo: [{ repo: match[1], base }], ignorarThreads: ['01a164ec-4c98-7302-bdea-36bd70dfcf77', '01a20570-d436-7442-875f-cc0397856129'] };
  const result = coletarCodex(options), claude = await coletarClaude(options);
  const next = mesclar(old, [...result.registros, ...claude.registros]);
  const andamentoPath = path.join(dir, 'andamento.json');
  const andamentoOriginal = fs.readFileSync(andamentoPath, 'utf8');
  const { gerar } = require(path.join(dir, 'atualizar-esforco.cjs'));
  const andamento = gerar(base, next, JSON.parse(andamentoOriginal));
  // Valida os dois arquivos antes de gravar; não acessa rede nem aplica fichas.
  if (fs.readFileSync(ledgerPath, 'utf8') !== ledgerOriginal || fs.readFileSync(andamentoPath, 'utf8') !== andamentoOriginal) throw Error('Os arquivos mudaram durante a coleta. Preserve as alterações e execute novamente.');
  fs.writeFileSync(ledgerPath, JSON.stringify(next, null, 2) + '\n');
  fs.writeFileSync(andamentoPath, JSON.stringify(andamento, null, 2) + '\n');
  console.log(JSON.stringify({ registros: next.registros.length, limites: { ...result.limites, ...claude.limites }, estado: 'Preparado localmente; publicar e conferir entrega para revisão no SISTEMA.' }));
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; });
module.exports = { normalRepo, caminhos, mesclar, selecionarRepos, coletarCodex, coletarClaude };
