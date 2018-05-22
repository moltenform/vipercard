
/* auto */ import { assertTrue, cProductName, checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, checkThrowEq, findStrToEnum } from '../../ui512/utils/utils512.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { CountNumericId, LogToReplMsgBox } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { BuildFakeTokens, TypeGreaterLessThanEqual, isTkType, tks } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { MapBuiltinCmds } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { DetermineCategory } from '../../vpc/codepreparse/vpcDetermineCategory.js';
/* auto */ import { ExpandCustomFunctions } from '../../vpc/codepreparse/vpcExpandCustomFns.js';

/* see comment at the top of _vpcAllCode_.ts for an overview */

/**
 * SyntaxRewriter rewrites syntax for some lines:
    1) To minimize number of tokens needed in the lexer (for faster lexing)
        for example:
        ask line 2 of x with "defaultText"
        we could make 'with' a token so that it wouldn't get lumped into the expression line 2 of x.
        but we want to minimze number of tokens.
        so instead, during codepreparse, if the command is ask, replace any tokens that are exactly 'with'.
        ask line 2 of x $syntaxmarker$ "defaultText"
        a $syntaxmarker$ is never part of an expression, and so the parser has no difficulty.
    2) To transform "repeat with x=1 to 5" into a "repeat while" loop with the same functionality
    3) To simplify parsing for a few commands
 */
export class SyntaxRewriter {
    protected readonly buildFake = new BuildFakeTokens();
    protected readonly expandCustomFns: ExpandCustomFunctions;
    constructor(
        protected idGen: CountNumericId,
        protected idgenThisScript: CountNumericId,
        protected mapBuiltinCmds: MapBuiltinCmds,
        protected check: CheckReservedWords
    ) {
        this.expandCustomFns = new ExpandCustomFunctions(idgenThisScript, mapBuiltinCmds, check);
    }

    /**
     * rewrite syntax for a line,
     * return the resulting list of lines
     */
    go(totalLine: ChvIToken[]): ChvIToken[][] {
        assertTrue(totalLine.length > 0, '5&|line is empty');
        let ret: ChvIToken[][] = [];
        let expanded = this.expandCustomFns.go(totalLine);
        for (let i = 0; i < expanded.length; i++) {
            let line = expanded[i];
            let firstToken = line[0].image;
            let method = 'rewrite' + Util512.capitalizeFirst(firstToken);
            let rewritten = Util512.callAsMethodOnClass('SyntaxRewriter', this, method, [line], true);
            if (rewritten) {
                checkThrow(rewritten.length !== undefined, 'rewrite should have returned list of lists 1');
                checkThrow(rewritten[0] && rewritten[0].length !== undefined, 'rewrite should have returned list of lists 2');
            }

            rewritten = !rewritten ? [line] : rewritten;
            ret = ret.concat(rewritten);
        }

        return ret;
    }

