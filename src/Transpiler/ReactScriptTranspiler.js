import JavaScriptParserVisitor from './Grammar/JavaScriptParserVisitor.js';
import JavaScriptParser from './Grammar/JavaScriptParser.js';
import JavaScriptLexer from './Grammar/JavaScriptLexer.js';

function toArray(maybeArray) {
  if (!maybeArray) {
    return [];
  } else if (Array.isArray(maybeArray)) {
    return maybeArray;
  } else {
    return [maybeArray];
  }
}

class ReactScriptTranspiler extends JavaScriptParserVisitor {
  constructor() {
    super();
    this.output = '';
    this.stateVariables = new Set();
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
    const body = this.visit(ctx.block());

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
    if (ctx instanceof JavaScriptParser.IdentifierExpressionContext) {
      return this.visitIdentifierExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.LiteralExpressionContext) {
      return this.visitLiteralExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.MemberDotExpressionContext) {
      return this.visitMemberDotExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.ArgumentsExpressionContext) {
      return this.visitArgumentsExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.ArrowFunctionContext) {
      return this.visitArrowFunction(ctx);
    } else if (ctx instanceof JavaScriptParser.AssignmentExpressionContext) {
      return this.visitAssignmentExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.PostIncrementExpressionContext) {
      return this.visitPostIncrementExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.PostDecreaseExpressionContext) {
      return this.visitPostDecreaseExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.ParenthesizedExpressionContext) {
      return this.visitParenthesizedExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.BinaryExpressionContext) {
      return this.visitBinaryExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.UnaryMinusExpressionContext) {
      return this.visitUnaryMinusExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.UnaryPlusExpressionContext) {
      return this.visitUnaryPlusExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.TernaryExpressionContext) {
      return this.visitTernaryExpression(ctx);
    } else {
      return ctx.getText();
    }
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

    // Transformar o corpo da função arrow se necessário
    const transformedBody = this.transformExpression(body);

    return `${params} => ${transformedBody}`;
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
  visitJsxElement(ctx, level = 1) {
    if (ctx.jsxSelfClosingElement()) {
      return this.visitJsxSelfClosingElement(ctx.jsxSelfClosingElement());
    }
    const opening = this.visit(ctx.jsxOpeningElement());
    const children = ctx.jsxChildren()
      ? this.visitJsxChildren(ctx.jsxChildren(), level + 1)
      : '';
    const closing = this.visit(ctx.jsxClosingElement());
    const indent = '  '.repeat(level);

    return `${indent}${opening}\n${children}\n${indent}${closing}`;
  }

  // Visita elementos JSX auto-fechados
  visitJsxSelfClosingElement(ctx) {
    const name = this.visit(ctx.jsxSelfClosingElementName());
    const attributes = ctx.jsxAttributes()
      ? ' ' + this.visit(ctx.jsxAttributes()).trim()
      : '';
    return `<${name}${attributes} />`;
  }

  // Nome do elemento auto-fechado
  visitJsxSelfClosingElementName(ctx) {
    return ctx.getText();
  }

  // Visita elementos de abertura JSX
  visitJsxOpeningElement(ctx) {
    const name = this.visit(ctx.jsxOpeningElementName());
    const attributes = ctx.jsxAttributes()
      ? ' ' + this.visit(ctx.jsxAttributes()).trim()
      : '';
    return `<${name}${attributes}>`;
  }

  // Visita elementos de fechamento JSX
  visitJsxClosingElement(ctx) {
    const name = this.visit(ctx.jsxClosingElementName());
    return `</${name}>`;
  }

  // Visita atributos JSX
  visitJsxAttributes(ctx) {
    const attrs = toArray(ctx.jsxAttribute());
    return attrs.map((attr) => this.visit(attr)).join(' ');
  }

  // Visita um único atributo JSX
  visitJsxAttribute(ctx) {
    const name = this.visit(ctx.jsxAttributeName());
    const value = ctx.jsxAttributeValue()
      ? `=${this.visit(ctx.jsxAttributeValue())}`
      : '';
    return `${name}${value}`;
  }

  // Nome do atributo JSX
  visitJsxAttributeName(ctx) {
    return ctx.getText();
  }

  // Valor do atributo JSX
  visitJsxAttributeValue(ctx) {
    const stringLiteral = ctx.getToken(JavaScriptParser.StringLiteral, 0);
    if (stringLiteral) {
      return stringLiteral.getText();
    } else if (ctx.jsxElement()) {
      return `{${this.visit(ctx.jsxElement())}}`;
    } else if (ctx.objectExpressionSequence()) {
      const expression = this.visit(ctx.objectExpressionSequence());
      return `{${this.transformExpression(expression)}}`;
    } else if (ctx.arrowFunction()) {
      // Exemplo: () => contador++
      const arrowFunc = this.visit(ctx.arrowFunction());
      // Transformar a expressão dentro da função arrow
      const transformedArrowFunc = arrowFunc.replace(/(\w+)\s*\+\+/, (match, p1) => {
        if (this.isStateVariable(p1)) {
          const setter = `set${capitalize(p1)}`;
          return `${setter}(${p1} + 1)`;
        }
        return match;
      });
      return `{${transformedArrowFunc}}`;
    } else {
      return ctx.getText();
    }
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

  // Visita os filhos de elementos JSX
  visitJsxChildren(ctx, level = 1) {
    const children = toArray(ctx.children);
    const indent = '  '.repeat(level);

    return children
      .map((child) => {
        if (!child) return ''; // Nó inválido

        // Verificar o tipo do filho
        const constructorName = child.constructor.name;
        
        if (constructorName === 'HtmlChardataContext' || constructorName === 'JsxTextContext') {
          const text = child.getText().trim();
          if (text) {
            return `${indent}${text}`;
          }
          return '';
        }

        if (constructorName === 'ObjectExpressionSequenceContext') {
          const expression = this.visit(child.expressionSequence());
          return `${indent}{${expression}}`;
        }

        if (constructorName === 'JsxElementContext') {
          return this.visitJsxElement(child, level);
        }

        return ''; // Ignorar outros tipos de nós
      })
      .filter(line => line !== '') // Remover linhas vazias
      .join('\n');
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

// Função auxiliar para capitalizar strings
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default ReactScriptTranspiler;
