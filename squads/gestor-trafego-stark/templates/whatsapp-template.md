# Template de Mensagem WhatsApp — Squad gestor-trafego-stark
> Mensagem de convite com resumo de métricas e link para o relatório completo.
> ⚠️ NÃO usar HTML aqui — WhatsApp renderiza negrito como *asterisco* ao redor do texto.
> Campos entre colchetes são substituídos pelo `whatsapp-writer`.

---

## TEMPLATE ÚNICO (todos os clientes)

```
[SAUDACAO], [NOME_WHATSAPP]!

Segue o resumo da semana *[DD/MM] a [DD/MM]*:

💰 *Investimento:* [INVESTIMENTO]
💬 *Conversas:* [CONVERSAS] | *CPL:* R$[CPL]

Relatório completo disponível no link abaixo:
🔗 [LINK]
```

> A linha `💬 *Conversas*` é omitida quando `conversas = 0`, `meta_spend = 0` ou CPL < 0.

---

## Campos e Regras de Preenchimento

| Campo | Formato | Exemplo |
|-------|---------|---------|
| `[SAUDACAO]` | Determinado pelo horário local | `Boa tarde` |
| `[NOME_WHATSAPP]` | Campo `nome_whatsapp` em `data/clientes.yaml` | `Dra. Danielle` |
| `[DD/MM]` início | Data da segunda-feira do período | `11/05` |
| `[DD/MM]` fim | Data do domingo do período | `17/05` |
| `[INVESTIMENTO]` | Valor(es) formatados conforme regras abaixo | `R$11.739,71 (Meta: R$11.332,00 + Google: R$407,71)` |
| `[CONVERSAS]` | Número de conversas WhatsApp | `93` |
| `[CPL]` | Custo por lead (meta_spend / conversas) | `69,75` |
| `[LINK]` | URL do Reportei | `https://app.reportei.com/projects/{reportei_project_id}` |

---

## Regras de preenchimento do campo [INVESTIMENTO]

| Situação | Formato |
|----------|---------|
| Meta > 0 e Google > 0 | `R$[TOTAL] (Meta: R$[META] + Google: R$[GOOGLE])` |
| Apenas Meta > 0 | `R$[META_SPEND] (Meta Ads)` |
| Apenas Google > 0 | `R$[GOOGLE_SPEND] (Google Ads)` |

---

## Regras de saudação por horário local

| Horário local | Saudação |
|--------------|---------|
| 05h – 11h59 | `Bom dia` |
| 12h – 17h59 | `Boa tarde` |
| 18h – 23h59 e 00h – 04h59 | `Boa noite` |

---

## Regras de omissão da linha de conversas/CPL

| Situação | Ação |
|----------|------|
| `conversas = 0` | Omitir linha `💬 *Conversas*` |
| `meta_spend = 0` (CPL não calculável) | Omitir linha `💬 *Conversas*` |
| CPL < 0 (dado inconsistente) | Omitir linha `💬 *Conversas*` |

---

## Exemplos de Saída

**Cliente META + Google (com conversas):**
```
Boa tarde, Dra. Danielle!

Segue o resumo da semana *11/05 a 17/05*:

💰 *Investimento:* R$12.147,65 (Meta: R$11.739,71 + Google: R$407,94)
💬 *Conversas:* 1.212 | *CPL:* R$9,69

Relatório completo disponível no link abaixo:
🔗 https://app.reportei.com/projects/627550
```

**Cliente META apenas (sem conversas):**
```
Boa tarde, pessoal!

Segue o resumo da semana *11/05 a 17/05*:

💰 *Investimento:* R$2.110,96 (Meta Ads)

Relatório completo disponível no link abaixo:
🔗 https://app.reportei.com/projects/688377
```

**Cliente Google apenas (Dr. Laureano Filho):**
```
Bom dia, Dr. Laureano!

Segue o resumo da semana *11/05 a 17/05*:

💰 *Investimento:* R$1.200,00 (Google Ads)

Relatório completo disponível no link abaixo:
🔗 https://app.reportei.com/projects/982754
```
