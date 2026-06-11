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
FASE:         SESSÃO 10 — G0 + Nova Gestora + Verificações
ETAPA:        S10-A ✅ | S10-C ✅ — clientes.yaml sincronizado com planilha | G0 e GS pendentes
PRÓXIMO:      S10-B (G0) — descoberta slugs via MCP Reportei | GS — @devops push + PR
AGENTE ATIVO: @dev (G0) / @devops (GS)
BRANCH:       feat/paralelismo-stark-chief
CHECKPOINT:   S10-C concluído em 2026-06-10 — distribuição clientes sincronizada
```

---

## SESSÃO 9 — Remapeamento Nova Planilha Google Sheets ✅ G1–G5 CONCLUÍDOS — 2026-06-10

### Contexto

A planilha Google Sheets foi trocada. A nova tem estrutura completamente diferente:
- **Antes:** uma aba por semana (`DD/MM/AAAA`), uma linha por cliente
- **Agora:** uma aba por mês (`Junho`, `Julho`...), 4 linhas por cliente (Sem 1–4) + linha "Média Mês"
- **Identificação:** coluna A = Gestor, coluna B = Cliente, coluna C = "Sem X" ou "Média Mês"
- **Novo SHEET_ID:** `16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM`
- **Checkpoint pré-mudança:** commit `134e808` (2026-06-10) — restaurar aqui se algo der errado

### Colunas que o script deve preencher (novas)

| Col | Métrica | Slug | Status |
|-----|---------|------|--------|
| D | TOFU invest (campanhas "[TOFU]" ou "[IMP]") | endpoint campanhas — confirmar | 🔍 G0 |
| E | Meta invest total | `meta` → `spend` | ✅ confirmado |
| F | Seguidores | `ig:new_followers_count` | ✅ confirmado |
| J | CTR Meta | a confirmar via MCP | 🔍 G0 |
| L | BOFU invest (campanhas leads/cadastros) | endpoint campanhas — confirmar | 🔍 G0 |
| M | Conversas WhatsApp | `messaging_conversation_started_7d` | ✅ confirmado |
| O | Leads META (formulário) | a confirmar via MCP | 🔍 G0 |
| P | Cadastros Respondi.app | métrica custom — confirmar slug via MCP | 🔍 G0 |
| R | CPA Google | a confirmar via MCP | 🔍 G0 |
| T | Google invest total | `google_adwords` | ✅ confirmado |

Colunas G, H, I, K, N, Q, S têm fórmulas — **nunca tocar.**

### Mapa de tarefas × agente × status

| ID | Tarefa | Agente | Status |
|----|--------|--------|--------|
| G0 | Descoberta de slugs via MCP Reportei | @dev | ⬜ PENDENTE |
| G1 | `config/settings.yaml` → novo SHEET_ID | @dev | ✅ ea49c6f |
| G2 | `data/clientes.yaml` → nova âncora `_sheet_cols` | @dev | ✅ 00f2706 |
| G3 | `scripts/fill_sheets.py` → reescrever funções de navegação e escrita | @dev | ✅ d0822af |
| G4 | `tasks/fetch-metrics.md` → slugs novos + colunas atualizadas | @dev | ✅ e8354ae |
| G5 | `squads/gestor-trafego-stark/CLAUDE.md` → descrição estrutura de abas | @dev | ✅ aec1a22 |
| GS | Push + PR repo Gustavo | @devops | ⬜ PENDENTE |

> Marcar `✅` em cada ID quando concluído. G0 deve ser concluído ANTES de G2–G4.

---

### BRIEFING COMPLETO PARA @dev — Sessão 9

> **Como usar:** abra nova sessão, chame `@dev` e cole o bloco abaixo.

---

**@dev Sessão 9 — Remapeamento Nova Planilha**

Contexto: a planilha Google Sheets do squad gestor-trafego-stark foi trocada. A nova planilha tem estrutura diferente. Preciso que você:

1. Faça a descoberta de slugs (G0) — sem tocar em nenhum arquivo ainda
2. Me mostre o resultado
3. Aguarde minha confirmação antes de implementar G1–G5

---

**G0 — Descoberta de slugs (FAZER PRIMEIRO, sem código)**

Use o MCP Reportei para explorar as métricas disponíveis. Execute as chamadas abaixo e me mostre a resposta completa (lista de métricas com slugs/refs):

```
1. get_project_metrics(project_id=688377, date_from="2026-06-02", date_to="2026-06-08")
   → listar TODOS os slugs/refs retornados — quero ver o JSON bruto
   → identificar: CTR Meta, Leads META, CPA Google, Cadastros Respondi

