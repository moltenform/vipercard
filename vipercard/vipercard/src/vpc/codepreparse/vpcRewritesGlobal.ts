
/* auto */ import { CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { BuildFakeTokens, ChvITk, ChvITkType, listOfAllWordLikeTokens, tks } from './../codeparse/vpcTokens';
/* auto */ import { O, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, checkThrowEq, last } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

export class VpcRewritesGlobal {
    static rewriteSpecifyCdOrBgPart(line: ChvITk[]): ChvITk[] {
        let ret: ChvITk[] = [];
        let copyLine = line.slice();
        copyLine.reverse();
        for (let i = 0; i < copyLine.length - 1; i++) {
            let insertIt: O<ChvITkType>;
            let s = '';
            if (copyLine[i].tokenType === tks.tkBtn || copyLine[i].tokenType === tks.tkFld) {
                let next = copyLine[i + 1];
                if (next.tokenType !== tks.tkCard && next.tokenType !== tks.tkBg) {
                    insertIt = copyLine[i].tokenType === tks.tkFld ? tks.tkBg : tks.tkCard;
                    s = copyLine[i].tokenType === tks.tkFld ? 'bg' : 'cd';
                }
            }

            ret.push(copyLine[i]);
            if (insertIt) {
                ret.push(BuildFakeTokens.inst.makeTk(copyLine[i], insertIt, s));
            }
        }

        ret.push(last(copyLine));
        ret.reverse();
        return ret;
    }
}

/**
 * helps rewrite code
   example:
   `
    put %ARG0% into x
    put %ARG1% into $loopbound%UNIQUE%
    repeat
        if x >= $loopbound%UNIQUE% then
            exit repeat
        end if
        put x + 1 into x
        %SYNPLACEHOLDER%
        %ARGMANY%
    end repeat`
 */
export class VpcSuperRewrite {
    constructor(protected idGen: CountNumericId) {}

    gen(s: string, realTokenAsBasis: ChvITk, args?: ChvITk[][], argMany?: ChvITk[][], needsToBePostProcess = true): ChvITk[][] {
        args = args ?? [];
        let ret: ChvITk[][] = [];
        s = s.trim();
        s = s.replace(/%UNIQUE%/g, '$unique' + this.idGen.nextAsStr());
        let lines = s.replace(/\r\n/g, '\n').split('\n');
        for (let line of lines) {
            if (line.trim() === '%ARGMANY%' && argMany) {
                Util512.extendArray(ret, argMany);
            } else {
                let terms = line.split(/\s+/);
                ret.push([]);
                for (let term of terms) {
                    this.addTerm(ret, term, args, realTokenAsBasis, needsToBePostProcess);
                }
            }
        }
        return ret;
    }

    protected addTerm(ret: ChvITk[][], term: string, args: ChvITk[][], realTokenAsBasis: ChvITk, needsToBePostProcess: boolean) {
        if (term.startsWith('%ARG')) {
            checkThrowEq('%', term[term.length - 1], '');
            let sn = term.replace(/%ARG/g, '').replace(/%/g, '');
            let n = Util512.parseIntStrict(sn);
            checkThrow(typeof n === 'number' && n >= 0 && n < args.length, 'internal error in template');
            Util512.extendArray(last(ret), args[n]);
        } else if (term === '%INTO%' || term === '%BEFORE%' || term === '%AFTER%') {
            last(ret).push(BuildFakeTokens.inst.makeSyntaxMarker(realTokenAsBasis));
            let newToken = this.tokenFromEnglishTerm(term.replace(/%/g, '').toLowerCase(), realTokenAsBasis);
            last(ret).push(newToken);
            last(ret).push(BuildFakeTokens.inst.makeSyntaxMarker(realTokenAsBasis));
        } else {
            checkThrow(
                !needsToBePostProcess || (term !== 'into' && term !== 'before' && term !== 'after'),
                "it's not safe to say 'put 4 into x' here. try 'put 4 %INTO% x' instead."
            );
            let newToken = this.tokenFromEnglishTerm(term, realTokenAsBasis);
            last(ret).push(newToken);
        }
    }

    tokenFromEnglishTerm(term: string, realTokenAsBasis: ChvITk) {
        let tktype = listOfAllWordLikeTokens[term];
        if (!tktype && term.startsWith('"') && term.endsWith('"')) {
            // we can make a simple string literal, not one that contains spaces though.
            tktype = tks.tkStringLiteral;
        } else if (!tktype && term.match(/^[0-9]+$/)) {
            tktype = tks.tkNumLiteral;
        } else if (!tktype) {
            tktype = tks.tkIdentifier;
            checkThrow(
                term.match(/^[a-zA-Z$][0-9a-zA-Z$]*$/),
                'internal error in template, not a known symbol or valid tkidentifier'
            );
        }

        return BuildFakeTokens.inst.makeTk(realTokenAsBasis, tktype, term);
    }

    replaceWithSyntaxMarkerAtLvl0(
        line: ChvITk[],
        realTokenAsBasis: ChvITk,
        term: string,
        mustExist: boolean,
        syntaxMarkerType = ''
    ) {
        let index = this.searchTokenGivenEnglishTermInParensLevel(0, line, realTokenAsBasis, term);
        if (index === -1) {
            checkThrow(!mustExist, `did not see ${term} in a ${line[0].image}`);
            return false;
        } else {
            let marker = BuildFakeTokens.inst.makeSyntaxMarker(realTokenAsBasis, syntaxMarkerType);
            line[index] = marker;
            return true;
        }
    }

    searchTokenGivenEnglishTerm(line: ChvITk[], realTokenAsBasis: ChvITk, term: string) {
        let tk1 = this.tokenFromEnglishTerm(term, realTokenAsBasis);
        return line.findIndex(t => t.tokenType === tk1.tokenType && t.image === tk1.image);
    }

    searchTokenGivenEnglishTermInParensLevel(wantedLevel: number, line: ChvITk[], realTokenAsBasis: ChvITk, term: string) {
        let tk1 = this.tokenFromEnglishTerm(term, realTokenAsBasis);
        let lvl = 0;
        for (let i = 0; i < line.length; i++) {
            let t = line[i];
            if (t.tokenType === tks.tkLParen) {
                lvl += 1;
            } else if (t.tokenType === tks.tkRParen) {
                lvl -= 1;
            } else if (t.tokenType === tk1.tokenType && t.image === tk1.image && lvl === wantedLevel) {
                return i;
            }
        }
        return -1;
    }

    generateUniqueVariable(realTokenAsBasis: ChvITk, prefix: string) {
        let image = '$unique_' + prefix + this.idGen.nextAsStr();
        return BuildFakeTokens.inst.makeTk(realTokenAsBasis, tks.tkIdentifier, image);
    }
}
