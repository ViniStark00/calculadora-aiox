---
task: generate-report
agent: redator
squad: gestor-trafego-stark
elicit: false
inputs:
  - metricas: saída da task fetch-metrics (colunas por cliente)
  - contexto_cliente: objeto retornado pelo contexto-cliente (pode ser disponivel: false)
  - cliente: nome do cliente (de data/clientes.yaml)
  - reportei_project_id: ID do projeto no Reportei
  - especialidade: campo do cliente em data/clientes.yaml
  - fonte: campo do cliente em data/clientes.yaml (ex: reportei_fallback)
  - meta_ad_account_id: campo do cliente em data/clientes.yaml (pode ser null)
  - data_execucao: data atual (YYYY-MM-DD)
outputs:
  - texto_relatorio: narrativa completa em HTML para publicação no Reportei
  - periodo: {inicio: DD/MM/AAAA, fim: DD/MM/AAAA, tipo: semanal|mensal}
  - avisos_dados: lista de campos indisponíveis substituídos por "X" (pode ser vazia)
---

# Task: generate-report — Geração do Relatório Narrativo

**FASE 3 do pipeline:** gera o texto do relatório semanal (ou mensal) em HTML combinando métricas com dados extras do MCP Reportei e contexto do cliente.

## Pré-condições

- Métricas da task `fetch-metrics` disponíveis e aprovadas pelo `verify-fill`
- MCP Reportei `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` disponível
- Template em `templates/relatorio-template.md` carregado

## Passo 0 — Calcular período do relatório

> Executar PRIMEIRO, antes de qualquer coleta de dados.

### Lógica semanal vs mensal

**Verificar se é primeira semana completa do mês:**

1. Calcular `domingo_anterior` = domingo mais recente antes de `data_execucao`
2. Calcular `segunda_anterior` = segunda-feira = `domingo_anterior - 6 dias`
3. Se `segunda_anterior` e `domingo_anterior` estão em meses diferentes → período é **mensal**
4. Caso contrário → período é **semanal**

**Se semanal:**
```
periodo.inicio     = segunda_anterior (formato: DD/MM/AAAA)
periodo.fim        = domingo_anterior (formato: DD/MM/AAAA)
periodo.tipo       = "semanal"
comparison.inicio  = periodo.inicio - 7 dias
comparison.fim     = periodo.fim - 7 dias
titulo_marco       = "Relatório de Tráfego"
```

**Se mensal:**
```
mes_anterior       = mês de domingo_anterior
periodo.inicio     = primeiro dia do mes_anterior (formato: DD/MM/AAAA)
periodo.fim        = último dia do mes_anterior (formato: DD/MM/AAAA)
periodo.tipo       = "mensal"
comparison.inicio  = primeiro dia do mês retrasado
comparison.fim     = último dia do mês retrasado
titulo_marco       = "Relatório Mensal — [Nome do Mês] [Ano]"
```

> Passar `periodo` e `comparison` para todos os passos subsequentes.
> Passar `titulo_marco` para o `publicador`.

## Passo 1 — Incorporar contexto do cliente

Se `contexto_cliente.disponivel: true`:
- Usar `momento_comercial_atual` para enriquecer `[ACAO_1]` ou `[ACAO_2]` (se relevante)
- Usar `pontos_de_atencao` para referenciar padrões recorrentes de forma natural
- Usar `aprendizados_recentes` como referência interna — nunca expor literalmente
- Nunca citar o sistema de memória no texto final

Se `disponivel: false`: pular silenciosamente, sem aviso no texto.

## Passo 2 — Discovery de leads

### 2.1 — Fonte primária: Meta Ads MCP (quando `meta_ad_account_id` disponível)

Se `meta_ad_account_id` não é null:
- Chamar Meta Ads MCP com `get_insights`, período `periodo.inicio` a `periodo.fim`, campo `action_types`
- Esta é a fonte primária de leads — não usar Reportei para leads neste caso

| Padrão de action_type | Campo | Label |
|-----------------------|-------|-------|
| `onsite_conversion.messaging_conversation_started_7d` | `conversas` | WhatsApp |
| `offsite_conversion.fb_pixel_custom.Respondi*` | `respondi_leads` | Respondi |
| `offsite_conversion.fb_pixel_custom.*Conversion*` | `respondi_leads` | Respondi |
| `offsite_conversion.fb_pixel_custom.*` (outros, valor > 0) | `pixel_leads` | Pixel |

