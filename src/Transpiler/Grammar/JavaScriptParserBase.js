import antlr4 from 'antlr4';
import JavaScriptParser from './JavaScriptParser.js';

export default class JavaScriptParserBase extends antlr4.Parser {
    constructor(input) {
        super(input);
        this._htmlTagStack = []; // Pilha para rastrear tags HTML/JSX
    }

    // Função auxiliar para verificar se o token anterior é igual a `str`
    p(str) {
        return this.prev(str);
    }

    // Verifica se o token anterior é igual a `str`
    prev(str) {
        return this._input.LT(-1).text === str;
    }

    // Função auxiliar para verificar se o próximo token é igual a `str`
    n(str) {
        return this.next(str);
    }

    // Verifica se o próximo token é igual a `str`
    next(str) {
        return this._input.LT(1).text === str;
    }

    // Verifica se não é um terminador de linha à frente
    notLineTerminator() {
        return !this.lineTerminatorAhead();
    }

    // Verifica se o próximo token não é uma chave de abertura nem uma função
    notOpenBraceAndNotFunction() {
        const nextTokenType = this._input.LT(1).type;
        return (
            nextTokenType !== JavaScriptParser.OpenBrace &&
            nextTokenType !== JavaScriptParser.Function_
        );
    }

    // Verifica se o próximo token é uma chave de fechamento
    closeBrace() {
        return this._input.LT(1).type === JavaScriptParser.CloseBrace;
    }

    // Verifica se há um terminador de linha à frente
    lineTerminatorAhead() {
        let possibleIndexEosToken = this.getCurrentToken().tokenIndex - 1;
        if (possibleIndexEosToken < 0) return false;
        let ahead = this._input.get(possibleIndexEosToken);
        if (ahead.channel !== antlr4.Lexer.HIDDEN) {
            return false;
        }
        if (ahead.type === JavaScriptParser.LineTerminator) {
            return true;
        }
        if (ahead.type === JavaScriptParser.WhiteSpaces) {
            possibleIndexEosToken = this.getCurrentToken().tokenIndex - 2;
            if (possibleIndexEosToken < 0) return false;
            ahead = this._input.get(possibleIndexEosToken);
        }
        const text = ahead.text;
        const type = ahead.type;
        return (
            (type === JavaScriptParser.MultiLineComment &&
             (text.includes("\r") || text.includes("\n"))) ||
            type === JavaScriptParser.LineTerminator
        );
    }

    // Métodos específicos para manipulação de HTML/JSX

    // Adiciona um nome de tag à pilha
    pushHtmlTagName(tagName) {
        console.log("HTML/JSX Tag aberta:", tagName);
        this._htmlTagStack.push(tagName);
    }

    // Remove um nome de tag da pilha e verifica correspondência
    popHtmlTagName(tagName) {
        const lastTag = this._htmlTagStack.pop();
        console.log("HTML/JSX Tag fechada:", tagName);

        // Verifique se a tag fechada corresponde à última aberta
        if (lastTag !== tagName) {
            console.warn(`A tag de fechamento </${tagName}> não corresponde à última tag de abertura <${lastTag}>.`);
            return false;
        }

        return true;
    }
}
