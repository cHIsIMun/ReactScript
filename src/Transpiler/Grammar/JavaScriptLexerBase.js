import antlr4 from 'antlr4';
import JavaScriptLexer from './JavaScriptLexer.js';

export default class JavaScriptLexerBase extends antlr4.Lexer {
    constructor(input) {
        super(input);
        this.scopeStrictModes = new Array();
        this.lastToken = null;
        this.useStrictDefault = false;
        this.useStrictCurrent = false;
        this.currentDepth = 0; // Profundidade de blocos
        this.templateDepth = 0; // Profundidade de templates JSX
        this.templateDepthStack = new Array();
    }

    // Verifica se está no início do arquivo
    IsStartOfFile() {
        return this.lastToken === null;
    }

    // Obtém o valor padrão do modo estrito
    getStrictDefault() {
        return this.useStrictDefault;
    }

    // Define o valor padrão do modo estrito
    setUseStrictDefault(value) {
        this.useStrictDefault = value;
        this.useStrictCurrent = value;
    }

    // Verifica se está no modo estrito
    IsStrictMode() {
        return this.useStrictCurrent;
    }

    // Verifica se está dentro de uma string template
    IsInTemplateString() {
        return this.templateDepth > 0;
    }

    // Obtém o próximo token e ajusta o estado do lexer
    nextToken() {
        var next = super.nextToken();

        if (next.channel === antlr4.Token.DEFAULT_CHANNEL) {
            this.lastToken = next;
        }
        return next;
    }

    // Aumenta a profundidade de blocos
    ProcessOpenBrace() {
        this.currentDepth++;
        this.useStrictCurrent =
            this.scopeStrictModes.length > 0 && this.scopeStrictModes[this.scopeStrictModes.length - 1]
                ? true
                : this.useStrictDefault;
        this.scopeStrictModes.push(this.useStrictCurrent);
    }

    // Diminui a profundidade de blocos
    ProcessCloseBrace() {
        this.useStrictCurrent =
            this.scopeStrictModes.length > 0
                ? this.scopeStrictModes.pop()
                : this.useStrictDefault;
        this.currentDepth--;
    }

    // Processa literais de string para modo estrito
    ProcessStringLiteral() {
        if (this.lastToken === null || this.lastToken.type === JavaScriptLexer.OpenBrace) {
            if (super.text === '"use strict"' || super.text === "'use strict'") {
                if (this.scopeStrictModes.length > 0) {
                    this.scopeStrictModes.pop();
                }
                this.useStrictCurrent = true;
                this.scopeStrictModes.push(this.useStrictCurrent);
            }
        }
    }

    // Aumenta a profundidade de templates
    IncreaseTemplateDepth() {
        this.templateDepth++;
    }

    // Diminui a profundidade de templates
    DecreaseTemplateDepth() {
        this.templateDepth--;
    }

    // Verifica se um regex é possível no contexto atual
    IsRegexPossible() {
        if (this.lastToken === null) {
            return true;
        }

        switch (this.lastToken.type) {
            case JavaScriptLexer.Identifier:
            case JavaScriptLexer.NullLiteral:
            case JavaScriptLexer.BooleanLiteral:
            case JavaScriptLexer.This:
            case JavaScriptLexer.CloseBracket:
            case JavaScriptLexer.CloseParen:
            case JavaScriptLexer.OctalIntegerLiteral:
            case JavaScriptLexer.DecimalLiteral:
            case JavaScriptLexer.HexIntegerLiteral:
            case JavaScriptLexer.StringLiteral:
            case JavaScriptLexer.PlusPlus:
            case JavaScriptLexer.MinusMinus:
                return false;
            default:
                return true;
        }
    }

    // Verifica se JSX é possível no contexto atual
    IsJsxPossible() {
        if (this.lastToken === null) {
            return false;
        }

        switch (this.lastToken.type) {
            case JavaScriptLexer.Assign:
            case JavaScriptLexer.Colon:
            case JavaScriptLexer.Comma:
            case JavaScriptLexer.Default:
            case JavaScriptLexer.QuestionMark:
            case JavaScriptLexer.Return:
            case JavaScriptLexer.OpenBrace:
            case JavaScriptLexer.OpenParen:
            case JavaScriptLexer.JsxOpeningElementOpenBrace:
            case JavaScriptLexer.JsxChildrenOpenBrace:
            case JavaScriptLexer.Yield:
            case JavaScriptLexer.ARROW:
                return true;
            default:
                return false;
        }
    }

    // Reinicia o estado do lexer
    reset() {
        this.scopeStrictModes = new Array();
        this.lastToken = null;
        this.useStrictDefault = false;
        this.useStrictCurrent = false;
        this.currentDepth = 0;
        this.templateDepth = 0;
        this.templateDepthStack = new Array();
        super.reset();
    }
}
