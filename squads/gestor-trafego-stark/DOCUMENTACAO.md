# DOCUMENTACAO — Squad gestor-trafego-stark
_Gerado em: 2026-05-28 | Versão 1.0_

---

## Sumário

1. [Visão Geral do Squad](#1-visão-geral-do-squad)
2. [Camada 0 — Orquestrador](#2-camada-0--orquestrador)
   - [stark-chief.md](#stark-chiefmd)
3. [Camada 1 — Agentes Tier 1](#3-camada-1--agentes-tier-1)
   - [alerta-monitor.md](#alerta-monitormd)
   - [coletor.md](#coletormd)
   - [redator.md](#redatormd)
   - [publicador.md](#publicadormd)
   - [whatsapp-writer.md](#whatsapp-writermd)
   - [contexto-cliente.md](#contexto-clientemd)
   - [clickup-writer.md](#clickup-writermd)
   - [task-monitor.md](#task-monitormd)
4. [Camada 2 — Agentes Tier 2 (Qualidade)](#4-camada-2--agentes-tier-2-qualidade)
   - [validator.md](#validatormd)
5. [Camada 3 — Tasks](#5-camada-3--tasks)
   - [rotina-semanal.md](#rotina-semanalmd)
   - [rotina-diaria.md](#rotina-diariamd)
   - [monitorar-contas.md](#monitorar-contasmd)
   - [fetch-metrics.md](#fetch-metricsmd)
   - [verify-fill.md](#verify-fillmd)
   - [generate-report.md](#generate-reportmd)
   - [validate-report.md](#validate-reportmd)
   - [publish-timeline.md](#publish-timelinemd)
   - [save-history.md](#save-historymd)
   - [preencher-clickup.md](#preencher-clickupmd)
6. [Camada 4 — Workflows](#6-camada-4--workflows)
   - [weekly-pipeline.md](#weekly-pipelinemd)
7. [Camada 5 — Checklists](#7-camada-5--checklists)
   - [alertas-gate.md](#alertas-gatemd)
   - [sheets-gate.md](#sheets-gatemd)
   - [relatorio-gate.md](#relatorio-gatemd)
   - [clickup-gate.md](#clickup-gatemd)
8. [Camada 6 — Templates](#8-camada-6--templates)
   - [relatorio-template.md](#relatorio-templatemd)
   - [whatsapp-template.md](#whatsapp-templatemd)
   - [contexto-cliente-template.md](#contexto-cliente-templatemd)
9. [Camada 7 — Dados](#9-camada-7--dados)
   - [data/clientes.yaml](#dataclientes-yaml)
   - [data/thresholds-por-especialidade.yaml](#datathresholds-por-especialidadeyaml)
   - [data/historico-clientes.yaml](#datahistorico-clientesyaml)
10. [Camada 8 — Configuração](#10-camada-8--configuração)
    - [config/settings.yaml](#configsettingsyaml)
    - [squad.yaml](#squadyaml)
    - [CLAUDE.md](#claudemd)
11. [Scripts](#11-scripts)
    - [scripts/fill_sheets.py](#scriptsfill_sheetspy)
12. [Decisões Arquiteturais (ADRs)](#12-decisões-arquiteturais-adrs)
13. [Mapa de Integrações MCPs](#13-mapa-de-integrações-mcps)

---

## 1. Visão Geral do Squad

O `gestor-trafego-stark` é um squad AIOX que automatiza as rotinas diárias e semanais dos gestores de tráfego pago da Stark Marketing: **Vinicius Lima** e **Gustavo Radler**.

**Origem:** fusão de dois squads independentes (`gestor-trafego-vinicius` e `gestor-trafego-gustavo`) em uma única unidade operacional. A fusão preservou toda a lógica de cada gestor e unificou a estrutura de dados, os agentes e o orquestrador.

**Escopo:**
- 28 clientes ativos no nicho saúde/medicina
- Monitoramento de Meta Ads e Google Ads via 4 MCPs
- Preenchimento de planilha Google Sheets (clientes Vinicius)
- Geração e publicação de relatórios no Reportei
- Escrita de status reports no ClickUp
- Gestão de contexto de clientes no Google Drive

**4 rotinas disponíveis:**

| Comando | Descrição |
|---------|-----------|
| `*rotina-semanal` | Pipeline completo de 6 fases |
| `*rotina-diaria` | Alertas + inbox ClickUp |
| `*monitorar-contas` | Painel de alertas de todas as contas |
| `*status-report-clickup` | Draft → aprovação → escrita ClickUp |

**Arquitetura em 3 camadas:**

```
[Tier 0] stark-chief ─── orquestrador central
[Tier 1] 8 agentes ───── domínios especializados
[Tier 2] validator ───── gates de qualidade
```

---

## 2. Camada 0 — Orquestrador

### stark-chief.md

**O que é:** O orquestrador central do squad. É o ponto de entrada único para todos os comandos. Não executa nenhuma ação diretamente sobre APIs — seu papel é receber a instrução do gestor, resolver qual cliente está sendo referenciado, determinar o fluxo correto e delegar cada fase ao agente especializado.

**Papel no squad:** Tier 0 — roteador, resolvedor de identidade e gestor de estado do pipeline.

**Por que existe:** Sem um orquestrador, cada agente precisaria implementar resolução de cliente, tratamento de erros, lógica de fluxo condicional e gate checks. O stark-chief centraliza toda essa lógica, mantendo os agentes Tier 1 focados em seu domínio.

**Como funciona:**

*Resolução de cliente (4 passos):*
1. Exact match por `nome` em `data/clientes.yaml`
2. Exact match por `slug`
3. Fuzzy match com threshold 0.60 (configurável em `config/settings.yaml`)
4. Fallback: listar todos os slugs e pedir confirmação

*Determinação de gestor:*
- `gestores: [vinicius]` → rotinas Vinicius (inclui FASE 2 — Sheets)
- `gestores: [gustavo]` → FASE 2 pulada
- `gestores: [vinicius, gustavo]` → perguntar "Para qual gestor rodar?"

*7 comandos roteados:*

| Comando | Ação |
|---------|------|
| `*rotina-semanal` | Inicia pipeline de 6 fases via `tasks/rotina-semanal.md` |
| `*rotina-diaria` | Executa `tasks/rotina-diaria.md` |
| `*planilha` | Aciona `coletor` via tasks `fetch-metrics` + `verify-fill` |
| `*relatorio-reportei` | Aciona `redator` + `publicador` via tasks correspondentes |
| `*status-report-clickup` | Aciona `clickup-writer` via `tasks/preencher-clickup.md` |
| `*monitorar-contas` | Aciona `alerta-monitor` via `tasks/monitorar-contas.md` |
| `*monitor-tarefas` | Aciona `task-monitor` via bloco em `tasks/rotina-diaria.md` |

*Modo multi-cliente:* Quando o comando vem sem argumentos, o stark-chief solicita confirmação interativa. Quando `all` é passado, itera sobre todos os clientes do gestor em sequência.

**Inputs:** Comando do gestor (texto livre) + `data/clientes.yaml` (para resolução de cliente)

**Outputs:** Delegação para agente/task correto + resumo final de cada pipeline executado

**Integra com:** Todos os agentes Tier 1 e Tier 2; `data/clientes.yaml`; todos os tasks

**No fluxo:** Sempre é o primeiro agente ativado em qualquer rotina. Nenhum outro agente é chamado diretamente pelo gestor.

---

## 3. Camada 1 — Agentes Tier 1

Os agentes Tier 1 são os executores de domínio. Cada um opera dentro de uma área específica e recebe inputs do stark-chief (via task) ou de outros agentes na cadeia do pipeline.

---

### alerta-monitor.md

**O que é:** Agente de monitoramento de métricas de tráfego pago. Itera sobre toda a carteira ativa (28 clientes), coleta dados de performance e emite alertas classificados por severidade.

**Papel no squad:** Monitoramento de Meta Ads e fallback Reportei; produtor do `metricas_coletadas` dict (ADR-04).

**Por que existe:** Os gestores precisam de visibilidade diária sobre anomalias em todas as contas — CPL acima do limiar, frequência de saturação, CPM elevado. O alerta-monitor centraliza essa função e elimina a necessidade de o gestor verificar cada plataforma manualmente.

**Como funciona:**

*Por cliente, em lotes de 3 (`lote_paralelo: 3`):*
1. Se `excluir_meta_monitoring: true` → skip (caso: Dr. Laureano Filho, Google Ads only)
2. Se `meta_ad_account_id` preenchido → Meta Ads MCP (CPM, CTR, frequência, CPL)
3. Se `meta_ad_account_id: null` → Reportei API (apenas CPL disponível)

*Aplicação de thresholds:*
- Lê `data/thresholds-por-especialidade.yaml` para o limiar correto por especialidade
- Verifica regras de supressão `quando_nao_alertar` antes de emitir qualquer alerta:
  - Campanha com menos de 7 dias → não alertar
  - Spend < R$20 em last_3d → não alertar
  - Impressões < 1.000 → frequência instável → não alertar
- Aplica `frequencia_por_tipo_campanha` por prefixo (TOFU/MOFU/BOFU/AWARENESS)
- Aplica `kill_switch` (conversas=0 por 3 dias com 7+ dias de veiculação → CRÍTICO)

*Severidades:* 🔴 CRÍTICO | 🟡 ATENÇÃO | ℹ️ INFORMATIVO | ✅ SEM ALERTAS

*Output estruturado:*
```yaml
alertas_ativos: list[alerta]     # cada alerta com cliente, severidade, métrica, valor, threshold
metricas_coletadas:              # dict keyed por slug — passado para coletor (FASE 2)
  imcp:
    meta_spend: 1234.56
    conversas: 18
    meta_cpl: 68.58
    cpm: 28.40
    ctr: 1.9
    frequency: 2.3
    fonte: "meta_ads"            # ou "reportei_fallback" ou "excluido"
    lookback: "last_3d"
    coletado_em: "2026-05-28T..."
```

*Organização do output:* Painel dividido por bloco (Vinicius → Compartilhados → Gustavo), cada bloco com lista de alertas e seção "SEM ALERTAS" para contas saudáveis.

**Inputs:** `data/clientes.yaml`, `data/thresholds-por-especialidade.yaml`, `config/settings.yaml`; Meta Ads MCP ou Reportei MCP por cliente

**Outputs:** Painel de alertas formatado + `metricas_coletadas` dict (handoff para coletor)

**Integra com:** Meta Ads MCP, Reportei MCP, validator (gate_alertas), coletor (via handoff)

**No fluxo:** FASE 1 do `*rotina-semanal`; também acionado standalone por `*monitorar-contas` e como Bloco 1 do `*rotina-diaria`

---

### coletor.md

**O que é:** Agente responsável por coletar métricas semanais e preencher a planilha Google Sheets. Opera exclusivamente para clientes com `vinicius in gestores`.

**Papel no squad:** Coletor de métricas semanais + executor do `fill_sheets.py`.

**Por que existe:** Vinicius mantém uma planilha semanal com métricas de cada cliente. O coletor automatiza a coleta de dados de múltiplas fontes (Meta Ads reaproveitado + Google Ads via Reportei) e o preenchimento das colunas corretas por cliente.

**Como funciona:**

*ADR-04 — Reaproveitamento de dados:*
O coletor RECEBE `metricas_coletadas` da FASE 1 (alerta-monitor). Isso evita uma segunda chamada à API Meta Ads para os mesmos dados.

| Plataforma | Fonte dos dados |
|------------|----------------|
| Meta Ads (meta_spend, conversas) | `metricas_coletadas` da FASE 1 |
| Google Ads (google_spend) | Reportei MCP — SEMPRE busca aqui |
| Seguidores Instagram | Reportei MCP — SEMPRE busca aqui |
| CPL Meta | Calculado: meta_spend / conversas |

*Slugs Reportei (exatos — não alterar):*
- Google Ads spend: `google_adwords` (não `google_ads`)
- Seguidores: `ig:new_followers_count`
- Conversas WhatsApp: `messaging_conversation_started_7d`
- Custo Google: valor direto (sem ÷ 1.000.000)

*Lógica `_to_float()`:* Converte strings monetárias ("R$1.234,56") para float antes de escrever na planilha, evitando erros de formatação.

*Rate limit:* `sleep(0.6)` entre chamadas Reportei (configurado em `config/settings.yaml`).

*Preenchimento:* Chama `scripts/fill_sheets.py` com as métricas coletadas em formato JSON. O script localiza cada cliente na coluna A da aba da semana e preenche as colunas definidas em `sheet_columns` de `data/clientes.yaml`.

*Fallback FASE 1 offline:* Se `metricas_coletadas` ausente (MCP indisponível na FASE 1), busca Meta Ads diretamente — mas apenas como exceção.

**Inputs:** `metricas_coletadas` (da FASE 1), `data/clientes.yaml` (sheet_columns), Reportei MCP (google_spend, seguidores), `config/settings.yaml` (slugs)

**Outputs:** Planilha preenchida; dados estruturados para `redator` (FASE 3)

**Integra com:** alerta-monitor (recebe handoff), Reportei MCP, fill_sheets.py (executor), validator (gate_sheets), save-history (acionado em FASE 6)

**No fluxo:** FASE 2 do `*rotina-semanal` (condicional: só clientes Vinicius); também acionado standalone por `*planilha`

---

### redator.md

**O que é:** Agente de geração de narrativa do relatório semanal. Transforma métricas brutas em um texto HTML estruturado, contextualizado pela especialidade do cliente e histórico de performance.

**Papel no squad:** Produção do conteúdo do relatório — única saída de linguagem natural do pipeline.

**Por que existe:** Métricas sozinhas não comunicam contexto. O redator classifica os resultados dentro dos benchmarks da especialidade, compara com o histórico e escreve em um tom neutro e informativo, conforme as regras de voz do squad.

**Como funciona:**

*Fluxo interno:*
1. Recebe métricas (da FASE 2 ou direto do Reportei se FASE 2 foi pulada)
2. Recebe `contexto_cliente` do agente `contexto-cliente` (pode ser `disponivel: false`)
3. Classifica CPL pela tabela da especialidade em `thresholds-por-especialidade.yaml` (saudavel / atencao / critico — termos internos, nunca expostos no relatório)
4. Consulta `data/historico-clientes.yaml` para comparação com semanas anteriores
5. Busca dados extras via Reportei MCP (CPC, cliques, period-over-period)
6. Gera narrativa HTML conforme `templates/relatorio-template.md`

*Templates disponíveis (3):*
- Meta Ads only: quando cliente não tem Google Ads
- Meta Ads + Google Ads: cliente com ambas as plataformas
- Google Ads only: Dr. Laureano Filho (excluir_meta_monitoring)

*Regras de voz (CLAUDE.md):*
- Tom neutro e informativo — sem elogios ou críticas exageradas
- Palavras proibidas de elogio: incrível, surpreendente, excelente, extraordinário, fantástico, brilhante
- Palavras proibidas de crítica: preocupante, alarmante, crítico, péssimo, desastroso, infelizmente
- Jargão de IA proibido: alavancar, potencializar, maximizar, robusto, sinergia, ecossistema
- Frases de IA proibidas: "é importante ressaltar", "cabe destacar", "nesse sentido", "isso posto"

*Output:* HTML completo, estruturado, pronto para publicar no Reportei. Nunca texto puro ou markdown.

**Inputs:** Métricas do período, `contexto_cliente` (objeto), `data/thresholds-por-especialidade.yaml`, `data/historico-clientes.yaml`, Reportei MCP (dados extras)

**Outputs:** Narrativa HTML (`texto_relatorio`) para o `publicador`

**Integra com:** contexto-cliente (recebe contexto), coletor (recebe métricas), Reportei MCP, validator (gate_reportei)

**No fluxo:** FASE 3 do `*rotina-semanal`; também acionado por `*relatorio-reportei`

---

### publicador.md

**O que é:** Agente responsável por publicar o relatório na Timeline do Reportei e acionar o whatsapp-writer.

**Papel no squad:** Publicação do marco semanal + geração da mensagem WhatsApp.

**Por que existe:** A publicação na Timeline do Reportei é a entrega formal do relatório ao cliente. O publicador encapsula a lógica de deduplicação (evitar publicar o mesmo relatório duas vezes), controle de rate limit e handoff para o whatsapp-writer.

**Como funciona:**

*Deduplicação via `timeline-log.jsonl`:*
- Antes de publicar, verifica se já existe um evento para o cliente no período
- Se existir, informa ao gestor e pede confirmação antes de criar novo evento
- Após publicar, registra o evento em `timeline-log.jsonl` (cliente, data, event_id)

*Rate limit:* Máximo 40 requisições a cada 9 minutos no Reportei MCP.

*Publicação:*
- Chama `mcp__create_timeline_event` com o HTML do relatório
- Registra `timeline_event_id` e `link_relatorio`
- Aciona `whatsapp-writer` com os dados do relatório publicado

**Inputs:** `texto_relatorio` (HTML do redator), `data/clientes.yaml` (reportei_project_id), `timeline-log.jsonl`

**Outputs:** `timeline_event_id`, `link_relatorio`, `mensagem_whatsapp` (via whatsapp-writer)

**Integra com:** Reportei MCP (create_timeline_event), redator (recebe HTML), whatsapp-writer (aciona), validator (gate_reportei pré-publicação)

**No fluxo:** FASE 4 do `*rotina-semanal` (paralela com FASE 5); também acionado por `*relatorio-reportei`

---

### whatsapp-writer.md

**O que é:** Agente especializado em formatar a mensagem WhatsApp que o gestor envia ao cliente após o relatório.

**Papel no squad:** Geração da mensagem de entrega do relatório, pronta para copiar e enviar.

**Por que existe:** A mensagem WhatsApp tem regras específicas de formatação e conteúdo que dependem do horário, dos resultados e das características do cliente. Centralizar essa lógica em um agente garante consistência.

**Como funciona:**

*Saudação dinâmica por horário:*
- 06h–11h59 → "Bom dia"
- 12h–17h59 → "Boa tarde"
- 18h–23h59 → "Boa noite"

*Campo INVESTIMENTO:*
- Se apenas Meta Ads: exibir apenas `meta_spend`
- Se Meta + Google: exibir `meta_spend + google_spend` (soma) e detalhar cada um
- Se apenas Google: exibir apenas `google_spend`

*Regra CPL:*
- Se `conversas = 0` → omitir a linha de CPL completamente (não exibir "R$0,00")
- Se `conversas > 0` → exibir CPL normalmente

*Nome do cliente:* Usa `nome_whatsapp` de `data/clientes.yaml` (ex: "Dr. Leandro", não o nome completo)

*Template base:* `templates/whatsapp-template.md`

**Inputs:** Dados do relatório (publicador), `data/clientes.yaml` (nome_whatsapp), horário atual

**Outputs:** `mensagem_whatsapp` (texto formatado, pronto para copiar)

**Integra com:** publicador (recebe dados), stark-chief (exibe mensagem no resumo final)

**No fluxo:** FASE 4 do `*rotina-semanal`, chamado pelo publicador após criar o timeline event

---

### contexto-cliente.md

**O que é:** Agente não-bloqueante que lê e atualiza documentos de contexto por cliente no Google Drive.

**Papel no squad:** Memória persistente por cliente — armazena perfil, momento comercial, pontos de atenção e aprendizados das semanas anteriores.

**Por que existe:** O redator precisa de contexto qualitativo para escrever um relatório útil (ex: "o cliente está em high season" ou "última semana tivemos problema com o pixel"). Sem contexto, o relatório fica genérico. O contexto-cliente lê esse documento antes do redator e atualiza após o ciclo semanal.

**Como funciona:**

*Modo `carregar-contexto` (Sub-passo 3.1 da FASE 3):*
- Busca documento `"Contexto - {nome_cliente}"` na pasta `"Contexto Clientes - Stark"` no Drive
- Retorna objeto `contexto_cliente`:
  ```yaml
  disponivel: true
  perfil: "..."
  momento_comercial_atual: "..."
  pontos_de_atencao: [...]
  aprendizados: [última entrada, ...]
  ```
- Timeout 10s → se exceder → `disponivel: false` → pipeline continua sem bloquear

*Modo `atualizar-contexto` (Sub-passo 6.2 da FASE 6):*
- Gera 2–4 observações objetivas da semana (não opiniões)
- Insere nova entrada no topo de `## aprendizados` do documento Drive
- Mantém apenas as últimas 8 entradas (remove as mais antigas)
- Nunca bloqueia o pipeline

*Template do documento:* `templates/contexto-cliente-template.md`

*Regra de não-bloqueio:* Em AMBOS os modos (leitura e escrita), qualquer falha emite aviso e o pipeline continua. Este agente nunca pode ser o motivo de um STOP.

**Inputs:** `nome_cliente` (para localizar o documento), dados do relatório (para atualizar aprendizados)

**Outputs:** Objeto `contexto_cliente` (para redator) | documento Drive atualizado

**Integra com:** Google Drive MCP, redator (fornece contexto), stark-chief (recebe aviso de falha)

**No fluxo:** Sub-passo 3.1 (leitura, antes do redator) e Sub-passo 6.2 (escrita, FASE 6 wrap-up)

---

### clickup-writer.md

**O que é:** Agente de escrita de status reports no ClickUp. Reconstitui as ações da semana a partir de múltiplas fontes, apresenta draft para aprovação e escreve na subpágina do cliente.

**Papel no squad:** Registro semanal das ações do gestor no CRM/ClickUp do cliente.

**Por que existe:** O status report no ClickUp é a entrega de accountability para o cliente — mostra o que foi feito naquela semana com o tráfego. É uma entrega manual que o squad automatiza com a exigência de aprovação humana antes de qualquer escrita.

**Como funciona:**

*Roteamento por gestor:*
- `gestores: [vinicius]` → doc `"Status Report - Vinicius"`
- `gestores: [gustavo]` → doc `"Status Report - Gustavo"`
- `gestores: [vinicius, gustavo]` → perguntar ao gestor qual doc usar

*Fluxo em 9 passos:*
1. Resolver doc de destino por gestor
2. Localizar subpágina do cliente no doc
3. Reconstituir ações da semana (4 fontes: Meta Ads MCP, Reportei MCP, Gmail MCP, ClickUp MCP tasks)
4. Identificar período automaticamente (segunda a domingo da semana anterior)
5. Classificar ações por categoria (criativo, segmentação, orçamento, otimização)
6. Gerar draft estruturado com campos obrigatórios (Período, Plataforma, Investimento, CPL, Ações, Próximos Passos)
7. **PAUSA OBRIGATÓRIA** — apresentar draft ao gestor para aprovação explícita
8. Após "sim" ou "aprovado": appendar bloco na subpágina
9. Acionar validator (gate_clickup)

*Absolutamente proibido:* Escrever qualquer conteúdo no ClickUp sem aprovação explícita do gestor. Esta é uma regra inviolável (absolute_veto no squad.yaml).

**Inputs:** Dados do relatório, `data/clientes.yaml` (clickup_status_list_id), Meta Ads MCP, Reportei MCP, ClickUp MCP

**Outputs:** Bloco semanal appendado na subpágina do cliente no ClickUp; `doc_page_id` + confirmação

**Integra com:** ClickUp MCP (leitura de tasks + escrita de doc), Meta Ads MCP (sinais de ação), Reportei MCP (dados de relatório), validator (gate_clickup)

**No fluxo:** FASE 5 do `*rotina-semanal` (paralela com FASE 4); também acionado standalone por `*status-report-clickup`

---

### task-monitor.md

**O que é:** Agente de monitoramento de tarefas no ClickUp. Lista o inbox do gestor, verifica evidências de conclusão e marca tasks como concluídas quando confirmadas digitalmente.

**Papel no squad:** Gestão de inbox e automação de marcação de tasks concluídas.

**Por que existe:** Os gestores acumulam tarefas no ClickUp ao longo da semana. O task-monitor centraliza a visão do inbox por assignee (por gestor), identifica urgentes e verifica automaticamente se uma task relacionada ao relatório ou planilha já foi concluída (com base em evidências via MCP).

**Como funciona:**

*Parâmetro `gestor`:*
- `vinicius` → filtra tasks do Vinicius no ClickUp
- `gustavo` → filtra tasks do Gustavo
- `ambos` → combina os dois (usado na `*rotina-diaria` quando não especificado)

*Verificação de evidências:*
- Task de relatório → verifica se `timeline_event_id` existe no Reportei via MCP
- Task de planilha → verifica se dados da semana estão na aba do Sheets
- Task de status report → verifica se o bloco foi appendado no ClickUp doc correto (por gestor)
- Se evidência digital confirmada → marca como concluída automaticamente

*Organização por urgência:*
1. Vencidas hoje / ontem
2. Vencendo nos próximos 3 dias
3. Sem prazo definido
4. Concluídas recentemente (últimas 24h)

*Comportamento não-bloqueante:* Qualquer falha (MCP offline, task não encontrada) emite aviso silencioso e não interrompe o pipeline.

**Inputs:** `gestor` (parâmetro), ClickUp MCP (lista de tasks), Reportei MCP (verificação de relatório)

**Outputs:** Inbox formatado por urgência; tasks marcadas como concluídas (quando evidenciadas)

**Integra com:** ClickUp MCP, Reportei MCP, stark-chief (exibe resultado), alerta-monitor (Bloco 2 do `*rotina-diaria`)

**No fluxo:** Sub-passo 6.3 do `*rotina-semanal` (wrap-up); Bloco 2 do `*rotina-diaria`; standalone via `*monitor-tarefas`

---

## 4. Camada 2 — Agentes Tier 2 (Qualidade)

### validator.md

**O que é:** Agente de qualidade do squad. Implementa 4 gates estruturados que verificam se os outputs dos agentes Tier 1 atendem a critérios mínimos antes de avançar no pipeline.

**Papel no squad:** Guardião da qualidade — nenhuma publicação, preenchimento ou escrita ocorre sem passar por um gate.

**Por que existe:** Sem gates, um relatório com dados errados seria publicado, uma planilha preenchida com valores estimados passaria despercebida, ou um status report com CPL inválido seria escrito no ClickUp. O validator é a última barreira antes de cada ação irreversível.

**Como funciona:**

*4 gates disponíveis:*

**gate_sheets** (7 critérios — checklist: `checklists/sheets-gate.md`):
1. fill_sheets.py encerrou com exit code 0
2. Número de clientes processados bate com clientes ativos no YAML
3. Período correto (segunda da semana anterior)
4. Nenhum campo preenchido como null ou string vazia
5. Colunas preenchidas batem com `sheet_columns` do cliente (não uma a mais, não uma a menos)
6. Nenhum valor é estimado (zero é válido — estimado não)
7. Aba existe na planilha (não foi criada automaticamente)

**gate_reportei** (5 critérios — checklist: `checklists/relatorio-gate.md`):
1. `report_id` ou `timeline_event_id` retornado pelo MCP (confirmação de criação)
2. HTML contém pelo menos uma métrica monetária (R$)
3. Período correto no título
4. HTML válido (abertura e fechamento de tags)
5. Nenhuma palavra proibida presente no texto

**gate_alertas** (6 critérios — checklist: `checklists/alertas-gate.md`):
1. Todos os 28 clientes ativos foram verificados (ou registrados como skip com motivo)
2. Cada alerta cita o threshold explicitamente (ex: "CPL R$72 acima de R$15,00")
3. Evidência quantitativa para cada alerta
4. Lookback indicado e spend mínimo de R$20 respeitado
5. Seção "SEM ALERTAS" presente com pelo menos uma conta
6. Nenhuma recomendação de ação de campanha (apenas notificação)

**gate_clickup** (5 critérios — checklist: `checklists/clickup-gate.md`):
1. Campos obrigatórios presentes: Período, Plataforma, Investimento, CPL, Ações, Próximos Passos
2. Período indicado no cabeçalho do bloco
3. Confirmação de escrita retornada pelo ClickUp MCP
4. Nenhum valor de campo vazio ou placeholder
5. CPL exibido como `-` quando conversas = 0 (não "R$0,00")

*Comportamento por resultado:*
- `gate_alertas` FAIL → exibir alertas problemáticos + perguntar ao gestor se quer continuar
- `gate_sheets` FAIL → STOP — aguardar correção (não avançar para FASE 3)
- `gate_reportei` FAIL 1ª vez → devolver ao redator para regeneração (1 retry)
- `gate_reportei` FAIL 2ª vez → STOP — aguardar ação do gestor
- `gate_clickup` FAIL → devolver ao clickup-writer com itens problemáticos

**Inputs:** Output do agente Tier 1 correspondente; checklists; dados de contexto

**Outputs:** PASS ou FAIL com itens problemáticos identificados

**Integra com:** Todos os agentes Tier 1 (um gate por agente principal); stark-chief (recebe resultado)

**No fluxo:** Após cada agente principal em cada fase do pipeline

---

## 5. Camada 3 — Tasks

As tasks são arquivos Markdown que descrevem a lógica executável detalhada de cada operação. Os agentes os recebem como instruções estruturadas. Diferem dos agentes porque são "o que fazer" (procedimento), não "quem faz" (identidade e capacidades do agente).

---

### rotina-semanal.md

**O que é:** O arquivo mais importante do squad. Descreve o pipeline completo de 6 fases da rotina semanal, com todos os handoffs, gates, comportamentos de falha e lógica condicional.

**Papel no squad:** Especificação executável do pipeline semanal — a "constituição" do squad.

**Por que existe:** O pipeline semanal tem 6 fases, 10+ agentes, 4 gates, lógica condicional por gestor e múltiplos comportamentos de falha. Esta complexidade precisa estar documentada de forma estruturada para que o stark-chief possa executar cada fase corretamente.

**Como funciona:**

```
PRÉ-EXECUÇÃO → resolver cliente (4 passos) + determinar gestor

FASE 1 — MONITORAMENTO (obrigatória)
  alerta-monitor → todas as contas ativas
  gate_alertas → PASS: continuar | FAIL: perguntar gestor

FASE 2 — SHEETS (condicional: vinicius in gestores)
  coletor ← metricas_coletadas (ADR-04)
  gate_sheets → PASS: continuar | FAIL: STOP

FASE 3 — NARRATIVA (obrigatória)
  contexto-cliente [leitura, não-bloqueante, timeout 10s]
  redator → narrativa HTML
  gate_reportei → FAIL 1ª: regenerar | FAIL 2ª: STOP

FASE 4 ∥ FASE 5 (paralelas — ADR-05)
  FASE 4: publicador → create_timeline_event → whatsapp-writer
  FASE 5: clickup-writer → draft → aprovação → append → gate_clickup

FASE 6 — WRAP-UP (tudo não-bloqueante)
  coletor → save-history
  contexto-cliente → atualizar Drive
  task-monitor → marcar tasks concluídas

RESUMO FINAL → status por fase + mensagem WhatsApp
```

**Tabela de comportamentos de falha (resumida):**

| Fase | Falha | Comportamento |
|------|-------|---------------|
| 1 MCP offline | Continuar com fallback Reportei |
| 1 gate FAIL | Perguntar se quer continuar |
| 2 aba não existe | STOP — erro claro |
| 2 gate FAIL | STOP |
| 3 gate FAIL 1ª | Regenerar (retry 1x) |
| 3 gate FAIL 2ª | STOP |
| 4 MCP offline | FASE 4 SKIPPED |
| 5 MCP offline | FASE 5 SKIPPED |
| 6 qualquer | Aviso; nunca bloqueia |

**Inputs:** Cliente (resolvido), gestor determinado, outputs de cada fase anterior

**Outputs:** `resumo_final` (status COMPLETED/PARTIAL/FAILED por fase) + `mensagem_whatsapp`

---

### rotina-diaria.md

**O que é:** Task da rotina diária — executa monitoramento de contas + verificação de inbox ClickUp.

**Como funciona:** Dois blocos independentes:
- Bloco 1: `alerta-monitor` para todos os clientes ativos → painel de alertas
- Bloco 2: `task-monitor` filtrado pelo `gestor` passado como parâmetro

Se gestor não especificado, stark-chief pergunta "Para qual gestor? vinicius | gustavo | ambos"

**No fluxo:** Acionado por `*rotina-diaria [gestor]`

---

### monitorar-contas.md

**O que é:** Task de monitoramento standalone — executa apenas a FASE 1 (alerta-monitor) sem iniciar o pipeline completo.

**Como funciona:** Executa o alerta-monitor para todos os clientes ativos, aplica thresholds e emite o painel de alertas. Não produz `metricas_coletadas` com intenção de handoff (apenas para visualização).

**No fluxo:** Acionado por `*monitorar-contas`

---

### fetch-metrics.md

**O que é:** Task de coleta de métricas semanais para um cliente específico (parte do `*planilha`).

**Como funciona:**
1. Recebe `metricas_coletadas` se disponível (ADR-04) — ou busca Meta Ads diretamente
2. SEMPRE busca google_spend e seguidores via Reportei
3. Aplica `_to_float()` para conversão de valores
4. Passa dados para `verify-fill.md`

**No fluxo:** FASE 2 do `*rotina-semanal`; também acionado standalone pelo comando `*planilha`

---

### verify-fill.md

**O que é:** Task de verificação e preenchimento da planilha — executa `fill_sheets.py` e aciona `gate_sheets`.

**Como funciona:**
1. Verifica que a aba da semana existe (formato DD/MM/AAAA)
2. Chama `fill_sheets.py` com métricas em JSON
3. Verifica result: exit code 0, nenhum erro, nenhum cliente com status "erro"
4. Aciona validator (gate_sheets)
5. Se gate PASS → continuar; se FAIL → STOP com detalhamento

*Regra: zero é válido, null não é.* Um campo preenchido com 0 significa "zero conversas esta semana", não "dado ausente".

**No fluxo:** Executada após `fetch-metrics.md`, antes de avançar para FASE 3

---

### generate-report.md

**O que é:** Task de geração da narrativa do relatório — coordena o fluxo redator + contexto-cliente.

**Como funciona:**
1. Aciona `contexto-cliente` (modo `carregar-contexto`) — non-blocking, timeout 10s
2. Aciona `redator` com métricas + objeto `contexto_cliente`
3. Redator classifica CPL, consulta histórico, busca dados extras via Reportei
4. Retorna `texto_relatorio` (HTML)

**No fluxo:** FASE 3 do `*rotina-semanal`; também parte do `*relatorio-reportei`

---

### validate-report.md

**O que é:** Task de validação do relatório antes da publicação — executa gate_reportei com 6 verificações.

**Como funciona:**
1. Verifica datas no relatório (período correto)
2. Verifica valores monetários (pelo menos um R$ presente)
3. Verifica nome do cliente no título
4. Verifica extensão mínima (3+ parágrafos)
5. Verifica palavras proibidas (lista de CLAUDE.md)
6. Verifica integridade do HTML

Máximo de 2 tentativas. Se falhar duas vezes → STOP.

**No fluxo:** Após `generate-report.md`, antes de `publish-timeline.md`

---

### publish-timeline.md

**O que é:** Task de publicação do marco na Timeline do Reportei.

**Como funciona:**
1. Verifica deduplicação em `timeline-log.jsonl`
2. Chama `mcp__create_timeline_event` com o HTML
3. Registra evento em `timeline-log.jsonl`
4. Aciona `whatsapp-writer` com dados do relatório publicado
5. Retorna `timeline_event_id` + `link_relatorio`

*Deduplicação:* Se já existe evento para o cliente/período, confirmar com gestor antes de criar novo.

**No fluxo:** FASE 4 do `*rotina-semanal`; parte de `*relatorio-reportei`

---

### save-history.md

**O que é:** Task não-bloqueante de persistência de histórico de métricas semanais.

**Como funciona:**
1. Lê `data/historico-clientes.yaml`
2. Verifica idempotência (evita duplicar entrada da mesma semana para o mesmo cliente)
3. Adiciona nova entrada com métricas da semana
4. Limita a 52 entradas por cliente (1 ano de histórico)
5. Gera slug da semana no formato `{slug-cliente}-{YYYY-WNN}`

*Nunca bloqueia.* Qualquer falha emite aviso e o pipeline segue.

**No fluxo:** Sub-passo 6.1 do wrap-up (FASE 6), acionado pelo coletor

---

### preencher-clickup.md

**O que é:** Task de escrita do status report no ClickUp — detalha o fluxo completo de 10 passos.

**Como funciona:**
1. Resolver doc de destino (Vinicius ou Gustavo)
2. Localizar subpágina do cliente
3. Reconstituir ações da semana (4 fontes: Meta Ads, Reportei, Gmail, ClickUp tasks)
4. Identificar período
5. Classificar ações por categoria
6. Gerar draft com campos obrigatórios
7. **PAUSA OBRIGATÓRIA** para aprovação do gestor
8. Após aprovação: append do bloco
9. Acionar gate_clickup
10. Se FAIL → retornar ao clickup-writer com itens problemáticos

**No fluxo:** FASE 5 do `*rotina-semanal`; standalone via `*status-report-clickup`

---

## 6. Camada 4 — Workflows

### weekly-pipeline.md

**O que é:** Documento de referência macro do pipeline semanal — não é executável, é documental.

**Papel no squad:** Visão de alto nível do fluxo completo com diagrama ASCII, tabela de handoffs, MCPs por fase e ADRs relevantes.

**Por que existe:** O `tasks/rotina-semanal.md` é a especificação executável detalhada. O `weekly-pipeline.md` é a visão arquitetural — útil para entender o todo sem se perder nos detalhes operacionais.

**Conteúdo:**
- Diagrama de fluxo ASCII completo (todas as 6 fases + decisões condicionais)
- Tabela de handoffs: quem entrega o quê para quem
- Tabela de MCPs: qual MCP é usado em qual fase e para quê
- ADRs: ADR-01, ADR-04, ADR-05, ADR-06, ADR-07

**No fluxo:** Referência de documentação — não participa do pipeline de execução

---

## 7. Camada 5 — Checklists

Os checklists são listas de critérios que o `validator` usa para executar cada gate. Cada item é verificável objetivamente — o validator não faz julgamentos subjetivos, apenas verifica se critérios concretos são atendidos.

---

### alertas-gate.md

**Gate:** `gate_alertas` | **Critérios:** 6

1. Cobertura completa — todos os 28 clientes verificados ou com skip registrado
2. Threshold explícito em cada alerta
3. Evidência quantitativa (valor atual vs. threshold)
4. Lookback indicado e spend mínimo respeitado (R$20 / 3 dias)
5. Seção "SEM ALERTAS" presente
6. Nenhuma recomendação de ação de campanha

---

### sheets-gate.md

**Gate:** `gate_sheets` | **Critérios:** 7

1. fill_sheets.py encerrou com exit code 0
2. Contagem de clientes processados correta
3. Período da aba correto
4. Nenhum campo null ou vazio
5. Colunas preenchidas batem com sheet_columns do cliente
6. Nenhum valor estimado
7. Aba existia antes da execução (não foi criada automaticamente)

---

### relatorio-gate.md

**Gate:** `gate_reportei` | **Critérios:** 5

1. report_id ou timeline_event_id retornado
2. HTML contém pelo menos um valor em R$
3. Período correto no título
4. HTML válido (tags abertas e fechadas)
5. Nenhuma palavra proibida presente

---

### clickup-gate.md

**Gate:** `gate_clickup` | **Critérios:** 5

1. Campos obrigatórios presentes (Período, Plataforma, Investimento, CPL, Ações, Próximos Passos)
2. Período indicado no cabeçalho
3. Confirmação de escrita do ClickUp MCP
4. Nenhum campo vazio ou placeholder
5. CPL como `-` quando conversas = 0

---

## 8. Camada 6 — Templates

Os templates são estruturas de referência que os agentes seguem ao gerar conteúdo. Garantem consistência de formato entre execuções.

---

### relatorio-template.md

**O que é:** Templates HTML de relatório para 3 combinações de plataformas.

**3 variantes:**
1. **META-only:** para clientes que têm apenas Meta Ads
2. **META+GOOGLE:** para clientes com ambas as plataformas
3. **GOOGLE-only:** para Dr. Laureano Filho (excluir_meta_monitoring: true)

**Conteúdo:** Estrutura HTML com placeholders (`{{meta_spend}}`, `{{conversas}}`, `{{google_spend}}`, etc.) + tabela de referência de todos os placeholders com descrição

**Usado por:** `redator` (como guia de estrutura)

---

### whatsapp-template.md

**O que é:** Template da mensagem WhatsApp com as regras de composição embutidas.

**Conteúdo:**
- Estrutura da mensagem (saudação, corpo, link)
- Regras de saudação por horário
- Regras do campo INVESTIMENTO (só Meta, só Google, ambos)
- Regra de omissão do CPL quando conversas = 0

**Usado por:** `whatsapp-writer`

---

### contexto-cliente-template.md

**O que é:** Template do documento Google Drive de contexto por cliente.

**Seções:**
- `## perfil` — características permanentes do cliente (especialidade, público, sazonalidade)
- `## momento_comercial_atual` — situação atual (high season, lançamento, problemas ativos)
- `## pontos_de_atencao` — alertas persistentes que o redator deve considerar
- `## aprendizados` — entradas semanais (máximo 8, mais recente no topo)

**Usado por:** `contexto-cliente` (ao criar novo documento ou atualizar aprendizados)

---

## 9. Camada 7 — Dados

Os arquivos de dados são a fonte de verdade operacional do squad. São lidos pelos agentes em tempo de execução e não devem ser modificados pelo pipeline (exceto `data/historico-clientes.yaml` e `data/timeline-log.jsonl` que são append-only).

---

### data/clientes.yaml

**O que é:** Lista unificada de todos os 28 clientes do squad.

**Origem:** Fusão de `data/clientes.md` (Gustavo) + `config/clientes-config.yaml` (Vinicius).

**ADR-01:** `gestores` é array — clientes compartilhados aparecem UMA VEZ com `gestores: [vinicius, gustavo]`. Isso evita duplicação de dados e garante consistência.

**Estrutura por cliente:**

| Campo | Descrição | Quem usa |
|-------|-----------|----------|
| `nome` | Nome completo do cliente | stark-chief (resolução), whatsapp-writer (fallback) |
| `slug` | Identificador único lowercase-kebab | alerta-monitor (metricas_coletadas key), save-history |
| `gestores` | Array: [vinicius] \| [gustavo] \| [vinicius, gustavo] | stark-chief (roteamento), fill_sheets.py (filtro) |
| `ativo` | Boolean — false = ignorado pelo alerta-monitor | alerta-monitor, fill_sheets.py |
| `prioridade` | Ordem de processamento por bloco | alerta-monitor |
| `reportei_project_id` | ID do projeto no Reportei | coletor, redator, publicador |
| `especialidade` | Slug da especialidade para thresholds | alerta-monitor, redator |
| `meta_ad_account_id` | ID da conta Meta Ads (`act_XXXXX`) | alerta-monitor (null → fallback) |
| `excluir_meta_monitoring` | Se true → skip alerta-monitor Meta | alerta-monitor (Dr. Laureano) |
| `nome_whatsapp` | Nome curto para mensagem WhatsApp | whatsapp-writer |
| `sheet_columns` | Mapeamento métrica → coluna Sheets | coletor, fill_sheets.py |
| `clickup_status_list_id` | ID da lista ClickUp (clientes Gustavo) | clickup-writer, task-monitor |
| `nota` | Observações operacionais | Referência |

**YAML anchor `*sheet_cols`:** Todas as colunas padrão são definidas uma vez como âncora e referenciadas com `*sheet_cols` em cada cliente Vinicius, evitando repetição:
```yaml
_sheet_cols: &sheet_cols
  meta_spend: C
  google_spend: E
  seguidores: H
  conversas: K
  conversoes: O
```

**Distribuição dos 28 clientes:**
- 17 exclusivos Vinicius (com `sheet_columns`)
- 9 exclusivos Gustavo (com `clickup_status_list_id`)
- 2 compartilhados (Dr. Laureano Filho, Dra. Nicolli — com ambos os campos quando aplicável)

**Pendências operacionais:**
- `meta_ad_account_id`: null em todos os 28 clientes → alerta-monitor usa fallback Reportei para todos
- `clickup_status_list_id`: null em 7 dos 9 clientes Gustavo → clickup-writer usa busca por hierarquia de workspace

---

### data/thresholds-por-especialidade.yaml

**O que é:** Benchmarks de performance por especialidade médica para o alerta-monitor e redator.

**Origem:** Fusão de `thresholds-especialidade.yaml` (Vinicius) com novas especialidades do bloco Gustavo. ADR-06: quando valores conflitam, adotar o mais conservador.

**11 especialidades cobertas:**

| Especialidade | Clientes | Plataforma principal |
|---------------|----------|---------------------|
| cirurgia_plastica | IMCP, Dr. Marcelo Bezerra | Meta Ads |
| dermatologia | Dra. Érica Marchiori | Meta Ads |
| medicina_estetica | Dra. Nicolli, Dra. Mariângela, Fernanda Encinas, Graciela Machado | Meta Ads |
| cirurgia_facial | Dra. Danielle Gondim, Dr. Joel Abdala | Meta Ads |
| cirurgia_corporal | Dr. Leandro Gontijio, Dr. Lucas Consentino, Dr. Matheus Ocampo | Meta Ads |
| mommy_makeover | Dr. Luiz Borba, Dr. Humberto, Diego Gonzalez | Meta Ads |
| cirurgia_trans | Dr. Guilherme Mattar | Meta Ads |
| cirurgia_ortognatica | Dr. Laureano Filho | **Google Ads** (excepção) |
| saude_geral | Dr. Fernando Bezerra, Dr. Caio Fernandes | Meta Ads |
| oncologia | Dr. Diego Alencar | Meta Ads |
| tricologia | Dr. Higner Forastieri | Meta Ads |

**Métricas por especialidade:** CPL (saudavel/atencao/critico), CPM, CTR, frequência — cada uma com min/max por nível.

**Nota CPL:** CPL = custo por conversa WhatsApp (não CAC). Exceção: `cirurgia_ortognatica` = custo por conversão Google Ads.

**3 blocos adicionais:**

*`kill_switch`:* Conversas = 0 por 3 dias consecutivos com 7+ dias de veiculação → alerta CRÍTICO (gasto mínimo por especialidade varia de R$30 a R$90 no período).

*`frequencia_por_tipo_campanha`:* Thresholds de frequência diferenciados por tipo de campanha (identificado pelo prefixo do nome):
- TOFU/IMP: alerta 2.5, pause 3.0
- MOFU/TRAF: alerta 3.0, pause 3.5
- BOFU/CONV: alerta 4.0, pause 4.5
- AWARENESS/REACH: alerta 2.2, pause 2.8

*`quando_nao_alertar`:* Regras de supressão de falso-positivos:
- Campanha < 7 dias
- Spend < R$20 em last_3d
- Impressões < 1.000
- Campanhas de awareness com CPM alto
- Dr. Laureano Filho (excluir_meta_monitoring)

---

### data/historico-clientes.yaml

**O que é:** Histórico de métricas semanais por cliente, persistido pelo `save-history.md` a cada ciclo.

**Papel:** Fonte de verdade para o redator comparar performance atual com semanas anteriores ("CPL desta semana foi R$72, vs. média de R$65 das últimas 4 semanas").

**Estrutura por entrada:**
```yaml
{slug-cliente}-{YYYY-WNN}:
  semana: "DD/MM a DD/MM/AAAA"
  meta_spend: float
  google_spend: float
  seguidores: int
  conversas: int
  meta_cpl: float
  google_cpl: float
  coletado_em: ISO8601
```

**Limite:** 52 entradas por cliente (1 ano). Entradas mais antigas são removidas automaticamente pelo save-history.

**Não existe no repositório inicial** — criado automaticamente na primeira execução completa do pipeline.

---

## 10. Camada 8 — Configuração

### config/settings.yaml

**O que é:** Configurações operacionais do squad — sem credenciais.

**Por que existe:** Centraliza parâmetros que afetam múltiplos agentes, evitando valores hardcoded espalhados pelos arquivos de agente.

**Seções:**

```yaml
reportei:
  api_base: "https://api.reportei.com/v2"
  per_page: 100
  rate_limit_sleep: 0.6   # segundos entre chamadas
  rate_limit_retry: 60    # segundos após 429

planilha:
  bloco_vinicius: "Vinicius"   # string que delimita o bloco na coluna A
  bloco_gustavo: "Gustavo"

matching:
  fuzzy_threshold: 0.60   # threshold mínimo para resolução fuzzy de cliente

pipeline:
  lote_paralelo: 3   # clientes processados em paralelo no alerta-monitor

meta_ads:
  lookback_metricas: "last_3d"
  lookback_frequencia: "last_7d"
  nivel_padrao: ["ad", "account"]

slugs_reportei:
  google_ads: "google_adwords"                   # NÃO "google_ads"
  seguidores: "ig:new_followers_count"
  conversas: "messaging_conversation_started_7d"
  google_cost_unit: "direct"                     # sem ÷ 1.000.000

clickup:
  doc_vinicius: "Status Report - Vinicius"
  doc_gustavo: "Status Report - Gustavo"

contexto_drive:
  pasta: "Contexto Clientes - Stark"
  prefixo_documento: "Contexto - "
```

**Credenciais (não neste arquivo — variáveis de ambiente):**
- `REPORTEI_TOKEN` — bearer token Reportei v2
- `SHEET_ID` — ID da planilha Google Sheets
- `GOOGLE_SERVICE_ACCOUNT_JSON` — path do service account

---

### squad.yaml

**O que é:** Manifesto do squad — declaração estruturada de todos os componentes, MCPs, permissões e restrições absolutas.

**Papel:** Arquivo de registro do squad no sistema AIOX. Define o que o squad pode e não pode fazer.

**Seções principais:**

*`agents` (10):* stark-chief, validator, coletor, redator, publicador, whatsapp-writer, contexto-cliente, alerta-monitor, clickup-writer, task-monitor

*`tasks` (10):* fetch-metrics, verify-fill, generate-report, validate-report, publish-timeline, save-history, monitorar-contas, preencher-clickup, rotina-diaria, rotina-semanal

*`checklists` (4):* sheets-gate, relatorio-gate, alertas-gate, clickup-gate

*`templates` (3):* relatorio-template, whatsapp-template, contexto-cliente-template

*`data` (2):* clientes.yaml, thresholds-por-especialidade.yaml

*`script` (1):* fill_sheets.py

*`mcps` (4):*
- Meta Ads: `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52`
- Reportei: `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8`
- Google Drive: `mcp__92a31705-b51e-422b-abc2-e6cb82a79330`
- ClickUp: `mcp__2d24fa11-1001-4c98-bf3c-7dcc3b7bdfaf`

*`absolute_vetos` (7):*
1. Nunca executar ação no Meta Ads ou Google Ads — apenas leitura
2. Nunca publicar na Timeline do Reportei sem gate_reportei aprovado
3. Nunca preencher a planilha com valores estimados
4. Nunca recomendar ações sobre atendimento, follow-up ou processo comercial pós-lead
5. Nunca expor tokens, credenciais ou paths de service_account
6. Nunca recomendar pause, escala ou qualquer ação de campanha
7. Nunca escrever no ClickUp sem aprovação explícita do gestor

---

### CLAUDE.md

**O que é:** Briefing do squad — carregado como contexto em toda sessão.

**Papel:** Elemento 1 da anatomia AIOX: identidade, regras fixas, restrições de voz, contexto multi-gestor e comportamento por fase.

**Por que existe:** Garante que todos os agentes compartilham as mesmas regras base (voz, proibições, fallbacks, ADRs) sem precisar repetir isso em cada arquivo de agente.

**Seções:**
- Identidade e escopo (squad, gestores, clientes, objetivo)
- Tabela das 4 rotinas com comandos e outputs
- Regras de voz do redator (palavras proibidas + exemplos)
- Restrições técnicas absolutas
- Contexto multi-gestor (blocos por gestor, contagens)
- Lógica de fallback Meta Ads → Reportei
- Reuso de dados FASE 1 → FASE 2 (ADR-04 explicado)
- Slugs Reportei exatos
- Variáveis de ambiente necessárias
- Tabela de comportamento por falha de fase

---

## 11. Scripts

### scripts/fill_sheets.py

**O que é:** Script Python que executa o preenchimento da planilha Google Sheets. É o único componente de software executável do squad (os demais são Markdown interpretados por Claude).

**Por que existe:** A escrita na planilha Google Sheets via Service Account requer autenticação OAuth e chamadas à Google Sheets API. Encapsular essa lógica em Python permite que o coletor invoque o script como subprocesso, mantendo a lógica de API fora dos arquivos Markdown.

**Como funciona:**

```
Entrada: --semana DD/MM/AAAA (opcional) + --metricas-json '{"slug": {...}}' ou stdin JSON
         + variáveis de ambiente: GOOGLE_SERVICE_ACCOUNT_JSON, SHEET_ID

1. Carregar data/clientes.yaml (dinâmico — não hardcoded)
2. Filtrar clientes: ativo=true + vinicius in gestores + sheet_columns presente
3. Autenticar via Service Account (Credentials.from_service_account_file)
4. Verificar que a aba existe (NÃO cria automaticamente — erro explícito se ausente)
5. Ler coluna A da aba (localizar linha de cada cliente por busca parcial case-insensitive)
6. Para cada cliente:
   a. Localizar linha na coluna A
   b. Preencher colunas de sheet_columns com valores das métricas
   c. Usar batchUpdate para eficiência (uma chamada por cliente)
7. Output: logs por cliente + [STATUS_JSON] + lista de resultados em JSON
8. Exit code 0 se todos OK, 1 se qualquer erro
```

*Localização de linha:* Busca parcial case-insensitive — "IMCP" encontra "IMCP - Instituto..." na planilha.

*Output JSON:* Lista de objetos `{slug, status, celulas, linha}` ou `{slug, status, motivo}` — lida pelo coletor para confirmar sucesso.

**Dependências:**
```
pip install google-auth-httplib2 google-api-python-client pyyaml
```

**Inputs:**
- `GOOGLE_SERVICE_ACCOUNT_JSON` (env) — path do service account
- `SHEET_ID` (env) — ID da planilha
- `--semana` (arg) — nome da aba (calculado automaticamente se ausente)
- `--metricas-json` (arg) ou stdin — métricas por slug

**Outputs:**
- Planilha preenchida
- JSON de status para o coletor
- Exit code 0/1 para o gate_sheets

---

## 12. Decisões Arquiteturais (ADRs)

| ADR | Decisão | Motivação |
|-----|---------|-----------|
| **ADR-01** | `gestores` é array — clientes compartilhados têm uma entrada com `[vinicius, gustavo]` | Evita duplicação de dados e inconsistências; verdade única por cliente |
| **ADR-04** | `metricas_coletadas` passa da FASE 1 (alerta-monitor) para FASE 2 (coletor) | Elimina segunda chamada à Meta Ads API para os mesmos dados; respeita rate limits |
| **ADR-05** | FASE 4 (publicação Reportei) e FASE 5 (ClickUp) executam em paralelo | Independentes entre si; otimiza tempo total do pipeline |
| **ADR-06** | Thresholds conflitantes entre squads → adotar o mais conservador | Preserva rigor dos gestores até que histórico conjunto seja estabelecido |
| **ADR-07** | Dr. Laureano Filho: `excluir_meta_monitoring: true`, CPL = Google Ads | Clinica opera exclusivamente Google Ads; monitoramento Meta seria ruído |

---

## 13. Mapa de Integrações MCPs

| Fase | Agente | MCP | Operações |
|------|--------|-----|-----------|
| 1 | alerta-monitor | Meta Ads | Métricas de campanha (CPM, CTR, freq, CPL) por conta |
| 1 | alerta-monitor | Reportei | Fallback CPL quando meta_ad_account_id null |
| 2 | coletor | Reportei | google_spend (slug: google_adwords), seguidores, conversas |
| 3 | contexto-cliente | Google Drive | Leitura documento "Contexto - {cliente}" |
| 3 | redator | Reportei | CPC, cliques, dados extras period-over-period |
| 4 | publicador | Reportei | create_timeline_event, list_timeline_events (dedup) |
| 5 | clickup-writer | ClickUp | Docs, subpáginas, append de conteúdo |
| 5 | clickup-writer | Meta Ads | Sinais de entidades e anomalias para reconstituição de ações |
| 6 | contexto-cliente | Google Drive | Atualização aprendizados semanais |
| 6 | task-monitor | ClickUp | Verificação e marcação de tasks concluídas |
| 6 | task-monitor | Reportei | Verificação de relatório publicado (evidência para task) |

**MCP IDs:**
- Meta Ads: `mcp__c0a7182d-bfb1-44b9-9206-83cca8f17d52`
- Reportei: `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8`
- Google Drive: `mcp__92a31705-b51e-422b-abc2-e6cb82a79330`
- ClickUp: `mcp__2d24fa11-1001-4c98-bf3c-7dcc3b7bdfaf`

---

_Documentação gerada em 2026-05-28 — Squad gestor-trafego-stark v1.0_
_31 arquivos documentados | 28 clientes | 4 MCPs | 6 fases | 4 gates_
