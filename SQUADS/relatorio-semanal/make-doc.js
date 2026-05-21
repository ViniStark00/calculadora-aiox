const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
        VerticalAlign, Header, Footer, PageNumber } = require("docx");
const fs = require("fs");

// ── helpers ──────────────────────────────────────────────────────────────────
const COLOR = {
  navy:    "0D1B2A", navyMid: "1B3A6B", accent: "2563EB",
  amber:   "D97706", success: "16A34A", muted: "64748B",
  border:  "CBD5E1", light:   "F0F4FF", white: "FFFFFF",
  red:     "DC2626", teal:    "0891B2", purple: "7C3AED",
};

const b1 = { style: BorderStyle.SINGLE, size: 4, color: COLOR.border };
const borders = { top: b1, bottom: b1, left: b1, right: b1 };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const txt = (text, opts = {}) => new TextRun({ text, font: "Calibri", size: 22, ...opts });
const txtBold = (text, opts = {}) => txt(text, { bold: true, ...opts });

function p(children, opts = {}) {
  return new Paragraph({ children: Array.isArray(children) ? children : [children], ...opts });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Calibri", size: 36, bold: true, color: COLOR.navy })],
    spacing: { before: 360, after: 160 },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Calibri", size: 28, bold: true, color: COLOR.navyMid })],
    spacing: { before: 280, after: 120 },
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: "Calibri", size: 24, bold: true, color: COLOR.accent })],
    spacing: { before: 200, after: 80 },
  });
}

function normal(text, opts = {}) {
  return p(txt(text, { size: 22, ...opts }), { spacing: { after: 120 } });
}

function gap(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ children: [new TextRun("")], spacing: { after: 60 } })
  );
}

function rule() {
  return new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.border, space: 1 } },
    spacing: { before: 120, after: 160 },
  });
}

function cell(children, opts = {}) {
  const { fill, width = 4680, bold = false, color = "1E293B", align = AlignmentType.LEFT } = opts;
  const paras = (typeof children === "string")
    ? [new Paragraph({ alignment: align, children: [new TextRun({ text: children, font: "Calibri", size: 20, bold, color })] })]
    : children;
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: paras,
  });
}

function hdrCell(text, width = 4680) {
  return cell(text, { fill: COLOR.navyMid, bold: true, color: COLOR.white, width, align: AlignmentType.LEFT });
}

function tableSimple(rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map(row =>
      new TableRow({ children: row })
    ),
    spacing: { after: 160 },
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, font: "Calibri", size: 22, ...opts })],
    spacing: { after: 60 },
  });
}

