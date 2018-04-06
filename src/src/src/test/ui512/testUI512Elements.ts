
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { BrowserOSInfo, assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ModifierKeys, getUI512WindowBounds, ui512TranslateModifiers, toShortcutString } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512LangNull } from '../../ui512/lang/langbase.js';
/* auto */ import { largearea } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { ElementObserverNoOp } from '../../ui512/elements/ui512elementsgettable.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512elementsgroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { GridLayout, UI512ElButton } from '../../ui512/elements/ui512elementsbutton.js';
/* auto */ import { KeyDownEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { UI512CompCodeEditor } from '../../ui512/composites/ui512codeeditor.js';
/* auto */ import { VpcPanelScriptEditor } from '../../vpcui/panels/vpceditscripteditor.js';

export class TestUI512Elements extends UI512TestBase {
    tests = [
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
                    [8, 3, 6, 174, 296, 30, 40],
                ],
                results,
                ''
            );
        },
        'test_utils_updateBoundsBasedOnChildren',
        () => {
            let [app, grp] = this.makeFakeGroup();
            assertEq([0, 0, largearea, largearea], grp.mouseInteractionBounds, '');
            grp.updateBoundsBasedOnChildren();
            assertEq([0, 0, 0, 0], grp.mouseInteractionBounds, '');
            grp.getEl('btn1').setDimensions(15, 30, 40, 50);
            grp.getEl('btn2').setDimensions(15, 30, 40, 50);
            grp.getEl('btn3').setDimensions(15, 30, 40, 50);
            grp.updateBoundsBasedOnChildren();
            assertEq([15, 30, 40, 50], grp.mouseInteractionBounds, '');
            grp.getEl('btn1').setDimensions(15, 30, 40, 50);
            grp.getEl('btn2').setDimensions(20, 30, 40, 60);
            grp.getEl('btn3').setDimensions(25, 30, 400, 49);
            grp.updateBoundsBasedOnChildren();
            assertEq([15, 30, 410, 60], grp.mouseInteractionBounds, '');
        },
        'test_utils_addElementAfter',
        () => {
            let [app, grp] = this.makeFakeGroup();
            assertEq('btn1,btn2,btn3,', this.listElems(grp), '');

            // disallow adding duplicates
            let btn3dupe = new UI512ElButton('btn3');
            this.assertThrows('', 'found in grp', () => grp.addElement(app, btn3dupe));
            assertEq('btn1,btn2,btn3,', this.listElems(grp), '');

            // add after everything
            let btn4 = new UI512ElButton('btn4');
            grp.addElementAfter(app, btn4, 'btn3');
            assertEq('btn1,btn2,btn3,btn4,', this.listElems(grp), '');

            // add with special suffix 1
            let btn2_start = new UI512ElButton('btn2##start');
            grp.addElementAfter(app, btn2_start, 'btn2');
            assertEq('btn1,btn2,btn2##start,btn3,btn4,', this.listElems(grp), '');

            // add with special suffix 2
            let btn2_next = new UI512ElButton('btn2##next');
            grp.addElementAfter(app, btn2_next, 'btn2');
            assertEq('btn1,btn2,btn2##start,btn2##next,btn3,btn4,', this.listElems(grp), '');

            // add with special suffix 3
            let btn2_third = new UI512ElButton('btn2##3');
            grp.addElementAfter(app, btn2_third, 'btn2');
            assertEq('btn1,btn2,btn2##start,btn2##next,btn2##3,btn3,btn4,', this.listElems(grp), '');
        },
        'test_utils_osTranslateModifiers',
        () => {
            assertEq(ModifierKeys.None, ui512TranslateModifiers(BrowserOSInfo.Windows, false, false, false, false), '');
            assertEq(ModifierKeys.Shift, ui512TranslateModifiers(BrowserOSInfo.Windows, false, true, false, false), '');
            assertEq(ModifierKeys.Opt, ui512TranslateModifiers(BrowserOSInfo.Windows, false, false, true, false), '');
            assertEq(
                ModifierKeys.Shift | ModifierKeys.Cmd | ModifierKeys.Opt,
                ui512TranslateModifiers(BrowserOSInfo.Windows, true, true, true, true),
                ''
            );
            assertEq(
                ModifierKeys.Shift | ModifierKeys.Opt,
                ui512TranslateModifiers(BrowserOSInfo.Windows, false, true, true, true),
                ''
            );
            assertEq(ModifierKeys.None, ui512TranslateModifiers(BrowserOSInfo.Linux, false, false, false, false), '');
            assertEq(ModifierKeys.Shift, ui512TranslateModifiers(BrowserOSInfo.Linux, false, true, false, false), '');
            assertEq(ModifierKeys.Opt, ui512TranslateModifiers(BrowserOSInfo.Linux, false, false, true, false), '');
            assertEq(
                ModifierKeys.Shift | ModifierKeys.Cmd | ModifierKeys.Opt,
                ui512TranslateModifiers(BrowserOSInfo.Linux, true, true, true, true),
                ''
            );
            assertEq(
                ModifierKeys.Shift | ModifierKeys.Opt,
                ui512TranslateModifiers(BrowserOSInfo.Linux, false, true, true, true),
                ''
            );
            assertEq(ModifierKeys.None, ui512TranslateModifiers(BrowserOSInfo.Mac, false, false, false, false), '');
            assertEq(ModifierKeys.Shift, ui512TranslateModifiers(BrowserOSInfo.Mac, false, true, false, false), '');
            assertEq(ModifierKeys.Opt, ui512TranslateModifiers(BrowserOSInfo.Mac, false, false, true, false), '');
            assertEq(
                ModifierKeys.Shift | ModifierKeys.Cmd | ModifierKeys.Opt,
                ui512TranslateModifiers(BrowserOSInfo.Mac, true, true, true, true),
                ''
            );
            assertEq(
                ModifierKeys.Shift | ModifierKeys.Cmd | ModifierKeys.Opt,
                ui512TranslateModifiers(BrowserOSInfo.Mac, false, true, true, true),
                ''
            );
        },
        'test_utils_toShortcutString',
        () => {
            assertEq('', toShortcutString(ModifierKeys.None, ''), '');
            assertEq('Cmd+', toShortcutString(ModifierKeys.Cmd, ''), '');
            assertEq('Cmd++', toShortcutString(ModifierKeys.Cmd, '+'), '');
            assertEq('Cmd+Home', toShortcutString(ModifierKeys.Cmd, 'Home'), '');
            assertEq('Cmd+A', toShortcutString(ModifierKeys.Cmd, 'A'), '');
            assertEq('Cmd+A', toShortcutString(ModifierKeys.Cmd, 'KeyA'), '');
            assertEq('Cmd+keya', toShortcutString(ModifierKeys.Cmd, 'keya'), '');
            assertEq('Cmd+KeyAbc', toShortcutString(ModifierKeys.Cmd, 'KeyAbc'), '');
            assertEq('Cmd+TheKeyA', toShortcutString(ModifierKeys.Cmd, 'TheKeyA'), '');
            assertEq('Cmd+.', toShortcutString(ModifierKeys.Cmd, '.'), '');
            assertEq('Shift+.', toShortcutString(ModifierKeys.Shift, '.'), '');
            assertEq('Opt+.', toShortcutString(ModifierKeys.Opt, '.'), '');
            assertEq(
                'Cmd+Opt+Shift+.',
                toShortcutString(ModifierKeys.Shift | ModifierKeys.Cmd | ModifierKeys.Opt, '.'),
                ''
            );
        },
    ];

    protected makeFakeGroup(): [UI512Application, UI512ElGroup] {
        let bounds = getUI512WindowBounds();
        let fakeApp = new UI512Application(bounds, new ElementObserverNoOp());
        let fakeGrp = new UI512ElGroup('fakegrp');
        fakeApp.addGroup(fakeGrp);
        let btn1 = new UI512ElButton('btn1');
        fakeGrp.addElement(fakeApp, btn1);
        let btn2 = new UI512ElButton('btn2');
        fakeGrp.addElement(fakeApp, btn2);
        let btn3 = new UI512ElButton('btn3');
        fakeGrp.addElement(fakeApp, btn3);
        return [fakeApp, fakeGrp];
    }

    protected listElems(grp: UI512ElGroup) {
        let s = '';
        for (let el of grp.iterEls()) {
            s += el.id + ',';
        }

        return s;
    }
}

