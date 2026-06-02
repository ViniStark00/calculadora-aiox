# CHANGELOG — Paralelismo + Otimização gestor-trafego-stark

> **Regra:** Todo agente que modificar um arquivo neste projeto DEVE registrar a mudança aqui,
> no formato ANTES / DEPOIS, antes de fazer o commit.
> Sem registro → mudança não está completa.

**Branch:** `feat/paralelismo-stark-chief`  
**Iniciado em:** 2026-06-02  
**Última atualização:** 2026-06-02

---

## ÍNDICE DE MUDANÇAS

| # | Arquivo | Agente | Melhoria | Status |
|---|---------|--------|----------|--------|
| 1 | `agents/stark-chief.md` | @dev | MELHORIA 1 | ✅ Implementado |
| 2 | `tasks/rotina-semanal.md` | @dev | MELHORIA 1 | ✅ Implementado |
| 3 | `workflows/weekly-pipeline.md` | @dev | MELHORIA 1 | ✅ Implementado |
| 4 | `agents/alerta-monitor.md` | @dev | MELHORIA 2 | ⏳ Pendente |
| 5 | `scripts/fill_sheets.py` | @dev | MELHORIA 3 | ⏳ Pendente |
| 6 | `agents/stark-chief.md` | @dev | MELHORIA 4 | ⏳ Pendente |
| 7 | `tasks/rotina-semanal.md` | @dev | MELHORIA 4 | ⏳ Pendente |

---

## MUDANÇA 1 — `agents/stark-chief.md` (MELHORIA 1: trigger paralelo)

**Agente:** @dev  
**Data:** 2026-06-02  
**Commit:** (ver tabela de commits ao final)

### ANTES
```yaml
# REQUEST-RESOLUTION (trecho)
  "inbox do Gustavo" → *monitor-tarefas.
  ALWAYS ask for clarification if no clear match.

# ROUTING RULES (último item — sem modos 2/3)
      - "inbox" / "tarefas" / "tasks" / "monitor tarefas" → *monitor-tarefas → tasks/rotina-diaria.md (bloco task-monitor)

# PIPELINE ROUTING (título e 1 bloco apenas)
  - PIPELINE ROUTING (rotina-semanal — 6 fases):
      - FASE 2 CONDICIONAL: apenas se vinicius in cliente.gestores
      ...

# multi_client_mode
  triggers:
    vinicius: ["bloco Vinicius", "todos os clientes Vinicius", "carteira Vinicius"]
    gustavo: ["carteira Gustavo", "todos os clientes Gustavo", "bloco Gustavo"]
    todos: ["todos", "todos os clientes", "toda a carteira"]
  filtros:
    vinicius: "vinicius in gestores AND ativo: true"
    gustavo: "gustavo in gestores AND ativo: true"
    todos: "ativo: true"
  execucao: "Estágios paralelos — COLETA → GERAÇÃO → PUBLICAÇÃO (lotes de 3 clientes por lote)"

# core_principles (último item)
  - CRITICAL: FASE 2 (sheets) só executa quando vinicius in cliente.gestores
```

