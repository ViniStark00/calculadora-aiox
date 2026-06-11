# DESIGN.md — Arquitetura do Squad `gestor-trafego-stark`

> **Produzido na Etapa 1** por @architect.
> Decisões aqui são normativas para todas as etapas de implementação (5A–5E).
> Qualquer desvio deve ser registrado como ADR (Architecture Decision Record) neste arquivo.

---

## 1. Validação da Hierarquia de Agentes

### 1.1 Estrutura proposta — Veredicto: APROVADA com ajustes

```
Tier 0 — ORQUESTRADOR
  └── stark-chief.md           ✅ Fusão correta de gestor-chief + relatorio-chief

Tier 1 — DOMÍNIO
  ├── coletor.md               ✅ Do squad Vinicius (+ suporte a dados pré-coletados)
  ├── redator.md               ✅ Do squad Vinicius (sem alteração estrutural)
  ├── publicador.md            ✅ Do squad Vinicius (sem alteração)
  ├── whatsapp-writer.md       ✅ Do squad Vinicius (sem alteração)
  ├── contexto-cliente.md      ✅ Do squad Vinicius (sem alteração)
  ├── alerta-monitor.md        ✅ Do squad Gustavo (absorve monitor-diario do Vinicius)
  ├── clickup-writer.md        ✅ Do squad Gustavo (com extensão para gestor Vinicius)
  └── task-monitor.md          ✅ Do squad Gustavo (sem alteração estrutural)

Tier 2 — QUALIDADE
  └── validator.md             ✅ Do squad Gustavo (+ gate_sheets novo)
```

### 1.2 Ajuste 1 — monitor-diario.md não é importado

O squad Vinicius tem `monitor-diario.md` (Tier 1) usando apenas Reportei API para CPL.
O squad Gustavo tem `alerta-monitor.md` (Tier 1) usando Meta Ads MCP para CPM/CTR/frequência/kill-switch.

**Decisão:** `alerta-monitor.md` absorve as responsabilidades do `monitor-diario.md`.
O `monitor-diario.md` **não é adicionado** ao novo squad.

**Rationale:** O alerta-monitor do Gustavo já é mais abrangente. Para clientes Vinicius sem
`meta_ad_account_id`, o alerta-monitor deve fazer fallback para Reportei API — cobrindo
o mesmo caso de uso do monitor-diario sem duplicar o agente.

**Adição ao alerta-monitor:** Lógica de fallback por ausência de `meta_ad_account_id`:
- Cliente com `meta_ad_account_id` preenchido → Meta Ads MCP (primário)
- Cliente sem `meta_ad_account_id` → Reportei API via `get_metrics` (fallback)

### 1.3 Ajuste 2 — reportei-writer.md não é importado

O squad Gustavo tem `reportei-writer.md` que combina geração de narrativa + publicação.
O squad Vinicius separa essas responsabilidades em `redator.md` + `publicador.md`.

**Decisão:** Manter a separação `redator.md` + `publicador.md` do Vinicius.
`reportei-writer.md` **não é adicionado** ao novo squad.

**Rationale:** Separação de responsabilidades mais limpa. O gate do validator pode
verificar independentemente o texto (gate_reportei) antes da publicação ser chamada.

### 1.4 Ajuste 3 — Tier do alerta-monitor

O alerta-monitor no squad Gustavo é tecnicamente invocado diretamente pelo gestor-chief
como rotina standalone (`*monitorar-contas`). No novo squad, ele é Tier 1 mas pode ser
acionado tanto pelo stark-chief diretamente (comando `*monitorar-contas`) quanto dentro
do pipeline da rotina-semanal (Phase 1).

**Decisão:** Manter como Tier 1 com anotação de uso duplo:
- Uso standalone: acionado via stark-chief por `*monitorar-contas` ou `*rotina-diaria`
- Uso pipeline: acionado por tasks/rotina-semanal.md na FASE 1

---

## 2. Modelo de Dados — `data/clientes.yaml`

### 2.1 Clientes compartilhados (CRITICAL — descoberta de análise)

Dois clientes aparecem em AMBOS os squads:

