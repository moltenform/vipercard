
/* auto */ import { CountNumericIdNormal } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { VpcParsedCodeCollection } from './../../vpc/codepreparse/vpcTopPreparse';
/* auto */ import { BuildFakeTokens } from './../../vpc/codeparse/vpcTokens';
/* auto */ import { VpcCacheParsedAST } from './../../vpc/codeexec/vpcScriptCaches';
/* auto */ import { VpcLineCategory } from './../../vpc/codepreparse/vpcPreparseCommon';
/* auto */ import { checkThrow } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, getEnumToStrOrFallback, util512Sort } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper, assertAsserts } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * test rewrites/preparse
 */
let t = new SimpleUtil512TestCollection('testCollectionScriptRewrites');
export let testCollectionScriptRewrites = t;

interface IVpcCacheParsedASTForTest {
    compareRewrittenCode(script: string, expected: string): void;
}

let h = YetToBeDefinedTestHelper<IVpcCacheParsedASTForTest>();

t.test('--init--testCollectionScriptRewrites', () => {
    h = new VpcCacheParsedASTForTest();
});

t.test('testcompareRewrittenCodeHelper', () => {
    /* correct results */
    let inp = `if 0 is 1 then\nb\nend if`;
    let expected = `if~0~is~1~then~\nb~\nIfEnd`;
    h.compareRewrittenCode(inp, expected);
    /* wrong results */
    assertAsserts('R2|', 'but got', () => {
        inp = `if 0 is 1 then\nb\nend if`;
        expected = `if~0~is~2~then~\nb~\nIfEnd`;
        h.compareRewrittenCode(inp, expected);
    });
    /* compile error */
    assertAsserts('R1|', 'unexpected err', () => {
        let inp = `b\nend if`;
        let expected = `b~\nIfEnd`;
        h.compareRewrittenCode(inp, expected);
    });
    /* compile error with wrong err message */
    assertAsserts('R0|', 'wrong err message', () => {
        let inp = `b\nend if`;
        h.compareRewrittenCode(inp, 'ERR:(incorrect message)');
    });
    /* works when we said it should fail */
    assertAsserts('Q~|', 'expected an err', () => {
        let inp = `if 0 is 1 then\nb\nend if`;
        h.compareRewrittenCode(inp, 'ERR:');
    });
});
t.test('rewrites-empty lines are ok', () => {
    let inp = `
        code1


        code2`;
    let expected = `
    code1~
    code2~`;
    h.compareRewrittenCode(inp, expected);
    inp = `
        code1 -- a comment here
        -- comment.
        code2

        `;
    expected = `
    code1~
    code2~`;
    h.compareRewrittenCode(inp, expected);
    inp = `
        code1 -- a comment here
        -- comment.
\t\t
        code2\t\t

        `;
    expected = `
    code1~
    code2~`;
    h.compareRewrittenCode(inp, expected);
});
t.test('rewrites-make lowercase', () => {
    let inp = `put aBcDe into TheVar`;
    let expected = `put~abcde~^^~into~^^~thevar~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put "aBcDe" into TheVar`;
    expected = `put~"aBcDe"~^^~into~^^~thevar~`;
    h.compareRewrittenCode(inp, expected);
    inp = `PUT aBcDe INTO THEVAR`;
    expected = `put~abcde~^^~into~^^~thevar~`;
    h.compareRewrittenCode(inp, expected);
});
t.test('rewrites-cd and bg part', () => {
    t.say(/*——————————*/ 'number of should be unaffected');
    let inp = `put the number of btns into x`;
    let expected = `put~the~number~of~btns~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put the number of flds into x`;
    expected = `put~the~number~of~flds~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put the number of cd btns into x`;
    expected = `put~the~number~of~cd~btns~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put the number of cd flds into x`;
    expected = `put~the~number~of~cd~flds~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    t.say(/*——————————*/ 'btn-insert it if needed');
    inp = `put btn 1 into x`;
    expected = `put~cd~btn~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put button 1 into x`;
    expected = `put~cd~button~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put cd button 1 into x`;
    expected = `put~cd~button~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put card button 1 into x`;
    expected = `put~card~button~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put bg button 1 into x`;
    expected = `put~bg~button~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put background button 1 into x`;
    expected = `put~background~button~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put there is a btn 1 into x`;
    expected = `put~there~is~a~cd~btn~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put there is a button 1 into x`;
    expected = `put~there~is~a~cd~button~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put 1 > btn 1 into x`;
    expected = `put~1~>~cd~btn~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    t.say(/*——————————*/ 'btn-insert it if needed');
    inp = `put fld 1 into x`;
    expected = `put~bg~fld~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put field 1 into x`;
    expected = `put~bg~field~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put cd field 1 into x`;
    expected = `put~cd~field~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put card field 1 into x`;
    expected = `put~card~field~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put bg field 1 into x`;
    expected = `put~bg~field~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put background field 1 into x`;
    expected = `put~background~field~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put there is a fld 1 into x`;
    expected = `put~there~is~a~bg~fld~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put there is a field 1 into x`;
    expected = `put~there~is~a~bg~field~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
    inp = `put 1 > fld 1 into x`;
    expected = `put~1~>~bg~fld~1~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);
});
t.test('rewrites-synonyms', () => {
    let inp = `mycode the rect of cd btn 1`;
    let exp = `mycode~the~rectangle~of~cd~btn~1~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the rectangle of cd btn 1`;
    exp = `mycode~the~rectangle~of~cd~btn~1~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the hilight of cd btn 1`;
    exp = `mycode~the~hilite~of~cd~btn~1~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the highlight of cd btn 1`;
    exp = `mycode~the~hilite~of~cd~btn~1~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the hilite of cd btn 1`;
    exp = `mycode~the~hilite~of~cd~btn~1~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the loc of cd btn 1`;
    exp = `mycode~the~location~of~cd~btn~1~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the itemdel`;
    exp = `mycode~the~itemdel~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the itemdelimiter`;
    exp = `mycode~the~itemdelimiter~`;
    h.compareRewrittenCode(inp, exp);
});
t.test('rewrites-date', () => {
    let inp = `mycode the long date`;
    let exp = `mycode~the~long~date~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the short date`;
    exp = `mycode~the~short~date~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the English date`;
    exp = `mycode~the~long~date~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the english date`;
    exp = `mycode~the~long~date~`;
    h.compareRewrittenCode(inp, exp);
    inp = `mycode the ENGLISH date of x`;
    exp = `mycode~the~long~date~of~x~`;
    h.compareRewrittenCode(inp, exp);
});
t.test('expand if + if else', () => {
    let inp = `
test001
if 0 is 1 then
    code1
end if`;
    let expected = `
test001~
if~0~is~1~then~
    code1~
IfEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
test002
if 0 is 1 then
    code1
else
    code2
end if`;
    expected = `
test002~
if~0~is~1~then~
    code1~
IfElsePlain
    code2~
IfEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
test003
if 0 is 1 then
    code1
else if 0 is 2 then
    code2
else if 0 is 3 then
    code3
else
    code4
end if`;
    expected = `
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
IfEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
test004
if 0 is 1 then
    code1
else if 0 is 2 then
    code2
else if 0 is 3 then
    code3
else if 0 is 4 then
    code4
end if`;
    expected = `
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
IfEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
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
end if`;
    expected = `
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
IfEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
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
end if`;
    expected = `
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
IfEnd`;
    h.compareRewrittenCode(inp, expected);

    inp = `
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
end if`;
    expected = `
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
IfEnd`;
    h.compareRewrittenCode(inp, expected);
});
t.test('expand single-line if and else-if', () => {
    let inp = `
if x > 1 then c1`;
    let expected = `
if~x~>~1~then~
    c1~
IfEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
if x > 1 then c1
if x > 2 then c2`;
    expected = `
if~x~>~1~then~
    c1~
IfEnd
if~x~>~2~then~
    c2~
IfEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
if x > 1 then c1
if x > 2 then c2
if x > 3 then c3`;
    expected = `
if~x~>~1~then~
    c1~
IfEnd
if~x~>~2~then~
    c2~
IfEnd
if~x~>~3~then~
    c3~
IfEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
if x > 1 then
    if x > 2 then c2
end if`;
    expected = `
if~x~>~1~then~
    if~x~>~2~then~
        c2~
    IfEnd
IfEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
if x > 1 then c1
c2`;
    expected = `
if~x~>~1~then~
    c1~
IfEnd
c2~
`;
    h.compareRewrittenCode(inp, expected);

    /* two lines */
    expected = `
if~x~>~1~then~
    c1~
IfElsePlain
    c2~
IfEnd
`;
    inp = `
if x > 1 then c1
else c2`;
    h.compareRewrittenCode(inp, expected);
    inp = `
if x > 1 then
    c1
else c2`;
    h.compareRewrittenCode(inp, expected);
    inp = `
if x > 1 then
    c1
else if c2 then`;
    h.compareRewrittenCode(inp, 'ERR:interleaved');
    inp = `
if x > 1 then c1
else
    c2
end if`;
    h.compareRewrittenCode(inp, expected);
    inp = `
if x > 1 then
    c1
else
    c2
end if`;
    h.compareRewrittenCode(inp, expected);

    /* three lines */
    expected = `
if~x~>~1~then~
    c1~
IfElsePlain
    if~x~>~2~then~
        c2~
    IfElsePlain
        c3~
    IfEnd
IfEnd
`;
    /* explicitly check for else then*/
    inp = `
if x > 1 then c1
else if x > 2 then c2
else then c3`;
    h.compareRewrittenCode(inp, "ERR:not 'else then");
    inp = `
if x > 1 then c1
else if x > 2 then c2
else c3`;
    h.compareRewrittenCode(inp, expected);
    inp = `
if x > 1 then
    c1
else if x > 2 then c2
else c3`;
    h.compareRewrittenCode(inp, expected);
    inp = `
if x > 1 then
    c1
else if x > 2 then
    c2
else c3`;
    h.compareRewrittenCode(inp, expected);
    inp = `
if x > 1 then c1
else if x > 2 then c2
else
    c3
end if`;
    h.compareRewrittenCode(inp, expected);
    inp = `
if x > 1 then
    c1
else if x > 2 then c2
else
    c3
end if`;
    h.compareRewrittenCode(inp, expected);

    /* if a plain else, must end the single line! */
    inp = `
if x > 0 then
    if x > 1 then c1
    else c2
else c3`;
    expected = `
if~x~>~0~then~
    if~x~>~1~then~
        c1~
    IfElsePlain
        c2~
    IfEnd
IfElsePlain
    c3~
IfEnd
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
if x > 0 then
    if x > 1 then c1
    else c2
else if x > 3 then
    c3
end if`;
    expected = `
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
`;
    h.compareRewrittenCode(inp, expected);
    inp = `
if x > 0 then
    if x > 1 then c1
    else c2
else if x > 3 then c3`;
    expected = `
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
`;
    h.compareRewrittenCode(inp, expected);

    inp = `
if x > 0 then
    if x > 1 then c1
    else if x > 2 then c2
    else
        c3
    end if
else
    c10
end if`;
    expected = `
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
`;
    h.compareRewrittenCode(inp, expected);
    inp = `
if x > 0 then
    if x > 1 then c1
    else if x > 2 then c2
    else c3
else
    c10
end if`;
    expected = `
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
`;
    h.compareRewrittenCode(inp, expected);
});
t.test('put into message box', () => {
    let inp = `put "abc"`;
    let expected = `    put~"abc"~^^~into~^^~msg~box~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "abc"
put "def"`;
    expected = `    put~"abc"~^^~into~^^~msg~box~
    put~"def"~^^~into~^^~msg~box~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "a" & "b" & "c"`;
    expected = `    put~"a"~&~"b"~&~"c"~^^~into~^^~msg~box~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "a" & "b into c"`;
    expected = `put~"a"~&~"b into c"~^^~into~^^~msg~box~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "abc" into x`;
    expected = `    put~"abc"~^^~into~^^~x~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "abc" into msgbox`;
    expected = `put~"abc"~^^~into~^^~msgbox~`;
    h.compareRewrittenCode(inp, expected);

    inp = `add 1 to the msg box`;
    expected = `add~1~to~the~msg~box~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "abc" into msg boxb`;
    expected = `put~"abc"~^^~into~^^~msg~boxb~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "abc" into bmsg box`;
    expected = `put~"abc"~^^~into~^^~bmsg~box~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "abc" into msg box`;
    expected = `put~"abc"~^^~into~^^~msg~box~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "abc" into msg box
put "def" into msg box`;
    expected = `put~"abc"~^^~into~^^~msg~box~
put~"def"~^^~into~^^~msg~box~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "abc" into the msg boxb`;
    expected = `    put~"abc"~^^~into~^^~the~msg~boxb~`;
    h.compareRewrittenCode(inp, expected);

    inp = `put "abc" into xthe msg box`;
    expected = `put~"abc"~^^~into~^^~xthe~msg~box~`;
    h.compareRewrittenCode(inp, expected);

    inp = `
put "abc" into the msg box`;
    expected = `put~"abc"~^^~into~^^~the~msg~box~`;
    h.compareRewrittenCode(inp, expected);
});

