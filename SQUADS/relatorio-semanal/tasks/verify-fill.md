---
task: verify-fill
agent: quality-gate
elicit: false
inputs:
  - status_por_cliente: saída da task fetch-metrics
  - aba_semana: nome da aba verificada
outputs:
  - relatorio_verificacao: ✅/⚠️/❌ por cliente e coluna
  - aprovado: boolean
---

# Task: verify-fill — Verificação de Preenchimento

**Pós-Atividade 1:** valida se todos os clientes do bloco Vinicius foram processados e se os valores são coerentes.

## Pré-condições

- `status_por_cliente` disponível da task `fetch-metrics`
- `config/clientes-config.yaml` acessível

## Checklist de verificação

### Check 1 — Cobertura de clientes
- [ ] Todos os clientes do bloco Vinicius foram tentados (mesmo que com erro)?
- Se algum foi silenciosamente ignorado → **REPROVAR**

### Check 2 — Células preenchidas
O coletor tenta todas as colunas. Colunas vazias (null) significam que a plataforma não existe para aquele cliente — isso é **normal e esperado**.

- [ ] Para cada coluna preenchida: o valor faz sentido (não é negativo sem explicação, não é impossível)?
- [ ] Pelo menos **uma** das colunas C ou E está preenchida? (cliente sem nenhuma plataforma ativa seria estranho)

### Check 3 — Valores coerentes
- [ ] Algum valor zerado onde havia dado na semana anterior? → **alerta** (não reprova automaticamente)
- [ ] Seguidores negativos? → **normal** se META fez limpeza de inativos — registrar aviso explicativo
- [ ] **Exceção aceita:** Dr Javier Cucchiaro → Meta Spend = 0 (bloqueado em ARS)

**Regra central:** coluna vazia (null) = plataforma ausente = OK. Só reprovar se algo claramente errado.

### Check 4 — Erros críticos
- [ ] Algum cliente com status `erro`?
  - Se sim → registrar como ⚠️ (aviso), não reprovar automaticamente
  - O `relatorio-chief` decide se interrompe ou continua

## Formato de saída

**Aprovado:**
```
✅ verify-fill APROVADO
════════════════════════════════════════════════════
Aba verificada: [DD/MM/AAAA]
Clientes processados: X/Y

✅ Destra Desenvolvimentos    C:✅  E:✅  H:✅  K:✅  O:✅
✅ Dr. Alvaro Rodrigues        C:✅  E:✅  H:✅  K:✅  O:✅
⚠️ Dr Javier Cucchiaro        C:—(ARS)  E:✅  H:✅  K:✅  O:✅
════════════════════════════════════════════════════
Pipeline pode continuar para geração do relatório.
```

**Reprovado:**
```
❌ verify-fill REPROVADO
════════════════════════════════════════════════════
Problemas encontrados:
- [Cliente X] — Coluna C vazia (sem justificativa)
- [Cliente Y] — Coluna E = 0 (verificar se Google Ads está ativo)
- [Cliente Z] — Status ERRO: projeto não encontrado no Reportei

Ação necessária: corrigir e rodar novamente.
Pipeline INTERROMPIDO.
════════════════════════════════════════════════════
```
