# A Jornada Completa — Calculadora Científica com Histórico

**Projeto:** Calculadora Científica com Histórico de Operações
**Framework utilizado:** Synkra AIOX
**Data:** 2026-05-07
**Documento gerado por:** Claude Sonnet 4.6

> Este documento conta a história completa do projeto — do zero à entrega —
> explicando cada etapa, cada decisão técnica e cada "por quê" em linguagem
> acessível para quem está aprendendo.

---

## Antes de começar: o que é o AIOX?

Antes de entrar nos passos, é importante entender o "palco" onde tudo acontece.

**AIOX** (AI-Orchestrated System) é um framework de desenvolvimento que usa **agentes de IA especializados** para construir software de forma organizada. Em vez de você (ou um único desenvolvedor) fazer tudo sozinho, o AIOX divide o trabalho entre diferentes "especialistas", cada um com uma função bem definida.

Pense assim: é como uma empresa de construção civil. Existe o arquiteto (que desenha o projeto), o engenheiro (que verifica a viabilidade), o pedreiro (que constrói), o fiscal de obras (que inspeciona), e o gerente (que coordena tudo). Cada um faz a sua parte, na ordem certa, e o resultado é mais sólido do que se uma pessoa só fizesse tudo.

No AIOX, esses "especialistas" são agentes de IA com personas e responsabilidades específicas:

| Agente | Nome | Função |
|--------|------|--------|
| `@analyst` | Alex | Pesquisa e ideação inicial |
| `@pm` | Morgan | Gerente de produto — define requisitos |
| `@architect` | Aria | Arquiteto — decide como o sistema vai funcionar tecnicamente |
| `@po` | Pax | Product Owner — valida se as tarefas estão bem definidas |
| `@sm` | River | Scrum Master — escreve as tarefas de desenvolvimento |
| `@dev` | Dex | Desenvolvedor — escreve o código |
| `@qa` | Quinn | Controle de qualidade — testa e aprova |
| `@devops` | Gage | Infraestrutura e entrega — git, commits, deploys |

O processo segue o **Story Development Cycle (SDC)** — um ciclo de 4 fases que se repete para cada funcionalidade:

```
Criar story → Validar story → Implementar → QA Gate
```

Neste projeto, passamos por esse ciclo **4 vezes** (uma por story/funcionalidade), precedidas por uma fase de planejamento. Total: **20 passos**.

---

## O Projeto em uma Frase

Uma **calculadora científica** que roda direto no navegador (sem instalar nada), com histórico de operações que **persiste entre sessões** — tudo em 3 arquivos dentro de uma pasta.

---

## FASE DE PLANEJAMENTO (Passos 01–03)

### Passo 01 — @analyst: "Qual é o problema que queremos resolver?"

**Quem faz:** Alex (@analyst)
**O que produz:** `docs/brief.md`

O primeiro passo de qualquer projeto é entender **por que ele deve existir**. O @analyst (Alex) não escreve código — ele pesquisa, questiona e estrutura o problema.

**Por que começar assim?**

Porque é muito fácil começar a construir algo sem saber exatamente o que está construindo. Você chega na metade e descobre que tomou decisões erradas no começo, e aí tem que refazer tudo.

Alex fez o seguinte levantamento:

**Problema identificado:**
- Calculadoras científicas online exigem internet
- Calculadoras nativas do sistema operacional não têm histórico visível de operações
- Quando você fecha e reabre, perdeu tudo que calculou

**Solução proposta:**
- Uma pasta com 3 arquivos (HTML + CSS + JS)
- Abre com duplo clique no `index.html`
- Sem instalação, sem internet, sem servidor
- Histórico que sobrevive ao F5 (fechar e abrir o navegador)

**Decisões tomadas neste passo:**

Alex mapeou todas as funcionalidades possíveis e as classificou por prioridade:

- **MUST** (obrigatório): operações básicas, funções científicas, histórico, toggle básico/científico
- **SHOULD** (importante): teclado físico, layout responsivo, persistência via localStorage
- **COULD** (seria bom ter): exportar histórico, tema claro/escuro
- **WON'T** (fora do escopo agora): gráficos de funções, múltiplas memórias

