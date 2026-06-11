# Plano de Correções — Planilha Junho 2026
> **Squad:** `gestor-trafego-stark`
> **Origem:** DEBUG-sessao-planilha-junho.md (10/06/2026)
> **Objetivo:** Corrigir 9 problemas identificados: dados errados na planilha, código frágil e configuração desatualizada.
> **Para retomar em nova sessão:** Leia este documento, localize o marcador 👉 na seção de estado, e cole o bloco de handoff da fase atual em uma nova conversa.

---

## 👉 ESTADO ATUAL

```
FASE ATUAL:   2 — Corrigir código fill_sheets.py + fetch-metrics.md (PENDENTE)
BRANCH:       fix/planilha-correcoes-junho
ÚLTIMO COMMIT: 9787649 — fix(config): SHEET_ID local corrigido + plano criado (E1)
PRÓXIMO AGENTE: @dev
STASH PENDENTE: timeline-log sessao 10/06 no branch feat/paralelismo-stark-chief
                → @devops resolve quando fizer PR daquele branch
```

> Atualize este bloco manualmente ao concluir cada fase.

---

## Mapa Geral do Plano

| Fase | O que acontece | Quem faz | Commit? |
|------|---------------|----------|---------|
| 0 | Verificações manuais no Google Ads e Reportei | Você | Não |
| 1 | Criar branch + corrigir configuração | @dev | Sim (Commit A) |
| 2 | Corrigir código (fill_sheets.py + fetch-metrics.md) | @dev | Sim (Commit B) |
| 3 | Corrigir célula M339 na planilha real | @dev | Sim (junto com B ou separado) |
| 4 | Adicionar 3 hooks novos (H4, H5, H6) | @dev | Sim (Commit C) |
| 5 | Validar tudo rodando | Você + @dev | Não |
| 6 | Push + PR para main | @devops | PR |

---

## Contexto dos Erros (resumo para handoff)

Esses são os 9 problemas confirmados que este plano resolve:

| # | Problema | Arquivo afetado | Status |
|---|---------|----------------|--------|
| E1 | SHEET_ID errado em settings.local.json | `.claude/settings.local.json` | ⏳ pendente |
| E2 | Mapeamento de colunas errado em fetch-metrics.md | `tasks/fetch-metrics.md` | ⏳ pendente |
| E3 | fill_sheets.py não restringe match ao bloco do gestor | `scripts/fill_sheets.py` | ⏳ pendente |
| E4 | Unicode não declarado nos scripts Python | `scripts/fill_sheets.py` | ⏳ pendente |
| E5 | Dr. Laureano não filtrado automaticamente | `data/clientes.yaml` | ⏳ pendente |
| E6 | meta_ad_account_id de IMCP e Dr. Leandro a verificar | `data/clientes.yaml` | ⏳ pendente |
| E7 | M339 (Diego Gonzalez Leads Respondi) = 0, deveria ser 6 | planilha Google Sheets | ⏳ pendente |
| E8 | Hook H3 disparando sem mensagem clara para o usuário | `.claude/settings.json` | ⏳ fase 4 |
| E9 | Sem proteção contra escrita em colunas com fórmula | `.claude/settings.json` | ⏳ fase 4 |

---

## FASE 0 — Verificações Manuais (VOCÊ)

> Sem agente. Você faz isso antes de qualquer código.

### Por que fazer primeiro?

Algumas células só podem ser corrigidas depois de confirmar os dados reais. Sem essas respostas, o @dev pode escrever zeros onde há valores reais.

### Checklist da Fase 0 ✅ CONCLUÍDA (11/06/2026)

- [x] **Lucas Consentino** — Confirmado: não tem Google Ads. Zero na planilha está correto.
- [x] **Luiz Borba** — Confirmado: não tem Google Ads. Zero na planilha está correto.
- [x] **IMCP** — Confirmado: não tem Google Ads. Zero na planilha está correto.
- [x] **Dr. Guilherme Mattar** — Confirmado: não tem Instagram conectado no Reportei. Zero está correto.
- [x] **Diego Gonzalez M339** — Confirmado: valor correto é **6**. @dev vai corrigir na Fase 3.

### Quando terminar a Fase 0

Anote aqui os valores encontrados:

