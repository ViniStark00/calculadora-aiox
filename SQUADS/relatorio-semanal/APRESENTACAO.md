# APRESENTACAO.md — Roteiro da Apresentação para o Anderson
> **Squad:** `relatorio-semanal` | **Duração:** 30 minutos | **Formato:** Demo ao vivo
> **Critério mínimo:** Squad executa ponta a ponta, do zero, sem intervenção humana.

---

## ANTES DE COMEÇAR — Checklist Pré-Apresentação

- [ ] `REPORTEI_TOKEN` configurado no terminal (`$env:REPORTEI_TOKEN = "..."`)
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` configurado (`$env:GOOGLE_SERVICE_ACCOUNT_JSON = "C:\..."`)
- [ ] `SHEET_ID` configurado (`$env:SHEET_ID = "1crqoxq8hqaQWsoZby5FlQt50gpUZ29buyeRKkv3M5Og"`)
- [ ] Claude Code aberto na pasta `C:\Users\Usuario\Desktop\Claude_Stark`
- [ ] Aba da semana anterior no Google Sheets já criada (ex: `17/05/2026`)
- [ ] Reportei aberto no browser (para mostrar o marco publicado ao vivo)
- [ ] Output de exemplo em `examples/imcp-2026-05-17-v2.md` acessível

---

## BLOCO 1 — 5 min: O Problema e as 3 Atividades

**Objetivo:** Mostrar o que era feito manualmente, quanto tempo levava e qual era a dor real.

### Roteiro de fala

> "Sou gestor de tráfego pago na Stark Marketing e gerencio campanhas para múltiplos clientes. Toda semana, sem exceção, eu precisava executar 3 atividades repetitivas antes de fazer qualquer coisa estratégica."

Apresentar a tabela:

| Atividade | O que era feito manualmente | Dor principal | Tempo |
|-----------|---------------------------|---------------|-------|
| Preencher planilha | Abrir Reportei, copiar dado por dado no Sheets — coluna por coluna, cliente por cliente | Existia automação no Colab com bugs; dependência externa que travava | ~45 min |
| Gerar texto do relatório | Escrever narrativa do zero para cada cliente toda semana | Qualidade variava com o cansaço; sem padrão garantido entre semanas | ~30 min/cliente |
| Publicar na Linha do Tempo | Entrar no Reportei e postar manualmente cada relatório | Tarefa pequena que era esquecida com frequência; atrasava a entrega | ~10 min/cliente |

> "Com 4 clientes, isso era quase 5 horas por semana só em trabalho mecânico. Decidi transferir as 3 para um squad."

**Mostrar:** Os 5 filtros de escolha — por que essas 3 atividades passam em todos.

| Filtro | Critério | Estas atividades passam? |
|--------|---------|--------------------------|
| Repetitiva | Faz mais de 3x por semana | ✅ Toda semana, sem exceção |
| Padrão claro | Explica em 5 min para colega novo | ✅ Colunas fixas, template fixo |
| Output verificável | Checklist objetivo de "ficou bom" | ✅ Dados corretos + texto com datas e valores |
| Volume relevante | Transferir custa menos que executar | ✅ 85 min/semana/cliente → 4 clientes = ~5h/semana |
| Independente | Sem decisão política no meio | ✅ Dados objetivos, sem aprovação necessária |

---

## BLOCO 2 — 8 min: Processo + Contexto Aplicados

**Objetivo:** Provar que você entende o processo — não está só apertando um botão.

### Frase de transição

> "Antes de mostrar o squad, quero provar que eu entendi o processo. Porque o Anderson disse: *'você só transfere o que entende.'*"

### Parte A — Processo (3-4 min)

Explicar o passo a passo de cada atividade *antes* da automação:

**Atividade 1 — Planilha:**
1. Abrir Reportei, ir em cada projeto
2. Anotar Meta Spend (coluna C), Google Spend (E), Seguidores (H), Conversas (K), Conversões (O)
3. Abrir Google Sheets, localizar a aba da semana, localizar a linha de cada cliente
4. Colar dado por dado — 5 colunas × 4 clientes = 20 operações manuais

**Atividade 2 — Relatório:**
1. Olhar os dados da planilha
2. Abrir um relatório anterior como referência de tom
3. Escrever parágrafo narrativo com datas, métricas, análise
4. Montar bloco de métricas em negrito
5. Escrever seção de destaques dos criativos/palavras-chave

**Atividade 3 — Publicação:**
1. Copiar o texto gerado
2. Entrar no Reportei → Projeto do cliente → Linha do Tempo
3. Criar novo marco → Colar texto → Salvar

### Parte B — Contexto (3-4 min)

> "O Anderson disse que squad só é bom no contexto que você entrega. As 4 camadas que o squad usa:"

| Camada | O que é | Como aparece no squad |
|--------|---------|----------------------|
| **CLAUDE.md** | Regras fixas: voz neutra, palavras proibidas, restrições técnicas | `squads/relatorio-semanal/CLAUDE.md` |
| **Briefing** | Input da execução: nome do cliente, período calculado automaticamente | Comando: "Rodar pipeline para [CLIENTE]" |
| **Examples** | Caso real anterior com input + output | `examples/imcp-2026-05-17-v2.md` |
| **Memória** | Preferências e dados acumulados por cliente | `config/clientes-config.yaml` |

> "Antes de construir o squad, eu precisei organizar esse processo. A automação veio depois."

---

## BLOCO 3 — 10 min: Anatomia + Demo ao Vivo

### Parte A — Anatomia do Squad (4 min)

**Mostrar na tela a estrutura de pastas e explicar os 5 elementos:**

```
squads/relatorio-semanal/
├── CLAUDE.md              ← Elemento 1: Briefing (voz, regras, restrições)
├── agents/
│   ├── relatorio-chief.md ← Elemento 2: Orquestrador do pipeline
│   ├── coletor.md         ← Elemento 2: API Reportei → Google Sheets
│   ├── redator.md         ← Elemento 2: Gera narrativa HTML
│   ├── publicador.md      ← Elemento 2: Publica na Timeline
│   └── quality-gate.md    ← Elemento 2: Valida dados e texto
├── checklists/
│   └── qa-relatorio.md    ← Elemento 4: Critério de aceite objetivo
└── examples/
    └── imcp-2026-05-17-v2.md  ← Elemento 5: Evidência do pipeline
