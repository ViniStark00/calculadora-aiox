# CONTEXT.md — Squad relatorio-semanal
> **LEIA ESTE ARQUIVO PRIMEIRO — sempre, em toda nova sessão.**
> Caminho: `squads/relatorio-semanal/CONTEXT.md`
> Após ler, confirme ao usuário: *"Contexto carregado. Estamos na Etapa X. Último estado: [resumo]."*
> Só então aguarde instrução.

---

## PROTOCOLO DE ATUALIZAÇÃO

Este arquivo é atualizado **ao final de cada etapa concluída** e sempre que:
- Uma decisão for tomada (mesmo que depois revertida)
- Uma solicitação do usuário for feita
- Um erro for encontrado e corrigido
- Uma etapa for reprovada, ajustada ou refeita
- Qualquer coisa mudar em relação ao estado anterior

**Formato do log:** data + o que aconteceu + resultado. Nada é apagado — apenas marcado como `[REVERTIDO]`, `[REPROVADO]` ou `[CORRIGIDO]`.

---

## ESTADO ATUAL (atualizar a cada etapa)

```
Etapa atual : 7 — git commit + PR + merge via @devops
Última ação : *validate-squad concluído — VALID, 0 erros, 0 warnings. "excelente" corrigido em examples/destra-2026-05-04.md.
Próxima ação: @devops faz commit + push + PR + merge → Etapa 8 (teste real com Destra)
Bloqueadores: nenhum técnico. ATENÇÃO: regenerar REPORTEI_TOKEN no painel do Reportei (token antigo foi removido do CONTEXT.md por segurança)
```

---

## IDENTIDADE DO PROJETO

| Campo | Valor |
|-------|-------|
| **Nome do squad** | `relatorio-semanal` |
| **Repositório** | `C:\Users\Usuario\Desktop\Claude_Stark` |
| **Pasta do squad** | `squads/relatorio-semanal/` |
| **PRD** | `docs/prd/relatorio-semanal.md` |
| **Dono** | Vinicius Lima — gestor de tráfego pago, Stark Marketing |
| **Email** | vinicius@starkmkt.com |
| **MVP cliente** | Destra Desenvolvimentos |
| **Objetivo** | Automatizar 3 atividades semanais recorrentes do gestor de tráfego |

---

## AS 3 ATIVIDADES

### Atividade 1 — Preencher Planilha de Métricas
**O que faz:** Busca métricas no Reportei via API v2 e escreve no Google Sheets.
**Período:** Segunda a Domingo da semana anterior.
**Aba:** nomeada `DD/MM/AAAA` (data da segunda-feira). Criar automaticamente se não existir.

| Coluna | Métrica |
|--------|---------|
| C | Meta Ads — Spend (R$) |
| E | Google Ads — Spend (R$) |
| H | Seguidores (Instagram) |
| K | Conversas (leads WhatsApp) |
| O | Conversões |

**API:** `GET /v2/projects/{projectId}/metrics` — Reportei v2, Bearer Token.
**Nota histórica:** Existia automação parcial no Colab com bugs. Squad substitui e corrige.

### Atividade 2 — Gerar Texto do Relatório Escrito
**O que faz:** Com métricas da Atividade 1 + dados extras do MCP Reportei, gera narrativa escrita por cliente.

**Formato padrão:**
```
Nesta última semana, entre os dias [DATA_INICIO] e [DATA_FIM],
o desempenho das campanhas para [CLIENTE] apresentou [análise geral].
Em relação ao investimento, foram aplicados R$[META_SPEND] no Meta Ads
e R$[GOOGLE_SPEND] no Google Ads, totalizando R$[TOTAL].
[Análise de palavras-chave, CPL, cliques, conversões, comparação semana anterior]
[Destaques positivos e pontos de atenção]
```

**Nota:** Arquivo de exemplo da Destra não está disponível localmente. Na Etapa 5, pedir ao Vinicius que cole um texto real no chat para montar o template.

### Atividade 3 — Publicar Marco na Linha do Tempo do Reportei
**O que faz:** Publica o texto gerado como evento na Timeline do cliente no Reportei via MCP.
**MCP ID:** `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8`
**Tool:** `create_timeline_event`
**Tools auxiliares:** `get_metrics`, `get_project`, `get_report`, `list_projects`

---

## CREDENCIAIS E CONFIGURAÇÕES

> ⚠️ NUNCA commitar. Usar variáveis de ambiente ou arquivos gitignored.

