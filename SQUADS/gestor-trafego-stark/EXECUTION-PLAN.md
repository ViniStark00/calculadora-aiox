# Execution Plan — gestor-trafego-stark

> **Propósito:** Plano vivo de execução das melhorias aprovadas.
> Atualizado a cada checkpoint. Usado como handoff entre sessões.
>
> **Para retomar em nova sessão:** Leia este documento inteiro, depois leia
> `DECISION-REGISTRY.md` para contexto das decisões. O marcador 👉 indica
> exatamente onde parou.

---

## 👉 ESTADO ATUAL — onde parar e retomar

```
FASE:         Execução — PRÉ-SESSÃO CONCLUÍDA ✔️
ETAPA:        Hooks H1, H2, H3 configurados e testados em .claude/settings.json
PRÓXIMO:      1. Commitar hooks: @dev "commita com: chore(hooks): adicionar hooks H1/H2/H3"
              2. Push: @devops "push da branch feat/paralelismo-stark-chief"
              3. SESSÃO 1: @dev → D2 (cross-reference Reportei × Planilha)
AGENTE ATIVO: Aria (Architect) → próximo: @dev (Dex)
BRANCH:       feat/paralelismo-stark-chief
```

**Para retomar em nova sessão:**
1. Leia este documento inteiro
2. Leia DECISION-REGISTRY.md para ver status atual de cada item
3. Identifique qual sessão ainda não foi executada (marcador 👉)
4. Siga o plano detalhado da sessão correspondente

**Calendário:** Junho 1, 2026 = segunda-feira (importante para cálculos de período)
**Bug crítico ativo:** fill_sheets.py + agentes usam período errado (A0-a + A0-b)

---

## Resumo do Escopo

**Squad:** gestor-trafego-stark
**Objetivo:** Melhorar confiabilidade da Planilha e do Monitoramento de métricas/tarefas
**Total de melhorias identificadas:** 16
**Total aprovadas:** 16 ✅
**Total em execução:** 0
**Total concluídas:** 0

---

## Mapa de Melhorias × Agentes

| ID | Nome | Frente | Agente Executor | Status | Sessão |
|----|------|--------|-----------------|--------|--------|
| H1 | Hook: período forçado em fill_sheets.py | Hook | /update-config | ✔️ CONCLUÍDO | PRÉ |
| H2 | Hook: bloqueio de last_7d em MCP Reportei | Hook | /update-config | ✔️ CONCLUÍDO | PRÉ |
| H3 | Hook: bloqueio de credenciais em Bash | Hook | /update-config | ✔️ CONCLUÍDO | PRÉ |
| **D2** | **Cross-reference Reportei×Planilha → MANUAL_MAP** | **Dados** | **@dev (Dex)** | ✅ APROVADO | **1** |
| A0-a | Bug: edge case domingo em calcular_aba() | Bug fix | @dev (Dex) | ✅ APROVADO | 2 |
| A0-b | Bug: API Reportei usa last_7d em vez de datas fixas | Bug fix | @dev (Dex) | ✅ APROVADO | 2 |
| A1 | Tab management + isolamento multi-gestor | Planilha | @dev (Dex) | ✅ APROVADO | 3 |
| A2 | Flag --dry-run no fill_sheets.py | Planilha | @dev (Dex) | ✅ APROVADO | 3 |
| A3 | Validação de schema antes de escrever | Planilha | @dev (Dex) | ✅ APROVADO | 3 |
| C4 | fill_sheets.py: _to_float + retry 429 + exception ARS | Planilha | @dev (Dex) | ✅ APROVADO | 3 |
| C1 | Lotes de 3 nos agentes (configurável) | Performance | @dev (Dex) | ✅ APROVADO | 4 |
| C2 | Contador global rate limit Reportei | Confiabilidade | @dev (Dex) | ✅ APROVADO | 4 |
| C3 | campo nome_reportei no clientes.yaml | Dados | @dev (Dex) | ✅ APROVADO | 5 |
| D1 | Atualizar clientes.yaml com ~90 clientes ativos | Dados | @dev (Dex) | ✅ APROVADO | 5 |
| B2 | Badge "dados parciais" no painel de alertas | Monitoramento | @architect (Aria) | ✅ APROVADO | 6 |
| B1 | Histórico persistido JSONL | Monitoramento | @dev (Dex) | ✅ APROVADO | 6 |

