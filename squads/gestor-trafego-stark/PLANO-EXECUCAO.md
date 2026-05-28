# PLANO DE EXECUÇÃO — Squad `gestor-trafego-stark`

> **Documento mestre de continuidade.** Self-contained: qualquer nova sessão lê este arquivo
> e sabe exatamente onde parar e o que fazer a seguir.
>
> **Regra de ouro:** Ao concluir uma etapa → atualizar o status aqui → fazer commit → nova sessão
> começa lendo este arquivo.

---

## 🧭 COMO RETOMAR EM NOVA SESSÃO

1. Ler este documento inteiro (especialmente seção "STATUS ATUAL" abaixo)
2. Ver qual etapa está `→ PRÓXIMA` ou `⏳ EM ANDAMENTO`
3. Ler o **Handoff da etapa anterior** (se houver)
4. Acionar o agente AIOX indicado para aquela etapa
5. Ao concluir: atualizar status + fazer commit com mensagem padronizada

**Prompt de retomada para nova sessão:**
```
Leia o arquivo squads/gestor-trafego-stark/PLANO-EXECUCAO.md e continue
a criação do squad gestor-trafego-stark a partir da próxima etapa pendente.
```

---

## 📊 STATUS ATUAL

| Etapa | Agente | Descrição | Status |
|-------|--------|-----------|--------|
| 0 | @analyst | Análise + Plano | ✅ CONCLUÍDA |
| 1 | @architect | Design da Arquitetura | ✅ CONCLUÍDA |
| 2 | @pm | Criação do Epic | ✅ CONCLUÍDA |
| 3 | @sm | Criação das Stories | ✅ CONCLUÍDA |
| 4 | @po | Validação das Stories | ✅ CONCLUÍDA |
| 5A | @dev | Estrutura Base + Dados | → PRÓXIMA |
| 5B | @dev | Agentes Tier 0 e Tier 2 | ⬜ AGUARDANDO |
| 5C | @dev | Agentes Tier 1 Grupo A | ⬜ AGUARDANDO |
| 5D | @dev | Agentes Tier 1 Grupo B | ⬜ AGUARDANDO |
| 5E | @dev | Tasks e Workflows | ⬜ AGUARDANDO |
| 6 | @qa | Testes de Integração | ⬜ AGUARDANDO |
| 7 | @devops | Commit e PR | ⬜ AGUARDANDO |

**Última atualização:** 2026-05-28
**Próxima ação:** Iniciar Etapa 5A com @dev (Dex) — implementar squad base + dados (stories GTS-001.01 + GTS-001.02)

---

## 🎯 CONTEXTO DO PROJETO

### O que é o squad gestor-trafego-stark?

Um **novo squad criado do zero** que unifica o melhor de dois squads existentes:
- `squads/gestor-trafego-vinicius` (relatorio-semanal) — squad do Vinicius
- `squads/gestor-trafego-gustavo` (gestor-trafego-ia) — squad do Gustavo

**NÃO é uma modificação de nenhum dos dois.** É um squad novo, independente,
que aproveita as melhores partes de cada um.

### Os dois gestores

- **Vinicius Lima** — Stark Marketing, bloco "Vinicius" na planilha
- **Gustavo Radler** — Stark Marketing, carteira de 11 clientes médicos

O squad unificado serve a ambos os gestores.

### As 4 rotinas que o squad automatiza

| # | Rotina | Frequência | Descrição |
|---|--------|-----------|-----------|
| 1 | Monitoramento de contas | Diária | Alertas por threshold de especialidade médica |
| 2 | Preenchimento de planilha | Semanal | Reportei → Google Sheets (bloco Vinicius) |
| 3 | Relatório Reportei | Semanal | Narrativa + HTML timeline + marco publicado |
| 4 | Status Report ClickUp | Semanal | Narrativa de ações da semana no ClickUp |

---

## 🏗️ ARQUITETURA DEFINIDA (Etapa 0)

### Estrutura de agentes

```
Tier 0 — ORQUESTRADOR
  └── stark-chief.md           ← Fusão: gestor-chief + relatorio-chief

Tier 1 — DOMÍNIO
  ├── coletor.md               ← Do squad Vinicius (+ Meta Ads MCP como fallback)
  ├── redator.md               ← Do squad Vinicius (+ suporte a HTML timeline)
  ├── publicador.md            ← Do squad Vinicius (sem alterações)
  ├── whatsapp-writer.md       ← Do squad Vinicius (sem alterações)
  ├── contexto-cliente.md      ← Do squad Vinicius (sem alterações)
  ├── alerta-monitor.md        ← Do squad Gustavo (thresholds por especialidade)
  ├── clickup-writer.md        ← Do squad Gustavo (status report narrativo)
  └── task-monitor.md          ← Do squad Gustavo (inbox + auto-verify)

Tier 2 — QUALIDADE
  └── validator.md             ← Do squad Gustavo (+ acrescenta sheets-gate)
```