2. Verificar se existe endpoint de campanhas com spend individual por campanha
   → tentar: get_campaigns ou list_campaigns ou get_campaign_metrics
   → se existir: listar as campanhas do projeto 688377 para ver os nomes
   → objetivo: confirmar se filtragem por "[TOFU]" / "[IMP]" no nome é possível

3. Após ver os resultados, me informar:
   - Slug exato do CTR Meta
   - Slug exato dos Leads META (formulário)
   - Slug exato do CPA Google
   - Slug ou método para Cadastros Respondi (métrica customizada)
   - Se endpoint de campanhas existe: confirmar que filtragem por nome é viável
```

**Após G0 confirmado por mim, implementar nesta ordem:**

**G1 — `config/settings.yaml`**
- Trocar `SHEET_ID` para: `16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM`

**G2 — `data/clientes.yaml`**
- Substituir a âncora `_sheet_cols` atual pelas novas colunas:
  ```yaml
  _sheet_cols: &sheet_cols
    meta_spend_total: E        # Meta invest total
    tofu_spend: D              # TOFU — campanhas [TOFU] ou [IMP] (pendente G0)
    bofu_spend: L              # BOFU — campanhas leads/cadastros (pendente G0)
    seguidores: F              # Seguidores IG
    ctr: J                     # CTR Meta (slug a confirmar em G0)
    conversas: M               # Conversas WhatsApp
    leads_meta: O              # Leads META formulário (slug a confirmar em G0)
    cadastros_respondi: P      # Cadastros Respondi (slug a confirmar em G0)
    cpa_google: R              # CPA Google (slug a confirmar em G0)
    google_spend: T            # Google invest total
  ```
- Campos com slug pendente: adicionar comentário `# slug: pendente G0` ao lado
- **Todos os gestores** (vinicius, gustavo, andreyves, richard, luiz, mateus, thiago, wallison) usam a mesma âncora — remover quaisquer `sheet_columns: null`

**G3 — `scripts/fill_sheets.py`**

Reescrever 3 funções + lógica de escrita:

*Função 1 — `calcular_aba()`*
```python
# Antes: retornava "DD/MM/AAAA" (nome da aba semanal)
# Agora: retorna nome do mês em português (ex: "Junho")
MESES_PT = {1:"Janeiro",2:"Fevereiro",3:"Março",4:"Abril",5:"Maio",6:"Junho",
            7:"Julho",8:"Agosto",9:"Setembro",10:"Outubro",11:"Novembro",12:"Dezembro"}

def calcular_aba():
    hoje = datetime.date.today()
    dias = (hoje.weekday() + 1) % 7
    if dias == 0: dias = 7
    ultimo_domingo = hoje - datetime.timedelta(days=dias)
    segunda = ultimo_domingo - datetime.timedelta(days=6)
    return MESES_PT[segundo.month], segundo, ultimo_domingo
    # retorna: (nome_aba, data_inicio, data_fim)
```

*Função 2 — `calcular_sem_numero(data_inicio)`*
```python
# Nova função — calcula "Sem X" a partir da data de início da semana
def calcular_sem_numero(data_inicio):
    import math
    return f"Sem {math.ceil(data_inicio.day / 7)}"
    # Ex: dia 2 → "Sem 1", dia 9 → "Sem 2", dia 16 → "Sem 3", dia 23 → "Sem 4"
```

*Função 3 — `localizar_linha(sheet, nome_cliente, sem_numero)`*
```python
# Antes: buscava nome do cliente na coluna A
# Agora: busca linha onde coluna B = nome_cliente E coluna C = sem_numero
def localizar_linha(sheet, nome_cliente, sem_numero):
    dados = sheet.get_all_values()
    for i, linha in enumerate(dados):
        if len(linha) >= 3 and linha[1] == nome_cliente and linha[2] == sem_numero:
            return i + 1  # 1-indexed para gspread
    return None  # cliente/semana não encontrado
```

