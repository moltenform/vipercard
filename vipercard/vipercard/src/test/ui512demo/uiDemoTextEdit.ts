
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { cast } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { GridLayout, UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { KeyDownEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { TextSelModify } from '../../ui512/textedit/ui512TextSelModify.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { TestDrawUI512TextEdit } from '../../test/ui512/testUI512TextEdit.js';

/**
 * UI512DemoTextEdit
 *
 * A "demo" project showing several text fields with different properties,
 * and containing different amounts of content.
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_ to confirm that manually
 * interacting with the text fields has the expected behavior
 */
export class UI512DemoTextEdit extends UI512Presenter {
    test = new TestDrawUI512TextEdit();
    init() {
        super.init();
        addDefaultListeners(this.listeners);

        let clientRect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientRect, this);
        this.inited = true;
        this.test.addElements(this, clientRect);
        this.test.uiContext = true;

        let curX = 10;
        let grp = this.app.getGroup('grp');

        /* run this after hitting toggle scroll a couple times to make sure we're not leaking elements */
        /* i.e. if this number is continually increasing we are leaking elements somewhere */
        let testBtns = ['RunTest', 'DldImage', 'ToggleScroll', 'Count Elems', 'WhichChoice'];
        let layoutTestBtns = new GridLayout(clientRect[0] + 10, clientRect[1] + 330, 85, 15, testBtns, [1], 5, 5);
        layoutTestBtns.createElems(this.app, grp, 'btn', UI512ElButton, () => {}, true, true);

        let testSelByLines = new UI512ElTextField('testSelByLines');
        grp.addElement(this.app, testSelByLines);
        testSelByLines.setDimensions(485, 270, 170, 80);
        let choices = 'choice 0\nchoice 1\nchoice 2 (another)\nchoice 3\nchoice 4\nchoice 5\nchoice 6\nchoice 7'.split(
            '\n'
        );
        UI512ElTextField.setListChoices(testSelByLines, choices);

        testSelByLines.set('scrollbar', true);
        testSelByLines.set('selectbylines', true);
        testSelByLines.set('multiline', true);
        testSelByLines.set('canselecttext', true);
        testSelByLines.set('canedit', false);
        testSelByLines.set('labelwrap', false);

        /* by setting selcaret to equal selend, this is making the initial choice blank */
        testSelByLines.set('selcaret', 0);
        testSelByLines.set('selend', 0);

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseUp, UI512DemoTextEdit.respondMouseUp);
        this.listenEvent(UI512EventType.KeyDown, UI512DemoTextEdit.respondKeyDown);
        this.rebuildFieldScrollbars();
    }

    protected static respondMouseUp(pr: UI512DemoTextEdit, d: MouseUpEventDetails) {
        if (d.elClick && d.button === 0) {
            if (d.elClick.id === 'btnDldImage') {
                pr.test.runTest(true);
            } else if (d.elClick.id === 'btnRunTest') {
                pr.test.runTest(false);
            } else if (d.elClick.id === 'btnToggleScroll') {
                pr.test.toggleScroll(pr);
            } else if (d.elClick.id === 'btnCount Elems') {
                console.log(`# of elements === ${pr.app.getGroup('grp').countElems()}`);
            } else if (d.elClick.id === 'btnWhichChoice') {
                let grp = pr.app.getGroup('grp');
                let el = cast(grp.getEl('testSelByLines'), UI512ElTextField);
                let gel = new UI512ElTextFieldAsGeneric(el);
                let whichLine = TextSelModify.selectByLinesWhichLine(gel);
                console.log(`the chosen line is: ${whichLine} `);
            }
        }
    }

    protected static respondKeyDown(pr: UI512DemoTextEdit, d: KeyDownEventDetails) {
        let el = TextSelModify.getSelectedField(pr);
        if (el && el.getB('selectbylines')) {
            return;
        } else if (el && d.readableShortcut === 'Tab') {
            pr.onTabKeyDown(el, d, false);
        } else if (el && d.readableShortcut === 'Shift+Tab') {
            pr.onTabKeyDown(el, d, true);
        }
    }

    onTabKeyDown(el: O<UI512ElTextField>, d: KeyDownEventDetails, hasShift: boolean) {
        if (el && el.getB('multiline') && el.getN('selcaret') === el.getN('selend')) {
            /* simply insert a \t */
            if (!hasShift) {
                let gel = new UI512ElTextFieldAsGeneric(el);
                TextSelModify.changeTextInsert(gel, '\t');
            }
        } else if (el && el.getB('multiline')) {
            /* indent or dedent */
            let gel = new UI512ElTextFieldAsGeneric(el);
            TextSelModify.changeTextIndentation(gel, hasShift);
        }

        d.setHandled();
    }
}