### Estrutura de arquivos do novo squad

```
squads/gestor-trafego-stark/
├── PLANO-EXECUCAO.md          ← ESTE ARQUIVO (documento mestre)
├── CLAUDE.md                  ← Briefing unificado
├── README.md                  ← Documentação de uso
├── squad.yaml                 ← Manifest do squad
├── agents/
│   ├── stark-chief.md
│   ├── coletor.md
│   ├── redator.md
│   ├── publicador.md
│   ├── whatsapp-writer.md
│   ├── contexto-cliente.md
│   ├── alerta-monitor.md
│   ├── clickup-writer.md
│   ├── task-monitor.md
│   └── validator.md
├── tasks/
│   ├── fetch-metrics.md
│   ├── verify-fill.md
│   ├── generate-report.md
│   ├── validate-report.md
│   ├── publish-timeline.md
│   ├── save-history.md
│   ├── preencher-clickup.md
│   ├── monitorar-contas.md
│   ├── rotina-diaria.md
│   └── rotina-semanal.md       ← ARQUIVO MAIS IMPORTANTE (fusão)
├── workflows/
│   └── weekly-pipeline.md
├── templates/
│   ├── relatorio-template.md
│   ├── whatsapp-template.md
│   └── contexto-cliente-template.md
├── checklists/
│   ├── sheets-gate.md          ← NOVO (não existe nos squads originais)
│   ├── relatorio-gate.md
│   ├── alertas-gate.md
│   └── clickup-gate.md
├── data/
│   ├── clientes.yaml           ← FUSÃO dos dois squads
│   ├── thresholds-por-especialidade.yaml
│   └── historico-clientes.yaml (gerado em runtime, gitignored)
└── config/
    └── settings.yaml
```

### Comandos do stark-chief

| Comando | Descrição |
|---------|-----------|
| `*rotina-diaria` | Alertas de todas as contas + inbox de tarefas |
| `*rotina-semanal [cliente]` | Pipeline completo: monitor → sheets → relatório → clickup |
| `*planilha [cliente]` | Só preencher Google Sheets |
| `*relatorio-reportei [cliente]` | Só gerar relatório Reportei |
| `*status-report-clickup [cliente]` | Só escrever status no ClickUp |
| `*monitorar-contas` | Só monitoramento e alertas |
| `*monitor-tarefas` | Só inbox do ClickUp |

---

## 📋 DETALHAMENTO DAS ETAPAS

---

### ETAPA 1 — Design da Arquitetura
**Agente:** `@architect (Aria)`
**Commit ao concluir:** `docs(gestor-trafego-stark): add DESIGN.md — arquitetura do squad unificado`
**Status:** → PRÓXIMA

#### Briefing para @architect

> Você vai projetar o squad `gestor-trafego-stark` — um squad novo criado do zero
> que unifica o melhor de dois squads de gestão de tráfego pago médico da Stark Marketing.
>
> **Squads de referência (apenas leitura — não serão modificados):**
> - `squads/gestor-trafego-vinicius/` (relatorio-semanal)
> - `squads/gestor-trafego-gustavo/` (no GitHub, acesse via `gh api`)
>
> **O que você precisa produzir:**
>
> 1. Validar a hierarquia de agentes proposta em `PLANO-EXECUCAO.md` (seção Arquitetura):
>    - Algum agente precisa ser desmembrado ou fundido?
>    - A separação Tier 0/1/2 faz sentido?
>
> 2. Definir o modelo de dados de `data/clientes.yaml`:
>    - Campos obrigatórios vs opcionais
>    - Como unificar o `clientes-config.yaml` do Vinicius com o `clientes.md` do Gustavo
>    - Campos novos: `gestor` (vinicius|gustavo), `sheet_columns` (para Vinicius), `meta_ad_account_id` (para Gustavo)
>
> 3. Projetar o fluxo da `rotina-semanal` fundida:
>    - Como passar dados do alerta-monitor para o coletor sem buscar duas vezes?
>    - Ordem exata das 6 fases
>    - Quais fases podem ser paralelizadas?
>
> 4. Definir o `sheets-gate` (novo, não existe nos squads originais):
>    - O que valida antes de considerar o preenchimento do Sheets completo?
>
> 5. Produzir o arquivo `squads/gestor-trafego-stark/DESIGN.md` com:
>    - Diagrama de fluxo da rotina-semanal (ASCII)
>    - Decisões arquiteturais + rationale
>    - Modelo de dados de clientes.yaml
>    - Definição do sheets-gate
>
> **Restrição:** Este é um squad novo. Não copie arquivos dos squads antigos — apenas use-os como referência de conteúdo.

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 1
status: concluida
arquivos_criados:
  - squads/gestor-trafego-stark/DESIGN.md