> **Ordem obrigatória:** PRÉ → 1 → 2 → 3 → 4 → 5 → 6
> D2 (Sessão 1) deve estar concluído antes de iniciar Sessão 5 (C3 + D1).
> Antes da Sessão 5: Vinicius confirma qual gestor cuida de cada bloco da lista D1.

---

## Plano Detalhado por Sessão

---

### PRÉ-SESSÃO — Hooks H1 + H2 + H3

**Skill:** `/update-config`
**Estimativa:** 10 min
**Dependências:** Nenhuma

**O que pedir:**
> "Preciso configurar 3 hooks em `.claude/settings.json` para o squad gestor-trafego-stark:
>
> **H1** — PreToolUse para Bash: se o comando contiver `fill_sheets.py` mas NÃO contiver `--semana`, bloquear com: `[HOOK BLOQUEADO] fill_sheets.py chamado sem --semana. Período correto: --semana DD/MM/AAAA`
>
> **H2** — PreToolUse para ferramentas MCP do Reportei (`get_metrics`, `get_project_metrics`): se o input contiver `last_7d`, bloquear com: `[HOOK BLOQUEADO] Parâmetro last_7d proibido. Use date_from/date_to com segunda a domingo da semana anterior.`
>
> **H3** — PreToolUse para Bash: se o comando contiver padrões de credencial (`REPORTEI_TOKEN=`, `service_account`, `eyJ`), bloquear com: `[HOOK BLOQUEADO] Credencial detectada em texto claro. Use variáveis de ambiente de settings.local.json.`"

**Critério de aceite:** 3 hooks ativos. Testar com comandos de exemplo que devem ser bloqueados.

**Git — após confirmar que os hooks funcionam:**
```
→ @dev:    "Commita com: chore(hooks): adicionar hooks H1/H2/H3 de segurança em settings.json"
→ @devops: "Push da branch feat/paralelismo-stark-chief"
```

---

### SESSÃO 1 — Cross-reference Reportei × Planilha (D2)

**Agente:** `@dev` (Dex)
**Estimativa:** 1 sessão
**Dependências:** Nenhuma (pré-requisito para Sessão 5)

**O que pedir:**
> "@dev Preciso executar um cross-reference entre os projetos do Reportei e os nomes na planilha Google Sheets.
>
> Passo 1: Use o MCP Reportei para listar todos os projetos (`list_projects`) e extrair `{id, nome}` de cada um.
> Passo 2: Use o MCP Google Sheets para ler a coluna A de uma aba existente da planilha (SHEET_ID está em settings.local.json) e extrair a lista de nomes de clientes.
> Passo 3: Faça matching fuzzy entre os dois conjuntos (nome da planilha × nome do Reportei).
> Passo 4: Gere uma tabela markdown com: `nome_planilha | nome_reportei | project_id | confiança_match`. Matches abaixo de 80% marcar com ⚠️ para revisão manual.
>
> Não modifique nenhum arquivo ainda. Apenas me mostre a tabela."

**Resultado esperado:** Tabela com ~90 linhas. Vinicius revisa os ⚠️ antes de continuar.

**Git — esta sessão é apenas leitura. Nenhum arquivo é modificado.**
```
→ Sem commit. Sem push.
   (A tabela gerada fica só na conversa — será usada na Sessão 5)
```

---

### SESSÃO 2 — Bug fixes críticos de período (A0-a + A0-b)

**Agente:** `@dev` (Dex)
**Estimativa:** 1 sessão
**Dependências:** Nenhuma

