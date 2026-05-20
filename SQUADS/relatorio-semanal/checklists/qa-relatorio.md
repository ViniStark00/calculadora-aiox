---
checklist: qa-relatorio
version: 1.0.0
usado_por: quality-gate
---

# Checklist QA — Squad relatorio-semanal

Critério de aceite objetivo. Todos os itens devem passar antes de considerar o pipeline concluído.

---

## Bloco A — Coleta de Métricas (verify-fill)

- [ ] **A1** — Todos os clientes do bloco Vinicius foram tentados (sem omissões silenciosas)
- [ ] **A2** — Coluna C (Meta Spend) preenchida para todos os clientes válidos
- [ ] **A3** — Coluna E (Google Spend) preenchida para todos os clientes válidos
- [ ] **A4** — Coluna H (Seguidores) preenchida para todos os clientes válidos
- [ ] **A5** — Coluna K (Conversas) preenchida para todos os clientes válidos
- [ ] **A6** — Coluna O (Conversões) preenchida para todos os clientes válidos
- [ ] **A7** — Exceção Dr. Javier (Meta Spend ARS) marcada explicitamente
- [ ] **A8** — Nenhum valor zerado sem justificativa registrada

---

## Bloco B — Texto do Relatório (validate-report)

- [ ] **B1** — Texto contém data de início (DD/MM/AAAA)
- [ ] **B2** — Texto contém data de fim (DD/MM/AAAA)
- [ ] **B3** — Texto menciona o nome do cliente
- [ ] **B4** — Texto contém valores em R$ (Meta Spend e Google Spend)
- [ ] **B5** — Texto tem pelo menos 3 parágrafos
- [ ] **B6** — Nenhum placeholder `[XXX]` não substituído
- [ ] **B7** — Nenhuma palavra proibida (lista no CLAUDE.md)
- [ ] **B8** — Tom neutro e informativo (sem elogios/críticas excessivos)

---

## Bloco C — Publicação na Timeline

- [ ] **C1** — MCP `create_timeline_event` retornou ID de evento
- [ ] **C2** — Título do evento segue formato: "Relatório Semanal — [DD/MM] a [DD/MM/AAAA]"
- [ ] **C3** — Conteúdo do evento corresponde ao texto aprovado

---

## Critério de pronto (apresentação)

- [ ] **P1** — Pipeline executa do zero, ponta a ponta, sem intervenção humana
- [ ] **P2** — Output passa em todos os checks dos Blocos A, B e C
- [ ] **P3** — Reproduzido com pelo menos 1 caso real (Destra Desenvolvimentos), salvo em `examples/`
