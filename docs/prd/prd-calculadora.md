# Calculadora Científica com Histórico — Product Requirements Document (PRD)

**Versão:** 1.0
**Data:** 2026-05-07
**Autor:** Morgan (@pm)
**Input:** docs/brief.md (gerado por Atlas @analyst)
**Status:** Draft → aguarda validação @po

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-05-07 | 1.0 | Criação inicial a partir do brief.md | Morgan (@pm) |

---

## 1. Goals and Background Context

### Goals

- Entregar uma calculadora web científica totalmente funcional que roda offline no navegador
- Permitir operações matemáticas básicas e científicas com resultado correto e em tempo real
- Registrar e exibir histórico de operações da sessão com persistência via localStorage
- Empacotar todo o projeto em uma única pasta (`calculadora/`) sem dependências externas
- Servir como projeto de aprendizado completo do ciclo AIOX (Passos 01–08)

### Background Context

Usuários que precisam de uma calculadora científica em ambiente web dependem de ferramentas online que exigem conexão constante e não oferecem histórico de operações visível. Soluções nativas do sistema operacional têm funcionalidade limitada e nenhum registro das contas feitas.

Este projeto entrega uma aplicação web estática e autocontida — aberta com duplo clique no `index.html`, sem instalação, sem servidor, sem framework. O diferencial é a combinação de funções científicas completas com um painel de histórico persistido por sessão, tudo em três arquivos dentro de uma pasta.

---

## 2. Requirements

### Functional Requirements

**Operações Básicas**
- FR-001: A calculadora deve suportar as operações: adição (`+`), subtração (`-`), multiplicação (`×`), divisão (`÷`)
- FR-002: A calculadora deve suportar porcentagem (`%`) calculada sobre o valor atual
- FR-003: O botão `C` deve limpar toda a expressão atual e resetar o display
- FR-004: O botão `CE` (backspace) deve apagar o último caractere digitado

**Funções Científicas**
- FR-005: A calculadora deve suportar potência quadrada (`x²`)
- FR-006: A calculadora deve suportar potência n-ésima (`xⁿ`) com entrada do expoente
- FR-007: A calculadora deve suportar raiz quadrada (`√x`)
- FR-008: A calculadora deve suportar seno (`sin`), cosseno (`cos`) e tangente (`tan`)
- FR-009: A calculadora deve suportar seno inverso (`sin⁻¹`), cosseno inverso (`cos⁻¹`) e tangente inversa (`tan⁻¹`)
- FR-010: A calculadora deve suportar logaritmo natural (`ln`) e logaritmo base 10 (`log`)
- FR-011: A calculadora deve suportar fatorial (`n!`) para inteiros não negativos ≤ 20
- FR-012: A calculadora deve suportar valor absoluto (`|x|`)
- FR-013: A calculadora deve disponibilizar as constantes Pi (`π ≈ 3.14159...`) e Euler (`e ≈ 2.71828...`) como botões inseríveis
- FR-014: A calculadora deve suportar toggle Graus / Radianos para todas as funções trigonométricas

**Interface e Modo de Operação**
- FR-015: O display principal deve mostrar a expressão em construção e o resultado em tempo real (abaixo ou separado)
- FR-016: A calculadora deve ter toggle entre Modo Básico (somente operações básicas visíveis) e Modo Científico (todas as funções visíveis)
- FR-017: O teclado físico deve funcionar para entrada de dígitos (`0–9`), operadores (`+`, `-`, `*`, `/`), ponto decimal (`.`), `Enter` para calcular, `Escape` para limpar e `Backspace` para CE
- FR-018: O parser matemático deve respeitar a precedência correta de operadores (multiplicação e divisão antes de adição e subtração)
- FR-019: Em caso de erro (divisão por zero, raiz de negativo, fatorial de não-inteiro), o display deve mostrar mensagem de erro clara e recuperável

**Histórico de Operações**
- FR-020: Um painel de histórico deve exibir todas as operações realizadas na sessão, no formato `expressão = resultado`
- FR-021: O histórico deve ser persistido via `localStorage` e restaurado ao reabrir a calculadora no mesmo navegador
- FR-022: Ao clicar em qualquer item do histórico, o resultado daquela operação deve ser inserido no display como valor inicial
- FR-023: Um botão "Limpar Histórico" deve apagar todos os itens do histórico e limpar o localStorage
- FR-024: O histórico deve ter um limite máximo de 50 itens; ao ultrapassar, o item mais antigo é removido automaticamente

