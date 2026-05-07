// ═══════════════════════════════════════════════════════════
// MathParser — Algoritmo Shunting-Yard (Dijkstra, 1961)
// Converte expressão infix → RPN → avalia sem eval()
// ═══════════════════════════════════════════════════════════
const MathParser = {

  PRECEDENCE:  { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 },
  RIGHT_ASSOC: new Set(['^']),
  FUNCTIONS:   new Set(['sin','cos','tan','asin','acos','atan','ln','log','sqrt','abs','fact']),

  // Passo 1: string → array de tokens tipados
  tokenize(expression) {
    // Substituir constantes antes de tokenizar
    const expr = expression
      .replace(/PI/g, String(Math.PI))
      .replace(/\bE\b/g, String(Math.E));

    const TOKEN_RE = /(\d+\.?\d*|\.\d+|[+\-*/^%()]|[a-z]+)/gi;
    const raw = expr.match(TOKEN_RE);
    if (!raw) throw new Error('expressão inválida');

    const tokens = [];
    for (let i = 0; i < raw.length; i++) {
      const v = raw[i];

      if (/^(\d+\.?\d*|\.\d+)$/.test(v)) {
        tokens.push({ type: 'number', value: v });

      } else if (this.FUNCTIONS.has(v.toLowerCase())) {
        tokens.push({ type: 'function', value: v.toLowerCase() });

      } else if ('+-*/^%'.includes(v)) {
        // Unário: '-' no início ou após '(' → prefixar próximo número com sinal
        if (v === '-' && (i === 0 || raw[i - 1] === '(')) {
          tokens.push({ type: 'number', value: '-' + (raw[++i] ?? '0') });
        } else {
          tokens.push({ type: 'operator', value: v });
        }

      } else if (v === '(' || v === ')') {
        tokens.push({ type: 'paren', value: v });

      } else {
        throw new Error('expressão inválida');
      }
    }
    return tokens;
  },

  // Passo 2: tokens infix → fila RPN (Shunting-Yard)
  toRPN(tokens) {
    const output = [];
    const opStack = [];

    const popTo = (cond) => {
      while (opStack.length && cond(opStack[opStack.length - 1])) {
        output.push(opStack.pop());
      }
    };

    for (const tok of tokens) {
      if (tok.type === 'number') {
        output.push(tok);

      } else if (tok.type === 'function') {
        opStack.push(tok);

      } else if (tok.type === 'operator') {
        const isRight = this.RIGHT_ASSOC.has(tok.value);
        popTo(top =>
          top.type !== 'paren' &&
          (top.type === 'function' ||
            this.PRECEDENCE[top.value] > this.PRECEDENCE[tok.value] ||
            (!isRight && this.PRECEDENCE[top.value] === this.PRECEDENCE[tok.value]))
        );
        opStack.push(tok);

      } else if (tok.value === '(') {
        opStack.push(tok);

      } else if (tok.value === ')') {
        popTo(top => top.value !== '(');
        if (!opStack.length) throw new Error('parênteses desbalanceados');
        opStack.pop(); // descarta '('
        if (opStack.length && opStack[opStack.length - 1].type === 'function') {
          output.push(opStack.pop());
        }
      }
    }

    popTo(() => true);
    return output;
  },

  // Passo 3: fila RPN → número resultado
  evalRPN(rpnQueue) {
    const stack = [];

    for (const tok of rpnQueue) {
      if (tok.type === 'number') {
        stack.push(parseFloat(tok.value));

      } else if (tok.type === 'operator') {
        if (stack.length < 2) throw new Error('expressão inválida');
        const b = stack.pop();
        const a = stack.pop();
        switch (tok.value) {
          case '+': stack.push(a + b); break;
          case '-': stack.push(a - b); break;
          case '*': stack.push(a * b); break;
          case '/':
            if (b === 0) throw new Error('divisão por zero');
            stack.push(a / b); break;
          case '%':
            if (b === 0) throw new Error('divisão por zero');
            stack.push(a % b); break;
          case '^': stack.push(Math.pow(a, b)); break;
        }

      } else if (tok.type === 'function') {
        if (!stack.length) throw new Error('expressão inválida');
        const x = stack.pop();
        stack.push(ScientificFunctions.apply(tok.value, x));
      }
    }

    if (stack.length !== 1) throw new Error('expressão inválida');
    return stack[0];
  },

  // Entry point público
  evaluate(expression) {
    try {
      if (!expression || expression.trim() === '') return '0';
      const tokens = this.tokenize(expression);
      const rpn    = this.toRPN(tokens);
      const result = this.evalRPN(rpn);

      if (!isFinite(result)) throw new Error('resultado indefinido');

      // Notação científica para números muito grandes ou muito pequenos
      if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-7 && result !== 0)) {
        return result.toExponential(6);
      }
      // Arredondar imprecisões de ponto flutuante (ex: 0.1 + 0.2 = 0.30000000004)
      return parseFloat(result.toPrecision(10));

    } catch (e) {
      return 'Erro: ' + e.message;
    }
  }
};

