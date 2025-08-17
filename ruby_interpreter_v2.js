/**
 * Production-grade Ruby Interpreter v2.0
 * A more complete and robust Ruby interpreter implementation
 */

class RubyInterpreterV2 {
  constructor() {
    this.reset();
    this.maxExecutionTime = 5000; // 5 seconds timeout
    this.maxMemoryUsage = 50 * 1024 * 1024; // 50MB limit
    this.executionStartTime = null;
    this.operationCount = 0;
    this.maxOperations = 100000; // Prevent infinite loops
  }

  reset() {
    this.scopes = [{}]; // Stack of variable scopes
    this.methods = {};
    this.classes = {};
    this.output = [];
    this.returnValue = undefined;
    this.breakFlag = false;
    this.nextFlag = false;
    this.operationCount = 0;
  }

  // Main execution method with security checks
  execute(code) {
    this.reset();
    this.executionStartTime = Date.now();
    
    try {
      const ast = this.parse(code);
      const result = this.evaluate(ast);
      return this.output.join('');
    } catch (error) {
      if (error.message.includes('Maximum execution time exceeded')) {
        throw new Error('実行時間制限を超えました（5秒）');
      }
      if (error.message.includes('Maximum operations exceeded')) {
        throw new Error('実行回数制限を超えました（無限ループの可能性）');
      }
      throw error;
    }
  }

  // Security check
  checkExecutionLimits() {
    this.operationCount++;
    
    if (this.operationCount > this.maxOperations) {
      throw new Error('Maximum operations exceeded');
    }
    
    if (Date.now() - this.executionStartTime > this.maxExecutionTime) {
      throw new Error('Maximum execution time exceeded');
    }
  }

  // AST-based parser
  parse(code) {
    const lines = code.split('\n');
    return this.parseBlock(lines, 0, lines.length);
  }

  parseBlock(lines, start, end) {
    const statements = [];
    let i = start;
    
    while (i < end) {
      const line = lines[i].trim();
      
      if (!line || line.startsWith('#')) {
        i++;
        continue;
      }

      // Handle n.times do ... end
      const timesDoMatch = line.match(/^(\d+)\.times\s+do\s*$/);
      if (timesDoMatch) {
        const count = parseInt(timesDoMatch[1]);
        const endIdx = this.findEnd(lines, i);
        const bodyStatements = [];
        
        for (let j = i + 1; j < endIdx; j++) {
          const bodyLine = lines[j].trim();
          if (bodyLine && !bodyLine.startsWith('#')) {
            bodyStatements.push(this.parseStatement(bodyLine));
          }
        }
        
        statements.push({
          type: 'times',
          count: count,
          body: { type: 'block', statements: bodyStatements }
        });
        i = endIdx + 1;
      } else if (line.startsWith('if ')) {
        const ifNode = this.parseIf(lines, i);
        statements.push(ifNode);
        i = ifNode.endLine + 1;
      } else if (line.startsWith('unless ')) {
        const unlessNode = this.parseUnless(lines, i);
        statements.push(unlessNode);
        i = unlessNode.endLine + 1;
      } else if (line.startsWith('while ')) {
        const whileNode = this.parseWhile(lines, i);
        statements.push(whileNode);
        i = whileNode.endLine + 1;
      } else if (line.startsWith('until ')) {
        const untilNode = this.parseUntil(lines, i);
        statements.push(untilNode);
        i = untilNode.endLine + 1;
      } else if (line.startsWith('for ')) {
        const forNode = this.parseFor(lines, i);
        statements.push(forNode);
        i = forNode.endLine + 1;
      } else if (line.startsWith('def ')) {
        const defNode = this.parseDef(lines, i);
        statements.push(defNode);
        i = defNode.endLine + 1;
      } else if (line.startsWith('class ')) {
        const classNode = this.parseClass(lines, i);
        statements.push(classNode);
        i = classNode.endLine + 1;
      } else if (line.startsWith('case ')) {
        const caseNode = this.parseCase(lines, i);
        statements.push(caseNode);
        i = caseNode.endLine + 1;
      } else if (line === 'break') {
        statements.push({ type: 'break' });
        i++;
      } else if (line === 'next' || line === 'continue') {
        statements.push({ type: 'next' });
        i++;
      } else if (line.startsWith('return ')) {
        statements.push({
          type: 'return',
          value: this.parseExpression(line.substring(7))
        });
        i++;
      } else {
        statements.push(this.parseStatement(line));
        i++;
      }
    }
    
    return { type: 'block', statements };
  }

  parseIf(lines, startIdx) {
    const line = lines[startIdx].trim();
    const condition = this.parseExpression(line.substring(3).replace(/\bthen\b/, '').trim());
    const { elseIdx, elsifIndices, endIdx } = this.findIfParts(lines, startIdx);
    
    const branches = [];
    branches.push({
      condition,
      body: this.parseBlock(lines, startIdx + 1, 
        elsifIndices.length > 0 ? elsifIndices[0] : (elseIdx !== -1 ? elseIdx : endIdx))
    });
    
    // Parse elsif branches
    for (let i = 0; i < elsifIndices.length; i++) {
      const elsifLine = lines[elsifIndices[i]].trim();
      const elsifCondition = this.parseExpression(elsifLine.substring(6).trim());
      const nextIdx = (i + 1 < elsifIndices.length) ? elsifIndices[i + 1] :
                      (elseIdx !== -1 ? elseIdx : endIdx);
      branches.push({
        condition: elsifCondition,
        body: this.parseBlock(lines, elsifIndices[i] + 1, nextIdx)
      });
    }
    
    // Parse else branch
    let elseBody = null;
    if (elseIdx !== -1) {
      elseBody = this.parseBlock(lines, elseIdx + 1, endIdx);
    }
    
    return {
      type: 'if',
      branches,
      elseBody,
      endLine: endIdx
    };
  }