```
Lucas Consentino — Google spend 01/06–07/06: R$ ________
Luiz Borba       — Google spend 01/06–07/06: R$ ________
IMCP             — Tem Google Ads ativo? SIM / NÃO
IMCP             — Google spend 01/06–07/06: R$ ________ (se sim)
IMCP meta_ad_account_id — correto? SIM / NÃO / ID correto: __________
Dr. Leandro meta_ad_account_id — correto? SIM / NÃO / ID correto: __________
Dr. Mattar — tem Instagram no Reportei? SIM / NÃO
Diego M339 — confirmar valor 6? SIM / NÃO / valor correto: ____
```

---

### 🔖 HANDOFF — Fase 0 concluída

Quando terminar as verificações acima, abra uma **nova sessão** e cole:

```
Estou no PLANO-CORRECOES-PLANILHA.md do squad gestor-trafego-stark.
A Fase 0 (verificações manuais) foi concluída. Resultados:

- Lucas Consentino Google spend: R$ ____
- Luiz Borba Google spend: R$ ____
- IMCP Google Ads ativo: SIM/NÃO, spend: R$ ____
- IMCP meta_ad_account_id: correto/errado (novo ID: ____)
- Dr. Leandro meta_ad_account_id: correto/errado (novo ID: ____)
- Dr. Mattar Instagram Reportei: SIM/NÃO
- Diego M339 valor confirmado: ____

Próximo passo: FASE 1 — criar branch fix/planilha-correcoes-junho e corrigir configuração.
Chamar @dev.
```

---

## FASE 1 — Criar Branch + Corrigir Configuração (@dev)

> **Agente:** `/AIOX:agents:dev`
> **Pré-requisito:** Fase 0 concluída com valores anotados.

### O que será feito

1. Criar branch `fix/planilha-correcoes-junho` a partir de `main`
2. Corrigir `SHEET_ID` em `.claude/settings.local.json`
3. Corrigir flag `excluir_meta_monitoring` do Dr. Laureano em `data/clientes.yaml`
4. Corrigir ou confirmar `meta_ad_account_id` de IMCP e Dr. Leandro em `data/clientes.yaml` (com os valores da Fase 0)

### O que pedir ao @dev (copiar e colar)

```
@dev — Fase 1 do PLANO-CORRECOES-PLANILHA.md.

Passo 1: criar branch
  git checkout main
  git pull origin main
  git checkout -b fix/planilha-correcoes-junho

Passo 2: corrigir .claude/settings.local.json
  Trocar o valor de SHEET_ID de:
    1crqoxq8hqaQWsoZby5FlQt50gpUZ29buyeRKkv3M5Og
  Para:
    16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM

Passo 3: corrigir data/clientes.yaml
  - Dr. Laureano Filho: confirmar que excluir_meta_monitoring: true está presente
    e que o campo é lido antes da listagem de confirmação ao usuário.
  - IMCP meta_ad_account_id: atualizar para [VALOR DA FASE 0 se diferente]
  - Dr. Leandro meta_ad_account_id: atualizar para [VALOR DA FASE 0 se diferente]

Passo 4: commit A
  git add .claude/settings.local.json squads/gestor-trafego-stark/data/clientes.yaml
  git commit -m "fix(config): SHEET_ID correto + clientes.yaml atualizado (E1, E5, E6)"

Me diga quando o commit A estiver feito.
```

### Critério de conclusão

- Branch `fix/planilha-correcoes-junho` criado
- `settings.local.json` com `SHEET_ID = 16f9Mm...`
- `clientes.yaml` com Dr. Laureano filtrado e IDs Meta corrigidos
- Commit A criado com mensagem `fix(config): ...`

---

### 🔖 HANDOFF — Fase 1 concluída

Abra nova sessão e cole:

```
Estou no PLANO-CORRECOES-PLANILHA.md do squad gestor-trafego-stark.
Fase 1 concluída. Estado:

- Branch: fix/planilha-correcoes-junho (criado, não publicado)
- Commit A: fix(config): SHEET_ID correto + clientes.yaml atualizado
- settings.local.json: SHEET_ID = 16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM
- clientes.yaml: Dr. Laureano com excluir_meta_monitoring: true confirmado
- clientes.yaml: IDs Meta de IMCP e Dr. Leandro corrigidos

Próximo passo: FASE 2 — corrigir código em fill_sheets.py e fetch-metrics.md.
Chamar @dev.
```

