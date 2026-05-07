# Calculadora Científica com Histórico — Architecture Document

**Versão:** 1.0
**Data:** 2026-05-07
**Agente:** Aria (@architect)
**Input:** docs/prd/prd-calculadora.md
**Status:** Approved

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-05-07 | 1.0 | Arquitetura inicial | Aria (@architect) |

---

## 1. Complexity Assessment (`*assess-complexity`)

| Dimensão | Score (1-5) | Justificativa |
|----------|-------------|---------------|
| Scope | 1 | 3 arquivos, 1 pasta, sem packages |
| Integration | 1 | Zero APIs externas, zero serviços |
| Infrastructure | 1 | Abre via `file://`, sem servidor |
| Knowledge | 2 | Parser Shunting-Yard tem complexidade média |
| Risk | 1 | Sem auth, sem dados sensíveis, sem DB real |
| **Total** | **6** | **Classe: SIMPLE** |

**Decisão:** Classe SIMPLE — arquitetura direta, sem fases adicionais de pesquisa ou revisão de spec.

---

## 2. Technical Summary

A calculadora é uma **aplicação web estática de arquivo único** — três arquivos em uma pasta, sem servidor, sem build, sem dependências externas. Toda a lógica reside no `script.js`: um parser matemático baseado no algoritmo Shunting-Yard para avaliar expressões com precedência correta, mais a gestão de estado da UI e o histórico via `localStorage`. O `style.css` implementa um dark theme responsivo com CSS Grid/Flexbox. Não existe camada de backend, API, banco de dados ou autenticação — a aplicação é completamente autocontida e funciona offline via protocolo `file://`.

---

## 3. Stack Tecnológica

| Categoria | Tecnologia | Versão | Propósito | Justificativa |
|-----------|-----------|--------|-----------|---------------|
| Linguagem | JavaScript | ES6+ | Lógica completa | Nativo no browser, sem transpile |
| Markup | HTML5 | — | Estrutura semântica | Padrão web, sem framework |
| Estilo | CSS3 | — | Layout e visual | Grid + Flexbox, zero dependência |
| Persistência | localStorage | API nativa | Histórico de operações | Disponível em `file://` sem servidor |
| Parser | Shunting-Yard | — | Avaliação de expressões | Sem `eval()`, precedência correta |
| Build | Nenhum | — | — | Arquivos abertos diretamente |
| Testes | Manual (QA gate) | — | Validação funcional | Sem framework, escopo pequeno |

---

## 4. Estrutura de Arquivos (Definitiva)

```
calculadora/
├── index.html          ← ponto de entrada, toda a estrutura HTML
├── style.css           ← visual, layout, responsividade, dark theme
└── script.js           ← parser + lógica de UI + histórico
```

**Regra:** Nenhum outro arquivo ou subpasta será criado. Sem `node_modules`, sem `package.json`, sem `.gitignore` dentro desta pasta.

---

## 5. Arquitetura do `script.js`

O `script.js` é organizado em **4 módulos lógicos via objetos** (sem ES Modules para compatibilidade com `file://`):

### 5.1 MathParser — Parser de Expressões

Implementa o algoritmo **Shunting-Yard** de Edsger Dijkstra (1961) para transformar expressões infix em notação RPN (Reverse Polish Notation) e avaliá-las com precedência correta.

**Por que Shunting-Yard e não `eval()`?**
- `eval()` executa código JavaScript arbitrário — risco de segurança (XSS)
- Shunting-Yard processa apenas tokens matemáticos reconhecidos — seguro por design
- Permite controle total sobre operadores, funções e precedência

```javascript
const MathParser = {
  // Converte expressão infix → tokens
  tokenize(expression) { ... },

  // Aplica Shunting-Yard: tokens → RPN (fila)
  toRPN(tokens) { ... },

  // Avalia RPN: fila → número resultado
  evalRPN(rpnQueue) { ... },

  // Entry point público
  evaluate(expression) { ... }  // retorna número ou lança Error
};
```

