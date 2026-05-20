# Thresholds por Especialidade Médica — Gestor Tráfego IA

Referência de thresholds para o @alerta-monitor.
Thresholds completos de frequência e CTR: ver `squads/trafego-medico-stark/data/thresholds.md`.

---

## CPM por especialidade médica

| Especialidade | Faixa saudável | 🟡 Alerta | 🔴 Pause |
|---|---|---|---|
| cirurgia_plastica | R$ 12–22 | > R$ 22 | > R$ 28 |
| cirurgia_plastica_face | R$ 15–25 | > R$ 25 | > R$ 32 |
| cirurgia_ortognatica | R$ 18–30 | > R$ 30 | > R$ 38 |
| dermatologia | R$ 10–18 | > R$ 18 | > R$ 24 |
| medicina_estetica | R$ 12–22 | > R$ 22 | > R$ 28 |
| tricologia | R$ 14–24 | > R$ 24 | > R$ 30 |
| implantes_dentarios | R$ 16–28 | > R$ 28 | > R$ 35 |
| emagrecimento | R$ 18–30 | > R$ 30 | > R$ 38 |
| oncologia | R$ 22–38 | > R$ 38 | > R$ 48 |
| cirurgia_cabeca_pescoco | R$ 20–35 | > R$ 35 | > R$ 45 |
| anestesia | R$ 18–32 | > R$ 32 | > R$ 42 |
| medico_de_familia | R$ 8–16 | > R$ 16 | > R$ 22 |
| saude_geral | R$ 10–20 | > R$ 20 | > R$ 26 |

**Regra:** CPM pause ≈ 30% acima do teto saudável da especialidade
**Ajuste por funil:** TOFU: subtrair R$ 5 do threshold de pause | BOFU: somar R$ 5 | Retargeting pequeno: threshold × 1,5

---

## Kill Switch — Spend sem conversa

Lookback 3 dias. Applies apenas a anúncios com 7+ dias de veiculação.
`messaging_conversation_started_7d = 0` em 3 dias consecutivos.

| Especialidade | Threshold spend |
|---|---|
| cirurgia_plastica | R$ 30 |
| cirurgia_plastica_face | R$ 36 |
| cirurgia_ortognatica | R$ 80 |
| dermatologia | R$ 50 |
| medicina_estetica | R$ 90 |
| tricologia | R$ 60 |
| implantes_dentarios | R$ 90 |
| emagrecimento | R$ 100 |
| oncologia | R$ 150 |
| cirurgia_cabeca_pescoco | R$ 120 |
| anestesia | R$ 120 |
| medico_de_familia | R$ 50 |
| saude_geral | R$ 60 |

**Regra:** threshold ≈ 3× o piso do CPL benchmark da especialidade
**Severidade:** 🔴 CRÍTICO — recomendar ação ao gestor (NOTIFY, não auto-pause)

---

## CPL por cliente

CPL meta é individual — definido em `data/clientes.md → meta_cpl`.

| Situação | Threshold | Severidade |
|---|---|---|
| CPL_atual > meta_cpl × 1.3 | Alerta | 🟡 ATENÇÃO |
| CPL_atual > meta_cpl × 1.6 | Crítico | 🔴 CRÍTICO |
| meta_cpl = null | Sem referência | ⚠️ SEM META DEFINIDA |

---

## Frequência por tipo de campanha

| Tipo | Prefixo padrão | 🟡 Alerta | 🔴 Pause |
|---|---|---|---|
| TOFU / Prospecting | TOFU, IMP | > 2,5 | > 3,0 |
| MOFU / Engajamento | MOFU, TRAF | > 3,0 | > 3,5 |
| BOFU / Conversão | BOFU, CONV | > 4,0 | > 4,5 |
| Awareness / Alcance | AW, REACH | > 2,2 | > 2,8 |

**Janela:** last_7d
**Mínimo:** 1.000 impressões (abaixo disso, frequência é estatisticamente instável)
**Default:** usar TOFU como conservador quando tipo não identificável pelo nome

---

## CTR

| Condição | Janela | Spend mín. | Severidade |
|---|---|---|---|
| CTR no link < 0,8% | 3–5 dias | R$ 20 | 🔴 CRÍTICO |
| CTR (Todos) < 1,5% | 3+ dias | R$ 20 | 🟡 ATENÇÃO |
| Remarketing: CTR baixo + CPL ok | — | — | Ignorar CTR |

---

## Quando NÃO alertar

