
/* auto */ import { VpcScriptMessage } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { VpcAppUIToolSmear } from './../tools/vpcToolSmear';
/* auto */ import { VpcNonModalReplBox } from './../nonmodaldialogs/vpcReplMessageBox';
/* auto */ import { VpcPresenterInterface } from './vpcPresenterInterface';
/* auto */ import { VpcModelRender } from './../modelrender/vpcModelRender';
/* auto */ import { TypeOfUndoAction, VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcBuiltinMsg, VpcElType, VpcTool, VpcToolCtg, getMsgFromEvtType, getToolCategory } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcElField, VpcTextFieldAsGeneric } from './../../vpc/vel/velField';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { justConsoleMsgIfExceptionThrown } from './../../ui512/utils/util512Higher';
/* auto */ import { O, bool, coalesceIfFalseLike, trueIfDefinedAndNotNull } from './../../ui512/utils/util512Base';
/* auto */ import { arLast, cast, slength } from './../../ui512/utils/util512';
/* auto */ import { TextSelModify } from './../../ui512/textedit/ui512TextSelModify';
/* auto */ import { UI512TextEvents } from './../../ui512/textedit/ui512TextEvents';
/* auto */ import { ScrollbarImpl } from './../../ui512/textedit/ui512Scrollbar';
/* auto */ import { MenuListeners } from './../../ui512/menu/ui512MenuListeners';
/* auto */ import { UI512EventType } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { GenericTextField, UI512ElTextFieldAsGeneric } from './../../ui512/textedit/ui512GenericField';
/* auto */ import { EventDetails, FocusChangedEventDetails, IdleEventDetails, KeyDownEventDetails, KeyEventDetails, MenuItemClickedDetails, MouseDownDoubleEventDetails, MouseDownEventDetails, MouseEnterDetails, MouseLeaveDetails, MouseMoveEventDetails, MouseUpEventDetails, MouseUpOrDownDetails, PasteTextEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElTextField } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { BasicHandlers } from './../../ui512/textedit/ui512BasicHandlers';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * ViperCard event handling
 */