> **Por que classificar assim?**
> Porque sem uma lista de prioridades, o projeto nunca termina. Sempre tem "mais uma coisa" para adicionar. O AIOX tem o princípio **"No Invention"** — nada além do que está no escopo é implementado.

---

### Passo 02 — @pm: "Quais são os requisitos formais?"

**Quem faz:** Morgan (@pm)
**O que produz:** `docs/prd/prd-calculadora.md` + `docs/prd/epic-1-calculadora.md`

O @pm (Morgan) pega o brief do Alex e o transforma em um **PRD — Product Requirements Document**. É o documento mais importante do projeto: tudo que for implementado precisa estar aqui.

**Por que um PRD separado do brief?**

O brief é informal — é o pensamento inicial, a ideia. O PRD é formal — são requisitos numerados, rastreáveis. Cada funcionalidade recebe um código (`FR-001`, `FR-002`...) para que, no futuro, você possa dizer "esse código implementa o FR-008" e saiba exatamente de onde veio.

Morgan organizou os requisitos em três categorias:

**Functional Requirements (FR) — O que o sistema faz:**
- FR-001 a FR-004: operações básicas (+, -, ×, ÷, %)
- FR-005 a FR-014: funções científicas (sin, cos, log, √, etc.)
- FR-015 a FR-019: interface e modo de operação
- FR-020 a FR-024: histórico de operações

**Non-Functional Requirements (NFR) — Como o sistema se comporta:**
- NFR-001: tudo em uma pasta, 3 arquivos
- NFR-002: zero dependências externas
- NFR-003: funciona via `file://` (duplo clique)
- NFR-006: **sem `eval()`** — parser próprio por segurança

> **Por que proibir o `eval()`?**
> O `eval()` é uma função do JavaScript que executa qualquer texto como código.
> Se alguém digitar `eval("deletar_seus_arquivos()")` na calculadora, o `eval()` executaria isso.
> Com um parser próprio, só tokens matemáticos reconhecidos são aceitos — é muito mais seguro.

Morgan também dividiu o trabalho em **4 stories** (funcionalidades sequenciais):
- Story 1.1 — Estrutura base (HTML + CSS)
- Story 1.2 — Parser matemático + operações básicas
- Story 1.3 — Funções científicas
- Story 1.4 — Histórico de operações

> **Por que nessa ordem?**
> Cada story depende da anterior. Você não pode implementar o histórico sem ter o parser. Não pode ter as funções científicas sem ter a estrutura visual. A sequência é o caminho mais seguro.

---

### Passo 03 — @architect: "Como vamos construir isso tecnicamente?"

**Quem faz:** Aria (@architect)
**O que produz:** `docs/architecture/architecture.md`

O @architect não escreve código — ele decide **como** o código vai ser estruturado antes que qualquer linha seja escrita. É o equivalente ao arquiteto que faz a planta da casa antes de comprar os tijolos.

**A primeira coisa que Aria fez: avaliar a complexidade**

O AIOX tem um sistema de avaliação em 5 dimensões (score de 1 a 5 cada):

| Dimensão | Score | Por quê |
|----------|-------|---------|
| Escopo | 1 | 3 arquivos, 1 pasta |
| Integração | 1 | Zero APIs externas |
| Infraestrutura | 1 | Abre via duplo clique |
| Conhecimento | 2 | O parser tem alguma complexidade |
| Risco | 1 | Sem dados sensíveis, sem autenticação |
| **Total** | **6** | **Classe SIMPLE** |

Com score 6, o projeto é classificado como **SIMPLE** — não precisa de fases extras de pesquisa ou revisão de spec. Pode ir direto para o desenvolvimento.

**As grandes decisões arquiteturais:**

**1. Sem ES Modules (`import`/`export`)**

JavaScript moderno usa `import` e `export` para separar arquivos. Mas quando você abre um arquivo HTML com duplo clique (protocolo `file://`), o navegador bloqueia esse tipo de import por segurança. Por isso, o código foi estruturado em **objetos dentro de um único arquivo** — sem imports, sem exports, mas ainda organizado.

**2. Quatro objetos com responsabilidades separadas:**

```
MathParser        — só sabe avaliar expressões matemáticas
ScientificFunctions — só sabe calcular sin, cos, log, etc.
HistoryManager    — só sabe salvar/carregar/limpar o histórico
Calculator        — só sabe controlar a interface (botões, display)
```

