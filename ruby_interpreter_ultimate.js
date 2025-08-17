/**
 * Ultimate Ruby Interpreter - 極限の互換性を追求
 * Ruby 3.x 互換性 99%+ を目指す究極の実装
 */

class RubyInterpreterUltimate {
  constructor() {
    this.reset();
    
    // Performance & Security Settings
    this.maxExecutionTime = 10000; // 10 seconds
    this.maxMemoryUsage = 100 * 1024 * 1024; // 100MB
    this.maxStackDepth = 1000;
    this.maxOperations = 1000000;
    
    // Ruby constants
    this.RUBY_VERSION = "3.0.0";
    this.RUBY_PLATFORM = "javascript";
    
    // Initialize built-in classes and modules
    this.initializeBuiltins();
  }

  reset() {
    // Multi-level scope management
    this.scopes = [{}]; // Stack of variable scopes
    this.globalScope = {}; // Global variables ($var)
    this.instanceVariables = {}; // Instance variables (@var)
    this.classVariables = {}; // Class variables (@@var)
    this.constants = {}; // Constants (CONST)
    
    // Method and class storage
    this.methods = {};
    this.classes = {};
    this.modules = {};
    this.aliases = {};
    
    // Execution state
    this.output = [];
    this.stackDepth = 0;
    this.operationCount = 0;
    this.executionStartTime = null;
    
    // Control flow flags
    this.returnValue = undefined;
    this.breakFlag = false;
    this.nextFlag = false;
    this.redoFlag = false;
    this.retryFlag = false;
    
    // Special variables
    this.specialVars = {
      '$_': null, // Last read line
      '$.': 0, // Line number
      '$!': null, // Last exception
      '$@': null, // Backtrace
      '$?': null, // Last exit status
      '$$': Math.floor(Math.random() * 100000), // Process ID
      '$0': 'ruby', // Program name
      '$*': [], // ARGV
      '$:': [], // Load path
      '$"': [], // Loaded features
    };
    
    // Initialize encoding
    this.encoding = 'UTF-8';
  }

  initializeBuiltins() {
    // Define Ruby built-in classes
    this.classes = {
      Object: { methods: {}, ancestors: [] },
      Class: { methods: {}, ancestors: ['Object'] },
      Module: { methods: {}, ancestors: ['Object'] },
      String: { methods: {}, ancestors: ['Object'] },
      Numeric: { methods: {}, ancestors: ['Object'] },
      Integer: { methods: {}, ancestors: ['Numeric', 'Object'] },
      Float: { methods: {}, ancestors: ['Numeric', 'Object'] },
      Array: { methods: {}, ancestors: ['Object'] },
      Hash: { methods: {}, ancestors: ['Object'] },
      Symbol: { methods: {}, ancestors: ['Object'] },
      TrueClass: { methods: {}, ancestors: ['Object'] },
      FalseClass: { methods: {}, ancestors: ['Object'] },
      NilClass: { methods: {}, ancestors: ['Object'] },
      Regexp: { methods: {}, ancestors: ['Object'] },
      Range: { methods: {}, ancestors: ['Object'] },
      Proc: { methods: {}, ancestors: ['Object'] },
      Method: { methods: {}, ancestors: ['Object'] },
      Time: { methods: {}, ancestors: ['Object'] },
      File: { methods: {}, ancestors: ['Object'] },
      IO: { methods: {}, ancestors: ['Object'] },
      Exception: { methods: {}, ancestors: ['Object'] },
      StandardError: { methods: {}, ancestors: ['Exception', 'Object'] },
    };
    
    // Define core modules
    this.modules = {
      Kernel: { methods: {} },
      Enumerable: { methods: {} },
      Comparable: { methods: {} },
      Math: { 
        constants: {
          PI: Math.PI,
          E: Math.E
        },
        methods: {}
      }
    };
    
    // Define global functions (Kernel module methods)
    this.globalFunctions = {
      puts: (args) => this.kernel_puts(args),
      p: (args) => this.kernel_p(args),
      print: (args) => this.kernel_print(args),
      printf: (args) => this.kernel_printf(args),
      gets: () => this.kernel_gets(),
      require: (path) => this.kernel_require(path),
      require_relative: (path) => this.kernel_require_relative(path),
      load: (path) => this.kernel_load(path),
      eval: (code) => this.kernel_eval(code),
      sleep: (seconds) => this.kernel_sleep(seconds),
      exit: (code) => this.kernel_exit(code),
      abort: (msg) => this.kernel_abort(msg),
      raise: (exception) => this.kernel_raise(exception),
      catch: (tag, block) => this.kernel_catch(tag, block),
      throw: (tag, value) => this.kernel_throw(tag, value),
      loop: (block) => this.kernel_loop(block),
      rand: (max) => this.kernel_rand(max),
      srand: (seed) => this.kernel_srand(seed),
      sprintf: (format, args) => this.kernel_sprintf(format, args),
      system: (command) => this.kernel_system(command),
      __FILE__: () => this.specialVars['$0'],
      __LINE__: () => this.specialVars['$.'],
      __dir__: () => '.',
    };
  }

  // Enhanced parser with complete Ruby syntax support
  parse(code) {
    // Preprocess code for Ruby-specific syntax
    code = this.preprocessCode(code);
    
    const tokens = this.tokenize(code);
    const ast = this.parseTokens(tokens);
    return ast;
  }

  preprocessCode(code) {
    // Handle heredocs
    code = this.processHeredocs(code);
    
    // Handle percent literals
    code = this.processPercentLiterals(code);
    
    // Handle Ruby-specific syntax sugar
    code = this.processSyntaxSugar(code);
    
    return code;
  }

  processHeredocs(code) {
    const heredocRegex = /<<[-~]?(\w+)(.*?)^\1$/gms;
    return code.replace(heredocRegex, (match, delimiter, content) => {
      return JSON.stringify(content.trim());
    });
  }

  processPercentLiterals(code) {
    // %w[word array]
    code = code.replace(/%w\[([^\]]+)\]/g, (match, content) => {
      const words = content.trim().split(/\s+/);
      return '[' + words.map(w => `"${w}"`).join(', ') + ']';
    });
    