// ═══════════════════════════════════════════════════════════
// ScientificFunctions — Implementação completa (Story 1.3)
// ═══════════════════════════════════════════════════════════
const ScientificFunctions = {
  mode: 'deg',

  toRad(x)  { return this.mode === 'deg' ? x * Math.PI / 180 : x; },
  fromRad(x){ return this.mode === 'deg' ? x * 180 / Math.PI : x; },

  apply(fn, x) {
    switch (fn) {
      // Trigonométricas
      case 'sin':  return Math.sin(this.toRad(x));
      case 'cos':  return Math.cos(this.toRad(x));
      case 'tan':  return Math.tan(this.toRad(x));

      // Inversas (resultado em graus ou rad conforme mode)
      case 'asin': return this.fromRad(Math.asin(x));
      case 'acos': return this.fromRad(Math.acos(x));
      case 'atan': return this.fromRad(Math.atan(x));

      // Logarítmicas
      case 'ln':
        if (x <= 0) throw new Error('logaritmo indefinido');
        return Math.log(x);
      case 'log':
        if (x <= 0) throw new Error('logaritmo indefinido');
        return Math.log10(x);

      // Raiz e módulo
      case 'sqrt':
        if (x < 0) throw new Error('raiz de número negativo');
        return Math.sqrt(x);
      case 'abs':
        return Math.abs(x);

      // Fatorial — iterativo, máx 20
      case 'fact':
        if (!Number.isInteger(x) || x < 0) throw new Error('fatorial de inteiros');
        if (x > 20) throw new Error('máximo 20!');
        let r = 1;
        for (let i = 2; i <= x; i++) r *= i;
        return r;

      default:
        throw new Error('função desconhecida: ' + fn);
    }
  }
};

// ═══════════════════════════════════════════════════════════
// HistoryManager — Persistência via localStorage (Story 1.4)
// ═══════════════════════════════════════════════════════════
const HistoryManager = {
  MAX_ITEMS: 50,
  STORAGE_KEY: 'calculadora_historico',

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  },

  add(expression, result) {
    const items = this.load();
    items.unshift({ expression, result });
    this.save(items.slice(0, this.MAX_ITEMS));
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  getAll() {
    return this.load();
  }
};

