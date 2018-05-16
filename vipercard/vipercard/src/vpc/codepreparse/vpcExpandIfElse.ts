
/* auto */ import { checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { BuildFakeTokens } from '../../vpc/codeparse/vpcTokens.js';

/**
    from

        if myfn() then
            code1
        else if myotherfn() then
            code2
        else
            code3
        end if

    to the equivalent

        if myfn() then
            code1
        else
            if myotherfn() then
                code2
            else
                code3
            end if
        end if

    why do this? to support expandCustomFns on 'else if' clauses
 */
export class ExpandIfElse {
    protected buildToken = new BuildFakeTokens();
    curLevel = 0
    levelsNeedToCloseAt: { [key: number]: boolean } = {}

    go(line: ChvIToken[]): ChvIToken[][] {
        if (line.length >= 1 && line[0].image === 'if') {
            checkThrow(line[line.length - 1].image === 'then', "we don't support all-on-one-line if statements. use instead \n'if x>1 then\ndoThis\nend if'.")
            this.curLevel += 1
            return [line]
        } else if (line.length >= 2 && line[0].image === 'end' && line[1].image === 'if') {
            let ret:ChvIToken[][] = []
            while (true) {
                let addAnotherEndIf = line.slice()
                ret.push(addAnotherEndIf)
                this.curLevel -= 1
                if (this.levelsNeedToCloseAt[this.curLevel]) {
                    this.levelsNeedToCloseAt[this.curLevel] = false
                } else {
                    break
                }
            }

            return ret
        } else if (line.length >= 2 && line[0].image === 'else' && line[1].image === 'if') {
            checkThrow(line[line.length - 1].image === 'then', "we don't support all-on-one-line else if statements. use instead \n'else if x>1 then\ndoThis\nend if'.")
            let part1 = line.slice(0, 1)
            let part2 = line.slice(1)
            this.levelsNeedToCloseAt[this.curLevel] = true
            this.curLevel += 1

            return [part1, part2]
        } else if (line.length >= 1 && line[0].image === 'else') {
            /* don't need to transform anything */
            return [line]
        } else {
            /* not related to if/else, don't need to transform anything */
            return [line]
        }
    }
}