export class TestCodeEditorHelpers extends UI512TestBase {
    constructor() {
        super();
    }

    tests = [
        'autoInsertText',
        () => {
            let ed = this.createFakeEd();

            // auto-close a block
            this.testEditorAutoText(
                ed,
                `on z
repeat while true^`,
                `on z
    repeat while true
        ^
    end repeat`
            );
            this.testEditorAutoText(
                ed,
                `repeat while true^`,
                `repeat while true
    ^
end repeat`
            );
            this.testEditorAutoText(
                ed,
                `on z^`,
                `on z
    ^
end z`
            );
            this.testEditorAutoText(
                ed,
                `on z other^`,
                `on z other
    ^
end z`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then^`,
                `if 2 > 1 then
    ^
end if`
            );

            // correctly closing a block
            this.testEditorAutoText(
                ed,
                `on z
b
end z^`,
                `on z
    b
end z
^`
            );
            this.testEditorAutoText(
                ed,
                `repeat while true
b
end repeat^`,
                `repeat while true
    b
end repeat
^`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then
b
end if^`,
                `if 2 > 1 then
    b
end if
^`
            );

            // incorrectly closing a block
            this.testEditorAutoText(
                ed,
                `on z
b
end y^`,
                `on z
    b
    end y
    ^`
            );
            this.testEditorAutoText(
                ed,
                `repeat while true
b
end repeaX^`,
                `repeat while true
    b
    end repeaX
    ^`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then
b
end if^`,
                `if 2 > 1 then
    b
end if
^`
            );
        },
        'setIndentation',
        () => {
            let ed = this.createFakeEd();

            // maintain 0 indent tabs.
            // note: currently if Enter pressed in middle of text, caret sent to end of line.
            this.testEditorAutoText(ed, '^', '\n^');
            this.testEditorAutoText(ed, 'text^', 'text\n^');
            this.testEditorAutoText(ed, 'text\n^', 'text\n\n^');
            this.testEditorAutoText(ed, 'text^\ntext', 'text\n^\ntext');
            this.testEditorAutoText(ed, 'text^text', 'text\ntext^');
            this.testEditorAutoText(ed, 'text1^text2\ntext3', 'text1\ntext2^\ntext3');

            // maintain 1 indent tab.
            this.testEditorAutoText(
                ed,
                `on z
    ^
end z`,
                `on z
    \n    ^
end z`
            );
            this.testEditorAutoText(
                ed,
                `on z
    test^
end z`,
                `on z
    test
    ^
end z`
            );
            this.testEditorAutoText(
                ed,
                `on z
    test^test
end z`,
                `on z
    test
    test^
end z`
            );
            // maintain 2 indent tabs.
            this.testEditorAutoText(
                ed,
                `on z
    on y
        ^
    end y
end z`,
                `on z
    on y
        \n        ^
    end y
end z`
            );
            this.testEditorAutoText(
                ed,
                `on z
    on y
        test^
    end y
end z`,
                `on z
    on y
        test
        ^
    end y
end z`
            );
            this.testEditorAutoText(
                ed,
                `on z
    on y
        test^test
    end y
end z`,
                `on z
    on y
        test
        test^
    end y
end z`
            );

            // introduce 1 tab
            this.testEditorAutoText(
                ed,
                `on z^
end z`,
                `on z
    ^
end z`
            );
            this.testEditorAutoText(
                ed,
                `on z^
foo
end z`,
                `on z
    ^
    foo
end z`
            );
            this.testEditorAutoText(
                ed,
                `on y
foo
end y
on z
foo^
end z`,
                `on y
    foo
end y
on z
    foo
    ^
end z`
            );

            // introduce 2 tabs
            this.testEditorAutoText(
                ed,
                `on z
    on y
        test^test
    end y
end z`,
                `on z
    on y
        test
        test^
    end y
end z`
            );
            this.testEditorAutoText(
                ed,
                `on z
on y^
end y
end z`,
                `on z
    on y
        ^
    end y
end z`
            );
            this.testEditorAutoText(
                ed,
                `on z
on y
f
end y
end z
on z
on y
f
end y^
end z`,
                `on z
    on y
        f
    end y
end z
on z
    on y
        f
    end y
    ^
end z`
            );

            // else clauses, correct indentation was recently added
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nelse\nend if\na^`,
                `if 2 > 1 then
else
end if
a
^`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nx\nelse\ny\nend if\na^`,
                `if 2 > 1 then
    x
else
    y
end if
a
^`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nelseX^`,
                `if 2 > 1 then
    elseX
    ^`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nelse^`,
                `if 2 > 1 then
else
    ^
end if`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nz\nelse^`,
                `if 2 > 1 then
    z
else
    ^
end if`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nelse^\nend if`,
                `if 2 > 1 then
else
    ^
end if`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nz\nelse^\nend if`,
                `if 2 > 1 then
    z
else
    ^
end if`
            );
            this.testEditorAutoText(
                ed,
                `if x then\nelse if y then\nelse\nend if^`,
                `if x then
else if y then
else
end if
^`
            );
            this.testEditorAutoText(
                ed,
                `if x then\nx\nelse if y then\ny\nelse\nz\nend if^`,
                `if x then
    x
else if y then
    y
else
    z
end if
^`
            );

            // nested blocks
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nrepeat 2 times\nend repeat\nelse\nrepeat\nend repeat^`,
                `if 2 > 1 then
    repeat 2 times
    end repeat
else
    repeat
    end repeat
    ^`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nrepeat 2 times\ny\nend repeat\nelse\nrepeat\nz\nend repeat^`,
                `if 2 > 1 then
    repeat 2 times
        y
    end repeat
else
    repeat
        z
    end repeat
    ^`
            );

            // too many ends
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nx\nend if\nend if^`,
                `if 2 > 1 then
    x
end if
end if
^`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nx\nend repeat\nend if^`,
                `if 2 > 1 then
    x
    end repeat
end if
^`
            );

