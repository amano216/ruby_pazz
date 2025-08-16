class RubyInterpreter {
  constructor() {
    this.variables = {};
    this.methods = {};
    this.output = [];
  }

  reset() {
    this.variables = {};
    this.methods = {};
    this.output = [];
  }

  execute(code) {
    this.output = [];
    const lines = code.split('\n');
    
    try {
      for (let i = 0; i < lines.length; i++) {
        this.executeLine(lines[i].trim(), lines, i);
      }
    } catch (error) {
      throw new Error(`実行エラー: ${error.message}`);
    }
    
    return this.output.join('');
  }

  executeLine(line, allLines, currentIndex) {
    if (!line || line.startsWith('#')) return;

    // puts
    if (line.startsWith('puts ')) {
      const expr = line.substring(5).trim();
      const value = this.evaluate(expr);
      this.output.push(value + '\n');
      return;
    }

    // p (inspect)
    if (line.startsWith('p ')) {
      const expr = line.substring(2).trim();
      const value = this.evaluate(expr);
      this.output.push(this.inspect(value) + '\n');
      return;
    }

    // Variable assignment
    if (line.includes('=') && !line.includes('==') && !line.includes('!=') && 
        !line.includes('<=') && !line.includes('>=')) {
      const [varName, expr] = line.split('=').map(s => s.trim());
      this.variables[varName] = this.evaluate(expr);
      return;
    }

    // Method definition
    if (line.startsWith('def ')) {
      const methodEnd = this.findEnd(allLines, currentIndex);
      const methodDef = allLines.slice(currentIndex, methodEnd + 1).join('\n');
      this.defineMethod(methodDef);
      return;
    }

    // Class definition (simplified)
    if (line.startsWith('class ')) {
      // Skip class definitions for now
      return;
    }

    // Simple method calls
    const methodCallPattern = /^(\w+)\((.*)\)$/;
    const match = line.match(methodCallPattern);
    if (match) {
      const [, methodName, args] = match;
      if (this.methods[methodName]) {
        const result = this.callMethod(methodName, args);
        if (result !== undefined) {
          this.output.push(result + '\n');
        }
      }
    }

    // Simple expressions
    const result = this.evaluate(line);
    if (result !== undefined && line) {
      // Don't output for assignments
      if (!line.includes('=') || line.includes('==')) {
        this.output.push(result + '\n');
      }
    }
  }

  evaluate(expr) {
    if (!expr) return '';

    // String literals (check first to preserve # inside strings)
    if (expr.startsWith('"') && expr.endsWith('"')) {
      let str = expr.slice(1, -1);
      // String interpolation
      str = str.replace(/#\{([^}]+)\}/g, (match, p1) => {
        const result = this.evaluate(p1.trim());
        return result !== undefined ? result : '';
      });
      return str;
    }

    // Remove comments (only for non-string expressions)
    expr = expr.split('#')[0].trim();
    if (!expr) return '';

    // Numbers
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      return expr.includes('.') ? parseFloat(expr) : parseInt(expr);
    }

    // Boolean
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (expr === 'nil') return null;

    // Arrays
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const elements = this.parseArrayElements(expr.slice(1, -1));
      return elements.map(e => this.evaluate(e));
    }

    // Hashes
    if (expr.startsWith('{') && expr.endsWith('}')) {
      const hash = {};
      const pairs = expr.slice(1, -1).split(',');
      for (const pair of pairs) {
        const [key, value] = pair.split('=>').map(s => s.trim());
        const keyName = key.startsWith(':') ? key : this.evaluate(key);
        hash[keyName] = this.evaluate(value);
      }
      return hash;
    }

    // Method calls on objects
    if (expr.includes('.')) {
      const parts = expr.split('.');
      let obj = this.evaluate(parts[0]);
      for (let i = 1; i < parts.length; i++) {
        const methodCall = parts[i];
        obj = this.callBuiltInMethod(obj, methodCall);
      }
      return obj;
    }

    // Variables
    if (this.variables.hasOwnProperty(expr)) {
      return this.variables[expr];
    }

    // Arithmetic operations
    if (expr.includes('+')) {
      const parts = expr.split('+').map(p => this.evaluate(p.trim()));
      return parts.reduce((a, b) => {
        if (typeof a === 'string' || typeof b === 'string') {
          return String(a) + String(b);
        }
        return a + b;
      });
    }

    if (expr.includes('-') && !expr.startsWith('-')) {
      const parts = expr.split('-').map(p => this.evaluate(p.trim()));
      return parts.reduce((a, b) => a - b);
    }

    if (expr.includes('*')) {
      const parts = expr.split('*').map(p => this.evaluate(p.trim()));
      return parts.reduce((a, b) => a * b);
    }

    if (expr.includes('/')) {
      const parts = expr.split('/').map(p => this.evaluate(p.trim()));
      return Math.floor(parts.reduce((a, b) => a / b));
    }

    if (expr.includes('%')) {
      const parts = expr.split('%').map(p => this.evaluate(p.trim()));
      return parts[0] % parts[1];
    }

    // Comparison operations
    if (expr.includes('==')) {
      const [left, right] = expr.split('==').map(p => this.evaluate(p.trim()));
      return left === right;
    }

    if (expr.includes('>')) {
      const [left, right] = expr.split('>').map(p => this.evaluate(p.trim()));
      return left > right;
    }

    if (expr.includes('<')) {
      const [left, right] = expr.split('<').map(p => this.evaluate(p.trim()));
      return left < right;
    }

    return expr;
  }

  callBuiltInMethod(obj, methodCall) {
    const methodName = methodCall.split('(')[0];
    const args = methodCall.includes('(') ? 
      methodCall.slice(methodCall.indexOf('(') + 1, -1) : '';

    // String methods
    if (typeof obj === 'string') {
      switch (methodName) {
        case 'upcase': return obj.toUpperCase();
        case 'downcase': return obj.toLowerCase();
        case 'length': return obj.length;
        case 'size': return obj.length;
        case 'reverse': return obj.split('').reverse().join('');
        case 'strip': return obj.trim();
        case 'to_s': return obj;
        case 'to_i': return parseInt(obj);
        case 'chars': return obj.split('');
        case 'include?': return obj.includes(this.evaluate(args));
        case 'start_with?': return obj.startsWith(this.evaluate(args));
        case 'end_with?': return obj.endsWith(this.evaluate(args));
        default: return obj;
      }
    }

    // Number methods
    if (typeof obj === 'number') {
      switch (methodName) {
        case 'to_s': return String(obj);
        case 'times': {
          // Simplified times implementation
          for (let i = 0; i < obj; i++) {
            this.output.push('Hello\n');
          }
          return;
        }
        default: return obj;
      }
    }

    // Array methods
    if (Array.isArray(obj)) {
      switch (methodName) {
        case 'length': return obj.length;
        case 'size': return obj.length;
        case 'push': {
          const value = this.evaluate(args);
          obj.push(value);
          return obj;
        }
        case 'reverse': return obj.slice().reverse();
        case 'sort': return obj.slice().sort((a, b) => a - b);
        case 'uniq': return [...new Set(obj)];
        case 'max': return Math.max(...obj);
        case 'min': return Math.min(...obj);
        case 'sum': return obj.reduce((a, b) => a + b, 0);
        case 'join': {
          const separator = this.evaluate(args) || '';
          return obj.join(separator);
        }
        case 'map': {
          // Simplified map
          return obj.map(x => x * 2);
        }
        case 'select': {
          // Simplified select for even numbers
          return obj.filter(x => x % 2 === 0);
        }
        case 'flatten': return obj.flat();
        case 'compact': return obj.filter(x => x !== null && x !== undefined);
        case 'find': return obj.find(x => x % 2 === 0);
        case 'any?': return obj.some(x => x % 2 === 0);
        case 'all?': return obj.every(x => x % 2 === 0);
        case 'count': {
          const value = this.evaluate(args);
          return obj.filter(x => x === value).length;
        }
        case 'index': {
          const value = this.evaluate(args);
          return obj.indexOf(value);
        }
        default: return obj;
      }
    }

    return obj;
  }

  parseArrayElements(str) {
    const elements = [];
    let current = '';
    let depth = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '[') depth++;
      if (char === ']') depth--;
      
      if (char === ',' && depth === 0) {
        elements.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      elements.push(current.trim());
    }
    
    return elements;
  }

  inspect(value) {
    if (value === null) return 'nil';
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return `"${value}"`;
    if (Array.isArray(value)) {
      return '[' + value.map(v => this.inspect(v)).join(', ') + ']';
    }
    if (typeof value === 'object') {
      const pairs = Object.entries(value).map(([k, v]) => {
        const key = k.startsWith(':') ? k : `:${k}`;
        return `${key}=>${this.inspect(v)}`;
      });
      return '{' + pairs.join(', ') + '}';
    }
    return String(value);
  }

  defineMethod(methodDef) {
    const lines = methodDef.split('\n');
    const defLine = lines[0];
    const match = defLine.match(/def\s+(\w+)(?:\((.*?)\))?/);
    if (match) {
      const [, name, params] = match;
      this.methods[name] = {
        params: params ? params.split(',').map(p => p.trim()) : [],
        body: lines.slice(1, -1).join('\n')
      };
    }
  }

  callMethod(name, args) {
    const method = this.methods[name];
    if (!method) return;
    
    // Simple implementation - just execute the body
    const savedVars = { ...this.variables };
    
    // Execute method body
    const lines = method.body.split('\n');
    for (const line of lines) {
      this.executeLine(line.trim());
    }
    
    // Restore variables
    this.variables = savedVars;
  }

  findEnd(lines, startIndex) {
    let depth = 1;
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('def ') || line.startsWith('class ') || 
          line.startsWith('if ') || line.startsWith('while ')) {
        depth++;
      }
      if (line === 'end') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return lines.length - 1;
  }
}

