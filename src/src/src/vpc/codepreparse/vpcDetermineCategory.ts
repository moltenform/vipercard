
/* auto */ import { O, assertTrue, cProductName, checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, checkThrowEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CountNumericId } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { BuildFakeTokens, isTkType, tks, tokenType } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { ChvParserClass } from '../../vpc/codeparse/vpcRules.js';
/* auto */ import { MapBuiltinCmds, VpcLineCategory } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { CheckReservedWords, CodeSymbols } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { VpcCodeLine } from '../../vpc/codepreparse/vpcCodeLine.js';

export class DetermineCategory {
    buildFake = new BuildFakeTokens();
    sharedRequestEval: ChvIToken;
    sharedRequestUserHandler: ChvIToken;
    constructor(
        protected idgen: CountNumericId,
        protected parser: ChvParserClass,
        protected mapBuiltinCmds: MapBuiltinCmds,
        protected check: CheckReservedWords
    ) {
        this.sharedRequestEval = {
            image: CodeSymbols.requestEval,
            startOffset: -1,
            startLine: -1,
            startColumn: -1,
            endOffset: -1,
            endLine: -1,
            endColumn: -1,
            isInsertedInRecovery: false,
            tokenType: tokenType(tks.TokenTkidentifier),
            tokenClassName: undefined,
        };

        this.sharedRequestUserHandler = {
            image: CodeSymbols.requestHandlerCall,
            startOffset: -1,
            startLine: -1,
            startColumn: -1,
            endOffset: -1,
            endLine: -1,
            endColumn: -1,
            isInsertedInRecovery: false,
            tokenType: tokenType(tks.TokenTkidentifier),
            tokenClassName: undefined,
        };
    }

