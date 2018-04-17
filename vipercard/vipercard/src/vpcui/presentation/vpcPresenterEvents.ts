
/* auto */ import { O, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { cast, slength } from '../../ui512/utils/utils512.js';
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
/* auto */ import { VpcBuiltinMsg, VpcTool, VpcToolCtg, getMsgNameFromType, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcScriptMessage } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { TypeOfUndoAction, VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcModelRender, VpcTextFieldAsGeneric } from '../../vpcui/modelrender/vpcModelRender.js';
/* auto */ import { VpcAppUIToolSmear } from '../../vpcui/tools/vpcToolSmear.js';
/* auto */ import { VpcNonModalReplBox } from '../../vpcui/nonmodaldialogs/vpcReplMessageBox.js';
/* auto */ import { VpcPresenterInterface } from '../../vpcui/presentation/vpcPresenterInterface.js';

export class VpcPresenterEvents {
    editTextBehavior: EditTextBehaviorSendToVel;
    constructor(protected pr: VpcPresenterInterface) {
        pr.continueEventAfterError = false;
        this.editTextBehavior = new EditTextBehaviorSendToVel(this.pr);
    }

    initEvents() {
        // When code is running, new key messages are queued, but not new mouse msgs
        // A running script cannot cancel default behavior by handling the event and not running "exit to product"
        // A running script can pass the event upwards (say to the current card) with "pass mouseUp"

        this.pr.listeners[UI512EventType.MouseDown.valueOf()] = [
            BasicHandlers.trackMouseStatusMouseDown,
            BasicHandlers.trackCurrentElMouseDown,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondMouseDown,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseDown,
            MenuListeners.onMouseDown,
            this.editTextBehavior.onMouseDownScroll.bind(this.editTextBehavior),
            this.editTextBehavior.onMouseDownSelect.bind(this.editTextBehavior)
        ];

        this.pr.listeners[UI512EventType.MouseUp.valueOf()] = [
            BasicHandlers.trackMouseStatusMouseUp,
            BasicHandlers.trackCurrentElMouseUp,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondMouseUp,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseUp,
            MenuListeners.onMouseUp,
            this.editTextBehavior.onMouseUp.bind(this.editTextBehavior)
        ];

        this.pr.listeners[UI512EventType.MouseMove.valueOf()] = [
            BasicHandlers.trackCurrentElMouseMove,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondMouseMove,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            this.editTextBehavior.onMouseMoveSelect.bind(this.editTextBehavior)
        ];

        this.pr.listeners[UI512EventType.MouseEnter.valueOf()] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.scheduleScriptEvent,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseEnter,
            MenuListeners.onMouseEnter
        ];

        this.pr.listeners[UI512EventType.MouseLeave.valueOf()] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.scheduleScriptEvent,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseLeave,
            MenuListeners.onMouseLeave
        ];

        this.pr.listeners[UI512EventType.MouseDownDouble.valueOf()] = [
            BasicHandlers.trackMouseDoubleDown,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.scheduleScriptEvent,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            this.editTextBehavior.onMouseDoubleDown.bind(this.editTextBehavior),
            VpcPresenterEvents.respondMouseDoubleDown
        ];

        this.pr.listeners[UI512EventType.KeyUp.valueOf()] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondKeyUp,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool
        ];

        this.pr.listeners[UI512EventType.KeyDown.valueOf()] = [
            BasicHandlers.basicKeyShortcuts,
            (a1: VpcPresenterInterface, a3: KeyDownEventDetails) =>
                VpcPresenterEvents.respondKeyDown(a1, a3, this.editTextBehavior),
            VpcPresenterEvents.cancelEvtIfNotBrowseTool
        ];

        this.pr.listeners[UI512EventType.PasteText.valueOf()] = [
            (a1: VpcPresenterInterface, a3: PasteTextEventDetails) => {
                this.pr.vci.undoableAction(() => {
                    this.editTextBehavior.onPasteText(a1, a3);
                });
            }
        ];

        this.pr.listeners[UI512EventType.MenuItemClicked.valueOf()] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondMenuItemClicked
        ];

        this.pr.listeners[UI512EventType.FocusChanged.valueOf()] = [VpcPresenterEvents.cancelEvtIfCodeRunning];

        this.pr.listeners[UI512EventType.Idle.valueOf()] = [
            VpcPresenterEvents.respondIdle,
            BasicHandlers.onIdleRunCallbackQueueFromAsyncs,
            this.editTextBehavior.onIdle.bind(this.editTextBehavior)
        ];
    }

    static cancelEvtIfCodeRunning(pr: VpcPresenterInterface, d: EventDetails) {
        if (pr.vci.isCodeRunning()) {
            let isElemStopRunning = d.getAffectedElements().some(el => pr.lyrToolboxes.isElemStopRunning(el));
            if (!isElemStopRunning) {
                d.setHandled();
            }
        }
    }

    static cancelEvtIfNotBrowseTool(pr: VpcPresenterInterface, d: EventDetails) {
        // if we're not in the browse tool,
        // stop all behavior like highlighting a button or selecting text in field
        let isVel = d.getAffectedElements().some(item => !!pr.lyrModelRender.elIdToVelId(item.id));
        if (isVel && pr.vci.getTool() !== VpcTool.Browse) {
            d.setHandled();
        }
    }

    static respondMouseDoubleDown(pr: VpcPresenterInterface, d: MouseDownDoubleEventDetails) {
        pr.vci.undoableAction(() => {
            if (d.el && d.el.id) {
                let short = pr.lyrToolboxes.toolsMain.fromFullId(d.el.id);
                if (short && short.endsWith('##eraser')) {
                    pr.vci.setTool(VpcTool.Eraser);
                    let resp = cast(pr.getToolResponse(VpcTool.Eraser), VpcAppUIToolSmear);
                    resp.clearAllPaint();
                }
            }
        });
    }

    static respondMouseDown(pr: VpcPresenterInterface, d: MouseDownEventDetails) {
        pr.vci.undoableAction(() => {
            if (d.button === 0) {
                let isUserElOrBg = !!d.el && !!pr.lyrModelRender.isVelOrBg(d.el.id);
                pr.getToolResponse(pr.vci.getTool()).respondMouseDown(pr.vci.getTool(), d, isUserElOrBg);
                pr.lyrNonModalDlgHolder.respondMouseDown(d);

                // change focus on click, to make the property panel commit
                let wasFocused = pr.getCurrentFocus();
                pr.setCurrentFocus(undefined);
                pr.setCurrentFocus(wasFocused);
            }
        });
    }

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

    static respondMouseMove(pr: VpcPresenterInterface, d: MouseMoveEventDetails) {
        let isUserElOrBg = d.getAffectedElements().some(item => !!pr.lyrModelRender.isVelOrBg(item.id));
        pr.getToolResponse(pr.vci.getTool()).respondMouseMove(pr.vci.getTool(), d, isUserElOrBg);
        let isNextAVelOrBg = !!d.elNext && !!pr.lyrModelRender.isVelOrBg(d.elNext.id);
        if (d.elNext !== d.elPrev) {
            pr.refreshCursorElemKnown(d.elNext, isNextAVelOrBg);
        }
    }

    static respondSchedMessage() {}

    static checkIfUndoRedo(pr: VpcPresenterInterface, d: KeyDownEventDetails) {
        // these must be done outside of a undoableAction() block
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

    static respondKeyDown(pr: VpcPresenterInterface, d: KeyDownEventDetails, ed: EditTextBehaviorSendToVel) {
        VpcPresenterEvents.checkIfUndoRedo(pr, d);
        if (d.handled()) {
            return;
        }

        pr.vci.undoableAction(() => {
            let currentFocus = pr.getCurrentFocus();

            // menu action
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
                // code editor keyboard shortcuts
                pr.lyrPropPanel.editor.respondKeydown(d);
            }

            if (!pr.vci.isCodeRunning() && !d.handled()) {
                // non-modal dialog keyboard shortcuts
                pr.lyrNonModalDlgHolder.respondKeyDown(d);
            }

            if (!pr.vci.isCodeRunning() && !d.handled() && getToolCategory(pr.vci.getTool()) === VpcToolCtg.CtgEdit) {
                // prop panel keyboard shortcuts
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

    static scheduleScriptEvent(pr: VpcPresenterInterface, d: EventDetails) {
        VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d);
    }

    static respondKeyUp(pr: VpcPresenterInterface, d: EventDetails) {
        if (!d.handled() && pr.vci.getTool() === VpcTool.Browse) {
            VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d);
        }

        if (!d.handled() && pr.vci.isCodeRunning()) {
            d.setHandled();
        }
    }

    static respondMenuItemClicked(pr: VpcPresenterInterface, d: MenuItemClickedDetails) {
        pr.vci.performMenuAction(d.id);
    }

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
            // run scripts. note that anything a script does is undoable.
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
            // mousewithin events are currently only sent a few times a second to not overwhelm system with events
            pr.timerSendMouseWithin.update(d.milliseconds);
            if (pr.timerSendMouseWithin.isDue()) {
                pr.timerSendMouseWithin.reset();
                if (curtool === VpcTool.Browse) {
                    // send mousewithin
                    VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d, pr.trackMouse[0], pr.trackMouse[1]);
                }
            }
        }

        if (!d.handled()) {
            // should be fairly fast, not adding anything to a queue, if there is no handler.
            // send onidle event to script
            if (curtool === VpcTool.Browse) {
                VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d, -1, -1);
            }
        }

        if (!d.handled()) {
            // good, the caret won't be blinking in a text field when script is running
            pr.timerBlinkMarquee.update(d.milliseconds);
            if (pr.timerBlinkMarquee.isDue()) {
                pr.timerBlinkMarquee.reset();
                pr.tlctgLasso.blinkSelection();
                pr.tlctgRectSelect.blinkSelection();
            }
        }
    }

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
            // don't let 'on idle' run when you are running a msg box command
            let cur = pr.lyrNonModalDlgHolder.current as VpcNonModalReplBox;
            if (cur.isVpcNonModalReplBox && cur.busy && !(d instanceof MouseUpEventDetails)) {
                return;
            }
        }

        let target: O<string>;
        let msgname = getMsgNameFromType(d.type());
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
                // mousewithin event
                let el = pr.vci.UI512App().coordsToElement(mouseX, mouseY);
                if (el) {
                    target = el.id;
                }
            } else {
                // idle event
                target = '<use-current-card>';
                isOnIdleEvent = true;
            }
        }

        if (target) {
            let velId = pr.lyrModelRender.elIdToVelId(target) || pr.vci.getOptionS('currentCardId');
            VpcPresenterEvents.scheduleScriptMsgImpl(pr, d, velId, isOnIdleEvent);
        }
    }

    protected static menuIsOpen(pr: VpcPresenterInterface) {
        let grpmenubar = pr.app.findGroup('$$grpmenubar');
        if (grpmenubar) {
            let menubar = grpmenubar.findEl('$$menubarforapp');
            if (menubar && menubar.getN('whichIsExpanded') >= 0) {
                return true;
            }
        }
    }

    static scheduleScriptMsgImpl(
        pr: VpcPresenterInterface,
        d: EventDetails,
        targetVelId: string,
        isOnIdleEvent: boolean
    ) {
        // don't start scripts if menu is open
        if (VpcPresenterEvents.menuIsOpen(pr)) {
            return;
        }

        let msgtype = isOnIdleEvent ? VpcBuiltinMsg.idle : getMsgNameFromType(d.type());
        let msg = new VpcScriptMessage(targetVelId, msgtype);
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

export class EditTextBehaviorSendToVel extends UI512TextEvents {
    protected scrollbarImplSendToVel: ScrollbarImplSendToVel;

    constructor(protected pr: VpcPresenterInterface) {
        super();
        this.scrollbarImplSendToVel = new ScrollbarImplSendToVel(pr);
    }
    protected getScrollbarImpl() {
        return this.scrollbarImplSendToVel;
    }
    protected gelFromEl(el: O<UI512ElTextField>): O<GenericTextField> {
        if (el) {
            let vel = this.pr.lyrModelRender.findElIdToVel(el.id);
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

export class ScrollbarImplSendToVel extends ScrollbarImpl {
    constructor(protected pr: VpcPresenterInterface) {
        super();
    }

    protected gelFromEl(el: O<UI512Element>): O<GenericTextField> {
        if (el && el instanceof UI512ElTextField) {
            let vel = this.pr.lyrModelRender.findElIdToVel(el.id);
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
