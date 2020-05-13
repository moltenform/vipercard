
/* auto */ import { TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { checkThrowInternal } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { callDebuggerIfNotInProduction } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';
import { EmbeddedActionsParser } from '../../../external/chevrotain-6.5.0/chevrotaintyping';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollectionScriptExtensiveChunk', true);
export let testCollectionScriptExtensiveChunk = t;

let h = YetToBeDefinedTestHelper<TestVpcScriptRunBase>();
t.atest('--init--testCollectionScriptExtensive', async () => {
    h = new TestVpcScriptRunBase(t);
    return h.initEnvironment();
});
t.atest('runConditionalTests', async () => {
    h.vcstate.vci.undoableAction(()=>
        h.vcstate.model.stack.setOnVel('compatibilitymode', true, h.vcstate.model))
    let test = new RunExtensiveChunkTests();
    await test.go();
    h.vcstate.vci.undoableAction(()=>
        h.vcstate.model.stack.setOnVel('compatibilitymode', false, h.vcstate.model))
});

/**
 * I decided to thoroughly test chunk support by
 * writing a python script to generate thousands of examples,
 * running the examples on the original product in an emulator,
 * then running the script in vipercard and comparing them.
 */
class RunExtensiveChunkTests {
    failures = 0
    async loadTestData() {
        let url = '/resources03a/test/testScriptExtensiveChunkTests.txt';
        let txt = await Util512Higher.asyncLoadJsonString(url);
        let data = txt.trim().replace(/\r\n/g, '\n').split('\n');
        data = this.expandTestData(data)
        return data;
    }

    /* runs the test */
    async go() {
        /* let's run it in batches of 40 */
        const batchSize = 40
        let count = 0;
        let sleepCount = 0
        let data = await this.loadTestData();
        while(true) {
            /* release our timeslice for a bit so the ui doesn't freeze */
            sleepCount += 1
            if (sleepCount > 300) {
                await Util512Higher.sleep(10);
                console.log(count, '...');
                sleepCount = 0
            }

            if (!data.length) {
                console.log(`extensive chunk tests done with ${count} tests, ${this.failures} failures.`)
                return
            }

            let enableThisTest = (s:string)=> {
                //~ return true
                if (s.startsWith('READ|') || s.startsWith('WRITE|')) {
                    return true
                }
                if (s.includes(' to ')) {
                    return false
                }
                //~ if (s.split(' of ').length > 1) {
                    //~ return false
                //~ }
                return true
            }

            let batch:string[] = []
            for (let i=0; i<batchSize; i++) {
                let last = data.pop()
                if (last && last.length) {
                    if (enableThisTest(last)) {
                        batch.push(last)
                        count += 1
                    }
                } else {
                    break
                }
            }

            this.doTests(batch, count)
        }
    }

    /**
     * expand the R+W+D tests into separate read, write, delete tests
     */
    protected expandTestData(data: string[]): string[] {
        let ret:string[] = []
        for (let item of data) {
            let pts = item.split('|')
            if (pts[0] === 'R+W+D') {
                let [type, ch, target, placeholder, resread, reswrite, resdelete] = pts
                ret.push(['READ', ch, target, resread ].join('|'))
                ret.push(['WRITE', ch, target, reswrite ].join('|'))
                ret.push(['DELETE', ch, target, resdelete ].join('|'))
            } else {
                ret.push(item)
            }
        }
        return ret
    }

    /**
     * run a batch of tests
     */
    doTests(batch:string[], count:number) {
        /* placeholder text so that an empty batch is ok */
        let code = 'put 1 into x'
        let expecteds:string[] = []
        let i = 0
        for (let entry of batch) {
            i++
            let pts = entry.split('|')
            assertTrue(pts.length === 4, "not 4 parts?", entry)
            expecteds.push(pts[3])
            let targetStringForInput = `"${pts[2]}"`
            targetStringForInput = targetStringForInput.replace(/"\\n/, 'return & "')
            targetStringForInput = targetStringForInput.replace(/\\n"/, '" & return')
            targetStringForInput = targetStringForInput.replace(/\\n/g, '" & return & "')
            code += `\nglobal results${i}`
            if (pts[0]==='READ') {
                code += `\nput ${targetStringForInput} into z`
                code += `\nput ${pts[1]} z into results${i}`
            } else if (pts[0]==='WRITE') {
                code += `\nput ${targetStringForInput} into results${i}`
                code += `\nput "ABCDE" into ${pts[1]} results${i}`
            } else if (pts[0]==='DELETE') {
                code += `\nput ${targetStringForInput} into results${i}`
                code += `\ndelete ${pts[1]} results${i}`
            } else if (pts[0]==='COUNTITEMS') {
                assertWarn(!pts[1].length, '')
                code += `put the number of items in (${targetStringForInput}) into results${i}`
            } else if (pts[0]==='COUNTWORDS') {
                assertWarn(!pts[1].length, '')
                code += `put the number of words in (${targetStringForInput}) into results${i}`
            } else if (pts[0]==='COUNTLINES') {
                assertWarn(!pts[1].length, '')
                code += `put the number of lines in (${targetStringForInput}) into results${i}`
            } else {
                checkThrowInternal(false, "unknown test")
            }
        }

        h.runGeneralCode('', code);
        for (let i=0; i<expecteds.length; i++) {
            let got = h.vcstate.runtime.codeExec.globals.get(`results${i + 1}`).readAsString();
            got = got.replace(/\n/g, "\\n")
            if (got !== expecteds[i]) {
                if (this.failures === 0) {
                    console.error("| refers to a newline and _ is a space in this output.")
                }

                console.error(`\n\n\nFAILURE near test # ${count+i}`)
                console.error('Test: ' + batch[i].replace(/\|/g, '\n').replace(/\\n/g, '|').replace(/ /g, '_'))
                console.error('Got: \n' + got.replace(/\\n/g, '|').replace(/ /g, '_'))
                let pts = batch[i].split('|')
                let input = pts[2]
                let expected = pts[3]
                input = `""&"${input.replace(/\\n/g, '"&cr&"')}"&""`
                if (pts[0] === 'WRITE') {
                    /* write a helpful demo test case */
                    console.log('demo test case:')
                    console.log(`b.t('put ${input} into z1\\\\1', '1')`);
                    console.log(`b.t('put z1 into z\\nput "ABCDE" into ${pts[1]} z\\\\z', '${expected}')`);
                } else if (pts[0] === 'DELETE') {
                    /* write a helpful demo test case */
                    console.log('demo test case:')
                    console.log(`b.t('put ${input} into z1\\\\1', '1')`);
                    console.log(`b.t('put z1 into z\\ndelete ${pts[1]} z\\\\z', '${expected}')`);
                }

                this.failures+=1
                if (this.failures % 20 === 0) {
                    callDebuggerIfNotInProduction()
                }
            }
        }
    }
}
