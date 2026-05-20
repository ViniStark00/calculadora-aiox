# Template de Mensagem WhatsApp
> Mensagens de texto simples com negrito WhatsApp (*texto*) e emojis.
> ⚠️ NÃO usar HTML aqui — WhatsApp renderiza negrito como *asterisco* ao redor do texto.
> Campos entre colchetes são substituídos pelo `whatsapp-writer`.

---

## TEMPLATE META-ONLY (apenas Meta Ads)

```
📊 *Relatório Semanal — [CLIENTE]* | [DD/MM] a [DD/MM]

💰 Investimento: R$ [META_SPEND] (Meta)
💬 [CONVERSAS] conversas | CPL: R$ [CPL]
📈 [HIGHLIGHT]

🔗 Relatório completo: [LINK]
```

---

## TEMPLATE META+GOOGLE (Meta Ads + Google Ads)

```
📊 *Relatório Semanal — [CLIENTE]* | [DD/MM] a [DD/MM]

💰 Investimento: R$ [META_SPEND] (Meta) + R$ [GOOGLE_SPEND] (Google)
💬 [CONVERSAS] conversas | CPL: R$ [CPL]
📈 [HIGHLIGHT]

🔗 Relatório completo: [LINK]
```

---

## TEMPLATE GOOGLE-ONLY (apenas Google Ads)

```
📊 *Relatório Semanal — [CLIENTE]* | [DD/MM] a [DD/MM]

💰 Investimento: R$ [GOOGLE_SPEND] (Google)
💬 [CONVERSAS] conversas | CPL: R$ [CPL]
📈 [HIGHLIGHT]

🔗 Relatório completo: [LINK]
```

---

## Campos e Regras de Preenchimento

| Campo | Formato | Exemplo |
|-------|---------|---------|
| `[CLIENTE]` | Nome exato do cliente | `IMCP` |
| `[DD/MM]` início | Data da segunda-feira do período | `11/05` |
| `[DD/MM]` fim | Data do domingo do período | `17/05` |
| `[META_SPEND]` | Valor em R$ com 2 casas decimais | `2.110,96` |
| `[GOOGLE_SPEND]` | Valor em R$ com 2 casas decimais | `407,94` |
| `[CONVERSAS]` | Número inteiro | `91` |
| `[CPL]` | Valor em R$ com 2 casas decimais | `23,19` |
| `[HIGHLIGHT]` | 1 frase objetiva, sem elogios | `CPL de R$ 23,19 — custo por conversa dentro da meta.` |
| `[LINK]` | URL do Reportei | `https://app.reportei.com/projects/688377` |

## Regras de Tom

- Tom neutro e informativo — sem elogios exagerados, sem críticas pesadas
- Frases curtas e diretas — a mensagem deve caber em 5-6 linhas no WhatsApp
- O `[HIGHLIGHT]` deve ser o dado mais relevante da semana (ver regras no `whatsapp-writer.md`)
- Usar vírgula como separador decimal (padrão brasileiro): R$ 2.110,96 (não R$ 2110.96)