**O que pedir:**
> "@dev Preciso corrigir 2 bugs de período no squad gestor-trafego-stark:
>
> **Bug A0-a** — `scripts/fill_sheets.py`, função `calcular_aba()` (~linha 53):
> A expressão `(hoje.weekday() + 1) % 7` retorna 0 quando rodada no domingo, apontando para hoje mesmo em vez da semana anterior. Corrija para:
> ```python
> dias_ate_domingo = (hoje.weekday() + 1) % 7
> if dias_ate_domingo == 0:
>     dias_ate_domingo = 7
> ultimo_domingo = hoje - datetime.timedelta(days=dias_ate_domingo)
> ```
>
> **Bug A0-b** — `agents/alerta-monitor.md` e `agents/coletor.md`:
> Todas as chamadas ao MCP Reportei usam `lookback: 'last_7d'`. Substitua por `date_from` e `date_to` calculados com o mesmo método de `calcular_aba()` — segunda-feira a domingo da semana anterior.
>
> Mostre o diff de cada arquivo modificado para eu revisar antes de salvar."

**Critério de aceite:** Rodar na segunda → pega seg–dom da semana anterior. Rodar no domingo → pega a semana anterior completa, não a atual.

**Git — após você revisar e aprovar o diff das correções:**
```
→ @dev:    "Commita com: fix(periodo): corrigir edge case domingo em calcular_aba e substituir last_7d por datas fixas"
→ @devops: "Push da branch feat/paralelismo-stark-chief"
```

---

### SESSÃO 3 — Melhorias do fill_sheets.py (A1 + A2 + A3 + C4)

**Agente:** `@dev` (Dex)
**Estimativa:** 1–2 sessões
**Dependências:** Nenhuma

**O que pedir:**
> "@dev Preciso de 4 melhorias no `scripts/fill_sheets.py`. Faça uma por vez e mostre o diff antes de passar para a próxima:
>
> **A1 — Tab management com isolamento multi-gestor:**
> - Ao iniciar, verificar se a aba da semana atual já existe na planilha
>   - SIM → usar essa aba, sem tocar na estrutura
>   - NÃO → duplicar a última aba existente (semana anterior) e renomear com a data correta
> - Aceitar dois modos de execução via argparse:
>   - `--gestor vinicius` → busca no clientes.yaml todos onde `gestores` inclui 'vinicius' e preenche só esses
>   - `--clientes imcp,dr-carlos,dra-nicole` → preenche só os slugs passados
> - NUNCA limpar a aba inteira. Escrever APENAS nas linhas dos clientes solicitados. Linhas de outros clientes ficam intocadas.
>
> **A2 — Flag `--dry-run`:**
> - Se `--dry-run`: imprimir `[DRY-RUN] {slug} → linha {n} → {col}={val}` para cada célula, sem escrever nada
> - Ao final: `[DRY-RUN] Nenhuma célula foi alterada.`
>
> **A3 — Validação de schema:**
> - Criar função `validar_metricas(slug, metricas, sheet_columns)` que verifica:
>   - Colunas são letras A-Z (rejeitar 'CC', '3', etc.)
>   - Valores numéricos são float ou int (0 é válido; '' e None não são)
> - Se inválido: logar aviso, pular cliente, continuar
>
> **C4 — Robustez geral:**
> - Função `_to_float(valor)`: converte qualquer formato → float seguro (None se inválido)
> - Try/except HTTP 429: esperar 60s e tentar novamente 1x antes de falhar
> - Clientes com moeda não-BRL (ex: Dr. Javier — ARS): pular coluna de spend sem erro"

**Critério de aceite:** A2 + A3 testadas com casos de borda. A1 testada com aba existente e com aba ausente.

