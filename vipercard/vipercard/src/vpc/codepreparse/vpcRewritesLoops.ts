
/* auto */ import { BuildFakeTokens, ChvITk, couldTokenTypeBeAVariableName, tks } from './../codeparse/vpcTokens';
/* auto */ import { VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { arLast } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

export namespace VpcRewritesLoops {
    export function Go(line: ChvITk[], rw: VpcSuperRewrite): ChvITk[][] {
        checkThrowEq('repeat', line[0].image, '');
        if (line.length === 1) {
            return [line];
        } else if (line[1].image === 'forever') {
            checkThrowEq(2, line.length, "didn't expect to see anything after 'repeat forever'");
            return [line.slice(0, 1)];
        } else if (line[1].image === 'until' || line[1].image === 'while') {
            return goUntilWhile(line, rw);
        } else if (line[1].image === 'with') {
            return goWith(line, rw);
        } else {
            let times = rw.tokenFromEnglishTerm('times', line[0]);
            if (arLast(line).tokenType === times.tokenType && arLast(line).image === times.image) {
                line.pop();
            }

            let loopVar = rw.generateUniqueVariable(line[0], '$repeatTimes');
            let firstExpr = [BuildFakeTokens.inst.makeTk(line[0], tks.tkNumLiteral, '1')];
            let secondExpr = line.slice(1);
            return goWithImpl(firstExpr, secondExpr, loopVar, false, rw);
        }
    }
    function goUntilWhile(line: ChvITk[], rw: VpcSuperRewrite): ChvITk[][] {
        let template = `
repeat
    if %NOT% %ARG0% then
        exit repeat
    end if
end repeat`;
        if (line[1].image === 'until') {
            template = template.replace(/%NOT%/g, '');
        } else {
            template = template.replace(/%NOT%/g, 'not');
        }

        let conditionExpression = line.slice(2);
        return rw.gen(template, line[0], [conditionExpression], undefined, false);
    }
    function goWith(line: ChvITk[], rw: VpcSuperRewrite): ChvITk[][] {
        checkThrowEq('repeat', line[0].image, '');
        checkThrowEq('with', line[1].image, '');
        checkThrow(couldTokenTypeBeAVariableName(line[2]), '');
        checkThrowEq('=', line[3].image, '');
        let findTo = rw.searchTokenGivenEnglishTermInParensLevel(0, line, line[0], 'to');
        checkThrow(findTo !== -1, 'repeat with, no "to" found');
        let startFirstExpr = 4;
        let endFirstExpr = findTo - 1;
        let isDown = false;
        if (line[findTo - 1].image === 'down') {
            isDown = true;
            endFirstExpr -= 1;
        }
        let firstExpr = line.slice(startFirstExpr, endFirstExpr);
        let secondExpr = line.slice(findTo + 1);
        return goWithImpl(firstExpr, secondExpr, line[2], isDown, rw);
    }
    function goWithImpl(
        firstExpr: ChvITk[],
        secondExpr: ChvITk[],
        loopVar: ChvITk,
        isDown: boolean,
        rw: VpcSuperRewrite
    ): ChvITk[][] {
        let template = `
put ( %ARG1% ) - ( %ADJUST% ) into %ARG0%
put %ARG2% into $loopbound%UNIQUE%
repeat
    put %ARG0% %ADJUST% into %ARG0%
    if %ARG0% %CMPARE% $loopbound%UNIQUE% then
        exit repeat
    end if
`;
        if (isDown) {
            template = template.replace(/%ADJUST%/g, ' - 1');
            template = template.replace(/%CMPARE%/g, ' <= ');
        } else {
            template = template.replace(/%ADJUST%/g, ' + 1');
            template = template.replace(/%CMPARE%/g, ' >= ');
        }

        return rw.gen(template, firstExpr[0], [[loopVar], firstExpr, secondExpr], undefined, false);
    }
}
