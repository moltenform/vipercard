
/* auto */ import { VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { ScriptTestBatch } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { h3 } from './test03lexer';


/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03exprPseudoObjects');
export let testCollection03exprPseudoObjects = t;

t.atest('--init--testCollection03exprPseudoObject', async () => {
    assertTrue(
        h3,
        longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`)
    );
});
t.test('03exprObjectInterpretedFromString', () => {
    h3.pr.setCurCardNoOpenCardEvt(h3.ids.cdBC)
    let svdMethod = h3.pr.getSelectedFieldVel
    h3.pr.getSelectedFieldVel = () => h3.vcstate.model.getById(VpcElField, h3.ids.fBC1)
    
    let b = new ScriptTestBatch();
    /* HUnaryPropertyGet */
    b.t(`put "cd btn id ${h3.ids.go}" into x\\the short id of the owner of x`, `${h3.ids.cdA}`)
    /* tkStringLiteral */
    b.t(`the short id of "cd btn id ${h3.ids.bBC1}"`, `${h3.ids.bBC1}`)
    /* HAnyAllowedVariableName 1 */
    b.t(`put "cd btn id ${h3.ids.bDE1}" into x\\the short id of x`, `${h3.ids.bDE1}`)
    /* HAnyAllowedVariableName 2 */
    b.t(`put "cd btn id ${h3.ids.bDE1}" into a\\the short id of a`, `${h3.ids.bDE1}`)
    /* _target 1 */
    b.t(`the short id of target`, `${h3.ids.go}`)
    /* HOldStyleFnNullaryOrNullaryPropGet or _target 2 */
    b.t(`the short id of the target`, `${h3.ids.go}`)
    /* parens 1 */
    b.t(`the short id of ("cd btn id ${h3.ids.bBC1}")`, `${h3.ids.bBC1}`)
    /* parens 2 */
    b.t(`the short id of ("cd" && "btn id" && ${h3.ids.bBC1})`, `${h3.ids.bBC1}`)
    /* parens 3 */
    b.t(`put "cd btn id ${h3.ids.go}" into x\\the short id of (the owner of x)`, `${h3.ids.cdA}`)
    //~ todo: difference between target and the target, see internaldocs
    //~ need bg support to fully test it
    b.batchEvaluate(h3);
    h3.pr.getSelectedFieldVel = svdMethod
});
t.test('03exprPseudoObject me and target', () => {
    //~ todo: make this line up with original product
    /*
    do is not the same as send to me, 1) gets local vars 2) might change target
    "DO": does not change either ME or TARGET
    "SEND": me is what owns the current code-- so if it's a function
    in somewhere else, me is that, but if it's just the plain code,
    me is the sender. same for target.
    DEFAULT: target is from original event, me is what's running script
    */
    h3.pr.setCurCardNoOpenCardEvt(h3.ids.cdBC)
    let expecteds = [longstr(`s${h3.ids.bBC2}t${h3.ids.bBC2}t${h3.ids.bBC2}m${h3.ids.bBC2}
    s${h3.ids.cdBC}t${h3.ids.bBC2}t${h3.ids.bBC2}m${h3.ids.cdBC}
    s${h3.ids.stack}t${h3.ids.bBC2}t${h3.ids.bBC2}m${h3.ids.stack},
    s${h3.ids.bBC2}t${h3.ids.bBC2}t${h3.ids.bBC2}m${h3.ids.bBC2}
    s${h3.ids.cdBC}t${h3.ids.bBC2}t${h3.ids.bBC2}m${h3.ids.cdBC}
    s${h3.ids.stack}t${h3.ids.bBC2}t${h3.ids.bBC2}m${h3.ids.stack},
    T${h3.ids.bBC2}t${h3.ids.bBC2}M${h3.ids.bBC2},T${h3.ids.bBC2}t${h3.ids.bBC2}M${h3.ids.bBC2}
    s${h3.ids.cdBC}t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.cdBC}
    s${h3.ids.stack}t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.stack}
    s${h3.ids.bDE1}t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.bDE1}
    s${h3.ids.cdDE}t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.cdDE}
    s${h3.ids.stack}t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.stack}
    s${h3.ids.cdDE}t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.cdDE}
    s${h3.ids.stack}t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.stack}`),
    longstr(`s${h3.ids.cdBC}t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.cdBC} s${h3.ids.stack}
    t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.stack}, s${h3.ids.cdBC}
    t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.cdBC} s${h3.ids.stack}
    t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.stack},T${h3.ids.cdBC}t${h3.ids.cdBC}M${h3.ids.cdBC},
    T${h3.ids.cdBC}t${h3.ids.cdBC}M${h3.ids.cdBC} s${h3.ids.bDE1}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.bDE1} s${h3.ids.cdDE}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.cdDE} s${h3.ids.stack}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.stack} s${h3.ids.cdDE}
    t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.cdDE} s${h3.ids.stack}
    t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.stack}`, ''),
    longstr(`s${h3.ids.bDE1}t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.bDE1} s${h3.ids.cdDE}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.cdDE} s${h3.ids.stack}t${h3.ids.bDE1}t${h3.ids.bDE1}
    m${h3.ids.stack}, s${h3.ids.bDE1}t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.bDE1} s${h3.ids.cdDE}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.cdDE} s${h3.ids.stack}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.stack},T${h3.ids.bDE1}
    t${h3.ids.bDE1}M${h3.ids.bDE1},T${h3.ids.bDE1}t${h3.ids.bDE1}
    M${h3.ids.bDE1} s${h3.ids.cdBC}t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.cdBC} s${h3.ids.stack}
    t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.stack} s${h3.ids.cdDE}
    t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.cdDE} s${h3.ids.stack}
    t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.stack}`, ''),
    longstr(`s${h3.ids.cdDE}t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.cdDE} s${h3.ids.stack}
    t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.stack}, s${h3.ids.cdDE}
    t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.cdDE} s${h3.ids.stack}
    t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.stack},T${h3.ids.cdDE}t${h3.ids.cdDE}M${h3.ids.cdDE},
    T${h3.ids.cdDE}t${h3.ids.cdDE}M${h3.ids.cdDE} s${h3.ids.cdBC}
    t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.cdBC} s${h3.ids.stack}
    t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.stack} s${h3.ids.bDE1}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.bDE1} s${h3.ids.cdDE}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.cdDE} s${h3.ids.stack}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.stack}`),
    longstr(`s${h3.ids.stack}t${h3.ids.stack}t${h3.ids.stack}m${h3.ids.stack}, s${h3.ids.stack}
    t${h3.ids.stack}t${h3.ids.stack}m${h3.ids.stack},
    T${h3.ids.stack}t${h3.ids.stack}M${h3.ids.stack},
    T${h3.ids.stack}t${h3.ids.stack}M${h3.ids.stack} s${h3.ids.cdBC}
    t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.cdBC} s${h3.ids.stack}
    t${h3.ids.cdBC}t${h3.ids.cdBC}m${h3.ids.stack} s${h3.ids.bDE1}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.bDE1} s${h3.ids.cdDE}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.cdDE} s${h3.ids.stack}
    t${h3.ids.bDE1}t${h3.ids.bDE1}m${h3.ids.stack} s${h3.ids.cdDE}
    t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.cdDE} s${h3.ids.stack}
    t${h3.ids.cdDE}t${h3.ids.cdDE}m${h3.ids.stack}`, ''),]
    let targetIds = [h3.ids.bBC2, h3.ids.cdBC, h3.ids.bDE1, h3.ids.cdDE, h3.ids.stack]
    for (let i=0; i<targetIds.length; i++) {
        let expected = expecteds[i]
        let targetId = targetIds[i]
        for (let tid of targetIds) {
            let vel = h3.vcstate.model.getByIdUntyped(tid)
            h3.setScript(vel.idInternal,  `on myHandler
