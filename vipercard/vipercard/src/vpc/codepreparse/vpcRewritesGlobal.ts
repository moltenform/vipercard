
/* auto */ import { CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { BuildFakeTokens, ChvITk, ChvITkType, listOfAllWordLikeTokens, tks } from './../codeparse/vpcTokens';
/* auto */ import { checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, arLast } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * preparsing rewrites that aren't specific to a certain command
 */
export const VpcRewritesGlobal = /* static class */ {
    mapSynonyms: {
        rect: 'rectangle',
        /* all these are in original product */
        highlight: 'hilite',
        hilight: 'hilite',
        highlite: 'hilite',
        autohighlight: 'autohilite',
        autohilight: 'autohilite',
        autohighlite: 'autohilite',
        loc: 'location',
        botright: 'bottomright'
        /* itemdel and itemdelimiter too, but it's
        a nullary prop, so it's done in productopts */
    },

    /**
     * replace properties.
     * also go from 'the english date' to 'the long date' for compat.
     */
    rewritePropertySynonyms(line: ChvITk[], rw: VpcSuperRewrite): ChvITk[] {
        for (let i = 0; i < line.length - 1; i++) {
            if (line[i + 1].image === 'of') {
                let mapped = this.mapSynonyms[line[i].image];
                if (mapped) {
                    line[i] = rw.tokenFromEnglishTerm(mapped, line[i]);
                }
            } else if (line[i + 1].image === 'date' && line[i].image === 'english') {
                line[i] = rw.tokenFromEnglishTerm('long', line[i]);
            }
        }

        return line;
    },

    /**
     * from "short id of fld 1" to "short id of bg fld 1"
     * do this in software, at parse time it is difficult to clear
     * the ambiguity: the name of cd fld 1 could be parsed either way.
     */
    rewriteSpecifyCdOrBgPart(line: ChvITk[]): ChvITk[] {
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
                ret.push(BuildFakeTokens.makeTk(copyLine[i], insertIt, s));
            }
        }

        ret.push(arLast(copyLine));
        ret.reverse();
        return ret;
    }
}

/**
 * helps rewrite code
 * rewriting used to be done with code like
 * outputLine.push(tokenBuilder.build('put'))
 * outputLine.push(tokenBuilder.build('3'))
 * outputLine.push(tokenBuilder.build('into'))
 * outputLine.push(tokenBuilder.build('x'))
 * but what we have now is much more convenient to write (and read).

   example:
   `
    put %ARG0% into x
    put %ARG1% into $loopbound%UNIQUE%
    repeat
        if x >= $loopbound%UNIQUE% then
            exit repeat
        end if
        put x + 1 into x
    end repeat`
 */
export class VpcSuperRewrite {
    constructor(protected idGen: CountNumericId) {}

    /* go from the string template to lines of lexed code */
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
                    if (term) {
                        this.addTerm(ret, term, args, realTokenAsBasis, needsToBePostProcess);
                    }
                }
            }
        }
        return ret;
    }

    /* when generating a token from a template, add the term.
     in most cases, the template must say %INTO% and not into,
     since rewritePut() has already been called and won't be called again! */
    protected addTerm(ret: ChvITk[][], term: string, args: ChvITk[][], realTokenAsBasis: ChvITk, needsToBePostProcess: boolean) {
        if (term.startsWith('%ARG')) {
            checkThrowEq('%', term[term.length - 1], 'TK|');
            let sn = term.replace(/%ARG/g, '').replace(/%/g, '');
            let n = Util512.parseIntStrict(sn);
            checkThrow(typeof n === 'number' && n >= 0 && n < args.length, 'TJ|internal error in template');
            Util512.extendArray(arLast(ret), args[n]);
        } else if (term === '%INTO%' || term === '%BEFORE%' || term === '%AFTER%') {
            arLast(ret).push(BuildFakeTokens.makeSyntaxMarker(realTokenAsBasis));
            let newToken = this.tokenFromEnglishTerm(term.replace(/%/g, '').toLowerCase(), realTokenAsBasis);
            arLast(ret).push(newToken);
            arLast(ret).push(BuildFakeTokens.makeSyntaxMarker(realTokenAsBasis));
        } else {
            checkThrow(
                !needsToBePostProcess || (term !== 'into' && term !== 'before' && term !== 'after'),
                "TI|it's not safe to say 'put 4 into x' here. try 'put 4 %INTO% x' instead."
            );
            let newToken = this.tokenFromEnglishTerm(term, realTokenAsBasis);
            arLast(ret).push(newToken);
        }
    }

    /* much safer than just building a tkidentifier or trying to remember what has its own token type
     this looks at the script-generated table to know what token-type to generate. */
    tokenFromEnglishTerm(term: string, realTokenAsBasis: ChvITk) {
        let tktype = listOfAllWordLikeTokens[term];
        if (!tktype && term.startsWith('"') && term.endsWith('"')) {
            /* we can make a simple string literal, not one that contains spaces though. */
            tktype = tks.tkStringLiteral;
            term = term.replace(/~/g, ' ');
        } else if (!tktype && term.match(/^-?[0-9]+$/)) {
            tktype = tks.tkNumLiteral;
        } else if (!tktype && term === ',') {
            tktype = tks.tkComma;
        } else if (!tktype && (term === '==' || term === '=')) {
            tktype = tks.tkGreaterOrLessEqualOrEqual;
        } else if (!tktype && (term === '&&' || term === '&')) {
            tktype = tks.tkStringConcat;
        } else if (!tktype) {
            tktype = tks.tkIdentifier;
            checkThrow(
                term.match(/^[a-zA-Z$_][0-9a-zA-Z$_]*$/),
                'TH|internal error in template, not a known symbol or valid tkidentifier'
            );
        }

        return BuildFakeTokens.makeTk(realTokenAsBasis, tktype, term);
    }

    /* safer to replace only when not in parens, see searchTokenGivenEnglishTermInParensLevel */
    replaceWithSyntaxMarkerAtLvl0(
        line: ChvITk[],
        realTokenAsBasis: ChvITk,
        term: string,
        mustExist: boolean,
        syntaxMarkerType = ''
    ) {
        let index = this.searchTokenGivenEnglishTermInParensLevel(0, line, realTokenAsBasis, term);
        if (index === -1) {
            checkThrow(!mustExist, `TG|did not see ${term} in a ${line[0].image}`);
            return false;
        } else {
            let marker = BuildFakeTokens.makeSyntaxMarker(realTokenAsBasis, syntaxMarkerType);
            line[index] = marker;
            return true;
        }
    }

    /* combines generating a token and searching */
    searchTokenGivenEnglishTerm(line: ChvITk[], realTokenAsBasis: ChvITk, term: string) {
        let tk1 = this.tokenFromEnglishTerm(term, realTokenAsBasis);
        return line.findIndex(t => t.tokenType === tk1.tokenType && t.image === tk1.image);
    }

    /* sometimes you only want to search at a paren level.
     example: add x to y, we want to replace "to" with a syntax marker.
     we should only do the replacement at 0-parens level so that
    add (char 2 to 3 of x) to y
    won't replace the wrong 'to' token.
    */
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

    /* generates a unique variable name */
    generateUniqueVariable(realTokenAsBasis: ChvITk, prefix: string) {
        let image = '$unique_' + prefix + this.idGen.nextAsStr();
        return BuildFakeTokens.makeTk(realTokenAsBasis, tks.tkIdentifier, image);
    }
}