| Cliente | Vinicius | Gustavo |
|---------|----------|---------|
| Dr. Laureano Filho | cirurgia_ortognatica, ID Reportei: 982754 | saude_geral, ID Reportei: 982754 |
| Dra. Nicolli | nomes_planilha (sem ID Reportei confirmado) | medicina_estetica, ID Reportei: 642925 |

**Decisão:** Campo `gestor` é array `gestores: [list]`, não scalar.
Clientes exclusivos de um gestor: `gestores: [vinicius]` ou `gestores: [gustavo]`.
Clientes compartilhados: `gestores: [vinicius, gustavo]`.

**Campos condicionais por gestor:**
- `sheet_columns`: só preencher quando `vinicius in gestores`
- `meta_ad_account_id`: só preencher quando `gustavo in gestores` (e disponível)

### 2.2 Schema completo do cliente

```yaml
# SCHEMA — Um item da lista clientes em data/clientes.yaml
- nome: "Nome Completo Exato"          # nome canônico (usado para busca)
  slug: "nome-slug"                     # kebab-case, sem acentos, sem pontuação
  gestores: [vinicius]                  # array: [vinicius], [gustavo] ou [vinicius, gustavo]
  especialidade: null                   # slug da especialidade (ver seção 2.3)
  meta_cpl: null                        # CPL meta individual em R$ (null = sem meta definida)
  reportei_project_id: null             # ID numérico do projeto no Reportei
  meta_ad_account_id: null              # "act_XXXXXXXX" — só clientes Gustavo com acesso MCP
  clickup_status_list_id: "TODO"        # ID da lista no ClickUp (preencher manualmente)

  # Campos exclusivos de clientes Vinicius (gestores inclui vinicius)
  sheet_name: null                      # nome exato na coluna A da planilha
  sheet_columns:                        # mapeamento coluna → letra Google Sheets
    meta_spend: null                    # ex: "C"
    google_spend: null                  # ex: "E"
    seguidores: null                    # ex: "H"
    conversas: null                     # ex: "K"
    conversoes: null                    # ex: "O"
  nome_whatsapp: null                   # saudação personalizada (ex: "Dra. Danielle", "pessoal")

  # Campos de comportamento
  prioridade: 1                         # ordem de processamento (1 = maior prioridade)
  excluir_meta_monitoring: false        # true = pular monitoramento Meta Ads (ex: Dr. Laureano)
  nota: ""                              # observação operacional relevante
  ativo: true                           # false = ignorado em todos os pipelines
```

### 2.3 Slugs de especialidade válidos

```
# Meta Ads — CPL = custo por conversa WhatsApp
cirurgia_plastica | cirurgia_facial | cirurgia_corporal | mommy_makeover |
cirurgia_trans | dermatologia | medicina_estetica | tricologia | oncologia |
saude_geral | implantes_dentarios | emagrecimento | cirurgia_cabeca_pescoco |
anestesia | medico_de_familia

# Google Ads — CPL = custo por conversão
cirurgia_ortognatica

# Sem threshold
null   # não é especialidade médica, ou especialidade fora do escopo
```

### 2.4 Clientes confirmados por gestor

**Clientes Vinicius (fonte: clientes-config.yaml, confirmados)**

| nome | slug | especialidade | reportei_project_id |
|------|------|---------------|---------------------|
| IMCP - Instituto Mineiro de Cirurgia Plastica | imcp | cirurgia_plastica | 688377 |
| Dra Danielle Gondim | dra-danielle-gondim | cirurgia_facial | 839737 |
| Dr. Leandro Gontijio | dr-leandro-gontijio | cirurgia_corporal | 627550 |
| Dr. Guilherme Mattar | dr-guilherme-mattar | cirurgia_trans | 1023153 |
| Dr. Lucas Consentino | dr-lucas-consentino | cirurgia_corporal | 564106 |
| Dr. Luiz Borba | dr-luiz-borba | mommy_makeover | a confirmar |
| Dr. Humberto | dr-humberto | mommy_makeover | a confirmar |
| Dr. Laureano Filho | dr-laureano-filho | cirurgia_ortognatica | 982754 |
| Diego Gonzalez Salvador | diego-gonzalez-salvador | mommy_makeover | a confirmar |
| Dr. Joel Abdala | dr-joel-abdala | cirurgia_facial | a confirmar |
| Dr. Matheus Ocampo | dr-matheus-ocampo | cirurgia_corporal | a confirmar |
| Dra Nicolli | dra-nicolli | null (Vinicius) / medicina_estetica (Gustavo) | 642925 |
| Destra Desenvolvimentos | destra-desenvolvimentos | null | a confirmar |
| Dr. Alvaro Rodrigues | dr-alvaro-rodrigues | null | a confirmar |
| Dr. Enzo Carvalho | dr-enzo-carvalho | null | a confirmar |
| Dr Javier Cucchiaro | dr-javier-cucchiaro | null | a confirmar |
| MaxiOral | maxioral | null | a confirmar |
| Zenicare | zenicare | null | a confirmar |
| IGO | igo | null | a confirmar |

