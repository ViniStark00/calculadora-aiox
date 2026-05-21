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

## VISÃO GERAL — O que é o squad

O **relatorio-semanal** é um squad de automação que executa 3 atividades semanais recorrentes do gestor de tráfego pago — do zero, sem intervenção humana, em menos de 5 minutos.

**Um comando. Pipeline completo.**

```
Rodar pipeline para [NOME DO CLIENTE]
```

O squad coleta as métricas no Reportei, preenche o Google Sheets, gera o texto narrativo do relatório com validação de qualidade, publica na Linha do Tempo do Reportei e ainda entrega a mensagem de WhatsApp pronta para o cliente — tudo automaticamente, cliente por cliente.

**Além do pipeline semanal**, o squad tem um painel de monitoramento diário que varre toda a carteira, classifica o CPL por threshold de especialidade e entrega um alerta de quem precisa de atenção no dia.

---

## OS 9 AGENTES

> Inspirado no modelo do Gustavo: cada agente tem uma função específica no fluxo. Aqui o squad completo.

| # | Agente | Tipo | O que faz |
|---|--------|------|-----------|
| 1 | **relatorio-chief** | Orquestrador | Recebe o comando, carrega config do cliente, calcula o período automaticamente e controla o fluxo dos 9 agentes do início ao fim |
| 2 | **coletor** | Executor | Chama a API Reportei v2 com paginação, casa nomes de projetos, escreve as colunas C/E/H/K/O no Google Sheets e salva o histórico |
| 3 | **quality-gate** | Validador | Age em 2 momentos: valida os dados coletados (4 checks) e valida o texto gerado (8 checks) — reprova e interrompe se algo estiver errado |
| 4 | **redator** | Executor | Analisa as métricas, consulta CPL/cliques/impressões via MCP, compara com histórico das últimas 4 semanas e gera narrativa em HTML com tom neutro |
| 5 | **publicador** | Executor | Publica o relatório aprovado como marco na Linha do Tempo do Reportei via MCP `create_timeline_event` |
| 6 | **whatsapp-writer** | Executor | Formata a mensagem de WhatsApp com as métricas e o link do relatório — pronta para copiar e enviar ao cliente |
| 7 | **monitor-tarefas-clickup** | Executor | Marca as tarefas do cliente como concluídas no ClickUp ao final do pipeline (não-bloqueante) |
| 8 | **contexto-cliente** | Memória | Lê o documento de contexto do cliente no Google Drive antes do pipeline e atualiza os aprendizados da semana ao final |
| 9 | **monitor-diario** | Painel | Varre toda a carteira, calcula CPL, classifica por threshold de especialidade (🔴 crítico / 🟡 atenção / 🟢 ok) e entrega painel de alertas diário |

### Fluxo do pipeline semanal

```
relatorio-chief
    │
    ├─► contexto-cliente (leitura — Drive)
    │
    ├─► coletor (API Reportei → Google Sheets)
    │       └─► save-history
    │
    ├─► quality-gate (verify-fill — valida coleta)
    │
    ├─► redator (gera narrativa HTML)
    │
    ├─► quality-gate (validate-report — valida texto)
    │
    ├─► publicador (Timeline Reportei via MCP)
    │
    ├─► whatsapp-writer (mensagem pronta)
    │
    ├─► monitor-tarefas-clickup (marca ClickUp)
    │
    └─► contexto-cliente (atualização — aprendizados)
```

### Estimativa de tempo por etapa

| Etapa | Agente | Tempo estimado |
|-------|--------|----------------|
| Carregar contexto do Drive | contexto-cliente | ~5 seg |
| Coletar métricas (API Reportei) | coletor | ~15–30 seg por cliente |
| Validar coleta | quality-gate | ~3 seg |
| Gerar texto do relatório | redator | ~20–30 seg |
| Validar texto | quality-gate | ~3 seg |
| Publicar na Timeline | publicador | ~5 seg |
| Formatar WhatsApp | whatsapp-writer | ~5 seg |
| Marcar ClickUp | monitor-tarefas-clickup | ~10 seg |
| Atualizar contexto | contexto-cliente | ~5 seg |
| **TOTAL por cliente** | | **~1 a 2 minutos** |
| **Manual (antes)** | | **~85 minutos** |

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
| **Memória** | Preferências e dados acumulados por cliente | `config/clientes-config.yaml` + Drive (contexto-cliente) |

> "Antes de construir o squad, eu precisei organizar esse processo. A automação veio depois."

---

## BLOCO 3 — 10 min: Anatomia + Demo ao Vivo

### Parte A — Anatomia do Squad (4 min)

**Mostrar na tela a estrutura de pastas e explicar os 5 elementos:**

```
squads/relatorio-semanal/
├── CLAUDE.md                  ← Elemento 1: Briefing (voz, regras, restrições)
├── agents/
│   ├── relatorio-chief.md     ← Elemento 2: Orquestrador (controla tudo)
│   ├── coletor.md             ← Elemento 2: API Reportei → Google Sheets
│   ├── redator.md             ← Elemento 2: Gera narrativa HTML
│   ├── publicador.md          ← Elemento 2: Publica na Timeline
│   ├── quality-gate.md        ← Elemento 2: Valida dados e texto
│   ├── whatsapp-writer.md     ← Elemento 2: Mensagem WhatsApp
│   ├── contexto-cliente.md    ← Elemento 2: Memória por cliente (Drive)
│   ├── monitor-diario.md      ← Elemento 2: Painel de alertas diário
│   └── monitor-tarefas-clickup.md ← Elemento 2: Marca tarefas no ClickUp
├── checklists/
│   └── qa-relatorio.md        ← Elemento 4: Critério de aceite objetivo
└── examples/
    └── imcp-2026-05-17-v2.md  ← Elemento 5: Evidência do pipeline
```

