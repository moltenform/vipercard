
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { BuildFakeTokens, ChvITk, isTkType, listOfAllBuiltinCommandsInOriginalProduct, tks } from './../codeparse/vpcTokens';
/* auto */ import { VpcCodeLine, VpcLineCategory, checkCommonMistakenVarNames } from './vpcPreparseCommon';
/* auto */ import { VpcChvParser } from './../codeparse/vpcParser';
/* auto */ import { CheckReservedWords } from './vpcCheckReserved';
/* auto */ import { cAltProductName, cProductName } from './../../ui512/utils/util512Productname';
/* auto */ import { assertTrue, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, checkThrowEq, last, longstr } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * determine the category of a line of code
 */
export class VpcLineToCodeObj {
    parser: VpcChvParser;
    cachedStartOnes: ChvITk[];
    constructor(protected idGen: CountNumericId, protected check: CheckReservedWords) {}

    init(basis: ChvITk) {
        this.parser = getParsingObjects()[1];

        /* the offsets here won't be right, but we shouldn't encounter errs here anyways */
        this.cachedStartOnes = [
            BuildFakeTokens.inst.makeSyntaxMarker(basis),
            BuildFakeTokens.inst.makeSyntaxMarker(basis),
            BuildFakeTokens.inst.makeSyntaxMarker(basis)
        ];
    }

    toCodeLine(line: ChvITk[]) {
        checkThrow(line && line.length > 0, "8O|we don't allow empty lines of code");
        checkThrow(
            line[0].tokenType === tks.tkIdentifier,
            '8N|The first word of this line is not a valid command or keyword.',
            line[0].image
        );
        let firstImage = line[0].image;
        let ruleAsBuiltin = 'RuleBuiltinCmd' + Util512.capitalizeFirst(firstImage);
        let output = new VpcCodeLine(this.idGen.next(), line);
        if (this.parser[ruleAsBuiltin] !== undefined) {
            this.goBuiltinCmd(firstImage, line, output);
            output.setParseRule(this.parser[ruleAsBuiltin]);
        } else {
            /* this is either a syntax structure (like end repeat) or a custom handler call */
            let cmd = firstImage.replace(/\^/g, '');
            let method = 'go' + Util512.capitalizeFirst(cmd);
            let ret: unknown;
            if (Util512.isMethodOnClass(this, method)) {
                ret = Util512.callAsMethodOnClass('VpcLineToCodeObj', this, method, [line, output], false);
            } else {
                ret = this.goCustomHandler(line, output);
            }

            assertTrue(ret === undefined, '5v|expected undefined but got', ret);
            if (!output.getParseRule() && output.excerptToParse.length > 0) {
                if (this.isParsingNeeded(output.ctg)) {
                    /* construct an array to be sent to the parser */
                    output.excerptToParse = this.cachedStartOnes.concat(output.excerptToParse);
                    output.setParseRule(this.parser.RuleInternalCmdRequestEval);
                }
            }

            return output;
        }

        return output;
    }

    /**
     * this line is a call to a built in command like "put"
     */
    goBuiltinCmd(firstImage: string, line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.Statement;
        output.excerptToParse = this.cachedStartOnes.concat(line.slice(1));
    }

    /**
     * requestEvals are only added later
     */
    goRequestEval(line: ChvITk[], output: VpcCodeLine) {
        checkThrow(false, `8J|we shouldn't reach this yet, we don't add them until after this step.`);
    }

    /**
     * this line is a function start like "function myFunc"
     */
    goFunction(line: ChvITk[], output: VpcCodeLine) {
        this.goOn(line, output);
    }

    /**
     * this line is a handler start like "on mouseUp"
     */
    goOn(line: ChvITk[], output: VpcCodeLine) {
        let firstImage = line[0].image;
        output.ctg = VpcLineCategory.HandlerStart;
        checkThrow(line.length > 1, `8F|cannot have a line that is just "${firstImage}"`);
        checkThrow(line[1].image !== 'keydown', 'we support `on afterkeydown` but not `on keydown`');
        checkCommonMistakenVarNames(line[1]);
        checkThrow(this.check.okHandlerName(line[1].image), `8E|name of handler is a reserved word.`);
        checkThrowEq(
            tks.tkIdentifier,
            line[1].tokenType,
            `8D|expected "${firstImage} myhandler" but got "${firstImage} <invalid name>`
        );

        output.excerptToParse.push(line[0]); /* 'on' or 'function' */
        output.excerptToParse.push(line[1]); /* name of handler */
        this.getListOfValidVariableNames(line, output, 2);
    }