| Item | Valor | Status |
|------|-------|--------|
| REPORTEI_TOKEN | `[REDACTED — definir na variável de ambiente REPORTEI_TOKEN]` | ⚠️ Token real REMOVIDO deste arquivo por segurança — nunca escrever aqui |
| SHEET_ID | `1crqoxq8hqaQWsoZby5FlQt50gpUZ29buyeRKkv3M5Og` | Planilha Google Sheets |
| Service Account | `stark-metricas@primal-sunup-419412.iam.gserviceaccount.com` | Para escrever no Sheets |
| service_account.json | Pasta "CLAUDE. TESTES " no Google Drive | Atenção: espaço no final do nome |
| MCP Reportei | `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` | Instalado e configurado |

---

## ARQUITETURA DO SQUAD

```
squads/relatorio-semanal/
├── CONTEXT.md                     ← ESTE ARQUIVO
├── squad.yaml                     # Manifest principal
├── README.md
├── agents/
│   ├── relatorio-chief.md         # Tier 0: Orquestrador
│   ├── coletor.md                 # Tier 1: API → Sheets
│   ├── redator.md                 # Tier 1: Gera narrativa
│   ├── publicador.md              # Tier 1: Publica Timeline
│   └── quality-gate.md            # Tier 3: Valida output
├── tasks/
│   ├── fetch-metrics.md           # Atividade 1
│   ├── generate-report.md         # Atividade 2
│   └── publish-timeline.md        # Atividade 3
├── workflows/
│   └── weekly-report-pipeline.md
├── templates/
│   └── relatorio-template.md      # Pedir exemplo real ao Vinicius na Etapa 5
├── config/
│   └── clientes-config.yaml       # project_id, sheet_id, colunas por cliente
└── data/
    └── .gitkeep
```

**Fluxo:** `relatorio-chief` → `coletor` → `quality-gate` → `redator` → `quality-gate` → `publicador` → resumo final

---

## PLANO DE EXECUÇÃO

| # | Etapa | Status | Sessão |
|---|-------|--------|--------|
| 1 | Criar PRD em `docs/prd/relatorio-semanal.md` | ✅ CONCLUÍDA | Sessão 1 |
| 2 | Criar branch `feat/relatorio-semanal` | ✅ CONCLUÍDA | Sessão 2 (branch já existia ao iniciar) |
| 3 | Executar `*design-squad` com o PRD | ✅ CONCLUÍDA | Sessão 2 — blueprint em `squads/.designs/relatorio-semanal-design.yaml` |
| 3 | Executar `*design-squad` com o PRD | ⬜ | — |
| 4 | Executar `*create-squad relatorio-semanal --from-design` | ✅ CONCLUÍDA | Sessão 3 — estrutura completa gerada |
| 5 | Preencher agentes, tasks, workflow, templates, data | ✅ CONCLUÍDA | Sessão 3 — exemplos reais da Danielle e Destra adicionados ao template e a examples/ |
| 6 | Executar `*validate-squad relatorio-semanal` | ✅ CONCLUÍDA | Sessão 4 — VALID, 0 erros, 0 warnings |
| 7 | git commit + PR + merge | ⬜ | — |
| 8 | Teste MVP com Destra Desenvolvimentos | ⬜ | — |
| 9 | Criar Guia de Apresentação completo (`APRESENTACAO.md`) | ⬜ | — |

---

## RESTRIÇÕES

- NÃO modificar `squads/super-gestor/` — squad independente
- NÃO modificar `.aiox-core/` — protegido (L1/L2)
- NÃO commitar `service_account.json` nem tokens
- Squad sinaliza erro 401 claramente se token expirar
- Aba do Sheets criada automaticamente se não existir

---

## REFERÊNCIAS DOS DOCUMENTOS ORIGINAIS

| Documento | Caminho | Relevância |
|-----------|---------|------------|
| Transcrição Encontro 08 | `C:\Users\Usuario\Downloads\drive-download-20260520T020543Z-3-001\Transcrição Completa Encontro 08.docx.md` | **PRINCIPAL** — instruções do Anderson, critérios da tarefa |
| Transcrições 02–07 e 11 | Mesma pasta | Contexto geral AIOX (consultar só se necessário) |
| PRD do squad | `docs/prd/relatorio-semanal.md` | Documento de produto detalhado |
| Squad referência | `squads/super-gestor/squad.yaml` | Padrão de manifest |
| Task referência | `squads/super-gestor/tasks/validate-metrics.md` | Padrão de task |

---

## CONTEXTO DO TREINAMENTO