### DEPOIS
```yaml
# REQUEST-RESOLUTION (adicionados Modos 2 e 3)
  "inbox do Gustavo" → *monitor-tarefas,
  "todos vinicius" / "todos gustavo" → *rotina-semanal todos {gestor} (Modo 2 — paralelo),
  "Dr. Leandro, Dr. Fernando, IMCP" → *rotina-semanal {lista} (Modo 3 — lista mista).
  ALWAYS ask for clarification if no clear match.

# ROUTING RULES (2 linhas adicionadas ao final)
      - "todos {gestor}" / "toda a carteira de {gestor}" → *rotina-semanal todos {gestor} → tasks/rotina-semanal.md (Modo 2 — paralelo por gestor)
      - "{nome1}, {nome2}, ..." (lista separada por vírgula) → *rotina-semanal {lista} → tasks/rotina-semanal.md (Modo 3 — lista mista)

# PIPELINE ROUTING (renomeado Modo 1 + novo bloco Modos 2 e 3 com 5 estágios)
  - PIPELINE ROUTING — MODO 1 (rotina-semanal 1 cliente — sequencial, 6 fases — sem alteração):
      ...
  - PIPELINE ROUTING — MODOS 2 e 3 (paralelo — N clientes — 5 estágios):
      - MODO 2 "todos {gestor}": resolução dinâmica do gestor
      - MODO 3 "{nome1}, {nome2}, ...": fuzzy match por nome
      - ESTÁGIO 1 a ESTÁGIO 5 com ADRs 04/05/06/08/09

# multi_client_mode (reescrito — resolução dinâmica, batch 5, 5 estágios)
  modo_2:
    trigger_pattern: "todos {gestor}"
    examples: ["todos vinicius", "todos gustavo", "todos matheus"]
    resolucao: gestor_solicitado = trim(trigger após "todos ").lower()
    pipeline: "5 estágios paralelos (DESIGN-PARALELISMO.md)"
  modo_3:
    trigger_pattern: "{nome1}, {nome2}, ..."
    pipeline: "5 estágios — cada cliente preenche bloco do seu gestor no Estágio 2"
  batch_size_estagio_3: 5
  execucao: "5 estágios: COLETA → SHEETS (todos) → GERAÇÃO (lotes 5) → PUBLICAÇÃO (serial+guard) → WRAP-UP"

# core_principles (1 item dividido em 2)
  - CRITICAL: Modo 1 (1 cliente) — FASE 2 (sheets) só executa quando vinicius in cliente.gestores
  - CRITICAL: Modos 2 e 3 (paralelo) — Estágio 2 (sheets) para TODOS os clientes da rodada, sem condicional por gestor
```

### O que mudou (resumo em 1 linha)
Adicionados 3 modos de trigger (Modo 1 preservado intacto) + routing para pipeline paralelo de 5 estágios nos Modos 2/3 + multi_client_mode atualizado com resolução dinâmica de gestor e batch size 5.

---

## MUDANÇA 2 — `tasks/rotina-semanal.md` (MELHORIA 1: seção modo paralelo)

**Agente:** @dev  
**Data:** 2026-06-02  
**Commit:** (ver tabela de commits ao final)

### ANTES
```
# Seção de detecção de modo: não existia
# Seção "Modo Paralelo": não existia
# PRÉ-EXECUÇÃO: "## PRÉ-EXECUÇÃO: Resolução do cliente" (sem detecção de modo)
```

### DEPOIS
```
# Adicionada seção "## DETECÇÃO DO MODO DE EXECUÇÃO" antes do PRÉ-EXECUÇÃO
  — tabela com 3 modos (trigger → modo → pipeline)
  — redirecionamento explícito: Modos 2 e 3 → ir para seção Modo Paralelo

# PRÉ-EXECUÇÃO renomeado: "## PRÉ-EXECUÇÃO: Resolução do cliente (Modo 1 apenas)"

# Adicionada seção "## Modo Paralelo — Pipeline 5 Estágios (Modos 2 e 3)"
  — Resolução de clientes (Modos 2 e 3) com código de exemplo
  — ESTÁGIO 1 a ESTÁGIO 5 detalhados (agentes, tasks, ADRs, comportamento de falha)
  — RESUMO FINAL CONSOLIDADO com formato de tabela + tabela de status por cliente
```

### O que mudou (resumo em 1 linha)
Adicionadas detecção de modo e seção completa do Modo Paralelo (5 estágios) — seção sequencial de 6 fases preservada intacta.

---

## MUDANÇA 3 — `workflows/weekly-pipeline.md` (MELHORIA 1: diagrama modo paralelo)

**Agente:** @dev  
**Data:** 2026-06-02  
**Commit:** (ver tabela de commits ao final)

### ANTES
```
# Diagrama: apenas modo sequencial (1 cliente, 6 fases)
# Tabela ADRs: ADR-01, ADR-04, ADR-05, ADR-06, ADR-07
```

### DEPOIS
```
# Diagrama sequencial: preservado intacto
# Adicionada seção "## Diagrama — Modo Paralelo (Modos 2 e 3)"
  — Detecção Modo 2 e Modo 3 na entrada
  — 5 estágios: COLETA → SHEETS → GERAÇÃO → PUBLICAÇÃO → WRAP-UP
  — Guard de idempotência no Estágio 4 (proteção clientes compartilhados)
  — RESUMO FINAL CONSOLIDADO na saída

# Tabela ADRs ampliada:
  — ADR-05 dividido em Modo 1 e Modos 2/3 (batch 5)
  — ADR-06 separado em falha-isolada e threshold
  — ADR-08 adicionado (ctx_cliente pass-through)
  — ADR-09 adicionado (batch Sheets JSON)
```