**Git — após você aprovar cada item (pode commitar por item ou tudo junto ao final):**
```
Opção A — um commit por item (mais rastreável):
→ @dev:    "Commita com: feat(sheets): A1 — tab management com isolamento multi-gestor"
→ @dev:    "Commita com: feat(sheets): A2 — flag --dry-run no fill_sheets.py"
→ @dev:    "Commita com: feat(sheets): A3 — validação de schema antes de escrever"
→ @dev:    "Commita com: feat(sheets): C4 — _to_float, retry 429 e exception ARS"

Opção B — um commit único ao final (mais simples):
→ @dev:    "Commita com: feat(sheets): melhorias fill_sheets — tab management, dry-run, validação e robustez"

→ @devops: "Push da branch feat/paralelismo-stark-chief"
```

---

### SESSÃO 4 — Melhorias dos agentes (C1 + C2)

**Agente:** `@dev` (Dex)
**Estimativa:** 1 sessão
**Dependências:** Nenhuma

**O que pedir:**
> "@dev Preciso de 2 melhorias nos agentes do squad gestor-trafego-stark:
>
> **C1 — Lotes de 3 clientes em paralelo:**
> - Em `agents/alerta-monitor.md` (Fase 1): agrupar clientes em lotes de 3. Processar cada lote em paralelo. Aguardar o lote terminar antes de iniciar o próximo.
> - Em `tasks/rotina-semanal.md`: orquestrar os lotes (Fase 1 e Fase 3 em lotes de 3; Fase 2 serializada)
> - O tamanho do lote deve vir do campo `lote_paralelo` em `settings.yaml` (já existe com valor 3)
>
> **C2 — Contador global de rate limit Reportei:**
> - Em `agents/alerta-monitor.md` e `agents/coletor.md`: adicionar lógica de contador global
> - Ao atingir 38 requisições: pausar 540 segundos (9 minutos), zerar contador, continuar
> - Exibir no output: `[RATE LIMIT] 38 requisições atingidas — aguardando 9 min...`
>
> Mostre o diff de cada arquivo antes de salvar."

**Critério de aceite:** Com 10+ clientes, os logs mostram lotes de 3. Ao atingir 38 chamadas, pausa automática.

**Git — após você aprovar os diffs:**
```
→ @dev:    "Commita com: feat(agentes): C1/C2 — lotes de 3 em paralelo e contador global de rate limit Reportei"
→ @devops: "Push da branch feat/paralelismo-stark-chief"
```

---

### SESSÃO 5 — Dados: C3 + D1 _(requer D2 concluído + confirmação de gestor por bloco)_

**Agente:** `@dev` (Dex)
**Estimativa:** 1–2 sessões
**Dependências:** D2 concluído + Vinicius confirmar gestor por bloco da lista D1

**O que pedir:**
> "@dev Preciso atualizar o `data/clientes.yaml` com os dados do cross-reference e a lista completa de clientes.
>
> **C3 — Adicionar campo `nome_reportei`:**
> - Para cada cliente já existente no clientes.yaml, adicionar `nome_reportei` com o nome exato do Reportei (baseado na tabela gerada em D2)
> - Se nome planilha = nome Reportei: campo pode ser omitido
>
> **D1 — Adicionar os ~90 clientes ativos:**
> - Adicionar todos os clientes da lista que ainda não estão no YAML
> - Para cada um: gerar `slug` (kebab-case sem acentos), `nome_reportei` (da tabela D2), `gestores` (conforme minha confirmação abaixo), `meta_ad_account_id: null` por padrão
> - Fazer em lotes — mostrar cada bloco para eu revisar antes de adicionar"

**Critério de aceite:** clientes.yaml com ~90 clientes, todos com `slug`, `gestores` e `nome_reportei` corretos.

**Git — após você revisar e aprovar o clientes.yaml completo:**
```
→ @dev:    "Commita com: feat(dados): C3/D1 — nome_reportei e lista completa de ~90 clientes ativos"
→ @devops: "Push da branch feat/paralelismo-stark-chief"
```

---

### SESSÃO 6 — Monitoramento: B2 + B1

