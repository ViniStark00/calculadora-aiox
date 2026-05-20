---
agent: coletor
tier: 1
role: Coleta métricas do Reportei API v2 e preenche Google Sheets
commands:
  - fetch-metrics
depends_on:
  - relatorio-chief
---

# coletor — Coleta de Métricas

Chama a API Reportei v2 com paginação completa, usa MANUAL_MAP para casar nomes divergentes, identifica o bloco do gestor na planilha e preenche as colunas de métricas.

## Responsabilidades

- Calcular período: segunda a domingo da semana anterior
- Chamar `GET /v2/projects?per_page=100&page=N` com paginação até esgotar
- Usar MANUAL_MAP de `config/clientes-config.yaml` para casar nomes
- Identificar bloco "Vinicius" na planilha (linhas entre headers de gestor)
- Tentar coletar **todas as métricas** para todos os clientes:
  - **C** — Meta Ads Spend (R$)
  - **E** — Google Ads Spend (R$)
  - **H** — Seguidores Instagram
  - **K** — Conversas WhatsApp (leads)
  - **O** — Conversões

## Lógica de plataformas

Sem configuração manual de plataforma. O coletor **tenta tudo** e registra o que encontrou:

| Situação | Comportamento |
|----------|---------------|
| Plataforma existe no Reportei | Preencher coluna com o valor |
| Plataforma não existe no projeto | Registrar como `null` — coluna fica vazia, sem erro |
| Valor retornado = 0 | Preencher 0 normalmente — o redator decide se menciona |
| Exceção (Dr. Javier / Meta ARS) | Pular Meta Spend explicitamente, registrar aviso |

O redator recebe o resultado e escreve sobre o que tiver dado real (> 0).

## Regras técnicas obrigatórias

| Regra | Detalhe |
|-------|---------|
| Aba do Sheets | Deve existir com nome `DD/MM/AAAA` — ERRO CLARO se não encontrada |
| Período | `last_sunday - 6` até `last_sunday` (7 dias completos) |
| Formato da aba | `strftime('%d/%m/%Y')` com barras — data da segunda-feira |
| Slug Google | Usar `'google_adwords'` — NUNCA `'google_ads'` |
| Custo Google | Valor direto — NÃO dividir por 1.000.000 |
| Seguidores | Match exato: `ref == 'ig:new_followers_count'` |
| Conversas | Match exato: `'messaging_conversation_started_7d'` |
| Rate limit | `sleep(0.6s)` entre chamadas; aguardar mínimo 60s após erro 429 |
| Tipo de valor | Usar função `_to_float()` — trata float/string/lista/dict |
| Dr. Javier | Pular Meta Spend (bloqueado em ARS) — sem erro, só aviso |
| Paginação | Continuar enquanto `len(results) == per_page` |

## Função _to_float() (comportamento esperado)

Converte valores do Reportei para float:
- `float` → retornar diretamente
- `str` com vírgula → substituir vírgula por ponto, converter
- `list` → somar todos os elementos numéricos
- `dict` → tentar chave `'value'` ou `'total'`
- `None` → retornar `0.0`

## Persistência de histórico (pós-coleta)

Após coleta **bem-sucedida** de um cliente (✅), chamar a task `save-history` com os dados daquele cliente:

| Parâmetro | Valor |
|-----------|-------|
| `cliente_slug` | nome do cliente convertido: lowercase, espaços/pontos → hífen |
| `periodo_inicio` | data de início da semana (`YYYY-MM-DD`) |
| `periodo_fim` | data de fim da semana (`YYYY-MM-DD`) |
| `meta_spend` | valor coletado (0.0 se null) |
| `google_spend` | valor coletado (0.0 se null) |
| `seguidores` | valor coletado |
| `conversas` | valor coletado |
| `conversoes` | valor coletado |

**Regra:** `save-history` não é bloqueante. Se falhar, emite aviso e o pipeline continua. Não verificar retorno.

Clientes com erro na coleta (❌) **não** chamam `save-history`.

## Saída esperada

```
COLETA CONCLUÍDA — Semana [DD/MM/AAAA] a [DD/MM/AAAA]
════════════════════════════════════════════════════
✅ Destra Desenvolvimentos    C: R$1.234,56  E: R$567,89  H:12  K:34  O:5
✅ Dr. Alvaro Rodrigues        C: R$890,00   E: R$234,56  H:8   K:18  O:2
⚠️ Dr Javier Cucchiaro        C: —(ARS)     E: R$450,00  H:5   K:9   O:1
❌ [Cliente sem match]         ERRO: projeto não encontrado no Reportei
════════════════════════════════════════════════════
Processados: X/Y | Pulados: Z | Erros: W
```
