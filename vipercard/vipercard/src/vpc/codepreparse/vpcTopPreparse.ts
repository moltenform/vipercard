
/* auto */ import { ChvITk } from './../codeparse/vpcTokens';
/* auto */ import { VpcRewritesLoops } from './vpcRewritesLoops';
/* auto */ import { VpcRewritesGlobal, VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { ExpandCustomFunctions } from './vpcRewritesCustomFunctions';
/* auto */ import { VpcRewritesConditions, VpcRewritesConditionsNoElseIfClauses } from './vpcRewritesConditions';
/* auto */ import { VpcRewriteForCommands } from './vpcRewritesCommands';
/* auto */ import { MakeLowerCase, SplitIntoLinesProducer } from './vpcPreparseCommon';
/* auto */ import { CheckReservedWords } from './vpcCheckReserved';
/* auto */ import { Util512 } from './../../ui512/utils/util512';

export namespace TopPreparse {
    function goAllLowerRewrites(lexed: ChvITk[]) {
        let splitter = new SplitIntoLinesProducer(lexed, new MakeLowerCase())
        let lines:ChvITk[][] = []
        while(true) {
            let next = splitter.next()
            if (!next) { break }
            lines.push(next)
        }

        // get rid of else-if clauses, they don't support custom function calls
        // and make our branch-processing code a little more complex
        lines = VpcRewritesConditionsNoElseIfClauses.goNoElseIfClauses(lines)
        let nextLines:ChvITk[][] = []
        for (let line of lines) {
            if (line.length && line[0].image === 'if') {
                Util512.extendArray(nextLines, VpcRewritesConditions.splitSinglelineIf(line))
            } else if (line.length && line[0].image === 'repeat') {
                Util512.extendArray(nextLines, VpcRewritesLoops.Go(line))
            } else {
                nextLines.push(line)
            }
        }

        // global transforms and commands
        let rewrites = new VpcRewriteForCommands()
        lines = nextLines
        nextLines = []
        for (let line of lines) {
            line = VpcRewritesGlobal.rewriteSpecifyCdOrBgPart(line)
            let methodName = 'rewrite' + Util512.capitalizeFirst(line[0].image)
            let got = Util512.callAsMethodOnClass('VpcRewriteForCommands', rewrites, methodName, [line], true)
            if (got) {
                Util512.extendArray(nextLines, got)
            } else {
                nextLines.push(line)
            }
        }

        // expand custom function calls
        lines = nextLines
        nextLines = []
        let exp = new ExpandCustomFunctions(VpcSuperRewrite.CounterForUniqueNames, new CheckReservedWords())
        for (let line of lines) {
            Util512.extendArray(nextLines, exp.go(line))
        }

        return nextLines
    }
}
