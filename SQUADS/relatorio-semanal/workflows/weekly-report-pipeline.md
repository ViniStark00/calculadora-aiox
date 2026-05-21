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
  Validação do texto (6 checks)
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
