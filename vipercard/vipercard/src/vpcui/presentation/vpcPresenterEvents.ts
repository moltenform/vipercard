
/* auto */ import { O, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, cast, slength } from '../../ui512/utils/utils512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { EventDetails, IdleEventDetails, KeyDownEventDetails, KeyEventDetails, MenuItemClickedDetails, MouseDownDoubleEventDetails, MouseDownEventDetails, MouseEnterDetails, MouseEventDetails, MouseLeaveDetails, MouseMoveEventDetails, MouseUpEventDetails, PasteTextEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { MenuListeners } from '../../ui512/menu/ui512MenuListeners.js';
/* auto */ import { GenericTextField, UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { ScrollbarImpl } from '../../ui512/textedit/ui512Scrollbar.js';
/* auto */ import { BasicHandlers } from '../../ui512/textedit/ui512BasicHandlers.js';
/* auto */ import { UI512TextEvents } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { VpcBuiltinMsg, VpcTool, VpcToolCtg, getMsgFromEvtType, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcScriptMessage } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcExecFrame } from '../../vpc/codeexec/vpcScriptExecFrame.js';
/* auto */ import { TypeOfUndoAction, VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcModelRender, VpcTextFieldAsGeneric } from '../../vpcui/modelrender/vpcModelRender.js';
/* auto */ import { VpcAppUIToolSmear } from '../../vpcui/tools/vpcToolSmear.js';
/* auto */ import { VpcNonModalReplBox } from '../../vpcui/nonmodaldialogs/vpcReplMessageBox.js';
/* auto */ import { VpcPresenterInterface } from '../../vpcui/presentation/vpcPresenterInterface.js';

/**
 * ViperCard event handling
 */
export class VpcPresenterEvents {
    /**
     * register event handlers
     */
    static initEvents(pr: VpcPresenterInterface) {
        /* Currently, a running script can't cancel default behavior
        by handling an event and not running "exit to product",
        that's why I call it 'on afterkeydown' instead of 'on keydown'

        A running script can pass the event upwards (say to the current card) with "pass mouseUp"
        */

        /* we must route text changes to a vel instead of directly setting the UI512 element */
        let editTextBehavior = new EditTextBehaviorSendToVel(pr);

        pr.listeners[UI512EventType.MouseDown.valueOf()] = [
            BasicHandlers.trackMouseStatusMouseDown,
            BasicHandlers.trackCurrentElMouseDown,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondMouseDown,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseDown,
            MenuListeners.onMouseDown,
            editTextBehavior.onMouseDownScroll.bind(editTextBehavior),
            editTextBehavior.onMouseDownSelect.bind(editTextBehavior)
        ];

        pr.listeners[UI512EventType.MouseUp.valueOf()] = [
            BasicHandlers.trackMouseStatusMouseUp,
            BasicHandlers.trackCurrentElMouseUp,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            MenuListeners.onMouseUp,
            VpcPresenterEvents.respondMouseUp,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseUp,
            editTextBehavior.onMouseUp.bind(editTextBehavior)
        ];

        pr.listeners[UI512EventType.MouseMove.valueOf()] = [
            BasicHandlers.trackCurrentElMouseMove,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondMouseMove,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            editTextBehavior.onMouseMoveSelect.bind(editTextBehavior)
        ];

        pr.listeners[UI512EventType.MouseEnter.valueOf()] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.scheduleScriptEvent,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseEnter,
            MenuListeners.onMouseEnter
        ];