**Estimativa:** 1 sessão (duas tarefas independentes)

**B2 — Agente:** `@architect` (Aria)
**O que pedir:**
> "@architect Preciso atualizar `agents/alerta-monitor.md`:
> Na seção de formato de output, adicionar regra: quando `fonte == 'reportei_fallback'`, adicionar ao bloco do cliente: `· ⚠️ dados parciais (CPM/CTR/freq não verificados — sem conta Meta)`
> Atualizar o exemplo de output no documento para refletir isso."

**B1 — Agente:** `@dev` (Dex)
**O que pedir:**
> "@dev Preciso implementar histórico persistido no squad gestor-trafego-stark:
>
> 1. `tasks/save-history.md` — definir schema JSONL e lógica:
>    - Uma linha por cliente por semana: `{data_coleta, semana, slug, meta_spend, google_spend, cpl, ...}`
>    - Append ao arquivo `data/historico-metricas.jsonl`
>    - Idempotente: se já existe linha com mesmo `{data_coleta, slug}`, não duplicar
>
> 2. `tasks/rotina-semanal.md` — Fase 6:
>    - Se save-history falhar: emitir aviso no resumo, mas não bloquear o pipeline
>
> Mostre o diff antes de salvar."

**Critério de aceite:** Após rodar a rotina semanal, `data/historico-metricas.jsonl` contém uma linha por cliente. Rodar duas vezes na mesma semana: sem duplicatas.

**Git — B2 e B1 separados, depois PR:**
```
→ @architect: já terá commitado B2 com: "feat(monitor): B2 — badge dados parciais no painel de alertas"
→ @dev:       "Commita com: feat(monitor): B1 — histórico JSONL persistido em data/historico-metricas.jsonl"
→ @devops:    "Push da branch feat/paralelismo-stark-chief"

── TUDO COMMITADO E PUSHADO ──

→ @devops: "Cria um PR de feat/paralelismo-stark-chief para main com título:
            'feat(gestor-trafego-stark): 16 melhorias — período, planilha, agentes, dados e monitoramento'
            e descrição listando as 6 sessões e os itens de cada uma."

→ Você revisa o PR no GitHub → aprova

→ @devops: "Faz merge do PR" → branch fechada → trabalho 100% concluído ✅
```

---

### LEGADO — Plano Detalhado por Melhoria (referência histórica)

---

### A1 — Auto-criação de aba semanal

**Agente:** @dev (Dex)
**Estimativa:** 1 sessão
**Dependências:** Nenhuma

**Arquivos a modificar:**
1. `scripts/fill_sheets.py` — adicionar bloco try/except no worksheet lookup
2. `agents/coletor.md` — documentar que aba é criada automaticamente se ausente

**O que o @dev deve fazer:**
1. Localizar a linha de `spreadsheet.worksheet(sheet_name)` em `fill_sheets.py`
2. Envolver em try/except para `gspread.exceptions.WorksheetNotFound`
3. No except: chamar `spreadsheet.add_worksheet(title=sheet_name, rows=50, cols=26)`
4. Logar a criação no output JSON: `{"aba_criada": true}`
5. Atualizar `agents/coletor.md` — seção de pré-condições: remover "aba deve existir antes"
6. Testar com nome de aba inexistente (dry-run se A2 também for aprovada)

**Critério de aceite:**
- Executar fill_sheets.py com nome de aba que não existe → aba criada automaticamente → métricas escritas → sem erro

---

### A2 — Flag `--dry-run` no fill_sheets.py

**Agente:** @dev (Dex)
**Estimativa:** 1 sessão (pode ser feita junto com A3)
**Dependências:** Nenhuma (pode ser feita antes ou depois de A1)

**Arquivos a modificar:**
1. `scripts/fill_sheets.py` — adicionar argumento `--dry-run` via argparse

