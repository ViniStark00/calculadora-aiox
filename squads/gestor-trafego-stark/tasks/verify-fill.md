---
task: verify-fill
agent: validator
squad: gestor-trafego-stark
elicit: false
inputs:
  - status_por_cliente: saída da task fetch-metrics
  - aba_semana: nome da aba verificada (DD/MM/AAAA)
outputs:
  - relatorio_verificacao: ✅/⚠️/❌ por cliente e coluna
  - aprovado: boolean
---

# Task: verify-fill — Verificação de Preenchimento do Sheets

**Pós-FASE 2:** valida se todos os clientes do bloco Vinicius foram processados e os valores são coerentes antes de avançar para FASE 3.

## Pré-condições

- `status_por_cliente` disponível da task `fetch-metrics`
- `data/clientes.yaml` acessível

## Checklist de verificação

### Check 1 — Cobertura de clientes
- [ ] Todos os clientes ativos com `vinicius in gestores` em `data/clientes.yaml` foram tentados?
- Se algum foi silenciosamente ignorado → **REPROVAR**

### Check 2 — Células preenchidas por coluna
- Cada coluna corresponde ao `sheet_columns` do cliente em `data/clientes.yaml`
- [ ] Para cada coluna preenchida: o valor faz sentido (não negativo sem explicação)?
- [ ] Pelo menos uma das colunas `meta_spend` ou `google_spend` está preenchida por cliente?

### Check 3 — Valores coerentes
- [ ] Algum valor zerado onde havia dado na semana anterior? → **alerta** (não reprova automaticamente)
- [ ] Seguidores negativos? → normal se META fez limpeza de inativos — registrar aviso explicativo

### Check 4 — Erros críticos
- [ ] Algum cliente com status `erro`?
  - Registrar como ⚠️ (aviso); `stark-chief` decide se interrompe ou continua

## Formato de saída

**Aprovado:**
```
✅ verify-fill APROVADO
════════════════════════════════════════════════════
Aba verificada: [DD/MM/AAAA]
Clientes processados: X/Y

✅ [Cliente A]   C:✅  E:✅  H:✅  K:✅  O:✅
✅ [Cliente B]   C:✅  E:—   H:✅  K:✅  O:✅  (Google sem histórico)
⚠️ [Cliente C]   C:—   E:✅  H:✅  K:✅  O:✅  (sem Meta Ads — esperado)
════════════════════════════════════════════════════
Pipeline pode continuar para FASE 3 (narrativa do relatório).
```

**Reprovado:**
```
❌ verify-fill REPROVADO
════════════════════════════════════════════════════
Problemas encontrados:
- [Cliente X] — Coluna K vazia (sem justificativa — conversas deveria existir)
- [Cliente Y] — Status ERRO: projeto não encontrado no Reportei

Ação necessária: corrigir e rodar novamente.
Pipeline INTERROMPIDO.
════════════════════════════════════════════════════
```
