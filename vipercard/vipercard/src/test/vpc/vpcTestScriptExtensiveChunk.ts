
/* auto */ import { VpcEvalHelpers } from './../../vpc/vpcutils/vpcValEval';
/* auto */ import { ScriptTestBatch, TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { VpcGranularity, checkThrowInternal } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { callDebuggerIfNotInProduction } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, assertWarnEq, getStrToEnum, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollectionScriptExtensiveChunk', true);
export let testCollectionScriptExtensiveChunk = t;

let h = YetToBeDefinedTestHelper<TestVpcScriptRunBase>();
t.atest('--init--testCollectionScriptExtensiveChunk', async () => {
    h = new TestVpcScriptRunBase(t);
    return h.initEnvironment();
});
t.atest('ScriptExtensiveChunk', async () => {
    h.vcstate.vci.undoableAction(() =>
        h.vcstate.model.stack.setOnVel('compatibilitymode', true, h.vcstate.model)
    );
    let test = new RunExtensiveChunkTests();
    await test.go();
    h.vcstate.vci.undoableAction(() =>
        h.vcstate.model.stack.setOnVel('compatibilitymode', false, h.vcstate.model)
    );
});

/**
 * I decided to thoroughly test chunk support by
 * writing a python script to generate hundreds of thousands of examples,
 * running the examples on the original product in an emulator,
 * in order to get very thorough fidelity.
 *
 * genchunktests.py (might not be included)
 * generates a list of chunks like "item 2 to 4 of line 5 of"
 * and then generates a READ, WRITE, and DELETE test for each chunk.
 * tests include:
 * 1) specific test strings for lines, items, words, and chars
 * 2) mixed test strings that begin as 3 lines containing 3 items
 * containing 3 words, and then all delimeters are rotated.
 * 3) mixed test strings with random delimeters
 * 4) recursive scopes, 3 levels
 * 5) recursive scopes with ranges, 2 levels
 * 6) recursive scopes with char, separate to reduce # of tests
 * 7) for each cartesian product of 5 and fewer characters:
 *      a) count lines, items, words
 *      b) chunks with all possible ranges
 *      c) recursive scopes, 2 levels
 */
class RunExtensiveChunkTests {
    failures = 0;
    skipped = 0;

    /**
     * asynchronously load the list of tests
     */
    async loadTestData() {
        let url = '/resources03a/test/testScriptExtensiveChunkTests.txt';
        let txt = await Util512Higher.asyncLoadJsonString(url);
        let data = txt.trim().replace(/\r\n/g, '\n').split('\n');
        data = this.expandTestData(data);
        return data;
    }

    /* runs the test */
    async go() {
        /* let's run it in batches of 40 */
        const batchSize = 40;
        let count = 0;
        let loopsWithoutSleep = 0;
        let data = await this.loadTestData();
        let enableThisTest = (s: string) => {
            /* you can selectively enable tests */
            return true;
        };

        while (true) {
            /* release our timeslice for a bit so the ui doesn't freeze */
            loopsWithoutSleep += 1;
            if (loopsWithoutSleep > 300) {
                await Util512Higher.sleep(10);
                console.log(count, '...');
                loopsWithoutSleep = 0;
            }

            if (!data.length) {
                console.log(
                    longstr(`extensive chunk tests done with ${count} tests,
                     ${this.failures} failures, ${this.skipped}
                     completely acceptable skips.`)
                );
                return;
            }

            let batch: string[] = [];
            for (let i = 0; i < batchSize; i++) {
                let last = data.pop();
                if (last && last.length) {
                    if (enableThisTest(last)) {
                        batch.push(last);
                        count += 1;
                    }
                } else {
                    break;
                }
            }

            this.doTestBatch(batch, count);
        }
    }

    /**
     * expand the R+W+D tests into separate read, write, delete tests
     */
    protected expandTestData(data: string[]): string[] {
        let ret: string[] = [];
        for (let item of data) {
            let pts = item.split('\t');
            if (pts[0] === 'R+W+D') {
                assertWarnEq(6, pts.length, item);
                let [type, ch, target, resread, reswrite, resdelete] = pts;
                ret.push(['READ', ch, target, resread].join('\t'));
                ret.push(['WRITE', ch, target, reswrite].join('\t'));
                ret.push(['DELETE', ch, target, resdelete].join('\t'));
            } else {
                ret.push(item);
            }
        }
        return ret;
    }

    /**
     * run a batch of tests
     */
    protected doTestBatch(batch: string[], count: number) {
        let code = '';
        let expecteds: string[] = [];
        let i = 0;
        for (let entry of batch) {
            if (
                entry.startsWith('DELETE') &&
                this.isADeleteWithFinalRange(entry.split('\t')[1])
            ) {
                /* we don't support deleting ranges,
                so confirm that we throw */
                let b = new ScriptTestBatch();
                let smcode = this.genTestCode(entry, [], 1).trim();
                b.t(`${smcode}\\1`, 'ERR:6:deleting ranges');
                b.batchEvaluate(h);
                this.skipped++;
            } else {
                i++;
                code += this.genTestCode(entry, expecteds, i);
            }
        }

        h.runGeneralCode('', code);
        for (let i = 0; i < expecteds.length; i++) {
            this.compareResultsWithExpected(i, expecteds, count, batch);
        }
    }

    /**
     * for a single test case, see if results are what we expected
     */
    protected compareResultsWithExpected(
        i: number,
        expecteds: string[],
        count: number,
        batch: string[]
    ) {
        let got = h.vcstate.runtime.codeExec.globals
            .get(`results${i + 1}`)
            .readAsString();
        got = got.replace(/\n/g, '|');
        if (got !== expecteds[i]) {
            if (this.failures === 0) {
                console.error('| refers to a newline and _ is a space in this output.');
            }
            console.error(`\n\n\nFAILURE near test # ${count + i}`);
            console.error('Test: ' + batch[i].replace(/\t/g, '\n').replace(/ /g, '_'));
            console.error('Got: \n' + got.replace(/ /g, '_'));
            let pts = batch[i].split('\t');
            let input = pts[2];
            let expected = pts[3].replace(/\|/g, '\\n');
            input = `""&"${input.replace(/\|/g, '"&cr&"')}"&""`;
            if (pts[0] === 'WRITE') {
                /* write a helpful demo test case */
                console.log('demo test case:');
                console.log(`b.t('put ${input} into z1\\\\1', '1')`);
                console.log(
                    `b.t('put z1 into z\\nput "ABCDE" into ${pts[1]} z\\\\z', '${expected}')`
                );
            } else if (pts[0] === 'DELETE') {
                /* write a helpful demo test case */
                console.log('demo test case:');
                console.log(`b.t('put ${input} into z1\\\\1', '1')`);
                console.log(
                    `b.t('put z1 into z\\ndelete ${pts[1]} z\\\\z', '${expected}')`
                );
            }
            this.failures += 1;
            if (this.failures % 20 === 0) {
                callDebuggerIfNotInProduction();
            }
        }
    }

    /**
     * generate test code
     */
    protected genTestCode(entry: string, expecteds: string[], i: number) {
        let code = '';
        let pts = entry.split('\t');
        assertTrue(pts.length === 4, 'not 4 parts?', entry);
        expecteds.push(pts[3]);
        let targetStringForInput = `"${pts[2]}"`;
        targetStringForInput = VpcEvalHelpers.escapeWithinString(targetStringForInput)
        code += `\nglobal results${i}`;
        if (pts[0] === 'READ') {
            code += `\nput ${targetStringForInput} into z`;
            code += `\nput ${pts[1]} z into results${i}`;
        } else if (pts[0] === 'WRITE') {
            code += `\nput ${targetStringForInput} into results${i}`;
            code += `\nput "ABCDE" into ${pts[1]} results${i}`;
        } else if (pts[0] === 'DELETE') {
            code += `\nput ${targetStringForInput} into results${i}`;
            code += `\ndelete ${pts[1]} results${i}`;
        } else if (pts[0] === 'COUNTITEM') {
            assertWarn(!pts[1].length, '');
            code += `\nput the number of items in (${targetStringForInput}) into results${i}`;
        } else if (pts[0] === 'COUNTWORD') {
            assertWarn(!pts[1].length, '');
            code += `\nput the number of words in (${targetStringForInput}) into results${i}`;
        } else if (pts[0] === 'COUNTLINE') {
            assertWarn(!pts[1].length, '');
            code += `\nput the number of lines in (${targetStringForInput}) into results${i}`;
        } else {
            checkThrowInternal(false, 'unknown test');
        }

        return code;
    }

    /**
     * we don't support a delete with a final range
     * i.e. we support 'delete word 3 of line 4 to 5 of x'
     * but not 'delete word 3 to 4 of line 5 of x'
     * we need to re-order the input to see if there is
     * a final range, since 'delete line x of word y'
     * is actually done as 'delete word y of line x'
     */
    isADeleteWithFinalRange(s: string) {
        /* typical input: "line 3 to 5 of word 3 to 3 of" */
        s = s.replace(/(\b[0-9]+\b) to \1 of\b/g, '$1 of');
        /* typical input is now: "line 3 to 5 of word 3 of" */
        /* split on middle 'of's - not the final 'of' */
        let pts = s.split(' of ');
        if (pts.length <= 1) {
            return !s.startsWith('char ') && /* bool */ s.includes(' to ');
        }

        /* typical input is now: [line 3 to 5, word 3 of] */
        let newPts = Util512.sortDecorated(pts, pt =>
            getStrToEnum<VpcGranularity>(
                VpcGranularity,
                'no such granularity',
                pt.split(' ')[0]
            )
        );

        /* typical input is now: [word 3 of, line 3 to 5] */
        s = newPts.join(' of ');
        if (s.startsWith('char ')) {
            return false;
        }

        /* if "to" comes after the " of ", then it is ok, we accept
        ranges in the parents, just not the children */
        let indexOf = s.indexOf(' of');
        let indexOfTo = s.indexOf(' to ');
        if (indexOf === -1 || indexOfTo === -1 || indexOfTo > indexOf) {
            return false;
        } else {
            return true;
        }
    }
}
