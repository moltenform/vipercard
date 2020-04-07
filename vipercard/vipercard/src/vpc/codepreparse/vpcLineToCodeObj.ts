
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { BuildFakeTokens, ChvITk, tks } from './../codeparse/vpcTokens';
/* auto */ import { CodeSymbols, VpcCodeLine, VpcLineCategory, checkCommonMistakenVarNames } from './vpcPreparseCommon';
/* auto */ import { VpcChvParser } from './../codeparse/vpcParser';
/* auto */ import { CheckReservedWords } from './vpcCheckReserved';
/* auto */ import { checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, checkThrowEq, last } from './../../ui512/utils/util512';


/**
 * determine the category of a line of code
 */
export class VpcLineToCodeObj {
    reusableRequestEval: ChvITk;
    reusableRequestUserHandler: ChvITk;
    constructor(
        protected idGen: CountNumericId,
        protected parser: VpcChvParser,
        protected check: CheckReservedWords
    ) {
    }
    
    toCodeLines(lines: ChvITk[][]) : VpcCodeLine[] {
        this.reusableRequestEval = BuildFakeTokens.inst.makeTk(lines[0][0], tks.tkIdentifier, CodeSymbols.RequestEval)
        this.reusableRequestUserHandler = BuildFakeTokens.inst.makeTk(lines[0][0], tks.tkIdentifier, CodeSymbols.RequestHandlerCall)

        let parser = getParsingObjects()[1];
        let results: VpcCodeLine[] = []
        for (let line of lines) {
            let ret = this.toCodeLine(parser, line, results)
            results.push(ret)
        }

        return results
    }

    toCodeLine(parser: VpcChvParser, line: ChvITk[], results:VpcCodeLine[]) {
        checkThrow(line && line.length > 0, "8O|we don't allow empty lines of code");
        checkThrow(
            line[0].tokenType === tks.tkIdentifier,
            "8N|The first word of this line is not a valid command or keyword.", line[0].image
        );
        let firstImage = line[0].image
        let ruleAsBuiltin = 'RuleBuiltinCmd' + firstImage
        let output = new VpcCodeLine(this.idGen.next(), line);
        if (parser[ruleAsBuiltin] !== undefined) {
            this.goBuiltinCmd(firstImage, line, output);
            last(results).setParseRule(parser[ruleAsBuiltin])
        } else {
            let methodName = 'go' + Util512.capitalizeFirst(firstImage)
            let got = Util512.callAsMethodOnClass('VpcLineToCodeObj', this, methodName, [line, output], true, 'notexist')
            if (got === 'notexist') {
                this.goCustomCommand(line, results)
            }
        }

        return output
    }

    

    /**
     * this line is a call to a built in command like "put"
     */
    goBuiltinCmd(firstImage: string, line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.Statement;
        output.excerptToParse = this.standardExcerptToParse(line);
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
        return this.goOn(line, output, line[0]);
    }

    /**
     * this line is a handler start like "on mouseUp"
     */
    goOn(line: ChvITk[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.HandlerStart;
        checkThrow(line.length > 1, `8F|cannot have a line that is just "on"`);
        checkCommonMistakenVarNames(line[1]);
        checkThrow(this.check.okHandlerName(line[1].image), `8E|name of handler is a reserved word.`);
        checkThrowEq(
            tks.tkIdentifier,
            line[1].tokenType,
            `8D|expected "on myhandler" but got "on <invalid name>`
        );

        output.excerptToParse.push(line[0]); /* 'on' or 'function' */
        output.excerptToParse.push(line[1]); /* name of handler */
        this.getListOfValidVariableNames(line, output, 2);
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
        if (line.length > 1) {
            /* kind reminders to the user */
            let firstToken = line[0];
            checkThrow(line[1].image !== '=', `8M|this isn't C... you need to use 'put 1 into x' not 'x = 1'`);
            checkThrow(
                !firstToken.endOffset || (line[1].image !== '(' || line[1].startOffset > firstToken.endOffset + 1),
                `8L|this isn't C... you need to say 'put fn() into x' or 'get fn()' but not 'fn()' alone`
            );
        }

        output.ctg = VpcLineCategory.CallHandler;
        checkThrow(
            this.check.okHandlerName(line[0].image),
            `8K|it looked like you were calling a handler like mouseUp or myHandler, but this is a reserved word.`
        );
        output.excerptToParse = [this.reusableRequestUserHandler].concat(line);
        output.setParseRule(this.parser.RuleInternalCmdUserHandler);
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
            `88|cannot have a line that is just "return". if you really want to return void, try exit myhandler.`
        );
        output.excerptToParse = line.slice(1);
    }

    /**
     * perf. optimization, many lines of code (like 'end repeat') don't need
     * to be sent to the parser since there is not expression to be evaluated.
     */
    protected isParsingNeeded(ctg: VpcLineCategory) {
        switch (ctg) {
            case VpcLineCategory.CallDynamic:
                checkThrow(false, 'call dynamic should be handled elsewhere')
                break
            case VpcLineCategory.GoCardImpl:
                checkThrow(false, 'go to card should be handled elsewhere')
                break
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
            case VpcLineCategory.DeclareGlobal: /* fall-through */
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

    protected standardExcerptToParse(line: ChvITk[], deleteFirst=true) {
        if (deleteFirst) {
            // we usually get rid of the command name
            line = line.slice(1)
        }
        return [ BuildFakeTokens.inst.makeSyntaxMarker(line[0]), BuildFakeTokens.inst.makeSyntaxMarker(line[0])  ].concat(line)
    }
}
