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
- Conversas WhatsApp (`messaging_conversation_started_7d`)

Esses dados não estão disponíveis no Meta Ads MCP.

**Output:** documentar no resumo qual fonte foi usada para cada métrica por cliente:
```
✅ IMCP  Meta: metricas_coletadas (FASE 1) | Google: Reportei | Seguidores: Reportei
✅ Dra Danielle  Meta: Meta Ads MCP (sem dados FASE 1) | Google: Reportei
```

## Fonte de dados por plataforma

| Plataforma | Fonte | Ferramenta |
|-----------|-------|-----------|
| Meta Ads spend, conversas, CPL | `metricas_coletadas` (se disponível) ou Meta Ads MCP | `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52` |
| Google Ads spend | Reportei API v2 | `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` → `get_project_metrics` |
| Seguidores Instagram | Reportei API v2 | `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` → `get_project_metrics` |
| Conversas WhatsApp | Reportei API v2 | `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` → `get_project_metrics` |

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
| Parâmetros Reportei | Usar `date_from`/`date_to` — NUNCA `lookback: last_7d` |
| Slug Google | Usar `'google_adwords'` — NUNCA `'google_ads'` |
| Custo Google | Valor direto — NÃO dividir por 1.000.000 |
| Seguidores | Match exato: `ref == 'ig:new_followers_count'` |
| Conversas | Match exato: `'messaging_conversation_started_7d'` |
| Rate limit Reportei | `sleep(0.6s)` entre chamadas; aguardar 60s após erro 429; contador global: pausar 540s ao atingir 38 req |
| Dr. Javier | Pular Meta Spend (bloqueado em ARS) — sem erro, só aviso |
| Paginação | Continuar enquanto `len(results) == per_page` |

## Rate Limit Global (Reportei)

Manter contador global de chamadas ao MCP Reportei durante toda a execução.

| Parâmetro | Valor |
|-----------|-------|
| Limite | 38 requisições |
| Pausa | 540 segundos (9 minutos) |
| Mensagem | `[RATE LIMIT] 38 requisições atingidas — aguardando 9 min...` |

**Comportamento:**
1. A cada chamada bem-sucedida ao Reportei: incrementar `contador_global` em +1
2. Quando `contador_global >= 38`:
   - Exibir: `[RATE LIMIT] 38 requisições atingidas — aguardando 9 min...`
   - Pausar 540 segundos
   - Zerar `contador_global` para 0
   - Continuar normalmente
3. O `sleep(0.6s)` entre chamadas continua ativo (contador global é adicional, não o substitui)
4. Erro 429 continua acionando pausa de 60s independentemente do contador

## Cálculo de período (date_from / date_to)

Todas as chamadas ao Reportei API usam datas fixas, nunca `lookback`:

```python
# Mesmo algoritmo de calcular_aba() em fill_sheets.py
dias_ate_domingo = (hoje.weekday() + 1) % 7
if dias_ate_domingo == 0:
    dias_ate_domingo = 7
ultimo_domingo = hoje - timedelta(days=dias_ate_domingo)
date_from = (ultimo_domingo - timedelta(days=6)).strftime("%Y-%m-%d")  # segunda-feira
date_to = ultimo_domingo.strftime("%Y-%m-%d")  # domingo
```

Aplicar em: `get_project_metrics`, `get_metrics`, e qualquer outra chamada Reportei com período.

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
| `conversas` | valor coletado |
| `conversoes` | valor coletado |
| `fonte_meta` | `"metricas_coletadas"` ou `"meta_ads_mcp"` ou `"reportei_api"` |

Clientes com erro na coleta (❌) não chamam `save-history`.

## Saída esperada

```
COLETA CONCLUÍDA — Semana [DD/MM/AAAA] a [DD/MM/AAAA]
════════════════════════════════════════════════════
✅ IMCP                C: R$1.234,56  E: R$567,89  H:12  K:34  O:5  [Meta: FASE1 | Google: Reportei]
✅ Dra Danielle Gondim C: R$890,00   E: R$234,56  H:8   K:18  O:2  [Meta: Direto | Google: Reportei]
⚠️ Dr Javier Cucchiaro C: —(ARS)     E: R$450,00  H:5   K:9   O:1
❌ [Cliente sem match] ERRO: projeto não encontrado no Reportei
════════════════════════════════════════════════════
Processados: X/Y | Pulados: Z | Erros: W
```

## Tratamento de erros

| Erro | Mensagem ao usuário |
|------|---------------------|
| 401 — Token inválido/expirado | "Token Reportei inválido ou expirado. Atualizar variável REPORTEI_TOKEN." |
| 403 — Sem acesso ao projeto | "Sem acesso ao projeto [ID]. Verificar permissões do token." |
| 429 — Rate limit | Aguardar mínimo 60s, retentar automaticamente |
| Projeto não encontrado | Registrar como ❌, continuar com próximo cliente |
| Aba não encontrada no Sheets | "Aba '[DD/MM/AAAA]' não encontrada. Criar manualmente e rodar novamente." — STOP |