**Responsável:** Anderson Silva (anderson.silva@starkmkt.com)
**Treinamento:** Orquestração de IA — Stark Marketing
**Encontro chave:** 08 (19/05/2026)
**Regra central:** *"Squad sem processo é um agente solto."*

**Critérios inegociáveis do Anderson:**
- Atividades reais e recorrentes (não fictícias)
- Padrão claro + output verificável
- Roda do zero sem intervenção humana
- Passa em checklist de aprovação
- Demo com caso real ao vivo

**Estrutura da apresentação (30 min):**
- 5 min — problemas das 3 atividades
- 8 min — processo + contexto aplicado
- 10 min — anatomia + demo ao vivo
- 7 min — métricas de ganho

---

## GUIA DE APRESENTAÇÃO — REQUISITOS COMPLETOS

> Esta seção serve de briefing para criar o `APRESENTACAO.md` na Etapa 9.
> O guia é criado DEPOIS que o squad estiver pronto e testado (pós-Etapa 8).
> **FONTE:** Slides do PDF Encontro 08 (16 páginas) + transcrição completa.

### Contexto da apresentação
- **Duração total:** 30 minutos por aluno
- **Para quem:** Anderson Silva + turma do treinamento
- **Ordem:** Sorteada no início da sessão — chegar pronto para ir primeiro
- **Critério:** Squad roda ao vivo, do zero, sem intervenção humana
- **Regra:** Não pode ser exemplo fictício — tem que ser caso real da semana

> **Coincidência importante:** O exemplo que Anderson usou nos slides (pág. 11) se chama
> `relatorio-midia` com agentes `extrator-dados`, `analista-numeros`, `redator-insights`, `revisor`
> — é quase idêntico ao squad `relatorio-semanal`. Isso confirma que você está exatamente no caminho certo.

---

### OS 2 PRINCÍPIOS INEGOCIÁVEIS (slides 04 e 05)
*Cobrar esses dois em todos os blocos da apresentação.*

**Princípio 1 — Processo**
> "Squad sem processo é agente solto."
- Processo = sequência ordenada, handoff explícito, critério de saída em cada etapa
- AIOX já dá a espinha (SDC, QA Loop, Spec Pipeline) — você adapta ao seu fluxo

**Princípio 2 — Contexto**
> "Squad só é bom no contexto que você entrega."
- 4 camadas obrigatórias de contexto:

| Camada | O que é | Dono |
|--------|---------|------|
| CLAUDE.md do squad | Regras fixas, voz, restrições | Você define uma vez |
| Briefing da atividade | Input específico desta execução: dados, alvo, prazo | Você passa na hora de rodar |
| Examples resolvidos | Caso real anterior com input e output juntos | Você salva em `examples/` |
| Memória do agente | Preferências, decisões e aprendizados acumulados | Agente atualiza sozinho |

> **Regra prática (slide 05):** "Agente pediu informação no meio da execução = falta camada de contexto. Corrige antes de seguir."

---

### OS 5 FILTROS DE ESCOLHA DE ATIVIDADE (slide 08)
*Usar para justificar por que as 3 atividades foram escolhidas.*

| Filtro | Critério | Suas atividades passam? |
|--------|---------|------------------------|
| 1 — Repetitiva | Faz mais de 3x por semana | ✅ Semanal toda semana |
| 2 — Padrão claro | Consegue explicar em 5 min para um colega novo | ✅ Colunas fixas, template fixo |
| 3 — Output verificável | Tem checklist objetivo de "ficou bom" | ✅ Colunas corretas, texto com datas e valores |
| 4 — Volume relevante | Transferir custa menos que executar todo dia | ✅ 85 min/semana/cliente |
| 5 — Independente | Não exige decisão política no meio do caminho | ✅ Dados objetivos, sem aprovação necessária |

---

### OS 5 ELEMENTOS DA ANATOMIA (slide 10)
*Todo squad AIOX precisa ter os 5. Se faltar um, ainda é ideia — não é squad.*

| Elemento | O que é | No seu squad |
|----------|---------|-------------|
| 1 — Briefing | CLAUDE.md: o quê, para quem, voz, restrições | `CLAUDE.md` do squad + `clientes-config.yaml` |
| 2 — Agentes AIOX | Agentes do squad-creator com persona definida | `relatorio-chief`, `coletor`, `redator`, `publicador`, `quality-gate` |
| 3 — Ferramentas | MCPs, skills, slash commands por agente | MCP Reportei (`mcp__30ebe978...`), Google Sheets API |
| 4 — Critério de aceite | Checklist objetivo e gate QA | `quality-gate.md` com checks de dados e texto |
| 5 — Evidência | Arquivo, screenshot ou log que prova que rodou | Salvar output da demo em `examples/` |

