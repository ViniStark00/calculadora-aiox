---
task: build-campaign-structure
agent: kennedy
elicit: true
inputs:
  - diagnostico_kotler
  - pesquisa_validada_ogilvy
  - campaign_history
outputs:
  - estrutura_campanha
  - novo_registro_historico
---

# Task: Montar Estrutura de Campanha

## Pré-condições
- Diagnóstico do kotler disponível
- Pesquisa validada pelo ogilvy disponível
- campaign-history.yaml lido

## Passos

1. Ler `data/campaign-history.yaml`
2. Listar combinações já testadas (público + formato + objetivo)
3. Com base no diagnóstico e na pesquisa, gerar nova estrutura que NÃO repita combinações do histórico
4. Se for cross-nicho, consultar `data/niches-reference.yaml` e marcar origem
5. Preencher template completo (4 blocos: público, campanha, criativo, funil)
6. Calcular orçamento real com fator 0,878 (imposto Meta)
7. Passar para compliance-guard antes de entregar
8. Após aprovação: salvar no histórico com status `EM_TESTE`

## Output esperado

Estrutura preenchida no formato do template `campaign-structure-template.md` + entrada no histórico.