*Lógica de escrita:* usar `localizar_linha()` para encontrar a linha antes de qualquer escrita. Se retornar `None`: registrar aviso e pular cliente (não criar linha).

**G4 — `tasks/fetch-metrics.md`**
- Passo 1 (`calcular_aba`): atualizar para retornar mês + calcular `sem_numero`
- Passo 2 (verificar aba): buscar por nome de mês, não data
- Passo 3 (filtrar clientes): sem mudança
- Passo 4 (reutilizar métricas): sem mudança
- Passo 5 (buscar métricas): adicionar slugs novos confirmados em G0; campos pendentes → escrever `null` com aviso `[PENDENTE] slug não confirmado`
- Passo 6 (preencher planilha): atualizar mapeamento de colunas para as 10 novas colunas

**G5 — `squads/gestor-trafego-stark/CLAUDE.md`**
- Seção "Gestores com planilha Google Sheets": atualizar estrutura de abas
- Trocar: "uma aba por semana (`DD/MM/AAAA`)" por: "uma aba por mês (`Junho`, `Julho`...); 4 linhas por cliente (Sem 1–4) + Média Mês"
- Atualizar slugs conhecidos com os confirmados em G0

**Commits (um por tarefa):**
```
G0: sem commit (apenas descoberta)
G1: chore(config): atualizar SHEET_ID para nova planilha
G2: feat(dados): remapear sheet_columns — 10 colunas nova planilha
G3: feat(sheets): adaptar fill_sheets para estrutura mensal
G4: docs(tasks): fetch-metrics — slugs e colunas nova planilha
G5: docs(squad): CLAUDE.md — estrutura nova planilha mensal
```

---

### Sequência visual

```
G0  @dev   Descoberta slugs via MCP Reportei    → sem commit, me mostra resultado
│   ↓ (Vinicius confirma slugs)
G1  @dev   config/settings.yaml → SHEET_ID     ✅ ea49c6f
G2  @dev   clientes.yaml → _sheet_cols novas   ✅ 00f2706
G3  @dev   fill_sheets.py → 3 funções reescritas ✅ d0822af
G4  @dev   fetch-metrics.md → atualizado       ✅ e8354ae
G5  @dev   CLAUDE.md → estrutura atualizada    ✅ aec1a22
│
GS  @devops  push + PR repo Gustavo             ⬜ PENDENTE
```

---

## SESSÃO 10 — G0 + Nova Gestora + Verificações ⬜ PENDENTE

### Agenda

| # | Tarefa | Agente | Status |
|---|--------|--------|--------|
| S10-A | Verificações — comparação planilha × YAML | @dev | ✅ 2026-06-10 |
| S10-B | G0 — descoberta dos 6 slugs pendentes | @dev | ⬜ PENDENTE |
| S10-C | Sincronização clientes.yaml com planilha | @dev | ✅ 2026-06-10 |
| GS | Push + PR repo Gustavo | @devops | ⬜ PENDENTE |

**S10-C — O que foi feito:**
- Dr. Humberto movido de `vinicius` → `luiz`
- Desativados (saíram da carteira): Dr. Laureano Filho, Dr. Carlos Matheus, Dra. Mariângela Santiago
- Reativado Dr Juan Lopez (= Dr Juan Sanchez no Reportei) para `luiz`
- Reativado MaxiOral → `Dr. Daniel Rennó` para `wallison` (só Google)
- Novo cliente: Dra. Ana Cecília → `wallison`, META `1050461709389701`, Reportei pendente
- Pendente para depois: Stark Marketing (META `676220449475191`, sem Reportei próprio)

### BRIEFING PARA PRÓXIMA SESSÃO — S10-B (G0) + GS

> ✅ S10-A e S10-C concluídos (commit `7581e48` — 2026-06-10)
> **Falta:** S10-B (G0 slugs) → depois GS (push + PR)

---