**Resumo de cada agente em 1 frase (para falar ao vivo):**

- **relatorio-chief:** recebe "Rodar pipeline para X", carrega tudo que o squad precisa e controla o fluxo dos 9 agentes
- **coletor:** chama a API do Reportei, pega as métricas da semana e escreve nas colunas certas do Sheets
- **quality-gate:** age duas vezes — confere se os dados estão ok e depois se o texto gerado está ok
- **redator:** com as métricas em mãos, compara com o histórico das últimas 4 semanas e escreve o relatório em HTML
- **publicador:** pega o texto aprovado e cria o marco na Linha do Tempo do Reportei via MCP
- **whatsapp-writer:** monta a mensagem de WhatsApp com o resumo e o link do relatório, pronta para copiar
- **contexto-cliente:** antes de rodar, carrega o perfil e o histórico do cliente do Drive; no final, registra os aprendizados da semana
- **monitor-diario:** se chamado isolado, varre toda a carteira e classifica quem está com CPL crítico, em atenção ou ok
- **monitor-tarefas-clickup:** ao final do pipeline, marca as tarefas concluídas no ClickUp sem travar o fluxo

**Ferramenta (Elemento 3):**
- MCP Reportei: `mcp__30ebe978...` — busca métricas e publica na Timeline
- MCP Google Drive: `mcp__92a31705...` — lê e atualiza o contexto do cliente
- MCP ClickUp: `mcp__2d24fa11...` — marca tarefas como concluídas
- Google Sheets API: via service account, preenche a planilha automaticamente

### Parte B — Demo ao Vivo (6 min)

**Sequência exata (praticar antes):**

```
1. Abrir Claude Code
2. Digitar: /relatorio-semanal
3. Aguardar saudação do relatorio-chief
4. Digitar: "Rodar pipeline para IMCP"
5. Mostrar contexto-cliente carregando o perfil do Drive
6. Mostrar coletor buscando métricas no Reportei (chamada API ao vivo)
7. Mostrar quality-gate validando os dados coletados
8. Mostrar redator gerando o texto com comparação histórica
9. Mostrar quality-gate validando o texto final
10. Mostrar publicador postando na Timeline via MCP
11. Mostrar whatsapp-writer gerando a mensagem pronta
12. Abrir Reportei no browser → Projeto IMCP → Timeline → mostrar marco publicado
13. Abrir Google Sheets → aba da semana → mostrar colunas preenchidas
```

**Fallback se algo travar:**
- Abrir `examples/imcp-2026-05-17-v2.md` e mostrar o output já gerado
- "Este é o output da última execução — o pipeline rodou assim na semana passada"

---

## BLOCO 4 — 7 min: Métrica de Ganho + Aprendizados + Perguntas

### Métricas de ganho

| Cenário | Antes (manual) | Depois (squad) | Ganho |
|---------|---------------|----------------|-------|
| 1 cliente / semana | ~85 min | ~2 min execução + supervisão | **~83 min livres** |
| 4 clientes / semana | ~340 min (~5,5h) | ~8 min | **~332 min (~5,5h)** |
| 10 clientes / semana | ~850 min (~14h) | ~20 min | **~830 min (~13,8h)** |
| 1 mês · 4 clientes | ~22h | ~35 min | **~21h livres/mês** |

### Por que isso importa

- **Libera tempo** — cada atividade transferida vira hora livre na semana
- **Padroniza o jeito** — squad executa sempre igual, sem depender do humor do dia
- **Escala sem você** — pode rodar enquanto você dorme ou está em reunião
- **Gera artefato reusável** — outro gestor da Stark adota sem reaprender do zero
- **Memória acumulada** — quanto mais rodar, mais contexto o squad tem de cada cliente

### Aprendizados para mencionar

1. **O processo precisou estar organizado ANTES de automatizar.** O Colab tinha bugs porque o processo em si era bagunçado.
2. **A evidência é essencial.** A pasta `examples/` prova que rodou — sem evidência é só ideia.
3. **O quality-gate foi o que garantiu qualidade.** Sem ele, texto com dado errado chegaria ao cliente.
4. **HTML, não markdown.** O Reportei não renderiza markdown — descobri na primeira execução e corrigi. O squad agora tem isso documentado como pilar.
5. **O insight principal:** igual ao do Gustavo — toda segunda-feira, um comando. O squad analisa, gera o relatório, publica e manda a mensagem. Piloto automático.

---

## RISCOS QUE O ANDERSON AVALIA — Como se Defender

| Risco | Se perguntar... | Sua resposta |
|-------|----------------|--------------|
| Tato humano | "E se o cliente tiver algo sensível?" | As 3 atividades são objetivas: dados e template. Nada subjetivo. |
| Sem critério | "Como você sabe que ficou bom?" | quality-gate com 12 checks em 2 momentos. Mostrar `checklists/qa-relatorio.md`. |
| Automatizar caos | "O processo já funcionava antes?" | Tinha automação no Colab com 12 bugs documentados. Corrigi antes de automatizar. |
| Escopo aberto | "O squad tem fim?" | Entregável claro: planilha preenchida + texto aprovado + marco publicado + WhatsApp pronto. |

---

## FRASE FINAL (se sobrar tempo)

> *"Você só transfere o que entende. Se não descreve a atividade em um parágrafo claro, não está pronta pra transferir."*
>
> — Anderson Silva

Eu descrevi. Automatizei. Funciona.

---

*Atualizado em: 2026-05-21 | Squad: relatorio-semanal | Versão: 2.0*