**Clientes Gustavo (fonte: clientes.md, confirmados)**

| nome | slug | especialidade | reportei_project_id |
|------|------|---------------|---------------------|
| Dr. Fernando Bezerra | dr-fernando-bezerra | saude_geral | 696403 |
| Dr. Diego Alencar | dr-diego-alencar | oncologia | 1064037 |
| Dr. Marcelo Bezerra | dr-marcelo-bezerra | cirurgia_plastica | 610559 |
| Dr. Higner Forastieri | dr-higner-forastieri | tricologia | 1097249 |
| Dra. Mariângela Santiago | dra-mariangela-santiago | medicina_estetica | 1097223 |
| Dr. Caio Fernandes | dr-caio-fernandes | saude_geral | 1170455 |
| Dr. Laureano Filho | dr-laureano-filho | saude_geral (Gustavo) / cirurgia_ortognatica (Vinicius) | 982754 |
| Dra. Nicolli | dra-nicolli | medicina_estetica | 642925 |
| Fernanda Encinas | fernanda-encinas | medicina_estetica | 913731 |
| Graciela Machado | graciela-machado | medicina_estetica | 672682 |
| Dra. Érica Marchiori | dra-erica-marchiori | dermatologia | 1025271 |

**Nota sobre conflito Dr. Laureano Filho:**
- Especialidade diverge entre squads (cirurgia_ortognatica vs saude_geral)
- reportei_project_id idêntico (982754) confirma ser o mesmo cliente
- Resolução: `especialidade: cirurgia_ortognatica` (dado mais específico — informa os thresholds corretos)
- A nota no Gustavo ("EXCLUÍDO do monitoramento Meta") deve ser preservada via `excluir_meta_monitoring: true`

**Nota sobre conflito Dra. Nicolli:**
- Vinicius: `especialidade: null` — nunca teve threshold definido
- Gustavo: `especialidade: medicina_estetica`, reportei_project_id: 642925
- Resolução: `especialidade: medicina_estetica` (dado mais informativo do Gustavo)
- `gestores: [vinicius, gustavo]`

### 2.5 Lógica de resolução de cliente (stark-chief)

```
1. Buscar em data/clientes.yaml → campo nome (case-insensitive, exato)
2. Buscar em data/clientes.yaml → campo slug (case-insensitive)
3. Se não encontrar → fuzzy match sobre campo nome (threshold: 0.60)
4. Se não encontrar → listar clientes disponíveis filtrados por gestor ativo e aguardar
```

---

## 3. Fluxo da `rotina-semanal` Fundida

### 3.1 Diagrama de fluxo (ASCII)

