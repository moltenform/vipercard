
/* auto */ import { O, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { cast, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { EventDetails, IdleEventDetails, KeyDownEventDetails, KeyEventDetails, MenuItemClickedDetails, MouseDownDoubleEventDetails, MouseDownEventDetails, MouseEnterDetails, MouseEventDetails, MouseLeaveDetails, MouseMoveEventDetails, MouseUpEventDetails, PasteTextEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { MenuBehavior } from '../../ui512/menu/ui512MenuListeners.js';
/* auto */ import { IGenericTextField, UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { ScrollbarImpl } from '../../ui512/textedit/ui512Scrollbar.js';
/* auto */ import { BasicHandlers } from '../../ui512/textedit/ui512BasicHandlers.js';
/* auto */ import { EditTextBehavior } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { VpcBuiltinMsg, VpcTool, VpcToolCtg, getMsgNameFromType, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcScriptMessage } from '../../vpc/vel/vpcOutsideInterfaces.js';
/* auto */ import { IVpcStateInterface, TypeOfUndoAction } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcElTextFieldAsGeneric, VpcModelRender } from '../../vpcui/modelrender/vpcModelRender.js';
/* auto */ import { VpcAppUIToolSmear } from '../../vpcui/tools/vpcToolSmear.js';
/* auto */ import { VpcAppNonModalDialogReplBox } from '../../vpcui/nonmodaldialogs/vpcReplMessageBox.js';
/* auto */ import { VpcPresenterInterface } from '../../vpcui/presentation/vpcPresenterInterface.js';

export class VpcAppControllerEvents {
    editTextBehavior: EditTextBehaviorSendToVel;
    constructor(protected c: VpcPresenterInterface) {
        c.continueEventAfterError = false;
        this.editTextBehavior = new EditTextBehaviorSendToVel(this.c);
    }

    initEvents() {
        // When code is running, new key messages are queued, but not new mouse msgs
        // A running script cannot cancel default behavior by handling the event and not running "exit to product"
        // A running script can pass the event upwards (say to the current card) with "pass mouseUp"

        this.c.listeners[UI512EventType.MouseDown.valueOf()] = [
            BasicHandlers.trackMouseStatusMouseDown,
            BasicHandlers.trackCurrentElMouseDown,
            VpcAppControllerEvents.cancelEvtIfCodeRunning,
            VpcAppControllerEvents.respondMouseDown,
            VpcAppControllerEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseDown,
            MenuBehavior.onMouseDown,
            this.editTextBehavior.onMouseDownScroll.bind(this.editTextBehavior),
            this.editTextBehavior.onMouseDownSelect.bind(this.editTextBehavior),
        ];

        this.c.listeners[UI512EventType.MouseUp.valueOf()] = [
            BasicHandlers.trackMouseStatusMouseUp,
            BasicHandlers.trackCurrentElMouseUp,
            VpcAppControllerEvents.cancelEvtIfCodeRunning,
            VpcAppControllerEvents.respondMouseUp,
            VpcAppControllerEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseUp,
            MenuBehavior.onMouseUp,
            this.editTextBehavior.onMouseUp.bind(this.editTextBehavior),
        ];

        this.c.listeners[UI512EventType.MouseMove.valueOf()] = [
            BasicHandlers.trackCurrentElMouseMove,
            VpcAppControllerEvents.cancelEvtIfCodeRunning,
            VpcAppControllerEvents.respondMouseMove,
            VpcAppControllerEvents.cancelEvtIfNotBrowseTool,
            this.editTextBehavior.onMouseMoveSelect.bind(this.editTextBehavior),
        ];

        this.c.listeners[UI512EventType.MouseEnter.valueOf()] = [
            VpcAppControllerEvents.cancelEvtIfCodeRunning,
            VpcAppControllerEvents.scheduleScriptEvent,
            VpcAppControllerEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseEnter,
            MenuBehavior.onMouseEnter,
        ];

        this.c.listeners[UI512EventType.MouseLeave.valueOf()] = [
            VpcAppControllerEvents.cancelEvtIfCodeRunning,
            VpcAppControllerEvents.scheduleScriptEvent,
            VpcAppControllerEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseLeave,
            MenuBehavior.onMouseLeave,
        ];

        this.c.listeners[UI512EventType.MouseDownDouble.valueOf()] = [
            BasicHandlers.trackMouseDoubleDown,
            VpcAppControllerEvents.cancelEvtIfCodeRunning,
            VpcAppControllerEvents.scheduleScriptEvent,
            VpcAppControllerEvents.cancelEvtIfNotBrowseTool,
            this.editTextBehavior.onMouseDoubleDown.bind(this.editTextBehavior),
            VpcAppControllerEvents.respondMouseDoubleDown,
        ];

        this.c.listeners[UI512EventType.KeyUp.valueOf()] = [
            BasicHandlers.trackKeyUp,
            VpcAppControllerEvents.cancelEvtIfCodeRunning,
            VpcAppControllerEvents.respondKeyUp,
            VpcAppControllerEvents.cancelEvtIfNotBrowseTool,
        ];

        this.c.listeners[UI512EventType.KeyDown.valueOf()] = [
            BasicHandlers.trackKeyDown,
            BasicHandlers.basicKeyShortcuts,
            (a1: VpcPresenterInterface, a3: KeyDownEventDetails) =>
                VpcAppControllerEvents.respondKeyDown(a1, a3, this.editTextBehavior),
            VpcAppControllerEvents.cancelEvtIfNotBrowseTool,
        ];

        this.c.listeners[UI512EventType.PasteText.valueOf()] = [
            (a1: VpcPresenterInterface, a3: PasteTextEventDetails) => {
                this.c.appli.undoableAction(() => {
                    this.editTextBehavior.onPasteText(a1, a3);
                });
            },
        ];

        this.c.listeners[UI512EventType.MenuItemClicked.valueOf()] = [
            VpcAppControllerEvents.cancelEvtIfCodeRunning,
            VpcAppControllerEvents.respondMenuItemClicked,
        ];

        this.c.listeners[UI512EventType.FocusChanged.valueOf()] = [VpcAppControllerEvents.cancelEvtIfCodeRunning];

        this.c.listeners[UI512EventType.Idle.valueOf()] = [
            VpcAppControllerEvents.respondIdle,
            BasicHandlers.onIdleRunCallbackQueueFromAsyncs,
            this.editTextBehavior.onIdle.bind(this.editTextBehavior),
        ];
    }

    static cancelEvtIfCodeRunning(c: VpcPresenterInterface, d: EventDetails) {
        if (c.appli.isCodeRunning()) {
            let isElemStopRunning = d.getAffectedElements().some(el => c.lyrToolboxes.isElemStopRunning(el));
            if (!isElemStopRunning) {
                d.setHandled();
            }
        }
    }

    static cancelEvtIfNotBrowseTool(c: VpcPresenterInterface, d: EventDetails) {
        // if we're not in the browse tool,
        // stop all behavior like highlighting a button or selecting text in field
        let isVel = d.getAffectedElements().some(item => !!c.lyrModelRender.elIdToVelId(item.id));
        if (isVel && c.appli.getTool() !== VpcTool.browse) {
            d.setHandled();
        }
    }

    static respondMouseDoubleDown(c: VpcPresenterInterface, d: MouseDownDoubleEventDetails) {
        c.appli.undoableAction(() => {
            if (d.el && d.el.id) {
                let short = c.lyrToolboxes.toolsmain.fromFullId(d.el.id);
                if (short && short.endsWith('##eraser')) {
                    c.appli.setTool(VpcTool.eraser);
                    let resp = cast(c.getToolResponse(VpcTool.eraser), VpcAppUIToolSmear);
                    resp.clearAllPaint();
                }
            }
        });
    }

    static respondMouseDown(c: VpcPresenterInterface, d: MouseDownEventDetails) {
        c.appli.undoableAction(() => {
            if (d.button === 0) {
                let isUserElOrBg = !!d.el && !!c.lyrModelRender.isVelOrBg(d.el.id);
                c.getToolResponse(c.appli.getTool()).respondMouseDown(c.appli.getTool(), d, isUserElOrBg);
                c.lyrNonModalDlgHolder.respondMouseDown(d);

                // change focus on click, to make the property panel commit
                let wasFocused = c.getCurrentFocus();
                c.setCurrentFocus(undefined);
                c.setCurrentFocus(wasFocused);
            }
        });
    }

    static respondMouseUp(c: VpcPresenterInterface, d: MouseUpEventDetails) {
        c.appli.undoableAction(() => {
            if (d.button === 0) {
                let isUserElOrBg = d.getAffectedElements().some(item => !!c.lyrModelRender.isVelOrBg(item.id));
                c.getToolResponse(c.appli.getTool()).respondMouseUp(c.appli.getTool(), d, isUserElOrBg);
                c.lyrNonModalDlgHolder.respondMouseUp(d);
                c.lyrToolboxes.toolsmain.listenMouseUp(c.app, d);
                c.lyrToolboxes.toolspatterns.listenMouseUp(c.app, d);
                c.lyrToolboxes.toolsnav.listenMouseUp(c.app, d);
                c.lyrCoverArea.respondMouseUp(d);
            }
        });
    }

    static respondMouseMove(c: VpcPresenterInterface, d: MouseMoveEventDetails) {
        let isUserElOrBg = d.getAffectedElements().some(item => !!c.lyrModelRender.isVelOrBg(item.id));
        c.getToolResponse(c.appli.getTool()).respondMouseMove(c.appli.getTool(), d, isUserElOrBg);
        let isNextAVelOrBg = !!d.elNext && !!c.lyrModelRender.isVelOrBg(d.elNext.id);
        if (d.elNext !== d.elPrev) {
            c.refreshCursorElemKnown(d.elNext, isNextAVelOrBg);
        }
    }

    static respondSchedMessage() {}

    static checkIfUndoRedo(c: VpcPresenterInterface, d: KeyDownEventDetails) {
        // these must be done outside of a undoableAction() block
        if (!d.handled() && !c.appli.isCodeRunning() && !d.repeated) {
            if (d.readableShortcut === 'Cmd+Z') {
                c.appli.performMenuAction('mnuUndo');
                d.setHandled();
            } else if (d.readableShortcut === 'Cmd+Y') {
                c.appli.performMenuAction('mnuRedo');
                d.setHandled();
            }
        }
    }

    static respondKeyDown(c: VpcPresenterInterface, d: KeyDownEventDetails, ed: EditTextBehaviorSendToVel) {
        VpcAppControllerEvents.checkIfUndoRedo(c, d);
        if (d.handled()) {
            return;
        }

        c.appli.undoableAction(() => {
            let currentFocus = c.getCurrentFocus();

            // menu action
            let translated = c.lyrMenus.translateHotkey(d);
            if (!c.appli.isCodeRunning() && !d.handled() && translated) {
                if (translated.startsWith('onlyIfNotInTextField/')) {
                    if (currentFocus) {
                        translated = undefined;
                    } else {
                        translated = translated.substr('onlyIfNotInTextField/'.length);
                    }
                }

                if (translated) {
                    c.appli.performMenuAction(translated);
                    d.setHandled();
                }
            }

            if (
                !c.appli.isCodeRunning() &&
                !d.handled() &&
                currentFocus &&
                scontains(currentFocus, 'VpcPanelScriptEditor##editor') &&
                getToolCategory(c.appli.getTool()) === VpcToolCtg.ctgEdit &&
                slength(c.appli.getOption_s('viewingScriptVelId'))
            ) {
                // code editor keyboard shortcuts
                c.lyrPropPanel.editor.respondKeydown(d);
            }

            if (!c.appli.isCodeRunning() && !d.handled()) {
                // non-modal dialog keyboard shortcuts
                c.lyrNonModalDlgHolder.respondKeyDown(d);
            }

            if (!c.appli.isCodeRunning() && !d.handled() && getToolCategory(c.appli.getTool()) === VpcToolCtg.ctgEdit) {
                // prop panel keyboard shortcuts
                c.lyrPropPanel.respondKeydown(d);
            }

            if (!c.appli.isCodeRunning() && !d.handled()) {
                ed.onKeyDown(c, d);
            }

            if (!c.appli.isCodeRunning() && !d.handled() && c.appli.getTool() === VpcTool.browse) {
                VpcAppControllerEvents.scheduleScriptMsg(c, c.appli, d);
            }

            if (!d.handled() && c.appli.isCodeRunning()) {
                d.setHandled();
            }
        });
    }

    static scheduleScriptEvent(c: VpcPresenterInterface, d: EventDetails) {
        VpcAppControllerEvents.scheduleScriptMsg(c, c.appli, d);
    }

    static respondKeyUp(c: VpcPresenterInterface, d: EventDetails) {
        if (!d.handled() && c.appli.getTool() === VpcTool.browse) {
            VpcAppControllerEvents.scheduleScriptMsg(c, c.appli, d);
        }

        if (!d.handled() && c.appli.isCodeRunning()) {
            d.setHandled();
        }
    }

    static respondMenuItemClicked(c: VpcPresenterInterface, d: MenuItemClickedDetails) {
        c.appli.performMenuAction(d.id);
    }

    static respondIdle(c: VpcPresenterInterface, d: IdleEventDetails) {
        let curtool = c.appli.getTool();
        let codeRunning = c.appli.isCodeRunning();
        if (c.cursorRefreshPending && c.trackMouse[0] !== -1 && c.trackMouse[1] !== -1) {
            c.refreshCursor();
            c.cursorRefreshPending = false;
        }

        if (!d.handled() && codeRunning && curtool !== VpcTool.browse) {
            c.appli.getCodeExec().forceStopRunning();
        }

        if (!d.handled() && curtool === VpcTool.browse) {
            // run scripts. note that anything a script does is undoable.
            c.timerRunScript.update(d.milliseconds);
            if (c.timerRunScript.isDue()) {
                c.timerRunScript.reset();
                c.appli.undoableAction(
                    () => c.appli.getCodeExec().runTimeslice(c.runScriptTimeslice),
                    TypeOfUndoAction.StartReusableAction
                );
            }
        }

        if (!d.handled() && codeRunning) {
            d.setHandled();
        }

        if (!d.handled()) {
            // mousewithin events are currently only sent a few times a second to not overwhelm system with events
            c.timerSendMouseWithin.update(d.milliseconds);
            if (c.timerSendMouseWithin.isDue()) {
                c.timerSendMouseWithin.reset();
                if (curtool === VpcTool.browse) {
                    // send mousewithin
                    VpcAppControllerEvents.scheduleScriptMsg(c, c.appli, d, c.trackMouse[0], c.trackMouse[1]);
                }
            }
        }

        if (!d.handled()) {
            // should be fairly fast, not adding anything to a queue, if there is no handler.
            // send onidle event to script
            if (curtool === VpcTool.browse) {
                VpcAppControllerEvents.scheduleScriptMsg(c, c.appli, d, -1, -1);
            }
        }

        if (!d.handled()) {
            // good, the caret won't be blinking in a text field when script is running
            c.timerBlinkMarquee.update(d.milliseconds);
            if (c.timerBlinkMarquee.isDue()) {
                c.timerBlinkMarquee.reset();
                c.tlctgLasso.blinkSelection();
                c.tlctgRectSelect.blinkSelection();
            }
        }
    }

    static scheduleScriptMsg(
        c: VpcPresenterInterface,
        appli: IVpcStateInterface,
        d: EventDetails,
        mouseX = -1,
        mouseY = -1
    ) {
        if (d.handled() || appli.getTool() !== VpcTool.browse) {
            return;
        }

        if (c.lyrNonModalDlgHolder.current) {
            // don't let 'on idle' run when you are running a msg box command
            let cur = c.lyrNonModalDlgHolder.current as VpcAppNonModalDialogReplBox;
            if (cur.isVpcAppNonModalDialogReplBox && cur.busy && !(d instanceof MouseUpEventDetails)) {
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
            let focus = c.appli.getCurrentFocus();
            if (focus && c.lyrModelRender.elIdToVelId(focus)) {
                target = focus;
            } else {
                target = '<use-current-card>';
            }
        } else if (d instanceof IdleEventDetails) {
            if (mouseX !== -1 && mouseY !== -1) {
                // mousewithin event
                let el = c.appli.UI512App().coordsToElement(mouseX, mouseY);
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
            let velId = c.lyrModelRender.elIdToVelId(target) || c.appli.getOption_s('currentCardId');
            VpcAppControllerEvents.scheduleScriptMsgImpl(c, d, velId, isOnIdleEvent);
        }
    }

    protected static menuIsOpen(c: VpcPresenterInterface) {
        let grpmenubar = c.app.findGroup('$$grpmenubar');
        if (grpmenubar) {
            let menubar = grpmenubar.findEl('$$menubarforapp');
            if (menubar && menubar.get_n('whichIsExpanded') >= 0) {
                return true;
            }
        }
    }

    static scheduleScriptMsgImpl(
        c: VpcPresenterInterface,
        d: EventDetails,
        targetVelId: string,
        isOnIdleEvent: boolean
    ) {
        // don't start scripts if menu is open
        if (VpcAppControllerEvents.menuIsOpen(c)) {
            return;
        }

        let msgtype = isOnIdleEvent ? VpcBuiltinMsg.idle : getMsgNameFromType(d.type());
        let msg = new VpcScriptMessage(targetVelId, msgtype);
        msg.mouseLoc = [c.trackMouse[0] - c.userBounds[0], c.trackMouse[1] - c.userBounds[1]];
        msg.mouseIsDown = c.trackPressedBtns[0];
        msg.cardWhenFired = c.appli.getOption_s('currentCardId');
        msg.causedByUserAction = true;

        if (d instanceof KeyEventDetails) {
            msg.cmdKey = (d.mods & ModifierKeys.Cmd) !== 0;
            msg.shiftKey = (d.mods & ModifierKeys.Shift) !== 0;
            msg.optionKey = (d.mods & ModifierKeys.Opt) !== 0;
            msg.keychar = d.keyChar;
            msg.keymods = d.mods;
            msg.keyrepeated = d.repeated;
        } else if (
            d instanceof MouseDownEventDetails ||
            d instanceof MouseUpEventDetails ||
            d instanceof MouseDownDoubleEventDetails
        ) {
            msg.clickLoc = [d.mouseX - c.userBounds[0], d.mouseY - c.userBounds[1]];
        }

        c.appli.getCodeExec().scheduleCodeExec(msg);
    }
}

export class EditTextBehaviorSendToVel extends EditTextBehavior {
    protected scrollbarImplSendToVel: ScrollbarImplSendToVel;

    constructor(protected c: VpcPresenterInterface) {
        super();
        this.scrollbarImplSendToVel = new ScrollbarImplSendToVel(c);
    }
    protected getScrollbarImpl() {
        return this.scrollbarImplSendToVel;
    }
    protected gelFromEl(el: O<UI512ElTextField>): O<IGenericTextField> {
        if (el) {
            let vel = this.c.lyrModelRender.elIdToVel(el.id);
            if (vel) {
                let velFld = cast(vel, VpcElField);
                return VpcModelRender.fieldPropsCompatibleWithFocus(velFld)
                    ? new VpcElTextFieldAsGeneric(el, velFld)
                    : undefined;
            } else {
                return new UI512ElTextFieldAsGeneric(el);
            }
        } else {
            return undefined;
        }
    }
}

export class ScrollbarImplSendToVel extends ScrollbarImpl {
    constructor(protected c: VpcPresenterInterface) {
        super();
    }

    protected gelFromEl(el: O<UI512Element>): O<IGenericTextField> {
        if (el && el instanceof UI512ElTextField) {
            let vel = this.c.lyrModelRender.elIdToVel(el.id);
            if (vel) {
                let velFld = cast(vel, VpcElField);
                return VpcModelRender.fieldPropsCompatibleWithFocus(velFld)
                    ? new VpcElTextFieldAsGeneric(el, velFld)
                    : undefined;
            } else {
                return new UI512ElTextFieldAsGeneric(el);
            }
        } else {
            return undefined;
        }
    }
}
