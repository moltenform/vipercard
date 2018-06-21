
/* auto */ import { checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { checkThrowEq } from '../../ui512/utils/utils512.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { BuildFakeTokens, isTkType, tks } from '../../vpc/codeparse/vpcTokens.js';

/**
 * transform if, else if, and repeat while
 */
export class ExpandIfElse {
    protected buildToken = new BuildFakeTokens();
    curLevel = 0
    levelsNeedToCloseAt: { [key: number]: boolean } = {}
    needToCloseSingleLineIf = false
    needToCloseSingleLineIfAlways = false

    /**
     * from
     *
     * if x > 2 then answer "a"
     * else if x > 1 then answer "b"
     * else answer "c"
     *
     * to
     *
     * if x > 2 then
     *      answer "a"
     * else if x > 1 then
     *      answer "b"
     * else
     *      answer "c"
     * end if
     *
     */
    goExpandSingleLineIf(line: ChvIToken[]): ChvIToken[][] {
        let ret:ChvIToken[][] = []
        if (line.length >= 1 && line[0].image === 'if') {
            if (this.needToCloseSingleLineIf || this.needToCloseSingleLineIfAlways) {
                this.needToCloseSingleLineIf = false
                this.needToCloseSingleLineIfAlways = false
                ret.push(this.buildEndIf(line[0]))
            }

            let findThen = line.findIndex(tk => isTkType(tk, tks.TokenTkidentifier) && tk.image === 'then')
            if (findThen !== -1 && findThen !== line.length - 1) {
                /* this is a single-line if! */
                this.needToCloseSingleLineIf = true
                ret.push(line.slice(0, findThen + 1))
                ret.push(line.slice(findThen + 1))
            } else {
                ret.push(line)
            }
        } else if (line.length >= 2 && line[0].image === 'else' && line[1].image === 'if') {
            /* usually don't add an end-if here */
            this.needToCloseSingleLineIf = false

            /* unless needToCloseSingleLineIfAlways is true */
            if (this.needToCloseSingleLineIfAlways) {
                this.needToCloseSingleLineIf = false
                this.needToCloseSingleLineIfAlways = false
                ret.push(this.buildEndIf(line[0]))
            }

            let findThen = line.findIndex(tk => isTkType(tk, tks.TokenTkidentifier) && tk.image === 'then')
            if (findThen !== -1 && findThen !== line.length - 1) {
                /* this is a single-line else-if! */
                this.needToCloseSingleLineIf = true
                ret.push(line.slice(0, findThen + 1))
                ret.push(line.slice(findThen + 1))
            } else {
                ret.push(line)
            }
        } else if (line.length >= 1 && line[0].image === 'else') {
            /* usually don't add an end-if here */
            this.needToCloseSingleLineIf = false

            /* unless needToCloseSingleLineIfAlways is true */
            if (this.needToCloseSingleLineIfAlways) {
                this.needToCloseSingleLineIf = false
                this.needToCloseSingleLineIfAlways = false
                ret.push(this.buildEndIf(line[0]))
            }

            if (line.length > 1) {
                let findThen = line.findIndex(tk => isTkType(tk, tks.TokenTkidentifier) && tk.image === 'then')
                checkThrowEq(-1, findThen, 'expected else to not have then. only else if can have then.')

                /* this is a single-line else-code! */
                this.needToCloseSingleLineIf = true
                this.needToCloseSingleLineIfAlways = true
                ret.push(line.slice(0, 1))
                ret.push(line.slice(1))
            } else {
                ret.push(line)
            }
        } else {
            if (this.needToCloseSingleLineIf || this.needToCloseSingleLineIfAlways) {
                this.needToCloseSingleLineIf = false
                this.needToCloseSingleLineIfAlways = false
                ret.push(this.buildEndIf(line[0]))
            }

            ret.push(line)
        }

        return ret
    }

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
    goExpandElseIf(line: ChvIToken[]): ChvIToken[][] {
        if (line.length >= 1 && line[0].image === 'if') {
            checkThrow(line[line.length - 1].image === 'then', "we should have already processed all-on-one-line if statements...")
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
            checkThrow(line[line.length - 1].image === 'then', "we should have already processed all-on-one-line else if statements...")
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

        ret.push(this.buildEndIf(line[0]))
        return ret
    }

    /**
     * make a line saying "end if"
     */
    protected buildEndIf(basis: ChvIToken): ChvIToken[] {
        let lineEndIf: ChvIToken[] = []
        lineEndIf.push(this.buildToken.makeIdentifier(basis, 'end'))
        lineEndIf.push(this.buildToken.makeIdentifier(basis, 'if'))
        return lineEndIf
    }
}
