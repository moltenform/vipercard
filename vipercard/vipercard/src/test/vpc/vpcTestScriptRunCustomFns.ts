
/* auto */ import { TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { VpcLineCategory } from './../../vpc/codepreparse/vpcPreparseCommon';
/* auto */ import { VpcElStack } from './../../vpc/vel/velStack';
/* auto */ import { cProductName } from './../../ui512/utils/util512Productname';
/* auto */ import { checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

import { checkThrow } from '../../ui512/utils/util512Assert';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * test running ViperCard scripts.
 *
 * test lexing, syntax structures like loops, functions, and handlers
 * see _TestVpcScriptRunCmd_ for a description of testBatchEvaluate
 */

let t = new SimpleUtil512TestCollection('vpcTestCollectionScriptRunCustomFns');
export let vpcTestCollectionScriptRunCustomFns = t;

/**
 * setup
 */
let h = YetToBeDefinedTestHelper<TestVpcScriptRunCustomFns>()
t.atest("--init--vpcTestScriptEval", async ()=> {
    h = new TestVpcScriptRunCustomFns(t)
    await h.initEnvironment();
})

t.test('_expand if + if else', () => {
    let inp = `
on myCode
test001
if 0 is 1 then
    code1
end if
end myCode`;
    let expected = `
HandlerStart
test001~
if~0~is~1~then~
    code1~
IfEnd
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
test002
if 0 is 1 then
    code1
else
    code2
end if
end myCode`;
    expected = `
HandlerStart
test002~
if~0~is~1~then~
    code1~
IfElsePlain
    code2~
IfEnd
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
test003
if 0 is 1 then
    code1
else if 0 is 2 then
    code2
else if 0 is 3 then
    code3
else
    code4
end if
end myCode`;
    expected = `
HandlerStart
test003~
if~0~is~1~then~
    code1~
IfElsePlain
    if~0~is~2~then~
        code2~
    IfElsePlain
        if~0~is~3~then~
            code3~
        IfElsePlain
            code4~
        IfEnd
    IfEnd
IfEnd
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
test004
if 0 is 1 then
    code1
else if 0 is 2 then
    code2
else if 0 is 3 then
    code3
else if 0 is 4 then
    code4
end if
end myCode`;
    expected = `
HandlerStart
test004~
if~0~is~1~then~
    code1~
IfElsePlain
    if~0~is~2~then~
        code2~
    IfElsePlain
        if~0~is~3~then~
            code3~
        IfElsePlain
            if~0~is~4~then~
                code4~
            IfEnd
        IfEnd
    IfEnd
IfEnd
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
test005
if 0 is 1 then
    if -1 is 1 then
        othercode1
    end if
else if 0 is 2 then
    code1a
    if -1 is 2 then
        othercode2
    else if 3 then
        othercode3
    end if
    code1b
else if 0 is 3 then
    if -1 is 3 then
    end if
end if
end myCode`;
    expected = `
HandlerStart
test005~
if~0~is~1~then~
    if~-~1~is~1~then~
        othercode1~
    IfEnd
IfElsePlain
    if~0~is~2~then~
        code1a~
        if~-~1~is~2~then~
            othercode2~
        IfElsePlain
            if~3~then~
                othercode3~
            IfEnd
        IfEnd
        code1b~
    IfElsePlain
        if~0~is~3~then~
            if~-~1~is~3~then~
            IfEnd
        IfEnd
    IfEnd
IfEnd
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
test006
if 0 is 1 then
    if -1 is 1 then
    else
    end if
else if 0 is 2 then
    if -1 is 2 then
        c1
    else if -1 is 3 then
        c2
    end if
else if 0 is 3 then
    if -1 is 4 then
        d1
    else if -1 is 5 then
        d2
    else if -1 is 6 then
        d3
    end if
end if
end myCode`;
    expected = `
HandlerStart
test006~
if~0~is~1~then~
    if~-~1~is~1~then~
    IfElsePlain
    IfEnd
IfElsePlain
    if~0~is~2~then~
        if~-~1~is~2~then~
            c1~
        IfElsePlain
            if~-~1~is~3~then~
                c2~
            IfEnd
        IfEnd
    IfElsePlain
        if~0~is~3~then~
            if~-~1~is~4~then~
                d1~
            IfElsePlain
                if~-~1~is~5~then~
                    d2~
                IfElsePlain
                    if~-~1~is~6~then~
                        d3~
                    IfEnd
                IfEnd
            IfEnd
        IfEnd
    IfEnd
IfEnd
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
test007
if 0 is 1 then
    if -1 is 1 then
        if -2 is 1 then
        else if -2 is 2 then
        else if -2 is 3 then
        end if
    else if -1 is 2 then
        if -3 is 1 then
        else if -3 is 2 then
            if -4 is 1 then
            else if -4 is 2 then
            else if -4 is 3 then
            end if
        else if -3 is 3 then
        end if
    else if -1 is 3 then
    end if
else if 0 is 2 then
else if 0 is 3 then
end if
end myCode`;
    expected = `
HandlerStart
test007~
if~0~is~1~then~
    if~-~1~is~1~then~
        if~-~2~is~1~then~
        IfElsePlain
            if~-~2~is~2~then~
            IfElsePlain
                if~-~2~is~3~then~
                IfEnd
            IfEnd
        IfEnd
    IfElsePlain
        if~-~1~is~2~then~
            if~-~3~is~1~then~
            IfElsePlain
                if~-~3~is~2~then~
                    if~-~4~is~1~then~
                    IfElsePlain
                        if~-~4~is~2~then~
                        IfElsePlain
                            if~-~4~is~3~then~
                            IfEnd
                        IfEnd
                    IfEnd
                IfElsePlain
                    if~-~3~is~3~then~
                    IfEnd
                IfEnd
            IfEnd
        IfElsePlain
            if~-~1~is~3~then~
            IfEnd
        IfEnd
    IfEnd
IfElsePlain
    if~0~is~2~then~
    IfElsePlain
        if~0~is~3~then~
        IfEnd
    IfEnd
IfEnd
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);
});
t.test('_expand single-line if and else-if', () => {
    let inp = `
on myCode
if x > 1 then c1
end myCode`;
    let expected = `
HandlerStart
if~x~>~1~then~
    c1~
IfEnd
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
if x > 1 then c1
if x > 2 then c2
end myCode`;
    expected = `
HandlerStart
if~x~>~1~then~
    c1~
IfEnd
if~x~>~2~then~
    c2~
IfEnd
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
if x > 1 then c1
if x > 2 then c2
if x > 3 then c3
end myCode`;
    expected = `
HandlerStart
if~x~>~1~then~
    c1~
IfEnd
if~x~>~2~then~
    c2~
IfEnd
if~x~>~3~then~
    c3~
IfEnd
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
if x > 1 then
    if x > 2 then c2
end if
end myCode`;
    expected = `
HandlerStart
if~x~>~1~then~
    if~x~>~2~then~
        c2~
    IfEnd
IfEnd
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
if x > 1 then c1
c2
end myCode`;
    expected = `
HandlerStart
if~x~>~1~then~
    c1~
IfEnd
c2~
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);

    /* two lines */
    expected = `
HandlerStart
if~x~>~1~then~
    c1~
IfElsePlain
    c2~
IfEnd
HandlerEnd
`;
    inp = `
on myCode
if x > 1 then c1
else c2
end myCode`;

    h.compareRewrittenCode(inp, expected);
    inp = `
on myCode
if x > 1 then
    c1
else c2
end myCode`;
    h.compareRewrittenCode(inp, expected);
    inp = `
on myCode
if x > 1 then c1
else
    c2
end if
end myCode`;
    h.compareRewrittenCode(inp, expected);
    inp = `
on myCode
if x > 1 then
    c1
else
    c2
end if
end myCode`;
    h.compareRewrittenCode(inp, expected);

    /* three lines */
    expected = `
HandlerStart
if~x~>~1~then~
    c1~
IfElsePlain
    if~x~>~2~then~
        c2~
    IfElsePlain
        c3~
    IfEnd
IfEnd
HandlerEnd
`;
    inp = `
on myCode
if x > 1 then c1
else if x > 2 then c2
else c3
end myCode`;
    h.compareRewrittenCode(inp, expected);
    inp = `
on myCode
if x > 1 then
    c1
else if x > 2 then c2
else c3
end myCode`;
    h.compareRewrittenCode(inp, expected);
    inp = `
on myCode
if x > 1 then
    c1
else if x > 2 then
    c2
else c3
end myCode`;
    h.compareRewrittenCode(inp, expected);
    inp = `
on myCode
if x > 1 then c1
else if x > 2 then c2
else
    c3
end if
end myCode`;
    h.compareRewrittenCode(inp, expected);
    inp = `
on myCode
if x > 1 then
    c1
else if x > 2 then c2
else
    c3
end if
end myCode`;
    h.compareRewrittenCode(inp, expected);

    /* if a plain else, must end the single line! */
    inp = `
on myCode
if x > 0 then
    if x > 1 then c1
    else c2
else c3
end myCode`;
    expected = `
HandlerStart
if~x~>~0~then~
    if~x~>~1~then~
        c1~
    IfElsePlain
        c2~
    IfEnd
IfElsePlain
    c3~
IfEnd
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
if x > 0 then
    if x > 1 then c1
    else c2
else if x > 3 then
    c3
end if
end myCode`;
    expected = `
HandlerStart
if~x~>~0~then~
    if~x~>~1~then~
        c1~
    IfElsePlain
        c2~
    IfEnd
IfElsePlain
    if~x~>~3~then~
        c3~
    IfEnd
IfEnd
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);
    inp = `
on myCode
if x > 0 then
    if x > 1 then c1
    else c2
else if x > 3 then c3
end myCode`;
    expected = `
HandlerStart
if~x~>~0~then~
    if~x~>~1~then~
        c1~
    IfElsePlain
        c2~
    IfEnd
IfElsePlain
    if~x~>~3~then~
        c3~
    IfEnd
IfEnd
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
on myCode
if x > 0 then
    if x > 1 then c1
    else if x > 2 then c2
    else
        c3
    end if
else
    c10
end if
end myCode`;
    expected = `
HandlerStart
if~x~>~0~then~
    if~x~>~1~then~
        c1~
    IfElsePlain
        if~x~>~2~then~
            c2~
        IfElsePlain
            c3~
        IfEnd
    IfEnd
IfElsePlain
    c10~
IfEnd
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);
    inp = `
on myCode
if x > 0 then
    if x > 1 then c1
    else if x > 2 then c2
    else c3
else
    c10
end if
end myCode`;
    expected = `
HandlerStart
if~x~>~0~then~
    if~x~>~1~then~
        c1~
    IfElsePlain
        if~x~>~2~then~
            c2~
        IfElsePlain
            c3~
        IfEnd
    IfEnd
IfElsePlain
    c10~
IfEnd
HandlerEnd
`;
    h.compareRewrittenCode(inp, expected);
});
t.test('_put into message box', () => {
    let inp = `on myCode
put "abc"
end myCode`;
    let expected = `HandlerStart
    put~"abc"~syntaxmarker~into~syntaxmarker~vpc__internal__msgbox~
    HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc"
put "def"
end myCode`;
    expected = `HandlerStart
    put~"abc"~syntaxmarker~into~syntaxmarker~vpc__internal__msgbox~
    put~"def"~syntaxmarker~into~syntaxmarker~vpc__internal__msgbox~
    HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "a" & "b" & "c"
end myCode`;
    expected = `HandlerStart
    put~"a"~&~"b"~&~"c"~syntaxmarker~into~syntaxmarker~vpc__internal__msgbox~
    HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "a" & "b into c"
end myCode`;
    expected = `HandlerStart
put~"a"~&~"b into c"~syntaxmarker~into~syntaxmarker~vpc__internal__msgbox~
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc" into x
end myCode`;
    expected = `HandlerStart
    put~"abc"~syntaxmarker~into~syntaxmarker~x~
    HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc" into msgbox
end myCode`;
    expected = `HandlerStart
put~"abc"~syntaxmarker~into~syntaxmarker~msgbox~
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
add 1 to the msg box
end myCode`;
    expected = `HandlerStart
add~1~to~vpc__internal__msgbox~
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc" into msg boxb
end myCode`;
    expected = `HandlerStart
put~"abc"~syntaxmarker~into~syntaxmarker~msg~boxb~
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc" into bmsg box
end myCode`;
    expected = `HandlerStart
put~"abc"~syntaxmarker~into~syntaxmarker~bmsg~box~
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc" into msg box
end myCode`;
    expected = `HandlerStart
put~"abc"~syntaxmarker~into~syntaxmarker~vpc__internal__msgbox~
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc" into msg box
put "def" into msg box
end myCode`;
    expected = `HandlerStart
put~"abc"~syntaxmarker~into~syntaxmarker~vpc__internal__msgbox~
put~"def"~syntaxmarker~into~syntaxmarker~vpc__internal__msgbox~
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc" into the msg boxb
end myCode`;
    expected = `HandlerStart
    put~"abc"~syntaxmarker~into~syntaxmarker~the~msg~boxb~
    HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc" into xthe msg box
end myCode`;
    expected = `HandlerStart
put~"abc"~syntaxmarker~into~syntaxmarker~xthe~vpc__internal__msgbox~
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `on myCode
put "abc" into the msg box
end myCode`;
    expected = `HandlerStart
put~"abc"~syntaxmarker~into~syntaxmarker~vpc__internal__msgbox~
HandlerEnd`;
    h.compareRewrittenCode(inp, expected);
});
t.test('_run code with single-line if', () => {
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
t.test('_expand with nested calls', () => {
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
t.test("test_don't need to expand custom fns on these lines", () => {
    /* VpcLineCategory.HandlerStart */
    let inp = `
on myHandler myFn(1, 2)
end myHandler`;
    h.assertCompileError(inp, 'required comma', 2);

    /* VpcLineCategory.HandlerEnd */
    inp = `
on myHandler
end myHandler myFn(1, 2)`;
    h.assertCompileError(inp, 'wrong line length', 3);

    /* VpcLineCategory.HandlerExit */
    inp = `
on myHandler
exit myHandler myFn(1, 2)
end myHandler`;
    h.assertCompileError(inp, 'wrong line length', 3);

    /* VpcLineCategory.ProductExit */
    inp = `
on myHandler
exit to ${cProductName} myFn(1, 2)
end myHandler`;
    h.assertCompileError(inp, 'wrong line length', 3);

    /* VpcLineCategory.HandlerPass */
    inp = `
on myHandler
pass myHandler myFn(1, 2)
end myHandler`;
    h.assertCompileError(inp, 'wrong line length', 3);

    /* VpcLineCategory.IfElsePlain */
    inp = `
on myHandler
if true then
else myFn(1, 2)
end if
end myHandler`;
    h.assertCompileError(inp, "'fn()' alone", 4);

    /* VpcLineCategory.IfEnd */
    inp = `
on myHandler
if true then
else
end if myFn(1, 2)
end myHandler`;
    h.assertCompileError(inp, 'wrong line length', 5);

    /* VpcLineCategory.RepeatExit */
    inp = `
on myHandler
repeat while false
    exit repeat myFn(1, 2)
end repeat
end myHandler`;
    h.assertCompileError(inp, 'wrong line length', 4);

    /* VpcLineCategory.RepeatNext */
    inp = `
on myHandler
repeat while false
    next repeat myFn(1, 2)
end repeat
end myHandler`;
    h.assertCompileError(inp, "just 'next repeat'", 4);

    /* VpcLineCategory.RepeatEnd */
    inp = `
on myHandler
repeat while false
    next repeat
end repeat myFn(1, 2)
end myHandler`;
    h.assertCompileError(inp, 'wrong line length', 5);

    /* VpcLineCategory.Global */
    inp = `
on myHandler
global myFn(1, 2)
end myHandler`;
    h.assertCompileError(inp, 'required comma', 3);

    /* VpcLineCategory.Global in list */
    inp = `
on myHandler
global a, myFn(1, 2)
end myHandler`;
    h.assertCompileError(inp, 'required comma', 3);
});
t.test('_expand in VpcLineCategory.ReturnExpr', () => {
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
t.test('_expand in VpcLineCategory.IfStart', () => {
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
t.test('_expand in VpcLineCategory.IfElse', () => {
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
t.test('_expand in simple repeats', () => {
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
t.test('_expand in repeat while/until', () => {
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
t.test('_expand in VpcLineCategory.built in command', () => {
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
t.test('_expand in VpcLineCategory.GoCardImpl', () => {
    h.provideCustomFnInStackScript();
    let batch: [string, string][] = [
        ['global countCalls\\0', '0'],
        /* go to card */
        [
            `
put 0 into countCalls
go to card myMult(1,1)
put the short id of this cd is the short id of card 1 into ret
\\ret && countCalls`,
            'true 1'
        ],
        [
            `
put 0 into countCalls
go to card (1 + myMult(1,1))
put the short id of this cd is the short id of card 2 into ret
\\ret && countCalls`,
            'true 1'
        ],
        [
            `
put 0 into countCalls
go to card myMult(1,3)
put the short id of this cd is the short id of card 3 into ret
\\ret && countCalls`,
            'true 1'
        ],
        [
            `
put 0 into countCalls
go to card (myMult(3,1) + myMult(1,1))
put the short id of this cd is the short id of card 4 into ret
\\ret && countCalls`,
            'true 2'
        ]
    ];
    h.testBatchEvaluate(batch);
});
t.test('_expand in VpcLineCategory.CallDynamic', () => {
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
t.test('_expand in VpcLineCategory.CallHandler', () => {
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

class TestVpcScriptRunCustomFns extends TestVpcScriptRunBase {
    /**
     * check that the preparsed/rewritten code is as expected
     */
    compareRewrittenCode(script: string, expected: string) {
        checkThrow(false, "nyi")
        //~ let btnGo = h.vcstate.model.getById(VpcElButton, h.elIds.btn_go);
        //~ h.vcstate.vci.undoableAction(() => btnGo.set('script', script.trim()));
        //~ let transformedCode = h.vcstate.vci
            //~ .getCodeExec()
            //~ .getCompiledScript(btnGo.id, btnGo.getS('script')) as VpcCodeOfOneVel;

        //~ let got = transformedCode.lines.map(o => o.allImages ?? VpcLineCategory[o.ctg]);
        //~ got = got.map(o => o.replace(/\n/g, 'syntaxmarker'));
        //~ let exp = expected
            //~ .trim()
            //~ .split('\n')
            //~ .map(s => s.trim());
        //~ if (util512Sort(exp, got) !== 0) {
            //~ console.log('\ncontext\n\n', script);
            //~ t.warnAndAllowToContinue(
                //~ '\nexpected\n',
                //~ exp.join('\n'),
                //~ '\nbut got\n',
                //~ got.join('\n'),
                //~ '\n\n'
            //~ );
        //~ }
    }

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