---

### CRITÉRIO DE PRONTO — 3 CHECKS (slide 13)
*Se falhar em qualquer um, não apresenta.*

- [ ] **Check 1:** Squad executa do zero, ponta a ponta, sem intervenção humana
- [ ] **Check 2:** Output passa no checklist objetivo que você mesmo definiu
- [ ] **Check 3:** Reproduz com pelo menos 1 caso real seu, da semana passada

---

### FORMATO EXATO DA APRESENTAÇÃO (slide 15)

#### BLOCO 1 — 5 min: O Problema e as 3 Atividades

**O que apresentar:**
- Nome das 3 atividades transferidas
- Para cada uma: o que era feito manualmente + quanto tempo levava + qual era a dor

| Atividade | Antes (manual) | Dor principal | Tempo |
|-----------|---------------|---------------|-------|
| Preencher planilha | Abrir Reportei, copiar dado por dado no Sheets | Existia automação no Colab com bugs + dependência externa | ~45 min |
| Gerar texto do relatório | Escrever narrativa do zero para cada cliente | Qualidade variava com cansaço, sem padrão garantido | ~30 min/cliente |
| Publicar na Linha do Tempo | Entrar no Reportei e postar manualmente | Esquecimento frequente, tarefa pequena mas atrasada | ~10 min/cliente |

---

#### BLOCO 2 — 8 min: Processo + Contexto Aplicados

**O que apresentar:**
- Provar que você entende o processo (não executava como robô)
- Mostrar os 2 princípios inegociáveis aplicados ao squad
- Explicar as 4 camadas de contexto que o squad usa

**Roteiro sugerido:**
1. Mostrar os 5 filtros — explicar por que cada atividade passou nos 5
2. Mostrar o processo de cada atividade (passo a passo antes da automação)
3. Mostrar como o contexto foi organizado no squad:
   - CLAUDE.md → voz do gestor de tráfego, restrições de formato
   - Briefing → nome do cliente + período da semana
   - Example → pasta `examples/` com o caso da Destra
   - Memória → `clientes-config.yaml` com dados acumulados por cliente

**Frase do Anderson para usar:** *"Você só transfere o que entende."*

---

#### BLOCO 3 — 10 min: Anatomia do Squad AIOX + Demo com Caso Real

**Parte A — Anatomia (4-5 min):**

Mostrar na tela a estrutura de pastas e explicar cada elemento dos 5:

```
squads/relatorio-semanal/
├── CLAUDE.md              ← Elemento 1: Briefing
├── agents/
│   ├── relatorio-chief.md ← Elemento 2: Agente orquestrador
│   ├── coletor.md         ← Elemento 2: Agente de coleta
│   ├── redator.md         ← Elemento 2: Agente de redação
│   ├── publicador.md      ← Elemento 2: Agente publicador
│   └── quality-gate.md    ← Elemento 2: Gate QA
├── workflows/
│   └── weekly-report-pipeline.md  ← mostra sequência
├── templates/
│   └── relatorio-template.md
├── checklists/
│   └── qa-relatorio.md    ← Elemento 4: Critério de aceite
└── examples/
    └── destra-YYYY-MM-DD.md  ← Elemento 5: Evidência
```

Para cada agente, explicar em 1 frase:
- **relatorio-chief:** orquestra o pipeline, carrega config do cliente, controla fluxo
- **coletor:** chama API Reportei v2, calcula período, escreve colunas C/E/H/K/O no Sheets
- **redator:** analisa métricas, consulta MCP Reportei, gera narrativa usando o template
- **publicador:** publica texto como marco na Timeline do Reportei via MCP
- **quality-gate:** valida dados (sem zeros inesperados) e texto (tem datas, valores, análise)

Mostrar a **ferramenta** (Elemento 3): MCP Reportei instalado e Google Sheets API.

**Parte B — Demo ao vivo (5-6 min):**

```
1. Abrir Claude Code, chamar relatorio-chief: "Rodar pipeline para Destra Desenvolvimentos"
2. Mostrar coletor buscando métricas no Reportei (API call ao vivo)
3. Mostrar quality-gate validando os dados coletados
4. Mostrar redator gerando o texto com os dados
5. Mostrar quality-gate validando o texto final
6. Mostrar publicador postando na Timeline do Reportei
7. Abrir o Reportei no browser e mostrar o marco publicado
8. Mostrar a planilha do Google Sheets com as colunas preenchidas
```

⚠️ **Salvar o output em `examples/destra-[data].md` ANTES da apresentação** — é o Elemento 5 (Evidência).

