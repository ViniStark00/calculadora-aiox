---
task: monitorar-contas
agent: alerta-monitor
squad: gestor-trafego-stark
elicit: false
inputs:
  - clientes: lista de data/clientes.yaml (ativo: true, excluir_meta_monitoring != true)
  - thresholds: data/thresholds-por-especialidade.yaml
outputs:
  - painel_alertas: output estruturado por gestor com 🔴🟡ℹ️✅
  - metricas_coletadas: dict keyed por slug para reuso pelo coletor (ADR-04)
---

# Task: monitorar-contas — Monitoramento de Todas as Contas

**Ativação standalone ou FASE 1 do pipeline:** itera sobre todos os clientes ativos e emite alertas por threshold de especialidade.

## Pré-condições

- `data/clientes.yaml` acessível
- `data/thresholds-por-especialidade.yaml` acessível
- MCP Meta Ads `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52` disponível (ou fallback Reportei)

## Passo 1 — Filtrar e ordenar clientes

```
clientes_ativos = [c for c in clientes.yaml if c.ativo == true]
excluidos = [c for c in clientes_ativos if c.excluir_meta_monitoring == true]
a_monitorar = clientes_ativos - excluidos
```

## Passo 2 — Para cada cliente: determinar fonte

```
se meta_ad_account_id não null:
    fonte = "meta_ads" → MCP mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52
    lookback_metricas = last_3d
    lookback_frequencia = last_7d
    nivel = "ad"
senão:
    fonte = "reportei_fallback" → MCP mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
    emitir: ⚠️ [{cliente}] meta_ad_account_id ausente — dados via Reportei (CPL apenas)
```

## Passo 3 — Buscar métricas por fonte

**Via Meta Ads MCP:**
- `spend`, `impressions`, `reach`, `frequency`, `ctr`, `cpm`
- `actions`: `lead`, `messaging_conversation_started_7d`
- `cost_per_action_type`

**Via Reportei fallback:**
- `get_project_metrics(project_id, last_7d)` → extrair meta_spend, conversas, CPL calculado
- CPM, CTR, frequência: null (não disponíveis via Reportei)

## Passo 4 — Aplicar thresholds por especialidade

Ler bloco da `especialidade` do cliente em `data/thresholds-por-especialidade.yaml`.
Classificar por severity_rules do `alerta-monitor`:
- 🔴 CRÍTICO: threshold de pause ultrapassado
- 🟡 ATENÇÃO: acima da faixa saudável, abaixo do pause
- ℹ️ INFO: contexto relevante para o gestor decidir
- ✅ SEM ALERTAS: dentro dos thresholds

Aplicar heurísticas quando_nao_alertar do `alerta-monitor`.

## Passo 5 — Montar painel de alertas

Output estruturado por bloco de gestor (Vinicius → Compartilhado → Gustavo).
Ver formato completo em `agents/alerta-monitor.md → alert_format`.

## Passo 6 — Disponibilizar metricas_coletadas

Ao final do monitoramento, montar e retornar dict `metricas_coletadas` conforme schema em `agents/alerta-monitor.md → metricas_coletadas_output`.

```yaml
metricas_coletadas:
  "{slug}":
    meta_spend: float
    conversas: int
    meta_cpl: float | null
    cpm: float | null
    ctr: float | null
    frequency: float | null
    fonte: "meta_ads" | "reportei_fallback" | "excluido"
    lookback: "last_3d"
    coletado_em: "ISO 8601"
```

## Tratamento de erros

| Situação | Ação |
|----------|------|
| MCP Meta Ads indisponível | Usar Reportei como fallback para todos os clientes |
| Reportei MCP indisponível | Registrar cliente como `fonte: indisponivel` no metricas_coletadas |
| Threshold não encontrado para especialidade | Usar threshold genérico `saude_geral` com aviso |
| Rate limit 40 req/9min | Pausar 9 minutos antes da próxima chamada |
