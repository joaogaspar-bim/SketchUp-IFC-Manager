

## Andamento para o SISTEMA EBBIM

Integração documental solicitada por João Gaspar em 29/10/2026. Ao preparar um
push de avanços que devam aparecer no acompanhamento de produção, consultar
`.sistema/README.md` e manter `.sistema/andamento.json` com os IDs reais e as
evidências explícitas. Não inferir horas, autoria, homologação ou deploy.
As sugestões continuam sujeitas à revisão manual do superadmin no SISTEMA.
Esta integração não altera os guardrails nem as regras de negócio deste produto.


## Manter o rastreamento de horas no SISTEMA

**Determinação de João Gaspar em 22/11/2026.** Manter atualizado o rastreamento
das horas dos Aplicativos e Projetos Internos conforme as regras do SISTEMA.

Ao iniciar ou retomar e ao concluir trabalho no projeto, conferir a integração
`.sistema/README.md`, registrar os eventos reais disponíveis e atualizar o
levantamento cumulativo. Quando existir, executar
`node .sistema/registrar-esforco.cjs`; o coletor também recalcula
`.sistema/andamento.json`. Incluir somente essas alterações da própria sessão
no push dos avanços, preservando o trabalho de outras sessões. Se ainda não
houver integração, consultar a ficha do SISTEMA e usar seu identificador real,
sem associar projetos por semelhança de nome.

Conferir a entrega para revisão na ficha correspondente e informar o corte,
as fontes recuperadas e as lacunas. Arquivo preparado, push, coleta entregue
e horas aplicadas são estados distintos. Se o acesso à ficha não estiver
disponível, informar essa limitação; não declarar a atualização aplicada.

Preservar o método aprovado de intervalos 5/15/30 minutos, a base, os dias,
as fontes e a revisão manual do superadmin. Não somar fotografias cumulativas,
não duplicar sessões importadas, subagentes ou intervalos sobrepostos e não
transformar commits em duração. Turnos sem vínculo verificável e trabalho
compartilhado ficam fora das horas exclusivas. Sem autoria comprovada, manter
as horas sem identificação de Pessoa. Esses registros estimam atividade
assistida; não são apontamento de jornada humana. A ausência de eventos novos
não substitui horas desconhecidas por zero.
