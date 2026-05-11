---
task: diagnose-account
agent: kotler
elicit: true
inputs: []
outputs:
  - relatorio_diagnostico
  - maturidade_digital (Iniciante / Intermediaria / Avancada)
  - prioridade_plataforma
---

# Task: Diagnosticar Conta e Contexto

## Passos

1. Fazer as 9 perguntas dos 3 blocos (uma de cada vez, aguardar resposta)
2. Consolidar respostas em relatório de diagnóstico
3. Classificar maturidade digital da clínica
4. Definir prioridade: Meta primeiro, Google primeiro, ou ambos
5. Listar dados que ainda faltam para avançar

## Critério de maturidade

| Maturidade | Critério |
|---|---|
| Iniciante | Nunca anunciou OU não tem CRM OU não tem pixel instalado |
| Intermediária | Já anunciou, tem CRM, sabe CPL mas não CPA |
| Avançada | CRM integrado, sabe CPA, tem histórico de campanhas, usa remarketing |

## Output

```
RELATÓRIO DE DIAGNÓSTICO — [NOME DA CLÍNICA / MÉDICO]
──────────────────────────────────────────────────────
Procedimento foco: [X]
Cidade/região: [X]
Ticket médio: R$ [X]
Maturidade digital: [Iniciante / Intermediária / Avançada]
Plataforma prioritária: [Meta / Google / Ambos]

GAPS IDENTIFICADOS:
- [item 1]
- [item 2]

DADOS NECESSÁRIOS ANTES DE AVANÇAR:
- [item 1 — se houver]

PRÓXIMA FASE: gemini-bridge (geração de prompts de pesquisa)
```