---

## FASE 2 — Corrigir Código (@dev)

> **Agente:** `/AIOX:agents:dev`
> **Pré-requisito:** Fase 1 concluída (branch existe, commit A feito).

### O que será feito

1. Atualizar `tasks/fetch-metrics.md` com o mapeamento correto de colunas
2. Corrigir `scripts/fill_sheets.py`: match de cliente restrito ao bloco do gestor
3. Corrigir `scripts/fill_sheets.py`: declarar `encoding='utf-8'` em todas as aberturas de arquivo e `sys.stdout.reconfigure(encoding='utf-8')` no topo
4. Corrigir `scripts/fill_sheets.py`: nunca escrever nas colunas com fórmula (G, H, I, K, N, P)

### Mapeamento de colunas correto (referência para o @dev)

```
D = tofu_spend           (Invest. TOFU)
E = meta_spend_total     (Invest. total Meta)
F = seguidores           (Saldo Seguidores)
J = conversas_whats      (Conversas WHATS)
L = leads_meta           (LEADS Meta)
M = leads_respondi       (Leads Respondi)
O = cpa_google           (CPA Google)
Q = google_spend         (Invest. Total Google)

NUNCA ESCREVER: G, H, I, K, N, P (fórmulas automáticas)
NÃO EXISTE na planilha: bofu_spend, CTR
```

### Lógica de match por gestor (referência para o @dev)

```python
# ERRADO (busca toda a planilha):
for row in all_rows:
    if "diego" in row[1].lower(): ...

# CORRETO (restringe ao bloco do gestor):
# 1. Achar a linha onde coluna A == nome_gestor (ex: "Vinicius")
# 2. Achar a próxima linha onde coluna A é outro gestor (ou fim da planilha)
# 3. Buscar cliente SOMENTE nesse intervalo de linhas
```

### O que pedir ao @dev (copiar e colar)

```
@dev — Fase 2 do PLANO-CORRECOES-PLANILHA.md.
Estamos no branch fix/planilha-correcoes-junho.

Passo 1: atualizar tasks/fetch-metrics.md
  Substituir o bloco de mapeamento de colunas pelo mapeamento correto:
    D = tofu_spend, E = meta_spend_total, F = seguidores,
    J = conversas_whats, L = leads_meta, M = leads_respondi,
    O = cpa_google, Q = google_spend.
  Remover referências a bofu_spend e CTR (não existem na planilha).
  Adicionar lista de colunas proibidas: G, H, I, K, N, P (fórmulas — nunca escrever).

Passo 2: corrigir scripts/fill_sheets.py — match por gestor
  A função que localiza a linha do cliente na planilha deve:
  (a) Primeiro encontrar a linha onde coluna A == nome do gestor (ex: "Vinicius")
  (b) Depois encontrar o fim do bloco (próxima linha com outro nome em coluna A)
  (c) Buscar o cliente SOMENTE dentro desse intervalo
  Isso evita o bug onde "diego" casou com Dr. Diego Alencar de outro gestor.

Passo 3: corrigir scripts/fill_sheets.py — encoding UTF-8
  No topo do arquivo, adicionar:
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
  Em todas as chamadas open(), adicionar encoding='utf-8':
    with open('arquivo', encoding='utf-8') as f: ...

Passo 4: corrigir scripts/fill_sheets.py — bloquear colunas de fórmula
  Antes de qualquer batch_update ou values().update(), verificar se alguma
  coluna alvo é G, H, I, K, N ou P. Se for, pular com log de aviso.

Passo 5: commit B
  git add squads/gestor-trafego-stark/tasks/fetch-metrics.md
  git add squads/gestor-trafego-stark/scripts/fill_sheets.py
  git commit -m "fix(planilha): match por gestor + encoding UTF-8 + colunas corretas (E2, E3, E4)"

Me diga quando o commit B estiver feito.
```

### Critério de conclusão

- `fetch-metrics.md` com mapeamento correto (D, E, F, J, L, M, O, Q)
- `fill_sheets.py` com match restrito ao bloco do gestor
- `fill_sheets.py` com `encoding='utf-8'` em todas as aberturas
- `fill_sheets.py` nunca escreve em G, H, I, K, N, P
- Commit B criado

