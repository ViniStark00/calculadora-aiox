---
workflow: full-campaign-pipeline
comando: "*full-pipeline"
agente_principal: traffic-chief
---

# Workflow: Pipeline Completo de Campanha

## Uso
```
*full-pipeline
```

## Sequência

```
FASE 1 — DIAGNÓSTICO
  Agente: kotler
  Task: diagnose-account.md
  Gate: relatório de diagnóstico concluído
  ↓

FASE 2 — PESQUISA
  Agente: gemini-bridge
  Task: generate-research-prompts.md
  Gate: 3+ prompts gerados e entregues ao usuário
  ↓ [usuário vai ao Gemini e volta com resultado]

FASE 3 — VALIDAÇÃO DE PESQUISA
  Agente: ogilvy
  Task: validate-research.md
  Gate: relatório de validação com dados confirmados/rejeitados
  ↓

FASE 4 — ARQUITETURA DE CAMPANHA
  Agente: kennedy
  Task: build-campaign-structure.md
  Pré-requisito: ler campaign-history.yaml
  Gate: estrutura nova (não duplicada) preenchida
  ↓

FASE 5 — COMPLIANCE
  Agente: compliance-guard
  Task: check-compliance.md
  Gate: checklist CFM/LGPD 8/8 aprovado
  ↓

FASE 6 — VALIDAÇÃO DE MÉTRICAS
  Agente: avinash
  Gate: orçamento calculado, KPIs corretos, benchmarks dentro da faixa
  ↓

FASE 7 — ENTREGA + REGISTRO
  Agente: traffic-chief
  Task: save-experiment.md
  Output: pacote final + entrada em campaign-history.yaml com status EM_TESTE
```

## Output final do pipeline

```
📦 PACOTE DE CAMPANHA — [PROCEDIMENTO] — [DATA]
──────────────────────────────────────────────
🔍 Diagnóstico: [resumo kotler]
📊 Pesquisa validada: [resumo ogilvy]
🏗️ Estrutura de campanha: [kennedy — completa]
✅ Compliance: APROVADO
📈 Métricas: [avinash — benchmarks]
🗂️ Registrado como: EXP-00X (EM_TESTE)
──────────────────────────────────────────────
Próximos passos:
1. Executar a campanha
2. Após 7-14 dias, reportar resultado aqui
3. Eu atualizo o histórico e sugiro a próxima variação
```