```
stark-chief recebe: *rotina-semanal [cliente]
         │
         ▼
   Resolver cliente
   data/clientes.yaml
         │
         ▼
╔══════════════════════════════════════╗
║  FASE 1 — MONITORAMENTO              ║  [BLOQUEANTE]
║  @alerta-monitor                     ║
║  → Meta Ads MCP (se meta_ad_account_id)
║  → Reportei API (fallback)           ║
║  Output:                             ║
║    alertas_ativos[]                  ║
║    metricas_coletadas{} ←── PASSA PARA FASE 2
╠══════════════════════════════════════╣
║  @validator → gate_alertas           ║
║  FAIL → stark-chief exibe alertas    ║
║          e aguarda confirmação       ║
╚══════════════════════════════════════╝
         │
         │ alertas_ativos + metricas_coletadas
         ▼
╔══════════════════════════════════════╗
║  FASE 2 — PLANILHA SHEETS            ║  [BLOQUEANTE — só clientes Vinicius]
║  Condição: vinicius in cliente.gestores
║  @coletor                            ║
║  → REUTILIZA metricas_coletadas (Meta Ads)
║  → Reportei API (Google Ads + seguidores — ainda necessário)
║  → fill_sheets.py → Google Sheets    ║
╠══════════════════════════════════════╣
║  @validator → gate_sheets            ║
║  FAIL → @coletor tenta novamente     ║
╚══════════════════════════════════════╝
         │
         │ metricas_completas (Meta + Google + seguidores + conversas)
         ▼
╔══════════════════════════════════════╗
║  FASE 3 — NARRATIVA DO RELATÓRIO     ║  [BLOQUEANTE]
║  @contexto-cliente LEITURA (não-bloqueante)
║  @redator                            ║
║  → narrativa markdown + HTML timeline
╠══════════════════════════════════════╣
║  @validator → gate_reportei          ║
║  FAIL (1ª vez) → @redator regenera   ║
║  FAIL (2ª vez) → interrompe + avisa  ║
╚══════════════════════════════════════╝
         │
         │ narrativa_aprovada + html_timeline
         ├─────────────────────────┐
         ▼                         ▼
╔══════════════════════╗  ╔═══════════════════════╗
║  FASE 4 — PUBLICAÇÃO ║  ║  FASE 5 — CLICKUP     ║  [PARALELO]
║  @publicador         ║  ║  @clickup-writer       ║
║  → create_timeline_event  → draft para aprovação ║
║  @whatsapp-writer    ║  ║  → escreve no ClickUp  ║
║  → mensagem formatada║  ╠═══════════════════════╣
╚══════════════════════╝  ║  @validator → gate_clickup
                          ╚═══════════════════════╝
         │                         │
         └──────────┬──────────────┘
                    ▼
╔══════════════════════════════════════╗
║  FASE 6 — WRAP-UP (PARALELO)         ║  [NÃO-BLOQUEANTE]
║  @coletor → save-history             ║
║  @contexto-cliente ATUALIZAÇÃO       ║
║  @task-monitor → marca tasks ClickUp ║
╚══════════════════════════════════════╝
         │
         ▼
   RESUMO FINAL
   stark-chief
```

### 3.2 Decisão sobre reuso de dados (FASE 1 → FASE 2)

**Contexto:** A FASE 1 coleta métricas Meta Ads para monitoramento. A FASE 2 precisa de
métricas para preencher o Sheets. Sem reuso, haveria duas chamadas à API para os mesmos dados.

**Dados que o alerta-monitor coleta (Meta Ads MCP):**
- spend, impressions, reach, frequency, CTR, CPM
- actions: lead + messaging_conversation_started_7d
- cost_per_action_type

**Dados que o coletor ainda precisa buscar (Reportei API):**
- google_spend (Google Ads — não está no Meta Ads MCP)
- seguidores (Instagram followers — não está no Meta Ads MCP)
- conversoes Google (para cirurgia_ortognatica)

**Decisão:** Reuso PARCIAL. O alerta-monitor passa `metricas_coletadas` como dict opcional.
O coletor aceita esse dict como parâmetro e pula as chamadas Meta Ads correspondentes.
O coletor AINDA precisa chamar Reportei para Google Ads e seguidores.

**Interface de dados entre FASE 1 e FASE 2:**
```yaml
metricas_coletadas:
  # por cliente, keyed por slug
  dr-fernando-bezerra:
    meta_spend: 1234.56
    conversas: 45
    meta_cpl: 27.43
    cpm: 18.20
    ctr: 2.1
    frequency: 2.3
    fonte: "meta_ads_mcp"
    lookback: "last_7d"
    coletado_em: "2026-05-28T10:30:00"
  # Para clientes sem meta_ad_account_id ou com fallback Reportei:
  dr-leandro-gontijio:
    meta_spend: 890.00
    conversas: 12
    meta_cpl: 74.17
    fonte: "reportei_api"
    lookback: "last_7d"
    coletado_em: "2026-05-28T10:30:00"
```

### 3.3 Paralelização possível

