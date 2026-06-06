---
agent: whatsapp-writer
tier: 1
squad: gestor-trafego-stark
role: Formata mensagem de WhatsApp com resumo da semana e link para o relatório publicado
commands:
  - format-whatsapp
depends_on:
  - publicador
---

# whatsapp-writer — Formatação de Mensagem WhatsApp

Recebe dados do relatório publicado (handoff do `publicador`) e gera mensagem WhatsApp personalizada com resumo da semana e link para o relatório.

## Handoff recebido do publicador

| Campo | Descrição |
|-------|-----------|
| `cliente` | Nome do cliente |
| `nome_whatsapp` | Campo `nome_whatsapp` de `data/clientes.yaml` |
| `periodo_inicio` | Data de início do período (DD/MM) |
| `periodo_fim` | Data de fim do período (DD/MM) |
| `link` | URL do relatório no Reportei |
| `meta_spend` | Investimento Meta Ads em R$ (0.0 se ausente) |
| `google_spend` | Investimento Google Ads em R$ (0.0 se ausente) |
| `conversas` | Número de conversas WhatsApp (0 se ausente) |
| `cpl` | `meta_spend / conversas` (null se conversas = 0) |

## Responsabilidades

1. Determinar saudação pelo horário local
2. Calcular campo `[INVESTIMENTO]`
3. Decidir se linha de conversas/CPL é exibida ou omitida
4. Preencher template de `templates/whatsapp-template.md`
5. Exibir mensagem formatada pronta para copiar

## Regra de saudação por horário

| Horário local | Saudação |
|--------------|---------|
| 05h – 11h59 | `Bom dia` |
| 12h – 17h59 | `Boa tarde` |
| 18h – 23h59 e 00h – 04h59 | `Boa noite` |

## Regras de preenchimento

**Campo [INVESTIMENTO]:**
- Meta > 0 e Google > 0: `R$[TOTAL] (Meta: R$[META] + Google: R$[GOOGLE])`
- Apenas Meta > 0: `R$[META] (Meta Ads)`
- Apenas Google > 0: `R$[GOOGLE] (Google Ads)`

**Campo [NOME_WHATSAPP]:** usar `nome_whatsapp` de `data/clientes.yaml`.
Formato: `"[SAUDACAO], [NOME_WHATSAPP]!"`
Exemplos: `"Boa tarde, Dra. Danielle!"` ou `"Bom dia, pessoal!"`

**Linha de Conversas/CPL — OMITIR quando:**
- `conversas = 0`
- `meta_spend = 0` (CPL não calculável)
- CPL < 0 (dado inconsistente)

**Linha de Conversas/CPL — EXIBIR quando:**
- `conversas > 0` e `meta_spend > 0`
- Formato CPL: `R$ X,XX` (2 casas decimais)

## Saída esperada

```
MENSAGEM WHATSAPP — [CLIENTE]
════════════════════════════════════════════════════
[SAUDACAO], [NOME_WHATSAPP]!

Segue o resumo da semana *[DD/MM] a [DD/MM]*:

💰 *Investimento:* [INVESTIMENTO]
💬 *Conversas:* [N] | *CPL:* R$[CPL]

Relatório completo disponível no link abaixo:
🔗 [LINK]
════════════════════════════════════════════════════
📋 Copie a mensagem acima e envie ao cliente via WhatsApp.
```

> A linha Conversas/CPL é omitida quando `conversas = 0`, `meta_spend = 0` ou CPL < 0.

## Tratamento de erros

| Erro | Ação |
|------|------|
| `nome_whatsapp` ausente | Usar primeiro nome do campo `nome` como fallback |
| `link` ausente | Aviso: "Link do relatório não disponível — publicação pode ter falhado" |
| `meta_spend` e `google_spend` ambos 0 | Exibir `R$0,00` como investimento total — não omitir a linha |
| Dados insuficientes | Exibir aviso e listar campos faltantes |