> **Por que separar assim?**
> Porque cada objeto pode ser desenvolvido, testado e modificado de forma independente.
> Se o histórico quebrar, você sabe que o problema está no `HistoryManager` — não precisa
> varrer o arquivo inteiro procurando o bug.

**3. O algoritmo Shunting-Yard para o parser**

Este foi o ponto mais complexo do projeto. Como calcular `2 + 3 × 4` e obter `14` (e não `20`)?

Qualquer calculadora precisa respeitar a precedência de operadores (multiplicação antes de adição). O algoritmo **Shunting-Yard**, criado por Edsger Dijkstra em 1961, resolve isso de forma elegante:

- Passo 1: converte a expressão em tokens (pedaços): `[2, +, 3, ×, 4]`
- Passo 2: reorganiza em **RPN** (Notação Polonesa Reversa): `[2, 3, 4, ×, +]`
- Passo 3: avalia a RPN usando uma pilha: `3 × 4 = 12`, `12 + 2 = 14` ✓

> **RPN é a notação usada em calculadoras HP antigas.** É uma forma de escrever
> expressões sem precisar de parênteses, e os computadores adoram porque é
> muito fácil de avaliar com uma pilha.

**4. O HistoryManager começaria como stub**

Aria decidiu que o `HistoryManager` seria implementado na Story 1.4, mas que as Stories 1.2 e 1.3 precisariam que ele existisse (mesmo sem fazer nada) para não quebrar o código.

Por isso, o `HistoryManager` foi criado com **métodos vazios** (stubs) — a estrutura está lá, mas sem implementação real. Isso é um padrão de desenvolvimento chamado "stub": você cria a interface antes de criar o comportamento.

---

## STORY 1.1 — ESTRUTURA BASE (Passos 04–07)

### Passo 04 — @sm: Escreve a Story 1.1

**Quem faz:** River (@sm)
**O que produz:** `docs/stories/1.1.story.md`

O @sm (River) escreve a **story** — o documento que define exatamente o que o @dev vai implementar. Uma story tem:

- **User story:** "Como [usuário], quero [funcionalidade], para que [benefício]"
- **Acceptance Criteria:** lista de verificações objetivas ("passa" ou "falha")
- **Tasks:** subtarefas técnicas para o @dev seguir
- **Dev Notes:** informações técnicas relevantes

**Por que tanto formalismo para escrever uma tarefa?**

Porque quando o @dev começa a implementar, ele não pode parar para fazer perguntas (no modo YOLO/autônomo). Tudo que ele precisa saber tem que estar no documento. Uma story mal escrita gera código errado.

---

### Passo 05 — @po: Valida a Story 1.1 (GO/NO-GO)

**Quem faz:** Pax (@po)
**O que faz:** aplica o checklist de 10 pontos

O @po (Pax) atua como um "porteiro" — antes do @dev escrever uma linha de código, a story precisa ser aprovada.

**O checklist de 10 pontos do @po:**

1. Título claro e objetivo?
2. Descrição completa (problema/necessidade explicados)?
3. Critérios de aceite testáveis?
4. Escopo bem definido (o que está DENTRO e FORA)?
5. Dependências mapeadas?
6. Estimativa de complexidade?
7. Valor de negócio claro?
8. Riscos documentados?
9. Definição de "pronto" (Definition of Done)?
10. Alinhado com o PRD/Epic?

**Regra:** se ≥ 7 pontos passarem → **GO** (status muda para `Ready`, @dev pode começar). Se < 7 → **NO-GO** (volta para o @sm corrigir).

> **Por que essa validação existe?**
> Porque é muito mais barato corrigir um documento do que corrigir código já escrito.
> Identificar um problema na story leva segundos. Identificar o mesmo problema no código
> pode levar horas.

---

### Passo 06 — @dev: Implementa a Story 1.1

**Quem faz:** Dex (@dev)
**O que produz:** `calculadora/index.html`, `calculadora/style.css`, `calculadora/script.js`

O @dev lê a story aprovada e implementa. Para a Story 1.1, o trabalho foi:

**`index.html`** — estrutura semântica com:
- Display (área de expressão + resultado)
- Grade de botões com atributos `data-action` e `data-value`
- Painel de histórico lateral
- Event binding centralizado (um listener para todos os botões)