### Non-Functional Requirements

- NFR-001: A aplicação deve ser completamente autocontida em uma única pasta (`calculadora/`) com exatamente três arquivos: `index.html`, `style.css`, `script.js`
- NFR-002: Nenhuma dependência externa é permitida — sem CDN, sem npm, sem framework, sem biblioteca de terceiros
- NFR-003: A aplicação deve funcionar corretamente aberta via protocolo `file://` (duplo clique no `index.html`) nos navegadores Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- NFR-004: O resultado de todas as operações matemáticas deve ser correto com precisão de ponto flutuante padrão IEEE 754; para exibição, arredondar a no máximo 10 casas decimais
- NFR-005: A interface deve ser responsiva e utilizável em telas a partir de 320px de largura (mobile) até desktop
- NFR-006: O código JavaScript não deve usar `eval()` diretamente — usar parser matemático próprio por segurança
- NFR-007: O tempo de resposta para qualquer cálculo deve ser imperceptível ao usuário (< 50ms)
- NFR-008: O código deve ser legível, com nomes de variáveis e funções em inglês descritivo, sem comentários desnecessários

---

## 3. User Interface Design Goals

### Overall UX Vision

Interface limpa e funcional inspirada em calculadoras científicas físicas (HP/Casio), com layout de grid de botões, painel de display prominente e painel de histórico lateral. Prioridade: clareza e usabilidade, não decoração.

### Key Interaction Paradigms

- Click em botão ou tecla física → atualiza display em tempo real
- `=` ou `Enter` → calcula e adiciona ao histórico
- Toggle de modo (Básico/Científico) → mostra/oculta botões científicos com transição suave
- Toggle de unidade (Graus/Radianos) → destaque visual no botão ativo

### Core Screens and Views

1. **Tela Principal** — Display + Grade de Botões (Básico ou Científico)
2. **Painel de Histórico** — Lista lateral (desktop) ou inferior (mobile) de operações

### Accessibility

WCAG AA básico: contraste adequado, navegação por teclado funcional, labels nos botões.

### Branding

Sem branding corporativo. Estilo: dark theme moderno, fonte monoespaçada no display, botões com bordas arredondadas. Cores: fundo escuro (`#1a1a2e`), botões cinza-escuro, botões de operador em azul/laranja para destaque.

### Target Device and Platforms

Web Responsivo — funciona em desktop e mobile via `file://` ou servidor local.

---

## 4. Technical Assumptions

### Repository Structure

Monorepo (pasta única) — não se aplica conceito de multi-repo para este projeto.

### Service Architecture

Aplicação estática de arquivo único sem servidor. Três arquivos, zero build steps:
- `index.html` — estrutura HTML5 semântica
- `style.css` — layout CSS Grid/Flexbox, responsivo, dark theme
- `script.js` — parser matemático + lógica de UI + gestão de histórico (localStorage)

### Testing Requirements

Testes manuais (QA gate pelo @qa). Sem framework de testes automatizados neste MVP — o @qa validará manualmente cada FR via checklist.

### Additional Technical Assumptions

- O parser matemático implementará um algoritmo de Shunting-Yard para avaliar expressões com precedência correta
- `localStorage` será usado com a chave `calculadora_historico` (array JSON serializado)
- Sem uso de `eval()`, `Function()`, ou qualquer execução dinâmica de código por segurança
- O script.js será estruturado em módulos lógicos via objetos/funções nomeadas (sem ES Modules para compatibilidade com `file://`)

---

## 5. Epic List

### Epic 1: Calculadora Científica com Histórico (Completo)

**Goal:** Entregar a aplicação completa e funcional — parser matemático, interface científica, histórico persistido — em uma única pasta, pronta para abrir no navegador.

> **Nota do Morgan:** Para este projeto, um único epic é suficiente e correto. A calculadora é uma unidade coesa de valor — não faz sentido entregar "operações básicas" sem o histórico ou sem as funções científicas. O Epic 1 entrega o produto inteiro em um ciclo.

---

## 6. Epic 1 — Stories

### Story 1.1: Setup do Projeto e Estrutura Base

**Como** usuário,
**quero** abrir o `index.html` no navegador e ver a estrutura da calculadora carregada,
**para que** eu tenha a base visual e técnica sobre a qual todas as features serão construídas.