decisoes_tomadas:
  - ADR-01: gestores é array (não scalar) — 2 clientes compartilhados identificados
  - ADR-02: monitor-diario.md do Vinicius absorvido pelo alerta-monitor (não importar)
  - ADR-03: reportei-writer.md do Gustavo excluído (manter separação redator/publicador)
  - ADR-04: reuso parcial de métricas FASE 1→2 via metricas_coletadas dict
  - ADR-05: fases 4+5 da rotina-semanal em paralelo (publicador + clickup-writer)
  - ADR-06: thresholds CPM adotam o valor mais conservador entre os dois squads
  - ADR-07: Dr. Laureano Filho usa especialidade cirurgia_ortognatica (dado do Vinicius, mais específico)
clientes_compartilhados:
  - Dr. Laureano Filho (reportei_project_id 982754 — presente em ambos os squads)
  - Dra. Nicolli (reportei_project_id 642925 — gestores [vinicius, gustavo])
pendencias:
  - IDs Reportei de 8 clientes Vinicius estão marcados como "a confirmar" em DESIGN.md seção 2.4
  - meta_ad_account_id dos clientes Gustavo não estão em data/clientes.md — precisam ser preenchidos manualmente na Etapa 5A
proxima_etapa: 2
```

---

### ETAPA 2 — Criação do Epic
**Agente:** `@pm (Morgan)`
**Commit ao concluir:** `docs(gestor-trafego-stark): add EPIC-GTS-001 — epic de criação do squad`
**Status:** ⬜ AGUARDANDO

#### Briefing para @pm

> Com base no `squads/gestor-trafego-stark/DESIGN.md` (criado na Etapa 1),
> crie o epic `GTS-001` para o squad `gestor-trafego-stark`.
>
> **Stories obrigatórias:**
> - GTS-001.01 — Estrutura base (squad.yaml, CLAUDE.md, README.md)
> - GTS-001.02 — Arquivos de dados (clientes.yaml, thresholds, config)
> - GTS-001.03 — Agentes Tier 0 e Tier 2 (stark-chief + validator)
> - GTS-001.04 — Agentes Tier 1 grupo A (coletor, redator, publicador, whatsapp-writer, contexto-cliente)
> - GTS-001.05 — Agentes Tier 1 grupo B (alerta-monitor, clickup-writer, task-monitor)
> - GTS-001.06 — Tasks e workflows (todas as tasks + rotina-semanal fundida)
> - GTS-001.07 — Testes de integração end-to-end
>
> **Dependências entre stories:**
> - 5A (01+02) deve ser implementada antes de 5B, 5C, 5D
> - 5B, 5C, 5D devem ser implementadas antes de 5E
> - 5E deve ser implementada antes do QA (06/07)
>
> **Usar o template de epic do AIOX.**
> Salvar em `docs/epics/GTS-001-EXECUTION.yaml`.

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 2
status: concluida
arquivos_criados:
  - docs/epics/GTS-001-EXECUTION.yaml
  - docs/stories/gestor-trafego-stark/  # diretório criado (vazio — Etapa 3 popula)
decisoes_tomadas:
  - 7 stories mapeadas para etapas de implementação (5A a 6)
  - Stories 01+02 paralelas (Etapa 5A); 03+04+05 paralelas (Etapas 5B/5C/5D)
  - Story 06 depende de 03+04+05; Story 07 depende de 06
  - 37 arquivos no total documentados por story
  - Critérios de aceite definidos por story (total: ~60 critérios verificáveis)
pendencias:
  - Stories detalhadas precisam ser criadas na Etapa 3 (@sm River)
  - docs/stories/gestor-trafego-stark/GTS-001.0X.story.md para cada uma das 7 stories
proxima_etapa: 3
```

---

### ETAPA 3 — Criação das Stories
**Agente:** `@sm (River)`
**Commit ao concluir:** `docs(gestor-trafego-stark): add stories GTS-001.01 a GTS-001.07`
**Status:** ⬜ AGUARDANDO

#### Briefing para @sm