> **Por que `data-action` nos botões?**
> Em vez de colocar código JavaScript em cada botão (`onclick="calcular()"`), os botões
> apenas declaram o que são (`data-action="calculate"`), e um único listener no container
> captura todos os cliques. Isso se chama **event delegation** — é mais eficiente e mais
> fácil de manter.

**`style.css`** — visual Ice Glassmorphism (tema escuro translúcido) com:
- Layout CSS Grid de 2 colunas no desktop
- Layout de coluna única no mobile (< 640px)
- Variáveis CSS para todas as cores (fácil de mudar o tema depois)

**`script.js`** — estrutura inicial dos 4 objetos (alguns ainda vazios/stub):
- `MathParser` — esqueleto das funções
- `ScientificFunctions` — esqueleto
- `HistoryManager` — stub completo (métodos vazios)
- `Calculator` — lógica básica de UI

---

### Passo 07 — @qa: QA Gate da Story 1.1

**Quem faz:** Quinn (@qa)
**Veredicto:** PASS / CONCERNS / FAIL / WAIVED

O @qa aplica 7 checks de qualidade e abre a calculadora no navegador para testar manualmente cada Acceptance Criteria.

**Os 7 checks do QA Gate:**

1. **Revisão de código** — padrões, legibilidade
2. **Testes unitários** — cobertura adequada
3. **Acceptance criteria** — todos os ACs atendidos?
4. **Sem regressões** — o que funcionava antes ainda funciona?
5. **Performance** — tempo de resposta aceitável?
6. **Segurança** — OWASP basics verificados?
7. **Documentação** — atualizada?

> **Por que o @qa existe separado do @dev?**
> Porque o desenvolvedor que escreveu o código tem "cegueira cognitiva" — ele sabe
> o que o código deveria fazer e inconscientemente testa só os casos que funcionam.
> Um QA independente testa os casos que podem quebrar.

Status da story 1.1 após o gate: **Done** ✓

---

## STORY 1.2 — PARSER MATEMÁTICO + BÁSICO (Passos 08–11)

### Por que uma story separada para o parser?

O parser é a parte mais complexa do projeto. Separar em uma story própria permite:
- Focar toda a atenção nessa complexidade específica
- Testar o parser isoladamente antes de adicionar funções científicas
- Se algo der errado, o problema está circunscrito a esta story

### O que foi implementado:

**`MathParser.tokenize()`** — converte a string em tokens:
- `"2 + 3 × 4"` → `[{number: 2}, {operator: +}, {number: 3}, {operator: ×}, {number: 4}]`
- Casos especiais: sinal negativo no início (`-5`), constantes `PI` e `E`

**`MathParser.toRPN()`** — aplica o Shunting-Yard:
- Lê os tokens da esquerda para a direita
- Usa uma pilha de operadores para reorganizar por precedência
- Resultado: fila RPN pronta para avaliação

**`MathParser.evalRPN()`** — avalia a fila RPN:
- Para cada número: empilha
- Para cada operador: desempilha 2 números, opera, reempilha o resultado
- No final, a pilha tem um único número: o resultado

**Decisão importante:** arredondamento de ponto flutuante

JavaScript tem um problema famoso: `0.1 + 0.2 = 0.30000000000000004`. Isso acontece porque computadores usam binário, e alguns números decimais não têm representação exata em binário.

A solução foi `parseFloat(result.toPrecision(10))` — arredonda para 10 dígitos significativos, eliminando o lixo de ponto flutuante sem perder precisão real.

**Veredicto QA:** PASS ✓

---

## STORY 1.3 — FUNÇÕES CIENTÍFICAS (Passos 12–15)

### O que foi implementado:

**`ScientificFunctions.apply(fn, x)`** — um método único que recebe o nome da função e o argumento já avaliado:

```javascript
apply('sin', 30)   // → 0.5 (em modo DEG)
apply('log', 100)  // → 2
apply('fact', 5)   // → 120
```

**Conversão Graus ↔ Radianos:**

JavaScript calcula trigonometria em radianos. Mas humanos pensam em graus. A solução:
- `sin(30°)` no modo DEG → converter para radianos primeiro: `30 × π/180 = 0.5236`
- `Math.sin(0.5236) = 0.5` ✓

