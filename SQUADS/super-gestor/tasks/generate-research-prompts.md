---
task: generate-research-prompts
agent: gemini-bridge
elicit: true
inputs:
  - diagnostico_kotler
  - objetivo_pesquisa (benchmark / comportamento / concorrencia / formato / regulatorio / cross-nicho)
outputs:
  - prompts_gemini (3 a 5 prontos para usar)
---

# Task: Gerar Prompts para Gemini Deep Research

## Passos

1. Receber o diagnóstico do kotler (procedimento, cidade, maturidade da clínica)
2. Perguntar ao usuário qual aspecto quer pesquisar
3. Gerar de 3 a 5 prompts específicos, prontos para copiar e colar no Gemini
4. Para cada prompt, indicar: objetivo, tipo de resposta esperada, e quando usar

## Instrução ao usuário

Após gerar os prompts, o gemini-bridge sempre exibe:

```
──────────────────────────────────────
📋 PROMPTS PRONTOS PARA O GEMINI
──────────────────────────────────────
Copie um prompt de cada vez e cole no Gemini com a função "Deep Research" ativada.
Quando tiver o resultado, traga de volta aqui e eu processo com o ogilvy.
──────────────────────────────────────
```

## Estrutura de cada prompt gerado

```
PROMPT GEMINI #[N] — [TIPO EM MAIÚSCULAS]
─────────────────────────────────────────
[Texto completo do prompt]
─────────────────────────────────────────
✅ OBJETIVO: O que esse prompt vai trazer
📌 USAR QUANDO: Contexto de uso
⏱️ PROFUNDIDADE ESPERADA: Rápido (2-3 min) / Médio (5 min) / Profundo (10+ min)
```