> Com base no epic `docs/epics/GTS-001-EXECUTION.yaml`, crie as 7 stories.
>
> **Para cada story:**
> - Usar o template padrão AIOX
> - Critérios de aceite objetivos e verificáveis (não subjetivos)
> - Lista de arquivos que serão criados/modificados
> - Dependências explícitas entre stories
>
> **Critérios obrigatórios específicos:**
> - Story GTS-001.02: `data/clientes.yaml` contém todos os clientes de ambos os gestores sem duplicatas
> - Story GTS-001.06: `rotina-semanal` executa sem buscar métricas duas vezes (dados do monitor são passados como parâmetro)
> - Story GTS-001.07: Executar `*rotina-semanal` para pelo menos 1 cliente de cada gestor sem erro
>
> **Path destino:** `docs/stories/gestor-trafego-stark/GTS-001.0X.story.md`

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 3
status: concluida
arquivos_criados:
  - docs/stories/gestor-trafego-stark/GTS-001.01.story.md
  - docs/stories/gestor-trafego-stark/GTS-001.02.story.md
  - docs/stories/gestor-trafego-stark/GTS-001.03.story.md
  - docs/stories/gestor-trafego-stark/GTS-001.04.story.md
  - docs/stories/gestor-trafego-stark/GTS-001.05.story.md
  - docs/stories/gestor-trafego-stark/GTS-001.06.story.md
  - docs/stories/gestor-trafego-stark/GTS-001.07.story.md
decisoes_tomadas:
  - Cada story tem user story + contexto + arquivos a criar + criterios de aceite + DoD + notas
  - Criterios obrigatorios especiais incluidos:
    - GTS-001.02: criterio de ausencia de duplicatas + IDs Reportei confirmados listados
    - GTS-001.06: criterio de 6 fases em ordem + metricas_coletadas na FASE 2 + paralelo 4+5
    - GTS-001.07: criterio de executar *rotina-semanal (QA-05) + 7 criterios QA objetivos
  - Interface metricas_coletadas documentada em GTS-001.04 e GTS-001.05 (contrato produtor/consumidor)
  - Logica de fallback do alerta-monitor (meta_ad_account_id null → Reportei) documentada em GTS-001.05
pendencias:
  - Stories precisam ser validadas pelo @po (Etapa 4) antes da implementacao
proxima_etapa: 4
```

---

### ETAPA 4 — Validação das Stories
**Agente:** `@po (Pax)`
**Commit ao concluir:** `docs(gestor-trafego-stark): stories validadas pelo PO — GO para implementação`
**Status:** ⬜ AGUARDANDO

#### Briefing para @po

> Valide cada uma das 7 stories em `docs/stories/gestor-trafego-stark/` usando o checklist de 10 pontos.
>
> **Para cada story, verificar:**
> 1. Critérios de aceite mensuráveis e verificáveis?
> 2. Escopo claro (sem invenções fora do plano)?
> 3. Dependências mapeadas corretamente?
> 4. Arquivos de destino especificados?
> 5. Executável por um @dev sem ambiguidade?
> 6. Nenhuma story tenta modificar os squads antigos (vinicius/gustavo)?
>
> **Decisão por story:** GO (score >= 7) ou NO-GO (retorna para @sm com lista de correções)
>
> Atualizar status de cada story no arquivo correspondente.

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 4
status: concluida
stories_aprovadas:
  - GTS-001.01  # 10/10 — GO
  - GTS-001.02  # 10/10 — GO
  - GTS-001.03  # 10/10 — GO
  - GTS-001.04  # 10/10 — GO
  - GTS-001.05  # 10/10 — GO
  - GTS-001.06  # 9.9/10 — GO (escopo 18 arquivos aceitavel — definido no PLANO)
  - GTS-001.07  # 10/10 — GO
stories_reprovadas: []
observacoes:
  - GTS-001.06: escopo amplo (18 arquivos). Dev deve criar checklists/templates antes das tasks. rotina-semanal.md deve ser o ultimo arquivo.
  - Contrato metricas_coletadas documentado em ambas as stories 04 e 05 — elimina risco de interface incompativel.
pendencias: []
proxima_etapa: 5A
```

---

### ETAPA 5A — Estrutura Base + Dados
**Agente:** `@dev (Dex)`
**Story:** GTS-001.01 + GTS-001.02
**Commit ao concluir:** `feat(gestor-trafego-stark): add squad base — squad.yaml CLAUDE.md README.md data/ [Story GTS-001.01 + GTS-001.02]`
**Status:** ⬜ AGUARDANDO

#### Briefing para @dev

