---
agent: coletor
tier: 1
squad: gestor-trafego-stark
role: Coleta métricas do Reportei API v2 + Meta Ads MCP e preenche Google Sheets
commands:
  - fetch-metrics
  - verify-fill
  - save-history
depends_on:
  - stark-chief
---

# coletor — Coleta de Métricas

Coleta métricas via Reportei API v2 e preenche Google Sheets. Na rotina-semanal, recebe `metricas_coletadas` da FASE 1 (alerta-monitor) e reutiliza dados Meta Ads coletados sem nova chamada à API.

## Reuso de dados da FASE 1 (extensão crítica — ADR-04)

O `alerta-monitor` (FASE 1) disponibiliza um dict `metricas_coletadas` keyed por slug do cliente.

**Lógica de reuso:**

| Condição | Comportamento |
|----------|---------------|
| `metricas_coletadas[slug]` existe E `coletado_em` é da mesma semana de trabalho | Usar dados Meta Ads sem nova chamada — documentar: `fonte: metricas_coletadas` |
| `metricas_coletadas[slug]` ausente ou de semana diferente | Chamar Meta Ads MCP diretamente |
| `metricas_coletadas` não fornecido (modo standalone) | Chamar Meta Ads MCP para cada cliente |

**Regra absoluta:** Independente de `metricas_coletadas`, o coletor SEMPRE busca via Reportei:
- Google Ads spend (`google_adwords`)
- Seguidores Instagram (`ig:new_followers_count`)

Leads (conversas, Respondi, pixel) seguem a lógica abaixo — fonte varia por `meta_ad_account_id`.

## Discovery de leads

### Fonte primária: Meta Ads MCP (quando `meta_ad_account_id` disponível)

Se `meta_ad_account_id` não é null:
- Chamar Meta Ads MCP com `get_insights`, período da semana, campo `action_types`
- Esta é a fonte primária de leads — não usar Reportei para leads neste caso

| Padrão de action_type | Campo de saída |
|-----------------------|---------------|
| `onsite_conversion.messaging_conversation_started_7d` | `conversas` |
| `offsite_conversion.fb_pixel_custom.Respondi*` | `respondi_leads` |
| `offsite_conversion.fb_pixel_custom.*Conversion*` | `respondi_leads` |
| `offsite_conversion.fb_pixel_custom.*` (outros, valor > 0) | `pixel_leads` |

### Fonte fallback: Reportei (quando `meta_ad_account_id` null)

Se `meta_ad_account_id` é null:
- Buscar via `get_project_metrics` do MCP Reportei
- Extrair apenas `messaging_conversation_started_7d` → `conversas`
- Se `lead_sources` configurado em `data/clientes.yaml` (ADR-08): coletar também `pixel_evento` e `lead_site` pelos slugs definidos no cliente

| Tipo em lead_sources | Slug Reportei | Campo de saída |
|----------------------|--------------|----------------|
| `conversa_whatsapp` | `messaging_conversation_started_7d` | `conversas` |
| `pixel_evento` | valor de `slug_reportei` no cliente | `pixel_leads` |
| `lead_site` | valor de `slug_reportei` no cliente | `site_leads` |

### Cálculo de totais

```
total_leads = conversas + (respondi_leads ?? 0) + (pixel_leads ?? 0) + (site_leads ?? 0)
meta_cpl    = meta_spend / total_leads  se total_leads > 0  else null
```

Se nenhuma fonte adicional detectada: `total_leads = conversas` (sem mudança de comportamento).

**Regra:** nunca substituir `conversas` por `total_leads` no campo K da planilha Sheets.
O campo K continua sendo `conversas` (WhatsApp). `total_leads` é usado apenas no relatório Reportei e no CPL.

**Logs obrigatórios quando lead_sources ativo:**
```
  [cliente] pixel_leads: N (slug: offsite_conversion.fb_pixel_lead)
  [cliente] site_leads:  N (slug: onsite_conversion.lead_grouped)
  [cliente] total_leads: N (conversas: X + pixel: Y + site: Z)
```

**Output:** documentar no resumo qual fonte foi usada para cada métrica por cliente:
```
✅ IMCP  Meta: metricas_coletadas (FASE 1) | Google: Reportei | Seguidores: Reportei
✅ Dra Danielle  Meta: Meta Ads MCP (sem dados FASE 1) | Google: Reportei
```

## Fonte de dados por plataforma

| Plataforma | Fonte | Ferramenta |
|-----------|-------|-----------|
| Meta Ads spend | `metricas_coletadas` (se disponível) ou Meta Ads MCP | `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52` |
| Leads (conversas, Respondi, pixel) — quando `meta_ad_account_id` disponível | Meta Ads MCP (`action_types`) | `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52` |
| Leads (conversas) — quando `meta_ad_account_id` null | Reportei API v2 (`get_project_metrics`) | `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` |
| Google Ads spend | Reportei API v2 | `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` → `get_project_metrics` |
| Seguidores Instagram | Reportei API v2 | `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` → `get_project_metrics` |

## Responsabilidades

- Receber lista de clientes com `gestores: vinicius in gestores` de `data/clientes.yaml`
- Calcular período: segunda a domingo da semana anterior
- Coletar métricas em duas camadas:
  1. Reportei: `GET /v2/projects/{reportei_project_id}` direto para clientes com ID confirmado
  2. Reportei: `GET /v2/projects?per_page=100&page=N` paginado como fallback