export const VpcPresenterEvents = /* static class */ {
    /**
     * register event handlers
     */
    initEvents(pr: VpcPresenterInterface) {
        /* Currently, a running script can't cancel default behavior
        by handling an event and not running "exit to product",
        that's why I call it 'on afterkeydown' instead of 'on keydown'

        A running script can pass the event upwards (say to the current card) with "pass mouseUp"
        */

        /* we must route text changes to a vel instead of directly setting the UI512 element */
        let editTextBehavior = new EditTextBehaviorSendToVel(pr);

        pr.listeners[UI512EventType.MouseDown] = [
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

        pr.listeners[UI512EventType.MouseUp] = [
            BasicHandlers.trackMouseStatusMouseUp,
            BasicHandlers.trackCurrentElMouseUp,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            MenuListeners.onMouseUp,
            VpcPresenterEvents.respondMouseUp,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseUp,
            editTextBehavior.onMouseUp.bind(editTextBehavior)
        ];

        pr.listeners[UI512EventType.MouseMove] = [
            BasicHandlers.trackCurrentElMouseMove,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondMouseMove,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            /* don't need editTextBehavior.onMouseMoveSetTextEditCursor */
            editTextBehavior.onMouseMoveSelect.bind(editTextBehavior)
        ];

        pr.listeners[UI512EventType.MouseEnter] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.scheduleScriptEvent,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseEnter,
            MenuListeners.onMouseEnter
        ];

        pr.listeners[UI512EventType.MouseLeave] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.scheduleScriptEvent,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            BasicHandlers.trackHighlightedButtonMouseLeave,
            MenuListeners.onMouseLeave
        ];

        pr.listeners[UI512EventType.MouseDownDouble] = [
            BasicHandlers.trackMouseDoubleDown,
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.scheduleScriptEvent,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool,
            editTextBehavior.onMouseDoubleDown.bind(editTextBehavior),
            VpcPresenterEvents.respondMouseDoubleDown
        ];

        pr.listeners[UI512EventType.KeyUp] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondKeyUp,
            VpcPresenterEvents.cancelEvtIfNotBrowseTool
        ];

        pr.listeners[UI512EventType.KeyDown] = [
            BasicHandlers.basicKeyShortcuts,
            (_pr: VpcPresenterInterface, d: KeyDownEventDetails) => VpcPresenterEvents.respondKeyDown(_pr, d, editTextBehavior),
            VpcPresenterEvents.cancelEvtIfNotBrowseTool
        ];

        pr.listeners[UI512EventType.PasteText] = [
            (_pr: VpcPresenterInterface, d: PasteTextEventDetails) => {
                _pr.vci.undoableAction(() => {
                    editTextBehavior.onPasteText(_pr, d);
                });
            }
        ];

        pr.listeners[UI512EventType.MenuItemClicked] = [
            VpcPresenterEvents.cancelEvtIfCodeRunning,
            VpcPresenterEvents.respondMenuItemClicked
        ];

        pr.listeners[UI512EventType.FocusChanged] = [
            VpcPresenterEvents.respondFocusChanged,
            VpcPresenterEvents.cancelEvtIfCodeRunning
        ];

        pr.listeners[UI512EventType.Idle] = [
            VpcPresenterEvents.respondIdle,
            BasicHandlers.onIdleRunCallbackQueueFromAsyncs,
            editTextBehavior.onIdle.bind(editTextBehavior)
        ];
    },

    /**
     * by calling setHandled, this stops event propagation
     */
    cancelEvtIfCodeRunning(pr: VpcPresenterInterface, d: EventDetails) {
        if (pr.vci.isCodeRunning()) {
            let isElemStopRunning = d.getAffectedElements().some(el => pr.lyrToolboxes.isElemStopRunning(el));
            if (!isElemStopRunning) {
                d.setHandled();
            }
        }
    },

    /**
     * if we're not in the browse tool,
     * when you click on a vel button it shouldn't have any response
     * without this check here, you'd be able to click on a vel button even when
     * you are in the pencil tool
     */
    cancelEvtIfNotBrowseTool(pr: VpcPresenterInterface, d: EventDetails) {
        let isVel = d.getAffectedElements().some(item => bool(pr.lyrModelRender.elIdToVelId(item.id)));
        if (isVel && pr.vci.getTool() !== VpcTool.Browse) {
            d.setHandled();
        }
    },

    /**
     * double-click the eraser tool to erase all paint on the screen
     */
    respondMouseDoubleDown(pr: VpcPresenterInterface, d: MouseDownDoubleEventDetails) {
        pr.vci.undoableAction(() => {
            if (d.el && d.el.id) {
                let short = pr.lyrToolboxes.toolsMain.fromFullId(d.el.id);
                if (short && short.endsWith('##eraser')) {
                    pr.vci.setTool(VpcTool.Eraser);
                    let tl = cast(VpcAppUIToolSmear, pr.getToolResponse(VpcTool.Eraser));
                    tl.clearAllPaint();
                }
            }
        });
    },

    /**
     * send mousedown event to the current tool
     */
    respondMouseDown(pr: VpcPresenterInterface, d: MouseDownEventDetails) {
        pr.vci.undoableAction(() => {
            if (d.button === 0) {
                let isUserElOrBg = trueIfDefinedAndNotNull(d.el) && bool(pr.lyrModelRender.isVelOrBaseLayer(d.el.id));
                pr.getToolResponse(pr.vci.getTool()).respondMouseDown(pr.vci.getTool(), d, isUserElOrBg);
                pr.lyrNonModalDlgHolder.respondMouseDown(d);

                /* change focus on click, to make the property panel commit */
                let focused = pr.getCurrentFocus();
                pr.setCurrentFocus(undefined, true);
                pr.setCurrentFocus(focused, true);

                /* according to docs closefield should be called when
                user clicks outside the field */
                let elClicked = d.el ? d.el.id : undefined;
                if (!d.handled() && pr.vci.getTool() === VpcTool.Browse && focused && focused !== elClicked) {
                    pr.beginScheduleFldOpenCloseEventClose(focused);
                }
            }
        });
    },

    /**
     * send mouseup event to the current tool, and any layers that need to respond to it
     */
    respondMouseUp(pr: VpcPresenterInterface, d: MouseUpEventDetails) {
        pr.vci.undoableAction(() => {
            if (d.button === 0) {
                let isUserElOrBg = d.getAffectedElements().some(item => bool(pr.lyrModelRender.isVelOrBaseLayer(item.id)));
                pr.getToolResponse(pr.vci.getTool()).respondMouseUp(pr.vci.getTool(), d, isUserElOrBg);
                pr.lyrNonModalDlgHolder.respondMouseUp(d);
                pr.lyrToolboxes.toolsMain.respondMouseUp(pr.app, d);
                pr.lyrToolboxes.toolsPatterns.respondMouseUp(pr.app, d);
                pr.lyrToolboxes.toolsNav.respondMouseUp(pr.app, d);
                pr.lyrCoverArea.respondMouseUp(d);
            }
        });
    },

    /**
     * send mousemove event to current tool
     */
    respondMouseMove(pr: VpcPresenterInterface, d: MouseMoveEventDetails) {
        let isUserElOrBaseLayer = d.getAffectedElements().some(item => bool(pr.lyrModelRender.isVelOrBaseLayer(item.id)));
        pr.getToolResponse(pr.vci.getTool()).respondMouseMove(pr.vci.getTool(), d, isUserElOrBaseLayer);
        let isNextAVelOrBaseLayer = trueIfDefinedAndNotNull(d.elNext) && bool(pr.lyrModelRender.isVelOrBaseLayer(d.elNext.id));
        if (d.elNext !== d.elPrev) {
            pr.refreshCursorElemKnown(d.elNext, isNextAVelOrBaseLayer);
        }
    },

    /**
     * respond to keyboard shortcuts for undo and redo
     */
    _checkIfUndoRedo(pr: VpcPresenterInterface, d: KeyDownEventDetails) {
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
    },

    /**
     * respond to keydown event
     */
    respondKeyDown(pr: VpcPresenterInterface, d: KeyDownEventDetails, ed: EditTextBehaviorSendToVel) {
        VpcPresenterEvents._checkIfUndoRedo(pr, d);
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
                currentFocus.includes('VpcPanelScriptEditor##editor') &&
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

            if (
                !d.handled() &&
                pr.vci.getTool() === VpcTool.Browse &&
                currentFocus &&
                (d.readableShortcut === 'Enter' || d.readableShortcut === 'Return')
            ) {
                /* according to docs, closefield should be called when user hits Enter in a field */
                pr.beginScheduleFldOpenCloseEventClose(currentFocus);
            }

            if (!pr.vci.isCodeRunning() && !d.handled()) {
                VpcPresenterEvents.updateFieldsRecentlyEdited(pr, d);
            }

            if (!pr.vci.isCodeRunning() && !d.handled()) {
                /* normal typing text into a field */
                ed.onKeyDown(pr, d);
            }

            if (!pr.vci.isCodeRunning() && !d.handled() && pr.vci.getTool() === VpcTool.Browse) {
                VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d);
            }

            if (!d.handled() && pr.vci.isCodeRunning()) {
                d.setHandled();
            }
        });
    },

    /**
     * track when we've typed normal text in a field, to
     * know if we should call closeField or exitField
     */
    updateFieldsRecentlyEdited(pr: VpcPresenterInterface, d: KeyDownEventDetails) {
        if (UI512TextEvents.keyDownProbablyCausesTextChange(d)) {
            let el = TextSelModify.getSelectedField(pr);
            if (el) {
                let vel = pr.lyrModelRender.findElIdToVel(el.id);
                if (vel && vel.getType() === VpcElType.Fld && !vel.getB('locktext')) {
                    pr.vci.getCodeExec().fieldsRecentlyEdited.val[vel.idInternal] = true;
                }
            }
        }
    },

    /**
     * schedule a script event
     */
    scheduleScriptEvent(pr: VpcPresenterInterface, d: EventDetails) {
        VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d);
    },

    /**
     * send keyup to current script
     */
    respondKeyUp(pr: VpcPresenterInterface, d: EventDetails) {
        if (!d.handled() && pr.vci.getTool() === VpcTool.Browse) {
            VpcPresenterEvents.scheduleScriptMsg(pr, pr.vci, d);
        }

        if (!d.handled() && pr.vci.isCodeRunning()) {
            d.setHandled();
        }
    },

    /**
     * respond to menu item
     */
    respondMenuItemClicked(pr: VpcPresenterInterface, d: MenuItemClickedDetails) {
        if (!d.handled()) {
            pr.vci.performMenuAction(d.id);
        }
    },

    /**
     * on focus changed (user highlighted something)
     */
    respondFocusChanged(pr: VpcPresenterInterface, d: FocusChangedEventDetails) {
        if (!d.handled()) {
            pr.beginScheduleFldOpenCloseEvent(d);
        }
    },

    /**
     * on idle (this event is continuously sent)
     */
    respondIdle(pr: VpcPresenterInterface, d: IdleEventDetails) {
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
            /* mousewithin events are currently only sent a few times
            a second to not overwhelm system with events */
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
                if (!pr.vci.isCurrentlyUndoing()) {
                    justConsoleMsgIfExceptionThrown(() => pr.lyrPaintRender.doMaintenance(), 'lyrPaintRender.doMaintenance');
                    justConsoleMsgIfExceptionThrown(() => pr.vci.getCodeExec().doMaintenance(), 'getCodeExec.doMaintenance');
                }
            }
        }
    },

    /**
     * is the menubar open
     */
    _menuIsOpen(pr: VpcPresenterInterface) {
        let grpMenubar = pr.app.findGroup('$$grpmenubar');
        if (grpMenubar) {
            let menubar = grpMenubar.findEl('$$menubarforapp');
            if (menubar && menubar.getN('whichIsExpanded') >= 0) {
                return true;
            }
        }

        return false;
    },

    /**
     * finds target vel id and
     * schedules a script message (only if browse tool is active)
     */
    scheduleScriptMsg(pr: VpcPresenterInterface, vci: VpcStateInterface, d: EventDetails, mouseX = -1, mouseY = -1) {
        if (d.handled() || vci.getTool() !== VpcTool.Browse) {
            return;
        }

        let target: O<string>;
        let isOnIdleEvent = false;
        if (d instanceof MouseUpEventDetails) {
            if (d.elClick) {
                target = d.elClick.id;
            }
        } else if (d instanceof MouseUpOrDownDetails || d instanceof MouseEnterDetails || d instanceof MouseLeaveDetails) {
            let affected = d.getAffectedElements();
            if (affected.length) {
                target = arLast(affected).id;
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
                /* don't let 'on idle' run when you are running a msg box command  */
                if (pr.lyrNonModalDlgHolder.current instanceof VpcNonModalReplBox) {
                    target = undefined;
                }
            }
        }

        if (target) {
            let velId = coalesceIfFalseLike(pr.lyrModelRender.elIdToVelId(target), pr.vci.getOptionS('currentCardId'));
            VpcPresenterEvents.scheduleScriptMsgImpl(pr, d, velId, isOnIdleEvent);
        }
    },

    /**
     * schedule a script message (only if browse tool is active)
     */
    scheduleScriptMsgImpl(pr: VpcPresenterInterface, d: EventDetails, targetVelId: string, isOnIdleEvent: boolean) {
        /* don't start scripts if menu is open */
        if (VpcPresenterEvents._menuIsOpen(pr)) {
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
};

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
                let velFld = cast(VpcElField, vel);
                let cardId = pr.vci.getOptionS('currentCardId');
                return VpcModelRender.canFieldHaveFocus(velFld)
                    ? new VpcTextFieldAsGeneric(el, velFld, pr.vci.getModel())
                    : undefined;
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
