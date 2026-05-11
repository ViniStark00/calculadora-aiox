---
task: validate-research
agent: ogilvy
elicit: true
inputs:
  - pesquisa_gemini (texto ou arquivo trazido pelo usuário)
outputs:
  - relatorio_validacao
  - dados_confirmados
  - dados_suspeitos
  - dados_rejeitados
  - lacunas_identificadas
---

# Task: Validar Pesquisa Trazida do Gemini

## Quando executar
Após o usuário trazer o resultado do Gemini Deep Research de volta para o pipeline.

## Passos

1. Receber o texto/arquivo de pesquisa do usuário
2. Aplicar os 5 filtros do ogilvy:
   - Filtro 1: Verificar fonte de cada dado (primária / secundária / sem fonte)
   - Filtro 2: Sinalizar números acima de 100% de melhoria sem metodologia
   - Filtro 3: Comparar com `data/knowledge-base.yaml` — contradições?
   - Filtro 4: Identificar dados cross-nicho aplicáveis à cirurgia plástica
   - Filtro 5: Listar lacunas — o que a pesquisa não respondeu
3. Montar relatório de validação
4. Se houver lacunas: gerar prompts complementares para o gemini-bridge

## Output

```
RELATÓRIO DE VALIDAÇÃO DE PESQUISA
────────────────────────────────────
✅ DADOS CONFIRMADOS ([N] itens)
   - [dado 1] — fonte: [X] — confiança: ALTA/MEDIA
   - ...

⚠️  DADOS SUSPEITOS ([N] itens) — use com cautela
   - [dado] — motivo da suspeita

❌ DADOS REJEITADOS ([N] itens)
   - [dado] — motivo: fonte inválida / contradição grave

🔄 CROSS-NICHO IDENTIFICADO ([N] itens)
   - [dado] — aplicável com adaptação: [como adaptar]

❓ LACUNAS — prompts sugeridos
   - [tópico não coberto] → prompt sugerido para gemini-bridge
────────────────────────────────────
PRÓXIMA FASE: kennedy (build-campaign-structure)
```
