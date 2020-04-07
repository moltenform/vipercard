
/* auto */ import { CodeLimits, CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { BuildFakeTokens, ChvITk, isTkType, listOfAllWordLikeTokens, tks, ChvITkType } from './../codeparse/vpcTokens';
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, last, checkThrowEq } from './../../ui512/utils/util512';
import { VpcSuperRewrite } from './vpcPreparseCommon';

export class VpcRewritesConditions {
    static splitSinglelineIf(line: ChvITk[]): ChvITk[][] {
        checkThrowEq('if', line[0].image, '');
        let findThen = VpcSuperRewrite.searchTokenGivenEnglishTermInParensLevel(
            0,
            line,
            line[0],
            'then'
        );
        checkThrow(findThen !== -1, 'if statement, no "then" found');
        if (findThen === line.length - 1) {
            // already on different lines, we are fine
            return [line];
        } else {
            let firstPart = line.slice(0, findThen + 1);
            let secondPart = line.slice(findThen + 1);
            let template = `
%ARG0%
    %ARG1%
end if`;
            return VpcSuperRewrite.go(template, line[0], [firstPart, secondPart]);
        }
    }

    static noElseIfClauses(lines: ChvITk[][]): ChvITk[][] {
        let isLineEndIf = function (l: ChvITk[]) {
            return l.length === 2 && l[0].image === 'end' && l[1].image === 'if';
        };
        let makeEndIf = (basis: ChvITk) => {
            return [
                VpcSuperRewrite.tokenFromEnglishTerm('end', basis),
                VpcSuperRewrite.tokenFromEnglishTerm('if', basis)
            ];
        };
        let needToAppendEndIf = false;
    }
}