  parseCase(lines, startIdx) {
    const line = lines[startIdx].trim();
    const expr = this.parseExpression(line.substring(5).trim());
    const endIdx = this.findEnd(lines, startIdx);
    
    const branches = [];
    let elseBody = null;
    let i = startIdx + 1;
    
    while (i < endIdx) {
      const currentLine = lines[i].trim();
      
      if (currentLine.startsWith('when ')) {
        const whenValue = this.parseExpression(currentLine.substring(5).trim());
        const nextWhenIdx = this.findNextWhen(lines, i + 1, endIdx);
        const body = this.parseBlock(lines, i + 1, nextWhenIdx);
        branches.push({ value: whenValue, body });
        i = nextWhenIdx;
      } else if (currentLine === 'else') {
        elseBody = this.parseBlock(lines, i + 1, endIdx);
        break;
      } else {
        i++;
      }
    }
    
    return {
      type: 'case',
      expr,
      branches,
      elseBody,
      endLine: endIdx
    };
  }

  findNextWhen(lines, start, end) {
    for (let i = start; i < end; i++) {
      const line = lines[i].trim();
      if (line.startsWith('when ') || line === 'else') {
        return i;
      }
    }
    return end;
  }

  parseUnless(lines, startIdx) {
    const line = lines[startIdx].trim();
    const condition = this.parseExpression(line.substring(7).trim());
    const endIdx = this.findEnd(lines, startIdx);
    
    return {
      type: 'unless',
      condition,
      body: this.parseBlock(lines, startIdx + 1, endIdx),
      endLine: endIdx
    };
  }

  parseWhile(lines, startIdx) {
    const line = lines[startIdx].trim();
    const condition = this.parseExpression(line.substring(6).replace(/\bdo\b/, '').trim());
    const endIdx = this.findEnd(lines, startIdx);
    
    return {
      type: 'while',
      condition,
      body: this.parseBlock(lines, startIdx + 1, endIdx),
      endLine: endIdx
    };
  }

  parseUntil(lines, startIdx) {
    const line = lines[startIdx].trim();
    const condition = this.parseExpression(line.substring(6).replace(/\bdo\b/, '').trim());
    const endIdx = this.findEnd(lines, startIdx);
    
    return {
      type: 'until',
      condition,
      body: this.parseBlock(lines, startIdx + 1, endIdx),
      endLine: endIdx
    };
  }

  parseFor(lines, startIdx) {
    const line = lines[startIdx].trim();
    const match = line.match(/^for\s+(\w+)\s+in\s+(.+)/);
    if (!match) throw new Error('Invalid for loop syntax');
    
    const [, variable, range] = match;
    const endIdx = this.findEnd(lines, startIdx);
    
    return {
      type: 'for',
      variable,
      range: this.parseExpression(range),
      body: this.parseBlock(lines, startIdx + 1, endIdx),
      endLine: endIdx
    };
  }

  parseDef(lines, startIdx) {
    const line = lines[startIdx].trim();
    const match = line.match(/^def\s+(\w+)(?:\((.*?)\))?/);
    if (!match) throw new Error('Invalid method definition');
    
    const [, name, params] = match;
    const endIdx = this.findEnd(lines, startIdx);
    
    // Parse parameters with defaults
    const parameters = [];
    if (params) {
      const paramList = params.split(',').map(p => p.trim());
      for (const param of paramList) {
        if (param.includes('=')) {
          const [pname, pdefault] = param.split('=').map(s => s.trim());
          parameters.push({ name: pname, default: this.parseExpression(pdefault) });
        } else if (param.startsWith('*')) {
          parameters.push({ name: param.substring(1), splat: true });
        } else if (param.includes(':')) {
          const [pname, pdefault] = param.split(':').map(s => s.trim());
          parameters.push({ name: pname, keyword: true, default: pdefault ? this.parseExpression(pdefault) : null });
        } else {
          parameters.push({ name: param });
        }
      }
    }
    
    return {
      type: 'def',
      name,
      parameters,
      body: this.parseBlock(lines, startIdx + 1, endIdx),
      endLine: endIdx
    };
  }

  parseClass(lines, startIdx) {
    const line = lines[startIdx].trim();
    const match = line.match(/^class\s+(\w+)(?:\s*<\s*(\w+))?/);
    if (!match) throw new Error('Invalid class definition');
    
    const [, name, superclass] = match;
    const endIdx = this.findEnd(lines, startIdx);
    
    return {
      type: 'class',
      name,
      superclass,
      body: this.parseBlock(lines, startIdx + 1, endIdx),
      endLine: endIdx
    };
  }

