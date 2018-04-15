
/* auto */ import { O, assertTrue, makeUI512Error } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512CursorAccess, UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { MouseDragStatus, UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementsLabel.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { MouseDownEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { TemporarilyIgnoreEvents } from '../../ui512/menu/ui512MenuAnimation.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512PresenterBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { UI512CompBase } from '../../ui512/composites/ui512Composites.js';

/**
 * a modal dialog
 * "answer", like an alert() box
 * "ask", like an input() box
 *
 * becuse all of the Presenter's events, including the onIdle event,
 * are redirected when the dialog is open, it basically pauses everything.
 *
 * see uiDemoComposites for an example
 */
export class UI512CompModalDialog extends UI512CompBase {
    compositeType = 'modaldialog';
    dlgType = UI512CompStdDialogType.Answer;
    labelText = '';
    btnLabels = ['', '', ''];

    /* caller can provide rectangle of a button that, if clicked on, exits out of the dialog */
    cancelBtnBounds: number[][] = [];

    /* we normally mute all events, since it is modal. this callback lets a mouseup event through. */
    cbOnMouseUp: O<(btn: number) => void>;

    /* provide default text */
    providedText = '';

    /* result text the user typed in */
    resultText: O<string>;

    /**
     * "answer", like an alert() box
     */
    standardAnswer(
        pr: UI512Presenter,
        app: UI512Application,
        prompt: string,
        fnOnResult?: (n: number) => void,
        choice1 = '',
        choice2 = '',
        choice3 = ''
    ) {
        fnOnResult = fnOnResult || (() => {});
        this.dlgType = UI512CompStdDialogType.Answer;
        this.btnLabels = [choice1, choice2, choice3];
        this.labelText = prompt;
        this.resultText = '';
        this.create(pr, app);
        this.showStandardModalDialog(pr, app, fnOnResult);
    }

    /**
     * "ask", like an input() box
     */
    standardAsk(
        pr: UI512Presenter,
        app: UI512Application,
        prompt: string,
        defText: string,
        fnOnResult: (ret: O<string>, n: number) => void
    ) {
        this.dlgType = UI512CompStdDialogType.Ask;
        this.providedText = defText;
        this.resultText = '';
        this.btnLabels = [lng('lngOK'), lng('lngCancel'), ''];
        this.labelText = prompt;
        this.create(pr, app);
        let cb = (n: number) => {
            fnOnResult(n === 0 ? this.resultText : undefined, n);
        };

        this.showStandardModalDialog(pr, app, cb);
    }

    /**
     * draw button in the dialog
     */
    protected drawBtn(
        app: UI512Application,
        grp: UI512ElGroup,
        dims: number[],
        n: number,
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        if (this.btnLabels[n]) {
            let btn = this.genBtn(app, grp, `choicebtn${n}`);
            btn.set('style', n === 0 ? UI512BtnStyle.OSDefault : UI512BtnStyle.OSStandard);
            btn.set('autohighlight', true);
            btn.set('labeltext', this.btnLabels[n]);
            btn.setDimensions(x + dims[0], y + dims[1], w, h);
        }
    }

    /**
     * draw an input field in the dialog
     */
    protected drawInputFld(
        app: UI512Application,
        grp: UI512ElGroup,
        dims: number[],
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        let fld = this.genChild(app, grp, 'inputfld', UI512ElTextField);
        fld.set('multiline', false);
        fld.set('labelwrap', false);
        fld.setDimensions(x + dims[0], y + dims[1], w, h);
        fld.setftxt(FormattedText.newFromUnformatted(this.providedText));

        /* select all */
        fld.set('selcaret', 0);
        fld.set('selend', fld.get_ftxt().len());

        /* without this adjustment, the text appears too high. */
        /* the real fix is to have vertically-aligned text, but since the product doesn't support */
        /* a text-edit with vertically-aligned text, it's probably not the effort to write+test. */
        fld.set('nudgey', 2);
    }

    /**
     * draw UI
     */
    createSpecific(app: UI512Application) {
        const marginX = this.dlgType === UI512CompStdDialogType.Ask ? 15 : 16;
        const marginY = this.dlgType === UI512CompStdDialogType.Ask ? 13 : 16;
        let grp = app.getGroup(this.grpId);
        let bg = this.genBtn(app, grp, 'bgbtn');
        bg.set('style', UI512BtnStyle.OSBoxModal);
        bg.set('autohighlight', false);
        let dims = this.getFullDimensions();
        bg.setDimensions(dims[0], dims[1], dims[2], dims[3]);

        /* draw prompt */
        let prompt = this.genChild(app, grp, 'dlgprompt', UI512ElLabel);
        prompt.set('labeltext', this.labelText);
        prompt.set('labelwrap', true);
        prompt.setDimensionsX1Y1(
            dims[0] + marginX,
            dims[1] + marginY,
            dims[0] + dims[2] - marginX,
            dims[1] + dims[3] - marginY
        );

        /* draw buttons */
        this.btnLabels[0] = this.btnLabels[0] || lng('lngOK');
        if (this.dlgType === UI512CompStdDialogType.Answer) {
            this.drawBtn(app, grp, dims, 0, 230, 105, 99, 28);
            this.drawBtn(app, grp, dims, 1, 126, 108, 91, 20);
            this.drawBtn(app, grp, dims, 2, 19, 108, 91, 20);
        } else if (this.dlgType === UI512CompStdDialogType.Ask) {
            this.resultText = undefined;
            this.drawBtn(app, grp, dims, 0, 174, 64, 69, 29);
            this.drawBtn(app, grp, dims, 1, 252, 68, 68, 21);
            this.drawInputFld(app, grp, dims, 15, 36, 305, 22);
        } else {
            assertTrue(false, '2o|dialog not yet supported');
        }
    }

    /**
     * show the modal dialog, and cancel all outgoing events until it is closed.
     *
     * we'll temporarily replace *all* current listeners with the default UI512Presenter listeners.
     * because we replaced the idle event listener, we've basically frozen the app in its place.
     */
    showStandardModalDialog(pr: UI512Presenter, app: UI512Application, fnGetResult: (n: number) => void) {
        /* record the state, to be restored after dialog closes */
        let savedFocus = pr.getCurrentFocus();
        let savedCursor = UI512CursorAccess.getCursor();

        pr.mouseDragStatus = MouseDragStatus.None;
        pr.setCurrentFocus(this.dlgType === UI512CompStdDialogType.Ask ? this.getElId(`inputfld`) : undefined);
        UI512CursorAccess.setCursor(UI512Cursors.Arrow);
        let nChosen = -1;
        let whenComplete = () => {
            /* restore listeners and run the callback */
            eventRedirect.restoreInteraction(app, this.grpId);
            pr.setCurrentFocus(savedFocus);
            let grp = app.getGroup(this.grpId);
            let inputfld = grp.findEl(this.getElId(`inputfld`)) as UI512ElTextField;
            this.resultText = inputfld ? inputfld.get_ftxt().toUnformatted() : undefined;
            this.destroy(pr, app);
            fnGetResult(nChosen);
            UI512CursorAccess.setCursor(savedCursor);
        };

        /* redirect events */
        let eventRedirect = new TemporarilyRedirectForModal(whenComplete);
        pr.tmpIgnore = eventRedirect;
        eventRedirect.saveInteraction(app, this.grpId);
        eventRedirect.start(pr);
        addDefaultListeners(pr.listeners);

        /* if you clicked on a special 'cancel' rect, close the dialog */
        pr.listenEvent(UI512EventType.MouseDown, (_, d:MouseDownEventDetails) => {
            if (this.isCancelRect(d.mouseX, d.mouseY)) {
                nChosen = 3;
                eventRedirect.completed = true;
            }
        });

        /* if you clicked in a button, run the callback and close the dialog */
        pr.listenEvent(UI512EventType.MouseUp, (_, d:MouseUpEventDetails) => {
            nChosen = this.getWhichBtnFromClick(d);
            if (nChosen !== -1) {
                if (this.cbOnMouseUp) {
                    this.cbOnMouseUp(nChosen);
                }

                eventRedirect.completed = true;
            }
        });
    }

    /**
     * close the dialog
     */
    destroy(pr: UI512PresenterBase, app: UI512Application) {
        this.cbOnMouseUp = undefined;
        super.destroy(pr, app);
    }

    /**
     * did you click on a special 'cancel' rect
     */
    protected isCancelRect(x: number, y: number) {
        for (let cancelBtnBound of this.cancelBtnBounds) {
            if (
                RectUtils.hasPoint(
                    x,
                    y,
                    cancelBtnBound[0],
                    cancelBtnBound[1],
                    cancelBtnBound[2],
                    cancelBtnBound[3]
                )
            ) {
                return true;
            }
        }
    }

    /**
     * which button was clicked
     */
    protected getWhichBtnFromClick(d: MouseUpEventDetails) {
        let theId = d.elClick ? d.elClick.id : '';
        let userId = this.fromFullId(theId);
        if (userId === 'choicebtn0') {
            return 0;
        } else if (userId === 'choicebtn1') {
            return 1;
        } else if (userId === 'choicebtn2') {
            return 2;
        } else {
            return -1;
        }
    }

    /**
     * get dimensions
     */
    getFullDimensions() {
        let w: number;
        let h: number;
        let yratio: number;
        if (this.dlgType === UI512CompStdDialogType.Answer) {
            w = 344;
            h = 156 - 11;
            yratio = 0.275;
        } else if (this.dlgType === UI512CompStdDialogType.Ask) {
            w = 338;
            h = 106;
            yratio = 0.3;
        } else {
            throw makeUI512Error(`2n|unknown dialog type ${this.dlgType}`);
        }

        const screenh = ScreenConsts.ScreenHeight;
        const screenw = ScreenConsts.ScreenWidth;

        /* centered horizontally */
        let x = Math.floor((screenw - w) / 2);

        /* partway down from the top */
        let y = Math.floor(screenh * yratio);
        return [x, y, w, h];
    }
}

/**
 * redirect all events, including the onIdle event, in effect pausing everything
 */
class TemporarilyRedirectForModal extends TemporarilyIgnoreEvents {
    completed = false;
    savedMouseInteraction: { [key: string]: boolean } = {};
    constructor(public callback: () => void) {
        super();
    }

    /**
     * record the mouse interaction for groups
     */
    saveInteraction(app: UI512Application, grpid: string) {
        assertTrue(app.findGroup(grpid), '2m|current grp not found');
        for (let grp of app.iterGrps()) {
            if (grp.id !== grpid) {
                this.savedMouseInteraction[grp.id] = grp.enableMouseInteraction;
                grp.enableMouseInteraction = false;
            }
        }
    }

    /**
     * restore the mouse interaction for groups
     */
    restoreInteraction(app: UI512Application, grpid: string) {
        for (let grp of app.iterGrps()) {
            if (this.savedMouseInteraction[grp.id] !== undefined) {
                grp.enableMouseInteraction = this.savedMouseInteraction[grp.id];
            }
        }
    }

    /**
     * when asked if we are ready to close the dialog
     */
    shouldRestore(ms: number) {
        return this.completed;
    }

    /**
     * called when dialog is closed
     */
    whenComplete() {
        this.callback();
    }
}

/**
 * which type of dialog
 */
export enum UI512CompStdDialogType {
    Ask,
    Answer
}

