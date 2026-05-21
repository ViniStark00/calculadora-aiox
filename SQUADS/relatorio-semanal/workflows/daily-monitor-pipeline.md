---
workflow: daily-monitor-pipeline
trigger: manual
entrypoint: monitor-diario
elicit: false
---

# Workflow: daily-monitor-pipeline

Rotina diária de monitoramento — varre todas as contas da carteira e entrega um painel de alertas classificados por nível. Não gera relatório, não publica nada, não envia WhatsApp.

## Trigger

```
Rodar monitor diário
```
ou, para um cliente específico:
```
Rodar monitor diário para [NOME DO CLIENTE]
```

## Frequência ideal

Toda manhã, antes de começar o trabalho do dia.

## Fluxo

```
INÍCIO
  │
  ▼
[monitor-diario]
  Lê clientes de config/clientes-config.yaml (especialidade_por_cliente)
  │
  ▼
  Para cada cliente:
  ├── Resolve projeto no Reportei via list_projects + manual_map
  ├── Busca métricas via get_metrics (últimos 7 dias)
  ├── Calcula CPL
  ├── Classifica: CRITICO / ATENCAO / INFO / SEM_DADOS
  │
  ├─ Cliente falha (MCP erro, projeto não encontrado) → SEM_DADOS
  │   └─ Registra motivo e CONTINUA com o próximo cliente
  │
  ▼
[monitor-diario]
  Monta painel consolidado com todos os resultados
  │
  ▼
FIM ✅ — Painel exibido
```

## Estados do pipeline

| Estado | Descrição |
|--------|-----------|
| `RUNNING` | Varrendo clientes |
| `COMPLETED` | Painel entregue (mesmo com alguns SEM_DADOS) |
| `FAILED` | MCP Reportei completamente indisponível — nenhum cliente processado |

## Saída esperada

```
MONITOR DIÁRIO — [DD/MM/AAAA]
════════════════════════════════════════════════════

🔴 CRÍTICO (agir hoje)
  • [CLIENTE]: CPL de R$[XX,XX] — acima de R$[threshold] ([especialidade])

🟡 ATENÇÃO (monitorar)
  • [CLIENTE]: CPL de R$[XX,XX] — acima de R$[threshold] ([especialidade])

🟢 INFORMAÇÃO (tudo ok)
  • [CLIENTE] — CPL R$[XX,XX] ✓
  • [CLIENTE sem threshold] — R$[spend] investido, [N] conversas

⚪ SEM DADOS
  • [CLIENTE]: [motivo]

════════════════════════════════════════════════════
RESUMO: [N] crítico(s) | [N] atenção | [N] ok | [N] sem dados
Período: [DD/MM] a [DD/MM/AAAA]
```

## Regras

- **NUNCA** interrompe no meio — cliente com falha → SEM_DADOS, pipeline segue
- **NÃO** gera relatório narrativo
- **NÃO** publica na Timeline do Reportei
- **NÃO** preenche planilha
- **NÃO** envia mensagem WhatsApp
- Seções vazias (ex: nenhum cliente CRITICO) são omitidas do painel
