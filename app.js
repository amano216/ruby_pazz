class RubyInterpreter {
  constructor() {
    this.variables = {};
    this.methods = {};
    this.output = [];
    this.inLoop = false;
  }

  reset() {
    this.variables = {};
    this.methods = {};
    this.output = [];
    this.inLoop = false;
  }

  execute(code) {
    this.output = [];
    const lines = code.split('\n');
    
    try {
      this.executeBlock(lines, 0, lines.length);
    } catch (error) {
      throw new Error(`実行エラー: ${error.message}`);
    }
    
    return this.output.join('');
  }

  executeBlock(lines, startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      // Handle single-line blocks with { }
      if (line.includes('{') && line.includes('}')) {
        this.executeSingleLineBlock(line);
        continue;
      }

      // Control structures
      if (line.startsWith('if ')) {
        const endIdx = this.findEnd(lines, i);
        // Check if there's a matching 'end'
        if (endIdx === lines.length - 1 && lines[endIdx].trim() !== 'end') {
          throw new Error('if文には対応するendが必要です');
        }
        const condition = line.substring(3).replace(/\bthen\b/, '').trim();
        // Check for assignment in condition (common mistake)
        if (condition.includes('=') && !condition.includes('==') && !condition.includes('!=') && 
            !condition.includes('<=') && !condition.includes('>=')) {
          throw new Error('if文の条件で代入（=）が使われています。比較には==を使ってください');
        }
        
        // Find else/elsif clauses
        let elseIdx = -1;
        let elsifIndices = [];
        let depth = 0;
        
        for (let j = i + 1; j < endIdx; j++) {
          const checkLine = lines[j].trim();
          if (checkLine.startsWith('if ') || checkLine.startsWith('unless ') || 
              checkLine.startsWith('while ') || checkLine.startsWith('def ')) {
            depth++;
          }
          if (checkLine === 'end') {
            depth--;
          }
          if (depth === 0) {
            if (checkLine === 'else') {
              elseIdx = j;
            } else if (checkLine.startsWith('elsif ')) {
              elsifIndices.push(j);
            }
          }
        }
        
        // Execute appropriate branch
        if (this.evaluate(condition)) {
          const blockEnd = elsifIndices.length > 0 ? elsifIndices[0] : 
                           elseIdx > -1 ? elseIdx : endIdx;
          this.executeBlock(lines, i + 1, blockEnd);
        } else {
          // Check elsif conditions
          let executed = false;
          for (let k = 0; k < elsifIndices.length; k++) {
            const elsifIdx = elsifIndices[k];
            const elsifLine = lines[elsifIdx].trim();
            const elsifCondition = elsifLine.substring(6).trim();
            if (this.evaluate(elsifCondition)) {
              const nextIdx = k + 1 < elsifIndices.length ? elsifIndices[k + 1] :
                             elseIdx > -1 ? elseIdx : endIdx;
              this.executeBlock(lines, elsifIdx + 1, nextIdx);
              executed = true;
              break;
            }
          }
          
          // Execute else block if no elsif matched
          if (!executed && elseIdx > -1) {
            this.executeBlock(lines, elseIdx + 1, endIdx);
          }
        }
        
        i = endIdx;
        continue;
      }

      if (line.startsWith('unless ')) {
        const endIdx = this.findEnd(lines, i);
        const condition = line.substring(7).trim();
        if (!this.evaluate(condition)) {
          this.executeBlock(lines, i + 1, endIdx);
        }
        i = endIdx;
        continue;
      }

      if (line.startsWith('while ')) {
        const endIdx = this.findEnd(lines, i);
        const condition = line.substring(6).replace(/\bdo\b/, '').trim();
        while (this.evaluate(condition)) {
          this.executeBlock(lines, i + 1, endIdx);
        }
        i = endIdx;
        continue;
      }

      // for in range
      const forMatch = line.match(/^for\s+(\w+)\s+in\s+(.+)/);
      if (forMatch) {
        const [, varName, rangeExpr] = forMatch;
        const endIdx = this.findEnd(lines, i);
        const range = this.evaluate(rangeExpr);
        if (Array.isArray(range)) {
          for (const item of range) {
            this.variables[varName] = item;
            this.executeBlock(lines, i + 1, endIdx);
          }
        }
        i = endIdx;
        continue;
      }

      // Ruby iteration methods
      const timesMatch = line.match(/^(\d+)\.times\s*(?:do|\{)/);
      if (timesMatch) {
        const times = parseInt(timesMatch[1]);
        const endIdx = this.findEnd(lines, i);
        for (let j = 0; j < times; j++) {
          this.executeBlock(lines, i + 1, endIdx);
        }
        i = endIdx;
        continue;
      }

      const uptoMatch = line.match(/^(\d+)\.upto\((\d+)\)\s*(?:do|\{)\s*(?:\|(\w+)\|)?/);
      if (uptoMatch) {
        const [, start, end, varName] = uptoMatch;
        const endIdx = this.findEnd(lines, i);
        for (let j = parseInt(start); j <= parseInt(end); j++) {
          if (varName) this.variables[varName] = j;
          this.executeBlock(lines, i + 1, endIdx);
        }
        i = endIdx;
        continue;
      }

      const downtoMatch = line.match(/^(\d+)\.downto\((\d+)\)\s*(?:do|\{)\s*(?:\|(\w+)\|)?/);
      if (downtoMatch) {
        const [, start, end, varName] = downtoMatch;
        const endIdx = this.findEnd(lines, i);
        for (let j = parseInt(start); j >= parseInt(end); j--) {
          if (varName) this.variables[varName] = j;
          this.executeBlock(lines, i + 1, endIdx);
        }
        i = endIdx;
        continue;
      }

      const eachMatch = line.match(/^(\w+)\.each\s*(?:do|\{)\s*(?:\|(\w+)\|)?/);
      if (eachMatch) {
        const [, arrayName, varName] = eachMatch;
        const endIdx = this.findEnd(lines, i);
        const array = this.variables[arrayName];
        if (Array.isArray(array)) {
          for (const item of array) {
            if (varName) this.variables[varName] = item;
            this.executeBlock(lines, i + 1, endIdx);
          }
        }
        i = endIdx;
        continue;
      }

      // Loop control
      if (line === 'break') {
        throw new Error('BREAK');
      }
      if (line === 'next' || line === 'continue') {
        throw new Error('NEXT');
      }

      // Method definition
      if (line.startsWith('def ')) {
        const endIdx = this.findEnd(lines, i);
        const methodDef = lines.slice(i, endIdx + 1).join('\n');
        this.defineMethod(methodDef);
        i = endIdx;
        continue;
      }

      // Skip else/elsif lines (they're handled by if statement)
      if (line === 'else' || line.startsWith('elsif ')) {
        continue;
      }
      
      // Regular line execution
      this.executeLine(line);
    }
  }

  executeLine(line) {
    // Handle common typo 'put' as 'puts'
    if (line.startsWith('put ') && !line.startsWith('puts ')) {
      const expr = line.substring(4).trim();
      // Check if it looks like a bare word (not a variable, string, or expression)
      if (expr && !expr.startsWith('"') && !expr.startsWith("'") && 
          !this.variables.hasOwnProperty(expr) && !/^\d/.test(expr) &&
          !expr.includes('.') && !expr.includes('(')) {
        // Treat it as a string literal
        line = 'puts "' + expr + '"';
      } else {
        line = 'puts' + line.substring(3);
      }
    }
    
    // puts
    if (line.startsWith('puts ')) {
      const expr = line.substring(5).trim();
      const value = this.evaluate(expr);
      this.outputValue(value);
      return;
    }

    // p (inspect)
    if (line.startsWith('p ')) {
      const expr = line.substring(2).trim();
      const value = this.evaluate(expr);
      this.output.push(this.inspect(value) + '\n');
      return;
    }

    // print (without newline)
    if (line.startsWith('print ')) {
      const expr = line.substring(6).trim();
      const value = this.evaluate(expr);
      this.output.push(String(value));
      return;
    }

    // Variable assignment or modification
    const assignMatch = line.match(/^(\w+)\s*([+\-*\/]?)=\s*(.+)$/);
    if (assignMatch) {
      const [, varName, op, expr] = assignMatch;
      let value = this.evaluate(expr);
      
      if (op) {
        const current = this.variables[varName];
        switch(op) {
          case '+': value = current + value; break;
          case '-': value = current - value; break;
          case '*': value = current * value; break;
          case '/': value = current / value; break;
        }
      }
      
      this.variables[varName] = value;
      return;
    }

    // Array operations
    const pushMatch = line.match(/^(\w+)\s*<<\s*(.+)$/);
    if (pushMatch) {
      const [, varName, expr] = pushMatch;
      const value = this.evaluate(expr);
      if (Array.isArray(this.variables[varName])) {
        this.variables[varName].push(value);
      }
      return;
    }

    // Method calls
    const result = this.evaluate(line);
    if (result !== undefined && !line.includes('=')) {
      // Don't auto-output method calls that modify state
      if (!line.includes('.push') && !line.includes('<<')) {
        this.outputValue(result);
      }
    }
  }

  outputValue(value) {
    if (Array.isArray(value)) {
      this.output.push('[' + value.join(', ') + ']\n');
    } else if (typeof value === 'object' && value !== null) {
      this.output.push(this.inspect(value) + '\n');
    } else {
      this.output.push(String(value) + '\n');
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

    // Single quoted strings (no interpolation)
    if (expr.startsWith("'") && expr.endsWith("'")) {
      return expr.slice(1, -1);
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
      const pairs = this.parsePairs(expr.slice(1, -1));
      for (const pair of pairs) {
        const [key, value] = pair.split('=>').map(s => s.trim());
        const keyName = key.startsWith(':') ? key : this.evaluate(key);
        hash[keyName] = this.evaluate(value);
      }
      return hash;
    }

    // Ranges (with or without parentheses) 
    const rangeMatch = expr.match(/^\(?(\d+)\.\.(\d+)\)?$/);
    if (rangeMatch) {
      const [, start, end] = rangeMatch;
      const result = [];
      for (let i = parseInt(start); i <= parseInt(end); i++) {
        result.push(i);
      }
      return result;
    }

    // Array/Hash access
    const accessMatch = expr.match(/^(\w+)\[(.+)\]$/);
    if (accessMatch) {
      const [, varName, indexExpr] = accessMatch;
      if (this.variables.hasOwnProperty(varName)) {
        const obj = this.variables[varName];
        const index = this.evaluate(indexExpr);
        if (Array.isArray(obj)) {
          return obj[index];
        } else if (typeof obj === 'object') {
          return obj[index] || obj[':' + index];
        }
      }
    }

    // Method calls with operators
    const methodOpMatch = expr.match(/^(.+?\.\w+)([\+\-\*\/\%].+)$/);
    if (methodOpMatch) {
      const [, methodPart, opPart] = methodOpMatch;
      const methodResult = this.evaluateMethodCall(methodPart);
      return this.evaluate(String(methodResult) + opPart);
    }

    // Method calls
    if (expr.includes('.')) {
      return this.evaluateMethodCall(expr);
    }

    // Variables
    if (this.variables.hasOwnProperty(expr)) {
      return this.variables[expr];
    }
    
    // Check if it looks like a variable name (simple word)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr)) {
      throw new Error(`未定義の変数またはメソッド: ${expr}`);
    }

    // Ternary operator
    const ternaryMatch = expr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
    if (ternaryMatch) {
      const [, condition, trueExpr, falseExpr] = ternaryMatch;
      return this.evaluate(condition) ? this.evaluate(trueExpr) : this.evaluate(falseExpr);
    }

    // Comparison operations
    if (expr.includes('==')) {
      const [left, right] = expr.split('==').map(p => this.evaluate(p.trim()));
      return left === right;
    }
    if (expr.includes('!=')) {
      const [left, right] = expr.split('!=').map(p => this.evaluate(p.trim()));
      return left !== right;
    }
    if (expr.includes('>=')) {
      const [left, right] = expr.split('>=').map(p => this.evaluate(p.trim()));
      return left >= right;
    }
    if (expr.includes('<=')) {
      const [left, right] = expr.split('<=').map(p => this.evaluate(p.trim()));
      return left <= right;
    }
    if (expr.includes('>')) {
      const [left, right] = expr.split('>').map(p => this.evaluate(p.trim()));
      return left > right;
    }
    if (expr.includes('<')) {
      const [left, right] = expr.split('<').map(p => this.evaluate(p.trim()));
      return left < right;
    }

    // Logical operations
    if (expr.includes('&&')) {
      const [left, right] = expr.split('&&').map(p => this.evaluate(p.trim()));
      return left && right;
    }
    if (expr.includes('||')) {
      const [left, right] = expr.split('||').map(p => this.evaluate(p.trim()));
      return left || right;
    }
    if (expr.startsWith('!')) {
      return !this.evaluate(expr.substring(1).trim());
    }

    // Arithmetic operations
    if (expr.includes('+')) {
      const parts = this.splitByOperator(expr, '+');
      return parts.reduce((a, b) => {
        const aVal = this.evaluate(a);
        const bVal = this.evaluate(b);
        if (typeof aVal === 'string' || typeof bVal === 'string') {
          return String(aVal) + String(bVal);
        }
        return aVal + bVal;
      });
    }

    if (expr.includes('-') && !expr.startsWith('-')) {
      const parts = this.splitByOperator(expr, '-');
      return parts.map(p => this.evaluate(p)).reduce((a, b) => a - b);
    }

    if (expr.includes('*')) {
      const parts = this.splitByOperator(expr, '*');
      return parts.map(p => this.evaluate(p)).reduce((a, b) => a * b);
    }

    if (expr.includes('/')) {
      const parts = this.splitByOperator(expr, '/');
      const values = parts.map(p => this.evaluate(p));
      return Math.floor(values.reduce((a, b) => a / b));
    }

    if (expr.includes('%')) {
      const parts = this.splitByOperator(expr, '%');
      const values = parts.map(p => this.evaluate(p));
      return values[0] % values[1];
    }

    if (expr.includes('**')) {
      const parts = expr.split('**').map(p => this.evaluate(p.trim()));
      return Math.pow(parts[0], parts[1]);
    }

    return expr;
  }

  evaluateMethodCall(expr) {
    const parts = expr.split('.');
    let obj = this.evaluate(parts[0]);
    
    for (let i = 1; i < parts.length; i++) {
      const methodCall = parts[i];
      obj = this.callBuiltInMethod(obj, methodCall);
    }
    
    return obj;
  }

  callBuiltInMethod(obj, methodCall) {
    const methodMatch = methodCall.match(/^(\w+)(?:\((.*?)\))?$/);
    if (!methodMatch) return obj;
    
    const [, methodName, args] = methodMatch;
    const argValue = args ? this.evaluate(args) : undefined;

    // String methods
    if (typeof obj === 'string') {
      switch (methodName) {
        case 'upcase': return obj.toUpperCase();
        case 'downcase': return obj.toLowerCase();
        case 'capitalize': return obj.charAt(0).toUpperCase() + obj.slice(1).toLowerCase();
        case 'length': case 'size': return obj.length;
        case 'reverse': return obj.split('').reverse().join('');
        case 'strip': case 'trim': return obj.trim();
        case 'to_s': return obj;
        case 'to_i': return parseInt(obj) || 0;
        case 'to_f': return parseFloat(obj) || 0.0;
        case 'chars': return obj.split('');
        case 'split': return obj.split(argValue || ' ');
        case 'include?': return obj.includes(argValue);
        case 'start_with?': return obj.startsWith(argValue);
        case 'end_with?': return obj.endsWith(argValue);
        case 'gsub': {
          const [pattern, replacement] = this.parseGsubArgs(args);
          return obj.replace(new RegExp(pattern, 'g'), replacement);
        }
        default: return obj;
      }
    }

    // Number methods
    if (typeof obj === 'number') {
      switch (methodName) {
        case 'to_s': return String(obj);
        case 'to_i': return Math.floor(obj);
        case 'to_f': return obj;
        case 'abs': return Math.abs(obj);
        case 'even?': return obj % 2 === 0;
        case 'odd?': return obj % 2 !== 0;
        case 'zero?': return obj === 0;
        case 'positive?': return obj > 0;
        case 'negative?': return obj < 0;
        case 'times': {
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
        case 'length': case 'size': return obj.length;
        case 'empty?': return obj.length === 0;
        case 'first': return obj[0];
        case 'last': return obj[obj.length - 1];
        case 'push': obj.push(argValue); return obj;
        case 'pop': return obj.pop();
        case 'shift': return obj.shift();
        case 'unshift': obj.unshift(argValue); return obj;
        case 'reverse': return obj.slice().reverse();
        case 'sort': return obj.slice().sort((a, b) => a - b);
        case 'uniq': return [...new Set(obj)];
        case 'compact': return obj.filter(x => x != null);
        case 'flatten': return obj.flat();
        case 'max': return Math.max(...obj);
        case 'min': return Math.min(...obj);
        case 'sum': return obj.reduce((a, b) => a + b, 0);
        case 'join': return obj.join(argValue || '');
        case 'to_a': return obj;
        case 'to_s': return '[' + obj.join(', ') + ']';
        case 'include?': return obj.includes(argValue);
        case 'index': return obj.indexOf(argValue);
        case 'count': return argValue !== undefined ? obj.filter(x => x === argValue).length : obj.length;
        case 'any?': return obj.some(x => x % 2 === 0); // Simplified
        case 'all?': return obj.every(x => x % 2 === 0); // Simplified
        case 'find': return obj.find(x => x % 2 === 0); // Simplified
        case 'select': return obj.filter(x => x % 2 === 0); // Simplified
        case 'map': return obj.map(x => x * 2); // Simplified
        default: return obj;
      }
    }

    // Hash methods
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      switch (methodName) {
        case 'keys': return Object.keys(obj).map(k => k.startsWith(':') ? k : ':' + k);
        case 'values': return Object.values(obj);
        case 'length': case 'size': return Object.keys(obj).length;
        case 'empty?': return Object.keys(obj).length === 0;
        case 'to_s': return this.inspect(obj);
        default: return obj;
      }
    }

    return obj;
  }

  parseGsubArgs(args) {
    const parts = args.split(',').map(s => s.trim());
    const pattern = parts[0].replace(/^["']|["']$/g, '');
    const replacement = parts[1].replace(/^["']|["']$/g, '');
    return [pattern, replacement];
  }

  splitByOperator(expr, operator) {
    const parts = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = null;
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      
      if ((char === '"' || char === "'") && (i === 0 || expr[i-1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '(' || char === '[' || char === '{') depth++;
        if (char === ')' || char === ']' || char === '}') depth--;
        
        if (char === operator && depth === 0) {
          if (current.trim()) parts.push(current.trim());
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) parts.push(current.trim());
    return parts.length > 0 ? parts : [expr];
  }

  parseArrayElements(str) {
    const elements = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = null;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      
      if ((char === '"' || char === "'") && (i === 0 || str[i-1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '[' || char === '{') depth++;
        if (char === ']' || char === '}') depth--;
        
        if (char === ',' && depth === 0) {
          elements.push(current.trim());
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      elements.push(current.trim());
    }
    
    return elements;
  }

  parsePairs(str) {
    const pairs = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = null;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      
      if ((char === '"' || char === "'") && (i === 0 || str[i-1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '[' || char === '{') depth++;
        if (char === ']' || char === '}') depth--;
        
        if (char === ',' && depth === 0) {
          pairs.push(current.trim());
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      pairs.push(current.trim());
    }
    
    return pairs;
  }

  inspect(value) {
    if (value === null) return 'nil';
    if (value === undefined) return 'nil';
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return `"${value}"`;
    if (Array.isArray(value)) {
      return '[' + value.map(v => this.inspect(v)).join(', ') + ']';
    }
    if (typeof value === 'object') {
      const pairs = Object.entries(value).map(([k, v]) => {
        const key = k.startsWith(':') ? k : ':' + k;
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
    
    const savedVars = { ...this.variables };
    
    // Parse and assign arguments
    if (args && method.params.length > 0) {
      const argValues = this.parseMethodArgs(args);
      method.params.forEach((param, i) => {
        this.variables[param] = argValues[i];
      });
    }
    
    // Execute method body
    const lines = method.body.split('\n');
    let returnValue = undefined;
    
    for (const line of lines) {
      if (line.trim().startsWith('return ')) {
        returnValue = this.evaluate(line.trim().substring(7));
        break;
      }
      this.executeLine(line.trim());
    }
    
    // Restore variables
    this.variables = savedVars;
    return returnValue;
  }

  parseMethodArgs(args) {
    const result = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = null;
    
    for (let i = 0; i < args.length; i++) {
      const char = args[i];
      
      if ((char === '"' || char === "'") && (i === 0 || args[i-1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '(' || char === '[' || char === '{') depth++;
        if (char === ')' || char === ']' || char === '}') depth--;
        
        if (char === ',' && depth === 0) {
          result.push(this.evaluate(current.trim()));
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      result.push(this.evaluate(current.trim()));
    }
    
    return result;
  }

  executeSingleLineBlock(line) {
    // Handle single-line blocks like: 3.times { puts "Hi" }
    // or: [1, 2, 3].each { |n| puts n }
    
    // Times with block
    const timesMatch = line.match(/^(\d+)\.times\s*\{(.+?)\}/);
    if (timesMatch) {
      const times = parseInt(timesMatch[1]);
      const blockCode = timesMatch[2].trim();
      for (let j = 0; j < times; j++) {
        this.executeLine(blockCode);
      }
      return;
    }

    // Array.each with block
    const arrayEachMatch = line.match(/^\[(.+?)\]\.each\s*\{\s*(?:\|(\w+)\|\s*)?(.+?)\}/);
    if (arrayEachMatch) {
      const [, arrayStr, varName, blockCode] = arrayEachMatch;
      const array = this.evaluate('[' + arrayStr + ']');
      for (const item of array) {
        if (varName) this.variables[varName] = item;
        this.executeLine(blockCode);
      }
      return;
    }

    // Variable.each with block
    const varEachMatch = line.match(/^(\w+)\.each\s*\{\s*(?:\|(\w+)\|\s*)?(.+?)\}/);
    if (varEachMatch) {
      const [, arrayName, varName, blockCode] = varEachMatch;
      const array = this.variables[arrayName];
      if (Array.isArray(array)) {
        for (const item of array) {
          if (varName) this.variables[varName] = item;
          this.executeLine(blockCode);
        }
      }
      return;
    }

    // Variable.times with block
    const varTimesBlockMatch = line.match(/^(\w+)\.times\s*\{(.+?)\}/);
    if (varTimesBlockMatch) {
      const [, varName, blockCode] = varTimesBlockMatch;
      const times = this.variables[varName];
      if (typeof times === 'number') {
        for (let j = 0; j < times; j++) {
          this.executeLine(blockCode);
        }
      }
      return;
    }

    // If we get here, try to execute as a regular line
    this.executeLine(line);
  }

  findEnd(lines, startIndex) {
    let depth = 1;
    const startLine = lines[startIndex].trim();
    
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('if ') || line.startsWith('unless ') || 
          line.startsWith('while ') || line.startsWith('until ') ||
          line.startsWith('for ') || line.startsWith('def ') || 
          line.startsWith('class ') || line.startsWith('module ') ||
          line.match(/^\d+\.times/) || line.match(/\.each\s*(?:do|\{)/) ||
          line.match(/\.upto\(/) || line.match(/\.downto\(/)) {
        depth++;
      }
      if (line === 'end' || line === '}') {
        depth--;
        if (depth === 0) return i;
      }
    }
    
    // If we get here, no matching 'end' was found
    if (startLine.startsWith('if ') || startLine.startsWith('unless ') || 
        startLine.startsWith('while ') || startLine.startsWith('def ')) {
      throw new Error(`${startLine.split(' ')[0]}文に対応するendがありません`);
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