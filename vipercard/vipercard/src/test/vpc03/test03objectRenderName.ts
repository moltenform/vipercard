
/* auto */ import { ScriptTestBatch, TestMultiplier } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { O, cAltProductName, cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { h3 } from './test03lexer';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03objectRenderName');
export let testCollection03objectRenderName = t;

t.atest('--init--testCollection03objectRenderName', async () => {
    assertTrue(
        h3,
        longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`)
    );
});
t.test('03objectRenderName product', () => {
    let b = new ScriptTestBatch();
    b.t('the name of ViperCard', `${cProductName}`)
    b.t('the name of HyperCard', `${cProductName}`)
    b.t('the short name of ViperCard', `${cProductName}`)
    b.t('the short name of HyperCard', `${cProductName}`)
    b.t('the long name of ViperCard', `Hard Drive:${cProductName}`)
    b.batchEvaluate(h3);
});
t.test('03objectRenderName stack', () => {
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('name', 'stname', h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t('the name of this stack', 'stack "stname"')
    b.t('the short name of this stack', 'stname')
    b.t('the long name of this stack', 'stack "Hard Drive:stname"')
    b.batchEvaluate(h3);
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('name', '', h3.vcstate.model)
    );
    b = new ScriptTestBatch();
    b.t('the name of this stack', 'stack ""')
    b.t('the short name of this stack', '')
    b.t('the long name of this stack', 'stack "Hard Drive:"')
    b.batchEvaluate(h3);
});
t.test('03objectRenderName bg', () => {
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.bgs[1].setOnVel('name', '', h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t('the name of bg 2', `bkgnd id ${h3.ids.bgB}`)
    b.t('the short name of bg 2', `bkgnd id ${h3.ids.bgB}`)
    b.t('the long name of bg 2', `bkgnd id ${h3.ids.bgB} of stack ""`)
    b.batchEvaluate(h3);
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.bgs[1].setOnVel('name', 'b', h3.vcstate.model)
    );
    b = new ScriptTestBatch();
    b.t('the name of bg 2', `bkgnd "b"`)
    b.t('the short name of bg 2', `b`)
    b.t('the long name of bg 2', `bkgnd "b" of stack ""`)
    b.batchEvaluate(h3);
})
t.test('03objectRenderName card', () => {
    let cdBC = h3.vcstate.model.getCardById(h3.ids.cdBC)
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        cdBC.setOnVel('name', '', h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t(`the name of cd id ${h3.ids.cdBC}`, `card id ${h3.ids.cdBC}`)
    b.t(`the short name of cd id ${h3.ids.cdBC}`, `card id ${h3.ids.cdBC}`)
    b.t(`the long name of cd id ${h3.ids.cdBC}`, `card id ${h3.ids.cdBC} of stack ""`)
    b.batchEvaluate(h3);
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        cdBC.setOnVel('name', 'c', h3.vcstate.model)
    );
    b = new ScriptTestBatch();
    b.t(`the name of cd id ${h3.ids.cdBC}`, `card "c"`)
    b.t(`the short name of cd id ${h3.ids.cdBC}`, `c`)
    b.t(`the long name of cd id ${h3.ids.cdBC}`, `card "c" of stack ""`)
    b.batchEvaluate(h3);
})
t.test('03objectRenderName button', () => {
    let p = h3.vcstate.model.getById(VpcElButton, h3.ids.bBC1)
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        p.setOnVel('name', '', h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t(`the name of cd btn id ${h3.ids.bBC1}`, `card button id ${h3.ids.bBC1}`)
    b.t(`the short name of cd btn id ${h3.ids.bBC1}`, `card button id ${h3.ids.bBC1}`)
    b.t(`the long name of cd btn id ${h3.ids.bBC1}`, `card button id ${h3.ids.bBC1} of card "c" of stack ""`)
    b.batchEvaluate(h3);
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        p.setOnVel('name', 'p1', h3.vcstate.model)
    );
    b = new ScriptTestBatch();
    b.t(`the name of cd btn id ${h3.ids.bBC1}`, `card button "p1"`)
    b.t(`the short name of cd btn id ${h3.ids.bBC1}`, `p1`)
    b.t(`the long name of cd btn id ${h3.ids.bBC1}`, `card button "p1" of card "c" of stack ""`)
    b.batchEvaluate(h3);
})
t.test('03objectRenderName field', () => {
    let p = h3.vcstate.model.getById(VpcElField, h3.ids.fBC1)
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        p.setOnVel('name', '', h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t(`the name of cd fld id ${h3.ids.fBC1}`, `card field id ${h3.ids.fBC1}`)
    b.t(`the short name of cd fld id ${h3.ids.fBC1}`, `card field id ${h3.ids.fBC1}`)
    b.t(`the long name of cd fld id ${h3.ids.fBC1}`, `card field id ${h3.ids.fBC1} of card "c" of stack ""`)
    b.batchEvaluate(h3);
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        p.setOnVel('name', 'p1', h3.vcstate.model)
    );
    b = new ScriptTestBatch();
    b.t(`the name of cd fld id ${h3.ids.fBC1}`, `card field "p1"`)
    b.t(`the short name of cd fld id ${h3.ids.fBC1}`, `p1`)
    b.t(`the long name of cd fld id ${h3.ids.fBC1}`, `card field "p1" of card "c" of stack ""`)
    b.batchEvaluate(h3);
})
t.test('03objectRenderID product', () => {
    let b = new ScriptTestBatch();
    b.t('the id of ViperCard', `WILD`)
    b.t('the id of HyperCard', `WILD`)
    b.t('the short id of ViperCard', `WILD`)
    b.t('the short id of HyperCard', `WILD`)
    b.t('the long id of ViperCard', `WILD`)
    b.batchEvaluate(h3);
});
t.test('03objectRenderID stack', () => {
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', true, h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t('the id of this stack', `${h3.ids.stack}`)
    b.t('the short id of this stack', `${h3.ids.stack}`)
    b.t('the long id of this stack', `${h3.ids.stack}`)
    b.batchEvaluate(h3);
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', false, h3.vcstate.model)
    );
    b = new ScriptTestBatch();
    b.t('the id of this stack', `stack id ${h3.ids.stack}`)
    b.t('the short id of this stack', `${h3.ids.stack}`)
    b.t('the long id of this stack', `stack id ${h3.ids.stack}`)
    b.batchEvaluate(h3);
});
t.test('03objectRenderID bg', () => {
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', true, h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t('the id of bg 2', `${h3.ids.bgB}`)
    b.t('the short id of bg 2', `${h3.ids.bgB}`)
    b.t('the long id of bg 2', `${h3.ids.bgB}`)
    b.batchEvaluate(h3);
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', false, h3.vcstate.model)
    );
    b = new ScriptTestBatch();
    b.t('the id of bg 2', `bkgnd id ${h3.ids.bgB}`)
    b.t('the short id of bg 2', `${h3.ids.bgB}`)
    b.t('the long id of bg 2', `bkgnd id ${h3.ids.bgB}`)
    b.batchEvaluate(h3);
})
t.test('03objectRenderID card', () => {
    /* this one stays the same regardless of compatmode */
    for (let compat of [true, false]) {
        h3.vcstate.vci.doWithoutAbilityToUndo(() =>
            h3.vcstate.model.stack.setOnVel('compatibilitymode', compat, h3.vcstate.model)
        );
        let b = new ScriptTestBatch();
        b.t(`the id of cd id ${h3.ids.cdBC}`, `card id ${h3.ids.cdBC}`)
        b.t(`the short id of cd id ${h3.ids.cdBC}`, `${h3.ids.cdBC}`)
        b.t(`the long id of cd id ${h3.ids.cdBC}`, `card id ${h3.ids.cdBC} of stack "Hard Drive:"`)
        b.batchEvaluate(h3);
    }
})
t.test('03objectRenderID button', () => {
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', true, h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t(`the id of cd btn id ${h3.ids.bBC1}`, `${h3.ids.bBC1}`)
    b.t(`the short id of cd btn id ${h3.ids.bBC1}`, `${h3.ids.bBC1}`)
    b.t(`the long id of cd btn id ${h3.ids.bBC1}`, `${h3.ids.bBC1}`)
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', false, h3.vcstate.model)
    );
    b = new ScriptTestBatch();
    b.t(`the id of cd btn id ${h3.ids.bBC1}`, `card button id ${h3.ids.bBC1}`)
    b.t(`the short id of cd btn id ${h3.ids.bBC1}`, `${h3.ids.bBC1}`)
    b.t(`the long id of cd btn id ${h3.ids.bBC1}`, `card button id ${h3.ids.bBC1}`)
    b.batchEvaluate(h3);
})
t.test('03objectRenderID field', () => {
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', true, h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t(`the id of cd fld id ${h3.ids.fBC1}`, `${h3.ids.fBC1}`)
    b.t(`the short id of cd fld id ${h3.ids.fBC1}`, `${h3.ids.fBC1}`)
    b.t(`the long id of cd fld id ${h3.ids.fBC1}`, `${h3.ids.fBC1}`)
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', false, h3.vcstate.model)
    );
    b = new ScriptTestBatch();
    b.t(`the id of cd fld id ${h3.ids.fBC1}`, `card field id ${h3.ids.fBC1}`)
    b.t(`the short id of cd fld id ${h3.ids.fBC1}`, `${h3.ids.fBC1}`)
    b.t(`the long id of cd fld id ${h3.ids.fBC1}`, `card field id ${h3.ids.fBC1}`)
    b.batchEvaluate(h3);
})
/**
 * VelRenderId.parseFromString is similar to resolve-reference,
 * but does string manipulation instead. it's used when interpreting a string as an object.
 */
t.test('VelRenderId.parseFromString product (not supported)', () => {
    let b = new ScriptTestBatch();
    b.t(`"${cProductName}"\\the short id of x`, `ERR:fff`)
    b.t(`"${cAltProductName}"\\the short id of x`, `ERR:fff`)
    b.t(`"target"\\the short id of x`, `ERR:fff`)
    b.t(`"me"\\the short id of x`, `ERR:fff`)
    b.t(`"product"\\the short id of x`, `ERR:fff`)
    b.batchEvaluate(h3, [DoParseFromStringTest]);
})
t.test('VelRenderId.parseFromString stack', () => {
    let b = new ScriptTestBatch();
    b.t(`"stack id ${h3.ids.stack}"\\the short id of x`, `${h3.ids.stack}`)
    b.t(`"stack id 99"\\the short id of x`, `ERR:could not find`)
    b.t(`"this stack"\\the short id of x`, `${h3.ids.stack}`)
    b.t(`"next stack"\\the short id of x`, `ERR:could not find`)
    b.t(`"prev stack"\\the short id of x`, `ERR:could not find`)
    b.t(`"first stack"\\the short id of x`, `ERR:could not find`)
    b.t(`"stack 1"\\the short id of x`, `${h3.ids.stack}`)
    b.t(`"stack 2"\\the short id of x`, `ERR:could not find`)
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('name', 'stname', h3.vcstate.model)
    );
    b.t(`"stack ''"\\the short id of x`, `${h3.ids.stack}`)
    b.t(`"stack 'Hard Drive:'"\\the short id of x`, `${h3.ids.stack}`)
    b.t(`"stack 'other'"\\the short id of x`, `ERR:could not find`)
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('name', '', h3.vcstate.model)
    );
    b.t(`"stack ''"\\the short id of x`, `${h3.ids.stack}`)
    b.t(`"stack 'Hard Drive:'"\\the short id of x`, `${h3.ids.stack}`)
    b.t(`"stack 'other'"\\the short id of x`, `ERR:could not find`)
    b.batchEvaluate(h3, [DoParseFromStringTest]);
})

/**
 * transform it from 
 * "this stack"
 * to
 * put "this stack" into x
 * 
 * and from
 * "stack 'name'"
 * to
 * put "stack "&quote&"name"&quote&"" into x
 */
class DoParseFromStringTest extends TestMultiplier {
    firstTransformation(code: string, expected: string): O<[string, string]> {
        let pts = code.split('\\')
        if (pts.length) {
            pts[0] = pts[0].replace(/'/g, '"&quote&"')
            pts[0] = 'put ' + pts[0] + ' into x'
            return [pts.join('\\'), expected]
        } else {
            return [code, expected]
        }
    }
}
