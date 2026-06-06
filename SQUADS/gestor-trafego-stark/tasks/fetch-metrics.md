---
task: fetch-metrics
agent: coletor
squad: gestor-trafego-stark
elicit: false
inputs:
  - clientes_vinicius: lista filtrada de data/clientes.yaml (vinicius in gestores, ativo: true)
  - periodo: calculado automaticamente (segunda a domingo da semana anterior)
  - metricas_coletadas: dict opcional do alerta-monitor (FASE 1) — ADR-04
  - sheet_id: variável de ambiente SHEET_ID
  - reportei_token: variável de ambiente REPORTEI_TOKEN
outputs:
  - planilha_preenchida: colunas conforme sheet_columns por cliente na aba da semana
  - status_por_cliente: lista com status de cada cliente (processado/pulado/erro/reusado)
---

# Task: fetch-metrics — Coleta de Métricas e Preenchimento de Sheets

**FASE 2 do pipeline:** busca métricas no Reportei API v2 e preenche o Google Sheets para os clientes do bloco Vinicius.

## Pré-condições

- Variáveis de ambiente `REPORTEI_TOKEN`, `SHEET_ID` e `GOOGLE_SERVICE_ACCOUNT_JSON` configuradas
- Aba da semana (`DD/MM/AAAA`) já criada na planilha manualmente (não criar automaticamente)
- `data/clientes.yaml` acessível

## Passo 1 — Calcular período

```
data_hoje = hoje
ultimo_domingo = hoje - timedelta(days=(hoje.weekday() + 1) % 7)
data_inicio = ultimo_domingo - timedelta(days=6)  # segunda-feira
data_fim = ultimo_domingo                          # domingo
nome_aba = data_inicio.strftime('%d/%m/%Y')
```

## Passo 2 — Verificar aba no Sheets

1. Abrir planilha via Google Sheets API (service account)
2. Buscar aba com nome `nome_aba`
3. **Se não existir:** interromper com erro claro — nunca criar aba automaticamente:
   > "Aba '[DD/MM/AAAA]' não encontrada na planilha [SHEET_ID]. Criar manualmente e rodar novamente."

## Passo 3 — Filtrar clientes Vinicius

Ler `data/clientes.yaml` → filtrar: `vinicius in gestores AND ativo: true`

## Passo 4 — Reutilizar metricas_coletadas (ADR-04)

Para cada cliente:
- Verificar se `metricas_coletadas[slug]` existe e `lookback` cobre o período atual
- Se `fonte: meta_ads` e dados da semana atual: usar `meta_spend` e `conversas` sem nova chamada Meta Ads
- **SEMPRE** buscar `google_spend` e `seguidores` via Reportei (não disponíveis via Meta Ads MCP)
- Se `fonte: excluido` ou `metricas_coletadas` ausente: buscar tudo do zero via Reportei

## Passo 5 — Buscar métricas via Reportei API

Para cada cliente sem dados reutilizáveis ou para `google_spend`/`seguidores`:

```
GET /v2/projects/{reportei_project_id}/metrics?start={data_inicio}&end={data_fim}
```

Extrair valores:
- `meta_spend` → plataforma `meta` ou `facebook_ads`
- `google_spend` → plataforma `google_adwords` (NÃO `google_ads`)
- `seguidores` → `ref == 'ig:new_followers_count'` (direta, SEM ÷ 1.000.000)
- `conversas` → `ref == 'messaging_conversation_started_7d'`
- `conversoes` → tipo `conversions`

`sleep(0.6)` entre chamadas. Se erro 429: aguardar 60s + retry 1x.

## Passo 6 — Preencher planilha

Para cada cliente processado com sucesso, escrever nas colunas de `sheet_columns` em `data/clientes.yaml`:

```yaml
# Mapeamento padrão (via âncora *sheet_cols):
meta_spend: C
google_spend: E
seguidores: H
conversas: K
conversoes: O
```

## Passo 7 — Retornar status

```yaml
status_por_cliente:
  - slug: "nome-slug"
    status: "processado" | "reusado" | "erro" | "pulado"
    fonte: "reportei_api" | "meta_ads_mcp" | "reusado_fase1"
    aviso: null | "descrição do aviso"
```

## Tratamento de erros

| Situação | Ação |
|----------|------|
| Aba não existe | STOP — erro claro ao usuário |
| Token expirado (401) | STOP — "Atualizar REPORTEI_TOKEN" |
| Projeto não encontrado | Registrar ERRO no status, continuar |
| Rate limit (429) | Aguardar 60s, retry 1x, se falhar → registrar ERRO |
| `google_spend` ausente para cliente META-only | `0.0` — registrar aviso explicativo |
| Valor ausente na métrica | `_to_float(None)` → `0.0`, registrar aviso |
