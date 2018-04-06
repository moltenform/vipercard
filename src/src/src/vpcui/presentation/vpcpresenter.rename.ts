
/* auto */ import { O, UI512ErrorHandling, assertTrue, assertTrueWarn, checkThrow, cleanExceptionMsg, makeVpcInternalErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, Root, Util512, getEnumToStrOrUnknown } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512CursorAccess, UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512drawtext.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512CompStdDialog } from '../../ui512/composites/ui512modaldialog.js';
/* auto */ import { OrdinalOrPosition, VpcElType, VpcTool, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcScriptErrorBase } from '../../vpc/vpcutils/vpcutils.js';
/* auto */ import { VpcValS } from '../../vpc/vpcutils/vpcval.js';
/* auto */ import { VpcElBase, VpcElSizable } from '../../vpc/vel/velbase.js';
/* auto */ import { VpcUI512Serialization } from '../../vpc/vel/velserialize.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velfield.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velcard.js';
/* auto */ import { vpcElTypeAsSeenInName } from '../../vpc/vel/velresolvereference.js';
/* auto */ import { VpcSerialization } from '../../vpcui/state/vpcstateserialize.js';
/* auto */ import { VpcAppUIToolResponseBase } from '../../vpcui/tools/vpctoolbase.js';
/* auto */ import { SelectToolMode, VpcAppUIGeneralSelect } from '../../vpcui/tools/vpctoolselectbase.js';
/* auto */ import { VpcAppNonModalDialogReplBox } from '../../vpcui/nonmodaldialogs/vpcreplmessagebox.js';
/* auto */ import { VpcControllerInit } from '../../vpcui/presentation/vpcpresenterinit.js';

export class VpcAppController extends VpcControllerInit {
    showError(scriptErr: VpcScriptErrorBase) {
        this.appli.getCodeExec().forceStopRunning();

        this.appli.undoableAction(() => {
            // use current card if velid is unknown
            let velId = scriptErr.velid;
            velId = velId || this.appli.getModel().getCurrentCard().id;
            let vel = this.appli.getModel().findByIdUntyped(velId);
            vel = vel || this.appli.getModel().getCurrentCard();
            if (VpcElBase.isActuallyMsgRepl(vel)) {
                this.setTool(VpcTool.button);
                if (
                    this.lyrNonModalDlgHolder.current &&
                    this.lyrNonModalDlgHolder.current instanceof VpcAppNonModalDialogReplBox
                ) {
                    this.lyrNonModalDlgHolder.current.onScriptErr(scriptErr);
                }

                return;
            }

            // move to the right card if necessary.
            // for example "send myevent to btn 4 of cd 5"
            // if there is an error in that script, we need to be on cd 5 to edit that script
            if (vel.getType() === VpcElType.Card) {
                this.appli.setOption('currentCardId', vel.id);
            } else if (vel.getType() === VpcElType.Bg) {
                assertTrue(false, 'nyi');
            } else if (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld) {
                let parent = this.appli.getModel().findByIdUntyped(vel.parentId);
                if (parent && parent.getType() === VpcElType.Card) {
                    this.appli.setOption('currentCardId', parent.id);
                }
            }

            this.setTool(VpcTool.button);

            // set the runtime flags
            this.appli.getCodeExec().lastEncounteredScriptErr = scriptErr;
            this.appli.setOption('selectedVelId', vel.id);
            this.appli.setOption('viewingScriptVelId', vel.id);

            // open the code editor at the offending line
            this.lyrPropPanel.updateUI512Els(this.root);
            this.lyrPropPanel.editor.refreshFromModel(this.root, this.app);
            this.lyrPropPanel.editor.scrollToErrorPosition(this.root, this);
        });
    }

    getToolResponse(t: VpcTool) {
        let ctg = getToolCategory(t);
        let nm = 'tl' + getEnumToStrOrUnknown<VpcToolCtg>(VpcToolCtg, ctg);
        let tlresp = (this as any)[nm] as VpcAppUIToolResponseBase;
        if (!tlresp || !tlresp.isVpcAppUIToolResponseBase) {
            throw makeVpcInternalErr(`6G|not found ${nm} ${t}`);
        } else {
            return tlresp;
        }
    }

