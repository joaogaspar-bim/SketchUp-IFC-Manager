/* eslint-disable @typescript-eslint/no-require-imports -- Utilitário Node sem dependências, rede ou leitura de conversas. */
const fs=require('node:fs'),path=require('node:path');
const limpar=v=>JSON.parse(JSON.stringify(v));
function instante(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(s)||!Number.isFinite(Date.parse(s)))throw Error('Informe timestamps reais com fuso.');return Date.parse(s);}
const dia=ms=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));
function unir(ps){const out=[];for(const [a,b] of ps.filter(([a,b])=>b>a).sort((x,y)=>x[0]-y[0])){const z=out.at(-1);if(z&&a<=z[1])z[1]=Math.max(z[1],b);else out.push([a,b]);}return out;}
const total=ps=>unir(ps).reduce((s,[a,b])=>s+b-a,0),chave=x=>`${x.atribuicao}:${x.grupo}:${x.dia}`;
function resumo(dias,horasConhecidas){const locais=dias.filter(x=>x.atribuicao==='aplicativo'),datas=[...new Set(locais.map(x=>x.dia))].sort();return {dias_locais:datas.length||null,primeiro_dia_local:datas[0]??'',ultimo_dia_local:datas.at(-1)??'',...Object.fromEntries([5,15,30].map(k=>['horas_'+k,horasConhecidas?locais.reduce((n,x)=>n+x['ms_'+k],0)/3600000:null]))};}
function gerar(base,ledger,andamento){
 if(base.formato!=='base-esforco-aprovada-v1'||ledger.formato!=='eventos-esforco-v1'||andamento.formato!=='andamento-producao-v1')throw Error('Formato de esforço inválido.');
 const saida=limpar(andamento),ids=new Set(base.projetos.map(x=>x.aplicativoId)),vistos=new Set();
 if(ids.size!==base.projetos.length||!Array.isArray(ledger.registros))throw Error('Projetos ou registros repetidos.');
 for(const r of ledger.registros){if(!ids.has(r.aplicativoId)||typeof r.id!=='string'||!/^[A-Za-z0-9_-]{1,160}$/.test(r.id)||vistos.has(r.id))throw Error('Cada registro exige ID único e destino explícito.');vistos.add(r.id);
  if(!['aplicativo','compartilhado','contexto'].includes(r.atribuicao)||typeof r.grupo!=='string'||!r.grupo.trim()||r.grupo.length>1000||!Array.isArray(r.instantes)||r.instantes.length<2)throw Error('Informe atribuição, grupo e pelo menos dois eventos documentados.');
  if(typeof r.referencia!=='string'||!r.referencia.startsWith('.sistema/')||r.referencia.includes('..')||/[\r\n\\]/.test(r.referencia))throw Error('Use referência relativa ao registro publicado, sem caminho local.');
 }
 for(const b of base.projetos){
  const p=saida.projetos.filter(p=>p.aplicativoId===b.aplicativoId);if(p.length!==1)throw Error('Destino não identificado exatamente uma vez.');
  const registros=p[0].registros,esforcos=registros.filter(r=>r.entidade==='esforco');if(esforcos.length>1)throw Error('Esforço repetido.');
  const anteriores=new Map(b.dias.map(d=>[chave(d),limpar(d)])),corteBase=instante(b.corte_em);let corte=corteBase,novos=[];
  for(const r of ledger.registros.filter(x=>x.aplicativoId===b.aplicativoId)){
   if(r.atribuicao==='aplicativo'&&r.grupo!==b.nome)throw Error('Grupo principal deve ser o nome do destino.');
   const ev=[...new Set(r.instantes.map(instante))].sort((a,b)=>a-b);if(ev[0]<corteBase)throw Error('Novos eventos devem começar a partir do corte da base; não reimporte sessões históricas.');
   if(ev.at(-1)>Date.now()+300000)throw Error('Evento futuro não documenta duração realizada.');
   corte=Math.max(corte,ev.at(-1));const intervalos={};for(const k of [5,15,30])intervalos[k]=ev.slice(1).flatMap((v,i)=>v-ev[i]<=k*60000?[[ev[i],v]]:[]);
   novos.push({...r,eventos:ev,intervalos});
  }
  const grupos=new Map();for(const n of novos){const k=n.atribuicao+':'+n.grupo;if(!grupos.has(k))grupos.set(k,{atribuicao:n.atribuicao,grupo:n.grupo,rs:[]});grupos.get(k).rs.push(n);}
  for(const g of grupos.values())for(const date of [...new Set(g.rs.flatMap(r=>r.eventos.map(dia)))]){
   const start=Date.parse(date+'T00:00:00-03:00'),end=start+86400000,rs=g.rs.filter(r=>r.eventos.some(e=>dia(e)===date));
   const linha={dia:date,grupo:g.grupo,atribuicao:g.atribuicao,turnos:rs.length,sessoes:rs.map(r=>'registro-'+r.id),...Object.fromEntries([5,15,30].map(k=>['ms_'+k,total(rs.flatMap(r=>r.intervalos[k]).map(([a,b])=>[Math.max(a,start),Math.min(b,end)]))]))};
   const old=anteriores.get(chave(linha));if(old){linha.turnos+=old.turnos;linha.sessoes=[...new Set([...old.sessoes,...linha.sessoes])];for(const k of [5,15,30])linha['ms_'+k]+=old['ms_'+k];}anteriores.set(chave(linha),linha);
  }
  const dias=[...anteriores.values()].sort((a,b)=>a.dia.localeCompare(b.dia)||chave(a).localeCompare(chave(b))),fontes=novos.map(r=>({aplicativo_grupo:r.grupo,sessao_arquivo:r.referencia,criterio_atribuicao:'Eventos documentados explicitamente para este destino; intervalos de 5/15/30 minutos, sem inferência de autoria.',fonte:'Registro documentado no repositório',inicio:new Date(r.eventos[0]).toISOString(),ultimo_evento:new Date(r.eventos.at(-1)).toISOString(),turno:r.id,eventos:r.eventos.length,...Object.fromEntries([5,15,30].map(k=>['ms_'+k,total(r.intervalos[k])]))}));
  const conhecido=b.resumo.horas_15!==null||novos.some(r=>r.atribuicao==='aplicativo'&&r.intervalos[30].length),dados=novos.length?{corte_em:new Date(corte).toISOString(),...resumo(dias,conhecido),dias,fontes}:{corte_em:b.corte_em,...b.resumo};
  if(esforcos.length){const old=esforcos[0].dados;if(instante(old.corte_em)>instante(dados.corte_em))throw Error('Preserve o corte já publicado.');for(const campo of ['dias','fontes']){const key=x=>campo==='dias'?chave(x):`${x.fonte}:${x.sessao_arquivo}:${x.turno}`,keys=new Set((dados[campo]??[]).map(key));if((old[campo]??[]).some(x=>!keys.has(key(x))))throw Error('Preserve os dias e as fontes já publicados; mantenha os eventos anteriores no registro.');}}
  const r={entidade:'esforco',preservar_fontes_atuais:true,dados,evidencia:'Base de esforço já aprovada no SISTEMA, identificada por aplicativoId e corte em .sistema/esforco-base.json. Novos intervalos, quando presentes, estão em .sistema/esforco-eventos.json; geração por .sistema/atualizar-esforco.cjs. Fontes detalhadas anteriores permanecem no SISTEMA. Autoria não comprovada permanece sem identificação.'};
  if(esforcos.length)registros[registros.indexOf(esforcos[0])]=r;else registros.push(r);
 }
 if(Buffer.byteLength(JSON.stringify(saida))>750000)throw Error('Andamento excede 750 KB.');return saida;
}
if(require.main===module){const dir=__dirname,ler=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8').replace(/^\uFEFF/,''));try{const out=gerar(ler('esforco-base.json'),ler('esforco-eventos.json'),ler('andamento.json'));fs.writeFileSync(path.join(dir,'andamento.json'),JSON.stringify(out,null,2)+'\n','utf8');console.log('Andamento atualizado com esforço documentado. Aplicação nas fichas depende de revisão manual.');}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={gerar};