---

#### BLOCO 4 — 7 min: Métrica de Ganho + Aprendizados + Perguntas

**Métricas a apresentar:**

| Cenário | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| 1 cliente / semana | ~85 min | ~5 min supervisão | **~80 min livres** |
| 5 clientes / semana | ~425 min (~7h) | ~25 min | **~400 min (~6,5h)** |
| 10 clientes / semana | ~850 min (~14h) | ~50 min | **~800 min (~13h)** |
| 1 mês · 5 clientes | ~28h | ~1,7h | **~26h livres/mês** |

**Por que isso importa (slide 07 — Por que transferir):**
- **Libera tempo seu** — cada atividade transferida vira hora livre na semana
- **Padroniza o jeito** — squad executa sempre igual, sem depender de humor
- **Escala sem você** — pode rodar enquanto você dorme ou está em reunião
- **Gera artefato reusável** — outro gestor da Stark adota sem reaprender do zero

**Aprendizados para mencionar:**
- O processo precisou estar organizado ANTES de automatizar
- A evidência (pasta `examples/`) é essencial para provar que rodou
- O quality-gate foi o que garantiu que nada errado chegou ao cliente

---

### RISCOS QUE O ANDERSON AVALIA (slide 14)
*Evitar ao construir e ao apresentar:*

| Risco | Descrição | Como evitar |
|-------|-----------|-------------|
| Tato humano | Atividade que exige leitura de cliente, política, contexto sutil | ✅ As 3 atividades são objetivas, sem decisão subjetiva |
| Sem critério | Não definiu como saber que está pronto → loop infinito | ✅ quality-gate.md com checklist objetivo |
| Automatizar caos | Transferir processo bagunçado só multiplica a bagunça | ✅ Processo estava mapeado antes de construir |
| Escopo aberto | Sem entregável claro, squad nunca conclui | ✅ Output definido: planilha preenchida + texto + marco publicado |

---

### FRASE FINAL DO ANDERSON (slide 16)
> *"Você só transfere o que entende. Se não descreve a atividade em um parágrafo claro, não está pronta pra transferir."*

---

## DIÁRIO DE SESSÕES

### Sessão 1 — 2026-05-20

**Início:** Handoff recebido da sessão anterior com arquitetura, decisões e plano de 8 etapas definidos.

**Atividades desta sessão:**

| Hora | Ação | Resultado |
|------|------|-----------|
| Início | Ativado como squad-creator (Craft) via `/AIOX:agents:squad-creator` | OK |
| — | Lido `squads/super-gestor/squad.yaml` para referência de estrutura | OK |
| — | Buscado arquivo `Automacao de Preenchimento de Metricas.md` em Downloads | ❌ NÃO ENCONTRADO — não existe localmente |
| — | Lido transcrição completa do Encontro 08 (documento principal com instruções) | OK — contexto completo absorvido |
| — | Buscado arquivo de exemplo da Destra Desenvolvimentos | ❌ NÃO ENCONTRADO — construir template na Etapa 5 pedindo exemplo ao Vinicius |
| — | Verificado pasta `reposit-rio-Claude` | Irrelevante — apenas README genérico |
| — | Verificado pasta `ORQUESTRADORES_AULAS` | Apenas vídeos .mp4 — não lidos |
| — | **ETAPA 1 CONCLUÍDA** — criado `docs/prd/relatorio-semanal.md` | ✅ |
| — | Solicitação do usuário: criar CONTEXT.md consolidado para handoffs | OK |
| — | Criado `squads/relatorio-semanal/CONTEXT.md` (versão 1) | OK |
| — | Usuário perguntou sobre mecanismo de handoff automático | Explicado |
| — | Usuário aprovou **Opção B** — atualizar CONTEXT.md ao final de cada etapa | ✅ APROVADO |
| — | Usuário solicitou que CONTEXT.md capture TUDO: pedidos, reprovações, erros, reversões | Reescrita completa do CONTEXT.md (versão atual) |

**Decisões tomadas nesta sessão:**
- Squad fica em `Claude_Stark` → `squads/relatorio-semanal/` (confirmado pelo usuário)
- Handoff via CONTEXT.md com protocolo Opção B (atualizar após cada etapa)
- CONTEXT.md registra tudo — nada é apagado, apenas marcado com status

**Pendências abertas:**
- Exemplo de relatório real da Destra — pedir ao Vinicius na Etapa 5
- Descobrir `reportei_project_id` da Destra — usar MCP `list_projects` na Etapa 8

