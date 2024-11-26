import antlr4 from 'antlr4';
import JavaScriptLexer from './Grammar/JavaScriptLexer.js';
import JavaScriptParser from './Grammar/JavaScriptParser.js';
import JavaScriptParserVisitor from './Grammar/JavaScriptParserVisitor.js';

function toArray(maybeArray) {
  if (!maybeArray) {
    return [];
  } else if (Array.isArray(maybeArray)) {
    return maybeArray;
  } else {
    return [maybeArray];
  }
}

// Função auxiliar para capitalizar strings
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

class ReactScriptTranspiler extends JavaScriptParserVisitor {
  constructor(input) {
    super();
    this.input = input; // Armazena o input original
    this.output = '';
    this.stateVariables = new Set();
  }

  // Método principal para transpilar o input
  transpile() {
    const chars = new antlr4.InputStream(this.input);
    const lexer = new JavaScriptLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new JavaScriptParser(tokens);
    const tree = parser.program();

    this.visit(tree);
    return this.output;
  }

  // Visita o programa completo
  visitProgram(ctx) {
    this.visitChildren(ctx);
    return this.output;
  }

  // Visita a declaração de componente
  visitComponentDeclaration(ctx) {
    const componentName = this.visit(ctx.identifier());
    const params = ctx.formalParameterList()
      ? this.visit(ctx.formalParameterList())
      : '';
    const body = this.visit(ctx.block());

    const code = `function ${componentName}(${params}) ${body}\n`;
    this.output += code;
    return null;
  }

  // Visita declarações de função dentro de componentes
  visitFunctionDeclaration(ctx) {
    const functionName = this.visit(ctx.identifier());
    const params = ctx.formalParameterList()
      ? this.visit(ctx.formalParameterList())
      : '';
    
    let body = '';
    if (ctx.block) {
      body = this.visit(ctx.block);
    } else {
      body = ';'; // Função sem corpo
    }
  
    return `function ${functionName}(${params}) ${body}`;
  }

  // Visita declarações de estado
  visitStateDeclaration(ctx) {
    const variableName = this.visit(ctx.assignable());
    const initialValue = ctx.singleExpression()
      ? this.visit(ctx.singleExpression())
      : 'undefined';

    this.stateVariables.add(variableName);

    return `const [${variableName}, set${capitalize(variableName)}] = React.useState(${initialValue});`;
  }

  // Visita declarações de efeito
  visitEffectStatement(ctx) {
    const dependencies = ctx.expressionSequence()
      ? `[${this.visit(ctx.expressionSequence())}]`
      : '[]';
    const body = this.visit(ctx.block());

    return `React.useEffect(() => ${body}, ${dependencies});`;
  }

  // Visita declarações de referência
  visitRefDeclaration(ctx) {
    const variableName = this.visit(ctx.assignable());
    const initialValue = ctx.singleExpression()
      ? this.visit(ctx.singleExpression())
      : 'null';

    return `const ${variableName} = React.useRef(${initialValue});`;
  }

  // Visita blocos de código
  visitBlock(ctx) {
    const statements = ctx.statementList()
      ? this.visit(ctx.statementList())
      : '';
    return `{\n${statements}\n}`;
  }

  // Visita listas de declarações dentro de blocos
  visitStatementList(ctx) {
    const statements = toArray(ctx.statement());
    return statements.map((stmt) => this.visit(stmt)).filter(stmt => stmt).join('\n');
  }

  // Visita declarações de retorno
  visitReturnStatement(ctx) {
    const expression = ctx.expressionSequence()
      ? this.visit(ctx.expressionSequence())
      : '';
    return `return ${expression};`;
  }

  // Visita declarações de expressão
  visitExpressionStatement(ctx) {
    const expression = this.visit(ctx.expressionSequence());
    return `${expression};`;
  }

  // Visita sequências de expressões
  visitExpressionSequence(ctx) {
    // No contexto de retorno, deve haver apenas uma expressão
    // Portanto, retornamos sem concatenar com vírgulas
    const expressions = toArray(ctx.singleExpression());
    return expressions.map((expr) => this.visit(expr)).join(', ');
  }

  // Métodos para visitar diferentes tipos de expressões
  visitSingleExpression(ctx) {
    if (ctx.jsxElements()) {
      // Extrai o texto exato do JSX do input original
      const start = ctx.start.start;
      const stop = ctx.stop.stop;
      return this.input.substring(start, stop + 1);
    }
    const text = this.visitChildren(ctx);
    console.log(`Transpilando singleExpression: ${text}`);
    return text;
  }

  visitIdentifierExpression(ctx) {
    return this.visit(ctx.identifier());
  }

  visitLiteralExpression(ctx) {
    return this.visit(ctx.literal());
  }

  visitMemberDotExpression(ctx) {
    const object = this.visit(ctx.singleExpression(0));
    const property = this.visit(ctx.identifierName());
    return `${object}.${property}`;
  }

  visitArgumentsExpression(ctx) {
    const func = this.visit(ctx.singleExpression());
    const args = this.visit(ctx.arguments());
    return `${func}${args}`;
  }

