
/* auto */ import { TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { VpcElStack } from './../../vpc/vel/velStack';
/* auto */ import { cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * test running ViperCard scripts.
 *
 * test lexing, syntax structures like loops, functions, and handlers
 * see TestVpcScriptRunCmd for a description of testBatchEvaluate
 */

let t = new SimpleUtil512TestCollection('testCollectionScriptRunCustomFns');
export let testCollectionScriptRunCustomFns = t;

/**
 * setup
 */
let h = YetToBeDefinedTestHelper<TestVpcScriptRunCustomFns>();
t.atest('--init--vpcTestScriptRunCustomFns', async () => {
    h = new TestVpcScriptRunCustomFns(t);
    return h.initEnvironment();
});
t.test('run code with single-line if', () => {
    let batch: [string, string][] = [
        [
            `
if 3 > 2 then put 1 into ret
\\ret`,
            '1'
        ],
        [
            `
if 3 > 2 then put 1 into ret
if 3 > 2 then add 1 to ret
if 3 > 2 then add 1 to ret
\\ret`,
            '3'
        ],
        [
            `
if 3 > 2 then
if 2 > 1 then put 1 into ret
end if
\\ret`,
            '1'
        ],
        [
            `
if 3 > 2 then put 1 into ret
else put 0 into ret
\\ret`,
            '1'
        ],
        [
            `
if 3 > 4 then put 1 into ret
else put 0 into ret
\\ret`,
            '0'
        ],
        [
            `
if 4 > 3 then put 2 into ret
else if 3 > 2 then put 1 into ret
else put 0 into ret
\\ret`,
            '2'
        ],
        [
            `
if 3 > 3 then put 2 into ret
else if 3 > 2 then put 1 into ret
else put 0 into ret
\\ret`,
            '1'
        ],
        [
            `
if 3 > 3 then put 2 into ret
else if 3 > 3 then put 1 into ret
else put 0 into ret
\\ret`,
            '0'
        ],
        [
            `
if 6>5 then
if 3 > 4 then put 1 into ret
else put 0 into ret
else
put -1 into ret
end if
\\ret`,
            '0'
        ],
        [
            `
if 6>5 then
if 3 > 4 then put 0 into ret
else if 2 > 1 then put 1 into ret
else
    put 0 into ret
end if
else
put -1 into ret
end if
\\ret`,
            '1'
        ],
        [
            `
if 6>5 then
if 3 > 4 then put 0 into ret
else if 2 > 1 then put 1 into ret
else put 0 into ret
else
put -1 into ret
end if
\\ret`,
            '1'
        ],
        [
            `
if 6>5 then
if 3 > 4 then put 0 into ret
else if 2 > 1 then put 1 into ret
else put 0 into ret
else if true then
put -1 into ret
end if
\\ret`,
            '1'
        ],
        [
            `
if 6>5 then
if 3 > 4 then put 0 into ret
else if 2 > 1 then put 1 into ret
else put 0 into ret
else if true then put -1 into ret
\\ret`,
            '1'
        ],
        [
            `
if 6>5 then
if 3 > 4 then
    put 0 into ret
else if 2 > 1 then put 1 into ret
else put 0 into ret
end if
\\ret`,
            '1'
        ]
    ];

    h.testBatchEvaluate(batch);
});
t.test('expand with nested calls', () => {
    h.provideCustomFnInStackScript(`
function myConcat p1, p2, p3
global countCalls
add 1 to countCalls
return p1 & p2 & p3
lineShouldBeSkipped
end myConcat`);
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        [
            `
put 0 into countCalls
put myConcat(2,3) into ret
\\ret && countCalls`,
            '23 1'
        ],
        [
            `
put 0 into countCalls
put myConcat(2,3,4) into ret
\\ret && countCalls`,
            '234 1'
        ],
        [
            `
put 0 into countCalls
put myConcat(2,3,myConcat("(", 1)) into ret
\\ret && countCalls`,
            '23(1 2'
        ],
        [
            `
put 0 into countCalls
put myConcat(2,3,myConcat(")", 1)) into ret
\\ret && countCalls`,
            '23)1 2'
        ],
        [
            `
put 0 into countCalls
put myConcat(2,3,myMult(4,5)) into ret
\\ret && countCalls`,
            '2320 2'
        ],
        [
            `
put 0 into countCalls
put myConcat(2,3,-myMult(4,5)) into ret
\\ret && countCalls`,
            '23-20 2'
        ],
        [
            `
put 0 into countCalls
put myConcat(2,3,- myMult(4,5)) into ret
\\ret && countCalls`,
            '23-20 2'
        ],
        [
            `
put 0 into countCalls
put myMult(2,myMult(myMult(2, 3), 4)) into ret
\\ret && countCalls`,
            '48 3'
        ],
        [
            `
put 0 into countCalls
put myMult(2,myMult(myMult((2), 3), (4))) into ret
\\ret && countCalls`,
            '48 3'
        ]
    ];

    h.testBatchEvaluate(batch);
});
t.test("don't need to expand custom fns on these lines", () => {
    /* VpcLineCategory_.HandlerStart */
    let inp = `
on myHandler myFn(1, 2)
end myHandler`;
    h.assertPreparseErr(inp, 'required comma', 2);

    /* VpcLineCategory_.HandlerEnd */
    inp = `
on myHandler
end myHandler myFn(1, 2)`;
    h.assertPreparseErr(inp, 'wrong line length', 3);

    /* VpcLineCategory_.HandlerExit */
    inp = `
on myHandler
exit myHandler myFn(1, 2)
end myHandler`;
    h.assertPreparseErr(inp, 'wrong line length', 3);

    /* VpcLineCategory_.ProductExit */
    inp = `
on myHandler
exit to ${cProductName} myFn(1, 2)
end myHandler`;
    h.assertPreparseErr(inp, 'wrong line length', 3);

    /* VpcLineCategory_.HandlerPass */
    inp = `
on myHandler
pass myHandler myFn(1, 2)
end myHandler`;
    h.assertPreparseErr(inp, 'wrong line length', 3);

    /* VpcLineCategory_.IfElsePlain */
    inp = `
on myHandler
if true then
else myFn(1, 2)
end if
end myHandler`;
    h.assertPreparseErr(inp, 'outside of if', 5);

    /* VpcLineCategory_.IfElsePlain */
    inp = `
on myHandler
if true then
else myFn(1, 2)
end myHandler`;
    h.assertPreparseErr(inp, "'fn()' alone", 4);

    /* VpcLineCategory_.IfEnd */
    inp = `
on myHandler
if true then
else
end if myFn(1, 2)
end myHandler`;
    h.assertPreparseErr(inp, 'wrong line length', 5);

    /* VpcLineCategory_.RepeatExit */
    inp = `
on myHandler
repeat while false
    exit repeat myFn(1, 2)
end repeat
end myHandler`;
    h.assertPreparseErr(inp, 'wrong line length', 4);

    /* VpcLineCategory_.RepeatNext */
    inp = `
on myHandler
repeat while false
    next repeat myFn(1, 2)
end repeat
end myHandler`;
    h.assertPreparseErr(inp, "just 'next repeat'", 4);

    /* VpcLineCategory_.RepeatEnd */
    inp = `
on myHandler
repeat while false
    next repeat
end repeat myFn(1, 2)
end myHandler`;
    h.assertPreparseErr(inp, 'wrong line length', 5);

    /* VpcLineCategory_.Global */
    inp = `
on myHandler
global myFn(1, 2)
end myHandler`;
    h.assertPreparseErr(inp, 'required comma', 3);

    /* VpcLineCategory_.Global in list */
    inp = `
on myHandler
global a, myFn(1, 2)
end myHandler`;
    h.assertPreparseErr(inp, 'required comma', 3);
});
t.test('expand in VpcLineCategory_.ReturnExpr', () => {
    h.provideCustomFnInStackScript(`
on theTest
    global countCalls
    put 0 into countCalls
    put 4 into x
    return myMult(2, myMult(3, x))
    thisLineShouldNotBeHit
end theTest
`);
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        ['theTest\\the result && countCalls', '24 2']
    ];

    h.testBatchEvaluate(batch);
});
t.test('expand in VpcLineCategory_.IfStart', () => {
    h.provideCustomFnInStackScript();
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        [
            `
put 0 into countCalls
put 4 into x
put 0 into ret
if myMult(2, myMult(3, x)) is 24 then
put 1 into ret
end if\\ret && countCalls`,
            '1 2'
        ],
        [
            `
put 0 into countCalls
put 4 into x
put 0 into ret
if myMult(myMult(3, x), 2) is 24 then
if myMult(4, 5) is 20 then
    put 1 into ret
end if
end if\\ret && countCalls`,
            '1 3'
        ]
    ];

    h.testBatchEvaluate(batch);
});
t.test('expand in VpcLineCategory_.IfElse', () => {
    h.provideCustomFnInStackScript();
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        /* take first branch */
        [
            `
put 0 into countCalls
put 4 into x
put 0 into ret
if myMult(1, myMult(3, x)) is 12 then
put 10 into ret
else if myMult(2, myMult(3, x)) is 24 then
put 20 into ret
else if myMult(3, myMult(3, x)) is 36 then
put 30 into ret
else
put 40 into ret
end if\\ret && countCalls`,
            '10 2'
        ],
        /* take second branch */
        [
            `
put 0 into countCalls
put 4 into x
put 0 into ret
if myMult(1, myMult(3, x)) is 11 then
put 10 into ret
else if myMult(2, myMult(3, x)) is 24 then
put 20 into ret
else if myMult(3, myMult(3, x)) is 36 then
put 30 into ret
else
put 40 into ret
end if\\ret && countCalls`,
            '20 4'
        ],
        /* take third branch */
        [
            `
put 0 into countCalls
put 4 into x
put 0 into ret
if myMult(1, myMult(3, x)) is 11 then
put 10 into ret
else if myMult(2, myMult(3, x)) is 23 then
put 20 into ret
else if myMult(3, myMult(3, x)) is 36 then
put 30 into ret
else
put 40 into ret
end if\\ret && countCalls`,
            '30 6'
        ],
        /* take fourth branch */
        [
            `
put 0 into countCalls
put 4 into x
put 0 into ret
if myMult(1, myMult(3, x)) is 11 then
put 10 into ret
else if myMult(2, myMult(3, x)) is 23 then
put 20 into ret
else if myMult(3, myMult(3, x)) is 35 then
put 30 into ret
else
put 40 into ret
end if\\ret && countCalls`,
            '40 6'
        ],
        /* nested if */
        [
            `
put 0 into countCalls
put 4 into x
put 0 into ret
if myMult(1, myMult(3, x)) is 11 then
put 10 into ret
else if myMult(2, myMult(3, x)) is 24 then
if myMult(myMult(myMult(1,2),3),4) is 23 then
    put 20 into ret
else if myMult(myMult(myMult(1,2),3),5) is 29 then
    put 30 into ret
else if myMult(myMult(myMult(1,2),3),6) is 36 then
    put 1 into ret
else if myMult(myMult(myMult(1,2),3),7) is 42 then
    put 40 into ret
end if
else if myMult(3, myMult(3, x)) is 36 then
put 50 into ret
end if\\ret && countCalls`,
            '1 13'
        ],
        /* nested if, 3 levels */
        [
            `
put 0 into countCalls
put 4 into x
put 0 into ret
if myMult(1, myMult(3, x)) is 11 then
put 10 into ret
else if myMult(2, myMult(3, x)) is 23 then
put 20 into ret
else if myMult(3, myMult(3, x)) is 36 then
if myMult(myMult(myMult(1,2),3),4) is 23 then
    put 30 into ret
else if myMult(myMult(myMult(1,2),3),5) is 30 then
    if myMult(x,5) is 19 then
        put 40 into ret
    else if myMult(x,6) is 24 then
        put 1 into ret
    else if myMult(x,7) is 28 then
        put 50 into ret
    end if
else if myMult(myMult(myMult(1,2),3),7) is 42 then
    put 60 into ret
end if
end if\\ret && countCalls`,
            '1 14'
        ]
    ];

    h.testBatchEvaluate(batch);
});
t.test('expand in simple repeats', () => {
    h.provideCustomFnInStackScript();
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        /* repeat with x */
        /* confirmed in emulator the fn only called once */
        [
            `
put 0 into countCalls
put "" into s
repeat with x = 1 to myMult(2,3)
put x after s
end repeat\\s && countCalls`,
            '123456 1'
        ],
        [
            `
put 0 into countCalls
put "" into s
repeat with x = 9 down to myMult(2,3)
put x after s
end repeat\\s && countCalls`,
            '9876 1'
        ],
        [
            `
put 0 into countCalls
put "" into s
repeat with x = myMult(2,3) to 9
put x after s
end repeat\\s && countCalls`,
            '6789 1'
        ],
        [
            `
put 0 into countCalls
put "" into s
repeat with x = myMult(2,3) down to 1
put x after s
end repeat\\s && countCalls`,
            '654321 1'
        ],
        [
            `
put 0 into countCalls
put "" into s
repeat with x = myMult(2,3) to myMult(3,3)
put x after s
end repeat\\s && countCalls`,
            '6789 2'
        ],
        [
            `
put 0 into countCalls
put "" into s
repeat with x = myMult(3,3) down to myMult(2,3)
put x after s
end repeat\\s && countCalls`,
            '9876 2'
        ],
        [
            `
put 0 into countCalls
put "" into s
repeat myMult(2,3) times
put "-" after s
end repeat\\s && countCalls`,
            '------ 1'
        ],
        [
            `
put 0 into countCalls
put "" into s
repeat myMult(1,3)
put "-" after s
end repeat\\s && countCalls`,
            '--- 1'
        ]
    ];
    h.testBatchEvaluate(batch);
});
t.test('expand in repeat while/until', () => {
    h.provideCustomFnInStackScript();
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        /* repeat while */
        /* confirmed in emulator the fn is called at every point */
        [
            `
put 0 into countCalls
put 1 into x
put "" into s
repeat while x < myMult(2,3)
put x after s
add 1 to x
end repeat\\s && countCalls`,
            '12345 6'
        ],
        [
            `
put 0 into countCalls
put 1 into x
put "" into s
repeat while myMult(2,3) >= x
put x after s
add 1 to x
end repeat\\s && countCalls`,
            '123456 7'
        ],
        [
            `
put 0 into countCalls
put 1 into x
put "" into s
repeat until myMult(2,3) < x
put x after s
add 1 to x
end repeat\\s && countCalls`,
            '123456 7'
        ],
        [
            `
put 0 into countCalls
put 1 into x
put "" into s
repeat until x >= myMult(2,3)
put x after s
add 1 to x
end repeat\\s && countCalls`,
            '12345 6'
        ],
        /* nested repeat */
        [
            `
put 0 into countCalls
put 1 into x
put "" into s
repeat while x < myMult(2,3)
put 1 into y
repeat while y < myMult(1,3)
    put x & "/" & y & "," after s
    add 1 to y
end repeat
add 1 to x
end repeat\\s && countCalls`,
            '1/1,1/2,2/1,2/2,3/1,3/2,4/1,4/2,5/1,5/2, 21'
        ]
    ];
    h.testBatchEvaluate(batch);
});
t.test('expand in VpcLineCategory_.built in command', () => {
    h.provideCustomFnInStackScript();
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        [
            `
put 0 into countCalls
set the left of cd fld "p1" of card "c" to 1
set the left of cd fld "p1" of card "c" to myMult(2,3)
\\the left of cd fld "p1" of card "c" && countCalls`,
            '6 1'
        ],
        [
            `
put 0 into countCalls
set the left of cd fld "p1" of card "c" to 1
set the left of cd fld ("p" & myMult(1,1)) of card "c" to myMult(2,3)
\\the left of cd fld "p1" of card "c" && countCalls`,
            '6 2'
        ],
        [
            `
put 0 into countCalls
put 1 into x
add myMult(2,3) to x\\x && countCalls`,
            '7 1'
        ],
        [
            `
put 0 into countCalls
put 1 into x
add myMult(2,myMult(1,3)) to x\\x && countCalls`,
            '7 2'
        ],
        [
            `
put 0 into countCalls
put 1 into cd fld "p1" of card "c"
add myMult(2,3) to cd fld "p1" of card "c"
\\cd fld "p1" of card "c" && countCalls`,
            '7 1'
        ],
        [
            `
put 0 into countCalls
put 1 into cd fld "p1" of card "c"
add myMult(2,3) to cd fld ("p" & myMult(1,1)) of card "c"
\\cd fld "p1" of card "c" && countCalls`,
            '7 2'
        ],
        [
            `
put 0 into countCalls
put 1 into cd fld "p1" of card "c"
put myMult(2,myMult(1,3)) into cd fld "p1" of card "c"
\\cd fld "p1" of card "c" && countCalls`,
            '6 2'
        ],
        [
            `
put 0 into countCalls
put 1 into cd fld "p1" of card "c"
put myMult(2,myMult(1,3)) into cd fld ("p" & myMult(1,1)) of card "c"
\\cd fld "p1" of card "c" && countCalls`,
            '6 3'
        ],
        /* across escaped lines */
        [
            `
put myMult(2,3) + myMult(1,3) into x
{RESULT}x`,
            '9'
        ],
        [
            `
put myMult(2,3) + \\\n myMult(1,3) into x
{RESULT}x`,
            '9'
        ],
        [
            `
put 6 + \\\n myMult(1,3) into x
{RESULT}x`,
            '9'
        ],
        [
            `
put 6 + \\\n myMult(1, \\\n 3) into x
{RESULT}x`,
            '9'
        ],
        [
            `
put 6 + \\\n myMult(\\\n 1, 3\\\n) into x
{RESULT}x`,
            '9'
        ],
        [
            `
put 6 + \\\n myMult(\\\n1\\\n,\\\n3\\\n) into x
{RESULT}x`,
            '9'
        ],
        [
            `
put 6 + \\\n myMult(2, \\\n myMult(3, \\\n 4)) into x
{RESULT}x`,
            '30'
        ],
        [
            `
put 6 + \\\n myMult(1, \\\n 3) + myMult(\\\n 1, 3) + myMult(1, 3 \\\n) into x
{RESULT}x`,
            '15'
        ]
    ];
    h.testBatchEvaluate(batch);
});
t.test('expand in VpcLineCategory_.GoCardImpl', () => {
    h.provideCustomFnInStackScript();
    let numExpectedCalls = 2;
    /* in rewrites we currently expand it twice, not perfect but good enough */
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        /* go to card */
        [
            `
    put 0 into countCalls
    go to card myMult(1,1)
    put the short id of this cd is the short id of card 1 into ret
    \\ret && countCalls`,
            `true ${numExpectedCalls}`
        ],
        [
            `
    put 0 into countCalls
    go to card (1 + myMult(1,1))
    put the short id of this cd is the short id of card 2 into ret
    \\ret && countCalls`,
            `true ${numExpectedCalls}`
        ],
        [
            `
    put 0 into countCalls
    go to card myMult(1,3)
    put the short id of this cd is the short id of card 3 into ret
    \\ret && countCalls`,
            `true ${numExpectedCalls}`
        ],
        [
            `
    put 0 into countCalls
    go to card (myMult(3,1) + myMult(1,1))
    put the short id of this cd is the short id of card 4 into ret
    \\ret && countCalls`,
            `true ${2 * numExpectedCalls}`
        ]
    ];
    h.testBatchEvaluate(batch);
});
t.test('expand in VpcLineCategory_.CallDynamic', () => {
    h.provideCustomFnInStackScript();
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        [
            `
global g
put 0 into countCalls
do "global g" & cr & "put " & myMult(2,3) & " + 1 into g"
\\g && countCalls`,
            '7 1'
        ],
        [
            `
global g
put 0 into countCalls
send "global g" & cr & "put " & myMult(2,3) & " + 1 into g" to this card
\\g && countCalls`,
            '7 1'
        ]
    ];
    h.testBatchEvaluate(batch);
});
t.test('expand in VpcLineCategory_.CallHandler', () => {
    h.provideCustomFnInStackScript(`
on theTest p1, p2
global g
put p1+p2 into g
end theTest
`);
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        [
            `
global g
put 0 into countCalls
theTest 4, 5
\\g && countCalls`,
            '9 0'
        ],
        [
            `
global g
put 0 into countCalls
theTest 4, myMult(2,3)
\\g && countCalls`,
            '10 1'
        ],
        [
            `
global g
put 0 into countCalls
theTest myMult(2,3), myMult(3,3)
\\g && countCalls`,
            '15 2'
        ],
        [
            `
global g
put 0 into countCalls
theTest myMult(2,myMult(3,4)), myMult(5,6)
\\g && countCalls`,
            '54 3'
        ]
    ];
    h.testBatchEvaluate(batch);
});

/**
 * new features of TestVpcScriptRunBase for running custom functions
 */
class TestVpcScriptRunCustomFns extends TestVpcScriptRunBase {

    /**
     * in case it's not already there, provide myMult in the stack script
     */
    provideCustomFnInStackScript(addCode = '') {
        let stack = h.vcstate.model.getById(VpcElStack, h.elIds.stack);
        h.vcstate.vci.undoableAction(() =>
            stack.set(
                'script',
                `
    function myMult p1, p2
        global countCalls
        add 1 to countCalls
        return p1 * p2
    end myMult
    ${addCode}`
            )
        );
    }
}