**O que o @dev deve fazer:**
1. Adicionar `parser.add_argument('--dry-run', action='store_true')` ao argparse
2. Antes de cada chamada `batchUpdate` ou `update_cell`: checar `if args.dry_run`
3. Se dry-run: imprimir linha formatada `[DRY-RUN] {slug} → linha {n} → {col}={val}`
4. Ao final: imprimir `[DRY-RUN] Nenhuma célula foi alterada.`
5. Retornar JSON de output com flag `"dry_run": true` em cada item

**Critério de aceite:**
- Executar com `--dry-run` → imprime o que escreveria → planilha real inalterada

---

### A3 — Validação de schema antes de escrever

**Agente:** @dev (Dex)
**Estimativa:** 1 sessão (pode ser feita junto com A2)
**Dependências:** Nenhuma

**Arquivos a modificar:**
1. `scripts/fill_sheets.py` — adicionar função de validação antes do loop de escrita

**O que o @dev deve fazer:**
1. Criar função `validar_metricas(slug, metricas, sheet_columns)` que:
   - Verifica que cada coluna em `sheet_columns` é uma letra maiúscula válida (A-Z)
   - Verifica que valores numéricos são `float` ou `int` (não `None`, não string)
   - Distingue `0` (válido) de `""` ou `None` (inválido — dado ausente)
2. Chamar a função antes do loop de escrita para cada cliente
3. Se inválido: logar aviso no output JSON (`{"status": "aviso", "motivo": "..."}`) e pular cliente
4. Não interromper o script inteiro — apenas pular o cliente com problema e continuar

**Critério de aceite:**
- Passar coluna `"CC"` → aviso, cliente pulado
- Passar valor `""` → aviso, cliente pulado
- Passar valor `0` → aceito, escrito normalmente

---

### B1 — Histórico persistido obrigatório

**Agente:** @dev (Dex)
**Estimativa:** 1–2 sessões
**Dependências:** Nenhuma (independente das melhorias A)

**Arquivos a modificar:**
1. `tasks/save-history.md` — definir schema JSONL e lógica de append
2. `tasks/rotina-semanal.md` — mudar Fase 6 de non-blocking para "avisar se falhar"
3. _(novo)_ `data/historico-metricas.jsonl` — criado em runtime, não commitar dados reais

**O que o @dev deve fazer:**

**Parte 1 — save-history.md:**
1. Definir schema de entrada: `metricas_coletadas` dict da Fase 1
2. Definir schema JSONL de saída (uma linha por cliente por semana):
   ```json
   {"data_coleta": "2026-06-02", "semana": "26/05/2026", "slug": "imcp", "meta_spend": 1234.56, "google_spend": 567.89, "conversas": 10, "meta_cpl": 123.45, "cpm": 45.67, "ctr": 1.23, "frequency": 2.1, "fonte": "meta_ads"}
   ```
3. Lógica: append ao arquivo `data/historico-metricas.jsonl`
4. Verificar duplicatas: se já existe linha com mesmo `{data_coleta, slug}`, não adicionar novamente (idempotência)

**Parte 2 — rotina-semanal.md:**
1. Localizar comentário `PHASE 6 — WRAP-UP (non-blocking)`
2. Alterar para: `PHASE 6 — WRAP-UP` com nota: "se save-history falhar, emitir aviso no output mas não bloquear pipeline"

**Critério de aceite:**
- Após rodar rotina-semanal completa: arquivo `data/historico-metricas.jsonl` contém uma linha por cliente com as métricas da semana
- Rodar duas vezes na mesma semana: sem duplicatas

---

### B2 — Indicador de completude no painel de alertas

**Agente:** @architect (Aria) — mudança apenas em documento .md de agente
**Estimativa:** 30 minutos na mesma sessão da aprovação
**Dependências:** Nenhuma

**Arquivos a modificar:**
1. `agents/alerta-monitor.md` — seção de formato de output

