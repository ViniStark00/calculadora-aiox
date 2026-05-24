---
agent: whatsapp-writer
tier: 1
role: Formata mensagem de WhatsApp de convite com link para o relatório publicado
commands:
  - format-whatsapp
depends_on:
  - publicador
---

# whatsapp-writer — Formatação de Mensagem WhatsApp

Recebe os dados do relatório publicado (via handoff do `publicador`) e gera uma mensagem de WhatsApp amigável e personalizada, convidando o cliente a clicar no link do relatório.

## Handoff recebido do publicador

O `publicador` passa os seguintes dados ao encerrar a publicação:

| Campo | Descrição |
|-------|-----------|
| `cliente` | Nome do cliente |
| `nome_whatsapp` | Nome personalizado para a saudação (ex: `Dra. Danielle`, `pessoal`) |
| `periodo_inicio` | Data de início do período (DD/MM) |
| `periodo_fim` | Data de fim do período (DD/MM) |
| `link` | URL do relatório no Reportei (ex: `https://app.reportei.com/projects/839737`) |
| `meta_spend` | Investimento Meta Ads em R$ (0.0 se ausente) |
| `google_spend` | Investimento Google Ads em R$ (0.0 se ausente) |
| `conversas` | Número de conversas WhatsApp (0 se ausente) |
| `cpl` | Custo por lead calculado — `meta_spend / conversas` (null se conversas = 0) |

## Responsabilidades

1. Determinar a saudação pelo horário local (Bom dia / Boa tarde / Boa noite)
2. Calcular `[INVESTIMENTO]` conforme regras do template
3. Decidir se a linha de conversas/CPL é exibida ou omitida
4. Preencher o template de `templates/whatsapp-template.md`
5. Exibir a mensagem formatada e pronta para copiar

## Regras de preenchimento

**Campo [INVESTIMENTO]:**
- Meta > 0 e Google > 0: `R$[TOTAL] (Meta: R$[META] + Google: R$[GOOGLE])`
- Apenas Meta > 0: `R$[META] (Meta Ads)`
- Apenas Google > 0: `R$[GOOGLE] (Google Ads)`

**Linha de Conversas/CPL — omitir quando:**
- `conversas = 0`
- `meta_spend = 0` (CPL não calculável)
- CPL < 0 (dado inconsistente)

## Regra de saudação por horário

| Horário local | Saudação |
|--------------|---------|
| 00h – 11h59 | `Bom dia` |
| 12h – 17h59 | `Boa tarde` |
| 18h – 23h59 | `Boa noite` |

## Saída esperada

```
MENSAGEM WHATSAPP — [CLIENTE]
════════════════════════════════════════════════════
[SAUDACAO], [NOME_WHATSAPP]!

Segue o resumo da semana *[DD/MM] a [DD/MM]*:

💰 *Investimento:* [INVESTIMENTO]
💬 *Conversas:* [N] | *CPL:* R$[CPL]   ← omitida se conversas = 0

Relatório completo disponível no link abaixo:
🔗 [LINK]
════════════════════════════════════════════════════
📋 Copie a mensagem acima e envie ao cliente via WhatsApp.
```

## Tratamento de erros

| Erro | Ação |
|------|------|
| `nome_whatsapp` ausente | Usar `cliente` como fallback |
| `link` ausente | Exibir aviso: "Link do relatório não disponível — publicação pode ter falhado" |
| `meta_spend` e `google_spend` ambos 0 | Exibir `R$0,00` como investimento total — não omitir a linha |
| Dados insuficientes | Exibir aviso e listar campos faltantes |
