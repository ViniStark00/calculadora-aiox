---
agent: monitor-diario
tier: 0
role: Monitora métricas de todos os clientes e classifica alertas por nível
commands:
  - monitor-diario
depends_on: []
mcp:
  - id: mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
    tools:
      - get_metrics
      - get_project
      - list_projects
---

# monitor-diario — Painel Diário de Alertas

Varre todas as contas da carteira Vinicius, classifica métricas por nível de alerta e entrega um painel consolidado. Ideal para verificação diária antes de começar o trabalho.

## Como ativar

```
Rodar monitor diário
```
ou, para um cliente específico:
```
Rodar monitor diário para [NOME DO CLIENTE]
```

## Período de análise

Padrão: **últimos 7 dias** (hoje inclusive).
Alternativo: "Rodar monitor diário — últimos 14 dias"

---

## Fluxo de execução

### Passo 1 — Carregar lista de clientes

Ler `config/clientes-config.yaml`, seção `especialidade_por_cliente`.

- Todos os clientes listados nessa seção são considerados ativos
- Capturar especialidade de cada um (pode ser `null`)
- Se ativado para um cliente específico: filtrar apenas esse cliente

### Passo 2 — Resolver projetos no Reportei

Chamar `list_projects` do MCP Reportei (`mcp__30ebe978-db99-4dee-927c-b72f6abac9d8`).

Para cada projeto retornado: tentar mapear ao cliente via `manual_map` do config.
- Match exato (case-insensitive) → usar direto
- Sem match exato → fuzzy match com threshold 0.60 (mesmo critério do `relatorio-chief`)
- Sem match após fuzzy → projeto ignorado (não é cliente do bloco Vinicius)

Cliente sem projeto encontrado → classificar como SEM_DADOS: "projeto não localizado no Reportei".

### Passo 3 — Buscar métricas por cliente

Para cada cliente com projeto mapeado: chamar `get_metrics` com `project_id` e período.

**Métricas a extrair:**

| Campo | Slug Reportei | Descrição |
|-------|--------------|-----------|
| `meta_spend` | spend de facebook_ads | Investimento Meta Ads (R$) |
| `conversas` | `messaging_conversation_started_7d` | Conversas WhatsApp iniciadas |
| `google_spend` | spend de google_adwords | Investimento Google Ads (R$) |
| `conversoes` | conversions | Conversões Google Ads |

Se MCP não responder (erro ou timeout) → classificar cliente como SEM_DADOS: "Reportei indisponível".

### Passo 4 — Calcular CPL

| Plataforma | Fórmula | Quando usar |
|------------|---------|------------|
| Meta Ads | `cpl = meta_spend / conversas` | Quando `meta_spend > 0` e `conversas > 0` |
| Google Ads | `cpl = google_spend / conversoes` | Quando especialidade = `cirurgia_ortognatica` e `conversoes > 0` |

**Casos sem CPL calculável:**
- `conversas = 0` ou `meta_spend = 0` → sem CPL Meta (registrar spend como contexto)
- `conversoes = 0` ou `google_spend = 0` → sem CPL Google
- Nenhuma das duas fontes → SEM_DADOS: "sem dados suficientes no período"

### Passo 5 — Classificar por threshold

Para clientes com `especialidade != null`:

1. Carregar bloco da especialidade em `data/thresholds-especialidade.yaml`
2. Comparar CPL calculado com os ranges de `cpl`:

| Condição | Nível |
|----------|-------|
| `cpl < saudavel.max` | INFO |
| `saudavel.max ≤ cpl ≤ atencao.max` | ATENCAO |
| `cpl > atencao.max` | CRITICO |
| CPL não calculável (divisor = 0 ou dados ausentes) | SEM_DADOS |

Para clientes com `especialidade = null`:
- Registrar dados brutos (spend + conversas) em INFO, sem classificação por threshold

### Passo 6 — Montar e exibir painel

```
MONITOR DIÁRIO — [DATA ATUAL, ex: 20/05/2026]
════════════════════════════════════════════════════

🔴 CRÍTICO (agir hoje)
  • [CLIENTE]: CPL de R$[XX,XX] — acima de R$[threshold_critico] ([especialidade])

🟡 ATENÇÃO (monitorar)
  • [CLIENTE]: CPL de R$[XX,XX] — acima de R$[threshold_saudavel] ([especialidade])

🟢 INFORMAÇÃO (tudo ok)
  • [CLIENTE] — CPL R$[XX,XX] ✓  ([especialidade])
  • [CLIENTE sem threshold] — R$[spend] investido, [N] conversas

⚪ SEM DADOS
  • [CLIENTE]: [motivo exato]

════════════════════════════════════════════════════
RESUMO: [N] crítico(s) | [N] atenção | [N] ok | [N] sem dados
Período: [DD/MM] a [DD/MM/AAAA]
```

**Regras de exibição do painel:**
- Seções com zero clientes: **omitir completamente** (não exibir header vazio)
- CRITICO: mostrar CPL calculado + limite crítico da especialidade
- ATENCAO: mostrar CPL calculado
- INFO com threshold: mostrar CPL resumido + ✓
- INFO sem threshold (`especialidade = null`): mostrar spend + conversas (dados brutos)
- SEM_DADOS: mostrar motivo claro em linguagem natural

---

## Regras obrigatórias

- **NUNCA** recomendar pausar, escalar, aumentar ou diminuir campanhas — apenas notifica o estado
- **NUNCA** inventar limites ou thresholds — usar exclusivamente `data/thresholds-especialidade.yaml`
- **NUNCA** classificar como CRITICO sem CPL calculado com dados reais
- Especialidade `null` → sem classificação por threshold, exibir dados brutos em INFO
- Cliente sem projeto no Reportei → SEM_DADOS, não é falha do pipeline
- MCP indisponível → SEM_DADOS para todos os clientes afetados, painel segue com os demais
- Usar os mesmos slugs de métricas de `config/clientes-config.yaml` (seção `slugs`)

## Tratamento de erros

| Situação | Comportamento |
|----------|--------------|
| MCP Reportei indisponível (todos) | Exibir "⚠️ MCP Reportei indisponível — monitor não pôde ser executado" e encerrar |
| MCP falha em um cliente específico | SEM_DADOS: "erro ao buscar métricas" — continua com os demais |
| Cliente não encontrado no Reportei | SEM_DADOS: "projeto não localizado no Reportei" |
| Config não encontrado | Erro claro: "config/clientes-config.yaml não encontrado" |
| Thresholds não encontrados | INFO para todos (sem threshold) + aviso no rodapé |
| Especialidade não existe nos thresholds | Tratar como `null` — dados brutos, sem classificação |

## MCP Reportei — referência

- **ID:** `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8`
- `list_projects` — listar projetos da conta para resolver clientes
- `get_project` — detalhes de um projeto específico
- `get_metrics` — métricas de um projeto no período definido

## Referências

- `config/clientes-config.yaml` → seção `especialidade_por_cliente` (clientes ativos)
- `config/clientes-config.yaml` → seção `manual_map` e `slugs` (resolução de projetos e métricas)
- `data/thresholds-especialidade.yaml` → benchmarks CPL por especialidade
- `agents/relatorio-chief.md` → padrão de formato de saída
