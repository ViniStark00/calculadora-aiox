---
workflow: weekly-report-pipeline
trigger: manual
entrypoint: relatorio-chief
elicit: true
---

# Workflow: weekly-report-pipeline

Pipeline completo de relatório semanal — da coleta de métricas até a publicação na Timeline do Reportei.

## Trigger

```
@relatorio-chief
Rodar pipeline para [NOME DO CLIENTE]
```

## Fluxo

```
INÍCIO
  │
  ▼
[relatorio-chief]
  Recebe cliente, carrega config, calcula período
  │
  ▼
[contexto-cliente] — LEITURA  ⚠️ NÃO-BLOQUEANTE
  Busca doc "Contexto — [CLIENTE]" no Google Drive
  Se não existe: cria com template padrão, continua com contexto vazio
  Se Drive falha: aviso + disponivel=false, pipeline continua normalmente
  Entrega objeto contexto_cliente no handoff
  │
  ▼
[coletor] — task: fetch-metrics
  Reportei API v2 → Google Sheets (colunas C/E/H/K/O)
  │
  ├─ ERRO (token, aba, etc.) → STOP + mensagem clara
  │
  ▼
[coletor] — task: save-history  ⚠️ NÃO-BLOQUEANTE
  Salva métricas da semana em data/historico-clientes.yaml
  ├─ ERRO → aviso no log + pipeline continua normalmente
  │
  ▼
[quality-gate] — task: verify-fill
  Validação do preenchimento
  │
  ├─ REPROVADO → STOP + lista de problemas
  │
  ▼
[redator] — task: generate-report
  Métricas + MCP Reportei + contexto_cliente (handoff) → texto narrativo
  │
  ▼
[quality-gate] — task: validate-report
  Validação do texto (8 checks)
  │
  ├─ REPROVADO (1ª vez) → voltar ao redator (regenerar)
  ├─ REPROVADO (2ª vez) → STOP + erro
  │
  ▼
[publicador] — task: publish-timeline
  MCP create_timeline_event
  │
  ├─ ERRO → STOP + log completo
  │
  ▼ handoff: event_id + project_id + link + métricas (meta_spend, google_spend, conversas, cpl) + período
[whatsapp-writer]
  Formata mensagem WhatsApp com resumo das métricas
  Seleciona template (META-only / META+Google / Google-only)
  Gera linha de highlight (1 frase objetiva)
  Exibe mensagem pronta para copiar
  │
  ▼
[monitor-tarefas-clickup]  ⚠️ NÃO-BLOQUEANTE
  Recebe lista de atividades concluídas do relatorio-chief
  Localiza tarefas do cliente no ClickUp e marca como concluídas
  Tarefa não encontrada → aviso, continua
  ClickUp indisponível → aviso, continua
  │
  ▼
[contexto-cliente] — ATUALIZAÇÃO  ⚠️ NÃO-BLOQUEANTE
  Gera aprendizados da semana com base nas métricas
  Appenda no topo da seção aprendizados (mais recentes primeiro)
  Mantém apenas últimas 8 semanas
  Se Drive falha: aviso, nunca bloqueia
  │
  ▼
[relatorio-chief]
  Resumo final ao usuário
  │
  ▼
FIM ✅
```

## Estados do pipeline

| Estado | Descrição |
|--------|-----------|
| `RUNNING` | Pipeline em execução |
| `WAITING_INPUT` | Aguardando confirmação do usuário |
| `COMPLETED` | Pipeline concluído com sucesso |
| `FAILED` | Pipeline interrompido com erro |
| `PARTIAL` | Algumas etapas ok, outras com aviso |

## Modo de execução

- **Por cliente:** Rodar o pipeline para um cliente específico
- **Todos os clientes:** Rodar sequencialmente para todos os clientes do bloco Vinicius
  - Se um cliente falhar → registrar erro e continuar com o próximo

---

## Modo multi-cliente paralelo

> Variante otimizada para executar o pipeline completo para todos os clientes do bloco.
> Reduz o tempo de ~22 min (sequencial) para ~5 min (paralelo em 5 estágios).

### Trigger

```
Rodar pipeline para todos os clientes do bloco Vinicius
```

### Arquitetura em 5 Estágios

