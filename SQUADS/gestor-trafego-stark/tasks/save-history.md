---
task: save-history
agent: coletor
squad: gestor-trafego-stark
blocking: false
triggered_by: coletor
phase: FASE 6 (não-bloqueante)
---

# Task: save-history — Salvar Histórico de Métricas por Cliente

**FASE 6 do pipeline (não-bloqueante):** persiste as métricas de uma semana em `data/historico-metricas.jsonl` (uma linha JSON por cliente por semana). Qualquer falha emite aviso e o pipeline continua normalmente.

## Inputs esperados

| Campo | Tipo | Origem |
|-------|------|--------|
| `data_coleta` | string `YYYY-MM-DD` | data de hoje (dia da execução) |
| `semana` | string `DD/MM/YYYY` | início da semana monitorada (ex.: "26/05/2026") |
| `slug` | string | slug do cliente em data/clientes.yaml |
| `meta_spend` | float | métricas coletadas pela FASE 1/2 |
| `google_spend` | float | métricas coletadas pela FASE 1/2 |
| `conversas` | int | métricas coletadas pela FASE 1/2 |
| `meta_cpl` | float | meta_spend / conversas (0.0 se conversas = 0) |
| `cpm` | float \| null | disponível apenas se fonte != "reportei_sem_meta" |
| `ctr` | float \| null | disponível apenas se fonte != "reportei_sem_meta" |
| `frequency` | float \| null | disponível apenas se fonte != "reportei_sem_meta" |
| `fonte` | string | `meta_ads_mcp` \| `reportei_meta` \| `reportei_sem_meta` |

## Fluxo de execução

```
1. Abrir data/historico-metricas.jsonl (criar vazio se não existir)
2. VERIFICAR IDEMPOTÊNCIA:
   - Ler todas as linhas existentes
   - Se já existe linha com mesmo "data_coleta" E "slug" → SKIP silencioso
   - Log: "⏭ Histórico já registrado para [slug] — [data_coleta]. Pulando."
3. Calcular meta_cpl = meta_spend / conversas (se conversas > 0, senão 0.0)
4. Montar objeto JSON com os campos abaixo
5. Appendar linha JSON ao final do arquivo (newline-delimited)
6. Log: "✅ Histórico salvo — [slug] | semana [semana]"
```

## Schema da linha JSONL

Uma linha por cliente por semana:

```json
{"data_coleta": "2026-06-02", "semana": "26/05/2026", "slug": "imcp", "meta_spend": 1234.56, "google_spend": 567.89, "conversas": 10, "meta_cpl": 123.45, "cpm": 45.67, "ctr": 1.23, "frequency": 2.1, "fonte": "meta_ads_mcp"}
```

Campos `cpm`, `ctr` e `frequency` são `null` quando `fonte == "reportei_sem_meta"`.

## Regras de robustez

| Situação | Comportamento |
|----------|---------------|
| Arquivo não existe | Criar automaticamente vazio |
| Arquivo corrompido | Log warning + tentar append mesmo assim |
| Erro de escrita | Log warning + continuar pipeline sem bloquear |
| `conversas = 0` | `meta_cpl = 0.0` — sem divisão por zero |
| `fonte = "reportei_sem_meta"` | `cpm = null`, `ctr = null`, `frequency = null` |

## Comportamento de falha (NUNCA BLOQUEIA)

```
⚠️ [save-history] Falha ao salvar histórico de [slug]: [motivo]
   Pipeline continuando normalmente. Histórico desta semana não será persistido.
```