**Validações de erro em cada função:**
- `sqrt(-1)` → `Erro: raiz de número negativo`
- `log(0)` → `Erro: logaritmo indefinido`
- `fact(21)` → `Erro: máximo 20!`
- `fact(2.5)` → `Erro: fatorial de inteiros`

> **Por que limitar fatorial a 20?**
> `20! = 2.432.902.008.176.640.000` — já está no limite de números inteiros JavaScript.
> `21!` ultrapassa e perde precisão. É melhor dar um erro claro do que retornar um número errado.

**Por que o `ScientificFunctions.apply()` recebe o valor já calculado?**

O `MathParser.evalRPN()` já avalia os argumentos antes de chamar as funções. Então quando você digita `sin(30)`, o fluxo é:

```
tokenize("sin(30)") → [sin, (, 30, )]
toRPN(...)          → [30, sin]   ← Shunting-Yard
evalRPN(...)        → empilha 30, aplica sin → ScientificFunctions.apply('sin', 30)
```

A função já recebe `30` (número), não `"sin(30"` (string).

**Veredicto QA:** PASS ✓

---

## STORY 1.4 — HISTÓRICO DE OPERAÇÕES (Passos 16–19)

### A situação antes da Story 1.4

O `HistoryManager` existia desde a Story 1.1, mas com **métodos stub** (vazios):

```javascript
// Como estava:
load()                    { return []; },  // sempre retorna vazio
save(items)               { },             // não faz nada
add(expression, result)   { },             // não faz nada
clear()                   { },             // não faz nada
getAll()                  { return []; }   // sempre retorna vazio
```

O `Calculator.renderHistory()` já existia e funcionava — mas como `getAll()` sempre retornava `[]`, o painel ficava sempre mostrando "Nenhum cálculo ainda".

### Por que o stub foi criado antes da implementação?

Porque o `Calculator.calculate()` já chamava `HistoryManager.add()`:

```javascript
if (!isError) {
  HistoryManager.add(this.expression, raw);
  this.renderHistory();
}
```

Se o `HistoryManager` não existisse, esse código quebraria. Com o stub, o código roda sem erros — simplesmente não persiste nada. Isso é chamado de **graceful degradation**: o sistema funciona de forma reduzida em vez de quebrar.

### O que foi implementado:

**`load()`** — lê o localStorage:

```javascript
load() {
  try {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
```

Dois casos de falha tratados:
1. Chave não existe → `getItem()` retorna `null` → ternário retorna `[]`
2. JSON corrompido → `JSON.parse()` lança exceção → `catch` retorna `[]`

**`save(items)`** — salva no localStorage:

```javascript
save(items) {
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
}
```

**`add(expression, result)`** — adiciona ao início (mais recente primeiro):

```javascript
add(expression, result) {
  const items = this.load();
  items.unshift({ expression, result });
  this.save(items.slice(0, this.MAX_ITEMS));
}
```

> **Por que `unshift` e não `push`?**
> `push` adiciona ao final. `unshift` adiciona ao início.
> Queremos que o cálculo mais recente apareça no topo do histórico,
> então inserimos no início do array.

> **Por que `slice(0, 50)` e não verificar com `if`?**
> `slice(0, 50)` simplesmente pega os primeiros 50 elementos.
> Se o array tem 30, retorna os 30. Se tem 51, descarta o 51º.
> Uma linha resolve o limite de forma elegante.

**`clear()`** — apaga a chave inteira do localStorage:

```javascript
clear() {
  localStorage.removeItem(this.STORAGE_KEY);
}
```

> **Por que `removeItem` e não `setItem` com array vazio?**
> `removeItem` apaga a chave completamente. Se usássemos `setItem('[]')`,
> a chave continuaria existindo com valor `"[]"`. Ambos funcionam, mas
> `removeItem` é mais limpo — é como se nunca tivesse existido.

**`getAll()`** — retorna todos os itens:

```javascript
getAll() {
  return this.load();
}
```

> **Por que não guardar o array em memória?**
> Uma decisão arquitetural importante: o `HistoryManager` é **stateless** — ele não
> guarda o array em uma variável interna. Cada operação lê e escreve diretamente no
> localStorage. Isso elimina o risco de o array em memória ficar desatualizado em
> relação ao que está salvo. Com 50 itens pequenos, o custo de performance é zero.

