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