        pr.listeners[UI512EventType.MouseLeave.valueOf()] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.scheduleScriptEvent,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseLeave,
            MenuListeners.onMouseLeave
        ];

        pr.listeners[UI512EventType.MouseDownDouble.valueOf()] = [
            BasicHandlers.trackMouseDoubleDown,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.scheduleScriptEvent,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            editTextBehavior.onMouseDoubleDown.bind(editTextBehavior),
            VpcPresenterEvents.respondMouseDoubleDown
        ];

        pr.listeners[UI512EventType.KeyUp.valueOf()] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondKeyUp,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool
        ];

        pr.listeners[UI512EventType.KeyDown.valueOf()] = [
            BasicHandlers.basicKeyShortcuts,
            (_pr: VpcPresenterInterface, d: KeyDownEventDetails) =>
                VpcPresenterEvents.respondKeyDown(_pr, d, editTextBehavior),
            VpcPresenterEvents.cancelEvtIfNotBrowseTool
        ];

        pr.listeners[UI512EventType.PasteText.valueOf()] = [
            (_pr: VpcPresenterInterface, d: PasteTextEventDetails) => {
                _pr.vci.undoableAction(() => {
                    editTextBehavior.onPasteText(_pr, d);
                });
            }
        ];

        pr.listeners[UI512EventType.MenuItemClicked.valueOf()] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondMenuItemClicked
        ];

        pr.listeners[UI512EventType.FocusChanged.valueOf()] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning
        ];

        pr.listeners[UI512EventType.Idle.valueOf()] = [
            VpcPresenterEvents.respondIdle,
            BasicHandlers.onIdleRunCallbackQueueFromAsyncs,
            editTextBehavior.onIdle.bind(editTextBehavior)
        ];
    }

    /**
     * by calling setHandled, this stops event propagation
     */
    static cancelEvtIfCodeRunning(pr: VpcPresenterInterface, d: EventDetails) {
        if (pr.vci.isCodeRunning()) {
            let isElemStopRunning = d.getAffectedElements().some(el => pr.lyrToolboxes.isElemStopRunning(el));
            if (!isElemStopRunning) {
                d.setHandled();
            }
        }
    }

    /**
     * if we're not in the browse tool,
     * when you click on a vel button it shouldn't have any response
     * without this check here, you'd be able to click on a vel button even when
     * you are in the pencil tool
     */
    static cancelEvtIfNotBrowseTool(pr: VpcPresenterInterface, d: EventDetails) {
        let isVel = d.getAffectedElements().some(item => !!pr.lyrModelRender.elIdToVelId(item.id));
        if (isVel && pr.vci.getTool() !== VpcTool.Browse) {
            d.setHandled();
        }
    }

    /**
     * double-click the eraser tool to erase all paint on the screen
     */
    static respondMouseDoubleDown(pr: VpcPresenterInterface, d: MouseDownDoubleEventDetails) {
        pr.vci.undoableAction(() => {
            if (d.el && d.el.id) {
                let short = pr.lyrToolboxes.toolsMain.fromFullId(d.el.id);
                if (short && short.endsWith('##eraser')) {
                    pr.vci.setTool(VpcTool.Eraser);
                    let tl = cast(pr.getToolResponse(VpcTool.Eraser), VpcAppUIToolSmear);
                    tl.clearAllPaint();
                }
            }
        });
    }

    /**
     * send mousedown event to the current tool
     */
    static respondMouseDown(pr: VpcPresenterInterface, d: MouseDownEventDetails) {
        pr.vci.undoableAction(() => {
            if (d.button === 0) {
                let isUserElOrBg = !!d.el && !!pr.lyrModelRender.isVelOrBg(d.el.id);
                pr.getToolResponse(pr.vci.getTool()).respondMouseDown(pr.vci.getTool(), d, isUserElOrBg);
                pr.lyrNonModalDlgHolder.respondMouseDown(d);

                /* change focus on click, to make the property panel commit */
                let wasFocused = pr.getCurrentFocus();
                pr.setCurrentFocus(undefined);
                pr.setCurrentFocus(wasFocused);
            }
        });
    }

    /**
     * send mouseup event to the current tool, and any layers that need to respond to it
     */
    static respondMouseUp(pr: VpcPresenterInterface, d: MouseUpEventDetails) {
        pr.vci.undoableAction(() => {
            if (d.button === 0) {
                let isUserElOrBg = d.getAffectedElements().some(item => !!pr.lyrModelRender.isVelOrBg(item.id));
                pr.getToolResponse(pr.vci.getTool()).respondMouseUp(pr.vci.getTool(), d, isUserElOrBg);
                pr.lyrNonModalDlgHolder.respondMouseUp(d);
                pr.lyrToolboxes.toolsMain.respondMouseUp(pr.app, d);
                pr.lyrToolboxes.toolsPatterns.respondMouseUp(pr.app, d);
                pr.lyrToolboxes.toolsNav.respondMouseUp(pr.app, d);
                pr.lyrCoverArea.respondMouseUp(d);
            }
        });
    }

    /**
     * send mousemove event t ocurrent tool
     */
    static respondMouseMove(pr: VpcPresenterInterface, d: MouseMoveEventDetails) {
        let isUserElOrBg = d.getAffectedElements().some(item => !!pr.lyrModelRender.isVelOrBg(item.id));
        pr.getToolResponse(pr.vci.getTool()).respondMouseMove(pr.vci.getTool(), d, isUserElOrBg);
        let isNextAVelOrBg = !!d.elNext && !!pr.lyrModelRender.isVelOrBg(d.elNext.id);
        if (d.elNext !== d.elPrev) {
            pr.refreshCursorElemKnown(d.elNext, isNextAVelOrBg);
        }
    }

    /**
     * respond to keyboard shortcuts for undo and redo
     */
    protected static checkIfUndoRedo(pr: VpcPresenterInterface, d: KeyDownEventDetails) {
        /* these must be done outside of a undoableAction() block */
        if (!d.handled() && !pr.vci.isCodeRunning() && !d.repeated) {
            if (d.readableShortcut === 'Cmd+Z') {
                pr.vci.performMenuAction('mnuUndo');
                d.setHandled();
            } else if (d.readableShortcut === 'Cmd+Y') {
                pr.vci.performMenuAction('mnuRedo');
                d.setHandled();
            }
        }
    }

    /**
     * respond to keydown event
     */
    static respondKeyDown(pr: VpcPresenterInterface, d: KeyDownEventDetails, ed: EditTextBehaviorSendToVel) {
        VpcPresenterEvents.checkIfUndoRedo(pr, d);
        if (d.handled()) {
            return;
        }

        pr.vci.undoableAction(() => {
            let currentFocus = pr.getCurrentFocus();

            /* menu action */
            let translated = pr.lyrMenus.translateHotkey(d);
            if (!pr.vci.isCodeRunning() && !d.handled() && translated) {
                if (translated.startsWith('onlyIfNotInTextField/')) {
                    if (currentFocus) {
                        translated = undefined;
                    } else {
                        translated = translated.substr('onlyIfNotInTextField/'.length);
                    }
                }

                if (translated) {
                    pr.vci.performMenuAction(translated);
                    d.setHandled();
                }
            }

            if (
                !pr.vci.isCodeRunning() &&
                !d.handled() &&
                currentFocus &&
                scontains(currentFocus, 'VpcPanelScriptEditor##editor') &&
                getToolCategory(pr.vci.getTool()) === VpcToolCtg.CtgEdit &&
                slength(pr.vci.getOptionS('viewingScriptVelId'))
            ) {
                /* code editor keyboard shortcuts */
                pr.lyrPropPanel.editor.respondKeydown(d);
            }

            if (!pr.vci.isCodeRunning() && !d.handled()) {
                /* non-modal dialog keyboard shortcuts */
                pr.lyrNonModalDlgHolder.respondKeyDown(d);
            }

            if (!pr.vci.isCodeRunning() && !d.handled() && getToolCategory(pr.vci.getTool()) === VpcToolCtg.CtgEdit) {
                /* prop panel keyboard shortcuts */
                pr.lyrPropPanel.respondKeydown(d);
            }

            if (!pr.vci.isCodeRunning() && !d.handled()) {
                ed.onKeyDown(pr, d);
            }

            if (!pr.vci.isCodeRunning() && !d.handled() && pr.vci.getTool() === VpcTool.Browse) {
                VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d);
            }

            if (!d.handled() && pr.vci.isCodeRunning()) {
                d.setHandled();
            }
        });
    }

    /**
     * schedule a script event
     */
    static scheduleScriptEvent(pr: VpcPresenterInterface, d: EventDetails) {
        VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d);
    }

    /**
     * send keyup to current script
     */
    static respondKeyUp(pr: VpcPresenterInterface, d: EventDetails) {
        if (!d.handled() && pr.vci.getTool() === VpcTool.Browse) {
            VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d);
        }

        if (!d.handled() && pr.vci.isCodeRunning()) {
            d.setHandled();
        }
    }

    /**
     * respond to menu item
     */
    static respondMenuItemClicked(pr: VpcPresenterInterface, d: MenuItemClickedDetails) {
        pr.vci.performMenuAction(d.id);
    }

    /**
     * on idle (this event is continuously sent)
     */
    static respondIdle(pr: VpcPresenterInterface, d: IdleEventDetails) {
        let curtool = pr.vci.getTool();
        let codeRunning = pr.vci.isCodeRunning();
        if (pr.cursorRefreshPending && pr.trackMouse[0] !== -1 && pr.trackMouse[1] !== -1) {
            pr.refreshCursor();
            pr.cursorRefreshPending = false;
        }

        if (!d.handled() && codeRunning && curtool !== VpcTool.Browse) {
            pr.vci.getCodeExec().forceStopRunning();
        }

        if (!d.handled() && curtool === VpcTool.Browse) {
            /* run scripts. note that anything a script does is undoable. */
            pr.timerRunScript.update(d.milliseconds);
            if (pr.timerRunScript.isDue()) {
                pr.timerRunScript.reset();
                pr.vci.undoableAction(
                    () => pr.vci.getCodeExec().runTimeslice(pr.runScriptTimeslice),
                    TypeOfUndoAction.StartReusableAction
                );
            }
        }

        if (!d.handled() && codeRunning) {
            d.setHandled();
        }

        if (!d.handled()) {
            /* mousewithin events are currently only sent a few times a second to not overwhelm system with events */
            pr.timerSendMouseWithin.update(d.milliseconds);
            if (pr.timerSendMouseWithin.isDue()) {
                pr.timerSendMouseWithin.reset();
                if (curtool === VpcTool.Browse) {
                    /* send mousewithin */
                    VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d, pr.trackMouse[0], pr.trackMouse[1]);
                }
            }
        }

        if (!d.handled()) {
            /* should be fairly fast, not adding anything to a queue, if there is no handler. */
            /* send onidle event to script */
            if (curtool === VpcTool.Browse) {
                VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d, -1, -1);
            }
        }

        if (!d.handled()) {
            /* good, the caret won't be blinking in a text field when script is running */
            pr.timerBlinkMarquee.update(d.milliseconds);
            if (pr.timerBlinkMarquee.isDue()) {
                pr.timerBlinkMarquee.reset();
                pr.tlctgLasso.blinkSelection();
                pr.tlctgRectSelect.blinkSelection();
            }
        }

        if (!d.handled()) {
            /* run maintenance */
            pr.timerRunMaintenance.update(d.milliseconds);
            if (pr.timerRunMaintenance.isDue()) {
                pr.timerRunMaintenance.reset();
                Util512.showWarningIfExceptionThrown(() => pr.lyrPaintRender.doMaintenance())
                Util512.showWarningIfExceptionThrown(() => pr.vci.getCodeExec().doMaintenance())
                Util512.showWarningIfExceptionThrown(() => VpcPresenterEvents.filterTemporaryFromAllScripts(pr))
            }
        }
    }

    /**
     * remove temporary handlers from scripts, so they don't accumulate indefinitely
     */
    static filterTemporaryFromAllScripts(pr: VpcPresenterInterface) {
        if (!pr.vci.isCodeRunning()) {
            pr.vci.undoableAction(() =>
                VpcExecFrame.filterTemporaryFromAllScripts(pr.vci.getModel()))
        }
    }

    /**
     * is the menubar open
     */
    protected static menuIsOpen(pr: VpcPresenterInterface) {
        let grpMenubar = pr.app.findGroup('$$grpmenubar');
        if (grpMenubar) {
            let menubar = grpMenubar.findEl('$$menubarforapp');
            if (menubar && menubar.getN('whichIsExpanded') >= 0) {
                return true;
            }
        }
    }

    /**
     * send the first opencard, openbackground, and openstack message
     */
    static sendInitialOpenStackAndOpenCard(
        pr: VpcPresenterInterface,
        vci: VpcStateInterface) {

        { /* send openstack */
            let msg = new VpcScriptMessage(vci.getModel().stack.id, VpcBuiltinMsg.Openstack);
            pr.vci.getCodeExec().scheduleCodeExec(msg);
        }

        { /* send openbackground */
            let currentCard = vci.getModel().getById(vci.getCurrentCardId(), VpcElCard)
            let currentBg = vci.getModel().getOwner(currentCard, VpcElBg)
            let msg = new VpcScriptMessage(currentBg.id, VpcBuiltinMsg.Openbackground);
            pr.vci.getCodeExec().scheduleCodeExec(msg);
        }

        { /* send opencard */
            let currentCard = vci.getModel().getById(vci.getCurrentCardId(), VpcElCard)
            let msg = new VpcScriptMessage(currentCard.id, VpcBuiltinMsg.Opencard);
            pr.vci.getCodeExec().scheduleCodeExec(msg);
        }
    }

    /**
     * send messages when card changes
     */
    static sendCardChangeMsgs(pr: VpcPresenterInterface,
        vci: VpcStateInterface, before:boolean, wasCardId:string, nextCardId:string) {
        let wasCard = vci.getModel().getById(wasCardId, VpcElCard)
        let nextCard = vci.getModel().getById(nextCardId, VpcElCard)
        let wasBgId = wasCard.parentId
        let nextBgId = nextCard.parentId

        if (before) {
            /* send closing messages */
            if (wasCardId !== nextCardId) {
                let msg = new VpcScriptMessage(wasCardId, VpcBuiltinMsg.Closecard);
                pr.vci.getCodeExec().scheduleCodeExec(msg);
            }

            if (wasBgId !== nextBgId) {
                let msg = new VpcScriptMessage(wasBgId, VpcBuiltinMsg.Closebackground);
                pr.vci.getCodeExec().scheduleCodeExec(msg);
            }
        } else {
            /* send opening messages */
            if (wasCardId !== nextCardId) {
                let msg = new VpcScriptMessage(nextCardId, VpcBuiltinMsg.Opencard);
                pr.vci.getCodeExec().scheduleCodeExec(msg);
            }

            if (wasBgId !== nextBgId) {
                let msg = new VpcScriptMessage(nextBgId, VpcBuiltinMsg.Openbackground);
                pr.vci.getCodeExec().scheduleCodeExec(msg);
            }
        }
    }

    /**
     * finds target vel id and
     * schedules a script message (only if browse tool is active)
     */
    static scheduleScriptMsg(
        pr: VpcPresenterInterface,
        vci: VpcStateInterface,
        d: EventDetails,
        mouseX = -1,
        mouseY = -1
    ) {
        if (d.handled() || vci.getTool() !== VpcTool.Browse) {
            return;
        }

        if (pr.lyrNonModalDlgHolder.current) {
            /* don't let 'on idle' run when you are running a msg box command */
            let cur = pr.lyrNonModalDlgHolder.current as VpcNonModalReplBox;
            if (cur.isVpcNonModalReplBox && cur.busy && !(d instanceof MouseUpEventDetails)) {
                return;
            }
        }

        let target: O<string>;
        let isOnIdleEvent = false;
        if (d instanceof MouseUpEventDetails) {
            if (d.elClick) {
                target = d.elClick.id;
            }
        } else if (d instanceof MouseEventDetails || d instanceof MouseEnterDetails || d instanceof MouseLeaveDetails) {
            let affected = d.getAffectedElements();
            if (affected.length) {
                target = affected[affected.length - 1].id;
            }
        } else if (d instanceof KeyEventDetails) {
            let focus = pr.vci.getCurrentFocus();
            if (focus && pr.lyrModelRender.elIdToVelId(focus)) {
                target = focus;
            } else {
                target = '<use-current-card>';
            }
        } else if (d instanceof IdleEventDetails) {
            if (mouseX !== -1 && mouseY !== -1) {
                /* mousewithin event */
                let el = pr.vci.UI512App().coordsToElement(mouseX, mouseY);
                if (el) {
                    target = el.id;
                } else {
                    target = '<use-current-card>';
                }
            } else {
                /* idle event */
                target = '<use-current-card>';
                isOnIdleEvent = true;
            }
        }

        if (target) {
            let velId = pr.lyrModelRender.elIdToVelId(target) || pr.vci.getOptionS('currentCardId');
            VpcPresenterEvents.scheduleScriptMsgImpl(pr, d, velId, isOnIdleEvent);
        }
    }

    /**
     * schedule a script message (only if browse tool is active)
     */
    static scheduleScriptMsgImpl(
        pr: VpcPresenterInterface,
        d: EventDetails,
        targetVelId: string,
        isOnIdleEvent: boolean
    ) {
        /* don't start scripts if menu is open */
        if (VpcPresenterEvents.menuIsOpen(pr)) {
            return;
        }

        let whichMsg = isOnIdleEvent ? VpcBuiltinMsg.Idle : getMsgFromEvtType(d.type());
        let msg = new VpcScriptMessage(targetVelId, whichMsg);
        msg.mouseLoc = [pr.trackMouse[0] - pr.userBounds[0], pr.trackMouse[1] - pr.userBounds[1]];
        msg.mouseIsDown = pr.trackPressedBtns[0];
        msg.cardWhenFired = pr.vci.getOptionS('currentCardId');
        msg.causedByUserAction = true;

        if (d instanceof KeyEventDetails) {
            msg.cmdKey = (d.mods & ModifierKeys.Cmd) !== 0;
            msg.shiftKey = (d.mods & ModifierKeys.Shift) !== 0;
            msg.optionKey = (d.mods & ModifierKeys.Opt) !== 0;
            msg.keyChar = d.keyChar;
            msg.keyMods = d.mods;
            msg.keyRepeated = d.repeated;
        } else if (
            d instanceof MouseDownEventDetails ||
            d instanceof MouseUpEventDetails ||
            d instanceof MouseDownDoubleEventDetails
        ) {
            msg.clickLoc = [d.mouseX - pr.userBounds[0], d.mouseY - pr.userBounds[1]];
        }

        pr.vci.getCodeExec().scheduleCodeExec(msg);
    }
}

