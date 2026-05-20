---
task: generate-report
agent: redator
elicit: false
inputs:
  - metricas: saída da task fetch-metrics (C/E/H/K/O por cliente)
  - cliente: nome do cliente (da config)
  - project_id: ID do projeto no Reportei
  - periodo: {inicio: DD/MM/AAAA, fim: DD/MM/AAAA}
outputs:
  - texto_relatorio: narrativa completa do relatório semanal
---

# Task: generate-report — Geração do Relatório Narrativo

**Atividade 2 do pipeline:** gera o texto do relatório semanal combinando métricas locais com dados extras do MCP Reportei.

## Pré-condições

- Métricas da task `fetch-metrics` disponíveis e aprovadas pelo `verify-fill`
- MCP Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` disponível
- Template em `templates/relatorio-template.md` carregado

## Passos

### Passo 1 — Carregar métricas base
Receber do `relatorio-chief`:
- `meta_spend`, `google_spend`, `seguidores`, `conversas`, `conversoes`
- `periodo.inicio`, `periodo.fim`
- `cliente` (nome formatado)

### Passo 2 — Buscar dados extras via MCP Reportei
Chamar `get_report` ou `get_metrics` do MCP com `project_id`:
- CPL (custo por lead)
- CPC Meta e CPC Google separados
- Cliques totais (Meta + Google)
- Impressões
- Dados da semana anterior para comparativo

Se MCP indisponível → prosseguir apenas com métricas base (sem inventar dados).

### Passo 3 — Calcular totais
```
total_investimento = meta_spend + google_spend
variacao_investimento = total_atual vs total_semana_anterior (se disponível)
```

### Passo 4 — Preencher template
Substituir placeholders do `templates/relatorio-template.md`:
- `[DATA_INICIO]` → `periodo.inicio`
- `[DATA_FIM]` → `periodo.fim`
- `[CLIENTE]` → nome do cliente
- `[META_SPEND]` → meta_spend formatado (R$ X.XXX,XX)
- `[GOOGLE_SPEND]` → google_spend formatado (R$ X.XXX,XX)
- `[TOTAL]` → total_investimento formatado
- Demais campos com dados extras (CPL, CPC, etc.)

### Passo 5 — Aplicar regras de voz
Revisar o texto gerado contra as regras de `CLAUDE.md`:
- Remover palavras proibidas
- Ajustar tom para neutro e informativo
- Garantir que dados têm fonte (sem invenção)

### Passo 6 — Entregar para quality-gate
Retornar `texto_relatorio` para a task `validate-report`.

## Restrições

- **Nunca inventar dados** — se não há fonte, não mencionar
- **Nunca usar dados de outro cliente** — verificar `project_id` sempre
- **Formato monetário:** R$ X.XXX,XX (vírgula decimal, ponto milhar)
- **Datas:** formato `DD/MM/AAAA`
