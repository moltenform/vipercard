
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, checkThrowEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CountNumericId } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { BuildFakeTokens, isTkType, tks, typeGreaterLessThanEqual } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { MapBuiltinCmds } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { ExpandCustomFunctions } from '../../vpc/codepreparse/vpcExpandFnCalls.js';

export class SyntaxRewriter {
    protected readonly buildFake = new BuildFakeTokens();
    protected readonly expandCustomFns: ExpandCustomFunctions;
    constructor(
        protected idgen: CountNumericId,
        protected idgenThisScript: CountNumericId,
        protected mapBuiltinCmds: MapBuiltinCmds,
        protected check: CheckReservedWords
    ) {
        this.expandCustomFns = new ExpandCustomFunctions(idgenThisScript, mapBuiltinCmds, check);
    }

    go(totalLine: ChvIToken[]): ChvIToken[][] {
        assertTrue(totalLine.length > 0, '5&|line is empty');
        let ret: ChvIToken[][] = [];
        let expanded = this.expandCustomFns.go(totalLine);
        for (let i = 0; i < expanded.length; i++) {
            let line = expanded[i];
            let firsttoken = line[0].image;
            let methodname = 'rewrite_' + firsttoken;
            let rewritten = Util512.callAsMethodOnClass('SyntaxRewriter', this, methodname, [line], true);
            rewritten = !rewritten ? [line] : rewritten;
            ret = ret.concat(rewritten);
        }

        return ret;
    }

    protected replaceIdentifierWithSyntaxMarker(
        line: ChvIToken[],
        search: string,
        maxTimes: number,
        needed: '' | 'required' = '',
        whichMarker = ''
    ) {
        let count = 0;
        for (let i = 0; i < line.length; i++) {
            if (isTkType(line[i], tks.TokenTkidentifier) && line[i].image === search) {
                line[i] = this.buildFake.makeSyntaxMarker(line[i], whichMarker);
                count += 1;
                if (count >= maxTimes) {
                    break;
                }
            }
        }

        if (needed === 'required' && count !== maxTimes) {
            throw makeVpcScriptErr(`5%|syntax error, did not see the keyword "${search}"`);
        }

        return count;
    }

    rewrite_answer(line: ChvIToken[]) {
        /* real syntax: answer <FACTOR> [with <FACTOR> [ or <FACTOR> [ or <FACTOR>]]] */
        /* turn the 'with' into TkSyntaxMarker for easier parsing later */
        /* safe because there won't ever be a real variable/function called "with". */
        this.replaceIdentifierWithSyntaxMarker(line, 'with', 1);
    }

    rewrite_ask(line: ChvIToken[]) {
        /* real syntax: ask [password] <Expr> [with <Expr>] */
        /* turn the 'with' into TkSyntaxMarker for easier parsing later */
        /* turn the 'password' into TkSyntaxComma for easier parsing later */
        this.replaceIdentifierWithSyntaxMarker(line, 'with', 1);
        if (line.length > 0 && isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'password') {
            line[1] = this.buildFake.makeSyntaxMarker(line[1], ',');
        }
    }

    rewrite_choose(line: ChvIToken[]) {
        /* original syntax: choose browse tool, choose round rect tool, choose tool 3 */
        /* my syntax (much simpler): choose "browse" tool, choose "round rect" tool */
        checkThrow(
            line.length > 2,
            `8l|not enough args given for choose, expected 'choose tool 3' or 'choose line tool'`
        );
        this.replaceIdentifierWithSyntaxMarker(line, 'tool', 1, 'required');
    }