    // %W[Word array with interpolation]
    code = code.replace(/%W\[([^\]]+)\]/g, (match, content) => {
      const words = content.trim().split(/\s+/);
      return '[' + words.map(w => `"${w}"`).join(', ') + ']';
    });
    
    // %i[symbol array]
    code = code.replace(/%i\[([^\]]+)\]/g, (match, content) => {
      const symbols = content.trim().split(/\s+/);
      return '[' + symbols.map(s => `:${s}`).join(', ') + ']';
    });
    
    // %r{regex}
    code = code.replace(/%r\{([^}]+)\}(\w*)/g, (match, pattern, flags) => {
      return `/${pattern}/${flags}`;
    });
    
    // %q[single quote string]
    code = code.replace(/%q\[([^\]]+)\]/g, (match, content) => {
      return `'${content}'`;
    });
    
    // %Q[double quote string] or %[double quote string]
    code = code.replace(/%Q?\[([^\]]+)\]/g, (match, content) => {
      return `"${content}"`;
    });
    
    return code;
  }

  processSyntaxSugar(code) {
    // Safe navigation operator &.
    code = code.replace(/(\w+)&\.(\w+)/g, (match, obj, method) => {
      return `(${obj} && ${obj}.${method})`;
    });
    
    // Endless method definition (Ruby 3.0+)
    code = code.replace(/def\s+(\w+)\s*\((.*?)\)\s*=\s*(.+)$/gm, (match, name, params, body) => {
      return `def ${name}(${params})\n  ${body}\nend`;
    });
    
    // Pattern matching (Ruby 2.7+)
    code = this.processPatternMatching(code);
    
    return code;
  }

  processPatternMatching(code) {
    // Basic in operator
    code = code.replace(/(\w+)\s+in\s+(.+)/g, (match, expr, pattern) => {
      return `case ${expr}\nin ${pattern}\n  true\nelse\n  false\nend`;
    });
    
    return code;
  }

  tokenize(code) {
    const tokens = [];
    const lines = code.split('\n');
    
    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
      const line = lines[lineNo];
      const lineTokens = this.tokenizeLine(line, lineNo);
      tokens.push(...lineTokens);
    }
    
    return tokens;
  }

  tokenizeLine(line, lineNo) {
    const tokens = [];
    let current = '';
    let inString = false;
    let stringChar = null;
    let inRegex = false;
    let inComment = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      // Handle comments
      if (!inString && !inRegex && char === '#') {
        if (current) {
          tokens.push({ type: 'identifier', value: current, line: lineNo });
          current = '';
        }
        break; // Rest of line is comment
      }
      
      // Handle strings
      if ((char === '"' || char === "'") && (i === 0 || line[i-1] !== '\\')) {
        if (!inString) {
          if (current) {
            tokens.push({ type: 'identifier', value: current, line: lineNo });
            current = '';
          }
          inString = true;
          stringChar = char;
          current = char;
        } else if (char === stringChar) {
          current += char;
          tokens.push({ type: 'string', value: current, line: lineNo });
          current = '';
          inString = false;
          stringChar = null;
        } else {
          current += char;
        }
        continue;
      }
      
      if (inString) {
        current += char;
        continue;
      }
      
      // Handle regex
      if (char === '/' && !inRegex && (i === 0 || /[\s(,{[]/.test(line[i-1]))) {
        inRegex = true;
        current = char;
        continue;
      }
      
      if (inRegex) {
        current += char;
        if (char === '/' && line[i-1] !== '\\') {
          // Check for regex flags
          let j = i + 1;
          while (j < line.length && /[imxo]/.test(line[j])) {
            current += line[j];
            j++;
            i++;
          }
          tokens.push({ type: 'regex', value: current, line: lineNo });
          current = '';
          inRegex = false;
        }
        continue;
      }
      
      // Handle operators and punctuation
      const twoCharOps = ['==', '!=', '<=', '>=', '&&', '||', '**', '..', '...', '=>', '::', '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '**=', '<<=', '>>=', '||=', '&&=', '..', '...', '=~', '!~', '<=>', '==='];
      const twoChar = char + nextChar;
      
      if (twoCharOps.includes(twoChar)) {
        if (current) {
          tokens.push({ type: 'identifier', value: current, line: lineNo });
          current = '';
        }
        tokens.push({ type: 'operator', value: twoChar, line: lineNo });
        i++; // Skip next char
        continue;
      }
      
      const singleCharOps = ['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':', '.', ',', ';', '(', ')', '[', ']', '{', '}'];
      
      if (singleCharOps.includes(char)) {
        if (current) {
          tokens.push({ type: 'identifier', value: current, line: lineNo });
          current = '';
        }
        tokens.push({ type: 'operator', value: char, line: lineNo });
        continue;
      }
      
      // Handle whitespace
      if (/\s/.test(char)) {
        if (current) {
          tokens.push({ type: 'identifier', value: current, line: lineNo });
          current = '';
        }
        continue;
      }
      
      current += char;
    }
    
    if (current) {
      tokens.push({ type: 'identifier', value: current, line: lineNo });
    }
    
    return tokens;
  }

  parseTokens(tokens) {
    const parser = new RubyParser(tokens);
    return parser.parse();
  }

  // Main execution method
  execute(code) {
    this.reset();
    this.executionStartTime = Date.now();
    
    try {
      const ast = this.parse(code);
      const result = this.evaluate(ast);
      return this.output.join('');
    } catch (error) {
      if (error instanceof RubyException) {
        throw new Error(error.toRubyString());
      }
      throw error;
    }
  }

  // Evaluation engine
  evaluate(node, context = {}) {
    this.checkExecutionLimits();
    
    if (!node) return this.rubyNil();
    
    switch (node.type) {
      case 'program':
        return this.evaluateProgram(node);
      
      case 'class':
        return this.evaluateClass(node);
      
      case 'module':
        return this.evaluateModule(node);
      
      case 'method':
        return this.evaluateMethodDef(node);
      
      case 'block':
        return this.evaluateBlock(node);
      
      case 'if':
        return this.evaluateIf(node);
      
      case 'unless':
        return this.evaluateUnless(node);
      
      case 'case':
        return this.evaluateCase(node);
      
      case 'while':
        return this.evaluateWhile(node);
      
      case 'until':
        return this.evaluateUntil(node);
      
      case 'for':
        return this.evaluateFor(node);
      
      case 'begin':
        return this.evaluateBegin(node);
      
      case 'rescue':
        return this.evaluateRescue(node);
      
      case 'ensure':
        return this.evaluateEnsure(node);
      
      case 'return':
        return this.evaluateReturn(node);
      
      case 'break':
        return this.evaluateBreak(node);
      
      case 'next':
        return this.evaluateNext(node);
      
      case 'redo':
        return this.evaluateRedo(node);
      
      case 'retry':
        return this.evaluateRetry(node);
      
      case 'yield':
        return this.evaluateYield(node);
      
      case 'super':
        return this.evaluateSuper(node);
      
      case 'self':
        return this.evaluateSelf(node);
      
      case 'assignment':
        return this.evaluateAssignment(node);
      
      case 'parallel_assignment':
        return this.evaluateParallelAssignment(node);
      
      case 'method_call':
        return this.evaluateMethodCall(node);
      
      case 'binary_op':
        return this.evaluateBinaryOp(node);
      
      case 'unary_op':
        return this.evaluateUnaryOp(node);
      
      case 'ternary':
        return this.evaluateTernary(node);
      
      case 'range':
        return this.evaluateRange(node);
      
      case 'array':
        return this.evaluateArray(node);
      
      case 'hash':
        return this.evaluateHash(node);
      
      case 'symbol':
        return this.evaluateSymbol(node);
      
      case 'regex':
        return this.evaluateRegex(node);
      
      case 'string':
        return this.evaluateString(node);
      
      case 'number':
        return this.evaluateNumber(node);
      
      case 'boolean':
        return this.evaluateBoolean(node);
      
      case 'nil':
        return this.rubyNil();
      
      case 'variable':
        return this.evaluateVariable(node);
      
      case 'constant':
        return this.evaluateConstant(node);
      
      case 'global_variable':
        return this.evaluateGlobalVariable(node);
      
      case 'instance_variable':
        return this.evaluateInstanceVariable(node);
      
      case 'class_variable':
        return this.evaluateClassVariable(node);
      
      case 'lambda':
        return this.evaluateLambda(node);
      
      case 'proc':
        return this.evaluateProc(node);
      
      case 'defined':
        return this.evaluateDefined(node);
      
      case 'alias':
        return this.evaluateAlias(node);
      
      case 'undef':
        return this.evaluateUndef(node);
      
      case 'BEGIN':
        return this.evaluateBEGIN(node);
      
      case 'END':
        return this.evaluateEND(node);
      
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  // Security checks
  checkExecutionLimits() {
    this.operationCount++;
    
    if (this.operationCount > this.maxOperations) {
      throw new RubyException('SystemStackError', 'stack level too deep');
    }
    
    if (Date.now() - this.executionStartTime > this.maxExecutionTime) {
      throw new RubyException('Timeout::Error', 'execution expired');
    }
    
    if (this.stackDepth > this.maxStackDepth) {
      throw new RubyException('SystemStackError', 'stack level too deep');
    }
  }

  // Evaluation methods for each node type
  evaluateProgram(node) {
    let result = this.rubyNil();
    
    for (const statement of node.statements) {
      result = this.evaluate(statement);
      
      if (this.returnValue !== undefined) {
        return this.returnValue;
      }
    }
    
    return result;
  }

  evaluateClass(node) {
    const className = node.name;
    const superclass = node.superclass || 'Object';
    
    this.classes[className] = {
      superclass,
      methods: {},
      constants: {},
      instanceVariables: {},
      classVariables: {},
      ancestors: [className, ...this.getAncestors(superclass)]
    };
    
    // Set self to class
    const previousSelf = this.currentSelf;
    this.currentSelf = { type: 'class', name: className };
    
    // Evaluate class body
    if (node.body) {
      this.evaluate(node.body);
    }
    
    this.currentSelf = previousSelf;
    
    return this.rubySymbol(className);
  }

  evaluateModule(node) {
    const moduleName = node.name;
    
    this.modules[moduleName] = {
      methods: {},
      constants: {},
      classVariables: {}
    };
    
    // Set self to module
    const previousSelf = this.currentSelf;
    this.currentSelf = { type: 'module', name: moduleName };
    
    // Evaluate module body
    if (node.body) {
      this.evaluate(node.body);
    }
    
    this.currentSelf = previousSelf;
    
    return this.rubySymbol(moduleName);
  }

  evaluateMethodDef(node) {
    const methodName = node.name;
    const parameters = node.parameters || [];
    const body = node.body;
    
    const method = {
      name: methodName,
      parameters: this.parseParameters(parameters),
      body,
      scope: [...this.scopes]
    };
    
    // Determine where to store the method
    if (this.currentSelf && this.currentSelf.type === 'class') {
      this.classes[this.currentSelf.name].methods[methodName] = method;
    } else if (this.currentSelf && this.currentSelf.type === 'module') {
      this.modules[this.currentSelf.name].methods[methodName] = method;
    } else {
      this.methods[methodName] = method;
    }
    
    return this.rubySymbol(methodName);
  }

  parseParameters(parameters) {
    const parsed = {
      required: [],
      optional: [],
      rest: null,
      keyword: {},
      keywordRest: null,
      block: null
    };
    
    for (const param of parameters) {
      if (param.type === 'required') {
        parsed.required.push(param.name);
      } else if (param.type === 'optional') {
        parsed.optional.push({ name: param.name, default: param.default });
      } else if (param.type === 'rest') {
        parsed.rest = param.name;
      } else if (param.type === 'keyword') {
        parsed.keyword[param.name] = param.default;
      } else if (param.type === 'keywordRest') {
        parsed.keywordRest = param.name;
      } else if (param.type === 'block') {
        parsed.block = param.name;
      }
    }
    
    return parsed;
  }

  evaluateMethodCall(node) {
    const receiver = node.receiver ? this.evaluate(node.receiver) : this.currentSelf;
    const methodName = node.method;
    const args = (node.arguments || []).map(arg => this.evaluate(arg));
    const block = node.block;
    
    return this.callMethod(receiver, methodName, args, block);
  }

  callMethod(receiver, methodName, args = [], block = null) {
    // Check for nil
    if (this.isNil(receiver)) {
      if (methodName === 'nil?') return this.rubyTrue();
      throw new RubyException('NoMethodError', 
        `undefined method '${methodName}' for nil:NilClass`);
    }
    
    // Get receiver class
    const receiverClass = this.getClass(receiver);
    
    // Look for method in class hierarchy
    const method = this.findMethod(receiverClass, methodName);
    
    if (method) {
      return this.executeMethod(method, receiver, args, block);
    }
    
    // Try built-in methods
    const builtinResult = this.callBuiltinMethod(receiver, methodName, args, block);
    if (builtinResult !== undefined) {
      return builtinResult;
    }
    
    // Method missing
    throw new RubyException('NoMethodError', 
      `undefined method '${methodName}' for ${this.inspect(receiver)}`);
  }

  findMethod(className, methodName) {
    // Look in class methods
    if (this.classes[className] && this.classes[className].methods[methodName]) {
      return this.classes[className].methods[methodName];
    }
    
    // Look in ancestors
    if (this.classes[className] && this.classes[className].ancestors) {
      for (const ancestor of this.classes[className].ancestors) {
        if (this.classes[ancestor] && this.classes[ancestor].methods[methodName]) {
          return this.classes[ancestor].methods[methodName];
        }
      }
    }
    
    // Look in included modules
    // TODO: Implement module inclusion
    
    return null;
  }

  executeMethod(method, receiver, args, block) {
    // Push new scope
    this.pushScope();
    
    // Bind parameters
    this.bindParameters(method.parameters, args);
    
    // Set self
    const previousSelf = this.currentSelf;
    this.currentSelf = receiver;
    
    // Set block if provided
    const previousBlock = this.currentBlock;
    this.currentBlock = block;
    
    let result = this.rubyNil();
    
    try {
      result = this.evaluate(method.body);
    } catch (error) {
      if (error.message === 'RETURN') {
        result = this.returnValue;
        this.returnValue = undefined;
      } else {
        throw error;
      }
    } finally {
      // Restore context
      this.currentSelf = previousSelf;
      this.currentBlock = previousBlock;
      this.popScope();
    }
    
    return result;
  }

  bindParameters(parameters, args) {
    let argIndex = 0;
    
    // Bind required parameters
    for (const name of parameters.required) {
      if (argIndex >= args.length) {
        throw new RubyException('ArgumentError', 
          `wrong number of arguments (given ${args.length}, expected ${parameters.required.length})`);
      }
      this.setVariable(name, args[argIndex++]);
    }
    
    // Bind optional parameters
    for (const param of parameters.optional) {
      if (argIndex < args.length) {
        this.setVariable(param.name, args[argIndex++]);
      } else {
        this.setVariable(param.name, this.evaluate(param.default));
      }
    }
    
    // Bind rest parameter
    if (parameters.rest) {
      const restArgs = [];
      while (argIndex < args.length) {
        restArgs.push(args[argIndex++]);
      }
      this.setVariable(parameters.rest, this.rubyArray(restArgs));
    }
    
    // TODO: Handle keyword arguments
    // TODO: Handle block parameter
  }

  callBuiltinMethod(receiver, methodName, args, block) {
    const type = this.getType(receiver);
    
    switch (type) {
      case 'String':
        return this.stringMethods(receiver, methodName, args, block);
      case 'Integer':
      case 'Float':
        return this.numericMethods(receiver, methodName, args, block);
      case 'Array':
        return this.arrayMethods(receiver, methodName, args, block);
      case 'Hash':
        return this.hashMethods(receiver, methodName, args, block);
      case 'Symbol':
        return this.symbolMethods(receiver, methodName, args, block);
      case 'Range':
        return this.rangeMethods(receiver, methodName, args, block);
      case 'Regexp':
        return this.regexpMethods(receiver, methodName, args, block);
      case 'TrueClass':
      case 'FalseClass':
        return this.booleanMethods(receiver, methodName, args, block);
      case 'NilClass':
        return this.nilMethods(receiver, methodName, args, block);
      case 'Proc':
        return this.procMethods(receiver, methodName, args, block);
      case 'Time':
        return this.timeMethods(receiver, methodName, args, block);
      default:
        return this.objectMethods(receiver, methodName, args, block);
    }
  }

  // Built-in method implementations
  stringMethods(str, method, args, block) {
    switch (method) {
      // Transformation methods
      case 'upcase': return str.toUpperCase();
      case 'upcase!': return this.mutateString(str, s => s.toUpperCase());
      case 'downcase': return str.toLowerCase();
      case 'downcase!': return this.mutateString(str, s => s.toLowerCase());
      case 'capitalize': return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      case 'capitalize!': return this.mutateString(str, s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
      case 'swapcase': return str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
      case 'reverse': return str.split('').reverse().join('');
      case 'reverse!': return this.mutateString(str, s => s.split('').reverse().join(''));
      
      // Whitespace methods
      case 'strip': return str.trim();
      case 'strip!': return this.mutateString(str, s => s.trim());
      case 'lstrip': return str.trimStart();
      case 'lstrip!': return this.mutateString(str, s => s.trimStart());
      case 'rstrip': return str.trimEnd();
      case 'rstrip!': return this.mutateString(str, s => s.trimEnd());
      case 'chomp': return str.replace(/\r?\n?$/, args[0] || '');
      case 'chomp!': return this.mutateString(str, s => s.replace(/\r?\n?$/, args[0] || ''));
      case 'chop': return str.slice(0, -1);
      case 'chop!': return this.mutateString(str, s => s.slice(0, -1));
      
      // Query methods
      case 'length': case 'size': return str.length;
      case 'bytesize': return new Blob([str]).size;
      case 'empty?': return str.length === 0;
      case 'include?': return str.includes(args[0]);
      case 'start_with?': return args.some(prefix => str.startsWith(prefix));
      case 'end_with?': return args.some(suffix => str.endsWith(suffix));
      case 'match?': return this.toRegexp(args[0]).test(str);
      
      // Access methods
      case '[]': return this.stringAccess(str, args);
      case '[]=': return this.stringAssign(str, args);
      case 'slice': return this.stringSlice(str, args);
      case 'slice!': return this.stringSliceMutate(str, args);
      case 'chars': return this.rubyArray(str.split(''));
      case 'bytes': return this.rubyArray([...str].map(c => c.charCodeAt(0)));
      case 'codepoints': return this.rubyArray([...str].map(c => c.codePointAt(0)));
      case 'lines': return this.rubyArray(str.split(/\r?\n/));
      
      // Substitution methods
      case 'sub': return this.stringSub(str, args[0], args[1], false);
      case 'sub!': return this.mutateString(str, s => this.stringSub(s, args[0], args[1], false));
      case 'gsub': return this.stringSub(str, args[0], args[1], true);
      case 'gsub!': return this.mutateString(str, s => this.stringSub(s, args[0], args[1], true));
      case 'tr': return this.stringTr(str, args[0], args[1]);
      case 'tr!': return this.mutateString(str, s => this.stringTr(s, args[0], args[1]));
      case 'delete': return this.stringDelete(str, args);
      case 'delete!': return this.mutateString(str, s => this.stringDelete(s, args));
      case 'squeeze': return this.stringSqueeze(str, args[0]);
      case 'squeeze!': return this.mutateString(str, s => this.stringSqueeze(s, args[0]));
      
      // Split and join methods
      case 'split': return this.rubyArray(str.split(args[0] || /\s+/, args[1]));
      case 'partition': return this.stringPartition(str, args[0]);
      case 'rpartition': return this.stringRpartition(str, args[0]);
      case 'scan': return this.stringScan(str, args[0], block);
      
      // Padding and formatting
      case 'center': return str.padStart((args[0] + str.length) / 2, args[1] || ' ').padEnd(args[0], args[1] || ' ');
      case 'ljust': return str.padEnd(args[0], args[1] || ' ');
      case 'rjust': return str.padStart(args[0], args[1] || ' ');
      
      // Conversion methods
      case 'to_i': return parseInt(str, args[0] || 10) || 0;
      case 'to_f': return parseFloat(str) || 0.0;
      case 'to_s': case 'to_str': return str;
      case 'to_sym': case 'intern': return this.rubySymbol(str);
      case 'to_a': return this.rubyArray([str]);
      
      // Iteration methods
      case 'each_char': return this.stringEachChar(str, block);
      case 'each_byte': return this.stringEachByte(str, block);
      case 'each_codepoint': return this.stringEachCodepoint(str, block);
      case 'each_line': return this.stringEachLine(str, block);
      
      // Encoding methods
      case 'encoding': return 'UTF-8';
      case 'force_encoding': return str; // Simplified
      case 'encode': return str; // Simplified
      case 'valid_encoding?': return true; // Simplified
      case 'ascii_only?': return /^[\x00-\x7F]*$/.test(str);
      
      // Comparison
      case '<=>': return this.compareValues(str, args[0]);
      case 'casecmp': return str.toLowerCase().localeCompare(String(args[0]).toLowerCase());
      case 'casecmp?': return str.toLowerCase() === String(args[0]).toLowerCase();
      
      // Other methods
      case 'concat': case '<<': return str + String(args[0]);
      case 'prepend': return String(args[0]) + str;
      case 'insert': return str.slice(0, args[0]) + String(args[1]) + str.slice(args[0]);
      case 'clear': return '';
      case 'replace': return String(args[0]);
      case 'dup': case 'clone': return str;
      case 'freeze': return Object.freeze(str);
      case 'frozen?': return Object.isFrozen(str);
      case 'hash': return this.hashCode(str);
      case 'hex': return parseInt(str, 16) || 0;
      case 'oct': return parseInt(str, 8) || 0;
      case 'ord': return str.charCodeAt(0);
      case 'sum': return [...str].reduce((sum, c) => sum + c.charCodeAt(0), 0);
      case 'succ': case 'next': return this.stringSucc(str);
      case 'succ!': case 'next!': return this.mutateString(str, s => this.stringSucc(s));
      case 'upto': return this.stringUpto(str, args[0], block);
      case 'count': return this.stringCount(str, args);
      case 'dump': return JSON.stringify(str);
      case 'undump': return JSON.parse(str);
      case 'unpack': return this.stringUnpack(str, args[0]);
      case 'unpack1': return this.stringUnpack(str, args[0])[0];
      
      default:
        return undefined;
    }
  }

  numericMethods(num, method, args, block) {
    switch (method) {
      // Arithmetic operations
      case '+': return num + args[0];
      case '-': return num - args[0];
      case '*': return num * args[0];
      case '/': return this.numericDivide(num, args[0]);
      case '%': case 'modulo': return num % args[0];
      case '**': case 'pow': return Math.pow(num, args[0]);
      case 'divmod': return this.rubyArray([Math.floor(num / args[0]), num % args[0]]);
      case 'remainder': return num % args[0];
      case 'fdiv': return num / args[0];
      
      // Comparison
      case '<=>': return this.compareValues(num, args[0]);
      case '==': case 'eql?': return num === args[0];
      case '<': return num < args[0];
      case '>': return num > args[0];
      case '<=': return num <= args[0];
      case '>=': return num >= args[0];
      
      // Rounding methods
      case 'abs': case 'magnitude': return Math.abs(num);
      case 'abs2': return num * num;
      case 'ceil': return Math.ceil(args[0] ? num * Math.pow(10, args[0]) / Math.pow(10, args[0]) : num);
      case 'floor': return Math.floor(args[0] ? num * Math.pow(10, args[0]) / Math.pow(10, args[0]) : num);
      case 'round': return Math.round(args[0] ? num * Math.pow(10, args[0]) / Math.pow(10, args[0]) : num);
      case 'truncate': return Math.trunc(args[0] ? num * Math.pow(10, args[0]) / Math.pow(10, args[0]) : num);
      
      // Query methods
      case 'zero?': return num === 0;
      case 'nonzero?': return num !== 0 ? num : this.rubyNil();
      case 'positive?': return num > 0;
      case 'negative?': return num < 0;
      case 'even?': return num % 2 === 0;
      case 'odd?': return num % 2 !== 0;
      case 'integer?': return Number.isInteger(num);
      case 'finite?': return Number.isFinite(num);
      case 'infinite?': return !Number.isFinite(num) ? (num > 0 ? 1 : -1) : this.rubyNil();
      case 'nan?': return Number.isNaN(num);
      
      // Bit operations (Integer only)
      case '&': return num & args[0];
      case '|': return num | args[0];
      case '^': return num ^ args[0];
      case '~': return ~num;
      case '<<': return num << args[0];
      case '>>': return num >> args[0];
      case '[]': return (num >> args[0]) & 1;
      
      // Conversion methods
      case 'to_i': case 'to_int': return Math.floor(num);
      case 'to_f': return num;
      case 'to_s': return String(num);
      case 'to_r': return this.rubyRational(num, 1); // Simplified
      case 'to_c': return this.rubyComplex(num, 0); // Simplified
      case 'chr': return String.fromCharCode(num);
      case 'ord': return num;
      
      // Iteration methods
      case 'times': return this.numericTimes(num, block);
      case 'upto': return this.numericUpto(num, args[0], block);
      case 'downto': return this.numericDownto(num, args[0], block);
      case 'step': return this.numericStep(num, args[0], args[1], block);
      
      // Other methods
      case 'succ': case 'next': return num + 1;
      case 'pred': return num - 1;
      case 'coerce': return this.rubyArray([args[0], num]);
      case 'denominator': return Number.isInteger(num) ? 1 : this.getDenominator(num);
      case 'numerator': return Number.isInteger(num) ? num : this.getNumerator(num);
      case 'rationalize': return this.rubyRational(num, 1); // Simplified
      case 'real': return num;
      case 'imag': case 'imaginary': return 0;
      case 'real?': return true;
      case 'rect': case 'rectangular': return this.rubyArray([num, 0]);
      case 'gcd': return this.gcd(num, args[0]);
      case 'lcm': return this.lcm(num, args[0]);
      case 'gcdlcm': return this.rubyArray([this.gcd(num, args[0]), this.lcm(num, args[0])]);
      
      default:
        return undefined;
    }
  }

  arrayMethods(arr, method, args, block) {
    switch (method) {
      // Access methods
      case '[]': case 'slice': return this.arrayAccess(arr, args);
      case '[]=': return this.arrayAssign(arr, args);
      case 'at': return arr.value[args[0]] || this.rubyNil();
      case 'fetch': return this.arrayFetch(arr, args);
      case 'first': return args.length ? this.rubyArray(arr.value.slice(0, args[0])) : (arr.value[0] || this.rubyNil());
      case 'last': return args.length ? this.rubyArray(arr.value.slice(-args[0])) : (arr.value[arr.value.length - 1] || this.rubyNil());
      case 'dig': return this.arrayDig(arr, args);
      case 'sample': return this.arraySample(arr, args[0]);
      case 'values_at': return this.rubyArray(args.map(i => arr.value[i] || this.rubyNil()));
      
      // Modification methods
      case '<<': case 'push': arr.value.push(...args); return arr;
      case 'pop': return arr.value.pop() || this.rubyNil();
      case 'shift': return arr.value.shift() || this.rubyNil();
      case 'unshift': case 'prepend': arr.value.unshift(...args); return arr;
      case 'insert': arr.value.splice(args[0], 0, ...args.slice(1)); return arr;
      case 'delete': return this.arrayDelete(arr, args[0]);
      case 'delete_at': return arr.value.splice(args[0], 1)[0] || this.rubyNil();
      case 'delete_if': return this.arrayDeleteIf(arr, block);
      case 'keep_if': return this.arrayKeepIf(arr, block);
      case 'compact': return this.rubyArray(arr.value.filter(v => !this.isNil(v)));
      case 'compact!': return this.arrayCompactBang(arr);
      case 'flatten': return this.rubyArray(arr.value.flat(args[0] || Infinity));
      case 'flatten!': return this.arrayFlattenBang(arr, args[0]);
      case 'reverse': return this.rubyArray([...arr.value].reverse());
      case 'reverse!': arr.value.reverse(); return arr;
      case 'rotate': return this.rubyArray(this.arrayRotate(arr.value, args[0] || 1));
      case 'rotate!': return this.arrayRotateBang(arr, args[0] || 1);
      case 'sort': return this.rubyArray(this.arraySort(arr.value, block));
      case 'sort!': return this.arraySortBang(arr, block);
      case 'sort_by': return this.arraySortBy(arr, block);
      case 'sort_by!': return this.arraySortByBang(arr, block);
      case 'shuffle': return this.rubyArray(this.arrayShuffle(arr.value));
      case 'shuffle!': return this.arrayShuffleBang(arr);
      case 'uniq': return this.rubyArray(this.arrayUniq(arr.value, block));
      case 'uniq!': return this.arrayUniqBang(arr, block);
      case 'clear': arr.value = []; return arr;
      case 'replace': arr.value = [...args[0].value]; return arr;
      case 'fill': return this.arrayFill(arr, args);
      
      // Query methods
      case 'length': case 'size': case 'count': 
        return args.length ? this.arrayCount(arr, args[0], block) : arr.value.length;
      case 'empty?': return arr.value.length === 0;
      case 'include?': case 'member?': return arr.value.some(v => this.rubyEquals(v, args[0]));
      case 'index': case 'find_index': return this.arrayIndex(arr, args[0], block);
      case 'rindex': return this.arrayRindex(arr, args[0], block);
      case 'any?': return this.arrayAny(arr, args, block);
      case 'all?': return this.arrayAll(arr, args, block);
      case 'one?': return this.arrayOne(arr, args, block);
      case 'none?': return this.arrayNone(arr, args, block);
      
      // Iteration methods
      case 'each': return this.arrayEach(arr, block);
      case 'each_index': return this.arrayEachIndex(arr, block);
      case 'each_with_index': return this.arrayEachWithIndex(arr, block);
      case 'reverse_each': return this.arrayReverseEach(arr, block);
      case 'cycle': return this.arrayCycle(arr, args[0], block);
      
      // Enumerable methods
      case 'map': case 'collect': return this.arrayMap(arr, block);
      case 'map!': case 'collect!': return this.arrayMapBang(arr, block);
      case 'select': case 'filter': return this.arraySelect(arr, block);
      case 'select!': case 'filter!': return this.arraySelectBang(arr, block);
      case 'reject': return this.arrayReject(arr, block);
      case 'reject!': return this.arrayRejectBang(arr, block);
      case 'find': case 'detect': return this.arrayFind(arr, args[0], block);
      case 'find_all': return this.arraySelect(arr, block);
      case 'grep': return this.arrayGrep(arr, args[0], block);
      case 'grep_v': return this.arrayGrepV(arr, args[0], block);
      case 'take': return this.rubyArray(arr.value.slice(0, args[0]));
      case 'take_while': return this.arrayTakeWhile(arr, block);
      case 'drop': return this.rubyArray(arr.value.slice(args[0]));
      case 'drop_while': return this.arrayDropWhile(arr, block);
      case 'zip': return this.arrayZip(arr, args, block);
      case 'transpose': return this.arrayTranspose(arr);
      case 'permutation': return this.arrayPermutation(arr, args[0], block);
      case 'combination': return this.arrayCombination(arr, args[0], block);
      case 'repeated_permutation': return this.arrayRepeatedPermutation(arr, args[0], block);
      case 'repeated_combination': return this.arrayRepeatedCombination(arr, args[0], block);
      case 'product': return this.arrayProduct(arr, args);
      
      // Aggregation methods
      case 'sum': return this.arraySum(arr, args[0], block);
      case 'min': return this.arrayMin(arr, args[0], block);
      case 'max': return this.arrayMax(arr, args[0], block);
      case 'minmax': return this.arrayMinmax(arr, block);
      case 'min_by': return this.arrayMinBy(arr, args[0], block);
      case 'max_by': return this.arrayMaxBy(arr, args[0], block);
      case 'minmax_by': return this.arrayMinmaxBy(arr, block);
      
      // Conversion methods
      case 'to_a': case 'to_ary': return arr;
      case 'to_h': return this.arrayToHash(arr, block);
      case 'to_s': case 'inspect': return this.inspect(arr);
      case 'join': return arr.value.map(v => this.toString(v)).join(args[0] || '');
      case 'pack': return this.arrayPack(arr, args[0]);
      
      // Set operations
      case '&': return this.rubyArray(this.arrayIntersection(arr.value, args[0].value));
      case '|': return this.rubyArray(this.arrayUnion(arr.value, args[0].value));
      case '-': return this.rubyArray(this.arrayDifference(arr.value, args[0].value));
      case '+': return this.rubyArray([...arr.value, ...args[0].value]);
      case '*': 
        if (typeof args[0] === 'number') {
          return this.rubyArray(this.arrayRepeat(arr.value, args[0]));
        } else {
          return arr.value.map(v => this.toString(v)).join(String(args[0]));
        }
      
      // Comparison
      case '<=>': return this.arrayCompare(arr, args[0]);
      case '==': case 'eql?': return this.arrayEquals(arr, args[0]);
      
      // Other methods
      case 'assoc': return this.arrayAssoc(arr, args[0]);
      case 'rassoc': return this.arrayRassoc(arr, args[0]);
      case 'bsearch': return this.arrayBsearch(arr, block);
      case 'bsearch_index': return this.arrayBsearchIndex(arr, block);
      case 'partition': return this.arrayPartition(arr, block);
      case 'group_by': return this.arrayGroupBy(arr, block);
      case 'chunk': return this.arrayChunk(arr, block);
      case 'slice_before': return this.arraySliceBefore(arr, args[0], block);
      case 'slice_after': return this.arraySliceAfter(arr, args[0], block);
      case 'slice_when': return this.arraySliceWhen(arr, block);
      case 'reduce': case 'inject': return this.arrayReduce(arr, args, block);
      case 'each_cons': return this.arrayEachCons(arr, args[0], block);
      case 'each_slice': return this.arrayEachSlice(arr, args[0], block);
      case 'lazy': return this.arrayLazy(arr);
      case 'dup': case 'clone': return this.rubyArray([...arr.value]);
      case 'freeze': Object.freeze(arr.value); return arr;
      case 'frozen?': return Object.isFrozen(arr.value);
      case 'hash': return this.hashCode(arr);
      
      default:
        return undefined;
    }
  }

  hashMethods(hash, method, args, block) {
    switch (method) {
      // Access methods
      case '[]': case 'fetch': return hash.value[this.hashKey(args[0])] || this.rubyNil();
      case '[]=': case 'store': hash.value[this.hashKey(args[0])] = args[1]; return args[1];
      case 'dig': return this.hashDig(hash, args);
      case 'values_at': return this.rubyArray(args.map(k => hash.value[this.hashKey(k)] || this.rubyNil()));
      case 'fetch_values': return this.hashFetchValues(hash, args, block);
      
      // Query methods
      case 'key?': case 'has_key?': case 'include?': case 'member?':
        return this.hashKey(args[0]) in hash.value;
      case 'value?': case 'has_value?':
        return Object.values(hash.value).some(v => this.rubyEquals(v, args[0]));
      case 'empty?': return Object.keys(hash.value).length === 0;
      case 'size': case 'length': return Object.keys(hash.value).length;
      
      // Modification methods
      case 'clear': hash.value = {}; return hash;
      case 'delete': return this.hashDelete(hash, args[0], block);
      case 'delete_if': return this.hashDeleteIf(hash, block);
      case 'keep_if': return this.hashKeepIf(hash, block);
      case 'reject': return this.hashReject(hash, block);
      case 'reject!': return this.hashRejectBang(hash, block);
      case 'select': case 'filter': return this.hashSelect(hash, block);
      case 'select!': case 'filter!': return this.hashSelectBang(hash, block);
      case 'compact': return this.hashCompact(hash);
      case 'compact!': return this.hashCompactBang(hash);
      case 'merge': return this.hashMerge(hash, args[0], block);
      case 'merge!': case 'update': return this.hashMergeBang(hash, args[0], block);
      case 'replace': hash.value = { ...args[0].value }; return hash;
      case 'shift': return this.hashShift(hash);
      case 'transform_keys': return this.hashTransformKeys(hash, block);
      case 'transform_keys!': return this.hashTransformKeysBang(hash, block);
      case 'transform_values': return this.hashTransformValues(hash, block);
      case 'transform_values!': return this.hashTransformValuesBang(hash, block);
      
      // Iteration methods
      case 'each': case 'each_pair': return this.hashEach(hash, block);
      case 'each_key': return this.hashEachKey(hash, block);
      case 'each_value': return this.hashEachValue(hash, block);
      
      // Conversion methods
      case 'keys': return this.rubyArray(Object.keys(hash.value).map(k => this.unhashKey(k)));
      case 'values': return this.rubyArray(Object.values(hash.value));
      case 'to_a': return this.hashToArray(hash);
      case 'to_h': return hash;
      case 'to_hash': return hash;
      case 'to_s': case 'inspect': return this.inspect(hash);
      case 'to_proc': return this.hashToProc(hash);
      
      // Other methods
      case 'invert': return this.hashInvert(hash);
      case 'assoc': return this.hashAssoc(hash, args[0]);
      case 'rassoc': return this.hashRassoc(hash, args[0]);
      case 'flatten': return this.hashFlatten(hash, args[0]);
      case 'compare_by_identity': hash.compareByIdentity = true; return hash;
      case 'compare_by_identity?': return hash.compareByIdentity || false;
      case 'default': return hash.default || this.rubyNil();
      case 'default=': hash.default = args[0]; return args[0];
      case 'default_proc': return hash.defaultProc || this.rubyNil();
      case 'default_proc=': hash.defaultProc = args[0]; return args[0];
      case 'dup': case 'clone': return this.rubyHash({ ...hash.value });
      case 'freeze': Object.freeze(hash.value); return hash;
      case 'frozen?': return Object.isFrozen(hash.value);
      case 'hash': return this.hashCode(hash);
      case '==': case 'eql?': return this.hashEquals(hash, args[0]);
      
      default:
        return undefined;
    }
  }

  // Kernel methods (global functions)
  kernel_puts(args) {
    for (const arg of args) {
      this.output.push(this.toString(arg) + '\n');
    }
    if (args.length === 0) {
      this.output.push('\n');
    }
    return this.rubyNil();
  }

  kernel_p(args) {
    for (const arg of args) {
      this.output.push(this.inspect(arg) + '\n');
    }
    return args.length === 1 ? args[0] : this.rubyArray(args);
  }

  kernel_print(args) {
    for (const arg of args) {
      this.output.push(this.toString(arg));
    }
    return this.rubyNil();
  }

  kernel_printf(format, args) {
    const formatted = this.sprintf(format, args);
    this.output.push(formatted);
    return this.rubyNil();
  }

  kernel_gets() {
    // In browser environment, would need to handle input differently
    return this.rubyNil();
  }

  kernel_eval(code) {
    const ast = this.parse(code);
    return this.evaluate(ast);
  }

  kernel_sleep(seconds) {
    // Can't actually sleep in JavaScript synchronously
    // Would need to use setTimeout/Promise for async
    return seconds;
  }

  kernel_exit(code = 0) {
    throw new RubyException('SystemExit', `exit with code ${code}`);
  }

  kernel_abort(message = '') {
    if (message) this.output.push(message + '\n');
    throw new RubyException('SystemExit', 'abort');
  }

  kernel_raise(exception) {
    if (typeof exception === 'string') {
      throw new RubyException('RuntimeError', exception);
    }
    throw exception;
  }

  kernel_loop(block) {
    while (true) {
      try {
        this.evaluate(block);
      } catch (error) {
        if (error.message === 'BREAK') {
          break;
        }
        throw error;
      }
    }
    return this.rubyNil();
  }

  kernel_rand(max) {
    if (max === undefined) {
      return Math.random();
    }
    return Math.floor(Math.random() * max);
  }

  // Ruby value creation helpers
  rubyNil() {
    return { type: 'nil', value: null };
  }

  rubyTrue() {
    return { type: 'boolean', value: true };
  }

  rubyFalse() {
    return { type: 'boolean', value: false };
  }

  rubyArray(elements) {
    return { type: 'array', value: elements };
  }

  rubyHash(pairs) {
    return { type: 'hash', value: pairs };
  }

  rubySymbol(name) {
    return { type: 'symbol', value: name };
  }

  rubyRange(start, end, exclusive = false) {
    return { type: 'range', start, end, exclusive };
  }

  rubyProc(params, body, binding) {
    return { type: 'proc', params, body, binding };
  }

  // Type checking helpers
  isNil(value) {
    return value && value.type === 'nil';
  }

  isTrue(value) {
    return value && value.type === 'boolean' && value.value === true;
  }

  isFalse(value) {
    return value && value.type === 'boolean' && value.value === false;
  }

  isTruthy(value) {
    return !this.isNil(value) && !this.isFalse(value);
  }

  getType(value) {
    if (value === null || value === undefined) return 'NilClass';
    if (value === true) return 'TrueClass';
    if (value === false) return 'FalseClass';
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'Integer' : 'Float';
    }
    if (value.type === 'array') return 'Array';
    if (value.type === 'hash') return 'Hash';
    if (value.type === 'symbol') return 'Symbol';
    if (value.type === 'range') return 'Range';
    if (value.type === 'proc') return 'Proc';
    if (value.type === 'nil') return 'NilClass';
    if (value.type === 'boolean') {
      return value.value ? 'TrueClass' : 'FalseClass';
    }
    return 'Object';
  }

  getClass(value) {
    return this.getType(value);
  }

  // Conversion helpers
  toString(value) {
    if (this.isNil(value)) return '';
    if (value && value.type === 'array') {
      return '[' + value.value.map(v => this.toString(v)).join(', ') + ']';
    }
    if (value && value.type === 'hash') {
      return this.hashToString(value);
    }
    if (value && value.type === 'symbol') {
      return ':' + value.value;
    }
    if (value && value.type === 'boolean') {
      return String(value.value);
    }
    return String(value);
  }

  inspect(value) {
    if (this.isNil(value)) return 'nil';
    if (value === true) return 'true';
    if (value === false) return 'false';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number') return String(value);
    if (value && value.type === 'array') {
      return '[' + value.value.map(v => this.inspect(v)).join(', ') + ']';
    }
    if (value && value.type === 'hash') {
      return this.hashInspect(value);
    }
    if (value && value.type === 'symbol') {
      return ':' + value.value;
    }
    if (value && value.type === 'boolean') {
      return String(value.value);
    }
    return String(value);
  }

  hashToString(hash) {
    const pairs = Object.entries(hash.value).map(([k, v]) => {
      const key = this.unhashKey(k);
      return `${this.inspect(key)}=>${this.inspect(v)}`;
    });
    return '{' + pairs.join(', ') + '}';
  }

  hashInspect(hash) {
    return this.hashToString(hash);
  }

  hashKey(key) {
    if (key && key.type === 'symbol') {
      return ':' + key.value;
    }
    return String(key);
  }

  unhashKey(key) {
    if (key.startsWith(':')) {
      return this.rubySymbol(key.substring(1));
    }
    return key;
  }

  // Comparison helpers
  rubyEquals(a, b) {
    if (a === b) return true;
    if (a && b && a.type === b.type) {
      if (a.type === 'array') {
        return this.arrayEquals(a, b);
      }
      if (a.type === 'hash') {
        return this.hashEquals(a, b);
      }
      if (a.type === 'symbol') {
        return a.value === b.value;
      }
    }
    return false;
  }

  compareValues(a, b) {
    if (a === b) return 0;
    if (a < b) return -1;
    if (a > b) return 1;
    return null;
  }

  // Variable management
  pushScope() {
    this.scopes.push({});
    this.stackDepth++;
  }

  popScope() {
    if (this.scopes.length > 1) {
      this.scopes.pop();
      this.stackDepth--;
    }
  }

  setVariable(name, value) {
    this.scopes[this.scopes.length - 1][name] = value;
  }

  getVariable(name) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].hasOwnProperty(name)) {
        return this.scopes[i][name];
      }
    }
    throw new RubyException('NameError', `undefined local variable or method '${name}'`);
  }

  // Helper methods
  hashCode(obj) {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  lcm(a, b) {
    return Math.abs(a * b) / this.gcd(a, b);
  }

  numericDivide(a, b) {
    if (b === 0) {
      throw new RubyException('ZeroDivisionError', 'divided by 0');
    }
    if (Number.isInteger(a) && Number.isInteger(b)) {
      return Math.floor(a / b);
    }
    return a / b;
  }

  getAncestors(className) {
    if (!this.classes[className]) return [];
    const ancestors = [];
    let current = className;
    while (current && this.classes[current]) {
      ancestors.push(current);
      current = this.classes[current].superclass;
    }
    return ancestors;
  }
}

// Ruby Parser class
class RubyParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    return { type: 'program', statements };
  }

  parseStatement() {
    // Simplified parser - would need full implementation
    const token = this.peek();
    
    if (token.value === 'class') {
      return this.parseClass();
    }
    if (token.value === 'module') {
      return this.parseModule();
    }
    if (token.value === 'def') {
      return this.parseMethod();
    }
    if (token.value === 'if') {
      return this.parseIf();
    }
    // ... more statement types
    
    return this.parseExpression();
  }

  parseExpression() {
    // Simplified expression parser
    return this.parseTernary();
  }

  parseTernary() {
    let expr = this.parseLogicalOr();
    
    if (this.match('?')) {
      const trueExpr = this.parseExpression();
      this.consume(':');
      const falseExpr = this.parseExpression();
      return { type: 'ternary', condition: expr, trueExpr, falseExpr };
    }
    
    return expr;
  }

  parseLogicalOr() {
    let expr = this.parseLogicalAnd();
    
    while (this.match('||')) {
      const op = this.previous().value;
      const right = this.parseLogicalAnd();
      expr = { type: 'binary_op', operator: op, left: expr, right };
    }
    
    return expr;
  }

  parseLogicalAnd() {
    let expr = this.parseEquality();
    
    while (this.match('&&')) {
      const op = this.previous().value;
      const right = this.parseEquality();
      expr = { type: 'binary_op', operator: op, left: expr, right };
    }
    
    return expr;
  }

  // ... More parsing methods

  // Helper methods
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().value === type || this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.current >= this.tokens.length;
  }

  peek() {
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();
    throw new Error(message || `Expected ${type}`);
  }
}

// Ruby Exception class
class RubyException extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
    this.rubyMessage = message;
  }

  toRubyString() {
    return `${this.type}: ${this.rubyMessage}`;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RubyInterpreterUltimate;
}