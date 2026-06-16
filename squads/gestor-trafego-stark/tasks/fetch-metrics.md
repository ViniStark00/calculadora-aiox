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

> **PROIBIDO:** Usar browser, Chrome, Playwright ou qualquer ferramenta web para coletar dados.
> Toda coleta usa **somente** MCPs: Reportei (`mcp__30ebe978...`) e Meta Ads (`mcp__c0a7182d...`).
> Sheets é escrito via Google Sheets API (service account). Nenhuma URL é aberta manualmente.

## Pré-condições

- Variáveis de ambiente `REPORTEI_TOKEN`, `SHEET_ID` e `GOOGLE_SERVICE_ACCOUNT_JSON` configuradas — **ler direto das variáveis, nunca buscar os arquivos no disco**
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

## Passo 5 — Buscar métricas via Reportei API e Meta Ads MCP

### 5A — Reportei API (para cada cliente com reportei_project_id)

```
GET /v2/projects/{reportei_project_id}/metrics?start={data_inicio}&end={data_fim}
```

Extrair por integração e campo:

| Métrica YAML | Integração Reportei | Campo |
|---|---|---|
| `meta_spend_total` | `facebook_ads` | `spend` |
| `leads_meta` | `facebook_ads` | `actions_lead` |
| `conversas_whats` | `facebook_ads` | `actions_onsite_conversion.messaging_conversation_started_7d` |
| `seguidores` | `instagram_business` | `new_followers_count` (direta, SEM ÷ 1.000.000) |
| `google_spend` | `google_adwords` | `cost_micros` (já em R$, sem divisão) |
| `cpa_google` | `google_adwords` | `cost_per_conversion` |

`sleep(0.6)` entre chamadas. Se erro 429: aguardar 60s + retry 1x.

### 5B — Meta Ads MCP (campanhas com spend individual)

Para clientes com `meta_ad_account_id` preenchido, buscar via `ads_get_ad_entities`:

```python
campanhas = ads_get_ad_entities(
    ad_account_id=cliente['meta_ad_account_id'],
    level='campaign',
    fields=['id', 'name', 'spend', 'lead'],
    time_range={'since': data_inicio, 'until': data_fim}
)
```

> **Nota:** `lead` é o campo correto em `level='campaign'`. `actions_lead` retorna VALIDATION error nesse nível.

Extrair:

| Métrica YAML | Filtro no nome da campanha | Campo Meta MCP |
|---|---|---|
| `tofu_spend` | `[TOFU]` ou `[IMP]` | `amount_spent` (parse BRL: "R$1.137,56 BRL" → float) |
| `leads_respondi` | `RESPONDI` (case-insensitive) | `lead` |

```python
def parse_brl(s):
    # "R$1.137,56 BRL" → 1137.56
    return float(s.replace('R$','').replace('\xa0BRL','').replace('.','').replace(',','.'))

tofu_spend = sum(parse_brl(c['amount_spent']) for c in campanhas
                 if any(k in c['name'] for k in ['[TOFU]', '[IMP]']))
leads_respondi = sum(
    _to_float(c.get('lead') or 0)
    for c in campanhas if 'RESPONDI' in c['name'].upper()
)
```

Se `meta_ad_account_id` for `null`: registrar `tofu_spend=0`, `leads_respondi=0` com aviso.

## Passo 6 — Preencher planilha

> **MECANISMO EXCLUSIVO:** usar `scripts/fill_sheets.py` via **Bash tool**.
> **PROIBIDO:** MCP Google Drive, MCP Google Sheets, `check_junho.py`, `fill_junho_sem2.py` ou qualquer outro script.
> O `fill_sheets.py` já localiza as linhas internamente — não é necessário procurar linhas antes.

### 6A — Salvar métricas em arquivo JSON temporário

Montar um dict `metricas_por_slug` com as métricas de todos os clientes processados:

```python
{
  "slug-cliente-1": {
    "tofu_spend": 1137.56,
    "meta_spend_total": 2500.00,
    "seguidores": 45,
    "conversas_whats": 12,
    "leads_meta": 8,
    "leads_respondi": 3,
    "cpa_google": 45.50,
    "google_spend": 910.00
  },
  "slug-cliente-2": { ... }
}
```

Salvar em arquivo temporário (evita problemas de encoding no PowerShell):

```python
import json, tempfile
metricas_tmp = tempfile.mktemp(suffix=".json")
with open(metricas_tmp, "w", encoding="utf-8") as f:
    json.dump(metricas_por_slug, f, ensure_ascii=False)
```

### 6B — Executar fill_sheets.py via Bash tool

```bash
python squads/gestor-trafego-stark/scripts/fill_sheets.py \
  --metricas-arquivo <metricas_tmp> \
  [--semana Junho]   # opcional — padrão: calculado automaticamente
```

O script:
- Autentica via `GOOGLE_SERVICE_ACCOUNT_JSON` (variável de ambiente — nunca buscar o arquivo no disco)
- Localiza as linhas de cada cliente automaticamente
- Escreve nas colunas de `sheet_columns` de `data/clientes.yaml`
- Imprime `[STATUS_JSON]` ao final com resultado por slug

### Mapeamento de colunas (referência — configurado em `data/clientes.yaml`)

```yaml
tofu_spend:          D   # Invest. TOFU [TOFU]/[IMP]
meta_spend_total:    E   # Invest. total Meta
seguidores:          F   # Saldo Seguidores IG
conversas_whats:     K   # Conversas WhatsApp
leads_meta:          M   # LEADS Meta formulário
leads_respondi:      N   # Leads Respondi
cpa_google:          P   # CPA Google
google_spend:        R   # Invest. Total Google
```

Colunas G/H/I/J/L/O/Q contêm fórmulas na planilha — **nunca escrever nessas colunas** (o script já bloqueia automaticamente).

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