| Fases | Pode paralelizar? | Condição |
|-------|-------------------|----------|
| 1 → 2 | NÃO | Fase 2 depende dos dados da Fase 1 |
| 2 → 3 | NÃO | Fase 3 depende das métricas completas |
| 3 → 4 e 5 | SIM | Ambas recebem a narrativa pronta da Fase 3 |
| 4 e 5 → 6 | NÃO (Fase 6 inicia após ambas) | Fase 6 não-bloqueante |

**Implementação da paralelização 4+5:** O stark-chief (via task rotina-semanal) deve
acionar publicador e clickup-writer simultaneamente após gate_reportei PASS.
O resumo final aguarda ambos concluírem antes de exibir.

### 3.4 Comportamento de falha por fase

| Fase | Falha | Comportamento |
|------|-------|---------------|
| 1 — Monitor | MCP indisponível | Continuar sem metricas_coletadas; FASE 2 busca tudo do zero |
| 1 — Monitor | gate_alertas FAIL | Exibir alertas + perguntar se quer continuar o pipeline |
| 2 — Sheets | gate_sheets FAIL | Parar; exibir problemas; não avançar sem confirmação |
| 3 — Narrativa | gate_reportei FAIL (2x) | Parar; exibir texto problemático; aguardar ação |
| 4 — Publicação | MCP Reportei indisponível | Parar FASE 4; marcar como SKIPPED; continuar FASE 5 |
| 5 — ClickUp | MCP ClickUp indisponível | Parar FASE 5; marcar como SKIPPED; continuar FASE 6 |
| 6 — Wrap-up | Qualquer falha | Aviso no resumo; nunca bloquear |

---

## 4. Definição do `sheets-gate` (Novo)

O `sheets-gate` não existe nos squads originais. É derivado do `verify-fill` (Vinicius)
com adições para garantia de completude formal.

### 4.1 Checklist do gate_sheets

```yaml
gate_sheets:
  descricao: "Verificação de completude do preenchimento do Google Sheets"
  momento: "Após fill_sheets.py executar — antes de avançar para FASE 3"
  checklist:
    - "[ ] fill_sheets.py retornou exit code 0 (sem erro de execução)"
    - "[ ] Número de linhas preenchidas bate com count de clientes ativos do bloco Vinicius em data/clientes.yaml"
    - "[ ] Período preenchido corresponde à segunda-feira a domingo da semana anterior (calculado automaticamente)"
    - "[ ] Nenhum campo obrigatório vazio — zeros são válidos; strings vazias e None não"
    - "[ ] Colunas obrigatórias preenchidas para cada cliente: meta_spend, google_spend, seguidores, conversas, conversoes (conforme sheet_columns de cada cliente)"
    - "[ ] Nenhum valor estimado — o script deve ter confirmado a origem dos dados"
    - "[ ] Aba da semana existe na planilha (nome no formato DD/MM/AAAA = domingo da semana)"
  severidade_fail: "BLOQUEANTE — pipeline não avança sem PASS"
  max_tentativas: 1  # fill_sheets.py não é reexecutado automaticamente; falha → reportar
  arquivo_checklist: "checklists/sheets-gate.md"
```

### 4.2 Diferença entre gate_sheets e verify-fill (Vinicius)

| Aspecto | verify-fill (Vinicius) | gate_sheets (novo) |
|---------|----------------------|-------------------|
| Foco | Dados brutos coletados | Escrita confirmada no Sheets |
| Trigger | Após fetch-metrics | Após fill_sheets.py |
| Exit code | Não verifica | Verifica exit code 0 |
| Row count | Não verifica | Verifica vs clientes ativos |
| Bloqueante | Sim | Sim |

---

## 5. Thresholds — Consolidação

### 5.1 Estratégia de merge

O squad Vinicius tem `data/thresholds-especialidade.yaml` com:
- CPL/CPM/CTR/frequência por especialidade (8 especialidades)
- Kill-switch por especialidade
- Frequência por tipo de campanha
- Regras de quando não alertar

O squad Gustavo tem `data/thresholds-por-especialidade.md` com:
- CPM (alerta/pause) por 13 especialidades (incluindo 5 extras: oncologia, saude_geral, tricologia, implantes, emagrecimento, etc.)
- Kill-switch (spend em 3 dias) por especialidade
- CPL individual + CPL de referência por especialidade
- Frequência por tipo de campanha
- CTR por condição