#### PASSO 1 — Chamar `@dev` e colar:

**@dev — S10-B: G0 — descoberta de 6 slugs pendentes**

Contexto: squad `gestor-trafego-stark`, branch `feat/paralelismo-stark-chief`.
S10-A e S10-C concluídos (commit `7581e48`). Só falta o G0.

Use o MCP Reportei e execute:

```
get_project_metrics(project_id=688377, date_from="2026-06-02", date_to="2026-06-08")
→ listar TODOS os slugs/refs — mostrar JSON bruto para eu confirmar
→ identificar exatamente:
   - ctr               → CTR Meta Ads
   - leads_meta        → Leads META (formulário)
   - cpa_google        → CPA Google
   - cadastros_respondi → Cadastros Respondi.app (métrica customizada)
```

Verificar também se existe endpoint de campanhas com spend individual:
```
→ objetivo: confirmar filtragem por "[TOFU]" / "[IMP]" no nome da campanha
→ confirmar tofu_spend e bofu_spend
```

Após eu confirmar os slugs → atualizar os comentários `# slug: pendente G0` em:
- `squads/gestor-trafego-stark/data/clientes.yaml` → âncora `_sheet_cols`
- `squads/gestor-trafego-stark/tasks/fetch-metrics.md` → passo 5

Commit: `feat(dados): G0 — confirmar slugs pendentes CTR/leads/CPA/Respondi`

---

#### PASSO 2 — Depois que @dev terminar, chamar `@devops` e colar:

**@devops — GS: push + PR**

Push da branch `feat/paralelismo-stark-chief` e abrir PR com:
- Título: `feat(gestor-trafego-stark): Sessão 9+10 — nova planilha mensal + sync clientes`
- Descrição: remapeamento para planilha mensal (G1–G5) + sincronização de 91 clientes (S10-C) + slugs confirmados (G0)

---

## ✅ PLANO ORIGINAL CONCLUÍDO — 2026-06-07

```
FASE:         CONCLUÍDO ✔️ — todas as 6 sessões executadas
ETAPA:        SYNC FINAL concluído — squad publicado no repo do Gustavo
BRANCH:       feat/paralelismo-stark-chief (mergeada em main ✔️)
```

**Resumo do que foi entregue:**

| Sessão | Itens | Commit |
|--------|-------|--------|
| PRÉ | Hooks H1/H2/H3 | 847774d |
| 1 | D2 — cross-reference Reportei × Planilha | — (sem arquivo) |
| 2 | A0-a + A0-b — bugs de período | 782ab72 |
| 3 | A1 + A2 + A3 + C4 — fill_sheets.py | b7fb46e |
| 4 | C1 + C2 — lotes paralelos + rate limit | 6cb8700 |
| 5 | C3 + D1 — nome_reportei + clientes.yaml completo | c742250 |
| 6 | B2 — detecção multi-fonte Meta Ads | 0d1921e |
| 6 | B1 — histórico JSONL | ae52bbc |

**Destino final:** squad publicado em `gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego` — PR #2 mergeado em 2026-06-07.

---

## SESSÃO 7 — Bug E1: FASE 2 multi-gestor ✔️ CONCLUÍDO — 2026-06-08

### E1 — FASE 2 deve rodar para todos os gestores

**Bug identificado:** A planilha Google Sheets é **única e compartilhada** para todos os 8 gestores. Porém, `tasks/rotina-semanal.md` tinha uma condição que pulava a FASE 2 completamente para clientes não-Vinicius.

**O que foi implementado (Sessão 7 + Sessão 8):**

| Arquivo | Agente | O que mudou | Commit |
|---------|--------|------------|--------|
| `CLAUDE.md` | @architect | Planilha única para todos os gestores | (sessão anterior) |
| `tasks/rotina-semanal.md` | @dev | Removida condição Vinicius-only na FASE 2 | (sessão anterior) |
| `tasks/fetch-metrics.md` | @dev | `clientes_vinicius` → `clientes_ativos` (ativo: true) | b8ebc5a |
| `tasks/rotina-semanal.md` | @dev | Modo batch: digitar nome do gestor processa todos os seus clientes | ac6c489 |
| `data/clientes.yaml` | @dev | Comentário `sheet_columns` corrigido | b8ebc5a |

