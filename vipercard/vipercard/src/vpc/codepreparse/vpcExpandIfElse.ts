
/* auto */ import { checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { BuildFakeTokens, tks } from '../../vpc/codeparse/vpcTokens.js';

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
        } else if (line.length >= 1 && line[0].image === 'repeat') {
            return this.expandRepeatWhileUntil(line)
        } else {
            /* not related to if/else, don't need to transform anything */
            return [line]
        }
    }

    /**
    from

    repeat while x < myFn()
        code
    end repeat

    to the equivalent

    repeat
        if not (x < myFn()) then
            exit repeat
        end if
        code
    end repeat

    why do this? if there's an expandCustomFns in the condition,
    it has to be called every time through the loop
     */
    expandRepeatWhileUntil(line: ChvIToken[]): ChvIToken[][] {
        let isWhile = true
        if (line.length >= 3 && line[1].image === 'while') {
            isWhile = true
        } else if (line.length >= 3 && line[1].image === 'until') {
            isWhile = false
        } else {
            return [line]
        }

        let ret: ChvIToken[][] = []
        let partRepeat = line.slice(0, 1)
        let partExp = line.slice(2)
        ret.push(partRepeat)

        let ifStatement: ChvIToken[] = []
        ifStatement.push(this.buildToken.makeIdentifier(line[0], 'if'))
        if (isWhile) {
            ifStatement.push(this.buildToken.make(line[0], tks.TokenNot))
            ifStatement.push(this.buildToken.make(line[0], tks.TokenTklparen))
        }
        ifStatement = ifStatement.concat(partExp)
        if (isWhile) {
            ifStatement.push(this.buildToken.make(line[0], tks.TokenTkrparen))
        }
        ifStatement.push(this.buildToken.makeIdentifier(line[0], 'then'))
        ret.push(ifStatement)

        let lineExit: ChvIToken[] = []
        lineExit.push(this.buildToken.makeIdentifier(line[0], 'exit'))
        lineExit.push(this.buildToken.makeIdentifier(line[0], 'repeat'))
        ret.push(lineExit)

        let lineEndIf: ChvIToken[] = []
        lineEndIf.push(this.buildToken.makeIdentifier(line[0], 'end'))
        lineEndIf.push(this.buildToken.makeIdentifier(line[0], 'if'))
        ret.push(lineEndIf)
        return ret
    }
}
