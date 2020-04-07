
/* auto */ import { ChvITk } from './../codeparse/vpcTokens';
/* auto */ import { VpcRewritesLoops } from './vpcRewritesLoops';
/* auto */ import { VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { ExpandCustomFunctions } from './vpcRewritesCustomFunctions';
/* auto */ import { VpcRewritesConditions, VpcRewritesConditionsNoElseIfClauses } from './vpcRewritesConditions';
/* auto */ import { MakeLowerCase, SplitIntoLinesProducer } from './vpcPreparseCommon';
/* auto */ import { CheckReservedWords } from './vpcCheckReserved';
/* auto */ import { Util512 } from './../../ui512/utils/util512';

import { SplitIntoLinesProducer, MakeLowerCase } from './vpcPreparseCommon';
import { VpcRewritesConditionsNoElseIfClauses, VpcRewritesConditions } from './vpcRewritesConditions';
import { VpcRewritesLoops } from './vpcRewritesLoops';
import { ExpandCustomFunctions } from './vpcRewritesCustomFunctions';
import { CountNumericIdNormal } from '../vpcutils/vpcUtils';
import { CheckReservedWords } from './vpcCheckReserved';


export namespace TopPreparse {
    function goAllLowerRewrites(lexed: ChvITk[]) {
        let splitter = new SplitIntoLinesProducer(lexed, new MakeLowerCase())
        let lines:ChvITk[][] = []
        while(true) {
            let next = splitter.next()
            if (!next) { break }
            lines.push(next)
        }

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

        // commands
        lines = nextLines
        nextLines = []
        for (let line of lines) {
             else {
                nextLines.push(line)
            }
        }

        lines = nextLines
        nextLines = []
        let exp = new ExpandCustomFunctions(VpcSuperRewrite.CounterForUniqueNames, new CheckReservedWords())
        for (let line of lines) {
            Util512.extendArray(nextLines, exp.go(line))
        }
    }
}