**Push para GitHub do Gustavo:** commit `34a923d` em `main` — 2026-06-08

---

## SESSÃO 8 — Correção fetch-metrics + modo batch por gestor ✔️ CONCLUÍDO — 2026-06-08

### F1 — fetch-metrics ainda filtrava só clientes do Vinicius

**Bug identificado:** O E1 da sessão anterior corrigiu `rotina-semanal.md` e `CLAUDE.md`, mas `fetch-metrics.md` (a task que FASE 2 chama de verdade) ainda tinha `vinicius in gestores AND ativo: true` — bloqueando Gustavo, Thiago, Wallison e todos os outros gestores.

**F2 — Novo modo batch por gestor**

**Feature adicionada:** `*rotina-semanal [nome-do-gestor]` agora funciona como modo batch — processa todos os clientes daquele gestor em lotes de 3. Exemplo: `*rotina-semanal thiago` → lista todos os clientes do Thiago → pede confirmação → roda o pipeline completo para cada um.

**Commits locais:**
- `b8ebc5a` — fix: E1 completo — fetch-metrics processa todos os gestores
- `ac6c489` — feat: modo batch por gestor no rotina-semanal

**Push para GitHub do Gustavo:** commit `34a923d` — 2026-06-08

---

## MANUAL_MAP — resultado do D2 (usar na Sessão 5)

> Cross-reference confirmado por Vinicius em 2026-06-06.
> 100 clientes com project_id validado. 15 saíram da carteira.