### 2.2 — Fonte fallback: Reportei (quando `meta_ad_account_id` null)

Se `meta_ad_account_id` é null (`reportei_fallback`):
- Buscar via `get_project_metrics` do MCP Reportei, período `periodo.inicio` a `periodo.fim`
- Extrair apenas `messaging_conversation_started_7d` → `conversas`
- `respondi_leads = 0`, `pixel_leads = 0`

### 2.3 — Calcular totais

```
total_leads = conversas + respondi_leads + pixel_leads
meta_cpl    = meta_spend / total_leads  (se total_leads > 0, senão "-")
```

Selecionar label e breakdown:
- `total_leads = conversas` → `[LABEL_LEADS]` = "conversas"; sem linha `↳`
- `total_leads > conversas` → `[LABEL_LEADS]` = "leads"; incluir linha de breakdown

### 2.4 — CPL por fonte (apenas quando Respondi detectado)

> Executar APENAS se: `respondi_leads > 0` E `meta_ad_account_id` não é null.

Chamar Meta Ads MCP com `get_insights`, agrupamento por campanha (`level: campaign`), campos `spend` e `objective`.

| Objetivo da campanha | Campo |
|---------------------|-------|
| `OUTCOME_MESSAGES` / `MESSAGES` | `spend_wpp` |
| `OUTCOME_LEADS` / `LEAD_GENERATION` | `spend_respondi` |

```
CPL_WPP      = spend_wpp / conversas          (se conversas > 0, senão "-")
CPL_RESPONDI = spend_respondi / respondi_leads (se respondi_leads > 0, senão "-")
```

Se `meta_ad_account_id` null ou chamada falhar: usar apenas quantidade no breakdown, sem CPL por fonte.

## Passo 3 — Classificar CPL por especialidade

1. Ler `data/thresholds-por-especialidade.yaml` → bloco da `especialidade` do cliente
2. Para `cirurgia_ortognatica`: CPL = custo por conversão Google Ads
3. Para demais: CPL = meta_spend / total_leads
4. Classificar e preencher `[STATUS_CPL_TEXTO]` (nunca expor nível interno no texto)

## Passo 4 — Consultar histórico

Ler `data/historico-clientes.yaml` → slug do cliente → últimas 4 entradas.
Calcular variação % do CPL atual vs média histórica.
Fallback silencioso se arquivo ausente ou menos de 2 entradas.

## Passo 5 — Buscar dados de saúde de campanha via MCP Reportei

```
MCP: mcp__30ebe978-db99-4dee-927c-b72f6abac9d8
Tools: get_report / get_project_metrics
Período: periodo.inicio a periodo.fim
```

Campos a coletar: CPM, Frequência, CTR, CPC, Seguidores.

Para cada campo não retornado:
1. Substituir por `X` no HTML
2. Adicionar à lista `avisos_dados`

> Exceção: cliente com `fonte: reportei_fallback` — CPM, CTR, Frequência e CPC não coletáveis. Substituir por `X` sem aviso.

## Passo 6 — Selecionar template e preencher

| Dados disponíveis | Template |
|-------------------|---------|
| `meta_spend > 0` e `google_spend = 0` | META-ONLY |
| `meta_spend > 0` e `google_spend > 0` | META + GOOGLE |
| `meta_spend = 0` e `google_spend > 0` | GOOGLE-ONLY |

Substituir TODOS os placeholders. Nunca deixar `[XXX]` não substituído — usar `X` como fallback.

## Passo 7 — Aplicar regras de voz

Revisar contra lista de palavras proibidas do `CLAUDE.md` e do `agents/redator.md`.

## Passo 8 — Emitir avisos e entregar

1. Se `avisos_dados` não vazia: exibir todos os avisos no output antes de entregar o HTML
2. Retornar `texto_relatorio` (HTML), `periodo` e `titulo_marco` para o `publicador`

## Restrições

- **Nunca inventar dados** — se não há fonte, usar `X` e avisar
- **Nunca inserir texto explicativo no HTML** sobre dados indisponíveis — apenas `X`
- **Formato monetário:** R$ X.XXX,XX (vírgula decimal, ponto milhar)
- **Datas:** formato `DD/MM`
- **CPL = 0 leads:** CPL = `-` (nunca dividir por zero)
- **HTML obrigatório:** `<p>`, `<strong>`, `<br>`, `<a>` — nunca markdown puro
