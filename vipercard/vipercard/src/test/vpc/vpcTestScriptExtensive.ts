
/* auto */ import { VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { VpcElStack } from './../../vpc/vel/velStack';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { UI512ErrorHandling, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { assertWarnEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollectionScriptExtensive', true);
export let testCollectionScriptExtensive = t;

let h = YetToBeDefinedTestHelper<TestVpcScriptRunBase>();
t.atest('--init--testCollectionScriptExtensive', async () => {
    h = new TestVpcScriptRunBase(t);
    return h.initEnvironment();
});
t.atest('runConditionalTests', () => {
    let test = new RunExtensiveConditionalTests();
    return test.go();
});

/**
 * I decided to thoroughly test if-then support by
 * writing a python script to generate thousands of examples,
 * running the examples on the original product in an emulator,
 * then running the script in vipercard and comparing them.
 * 
 * all tests pass - matches the original product perfectly!
 */
class RunExtensiveConditionalTests {
    helperCode = `
function veryWeakHash b
    put 5381 into hash
    put 2 ^ 24 into maxh
    repeat with i = 1 to the number of chars in b
        put charToNum(char i of b) into c
        put (hash*32 + hash) + c into hash
        put hash mod maxh into hash
    end repeat
    return hash
end veryWeakHash

function condition x
    global conditions, allout
    put x after allout
    put char x of conditions into r
    if r = "1" then return true
    else return false
end condition

on prepConditions x, bitwidth
    -- converts x to binary with width bitwidth
    global conditions
    put "" into conditions
    repeat with i = 1 to bitwidth
        put x mod 2 after conditions
        put x div 2 into x
    end repeat
end prepConditions

on doOperation p
    global allout
    put p after allout
end doOperation

    `;
    helperCodeTests = `
on testPrepConditions
    global conditions, allout
    put "" into allout
    repeat with x = 0 to 31
        prepConditions x, 5
        put conditions & "," after allout
    end repeat
end testPrepConditions

on testveryWeakHash
    global allout
    put veryWeakHash("1,2,3") into allout
end testveryWeakHash
`;
    async loadTestData() {
        let url = '/resources03a/test/testScriptExtensiveConditionalsCollateral.txt';
        let data = await Util512Higher.asyncLoadJsonString(url);
        url = '/resources03a/test/testScriptExtensiveConditionalsExpected.txt';
        let expected = await Util512Higher.asyncLoadJsonString(url);
        let expectedar = expected.trim().replace(/\r\n/g, '\n').split('\n');
        return [data.split('@'), expectedar];
    }

    getLineFromExpected(expected: string[], i: number) {
        let ret = expected[i];
        let pts = ret.split(':');
        if (pts.length > 1) {
            assertWarnEq((i + 1).toString(), pts[0], 'Q.|');
            return pts[1];
        } else {
            return ret;
        }
    }

    async testHelpers() {
        h.runGeneralCode(this.helperCodeTests, 'testPrepConditions');
        let got = h.vcstate.runtime.codeExec.globals.get('allout');
        let expected = longstr(
            `00000,10000,01000,11000,00100,10100,01100,
            11100,00010,10010,01010,11010,00110,10110,01110,11110,00001,
            10001,01001,11001,00101,10101,01101,11101,00011,10011,01011,
            11011,00111,10111,01111,11111,`,
            ''
        );
        assertWarnEq(expected, got.readAsString(), 'Q-|');
        h.runGeneralCode(this.helperCodeTests, 'testveryWeakHash');
        got = h.vcstate.runtime.codeExec.globals.get('allout');
        assertWarnEq('9350163', got.readAsString(), 'Q,|');
        /* confirm that we'll be writing to allout */
        h.vcstate.runtime.codeExec.globals.set('allout', VpcValS(''));
        h.runGeneralCode(
            '',
            `
global conditions
put 1101 into conditions
if condition(2) then
    doOperation "a"
end if
if condition(3) then
    doOperation "b"
end if
if condition(4) then
    doOperation "c"
end if
`
        );
        got = h.vcstate.runtime.codeExec.globals.get('allout');
        assertWarnEq('2a34c', got.readAsString(), 'Q+|');
    }

    /*

    by turning on silenceAssertMsgs, this makes assertWarns throw,
      which is useful because we can catch the exception and not show
     any dialogs. */
    /**
     * Many of the tests here throw.
     */
    async go() {
        UI512ErrorHandling.silenceAssertMsgs = true;
        try {
            await this.goImpl();
        } finally {
            UI512ErrorHandling.silenceAssertMsgs = false;
        }
    }

    /* runs the test */
    async goImpl() {
        let stack = h.vcstate.model.getById(VpcElStack, h.elIds.stack);
        h.vcstate.vci.undoableAction(() => stack.set('script', this.helperCode));

        await this.testHelpers();

        /* it's ok to stop and re-start code execution each time */
        let [data, expectedar] = await this.loadTestData();
        let countTests = Math.min(expectedar.length, data.length);
        let failures = 0;
        for (let i = 0; i < countTests; i++) {
            if (i % 20 === 0) {
                /* release our timeslice for a bit so the ui doesn't freeze */
                await Util512Higher.sleep(10);
                console.log(i, '.');
            }

            let prefix = 'global allout \nput "" into allout\n';
            let suffix = '\nput veryWeakHash(allout) into allout';
            let code = prefix + data[i] + suffix;
            let got: string;
            try {
                /* compile errors are assertwarns,
                but we've set the silenceAssertMsgs flag, so
                they will become thrown exceptions instead */
                h.runGeneralCode('', code);
                got = h.vcstate.runtime.codeExec.globals.get('allout').readAsString();
            } catch (e) {
                assertWarn(e.message.includes('unexpected failure'), 'Q*|');
                console.log(e.message);
                got = 'compileErr';
            }

            let expected = this.getLineFromExpected(expectedar, i);
            if (expected !== got) {
                console.error('Different result:', i, expected, got);
                failures += 1;
            }
        }

        console.log(`ran verification for ${countTests} tests. ${failures} failures.`);
        h.vcstate.vci.undoableAction(() => stack.set('script', ''));
    }

    /* not for vipercard, but for the original project
    running in an emulator.
    1) optional: use genconditionaltests.py to generate
        testScriptExtensiveConditionalsCollateral.txt
    2) change lineendings in that file to \r
    3) put file into the emulator.
    4) make a stack with a cd btn "go", cd btn "target" (id 5) and a cd fld "myf"
    5) script of button "go" is
        global isActive
        put 1 into isActive
    6) put this into the card script, update path to text file.
  function veryWeakHash b
    -- an even weaker version of djb2, but
    -- it's fast and it won't run into intmax.
    put 5381 into hash
    put 2 ^ 24 into maxh
    repeat with i = 1 to the number of chars in b
      put charToNum(char i of b) into c
      put (hash*32 + hash) + c into hash
      put hash mod maxh into hash
    end repeat
    return hash
  end veryWeakHash

  function condition x
    global conditions, allout
    put x after allout
    put char x of conditions into r
    if r = "1" then return true
    else return false
  end condition

  on prepConditions x, bitwidth
    -- converts x to binary with width bitwidth
    global conditions
    put "" into conditions
    repeat with i = 1 to bitwidth
      put x mod 2 after conditions
      put x div 2 into x
    end repeat
  end prepConditions

  on doOperation p
    global allout
    put p after allout
  end doOperation

  on errordialog
    put return & "compileErr" after cd fld "myf"
  end errordialog

  function getnth n
    global whichLine, isActive
    -- this is inefficient, but it's also simple.
    -- plenty fast.
    -- if I were to leave the file handle open,
    -  a script error might cause the file handle to be leaked,
    -- and I'm worried about getting a 'too many open file handles' error
    put "macmain:condoutcr.txt" into txtf
    open file txtf
    repeat with i = 1 to (whichLine-1)
      read from file txtf until "@"
    end repeat
    read from file txtf until "@"
    put it into ret
    close file txtf
    put char 1 to (length(ret)-1) of ret into ret
    return ret
  end getnth

  -- why use on idle?
  -- because apparently compileErrors are really common.
  -- although errorDialog traps an error, it doesn't pass execution
  -- back to the caller, so it'd be tricky to have it continue the
  -- script. so we just let execution halt, and wait for idle to
  -- resume executing the script.
  on idle
    global whichLine, isActive
    if isActive <> 1 then pass idle
    if whichLine > 1000 then
      put 0 into isActive
    end if

    global conditions, allout
    put "global allout " & return & return & "" into prefix
    put return & "put veryWeakHash(allout) into allout" into suffix

    -- use a batch size of 32. arbitrary.
    -- higher #s prob faster but make the ui freeze.
    repeat with i = 1 to 32
      put whichLine + 1 into whichLine
      put getnth(whichLine) into code
      put prefix & code & suffix into code
      put "on mouseup" & return & code & return & "end mouseup" into code
      put "" into allout
      set the script of cd btn id 5 to code
      set the lockerrordialogs to true
      send "mouseup" to cd btn id 5
      set the lockerrordialogs to false
      put return & whichLine & ":" & allout after cd fld "myf"
    end repeat

  end idle
  7) click "go" and watch it run!
 */
}
