
/* auto */ import { VpcValN, VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { VpcScriptErrorBase, VpcScriptMessage } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { SelectToolMode, VpcAppUIToolSelectBase } from './../tools/vpcToolSelectBase';
/* auto */ import { VpcStateSerialize } from './../state/vpcStateSerialize';
/* auto */ import { VpcNonModalReplBox } from './../nonmodaldialogs/vpcReplMessageBox';
/* auto */ import { VpcPresenterInit } from './vpcPresenterInit';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { OrdinalOrPosition, VpcBuiltinMsg, VpcElType, VpcTool, VpcToolCtg, getToolCategory, vpcElTypeShowInUI } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcGettableSerialization } from './../../vpc/vel/velSerialization';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { VpcElSizable } from './../../vpc/vel/velBase';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { UI512CursorAccess, UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { msgNotification } from './../../ui512/utils/util512Productname';
/* auto */ import { RenderComplete, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O, UI512ErrorHandling, assertTrue, assertTrueWarn, checkThrow, cleanExceptionMsg, makeVpcInternalErr, throwIfUndefined, trueIfDefinedAndNotNull } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512 } from './../../ui512/utils/util512';
/* auto */ import { UI512CompModalDialog } from './../../ui512/composites/ui512ModalDialog';
/* auto */ import { FormattedText } from './../../ui512/draw/ui512FormattedText';
/* auto */ import { FocusChangedEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { UI512DrawText } from './../../ui512/draw/ui512DrawText';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/**
 * main ViperCard presentation object
 */
export class VpcPresenter extends VpcPresenterInit {
    /**
     * get the current card number
     */
    getCurrentCardNum() {
        let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        return this.vci.getModel().stack.getCardStackPosition(currentCardId);
    }

    /**
     * from tool to the corresponding tool response object
     */
    getToolResponse(t: VpcTool) {
        return throwIfUndefined(this.tlNumToResponse[t.valueOf()], 'Kl|not found', t);
    }

    /**
     * get the current tool
     */
    getTool(): VpcTool {
        return this.vci.getOptionN('currentTool');
    }

    /**
     * set the current tool
     * this is the only place that should be able to directly set the tool
     * you must call this rather than modifying 'currentTool' directly
     */
    setTool(nextTl: VpcTool) {
        let prevTl = this.getTool();
        if (nextTl !== prevTl) {
            let prevResp = this.getToolResponse(prevTl);
            this.vci.undoableAction(() => prevResp.onLeaveTool());

            let nextResp = this.getToolResponse(nextTl);
            this.vci.undoableAction(() => nextResp.onOpenTool());
            if (nextTl === VpcTool.Stamp || prevTl === VpcTool.Stamp) {
                this.rebuildFieldScrollbars();
            }

            this.lyrPaintRender.deleteTempPaintEls();
            this.setCurrentFocus(undefined);

            /* especially important when going from edit to browse, */
            /* let's say you've set the enabled of a button to false, */
            /* need to redo modelRender so that it is actually enabled==false not just enabledstyle */
            this.lyrModelRender.fullRedrawNeeded();

            this.vci.getModel().productOpts.allowSetCurrentTool = true;
            this.vci.setOption('currentTool', nextTl);
            this.vci.getModel().productOpts.allowSetCurrentTool = false;

            this.refreshCursor();
        }
    }

    /**
     * set the current card, without sending any closecard or opencard events
     */
    setCurCardNoOpenCardEvt(nextId:string) {
        this.vci.undoableAction(() => {
            /* verify card exists */
            this.vci.getModel().getById(nextId, VpcElCard)

            /* go to the card */
            let wasCard = this.vci.getOptionS('currentCardId')
            this.vci.getModel().productOpts.allowSetCurrentCard = true;
            this.vci.setOption('currentCardId', nextId);
            this.vci.getModel().productOpts.allowSetCurrentCard = false;

            if (wasCard !== nextId) {
                /* remember history, for go back and go forth */
                let suspended = this.vci.getCodeExec().globals.find('internalvpcgocardimplsuspendhistory')
                if (suspended === undefined || suspended.readAsString() !== '1') {
                    this.vci.getCodeExec().cardHistory.append(nextId)
                }
            }

            /* turn this off, so it's never stuck on indefinitely */
            this.vci.getCodeExec().globals.set('internalvpcgocardimplsuspendhistory', VpcValN(0))
        });
    }

    /**
     * schedules an event that will eventually set the current card, including sending closecard + opencard events
     */
    beginSetCurCardWithOpenCardEvt(pos: OrdinalOrPosition, idSpecific:O<string>) {
        assertTrue(!idSpecific || pos === OrdinalOrPosition.This, "specifying an id, should set to This")
        let targetCardId = idSpecific ? idSpecific : this.vci.getModel().getCardRelative(pos)
        if (this.getTool() === VpcTool.Browse) {
            this.vci.getCodeExec().globals.set('internalvpcbeginsetcurcardwithopencardevtparam', VpcValS(targetCardId))
            let stack = this.vci.getModel().stack
            let msg = new VpcScriptMessage(stack.id, VpcBuiltinMsg.__Custom, "internalvpcbeginsetcurcardwithopencardevt");
            this.vci.getCodeExec().scheduleCodeExec(msg);
        } else {
            this.setCurCardNoOpenCardEvt(targetCardId)
        }
    }

    /**
     * implement sending closeField/openField event
     *
     * places this should ideally be called, if browse tool is active:
     * clicking outside field
     * move to different field via tab key
     * press Enter key
     * go to a different card
     * press Cmd+Z to undo (not yet implemented)
     * quitting the program (not yet implemented)
     * select command  (implemented, unless a script selects a different field and comes back quickly)
     */
    beginScheduleFldOpenCloseEvent(evt: FocusChangedEventDetails) {
        if (evt.idPrev === evt.idNext || this.getTool() !== VpcTool.Browse || evt.skipCloseFieldMsg) {
            return
        }

        if (evt.idPrev) {
            this.beginScheduleFldOpenCloseEventClose(evt.idPrev)
        }

        if (evt.idNext) {
            this.beginScheduleFldOpenCloseEventOpen(evt.idNext)
        }
    }

    /**
     * schedule the closefield event(s)
     */
    beginScheduleFldOpenCloseEventClose(prevElId: string) {
        /* note, findElIdToVel returns undefined if vel is on a different card, ok for now
        since people's closeField scripts probably assume we are on the card anyways */
        let prevVel = this.lyrModelRender.findElIdToVel(prevElId)
        if (prevVel && prevVel.getType() === VpcElType.Fld) {
            if (this.vci.getCodeExec().fieldsRecentlyEdited.val[prevVel.id]) {
                /* closefield called if changes made in the field */
                let msg = new VpcScriptMessage(prevVel.id, VpcBuiltinMsg.Closefield);
                this.vci.getCodeExec().scheduleCodeExec(msg);

                this.vci.getCodeExec().fieldsRecentlyEdited.val[prevVel.id] = false
            } else {
                /* exitfield called if no changes were made in the field */
                let msg = new VpcScriptMessage(prevVel.id, VpcBuiltinMsg.Exitfield);
                this.vci.getCodeExec().scheduleCodeExec(msg);
            }
        }
    }

    /**
     * schedule the openfield event
     */
    beginScheduleFldOpenCloseEventOpen(nextId:string) {
        /* note, findElIdToVel returns undefined if vel is on a different card, ok for now
        since people's openField scripts probably assume we are on the card anyways */
        let vel = this.lyrModelRender.findElIdToVel(nextId)
        if (vel && vel.getType() === VpcElType.Fld) {
            let msg = new VpcScriptMessage(vel.id, VpcBuiltinMsg.Openfield);
            this.vci.getCodeExec().scheduleCodeExec(msg);
        }
    }

    /**
     * from script error, to an appropriate site of the error location
     */
    static commonRespondToError(vci: VpcStateInterface, scriptErr: VpcScriptErrorBase):[string, number, string, number] {
        let NoteThisIsDisabledCode = 1;
        return ['', 0, '', 0]
        //~ /* use current card if velId is unknown */
        //~ let origVelId = scriptErr.velId;
        //~ origVelId = coalesceIfFalseLike(origVelId, vci.getModel().getCurrentCard().id);
        //~ let origVel = vci.getModel().findByIdUntyped(origVelId);
        //~ origVel = coalesceIfFalseLike(origVel, vci.getModel().getCurrentCard());
        //~ let origLine = scriptErr.lineNumber

        //~ /* by leaving browse tool we won't execute closeCard or openCard */
        //~ vci.setTool(VpcTool.Button);

        //~ /* redirect line number if this came from 'send' or 'do' */
        //~ let script = origVel.getS('script')
        //~ let [redirredVelId, redirredLine] = VpcExecFrame.getBetterLineNumberIfTemporary(script, origVel.id, origLine)
        //~ let redirredVel = vci.getModel().findByIdUntyped(redirredVelId) ?? origVel;

        //~ /* update the error object */
        //~ scriptErr.velId = redirredVel.id
        //~ scriptErr.lineNumber = redirredLine

        //~ /* strip temporary code from both locations:
        //~ so we're not stuck with bad syntax,
        //~ and we don't show temp code in editor */
        //~ for (let vid of [origVelId, redirredVelId]) {
            //~ let v = vci.getModel().getByIdUntyped(vid);
            //~ if (v.getType() !== VpcElType.Product) {
                //~ let s = v.getS('script')
                //~ s = VpcExecFrame.filterTemporaryFromScript(s)
                //~ v.set('script', s)
            //~ }
        //~ }


        //~ return [origVelId, origLine, redirredVelId, redirredLine]
    }

    /**
     * respond to a script error,
     * might be either a compile error
     * or a runtime error
     */
    showError(scriptErr: VpcScriptErrorBase) {
        this.vci.getCodeExec().forceStopRunning();

        this.vci.undoableAction(() => {
            let [origVelId, origLine, velId, line] = VpcPresenter.commonRespondToError(this.vci, scriptErr)

            /* did this come from the messagebox? */
            if (line === VpcNonModalReplBox.markMessageBox) {
                if (
                    this.lyrNonModalDlgHolder.current &&
                    this.lyrNonModalDlgHolder.current instanceof VpcNonModalReplBox
                ) {
                    this.lyrNonModalDlgHolder.current.onScriptErr(scriptErr);
                }

                return;
            }

            /* move to the card where the error happened. */
            /* for example "send myevent to btn 4 of cd 5" */
            /* if there is an error in that script, we need to be on cd 5 to edit that script */
            let vel = this.vci.getModel().getByIdUntyped(velId);
            let parentCard = this.vci.getModel().getParentCardOfElement(vel)
            this.vci.setCurCardNoOpenCardEvt(parentCard.id)

            /* set the runtime flags */
            this.vci.getCodeExec().lastEncounteredScriptErr = scriptErr;
            this.vci.setOption('selectedVelId', vel.id);
            this.vci.setOption('viewingScriptVelId', vel.id);

            /* open the code editor at the offending line */
            this.lyrPropPanel.updateUI512Els();
            this.lyrPropPanel.editor.refreshFromModel(this.app);
            this.lyrPropPanel.editor.scrollToErrorPosition(this);
        });
    }

    /**
     * create modal dialog instance
     */
    protected getModalDlg() {
        checkThrow(!this.app.findEl('mainModalDlg##modaldialog##dlgprompt'), 'Kj|dialog box already shown');

        let modalDlg = new UI512CompModalDialog('mainModalDlg');
        let stopBtnElId = this.lyrToolboxes.toolsNav.getElId('choice##cardNumOrStop');
        let stopBtn = this.app.getEl(stopBtnElId);
        modalDlg.cancelBtnBounds = [
            /* you can exit the dlg by clicking Stop */
            [stopBtn.x, stopBtn.y, stopBtn.w, stopBtn.h],
            [
                /* you can also exit the dlg by clicking different tool */
                this.lyrToolboxes.toolsMain.x,
                this.lyrToolboxes.toolsMain.y,
                this.lyrToolboxes.toolsMain.logicalWidth,
                this.lyrToolboxes.toolsMain.logicalHeight
            ]
        ];

        return modalDlg;
    }

    /**
     * show "answer" modal dialog.
     *
     * after calling this, it'd best not run other code until the dialog is closed,
     * since all the event handlers are suspended, and accidentally causing another
     * dialog will show an assert in getModalDlg()
     */
    answerMsg(prompt: string, fnOnResult?: (n: number) => void, choice1?: string, choice2?: string, choice3?: string) {
        let tl = this.getToolResponse(this.getTool());
        tl.cancelCurrentToolAction();
        let dlg = this.getModalDlg();
        dlg.standardAnswer(this, this.app, prompt, fnOnResult, choice1 ?? '', choice2 ?? '', choice3 ?? '');
        assertTrueWarn(this.app.findEl('mainModalDlg##modaldialog##dlgprompt'), 'Ki|expect to have been created');
    }

    /**
     * show "ask" modal dialog, getting a string from user.
     *
     * after calling this, it'd best not run other code until the dialog is closed,
     * since all the event handlers are suspended, and accidentally causing another
     * dialog will show an assert in getModalDlg()
     */
    askMsg(prompt: string, defText: string, fnOnResult: (ret: O<string>, n: number) => void) {
        let tl = this.getToolResponse(this.getTool());
        tl.cancelCurrentToolAction();
        let dlg = this.getModalDlg();
        dlg.standardAsk(this, this.app, prompt, defText, fnOnResult);
        assertTrueWarn(this.app.findEl('mainModalDlg##modaldialog##dlgprompt'), 'Kh|expect to have been created');
    }

    /**
     * wrapper around answerMsg as async
     */
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

    /**
     * wrapper around askMsg as async
     */
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

    /**
     * tell every layer to update its UI
     */
    updateUI512ElsAllLayers() {
        try {
            this.runtime.opts.lock(true);
            this.vci.getModel().productOpts.lock(true);
            for (let i = 0, len = this.layers.length; i < len; i++) {
                this.layers[i].updateUI512Els();
            }
        } finally {
            this.runtime.opts.lock(false);
            this.vci.getModel().productOpts.lock(false);
        }
    }

    /**
     * returns true if code is currently running
     */
    isCodeRunning() {
        return (
            this && this.vci && this.vci.getCodeExec && this.vci.getCodeExec() && this.vci.getCodeExec().isCodeRunning()
        );
    }

    /**
     * main render method
     */
    render(canvas: CanvasWrapper, ms: number, cmpTotal: RenderComplete) {
        this.lyrModelRender.checkIfScreenWasJustUnlocked();
        let shouldUpdate = this.lyrModelRender.needUIToolsRedraw || this.lyrModelRender.needFullRedraw;

        /* set flags saying we don't need to render again -- even if render() fails.
        so we don't get stuck in any annoying assert loops.
        (otherwise if something in updateUI512ElsAllLayers failed,
        needUIToolsRedraw would never get set, and we'd hit the failure repeatedly) */
        try {
            if (shouldUpdate) {
                this.updateUI512ElsAllLayers();
                this.refreshCursor();
            }
        } finally {
            this.lyrModelRender.needUIToolsRedraw = false;
            this.lyrModelRender.needFullRedraw = false;
        }

        super.render(canvas, ms, cmpTotal);
    }

    /**
     * refresh the cursor, looks up mouse position
     */
    refreshCursor() {
        let elUnderCursor = this.app.coordsToElement(this.trackMouse[0], this.trackMouse[1]);
        let isCursorWithinDocument = trueIfDefinedAndNotNull(elUnderCursor) && this.lyrModelRender.isVelOrBg(elUnderCursor.id);
        this.refreshCursorElemKnown(elUnderCursor, isCursorWithinDocument);
    }

    /**
     * refresh cursor
     * note: is a no-op if cursor hasn't changed, so feel free to call this
     */
    refreshCursorElemKnown(el: O<UI512Element>, isDocumentEl: boolean) {
        if (isDocumentEl) {
            let tl = this.getTool();
            let curs = this.getToolResponse(tl).whichCursor(tl, el);
            UI512CursorAccess.setCursor(curs);
        } else {
            UI512CursorAccess.setCursor(UI512Cursors.Arrow);
        }
    }

    /**
     * is the document dirty?
     */
    isDocDirty() {
        return (
            this &&
            this.vci &&
            this.vci.getCurrentStateId() !== '(justOpened)' &&
            this.vci.getCurrentStateId() !== this.vci.getOptionS('lastSavedStateId')
        );
    }

    /**
     * exit the stack, after asking user if they are sure
     */
    exit(dest: string) {
        if (this.isDocDirty()) {
            this.answerMsg(
                lng('lngReminder that unsaved changes will be lost.\nContinue?'),
                n => {
                    if (n === 0) {
                        this.exitImpl(dest);
                    }
                },
                lng('lngOK'),
                lng('lngCancel')
            );
        } else {
            this.exitImpl(dest);
        }
    }

    /**
     * exit the stack
     */
    protected exitImpl(dest: string) {
        /* no longer need url change warning */
        this.teardownBeforeUnloadWarning();

        /* scribble over everything to make sure no-one reuses it. */
        this.listeners = [];
        this.vci.destroy();
        this.vci = undefined as any; /* destroy() */
        this.runtime = undefined as any; /* destroy() */
        if (dest === 'mnuNewStack') {
            this.cbExitToNewDocument();
        } else if (dest === 'mnuOpen') {
            this.cbExitToOpen(false);
        } else if (dest === 'openFromMyStacks') {
            this.cbExitToOpen(true);
        } else {
            this.cbExitToMainMenu();
        }
    }

    /**
     * paste vel that was copied
     */
    pasteVel() {
        let id = this.vci.getOptionS('copiedVelId');
        let found = this.vci.getModel().findByIdUntyped(id);
        if (found && (found.getType() === VpcElType.Btn || found.getType() === VpcElType.Fld)) {
            this.pasteVelImpl(id);
        } else if (id && id.length) {
            throw makeVpcInternalErr(msgNotification + lng('lngPasting this type of element is not yet supported.'));
        } else {
            throw makeVpcInternalErr(msgNotification + lng('lngNothing has been copied.'));
        }
    }

    /**
     * user clicked 'New button' in the ui
     */
    makePart(type: VpcElType) {
        /* make a button that is tall enough to show an icon */
        const defaultBtnW = 100;
        const defaultBtnH = 58;
        const defaultFldW = 100;
        const defaultFldH = 100;
        let w = 0;
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

        let newX = this.userBounds[0] + Util512Higher.getRandIntInclusiveWeak(20, 200);
        let newY = this.userBounds[1] + Util512Higher.getRandIntInclusiveWeak(20, 200);
        let vel = this.vci.getOutside().CreatePart(type, newX, newY, w, h);
        vel.set(
            'name',
            `my ${vpcElTypeShowInUI(vel.getType())} ${this.vci.getModel().stack.getNextNumberForElemName()}`
        );

        if (type === VpcElType.Btn) {
            /* give it a style and initial script */
            vel.setProp('style', VpcValS('roundrect'), this.vci.getOptionS('currentCardId'));
            vel.set('label', lng('lngNew Button'));
            vel.set('showlabel', true);
            vel.set('script', 'on mouseUp\n\tanswer "the button was clicked."\nend mouseUp');
        } else {
            /* need to give it content, since we don't currently
            draw the lines, otherwise you'd see nothing there */
            let velFld = vel as VpcElField;
            let newTxt = FormattedText.newFromSerialized(
                UI512DrawText.setFont('abcde\nabcde\nabcde', velFld.getDefaultFontAsUi512())
            );

            velFld.setCardFmTxt(this.vci.getOptionS('currentCardId'), newTxt);
            velFld.setProp('style', VpcValS('scrolling'), this.vci.getOptionS('currentCardId'));
        }

        /* save *before* setting selectedVelId */
        this.lyrPropPanel.saveChangesToModel(false);
        this.lyrPropPanel.updateUI512Els();
        this.vci.setOption('selectedVelId', vel.id);
        this.vci.setOption('viewingScriptVelId', '');

        /* update before tool is set */
        this.lyrPropPanel.updateUI512Els();
        this.setTool(type === VpcElType.Btn ? VpcTool.Button : VpcTool.Field);
        return vel;
    }

    /**
     * paste implementation
     */
    pasteVelImpl(originalid: string) {
        let orig = this.vci.getModel().findByIdUntyped(originalid);
        if (orig && (orig.getType() === VpcElType.Btn || orig.getType() === VpcElType.Fld)) {
            let dupe = this.makePart(orig.getType());
            let dupeSizable = dupe as VpcElSizable;
            checkThrow(dupeSizable && dupeSizable.isVpcElSizable, 'Ke|');
            VpcGettableSerialization.copyPropsOver(orig, dupe);

            /* move it a bit */
            let amtToMove = Util512Higher.getRandIntInclusiveWeak(10, 50);
            dupeSizable.setDimensions(
                Math.min(ScreenConsts.xAreaWidth, dupe.getN('x') + amtToMove),
                Math.min(ScreenConsts.yAreaHeight, dupe.getN('y') + amtToMove),
                dupe.getN('w'),
                dupe.getN('h')
            );
        } else {
            throw makeVpcInternalErr(msgNotification + lng("lngCan't paste this."));
        }
    }

    /**
     * run undo/redo
     * more complex than you'd think,
     * because some user actions 'feel' like changes even though they don't change
     * the state, and we should still treat those as undoable.
     */
    protected runUndoOrRedo(fn: () => boolean, msgIfFalse: string, isUndo: boolean) {
        /* if we selected/moved something, it "feels" like we moved it even though we */
        /* haven't committed anything. so calling undo in this case should just cancel selection and not step backwards. */
        let tl = this.getToolResponse(this.getTool());
        if (isUndo && tl instanceof VpcAppUIToolSelectBase && tl.st && tl.st.mode !== SelectToolMode.SelectingRegion) {
            this.vci.doWithoutAbilityToUndoExpectingNoChanges(() => {
                tl.cancelCurrentToolAction();
                this.lyrModelRender.uiRedrawNeeded();
            });

            return;
        }

        /* did we just type something into properties... */
        /* if so it feels more intuitive to not actually undo, but just erase the recent change. */
        if (isUndo && getToolCategory(this.getTool()) === VpcToolCtg.CtgEdit) {
            let areThereUnsavedChanges = false;
            this.vci.doWithoutAbilityToUndoExpectingNoChanges(() => {
                areThereUnsavedChanges = this.lyrPropPanel.areThereUnsavedChanges();
            });

            if (areThereUnsavedChanges) {
                this.lyrPropPanel.updateUI512Els();
                this.lyrModelRender.uiRedrawNeeded();
                return;
            }
        }

        this.vci.doWithoutAbilityToUndoExpectingNoChanges(() => {
            /* cancel tool action, i.e. you were in the middle of drawing a shape */
            tl.cancelCurrentToolAction();
            this.lyrModelRender.fullRedrawNeeded();
            this.lyrNonModalDlgHolder.setNonModalDialog(undefined);
        });

        let done = fn();
        if (done) {
            this.vci.doWithoutAbilityToUndo(() => {
                /* check that the current card still exists, otherwise go to first card */
                let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
                let currentCard = this.vci.getModel().findById(currentCardId, VpcElCard);
                if (!currentCard) {
                    assertTrueWarn(false, "card has been deleted, going to card 1 instead.")
                    let card = this.vci.getModel().getCardRelative(OrdinalOrPosition.First);
                    this.vci.setCurCardNoOpenCardEvt(card)
                }

                /* refresh everything */
                this.lyrModelRender.fullRedrawNeeded();
            });
        } else {
            throw makeVpcInternalErr(msgNotification + lng(msgIfFalse));
        }
    }

    /**
     * perform a menu action, and show a nicer user friendly
     * dialog if an exception is thrown
     */
    performMenuAction(s: string) {
        if (this.isCodeRunning()) {
            return;
        }

        let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow
        UI512ErrorHandling.breakOnThrow = false;

        try {
            if (s === 'mnuUndo') {
                this.runUndoOrRedo(() => this.vci.performUndo(), 'lngNothing to undo.', true);
            } else if (s === 'mnuRedo') {
                this.runUndoOrRedo(() => this.vci.performRedo(), 'lngNothing to redo.', false);
            } else if (s === 'mnuClear') {
                this.vci.undoableAction(() => this.performMenuActionImpl(s));
            } else {
                let tl = this.getToolResponse(this.getTool());
                tl.cancelCurrentToolAction();
                this.vci.undoableAction(() => this.performMenuActionImpl(s));
            }
        } catch (e) {
            this.answerMsg(cleanExceptionMsg(e.message));
        } finally {
            UI512ErrorHandling.breakOnThrow = storedBreakOnThrow;
        }

        this.lyrModelRender.uiRedrawNeeded();
    }

    /**
     * dispatch the menu action
     */
    performMenuActionImpl(s: string) {
        let method = Util512.isMethodOnClass(this.menuActions, 'go' + Util512.capitalizeFirst(s));
        if (method !== undefined) {
            /* eslint-disable-next-line ban/ban */
            method.apply(this.menuActions, [this.vci]);
        } else if (s === 'mnuObjectsNewBtn') {
            this.makePart(VpcElType.Btn);
        } else if (s === 'mnuObjectsNewFld') {
            this.makePart(VpcElType.Fld);
        } else if (s === 'mnuPasteCardOrVel') {
            this.pasteVel();
        } else if (s === 'mnuClear') {
            this.getToolResponse(this.getTool()).onDeleteSelection();
        } else if (!this.menuActions.runFontMenuActionsIfApplicable(s)) {
            assertTrueWarn('could not recognize menu command', s, '6D|');
        }
    }

    /**
     * get complete state as a string
     */
    getSerializedStack() {
        let serializer = new VpcStateSerialize();
        let serialized = serializer.serializeAll(this.vci);
        return JSON.stringify(serialized);
    }

    /**
     * queueRefreshCursor, someone has told us we need to refresh the cursor
     */
    queueRefreshCursor(): void {
        this.cursorRefreshPending = true;
    }

    /**
     * append text to the message box
     * ignored if the message box is not currently open
     */
    writeToReplMessageBox(s:string):void {
        if (
            this.lyrNonModalDlgHolder.current &&
            this.lyrNonModalDlgHolder.current instanceof VpcNonModalReplBox
        ) {
            this.lyrNonModalDlgHolder.current.appendToOutput(s, false)
        }
    }
}
