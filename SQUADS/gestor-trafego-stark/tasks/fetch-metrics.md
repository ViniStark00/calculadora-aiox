---
task: fetch-metrics
agent: coletor
squad: gestor-trafego-stark
elicit: false
inputs:
  - clientes_ativos: lista filtrada de data/clientes.yaml (ativo: true)
  - periodo: calculado automaticamente (segunda a domingo da semana anterior; aba = mês em pt-BR)
  - metricas_coletadas: dict opcional do alerta-monitor (FASE 1) — ADR-04
  - sheet_id: variável de ambiente SHEET_ID
  - reportei_token: variável de ambiente REPORTEI_TOKEN
outputs:
  - planilha_preenchida: colunas conforme sheet_columns por cliente na aba mensal (ex: Junho)
  - status_por_cliente: lista com status de cada cliente (processado/pulado/erro/reusado)
---

# Task: fetch-metrics — Coleta de Métricas e Preenchimento de Sheets

**FASE 2 do pipeline:** busca métricas no Reportei API v2 e preenche o Google Sheets para todos os clientes ativos.

## Pré-condições

- Variáveis de ambiente `REPORTEI_TOKEN`, `SHEET_ID` e `GOOGLE_SERVICE_ACCOUNT_JSON` configuradas
- Aba do mês (`Junho`, `Julho`...) já criada na planilha manualmente (não criar automaticamente)
- `data/clientes.yaml` acessível

## Passo 1 — Calcular período

```
data_hoje = hoje
dias = (hoje.weekday() + 1) % 7
if dias == 0: dias = 7
ultimo_domingo = hoje - timedelta(days=dias)
data_inicio = ultimo_domingo - timedelta(days=6)   # segunda-feira
data_fim = ultimo_domingo                           # domingo

MESES_PT = {1:"Janeiro",2:"Fevereiro",3:"Março",4:"Abril",5:"Maio",6:"Junho",
            7:"Julho",8:"Agosto",9:"Setembro",10:"Outubro",11:"Novembro",12:"Dezembro"}
nome_aba = MESES_PT[data_inicio.month]             # ex: "Junho"
sem_numero = f"Sem {math.ceil(data_inicio.day / 7)}" # ex: "Sem 2"
```

## Passo 2 — Verificar aba no Sheets

1. Abrir planilha via Google Sheets API (service account)
2. Buscar aba com nome `nome_aba` (ex: `Junho`)
3. **Se não existir:** interromper com erro claro — nunca criar aba automaticamente:
   > "Aba 'Junho' não encontrada na planilha [SHEET_ID]. Criar manualmente e rodar novamente."
4. Localizar linha do cliente: col B = `nome_cliente` E col C = `sem_numero` (ex: `Sem 2`)

## Passo 3 — Filtrar clientes ativos

Ler `data/clientes.yaml` → filtrar: `ativo: true`

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

Para cada cliente processado com sucesso, escrever nas colunas de `sheet_columns` em `data/clientes.yaml`.

Mapeamento atual (âncora `*sheet_cols` — nova planilha jun/2026):

```yaml
meta_spend_total:    E   # Meta invest total
tofu_spend:          D   # TOFU [TOFU]/[IMP] — slug pendente G0
bofu_spend:          L   # BOFU leads/cadastros — slug pendente G0
seguidores:          F   # Seguidores IG
ctr:                 J   # CTR Meta — slug pendente G0
conversas:           M   # Conversas WhatsApp
leads_meta:          O   # Leads META formulário — slug pendente G0
cadastros_respondi:  P   # Cadastros Respondi — slug pendente G0
cpa_google:          R   # CPA Google — slug pendente G0
google_spend:        T   # Google invest total
```

Colunas G/H/I/K/N/Q/S contêm fórmulas na planilha — **nunca escrever nessas colunas**.

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