    /* input was: answer {x} [with {w} [ or {y} [ or {z}]]] */
    /* turn the 'with' into TkSyntaxMarker for easier parsing later */
    /* safe because there can't be a real variable/function called "with". */
    /* otherwise we'd have to make 'with' a token or make it illegal in an expression, */
    /* which is inefficient */
    rewriteAnswer(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'with', 1);
    }

    /* input was: ask [password] <Expr> [with <Expr>] */
    /* turn the 'with' into TkSyntaxMarker for easier parsing later */
    /* turn the 'password' into TkSyntaxComma for easier parsing later */
    rewriteAsk(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'with', 1);
        if (line.length > 0 && isTkType(line[1], tks.TokenTkidentifier) && line[1].image === 'password') {
            line[1] = this.buildFake.makeSyntaxMarker(line[1], ',');
        }
    }

    /* turn 'choose line tool' into 'choose "line" syntaxmarker' */
    /* turn 'choose tool 6' into 'choose syntaxmarker 6' */
    rewriteChoose(line: ChvIToken[]) {
        checkThrow(
            line.length > 2,
            `8l|not enough args given for choose, expected 'choose tool 3' or 'choose line tool'`
        );

        /* for backwards compat, */
        /* choose line to choose "line" (only if it's a valid tool name though) */
        /* take 2 identifiers because 'choose spray can tool' is also valid */
        if ((isTkType(line[1], tks.TokenTkidentifier) || isTkType(line[1], tks.TokenTkcharorwordoritemorlineorplural)
        || isTkType(line[1], tks.TokenTkbtnorpluralsyn) || isTkType(line[1], tks.TokenTkfldorpluralsyn) ) && isTkType(line[2], tks.TokenTkidentifier) &&
            line[1].image !== 'tool') {

            let maybeToolname = line[1].image
            if (line[2].image !== 'tool') {
                maybeToolname += '_' + line[2].image
            }

            if (findStrToEnum<VpcTool>(VpcTool, maybeToolname) !== undefined) {
                let newLine: ChvIToken[] = []
                newLine.push(line[0])
                newLine.push(this.buildFake.makeStrLiteral(line[1], maybeToolname))
                newLine.push(this.buildFake.makeIdentifier(line[1], 'tool'))

                /* replace contents of line with contents of newLine */
                line.length = 0;
                Util512.extendArray(line, newLine)
            }
        }

        this.replaceIdentifierWithSyntaxMarker(line, 'tool', 1, IsNeeded.Required);
    }

    /* input was: click at x,y with shiftkey */
    /* turn the 'with' into TkSyntaxMarker for easier parsing later */
    rewriteClick(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'with', 1);
    }

    /* input was: click at x1,y1 to x2,y2 with shiftkey */
    /* turn the 'with' into TkSyntaxMarker for easier parsing later */
    rewriteDrag(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'with', 1);
    }

    /* input was: wait for 2 seconds */
    /* turn the 'for' into TkSyntaxMarker for easier parsing later */
    rewriteWait(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'for', 1);
    }

    /* input was: divide x by 5 */
    /* turn the 'by' into TkSyntaxMarker for easier parsing later */
    rewriteDivide(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'by', 1, IsNeeded.Required);
    }

    /* input was: multiply x by 5 */
    /* turn the 'by' into TkSyntaxMarker for easier parsing later */
    rewriteMultiply(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'by', 1, IsNeeded.Required);
    }

    /* input was: subtract 5 from x */
    /* turn the 'from' into TkSyntaxMarker for easier parsing later */
    rewriteSubtract(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'from', 1, IsNeeded.Required);
    }

    /* input was: replace "a" with "b" in s */
    /* turn the 'with' into TkSyntaxMarker for easier parsing later */
    rewriteReplace(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'with', 1, IsNeeded.Required);
    }

    /* input was: do "abc" */
    /* turn into send "abc" to me */
    rewriteDo(line: ChvIToken[]) {
        checkThrow(line.length > 0, "cannot have just do.")
        let addedLine: ChvIToken[] = [];
        addedLine.push(this.buildFake.makeIdentifier(line[0], 'send'));
        addedLine = addedLine.concat(line.slice(1))
        addedLine.push(this.buildFake.make(line[0], tks.TokenTo));
        addedLine.push(this.buildFake.makeIdentifier(line[0], 'me'));
        return [addedLine]
    }

    /* for a line like pass mouseUp, */
    /* add a return statement afterwards, solely to make code exec simpler. */
    rewritePass(line: ChvIToken[]) {
        let addedLine: ChvIToken[] = [];
        addedLine.push(this.buildFake.makeIdentifier(line[0], 'return'));
        addedLine.push(this.buildFake.makeNumLiteral(line[0], 0));
        return [line, addedLine];
    }

    /**
     * from 'go to card "myCard"'
     * to
     * builtinInternalVpcGoCardImpl "gettarget" tmpc1 to card "myCard"
     * builtinInternalVpcGoCardImpl "closefield" tmpc1
     * builtinInternalVpcGoCardImpl "closecard" tmpc1
     * builtinInternalVpcGoCardImpl "closebackground" tmpc1
     * builtinInternalVpcGoCardImpl "set" tmpc1
     * builtinInternalVpcGoCardImpl "openbackground" tmpc1
     * builtinInternalVpcGoCardImpl "opencard" tmpc1
     * builtinInternalVpcGoCardImpl "setresult" tmpc1
     *
     * target computed first 1) in case computation has side effects 2) to support 'any card'
     */
    rewriteGo(line: ChvIToken[]) {
        checkThrow(line.length > 1, "8k|can't have just 'go' on its own. try 'go next' or 'go prev' ");
        let ret:ChvIToken[][] = []
        let firstNewLine:ChvIToken[] = []
        let newVarName = `tmpgovar^^${this.idgenThisScript.next()}`;
        firstNewLine.push(this.buildFake.makeIdentifier(line[0], 'BuiltinInternalVpcGoCardImpl'))
        firstNewLine.push(this.buildFake.makeStrLiteral(line[0], 'gettarget'))
        firstNewLine.push(this.buildFake.makeIdentifier(line[0], newVarName))
        let isBackOrForth = false

        if (line[1].image === 'back') {
            checkThrowEq(2, line.length, "expected 'go back', not 'go back xzy...'")
            firstNewLine.push(this.buildFake.makeStrLiteral(line[0], 'back'))
            isBackOrForth = true
        } else if (line[1].image === 'forth') {
            checkThrowEq(2, line.length, "expected 'go forth', not 'go forth xzy...'")
            firstNewLine.push(this.buildFake.makeStrLiteral(line[0], 'forth'))
            isBackOrForth = true
        } else {
            firstNewLine = firstNewLine.concat(line.slice(1))
        }

        ret.push(firstNewLine)
        for (let s of ['closefield', 'closecard', 'closebackground', 'set', 'openbackground', 'opencard', 'setresult']) {
            if (s === 'set' && isBackOrForth) {
                let suspend:ChvIToken[] = []
                suspend.push(this.buildFake.makeIdentifier(line[0], 'global'))
                suspend.push(this.buildFake.makeIdentifier(line[0], 'internalvpcgocardimplsuspendhistory'))
                ret.push(suspend)
                let putIntoSuspend = this.buildPutIntoStatement('internalvpcgocardimplsuspendhistory', [this.buildFake.makeNumLiteral(line[0], 1)])
                ret.push(putIntoSuspend)
            }

            let newLine:ChvIToken[] = []
            newLine.push(this.buildFake.makeIdentifier(line[0], 'BuiltinInternalVpcGoCardImpl'))
            newLine.push(this.buildFake.makeStrLiteral(line[0], s))
            newLine.push(this.buildFake.makeIdentifier(line[0], newVarName))
            newLine.push(this.buildFake.makeStrLiteral(line[0], ''))
            ret.push(newLine)
        }

        return ret
    }

    /* input was: put "abc" into x */
    /* transform to put "abc" (TkSyntaxMarker) into (TkSyntaxMarker) x */
    rewritePut(line: ChvIToken[]) {
        /* let's say you don't realize that "length" is a reserved word,
        and you try to use it as a variable. "put 4 into length"
        you'd get the error message NotAllInputParsed exception,
        which doesn't make too much sense, let's try to give you a better error message */
        DetermineCategory.checkCommonMistakenVarNames(line[line.length - 1]);

        let foundPreposition = -1;
        for (let i = 0; i < line.length; i++) {
            let tk = line[i];
            if (isTkType(tk, tks.TokenTkidentifier)) {
                if (tk.image === 'into' || tk.image === 'before' || tk.image === 'after') {
                    checkThrowEq(-1, foundPreposition, '5#|expected to only see one of into, before, or after...');
                    foundPreposition = i;
                }
            }
        }

        if (foundPreposition === -1) {
            /* say put "abc" to add to the message box */
            foundPreposition = line.length
            line.push(this.buildFake.makeIdentifier(line[0], 'into'))
            line.push(this.buildFake.makeIdentifier(line[0], LogToReplMsgBox.redirectThisVariableToMsgBox))
        }

        let newMarker1 = this.buildFake.makeSyntaxMarker(line[0]);
        let newMarker2 = this.buildFake.makeSyntaxMarker(line[0]);
        checkThrow(
            line.length > 1 && foundPreposition && foundPreposition > 0,
            '8h|line should not start with into,before,or after'
        );

        line.splice(foundPreposition + 1, 0, newMarker1);
        line.splice(foundPreposition, 0, newMarker2);
    }

    /* input was: exit to %cProductName */
    /* remove the 'to' for easier parsing later */
    rewriteExit(line: ChvIToken[]) {
        if (line.length > 1 && line[1].image === 'to') {
            line.splice(1, 1);
        }
    }

    /* input was: show cd btn "myBtn" at 3,4 */
    /* turn the 'at' into TkSyntaxMarker for easier parsing later */
    rewriteShow(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, 'at', 1);
    }

    /* rewrite repeat */
    rewriteRepeat(line: ChvIToken[]) {
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

    /*
    Transform:
        repeat 5 times
            answer x
        end repeat
    into
        repeat with tmpvar = 1 to 5
            answer x
        end repeat

    (and then we'll transform it again, by calling rewriteRepeatWith)
    */
    rewriteRepeatFor(line: ChvIToken[]) {
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
        let newVarName = `tmploopvar^^${this.idgenThisScript.next()}`;
        let repeatWith = [
            this.buildFake.makeIdentifier(line[0], 'repeat'),
            this.buildFake.makeIdentifier(line[0], 'with'),
            this.buildFake.makeIdentifier(line[0], newVarName),
            this.buildFake.makeGreaterLessThanEqual(line[0], '='),
            this.buildFake.makeNumLiteral(line[0], 1),
            this.buildFake.make(line[0], tks.TokenTo)
        ];

        repeatWith = repeatWith.concat(line.slice(1));
        return this.rewriteRepeatWith(repeatWith);
    }

    /*
    Transform:
            repeat with x = 3+got1() to 7+getUpperBound()
                answer x
            end repeat
    Into:
            put (3+got1()) into tmpvar
            put tmpvar into x
            repeat while tmpvar <= (7+getUpperBound())
                put tmpvar into x
                put tmpvar+1 into tmpvar
                answer x
            end repeat
    */
    rewriteRepeatWith(line: ChvIToken[]) {
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
        let visibleCountVar = line[2].image;
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
        ret.push(this.buildPutIntoStatement(visibleCountVar, [this.buildFake.makeIdentifier(line[0], newvarname)]));
        ret.push(this.buildRepeatWhile(newvarname, isCountDown ? '>=' : '<=', line, limitExprStart, limitExprEnd));
        ret.push(this.buildPutIntoStatement(visibleCountVar, [this.buildFake.makeIdentifier(line[0], newvarname)]));
        ret.push(this.buildPutIntoStatement(newvarname, incOrDec));
        return ret;
    }

    /**
     * build fake tokens to make "put (expr) into tmpvar"
     */
    buildPutIntoStatement(destination: string, expr: ChvIToken[], exprStart?: number, exprEnd?: number) {
        let newCode: ChvIToken[] = [];
        newCode.push(this.buildFake.makeIdentifier(expr[0], 'put'));
        newCode.push(this.buildFake.make(expr[0], tks.TokenTklparen));
        let slice = expr.slice(exprStart, exprEnd);
        checkThrow(slice.length > 0, '8S|wrong length, not enough tokens');
        newCode = newCode.concat(slice);
        newCode.push(this.buildFake.make(expr[0], tks.TokenTkrparen));
        newCode.push(this.buildFake.makeIdentifier(expr[0], 'into'));
        newCode.push(this.buildFake.makeIdentifier(expr[0], destination));
        this.rewritePut(newCode);
        return newCode;
    }

    /**
     * build a construct "repeat while (expr)"
     */
    buildRepeatWhile(
        counter: string,
        direction: TypeGreaterLessThanEqual,
        expr: ChvIToken[],
        exprStart: number,
        exprEnd: number
    ) {
        let newCode: ChvIToken[] = [];
        newCode.push(this.buildFake.makeIdentifier(expr[0], 'repeat'));
        newCode.push(this.buildFake.makeIdentifier(expr[0], 'while'));
        newCode.push(this.buildFake.makeIdentifier(expr[0], counter));
        newCode.push(this.buildFake.makeGreaterLessThanEqual(expr[0], direction));
        newCode.push(this.buildFake.make(expr[0], tks.TokenTklparen));
        let slice = expr.slice(exprStart, exprEnd);
        checkThrow(slice.length > 0, '8R|wrong length, not enough tokens');
        newCode = newCode.concat(slice);
        newCode.push(this.buildFake.make(expr[0], tks.TokenTkrparen));
        return newCode;
    }

    /**
     * replace an identifier with a 'syntax marker'
     * a $syntaxmarker$ is never part of an expression, and so the parser
     * has no difficulty knowing where the expression stops.
     */
    protected replaceIdentifierWithSyntaxMarker(
        line: ChvIToken[],
        search: string,
        maxTimes: number,
        needed: IsNeeded = IsNeeded.Optional,
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

        if (needed === IsNeeded.Required && count !== maxTimes) {
            throw makeVpcScriptErr(`5%|syntax error, did not see the keyword "${search}"`);
        }

        return count;
    }
}

/**
 * indicate if the term should always be present
 */
const enum IsNeeded {
    Optional = 1,
    Required
}
