# Calculadora Científica com Histórico

Uma calculadora web científica com histórico de operações persistido, construída ponta a ponta com o framework **Synkra AIOX** em 20 passos do Story Development Cycle.

> Abre com duplo clique no `index.html` — sem instalação, sem servidor, funciona offline.

---

## Como usar

```
1. Baixe ou clone este repositório
2. Abra a pasta calculadora/
3. Dê duplo clique em index.html
4. Pronto — a calculadora abre no navegador
```

---

## Funcionalidades

### Operações básicas
- Adição, subtração, multiplicação e divisão
- Porcentagem (`%`)
- Potenciação (`xⁿ`) e quadrado (`x²`)
- Botão `C` (limpar tudo) e `⌫` (apagar último caractere)

### Funções científicas
- Trigonometria: `sin`, `cos`, `tan` e inversas (`asin`, `acos`, `atan`)
- Toggle **Graus / Radianos** para funções trigonométricas
- Logaritmos: `ln` (natural) e `log` (base 10)
- Raiz quadrada (`√`), valor absoluto (`|x|`) e fatorial (`n!`)
- Constantes `π` e `e`
- Toggle **Básico / Científico** — oculta funções avançadas quando não precisar

### Histórico de operações
- Painel lateral com todos os cálculos realizados
- Persiste entre sessões via `localStorage` — sobrevive ao F5 e ao fechar o navegador
- Clique em qualquer item do histórico para reutilizar a expressão
- Botão **Limpar Histórico** apaga tudo
- Limite de 50 itens (o mais antigo é removido automaticamente)

### Teclado físico
- Dígitos `0–9`, operadores `+ - * / ^ %`
- `Enter` para calcular, `Escape` para limpar, `Backspace` para apagar

---

## Stack

| Tecnologia | Uso |
|-----------|-----|
| HTML5 | Estrutura semântica |
| CSS3 | Layout Grid/Flexbox, tema Ice Glassmorphism |
| JavaScript ES6+ | Parser matemático + lógica de UI + histórico |
| localStorage | Persistência do histórico |

**Zero dependências externas.** Sem npm, sem framework, sem build step.

---

## Estrutura do projeto

```
calculadora/
├── index.html    ← estrutura completa da UI
├── style.css     ← tema Ice Glassmorphism, layout responsivo
├── script.js     ← 4 módulos: MathParser, ScientificFunctions,
│                              HistoryManager, Calculator
└── equals.jpg    ← botão = customizado

docs/
├── brief.md                     ← Passo 01 — ideação (@analyst)
├── prd/prd-calculadora.md       ← Passo 02 — requisitos (@pm)
├── prd/epic-1-calculadora.md    ← Passo 02 — epic (@pm)
├── architecture/architecture.md ← Passo 03 — arquitetura (@architect)
├── stories/1.1.story.md         ← estrutura base — Done ✅
├── stories/1.2.story.md         ← parser + básico — Done ✅
├── stories/1.3.story.md         ← funções científicas — Done ✅
├── stories/1.4.story.md         ← histórico localStorage — Done ✅
└── jornada-completa.md          ← documentação didática dos 20 passos
```

---

## Arquitetura técnica

O `script.js` é organizado em 4 objetos com responsabilidades separadas:

| Objeto | Responsabilidade |
|--------|----------------|
| `MathParser` | Algoritmo Shunting-Yard: converte expressão → RPN → resultado |
| `ScientificFunctions` | Funções matemáticas avançadas com suporte DEG/RAD |
| `HistoryManager` | Persistência via localStorage (stateless, max 50 itens) |
| `Calculator` | Controlador de UI: eventos, display, toggles |

O parser usa o algoritmo **Shunting-Yard** (Dijkstra, 1961) — sem `eval()`, sem execução de código arbitrário, seguro por design.

---

## Processo de desenvolvimento

Projeto construído com o framework **Synkra AIOX** em 20 passos:

| Fase | Passos | Agentes |
|------|--------|---------|
| Planejamento | 01–03 | @analyst → @pm → @architect |
| Story 1.1 — Estrutura base | 04–07 | @sm → @po → @dev → @qa |
| Story 1.2 — Parser + básico | 08–11 | @sm → @po → @dev → @qa |
| Story 1.3 — Funções científicas | 12–15 | @sm → @po → @dev → @qa |
| Story 1.4 — Histórico | 16–19 | @sm → @po → @dev → @qa |
| Entrega | 20 | @devops |

Todas as 4 stories passaram pelo **QA Gate** com veredicto **PASS**.

---

## Tratamento de erros

| Situação | Mensagem exibida |
|----------|----------------|
| Divisão por zero | `Erro: divisão por zero` |
| Raiz de negativo | `Erro: raiz de número negativo` |
| log ou ln de ≤ 0 | `Erro: logaritmo indefinido` |
| Fatorial > 20 | `Erro: máximo 20!` |
| Fatorial de não-inteiro | `Erro: fatorial de inteiros` |
| Expressão inválida | `Erro: expressão inválida` |

Todos os erros são recuperáveis — o próximo input limpa o estado automaticamente.

---

*Construído com [Synkra AIOX](https://github.com/synkra/aiox) · [Claude Code](https://claude.ai/claude-code)*
