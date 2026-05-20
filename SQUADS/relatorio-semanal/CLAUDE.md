# CLAUDE.md — Squad relatorio-semanal
> Elemento 1 da anatomia AIOX: Briefing do squad (voz, regras fixas, restrições).

## Identidade

**Squad:** `relatorio-semanal`
**Dono:** Vinicius Lima — gestor de tráfego pago, Stark Marketing
**MVP cliente:** Destra Desenvolvimentos
**Objetivo:** Automatizar 3 atividades semanais recorrentes do gestor de tráfego

## As 3 Atividades

| # | Atividade | Agente | Output |
|---|-----------|--------|--------|
| 1 | Preencher planilha de métricas | `coletor` | Colunas C/E/H/K/O preenchidas na aba da semana |
| 2 | Gerar texto do relatório escrito | `redator` | Narrativa por cliente, aprovada pelo `quality-gate` |
| 3 | Publicar marco na Timeline do Reportei | `publicador` | Marco criado via MCP `create_timeline_event` |

## Regras de Voz (redator)

- **Tom:** Neutro e informativo — sem elogios exagerados, sem críticas pesadas
- **Palavras proibidas (elogios):** incrível, surpreendente, excelente, extraordinário, impressionante, fantástico, brilhante, notável
- **Palavras proibidas (críticas):** preocupante, alarmante, crítico, péssimo, desastroso, infelizmente
- **Jargão de IA a evitar:** alavancar, potencializar, maximizar, robusto, sinergia, ecossistema, transformador, impactante
- **Frases de IA a evitar:** "é importante ressaltar", "cabe destacar", "vale salientar", "nesse sentido", "isso posto", "outrossim", "observa-se que"
- **Exemplo correto:** "O investimento em Meta Ads totalizou R$ 1.716,26, abaixo do orçamento de R$ 8.785,00."
- **Exemplo errado:** "Infelizmente o resultado ficou muito abaixo do esperado."

## Restrições Técnicas

- NÃO criar aba no Sheets automaticamente — erro claro se aba não existir (criação automática: versão futura)
- NÃO commitar `service_account.json`, `REPORTEI_TOKEN` ou qualquer credencial
- NÃO modificar `squads/super-gestor/` — squad independente
- NÃO modificar `.aiox-core/` — protegido (L1/L2)
- Sinalizar erro 401 claramente: "Token Reportei expirado. Atualizar REPORTEI_TOKEN."
- Período sempre: segunda a domingo da semana anterior (calculado automaticamente)

## Contexto Multi-Cliente

O squad opera sobre o bloco **"Vinicius"** na planilha — todas as linhas entre o header "Vinicius" e o próximo header de outro gestor. Clientes fora desse bloco são ignorados.

Configuração de clientes em: `config/clientes-config.yaml`

## Credenciais (variáveis de ambiente — nunca commitar)

| Variável | Descrição |
|----------|-----------|
| `REPORTEI_TOKEN` | Bearer token da API Reportei v2 |
| `SHEET_ID` | ID da planilha Google Sheets |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Caminho para o arquivo service_account.json |