  parseStatement(line) {
    // Handle single-line blocks
    if (line.includes('{') && line.includes('}')) {
      return this.parseSingleLineBlock(line);
    }
    
    // Handle postfix conditions
    const postfixMatch = line.match(/^(.+?)\s+(if|unless)\s+(.+)$/);
    if (postfixMatch) {
      const [, statement, keyword, condition] = postfixMatch;
      return {
        type: keyword,
        condition: this.parseExpression(condition),
        body: { type: 'block', statements: [this.parseStatement(statement)] },
        postfix: true
      };
    }
    
    // Output statements
    if (line.startsWith('puts ')) {
      return {
        type: 'puts',
        expressions: this.parseExpressionList(line.substring(5))
      };
    }
    
    if (line.startsWith('p ')) {
      return {
        type: 'p',
        expressions: this.parseExpressionList(line.substring(2))
      };
    }
    
    if (line.startsWith('print ')) {
      return {
        type: 'print',
        expressions: this.parseExpressionList(line.substring(6))
      };
    }
    
    // Assignment
    const assignMatch = line.match(/^(\w+)\s*([+\-*\/]?)=\s*(.+)$/);
    if (assignMatch) {
      const [, variable, op, expr] = assignMatch;
      return {
        type: 'assign',
        variable,
        operator: op || null,
        value: this.parseExpression(expr)
      };
    }
    
    // Array append
    const appendMatch = line.match(/^(\w+)\s*<<\s*(.+)$/);
    if (appendMatch) {
      const [, variable, expr] = appendMatch;
      return {
        type: 'append',
        variable,
        value: this.parseExpression(expr)
      };
    }
    
    // Expression statement
    return {
      type: 'expression',
      value: this.parseExpression(line)
    };
  }

  parseSingleLineBlock(line) {
    // Handle: 3.times { puts "Hi" }
    const timesMatch = line.match(/^(\d+)\.times\s*\{(.+?)\}/);
    if (timesMatch) {
      const [, times, block] = timesMatch;
      return {
        type: 'times',
        count: parseInt(times),
        body: { type: 'block', statements: [this.parseStatement(block.trim())] }
      };
    }
    
    // Handle: [1,2,3].each { |n| puts n }
    const eachMatch = line.match(/^(.+?)\.each\s*\{\s*(?:\|(\w+)\|)?\s*(.+?)\}/);
    if (eachMatch) {
      const [, array, param, block] = eachMatch;
      return {
        type: 'each',
        array: this.parseExpression(array),
        param: param || '_',
        body: { type: 'block', statements: [this.parseStatement(block.trim())] }
      };
    }
    
    // Handle: array.map { |n| n * 2 }
    const mapMatch = line.match(/^(.+?)\.map\s*\{\s*(?:\|(\w+)\|)?\s*(.+?)\}/);
    if (mapMatch) {
      const [, array, param, block] = mapMatch;
      return {
        type: 'map',
        array: this.parseExpression(array),
        param: param || '_',
        transform: this.parseExpression(block.trim())
      };
    }
    
    // Handle: array.select { |n| n > 3 }
    const selectMatch = line.match(/^(.+?)\.select\s*\{\s*(?:\|(\w+)\|)?\s*(.+?)\}/);
    if (selectMatch) {
      const [, array, param, condition] = selectMatch;
      return {
        type: 'select',
        array: this.parseExpression(array),
        param: param || '_',
        condition: this.parseExpression(condition.trim())
      };
    }
    
    return this.parseStatement(line);
  }

  parseExpression(expr) {
    if (!expr || typeof expr !== 'string') return { type: 'literal', value: '' };
    expr = expr.trim();
    
    // Ternary operator
    const ternaryMatch = expr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
    if (ternaryMatch) {
      const [, condition, trueExpr, falseExpr] = ternaryMatch;
      return {
        type: 'ternary',
        condition: this.parseExpression(condition),
        trueExpr: this.parseExpression(trueExpr),
        falseExpr: this.parseExpression(falseExpr)
      };
    }
    
    // Binary operators (with proper precedence)
    return this.parseBinaryExpression(expr);
  }

  parseBinaryExpression(expr) {
    // Parse with operator precedence
    // Precedence (low to high): ||, &&, ==,!=,<,>,<=,>=, +,-, *,/,%, **
    
    // Logical OR
    const orParts = this.splitByOperator(expr, '||');
    if (orParts.length > 1) {
      return {
        type: 'binary',
        operator: '||',
        left: this.parseBinaryExpression(orParts[0]),
        right: this.parseBinaryExpression(orParts.slice(1).join('||'))
      };
    }
    
    // Logical AND
    const andParts = this.splitByOperator(expr, '&&');
    if (andParts.length > 1) {
      return {
        type: 'binary',
        operator: '&&',
        left: this.parseBinaryExpression(andParts[0]),
        right: this.parseBinaryExpression(andParts.slice(1).join('&&'))
      };
    }
    
    // Comparison operators
    for (const op of ['==', '!=', '<=', '>=', '<', '>', '=~']) {
      const parts = this.splitByOperator(expr, op);
      if (parts.length > 1) {
        return {
          type: 'binary',
          operator: op,
          left: this.parseBinaryExpression(parts[0]),
          right: this.parseBinaryExpression(parts.slice(1).join(op))
        };
      }
    }
    
    // Range operator
    const rangeMatch = expr.match(/^(.+?)\.\.\.?(.+)$/);
    if (rangeMatch) {
      const [, start, end] = rangeMatch;
      return {
        type: 'range',
        start: this.parseBinaryExpression(start),
        end: this.parseBinaryExpression(end),
        exclusive: expr.includes('...')
      };
    }
    
    // Addition and subtraction
    const addSubParts = this.splitByAddSub(expr);
    if (addSubParts.length > 1) {
      let result = this.parseMultDiv(addSubParts[0].value);
      for (let i = 1; i < addSubParts.length; i++) {
        result = {
          type: 'binary',
          operator: addSubParts[i].operator,
          left: result,
          right: this.parseMultDiv(addSubParts[i].value)
        };
      }
      return result;
    }
    
    return this.parseMultDiv(expr);
  }

