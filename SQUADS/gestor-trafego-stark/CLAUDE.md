# CLAUDE.md — Squad gestor-trafego-stark
> Elemento 1 da anatomia AIOX: Briefing do squad (voz, regras fixas, restrições).

## Identidade

**Squad:** `gestor-trafego-stark`
**Gestores:** Vinicius Lima · Gustavo Radler · Andreyves · Richard · Luiz · Mateus · Thiago · Wallison — gestores de tráfego pago, Stark Marketing
**Clientes:** ~91 clientes ativos (88 nas automações + 3 Amanda), nicho saúde/medicina
**Objetivo:** Automatizar rotinas diárias e semanais dos 8 gestores de tráfego

## As 4 Rotinas

| # | Comando | Agente principal | Output |
|---|---------|-----------------|--------|
| 1 | `*rotina-semanal` | `stark-chief` | 6 fases: monitor → sheets → relatório → publicação ∥ clickup → wrap-up |
| 2 | `*rotina-diaria` | `stark-chief` | Alertas de métricas + inbox ClickUp |
| 3 | `*monitorar-contas` | `alerta-monitor` | Painel de alertas standalone |
| 4 | `*status-report-clickup` | `clickup-writer` | Draft → aprovação → escrita no ClickUp |

## Regras de Voz (redator)

- **Tom:** Neutro e informativo — sem elogios exagerados, sem críticas pesadas
- **Palavras proibidas (elogios):** incrível, surpreendente, excelente, extraordinário, impressionante, fantástico, brilhante, notável
- **Palavras proibidas (críticas):** preocupante, alarmante, crítico, péssimo, desastroso, infelizmente
- **Jargão de IA proibido:** alavancar, potencializar, maximizar, robusto, sinergia, ecossistema, transformador, impactante
- **Frases de IA proibidas:** "é importante ressaltar", "cabe destacar", "vale salientar", "nesse sentido", "isso posto", "outrossim", "observa-se que"
- **Exemplo correto:** "O investimento em Meta Ads totalizou R$ 1.716,26, abaixo do orçamento de R$ 8.785,00."
- **Exemplo errado:** "Infelizmente o resultado ficou muito abaixo do esperado."

## Restrições Técnicas Absolutas

- NÃO criar aba no Sheets automaticamente — erro claro se aba não existir
- NÃO commitar `service_account.json`, `REPORTEI_TOKEN` ou qualquer credencial
- NÃO modificar `squads/gestor-trafego-vinicius/` nem `squads/gestor-trafego-gustavo/`
- NÃO modificar `.aiox-core/` — protegido (L1/L2)
- NÃO recomendar pause, escala ou qualquer ação de campanha — output de monitoramento é apenas notificação
- NÃO escrever no ClickUp sem aprovação explícita do gestor sobre o draft
- NÃO publicar no Reportei sem gate_reportei aprovado
- Sinalizar erro 401 claramente: "Token Reportei expirado. Atualizar REPORTEI_TOKEN."
- Período padrão: segunda a domingo da semana anterior (calculado automaticamente)

## Contexto Multi-Gestor

O squad opera com 8 gestores ativos: vinicius, gustavo, andreyves, richard, luiz, mateus, thiago, wallison.
Clientes com `gestores: [amanda]` estão ativos mas não são processados pelas automações do squad.

Fonte de dados: `data/clientes.yaml` — lista única, sem duplicatas.

Gestores com planilha Google Sheets (FASE 2): todos os 8 gestores — planilha única compartilhada. Uma aba por mês (`Junho`, `Julho`...); 4 linhas por cliente (Sem 1–4) + linha "Média Mês". Estrutura: col A = Gestor, col B = Cliente, col C = "Sem X" ou "Média Mês".
Gestores com ClickUp (FASE 5): gustavo (estrutura legada; outros gestores: a definir).

## Lógica de Fonte de Dados — Monitoramento (alerta-monitor)

Três fontes possíveis, detectadas automaticamente em runtime:

| Fonte | Condição | CPM/CTR/freq? |
|---|---|---|
| `meta_ads_mcp` | `meta_ad_account_id` preenchido | ✅ Sim — via Meta Ads MCP |
| `reportei_meta` | `meta_ad_account_id: null` + Reportei tem integração Meta Ads ativa | ✅ Sim — via Reportei |
| `reportei_sem_meta` | `meta_ad_account_id: null` + Reportei sem integração Meta Ads | ❌ Não — apenas CPL |

- `excluir_meta_monitoring: true` → pular completamente (Dr. Laureano Filho)
- Badge `⚠️ dados parciais` apenas quando `fonte == 'reportei_sem_meta'`

## Reuso de Dados FASE 1 → FASE 2

O `alerta-monitor` (FASE 1) disponibiliza `metricas_coletadas` (dict keyed por slug).
O `coletor` (FASE 2) DEVE reutilizar esses dados para Meta Ads — chamadas adicionais à mesma API para as mesmas métricas são proibidas (ADR-04).
O coletor SEMPRE busca Google Ads e seguidores via Reportei (esses dados não estão no Meta Ads MCP).

## Slugs de Métricas Reportei (exatos — não alterar)

| Métrica | Slug |
|---------|------|
| Google Ads spend | `google_adwords` (NÃO `google_ads`) |
| Seguidores | `ig:new_followers_count` |
| Conversas WhatsApp | `messaging_conversation_started_7d` |
| Unidade Google cost | direta (SEM ÷ 1.000.000) |

## Credenciais (variáveis de ambiente — nunca commitar)

| Variável | Descrição |
|----------|-----------|
| `REPORTEI_TOKEN` | Bearer token da API Reportei v2 |
| `SHEET_ID` | ID da planilha Google Sheets |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Caminho para o arquivo service_account.json |

## Comportamento por Fase na rotina-semanal

| Fase | Falha | Comportamento |
|------|-------|---------------|
| 1 MCP indisponível | Continuar sem metricas_coletadas; FASE 2 busca tudo do zero |
| 1 gate FAIL | Exibir alertas + perguntar se quer continuar |
| 2 gate FAIL | Parar; não avançar sem confirmação |
| 3 gate FAIL (2x) | Parar; aguardar ação do gestor |
| 4 MCP indisponível | Marcar FASE 4 como SKIPPED; continuar FASE 5 |
| 5 MCP indisponível | Marcar FASE 5 como SKIPPED; continuar FASE 6 |
| 6 qualquer falha | Aviso no resumo; nunca bloquear |
