const pptxgen = require("pptxgenjs");

async function run() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Squad relatorio-semanal";
  pres.author = "Vinicius Lima";

  const C = {
    navyDark: "0D1B2A", navyMid: "1B3A6B", accent: "3B9EFF",
    amber: "F59E0B", white: "FFFFFF", lightBg: "F4F7FF",
    cardBg: "FFFFFF", textDark: "1E293B", textMuted: "64748B",
    success: "22C55E", border: "E2E8F0", red: "EF4444",
  };

  const mkShadow = () => ({ type: "outer", color: "000000", opacity: 0.08, blur: 8, offset: 2, angle: 135 });

  function hdr(sl, title, ac) {
    sl.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:10,h:0.7, fill:{color:C.navyDark}, line:{color:C.navyDark} });
    sl.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:0.25,h:0.7, fill:{color:ac||C.accent}, line:{color:ac||C.accent} });
    sl.addText(title, { x:0.45,y:0,w:9.3,h:0.7, fontSize:20,fontFace:"Calibri",color:C.white,bold:true,valign:"middle",margin:0 });
  }
  function ftr(sl, text) {
    sl.addShape(pres.shapes.RECTANGLE, { x:0,y:5.175,w:10,h:0.45, fill:{color:C.navyDark}, line:{color:C.navyDark} });
    sl.addText(text, { x:0.4,y:5.175,w:9.2,h:0.45, fontSize:12,fontFace:"Calibri",color:C.white,valign:"middle",margin:0 });
  }

  // ── SLIDE 1 ──────────────────────────────────────────────────────
  {
    const sl = pres.addSlide();
    sl.background = { color: C.navyDark };
    sl.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:0.25,h:5.625, fill:{color:C.accent}, line:{color:C.accent} });
    sl.addShape(pres.shapes.RECTANGLE, { x:7.6,y:0,w:2.1,h:5.625, fill:{color:C.navyMid}, line:{color:C.navyMid} });
    sl.addShape(pres.shapes.RECTANGLE, { x:9.7,y:0,w:0.3,h:5.625, fill:{color:C.amber}, line:{color:C.amber} });

    sl.addText("SQUAD", { x:0.55,y:0.9,w:6.8,h:0.35, fontSize:11,fontFace:"Calibri",color:C.accent,bold:true,charSpacing:8,margin:0 });
    sl.addText("relatorio-semanal", { x:0.55,y:1.25,w:6.8,h:0.9, fontSize:44,fontFace:"Calibri",color:C.white,bold:true,margin:0 });
    sl.addShape(pres.shapes.LINE, { x:0.55,y:2.3,w:5.5,h:0, line:{color:C.accent,width:1.5} });
    sl.addText("Automação do ciclo semanal de relatórios de tráfego pago", { x:0.55,y:2.45,w:6.8,h:0.55, fontSize:16,fontFace:"Calibri",color:"CADCFC",margin:0 });
    sl.addText("Um comando. Pipeline completo.", { x:0.55,y:3.15,w:6.8,h:0.45, fontSize:18,fontFace:"Calibri",color:C.amber,bold:true,italic:true,margin:0 });
    sl.addText("Vinicius Lima  ·  Stark Marketing  ·  2026", { x:0.55,y:5.1,w:7,h:0.3, fontSize:11,fontFace:"Calibri",color:"475569",margin:0 });

    sl.addText("9", { x:7.65,y:1.0,w:1.9,h:0.8, fontSize:60,fontFace:"Calibri",color:C.amber,bold:true,align:"center",margin:0 });
    sl.addText("agentes", { x:7.65,y:1.8,w:1.9,h:0.3, fontSize:13,fontFace:"Calibri",color:"CADCFC",align:"center",margin:0 });
    sl.addShape(pres.shapes.LINE, { x:7.85,y:2.2,w:1.5,h:0, line:{color:"2A5298",width:1} });
    sl.addText("3", { x:7.65,y:2.35,w:1.9,h:0.65, fontSize:46,fontFace:"Calibri",color:C.accent,bold:true,align:"center",margin:0 });
    sl.addText("atividades automatizadas", { x:7.65,y:3.0,w:1.9,h:0.45, fontSize:11,fontFace:"Calibri",color:"CADCFC",align:"center",margin:0 });
    sl.addShape(pres.shapes.LINE, { x:7.85,y:3.55,w:1.5,h:0, line:{color:"2A5298",width:1} });
    sl.addText("~5h", { x:7.65,y:3.7,w:1.9,h:0.6, fontSize:36,fontFace:"Calibri",color:C.success,bold:true,align:"center",margin:0 });
    sl.addText("livres por semana", { x:7.65,y:4.32,w:1.9,h:0.4, fontSize:11,fontFace:"Calibri",color:"CADCFC",align:"center",margin:0 });
  }

  // ── SLIDE 2 ──────────────────────────────────────────────────────
  {
    const sl = pres.addSlide();
    sl.background = { color: C.lightBg };
    hdr(sl, "O PROBLEMA", C.accent);
    sl.addText("Antes: quase 5h por semana em trabalho 100% operacional", { x:0.4,y:0.82,w:9.2,h:0.38, fontSize:14,fontFace:"Calibri",color:C.textMuted,margin:0 });

    const cards = [
      { x:0.35, title:"Preencher Planilha", time:"45 min", unit:"por semana", desc:"Copiar dado por dado no Sheets — 5 colunas × 4 clientes = 20 operações manuais", pain:"Automação no Colab com bugs" },
      { x:3.6,  title:"Gerar Texto do Relatório", time:"30 min", unit:"por cliente", desc:"Escrever narrativa do zero para cada cliente toda semana, sem padrão garantido", pain:"Qualidade variava com o cansaço" },
      { x:6.85, title:"Publicar no Reportei", time:"10 min", unit:"por cliente", desc:"Entrar no Reportei e criar o marco na Linha do Tempo para cada cliente", pain:"Esquecida com frequência" },
    ];

    cards.forEach(c => {
      sl.addShape(pres.shapes.RECTANGLE, { x:c.x,y:1.3,w:3.0,h:3.65, fill:{color:C.cardBg}, shadow:mkShadow(), line:{color:C.border,width:0.5} });
      sl.addShape(pres.shapes.RECTANGLE, { x:c.x,y:1.3,w:3.0,h:0.07, fill:{color:C.navyDark}, line:{color:C.navyDark} });
      sl.addText(c.title, { x:c.x+0.15,y:1.45,w:2.7,h:0.52, fontSize:14,fontFace:"Calibri",color:C.textDark,bold:true,margin:0 });
      sl.addText(c.time, { x:c.x+0.15,y:2.0,w:2.7,h:0.65, fontSize:44,fontFace:"Calibri",color:C.amber,bold:true,margin:0 });
      sl.addText(c.unit, { x:c.x+0.15,y:2.65,w:2.7,h:0.28, fontSize:11,fontFace:"Calibri",color:C.textMuted,margin:0 });
      sl.addShape(pres.shapes.LINE, { x:c.x+0.15,y:3.0,w:2.7,h:0, line:{color:C.border,width:0.75} });
      sl.addText(c.desc, { x:c.x+0.15,y:3.08,w:2.7,h:0.65, fontSize:11,fontFace:"Calibri",color:C.textMuted,margin:0 });
      sl.addShape(pres.shapes.RECTANGLE, { x:c.x+0.15,y:3.82,w:2.7,h:0.45, fill:{color:"FEF3C7"}, line:{color:"FDE68A",width:0.5} });
      sl.addText("! " + c.pain, { x:c.x+0.22,y:3.82,w:2.6,h:0.45, fontSize:10,fontFace:"Calibri",color:"92400E",valign:"middle",margin:0 });
    });

    ftr(sl, "Com 4 clientes → ~5h/semana em trabalho operacional puro. Toda semana, sem exceção.");
  }

  // ── SLIDE 3 ──────────────────────────────────────────────────────
  {
    const sl = pres.addSlide();
    sl.background = { color: C.lightBg };
    hdr(sl, "OS 9 AGENTES", C.accent);

    const tC = {
      "Orquestrador":{ bg:"1B3A6B", tx:"FFFFFF" },
      "Executor":    { bg:"0891B2", tx:"FFFFFF" },
      "Validador":   { bg:"7C3AED", tx:"FFFFFF" },
      "Memória":     { bg:"059669", tx:"FFFFFF" },
      "Painel":      { bg:"D97706", tx:"FFFFFF" },
    };

    const agents = [
      { name:"relatorio-chief",  type:"Orquestrador", desc:"Controla o fluxo completo do pipeline" },
      { name:"coletor",          type:"Executor",     desc:"API Reportei → Google Sheets (5 colunas)" },
      { name:"quality-gate",     type:"Validador",    desc:"Valida dados (4 checks) e texto (8 checks)" },
      { name:"redator",          type:"Executor",     desc:"Gera narrativa HTML com análise histórica" },
      { name:"publicador",       type:"Executor",     desc:"Publica na Timeline do Reportei via MCP" },
      { name:"whatsapp-writer",  type:"Executor",     desc:"Mensagem de WhatsApp pronta para enviar" },
      { name:"contexto-cliente", type:"Memória",      desc:"Perfil e aprendizados do cliente no Drive" },
      { name:"monitor-diario",   type:"Painel",       desc:"Alerta CPL por threshold — carteira completa" },
      { name:"monitor-tarefas",  type:"Executor",     desc:"Marca tarefas concluídas no ClickUp" },
    ];

    const colX = [0.35, 3.55, 6.75];
    const rowY = [0.85, 2.22, 3.59];
    const cW = 3.0, cH = 1.28;

    agents.forEach((a, i) => {
      const x = colX[i%3], y = rowY[Math.floor(i/3)];
      const t = tC[a.type];
      sl.addShape(pres.shapes.RECTANGLE, { x,y,w:cW,h:cH, fill:{color:C.cardBg}, shadow:mkShadow(), line:{color:C.border,width:0.5} });
      sl.addShape(pres.shapes.RECTANGLE, { x,y,w:0.06,h:cH, fill:{color:t.bg}, line:{color:t.bg} });
      sl.addShape(pres.shapes.RECTANGLE, { x:x+0.15,y:y+0.12,w:1.05,h:0.22, fill:{color:t.bg}, line:{color:t.bg} });
      sl.addText(a.type.toUpperCase(), { x:x+0.15,y:y+0.12,w:1.05,h:0.22, fontSize:7,fontFace:"Calibri",color:t.tx,bold:true,align:"center",valign:"middle",charSpacing:2,margin:0 });
      sl.addText(a.name, { x:x+0.15,y:y+0.39,w:cW-0.25,h:0.38, fontSize:13,fontFace:"Calibri",color:C.textDark,bold:true,margin:0 });
      sl.addText(a.desc, { x:x+0.15,y:y+0.78,w:cW-0.25,h:0.42, fontSize:10,fontFace:"Calibri",color:C.textMuted,margin:0 });
    });

    sl.addShape(pres.shapes.RECTANGLE, { x:0,y:4.97,w:10,h:0.655, fill:{color:C.navyDark}, line:{color:C.navyDark} });
    sl.addText([
      { text:"1 orquestrador", options:{color:C.accent,bold:true} },
      { text:"  ·  5 executores", options:{color:"CADCFC"} },
      { text:"  ·  1 validador",  options:{color:"A78BFA"} },
      { text:"  ·  1 memória",    options:{color:"34D399"} },
      { text:"  ·  1 painel",     options:{color:"FCD34D"} },
    ], { x:0.4,y:4.97,w:9.2,h:0.655, fontSize:12,fontFace:"Calibri",valign:"middle",margin:0 });
  }

  // ── SLIDE 4 ──────────────────────────────────────────────────────
  {
    const sl = pres.addSlide();
    sl.background = { color: C.navyDark };
    sl.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:0.25,h:5.625, fill:{color:C.accent}, line:{color:C.accent} });

    sl.addText("O PIPELINE", { x:0.45,y:0.22,w:9.2,h:0.35, fontSize:11,fontFace:"Calibri",color:C.accent,bold:true,charSpacing:6,margin:0 });
    sl.addText("Um comando. Resultado completo.", { x:0.45,y:0.55,w:8,h:0.5, fontSize:24,fontFace:"Calibri",color:C.white,bold:true,margin:0 });

    sl.addShape(pres.shapes.RECTANGLE, { x:0.45,y:1.2,w:6.5,h:0.48, fill:{color:"0F3460"}, line:{color:C.accent,width:1} });
    sl.addText("> Rodar pipeline para [CLIENTE]", { x:0.6,y:1.2,w:6.3,h:0.48, fontSize:13,fontFace:"Consolas",color:"7DD3FC",valign:"middle",margin:0 });

    // Steps: 4 cols × 2 rows
    // stepW=2.1, gap=0.175 → col positions: 0.45, 2.725, 5.0, 7.275 (end=9.375 ok)
    const sW=2.1, sH=0.58, gX=0.175, sX0=0.45;
    const stepRows = [
      [
        { label:"relatorio-chief", note:"Carrega config e calcula período", color:"3B9EFF" },
        { label:"coletor",         note:"API Reportei → Google Sheets",     color:"60C0E0" },
        { label:"quality-gate",    note:"4 checks nos dados coletados",      color:"A78BFA" },
        { label:"redator",         note:"Gera narrativa HTML",               color:"60C0E0" },
      ],
      [
        { label:"quality-gate",    note:"8 checks no texto gerado",          color:"A78BFA" },
        { label:"publicador",      note:"Marco na Timeline do Reportei",     color:"60C0E0" },
        { label:"whatsapp-writer", note:"Mensagem pronta para o cliente",    color:"60C0E0" },
        { label:"contexto-cliente",note:"Atualiza aprendizados no Drive",    color:"34D399" },
      ],
    ];
    const rowYs = [2.0, 3.0];

    stepRows.forEach((row, ri) => {
      const y = rowYs[ri];
      row.forEach((step, ci) => {
        const x = sX0 + ci*(sW+gX);
        sl.addShape(pres.shapes.RECTANGLE, { x,y,w:sW,h:sH, fill:{color:"1B3A6B"}, line:{color:step.color,width:1} });
        sl.addShape(pres.shapes.RECTANGLE, { x,y,w:0.06,h:sH, fill:{color:step.color}, line:{color:step.color} });
        sl.addText(step.label, { x:x+0.12,y:y+0.04,w:sW-0.15,h:0.28, fontSize:11,fontFace:"Calibri",color:C.white,bold:true,margin:0 });
        sl.addText(step.note,  { x:x+0.12,y:y+0.31,w:sW-0.15,h:0.24, fontSize:9, fontFace:"Calibri",color:"94A3B8",margin:0 });
        if (ci < 3) {
          sl.addShape(pres.shapes.LINE, { x:x+sW,y:y+sH/2,w:gX,h:0, line:{color:"2A5298",width:1.5} });
        }
      });
    });

    // Row connector arrow
    sl.addText("↓", { x:0.45,y:2.62,w:0.5,h:0.32, fontSize:14,fontFace:"Calibri",color:"2A5298",align:"center",margin:0 });

    // Before/After callout footer area
    sl.addShape(pres.shapes.RECTANGLE, { x:0,y:4.05,w:10,h:1.575, fill:{color:"0A1628"}, line:{color:"1B3A6B",width:0.5} });
    sl.addShape(pres.shapes.RECTANGLE, { x:0.5,y:4.18,w:4.1,h:1.2, fill:{color:"1B0000"}, line:{color:C.red,width:1} });
    sl.addText("ANTES (manual)", { x:0.65,y:4.22,w:3.9,h:0.28, fontSize:10,fontFace:"Calibri",color:"94A3B8",charSpacing:3,margin:0 });
    sl.addText("~85 min por cliente", { x:0.65,y:4.5,w:3.9,h:0.6, fontSize:26,fontFace:"Calibri",color:C.red,bold:true,margin:0 });

    sl.addText("VS", { x:4.7,y:4.4,w:0.6,h:0.5, fontSize:18,fontFace:"Calibri",color:C.amber,bold:true,align:"center",valign:"middle",margin:0 });

    sl.addShape(pres.shapes.RECTANGLE, { x:5.4,y:4.18,w:4.1,h:1.2, fill:{color:"001B0A"}, line:{color:C.success,width:1} });
    sl.addText("DEPOIS (squad)", { x:5.55,y:4.22,w:3.9,h:0.28, fontSize:10,fontFace:"Calibri",color:"94A3B8",charSpacing:3,margin:0 });
    sl.addText("~2 min por cliente", { x:5.55,y:4.5,w:3.9,h:0.6, fontSize:26,fontFace:"Calibri",color:C.success,bold:true,margin:0 });
  }

  // ── SLIDE 5 ──────────────────────────────────────────────────────
  {
    const sl = pres.addSlide();
    sl.background = { color: C.lightBg };
    hdr(sl, "O QUE O SQUAD LIBERA", C.amber);

    const stats = [
      { number:"83 min", label:"LIVRES",  sub:"por cliente · por semana",       color:C.accent },
      { number:"~5h",    label:"LIVRES",  sub:"4 clientes · por semana",        color:C.accent },
      { number:"21h",    label:"LIVRES",  sub:"4 clientes · por mês",           color:C.amber  },
      { number:"100%",   label:"PADRÃO",  sub:"sem depender do humor do dia",   color:C.amber  },
    ];

    const pos = [{ x:0.4,y:0.88 },{ x:5.2,y:0.88 },{ x:0.4,y:2.95 },{ x:5.2,y:2.95 }];
    const sW=4.4, sH=1.87;

    stats.forEach((st, i) => {
      const { x, y } = pos[i];
      sl.addShape(pres.shapes.RECTANGLE, { x,y,w:sW,h:sH, fill:{color:C.cardBg}, shadow:mkShadow(), line:{color:C.border,width:0.5} });
      sl.addShape(pres.shapes.RECTANGLE, { x,y,w:sW,h:0.07, fill:{color:st.color}, line:{color:st.color} });
      sl.addText(st.number, { x:x+0.2,y:y+0.15,w:sW-0.3,h:0.9, fontSize:52,fontFace:"Calibri",color:st.color,bold:true,margin:0 });
      sl.addText(st.label,  { x:x+0.2,y:y+1.06,w:sW-0.3,h:0.28, fontSize:12,fontFace:"Calibri",color:C.textDark,bold:true,charSpacing:3,margin:0 });
      sl.addText(st.sub,    { x:x+0.2,y:y+1.35,w:sW-0.3,h:0.35, fontSize:11,fontFace:"Calibri",color:C.textMuted,margin:0 });
    });

    ftr(sl, "Roda enquanto você dorme. Escala sem você. Executa igual toda semana.");
  }

  // ── SLIDE 6 ──────────────────────────────────────────────────────
  {
    const sl = pres.addSlide();
    sl.background = { color: C.navyDark };
    sl.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:0.25,h:5.625, fill:{color:C.amber}, line:{color:C.amber} });
    sl.addShape(pres.shapes.RECTANGLE, { x:9.75,y:0,w:0.25,h:5.625, fill:{color:C.accent}, line:{color:C.accent} });

    sl.addText("“", { x:0.5,y:0.3,w:1.5,h:1.4, fontSize:110,fontFace:"Georgia",color:"1B3A6B",bold:true,margin:0 });
    sl.addText("Você só transfere\no que entende.", { x:0.55,y:1.15,w:8.8,h:1.65, fontSize:40,fontFace:"Georgia",color:C.white,bold:true,margin:0 });
    sl.addText("— Anderson Silva", { x:0.55,y:2.88,w:8.8,h:0.4, fontSize:15,fontFace:"Calibri",color:C.accent,italic:true,margin:0 });
    sl.addShape(pres.shapes.LINE, { x:0.55,y:3.45,w:8.9,h:0, line:{color:"1B3A6B",width:1.5} });
    sl.addText("Eu descrevi. Automatizei. Funciona.", { x:0.55,y:3.65,w:8.8,h:0.55, fontSize:22,fontFace:"Calibri",color:C.amber,bold:true,margin:0 });

    sl.addShape(pres.shapes.RECTANGLE, { x:0.55,y:4.65,w:3.5,h:0.5, fill:{color:C.navyMid}, line:{color:"2A5298",width:1} });
    sl.addText("squad relatorio-semanal", { x:0.55,y:4.65,w:3.5,h:0.5, fontSize:12,fontFace:"Consolas",color:C.accent,valign:"middle",align:"center",margin:0 });
    sl.addText("Vinicius Lima · Stark Marketing · 2026", { x:4.3,y:4.65,w:5.2,h:0.5, fontSize:12,fontFace:"Calibri",color:"475569",valign:"middle",align:"right",margin:0 });
  }

  await pres.writeFile({ fileName: "C:/Users/Usuario/Desktop/Claude_Stark/squads/relatorio-semanal/apresentacao-squad.pptx" });
  console.log("OK");
}

run().catch(e => { console.error(e); process.exit(1); });