**Operadores suportados e precedência:**

| Operador | Precedência | Associatividade |
|----------|-------------|-----------------|
| `+`, `-` | 1 | Esquerda |
| `*`, `/`, `%` | 2 | Esquerda |
| `^` (potência) | 3 | Direita |
| Funções (`sin`, `cos`, ...) | 4 | — |

### 5.2 ScientificFunctions — Funções Científicas

Encapsula todas as funções matemáticas avançadas com suporte ao modo Graus/Radianos:

```javascript
const ScientificFunctions = {
  mode: 'deg',  // 'deg' | 'rad'

  toRad(x) { return this.mode === 'deg' ? x * Math.PI / 180 : x; },
  fromRad(x) { return this.mode === 'deg' ? x * 180 / Math.PI : x; },

  sin(x)    { return Math.sin(this.toRad(x)); },
  cos(x)    { return Math.cos(this.toRad(x)); },
  tan(x)    { return Math.tan(this.toRad(x)); },
  asin(x)   { return this.fromRad(Math.asin(x)); },
  acos(x)   { return this.fromRad(Math.acos(x)); },
  atan(x)   { return this.fromRad(Math.atan(x)); },
  ln(x)     { return Math.log(x); },
  log(x)    { return Math.log10(x); },
  sqrt(x)   { if (x < 0) throw new Error('√ de negativo'); return Math.sqrt(x); },
  abs(x)    { return Math.abs(x); },
  fact(n)   { /* iterativo para n ≤ 20 */ }
};
```

### 5.3 HistoryManager — Gestão de Histórico

Gerencia a lista de operações com persistência via `localStorage`:

```javascript
const HistoryManager = {
  MAX_ITEMS: 50,
  STORAGE_KEY: 'calculadora_historico',

  load()              { /* lê localStorage, parse JSON */ },
  save(items)         { /* serializa para localStorage */ },
  add(expression, result) { /* prepend + trim a 50 + save */ },
  clear()             { /* esvazia array + localStorage */ },
  getAll()            { /* retorna array */ }
};
```

### 5.4 Calculator — Controlador de UI

Orquestra a interação entre DOM, MathParser, ScientificFunctions e HistoryManager:

```javascript
const Calculator = {
  expression: '',   // string acumulada
  lastResult: null, // último resultado calculado

  init()            { /* bind eventos DOM + restaura histórico */ },
  appendToken(t)    { /* adiciona token à expressão */ },
  calculate()       { /* avalia expressão, atualiza display, adiciona ao histórico */ },
  clear()           { /* limpa expressão */ },
  backspace()       { /* remove último char */ },
  renderHistory()   { /* atualiza DOM do painel de histórico */ },
  handleKeyboard(e) { /* mapeia teclas para ações */ }
};

document.addEventListener('DOMContentLoaded', () => Calculator.init());
```

---

## 6. Arquitetura do `index.html`

Estrutura semântica em duas colunas (desktop) / uma coluna (mobile):

```
<body>
  <div class="app">
    ├── <section class="calculator">
    │     ├── <div class="display">
    │     │     ├── <div class="expression">   ← expressão em construção
    │     │     └── <div class="result">       ← resultado em tempo real
    │     ├── <div class="mode-toggles">       ← Básico/Científico + Graus/Rad
    │     └── <div class="keypad">
    │           ├── <div class="scientific-buttons">  ← ocultos no modo básico
    │           └── <div class="basic-buttons">
    └── <section class="history-panel">
          ├── <div class="history-header">    ← título + botão Limpar
          └── <div class="history-list">      ← itens de histórico (scroll)
```

**Atributos `data-*` nos botões** — permitem binding genérico no JS:
```html
<button data-action="append" data-value="sin(">sin</button>
<button data-action="calculate">   =   </button>
<button data-action="clear">       C   </button>
```

O `Calculator.init()` usa um único event listener delegado no `keypad` para capturar todos os cliques.

---

## 7. Arquitetura do `style.css`

