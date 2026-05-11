# super-gestor

Squad de inteligência de tráfego pago para cirurgia plástica — com sistema de histórico de experimentos.

## O que esse squad faz

Pipeline completo de 7 fases:

1. **Diagnóstico** (kotler) — Audita a clínica antes de qualquer ação
2. **Geração de prompts** (gemini-bridge) — Cria prompts para o Gemini Deep Research
3. **Validação de pesquisa** (ogilvy) — Audita o que o Gemini trouxe
4. **Arquitetura de campanha** (kennedy) — Monta estrutura nova, nunca repete histórico
5. **Compliance** (compliance-guard) — CFM 2336/2023 + LGPD
6. **Validação de métricas** (avinash) — Benchmarks e orçamento real
7. **Entrega + registro** (traffic-chief) — Pacote final + entrada no histórico

## Diferencial: experiment log

Toda estrutura sugerida é salva em `data/campaign-history.yaml`.
Kennedy lê esse arquivo antes de qualquer nova sugestão — nunca repete combinação já testada.
O gestor pode marcar uma estrutura como VALIDADA ou DESCARTADA após o teste.

## Como usar

```
/AIOX:agents:super-gestor
*full-pipeline    → pipeline completo
*diagnose         → só diagnóstico
*research-prompts → só gerar prompts Gemini
*show-history     → ver experimentos salvos
*save-result EXP-001 VALIDADA → atualizar histórico
```

## Agentes

| Agente | Inspiração | Função |
|---|---|---|
| traffic-chief | — | Orquestrador |
| kotler | Philip Kotler | Diagnóstico |
| gemini-bridge | Prompt Engineering | Ponte com Gemini |
| ogilvy | David Ogilvy | Validação de pesquisa |
| kennedy | Dan Kennedy | Arquitetura de campanha |
| avinash | Avinash Kaushik | Métricas e benchmarks |
| compliance-guard | CFM 2336/2023 | Legal |

## Knowledge base

`data/knowledge-base.yaml` contém dados verificados em sessão de deep research (2026-05-10):
- Benchmarks de CPC/CPA para cirurgia plástica no Brasil
- Imposto Meta 2026 (12,15%) com fórmula de cálculo
- Regras CFM 2336/2023 compiladas
- Dados de GEO e tendências confirmadas