| nome_planilha | nome_reportei (exato no Reportei) | project_id |
|---|---|---|
| IMCP | IMCP - Instituto Mineiro de Cirurgia Plástica | 688377 |
| Dr Fernando Froes | Dr Fernando Froes | 448115 |
| Felipe Maximo | Dr Felipe Máximo | 469860 |
| Dr Fernando Suguita | Dr Fernando Suguita | 504343 |
| Dr Thiago Bandeira | Dr Thiago Bandeira | 526806 |
| Dr. Alexandre Calandrini | Dr Alexandre Calandrini | 545105 |
| Dr Matheus Manica | Dr Matheus Manica | 556442 |
| Dra Cecilia Ruiz | Dra Cecília | 564092 |
| Dr Juan Sanchez | Dr Juan Sanchez | 564095 |
| Dr Francisco Tribulato | Dr Francisco Tribulato | 564103 |
| Dr Lucas Consentino | Dr Lucas Consentino | 564106 |
| Dr Rodolfo Soares | Dr Rodolfo Soares | 564110 |
| Dr. Daniel Morais | Dr. Daniel Morais | 564114 |
| Dr Vinicius Camargo | Dr Vinicius Camargo | 564117 |
| Dr. Rafael Varella | Dr Rafael Varella | 573035 |
| Dr Victor Augusto | Dr Victor Augusto | 583406 |
| Dr Thiago Faria | Dr Thiago Faria | 583409 |
| Dr Thiago Souza | Dr Thiago Souza | 596243 |
| Dra Luana Rios | Dra Luana Rios | 608098 |
| Dr Marcelo Bezerra | Dr Marcelo Bezerra | 610559 |
| Dr Fabricio Camargo | Dr Fabrício Camargo | 621692 |
| Dr. Leandro Gontijio | Dr Leandro Gontijo | 627550 |
| Dr Carlos Matheus | Dr Carlos Matheus | 632306 |
| Dra Nicolli | Dra Nicolli | 642925 |
| Dr. Cadu Gazinelli | Dr Cadu Gazinelli | 656833 |
| Dr Ricardo Martins | Dr Ricardo Martins | 663715 |
| Graciela Machado | Graciela Machado | 672682 |
| Dr. Luiz Fernando | Dr. Luiz Fernando | 677267 |
| Dr. George | Dr. George Regis | 678927 |
| Dra. Marina Rossato | Dra. Marina Rossato | 693058 |
| Dr. Fernando Bezerra | Dr. Fernando Bezerra | 696403 |
| Dra Priscila Lotierzo | Dra. Priscilla Lotierzo | 715136 |
| Dr. Alvaro | Dr. Alvaro Rodrigues | 715143 |
| Dr. Fernando Franco | Dr. Fernando Franco | 715663 |
| Dr Charles Berres | Dr Charles berres | 747289 |
| Dr. Luiz Borba | Dr. Luiz Borba | 749199 |
| Ranieri | Dr. Raniéri | 751396 |
| Dr Anderson Kuboniwa | Dr Anderson Kuboniwa | 752930 |
| Dr. Marcelo Azevedo | Dr. Marcelo Azevedo | 765898 |
| Dr. Orozimbo | Dr. Orozimbo | 783368 |
| Dr Luis Fernando Garcia | Dr Luis Fernando Garcia | 787347 |
| Dra. Samille | Dra. Samille | 799544 |
| Dr Cleber Vieira | Dr Cleber Vieira | 820195 |
| Dra Lenise Franco | Dra Lenise Franco | 842867 |
| Dra. Taissa Recalde | Dra. Taissa Recalde | 846955 |
| Dra. Amandia Marchetti | Dra. Amandia Marchetti | 875147 |
| Dr. Joao Felippe | Dr. João Felippe | 886784 |
| Fernanda Encinas | Fernanda Encinas | 913731 |
| Dr. Laureano Filho | Dr. Laureano Filho | 982754 |
| Dr Eduardo Nakagawa | Dr Eduardo Nakagawa | 988324 |
| Dra Luana Girondi | Dra Luana Girondi | 989108 |
| Dra Fernanda Marcio | Dr Fernanda Marcio | 1005589 |
| Dr. Guilherme Mattar | Dr. Guilherme Mattar | 1023153 |
| Dra. Erica Marchiori | Dra. Érica Marchiori | 1025271 |
| MaxiOral | MaxiOral | 1026194 |
| Destra | Destra Desenvolvimentos | 1028218 |
| Dr Carlos Costa | Dr Carlos Costa | 1038469 |
| Dr. Eduardo Raulino | Dr. Eduardo Raulino | 1041425 |
| Dra. Viviane Borba | Dra Viviane Borba | 1042021 |
| Dr. Diego Alencar | Dr. Diego Alencar | 1064037 |
| ConciergeIA | ConciergeIA | 1070641 |
| Dr. Adriano Cicarelli | Dr. Adriano Cicarelli | 1072253 |
| Dra. Janete Clivea | Dra. Janete Clívea | 1077142 |
| Clinica Empoderatti | Clínica Empoderatti | 1077157 |
| Edson Prata | Edson Prata | 1077381 |
| Dr. David Zuluaga | Dr. David Zuluaga | 1089979 |
| Dr. Tulio Martins | Dr. Túlio Martins | 1095244 |
| Dra. Mariangela Santiago | Dra. Mariângela Santiago | 1097223 |
| Dr. Higner Forastieri | Dr. Higner Forastieri | 1097249 |
| Dr. Rafael Mello | Dr. Rafael Mello | 1101514 |
| Dra. Andrea Yuan | Dra. Andrea Yuan | 1105489 |
| Dra Luiza Coutinho | Dra Luiza Coutinho | 1106868 |
| Dr Marcus Calazans | Dr Marcus Calazans | 1109573 |
| Dr Daniel Valente | Dr Daniel Valente | 1112452 |
| Dr. Thiago Iria | Dr. Thiago Iria | 1122992 |
| Dr. Gilberto Filho | Dr. Gilberto Filho | 1126940 |
| Dr. Alessandro Miron | Dr. Alessandro Miron | 1147744 |
| Dr. Leandro Angel | Dr. Leandro Angel | 1148012 |
| Dra. Anne Groth | Dra. Anne Groth | 1152353 |
| Diego Gonzalez | Diego Gonzalez | 1157908 |
| Dr. Caio Fernandes | Dr. Caio Fernandes | 1170455 |
| Fernanda Comora | Fernanda Comora | 1181206 |
| Dr. Enzo Carvalho | Dr. Enzo Carvalho | 1195572 |
| Felipe Salles | Felipe Salles | 1198792 |
| Dra. Jussara | Dra. Jussara | 1206122 |
| Dr Luciano Esteves | Dr Luciano Esteves | 1217001 |
| Dr. Joel Abdala | Dr. Joel Abdala | 1218018 |
| Dr Javier Cucchiaro | Dr Javier Cucchiaro | 1218270 |
| Dra Juliana Jordao | Dra Juliana Jordão | 1219304 |
| Dr. Marcello Santos | Dr. Marcello Santos | 1222966 |
| IGO | IGO | 1230428 |
| Dr. Humberto | Dr. Humberto | 1233641 |
| Dr. Matheus Ocampo | Dr. Matheus Ocampo | 1233644 |
| Dra Nicolle | Dra Nicolle Andrade | 1235657 |
| Dra. Ivy Magri | Dra. Ivy Magri | 1243422 |
| Dra. Livia Dantas | Dra. Livia Dantas | 1243423 |
| Dra. Ana Paula | Dra. Ana Paula | 1251738 |
| Dr Thiago Lins | Dr Thiago Lins | 1256126 |
| Dr Enio Almeida | Dr Ênio Almeida | 1256423 |
| Dr. Daniel Curi | Dr. Daniel Curi | 1256454 |
| Dr Rodrigo Gomide | Dr Rodrigo Gomide | 1258235 |

