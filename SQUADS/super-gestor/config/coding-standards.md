# Coding Standards — super-gestor

Padrões de desenvolvimento para arquivos do squad `super-gestor`.

## Convenção de nomes de arquivos

| Tipo | Padrão | Exemplos |
|---|---|---|
| Agentes | `kebab-case.md` | `traffic-chief.md`, `compliance-guard.md` |
| Tasks | `kebab-case.md` | `diagnose-account.md`, `validate-metrics.md` |
| Templates | `kebab-case-template.md` | `campaign-structure-template.md` |
| Checklists | `kebab-case-checklist.md` | `campaign-launch-checklist.md` |
| Dados | `kebab-case.yaml` | `campaign-history.yaml`, `knowledge-base.yaml` |
| Config | `kebab-case.md` | `tech-stack.md`, `coding-standards.md` |

## Padrão de frontmatter — Agents

```yaml
---
agent: nome-do-agente         # kebab-case, igual ao filename sem .md
squad: super-gestor
tier: 0 | 1 | qa | orchestrator
title: Nome — Descrição Curta
# campos opcionais:
inspirado_em: Referência (se aplicável)
---
```

## Padrão de frontmatter — Tasks

```yaml
---
task: nome-da-task            # kebab-case, igual ao filename sem .md
agent: nome-do-agente-responsavel
elicit: true | false          # true se requer input do usuário
inputs:
  - nome_do_input
outputs:
  - nome_do_output
---
```

## Regras obrigatórias

1. **NUNCA modificar arquivos em `.aiox-core/`** — esses arquivos são do framework, não do squad
2. **NUNCA criar agentes duplicados** — verificar `squad.yaml` antes de criar novo agent
3. **Frontmatter obrigatório** em todo agent e task — sem frontmatter o squad-loader não reconhece o arquivo
4. **Consistência de referências** — se um agente menciona um arquivo (ex: `data/campaign-history.yaml`), esse arquivo deve existir

## Estrutura de diretórios

```
squads/super-gestor/
├── squad.yaml              # Manifest — não alterar sem necessidade
├── agents/                 # Definições de agentes (.md)
├── tasks/                  # Tasks executáveis (.md com elicit)
├── workflows/              # Workflows multi-fase (.md)
├── templates/              # Templates de output (.md)
├── checklists/             # Checklists de validação (.md)
├── data/                   # Dados persistentes (.yaml)
└── config/                 # Este diretório — padrões e stack
```