> Implementar a estrutura base do NOVO squad em `squads/gestor-trafego-stark/`.
> **Este é um squad novo — não copie arquivos dos squads antigos.**
> Use os squads antigos apenas como referência de conteúdo.
>
> **Arquivos a criar:**
>
> **squad.yaml** — Manifest do squad (baseado na estrutura do squad Vinicius, mas com:
> - name: gestor-trafego-stark
> - description: Squad unificado Stark — automatiza as 4 rotinas do gestor de tráfego
> - todos os componentes: 9 agents + 10 tasks + 4 checklists + 3 templates + workflows
> - integrações: Reportei API, Google Sheets, Meta Ads MCP, Drive MCP, ClickUp MCP
> - heuristics/absolute_vetos: unificação dos vetos de ambos os squads
> - pipeline_flow: stark-chief → rotina ativada → agents → validator → output
>
> **CLAUDE.md** — Briefing unificado com:
> - Identidade: Squad unificado, dono: Vinicius + Gustavo
> - As 4 rotinas (tabela com agente responsável e output)
> - Regras de voz do redator (do squad Vinicius — lista de palavras proibidas)
> - Restrições técnicas (ambos os squads)
> - Credenciais necessárias
>
> **README.md** — Documentação com:
> - Tabela antes/depois (tempo economizado por rotina)
> - Como usar (comandos do stark-chief)
> - Estrutura de arquivos
> - Pré-requisitos
>
> **data/clientes.yaml** — Arquivo UNIFICADO com:
>   - Todos os clientes do squad Vinicius (de `config/clientes-config.yaml`)
>   - Todos os clientes do squad Gustavo (de `data/clientes.md` no GitHub)
>   - Campos de cada cliente:
>     ```yaml
>     - nome: "Nome Completo"
>       slug: "nome-slug"
>       gestor: vinicius | gustavo   # NOVO — indica qual gestor é responsável
>       especialidade: medicina_estetica | tricologia | etc.
>       meta_cpl: null | número
>       reportei_project_id: número
>       meta_ad_account_id: null | "act_XXXXXXXXX"  # do squad Gustavo
>       clickup_status_list_id: "XXXXXXX" | "TODO"
>       sheet_columns: null | {spend: "C", leads: "E", ...}  # só para clientes Vinicius
>       nome_whatsapp: "Dra. Fulana" | "pessoal"  # para mensagem WhatsApp
>       prioridade: 1..N
>       nota: "observação relevante"
>     ```
>   Clientes do Vinicius: buscar em squads/gestor-trafego-vinicius/config/clientes-config.yaml
>   Clientes do Gustavo: buscar em squads/gestor-trafego-gustavo no GitHub
>     (gh api repos/gustavoradler-cyber/.../contents/squads/gestor-trafego-gustavo/data/clientes.md)
>
> **data/thresholds-por-especialidade.yaml** — Baseado no squad Gustavo
>   (buscar: squads/gestor-trafego-gustavo/data/thresholds-por-especialidade.md)
>   Converter de MD para YAML estruturado.
>
> **config/settings.yaml** — Configurações do squad:
>   - rate_limit Reportei
>   - fuzzy_match_threshold
>   - lote_paralelo (tamanho do lote para modo multi-cliente)

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 5A
status: pendente
arquivos_criados: []
clientes_vinicius_count: 0
clientes_gustavo_count: 0
total_clientes_yaml: 0
pendencias: []
proxima_etapa: 5B
```

---

### ETAPA 5B — Agentes Tier 0 e Tier 2
**Agente:** `@dev (Dex)`
**Story:** GTS-001.03
**Commit ao concluir:** `feat(gestor-trafego-stark): add stark-chief validator [Story GTS-001.03]`
**Status:** ⬜ AGUARDANDO

#### Briefing para @dev

> Criar os 2 agentes estruturais do squad. Escrever do zero (não copiar).
>
> **agents/stark-chief.md** — Orquestrador principal (Tier 0):
> - Herda o estilo direto e operacional do gestor-chief
> - Herda a lógica de resolução de cliente (manual_map + fuzzy 0.60) do relatorio-chief
> - Herda o modo multi-cliente paralelo do relatorio-chief
> - Suporta os 7 comandos: rotina-diaria, rotina-semanal, planilha, relatorio-reportei,
>   status-report-clickup, monitorar-contas, monitor-tarefas
> - Routing rules claras por palavra-chave
> - Tier 0 — único ponto de contato do usuário com o squad
> - NUNCA executa lógica de domínio — apenas roteia
> - SEMPRE aguarda gate do @validator antes de entregar output final
> - Referencia: data/clientes.yaml (não config/clientes-config.yaml)
>
> **agents/validator.md** — Gate de qualidade (Tier 2):
> - Herda os 3 gates do squad Gustavo: gate_clickup, gate_reportei, gate_alertas
> - Adiciona gate_sheets (NOVO):
>   ```
>   gate_sheets:
>     checklist:
>       - "[ ] Todos os campos obrigatórios do cliente preenchidos (conforme data/clientes.yaml)"
>       - "[ ] Período correto (segunda a domingo da semana anterior)"
>       - "[ ] Nenhum valor vazio (zero é aceitável; vazio não)"
>       - "[ ] Confirmação do script fill_sheets.py com exit code 0"
>       - "[ ] Número de linhas preenchidas bate com clientes ativos do bloco"
>   ```
> - PASS libera output | FAIL retorna ao agente com lista exata
> - Referencia: checklists/sheets-gate.md, checklists/relatorio-gate.md, etc.

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 5B
status: pendente
arquivos_criados: []
pendencias: []
proxima_etapa: 5C
```

---

### ETAPA 5C — Agentes Tier 1 Grupo A
**Agente:** `@dev (Dex)`
**Story:** GTS-001.04
**Commit ao concluir:** `feat(gestor-trafego-stark): add tier1-A agents — coletor redator publicador whatsapp contexto [Story GTS-001.04]`
**Status:** ⬜ AGUARDANDO

#### Briefing para @dev

> Criar os 5 agentes do grupo A. Escrever do zero (não copiar).
> Use os agentes do squad Vinicius como referência de conteúdo,
> mas escreva para o novo squad com os novos paths.
>
> **agents/coletor.md** — Coleta métricas (Tier 1):
> - Fonte primária: Reportei API (get_project_metrics, get_metrics)
> - Fonte alternativa: Meta Ads MCP (quando Reportei falhar ou para complemento)
> - Preenche Google Sheets via fill_sheets.py
> - Referencia: data/clientes.yaml
> - ACEITA dados pré-coletados do alerta-monitor como parâmetro (evita dupla busca na rotina-semanal)
>
> **agents/redator.md** — Gera narrativa (Tier 1):
> - Regras de voz do squad Vinicius (palavras proibidas completas)
> - Suporte a geração de HTML para timeline do Reportei
> - Tom: neutro e informativo
> - Recebe métricas + contexto do Drive
>
> **agents/publicador.md** — Publica no Reportei (Tier 1):
> - Cria marco de timeline via MCP create_timeline_event
> - Passa dados para whatsapp-writer ao concluir
> - Referencia: data/clientes.yaml (reportei_project_id)
>
> **agents/whatsapp-writer.md** — Formata mensagem (Tier 1):
> - Regras de saudação por horário (bom dia/boa tarde/boa noite)
> - Regras de campo [INVESTIMENTO] (Meta + Google / só Meta / só Google)
> - Omite linha CPL quando conversas = 0
>
> **agents/contexto-cliente.md** — Gerencia contexto no Drive (Tier 1):
> - LEITURA: antes do pipeline (não-bloqueante — falha → continua)
> - ATUALIZAÇÃO: ao final do pipeline (não-bloqueante)
> - Pasta Drive: "Contexto Clientes - Stark"
> - Documento por cliente: "Contexto - {nome_cliente}"

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 5C
status: pendente
arquivos_criados: []
pendencias: []
proxima_etapa: 5D
```

---

### ETAPA 5D — Agentes Tier 1 Grupo B
**Agente:** `@dev (Dex)`
**Story:** GTS-001.05
**Commit ao concluir:** `feat(gestor-trafego-stark): add tier1-B agents — alerta-monitor clickup-writer task-monitor [Story GTS-001.05]`
**Status:** ⬜ AGUARDANDO

#### Briefing para @dev

> Criar os 3 agentes do grupo B. Escrever do zero (não copiar).
> Use os agentes do squad Gustavo como referência de conteúdo.
>
> **agents/alerta-monitor.md** — Monitora métricas (Tier 1):
> - Itera sobre clientes em data/clientes.yaml (não data/clientes.md)
> - Thresholds em data/thresholds-por-especialidade.yaml
> - Meta Ads MCP: lookback last_3d (CPM/CTR/kill-switch) e last_7d (frequência)
> - Reportei MCP: complemento para PoP e Google Ads
> - Classifica: 🔴 CRÍTICO / 🟡 ATENÇÃO / ℹ️ INFO
> - NUNCA recomenda ação de campanha — apenas notifica
> - NOVO: ao final, disponibiliza dict de métricas coletadas para reutilização pelo coletor
>
> **agents/clickup-writer.md** — Status report ClickUp (Tier 1):
> - Reconstitui ações da semana cruzando 4 fontes (Meta Ads MCP, Reportei, Gmail, ClickUp)
> - Narrativa em 1ª pessoa do plural, tom estratégico
> - Doc alvo: "Status Report - Gustavo" E "Status Report - Vinicius" (conforme gestor do cliente)
> - Apresenta draft para aprovação antes de escrever
> - Referencia: data/clientes.yaml (clickup_status_list_id, gestor)
>
> **agents/task-monitor.md** — Monitor de inbox (Tier 1):
> - Lista tasks abertas por assignee (Vinicius ou Gustavo)
> - Verifica automaticamente via MCP quais já foram executadas
> - Organiza por urgência: 🔴 atrasado / 🟡 vence hoje / ✅ em dia
> - Referencia: data/clientes.yaml

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 5D
status: pendente
arquivos_criados: []
pendencias: []
proxima_etapa: 5E
```

---

### ETAPA 5E — Tasks e Workflows
**Agente:** `@dev (Dex)`
**Story:** GTS-001.06
**Commit ao concluir:** `feat(gestor-trafego-stark): add tasks workflows — rotina-semanal completa [Story GTS-001.06]`
**Status:** ⬜ AGUARDANDO

#### Briefing para @dev

> Criar todas as tasks e workflows. Escrever do zero.
> Este é o arquivo mais crítico: **tasks/rotina-semanal.md**.
>
> **Tasks herdadas do squad Vinicius (reescrever para novo squad):**
> - tasks/fetch-metrics.md
> - tasks/verify-fill.md
> - tasks/generate-report.md
> - tasks/validate-report.md
> - tasks/publish-timeline.md
> - tasks/save-history.md
>
> **Tasks herdadas do squad Gustavo (reescrever para novo squad):**
> - tasks/monitorar-contas.md
> - tasks/preencher-clickup.md
>
> **Task nova (fusão):**
> - tasks/rotina-diaria.md — alertas + task monitor
>
> **Task MAIS IMPORTANTE — tasks/rotina-semanal.md (fusão total):**
> ```
> FASE 1 — MONITORAMENTO
>   @alerta-monitor → métricas Meta Ads + alertas por severidade
>   @validator → gate_alertas
>   ↓ alertas_ativos + metricas_coletadas → passados para FASE 2
>
> FASE 2 — PLANILHA GOOGLE SHEETS (só clientes do Vinicius)
>   @coletor → REUTILIZA metricas_coletadas da FASE 1 (sem nova chamada à API)
>   @coletor → fill_sheets.py → preenche planilha
>   @validator → gate_sheets
>   ↓
>
> FASE 3 — NARRATIVA DO RELATÓRIO
>   @contexto-cliente LEITURA (não-bloqueante)
>   @redator → gera narrativa + HTML timeline
>   @validator → gate_reportei (texto e HTML)
>   ↓
>
> FASE 4 — PUBLICAÇÃO REPORTEI + WHATSAPP
>   @publicador → cria relatório + marco timeline
>   @whatsapp-writer → mensagem formatada
>   ↓
>
> FASE 5 — STATUS REPORT CLICKUP
>   @clickup-writer → draft para aprovação → escreve no ClickUp
>   @validator → gate_clickup
>   ↓
>
> FASE 6 — WRAP-UP (paralelo, não-bloqueante)
>   @coletor → save-history
>   @contexto-cliente ATUALIZAÇÃO
>   @task-monitor → marca tarefas concluídas no ClickUp
> ```
>
> **Workflows:**
> - workflows/weekly-pipeline.md — documentação macro do fluxo (não executável)
>
> **Checklists:**
> - checklists/sheets-gate.md
> - checklists/relatorio-gate.md (do squad Gustavo)
> - checklists/alertas-gate.md (do squad Gustavo)
> - checklists/clickup-gate.md (do squad Gustavo)

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 5E
status: pendente
arquivos_criados: []
rotina_semanal_fases: 6
pendencias: []
proxima_etapa: 6
```

---

### ETAPA 6 — QA + Testes de Integração
**Agente:** `@qa (Quinn)`
**Story:** GTS-001.07
**Commit ao concluir:** `test(gestor-trafego-stark): QA PASS — squad aprovado para produção [Story GTS-001.07]`
**Status:** ⬜ AGUARDANDO

#### Briefing para @qa

> Testar o squad `gestor-trafego-stark` antes do lançamento.
>
> **Critérios obrigatórios:**
>
> 1. ESTRUTURAL: Todos os arquivos listados em `squad.yaml → components` existem fisicamente?
> 2. REFERÊNCIAS: Nenhum agente ou task referencia paths dos squads antigos
>    (`gestor-trafego-vinicius` ou `gestor-trafego-gustavo`)?
> 3. DADOS: `data/clientes.yaml` tem clientes dos dois gestores sem duplicatas?
>    Todos os campos obrigatórios preenchidos (pelo menos nome, slug, gestor, reportei_project_id)?
> 4. FLUXO: A `rotina-semanal.md` tem a lógica de reaproveitamento de dados (FASE 1 → FASE 2)?
> 5. VALIDATOR: Tem gates para os 4 tipos: sheets, relatorio, alertas, clickup?
> 6. COMANDOS: Os 7 comandos do stark-chief têm tasks correspondentes?
> 7. VETOS: Os absolute_vetos do squad.yaml cobrem ambos os squads originais?
>
> **Produzir:** Relatório QA com PASS/FAIL por critério + lista de problemas encontrados.
> **Salvar em:** `squads/gestor-trafego-stark/QA-REPORT.md`

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 6
status: pendente
criterios_pass: []
criterios_fail: []
bloqueadores: []
proxima_etapa: 7
```

---

### ETAPA 7 — Commit e PR
**Agente:** `@devops (Gage)`
**Status:** ⬜ AGUARDANDO

#### Briefing para @devops

> Com o QA aprovado (QA-REPORT.md com todos os critérios PASS):
>
> 1. `git add squads/gestor-trafego-stark/`
> 2. `git add docs/stories/gestor-trafego-stark/` (se criado)
> 3. `git add docs/epics/GTS-001-EXECUTION.yaml` (se criado)
>
> **Mensagem de commit:**
> ```
> feat(squads): add gestor-trafego-stark — squad unificado Stark
>
> Squad novo criado do zero, unificando o melhor de:
> - squads/gestor-trafego-vinicius (relatorio-semanal)
> - squads/gestor-trafego-gustavo (gestor-trafego-ia)
>
> Automação das 4 rotinas do gestor de tráfego Stark:
> 1. Monitoramento diário com alertas por especialidade médica
> 2. Preenchimento de planilha Google Sheets
> 3. Relatório semanal Reportei com HTML timeline
> 4. Status report narrativo no ClickUp
>
> Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
> ```
>
> 4. `gh pr create` com body completo explicando o squad
>
> **IMPORTANTE:** Os squads antigos (vinicius e gustavo) são mantidos intactos.
> Não modificar, não deletar.

#### Handoff desta etapa (preencher ao concluir)
```yaml
# HANDOFF ETAPA 7
status: pendente
pr_url: ""
branch: ""
pendencias: []
```

---

## 🔑 REFERÊNCIAS RÁPIDAS

### Squads de referência (GitHub — só leitura)
```bash
# Squad Vinicius
gh api repos/gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego/contents/squads/gestor-trafego-vinicius

# Squad Gustavo
gh api repos/gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego/contents/squads/gestor-trafego-gustavo

# Buscar arquivo específico (substituir PATH):
gh api repos/gustavoradler-cyber/treinamento-orquestradores-stark-gestoresdetrafego/contents/PATH --jq '.content' | base64 -d
```

### Squad local (este repositório)
```
squads/gestor-trafego-vinicius/   ← Squad Vinicius (local, completo)
squads/gestor-trafego-stark/      ← NOVO SQUAD (este projeto)
```

### Credenciais necessárias (variáveis de ambiente)
| Variável | Descrição |
|----------|-----------|
| `REPORTEI_TOKEN` | Bearer token Reportei API v2 |
| `SHEET_ID` | ID da planilha Google Sheets |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Caminho para service_account.json |

### MCPs utilizados
| MCP ID | Nome | Para quê |
|--------|------|---------|
| `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | Reportei | criar relatórios, timelines, métricas |
| `mcp__92a31705-b51e-422b-abc2-e6cb82a79330` | Google Drive | contexto de clientes |
| `mcp__2d24fa11-1001-4c98-bf3c-7dcc3b7bdfaf` | ClickUp | tarefas, status reports, docs |
| `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52` | Meta Ads | métricas de campanhas |

---

## 🚦 REGRAS DO PROCESSO

1. **Uma etapa por vez** — Nunca pular etapas
2. **Commit ao concluir** — Cada etapa tem sua mensagem de commit padronizada
3. **Handoff preenchido** — Antes de commitar, preencher o bloco YAML de handoff
4. **Status atualizado** — Mudar a tabela de status (⬜ → ⏳ → ✅) neste arquivo
5. **Nenhum squad antigo modificado** — Este é um squad novo e independente
6. **QA antes do PR** — Nunca pular a Etapa 6

---

*Documento criado em 2026-05-27 por @analyst (Atlas)*
*Versão 1.0 — Pronto para execução a partir da Etapa 1*
