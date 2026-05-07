# Project Brief: Calculadora Científica com Histórico

**Data:** 2026-05-07
**Agente:** Atlas (Analyst) — @analyst
**Sessão:** Brainstorming Session — Calculadora Ponta a Ponta no AIOX
**Participantes da sessão:** Atlas (@analyst), consulta a @architect (tech stack), @po (escopo MVP)

---

## Executive Summary

Uma **calculadora web científica com histórico de operações**, empacotada em uma única pasta autocontida, sem dependências externas. O usuário pode realizar cálculos básicos e científicos e consultar o histórico de todas as operações realizadas na sessão. Tecnologia: HTML + CSS + JavaScript vanilla — sem frameworks, sem servidor, sem build step.

**Problema resolvido:** Calculadoras científicas online exigem conexão com internet e não guardam histórico de forma acessível. Uma aplicação local e autocontida resolve os dois problemas.

**Proposta de valor:** Uma ferramenta leve, elegante e funcional que roda direto no navegador, sem instalação, e que o usuário pode carregar de qualquer lugar.

---

## Problem Statement

- Calculadoras científicas online dependem de internet e não persistem histórico entre sessões
- Calculadoras nativas do SO não têm histórico de operações completo visível
- O usuário precisa de uma solução **portátil** (uma pasta, abre no navegador) que combine funções científicas com registro histórico de cálculos
- Não existe necessidade de backend, banco de dados ou build tool — o projeto precisa ser simples de compartilhar e abrir

---

## Proposed Solution

Aplicação web estática em uma única pasta (`calculadora/`) contendo apenas:
- `index.html` — estrutura
- `style.css` — visual
- `script.js` — toda a lógica

Funciona offline, abre com duplo clique no `index.html`, sem instalação.

**Diferenciais:**
- Histórico persistido na sessão (localStorage) visível em painel lateral
- Interface científica com alternância entre modo básico e científico
- Design limpo e responsivo

---

## Brainstorming — Ideias Geradas

### Categoria A: Operações Matemáticas (Core)

| # | Ideia | Prioridade | Fonte |
|---|-------|-----------|-------|
| A1 | Soma, subtração, multiplicação, divisão | MUST | básico |
| A2 | Potenciação (x², xⁿ) | MUST | científico |
| A3 | Raiz quadrada (√x) e raiz n-ésima | MUST | científico |
| A4 | Trigonometria: sen, cos, tan e inversas | MUST | científico |
| A5 | Logaritmo natural (ln) e base 10 (log) | MUST | científico |
| A6 | Fatorial (n!) | MUST | científico |
| A7 | Porcentagem (%) | SHOULD | útil |
| A8 | Pi (π) e Euler (e) como constantes | SHOULD | científico |
| A9 | Módulo / valor absoluto (\|x\|) | SHOULD | científico |
| A10 | Notação científica (ex: 1.5e10) | COULD | avançado |

### Categoria B: Histórico de Operações

| # | Ideia | Prioridade | Fonte |
|---|-------|-----------|-------|
| B1 | Painel lateral com lista de operações realizadas | MUST | core |
| B2 | Cada entrada mostra: expressão + resultado | MUST | core |
| B3 | Clicar no histórico reutiliza o resultado | SHOULD | UX |
| B4 | Botão "Limpar Histórico" | MUST | UX |
| B5 | Persistência via localStorage (sobrevive a F5) | SHOULD | UX |
| B6 | Exportar histórico como .txt | COULD | futuro |
| B7 | Timestamp em cada operação | COULD | futuro |

### Categoria C: Interface e UX

| # | Ideia | Prioridade | Fonte |
|---|-------|-----------|-------|
| C1 | Toggle entre modo Básico / Científico | MUST | usabilidade |
| C2 | Display grande mostrando expressão atual e resultado | MUST | UX |
| C3 | Teclado físico funciona (digitar números e operadores) | SHOULD | UX |
| C4 | Botão CE (apagar último caractere) e C (limpar tudo) | MUST | UX |
| C5 | Layout responsivo (funciona em celular) | SHOULD | UX |
| C6 | Tema claro/escuro | COULD | extra |
| C7 | Animações suaves nos botões | COULD | extra |
| C8 | Graus vs Radianos (toggle para funções trig) | SHOULD | científico |

### Categoria D: Estrutura Técnica

| # | Ideia | Prioridade | Fonte |
|---|-------|-----------|-------|
| D1 | Tudo em uma pasta (`calculadora/`) | MUST | requisito do usuário |
| D2 | HTML + CSS + JS vanilla — zero dependências | MUST | portabilidade |
| D3 | Usar `eval()` seguro via parser próprio (sem eval direto) | MUST | segurança |
| D4 | localStorage para histórico | SHOULD | persistência |
| D5 | Sem framework, sem build, sem npm | MUST | simplicidade |

---

## Target Users

### Usuário Primário: Estudante / Profissional