    static checkCommonMistakenVarNames(tk: O<ChvIToken>) {
        // not a thorough validation. but let's do simple checks here before they become more mysterious parse errors.
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkadjective),
            `8f|we don't support variables named "short", "long", etc`
        );
        checkThrow(!tk || !isTkType(tk, tks.TokenNumber), `8e|we don't support variables named "number"`);
        checkThrow(!tk || !isTkType(tk, tks.TokenLength), `8d|we don't support variables named "length"`);
        checkThrow(!tk || !isTkType(tk, tks.TokenId), `8c|we don't support variables named "id"`);
        checkThrow(
            !tk || !isTkType(tk, tks.TokenTkordinal),
            `8b|we don't support variables named "first", "last", "second", "middle", "any"`
        );
    }

    go(line: ChvIToken[]): VpcCodeLine {
        checkThrow(line && line.length > 0, `8O|we don't allow empty lines of code`);
        checkThrow(
            isTkType(line[0], tks.TokenTkidentifier),
            `8N|The first word of this line (${line[0].image}) is not a valid command or keyword.`
        );
        let firstImage = line[0].image;
        let output = new VpcCodeLine(this.idgen.next(), line);
        if (this.mapBuiltinCmds.find(firstImage)) {
            this.go_builtincmd(firstImage, line, output);
            return output;
        } else {
            let methodname = `go_${firstImage.replace(/\^/g, '')}`;
            methodname = (this as any)[methodname] ? methodname : 'go_customhandler';
            let ret = Util512.callAsMethodOnClass('DetermineCategory', this, methodname, [line, output], false);
            assertTrue(ret === undefined, '5v|expected undefined but got', ret);
            if (!output.getParseRule() && output.excerptToParse.length > 0) {
                // handlerStart and declareGlobal put data in excerptToParse, but only as a place to store things
                if (this.isParsingNeeded(output.ctg)) {
                    output.setParseRule(this.parser.RuleTopLevelRequestEval);
                    output.excerptToParse = [this.sharedRequestEval].concat(output.excerptToParse);
                }
            }

            return output;
        }
    }

    protected isParsingNeeded(ctg: VpcLineCategory) {
        switch (ctg) {
            case VpcLineCategory.handlerStart: // fall-through
            case VpcLineCategory.handlerEnd: // fall-through
            case VpcLineCategory.handlerExit: // fall-through
            case VpcLineCategory.productExit: // fall-through
            case VpcLineCategory.handlerPass: // fall-through
            case VpcLineCategory.ifElsePlain: // fall-through
            case VpcLineCategory.ifEnd: // fall-through
            case VpcLineCategory.repeatExit: // fall-through
            case VpcLineCategory.repeatNext: // fall-through
            case VpcLineCategory.repeatForever: // fall-through
            case VpcLineCategory.repeatEnd: // fall-through
            case VpcLineCategory.declareGlobal: // fall-through
                return false;
            default:
                return true;
        }
    }

    go_builtincmd(firstImage: string, line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.statement;
        output.excerptToParse = line;
        output.setParseRule(this.mapBuiltinCmds.get(firstImage));
    }

    go_customhandler(line: ChvIToken[], output: VpcCodeLine) {
        if (line.length > 1) {
            // kind reminders to the user
            let firsttoken = line[0];
            checkThrow(line[1].image !== '=', `8M|this isn't C... you need to use 'put 1 into x' not 'x = 1'`);
            checkThrow(
                !firsttoken.endOffset || (line[1].image !== '(' || line[1].startOffset > firsttoken.endOffset + 1),
                `8L|this isn't C... you need to say 'put fn() into x' or 'get fn()' but not 'fn()' alone`
            );
        }

        output.ctg = VpcLineCategory.callHandler;
        checkThrow(
            this.check.okHandlerName(line[0].image),
            `8K|it looked like you were calling a handler like mouseUp or myHandler, but this is a reserved word.`
        );
        output.excerptToParse = [this.sharedRequestUserHandler].concat(line);
        output.setParseRule(this.parser.RuleTopLevelRequestHandlerCall);
    }

    go_requesteval(line: ChvIToken[], output: VpcCodeLine) {
        checkThrow(false, `8J|we shouldn't reach this yet, we don't add them until after this step.`);
    }

    helper_getListOfValidIdentifiers(line: ChvIToken[], output: VpcCodeLine, index: number) {
        for (let i = index; i < line.length; i++) {
            DetermineCategory.checkCommonMistakenVarNames(line[i]);
            checkThrow(this.check.okLocalVar(line[i].image), `8I|name of parameter is a reserved word.`);

            if ((i - index) % 2 === 1) {
                checkThrowEq(
                    tokenType(tks.TokenTkcomma),
                    line[i].tokenType,
                    `8H|required comma every other param (expected on myhandler x, y, z)`,
                    line[i].image
                );
            } else {
                checkThrowEq(
                    tokenType(tks.TokenTkidentifier),
                    line[i].tokenType,
                    `8G|parameter is not a valid variable name (expected on myhandler x, y, z)`,
                    line[i].image
                );

                output.excerptToParse.push(line[i]);
            }
        }
    }

    helper_handlerStart(line: ChvIToken[], output: VpcCodeLine, firstToken: ChvIToken) {
        output.ctg = VpcLineCategory.handlerStart;
        checkThrow(line.length > 1, `8F|cannot have a line that is just "on"`);
        DetermineCategory.checkCommonMistakenVarNames(line[1]);
        checkThrow(this.check.okHandlerName(line[1].image), `8E|name of handler is a reserved word.`);
        checkThrowEq(
            tokenType(tks.TokenTkidentifier),
            line[1].tokenType,
            `8D|expected "on myhandler" but got "on <invalid name>`
        );

        output.excerptToParse.push(firstToken); // 'on' or 'function'
        output.excerptToParse.push(line[1]); // name of handler
        this.helper_getListOfValidIdentifiers(line, output, 2);
    }

    go_on(line: ChvIToken[], output: VpcCodeLine) {
        return this.helper_handlerStart(line, output, line[0]);
    }

    go_function(line: ChvIToken[], output: VpcCodeLine) {
        return this.helper_handlerStart(line, output, line[0]);
    }

    go_global(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.declareGlobal;
        checkThrow(line.length > 1, `8C|cannot have a line that is just "global"`);
        this.helper_getListOfValidIdentifiers(line, output, 1);
    }

    go_handlerend_common(line: ChvIToken[], output: VpcCodeLine, s: string) {
        checkThrowEq(2, line.length, `8B|wrong line length, in '${s} myhandler'`);
        DetermineCategory.checkCommonMistakenVarNames(line[1]);
        checkThrow(
            this.check.okHandlerName(line[1].image),
            `8A|we think you are trying to say '${s} myhandler', but name of handler is a reserved word.`
        );
        checkThrowEq(
            tokenType(tks.TokenTkidentifier),
            line[1].tokenType,
            `89|expected "end myhandler" but name of my handler is not valid`
        );

        output.excerptToParse.push(line[0]);
        output.excerptToParse.push(line[1]);
    }

    go_end_handler(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.handlerEnd;
        this.go_handlerend_common(line, output, 'end');
    }

    go_exit_handler(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.handlerExit;
        this.go_handlerend_common(line, output, 'exit');
    }

    go_pass(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.handlerPass;
        this.go_handlerend_common(line, output, 'pass');
    }

    go_exit_product(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.productExit;
    }

    go_return(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.returnExpr;
        checkThrow(
            line.length > 1,
            `88|cannot have a line that is just "return". if you really want to return void, try exit myhandler.`
        );
        output.excerptToParse = line.slice(1);
    }

    go_if(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ifStart;
        let lasttk = line[line.length - 1];
        checkThrow(
            isTkType(lasttk, tks.TokenTkidentifier) && lasttk.image === 'then',
            `87|expected line to end with "then". 'if x > 2 then' `
        );
        checkThrow(line.length > 2, `86|cannot have a line that is just "if then"`);
        output.excerptToParse = line.slice(1, -1);
    }

    go_else_if_cond(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ifElse;
        let lasttk = line[line.length - 1];
        checkThrow(
            isTkType(lasttk, tks.TokenTkidentifier) && lasttk.image === 'then',
            `85|expected line to end with "then". 'else if x > 3 then' `
        );
        checkThrow(line.length > 3, `84|cannot have a line that is just "else if then"`);
        checkThrow(
            isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'if',
            `83|expected line to be 'else if x > 3 then' but 'if' not seen`
        );
        output.excerptToParse = line.slice(2, -1);
    }

    go_else_if_plain(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ifElsePlain;
        checkThrowEq(1, line.length, `82|line should be just 'else'`);
    }

    go_end_if(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ifEnd;
        checkThrowEq(2, line.length, `81|line should be just 'end if'`);
    }

    go_else(line: ChvIToken[], output: VpcCodeLine) {
        if (line.length > 1) {
            this.go_else_if_cond(line, output);
        } else {
            this.go_else_if_plain(line, output);
        }
    }

    go_exit_repeat(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.repeatExit;
        checkThrowEq(2, line.length, `80|line should be just 'exit repeat'`);
    }

    go_end_repeat(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.repeatEnd;
        checkThrowEq(2, line.length, `7~|line should be just 'end repeat'`);
    }

    go_next(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.repeatNext;
        checkThrowEq(2, line.length, `7}|line should be just 'next repeat'`);
        checkThrow(
            isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'repeat',
            `7||line should be just 'next repeat'`
        );
    }

    go_repeat(line: ChvIToken[], output: VpcCodeLine) {
        if (line.length === 1) {
            output.ctg = VpcLineCategory.repeatForever;
        } else if (isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'while') {
            output.ctg = VpcLineCategory.repeatWhile;
            checkThrow(line.length > 2, `7{|can't have "repeat while" without an expression`);
            output.excerptToParse = line.slice(2);
        } else if (isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'until') {
            output.ctg = VpcLineCategory.repeatUntil;
            checkThrow(line.length > 2, `9e|can't have "repeat until" without an expression`);
            output.excerptToParse = line.slice(2);
        } else {
            throw makeVpcScriptErr(
                `5u|unsupported repeat type. need repeat forever, repeat 5 times, repeat with, repeat while, repeat until.`
            );
        }
    }

    go_end(line: ChvIToken[], output: VpcCodeLine) {
        checkThrow(line.length > 1, `7_|cannot have a line that is just "end"`);
        checkThrowEq(2, line.length, `7^|wrong line length. expected "end if", "end repeat", "end handler"`);
        checkThrowEq(
            tokenType(tks.TokenTkidentifier),
            line[1].tokenType,
            `7]|expected one of: "end if", "end repeat", "end handler"`
        );
        if (line[1].image === 'if') {
            return this.go_end_if(line, output);
        } else if (line[1].image === 'repeat') {
            return this.go_end_repeat(line, output);
        } else {
            return this.go_end_handler(line, output);
        }
    }

    go_exit(line: ChvIToken[], output: VpcCodeLine) {
        checkThrow(line.length > 1, `7[|cannot have a line that is just "exit"`);
        checkThrow(
            line.length === 2,
            `7@|wrong line length, expected "exit myhandler", "exit repeat", "exit to ${cProductName}"`
        );
        checkThrowEq(
            tokenType(tks.TokenTkidentifier),
            line[1].tokenType,
            `7?|expected "exit myhandler", "exit repeat", "exit to ${cProductName}"`
        );
        if (line[1].image === 'repeat') {
            return this.go_exit_repeat(line, output);
        } else if (line[1].image === cProductName.toLowerCase()) {
            return this.go_exit_product(line, output);
        } else {
            return this.go_exit_handler(line, output);
        }
    }
}