    rewrite_click(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'with', 1);
    }

    rewrite_drag(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'with', 1);
    }

    rewrite_wait(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'for', 1);
    }

    rewrite_divide(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'by', 1, 'required');
    }

    rewrite_multiply(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'by', 1, 'required');
    }

    rewrite_subtract(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'from', 1, 'required');
    }

    rewrite_pass(line: ChvIToken[]) {
        /* add a return statement afterwards, solely to make code exec simpler. */
        let newline: ChvIToken[] = [];
        newline.push(this.buildFake.makeIdentifier(line[0], 'return'));
        newline.push(this.buildFake.makeNumLiteral(line[0], 0));
        return [line, newline];
    }

    rewrite_go(line: ChvIToken[]) {
        /* we no longer support "go back" and "go forth". */
        /* they'd be wrongly parsed (eaten by NtDest / Position) anyways */
        checkThrow(line.length > 1, "8k|can't have just 'go' on its own. try 'go next' or 'go prev' ");
        checkThrow(
            line[1].image !== 'back',
            "8j|we don't support 'go back', instead use 'go next' or 'go prev' or 'go card 2'."
        );
        checkThrow(
            line[1].image !== 'forth',
            "8i|we don't support 'go forth', instead use 'go next' or 'go prev' or 'go card 2'."
        );
    }

    rewrite_put(line: ChvIToken[]) {
        /* transform put "abc" into x */
        /* into */
        /* put "abc" (marker) into (marker) x */
        let findwhere = (s: string) => line.findIndex(tk => isTkType(tk, tks.TokenTkidentifier) && tk.image === s);
        let findInto = findwhere('into');
        let findBefore = findwhere('before');
        let findAfter = findwhere('after');
        let sum = [findInto === -1, findBefore === -1, findAfter === -1].filter(x => !x).length;
        if (sum === 0) {
            throw makeVpcScriptErr(
                "5$|missing into, before, or after. we don't support 'put \"abc\"' to use the message box."
            );
        } else if (sum > 1) {
            throw makeVpcScriptErr('5#|expected to only see one of into, before, or after...');
        } else {
            let newmarker1 = this.buildFake.makeSyntaxMarker(line[0]);
            let newmarker2 = this.buildFake.makeSyntaxMarker(line[0]);
            let pos = [findInto, findBefore, findAfter].filter(x => x !== -1)[0];
            checkThrow(line.length > 1 && pos && pos > 0, '8h|line should not start with into,before,or after');
            line.splice(pos + 1, 0, newmarker1);
            line.splice(pos, 0, newmarker2);
        }
    }

    rewrite_exit(line: ChvIToken[]) {
        /* simplifies logic later. */
        /* rewrite "exit to vpc" to "exit vpc" */
        if (line.length > 1 && line[1].image === 'to') {
            line.splice(1, 1);
        }
    }

    rewrite_show(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'at', 1);
    }

    rewrite_repeat(line: ChvIToken[]) {
        if (line.length > 1 && isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'forever') {
            /* from 'repeat forever' to 'repeat' */
            checkThrowEq(2, line.length, `8g|bad syntax, use 'repeat forever' not 'repeat forever xyz'`);
            line.splice(1, 1);
        } else if (line.length > 1 && isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'with') {
            /* transform 'repeat with' into 'repeat while' */
            return this.rewriteRepeatWith(line);
        } else if (
            line.length > 1 &&
            !(isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'until') &&
            !(isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'while')
        ) {
            /* transform 'repeat for' into 'repeat while' */
            return this.rewriteRepeatFor(line);
        }
    }

    rewriteRepeatFor(line: ChvIToken[]) {
        /*
        Transform:
            repeat 5 times
                print x
            end repeat
        into a 'repeat with' that will then be transformed by rewriteRepeatWith
        */
        let ret: ChvIToken[][] = [];
        let msg = `bad repeat statement. needed 'repeat 5' or 'repeat for 5 times'`;
        checkThrow(line.length >= 2, msg + 'wrong length', '8a|');
        if (isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'for') {
            line.splice(1, 1);
        }
        if (isTkType(line[line.length - 1], tks.TokenTkidentifier) && line[line.length - 1].image === 'times') {
            line.splice(line.length - 1, 1);
        }

        checkThrow(line.length >= 2, msg + 'no expression found', '8Z|');

        /* use a number relative to this script -- otherwise it would change on */
        /* every re-compile, it'd be a bit slower because wouldn't be found in the cache */
        let newvarname = `tmploopvar^^${this.idgenThisScript.next()}`;
        let repeatWith = [
            this.buildFake.makeIdentifier(line[0], 'repeat'),
            this.buildFake.makeIdentifier(line[0], 'with'),
            this.buildFake.makeIdentifier(line[0], newvarname),
            this.buildFake.makeGreaterLessThanEqual(line[0], '='),
            this.buildFake.makeNumLiteral(line[0], 1),
            this.buildFake.make(line[0], tks.TokenTo)
        ];

        repeatWith = repeatWith.concat(line.slice(1));
        return this.rewriteRepeatWith(repeatWith);
    }

    rewriteRepeatWith(line: ChvIToken[]) {
        /*
        Transform:
                repeat with x = 3+got1() to 7+needthis()
                    print x
                end repeat
        Into:
                put (3+got1()) into tmpvar
                put tmpvar into x
                repeat while tmpvar <= (7+needthis())
                    put tmpvar into x
                    put tmpvar+1 into tmpvar
                    print x
                end repeat
        */

        let ret: ChvIToken[][] = [];
        let msg = `bad repeat with statement. needed 'repeat with x = 1 to 3' : `;
        checkThrow(line.length >= 7, msg + 'wrong length', '8Y|');
        checkThrow(isTkType(line[0], tks.TokenTkidentifier) && line[0].image === 'repeat', `8X|missing "repeat"`);
        checkThrow(isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'with', `8W|missing "with"`);
        checkThrow(
            isTkType(line[2], tks.TokenTkidentifier) && this.check.okLocalVar(line[2].image),
            `8V|missing "x" or "x" is a reserved word like "a" or "sin"`
        );
        checkThrow(isTkType(line[3], tks.TokenTkgreaterorlessequalorequal) && line[3].image === '=', `8U|missing "="`);
        let indexOfTo = -1;
        for (let i = 0; i < line.length; i++) {
            if (isTkType(line[i], tks.TokenTo)) {
                indexOfTo = i;
                break;
            }
        }

        checkThrow(indexOfTo !== -1, msg + 'missing "to"', '8T|');
        let isCountDown = isTkType(line[indexOfTo - 1], tks.TokenTkidentifier) && line[indexOfTo - 1].image === 'down';
        let visiblecountvar = line[2].image;
        let initExprStart = 4;
        let initExprEnd = isCountDown ? indexOfTo - 1 : indexOfTo;
        let limitExprStart = indexOfTo + 1;
        let limitExprEnd = line.length;
        let newvarname = `tmploopvar^^${this.idgenThisScript.next()}`;
        let incOrDec = [
            this.buildFake.makeIdentifier(line[0], newvarname),
            this.buildFake.makePlusMinus(line[0], isCountDown ? '-' : '+'),
            this.buildFake.makeNumLiteral(line[0], 1)
        ];

        ret.push(this.buildPutIntoStatement(newvarname, line, initExprStart, initExprEnd));
        ret.push(this.buildPutIntoStatement(visiblecountvar, [this.buildFake.makeIdentifier(line[0], newvarname)]));
        ret.push(this.buildRepeatWhile(newvarname, isCountDown ? '>=' : '<=', line, limitExprStart, limitExprEnd));
        ret.push(this.buildPutIntoStatement(visiblecountvar, [this.buildFake.makeIdentifier(line[0], newvarname)]));
        ret.push(this.buildPutIntoStatement(newvarname, incOrDec));
        return ret;
    }

    buildPutIntoStatement(
        destination: string,
        expr: ChvIToken[],
        exprstart: O<number> = undefined,
        exprend: O<number> = undefined
    ) {
        let newcode: ChvIToken[] = [];
        newcode.push(this.buildFake.makeIdentifier(expr[0], 'put'));
        newcode.push(this.buildFake.make(expr[0], tks.TokenTklparen));
        let slice = expr.slice(exprstart, exprend);
        checkThrow(slice.length > 0, '8S|wrong length, not enough tokens');
        newcode = newcode.concat(slice);
        newcode.push(this.buildFake.make(expr[0], tks.TokenTkrparen));
        newcode.push(this.buildFake.makeIdentifier(expr[0], 'into'));
        newcode.push(this.buildFake.makeIdentifier(expr[0], destination));
        this.rewrite_put(newcode);
        return newcode;
    }

    buildRepeatWhile(
        counter: string,
        direction: typeGreaterLessThanEqual,
        expr: ChvIToken[],
        exprstart: number,
        exprend: number
    ) {
        let newcode: ChvIToken[] = [];
        newcode.push(this.buildFake.makeIdentifier(expr[0], 'repeat'));
        newcode.push(this.buildFake.makeIdentifier(expr[0], 'while'));
        newcode.push(this.buildFake.makeIdentifier(expr[0], counter));
        newcode.push(this.buildFake.makeGreaterLessThanEqual(expr[0], direction));
        newcode.push(this.buildFake.make(expr[0], tks.TokenTklparen));
        let slice = expr.slice(exprstart, exprend);
        checkThrow(slice.length > 0, '8R|wrong length, not enough tokens');
        newcode = newcode.concat(slice);
        newcode.push(this.buildFake.make(expr[0], tks.TokenTkrparen));
        return newcode;
    }
}