**Acceptance Criteria:**
1. A pasta `calculadora/` existe com os três arquivos: `index.html`, `style.css`, `script.js`
2. O `index.html` carrega sem erros no console do navegador
3. O display principal é visível com área para expressão e resultado
4. A grade de botões numéricos (0–9) e operadores básicos (+, -, ×, ÷, =, C, CE) está renderizada
5. O painel de histórico (vazio) está visível na interface
6. O layout é responsivo e utilizável em 320px e 1280px de largura

### Story 1.2: Parser Matemático e Operações Básicas

**Como** usuário,
**quero** digitar expressões matemáticas básicas e obter o resultado correto ao pressionar `=`,
**para que** eu possa realizar cálculos do dia a dia com confiança.

**Acceptance Criteria:**
1. Operações `+`, `-`, `×`, `÷` funcionam corretamente com números inteiros e decimais
2. A precedência de operadores é respeitada (ex: `2 + 3 × 4 = 14`, não `20`)
3. O botão `%` calcula a porcentagem sobre o valor atual (ex: `200 × 15% = 30`)
4. O botão `C` limpa tudo; `CE` apaga o último caractere
5. Divisão por zero exibe mensagem `Erro: divisão por zero` no display (recuperável)
6. O teclado físico funciona: dígitos, `+`, `-`, `*`, `/`, `.`, `Enter`, `Backspace`, `Escape`
7. O resultado é exibido com no máximo 10 casas decimais (sem trailing zeros)

### Story 1.3: Funções Científicas

**Como** usuário,
**quero** usar funções trigonométricas, logarítmicas e outras funções científicas,
**para que** eu possa resolver problemas matemáticos mais complexos.

**Acceptance Criteria:**
1. Botões `sin`, `cos`, `tan` calculam corretamente em Graus (padrão) e Radianos
2. Botões `sin⁻¹`, `cos⁻¹`, `tan⁻¹` (funções inversas) calculam corretamente
3. Toggle Graus/Radianos muda o modo com destaque visual no botão ativo
4. Botões `ln` e `log` calculam logaritmo natural e base 10 corretamente
5. Botão `n!` calcula fatorial para inteiros 0–20; exibe erro para outros valores
6. Botão `x²` eleva ao quadrado; `xⁿ` solicita o expoente e calcula
7. Botão `√` calcula raiz quadrada; exibe erro para números negativos
8. Botão `|x|` retorna o valor absoluto
9. Botões `π` e `e` inserem as constantes no display
10. Toggle Básico/Científico mostra/oculta os botões científicos corretamente

### Story 1.4: Histórico de Operações

**Como** usuário,
**quero** ver um histórico das minhas operações e reutilizar resultados anteriores,
**para que** eu possa acompanhar meus cálculos e não precisar redigitar valores.

**Acceptance Criteria:**
1. Cada operação calculada (`=` ou `Enter`) é adicionada ao painel de histórico no formato `expressão = resultado`
2. O histórico é salvo no `localStorage` com a chave `calculadora_historico`
3. Ao reabrir a calculadora no mesmo navegador, o histórico é restaurado automaticamente
4. Clicar em qualquer item do histórico insere o resultado daquela operação no display
5. O botão "Limpar Histórico" apaga todos os itens e limpa o localStorage
6. O histórico limita-se a 50 itens; ao ultrapassar, o item mais antigo é removido
7. O painel de histórico tem scroll quando há mais itens do que cabem na tela

---

## 7. Checklist Results

> A ser preenchido pelo @pm após revisão do documento completo.

- [x] Goals estão claros e mensuráveis
- [x] Todos os FRs são rastreáveis ao brief.md
- [x] NFRs endereçam portabilidade, segurança e performance
- [x] Stories estão sequenciadas logicamente (1.1 base → 1.2 parser → 1.3 científico → 1.4 histórico)
- [x] Cada story é completável por um agente em uma sessão
- [x] Nenhum requisito inventado (Article IV — No Invention)

---

## 8. Next Steps

### Architect Prompt

`@architect` — PRD pronto em `docs/prd/prd-calculadora.md`. Stack definida: HTML/CSS/JS vanilla, pasta única `calculadora/`, sem dependências externas. Execute `*assess-complexity` e `*create-full-stack-architecture` para gerar `docs/architecture/architecture.md` com decisões técnicas detalhadas (parser Shunting-Yard, estrutura de módulos JS, layout CSS Grid).

### SM Prompt

`@sm` — Após arquitetura aprovada, execute `*draft` para criar `docs/stories/1.1.story.md` baseado na Story 1.1 deste PRD.

---

*Gerado por Morgan (@pm) — Synkra AIOX — 2026-05-07*
