
/* auto */ import { Util512, assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { getUI512WindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512TestBase, assertThrows } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { largeArea, specialCharFontChange } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ElementObserverNoOp } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { GridLayout, UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { UI512Lines } from '../../ui512/textedit/ui512TextLines.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcTextFieldAsGeneric } from '../../vpcui/modelrender/vpcModelRender.js';

/**
 * testing UI512Elements
 */
let mTests: (string | Function)[] = [
    'testUI512ElGroupIterEls',
    () => {
        let [app, grp] = makeFakeGroup();

        /* iterate through elements in a group */
        let s = '';
        for (let el of grp.iterEls()) {
            s += el.id + ',';
        }

        assertEq('btn1,btn2,btn3,', s, '');

        /* iterate through elements in a group, in reverse order */
        s = '';
        for (let el of grp.iterElsReversed()) {
            s += el.id + ',';
        }

        assertEq('btn3,btn2,btn1,', s, '');
    },
    'testUI512ElGroupRemoveAllEls',
    () => {
        let [app, grp] = makeFakeGroup();
        assertEq('btn1,btn2,btn3,', listElems(grp), '');

        /* remove all elements */
        grp.removeAllEls();
        assertEq('', listElems(grp), '');
    },
    'testUI512ElGroupCountElems',
    () => {
        let [app, grp] = makeFakeGroup();

        /* count all elements */
        assertEq(3, grp.countElems(), '');
    },
    'testAddElementAfter',
    () => {
        let [app, grp] = makeFakeGroup();
        assertEq('btn1,btn2,btn3,', listElems(grp), '');

        /* disallow adding duplicates */
        let btn3dupe = new UI512ElButton('btn3');
        assertThrows('', 'found in grp', () => grp.addElement(app, btn3dupe));
        assertEq('btn1,btn2,btn3,', listElems(grp), '');

        /* add after everything */
        let btn4 = new UI512ElButton('btn4');
        grp.addElementAfter(app, btn4, 'btn3');
        assertEq('btn1,btn2,btn3,btn4,', listElems(grp), '');

        /* add with special suffix 1 */
        let btn2_start = new UI512ElButton('btn2##start');
        grp.addElementAfter(app, btn2_start, 'btn2');
        assertEq('btn1,btn2,btn2##start,btn3,btn4,', listElems(grp), '');

        /* add with special suffix 2 */
        let btn2_next = new UI512ElButton('btn2##next');
        grp.addElementAfter(app, btn2_next, 'btn2');
        assertEq('btn1,btn2,btn2##start,btn2##next,btn3,btn4,', listElems(grp), '');

        /* add with special suffix 3 */
        let btn2_third = new UI512ElButton('btn2##3');
        grp.addElementAfter(app, btn2_third, 'btn2');
        assertEq('btn1,btn2,btn2##start,btn2##next,btn2##3,btn3,btn4,', listElems(grp), '');
    },
    'testGroupFindById',
    () => {
        let [app, grp] = makeFakeGroup();

        /* find existing */
        let el = grp.findEl('btn1');
        assertEq('btn1', el!.id, '');

        /* find not existing */
        el = grp.findEl('btn9');
        assertEq(undefined, el, '');

        /* get existing */
        el = grp.getEl('btn1');
        assertEq('btn1', el.id, '');

        /* get not existing */
        assertThrows('', 'not find', () => grp.getEl('btn9'));
    },
    'testAppFindById',
    () => {
        let [app, grp] = makeFakeGroup();
        let fakeGrp2 = new UI512ElGroup('fakegrp2');
        app.addGroup(fakeGrp2);
        let btn4 = new UI512ElButton('btn4');
        fakeGrp2.addElement(app, btn4);
        let btn5 = new UI512ElButton('btn5');
        fakeGrp2.addElement(app, btn5);
        btn4.set('labeltext', 'fromnewgroup');
        btn5.set('labeltext', 'fromnewgroup');

        /* find existing */
        let el = app.findEl('btn1');
        assertEq('btn1', el!.id, '');
        assertEq('', el!.getS('labeltext'), '');

        /* find not existing */
        el = app.findEl('btn9');
        assertEq(undefined, el, '');

        /* get existing */
        el = app.getEl('btn1');
        assertEq('btn1', el.id, '');
        assertEq('', el.getS('labeltext'), '');

        /* get not existing */
        assertThrows('', 'not found', () => app.getEl('btn9'));

        /* from other group */
        el = app.getEl('btn4');
        assertEq('btn4', el.id, '');
        assertEq('fromnewgroup', el.getS('labeltext'), '');
    },
    'testCoordsToElement',
    () => {
        let [app, grp] = makeFakeGroup();
        grp.getEl('btn1').setDimensionsX1Y1(10, 20, 100, 200);
        grp.getEl('btn2').setDimensionsX1Y1(20, 30, 110, 210);

        /* where no element is */
        let el = app.coordsToElement(5, 15);
        assertEq(undefined, el, '');

        /* where only first element is */
        el = app.coordsToElement(15, 25);
        assertEq('btn1', el!.id, '');

        /* where both elements are (highest gets priority) */
        el = app.coordsToElement(70, 80);
        assertEq('btn2', el!.id, '');

        /* where only second element is */
        el = app.coordsToElement(105, 205);
        assertEq('btn2', el!.id, '');

        /* where no element is */
        el = app.coordsToElement(115, 215);
        assertEq(undefined, el, '');
    },
    'testUpdateBoundsBasedOnChildren',
    () => {
        let [app, grp] = makeFakeGroup();
        assertEq([0, 0, largeArea, largeArea], grp.mouseInteractionBounds, '');

        /* width and height are 0 for an empty group */
        grp.updateBoundsBasedOnChildren();
        assertEq([0, 0, 0, 0], grp.mouseInteractionBounds, '');

        /* find total width and height when all children have the same size */
        grp.getEl('btn1').setDimensions(15, 30, 40, 50);
        grp.getEl('btn2').setDimensions(15, 30, 40, 50);
        grp.getEl('btn3').setDimensions(15, 30, 40, 50);
        grp.updateBoundsBasedOnChildren();
        assertEq([15, 30, 40, 50], grp.mouseInteractionBounds, '');

        /* find total width and height when all children have different sizes */
        grp.getEl('btn1').setDimensions(15, 30, 40, 50);
        grp.getEl('btn2').setDimensions(20, 30, 40, 60);
        grp.getEl('btn3').setDimensions(25, 30, 400, 49);
        grp.updateBoundsBasedOnChildren();
        assertEq([15, 30, 410, 60], grp.mouseInteractionBounds, '');
    },
    'testUI512ElTextFieldAsGeneric',
    () => {
        let el = new UI512ElTextField('fld1');
        el.observer = new ElementObserverNoOp();
        el.set('h', 123);
        let gel = new UI512ElTextFieldAsGeneric(el);

        /* test setFmtTxt */
        let txt = FormattedText.newFromUnformatted('abc');
        gel.setFmtTxt(txt, ChangeContext.Default);
        let got = gel.getFmtTxt();
        assertEq('abc', got.toUnformatted(), '');

        /* test setSel */
        gel.setSel(4, 7);
        assertEq([4, 7], gel.getSel(), '');

        /* test others */
        assertEq(true, gel.canEdit(), '');
        assertEq(true, gel.canSelectText(), '');
        assertEq(true, gel.isMultiline(), '');
        assertEq('fld1', gel.getID(), '');
        assertEq(123, gel.getHeight(), '');
        assertEq('chicago_12_biuosdce', gel.getDefaultFont(), '');
        assertEq(el.id, gel.getReadOnlyUI512().id, '');

        /* test scroll amount */
        el.set('scrollamt', 456);
        assertEq(456, gel.getScrollAmt(), '');
        gel.setScrollAmt(undefined);
        assertEq(456, gel.getScrollAmt(), '');
        gel.setScrollAmt(500);
        assertEq(500, gel.getScrollAmt(), '');
    },
    'testVpcTextFieldAsGeneric',
    () => {
        let el = new UI512ElTextField('fld1');
        el.observer = new ElementObserverNoOp();

        let vel = new VpcElField('12', '34');
        vel.observer = new ElementObserverNoOp();
        vel.set('h', 123);
        let gel = new VpcTextFieldAsGeneric(el, vel);

        /* test setFmtTxt */
        let txt = FormattedText.newFromUnformatted('abc');
        gel.setFmtTxt(txt, ChangeContext.Default);
        let got = gel.getFmtTxt();
        assertEq('abc', got.toUnformatted(), '');

        /* test setSel */
        gel.setSel(4, 7);
        assertEq([4, 7], gel.getSel(), '');

        /* test others */
        assertEq(true, gel.canEdit(), '');
        assertEq(true, gel.canSelectText(), '');
        assertEq(true, gel.isMultiline(), '');
        assertEq('12', gel.getID(), '');
        assertEq(123, gel.getHeight(), '');
        assertEq('geneva_12_biuosdce', gel.getDefaultFont(), '');
        assertEq(el.id, gel.getReadOnlyUI512().id, '');

        /* test scroll amount */
        vel.set('scroll', 456);
        assertEq(456, gel.getScrollAmt(), '');
        gel.setScrollAmt(undefined);
        assertEq(456, gel.getScrollAmt(), '');
        gel.setScrollAmt(500);
        assertEq(500, gel.getScrollAmt(), '');
    },
    'testUI512Lines.flatten',
    () => {
        let c = specialCharFontChange;
        let txt = FormattedText.newFromSerialized(`${c}f1${c}abc\n${c}f2${c}de\n${c}f1${c}fgh`);
        let lines = new UI512Lines(txt);
        let flattened = lines.flatten();
        assertEq(txt.toSerialized(), flattened.toSerialized(), '');
    },
    'testUI512Lines.indexToLineNumber',
    () => {
        let c = specialCharFontChange;
        let txt = FormattedText.newFromSerialized(`${c}f1${c}abc\n${c}f2${c}de\n${c}f1${c}fgh`);
        let lines = new UI512Lines(txt);

        let got = Util512.range(10).map(n => lines.indexToLineNumber(n));
        assertEq('0,0,0,0,1,1,1,2,2,2', got.join(','), '');
        assertEq(2, lines.indexToLineNumber(1000), '');
    },
    'testUI512Lines.lineNumberToIndex',
    () => {
        let c = specialCharFontChange;
        let txt = FormattedText.newFromSerialized(`${c}f1${c}abc\n${c}f2${c}de\n${c}f1${c}fgh`);
        let lines = new UI512Lines(txt);

        let got = Util512.range(10).map(n => lines.lineNumberToIndex(n));
        assertEq('0,4,7,7,7,7,7,7,7,7', got.join(','), '');
        got = Util512.range(10).map(n => UI512Lines.fastLineNumberToIndex(txt, n));
        assertEq('0,4,7,7,7,7,7,7,7,7', got.join(','), '');
    },
    'testUI512Lines.lineNumberToLineEndIndex',
    () => {
        let c = specialCharFontChange;
        let txt = FormattedText.newFromSerialized(`${c}f1${c}abc\n${c}f2${c}de\n${c}f1${c}fgh`);
        let lines = new UI512Lines(txt);

        let got = Util512.range(10).map(n => lines.lineNumberToLineEndIndex(n));
        assertEq('3,6,10,10,10,10,10,10,10,10', got.join(','), '');
        let fastGot = Util512.range(10).map(n => UI512Lines.fastLineNumberAndEndToIndex(txt, n).join('-'));
        assertEq('0-4,4-7,7-11,7-11,7-11,7-11,7-11,7-11,7-11,7-11', fastGot.join(','), '');
    },
    'testUI512Lines.length',
    () => {
        let c = specialCharFontChange;
        let txt = FormattedText.newFromSerialized(`${c}f1${c}abc\n${c}f2${c}de\n${c}f1${c}fgh`);
        let lines = new UI512Lines(txt);
        assertEq(txt.len(), lines.length(), '');
        assertEq(txt.toUnformatted().length, lines.length(), '');
    },
    'testUI512Lines.getLineUnformatted',
    () => {
        let c = specialCharFontChange;
        let txt = FormattedText.newFromSerialized(`${c}f1${c}abc\n${c}f2${c}de\n${c}f1${c}fgh`);
        let lines = new UI512Lines(txt);

        assertEq('abc\n', lines.getLineUnformatted(0), '');
        assertEq('de\n', lines.getLineUnformatted(1), '');
        assertEq('fgh', lines.getLineUnformatted(2), '');
    },
    'testUI512Lines.alterSelectedLines',
    () => {
        let c = specialCharFontChange;
        let txt = FormattedText.newFromSerialized(`${c}f1${c}abc\n${c}f2${c}de\n${c}f1${c}fgh`);

        let [fl, selc, selend] = UI512Lines.alterSelectedLines(txt, 1, 5, t => {
            let newTxt = FormattedText.newFromUnformatted('--');
            newTxt.append(t);
            t.deleteAll();
            t.append(newTxt);
        });

        assertEq('--abc\n--de\nfgh', fl.toUnformatted(), '');
        assertEq(0, selc, '');
        assertEq(10, selend, '');
    },
    'testUI512Lines.getNonSpaceStartOfLine',
    () => {
        let txt = FormattedText.newFromUnformatted('abc');
        assertEq(0, UI512Lines.getNonSpaceStartOfLine(txt, true), '');
        assertEq(0, UI512Lines.getNonSpaceStartOfLine(txt, false), '');
        txt = FormattedText.newFromUnformatted(' abc');
        assertEq(1, UI512Lines.getNonSpaceStartOfLine(txt, true), '');
        assertEq(1, UI512Lines.getNonSpaceStartOfLine(txt, false), '');
        txt = FormattedText.newFromUnformatted('    abc   ');
        assertEq(4, UI512Lines.getNonSpaceStartOfLine(txt, true), '');
        assertEq(4, UI512Lines.getNonSpaceStartOfLine(txt, false), '');
        txt = FormattedText.newFromUnformatted('   ');
        assertEq(3, UI512Lines.getNonSpaceStartOfLine(txt, true), '');
        assertEq(2, UI512Lines.getNonSpaceStartOfLine(txt, false), '');
    },
    'testUI512Lines.getIndentLevel',
    () => {
        let txt = FormattedText.newFromUnformatted('abc');
        assertEq(0, UI512Lines.getIndentLevel(txt), '');
        txt = FormattedText.newFromUnformatted('   abc');
        assertEq(0, UI512Lines.getIndentLevel(txt), '');
        txt = FormattedText.newFromUnformatted('    abc');
        assertEq(1, UI512Lines.getIndentLevel(txt), '');
        txt = FormattedText.newFromUnformatted('     abc');
        assertEq(1, UI512Lines.getIndentLevel(txt), '');
        txt = FormattedText.newFromUnformatted('            abc');
        assertEq(3, UI512Lines.getIndentLevel(txt), '');
        txt = FormattedText.newFromUnformatted('            ');
        assertEq(3, UI512Lines.getIndentLevel(txt), '');
    },
    'testGridLayout',
    () => {
        let grid = new GridLayout(100, 200, 30, 40, [1, 2, 3], [4, 5, 6], 7, 8);
        let results: number[][] = [];
        grid.combinations((n, a, b, bnds) => {
            results.push([n, a, b, bnds[0], bnds[1], bnds[2], bnds[3]]);
        });

        assertEq(
            [
                [0, 1, 4, 100, 200, 30, 40],
                [1, 2, 4, 137, 200, 30, 40],
                [2, 3, 4, 174, 200, 30, 40],
                [3, 1, 5, 100, 248, 30, 40],
                [4, 2, 5, 137, 248, 30, 40],
                [5, 3, 5, 174, 248, 30, 40],
                [6, 1, 6, 100, 296, 30, 40],
                [7, 2, 6, 137, 296, 30, 40],
                [8, 3, 6, 174, 296, 30, 40]
            ],
            results,
            ''
        );
    }
];

/**
 * exported test class for mTests
 */
export class TestUI512Elements extends UI512TestBase {
    tests = mTests;
}

/**
 * make an 'application' and 'group' that stand alone,
 * not needing a presenter
 */
function makeFakeGroup(): [UI512Application, UI512ElGroup] {
    let bounds = getUI512WindowBounds();
    let fakeApp = new UI512Application(bounds, new ElementObserverNoOp());
    let fakeGrp = new UI512ElGroup('fakeGrp');
    fakeApp.addGroup(fakeGrp);
    let btn1 = new UI512ElButton('btn1');
    fakeGrp.addElement(fakeApp, btn1);
    let btn2 = new UI512ElButton('btn2');
    fakeGrp.addElement(fakeApp, btn2);
    let btn3 = new UI512ElButton('btn3');
    fakeGrp.addElement(fakeApp, btn3);
    return [fakeApp, fakeGrp];
}

/**
 * list the elements in a group
 */
function listElems(grp: UI512ElGroup) {
    let s = '';
    for (let el of grp.iterEls()) {
        s += el.id + ',';
    }

    return s;
}
