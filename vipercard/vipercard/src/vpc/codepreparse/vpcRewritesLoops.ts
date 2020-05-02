
/* auto */ import { BuildFakeTokens, ChvITk, couldTokenTypeBeAVariableName, tks } from './../codeparse/vpcTokens';
/* auto */ import { VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { arLast } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * let's turn all loops into infinite loops and break statements.
 * this makes code-execution simpler because it doesn't have to hold separate state,
 * the state is now held in a normal local variable.
 */
export const VpcRewritesLoops = /* static class */ {
    /* begin to rewrite a loop */
    Go(line: ChvITk[], rw: VpcSuperRewrite): ChvITk[][] {
        checkThrowEq('repeat', line[0].image, 'TU|');
        if (line.length === 1) {
            return [line];
        } else if (line[1].image === 'forever') {
            checkThrowEq(2, line.length, "TT|didn't expect to see anything after 'repeat forever'");
            return [line.slice(0, 1)];
        } else if (line[1].image === 'until' || line[1].image === 'while') {
            return this._goUntilWhile(line, rw);
        } else if (line[1].image === 'with') {
            return this._goWith(line, rw);
        } else {
            let times = rw.tokenFromEnglishTerm('times', line[0]);
            if (arLast(line).tokenType === times.tokenType && arLast(line).image === times.image) {
                line.pop();
            }

            let loopVar = rw.generateUniqueVariable(line[0], '$repeatTimes');
            let firstExpr = [BuildFakeTokens.makeTk(line[0], tks.tkNumLiteral, '1')];
            let secondExpr = line.slice(1);
            return this._goWithImpl(firstExpr, secondExpr, loopVar, false, rw);
        }
    },

    /* rewrite a loop of the form "repeat while" or "repeat until" */
    _goUntilWhile(line: ChvITk[], rw: VpcSuperRewrite): ChvITk[][] {
        let template = `
repeat
    if %NOTSTART% %ARG0% %NOTEND% then
        exit repeat
    end if
`; /* the end repeat comes later */
        if (line[1].image === 'until') {
            template = template.replace(/%NOTSTART%/g, '');
            template = template.replace(/%NOTEND%/g, '');
        } else {
            template = template.replace(/%NOTSTART%/g, 'not (');
            template = template.replace(/%NOTEND%/g, ')');
        }

        let conditionExpression = line.slice(2);
        checkThrow(conditionExpression?.length, 'TS|without an expression');
        return rw.gen(template, line[0], [conditionExpression], undefined, false);
    },

    /* rewrite a loop of the form "repeat with x = 1 to 5" */
    _goWith(line: ChvITk[], rw: VpcSuperRewrite): ChvITk[][] {
        checkThrowEq('repeat', line[0].image, 'TR|');
        checkThrowEq('with', line[1].image, 'TQ|');
        checkThrow(couldTokenTypeBeAVariableName(line[2]), 'TP|');
        checkThrowEq('=', line[3].image, 'TO|');
        let findTo = rw.searchTokenGivenEnglishTermInParensLevel(0, line, line[0], 'to');
        checkThrow(findTo !== -1, 'TN|repeat with, no "to" found');
        let startFirstExpr = 4;
        let endFirstExpr = findTo - 1;
        let isDown = false;
        if (line[findTo - 1].image === 'down') {
            isDown = true;
            endFirstExpr -= 1;
        }
        let firstExpr = line.slice(startFirstExpr, endFirstExpr + 1);
        let secondExpr = line.slice(findTo + 1);
        return this._goWithImpl(firstExpr, secondExpr, line[2], isDown, rw);
    },

    /* build the code for a loop of the form "repeat with x = 1 to 5" */
    _goWithImpl(
        firstExpr: ChvITk[],
        secondExpr: ChvITk[],
        loopVar: ChvITk,
        isDown: boolean,
        rw: VpcSuperRewrite
    ): ChvITk[][] {
        let template = `
put ( %ARG1% ) -  %ADJUST%  into %ARG0%
put %ARG2% into $loopbound%UNIQUE%
repeat
    if %ARG0% %CMPARE% $loopbound%UNIQUE% then
        exit repeat
    end if
    put %ARG0% + %ADJUST% into %ARG0%
`;
        if (isDown) {
            template = template.replace(/%ADJUST%/g, ' - 1');
            template = template.replace(/%CMPARE%/g, ' <= ');
        } else {
            template = template.replace(/%ADJUST%/g, ' 1');
            template = template.replace(/%CMPARE%/g, ' >= ');
        }

        checkThrow(firstExpr?.length, 'TM|wrong length');
        checkThrow(secondExpr?.length, 'TL|wrong length');
        return rw.gen(template, firstExpr[0], [[loopVar], firstExpr, secondExpr], undefined, false);
    }
}