**Saíram da carteira (15):** Dr Eduardo Uebel · Dr. Daniel Renne · Dra Danielle Gondim · Dra. Mariella · Dr. Renato Bacher · Dr. Lucas Nunes · Dr Juan Lopez · Dra Beathriz Goes · Dr Gabriel Campelo · Dra Ingrid Luckmann · Renato Donatelli · Dr Wilson Novaes · Aquatech · ANADEM · Stark Marketing

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
| B2 | Badge "dados parciais" no painel de alertas | Monitoramento | @architect (Aria) | 🔄 EM EXECUÇÃO | 6 |
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

── SYNC FINAL — Atualizar repo do Gustavo ──

O squad foi desenvolvido aqui (ViniStark00/calculadora-aiox) e precisa ser
copiado de volta para o repositório original após o merge do PR.

⚠️ Seguir o fluxo do GUIA-GIT-COLABORADORES.md (criado pelo Gustavo) — nunca
   editar direto no main, sempre via branch + PR para não sobrescrever mudanças dele.

Passos manuais (você executa):
1. Abrir o terminal na pasta do clone local de:
   https://github.com/gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego

2. Atualizar o main local:
   git checkout main
   git pull origin main

3. Criar branch própria:
   git checkout -b feat/vinicius-16-melhorias-stark-chief

4. Substituir a pasta squads/gestor-trafego-stark/ pelo conteúdo atualizado
   (copiar de ViniStark00/calculadora-aiox/squads/gestor-trafego-stark/)

5. Commitar:
   git add squads/gestor-trafego-stark/
   git commit -m "feat(gestor-trafego-stark): 16 melhorias — período, planilha, agentes, dados e monitoramento"

6. Push da branch:
   git push origin feat/vinicius-16-melhorias-stark-chief

7. Abrir PR no GitHub:
   https://github.com/gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego
   base: main ← compare: feat/vinicius-16-melhorias-stark-chief

8. Avisar Gustavo para revisar e fazer o merge

→ Squad disponível no destino final após merge ✅
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
PRÉ      /update-config    H1 + H2 + H3 (hooks)              → commit → push   ✔️
│
SESSÃO 1  @dev             D2 (cross-reference — sem arquivos) → SEM commit      ✔️
│
SESSÃO 2  @dev             A0-a + A0-b (bug fixes de período) → commit → push   ✔️
│
SESSÃO 3  @dev             A1 + A2 + A3 + C4 (fill_sheets.py) → commit → push  ✔️
│
SESSÃO 4  @dev             C1 + C2 (agentes: lotes + rate limit) → commit → push ✔️
│
SESSÃO 5  @dev             C3 + D1 (clientes.yaml completo)                        ✔️
│
SESSÃO 6  @architect       B2 (badge alerta-monitor.md)        → commit → push      ✔️
          @dev             B1 (histórico JSONL)                → commit → push      ✔️
          @devops          gh pr create + gh pr merge → BRANCH FECHADA              ✔️
