# Acompanhamento no SISTEMA EBBIM

Este diretório atende à integração GitHub → SISTEMA solicitada por João Gaspar
em 29/10/2026. Não modifica funcionalidades, permissões ou regras do produto.

## Destinos e fonte

Repositório: **joaogaspar-bim/SketchUp-IFC-Manager**, ramo **main**.

- **EBBIM SketchUp Pro Ifc Exporter**: `8dc54877-ea40-4253-bc5c-0af8fbd2266c`.

## Publicar andamento junto das mudanças

`andamento.json` usa o contrato `andamento-producao-v1` da ponte do SISTEMA.
Ao concluir alterações que devam aparecer no acompanhamento de produção,
atualize os registros explícitos neste arquivo e inclua-os no mesmo push.
Não use o estado de uma página aberta, nomes de arquivos ou mensagens de commit
como comprovação isolada da conclusão de uma funcionalidade.

A implantação inicial registra somente a publicação desta integração documental.
Ela **não** afirma que as funcionalidades do produto foram concluídas, testadas,
homologadas ou publicadas em produção. Os demais registros das fichas são mantidos.

Cada destino aparece uma única vez em `projetos`, com o UUID real da ficha.
Campos e registros omitidos preservam os valores atuais. Para atualizar um registro
existente, use seu `id` do modelo exportado na ficha; não crie um novo registro
para substituir outro já cadastrado. Para um registro novo, use uma `chave` estável;
a ponte deriva um UUID por destino/entidade/chave, sem duplicar a cada push.

Entidades aceitas: `ficha`, `etapa`, `atividade`, `versao`, `esforco` e
`esforco_colaborador`. Seus atributos são os do modelo de atualização exportado
pelo SISTEMA. Cada registro exige `evidencia` indicando os documentos, trechos de
código ou relatórios reais. Não inventar responsáveis, datas ou resultados.
O SHA da fonte e a revisão atual do destino são acrescentados pela ponte.

## Horas e autoria

Não há novas horas nesta implantação. O consumo já aprovado no SISTEMA é preservado.
Só acrescentar `esforco` com duração documentada, corte cumulativo e fontes;
uma fotografia substitui a anterior após revisão, nunca é somada a ela.
Preservar dias e fontes anteriores, unir intervalos coincidentes e não duplicar
o esforço do mesmo componente em duas fichas. Datas/quantidades de commits,
arquivos, vídeos ou linhas de código não são horas trabalhadas.
Não incluir logs brutos, dados privados, credenciais ou contatos no repositório.
Sem prova da autoria, as horas permanecem sem identificação. Não ratear por
responsável do projeto, nome do usuário da máquina ou autor do commit.
A ponte não cria automaticamente novas parcelas individuais de Colaborador.

## Conferência e revisão

A Vercel consulta a referência remota a cada prazo salvo na ficha: 120 horas,
às 23h de São Paulo, reiniciando no dia 1º do mês. Somente a configuração do
SISTEMA decide se o projeto está ligado e devido. Este arquivo não muda a agenda.
O coletor não executa o código do projeto e não usa API de IA paga.

As diferenças ficam **Aguardando revisão** na ficha correspondente.
Somente a revisão manual do superadmin pode aplicar as sugestões.
Um push ou um levantamento entregue não comprovam deploy ou aplicação.

Contrato completo: https://github.com/EscolaBrasileiraDeBIM/sistema/blob/master/docs/automacao/README.md


## Esforço de desenvolvimento — integração solicitada em 04/11/2026

A base em `.sistema/esforco-base.json` reproduz os totais e dias do levantamento
já aprovado no SISTEMA, com corte em 02/11/2026 às 13h05 de São Paulo. Os seis
destinos sem duração comprovada mantêm horas nulas. Os identificadores e a
revisão vigente da ficha são respeitados pela ponte; esta base não soma outra
vez as horas já aprovadas. As fontes detalhadas anteriores permanecem no SISTEMA.
O repositório recebe apenas os agregados, a referência da aprovação e seu hash,
sem conversas, caminhos locais ou identificação presumida de Colaborador.

Para disponibilizar horas novas no próximo push, acrescentar os timestamps de
eventos de trabalho documentados em `.sistema/esforco-eventos.json`, com ID
estável, aplicativoId, grupo, atribuição e referência relativa à evidência.
Não preencher eventos com datas de commits, arquivos ou vídeos nem copiar
conversas. Ausência de eventos novos conserva o retrato anterior.

Executar `node .sistema/atualizar-esforco.cjs` para atualizar somente o registro
`esforco` de cada destino em `.sistema/andamento.json`, preservando as demais
atividades e informações. O cálculo usa intervalos entre eventos com lacunas de
até 5/15/30 minutos, une sobreposições por grupo e dia e conta dias em
America/Sao_Paulo. Eventos novos começam no corte da base; não reimportar o
histórico. Períodos compartilhados e contexto ficam fora das horas principais.
A autoria continua sem identificação enquanto não houver comprovação e vínculo
a uma Pessoa real no SISTEMA.

O atributo técnico `preservar_fontes_atuais: true` pede à ponte que mantenha os
dias, fontes e referências de sessões já existentes na ficha e incorpore as
linhas publicadas. O resultado é uma fotografia cumulativa completa, com a
revisão atual da ficha, entregue como **Aguardando revisão**. Não aplica mudanças,
não muda permissões, ramos nem agendamentos. Se o corte da ficha avançar além
da base remota, conferir a nova aprovação antes de publicar outro retrato.

Formato de um registro de eventos (preencher somente com evidência real):

```json
{
  "id": "identificador-estavel-do-registro",
  "aplicativoId": "UUID-DO-DESTINO-DESTE-REPOSITORIO",
  "atribuicao": "aplicativo",
  "grupo": "NOME-EXATO-DO-DESTINO",
  "instantes": ["TIMESTAMP-REAL-COM-FUSO", "TIMESTAMP-REAL-COM-FUSO"],
  "referencia": ".sistema/esforco-eventos.json#identificador-estavel-do-registro"
}
```

O executor de nuvem consulta o arquivo enviado ao GitHub, sem depender de
computador ligado ou página aberta e sem API de IA paga. O script local prepara
dados durante o desenvolvimento; não é um segundo agendamento nem um relógio
de jornada. Conferência sem novos intervalos não produz horas inventadas.