**O que a Aria faz:**
1. Localizar a seção de formato de output do painel em `alerta-monitor.md`
2. Adicionar regra: quando `fonte == "reportei_fallback"`, appender ao bloco do cliente:
   `· ⚠️ dados parciais (Reportei fallback — CPM/CTR/freq não verificados)`
3. Atualizar o exemplo de output no documento para refletir a mudança

**Critério de aceite:**
- No documento `alerta-monitor.md`, a seção de output contém instrução clara sobre o badge de dados parciais

---

## Sequência de Execução

```
PRÉ      /update-config    H1 + H2 + H3 (hooks)              → commit → push
│
SESSÃO 1  @dev             D2 (cross-reference — sem arquivos) → SEM commit (só leitura)
│
SESSÃO 2  @dev             A0-a + A0-b (bug fixes de período) → commit → push
│
SESSÃO 3  @dev             A1 + A2 + A3 + C4 (fill_sheets.py) → commit → push
│
SESSÃO 4  @dev             C1 + C2 (agentes: lotes + rate limit) → commit → push
│
SESSÃO 5  @dev             C3 + D1 (clientes.yaml completo) ← depende de D2 → commit → push
│
SESSÃO 6  @architect       B2 (badge alerta-monitor.md)        → commit → push
          @dev             B1 (histórico JSONL)                → commit → push
          @devops          gh pr create + gh pr merge → BRANCH FECHADA ✅
```

> Antes da Sessão 5: Vinicius confirma qual gestor cuida de cada bloco da lista D1.

---

## Estratégia Git — Quem Faz O Quê

> **Regra AIOX:** @dev commita. @devops empurra e cria PR. Nunca ao contrário.

| Operação | Agente | Quando |
|----------|--------|--------|
| `git add` + `git commit` | `@dev` (Dex) | Ao final de cada sessão, após você aprovar o diff |
| `git push` | `@devops` (Gage) | Logo após cada commit, para salvar o trabalho remotamente |
| `gh pr create` | `@devops` (Gage) | Uma única vez, ao final da Sessão 6 |
| `gh pr merge` | `@devops` (Gage) | Após você revisar e aprovar o PR |

**Branch de trabalho:** `feat/paralelismo-stark-chief` (já existe)
**Branch de destino do PR:** `main`
**Estratégia de commit:** um commit por sessão — cada sessão é uma unidade lógica de mudança.

**Fluxo padrão ao final de cada sessão:**
```
1. @dev mostra o diff final para você revisar
2. Você aprova → pede "@dev commita com mensagem X"
3. @dev faz git add + git commit
4. Você pede "@devops push"
5. @devops faz git push origin feat/paralelismo-stark-chief
```

**Ao final de tudo (após Sessão 6):**
```
6. Você pede "@devops cria PR de feat/paralelismo-stark-chief para main"
7. @devops cria o PR com título e descrição
8. Você revisa o PR no GitHub
9. Você aprova → pede "@devops faz merge do PR"
10. @devops faz merge → branch fechada → trabalho concluído
```

---

## Histórico de Checkpoints

| CP | Data | Fase | Feito | Próximo |
|----|------|------|-------|---------|
| CP-01 | 2026-06-06 | Planejamento | Diagnóstico e plano criados. Docs DECISION-REGISTRY.md e EXECUTION-PLAN.md criados. | Vinicius aprovar/reprovar A1–A3, B1–B2. |
| CP-02 | 2026-06-06 | Planejamento | Sessão 2 concluída. Todos os 16 itens aprovados. Escopo de A1 refinado: isolamento por --gestor/--clientes, sem limpar aba inteira. Plano detalhado por sessão definido. | Executar PRÉ-SESSÃO (hooks) e depois Sessão 1 (D2). |
| CP-03 | 2026-06-06 | PRÉ-SESSÃO | Hooks H1, H2, H3 configurados em .claude/settings.json e testados (5 cenários, todos corretos). JSON válido. | Commitar hooks (@dev) + push (@devops). Iniciar Sessão 1 com @dev para D2 (cross-reference Reportei × Planilha). |