**Sequência desta parte da sessão:**
- Usuário pediu para criar CONTEXT.md que consolida tudo (diário + contexto + handoff)
- Usuário perguntou sobre mecanismo de handoff → aprovado Opção B (atualizar após cada etapa)
- Usuário pediu que CONTEXT.md capture TUDO — pedidos, erros, reprovações, reversões → CONTEXT.md reescrito (v2)
- Usuário pediu para reler Encontro 08 + documentos de contexto → feito
- Usuário pediu guia de apresentação completo (a ser criado na Etapa 9, pós-squad pronto)
- Lidos: Encontro 08 completo + Encontro 11 completo → requisitos da apresentação extraídos
- Adicionada Etapa 9 ao plano + seção completa de briefing da apresentação no CONTEXT.md

**Próxima ação:** Etapa 2 — `git checkout -b feat/relatorio-semanal`

---

### Sessão 2 — 2026-05-20

**Início:** CONTEXT.md lido, branch `feat/relatorio-semanal` já existia — Etapa 2 confirmada como concluída.

**Atividades desta sessão:**

| Hora | Ação | Resultado |
|------|------|-----------|
| Início | Lido CONTEXT.md + ativado como Craft (squad-creator) | OK |
| — | Lido transcrição completa Encontro 08 | OK — em contexto |
| — | PDF Encontro 08 tentado | ❌ pdftoppm não disponível — conteúdo coberto pelo CONTEXT.md |
| — | Confirmação: Atividade 1 do zero no Claude Code (não melhoria do Colab) | ✅ APROVADO |
| — | Regras de memória salvas: explicar termos técnicos + usuário chama agentes | ✅ SALVO |
| — | Lido `Automacao de Preenchimento de Metricas.md` (Downloads) | OK — MANUAL_MAP + 12 bugs absorvidos |
| — | Executado `*design-squad --docs docs/prd/relatorio-semanal.md` | ✅ CONCLUÍDO |
| — | Phase 2: domínio confirmado + correção multi-cliente (não só Destra) | ✅ APROVADO |
| — | Phase 2: estrutura da planilha corrigida (1 aba por semana, todos os clientes na mesma aba) | ✅ APROVADO |
| — | Phase 3: 5 agentes revisados e aceitos | ✅ ACEITOS |
| — | Phase 4: 5 tasks revisadas e aceitas (verify-fill e validate-report adicionadas) | ✅ ACEITAS |
| — | Tom do redator definido: neutro + lista de palavras proibidas aprovada | ✅ APROVADO |
| — | **ETAPA 3 CONCLUÍDA** — blueprint gerado em `squads/.designs/relatorio-semanal-design.yaml` | ✅ |

**Decisões tomadas nesta sessão:**
- Squad multi-cliente — bloco "Vinicius" na planilha (não só Destra Desenvolvimentos)
- Aba do Sheets: erro claro se não existir (criação automática = versão futura)
- MANUAL_MAP herdado do Colab + 12 bugs já documentados e corrigidos no blueprint
- Tom do redator: neutro e informativo, lista de palavras proibidas definida
- Tasks `verify-fill.md` e `validate-report.md` adicionadas (não estavam no PRD)

**Pendências abertas:**
- Exemplo de relatório real da Destra — pedir ao Vinicius na Etapa 5
- `reportei_project_id` de cada cliente — descobrir via MCP `list_projects` na Etapa 8
- Criação automática de aba no Sheets — deixado para versão futura

**Próxima ação:** Etapa 4 — `*create-squad relatorio-semanal --from-design` (nova sessão)

---

### Sessão 3 — 2026-05-20

**Início:** CONTEXT.md lido — Etapa 4 confirmada. Blueprint disponível em `squads/.designs/relatorio-semanal-design.yaml`.

**Atividades desta sessão:**

| Hora | Ação | Resultado |
|------|------|-----------|
| Início | Ativado como squad-creator (Craft) via `/AIOX:agents:squad-creator` | OK |
| — | Lido SKILL.md do squad-creator | OK |
| — | Lido CONTEXT.md | OK — Etapa 4 confirmada |
| — | Lido blueprint `squads/.designs/relatorio-semanal-design.yaml` | OK — 5 agentes, 5 tasks, configurações completas |
| — | Lido `squads/super-gestor/squad.yaml` como referência de formato | OK |
| — | **ETAPA 4 CONCLUÍDA** — estrutura completa criada: squad.yaml, CLAUDE.md, README.md, 5 agentes, 5 tasks, workflow, template, checklist, config, examples/.gitkeep, data/.gitkeep | ✅ |
| — | CONTEXT.md atualizado para Etapa 5 | OK |

