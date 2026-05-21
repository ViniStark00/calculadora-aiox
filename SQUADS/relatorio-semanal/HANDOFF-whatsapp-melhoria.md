# HANDOFF — Melhorias WhatsApp no Pipeline relatorio-semanal

**Data:** 2026-05-21
**Solicitante:** Vinicius Lima (vinicius@starkmkt.com)
**Sessão de origem:** Planejamento — sem código alterado ainda

---

## Contexto do problema

O pipeline já roda `whatsapp-writer` automaticamente (step 11 do `relatorio-chief.md`).
O que precisa mudar são **duas coisas**:

1. **Template errado** — a mensagem atual exibe métricas (investimento, CPL, conversas). O usuário quer apenas um convite com link.
2. **Garantir que o step não pode ser pulado** — em algum momento o usuário precisou pedir manualmente. Investigar e blindar.

---

## Mudança 1 — Novo template de convite com link

### Arquivo: `squads/relatorio-semanal/templates/whatsapp-template.md`

**Substituir** os 3 templates atuais (META-only, Google-only, META+Google) por **1 template único**:

```
Olá, [SAUDACAO]!

Segue o relatório de tráfego da semana *[DD/MM] a [DD/MM]*, [CLIENTE].

Para acessar, clique no link abaixo:
🔗 [LINK]
```

Campos e regras:

| Campo | Regra |
|-------|-------|
| `[SAUDACAO]` | `Bom dia` (00h–11h59) / `Boa tarde` (12h–17h59) / `Boa noite` (18h–23h59) |
| `[DD/MM]` início | Data da segunda-feira do período |
| `[DD/MM]` fim | Data do domingo do período |
| `[CLIENTE]` | Nome exato do cliente (ex: `IMCP`, `Dra. Danielle Gondim`) |
| `[LINK]` | URL do Reportei (ex: `https://app.reportei.com/projects/839737`) |

**Remover** completamente: seção de campos de métricas (`[META_SPEND]`, `[GOOGLE_SPEND]`, `[CONVERSAS]`, `[CPL]`, `[HIGHLIGHT]`) e a tabela de regras de preenchimento dessas métricas.

---

## Mudança 2 — Simplificar `whatsapp-writer.md`

### Arquivo: `squads/relatorio-semanal/agents/whatsapp-writer.md`

**Remover:**
- Seção "Regra de seleção de plataforma" (META-only / Google-only / META+Google)
- Seção "Regra para linha de highlight" e exemplos de highlight
- Campos de handoff que não são mais usados: `meta_spend`, `google_spend`, `conversas`, `cpl`

**Adicionar:**
- Lógica de saudação por horário (Bom dia / Boa tarde / Boa noite)
- Instrução: usar `periodo_inicio` e `periodo_fim` do handoff do `publicador`

**Campos do handoff que devem ser mantidos:**

| Campo | Usado para |
|-------|-----------|
| `cliente` | `[CLIENTE]` no template |
| `periodo_inicio` | `[DD/MM]` início |
| `periodo_fim` | `[DD/MM]` fim |
| `link` | `[LINK]` no template |

**Saída esperada (atualizar):**

```
MENSAGEM WHATSAPP — [CLIENTE]
════════════════════════════════════════════════════
Olá, [SAUDACAO]!

Segue o relatório de tráfego da semana *[DD/MM] a [DD/MM]*, [CLIENTE].

Para acessar, clique no link abaixo:
🔗 [LINK]
════════════════════════════════════════════════════
📋 Copie a mensagem acima e envie ao cliente via WhatsApp.
```

---

## Mudança 3 — Garantir execução automática (investigar)

### Arquivo: `squads/relatorio-semanal/agents/relatorio-chief.md`

O step 11 (`CHAMAR whatsapp-writer`) já existe. Verificar:
- Se a descrição do step está explícita o suficiente para não ser pulada
- Adicionar nota: `— OBRIGATÓRIO, sem aguardar solicitação do usuário`

**Linha atual (linha 41):**
```
11. CHAMAR whatsapp-writer
```

**Linha nova:**
```
11. CHAMAR whatsapp-writer — OBRIGATÓRIO, executa automaticamente sem aguardar solicitação
```

---

## Ordem de execução recomendada

1. `@dev` — editar `templates/whatsapp-template.md` (Mudança 1)
2. `@dev` — editar `agents/whatsapp-writer.md` (Mudança 2)
3. `@dev` — editar `agents/relatorio-chief.md` (Mudança 3, 1 linha)
4. Testar: rodar pipeline para 1 cliente e verificar se a mensagem gerada é o convite com link

---

## Arquivos a modificar (resumo)

| Arquivo | Tipo de mudança |
|---------|----------------|
| `squads/relatorio-semanal/templates/whatsapp-template.md` | Substituir 3 templates por 1 |
| `squads/relatorio-semanal/agents/whatsapp-writer.md` | Simplificar lógica, remover métricas |
| `squads/relatorio-semanal/agents/relatorio-chief.md` | Reforçar step 11 como obrigatório |

**Arquivos que NÃO precisam mudar:**
- `squad.yaml` — pipeline_flow já está correto
- `workflows/weekly-report-pipeline.md` — fluxo já correto
- `config/clientes-config.yaml` — não relacionado

---

## Como continuar em nova sessão

1. Abrir Claude Code no projeto `C:\Users\Usuario\Desktop\Claude_Stark`
2. Dizer: **"Quero continuar o handoff HANDOFF-whatsapp-melhoria.md do squad relatorio-semanal"**
3. Claude vai ler este arquivo e executar as mudanças diretamente com `@dev`

Não precisa chamar `@sm` para criar story — as mudanças são simples e diretas (3 arquivos, sem nova lógica complexa).