**Decisão:** O `data/thresholds-por-especialidade.yaml` do novo squad é uma **fusão completa**:
- Formato: YAML estruturado (não Markdown)
- Base: thresholds-especialidade.yaml do Vinicius (mais estruturado)
- Adições do Gustavo:
  - Especialidades extras: oncologia, saude_geral, tricologia, implantes_dentarios, emagrecimento
  - CPL de referência por especialidade (tabela de benchmark de mercado)
  - Kill-switch com thresholds mais granulares por especialidade
  - Frequência por tipo de campanha (TOFU/MOFU/BOFU/AWARENESS) — mais detalhado

### 5.2 Resolução de conflito nos thresholds de CPM

| Especialidade | Vinicius (atencao_max) | Gustavo (pause) | Adotado |
|---------------|----------------------|-----------------|---------|
| cirurgia_plastica | 60 (critico_min) | 28 (pause) | Gustavo — mais conservador |
| medicina_estetica | 38 (critico_min) | 28 (pause) | Vinicius para atencao; Gustavo para pause |
| dermatologia | 45 (critico_min) | 24 (pause) | Gustavo — mais conservador |

**Regra geral:** Para CPM, adotar o threshold mais conservador dos dois squads.
O alerta-monitor do Gustavo usa thresholds de pause como referência operacional.
O redator do Vinicius usa os thresholds para calibrar tom narrativo — mantém ranges saudavel/atencao/critico.

---

## 6. Arquitetura do `stark-chief`

### 6.1 Routing rules unificadas

```
Keyword → Comando → Task
─────────────────────────────────────────────────────────────────────
"rotina diária" / "monitor hoje" / "monitora hoje"
  → *rotina-diaria → tasks/rotina-diaria.md
  (alertas de todas as contas + inbox de tarefas)

"rotina semanal" / "pipeline" / "roda tudo"
  → *rotina-semanal [cliente] → tasks/rotina-semanal.md
  (pipeline completo das 6 fases)

"planilha" / "sheets" / "preenche planilha" / "preenchimento"
  → *planilha [cliente] → tasks/fetch-metrics.md + tasks/verify-fill.md
  (só coleta + Sheets, sem relatório)

"relatório" / "relatorio" / "reportei" / "report"
  → *relatorio-reportei [cliente] → tasks/generate-report.md + tasks/publish-timeline.md
  (só narrativa + publicação)

"status report" / "clickup" / "status" / "preenche clickup"
  → *status-report-clickup [cliente] → tasks/preencher-clickup.md
  (só ClickUp)

"monitora" / "alerta" / "alertas" / "contas" / "monitorar"
  → *monitorar-contas → tasks/monitorar-contas.md
  (só monitoramento e alertas)

"inbox" / "tarefas" / "tasks" / "monitor tarefas"
  → *monitor-tarefas → tasks/rotina-diaria.md#task-monitor
  (só inbox ClickUp)
```

### 6.2 Resolução de gestor ativo

O stark-chief deve identificar de qual gestor é o cliente para:
- Exibir apenas alertas relevantes (sheets: só Vinicius)
- Usar o `clickup_status_list_id` correto
- Decidir se executa a FASE 2 (só se `vinicius in gestores`)

```
Quando stark-chief resolve um cliente:
1. Carregar entrada do cliente em data/clientes.yaml
2. Identificar gestores: cliente.gestores
3. Ajustar pipeline em rotina-semanal conforme gestores[]
```

### 6.3 Modo multi-cliente

Ativado por: "todos os clientes", "bloco Vinicius", "carteira do Gustavo", "todos"

```
Para "bloco Vinicius" / "todos os clientes Vinicius":
  → Filtrar data/clientes.yaml onde vinicius in gestores AND ativo: true

Para "carteira Gustavo" / "todos os clientes Gustavo":
  → Filtrar data/clientes.yaml onde gustavo in gestores AND ativo: true

Para "todos" / "todos os clientes":
  → Todos onde ativo: true
```

---

## 7. Arquivos a Criar por Etapa

### Etapa 5A — Estrutura Base + Dados