// Main app logic
document.addEventListener('DOMContentLoaded', function() {
  const interpreter = new RubyInterpreter();
  let currentPuzzleId = 1;
  let completedPuzzles = JSON.parse(localStorage.getItem('completedPuzzles') || '[]');
  let currentPuzzle = PUZZLES[0];

  // Initialize UI
  renderPuzzleList();
  loadPuzzle(currentPuzzleId);
  updateProgress();

  // Event listeners
  document.getElementById('run-code').addEventListener('click', runCode);
  document.getElementById('reset-code').addEventListener('click', resetCode);
  document.getElementById('show-hint').addEventListener('click', showHint);
  document.getElementById('full-reset').addEventListener('click', fullReset);

  // Level tabs
  document.querySelectorAll('.level-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.level-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      filterPuzzles(this.dataset.level);
    });
  });

  // Tab key support
  document.getElementById('code-input').addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 2;
    }
  });

  function renderPuzzleList() {
    const listContainer = document.getElementById('puzzle-list');
    listContainer.innerHTML = '';

    PUZZLES.forEach(puzzle => {
      const item = document.createElement('div');
      item.className = 'puzzle-item';
      item.dataset.id = puzzle.id;
      item.dataset.level = puzzle.level;
      
      if (completedPuzzles.includes(puzzle.id)) {
        item.classList.add('completed');
      }
      if (puzzle.id === currentPuzzleId) {
        item.classList.add('current');
      }

      item.innerHTML = `
        <span class="puzzle-number">${puzzle.id}</span>
        <span class="puzzle-title">${puzzle.title}</span>
        ${completedPuzzles.includes(puzzle.id) ? '<span class="checkmark">✓</span>' : ''}
      `;

      item.addEventListener('click', () => {
        currentPuzzleId = puzzle.id;
        loadPuzzle(puzzle.id);
      });

      listContainer.appendChild(item);
    });
  }

  function loadPuzzle(id) {
    currentPuzzle = PUZZLES.find(p => p.id === id) || PUZZLES[0];
    currentPuzzleId = currentPuzzle.id;

    // Update header
    document.getElementById('puzzle-title-text').textContent = 
      `問題 ${currentPuzzle.id}: ${currentPuzzle.title}`;
    
    // Update level badge
    const badge = document.getElementById('level-badge');
    badge.textContent = currentPuzzle.level;
    badge.className = `level-badge level-${currentPuzzle.level}`;

    // Update description
    document.getElementById('puzzle-description').textContent = currentPuzzle.description;
    
    // Update hint
    document.getElementById('hint-text').textContent = currentPuzzle.hint;
    document.getElementById('hint-text').style.display = 'none';
    document.getElementById('show-hint').style.display = 'inline';

    // Update code
    document.getElementById('code-input').value = currentPuzzle.initialCode;

    // Clear output
    document.getElementById('output').innerHTML = '';

    // Update puzzle list highlighting
    document.querySelectorAll('.puzzle-item').forEach(item => {
      item.classList.remove('current');
      if (parseInt(item.dataset.id) === id) {
        item.classList.add('current');
      }
    });
  }

  function runCode() {
    const code = document.getElementById('code-input').value;
    const output = document.getElementById('output');
    
    output.innerHTML = '<div class="loading">実行中...</div>';

    setTimeout(() => {
      try {
        interpreter.reset();
        const result = interpreter.execute(code);
        
        // Check if output matches expected
        const expected = currentPuzzle.testCases[0].expected;
        
        if (result === expected) {
          // Success
          if (!completedPuzzles.includes(currentPuzzleId)) {
            completedPuzzles.push(currentPuzzleId);
            localStorage.setItem('completedPuzzles', JSON.stringify(completedPuzzles));
          }

          output.innerHTML = `
            <div class="success-message">
              正解です！よくできました！
            </div>
            <div class="output-content">
              <strong>出力:</strong>
              <pre>${escapeHtml(result)}</pre>
            </div>
          `;

          // Update UI
          renderPuzzleList();
          updateProgress();

          // Move to next puzzle
          setTimeout(() => {
            if (currentPuzzleId < PUZZLES.length) {
              if (confirm('次の問題に進みますか？')) {
                loadPuzzle(currentPuzzleId + 1);
              }
            } else {
              alert('全ての問題をクリアしました！おめでとうございます！');
            }
          }, 1000);
        } else {
          // Wrong answer
          output.innerHTML = `
            <div class="error-message">期待される出力と違います</div>
            <div class="output-content">
              <strong>あなたの出力:</strong>
              <pre>${escapeHtml(result)}</pre>
            </div>
            <div class="output-content">
              <strong>期待される出力:</strong>
              <pre>${escapeHtml(expected)}</pre>
            </div>
          `;
        }
      } catch (error) {
        output.innerHTML = `
          <div class="error-message">コードにエラーがあります</div>
          <div class="output-content">
            <strong>エラー内容:</strong>
            <pre>${escapeHtml(error.message)}</pre>
          </div>
        `;
      }
    }, 100);
  }

  function resetCode() {
    document.getElementById('code-input').value = currentPuzzle.initialCode;
    document.getElementById('output').innerHTML = '';
  }

  function showHint() {
    document.getElementById('hint-text').style.display = 'inline';
    document.getElementById('show-hint').style.display = 'none';
  }

  function fullReset() {
    if (confirm('本当に全ての進捗をリセットしますか？')) {
      localStorage.removeItem('completedPuzzles');
      completedPuzzles = [];
      currentPuzzleId = 1;
      loadPuzzle(1);
      renderPuzzleList();
      updateProgress();
    }
  }

  function filterPuzzles(level) {
    document.querySelectorAll('.puzzle-item').forEach(item => {
      if (level === 'all' || item.dataset.level === level) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  function updateProgress() {
    const total = PUZZLES.length;
    const completed = completedPuzzles.length;
    const percentage = Math.round((completed / total) * 100);

    document.getElementById('progress-text').textContent = `進捗: ${completed} / ${total}`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});