  visitArguments(ctx) {
    const argList = toArray(ctx.argument())
      .map((arg) => this.visit(arg))
      .join(', ');
    return `(${argList})`;
  }

  visitArgument(ctx) {
    return this.visit(ctx.singleExpression());
  }

  visitAssignmentExpression(ctx) {
    const left = this.visit(ctx.singleExpression(0));
    const right = this.visit(ctx.singleExpression(1));
    return `${left} = ${right}`;
  }

  visitPostIncrementExpression(ctx) {
    const expression = this.visit(ctx.singleExpression());
    if (this.isStateVariable(expression)) {
      const setter = `set${capitalize(expression)}`;
      return `${setter}(${expression} + 1)`;
    }
    return `${expression}++`;
  }

  isStateVariable(variable) {
    return this.stateVariables.has(variable);
  }

  visitPostDecreaseExpression(ctx) {
    const expression = this.visit(ctx.singleExpression());
    if (this.isStateVariable(expression)) {
      const setter = `set${capitalize(expression)}`;
      return `${setter}(${expression} - 1)`;
    }
    return `${expression}--`;
  }  

  visitParenthesizedExpression(ctx) {
    const expression = this.visit(ctx.expressionSequence());
    return `(${expression})`;
  }

  visitBinaryExpression(ctx) {
    const left = this.visit(ctx.singleExpression(0));
    const operator = ctx.getChild(1).getText();
    const right = this.visit(ctx.singleExpression(1));
    return `${left} ${operator} ${right}`;
  }

  visitUnaryMinusExpression(ctx) {
    const expression = this.visit(ctx.singleExpression());
    return `-${expression}`;
  }

  visitUnaryPlusExpression(ctx) {
    const expression = this.visit(ctx.singleExpression());
    return `+${expression}`;
  }

  visitTernaryExpression(ctx) {
    const condition = this.visit(ctx.singleExpression(0));
    const trueExpr = this.visit(ctx.singleExpression(1));
    const falseExpr = this.visit(ctx.singleExpression(2));
    return `${condition} ? ${trueExpr} : ${falseExpr}`;
  }

  visitArrowFunction(ctx) {
    const params = this.visit(ctx.arrowFunctionParameters());
    const body = this.visit(ctx.arrowFunctionBody());
  
    // Não transformar o corpo da função arrow
    return `${params} => ${body}`;
  }  

  visitArrowFunctionParameters(ctx) {
    if (ctx.identifier()) {
      return ctx.identifier().getText();
    } else if (ctx.formalParameterList()) {
      return `(${this.visit(ctx.formalParameterList())})`;
    } else {
      return '()';
    }
  }

  visitArrowFunctionBody(ctx) {
    if (ctx.singleExpression()) {
      return this.visit(ctx.singleExpression());
    } else if (ctx.block()) {
      return this.visit(ctx.block());
    } else {
      return '';
    }
  }

  visitIdentifier(ctx) {
    const identifier = ctx.getToken(JavaScriptParser.Identifier, 0);
    if (identifier) {
      return identifier.getText();
    } else {
      return ctx.getText();
    }
  }

  visitLiteral(ctx) {
    const stringLiteral = ctx.getToken(JavaScriptParser.StringLiteral, 0);
    if (stringLiteral) {
      return stringLiteral.getText();
    } else if (ctx.numericLiteral()) {
      return this.visit(ctx.numericLiteral());
    } else {
      const booleanLiteral = ctx.getToken(JavaScriptParser.BooleanLiteral, 0);
      if (booleanLiteral) {
        return booleanLiteral.getText();
      } else {
        return ctx.getText();
      }
    }
  }

  visitNumericLiteral(ctx) {
    return ctx.getText();
  }

  visitIdentifierName(ctx) {
    return ctx.getText();
  }

  visitFormalParameterList(ctx) {
    const params = toArray(ctx.formalParameterArg());
    return params.map((param) => this.visit(param)).join(', ');
  }

  visitFormalParameterArg(ctx) {
    return this.visit(ctx.assignable());
  }

  visitAssignable(ctx) {
    return ctx.getText();
  }

  // Visita literais de array
  visitArrayLiteral(ctx) {
    const elements = ctx.elementList()
      ? this.visit(ctx.elementList())
      : '';
    return `[${elements}]`;
  }

  visitElementList(ctx) {
    const elements = toArray(ctx.arrayElement());
    return elements.map((el) => this.visit(el)).join(', ');
  }

  visitArrayElement(ctx) {
    if (ctx.Ellipsis()) {
      const expr = this.visit(ctx.singleExpression());
      return `...${expr}`;
    } else {
      return this.visit(ctx.singleExpression());
    }
  }

  // Visita literais de objeto
  visitObjectLiteral(ctx) {
    const properties = toArray(ctx.propertyAssignment());
    return `{${properties.map((prop) => this.visit(prop)).join(', ')}}`;
  }

