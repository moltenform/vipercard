
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { ModifierKeys, getUI512WindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ElementObserverNoOp } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { KeyDownEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512CompCodeEditor } from '../../ui512/composites/ui512CodeEditor.js';
/* auto */ import { VpcPanelScriptEditor } from '../../vpcui/panels/vpcScriptEditor.js';

/**
 * testing the code editor's auto-formatting and
 * autoinsertion features
 *
 * the ^ symbol refers to the caret position,
 * for example if the input is `on mouseUp^`
 * we simulate the user pressing Enter, and the expected output is
 * `on mouseUp
 *      ^
 *  end mouseUp`
 * since we both automatically add indentation and automattically
 * add the closing block.
 */
let mTests: (string | Function)[] = [
    'testCodeEditorFeatures.Auto Close A Block',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
            ed,
            `on z
repeat while true^`,
            `on z
    repeat while true
        ^
    end repeat`
        );
        testAutoFormat(
            ed,
            `repeat while true^`,
            `repeat while true
    ^
end repeat`
        );
        testAutoFormat(
            ed,
            `on z^`,
            `on z
    ^
end z`
        );
        testAutoFormat(
            ed,
            `on z other^`,
            `on z other
    ^
end z`
        );
        testAutoFormat(
            ed,
            `if 2 > 1 then^`,
            `if 2 > 1 then
    ^
end if`
        );
    },
    'testCodeEditorFeatures.Correctly Close A Block',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
            ed,
            `on z
b
end z^`,
            `on z
    b
end z
^`
        );
        testAutoFormat(
            ed,
            `repeat while true
b
end repeat^`,
            `repeat while true
    b
end repeat
^`
        );
        testAutoFormat(
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
    'testCodeEditorFeatures.Incorrectly Close A Block',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
            ed,
            `on z
b
end y^`,
            `on z
    b
    end y
    ^`
        );
        testAutoFormat(
            ed,
            `repeat while true
b
end repeaX^`,
            `repeat while true
    b
    end repeaX
    ^`
        );
        testAutoFormat(
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
    'testCodeEditorFeatures.SetIndentation.Maintain At Level Zero',
    () => {
        let ed = createFakeEd();

        /* currently, if Enter pressed in middle of text, the caret is sent to end of line. */
        testAutoFormat(ed, '^', '\n^');
        testAutoFormat(ed, 'text^', 'text\n^');
        testAutoFormat(ed, 'text\n^', 'text\n\n^');
        testAutoFormat(ed, 'text^\ntext', 'text\n^\ntext');
        testAutoFormat(ed, 'text^text', 'text\ntext^');
        testAutoFormat(ed, 'text1^text2\ntext3', 'text1\ntext2^\ntext3');
    },
    'testCodeEditorFeatures.SetIndentation.Maintain At Level One',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
            ed,
            `on z
    ^
end z`,
            `on z
    \n    ^
end z`
        );
        testAutoFormat(
            ed,
            `on z
    test^
end z`,
            `on z
    test
    ^
end z`
        );
        testAutoFormat(
            ed,
            `on z
    test^test
end z`,
            `on z
    test
    test^
end z`
        );
    },
    'testCodeEditorFeatures.SetIndentation.Maintain At Level Two',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
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
        testAutoFormat(
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
        testAutoFormat(
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
    },
    'testCodeEditorFeatures.SetIndentation.Introduce One Tab',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
            ed,
            `on z^
end z`,
            `on z
    ^
end z`
        );
        testAutoFormat(
            ed,
            `on z^
foo
end z`,
            `on z
    ^
    foo
end z`
        );
        testAutoFormat(
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
    },
    'testCodeEditorFeatures.SetIndentation.Introduce Two Tabs',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
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
        testAutoFormat(
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
        testAutoFormat(
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
    },
    'testCodeEditorFeatures.SetIndentation.Add Correct Indentation For Else Clauses',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
            ed,
            `if 2 > 1 then\nelse\nend if\na^`,
            `if 2 > 1 then
else
end if
a
^`
        );
        testAutoFormat(
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
        testAutoFormat(
            ed,
            `if 2 > 1 then\nelseX^`,
            `if 2 > 1 then
    elseX
    ^`
        );
        testAutoFormat(
            ed,
            `if 2 > 1 then\nelse^`,
            `if 2 > 1 then
else
    ^
end if`
        );
        testAutoFormat(
            ed,
            `if 2 > 1 then\nz\nelse^`,
            `if 2 > 1 then
    z
else
    ^
end if`
        );
        testAutoFormat(
            ed,
            `if 2 > 1 then\nelse^\nend if`,
            `if 2 > 1 then
else
    ^
end if`
        );
        testAutoFormat(
            ed,
            `if 2 > 1 then\nz\nelse^\nend if`,
            `if 2 > 1 then
    z
else
    ^
end if`
        );
        testAutoFormat(
            ed,
            `if x then\nelse if y then\nelse\nend if^`,
            `if x then
else if y then
else
end if
^`
        );
        testAutoFormat(
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
    },
    'testCodeEditorFeatures.SetIndentation.Nested Blocks',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
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
        testAutoFormat(
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
    },
    'testCodeEditorFeatures.SetIndentation.Too Many End Blocks',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
            ed,
            `if 2 > 1 then\nx\nend if\nend if^`,
            `if 2 > 1 then
    x
end if
end if
^`
        );
        testAutoFormat(
            ed,
            `if 2 > 1 then\nx\nend repeat\nend if^`,
            `if 2 > 1 then
    x
    end repeat
end if
^`
        );
    },
    'testCodeEditorFeatures.An Else Cannot Stand Alone.',
    () => {
        let ed = createFakeEd();
        testAutoFormat(
            ed,
            `else^`,
            `else
^`
        );
        testAutoFormat(
            ed,
            `else\nx^`,
            `else
x
^`
        );
        testAutoFormat(
            ed,
            `if 2 > 1 then\nx\nend if\nx\nelse^`,
            `if 2 > 1 then
    x
end if
x
else
^`
        );
        testAutoFormat(
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
    },
    'testCodeEditorFeatures.SetIndentation.Continued Lines',
    () => {
        let ed = createFakeEd();
        assertEq(2, ed.autoIndent.lineContinuation.length, '9o|');
        for (let c of ed.autoIndent.lineContinuation) {
            testAutoFormat(ed, `put 2 into x^`, `put 2 into x\n^`);
            testAutoFormat(ed, `put 2 into "${c}"^`, `put 2 into "${c}"\n^`);
            testAutoFormat(ed, `put 2 ${c}^`, `put 2 ${c}\n\t^`);
            testAutoFormat(ed, `put 2 ${c}\ninto x^`, `put 2 ${c}\n\tinto x\n^`);
            testAutoFormat(ed, `put ${c}\n2 ${c}^`, `put ${c}\n\t2 ${c}\n\t^`);
            testAutoFormat(ed, `put ${c}\n2 ${c}\ninto x^`, `put ${c}\n\t2 ${c}\n\tinto x\n^`);
        }
    }
];