/**
 * we must route text changes to a vel instead of directly setting the UI512 element
 */
export class EditTextBehaviorSendToVel extends UI512TextEvents {
    constructor(protected pr: VpcPresenterInterface) {
        super();
    }

    /**
     * override the UI512TextEvents method to get our own scrollbarImpl
     */
    protected getScrollbarImpl() {
        return new ScrollbarImplSendToVel(this.pr);
    }

    /**
     * if this is a vel, we should send to the vel
     * otherwise, send to the ui512el
     */
    protected gelFromEl(el: O<UI512ElTextField>): O<GenericTextField> {
        return EditTextBehaviorSendToVel.gelFromEl(this.pr, el);
    }

    /**
     * get the vel, if it exists, else return the el
     */
    static gelFromEl(pr: VpcPresenterInterface, el: O<UI512ElTextField>): O<GenericTextField> {
        if (el) {
            let vel = pr.lyrModelRender.findElIdToVel(el.id);
            if (vel) {
                let velFld = cast(vel, VpcElField);
                return VpcModelRender.canFieldHaveFocus(velFld) ? new VpcTextFieldAsGeneric(el, velFld) : undefined;
            } else {
                return new UI512ElTextFieldAsGeneric(el);
            }
        } else {
            return undefined;
        }
    }
}

/**
 * a modified version of ScrollbarImpl that, when applicable,
 * routes text changes to a vel instead of directly setting the UI512 element
 */
export class ScrollbarImplSendToVel extends ScrollbarImpl {
    constructor(protected pr: VpcPresenterInterface) {
        super();
    }

    /**
     * if this is a vel, we should send to the vel
     * otherwise, send to the ui512el
     */
    protected gelFromEl(el: O<UI512Element>): O<GenericTextField> {
        if (el instanceof UI512ElTextField) {
            return EditTextBehaviorSendToVel.gelFromEl(this.pr, el);
        } else {
            return undefined;
        }
    }
}
