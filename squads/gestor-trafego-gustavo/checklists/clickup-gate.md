# Checklist: ClickUp Status Report Gate

Gate de qualidade para output do `*status-report-clickup`.
Aplicado pelo @validator antes de entregar ao @gestor-chief.

## Campos obrigatórios

- [ ] `spend` — investimento total no período (R$ com 2 casas decimais)
- [ ] `impressions` — número inteiro
- [ ] `reach` — número inteiro
- [ ] `frequency` — número decimal (ex: 2,19)
- [ ] `ctr` — percentual com 2 casas decimais (ex: 1,80%)
- [ ] `cpm` — R$ com 2 casas decimais
- [ ] `leads` — número inteiro (zero é válido; campo vazio não é)
- [ ] `cpl` — R$ com 2 casas decimais OU '-' se leads = 0

## Integridade

- [ ] Período indicado no output (ex: "12/05 a 18/05/2026")
- [ ] Timestamp de geração presente
- [ ] Nenhum campo com valor estimado ou de memória — apenas dados do Meta Ads MCP
- [ ] CPL não está sendo calculado com leads = 0

## Escrita no ClickUp

- [ ] Task ID ou comment ID confirmado na resposta do MCP clickup
- [ ] Nenhum erro de autenticação ou de lista/tarefa não encontrada pendente

## RESULTADO

**PASS** → output aprovado para entrega ao gestor.

**FAIL** → retornar ao @clickup-writer com lista numerada dos itens com problema.
