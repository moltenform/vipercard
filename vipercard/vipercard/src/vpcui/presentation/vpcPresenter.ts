
/* auto */ import { VpcValN, VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { VpcScriptMessage } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { SelectToolMode, VpcAppUIToolSelectBase } from './../tools/vpcToolSelectBase';
/* auto */ import { VpcStateSerialize } from './../state/vpcStateSerialize';
/* auto */ import { GuessStackTrace } from './../../vpc/codeexec/vpcScriptExecTop';
/* auto */ import { VpcNonModalReplBox } from './../nonmodaldialogs/vpcReplMessageBox';
/* auto */ import { VpcPresenterInit } from './vpcPresenterInit';
/* auto */ import { OrdinalOrPosition, VpcBuiltinMsg, VpcElType, VpcErr, VpcTool, VpcToolCtg, checkThrow, checkThrowInternal, checkThrowNotifyMsg, cleanExceptionMsg, getToolCategory, vpcElTypeShowInUI } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { StackOrderHelpers } from './../../vpc/vel/velStackOrderHelpers';
/* auto */ import { VpcGettableSerialization } from './../../vpc/vel/velSerialization';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { VpcElSizable } from './../../vpc/vel/velBase';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { UI512CursorAccess, UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { RenderComplete, SetToInvalidObjectAtEndOfExecution, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O, callDebuggerIfNotInProduction, tostring, trueIfDefinedAndNotNull } from './../../ui512/utils/util512Base';
/* auto */ import { assertWarn, ensureDefined } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, longstr } from './../../ui512/utils/util512';
/* auto */ import { UI512CompModalDialog } from './../../ui512/composites/ui512ModalDialog';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { FocusChangedEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElTextField } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { UI512DrawText } from './../../ui512/drawtext/ui512DrawText';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * main ViperCard presentation object
 */
export class VpcPresenter extends VpcPresenterInit {
    /**
     * get the current card number
     */
    getCurrentCardNum() {
        let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        return StackOrderHelpers.getCardStackPosition(this.vci.getModel().stack, currentCardId);
    }

    /**
     * from tool to the corresponding tool response object
     */
    getToolResponse(t: VpcTool) {
        return ensureDefined(this.tlNumToResponse[t], 'Kl|not found', t);
    }

    /**
     * set the current tool
     * this is the only place that should be able to directly set the tool
     * you must call this rather than modifying 'currentTool' directly
     */
    setTool(nextTl: VpcTool) {
        let prevTl = this.getTool();
        if (nextTl !== prevTl) {
            if (prevTl === VpcTool.Browse) {
                this.vci.getCodeExec().forceStopRunning();
            }

            let prevResp = this.getToolResponse(prevTl);
            this.vci.undoableAction(() => prevResp.onLeaveTool());

            let nextResp = this.getToolResponse(nextTl);
            this.vci.undoableAction(() => nextResp.onOpenTool());
            if (nextTl === VpcTool.Stamp || prevTl === VpcTool.Stamp) {
                this.rebuildFieldScrollbars();
            }

            this.lyrPaintRender.deleteTempPaintEls();
            this.setCurrentFocus(undefined);

            /* especially important when going from edit to browse,
            let's say you've set the enabled of a button to false,
            need to redo modelRender so that it is actually
                enabled==false not just enabledstyle */
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
    setCurCardNoOpenCardEvt(nextId: string) {
        this.vci.undoableAction(() => {
            /* verify card exists */
            this.vci.getModel().getCardById(nextId);

            /* go to the card */
            let wasCard = this.vci.getOptionS('currentCardId');
            this.vci.getModel().productOpts.allowSetCurrentCard = true;
            this.vci.setOption('currentCardId', nextId);
            this.vci.getModel().productOpts.allowSetCurrentCard = false;

            if (wasCard !== nextId) {
                /* remember history, for go back and go forth */
                let suspended = this.vci.getCodeExec().globals.find('internalvpcmovecardimplsuspendhistory');
                if (suspended === undefined || suspended.readAsString() !== '1') {
                    this.vci.getCodeExec().cardHistory.append(nextId);
                }
            }

            /* turn this off, so it's never stuck on indefinitely */
            this.vci.getCodeExec().globals.set('internalvpcmovecardimplsuspendhistory', VpcValN(0));
        });
    }

    /**
     * schedules an event that will eventually set the current card,
     * including sending closecard + opencard events
     */
    beginSetCurCardWithOpenCardEvt(pos: OrdinalOrPosition, idSpecific: O<string>) {
        checkThrow(false, 'nyi');
        //~ this.vci
        //~ .getCodeExec()
        //~ .runMsgBoxCodeOrThrow(`go to card id ${targetCardId}`, tostring(this.getCurrentCardNum()), false);
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
     * select command  (implemented, unless a script selects a
     *      different field and comes back quickly)
     */
    beginScheduleFldOpenCloseEvent(evt: FocusChangedEventDetails) {
        if (evt.idPrev === evt.idNext || this.getTool() !== VpcTool.Browse || evt.skipCloseFieldMsg) {
            return;
        }

        if (evt.idPrev) {
            this.beginScheduleFldOpenCloseEventClose(evt.idPrev);
        }

        if (evt.idNext) {
            this.beginScheduleFldOpenCloseEventOpen(evt.idNext);
        }
    }

    /**
     * schedule the closefield event(s)
     */
    beginScheduleFldOpenCloseEventClose(prevElId: string) {
        /* note, findElIdToVel returns undefined if vel is on a different card, ok for now
        since people's closeField scripts probably assume we are on the card anyways */
        let prevVel = this.lyrModelRender.findElIdToVel(prevElId);
        if (prevVel && prevVel.getType() === VpcElType.Fld) {
            if (this.vci.getCodeExec().fieldsRecentlyEdited.val[prevVel.idInternal]) {
                /* closefield called if changes made in the field */
                let msg = new VpcScriptMessage(prevVel.idInternal, VpcBuiltinMsg.Closefield);
                this.vci.getCodeExec().scheduleCodeExec(msg);

                this.vci.getCodeExec().fieldsRecentlyEdited.val[prevVel.idInternal] = false;
            } else {
                /* exitfield called if no changes were made in the field */
                let msg = new VpcScriptMessage(prevVel.idInternal, VpcBuiltinMsg.Exitfield);
                this.vci.getCodeExec().scheduleCodeExec(msg);
            }
        }
    }

    /**
     * schedule the openfield event
     */
    beginScheduleFldOpenCloseEventOpen(nextId: string) {
        /* note, findElIdToVel returns undefined if vel is on a different card, ok for now
        since people's openField scripts probably assume we are on the card anyways */
        let vel = this.lyrModelRender.findElIdToVel(nextId);
        if (vel && vel.getType() === VpcElType.Fld) {
            let msg = new VpcScriptMessage(vel.idInternal, VpcBuiltinMsg.Openfield);
            this.vci.getCodeExec().scheduleCodeExec(msg);
        }
    }

    /**
     * respond to a script error,
     * might be either a compile error
     * or a runtime error
     */
    defaultShowScriptErr(scriptErr: VpcErr) {
        this.vci.getCodeExec().forceStopRunning();

        this.vci.undoableAction(() => {
            /* by leaving browse tool we won't hit other errors / try to run closeCard or openCard */
            this.vci.setTool(VpcTool.Button);
            /* if there wasn't a velid set, use current card */
            let velId = scriptErr.scriptErrVelid ?? this.vci.getModel().getCurrentCard().idInternal;
            let lineNum = scriptErr.scriptErrLine ?? 1;
            let msg = cleanExceptionMsg(scriptErr.clsAsErr());

            /* did this come from the messagebox? note that
            we've already applied changes from dynamicCodeOrigin */
            if (velId === 'messagebox') {
                if (this.lyrNonModalDlgHolder.current && this.lyrNonModalDlgHolder.current instanceof VpcNonModalReplBox) {
                    this.lyrNonModalDlgHolder.current.onScriptErr(scriptErr);
                } else {
                    this.answerMsg(msg);
                }

                return;
            }

            /* move to the card where the error happened. */
            /* for example "send myevent to btn 4 of cd 5" */
            /* if there is an error in that script, we need to be on cd 5 to edit that script */
            {
                let vel = this.vci.getModel().findByIdUntyped(velId);
                if (vel?.getType() === VpcElType.Btn || vel?.getType() === VpcElType.Fld) {
                    let parentCard = this.vci.getModel().getParentCardOfElement(vel);
                    this.vci.setCurCardNoOpenCardEvt(parentCard.idInternal);
                } else if (vel?.getType() === VpcElType.Card) {
                    this.vci.setCurCardNoOpenCardEvt(vel.idInternal);
                } else if (vel instanceof VpcElBg) {
                    if (
                        this.vci.getModel().getByIdUntyped(this.vci.getModel().getCurrentCard().idInternal).parentIdInternal !==
                            vel.idInternal &&
                        vel.cards.length
                    ) {
                        this.vci.setCurCardNoOpenCardEvt(vel.cards[0].idInternal);
                    }
                } else if (vel?.getType() !== VpcElType.Stack) {
                    /* for example, error in standardlib,
                    or script error from a deleted object (which is fine) */
                    let s = `script err in id${velId} line${lineNum} ${msg}`;
                    console.error(s);
                    callDebuggerIfNotInProduction(s);
                    /* fall back to current card */
                    velId = this.vci.getModel().getCurrentCard().idInternal;
                    lineNum = 1;
                }
            }

            /* set the runtime flags */
            this.vci.setOption('selectedVelId', velId);
            this.vci.setOption('viewingScriptVelId', velId);

            /* open the code editor at the offending line */
            this.lyrPropPanel.updateUI512Els();
            let gst = new GuessStackTrace(this.vci.getCodeExec(), this.vci.getOutside());
            let renderedTrace = gst.goAsString(velId, lineNum, scriptErr.traceInfo);
            this.lyrPropPanel.editor.setLastErrInfo(velId, msg, lineNum, scriptErr.stage, renderedTrace);
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
        assertWarn(this.app.findEl('mainModalDlg##modaldialog##dlgprompt'), 'Ki|expect to have been created');
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
        assertWarn(this.app.findEl('mainModalDlg##modaldialog##dlgprompt'), 'Kh|expect to have been created');
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
        return this && this.vci && this.vci.getCodeExec && this.vci.getCodeExec() && this.vci.getCodeExec().isCodeRunning();
    }

    /**
     * main render method
     */
    render(canvas: CanvasWrapper, ms: number, cmpTotal: RenderComplete): boolean {
        //~ this.lyrModelRender.checkIfScreenWasJustUnlocked();
        let shouldUpdate = this.lyrModelRender.needUIToolsRedraw || /* bool */ this.lyrModelRender.needFullRedraw;

        /* we used to put a finally here to ensure that needFullRedraw is
        always set to false even if an exception ocurrs. we did this to
        prevent continous exception dialogs. now that we let
        the user ignore exception messages, I don't think it's necessary.
        */
        if (shouldUpdate) {
            this.updateUI512ElsAllLayers();
            this.refreshCursor();
        }

        this.lyrModelRender.needUIToolsRedraw = false;
        this.lyrModelRender.needFullRedraw = false;
        return super.render(canvas, ms, cmpTotal);
    }

    /**
     * refresh the cursor, looks up mouse position
     */
    refreshCursor() {
        let elUnderCursor = this.app.coordsToElement(this.trackMouse[0], this.trackMouse[1]);
        let isCursorWithinDocument =
            trueIfDefinedAndNotNull(elUnderCursor) && this.lyrModelRender.isVelOrBaseLayer(elUnderCursor.id);
        this.refreshCursorElemKnown(elUnderCursor, isCursorWithinDocument);
    }

    /**
     * refresh cursor
     * note: is a no-op if cursor hasn't changed, so feel free to call this
     */
    refreshCursorElemKnown(el: O<UI512Element>, isDocumentEl: boolean) {
        if (this.vci.getCodeExec().isCodeRunning()) {
            /* always set it to hand. why?
            because currently hand is a css cursor that will never lag slowly
            if the script is really busy running things. */
            UI512CursorAccess.setCursor(UI512Cursors.hand);
            return;
        }

        if (isDocumentEl) {
            let tl = this.getTool();
            let curs = this.getToolResponse(tl).whichCursor(tl, el);
            UI512CursorAccess.setCursor(curs);
        } else {
            if (el && el instanceof UI512ElTextField && el.getB('canedit')) {
                UI512CursorAccess.setCursor(UI512Cursors.lbeam);
            } else {
                UI512CursorAccess.setCursor(UI512Cursors.arrow);
            }
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
        if (this.isDocDirty() && !this.cameFromDemoSoNeverPromptSave.length) {
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
        this.vci = SetToInvalidObjectAtEndOfExecution(this.vci);
        this.runtime = SetToInvalidObjectAtEndOfExecution(this.runtime);
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
            checkThrowNotifyMsg(false, 'U9|Pasting this type of element is not yet supported.');
        } else {
            checkThrowNotifyMsg(false, 'U8|Nothing has been copied.');
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
            checkThrowInternal(false, '6E|wrong type ' + type);
        }

        let newX = this.userBounds[0] + Util512Higher.getRandIntInclusiveWeak(20, 200);
        let newY = this.userBounds[1] + Util512Higher.getRandIntInclusiveWeak(20, 200);
        let vel = this.vci.getOutside().CreatePart(type, newX, newY, w, h);
        vel.setOnVel(
            'name',
            longstr(`my ${vpcElTypeShowInUI(vel.getType())}
             ${this.vci.getModel().stack.getNextNumberForElemName(this.vci.getModel())}`),
            this.vci.getModel()
        );

        if (type === VpcElType.Btn) {
            /* give it a style and initial script */
            vel.setProp('style', VpcValS('roundrect'), this.vci.getModel());
            vel.setOnVel('label', lng('lngNew Button'), this.vci.getModel());
            vel.setOnVel('showlabel', true, this.vci.getModel());
            vel.setOnVel('script', 'on mouseUp\n\tanswer "the button was clicked."\nend mouseUp', this.vci.getModel());
        } else {
            /* need to give it content, since we don't currently
            draw the lines, otherwise you'd see nothing there */
            let velFld = vel as VpcElField;
            let newTxt = FormattedText.newFromSerialized(
                UI512DrawText.setFont('abcde\nabcde\nabcde', velFld.getDefaultFontAsUi512())
            );

            velFld.setCardFmTxt(newTxt, this.vci.getModel());
            velFld.setProp('style', VpcValS('scrolling'), this.vci.getModel());
        }

        /* save *before* setting selectedVelId */
        this.lyrPropPanel.saveChangesToModel(false);
        this.lyrPropPanel.updateUI512Els();
        this.vci.setOption('selectedVelId', vel.idInternal);
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
            checkThrow(dupeSizable instanceof VpcElSizable, 'Ke|');
            VpcGettableSerialization.copyPropsOver(orig, dupe);

            /* move it a bit */
            let amtToMove = Util512Higher.getRandIntInclusiveWeak(10, 50);
            dupeSizable.setDimensions(
                Math.min(ScreenConsts.xAreaWidth, dupe.getN('x') + amtToMove),
                Math.min(ScreenConsts.yAreaHeight, dupe.getN('y') + amtToMove),
                dupe.getN('w'),
                dupe.getN('h'),
                this.vci.getModel()
            );
        } else {
            checkThrowNotifyMsg(false, "U7|Can't paste this.");
        }
    }

    /**
     * run undo/redo
     * more complex than you'd think,
     * because some user actions 'feel' like changes even though they don't change
     * the state, and we should still treat those as undoable.
     */
    protected runUndoOrRedo(fn: () => boolean, msgIfFalse: string, isUndo: boolean) {
        /* if we selected/moved something, it "feels" like we moved
        it even though we haven't committed anything. so calling undo
        in this case should just cancel selection and not step backwards. */
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
                let currentCard = this.vci.getModel().findById(VpcElCard, currentCardId);
                if (!currentCard) {
                    assertWarn(false, 'U6|card has been deleted, going to card 1 instead.');
                    let card = this.vci.getModel().stack.bgs[0].cards[0].idInternal;
                    this.vci.setCurCardNoOpenCardEvt(card);
                }

                /* refresh everything */
                this.lyrModelRender.fullRedrawNeeded();
            });
        } else {
            checkThrowNotifyMsg(false, lng(msgIfFalse));
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
            this.answerMsg(cleanExceptionMsg(e));
        }

        this.lyrModelRender.uiRedrawNeeded();
    }

    /**
     * dispatch the menu action
     */
    performMenuActionImpl(s: string) {
        let method = Util512.isMethodOnClass(this.menuActions, 'go' + Util512.capitalizeFirst(s));
        if (method !== undefined) {
            method.apply(this.menuActions, [this.vci]);
        } else if (s === 'mnuPasteCardOrVel') {
            this.pasteVel();
        } else {
            this.menuActions.fallbackToSetToolOrSetFont(s)
        }
    }

    /**
     * get complete state as a string
     */
    getSerializedStack() {
        let serialized = VpcStateSerialize.serializeAll(this.vci);
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
    writeToReplMessageBox(s: string, returnFocus: boolean): void {
        if (this.lyrNonModalDlgHolder.current && this.lyrNonModalDlgHolder.current instanceof VpcNonModalReplBox) {
            if (returnFocus) {
                this.lyrNonModalDlgHolder.current.returnFocus();
            } else {
                this.lyrNonModalDlgHolder.current.appendToOutput(s, false);
            }
        }
    }
}
