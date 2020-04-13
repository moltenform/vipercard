
/* auto */ import { CodeLimits, CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { BuildFakeTokens, ChvITk, isTkType, tks } from './../codeparse/vpcTokens';
/* auto */ import { VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { LoopLimit } from './vpcPreparseCommon';
/* auto */ import { checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { CheckReservedWords } from './vpcCheckReserved';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { ValHolder, assertEq } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * if a function call occurs inside an expression, we pull it outside:

    put 2 * mycustomfunc(5 + mycustomfunc(7 + sin(x))) into x

        -->

    mycustomfunc(7 + sin(x))
    put the result into tmp001
    put 2 * mycustomfunc(5 + tmp001) into x

        -->

    mycustomfunc(7 + sin(x))
    put the result into tmp001
    mycustomfunc(5 + tmp001)
    put the result into tmp002
    put 2 * tmp002 into x
 */
export class ExpandCustomFunctions {
    protected buildToken = new BuildFakeTokens();
    protected skipExpansion: { [key: string]: boolean } = {};
    protected rw: VpcSuperRewrite;
    constructor(protected idgenThisScript: CountNumericId, protected check: CheckReservedWords) {
        /* we don't need to check for fn calls if the line starts with any of these symbols. */
        this.skipExpansion['global'] = true;
        this.skipExpansion['next'] = true;
        this.skipExpansion['exit'] = true;
        this.skipExpansion['else'] = true;
        this.skipExpansion['end'] = true;
        this.skipExpansion['on'] = true;
        this.skipExpansion['function'] = true;
        this.skipExpansion['pass'] = true;

        this.rw = new VpcSuperRewrite(idgenThisScript);
    }

    /* expand function call in this line
    returns a list of resulting lines, since the result could be many lines */
    go(line: ChvITk[]): ChvITk[][] {
        if (this.supportsCustomFnExpansion(line)) {
            return this.goImpl(line);
        } else {
            return [line];
        }
    }

    /**
     * does this line support expansion?
     */
    protected supportsCustomFnExpansion(line: ChvITk[]) {
        return line.length > 0 && !this.skipExpansion[line[0].image];
    }

    /**
     * find a function call within interval [start, end)
     */
    findAFunctionCall(
        ln: ChvITk[],
        start: number,
        end: number,
        filterCalls: (n: number, s: string) => boolean
    ): O<[number, number]> {
        /* function call has TkIdentifier, LParen, then a RParen at the same level */
        /* find a TkIdentifier next to a LParen */
        let foundCall = -1;
        for (let i = start; i < end - 1; i++) {
            if (
                ln[i] &&
                isTkType(ln[i], tks.tkIdentifier) &&
                ln[i + 1] &&
                isTkType(ln[i + 1], tks.tkLParen) &&
                filterCalls(i, ln[i].image)
            ) {
                foundCall = i;
                break;
            }
        }

        if (foundCall !== -1) {
            /* find the closing paren */
            let level = 0;
            let foundEnd = -1;
            for (let i = foundCall; i < end; i++) {
                if (isTkType(ln[i], tks.tkLParen)) {
                    level++;
                } else if (isTkType(ln[i], tks.tkRParen)) {
                    level--;
                    if (level === 0) {
                        foundEnd = i;
                        break;
                    }
                }
            }

            checkThrow(foundEnd !== -1, '8Q|missing ) for function call?', ln[foundCall].image);
            return [foundCall, foundEnd + 1];
        }

        return undefined;
    }

    /**
     * find all the custom function calls and put them on separate lines!
     */
    protected goImpl(line: ChvITk[]) {
        let ret: ChvITk[][] = [];
        let limit = new LoopLimit(CodeLimits.MaxCustomFnCallsAllowedInLine, 'maxCustomFnCallsAllowedInLine');
        let cantUseYetAr = new ValHolder<{ [key: number]: boolean }>({});
        while (limit.next()) {
            /* look for a custom function call */
            let isPotentialUserFn = (n: number, s: string) => !cantUseYetAr.val[n] && this.check.potentialUserFn(s);
            let found = this.findAFunctionCall(line, 1, line.length, isPotentialUserFn);
            if (!found) {
                break;
            }

            /* is there a custom function call *within* this call? */
            let [callstart, callend] = found;
            let foundInside = this.findAFunctionCall(line, callstart + 1, callend, isPotentialUserFn);
            if (foundInside) {
                /* there is a custom fn inside, can't process it yet */
                cantUseYetAr.val[callstart] = true;
            } else {
                /* let's process this one */
                this.expandAFnCall(ret, line, callstart, callend);

                /* reset, since one we couldn't do before we might be able to do now */
                cantUseYetAr.val = {};
            }
        }

        ret.push(line);
        return ret;
    }

    /**
     * create new line calling the function and putting the result in a temp var
     */
    expandAFnCall(ret: ChvITk[][], line: ChvITk[], start: number, end: number) {
        assertTrue(isTkType(line[start], tks.tkIdentifier), '5 |line did not start w identifier');
        assertTrue(isTkType(line[start + 1], tks.tkLParen), '5z|line did not start w identifier(');
        assertTrue(isTkType(line[end - 1], tks.tkRParen), '5y|line did not end w )');
        let stmtCall: ChvITk[] = [];
        let stmtPut: ChvITk[] = [];
        let newvarname = `tmpvar^^${this.idgenThisScript.next()}`;

        /* create new line of code calling this fn */
        checkThrow(this.check.potentialUserFn(line[start].image), '8P|must be valid userfn', line[start].image);
        stmtCall.push(line[start]);
        assertEq(line[start + 1].image, '(', '5x|expected to start with lparen');
        assertEq(line[end - 1].image, ')', '5w|expected to end with rparen');
        let argsNoParens = line.slice(start + 2, end - 1);
        stmtCall = stmtCall.concat(argsNoParens);
        ret.push(stmtCall);

        /* rewrite the syntax, replacing the function call with the new variable! */
        line.splice(start, end - start, this.rw.tokenFromEnglishTerm(newvarname, line[0]));

        /* put results of the call into the temporary variable */
        let template = `put result ( ) %INTO% %ARG0%`;
        let tokenNewVarname = this.rw.tokenFromEnglishTerm(newvarname, line[0]);
        let fromTemplateLines = this.rw.gen(template, line[0], [[tokenNewVarname]]);
        checkThrowEq(1, fromTemplateLines.length, '');
        ret.push(fromTemplateLines[0]);
    }
}