### O que mudou (resumo em 1 linha)
Adicionado diagrama do Modo Paralelo (5 estágios) e tabela de ADRs atualizada com ADR-05/06/08/09 — diagrama sequencial preservado.

---

## MUDANÇA 4 — `agents/alerta-monitor.md` (MELHORIA 2: filtro_clientes)

**Agente:** @dev  
**Data:** —  
**Commit:** —

### ANTES
```
(copiar aqui o trecho exato antes — seção de parâmetros ou lógica de iteração)
```

### DEPOIS
```
(copiar aqui o trecho com o parâmetro filtro_clientes adicionado)
```

### O que mudou (resumo em 1 linha)
—

---

## MUDANÇA 5 — `scripts/fill_sheets.py` (MELHORIA 3: batch JSON)

**Agente:** @dev  
**Data:** —  
**Commit:** —

### ANTES
```python
# copiar aqui a função/trecho que aceita 1 cliente por vez
```

### DEPOIS
```python
# copiar aqui a função/trecho com suporte a {"clientes": [...]}
```

### O que mudou (resumo em 1 linha)
—

---

## MUDANÇA 6 — `agents/stark-chief.md` (MELHORIA 4: pass-through ctx_cliente)

**Agente:** @dev  
**Data:** —  
**Commit:** —

### ANTES
```
(copiar aqui o trecho onde stark-chief não passa ctx_cliente para as fases)
```

### DEPOIS
```
(copiar aqui o trecho com leitura única + pass-through para redator e publicador)
```

### O que mudou (resumo em 1 linha)
—

---

## MUDANÇA 7 — `tasks/rotina-semanal.md` (MELHORIA 4: pass-through documentado)

**Agente:** @dev  
**Data:** —  
**Commit:** —

### ANTES
```
(copiar aqui as instruções de cada fase antes do pass-through)
```

### DEPOIS
```
(copiar aqui as instruções atualizadas com ctx_cliente como parâmetro explícito)
```

### O que mudou (resumo em 1 linha)
—

---

## VALIDAÇÕES @qa

> Preencher após cada melhoria validada.

### MELHORIA 1 — Modo paralelo

**Agente:** @qa  
**Data:** —  
**Resultado:** —

| Check | Resultado | Observação |
|-------|-----------|------------|
| `*rotina-semanal Dr. Leandro` ainda funciona (modo 1 cliente) | ⏳ | — |
| `*rotina-semanal todos vinicius` dispara modo paralelo | ⏳ | — |
| `*rotina-semanal todos gustavo` dispara modo paralelo | ⏳ | — |
| `*rotina-semanal todos matheus` retorna erro claro se gestor não existe | ⏳ | — |
| Lista mista funciona com clientes de gestores diferentes | ⏳ | — |
| Todos os clientes passam pelo Estágio 2 (Sheets) | ⏳ | — |
| Dr. Laureano não duplica publicação ao rodar vinicius + gustavo | ⏳ | — |

### MELHORIA 2 — alerta-monitor lazy loading

**Agente:** @qa  
**Data:** —  
**Resultado:** —

| Check | Resultado | Observação |
|-------|-----------|------------|
| `*rotina-diaria` ainda monitora todos 28 | ⏳ | — |
| `*rotina-semanal [1 cliente]` monitora apenas aquele | ⏳ | — |

### MELHORIA 3 — Batch Sheets

**Agente:** @qa  
**Data:** —  
**Resultado:** —

| Check | Resultado | Observação |
|-------|-----------|------------|
| Colunas corretas preenchidas (C/E/H/K/O) para cada cliente | ⏳ | — |
| Falha em 1 cliente não impede preenchimento dos demais | ⏳ | — |

### MELHORIA 4 — Pass-through contexto

**Agente:** @qa  
**Data:** —  
**Resultado:** —

| Check | Resultado | Observação |
|-------|-----------|------------|
| ctx_cliente chega corretamente no redator | ⏳ | — |
| ctx_cliente chega corretamente no publicador | ⏳ | — |
| Drive não é chamado mais de 1 vez por cliente por sessão | ⏳ | — |

---

## COMMITS REGISTRADOS

| Hash | Mensagem | Agente | Data |
|------|----------|--------|------|
| — | — | — | — |

---

*Documento criado por Aria (@architect) — 2026-06-02*  
*Obrigatório para todos os agentes: @dev, @qa, @devops*