    setTool(next: VpcTool) {
        let was = this.getTool();
        if (next !== was) {
            let prevResp = this.getToolResponse(was);
            this.appli.undoableAction(() => prevResp.onLeaveTool(this.root));

            let nextResp = this.getToolResponse(next);
            this.appli.undoableAction(() => nextResp.onOpenTool(this.root));
            if (next === VpcTool.stamp || was === VpcTool.stamp) {
                this.rebuildFieldScrollbars();
            }

            this.lyrPaintRender.deleteTempPaintEls();
            this.setCurrentFocus(this.root, undefined);
            // especially important when going from edit to browse,
            // let's say you've set the enabled of a button to false,
            // need to redo modelRender so that it is actually enabled==false not just enabledstyle
            this.lyrModelRender.fullRedrawNeeded();

            this.appli.getModel().productOpts.allowSetCurrentTool = true;
            this.appli.setOption('currentTool', next);
            this.appli.getModel().productOpts.allowSetCurrentTool = false;

            // don't do this here, do this in the tool pallette mouseup instead
            // so when you are going through undo states, you'll see the script window and btn props window
            // this.appli.setOption('viewingScriptVelId', '')
            // this.appli.setOption("selectedVelId", '');
            this.refreshCursor();
        }
    }

    protected getModalDlg() {
        checkThrow(
            !this.app.findElemById('mainModalDlg##modaldialog##dlgprompt'),
            'internal error, dialog box already shown'
        );
        let modalDlg = new UI512CompStdDialog('mainModalDlg', this.lang);
        let stopelid = this.lyrToolboxes.toolsnav.getElId('choice##cardNumOrStop');
        let stopel = this.app.getElemById(stopelid);
        modalDlg.cancelBtnBounds = [
            [stopel.x, stopel.y, stopel.w, stopel.h],
            [
                this.lyrToolboxes.toolsmain.x,
                this.lyrToolboxes.toolsmain.y,
                this.lyrToolboxes.toolsmain.logicalWidth,
                this.lyrToolboxes.toolsmain.logicalHeight,
            ],
        ];
        return modalDlg;
    }

    // after calling this, you should exit the current handler and not run any other code,
    // because if other code is run that shows a dialog box, we'll throw an exception
    answerMsg(prompt: string, fnOnResult?: (n: number) => void, choice1?: string, choice2?: string, choice3?: string) {
        let resp = this.getToolResponse(this.getTool());
        resp.cancelCurrentToolAction();
        let modalDlg = this.getModalDlg();
        modalDlg.standardAnswer(
            this.root,
            this,
            this.app,
            prompt,
            fnOnResult,
            choice1 || '',
            choice2 || '',
            choice3 || ''
        );
        assertTrueWarn(this.app.findElemById('mainModalDlg##modaldialog##dlgprompt'), 'expect to have been created');
    }

    // after calling this, you should exit the current handler and not run any other code,
    // because if other code is run that shows a dialog box, we'll throw an exception
    askMsg(prompt: string, defText: string, fnOnResult: (ret: O<string>, n: number) => void) {
        let resp = this.getToolResponse(this.getTool());
        resp.cancelCurrentToolAction();
        let modalDlg = this.getModalDlg();
        modalDlg.standardAsk(this.root, this, this.app, prompt, defText, fnOnResult);
        assertTrueWarn(this.app.findElemById('mainModalDlg##modaldialog##dlgprompt'), 'expect to have been created');
    }

