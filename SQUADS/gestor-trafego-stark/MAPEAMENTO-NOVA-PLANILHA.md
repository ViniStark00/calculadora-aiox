# Mapeamento — Nova Planilha Google Sheets

> Sessão de levantamento: 2026-06-10
> Status: Em andamento — pendências listadas no final

---

## 1. Troca de Planilha

| | Planilha Antiga | Planilha Nova |
|---|---|---|
| **ID** | `1crqoxq8hqaQWsoZby5FlQt50gpUZ29buyeRKkv3M5Og` | `16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM` |
| **Estrutura de abas** | Uma aba por semana (`DD/MM/AAAA`) | Uma aba por mês (`Junho`, `Julho`...) |
| **Estrutura de linhas** | Uma linha por cliente | 4 linhas por cliente (Sem 1 a Sem 4) + 1 linha "Média Mês" |

---

## 2. Estrutura de Colunas de Identificação

| Coluna | Conteúdo |
|--------|----------|
| A | Gestor (ex: "Amanda", "Andreyves") |
| B | Cliente (ex: "Dr Fabrício") |
| C | Semana: `Sem 1`, `Sem 2`, `Sem 3`, `Sem 4` — ou `Média Mês` (fórmula, não tocar) |

Os clientes são **agrupados por gestor** dentro da aba (bloco AMANDA, bloco ANDREYVES, etc.).

---

## 3. Colunas a Preencher pelo Script

O script escreve **apenas** nestas colunas. As demais têm fórmulas e **não devem ser tocadas**.

### Topo de Funil — META (colunas D a I)

| Coluna | Métrica | Origem |
|--------|---------|--------|
| **D** | Investimento TOFU — campanhas com "TOFU" ou "IMP" no nome (R$) | Reportei — spend por campanha (⚠️ pendente confirmar) |
| **E** | Investimento total META no período (R$) | Reportei — `meta_spend` total |
| **F** | Seguidores ganhos | Reportei — `ig:new_followers_count` |
| G | *(fórmula — não tocar)* | — |
| H | *(fórmula — não tocar)* | — |
| I | *(fórmula — não tocar)* | — |

### Meio de Funil — META (colunas J, K)

| Coluna | Métrica | Origem |
|--------|---------|--------|
| **J** | CTR | Reportei (⚠️ pendente confirmar slug exato) |
| K | *(fórmula — não tocar)* | — |

### Fundo de Funil — META (colunas L a Q)

| Coluna | Métrica | Origem |
|--------|---------|--------|
| **L** | Investimento total BOFU — campanhas de leads/cadastros (R$) | Reportei — spend por campanha (⚠️ pendente confirmar) |
| **M** | Conversas iniciadas por mensagem | Reportei — `messaging_conversation_started_7d` |
| N | *(fórmula — não tocar)* | — |
| **O** | Leads META — cadastros em formulário do META | Reportei (⚠️ pendente confirmar slug) |
| **P** | Cadastros Respondi.app — formulário no META | Reportei (⚠️ pendente confirmar slug e disponibilidade) |
| Q | *(fórmula — não tocar)* | — |

### Google Ads (colunas R a T)

| Coluna | Métrica | Origem |
|--------|---------|--------|
| **R** | CPA Google — custo por conversão (R$) | Reportei (⚠️ pendente confirmar slug) |
| S | *(fórmula — não tocar)* | — |
| **T** | Investimento total Google no período (R$) | Reportei — `google_adwords` |

---

## 4. Comparativo: Colunas Antigas vs Novas

| Métrica | Coluna Antiga | Coluna Nova |
|---------|--------------|-------------|
| `meta_spend` (total) | C | E |
| `google_spend` (total) | E | T |
| `seguidores` | H | F |
| `conversas` | K | M |
| `conversoes` | O | *(substituída por L, O, P — ver abaixo)* |
| `meta_spend` TOFU | *(não existia)* | D |
| `meta_spend` BOFU | *(não existia)* | L |
| CTR | *(não existia)* | J |
| Leads META | *(não existia)* | O |
| Cadastros Respondi | *(não existia)* | P |
| CPA Google | *(não existia)* | R |

---

## 5. Nova Lógica de Navegação na Planilha

### Como encontrar a aba certa

```
mes_anterior = segunda-feira da semana anterior
nome_aba = nome do mês em português (ex: "Junho")
```

### Como calcular o "Sem X"

```
segunda = data de início da semana anterior
sem_numero = ceil(segunda.day / 7)
# Ex: dia 2  → Sem 1
# Ex: dia 9  → Sem 2
# Ex: dia 16 → Sem 3
# Ex: dia 23 → Sem 4
```

### Como encontrar a linha do cliente

Antes: buscar nome do cliente na coluna A.
Agora: buscar linha onde **coluna B = nome do cliente** E **coluna C = "Sem X"**.

---

## 6. O que Permanece Igual

- Cálculo do período: segunda a domingo da semana anterior (não muda)
- Fonte de dados: Reportei API v2
- Slugs conhecidos: `google_adwords`, `ig:new_followers_count`, `messaging_conversation_started_7d`
- Lógica de reuso FASE 1 → FASE 2 (ADR-04)
- Lógica de moeda (clientes em ARS pulam spend)

---

## 7. Arquivos que Precisam Mudar

| Arquivo | O que muda |
|---------|-----------|
| `data/clientes.yaml` | Âncora `_sheet_cols` → novas colunas (D, E, F, J, L, M, O, P, R, T) |
| `config/settings.yaml` | `SHEET_ID` → novo ID |
| `scripts/fill_sheets.py` | `calcular_aba()`, `localizar_linha()`, lógica de busca por coluna B+C, novos campos |
| `tasks/fetch-metrics.md` | Mapeamento de colunas atualizado |
| `CLAUDE.md` | Descrição da estrutura de abas atualizada |

---

## 8. Pendências — Respostas Necessárias

Antes de implementar, precisamos confirmar:

- [ ] **Col D e L (TOFU/BOFU split):** O Reportei retorna gasto separado por campanha? Como filtrar campanhas com "TOFU"/"IMP" no nome?
- [ ] **Col J (CTR):** Qual é o slug exato dessa métrica no Reportei?
- [ ] **Col O (Leads META):** Qual slug no Reportei? (`lead_form`? `leads`?)
- [ ] **Col P (Cadastros Respondi):** O Reportei tem essa métrica? Se sim, qual slug?
- [ ] **Col R (CPA Google):** Qual slug no Reportei para custo por conversão do Google?
- [ ] **SHEET_ID:** Atualizar variável de ambiente para `16f9MmlyUr3AfhCxfzjupChZjQDPSxw7rXY5ORjd9yXM`
- [ ] **Clientes com `sheet_columns: null`:** Esses gestores (Andreyves, Richard, Luiz, Mateus, Thiago, Wallison) entrarão na nova planilha também?