---

### 🔖 HANDOFF — Fase 2 concluída

Abra nova sessão e cole:

```
Estou no PLANO-CORRECOES-PLANILHA.md do squad gestor-trafego-stark.
Fase 2 concluída. Estado:

- Branch: fix/planilha-correcoes-junho
- Commit A: fix(config): SHEET_ID + clientes.yaml
- Commit B: fix(planilha): match por gestor + encoding + colunas corretas
- fetch-metrics.md: mapeamento correto (D/E/F/J/L/M/O/Q), colunas proibidas listadas
- fill_sheets.py: match por bloco de gestor implementado
- fill_sheets.py: encoding='utf-8' adicionado

Próximo passo: FASE 3 — corrigir célula M339 na planilha real (Diego Leads Respondi = 6).
Chamar @dev.
```

---

## FASE 3 — Corrigir Célula M339 na Planilha Real (@dev)

> **Agente:** `/AIOX:agents:dev`
> **Pré-requisito:** Fase 2 concluída. Valor de M339 confirmado na Fase 0.

### O que será feito

Escrever o valor correto na célula M339 da planilha `16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM`, aba `Junho` — e corrigir qualquer outro zero duvidoso confirmado na Fase 0.

### O que pedir ao @dev (copiar e colar)

```
@dev — Fase 3 do PLANO-CORRECOES-PLANILHA.md.

Corrigir valores na planilha Google Sheets:
  SHEET_ID: 16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM
  Aba: Junho

Correções confirmadas na Fase 0:
  - M339 (Diego Gonzalez — Leads Respondi): escrever 6
  - [Se Lucas Consentino teve gasto]: escrever R$ ____ na col O e Q linha Lucas
  - [Se Luiz Borba teve gasto]: escrever R$ ____ na col O e Q linha Luiz
  - [Se IMCP teve gasto Google]: escrever R$ ____ na col O e Q linha IMCP

Após corrigir, fazer log de quais células foram atualizadas.
Não commitar nada nesta fase (a planilha é externa, não é código).

Me confirme quais células foram escritas.
```

### Critério de conclusão

- M339 = 6 (ou valor confirmado na Fase 0)
- Demais células corrigidas com os valores reais da Fase 0
- Nenhum commit necessário (dados externos)

---

### 🔖 HANDOFF — Fase 3 concluída

Abra nova sessão e cole:

```
Estou no PLANO-CORRECOES-PLANILHA.md do squad gestor-trafego-stark.
Fase 3 concluída. Estado:

- Branch: fix/planilha-correcoes-junho
- Commits: A (config) + B (código)
- Planilha corrigida: M339=6, [listar outras células corrigidas]
- Próximo passo: FASE 4 — adicionar hooks H4, H5, H6 em .claude/settings.json

Chamar @dev.
```

---

## FASE 4 — Adicionar Hooks de Proteção (@dev)

> **Agente:** `/AIOX:agents:dev`
> **Pré-requisito:** Fase 3 concluída.

### O que serão os 3 novos hooks

**H4 — Bloquear escrita em colunas com fórmula**
Se qualquer comando Bash chamar `fill_sheets.py` e o output ou parâmetro mencionar as colunas G, H, I, K, N ou P, bloqueia.

**H5 — Forçar batch de no máximo 3 chamadas Reportei paralelas**
Se o código tentar disparar `get_project_metrics` ou `get_metrics` mais de 3 vezes em sequência sem pausa, bloqueia.

**H6 — Bloquear SHEET_ID errado**
Se qualquer comando Bash contiver o ID antigo `1crqoxq8hqaQWsoZby5FlQt50gpUZ29buyeRKkv3M5Og`, bloqueia antes de executar.

**Melhoria no H3 existente — mensagem mais clara**
O hook atual para sem explicação visível. Adicionar prefixo `⚠️` e instrução clara no `stopReason`.

### O que pedir ao @dev (copiar e colar)