- Usar `slug` do cliente em `data/clientes.yaml` para match com `metricas_coletadas`
- Preencher Google Sheets nas colunas de `sheet_columns` em `data/clientes.yaml`

## Colunas preenchidas (padrão — ver sheet_columns por cliente em data/clientes.yaml)

| Coluna | Métrica |
|--------|---------|
| C | Meta Ads Spend (R$) |
| E | Google Ads Spend (R$) |
| H | Seguidores Instagram |
| K | Conversas WhatsApp |
| O | Conversões |

## Lógica de plataformas

O coletor tenta coletar todas as métricas. Escreve o que encontrou:

| Situação | Comportamento |
|----------|---------------|
| Plataforma existe no Reportei | Preencher coluna com o valor |
| Plataforma não existe no projeto | Registrar como `null` — coluna fica vazia, sem erro |
| Valor retornado = 0 | Preencher 0 — o redator decide se menciona |
| Dr Javier Cucchiaro (Meta ARS) | Pular Meta Spend — registrar aviso |
| meta_ad_account_id: null | Sem dados Meta Ads MCP — usar Reportei API se disponível |

## Regras técnicas obrigatórias

| Regra | Detalhe |
|-------|---------|
| Fonte de clientes | `data/clientes.yaml` (não `config/clientes-config.yaml`) |
| Filtro | `vinicius in gestores AND ativo: true` |
| Aba do Sheets | Deve existir com nome `DD/MM/AAAA` — ERRO CLARO se não encontrada |
| Período | `last_sunday - 6` até `last_sunday` (7 dias completos) |
| Slug Google | Usar `'google_adwords'` — NUNCA `'google_ads'` |
| Custo Google | Valor direto — NÃO dividir por 1.000.000 |
| Seguidores | Match exato: `ref == 'ig:new_followers_count'` |
| Conversas (meta_ad_account_id disponível) | Meta Ads MCP: `onsite_conversion.messaging_conversation_started_7d` |
| Conversas (meta_ad_account_id null) | Reportei: `messaging_conversation_started_7d` |
| Rate limit Reportei | `sleep(0.6s)` entre chamadas; aguardar 60s após erro 429 |
| Dr. Javier | Pular Meta Spend (bloqueado em ARS) — sem erro, só aviso |
| Paginação | Continuar enquanto `len(results) == per_page` |

## Função _to_float() (comportamento esperado)

- `float` → retornar diretamente
- `str` com vírgula → substituir vírgula por ponto, converter
- `list` → somar todos os elementos numéricos
- `dict` → tentar chave `'value'` ou `'total'`
- `None` → retornar `0.0`

## Tasks que executa

- `tasks/fetch-metrics.md` → coleta as métricas
- `tasks/verify-fill.md` → valida dados antes de escrever no Sheets
- `tasks/save-history.md` → salva histórico em `data/historico-clientes.yaml`

## Persistência de histórico (pós-coleta)

Após coleta bem-sucedida (✅), chamar `save-history` (não-bloqueante):

| Parâmetro | Valor |
|-----------|-------|
| `cliente_slug` | slug do cliente em `data/clientes.yaml` |
| `periodo_inicio` | data de início da semana (YYYY-MM-DD) |
| `periodo_fim` | data de fim da semana (YYYY-MM-DD) |
| `meta_spend` | valor coletado (0.0 se null) |
| `google_spend` | valor coletado (0.0 se null) |
| `seguidores` | valor coletado |
| `conversas` | valor coletado (WhatsApp) |
| `pixel_leads` | valor coletado (0 se lead_sources sem pixel_evento) |
| `site_leads` | valor coletado (0 se lead_sources sem lead_site) |
| `total_leads` | conversas + pixel_leads + site_leads |
| `conversoes` | valor coletado |
| `fonte_meta` | `"metricas_coletadas"` ou `"meta_ads_mcp"` ou `"reportei_api"` |

Clientes com erro na coleta (❌) não chamam `save-history`.

## Saída esperada

```
COLETA CONCLUÍDA — Semana [DD/MM/AAAA] a [DD/MM/AAAA]
════════════════════════════════════════════════════
✅ IMCP                C: R$1.234,56  E: R$567,89  H:12  K:34  TL:44(px:7 site:3)  O:5  [Meta: FASE1 | Google: Reportei]
✅ Dra Danielle Gondim C: R$890,00   E: R$234,56  H:8   K:18  TL:18  O:2  [Meta: Direto | Google: Reportei]
⚠️ Dr Javier Cucchiaro C: —(ARS)     E: R$450,00  H:5   K:9   TL:9   O:1
❌ [Cliente sem match] ERRO: projeto não encontrado no Reportei
════════════════════════════════════════════════════
Processados: X/Y | Pulados: Z | Erros: W
TL = total_leads (K = conversas WhatsApp; TL inclui pixel e site quando configurado)
```

## Tratamento de erros

| Erro | Mensagem ao usuário |
|------|---------------------|
| 401 — Token inválido/expirado | "Token Reportei inválido ou expirado. Atualizar variável REPORTEI_TOKEN." |
| 403 — Sem acesso ao projeto | "Sem acesso ao projeto [ID]. Verificar permissões do token." |
| 429 — Rate limit | Aguardar mínimo 60s, retentar automaticamente |
| Projeto não encontrado | Registrar como ❌, continuar com próximo cliente |
| Aba não encontrada no Sheets | "Aba '[DD/MM/AAAA]' não encontrada. Criar manualmente e rodar novamente." — STOP |