**Restauração ao abrir:**

Uma linha adicionada ao final do `Calculator.init()`:

```javascript
this.renderHistory();
```

Quando a calculadora abre, `init()` é chamado. Essa linha dispara `renderHistory()`, que chama `getAll()`, que chama `load()`, que lê o localStorage. Se houver histórico salvo, aparece imediatamente.

**Veredicto QA:** PASS ✓

---

## Passo 20 — @devops: Entrega Final

**Quem faz:** Gage (@devops)
**Por que o @devops é exclusivo para git push?**

O AIOX tem uma regra rígida: **somente o @devops pode fazer `git push` e criar PRs**.

Isso parece exagerado, mas faz sentido em projetos maiores:
- Evita que desenvolvedores façam push direto em branch protegida
- Centraliza o controle de versão em um agente responsável
- Garante que o código só sai após aprovação do QA gate

Neste projeto, o @devops fez:

1. `git init` — criou o repositório local
2. Criou `.gitignore` — excluiu arquivos desnecessários (`.aiox/`, `.env`)
3. `git add calculadora/ docs/ .gitignore` — staged apenas os arquivos do projeto
4. `git commit` — commit inicial com mensagem convencional

**O que ficou fora do commit?**

Os diretórios `.aiox-core/`, `.claude/`, `.cursor/` — são arquivos do framework AIOX, não do projeto. Eles ficam na máquina de desenvolvimento mas não fazem parte do código-fonte da calculadora.

**Commit final:**
```
feat: calculadora científica com histórico — Epic 1 completo

Story 1.1: estrutura HTML/CSS (Ice Glassmorphism, layout 2 colunas)
Story 1.2: MathParser Shunting-Yard + operações básicas
Story 1.3: ScientificFunctions (sin/cos/tan/log/sqrt/abs/fact + DEG/RAD)
Story 1.4: HistoryManager com persistência via localStorage (máx 50 itens)
```

---

## Visão Geral do Código Final

### Como os 4 objetos conversam entre si

```
Usuário clica "sin" → Calculator.append("sin(")
Usuário clica "30"  → Calculator.append("30")
Usuário clica ")"   → Calculator.append(")")
Usuário clica "="   → Calculator.calculate()
                         ↓
                      MathParser.evaluate("sin(30)")
                         ↓
                      tokenize() → [sin, (, 30, )]
                      toRPN()    → [30, sin]
                      evalRPN()  → ScientificFunctions.apply('sin', 30)
                                   → 0.5
                         ↓
                      display: "0.5"
                      HistoryManager.add("sin(30)", 0.5)
                         ↓
                      localStorage: [{"expression":"sin(30)","result":0.5}]
                      Calculator.renderHistory() → atualiza o painel
```

### O arquivo `script.js` final (estrutura)

```
MathParser
├── tokenize(expression)  → tokens[]
├── toRPN(tokens)         → rpnQueue[]
├── evalRPN(rpnQueue)     → number
└── evaluate(expression)  → number | "Erro: ..."

ScientificFunctions
├── mode: 'deg' | 'rad'
├── toRad(x) / fromRad(x)
└── apply(fn, x)          → number (ou lança Error)

HistoryManager
├── MAX_ITEMS: 50
├── STORAGE_KEY: 'calculadora_historico'
├── load()                → items[]
├── save(items)           → void
├── add(expr, result)     → void
├── clear()               → void
└── getAll()              → items[]

Calculator
├── expression: string
├── lastResult: number
├── hasError: boolean
├── init()
├── handleAction(action, value)
├── append(token)
├── calculate()
├── clear() / backspace()
├── updateDisplay()
├── renderHistory()
├── toggleMode() / toggleAngle()
├── clearHistory()
└── handleKeyboard(e)
```

---

## As Decisões Mais Importantes (e Por Quê)

### 1. Sem `eval()` → Shunting-Yard

`eval("2+3")` funciona, mas executa qualquer código. Shunting-Yard só processa tokens matemáticos conhecidos. Mais seguro, mais correto, mais educativo.

### 2. Sem ES Modules → objetos em arquivo único

`import/export` não funciona com `file://`. Objetos em arquivo único resolvem isso sem perder organização.

