# Handoff — Inclusão de Amanda nas Automações

**Data:** 2026-06-17
**Branch:** fix/fetch-metrics-respondi
**Sessão:** inclusão de Amanda Neves como gestora ativa no squad

---

## O que foi feito nesta sessão

### Bugs corrigidos
1. **BOM UTF-8** no `fill_sheets.py` linha 288: `encoding="utf-8"` → `encoding="utf-8-sig"`
2. **`service_account.json` recriado** via GCP (conta `stark-metricas`) e colocado em `squads/gestor-trafego-stark/service_account.json`
3. **Caminho da credencial** em `.claude/settings.local.json` atualizado para novo local
4. **`nome_planilha: "Dr Fabrício"`** adicionado em `clientes.yaml` — planilha usa nome curto, YAML tinha nome completo
5. **`--gestor amanda`** identificado como obrigatório para os 3 clientes da Amanda

### Amanda incluída nas automações
Arquivos editados:
- `squads/gestor-trafego-stark/CLAUDE.md` — gestores: 8 → 9 (inclui Amanda); removida nota de exclusão
- `squads/gestor-trafego-stark/agents/stark-chief.md` — FASE 2 agora cobre todos os gestores; Amanda adicionada em `multi_client_mode`
- `squads/gestor-trafego-stark/tasks/fetch-metrics.md` — `fill_sheets.py` agora deve receber `--gestor <gestor_do_cliente>` obrigatoriamente
- `squads/gestor-trafego-stark/data/clientes.yaml` — `nome_planilha: "Dr Fabrício"` adicionado ao slug `dr-fabricio-camargo`

---

## Clientes da Amanda (3)

| Slug | Nome planilha | Meta Ads MCP |
|---|---|---|
| `dr-thiago-bandeira` | Dr Thiago Bandeira | ✅ `5121950121207400` |
| `felipe-maximo` | Felipe Máximo | ✅ `614145217153647` |
| `dr-fabricio-camargo` | Dr Fabrício | ❌ null |

---

## O que ainda precisa ser feito

### 1. Commit e PR
Os arquivos editados ainda não foram commitados. Fazer:
```
git add squads/gestor-trafego-stark/CLAUDE.md
git add squads/gestor-trafego-stark/agents/stark-chief.md
git add squads/gestor-trafego-stark/tasks/fetch-metrics.md
git add squads/gestor-trafego-stark/data/clientes.yaml
git add squads/gestor-trafego-stark/scripts/fill_sheets.py
git commit -m "feat(amanda): inclui Amanda como gestora ativa nas automações do squad"
```

### 2. Testar rotina completa para Amanda
Testar `*planilha dr-thiago-bandeira` via Stark Chief para confirmar que FASE 2 agora roda corretamente com `--gestor amanda`.

### 3. `rotina-semanal.md` — verificar referências a gestores
O arquivo menciona gestor `vinicius` e `gustavo` em algumas partes narrativas. Revisar e adicionar amanda onde aplicável (especialmente na lógica de "resolver doc de destino").

---

## Comandos úteis para teste

```bash
# Preencher planilha Amanda manualmente
cd C:/Users/Usuario/Desktop/Claude_Stark
python squads/gestor-trafego-stark/scripts/fill_sheets.py \
  --metricas-arquivo squads/gestor-trafego-stark/scripts/metricas_jun_sem2.json \
  --clientes dr-fabricio-camargo,dr-thiago-bandeira,felipe-maximo \
  --semana Junho \
  --gestor amanda
```
