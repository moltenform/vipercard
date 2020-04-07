
/* auto */ import { CodeLimits, CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { BuildFakeTokens, ChvITk, isTkType, listOfAllWordLikeTokens, tks, ChvITkType } from './../codeparse/vpcTokens';
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, last } from './../../ui512/utils/util512';

export class VpcRewritesGlobal {
    static rewriteSpecifyCdOrBgPart(line: ChvITk[]): ChvITk[] {
        let ret: ChvITk[] = [];
        let copyLine = line.slice();
        copyLine.reverse();
        for (let i = 0; i < copyLine.length - 1; i++) {
            let insertIt: O<ChvITkType>;
            let s = '';
            if (
                copyLine[i].tokenType === tks.tkBtn ||
                copyLine[i].tokenType === tks.tkFld
            ) {
                let next = copyLine[i + 1];
                if (next.tokenType !== tks.tkCard && next.tokenType !== tks.tkBg) {
                    insertIt =
                        copyLine[i].tokenType === tks.tkFld ? tks.tkBg : tks.tkCard;
                    s = copyLine[i].tokenType === tks.tkFld ? 'bg' : 'cd';
                }
            }

            ret.push(copyLine[i]);
            if (insertIt) {
                ret.push(BuildFakeTokens.inst.makeImpl(copyLine[i], insertIt, s));
            }
        }

        ret.push(last(copyLine));
        ret.reverse();
        return ret;
    }
}