// ── document ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: "bullet", text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }, {
      reference: "nums",
      levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }],
  },
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Calibri", color: COLOR.navy },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Calibri", color: COLOR.navyMid },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri", color: COLOR.accent },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: "Squad relatorio-semanal  ·  Vinicius Lima  ·  Stark Marketing", font: "Calibri", size: 18, color: COLOR.muted })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border, space: 1 } },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "Página ", font: "Calibri", size: 18, color: COLOR.muted }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 18, color: COLOR.muted }),
          ],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border, space: 1 } },
        })],
      }),
    },
    children: [

      // ── CAPA ──────────────────────────────────────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: "SQUAD", font: "Calibri", size: 20, bold: true, color: COLOR.accent, characterSpacing: 240 })],
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "relatorio-semanal", font: "Calibri", size: 52, bold: true, color: COLOR.navy })],
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Documentação de construção, arquitetura e agentes", font: "Calibri", size: 26, color: COLOR.muted })],
        spacing: { after: 80 },
      }),
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.accent, space: 1 } },
        children: [],
        spacing: { before: 80, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Autor: ", font: "Calibri", size: 22, bold: true, color: COLOR.navy }),
          new TextRun({ text: "Vinicius Lima", font: "Calibri", size: 22 }),
          new TextRun({ text: "     Empresa: ", font: "Calibri", size: 22, bold: true, color: COLOR.navy }),
          new TextRun({ text: "Stark Marketing", font: "Calibri", size: 22 }),
        ],
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Data: ", font: "Calibri", size: 22, bold: true, color: COLOR.navy }),
          new TextRun({ text: "Maio 2026", font: "Calibri", size: 22 }),
          new TextRun({ text: "     Versão: ", font: "Calibri", size: 22, bold: true, color: COLOR.navy }),
          new TextRun({ text: "1.0.0  (Plano V2 concluído — Sessão 20)", font: "Calibri", size: 22 }),
        ],
        spacing: { after: 80 },
      }),
      ...gap(2),

      // ── 1. VISÃO GERAL ─────────────────────────────────────────────────────
      h1("1. Visão Geral"),
      normal("O squad relatorio-semanal automatiza três atividades semanais recorrentes do gestor de tráfego pago. Com um único comando, o pipeline busca métricas no Reportei, preenche o Google Sheets, gera o texto narrativo do relatório com validação de qualidade, publica na Linha do Tempo do Reportei e entrega a mensagem de WhatsApp pronta para enviar ao cliente."),
      new Paragraph({
        children: [new TextRun({ text: "Um comando. Pipeline completo.", font: "Calibri", size: 26, bold: true, color: COLOR.amber, italics: true })],
        spacing: { after: 160 },
      }),

      h2("As 3 atividades automatizadas"),
      tableSimple([
        [hdrCell("Atividade", 3120), hdrCell("Antes (manual)", 2880), hdrCell("Depois (squad)", 2400)],
        [cell("Preencher planilha de métricas", { width: 3120 }),
         cell("Abrir Reportei, copiar dado por dado — 20 operações manuais por semana (~45 min)", { width: 2880 }),
         cell("API Reportei v2 → Sheets em ~15 seg, automático", { width: 2400 })],
        [cell("Gerar texto do relatório", { width: 3120 }),
         cell("Escrever narrativa do zero para cada cliente (~30 min/cliente)", { width: 2880 }),
         cell("Redator gera HTML validado pelo quality-gate (~25 seg)", { width: 2400 })],
        [cell("Publicar na Linha do Tempo", { width: 3120 }),
         cell("Entrar no Reportei e criar marco manualmente (~10 min/cliente)", { width: 2880 }),
         cell("MCP create_timeline_event em ~5 seg, automático", { width: 2400 })],
      ], [3120, 2880, 2400]),
      ...gap(1),

      h2("Métricas de ganho"),
      tableSimple([
        [hdrCell("Cenário", 2800), hdrCell("Antes", 2000), hdrCell("Depois", 2000), hdrCell("Ganho", 1600)],
        [cell("1 cliente / semana", { width: 2800 }), cell("~85 min", { width: 2000 }), cell("~2 min", { width: 2000 }), cell("~83 min livres", { width: 1600, bold: true, color: COLOR.success })],
        [cell("4 clientes / semana", { width: 2800 }), cell("~340 min (~5,5h)", { width: 2000 }), cell("~8 min", { width: 2000 }), cell("~5h livres", { width: 1600, bold: true, color: COLOR.success })],
        [cell("4 clientes / mês", { width: 2800 }), cell("~22h", { width: 2000 }), cell("~35 min", { width: 2000 }), cell("~21h livres", { width: 1600, bold: true, color: COLOR.success })],
      ], [2800, 2000, 2000, 1600]),
      ...gap(2),

      // ── 2. HISTÓRICO DE CONSTRUÇÃO ────────────────────────────────────────
      h1("2. Histórico de Construção"),
      normal("O squad foi construído ao longo de 20 sessões divididas em três grandes fases, cada uma concluída com commits e pull requests no repositório GitHub."),

      h2("Fase 1 — Squad inicial (Sessões 1 a 5)"),
      normal("Criação da estrutura completa do squad: PRD, branch, design com o Squad Creator, geração dos agentes e templates, e primeiro teste com caso real."),

      tableSimple([
        [hdrCell("Commit / PR", 2400), hdrCell("O que foi feito", 6000)],
        [cell("612a24c / 838a707", { width: 2400 }), cell("Squad criado pelo Squad Creator — estrutura completa: agents/, tasks/, workflows/, templates/, checklists/, config/", { width: 6000 })],
        [cell("PR #2 — merge", { width: 2400 }), cell("Validação com *validate-squad: VALID, 0 erros, 0 warnings. Primeiro merge na main.", { width: 6000 })],
        [cell("aaa4ecb", { width: 2400 }), cell("Checkpoint pré-correção — pipeline testado nas sessões 5 e 6, descoberta do bug de formatação", { width: 6000 })],
      ], [2400, 6000]),

      h2("Fase 2 — Correções e consolidação (Sessões 6 a 10)"),
      normal("Correção do bug crítico de formatação HTML, reescrita dos templates, testes reais com clientes IMCP e Destra, e consolidação do pipeline ponta a ponta."),

      tableSimple([
        [hdrCell("Commit", 2400), hdrCell("O que foi feito", 6000)],
        [cell("f06d237", { width: 2400 }), cell("Fix: formatação HTML na publicação da Timeline — descoberto que o Reportei não renderiza Markdown", { width: 6000 })],
        [cell("1ae2c73 / 7343bb7", { width: 2400 }), cell("Style: templates reescritos em HTML puro. Padrão visual com <br> entre blocos documentado como pilar inviolável", { width: 6000 })],
        [cell("f17ba94", { width: 2400 }), cell("Fix: aprendizado crítico registrado no squad — nunca usar Markdown para o conteúdo da Timeline", { width: 6000 })],
        [cell("0d5d4ed / 8f8f4c2", { width: 2400 }), cell("Republicação de 3 eventos reais (IMCP). APRESENTACAO.md criado com roteiro completo de 30 min", { width: 6000 })],
        [cell("PR #5 — merge", { width: 2400 }), cell("Squad concluído — merge na main. Pipeline rodando ponta a ponta sem intervenção humana", { width: 6000 })],
      ], [2400, 6000]),

      h2("Fase 3 — Melhorias incrementais (Sessões 11 a 15)"),
      normal("Quatro melhorias adicionadas após o squad já estar funcional, cada uma entregue como commit separado."),

      tableSimple([
        [hdrCell("Commit", 2400), hdrCell("Melhoria entregue", 6000)],
        [cell("3b020f9", { width: 2400 }), cell("Melhoria 1: Hooks de determinismo — validate-outputs.py e log-timeline-event.py (auditoria automática)", { width: 6000 })],
        [cell("54abc27", { width: 2400 }), cell("Melhoria 2: whatsapp-writer — mensagem formatada com métricas e link do relatório, pronta para copiar", { width: 6000 })],
        [cell("785becc", { width: 2400 }), cell("Melhoria 3: Histórico por cliente — data/historico-clientes.yaml, redator compara com últimas 4 semanas", { width: 6000 })],
        [cell("75ca54b", { width: 2400 }), cell("Melhoria 4: Thresholds de especialidade — CPL classificado por faixa (saudável / atenção / crítico) por tipo de médico", { width: 6000 })],
        [cell("PR #6 — merge", { width: 2400 }), cell("Merge das 4 melhorias. Squad v1 completo com todas as camadas de inteligência", { width: 6000 })],
      ], [2400, 6000]),

      h2("Fase 4 — Plano V2: contextos dinâmicos (Sessões 16 a 20)"),
      normal("Expansão do squad com memória por cliente no Drive, monitor diário de alertas, integração ClickUp e histórico cumulativo."),

      tableSimple([
        [hdrCell("Commit", 2400), hdrCell("Entrega", 6000)],
        [cell("c169faf", { width: 2400 }), cell("V2 etapas 1-4: thresholds para 5 especialidades médicas + save-history integrado no pipeline", { width: 6000 })],
        [cell("f488ee7", { width: 2400 }), cell("Etapa 5B: agente contexto-cliente — documento por cliente no Google Drive com perfil, momentos comerciais e aprendizados", { width: 6000 })],
        [cell("a8fc34c", { width: 2400 }), cell("Etapa 5B parte 2: redator e pipeline atualizados para consumir o contexto do Drive dinamicamente", { width: 6000 })],
        [cell("0028928", { width: 2400 }), cell("Etapas 6-10: monitor-diario e monitor-tarefas-clickup criados. Pipeline integrado com ClickUp para marcar tarefas como concluídas", { width: 6000 })],
        [cell("33f7a24", { width: 2400 }), cell("Etapas 11-13: validate-squad, QA gate e squad.yaml corrigido com todos os arquivos novos", { width: 6000 })],
        [cell("PR #7 — merge", { width: 2400 }), cell("Plano V2 concluído. Squad com 9 agentes, 3 MCPs e pipeline de contexto acumulativo por cliente", { width: 6000 })],
      ], [2400, 6000]),
      ...gap(2),

      // ── 3. ARQUITETURA ────────────────────────────────────────────────────
      h1("3. Arquitetura do Squad"),

      h2("Estrutura de pastas"),
      new Paragraph({
        children: [new TextRun({
          text: [
            "squads/relatorio-semanal/",
            "├── CLAUDE.md                  ← Briefing: voz, regras fixas, restrições",
            "├── squad.yaml                 ← Manifesto: agentes, tasks, workflows, integrações",
            "├── agents/                    ← 9 agentes (ver seção 4)",
            "├── tasks/                     ← fetch-metrics, verify-fill, generate-report, validate-report,",
            "│                                 publish-timeline, save-history",
            "├── workflows/                 ← weekly-report-pipeline, daily-monitor-pipeline",
            "├── templates/                 ← relatorio-template (HTML), whatsapp-template, contexto-cliente-template",
            "├── checklists/                ← qa-relatorio (19 checks em 2 blocos)",
            "├── config/                    ← clientes-config.yaml (project_id, colunas, especialidade, manual_map)",
            "├── data/                      ← historico-clientes.yaml, thresholds-especialidade.yaml",
            "├── hooks/                     ← validate-outputs.py, log-timeline-event.py",
            "└── examples/                  ← outputs reais (imcp-2026-05-17-v2.md, destra-2026-05-04.md…)",
          ].join("\n"),
          font: "Courier New", size: 18, color: COLOR.navy,
        })],
        spacing: { after: 200 },
      }),

      h2("Integrações"),
      tableSimple([
        [hdrCell("Sistema", 2200), hdrCell("Tipo", 1800), hdrCell("Para que serve", 4400)],
        [cell("Reportei API v2", { width: 2200 }), cell("HTTP REST / Bearer Token", { width: 1800 }), cell("Buscar métricas de cada projeto (Meta Ads, Google Ads, Instagram, WhatsApp, Conversões)", { width: 4400 })],
        [cell("Google Sheets API", { width: 2200 }), cell("Service Account", { width: 1800 }), cell("Preencher colunas C/E/H/K/O na aba da semana, bloco do gestor Vinicius", { width: 4400 })],
        [cell("MCP Reportei", { width: 2200 }), cell("MCP (mcp__30ebe978…)", { width: 1800 }), cell("Publicar marcos na Timeline, buscar CPL/CPC/cliques/impressões complementares", { width: 4400 })],
        [cell("MCP Google Drive", { width: 2200 }), cell("MCP (mcp__92a31705…)", { width: 1800 }), cell("Ler e atualizar documentos de contexto por cliente (perfil, aprendizados, momentos comerciais)", { width: 4400 })],
        [cell("MCP ClickUp", { width: 2200 }), cell("MCP (mcp__2d24fa11…)", { width: 1800 }), cell("Marcar tarefas semanais do cliente como concluídas ao final do pipeline", { width: 4400 })],
      ], [2200, 1800, 4400]),
      ...gap(2),

      // ── 4. OS 9 AGENTES ──────────────────────────────────────────────────
      h1("4. Os 9 Agentes"),
      normal("Cada agente tem uma função única e bem delimitada. O pipeline é orquestrado pelo relatorio-chief, que decide a sequência e passa o contexto entre os agentes via handoff."),

      // relatorio-chief
      h3("1. relatorio-chief — Orquestrador (Tier 0)"),
      normal("Ponto de entrada do squad. Recebe o comando do usuário, resolve o nome do cliente no clientes-config.yaml, calcula o período da semana anterior (segunda a domingo), e aciona todos os demais agentes na sequência correta. Trata erros de cada etapa e exibe o resumo final com o status de cada passo."),
      new Paragraph({
        children: [
          txtBold("Ativa com: "),
          txt("Rodar pipeline para [NOME DO CLIENTE]"),
        ],
        spacing: { after: 60 },
      }),
      new Paragraph({
        children: [
          txtBold("Saída: "),
          txt("Resumo com checklist de todos os passos (✅ ou ⚠️) + tempo total de execução"),
        ],
        spacing: { after: 160 },
      }),

      // contexto-cliente
      h3("2. contexto-cliente — Memória por Cliente (Tier 0)"),
      normal("Opera em dois momentos: (1) no início do pipeline, busca o documento \"Contexto — [CLIENTE]\" no Google Drive e entrega um objeto com perfil, momentos comerciais, pontos de atenção e aprendizados das últimas 8 semanas; (2) no final do pipeline, registra os aprendizados da semana atual. Completamente não-bloqueante — se o Drive estiver indisponível, o pipeline continua sem contexto."),
      new Paragraph({
        children: [
          txtBold("MCP: "),
          txt("Google Drive (search_files, read_file_content, create_file)"),
        ],
        spacing: { after: 160 },
      }),

      // coletor
      h3("3. coletor — Coleta de Métricas (Tier 1)"),
      normal("Chama a API Reportei v2 com paginação completa, casa os nomes dos projetos usando o manual_map do config (tratando variações como \"Dr. Alvaro\" vs \"Dr. Álvaro\"), e escreve as métricas nas colunas corretas da planilha Google Sheets. Registra exceções conhecidas (ex: Dr. Javier com custo em ARS) sem gerar erro. Após coleta bem-sucedida, aciona o save-history para persistir o histórico."),
      tableSimple([
        [hdrCell("Coluna", 1600), hdrCell("Métrica coletada", 6800)],
        [cell("C", { width: 1600 }), cell("Meta Ads Spend — investimento semanal em R$", { width: 6800 })],
        [cell("E", { width: 1600 }), cell("Google Ads Spend — investimento semanal em R$", { width: 6800 })],
        [cell("H", { width: 1600 }), cell("Novos seguidores no Instagram (ig:new_followers_count)", { width: 6800 })],
        [cell("K", { width: 1600 }), cell("Conversas WhatsApp iniciadas (messaging_conversation_started_7d)", { width: 6800 })],
        [cell("O", { width: 1600 }), cell("Conversões (Google Ads ou evento configurado)", { width: 6800 })],
      ], [1600, 6800]),

      // quality-gate
      h3("4. quality-gate — Validador de Qualidade (Tier 3)"),
      normal("Age em dois momentos distintos do pipeline com checklists objetivos diferentes:"),
      bullet("verify-fill (pós-coleta): confere se todos os clientes do bloco foram processados, se não há células vazias sem justificativa e se os valores fazem sentido (zero sem motivo = reprovado)."),
      bullet("validate-report (pós-redação): verifica se o texto contém datas no formato DD/MM/AAAA, valores em R$, nome do cliente, análise real, ausência de palavras proibidas, mínimo de 3 parágrafos, nenhum placeholder não substituído e tom neutro."),
      new Paragraph({ children: [txt("")], spacing: { after: 120 } }),
      normal("Se reprovado, interrompe o pipeline e informa o motivo exato. Se aprovado, exibe a lista de checks com ✅."),

      // redator
      h3("5. redator — Geração de Relatório (Tier 1)"),
      normal("Recebe as métricas coletadas, busca dados complementares via MCP Reportei (CPL, CPC, cliques, impressões, variação semana anterior), compara com o histórico das últimas 4 semanas e gera o texto narrativo do relatório em HTML válido. Adapta automaticamente a estrutura conforme as plataformas ativas (Meta-only, Google-only ou Meta+Google). Incorpora o contexto do cliente vindo do Drive de forma fluida no texto, sem citar o sistema de memória."),
      bullet("Tom: neutro e informativo. Sem elogios exagerados nem críticas pesadas."),
      bullet("Formato: HTML obrigatório (<p>, <strong>, <br>) — Reportei não renderiza Markdown."),
      bullet("Histórico: compara CPL atual com média das últimas 4 semanas e insere variação no parágrafo narrativo."),
      bullet("Threshold: classifica CPL por especialidade médica (saudável / atenção / crítico) sem expor os termos internos."),
      new Paragraph({ children: [txt("")], spacing: { after: 120 } }),

      // publicador
      h3("6. publicador — Publicação na Timeline (Tier 1)"),
      normal("Recebe o texto aprovado pelo quality-gate e o project_id do cliente, e chama o MCP create_timeline_event para publicar o relatório como marco na Linha do Tempo do Reportei. Retorna o ID do evento criado para que o relatorio-chief inclua no resumo final. Se o project_id não estiver no config, usa list_projects para encontrar pelo nome."),

      // whatsapp-writer
      h3("7. whatsapp-writer — Mensagem WhatsApp (Tier 1)"),
      normal("Após a publicação, gera a mensagem de WhatsApp formatada com emojis, negrito e o link do relatório — pronta para copiar e enviar ao cliente. Seleciona o template correto conforme as plataformas ativas (Meta-only, Google-only ou Meta+Google) e escolhe o highlight da semana seguindo uma hierarquia de prioridade: CPL eficiente > volume de conversas > conversões Google > investimento total."),

      // monitor-tarefas-clickup
      h3("8. monitor-tarefas-clickup — Integração ClickUp (Tier 1)"),
      normal("Ao final do pipeline, recebe do relatorio-chief a lista de atividades concluídas (planilha, relatório, timeline, status_report) e marca as tarefas correspondentes como concluídas no ClickUp. Usa busca parcial de nome para encontrar as tarefas do cliente. Completamente não-bloqueante — se o ClickUp estiver indisponível, apenas registra o aviso e o pipeline encerra normalmente."),

      // monitor-diario
      h3("9. monitor-diario — Painel de Alertas Diário (Tier 0)"),
      normal("Agente independente do pipeline semanal. Quando ativado com \"Rodar monitor diário\", varre toda a carteira do gestor Vinicius, calcula o CPL de cada cliente nos últimos 7 dias e classifica por nível de alerta com base nos thresholds de especialidade. Exibe um painel consolidado com código de cores."),
      tableSimple([
        [hdrCell("Nível", 1800), hdrCell("Critério", 5600)],
        [cell("🔴 CRÍTICO", { width: 1800, bold: true, color: COLOR.red }), cell("CPL acima do limite crítico da especialidade — requer ação imediata", { width: 5600 })],
        [cell("🟡 ATENÇÃO", { width: 1800, bold: true, color: COLOR.amber }), cell("CPL acima da faixa saudável mas abaixo do crítico — monitorar", { width: 5600 })],
        [cell("🟢 OK", { width: 1800, bold: true, color: COLOR.success }), cell("CPL dentro da faixa saudável para a especialidade", { width: 5600 })],
        [cell("⚪ SEM DADOS", { width: 1800 }), cell("Projeto não encontrado no Reportei ou MCP indisponível", { width: 5600 })],
      ], [1800, 5600]),
      ...gap(2),

      // ── 5. O PIPELINE ────────────────────────────────────────────────────
      h1("5. O Pipeline Semanal"),

      h2("Fluxo de execução"),
      new Paragraph({
        children: [new TextRun({
          text: [
            "relatorio-chief (recebe comando)",
            "    │",
            "    ├─► contexto-cliente: carregar-contexto (Drive)",
            "    │",
            "    ├─► coletor: fetch-metrics (API Reportei → Sheets)",
            "    │       └─► save-history (salva no histórico local)",
            "    │",
            "    ├─► quality-gate: verify-fill (4 checks nos dados)",
            "    │       └─ SE REPROVADO → interrompe e informa",
            "    │",
            "    ├─► redator: generate-report (gera HTML)",
            "    │",
            "    ├─► quality-gate: validate-report (8 checks no texto)",
            "    │       └─ SE REPROVADO → interrompe e informa",
            "    │",
            "    ├─► publicador: publish-timeline (MCP → Timeline Reportei)",
            "    │",
            "    ├─► whatsapp-writer: format-whatsapp (mensagem pronta)",
            "    │",
            "    ├─► monitor-tarefas-clickup: marcar-tarefas-concluidas",
            "    │",
            "    └─► contexto-cliente: atualizar-contexto (Drive)",
            "            └─► resumo final com status de cada etapa",
          ].join("\n"),
          font: "Courier New", size: 18, color: COLOR.navy,
        })],
        spacing: { after: 200 },
      }),

      h2("Estimativa de tempo"),
      tableSimple([
        [hdrCell("Etapa", 4000), hdrCell("Tempo", 2400), hdrCell("Observação", 2000)],
        [cell("Carregar contexto do Drive", { width: 4000 }), cell("~5 seg", { width: 2400 }), cell("Não-bloqueante", { width: 2000 })],
        [cell("Coletar métricas (API Reportei)", { width: 4000 }), cell("~15–30 seg", { width: 2400 }), cell("Depende de paginação", { width: 2000 })],
        [cell("Validar coleta (quality-gate)", { width: 4000 }), cell("~3 seg", { width: 2400 }), cell("", { width: 2000 })],
        [cell("Gerar texto do relatório", { width: 4000 }), cell("~20–30 seg", { width: 2400 }), cell("Inclui consulta ao MCP", { width: 2000 })],
        [cell("Validar texto (quality-gate)", { width: 4000 }), cell("~3 seg", { width: 2400 }), cell("", { width: 2000 })],
        [cell("Publicar na Timeline", { width: 4000 }), cell("~5 seg", { width: 2400 }), cell("", { width: 2000 })],
        [cell("Formatar WhatsApp", { width: 4000 }), cell("~5 seg", { width: 2400 }), cell("", { width: 2000 })],
        [cell("Marcar ClickUp + atualizar Drive", { width: 4000 }), cell("~10 seg", { width: 2400 }), cell("Não-bloqueantes", { width: 2000 })],
        [cell("TOTAL por cliente", { width: 4000, bold: true }), cell("~1–2 min", { width: 2400, bold: true, color: COLOR.success }), cell("vs ~85 min manual", { width: 2000, bold: true, color: COLOR.red })],
      ], [4000, 2400, 2000]),
      ...gap(2),

      // ── 6. APRENDIZADOS ──────────────────────────────────────────────────
      h1("6. Aprendizados da Construção"),
      normal("Os principais aprendizados acumulados ao longo das 20 sessões de desenvolvimento:"),

      h2("Técnicos"),
      bullet("O Reportei não renderiza Markdown — o conteúdo da Timeline deve ser HTML válido. Descoberto na sessão 6 após o primeiro teste real. Todo o squad foi reescrito para usar <p>, <strong> e <br>."),
      bullet("A slug do Google Ads na API Reportei é 'google_adwords', não 'google_ads' — erro que causava coluna E sempre zerada."),
      bullet("O custo do Google Ads vem em R$ direto — não divide por 1.000.000 (diferente de outras plataformas)."),
      bullet("A seguidores usa match exato: ref == 'ig:new_followers_count'. Qualquer variação retorna null."),
      bullet("Hooks de determinismo (validate-outputs.py, log-timeline-event.py) garantem rastreabilidade sem depender da memória do agente."),

      h2("De processo"),
      bullet("O processo precisa estar organizado ANTES de automatizar. A automação anterior no Colab tinha bugs porque o processo em si era bagunçado."),
      bullet("Agente que pede informação no meio da execução = falta de contexto. Corrigir o briefing, não o agente."),
      bullet("A pasta examples/ é essencial — é o Elemento 5 da anatomia AIOX (evidência). Sem output real salvo, é só ideia."),
      bullet("O quality-gate foi o diferencial. Sem ele, texto com dado errado chegaria ao cliente."),
      bullet("Commits semânticos (feat, fix, docs, chore, style) facilitaram revisar o histórico e entender o que mudou em cada sessão."),

      h2("De arquitetura"),
      bullet("Agentes não-bloqueantes (contexto-cliente, monitor-tarefas-clickup) são críticos para resiliência. O pipeline não pode parar por uma dependência externa."),
      bullet("O manual_map no config é a peça que torna o squad multi-cliente sem configuração manual a cada execução."),
      bullet("Separar thresholds em data/thresholds-especialidade.yaml permite ajustar benchmarks sem tocar em nenhum agente."),
      bullet("O plano V2 (contexto dinâmico por cliente no Drive) foi a evolução natural: primeiro automatizar, depois personalizar."),
      ...gap(2),

      // ── 7. REFERÊNCIAS ────────────────────────────────────────────────────
      h1("7. Referências"),

      tableSimple([
        [hdrCell("Arquivo", 3600), hdrCell("Para que serve", 4800)],
        [cell("squads/relatorio-semanal/CLAUDE.md", { width: 3600 }), cell("Briefing do squad — voz, regras fixas, variáveis de ambiente, restrições", { width: 4800 })],
        [cell("squads/relatorio-semanal/CONTEXT.md", { width: 3600 }), cell("Estado atual do projeto — carregado no início de cada sessão para dar continuidade", { width: 4800 })],
        [cell("squads/relatorio-semanal/squad.yaml", { width: 3600 }), cell("Manifesto: lista de agentes, tasks, workflows, templates e integrações", { width: 4800 })],
        [cell("config/clientes-config.yaml", { width: 3600 }), cell("project_id, sheet_id, colunas, manual_map e especialidade por cliente", { width: 4800 })],
        [cell("data/thresholds-especialidade.yaml", { width: 3600 }), cell("Benchmarks de CPL por especialidade médica (5 especialidades configuradas)", { width: 4800 })],
        [cell("data/historico-clientes.yaml", { width: 3600 }), cell("Histórico semanal de métricas por cliente — base para comparação do redator", { width: 4800 })],
        [cell("examples/imcp-2026-05-17-v2.md", { width: 3600 }), cell("Output real do pipeline — evidência de que o squad rodou ponta a ponta", { width: 4800 })],
        [cell("checklists/qa-relatorio.md", { width: 3600 }), cell("19 checks divididos em Bloco A (dados) e Bloco B (texto) usados pelo quality-gate", { width: 4800 })],
      ], [3600, 4800]),
      ...gap(1),
      rule(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Squad relatorio-semanal  ·  Vinicius Lima  ·  Stark Marketing  ·  Maio 2026", font: "Calibri", size: 18, color: COLOR.muted })],
        spacing: { after: 0 },
      }),

    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:/Users/Usuario/Desktop/Claude_Stark/squads/relatorio-semanal/squad-documentacao.docx", buffer);
  console.log("OK");
});