│
SYNC      Você (manual)    feat/vinicius-paralelismo-stark-chief →
FINAL                      gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego
                           → PR #2 → merge → SQUAD NO DESTINO FINAL                ✔️
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
| CP-04 | 2026-06-06 | Execução | PRÉ-SESSÃO commitada e pushada (commit 847774d). Squad completo + hooks versionados. SESSÃO 1 (D2) concluída: 100 clientes mapeados Reportei × Planilha, 15 descartados. MANUAL_MAP salvo neste documento. | SESSÃO 2: @dev corrigir A0-a (edge case domingo em calcular_aba) + A0-b (substituir last_7d por datas fixas nos agentes). |
| CP-05 | 2026-06-06 | Execução | SESSÃO 2 concluída: A0-a (edge case domingo) + A0-b (last_7d → date_from/date_to) corrigidos. Commit 782ab72. SESSÃO 3 concluída: A1 (tab management + isolamento multi-gestor) + A2 (--dry-run) + A3 (validação de schema) + C4 (_to_float, retry 429, ARS) implementados em fill_sheets.py. Commit b7fb46e. | SESSÃO 4: @dev → C1 (lotes de 3 em paralelo nos agentes) + C2 (contador global rate limit Reportei). |
| CP-06 | 2026-06-07 | Execução | SESSÃO 4 concluída: C1/C2 commitados (6cb8700) e pushados. SESSÃO 5 concluída: D1 — clientes.yaml expandido com 8 gestores (andreyves, richard, luiz, mateus, thiago, wallison + novos gustavo, amanda), ~70 novos clientes, 11 reportei_project_ids preenchidos, 6 gestores atualizados, 3 marcados ativo:false, 8 inativos adicionados. C3 — campo nome_reportei adicionado em 34 entradas com divergência nome×Reportei. CLAUDE.md atualizado para 8 gestores. Commit c742250 pushado. Dr. Orozimbo (783368) confirmado fora da carteira. | SESSÃO 6: @architect → B2 (alerta-monitor.md) + @dev → B1 (histórico JSONL) + @devops → PR + merge + SYNC FINAL. |
| CP-07 | 2026-06-07 | Execução | SESSÃO 6 em andamento. B2 implementado em agents/alerta-monitor.md com escopo expandido: descoberto que lógica de reportei_fallback estava errada — Reportei entrega CPM/CTR/freq quando integração Meta Ads está ativa (confirmado via teste com Dr. Leandro Gontijo, project_id 627550). Lógica corrigida para 3 fontes: meta_ads_mcp / reportei_meta / reportei_sem_meta. Badge só dispara para reportei_sem_meta. CLAUDE.md atualizado com nova lógica de fallback. Aguardando commit @dev. | @dev commitar B2 → @dev implementar B1 → @devops push + PR + merge → SYNC FINAL. |
| CP-08 | 2026-06-07 | CONCLUÍDO | SESSÃO 6 concluída. B2 commitado (0d1921e) e B1 commitado (ae52bbc). PR #2 aberto e mergeado em gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego. SYNC FINAL executado: main local atualizado. Plano de paralelismo encerrado — todas as 16 melhorias aprovadas entregues. | — Plano encerrado. |
| CP-11 | 2026-06-10 | Sessão 9 | Arquitetura da migração para nova planilha mensal definida por Aria. Checkpoint 134e808 criado. Briefing completo do @dev escrito neste documento. Docs atualizados com Sessão 9. | G0: abrir nova sessão → @dev → descoberta de slugs via MCP Reportei → Vinicius confirma → G1–G5. |
| CP-12 | 2026-06-10 | Sessão 10 — S10-C | clientes.yaml sincronizado com distribuição real da planilha. 7 mudanças: Humberto→luiz, 3 saídas (Laureano, Carlos Matheus, Mariângela), Juan Lopez reativado→luiz, MaxiOral→Daniel Rennó→wallison, nova Dra. Ana Cecília→wallison. | S10-B (G0 slugs) + GS (push + PR). |
