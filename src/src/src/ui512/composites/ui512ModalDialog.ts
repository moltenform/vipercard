
/* auto */ import { O, assertTrue, makeUI512Error } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512CursorAccess, UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { MouseDragStatus, UI512EventType } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512elementsgroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512elementslabel.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512elementsbutton.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512elementstextfield.js';
/* auto */ import { MouseDownEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { TemporaryIgnoreEvents } from '../../ui512/menu/ui512menuanimation.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512textevents.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512presenterbase.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512presenter.js';
/* auto */ import { UI512CompBase } from '../../ui512/composites/ui512composites.js';

export enum UI512CompStdDialogType {
    ask,
    answer,
}

export class UI512CompStdDialog extends UI512CompBase {
    compositeType = 'modaldialog';
    dlgtype = UI512CompStdDialogType.answer;
    labeltext = '';
    btnlabels = ['', '', ''];
    cancelBtnBounds: number[][] = [];
    cbOnMouseUp: O<(btn: number) => void>;
    translatedProvidedText = '';
    resultText: O<string>;
    constructor(compid: string, protected lang: UI512Lang) {
        super(compid);
    }

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
        if (this.btnlabels[n]) {
            let btn = this.genBtn(app, grp, `choicebtn${n}`);
            btn.set('style', n === 0 ? UI512BtnStyle.osdefault : UI512BtnStyle.osstandard);
            btn.set('autohighlight', true);
            btn.set('labeltext', this.btnlabels[n]);
            btn.setDimensions(x + dims[0], y + dims[1], w, h);
        }
    }

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
        fld.setftxt(FormattedText.newFromUnformatted(this.translatedProvidedText));

        // select all
        fld.set('selcaret', 0);
        fld.set('selend', fld.get_ftxt().len());

        // without this adjustment, the text appears too high.
        // the real fix is to have vertically-aligned text, but since the product doesn't support
        // a text-edit with vertically-aligned text, it's probably not the effort to write+test.
        fld.set('nudgey', 2);
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        const marginx = this.dlgtype === UI512CompStdDialogType.ask ? 15 : 16;
        const marginy = this.dlgtype === UI512CompStdDialogType.ask ? 13 : 16;
        let grp = app.getGroup(this.grpid);
        let bg = this.genBtn(app, grp, 'bgbtn');
        bg.set('style', UI512BtnStyle.osboxmodal);
        bg.set('autohighlight', false);
        let dims = this.getFullDimensions();
        bg.setDimensions(dims[0], dims[1], dims[2], dims[3]);

        let prompt = this.genChild(app, grp, 'dlgprompt', UI512ElLabel);
        prompt.set('labeltext', this.labeltext);
        prompt.set('labelwrap', true);
        prompt.setDimensionsX1Y1(
            dims[0] + marginx,
            dims[1] + marginy,
            dims[0] + dims[2] - marginx,
            dims[1] + dims[3] - marginy
        );

        this.btnlabels[0] = this.btnlabels[0] || this.lang.translate('lngOK');
        if (this.dlgtype === UI512CompStdDialogType.answer) {
            this.drawBtn(app, grp, dims, 0, 230, 105, 99, 28);
            this.drawBtn(app, grp, dims, 1, 126, 108, 91, 20);
            this.drawBtn(app, grp, dims, 2, 19, 108, 91, 20);
        } else if (this.dlgtype === UI512CompStdDialogType.ask) {
            this.resultText = undefined;
            this.drawBtn(app, grp, dims, 0, 174, 64, 69, 29);
            this.drawBtn(app, grp, dims, 1, 252, 68, 68, 21);
            this.drawInputFld(app, grp, dims, 15, 36, 305, 22);
        } else {
            assertTrue(false, '2o|dialog not yet supported');
        }
    }

    destroy(c: UI512ControllerBase, app: UI512Application) {
        this.cbOnMouseUp = undefined;
        super.destroy(c, app);
    }

    autoRegisterAndSuppressAndRestore(

        ctrl: UI512Controller,
        app: UI512Application,
        fnGetResult: (n: number) => void
    ) {
        // this might be overly powerful. but it is convenient.
        // we'll temporarily replace *all* current listeners with the default UI512Controller listeners.
        // because we replaced the idle event listener, we've basically frozen the app in its place.
        ctrl.mouseDragStatus = MouseDragStatus.None;
        let savedFocus = ctrl.getCurrentFocus();
        let savedCursor = UI512CursorAccess.getCursor();
        ctrl.setCurrentFocus(this.dlgtype === UI512CompStdDialogType.ask ? this.getElId(`inputfld`) : undefined);
        UI512CursorAccess.setCursor(UI512Cursors.arrow);
        let nChosen = -1;
        let whenComplete = () => {
            eventFilter.restoreInteraction(app, this.grpid);
            ctrl.setCurrentFocus(savedFocus);
            let grp = app.getGroup(this.grpid);
            let inputfld = grp.findEl(this.getElId(`inputfld`)) as UI512ElTextField;
            this.resultText = inputfld ? inputfld.get_ftxt().toUnformatted() : undefined;
            this.destroy(ctrl, app);
            fnGetResult(nChosen);
            UI512CursorAccess.setCursor(savedCursor);
        };

        let eventFilter = new IgnoreDuringModalDialog(whenComplete);
        ctrl.tmpIgnore = eventFilter;
        eventFilter.saveInteraction(app, this.grpid);
        eventFilter.capture(ctrl);
        addDefaultListeners(ctrl.listeners);
        ctrl.listenEvent(UI512EventType.MouseDown, (c: UI512Controller, d: MouseDownEventDetails) => {
            for (let cancelBtnBound of this.cancelBtnBounds) {
                if (
                    RectUtils.hasPoint(
                        d.mouseX,
                        d.mouseY,
                        cancelBtnBound[0],
                        cancelBtnBound[1],
                        cancelBtnBound[2],
                        cancelBtnBound[3]
                    )
                ) {
                    nChosen = 3;
                    eventFilter.completed = true;
                }
            }
        });

        ctrl.listenEvent(UI512EventType.MouseUp, (c: UI512Controller, d: MouseUpEventDetails) => {
            nChosen = this.getWhichBtnFromClick(d);
            if (nChosen !== -1) {
                if (this.cbOnMouseUp) {
                    this.cbOnMouseUp(nChosen);
                }

                eventFilter.completed = true;
            }
        });
    }

    getWhichBtnFromClick(d: MouseUpEventDetails) {
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

    getFullDimensions() {
        let w: number;
        let h: number;
        let yratio: number;
        if (this.dlgtype === UI512CompStdDialogType.answer) {
            w = 344;
            h = 156 - 11;
            yratio = 0.275;
        } else if (this.dlgtype === UI512CompStdDialogType.ask) {
            w = 338;
            h = 106;
            yratio = 0.3;
        } else {
            throw makeUI512Error(`2n|unknown dialog type ${this.dlgtype}`);
        }

        const screenh = ScreenConsts.screenheight;
        const screenw = ScreenConsts.screenwidth;

        // centered horizontally
        let x = Math.floor((screenw - w) / 2);

        // partway down from the top
        let y = Math.floor(screenh * yratio);
        return [x, y, w, h];
    }

    standardAnswer(

        c: UI512Controller,
        app: UI512Application,
        prompt: string,
        fnOnResult?: (n: number) => void,
        choice1 = '',
        choice2 = '',
        choice3 = ''
    ) {
        fnOnResult = fnOnResult || (() => {});
        this.dlgtype = UI512CompStdDialogType.answer;
        this.btnlabels = [choice1, choice2, choice3];
        this.labeltext = prompt;
        this.resultText = '';
        this.create(c, app, this.lang);
        this.autoRegisterAndSuppressAndRestore(c, app, fnOnResult);
    }

    standardAsk(

        c: UI512Controller,
        app: UI512Application,
        prompt: string,
        defText: string,
        fnOnResult: (ret: O<string>, n: number) => void
    ) {
        this.dlgtype = UI512CompStdDialogType.ask;
        this.translatedProvidedText = defText;
        this.resultText = '';
        this.btnlabels = [this.lang.translate('lngOK'), this.lang.translate('lngCancel'), ''];
        this.labeltext = prompt;
        this.create(c, app, this.lang);
        let cb = (n: number) => {
            fnOnResult(n === 0 ? this.resultText : undefined, n);
        };

        this.autoRegisterAndSuppressAndRestore(c, app, cb);
    }
}

class IgnoreDuringModalDialog extends TemporaryIgnoreEvents {
    completed = false;
    savedMouseInteraction: { [key: string]: boolean } = {};
    constructor(public callback: () => void) {
        super();
    }

    saveInteraction(app: UI512Application, grpid: string) {
        assertTrue(app.findGroup(grpid), '2m|current grp not found');
        for (let grp of app.iterGrps()) {
            if (grp.id !== grpid) {
                this.savedMouseInteraction[grp.id] = grp.enableMouseInteraction;
                grp.enableMouseInteraction = false;
            }
        }
    }

    restoreInteraction(app: UI512Application, grpid: string) {
        for (let grp of app.iterGrps()) {
            if (this.savedMouseInteraction[grp.id] !== undefined) {
                grp.enableMouseInteraction = this.savedMouseInteraction[grp.id];
            }
        }
    }

    shouldRestore(ms: number) {
        return this.completed;
    }

    whenComplete() {
        this.callback();
    }
}