```
ESTÁGIO 1 — COLETA (sequencial rate-limited + Drive paralelo)
  Para cada cliente, com 0.6s entre chamadas Reportei:
  ├─ get_project_metrics  →  salva resultado em memória (dict por cliente)
  └─ contexto-cliente LEITURA  →  chamadas Drive em paralelo (MCP batched)
  Falha por cliente: marca status=FAILED_FETCH, continua os demais.

ESTÁGIO 2 — SHEETS (serializado — 1 chamada única)
  fill_sheets.py recebe TODOS os dados do Estágio 1 em uma chamada.
  Único processo Python → sem race condition no arquivo da planilha.
  Falha parcial: registra quais clientes falharam + continua.

ESTÁGIO 3 — GERAÇÃO DE RELATÓRIOS (lotes de 3)
  Lote = 3 clientes processados em paralelo (MCP batched):
    quality-gate verify-fill → redator generate-report → quality-gate validate-report
  Lotes sequenciais até esgotar a lista de clientes.
  Falha por cliente: marca status=FAILED_REPORT, exclui da publicação.

ESTÁGIO 4 — PUBLICAÇÃO + LOGS (serializado — arquivos compartilhados)
  Para cada cliente com status=APPROVED, em sequência:
  ├─ publicador publish-timeline  →  append em data/timeline-log.jsonl
  └─ coletor save-history         →  rewrite em data/historico-clientes.yaml
  Serialização obrigatória: escritas concorrentes corrompem os arquivos.

ESTÁGIO 5 — WRAP-UP (paralelo — recursos isolados por cliente)
  Para todos os clientes concluídos, em paralelo:
  ├─ whatsapp-writer             (formatação em memória)
  ├─ monitor-tarefas-clickup     (task_id isolado por cliente)
  └─ contexto-cliente ATUALIZAÇÃO (doc Drive isolado por cliente)
```

### Por que batch size = 3 no Estágio 3?

Cada cliente carrega ~2.600 tokens de contexto na geração.
Lote de 3 = ~7.800 tokens de contexto simultâneo — margem segura.
Lote de 11 = ~28.600 tokens — risco de degradação na qualidade da narrativa.

### Projeção de tempo (11 clientes)

| Estágio | Modo sequencial | Modo paralelo |
|---------|----------------|---------------|
| 1 — Coleta | ~7s | ~7s (rate limit) |
| 2 — Sheets | ~8s | ~8s (inalterado) |
| 3 — Geração | ~660s | ~240s (4 lotes) |
| 4 — Publicação | ~22s | ~22s (serializado) |
| 5 — Wrap-up | ~55s | ~10s |
| **Total** | **~22 min** | **~5 min** |

### Regras de falha isolada

- Falha no Estágio 1 (fetch): cliente marcado como `FAILED_FETCH` — excluído dos estágios seguintes
- Falha no Estágio 3 (geração): cliente marcado como `FAILED_REPORT` — não publicado, sem erro geral
- Falha no Estágio 4 (publicação): registrada no resumo final — pipeline NÃO interrompido
- Estágio 5 (wrap-up): falhas já eram não-bloqueantes no modo sequencial — mantém comportamento

### Saída esperada — Resumo final consolidado

```
PIPELINE MULTI-CLIENTE CONCLUÍDO — [DD/MM/AAAA] a [DD/MM/AAAA]
═════════════════════════════════════════════════════════════════
RESULTADO: [N]/[TOTAL] concluídos | Tempo total: ~X min

╔══════════════════════════════╦═══════════════════════════╗
║ Cliente                      ║ Status                    ║
╠══════════════════════════════╬═══════════════════════════╣
║ IMCP                         ║ ✅ ID: XXXXXX             ║
║ Dra Danielle Gondim          ║ ✅ ID: XXXXXX             ║
║ ...                          ║ ...                       ║
║ [cliente com erro]           ║ ❌ ERRO: [motivo]         ║
╚══════════════════════════════╩═══════════════════════════╝

PLANILHA: [N] clientes × 5 colunas preenchidos ✅

MENSAGENS WHATSAPP:
───────────────────────────────────────────
[CLIENTE 1]
[mensagem formatada]
───────────────────────────────────────────
[CLIENTE 2]
[mensagem formatada]

ERROS (se houver):
  • [CLIENTE] — [motivo detalhado]
═════════════════════════════════════════════════════════════════
```

## Saída final esperada

```
PIPELINE CONCLUÍDO — [DD/MM/AAAA] a [DD/MM/AAAA]
════════════════════════════════════════════════════
[NOME DO CLIENTE]
  ✅ Contexto carregado  (ou ⚠️ Contexto: Drive indisponível — pipeline não interrompido)
  ✅ Coleta de métricas
  ✅ Histórico salvo  (ou ⚠️ Histórico: aviso — pipeline não interrompido)
  ✅ Verificação de coleta
  ✅ Geração do relatório
  ✅ Validação do texto
  ✅ Publicação na Timeline (ID: XXXXX)
  ✅ Mensagem WhatsApp gerada
  ✅ Tarefas ClickUp marcadas  (ou ⚠️ ClickUp: aviso — pipeline não interrompido)
  ✅ Contexto atualizado  (ou ⚠️ Contexto não atualizado esta semana)
════════════════════════════════════════════════════
Tempo total: ~X segundos
```