```
@dev — Fase 4 do PLANO-CORRECOES-PLANILHA.md.
Editar .claude/settings.json para adicionar 3 hooks novos e melhorar H3.

Arquivo atual tem 3 hooks (H1 em Bash, H2 em Reportei MCP, H3 em Bash).
Manter os existentes e adicionar:

H4 — bloquear SHEET_ID antigo em Bash:
  Matcher: Bash
  Condição: comando contém "1crqoxq8hqaQWsoZby5FlQt50gpUZ29buyeRKkv3M5Og"
  Ação: continue=false, stopReason: "[H4 BLOQUEADO] SHEET_ID antigo detectado.
         Use o ID correto: 16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM"
  statusMessage: "H4: verificando SHEET_ID..."

H5 — bloquear escrita em colunas de fórmula via Bash:
  Matcher: Bash
  Condição: comando contém fill_sheets E contém qualquer de: col_G, col_H,
            col_I, col_K, col_N, col_P, "'G'", "'H'", "'I'", "'K'", "'N'", "'P'"
            (ajustar regex conforme o padrão real do script)
  Ação: continue=false, stopReason: "[H5 BLOQUEADO] Tentativa de escrever em
         coluna com fórmula automática. Colunas protegidas: G, H, I, K, N, P."
  statusMessage: "H5: verificando colunas protegidas..."

H6 — melhorar mensagem do H3 existente:
  Atualizar stopReason do H3 para:
  "⚠️ [H3 BLOQUEADO] Credencial em texto detectada. O script não deve imprimir
   REPORTEI_TOKEN, service_account ou tokens JWT. Use sys.stdout.reconfigure e
   evite print() com variáveis de ambiente."

Fazer commit C após as alterações:
  git add .claude/settings.json
  git commit -m "feat(hooks): H4 SHEET_ID + H5 colunas fórmula + H3 mensagem melhorada (E8, E9)"

Me diga quando commit C estiver pronto.
```

### Critério de conclusão

- `.claude/settings.json` com H4 e H5 adicionados
- H3 com mensagem melhorada
- Commit C criado

---

### 🔖 HANDOFF — Fase 4 concluída

Abra nova sessão e cole:

```
Estou no PLANO-CORRECOES-PLANILHA.md do squad gestor-trafego-stark.
Fase 4 concluída. Estado:

- Branch: fix/planilha-correcoes-junho
- Commit A: fix(config): SHEET_ID + clientes.yaml
- Commit B: fix(planilha): match por gestor + encoding + colunas corretas
- Commit C: feat(hooks): H4 + H5 + H3 melhorado
- Planilha já corrigida na Fase 3

Próximo passo: FASE 5 — validar que o script roda corretamente com as correções.
Fazer teste com @dev.
```

---

## FASE 5 — Validação (@dev + você)

> **Agente:** `/AIOX:agents:dev`
> **Pré-requisito:** Fases 1–4 concluídas.

### O que validar

1. O script `fill_sheets.py` consegue ler `settings.local.json` sem erro de encoding
2. O SHEET_ID correto é usado (H4 não dispara)
3. O match de cliente funciona dentro do bloco "Vinicius" (testar com "diego")
4. Colunas de fórmula não são sobrescritas (H5 não dispara em uso normal)
5. Dr. Laureano não aparece na lista de confirmação
6. H1 (--semana) ainda funciona: rodar sem parâmetro e confirmar bloqueio

### O que pedir ao @dev (copiar e colar)

```
@dev — Fase 5 do PLANO-CORRECOES-PLANILHA.md.
Validar o script corrigido com testes pontuais (NÃO escrever na planilha real).

Teste 1 — encoding:
  Rodar: python squads/gestor-trafego-stark/scripts/fill_sheets.py --dry-run
  (ou equivalente) e confirmar que não há UnicodeDecodeError nem UnicodeEncodeError.

Teste 2 — SHEET_ID:
  Confirmar que settings.local.json tem o ID correto.
  Tentar rodar com ID antigo (em variável temporária) e confirmar que H4 bloqueia.

Teste 3 — match por gestor:
  Revisar o código e confirmar que a lógica de match está restrita ao bloco do gestor.
  Mostrar o trecho do código.

Teste 4 — Dr. Laureano:
  Ler clientes.yaml e confirmar que excluir_meta_monitoring: true está presente.

Teste 5 — H1 ainda ativo:
  Confirmar que fill_sheets.py sem --semana ainda é bloqueado pelo hook.

Me diga o resultado de cada teste.
```

### Critério de conclusão

- 5 testes passando
- Nenhum erro novo introduzido

---