**Arquivos criados:**
- `squad.yaml` — manifest principal do squad
- `CLAUDE.md` — briefing: voz, regras, restrições
- `README.md` — documentação do squad
- `config/clientes-config.yaml` — MANUAL_MAP, colunas, slugs, exceções
- `agents/relatorio-chief.md` — Tier 0: orquestrador
- `agents/coletor.md` — Tier 1: API Reportei → Sheets
- `agents/redator.md` — Tier 1: geração de narrativa
- `agents/publicador.md` — Tier 1: publicação na Timeline
- `agents/quality-gate.md` — Tier 3: validação em 2 momentos
- `tasks/fetch-metrics.md` — Atividade 1
- `tasks/verify-fill.md` — verificação pós-preenchimento
- `tasks/generate-report.md` — Atividade 2
- `tasks/validate-report.md` — validação do texto
- `tasks/publish-timeline.md` — Atividade 3
- `workflows/weekly-report-pipeline.md` — pipeline completo
- `templates/relatorio-template.md` — template de narrativa (aguarda exemplo real)
- `checklists/qa-relatorio.md` — critério de aceite objetivo (3 blocos + critério de pronto)
- `examples/.gitkeep` — pasta para outputs de demo
- `data/.gitkeep` — pasta para dados estáticos

**Pendências abertas:**
- Exemplo de relatório real da Destra — pedir ao Vinicius na Etapa 5 para ajustar `templates/relatorio-template.md`
- `reportei_project_id` de cada cliente — adicionar em `config/clientes-config.yaml` após descoberta via MCP `list_projects`

**Correções aplicadas no encerramento da Sessão 3:**
- `squad.yaml` — removida referência quebrada `coding-standards: config/coding-standards.md`
- `CONTEXT.md` — token `REPORTEI_TOKEN` redatado (valor real removido por segurança)
- `agents/quality-gate.md` — sincronizado com `qa-relatorio.md`: 8 checks em validate-report (eram 6)

**Resultado da varredura (encerramento Sessão 3):**
- ✅ 5/5 filtros de escolha de atividade presentes
- ✅ 2/2 princípios inegociáveis implementados
- ✅ 4/4 camadas de contexto presentes (Camada 4 funcional, não formal)
- ✅ 5/5 elementos da anatomia presentes
- ✅ Todos os riscos do Anderson tratados
- ❌ Check 1 do critério de pronto: pipeline ainda não rodou ao vivo
- ⚠️ Check 3: `examples/` tem textos de referência — falta output real do pipeline

**Pendências abertas pós-Sessão 3:**
- Regenerar `REPORTEI_TOKEN` no painel do Reportei (o token antigo foi exposto)
- Mapear `reportei_project_id` de cada cliente no `clientes-config.yaml`
- Criar `APRESENTACAO.md` (Etapa 9)
- Palavra "excelente" no exemplo `examples/destra-2026-05-04.md` (baixa prioridade)

**Próxima ação:** Etapa 6 — `*validate-squad relatorio-semanal`

---

## ERROS E CORREÇÕES

| Data | Erro | Correção | Status |
|------|------|----------|--------|
| 2026-05-20 | `Automacao de Preenchimento de Metricas.md` referenciado no handoff mas não existe localmente | Contexto técnico reconstruído a partir da transcrição do Encontro 08 e do handoff | ✅ CONTORNADO |

---

## DECISÕES APROVADAS E REPROVADAS

| Data | Decisão | Status | Motivo |
|------|---------|--------|--------|
| 2026-05-20 | Squad NOVO separado do `super-gestor` | ✅ APROVADO | Domínio diferente — relatórios vs. campanhas |
| 2026-05-20 | Execução da planilha dentro do Claude Code (sem Colab) | ✅ APROVADO | Elimina dependência externa |
| 2026-05-20 | CONTEXT.md versão 1 (apenas estado atual) | ⚠️ INSUFICIENTE | Usuário solicitou diário completo com histórico |
| 2026-05-20 | CONTEXT.md versão 2 (diário completo) | ✅ APROVADO | Captura tudo — pedidos, erros, reversões |
| 2026-05-20 | Protocolo Opção B — atualizar CONTEXT.md após cada etapa | ✅ APROVADO | Garante handoff perfeito entre sessões |
| 2026-05-19 | Atividade 1 (planilha) construída do zero no Claude Code | ✅ APROVADO | Não é melhoria do Colab — pipeline novo, sem dependência externa |
| 2026-05-20 | Aba do Sheets NÃO criada automaticamente — erro claro se não existir | ✅ APROVADO | Criação automática fica para versão futura |
| 2026-05-20 | Squad multi-cliente — bloco Vinicius (não só Destra) | ✅ APROVADO | Roda para todos os clientes gerenciados pelo Vinicius |
| 2026-05-20 | Tom do redator: neutro e informativo — lista de palavras proibidas definida | ✅ APROVADO | Sem elogios exagerados, sem críticas pesadas, sem frases de IA |
| 2026-05-20 | Tasks verify-fill.md e validate-report.md adicionadas | ✅ APROVADO | Verificação pós-preenchimento solicitada pelo usuário |
| 2026-05-20 | Lógica de plataformas: sem config manual — coletor tenta tudo, redator escreve sobre o que tiver dado | ✅ APROVADO | `plataformas` removido do config; se meta_spend > 0 → fala de Meta; se google_spend > 0 → fala de Google; colunas null = plataforma ausente = OK |