### 3. Sem estado em memória no HistoryManager → localStorage direto

Elimina o risco de dessincronização entre memória e disco. Simples e confiável.

### 4. Stubs antes da implementação real

Permite que as stories anteriores funcionem (mesmo que sem histórico) enquanto a Story 1.4 não está pronta. Não quebra o código intermediário.

### 5. Event delegation no keypad

Um listener no container captura todos os cliques por propagação. Mais performático do que um listener por botão. Funciona automaticamente para botões adicionados dinamicamente.

### 6. `slice(0, MAX_ITEMS)` para o limite do histórico

Uma linha elegante que resolve o limite sem condicionais. Se o array tem 40 itens, `slice(0, 50)` retorna os 40. Se tem 60, retorna os 50 primeiros (mais recentes, pois usamos `unshift`).

---

## Os Princípios do AIOX que Guiaram o Projeto

| Princípio | Como se manifestou |
|-----------|-------------------|
| **CLI First** | Todo o trabalho foi feito via terminal/CLI |
| **Story-Driven Development** | Nada foi implementado sem uma story aprovada |
| **No Invention** | Só foi implementado o que estava no PRD |
| **Quality First** | Cada story passou pelo QA gate antes de avançar |
| **Agent Authority** | Cada agente fez apenas o que era de sua competência |

---

## Para Usar a Calculadora

```
1. Abra o Windows Explorer
2. Navegue até: C:\Users\Usuario\Desktop\Claude_Stark\calculadora\
3. Dê duplo clique em index.html
4. A calculadora abre no seu navegador
```

**Não precisa de internet. Não precisa instalar nada.**

---

## O Que Pode Ser Expandido (Post-MVP)

Se um dia quiser continuar o projeto, as próximas features naturais seriam:

| Feature | Complexidade | O que precisaria |
|---------|-------------|-----------------|
| Tema claro/escuro | XS | Variáveis CSS + toggle |
| Timestamp no histórico | XS | `new Date().toLocaleTimeString()` no `add()` |
| Exportar histórico como .txt | S | `Blob` + link de download |
| Histórico com busca | M | Input de filtro + `filter()` no array |
| Notação científica na entrada | M | Ajuste no tokenizer |

---

## Resumo dos 20 Passos

| Passo | Agente | Entregável | Status |
|-------|--------|-----------|--------|
| 01 | @analyst (Alex) | `docs/brief.md` | ✅ Done |
| 02 | @pm (Morgan) | `docs/prd/prd-calculadora.md` + epic | ✅ Done |
| 03 | @architect (Aria) | `docs/architecture/architecture.md` | ✅ Done |
| 04 | @sm (River) | `docs/stories/1.1.story.md` | ✅ Done |
| 05 | @po (Pax) | Validação Story 1.1 → Ready | ✅ GO |
| 06 | @dev (Dex) | `index.html`, `style.css`, `script.js` | ✅ Done |
| 07 | @qa (Quinn) | QA Gate Story 1.1 | ✅ PASS |
| 08 | @sm (River) | `docs/stories/1.2.story.md` | ✅ Done |
| 09 | @po (Pax) | Validação Story 1.2 → Ready | ✅ GO |
| 10 | @dev (Dex) | MathParser + operações básicas | ✅ Done |
| 11 | @qa (Quinn) | QA Gate Story 1.2 | ✅ PASS |
| 12 | @sm (River) | `docs/stories/1.3.story.md` | ✅ Done |
| 13 | @po (Pax) | Validação Story 1.3 → Ready | ✅ GO |
| 14 | @dev (Dex) | ScientificFunctions completo | ✅ Done |
| 15 | @qa (Quinn) | QA Gate Story 1.3 | ✅ PASS |
| 16 | @sm (River) | `docs/stories/1.4.story.md` | ✅ Done |
| 17 | @po (Pax) | Validação Story 1.4 → Ready | ✅ GO (10/10) |
| 18 | @dev (Dex) | HistoryManager real + `init()` | ✅ Done |
| 19 | @qa (Quinn) | QA Gate Story 1.4 | ✅ PASS |
| 20 | @devops (Gage) | `git init` + commit `3692368` | ✅ Entregue |

---

*Documento gerado por Claude Sonnet 4.6 — Synkra AIOX — 2026-05-07*
