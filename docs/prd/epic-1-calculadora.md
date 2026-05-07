# Epic 1: Calculadora Científica com Histórico

**ID:** EPIC-001
**Status:** Draft
**Criado por:** Morgan (@pm)
**Data:** 2026-05-07
**PRD:** docs/prd/prd-calculadora.md

---

## Goal

Entregar a aplicação de calculadora científica completamente funcional — parser matemático com precedência correta, interface com modo básico/científico, funções trigonométricas/logarítmicas/fatorial, histórico persistido via localStorage — em uma única pasta `calculadora/` com três arquivos, sem dependências externas, abrindo via duplo clique no navegador.

## Valor Entregue

Ao concluir este epic, o usuário terá uma calculadora web completa e portátil que:
- Realiza qualquer cálculo científico que precisar
- Registra e persiste o histórico de operações
- Funciona offline, sem instalação

## Stories

| Story | Título | Agente | Dependência |
|-------|--------|--------|-------------|
| 1.1 | Setup do Projeto e Estrutura Base | @dev | — |
| 1.2 | Parser Matemático e Operações Básicas | @dev | 1.1 |
| 1.3 | Funções Científicas | @dev | 1.2 |
| 1.4 | Histórico de Operações | @dev | 1.2 |

## Definition of Done

- [ ] Todas as stories 1.1–1.4 com status Done
- [ ] QA gate PASS em todas as stories
- [ ] `index.html` abre no Chrome/Firefox/Safari sem erros no console
- [ ] Todos os FR-001 a FR-024 verificados manualmente
- [ ] PR aberto no GitHub pelo @devops

---

*Gerado por Morgan (@pm) — Synkra AIOX — 2026-05-07*