```

Para cada agente, explicar em 1 frase:
- **relatorio-chief:** orquestra o pipeline, carrega config do cliente, controla o fluxo dos 5 agentes
- **coletor:** chama API Reportei v2, calcula período automaticamente, escreve colunas C/E/H/K/O no Sheets
- **redator:** analisa métricas, consulta MCP Reportei, gera narrativa em HTML usando o template
- **publicador:** publica texto como marco na Timeline do Reportei via MCP `create_timeline_event`
- **quality-gate:** valida em 2 momentos — dados (Bloco A, 8 checks) e texto (Bloco B, 8 checks)

**Ferramenta (Elemento 3):**
- MCP Reportei: `mcp__30ebe978-db99-4dee-927c-b72f6abac9d8` — acessa métricas e publica na Timeline
- Google Sheets API: via service account, preenche a planilha automaticamente

### Parte B — Demo ao Vivo (6 min)

**Sequência exata (praticar antes):**

```
1. Abrir Claude Code
2. Digitar: /relatorio-semanal
3. Aguardar saudação do relatorio-chief
4. Digitar: "Rodar pipeline para IMCP"
5. Mostrar coletor buscando métricas no Reportei (chamada API ao vivo)
6. Mostrar quality-gate validando os dados coletados (Bloco A — 8 checks)
7. Mostrar redator gerando o texto com os dados
8. Mostrar quality-gate validando o texto (Bloco B — 8 checks)
9. Mostrar publicador postando na Timeline via MCP
10. Abrir Reportei no browser → Projeto IMCP → Timeline → mostrar marco publicado
11. Abrir Google Sheets → aba da semana → mostrar colunas preenchidas
```

**Fallback se algo travar:**
- Abrir `examples/imcp-2026-05-17-v2.md` e mostrar o output já gerado
- "Este é o output da última execução — o pipeline rodou assim na semana passada"

---

## BLOCO 4 — 7 min: Métrica de Ganho + Aprendizados + Perguntas

### Métricas de ganho

| Cenário | Antes (manual) | Depois (squad) | Ganho |
|---------|---------------|----------------|-------|
| 1 cliente / semana | ~85 min | ~5 min supervisão | **~80 min livres** |
| 4 clientes / semana | ~340 min (~5,5h) | ~20 min | **~320 min (~5h)** |
| 10 clientes / semana | ~850 min (~14h) | ~50 min | **~800 min (~13h)** |
| 1 mês · 4 clientes | ~22h | ~1,3h | **~21h livres/mês** |

### Por que isso importa

- **Libera tempo** — cada atividade transferida vira hora livre na semana
- **Padroniza o jeito** — squad executa sempre igual, sem depender do humor do dia
- **Escala sem você** — pode rodar enquanto você dorme ou está em reunião
- **Gera artefato reusável** — outro gestor da Stark adota sem reaprender do zero

### Aprendizados para mencionar

1. **O processo precisou estar organizado ANTES de automatizar.** O Colab tinha bugs porque o processo em si era bagunçado.
2. **A evidência é essencial.** A pasta `examples/` prova que rodou — sem evidência é só ideia.
3. **O quality-gate foi o que garantiu qualidade.** Sem ele, texto com dado errado chegaria ao cliente.
4. **HTML, não markdown.** O Reportei não renderiza markdown — descobri na primeira execução e corrigi. O squad agora tem isso documentado como pilar.

---

## RISCOS QUE O ANDERSON AVALIA — Como se Defender

| Risco | Se perguntar... | Sua resposta |
|-------|----------------|--------------|
| Tato humano | "E se o cliente tiver algo sensível?" | As 3 atividades são objetivas: dados e template. Nada subjetivo. |
| Sem critério | "Como você sabe que ficou bom?" | quality-gate com 19 checks. Mostrar `checklists/qa-relatorio.md`. |
| Automatizar caos | "O processo já funcionava antes?" | Tinha automação no Colab com 12 bugs documentados. Corrigi antes de automatizar. |
| Escopo aberto | "O squad tem fim?" | Entregável claro: planilha preenchida + texto aprovado + marco publicado. |

---

## FRASE FINAL (se sobrar tempo)

> *"Você só transfere o que entende. Se não descreve a atividade em um parágrafo claro, não está pronta pra transferir."*
>
> — Anderson Silva

Eu descrevi. Automatizei. Funciona.

---

*Gerado em: 2026-05-20 | Squad: relatorio-semanal | Versão: 1.0*