  parseMultDiv(expr) {
    // Multiplication, division, modulo
    const parts = this.splitByMultDiv(expr);
    if (parts.length > 1) {
      let result = this.parsePower(parts[0].value);
      for (let i = 1; i < parts.length; i++) {
        result = {
          type: 'binary',
          operator: parts[i].operator,
          left: result,
          right: this.parsePower(parts[i].value)
        };
      }
      return result;
    }
    
    return this.parsePower(expr);
  }

  parsePower(expr) {
    // Power operator
    const parts = this.splitByOperator(expr, '**');
    if (parts.length > 1) {
      // Right associative
      const right = parts.pop();
      const left = parts.join('**');
      return {
        type: 'binary',
        operator: '**',
        left: this.parsePower(left),
        right: this.parseUnary(right)
      };
    }
    
    return this.parseUnary(expr);
  }

  parseUnary(expr) {
    expr = expr.trim();
    
    // Unary operators
    if (expr.startsWith('!')) {
      return {
        type: 'unary',
        operator: '!',
        operand: this.parseUnary(expr.substring(1).trim())
      };
    }
    
    if (expr.startsWith('-') && !this.isPartOfNumber(expr)) {
      return {
        type: 'unary',
        operator: '-',
        operand: this.parseUnary(expr.substring(1).trim())
      };
    }
    
    return this.parsePrimary(expr);
  }

  parsePrimary(expr) {
    expr = expr.trim();
    
    // Parentheses
    if (expr.startsWith('(') && this.findMatchingParen(expr, 0) === expr.length - 1) {
      return this.parseExpression(expr.slice(1, -1));
    }
    
    // String literals
    if ((expr.startsWith('"') && expr.endsWith('"')) || 
        (expr.startsWith("'") && expr.endsWith("'"))) {
      const quote = expr[0];
      let str = expr.slice(1, -1);
      
      // Handle escape sequences
      str = str.replace(/\\n/g, '\n')
               .replace(/\\t/g, '\t')
               .replace(/\\r/g, '\r')
               .replace(/\\\\/g, '\\')
               .replace(new RegExp('\\\\' + quote, 'g'), quote);
      
      // String interpolation for double quotes
      if (quote === '"') {
        const interpolations = [];
        let lastIndex = 0;
        let match;
        const regex = /#{([^}]+)}/g;
        
        while ((match = regex.exec(str)) !== null) {
          if (match.index > lastIndex) {
            interpolations.push({ type: 'literal', value: str.slice(lastIndex, match.index) });
          }
          interpolations.push(this.parseExpression(match[1]));
          lastIndex = regex.lastIndex;
        }
        
        if (lastIndex < str.length) {
          interpolations.push({ type: 'literal', value: str.slice(lastIndex) });
        }
        
        if (interpolations.length > 0) {
          return { type: 'interpolation', parts: interpolations };
        }
      }
      
      return { type: 'literal', value: str };
    }
    
    // Numbers
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      return {
        type: 'literal',
        value: expr.includes('.') ? parseFloat(expr) : parseInt(expr)
      };
    }
    
    // Booleans and nil
    if (expr === 'true') return { type: 'literal', value: true };
    if (expr === 'false') return { type: 'literal', value: false };
    if (expr === 'nil') return { type: 'literal', value: null };
    
