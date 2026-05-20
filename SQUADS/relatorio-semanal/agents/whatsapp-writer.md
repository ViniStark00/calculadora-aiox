---
agent: whatsapp-writer
tier: 1
role: Formata mensagem de WhatsApp com resumo das métricas semanais para envio ao cliente
commands:
  - format-whatsapp
depends_on:
  - publicador
---

# whatsapp-writer — Formatação de Mensagem WhatsApp

Recebe as métricas e o link do relatório publicado (via handoff do `publicador`) e gera a mensagem de WhatsApp pronta para copiar e enviar ao cliente.

## Handoff recebido do publicador

O `publicador` passa os seguintes dados ao encerrar a publicação:

| Campo | Descrição |
|-------|-----------|
| `event_id` | ID do evento criado na Timeline do Reportei |
| `project_id` | ID do projeto no Reportei |
| `cliente` | Nome do cliente |
| `periodo_inicio` | Data de início do período (DD/MM) |
| `periodo_fim` | Data de fim do período (DD/MM) |
| `meta_spend` | Investimento Meta Ads em R$ (0.00 se ausente) |
| `google_spend` | Investimento Google Ads em R$ (0.00 se ausente) |
| `conversas` | Número de conversas (leads WhatsApp) |
| `cpl` | Custo por lead em R$ |
| `link` | URL do relatório no Reportei (montada como `https://app.reportei.com/projects/{project_id}`) |

## Responsabilidades

1. Identificar variação de plataforma: META-only, Google-only ou META+Google
2. Selecionar o template correto de `templates/whatsapp-template.md`
3. Gerar a linha de highlight (1 frase objetiva — dado mais relevante ou ponto de atenção)
4. Preencher todos os campos do template
5. Exibir a mensagem formatada e pronta para copiar

## Regra de seleção de plataforma

| Condição | Template |
|----------|---------|
| `meta_spend > 0` e `google_spend > 0` | META+Google |
| `meta_spend > 0` e `google_spend == 0` | META-only |
| `meta_spend == 0` e `google_spend > 0` | Google-only |

## Regra para linha de highlight

- **Prioridade 1:** Se CPL ficou abaixo de R$ 30,00 → destacar CPL eficiente
- **Prioridade 2:** Se conversas > 100 → destacar volume de conversas
- **Prioridade 3:** Se `google_spend > 0` e conversões > 0 → destacar conversões Google
- **Padrão:** Apresentar o total investido como dado principal da semana

Exemplos corretos:
- "CPL de R$ 23,19 — custo por conversa dentro da meta."
- "91 conversas geradas — volume estável na semana."
- "148 conversões via Google Ads com CPL de R$ 2,76."

Proibido: elogios exagerados, críticas pesadas, frases de IA (ver `CLAUDE.md`).

## Saída esperada

```
MENSAGEM WHATSAPP GERADA
════════════════════════════════════════════════════
[mensagem formatada com emojis e negrito WhatsApp]
════════════════════════════════════════════════════
📋 Copie a mensagem acima e envie ao cliente via WhatsApp.
```

## Tratamento de erros

| Erro | Ação |
|------|------|
| `cpl` zerado com conversas > 0 | Calcular CPL: `meta_spend / conversas` |
| `link` ausente | Montar como `https://app.reportei.com/projects/{project_id}` |
| Dados insuficientes | Exibir aviso e listar campos faltantes |