    askMsgAsync(prompt: string, defText: string): Promise<[O<string>, number]> {
        return new Promise<[O<string>, number]>((resolve, reject) => {
            try {
                this.askMsg(prompt, defText, (ret, n) => {
                    resolve([ret, n]);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    answerMsgAsync(prompt: string, choice1?: string, choice2?: string, choice3?: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                this.answerMsg(
                    prompt,
                    n => {
                        resolve(n);
                    },
                    choice1,
                    choice2,
                    choice3
                );
            } catch (e) {
                reject(e);
            }
        });
    }

    getTool(): VpcTool {
        return this.appli.getOption_n('currentTool');
    }

    getCurrentCardNum() {
        let currentCardId = this.appli.getModel().productOpts.get_s('currentCardId');
        return this.appli.getModel().stack.getCardStackPosition(currentCardId);
    }

    setCurrentCardNum(ord: OrdinalOrPosition) {
        this.appli.undoableAction(() => this.appli.getModel().goCardRelative(ord));
    }

    updateUI512ElsAllLayers() {
        try {
            this.runtime.opts.lock(true);
            this.appli.getModel().productOpts.lock(true);
            for (let layer of this.layers) {
                layer.updateUI512Els(this.root);
            }
        } finally {
            this.runtime.opts.lock(false);
            this.appli.getModel().productOpts.lock(false);
        }
    }

    isCodeRunning() {
        return (
            this &&
            this.appli &&
            this.appli.getCodeExec &&
            this.appli.getCodeExec() &&
            this.appli.getCodeExec().isCodeRunning()
        );
    }

    render(root: Root, canvas: CanvasWrapper, ms: number, cmptotal: RenderComplete) {
        this.lyrModelRender.checkIfScreenWasJustUnlocked();
        let shouldUpdate = this.lyrModelRender.needUIToolsRedraw || this.lyrModelRender.needFullRedraw;
        let er: any = undefined;
        if (shouldUpdate) {
            try {
                this.updateUI512ElsAllLayers();
                this.lyrModelRender.needUIToolsRedraw = false;
                this.refreshCursor();
            } catch (e) {
                // we'll throw the error afterwards
                // otherwise if there's an assert we'd get an unpleasant loop of asserts
                er = e;
            }
        }

        super.render(root, canvas, ms, cmptotal);
        if (er) {
            throw er;
        }
    }

    refreshCursor() {
        let elUnderCursor = this.app.coordsToElement(this.trackMouse[0], this.trackMouse[1]);
        let isCursorWithinDocument = !!elUnderCursor && this.lyrModelRender.isVelOrBg(elUnderCursor.id);
        this.refreshCursorElemKnown(elUnderCursor, isCursorWithinDocument);
    }

    refreshCursorElemKnown(el: O<UI512Element>, isDocumentEl: boolean) {
        if (isDocumentEl) {
            let tl = this.getTool();
            let curs = this.getToolResponse(tl).whichCursor(tl, el);
            UI512CursorAccess.setCursor(curs);
        } else {
            UI512CursorAccess.setCursor(UI512Cursors.arrow);
        }
    }

    isDocDirty() {
        return (
            this &&
            this.appli &&
            this.appli.getCurrentStateId() !== '(justopened)' &&
            this.appli.getCurrentStateId() !== this.appli.getOption_s('lastSavedStateId')
        );
    }

    exit(s: string) {
        let doExit = (n = 0) => {
            if (n === 0) {
                // scribble over everything to make sure no-one reuses it.
                this.listeners = [];
                this.appli.destroy();
                this.appli = undefined as any;
                this.runtime = undefined as any;
                if (s === 'mnuNewStack') {
                    this.cbExitToNewDocument();
                } else if (s === 'mnuOpen') {
                    this.cbExitToOpen(false);
                } else if (s === 'openFromMyStacks') {
                    this.cbExitToOpen(true);
                } else {
                    this.cbExitToMainMenu();
                }
            }
        };

        if (this.isDocDirty()) {
            this.answerMsg(
                this.lang.translate('lngReminder that unsaved changes will be lost.\nContinue?'),
                doExit,
                this.lang.translate('lngOK'),
                this.lang.translate('lngCancel')
            );
        } else {
            doExit();
        }
    }

    pasteCardVel() {
        let id = this.appli.getOption_s('copiedVelId');
        let found = this.appli.getModel().findByIdUntyped(id);
        if (found && (found.getType() === VpcElType.Btn || found.getType() === VpcElType.Fld)) {
            this.makePasteVel(id);
        } else if (id && id.length) {
            throw makeVpcInternalErr(
                'Simple Notification: ' + this.lang.translate('lngPasting this type of element is not yet supported.')
            );
        } else {
            throw makeVpcInternalErr('Simple Notification: ' + this.lang.translate('lngNothing has been copied.'));
        }
    }

    makePart(type: VpcElType) {
        const defaultBtnW = 100;
        const defaultBtnH = 58; // tall enough to show an icon
        const defaultFldW = 100;
        const defaultFldH = 100;
        let w = 0
        let h = 0;
        if (type === VpcElType.Btn) {
            w = defaultBtnW;
            h = defaultBtnH;
        } else if (type === VpcElType.Fld) {
            w = defaultFldW;
            h = defaultFldH;
        } else {
            throw makeVpcInternalErr('6E|wrong type ' + type);
        }

        let newX = this.userBounds[0] + Util512.getRandIntInclusiveWeak(20, 200);
        let newY = this.userBounds[1] + Util512.getRandIntInclusiveWeak(20, 200);
        let vel = this.appli.getOutside().CreatePart(type, newX, newY, w, h);
        vel.set(
            'name',
            `my ${vpcElTypeAsSeenInName(vel.getType())} ${this.appli.getModel().stack.getNextNumberForElemName()}`
        );
        if (type === VpcElType.Btn) {
            vel.setProp('style', VpcValS('roundrect'));
            vel.set('label', this.lang.translate('lngNew Button'));
            vel.set('showlabel', true);
            vel.set('script', 'on mouseUp\n\tanswer "the button was clicked."\nend mouseUp');
            this.appli.getCodeExec().updateChangedCode(vel, vel.get_s('script'));
        } else {
            let elfld = vel as VpcElField;
            let newtxt = FormattedText.newFromPersisted(
                TextRendererFontManager.setInitialFont('abcde\nabcde\nabcde', elfld.getDefaultFontAsUi512())
            );
            elfld.setftxt(newtxt);
            elfld.setProp('style', VpcValS('scrolling'));
        }

        // save *before* setting selectedVelId
        this.lyrPropPanel.saveChangesToModel(false);
        this.lyrPropPanel.updateUI512Els(this.root);
        this.appli.setOption('selectedVelId', vel.id);
        this.appli.setOption('viewingScriptVelId', '');
        // update before tool is set
        this.lyrPropPanel.updateUI512Els(this.root);
        this.setTool(type === VpcElType.Btn ? VpcTool.button : VpcTool.field);
        return vel;
    }

    makePasteVel(originalid: string) {
        let orig = this.appli.getModel().findByIdUntyped(originalid);
        if (orig && (orig.getType() === VpcElType.Btn || orig.getType() === VpcElType.Fld)) {
            let dupe = this.makePart(orig.getType());
            let dupeSizable = dupe as VpcElSizable;
            checkThrow(dupeSizable && dupeSizable.isVpcElSizable, '');
            VpcUI512Serialization.copyAttrsOver(orig, dupe, orig.getAttributesList());
            // move it a bit
            let amtToMove = Util512.getRandIntInclusiveWeak(10, 50);
            dupeSizable.setDimensions(
                Math.min(ScreenConsts.xareawidth, dupe.get_n('x') + amtToMove),
                Math.min(ScreenConsts.yareaheight, dupe.get_n('y') + amtToMove),
                dupe.get_n('w'),
                dupe.get_n('h')
            );
            // and compile its script too...
            this.appli.getCodeExec().updateChangedCode(dupe, dupe.get_s('script'));
        } else {
            throw makeVpcInternalErr('Simple Notification: ' + this.lang.translate("lngCan't paste this."));
        }
    }

    protected runUndoOrRedo(fn: () => boolean, msgIfFalse: string, isUndo: boolean) {
        // if we selected/moved something, it "feels" like we moved it even though we
        // haven't committed anything. so calling undo in this case should just cancel selection and not step backwards.
        let resp = this.getToolResponse(this.getTool());
        if (
            isUndo &&
            resp instanceof VpcAppUIGeneralSelect &&
            resp.state &&
            resp.state.mode !== SelectToolMode.SelectingRegion
        ) {
            this.appli.doWithoutAbilityToUndoExpectingNoChanges(() => {
                resp.cancelCurrentToolAction();
                this.lyrModelRender.uiRedrawNeeded();
            });
            return;
        }

        // did we just type something into properties...
        // if so it feels more intuitive to not actually undo, but just erase the recent change.
        if (isUndo && getToolCategory(this.getTool()) === VpcToolCtg.ctgEdit) {
            let areThereUnsavedChanges = false;
            this.appli.doWithoutAbilityToUndoExpectingNoChanges(() => {
                areThereUnsavedChanges = this.lyrPropPanel.areThereUnsavedChanges();
            });

            if (areThereUnsavedChanges) {
                this.lyrPropPanel.updateUI512Els(this.root);
                this.lyrModelRender.uiRedrawNeeded();
                return;
            }
        }

        this.appli.doWithoutAbilityToUndoExpectingNoChanges(() => {
            resp.cancelCurrentToolAction();
            this.lyrModelRender.fullRedrawNeeded();
            this.lyrNonModalDlgHolder.setNonModalDialog(undefined)
        });
        let done = fn();
        if (done) {
            this.appli.doWithoutAbilityToUndo(() => {
                // check that the current card still exists, otherwise go to first card
                let currentCardId = this.appli.getModel().productOpts.get_s('currentCardId');
                let currentCard = this.appli.getModel().findById(currentCardId, VpcElCard);
                if (!currentCard) {
                    this.appli.getModel().goCardRelative(OrdinalOrPosition.first);
                }

                // refresh everything
                this.lyrModelRender.fullRedrawNeeded();
            });
        } else {
            throw makeVpcInternalErr('Simple Notification: ' + this.lang.translate(msgIfFalse));
        }
    }

    performMenuAction(s: string) {
        if (this.isCodeRunning()) {
            return;
        }

        try {
            UI512ErrorHandling.breakOnThrow = false;
            if (s === 'mnuUndo') {
                this.runUndoOrRedo(() => this.appli.performUndo(), 'lngNothing to undo.', true);
            } else if (s === 'mnuRedo') {
                this.runUndoOrRedo(() => this.appli.performRedo(), 'lngNothing to redo.', false);
            } else {
                if (s !== 'mnuClear') {
                    let resp = this.getToolResponse(this.getTool());
                    resp.cancelCurrentToolAction();
                }

                this.appli.undoableAction(() => this.performMenuActionImpl(s));
            }
        } catch (e) {
            this.answerMsg(cleanExceptionMsg(e.message));
        } finally {
            UI512ErrorHandling.breakOnThrow = true;
        }

        this.lyrModelRender.uiRedrawNeeded();
    }

    performMenuActionImpl(s: string) {
        let method = (this.menuActions as any)['go_' + s];
        if (method !== undefined) {
            method.apply(this.menuActions, [this.appli]);
        } else if (s === 'mnuObjectsNewBtn') {
            this.makePart(VpcElType.Btn);
        } else if (s === 'mnuObjectsNewFld') {
            this.makePart(VpcElType.Fld);
        } else if (s === 'mnuPasteCardOrVel') {
            this.pasteCardVel();
        } else if (s === 'mnuClear') {
            this.getToolResponse(this.getTool()).onDeleteSelection();
        } else if (!this.menuActions.runFontMenuActionsIfApplicable(s)) {
            assertTrueWarn('could not recognize menu command', s, '6D|');
        }
    }

    getSerializedStack() {
        let serializer = new VpcSerialization();
        let serialized = serializer.serializeAll(this.appli);
        return JSON.stringify(serialized);
    }
}