**Sistema de layout:**
- Desktop (≥ 640px): CSS Grid de 2 colunas — calculadora (esq) + histórico (dir)
- Mobile (< 640px): coluna única — calculadora em cima, histórico embaixo

**Variáveis CSS (design tokens):**
```css
:root {
  --bg-primary:    #1a1a2e;   /* fundo principal */
  --bg-secondary:  #16213e;   /* fundo calculadora */
  --bg-button:     #0f3460;   /* botão padrão */
  --accent-blue:   #533483;   /* operadores */
  --accent-orange: #e94560;   /* = e funções especiais */
  --text-primary:  #eaeaea;
  --text-dim:      #888;
  --border-radius: 8px;
  --transition:    0.15s ease;
}
```

**Estados visuais:**
- Botão hover: `brightness(1.2)` via filter
- Toggle ativo (Graus/Rad, Básico/Científico): `var(--accent-blue)` no background
- Display de erro: texto em `var(--accent-orange)`
- Itens do histórico: hover com cursor pointer e highlight sutil

---

## 8. Fluxo de uma Operação (Workflow)

```
Usuário clica "sin" → append "sin(" à expressão
Usuário digita "30" → append "30" à expressão
Usuário clica ")" → append ")" à expressão
Usuário clica "=" →
  Calculator.calculate()
    → MathParser.evaluate("sin(30)")
      → tokenize() → ["sin", "(", "30", ")"]
      → toRPN()    → ["30", "sin"]   (Shunting-Yard)
      → evalRPN()  → ScientificFunctions.sin(30) = 0.5
    → display: "sin(30) = 0.5"
    → HistoryManager.add("sin(30)", 0.5)
    → renderHistory() → atualiza DOM do painel
    → localStorage atualizado
```

---

## 9. Tratamento de Erros

| Situação | Comportamento |
|----------|--------------|
| Divisão por zero | Display: `Erro: divisão por zero` |
| `√` de negativo | Display: `Erro: raiz de número negativo` |
| `log` ou `ln` de ≤ 0 | Display: `Erro: logaritmo indefinido` |
| `n!` com n > 20 | Display: `Erro: máximo 20!` |
| `n!` com n não-inteiro | Display: `Erro: fatorial de inteiros` |
| Expressão malformada | Display: `Erro: expressão inválida` |
| Todos os erros | Estado recuperável — próximo input limpa o erro |

---

## 10. Segurança

- **Sem `eval()`** — o parser Shunting-Yard aceita apenas tokens conhecidos (dígitos, operadores, nomes de funções da whitelist)
- **localStorage** — armazena apenas strings de expressões matemáticas (sem dados sensíveis)
- **Sem requisições de rede** — zero fetch, zero XHR, zero WebSocket
- **Sem input de texto livre** — todos os inputs vêm de botões ou teclas mapeadas explicitamente

---

## 11. Regras de Código (para @dev)

- **Sem `eval()` ou `Function()`** — violação bloqueia QA gate
- **Sem dependências externas** — nenhum `<script src="cdn...">` no HTML
- **Sem ES Modules** (`import`/`export`) — incompatível com `file://` sem servidor
- **Nomes em inglês** — variáveis, funções e classes em inglês descritivo
- **Event delegation** — um único listener no container, não um por botão
- **Sem comentários óbvios** — comentar apenas o "por quê", não o "o quê"

---

## 12. Handoff para @sm e @dev

**@sm:** Criar Story 1.1 com base na estrutura de arquivos definitiva desta arquitetura. O `index.html` deve usar `data-action` e `data-value` nos botões. O `script.js` deve exportar os 4 objetos: `MathParser`, `ScientificFunctions`, `HistoryManager`, `Calculator`.

**@dev:** Implementar na ordem das stories: 1.1 (estrutura) → 1.2 (parser + básico) → 1.3 (científico) → 1.4 (histórico). O parser Shunting-Yard vai na Story 1.2 e é pré-requisito para 1.3 e 1.4.

---

*Gerado por Aria (@architect) — Synkra AIOX — 2026-05-07*