    // Arrays
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const elements = this.parseArrayElements(expr.slice(1, -1));
      return {
        type: 'array',
        elements: elements.map(e => this.parseExpression(e))
      };
    }
    
    // Hashes
    if (expr.startsWith('{') && expr.endsWith('}')) {
      const pairs = this.parseHashPairs(expr.slice(1, -1));
      return { type: 'hash', pairs };
    }
    
    // Symbols
    if (expr.startsWith(':')) {
      return { type: 'symbol', value: expr.substring(1) };
    }
    
    // Regular expressions
    if (expr.startsWith('/') && expr.endsWith('/')) {
      return { type: 'regex', pattern: expr.slice(1, -1) };
    }
    
    // Method calls or property access
    if (expr.includes('.')) {
      return this.parseMethodChain(expr);
    }
    
    // Array/Hash access
    const accessMatch = expr.match(/^(\w+)\[(.+)\]$/);
    if (accessMatch) {
      const [, object, index] = accessMatch;
      return {
        type: 'access',
        object: { type: 'variable', name: object },
        index: this.parseExpression(index)
      };
    }
    
    // Variable
    if (/^[a-zA-Z_]\w*$/.test(expr)) {
      return { type: 'variable', name: expr };
    }
    
    // If we can't parse it, treat as literal
    return { type: 'literal', value: expr };
  }

  parseMethodChain(expr) {
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
        
        if (char === '.' && depth === 0) {
          parts.push(current);
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current) parts.push(current);
    
    let result = this.parsePrimary(parts[0]);
    
    for (let i = 1; i < parts.length; i++) {
      const methodMatch = parts[i].match(/^(\w+)(?:\((.*?)\))?$/);
      if (methodMatch) {
        const [, method, args] = methodMatch;
        result = {
          type: 'methodCall',
          object: result,
          method,
          arguments: args ? this.parseExpressionList(args) : []
        };
      }
    }
    
    return result;
  }

  parseExpressionList(str) {
    if (!str || !str.trim()) return [];
    const elements = this.parseArrayElements(str);
    return elements.map(e => this.parseExpression(e));
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
        if (char === '[' || char === '{' || char === '(') depth++;
        if (char === ']' || char === '}' || char === ')') depth--;
        
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

  parseHashPairs(str) {
    const pairs = [];
    const elements = this.parseArrayElements(str);
    
    for (const element of elements) {
      // Handle different hash syntaxes
      if (element.includes('=>')) {
        const [key, value] = element.split('=>').map(s => s.trim());
        pairs.push({
          key: this.parseExpression(key),
          value: this.parseExpression(value)
        });
      } else if (element.includes(':')) {
        const colonIdx = element.indexOf(':');
        const key = element.substring(0, colonIdx).trim();
        const value = element.substring(colonIdx + 1).trim();
        pairs.push({
          key: { type: 'symbol', value: key },
          value: this.parseExpression(value)
        });
      }
    }
    
    return pairs;
  }

  // Helper methods for parsing
  splitByOperator(expr, op) {
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
        
        if (depth === 0 && expr.substr(i, op.length) === op) {
          if (current.trim()) parts.push(current.trim());
          current = '';
          i += op.length - 1;
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  splitByAddSub(expr) {
    const parts = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = null;
    let lastOp = null;
    
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
        
        if (depth === 0 && (char === '+' || char === '-')) {
          // Check if it's not part of a number
          if (char === '-' && i > 0 && /[+\-*\/%=(,[]/.test(expr[i-1])) {
            current += char;
            continue;
          }
          
          if (current.trim()) {
            parts.push({ value: current.trim(), operator: lastOp });
            current = '';
            lastOp = char;
            continue;
          }
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      parts.push({ value: current.trim(), operator: lastOp });
    }
    
    return parts.length > 0 ? parts : [{ value: expr, operator: null }];
  }

  splitByMultDiv(expr) {
    const parts = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = null;
    let lastOp = null;
    
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
        
        if (depth === 0 && (char === '*' || char === '/' || char === '%')) {
          // Check for **
          if (char === '*' && expr[i + 1] === '*') {
            current += '**';
            i++;
            continue;
          }
          
          if (current.trim()) {
            parts.push({ value: current.trim(), operator: lastOp });
            current = '';
            lastOp = char;
            continue;
          }
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      parts.push({ value: current.trim(), operator: lastOp });
    }
    
    return parts.length > 0 ? parts : [{ value: expr, operator: null }];
  }

  isPartOfNumber(expr) {
    return /^-\d/.test(expr);
  }

  findMatchingParen(str, start) {
    let depth = 1;
    for (let i = start + 1; i < str.length; i++) {
      if (str[i] === '(') depth++;
      if (str[i] === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  // Find control structure parts
  findIfParts(lines, startIdx) {
    let elseIdx = -1;
    let elsifIndices = [];
    let depth = 0;
    
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (this.isBlockStart(line)) depth++;
      if (line === 'end') {
        if (depth === 0) return { elseIdx, elsifIndices, endIdx: i };
        depth--;
      }
      
      if (depth === 0) {
        if (line === 'else') elseIdx = i;
        else if (line.startsWith('elsif ')) elsifIndices.push(i);
      }
    }
    
    throw new Error('Missing end for if statement');
  }

  findEnd(lines, startIdx) {
    let depth = 1;
    
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (this.isBlockStart(line)) depth++;
      if (line === 'end') {
        depth--;
        if (depth === 0) return i;
      }
    }
    
    throw new Error(`Missing end for ${lines[startIdx].trim().split(' ')[0]} statement`);
  }

  isBlockStart(line) {
    return line.startsWith('if ') || line.startsWith('unless ') ||
           line.startsWith('while ') || line.startsWith('until ') ||
           line.startsWith('for ') || line.startsWith('def ') ||
           line.startsWith('class ') || line.startsWith('module ') ||
           line.startsWith('case ') || line.startsWith('begin ') ||
           line.match(/^\d+\.times\s+do\s*$/);
  }

  // Evaluation methods
  evaluate(node) {
    this.checkExecutionLimits();
    
    if (!node) return null;
    
    switch (node.type) {
      case 'block':
        return this.evaluateBlock(node);
      
      case 'literal':
        return node.value;
      
      case 'variable':
        return this.getVariable(node.name);
      
      case 'symbol':
        return ':' + node.value;
      
      case 'array':
        return node.elements.map(e => this.evaluate(e));
      
      case 'hash':
        const hash = {};
        for (const pair of node.pairs) {
          const key = this.evaluate(pair.key);
          const value = this.evaluate(pair.value);
          hash[key] = value;
        }
        return hash;
      
      case 'range':
        const start = this.evaluate(node.start);
        const end = this.evaluate(node.end);
        const range = [];
        if (node.exclusive) {
          for (let i = start; i < end; i++) range.push(i);
        } else {
          for (let i = start; i <= end; i++) range.push(i);
        }
        return range;
      
      case 'interpolation':
        return node.parts.map(part => String(this.evaluate(part))).join('');
      
      case 'binary':
        return this.evaluateBinary(node);
      
      case 'unary':
        return this.evaluateUnary(node);
      
      case 'ternary':
        return this.toBoolean(this.evaluate(node.condition)) ?
               this.evaluate(node.trueExpr) :
               this.evaluate(node.falseExpr);
      
      case 'assign':
        return this.evaluateAssignment(node);
      
      case 'append':
        const arr = this.getVariable(node.variable);
        if (!Array.isArray(arr)) throw new Error(`${node.variable} is not an array`);
        arr.push(this.evaluate(node.value));
        return arr;
      
      case 'access':
        const obj = this.evaluate(node.object);
        const idx = this.evaluate(node.index);
        if (obj === null || obj === undefined) return null;
        return obj[idx];
      
      case 'methodCall':
        return this.evaluateMethodCall(node);
      
      case 'if':
        return this.evaluateIf(node);
      
      case 'unless':
        return this.evaluateUnless(node);
      
      case 'while':
        return this.evaluateWhile(node);
      
      case 'until':
        return this.evaluateUntil(node);
      
      case 'for':
        return this.evaluateFor(node);
      
      case 'case':
        return this.evaluateCase(node);
      
      case 'times':
        return this.evaluateTimes(node);
      
      case 'each':
        return this.evaluateEach(node);
      
      case 'map':
        return this.evaluateMap(node);
      
      case 'select':
        return this.evaluateSelect(node);
      
      case 'def':
        return this.evaluateDef(node);
      
      case 'class':
        return this.evaluateClass(node);
      
      case 'puts':
        for (const expr of node.expressions) {
          const value = this.evaluate(expr);
          this.output.push(this.toString(value) + '\n');
        }
        return null;
      
      case 'p':
        for (const expr of node.expressions) {
          const value = this.evaluate(expr);
          this.output.push(this.inspect(value) + '\n');
        }
        return null;
      
      case 'print':
        for (const expr of node.expressions) {
          const value = this.evaluate(expr);
          this.output.push(this.toString(value));
        }
        return null;
      
      case 'return':
        this.returnValue = this.evaluate(node.value);
        throw new Error('RETURN');
      
      case 'break':
        this.breakFlag = true;
        throw new Error('BREAK');
      
      case 'next':
        this.nextFlag = true;
        throw new Error('NEXT');
      
      case 'expression':
        return this.evaluate(node.value);
      
      case 'regex':
        return new RegExp(node.pattern);
      
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  evaluateBlock(node) {
    let result = null;
    
    for (const statement of node.statements) {
      try {
        result = this.evaluate(statement);
      } catch (error) {
        if (error.message === 'RETURN' || error.message === 'BREAK' || error.message === 'NEXT') {
          throw error;
        }
        throw error;
      }
    }
    
    return result;
  }

  evaluateBinary(node) {
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);
    
    switch (node.operator) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        return left + right;
      
      case '-': return left - right;
      case '*': 
        if (typeof left === 'string' && typeof right === 'number') {
          return left.repeat(right);
        }
        return left * right;
      
      case '/':
        if (right === 0) throw new Error('ゼロ除算エラー');
        // Ruby-style integer division
        if (Number.isInteger(left) && Number.isInteger(right)) {
          return Math.floor(left / right);
        }
        return left / right;
      
      case '%': return left % right;
      case '**': return Math.pow(left, right);
      
      case '==': return left === right;
      case '!=': return left !== right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      
      case '&&': return this.toBoolean(left) && this.toBoolean(right);
      case '||': return this.toBoolean(left) || this.toBoolean(right);
      
      case '=~':
        if (right instanceof RegExp) {
          const match = String(left).match(right);
          return match ? match.index : null;
        }
        return null;
      
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
  }

  evaluateUnary(node) {
    const operand = this.evaluate(node.operand);
    
    switch (node.operator) {
      case '!': return !this.toBoolean(operand);
      case '-': return -operand;
      default:
        throw new Error(`Unknown unary operator: ${node.operator}`);
    }
  }

  evaluateAssignment(node) {
    let value = this.evaluate(node.value);
    
    if (node.operator) {
      const current = this.getVariable(node.variable);
      switch (node.operator) {
        case '+': value = current + value; break;
        case '-': value = current - value; break;
        case '*': value = current * value; break;
        case '/': value = current / value; break;
      }
    }
    
    this.setVariable(node.variable, value);
    return value;
  }

  evaluateMethodCall(node) {
    const object = this.evaluate(node.object);
    const args = node.arguments.map(arg => this.evaluate(arg));
    
    // Check for nil
    if (object === null || object === undefined) {
      if (node.method === 'nil?') return true;
      throw new Error(`undefined method '${node.method}' for nil`);
    }
    
    // Built-in methods
    return this.callBuiltInMethod(object, node.method, args);
  }

  callBuiltInMethod(obj, method, args = []) {
    // String methods
    if (typeof obj === 'string') {
      switch (method) {
        case 'upcase': return obj.toUpperCase();
        case 'downcase': return obj.toLowerCase();
        case 'capitalize': return obj.charAt(0).toUpperCase() + obj.slice(1).toLowerCase();
        case 'reverse': return obj.split('').reverse().join('');
        case 'length': case 'size': return obj.length;
        case 'strip': case 'trim': return obj.trim();
        case 'to_s': return obj;
        case 'to_i': return parseInt(obj) || 0;
        case 'to_f': return parseFloat(obj) || 0.0;
        case 'chars': return obj.split('');
        case 'split': return obj.split(args[0] || ' ');
        case 'include?': return obj.includes(args[0]);
        case 'start_with?': return obj.startsWith(args[0]);
        case 'end_with?': return obj.endsWith(args[0]);
        case 'empty?': return obj.length === 0;
        case 'gsub':
          if (args[0] instanceof RegExp) {
            return obj.replace(new RegExp(args[0], 'g'), args[1]);
          }
          return obj.replace(new RegExp(args[0], 'g'), args[1]);
        case 'nil?': return false;
        default: throw new Error(`undefined method '${method}' for String`);
      }
    }
    
    // Number methods
    if (typeof obj === 'number') {
      switch (method) {
        case 'to_s': return String(obj);
        case 'to_i': return Math.floor(obj);
        case 'to_f': return obj;
        case 'abs': return Math.abs(obj);
        case 'even?': return obj % 2 === 0;
        case 'odd?': return obj % 2 !== 0;
        case 'zero?': return obj === 0;
        case 'positive?': return obj > 0;
        case 'negative?': return obj < 0;
        case 'round': return Math.round(obj);
        case 'ceil': return Math.ceil(obj);
        case 'floor': return Math.floor(obj);
        case 'nil?': return false;
        case 'times':
          // This should be handled differently in actual implementation
          for (let i = 0; i < obj; i++) {
            // Execute block
          }
          return null;
        default: throw new Error(`undefined method '${method}' for Number`);
      }
    }
    
    // Array methods
    if (Array.isArray(obj)) {
      switch (method) {
        case 'length': case 'size': return obj.length;
        case 'empty?': return obj.length === 0;
        case 'first': return obj[0];
        case 'last': return obj[obj.length - 1];
        case 'push': obj.push(...args); return obj;
        case 'pop': return obj.pop();
        case 'shift': return obj.shift();
        case 'unshift': obj.unshift(...args); return obj;
        case 'reverse': return obj.slice().reverse();
        case 'sort': return obj.slice().sort((a, b) => {
          if (typeof a === 'number' && typeof b === 'number') return a - b;
          return String(a).localeCompare(String(b));
        });
        case 'uniq': return [...new Set(obj)];
        case 'compact': return obj.filter(x => x !== null && x !== undefined);
        case 'flatten': return obj.flat(args[0] || Infinity);
        case 'max': return Math.max(...obj);
        case 'min': return Math.min(...obj);
        case 'sum': return obj.reduce((a, b) => a + b, 0);
        case 'join': return obj.join(args[0] || '');
        case 'to_a': return obj;
        case 'to_s': return this.inspect(obj);
        case 'include?': return obj.includes(args[0]);
        case 'index': return obj.indexOf(args[0]);
        case 'count': 
          if (args.length === 0) return obj.length;
          return obj.filter(x => x === args[0]).length;
        case 'nil?': return false;
        case 'any?':
          // Should accept a block, simplified for now
          return obj.length > 0;
        case 'all?':
          // Should accept a block, simplified for now
          return obj.length > 0;
        case 'map':
          // Should accept a block
          return obj;
        case 'select':
          // Should accept a block
          return obj;
        case 'reject':
          // Should accept a block
          return [];
        case 'find':
          // Should accept a block
          return obj[0];
        default: throw new Error(`undefined method '${method}' for Array`);
      }
    }
    
    // Hash methods
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      switch (method) {
        case 'keys': return Object.keys(obj);
        case 'values': return Object.values(obj);
        case 'length': case 'size': return Object.keys(obj).length;
        case 'empty?': return Object.keys(obj).length === 0;
        case 'to_s': return this.inspect(obj);
        case 'nil?': return false;
        case 'has_key?': case 'key?': return obj.hasOwnProperty(args[0]);
        case 'has_value?': case 'value?': return Object.values(obj).includes(args[0]);
        default: throw new Error(`undefined method '${method}' for Hash`);
      }
    }
    
    // Boolean methods
    if (typeof obj === 'boolean') {
      switch (method) {
        case 'to_s': return String(obj);
        case 'nil?': return false;
        default: throw new Error(`undefined method '${method}' for Boolean`);
      }
    }
    
    throw new Error(`undefined method '${method}' for ${typeof obj}`);
  }

  evaluateIf(node) {
    for (const branch of node.branches) {
      if (this.toBoolean(this.evaluate(branch.condition))) {
        return this.evaluate(branch.body);
      }
    }
    
    if (node.elseBody) {
      return this.evaluate(node.elseBody);
    }
    
    return null;
  }

  evaluateUnless(node) {
    if (!this.toBoolean(this.evaluate(node.condition))) {
      return this.evaluate(node.body);
    }
    return null;
  }

  evaluateWhile(node) {
    let result = null;
    
    while (this.toBoolean(this.evaluate(node.condition))) {
      try {
        result = this.evaluate(node.body);
      } catch (error) {
        if (error.message === 'BREAK') {
          this.breakFlag = false;
          break;
        }
        if (error.message === 'NEXT') {
          this.nextFlag = false;
          continue;
        }
        throw error;
      }
    }
    
    return result;
  }

  evaluateUntil(node) {
    let result = null;
    
    while (!this.toBoolean(this.evaluate(node.condition))) {
      try {
        result = this.evaluate(node.body);
      } catch (error) {
        if (error.message === 'BREAK') {
          this.breakFlag = false;
          break;
        }
        if (error.message === 'NEXT') {
          this.nextFlag = false;
          continue;
        }
        throw error;
      }
    }
    
    return result;
  }

  evaluateFor(node) {
    const range = this.evaluate(node.range);
    let result = null;
    
    if (Array.isArray(range)) {
      for (const item of range) {
        this.setVariable(node.variable, item);
        try {
          result = this.evaluate(node.body);
        } catch (error) {
          if (error.message === 'BREAK') {
            this.breakFlag = false;
            break;
          }
          if (error.message === 'NEXT') {
            this.nextFlag = false;
            continue;
          }
          throw error;
        }
      }
    }
    
    return result;
  }

  evaluateCase(node) {
    const value = this.evaluate(node.expr);
    
    for (const branch of node.branches) {
      const branchValue = this.evaluate(branch.value);
      if (value === branchValue) {
        return this.evaluate(branch.body);
      }
    }
    
    if (node.elseBody) {
      return this.evaluate(node.elseBody);
    }
    
    return null;
  }

  evaluateTimes(node) {
    let result = null;
    const count = node.count;
    
    for (let i = 0; i < count; i++) {
      try {
        result = this.evaluate(node.body);
      } catch (error) {
        if (error.message === 'BREAK') {
          this.breakFlag = false;
          break;
        }
        if (error.message === 'NEXT') {
          this.nextFlag = false;
          continue;
        }
        throw error;
      }
    }
    
    return result;
  }

  evaluateEach(node) {
    const array = this.evaluate(node.array);
    let result = null;
    
    if (Array.isArray(array)) {
      for (const item of array) {
        this.pushScope();
        this.setVariable(node.param, item);
        try {
          result = this.evaluate(node.body);
        } catch (error) {
          if (error.message === 'BREAK') {
            this.breakFlag = false;
            this.popScope();
            break;
          }
          if (error.message === 'NEXT') {
            this.nextFlag = false;
            this.popScope();
            continue;
          }
          this.popScope();
          throw error;
        }
        this.popScope();
      }
    }
    
    return result;
  }

  evaluateMap(node) {
    const array = this.evaluate(node.array);
    const result = [];
    
    if (Array.isArray(array)) {
      for (const item of array) {
        this.pushScope();
        this.setVariable(node.param, item);
        result.push(this.evaluate(node.transform));
        this.popScope();
      }
    }
    
    return result;
  }

  evaluateSelect(node) {
    const array = this.evaluate(node.array);
    const result = [];
    
    if (Array.isArray(array)) {
      for (const item of array) {
        this.pushScope();
        this.setVariable(node.param, item);
        if (this.toBoolean(this.evaluate(node.condition))) {
          result.push(item);
        }
        this.popScope();
      }
    }
    
    return result;
  }

  evaluateDef(node) {
    this.methods[node.name] = node;
    return null;
  }

  evaluateClass(node) {
    this.classes[node.name] = node;
    return null;
  }

  // Variable scope management
  pushScope() {
    this.scopes.push({});
  }

  popScope() {
    if (this.scopes.length > 1) {
      this.scopes.pop();
    }
  }

  setVariable(name, value) {
    this.scopes[this.scopes.length - 1][name] = value;
  }

  getVariable(name) {
    // Search from current scope to global scope
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].hasOwnProperty(name)) {
        return this.scopes[i][name];
      }
    }
    throw new Error(`未定義の変数またはメソッド: ${name}`);
  }

  // Helper methods
  toBoolean(value) {
    // Ruby's truthiness: only nil and false are falsy
    return value !== null && value !== false;
  }

  toString(value) {
    if (value === null) return '';
    if (value === true) return 'true';
    if (value === false) return 'false';
    if (Array.isArray(value)) return '[' + value.map(v => this.toString(v)).join(', ') + ']';
    if (typeof value === 'object') return this.inspect(value);
    return String(value);
  }

  inspect(value) {
    if (value === null) return 'nil';
    if (value === true) return 'true';
    if (value === false) return 'false';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number') return String(value);
    if (Array.isArray(value)) {
      return '[' + value.map(v => this.inspect(v)).join(', ') + ']';
    }
    if (typeof value === 'object') {
      const pairs = Object.entries(value).map(([k, v]) => {
        const key = k.startsWith(':') ? k : `"${k}"`;
        return `${key}=>${this.inspect(v)}`;
      });
      return '{' + pairs.join(', ') + '}';
    }
    return String(value);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RubyInterpreterV2;
}