---

*Versão: 7 | Última atualização: Sessão 3 (encerramento), 2026-05-20*
*Etapa atual: 6 — *validate-squad relatorio-semanal*

---

## HANDOFF — SESSÃO 4

> Copiar este bloco para o início da próxima conversa, ou simplesmente abrir este CONTEXT.md.

```yaml
handoff:
  from_session: 3
  date: 2026-05-20
  branch: feat/relatorio-semanal
  story_context:
    squad: relatorio-semanal
    etapa_atual: 6
    status: Em progresso
    ultima_acao: >
      Varredura completa contra critérios das aulas feita.
      Resultado: APROVADO COM RESSALVAS.
      3 correções aplicadas (token redatado, squad.yaml limpo, quality-gate sincronizado).
  proxima_acao: "*validate-squad relatorio-semanal"
  sequencia_completa:
    - "6: *validate-squad relatorio-semanal"
    - "7: git commit + PR + merge (delegar a @devops)"
    - "8: Teste MVP ao vivo com Destra Desenvolvimentos — salvar output em examples/"
    - "9: Criar APRESENTACAO.md com roteiro dos 4 blocos (5/8/10/7 min)"
  pendencias_criticas:
    - "Regenerar REPORTEI_TOKEN no painel do Reportei ANTES de testar"
    - "Mapear reportei_project_id de cada cliente no clientes-config.yaml"
  pendencias_baixa_prioridade:
    - "Substituir 'excelente' em examples/destra-2026-05-04.md linha 27"
    - "Criar MEMORY.md por agente (padrão formal AIOX — opcional)"
  arquivos_modificados_sessao_3:
    - squads/relatorio-semanal/squad.yaml
    - squads/relatorio-semanal/CLAUDE.md
    - squads/relatorio-semanal/README.md
    - squads/relatorio-semanal/config/clientes-config.yaml
    - squads/relatorio-semanal/agents/relatorio-chief.md
    - squads/relatorio-semanal/agents/coletor.md
    - squads/relatorio-semanal/agents/redator.md
    - squads/relatorio-semanal/agents/publicador.md
    - squads/relatorio-semanal/agents/quality-gate.md
    - squads/relatorio-semanal/tasks/fetch-metrics.md
    - squads/relatorio-semanal/tasks/verify-fill.md
    - squads/relatorio-semanal/tasks/generate-report.md
    - squads/relatorio-semanal/tasks/validate-report.md
    - squads/relatorio-semanal/tasks/publish-timeline.md
    - squads/relatorio-semanal/workflows/weekly-report-pipeline.md
    - squads/relatorio-semanal/templates/relatorio-template.md
    - squads/relatorio-semanal/checklists/qa-relatorio.md
    - squads/relatorio-semanal/examples/danielle-gondim-2026-05-04.md
    - squads/relatorio-semanal/examples/destra-2026-05-04.md
    - squads/relatorio-semanal/CONTEXT.md
  pontos_fortes_para_apresentacao:
    - "CONTEXT.md como diário completo de sessões — rastreabilidade total"
    - "3 variações de template (META, Google, ambos) com lógica automática"
    - "MANUAL_MAP com 15 entradas baseadas em nomes reais do Reportei"
    - "Exceção Dr. Javier tratada em 4 arquivos distintos"
    - "quality-gate em 2 momentos do pipeline (pós-coleta e pós-texto)"
    - "Lógica de plataforma sem config manual — coletor tenta tudo, redator escreve o que tem dado"
    - "Métricas de ganho calculadas: 1 cliente = 80 min/semana, 5 clientes = ~6,5h/semana"
```