### 🔖 HANDOFF — Fase 5 concluída

Abra nova sessão e cole:

```
Estou no PLANO-CORRECOES-PLANILHA.md do squad gestor-trafego-stark.
Fase 5 concluída — validação OK. Estado:

- Branch: fix/planilha-correcoes-junho
- Commits: A + B + C (todos prontos para push)
- Testes: encoding OK, SHEET_ID OK, match por gestor OK, Laureano OK, H1 OK
- Planilha já corrigida (Fase 3)

Próximo passo: FASE 6 — git push + pull request para main.
Chamar @devops.
```

---

## FASE 6 — Git Push + Pull Request (@devops)

> **Agente:** `/AIOX:agents:devops`
> **Pré-requisito:** Fase 5 concluída, todos os testes passando.

### O que será feito

1. Push do branch `fix/planilha-correcoes-junho` para o remote
2. Pull Request para `main` com título e descrição claros
3. Merge após aprovação

### O que pedir ao @devops (copiar e colar)

```
@devops — Fase 6 do PLANO-CORRECOES-PLANILHA.md.

Fazer push e criar PR do branch fix/planilha-correcoes-junho para main.

Branch local: fix/planilha-correcoes-junho
Commits incluídos:
  - fix(config): SHEET_ID correto + clientes.yaml atualizado (E1, E5, E6)
  - fix(planilha): match por gestor + encoding UTF-8 + colunas corretas (E2, E3, E4)
  - feat(hooks): H4 SHEET_ID + H5 colunas fórmula + H3 mensagem melhorada (E8, E9)

Título do PR: fix(planilha): correções pós-sessão junho — SHEET_ID, match por gestor, hooks

Corpo do PR:
## Problema
Sessão de preenchimento da planilha Junho (01/06–07/06) identificou 9 erros.
Documentado em: squads/gestor-trafego-stark/DEBUG-sessao-planilha-junho.md

## O que foi corrigido
- SHEET_ID atualizado para a planilha correta do squad
- clientes.yaml: Dr. Laureano com filtro automático, IDs Meta de IMCP e Dr. Leandro corrigidos
- fill_sheets.py: match de cliente restrito ao bloco do gestor (evita falsos positivos)
- fill_sheets.py: encoding UTF-8 declarado (fix Windows)
- fill_sheets.py: colunas com fórmula não são sobrescritas
- fetch-metrics.md: mapeamento de colunas correto (D/E/F/J/L/M/O/Q)
- Hooks H4 (SHEET_ID antigo) e H5 (colunas fórmula) adicionados
- Hook H3 com mensagem de erro mais clara

## Dados corrigidos diretamente na planilha (fora do código)
- M339: Leads Respondi Diego Gonzalez = 6
- [listar outras células corrigidas na Fase 3]

Fazer git push origin fix/planilha-correcoes-junho e criar o PR.
Me passar o link do PR quando estiver aberto.
```

### Critério de conclusão

- Branch publicado no remote
- PR aberto com título e corpo corretos
- Link do PR copiado aqui abaixo

**Link do PR:** _preencher após a Fase 6_

---

### 🔖 HANDOFF — Plano concluído

```
PLANO-CORRECOES-PLANILHA.md — CONCLUÍDO
Branch: fix/planilha-correcoes-junho (merged em main)
PR: [link]
Data: __/__/2026

Todos os 9 erros do DEBUG-sessao-planilha-junho.md foram resolvidos.
Próxima execução da planilha (Sem 2 de Junho) pode usar o pipeline corrigido.
```

---

## Referências

| Arquivo | Descrição |
|---------|-----------|
| `squads/relatorio-semanal/DEBUG-sessao-planilha-junho.md` | Lista completa dos 14 erros originais |
| `squads/gestor-trafego-stark/scripts/fill_sheets.py` | Script corrigido nas Fases 2 e 3 |
| `squads/gestor-trafego-stark/tasks/fetch-metrics.md` | Mapeamento de colunas correto |
| `squads/gestor-trafego-stark/data/clientes.yaml` | Configuração de clientes |
| `.claude/settings.json` | Hooks de proteção |
| `.claude/settings.local.json` | SHEET_ID e credenciais |

---

*Criado em 11/06/2026 — Aria (Architect) | squad gestor-trafego-stark*