    /**
     * this line is opening an if block
     */
    goIf(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.IfStart;
        let lastToken = last(line);
        checkThrow(
            isTkType(lastToken, tks.tkIdentifier) && lastToken.image === 'then',
            `87|expected line to end with "then". 'if x > 2 then' `
        );

        checkThrow(line.length > 2, `86|cannot have a line that is just "if then"`);
        output.excerptToParse = line.slice(1, -1);
    }

    /**
     * this line is like "else"
     */
    goElse(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.IfElsePlain;
        checkThrowEq(1, line.length, `82|line should be just 'else'`);
    }

    /**
     * this line is like "end if"
     */
    goEndIf(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.IfEnd;
        checkThrowEq(2, line.length, `81|line should be just 'end if'`);
    }

    /**
     * this line is like "exit repeat"
     */
    goExitRepeat(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.RepeatExit;
        checkThrowEq(2, line.length, `Jb|line should be just 'exit repeat'`);
    }

    /**
     * this line is like "end repeat"
     */
    goEndRepeat(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.RepeatEnd;
        checkThrowEq(2, line.length, `7~|line should be just 'end repeat'`);
    }

    /**
     * this line is like "next repeat"
     */
    goNext(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.RepeatNext;
        checkThrowEq(2, line.length, `7}|line should be just 'next repeat'`);
        checkThrow(isTkType(line[1], tks.tkIdentifier) && line[1].image === 'repeat', `7||line should be just 'next repeat'`);
    }

    /**
     * this line is declaring global variable(s)
     */
    goGlobal(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.DeclareGlobal;
        checkThrow(line.length > 1, `8C|cannot have a line that is just "global"`);
        this.getListOfValidVariableNames(line, output, 1);
    }

    /**
     * this line is a call to a custom handler "myHandler 1,2,3"
     */
    goCustomHandler(line: ChvITk[], output: VpcCodeLine) {
        if (listOfAllBuiltinCommandsInOriginalProduct[line[0].image.toLowerCase()]) {
            checkThrow(false, "It looks like we haven't implemented this command yet.");
        }

        if (line.length > 1) {
            /* kind reminders to the user */
            let firstToken = line[0];
            checkThrow(line[1].image !== '=', `8M|this isn't C... you need to use 'put 1 into x' not 'x = 1'`);
            checkThrow(
                !firstToken.endOffset || line[1].image !== '(' || line[1].startOffset > firstToken.endOffset + 1,
                longstr(`8L|this isn't C... you need to say
                 'put fn() into x' or 'get fn()' but not 'fn()' alone`)
            );
        }

        output.ctg = VpcLineCategory.CallHandler;
        checkThrow(
            this.check.okHandlerName(line[0].image),
            longstr(`8K|it looked like you were calling a
             handler like mouseUp or myHandler, but this is a reserved word.`)
        );
        output.excerptToParse = this.cachedStartOnes.concat(line);
        output.setParseRule(this.parser.RuleInternalCmdUserHandler);
    }

    /**
     * this line is ending a block ("end if" or "end repeat" etc)
     */
    endStatementCommon(line: ChvITk[], output: VpcCodeLine, s: string) {
        checkThrowEq(2, line.length, `8B|wrong line length, in '${s} myhandler'`);
        checkCommonMistakenVarNames(line[1]);
        checkThrow(
            this.check.okHandlerName(line[1].image),
            longstr(
                `8A|we think you are trying to say '${s} myhandler', but
                name of handler is a reserved word.`
            )
        );
        checkThrowEq(tks.tkIdentifier, line[1].tokenType, `89|expected "end myhandler" but name of my handler is not valid`);

        output.excerptToParse.push(line[0]);
        output.excerptToParse.push(line[1]);
    }

    /**
     * this line is like "exit to ViperCard"
     */
    goExitProduct(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ProductExit;
    }

    /**
     * this line is like "return x"
     */
    goReturn(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ReturnExpr;
        checkThrow(
            line.length > 1,
            longstr(`88|cannot have a line that is just
                "return". if you really want to return void,
                try exit myhandler.`)
        );
        output.excerptToParse = line.slice(1);
    }

    /**
     * this line is ending a handler
     */
    goEndHandler(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.HandlerEnd;
        this.endStatementCommon(line, output, 'end');
    }

    /**
     * this line is exiting a handler
     */
    goExitHandler(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.HandlerExit;
        this.endStatementCommon(line, output, 'exit');
    }

    /**
     * this line is like "pass mouseUp"
     */
    goPass(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.HandlerPass;
        this.endStatementCommon(line, output, 'pass');
    }

