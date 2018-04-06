
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, refparam } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CodeLimits, CountNumericId } from '../../vpc/vpcutils/vpcutils.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgechv.js';
/* auto */ import { BuildFakeTokens, isTkType, tks } from '../../vpc/codeparse/vpctokens.js';
/* auto */ import { LoopLimit, MapBuiltinCmds } from '../../vpc/codepreparse/vpcpreparsecommon.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpccheckreserved.js';

export class ExpandCustomFunctions {
    protected readonly buildFake = new BuildFakeTokens();
    constructor(
        protected idgenThisScript: CountNumericId,
        protected mapBuiltinCmds: MapBuiltinCmds,
        protected check: CheckReservedWords
    ) {}

    go(line: ChvIToken[]): ChvIToken[][] {
        if (this.supportsCustomFnExpansion(line)) {
            return this.rewriteToAllowCustomFns(line);
        } else {
            let isPotentialUserFn = (n: number, s: string) => this.check.potentialUserFn(s);
            let found = this.findAFunctionCall(line, 1, line.length, isPotentialUserFn);
            if (found) {
                throw makeVpcScriptErr(`5!|this looks like a custom function call ${line[found[0]].image}(),
                but we don't yet support custom fn calls in this type of line.
                try putting into another variable first.`);
            }
            return [line];
        }
    }

    protected supportsCustomFnExpansion(line: ChvIToken[]) {
        return (
            line.length > 0 &&
            isTkType(line[0], tks.TokenTkidentifier) &&
            (line[0].image === 'if' || line[0].image === 'return' || this.mapBuiltinCmds.find(line[0].image))
        );
    }

    findAFunctionCall(
        ln: ChvIToken[],
        start: number,
        end: number,
        filterCalls: (n: number, s: string) => boolean
    ): O<[number, number]> {
        // function call has TkIdentifier, LParen, then a RParen at the same level
        // find a TkIdentifier next to a LParen
        let foundCall = -1;
        for (let i = start; i < end - 1; i++) {
            if (
                ln[i] &&
                isTkType(ln[i], tks.TokenTkidentifier) &&
                ln[i + 1] &&
                isTkType(ln[i + 1], tks.TokenTklparen) &&
                filterCalls(i, ln[i].image)
            ) {
                foundCall = i;
                break;
            }
        }

        if (foundCall !== -1) {
            // find the closing paren
            let level = 0;
            let foundEnd = -1;
            for (let i = foundCall; i < end; i++) {
                if (isTkType(ln[i], tks.TokenTklparen)) {
                    level++;
                } else if (isTkType(ln[i], tks.TokenTkrparen)) {
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
    }

    rewriteToAllowCustomFns(line: ChvIToken[]) {
        let ret: ChvIToken[][] = [];
        let limit = new LoopLimit(CodeLimits.maxCustomFnCallsAllowedInLine, 'maxCustomFnCallsAllowedInLine');
        let cantUseYetAr = new refparam<{ [key: number]: boolean }>({});
        while (limit.next()) {
            // look for a custom function call
            let isPotentialUserFn = (n: number, s: string) => !cantUseYetAr.val[n] && this.check.potentialUserFn(s);
            let found = this.findAFunctionCall(line, 1, line.length, isPotentialUserFn);
            if (!found) {
                break;
            }

            // is there a custom function call *within* this call?
            let [callstart, callend] = found;
            let foundInside = this.findAFunctionCall(line, callstart + 1, callend, isPotentialUserFn);
            if (foundInside) {
                // there is a custom fn inside, can't process it yet
                cantUseYetAr.val[callstart] = true;
            } else {
                // let's process this one
                this.expandAFnCall(ret, line, callstart, callend);

                // reset, since one we couldn't do before we might be able to do now
                cantUseYetAr.val = {};
            }
        }

        ret.push(line);
        return ret;
    }

    expandAFnCall(ret: ChvIToken[][], line: ChvIToken[], start: number, end: number) {
        assertTrue(isTkType(line[start], tks.TokenTkidentifier), '5 |line did not start w identifier');
        assertTrue(isTkType(line[start + 1], tks.TokenTklparen), '5z|line did not start w identifier(');
        assertTrue(isTkType(line[end - 1], tks.TokenTkrparen), '5y|line did not end w )');
        let stmtCall: ChvIToken[] = [];
        let stmtPut: ChvIToken[] = [];
        let newvarname = `tmpvar^^${this.idgenThisScript.next()}`;

        // create new line of code calling this fn
        checkThrow(this.check.potentialUserFn(line[start].image), '8P|must be valid userfn', line[start].image);
        stmtCall.push(line[start]);
        assertEq(line[start + 1].image, '(', '5x|expected to start with lparen');
        assertEq(line[end - 1].image, ')', '5w|expected to end with rparen');
        let argsNoParens = line.slice(start + 2, end - 1);
        stmtCall = stmtCall.concat(argsNoParens);
        ret.push(stmtCall);

        // rewrite the syntax, replacing the function call with the new variable!
        line.splice(start, end - start, this.buildFake.makeIdentifier(line[0], newvarname));

        // put results of the call into the temporary variable
        stmtPut.push(this.buildFake.makeIdentifier(line[0], 'put'));
        stmtPut.push(this.buildFake.makeIdentifier(line[0], 'result'));
        stmtPut.push(this.buildFake.make(line[0], tks.TokenTklparen));
        stmtPut.push(this.buildFake.make(line[0], tks.TokenTkrparen));
        stmtPut.push(this.buildFake.makeIdentifier(line[0], 'into'));
        stmtPut.push(this.buildFake.makeIdentifier(line[0], newvarname));
        ret.push(stmtPut);
    }
}