- Precisa de uma calculadora científica rápida
- Quer registrar os cálculos feitos durante um estudo ou trabalho
- Não quer instalar nada — só abrir no navegador
- Usa computador Windows/Mac/Linux com navegador moderno

### Usuário Secundário: Desenvolvedor Aprendendo AIOX

- Usa esse projeto como exercício de aprendizado do framework
- Quer ver um ciclo completo de desenvolvimento (Passo 01 → 08)
- Código precisa ser legível e bem organizado

---

## MVP Scope

### Core Features (Must Have)

- **Operações básicas:** `+`, `-`, `×`, `÷`, `%`
- **Funções científicas:** `x²`, `√`, `xⁿ`, `sen`, `cos`, `tan`, `ln`, `log`, `n!`, `|x|`, `π`, `e`
- **Toggle Graus/Radianos** para funções trigonométricas
- **Toggle Modo Básico/Científico** (oculta funções avançadas no modo básico)
- **Display** com expressão atual + resultado em tempo real
- **Painel de histórico** com lista de operações realizadas
- **Reutilizar resultado** clicando em item do histórico
- **Limpar histórico** com um botão
- **Persistência de histórico** via localStorage
- **Suporte a teclado físico**
- **Layout responsivo** (desktop e mobile)

### Out of Scope (MVP)

- Exportar histórico
- Tema claro/escuro
- Notação científica na entrada
- Gráficos de funções
- Histórico persistido entre dias (apenas sessão/localStorage)

### MVP Success Criteria

A calculadora abre no navegador com duplo clique em `index.html`, realiza todos os cálculos listados acima corretamente, exibe e persiste o histórico, e funciona sem conexão com internet.

---

## Post-MVP Vision

### Phase 2 Features
- Tema claro/escuro com toggle
- Exportar histórico como .txt ou .csv
- Histórico com timestamp
- Notação científica na entrada

### Long-term Vision
- Calculadora de matrizes
- Gráfico de funções inline
- Múltiplas memórias (M1, M2, M3)

---

## Technical Considerations

### Estrutura de Arquivos (uma única pasta)

```
calculadora/
├── index.html      ← ponto de entrada, estrutura HTML
├── style.css       ← todo o visual e layout
└── script.js       ← toda a lógica (parser, histórico, UI)
```

### Technology Stack

- **Frontend:** HTML5 + CSS3 + JavaScript ES6+ (vanilla)
- **Persistência:** localStorage (nativo do navegador)
- **Math parser:** Implementação própria (sem `eval()` direto por segurança)
- **Build tool:** Nenhum
- **Dependências externas:** Nenhuma
- **Compatibilidade:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Architecture Notes

- Separação clara: HTML = estrutura, CSS = visual, JS = lógica
- JS dividido em módulos lógicos via funções/objetos (sem ES modules para evitar CORS em `file://`)
- localStorage key: `calculadora_historico`

---

## Constraints & Assumptions

### Constraints

- **Estrutura:** Tudo em uma única pasta (sem subpastas, sem npm, sem build)
- **Tecnologia:** HTML/CSS/JS vanilla (sem React, Vue, etc.)
- **Deploy:** Não há deploy — entrega via PR no GitHub
- **Tempo:** Ciclo AIOX completo (Passos 01–08)

### Key Assumptions

- O usuário tem um navegador moderno instalado
- O projeto será aberto via `file://` (duplo clique no index.html) ou servidor local simples
- `eval()` não será usado diretamente — parser matemático próprio para segurança

---

## Risks & Open Questions

### Key Risks

- **Parser matemático:** Implementar um parser correto (com precedência de operadores) é o ponto mais complexo do projeto — risco MÉDIO
- **Funções trig:** Conversão graus/radianos pode ter bugs sutis — risco BAIXO
- **localStorage cross-origin:** Se aberto via `file://` em alguns browsers, localStorage pode estar desabilitado — documentar fallback

### Open Questions

- O histórico deve mostrar apenas o resultado ou também a expressão completa?
  - **Decisão:** Mostrar expressão + resultado (ex: `2 + 3 = 5`)
- Quantos itens máximos no histórico?
  - **Decisão:** Máximo 50 itens (remove o mais antigo ao ultrapassar)

---

## Next Steps

1. **@pm** — Criar PRD a partir deste brief (`*create-prd`)
2. **@pm** — Criar Epic 1 (`*create-epic`)
3. **@pm** — Shardar o PRD em stories (`*shard-prd`)
4. **@architect** — Validar stack técnica e criar `docs/architecture.md`
5. **@sm** — Criar Story 1.1 (`*draft`)

---

## PM Handoff

Este Project Brief fornece o contexto completo para a **Calculadora Científica com Histórico**. Stack definida: HTML/CSS/JS vanilla, pasta única `calculadora/`. Próximo passo: `@pm *create-prd` gerando `docs/prd/prd-calculadora.md` com Functional Requirements (FR), Non-Functional Requirements (NFR) e Constraints (CON) rastreáveis.

---

*Gerado por Atlas (@analyst) — Synkra AIOX — 2026-05-07*