/**
 * exported test class for mTests
 */
export class TestCodeEditorHelpers extends UI512TestBase {
    tests = mTests;
}

/**
 * make a fake editor object,
 * without making a presenter or using any real UI
 */
function createFakeEd() {
    let bounds = getUI512WindowBounds();
    let fakeApp = new UI512Application(bounds, new ElementObserverNoOp());
    let fakeGrp = new UI512ElGroup('fakeGrp');
    let fakePr = { rebuildFieldScrollbars: () => {} } as any; /* test code */
    let ed = new VpcPanelScriptEditor('vpcPanelScriptEditor');
    ed.logicalWidth = 1000;
    ed.logicalHeight = 1000;
    ed.refreshFromModel = a => {};
    ed.saveChangesToModel = (a, b) => {};
    ed.cbGetAndValidateSelectedVel = s => undefined;
    ed.vci = { UI512App: () => {} } as any; /* test code */
    ed.create(fakePr, fakeApp);
    return ed;
}

/**
 * mimic hitting Enter at the current caret location
 */
function testAutoFormat(ed: UI512CompCodeEditor, initial: string, expected: string) {
    initial = initial.replace(/\r\n/g, '\n').replace(/    /g, '\t');
    expected = expected.replace(/\r\n/g, '\n').replace(/    /g, '\t');

    assertTrue(!scontains(initial, '#'), "9n|don't need to mark selend");
    assertTrue(!scontains(expected, '#'), "9m|don't need to mark selend");
    assertEq(2, initial.split('^').length, '9l|require precisely one ^');
    assertEq(2, expected.split('^').length, '9k|require precisely one ^');
    let caretInit = initial.indexOf('^');
    let initialtext = initial.replace(/\^/g, '');
    ed.el.setFmTxt(FormattedText.newFromUnformatted(initialtext));
    ed.el.set('selcaret', caretInit);
    ed.el.set('selend', caretInit);
    let d = new KeyDownEventDetails(0, 'Enter', '\n', false, ModifierKeys.None);
    ed.respondKeydown(d);
    let textGot = ed.el.getFmTxt().toUnformatted();
    let caretGot = ed.el.getN('selcaret');
    assertEq(ed.el.getN('selcaret'), ed.el.getN('selend'), '9j|');
    let caretExpected = expected.indexOf('^');
    let textExpected = expected.replace(/\^/g, '');
    assertEq(textExpected, textGot, '9i|');
    assertEq(caretExpected, caretGot, '9h|');
}