  visitPropertyAssignment(ctx) {
    if (ctx.PropertyExpressionAssignment()) {
      const name = this.visit(ctx.propertyName());
      const value = this.visit(ctx.singleExpression());
      return `${name}: ${value}`;
    } else if (ctx.ComputedPropertyExpressionAssignment()) {
      const key = this.visit(ctx.singleExpression(0));
      const value = this.visit(ctx.singleExpression(1));
      return `[${key}]: ${value}`;
    } else if (ctx.FunctionProperty()) {
      const async = ctx.Async() ? 'async ' : '';
      const generator = ctx['*'] ? '*' : '';
      const name = this.visit(ctx.propertyName());
      const params = ctx.formalParameterList()
        ? this.visit(ctx.formalParameterList())
        : '';
      const body = this.visit(ctx.block());
      return `${async}${generator}${name}(${params}) ${body}`;
    } else if (ctx.PropertyGetter()) {
      const name = this.visit(ctx.propertyName());
      const body = this.visit(ctx.block());
      return `get ${name}() ${body}`;
    } else if (ctx.PropertySetter()) {
      const name = this.visit(ctx.propertyName());
      const params = this.visit(ctx.formalParameterArg());
      const body = this.visit(ctx.block());
      return `set ${name}(${params}) ${body}`;
    } else if (ctx.PropertyShorthand()) {
      const expr = this.visit(ctx.singleExpression());
      return expr;
    } else {
      return '';
    }
  }

  visitPropertyName(ctx) {
    if (ctx.identifierName()) {
      return this.visit(ctx.identifierName());
    } else if (ctx.numericLiteral()) {
      return this.visit(ctx.numericLiteral());
    } else {
      return this.visit(ctx.singleExpression());
    }
  }

  // Visita elementos JSX
  visitJsxElement(ctx) {
    // Extrai o texto exato do JSX do input original, preservando espaços
    const start = ctx.start.start;
    const stop = ctx.stop.stop;
    return this.input.substring(start, stop + 1);
  }

  // Visita elementos JSX auto-fechados
  visitJsxSelfClosingElement(ctx) {
    const start = ctx.start.start;
    const stop = ctx.stop.stop;
    return this.input.substring(start, stop + 1);
  }

  // Nome do elemento auto-fechado
  visitJsxSelfClosingElementName(ctx) {
    return ctx.getText();
  }

  // Visita elementos de abertura JSX
  visitJsxOpeningElement(ctx) {
    const start = ctx.start.start;
    const stop = ctx.stop.stop;
    return this.input.substring(start, stop + 1);
  }

  // Visita elementos de fechamento JSX
  visitJsxClosingElement(ctx) {
    const start = ctx.start.start;
    const stop = ctx.stop.stop;
    return this.input.substring(start, stop + 1);
  }

  // Visita atributos JSX
  visitJsxAttributes(ctx) {
    // Preserva os atributos com espaços adequados
    const start = ctx.start.start;
    const stop = ctx.stop.stop;
    return this.input.substring(start, stop + 1);
  }

  // Visita um único atributo JSX
  visitJsxAttribute(ctx) {
    // Preserva o atributo como está
    const start = ctx.start.start;
    const stop = ctx.stop.stop;
    return this.input.substring(start, stop + 1);
  }

  // Nome do atributo JSX
  visitJsxAttributeName(ctx) {
    return ctx.getText();
  }

  // Valor do atributo JSX
  visitJsxAttributeValue(ctx) {
    return ctx.getText();
  }

  // Visita os filhos de JSX
  visitJsxChildren(ctx) {
    // Preserva os filhos do JSX como estão
    const start = ctx.start.start;
    const stop = ctx.stop.stop;
    return this.input.substring(start, stop + 1);
  }

  // Transformação de expressões incrementais/decrementais
  transformExpression(expression) {
    if (expression.includes('++')) {
      return this.transformIncrement(expression);
    } else if (expression.includes('--')) {
      return this.transformDecrement(expression);
    }
    return expression;
  }

  // Transforma expressões incrementais
  transformIncrement(expression) {
    // Regex para localizar incrementos dentro de uma expressão
    const match = expression.match(/(\w+)\s*\+\+/);

    if (match) {
      const variable = match[1]; // Nome da variável
      if (this.isStateVariable(variable)) {
        const setter = `set${capitalize(variable)}`;
        return `${setter}(${variable} + 1)`;
      }
    }

    return expression; // Retorna a expressão original se não houver correspondência
  }

  // Transforma expressões decrementais
  transformDecrement(expression) {
    // Regex para localizar decrementos dentro de uma expressão
    const match = expression.match(/(\w+)\s*--/);

    if (match) {
      const variable = match[1]; // Nome da variável
      if (this.isStateVariable(variable)) {
        const setter = `set${capitalize(variable)}`;
        return `${setter}(${variable} - 1)`;
      }
    }

    return expression; // Retorna a expressão original se não houver correspondência
  }

  visitJsxOpeningElementName(ctx) {
    return ctx.getText();
  }

  visitJsxClosingElementName(ctx) {
    return ctx.getText();
  }

  visitObjectExpressionSequence(ctx) {
    return this.visit(ctx.expressionSequence());
  }
}


export default ReactScriptTranspiler;
