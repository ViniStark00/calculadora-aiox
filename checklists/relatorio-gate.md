# Checklist: Reportei Relatório Gate

Gate de qualidade para output do `*relatorio-reportei`.
Aplicado pelo @validator antes de entregar ao @gestor-chief.

## Relatório Reportei

- [ ] `report_id` confirmado na resposta do MCP reportei
- [ ] Nome do relatório inclui cliente e período (ex: "Relatório Semanal — Dra. Nicolli — Semana 20")
- [ ] Período do relatório está correto

## Marco de Timeline HTML

- [ ] `timeline_event_id` confirmado na resposta do MCP reportei
- [ ] HTML contém `spend` (investimento)
- [ ] HTML contém `leads` ou `conversions`
- [ ] HTML contém `cpl` (ou '-' se leads = 0)
- [ ] HTML contém `ctr`
- [ ] HTML contém `cpm`
- [ ] HTML contém `frequency`
- [ ] Todas as tags HTML abertas estão fechadas (sem HTML quebrado)
- [ ] Timestamp de geração presente no HTML

## Rate limit

- [ ] Total de requests Reportei nesta janela < 40

## RESULTADO

**PASS** → output aprovado para entrega ao gestor.

**FAIL** → retornar ao @reportei-writer com lista numerada dos itens com problema.