- Primeiros 7 dias de campanha nova
- Campanhas awareness/reach: CPM alto é feature
- Spend < R$ 20 no lookback
- Audiência < 1.000 impressões (frequência instável)
- Dr. Laureano Filho: excluído do monitoramento Meta

## CPL de referência por especialidade

Usado quando `meta_cpl = null` em `data/clientes.md`.
Fonte primária: histórico real carteira Stark (22/04–12/05/2026) — `cpl-historico-carteira.md`
Fonte secundária: benchmark de mercado Brasil 2025/2026 — pesquisa compilada em 19/05/2026
Última atualização: 19/05/2026

| Especialidade | CPL real carteira | CPL mercado BR (baixo–médio–alto) | Meta operacional | Alerta (×1.3) | Crítico (×1.6) |
|---|---|---|---|---|---|
| medicina_estetica | R$ 10–25 (excelente) | R$ 15–50–80 | R$ 50 | > R$ 65 | > R$ 80 |
| dermatologia | R$ 20 (Érica) | R$ 20–55–120 | R$ 60 | > R$ 78 | > R$ 96 |
| cirurgia_plastica | R$ 24 (Marcelo) | R$ 30–80–180 | R$ 100 | > R$ 130 | > R$ 160 |
| tricologia | R$ 32 (Higner) | R$ 40–80–130* | R$ 80 | > R$ 104 | > R$ 128 |
| oncologia | R$ 15 (Diego — excepcional) | R$ 80–175–300 | R$ 150 | > R$ 195 | > R$ 240 |
| saude_geral | R$ 29–96 (Caio / Fernando) | R$ 30–50–90 | R$ 55 | > R$ 72 | > R$ 88 |
| emagrecimento | sem cliente ativo | R$ 25–60–120 | R$ 80 | > R$ 104 | > R$ 128 |
| cirurgia_plastica_face | sem cliente ativo | R$ 80–150–250 | R$ 130 | > R$ 169 | > R$ 208 |
| cirurgia_ortognatica | sem cliente ativo | R$ 80–185–350 | R$ 160 | > R$ 208 | > R$ 256 |
| implantes_dentarios | sem cliente ativo | R$ 60–130–250* | R$ 120 | > R$ 156 | > R$ 192 |
| cirurgia_cabeca_pescoco | sem cliente ativo | R$ 100–180–300* | R$ 150 | > R$ 195 | > R$ 240 |
| anestesia | sem cliente ativo | R$ 80–150–280* | R$ 130 | > R$ 169 | > R$ 208 |
| medico_de_familia | sem cliente ativo | R$ 20–40–80* | R$ 50 | > R$ 65 | > R$ 80 |

> *Estimativa baseada em analogia com especialidades similares — sem dado direto de mercado ou carteira.
> Especialidades com "sem cliente ativo": usar CPL mercado como referência até ter histórico próprio.

### Notas de interpretação

**medicina_estetica:** Carteira Stark opera abaixo do mercado (R$10–25 vs mercado R$15–50).
Dra. Nicolli R$9,95 e Dra. Mariângela R$13,02 são performances excepcionais.
Meta operacional de R$50 é conservadora — revisitar se carteira mantiver média abaixo de R$25.

**oncologia:** Dr. Diego com R$14,59 é outlier positivo extremo vs mercado (R$80–300).
Pode indicar produto de baixo ticket (consulta inicial) ou campanha de awareness convertendo barato.
Não usar CPL do Diego como meta para novos clientes oncologia — usar R$150 como referência conservadora.

**saude_geral:** Dr. Fernando Bezerra R$95,58 está 59% acima do teto (R$60) — caso de atenção ativa.
Dr. Caio Fernandes R$29,04 está saudável. Separar metas por perfil de cliente dentro da mesma especialidade.

**dermatologia:** Apenas 1 cliente na carteira (Érica Marchiori, R$19,99). Amostra pequena.
Benchmark de mercado R$20–120 tem range amplo — usar R$60 como meta até ter mais clientes.

### Como o @alerta-monitor usa esta tabela

1. Verificar `meta_cpl` individual em `clientes.md` — tem precedência absoluta
2. Se `meta_cpl = null` → usar coluna "Meta operacional" desta tabela pela especialidade
3. Alerta 🟡 quando CPL atual > meta × 1.3
4. Alerta 🔴 quando CPL atual > meta × 1.6
5. Incluir no alerta: CPL atual vs meta individual (ou meta tabela) vs benchmark mercado