// ═══════════════════════════════════════════════════════════
// Calculator — Controlador de UI
// ═══════════════════════════════════════════════════════════
const Calculator = {
  expression: '',
  lastResult: null,
  hasError:   false,   // flag: próximo input limpa o estado

  init() {
    document.getElementById('keypad').addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      this.handleAction(btn.dataset.action, btn.dataset.value);
    });

    document.getElementById('toggle-mode').addEventListener('click',  () => this.toggleMode());
    document.getElementById('toggle-angle').addEventListener('click', () => this.toggleAngle());
    document.getElementById('btn-clear-history').addEventListener('click', () => this.clearHistory());

    // Suporte a teclado
    document.addEventListener('keydown', e => this.handleKeyboard(e));

    // Restaurar histórico persistido ao abrir a calculadora
    this.renderHistory();
  },

  handleAction(action, value) {
    switch (action) {
      case 'append':    this.append(value);  break;
      case 'calculate': this.calculate();    break;
      case 'clear':     this.clear();        break;
      case 'backspace': this.backspace();    break;
    }
  },

  append(token) {
    if (!token) return;
    // Após erro, começa expressão do zero
    if (this.hasError) {
      this.clear();
    }
    // Botão () inteligente
    if (token === '(') {
      token = this._smartParen();
    }
    this.expression += token;
    this.updateDisplay();
  },

  // Decide se insere '(' ou ')' baseado nos parênteses abertos
  _smartParen() {
    const open  = (this.expression.match(/\(/g) || []).length;
    const close = (this.expression.match(/\)/g) || []).length;
    return (open > close) ? ')' : '(';
  },

  calculate() {
    if (!this.expression) return;
    const raw = MathParser.evaluate(this.expression);
    const isError = typeof raw === 'string' && raw.startsWith('Erro');

    this.hasError  = isError;
    this.lastResult = isError ? null : raw;

    const resultEl = document.getElementById('result');
    resultEl.textContent = raw;
    resultEl.classList.toggle('error', isError);

    if (!isError) {
      HistoryManager.add(this.expression, raw);
      this.renderHistory();
    }
  },

  clear() {
    this.expression  = '';
    this.lastResult  = null;
    this.hasError    = false;
    this.updateDisplay();
    const resultEl = document.getElementById('result');
    resultEl.textContent = '0';
    resultEl.classList.remove('error');
  },

  backspace() {
    if (this.hasError) { this.clear(); return; }
    this.expression = this.expression.slice(0, -1);
    this.updateDisplay();
  },

  updateDisplay() {
    document.getElementById('expression').textContent = this.expression || '0';
  },

  renderHistory() {
    const items = HistoryManager.getAll();
    const list  = document.getElementById('history-list');
    if (!items.length) {
      list.innerHTML = '<div class="history-empty">Nenhum cálculo ainda</div>';
      return;
    }
    list.innerHTML = items.map(item => `
      <div class="history-item" data-expr="${item.expression}">
        <div class="history-expr">${item.expression}</div>
        <div class="history-result">= ${item.result}</div>
      </div>
    `).join('');

    // Clicar em item do histórico reutiliza a expressão
    list.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        this.expression = el.dataset.expr;
        this.hasError = false;
        this.updateDisplay();
      });
    });
  },

  toggleMode() {
    const app = document.querySelector('.app');
    const btn = document.getElementById('toggle-mode');
    const isScientific = app.classList.toggle('scientific-mode');
    btn.textContent = isScientific ? 'Básico' : 'Científico';
    btn.classList.toggle('toggle-active', isScientific);
  },

  toggleAngle() {
    const btn = document.getElementById('toggle-angle');
    const isDeg = btn.dataset.angle === 'deg';
    btn.dataset.angle = isDeg ? 'rad' : 'deg';
    btn.textContent   = isDeg ? 'RAD' : 'DEG';
    btn.classList.toggle('toggle-active', !isDeg);
    ScientificFunctions.mode = isDeg ? 'rad' : 'deg';
  },

  clearHistory() {
    HistoryManager.clear();
    const list = document.getElementById('history-list');
    list.innerHTML = '<div class="history-empty">Nenhum cálculo ainda</div>';
  },

  handleKeyboard(e) {
    const map = {
      'Enter': ['calculate', undefined],
      'Escape': ['clear', undefined],
      'Backspace': ['backspace', undefined],
      '+': ['append', '+'], '-': ['append', '-'],
      '*': ['append', '*'], '/': ['append', '/'],
      '^': ['append', '^'], '%': ['append', '%'],
      '(': ['append', '('], ')': ['append', ')'],
      '.': ['append', '.'],
    };
    if (map[e.key]) {
      e.preventDefault();
      const [action, value] = map[e.key];
      this.handleAction(action, value);
    } else if (/^\d$/.test(e.key)) {
      this.handleAction('append', e.key);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Calculator.init());