    /**
     * by this point all loops have become just "repeat"
     */
    goRepeat(line: ChvITk[], output: VpcCodeLine) {
        checkThrowEq(1, line.length, 'all repeats should have already been transformed.');
    }

    /**
     * the line begins with "end"
     */
    goEnd(line: ChvITk[], output: VpcCodeLine) {
        checkThrow(line.length > 1, `7_|cannot have a line that is just "end"`);
        checkThrowEq(2, line.length, `7^|wrong line length. expected "end if", "end repeat", "end handler"`);
        checkThrowEq(tks.tkIdentifier, line[1].tokenType, `7]|expected one of: "end if", "end repeat", "end handler"`);

        if (line[1].image === 'if') {
            return this.goEndIf(line, output);
        } else if (line[1].image === 'repeat') {
            return this.goEndRepeat(line, output);
        } else {
            return this.goEndHandler(line, output);
        }
    }

    /**
     * the line begins with "exit"
     */
    goExit(line: ChvITk[], output: VpcCodeLine) {
        checkThrow(line.length > 1, `7[|cannot have a line that is just "exit"`);
        checkThrow(
            line.length === 2,
            longstr(
                `7@|wrong line length, expected "exit myhandler",
                 "exit repeat", "exit to ${cProductName}"`
            )
        );
        checkThrowEq(
            tks.tkIdentifier,
            line[1].tokenType,
            `7?|expected "exit myhandler", "exit repeat", "exit to ${cProductName}"`
        );

        if (line[1].image === 'repeat') {
            return this.goExitRepeat(line, output);
        } else if (line[1].image === cProductName.toLowerCase() || line[1].image === cAltProductName.toLowerCase()) {
            return this.goExitProduct(line, output);
        } else {
            return this.goExitHandler(line, output);
        }
    }

    /**
     * line begins with send
     */
    goSend(line: ChvITk[], output: VpcCodeLine) {
        checkThrow(line.length >= 2, `line is too short.`);

        /* other control blocks just parse a single expression,
        but this has to parse both an expression and an object,
        so use a separate parse rule */
        output.setParseRule(this.parser.RuleCmdSend);
        output.excerptToParse = this.cachedStartOnes.concat(line.slice(1));
        output.ctg = VpcLineCategory.CallDynamic;
    }

    /**
     * line begins with internalvpcmessagesdirective
     */
    goInternalvpcmessagesdirective(line: ChvITk[], output: VpcCodeLine) {
        checkThrow(line.length === 3, `line must contain 3 tokens.`);
        output.excerptToParse = line.slice();
        output.ctg = VpcLineCategory.IsInternalvpcmessagesdirective;
    }

    /**
     * perf. optimization, many lines of code (like 'end repeat') don't need
     * to be sent to the parser since there is not expression to be evaluated.
     */
    protected isParsingNeeded(ctg: VpcLineCategory) {
        switch (ctg) {
            case VpcLineCategory.CallDynamic:
                checkThrow(false, 'call dynamic should be handled elsewhere');
                break;
            case VpcLineCategory.HandlerStart: /* fall-through */
            case VpcLineCategory.HandlerEnd: /* fall-through */
            case VpcLineCategory.HandlerExit: /* fall-through */
            case VpcLineCategory.ProductExit: /* fall-through */
            case VpcLineCategory.HandlerPass: /* fall-through */
            case VpcLineCategory.IfElsePlain: /* fall-through */
            case VpcLineCategory.IfEnd: /* fall-through */
            case VpcLineCategory.RepeatExit: /* fall-through */
            case VpcLineCategory.RepeatNext: /* fall-through */
            case VpcLineCategory.RepeatForever: /* fall-through */
            case VpcLineCategory.RepeatEnd: /* fall-through */
            case VpcLineCategory.DeclareGlobal /* fall-through */:
            case VpcLineCategory.IsInternalvpcmessagesdirective /* fall-through */:
                return false;
            default:
                return true;
        }
    }

    /**
     * for a line like "on myHandler a,b,c"
     * note that in this version, variable names aren't always a tkIdentifier
     */
    protected getListOfValidVariableNames(line: ChvITk[], output: VpcCodeLine, index: number) {
        for (let i = index; i < line.length; i++) {
            checkCommonMistakenVarNames(line[i]);
            checkThrow(this.check.okLocalVar(line[i].image), `8I|name of parameter is a reserved word.`);

            if ((i - index) % 2 === 1) {
                checkThrowEq(
                    tks.tkComma,
                    line[i].tokenType,
                    `8H|required comma every other param (expected on myhandler x, y, z)`,
                    line[i].image
                );
            } else {
                output.excerptToParse.push(line[i]);
            }
        }
    }
}