            // an "else" cannot stand alone
            this.testEditorAutoText(
                ed,
                `else^`,
                `else
^`
            );
            this.testEditorAutoText(
                ed,
                `else\nx^`,
                `else
x
^`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nx\nend if\nx\nelse^`,
                `if 2 > 1 then
    x
end if
x
else
^`
            );
            this.testEditorAutoText(
                ed,
                `if 2 > 1 then\nx\nend if\nx\nelse\ny^`,
                `if 2 > 1 then
    x
end if
x
else
y
^`
            );

            // line continuations
            assertEq(2, ed.autoIndent.lineContinuation.length, '');
            for (let c of ed.autoIndent.lineContinuation) {
                this.testEditorAutoText(ed, `put 2 into x^`, `put 2 into x\n^`);
                this.testEditorAutoText(ed, `put 2 into "${c}"^`, `put 2 into "${c}"\n^`);
                this.testEditorAutoText(ed, `put 2 ${c}^`, `put 2 ${c}\n\t^`);
                this.testEditorAutoText(ed, `put 2 ${c}\ninto x^`, `put 2 ${c}\n\tinto x\n^`);
                this.testEditorAutoText(ed, `put ${c}\n2 ${c}^`, `put ${c}\n\t2 ${c}\n\t^`);
                this.testEditorAutoText(ed, `put ${c}\n2 ${c}\ninto x^`, `put ${c}\n\t2 ${c}\n\tinto x\n^`);
            }
        },
    ];

    protected testEditorAutoText(ed: UI512CompCodeEditor, initial: string, expected: string) {
        initial = initial.replace(/\r\n/g, '\n').replace(/    /g, '\t');
        expected = expected.replace(/\r\n/g, '\n').replace(/    /g, '\t');
        // mimic hitting return when the caret is at ^
        assertTrue(!scontains(initial, '#'), "don't need to mark selend");
        assertTrue(!scontains(expected, '#'), "don't need to mark selend");
        assertEq(2, initial.split('^').length, 'require precisely one ^');
        assertEq(2, expected.split('^').length, 'require precisely one ^');
        let caretInit = initial.indexOf('^');
        let initialtext = initial.replace(/\^/g, '');
        ed.el!.setftxt(FormattedText.newFromUnformatted(initialtext));
        ed.el!.set('selcaret', caretInit);
        ed.el!.set('selend', caretInit);
        let d = new KeyDownEventDetails(0, 'Enter', '\n', false, ModifierKeys.None);
        ed.respondKeydown(d);
        let textGot = ed.el!.get_ftxt().toUnformatted();
        let caretGot = ed.el!.get_n('selcaret');
        assertEq(ed.el!.get_n('selcaret'), ed.el!.get_n('selend'), '');
        let caretExpected = expected.indexOf('^');
        let textExpected = expected.replace(/\^/g, '');
        assertEq(textExpected, textGot, '');
        assertEq(caretExpected, caretGot, '');
    }

    protected createFakeEd() {
        let bounds = getUI512WindowBounds();
        let fakeApp = new UI512Application(bounds, new ElementObserverNoOp());
        let fakeGrp = new UI512ElGroup('fakegrp');
        let fakeCtrller = { rebuildFieldScrollbars: () => {} } as any;
        let ed = new VpcPanelScriptEditor('vpcPanelScriptEditor');
        let lang = new UI512LangNull();
        ed.logicalWidth = 1000;
        ed.logicalHeight = 1000;
        ed.refreshFromModel = (a) => {};
        ed.saveChangesToModel = (a, b) => {};
        ed.cbGetAndValidateSelectedVel = s => undefined;
        ed.appli = { UI512App: () => {} } as any;
        ed.create(fakeCtrller, fakeApp, lang);
        return ed;
    }
}