```
squads/gestor-trafego-stark/
├── squad.yaml
├── CLAUDE.md
├── README.md
├── data/
│   ├── clientes.yaml           ← ~30 clientes, schema seção 2.2
│   ├── thresholds-por-especialidade.yaml  ← fusão seção 5
│   └── historico-clientes.yaml  ← placeholder vazio (gitignored)
└── config/
    └── settings.yaml
```

### Etapa 5B — Tier 0 + Tier 2

```
agents/
├── stark-chief.md              ← fusão gestor-chief + relatorio-chief (seção 6)
└── validator.md                ← Gustavo validator + gate_sheets novo (seção 4)
```

### Etapa 5C — Tier 1 Grupo A

```
agents/
├── coletor.md                  ← Vinicius coletor + suporte metricas_coletadas (seção 3.2)
├── redator.md                  ← Vinicius redator (referencia thresholds novos)
├── publicador.md               ← Vinicius publicador
├── whatsapp-writer.md          ← Vinicius whatsapp-writer
└── contexto-cliente.md         ← Vinicius contexto-cliente
```

### Etapa 5D — Tier 1 Grupo B

```
agents/
├── alerta-monitor.md           ← Gustavo alerta-monitor + fallback Reportei (seção 1.2)
├── clickup-writer.md           ← Gustavo clickup-writer + suporte gestor Vinicius
└── task-monitor.md             ← Gustavo task-monitor
```

### Etapa 5E — Tasks + Workflows + Checklists + Templates

```
tasks/
├── fetch-metrics.md
├── verify-fill.md
├── generate-report.md
├── validate-report.md
├── publish-timeline.md
├── save-history.md
├── monitorar-contas.md
├── preencher-clickup.md
├── rotina-diaria.md
└── rotina-semanal.md           ← CRÍTICO: fluxo das 6 fases (seção 3)

workflows/
└── weekly-pipeline.md

checklists/
├── sheets-gate.md              ← NOVO (seção 4)
├── relatorio-gate.md
├── alertas-gate.md
└── clickup-gate.md

templates/
├── relatorio-template.md
├── whatsapp-template.md
└── contexto-cliente-template.md
```

---

## 8. Decisões Arquiteturais — Registro (ADR)

| # | Decisão | Alternativa considerada | Motivo da escolha |
|---|---------|------------------------|-------------------|
| ADR-01 | `gestores` é array, não scalar | `gestor: vinicius\|gustavo` | 2 clientes compartilhados confirmados (Dr. Laureano, Dra. Nicolli) |
| ADR-02 | monitor-diario.md absorvido pelo alerta-monitor | Manter como agente separado | Evita duplicação; alerta-monitor já é mais abrangente |
| ADR-03 | reportei-writer.md não importado | Usar como base do redator | Manter separação redator/publicador do Vinicius é mais modular |
| ADR-04 | Reuso parcial de métricas FASE 1→2 | Não reutilizar (busca dupla) | Reduz chamadas API; Google Ads + seguidores ainda precisam de Reportei |
| ADR-05 | Fases 4+5 em paralelo | Sequencial 4→5 | Não há dependência; publicador e clickup-writer usam a mesma narrativa |
| ADR-06 | Thresholds CPM: adotar o mais conservador | Média dos dois | Falso negativo (não alertar quando devia) é mais custoso que falso positivo |
| ADR-07 | `especialidade: cirurgia_ortognatica` para Dr. Laureano | `saude_geral` (Gustavo) | Dado mais específico informa thresholds corretos; nota de contexto explica |

---

## 9. Validação Final — Checklist de Arquitetura

- [x] Hierarquia Tier 0/1/2 validada e ajustada
- [x] monitor-diario.md absolvido — agente removido do escopo
- [x] reportei-writer.md excluído — separação redator/publicador mantida
- [x] Clientes duplicados identificados e tratados via `gestores: []`
- [x] Schema de clientes.yaml com todos os campos obrigatórios e condicionais
- [x] Fluxo rotina-semanal com 6 fases, dados de reuso, e paralelização 4+5
- [x] gate_sheets definido com 7 critérios verificáveis
- [x] Estratégia de merge de thresholds documentada
- [x] stark-chief com 7 comandos e routing rules unificadas

---

*Documento criado em 2026-05-28 por @architect (Etapa 1)*
*Squad: gestor-trafego-stark | Versão: 1.0*