global d1
put " s" & ${tid} & "t" & the short id of the target &"t"& the short id of target & "m" & the short id of me after d1
pass myHandler
end myHandler`)
        }
        let vel = h3.vcstate.model.getByIdUntyped(targetId)
        let codeIn = `
global d1
put "" into d1
myHandler
put "," after d1
do "myHandler"
put "," after d1
put "global d1" & cr & "put 'T' & the short id of the target &'t'& the short id of target & 'M' & the short id of me after d1" into theCode
replace "'" with quote in theCode
send theCode to me
put "," after d1
do theCode`
if (targetId !== h3.ids.cdBC) { codeIn += `\nsend "myHandler" to cd id ${h3.ids.cdBC}` }
if (targetId !== h3.ids.bDE1) { codeIn += `\nsend "myHandler" to cd btn id ${h3.ids.bDE1}` }
if (targetId !== h3.ids.cdDE) { codeIn += `\nsend "myHandler" to cd id ${h3.ids.cdDE}` }

        let codeBefore =  vel.getS('script') 
        h3.runGeneralCode(codeBefore, codeIn, undefined, undefined, undefined, undefined, targetId)
        let got = h3.vcstate.vci.getCodeExec().globals.get('d1').readAsString()
        if (expected.replace(/ /g, '') !== got.replace(/ /g, '')) {
            console.log(i, "expected:", expected)
            console.log("got:", got)
        }
    }

    /* reset scripts */
    for (let tid of targetIds) {
        h3.setScript(tid, '')
    }

});