/**
 * test helpers for comparing rewritten code
 */
class VpcCacheParsedASTForTest extends VpcCacheParsedAST {
    constructor() {
        super(new CountNumericIdNormal(1));
    }

    /**
     * check that the preparsed/rewritten code is as expected
     */
    compareRewrittenCode(script: string, expected: string) {
        script = script.trim();
        expected = expected.trim();
        if (!script.startsWith('on ')) {
            script = 'on myCode\n' + script + '\nend myCode';
            if (!expected.startsWith('ERR:')) {
                expected = 'HandlerStart\n' + expected + '\nHandlerEnd';
            }
        }

        let transformedCode: O<VpcParsedCodeCollection>;
        let err: O<Error>;
        try {
            transformedCode = this.getParsedCodeCollectionOrThrow(script, 'unknown-vel');
        } catch (e) {
            /* catch the errors here,
            otherwise the error site will be far away and hard to correlate
            with which test actually failed. */
            err = e;
        }

        if (err) {
            if (expected.startsWith('ERR:')) {
                expected = expected.slice('ERR:'.length);
                assertWarn(err.message.includes(expected), 'Q}|wrong err message');
            } else {
                assertWarn(false, 'Q||unexpected err', err.message);
            }

            return;
        } else if (expected.startsWith('ERR:')) {
            assertWarn(false, 'Q{|expected an error but succeeded');
            return;
        }

        checkThrow(transformedCode instanceof VpcParsedCodeCollection, 'Q_|preparse failed');
        let reSyntaxMark = new RegExp(
            Util512.escapeForRegex(BuildFakeTokens.inst.strSyntaxMark),
            'g'
        );
        let got = transformedCode.lines.map(
            o => o.allImages ?? getEnumToStrOrFallback(VpcLineCategory, o.ctg)
        );
        got = got.map(o => o.replace(reSyntaxMark, '^^'));
        let exp = expected.split('\n').map(s => s.trim());

        if (util512Sort(exp, got) !== 0) {
            assertWarn(
                false,
                `Q^|\nexpected\n${exp.join('\n')}\nbut got,\n'${got.join(
                    '\n'
                )}\n\n'\ncontext\n\n`,
                script
            );
        }
    }
}
