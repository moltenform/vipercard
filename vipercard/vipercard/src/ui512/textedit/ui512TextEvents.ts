
/* auto */ import { ModifierKeys } from './../utils/utilsKeypressHelpers';
/* auto */ import { UI512CursorAccess, UI512Cursors } from './../utils/utilsCursors';
/* auto */ import { RectUtils } from './../utils/utilsCanvasDraw';
/* auto */ import { BrowserInfo } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { TextSelModify } from './ui512TextSelModify';
/* auto */ import { ScrollbarImpl, fldIdToScrollbarPartId, getAmountIfScrollArrowClicked } from './ui512Scrollbar';
/* auto */ import { UI512PresenterWithMenuInterface } from './../menu/ui512PresenterWithMenu';
/* auto */ import { MenuListeners } from './../menu/ui512MenuListeners';
/* auto */ import { FnEventCallback, MouseDragStatus, UI512EventType } from './../draw/ui512Interfaces';
/* auto */ import { GenericTextField, UI512ElTextFieldAsGeneric } from './ui512GenericField';
/* auto */ import { FormattedText } from './../drawtext/ui512FormattedText';
/* auto */ import { IdleEventDetails, KeyDownEventDetails, MouseDownDoubleEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails, PasteTextEventDetails } from './../menu/ui512Events';
/* auto */ import { UI512ElTextField } from './../elements/ui512ElementTextField';
/* auto */ import { UI512ElButton } from './../elements/ui512ElementButton';
/* auto */ import { BasicHandlers } from './ui512BasicHandlers';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * Base class for text events
 */
export class UI512TextEvents {
    static readonly amtScrollArrowClicked = 12;
    static readonly amtScrollAreaClicked = 36;

    /**
     * get generic text field from a UI512ElTextField
     * subclasses can provide a different implementation
     */
    protected gelFromEl(el: O<UI512ElTextField>): O<GenericTextField> {
        return el ? new UI512ElTextFieldAsGeneric(el) : undefined;
    }

    /**
     * get scrollbar positioning class
     * subclasses can provide a different implementation
     */
    protected getScrollbarImpl() {
        return new ScrollbarImpl();
    }

    /**
     * onMouseDown, see if scroll arrow clicked
     */
    onMouseDownScroll(pr: UI512PresenterWithMenuInterface, d: MouseDownEventDetails) {
        if (d.button === 0 && d.el instanceof UI512ElButton) {
            let moveAmt = getAmountIfScrollArrowClicked(d.el.id);
            if (moveAmt !== undefined) {
                this.getScrollbarImpl().onScrollArrowClicked(pr, d.el.id, moveAmt);
                pr.mouseDragStatus = MouseDragStatus.ScrollArrow;
            }
        }
    }

    /**
     * onMouseDown, see if we should select text
     */
    onMouseDownSelect(pr: UI512PresenterWithMenuInterface, d: MouseDownEventDetails) {
        if (
            d.button === 0 &&
            d.el instanceof UI512ElTextField &&
            d.el.getB('canselecttext') &&
            pr.canSelectTextInField(d.el)
        ) {
            let gel = this.gelFromEl(d.el);
            if (!gel) {
                return;
            }

            if ((d.mods & ModifierKeys.Cmd) !== 0 || (d.mods & ModifierKeys.Opt) !== 0) {
                return;
            }

            pr.setCurrentFocus(d.el.id);
            if (d.el.getB('selectbylines')) {
                TextSelModify.mouseClickSelectByLines(gel, d.mouseX, d.mouseY);
            } else {
                let isShift = (d.mods & ModifierKeys.Shift) !== 0;
                TextSelModify.mouseClickCoordsToSetCaret(
                    gel,
                    d.mouseX,
                    d.mouseY,
                    isShift
                );
                if (!isShift) {
                    pr.mouseDragStatus = MouseDragStatus.SelectingText;
                }
            }
        }
    }

    /**
     * onMouseMove, see if we should select text
     */
    onMouseMoveSelect(pr: UI512PresenterWithMenuInterface, d: MouseMoveEventDetails) {
        if (
            pr.mouseDragStatus === MouseDragStatus.SelectingText &&
            pr.trackPressedBtns[0]
        ) {
            let el = pr.app.findEl(pr.trackClickedIds[0]);
            if (
                el &&
                el instanceof UI512ElTextField &&
                el.getB('canselecttext') &&
                pr.canSelectTextInField(el) &&
                !el.getB('selectbylines')
            ) {
                let gel = this.gelFromEl(el);
                if (gel) {
                    if (RectUtils.hasPoint(d.mouseX, d.mouseY, el.x, el.y, el.w, el.h)) {
                        TextSelModify.mouseClickCoordsAdjustSelection(
                            gel,
                            d.mouseX,
                            d.mouseY
                        );
                    }
                }
            }
        }
    }

    /**
     * if cursor is in an editable field, change the cursor!
     */
    onMouseMoveSetTextEditCursor(
        pr: UI512PresenterWithMenuInterface,
        d: MouseMoveEventDetails
    ) {
        if (d.elPrev !== d.elNext) {
            if (
                d.elNext &&
                d.elNext instanceof UI512ElTextField &&
                d.elNext.getB('canedit')
            ) {
                UI512CursorAccess.setCursor(UI512Cursors.lbeam);
            } else {
                UI512CursorAccess.setCursor(UI512Cursors.arrow);
            }
        }
    }

    /**
     * onMouseDoubleDown, select the current word
     */
    onMouseDoubleDown(
        pr: UI512PresenterWithMenuInterface,
        d: MouseDownDoubleEventDetails
    ) {
        if (d.button === 0) {
            if (
                d.el &&
                d.el instanceof UI512ElTextField &&
                d.el.getB('canselecttext') &&
                pr.canSelectTextInField(d.el) &&
                !d.el.getB('selectbylines')
            ) {
                let gel = this.gelFromEl(d.el);
                if (gel) {
                    /* disable the drag-to-select */
                    pr.mouseDragStatus = MouseDragStatus.None;
                    TextSelModify.changeSelCurrentWord(gel);
                }
            }
        }
    }

    /**
     * onMouseUp, we are no longer dragging
     */
    onMouseUp(pr: UI512PresenterWithMenuInterface, d: MouseUpEventDetails) {
        pr.mouseDragStatus = MouseDragStatus.None;
    }

    /**
     * onKeyDown, send both keyboard shortcuts and inserted text to the field
     */
    onKeyDown(pr: UI512PresenterWithMenuInterface, d: KeyDownEventDetails) {
        let el = TextSelModify.getSelectedField(pr);
        if (el && el.getB('selectbylines')) {
            return;
        } else if (!el || d.handled()) {
            return;
        }

        let gel = this.gelFromEl(el);
        if (!gel) {
            return;
        }

        let wasShortcut = true;
        switch (d.readableShortcut) {
            case 'Cmd+A':
                TextSelModify.changeSelSelectAll(gel);
                break;
            case 'Backspace':
                TextSelModify.changeTextBackspace(gel, true, false);
                break;
            case 'Cmd+Backspace':
                TextSelModify.changeTextBackspace(gel, true, true);
                break;
            case 'Delete':
                TextSelModify.changeTextBackspace(gel, false, false);
                break;
            case 'Cmd+Delete':
                TextSelModify.changeTextBackspace(gel, false, true);
                break;
            case 'PageUp':
                TextSelModify.changeSelPageUpDown(gel, true, false);
                break;
            case 'Shift+PageUp':
                TextSelModify.changeSelPageUpDown(gel, true, true);
                break;
            case 'PageDown':
                TextSelModify.changeSelPageUpDown(gel, false, false);
                break;
            case 'Shift+PageDown':
                TextSelModify.changeSelPageUpDown(gel, false, true);
                break;
            case 'Home':
                TextSelModify.changeSelGoLineHomeEnd(gel, true, false);
                break;
            case 'Shift+Home':
                TextSelModify.changeSelGoLineHomeEnd(gel, true, true);
                break;
            case 'Cmd+Home':
                TextSelModify.changeSelGoDocHomeEnd(gel, true, false);
                break;
            case 'Cmd+Shift+Home':
                TextSelModify.changeSelGoDocHomeEnd(gel, true, true);
                break;
            case 'End':
                TextSelModify.changeSelGoLineHomeEnd(gel, false, false);
                break;
            case 'Shift+End':
                TextSelModify.changeSelGoLineHomeEnd(gel, false, true);
                break;
            case 'Cmd+End':
                TextSelModify.changeSelGoDocHomeEnd(gel, false, false);
                break;
            case 'Cmd+Shift+End':
                TextSelModify.changeSelGoDocHomeEnd(gel, false, true);
                break;
            case 'ArrowLeft':
                TextSelModify.changeSelLeftRight(gel, true, false, false);
                break;
            case 'Shift+ArrowLeft':
                TextSelModify.changeSelLeftRight(gel, true, true, false);
                break;
            case 'Cmd+ArrowLeft':
                TextSelModify.changeSelLeftRight(gel, true, false, true);
                break;
            case 'Cmd+Shift+ArrowLeft':
                TextSelModify.changeSelLeftRight(gel, true, true, true);
                break;
            case 'ArrowRight':
                TextSelModify.changeSelLeftRight(gel, false, false, false);
                break;
            case 'Shift+ArrowRight':
                TextSelModify.changeSelLeftRight(gel, false, true, false);
                break;
            case 'Cmd+ArrowRight':
                TextSelModify.changeSelLeftRight(gel, false, false, true);
                break;
            case 'Cmd+Shift+ArrowRight':
                TextSelModify.changeSelLeftRight(gel, false, true, true);
                break;
            case 'ArrowUp':
                TextSelModify.changeSelArrowKeyUpDownVisual(gel, true, false);
                break;
            case 'Shift+ArrowUp':
                TextSelModify.changeSelArrowKeyUpDownVisual(gel, true, true);
                break;
            case 'Cmd+ArrowUp': {
                let arrowbtnup = fldIdToScrollbarPartId(el.id, 'arrowUp');
                this.getScrollbarImpl().onScrollArrowClicked(
                    pr,
                    arrowbtnup,
                    -1 * UI512TextEvents.amtScrollArrowClicked
                );
                break;
            }
            case 'ArrowDown':
                TextSelModify.changeSelArrowKeyUpDownVisual(gel, false, false);
                break;
            case 'Shift+ArrowDown':
                TextSelModify.changeSelArrowKeyUpDownVisual(gel, false, true);
                break;
            case 'Cmd+ArrowDown': {
                let arrowbtndn = fldIdToScrollbarPartId(el.id, 'arrowDn');
                this.getScrollbarImpl().onScrollArrowClicked(
                    pr,
                    arrowbtndn,
                    UI512TextEvents.amtScrollArrowClicked
                );
                break;
            }
            case 'Return':
                TextSelModify.changeTextInsert(gel, '\n');
                break;
            case 'Enter':
                TextSelModify.changeTextInsert(gel, '\n');
                break;
            case 'NumpadEnter':
                TextSelModify.changeTextInsert(gel, '\n');
                break;
            case 'Cmd+C':
                this.sendCutOrCopy(pr, el, false);
                break;
            case 'Cmd+X':
                this.sendCutOrCopy(pr, el, true);
                break;
            default:
                wasShortcut = false;
                break;
        }

        if (d.readableShortcut === 'Cmd+V' && !pr.useOSClipboard) {
            pr.clipManager.paste(pr.useOSClipboard);
            wasShortcut = true;
        }

        if (wasShortcut) {
            d.setHandled();
        } else if (
            (d.mods === 0 || d.mods === ModifierKeys.Shift) &&
            d.keyChar.length === 1
        ) {
            let char = d.keyChar;
            let charcode = d.keyChar.charCodeAt(0);
            let toRoman = FormattedText.fromHostCharsetStrict(
                char,
                BrowserInfo.inst().os
            );
            if (
                toRoman &&
                toRoman.length === 1 &&
                toRoman.charCodeAt(0) >= 32 &&
                charcode >= 32
            ) {
                if (gel) {
                    /* insert the char into the field */
                    TextSelModify.changeTextInsert(gel, toRoman);
                    d.setHandled();
                }
            }
        }
    }

    /**
     * will this key probably cause a change in the text field?
     */
    static keyDownProbablyCausesTextChange(d: KeyDownEventDetails) {
        if ((d.mods === 0 || d.mods === ModifierKeys.Shift) && d.keyChar.length === 1) {
            return true;
        }

        if (
            d.readableShortcut.search(/\bBackspace\b/) !== -1 ||
            d.readableShortcut.search(/\bDelete\b/) !== -1
        ) {
            return true;
        }

        switch (d.readableShortcut) {
            case 'Return':
                return true;
            case 'Enter':
                return true;
            case 'NumpadEnter':
                return true;
            case 'Cmd+V':
                return true;
            case 'Cmd+X':
                return true;
            default:
                return false;
        }
    }

    /**
     * onPasteText, insert the text
     */
    onPasteText(pr: UI512PresenterWithMenuInterface, d: PasteTextEventDetails) {
        let el = TextSelModify.getSelectedField(pr);
        if (el && !(d.fromOS && !pr.useOSClipboard)) {
            let text = d.fromOS
                ? FormattedText.fromExternalCharset(d.text, BrowserInfo.inst().os)
                : d.text;
            let gel = this.gelFromEl(el);
            if (gel) {
                TextSelModify.changeTextInsert(gel, text);
            }
        }
    }

    /**
     * cut or copy text
     */
    sendCutOrCopy(
        pr: UI512PresenterWithMenuInterface,
        el: UI512ElTextField,
        isCut: boolean
    ) {
        if (el) {
            let gel = this.gelFromEl(el);
            if (!gel) {
                return;
            }

            if (el.getB('asteriskonly')) {
                /* this is a password "asteriskonly" field so don't allow cut/copy */
                return;
            }

            let sel = TextSelModify.getSelectedText(gel);
            if (sel && sel.length > 0) {
                let text = pr.useOSClipboard
                    ? FormattedText.toExternalCharset(sel, BrowserInfo.inst().os)
                    : sel;
                let succeeded = pr.clipManager.copy(text, pr.useOSClipboard);
                if (succeeded && isCut && sel.length > 0) {
                    TextSelModify.changeTextBackspace(gel, false, false);
                }
            }
        }
    }

    /**
     * onIdle, blink the caret
     */
    protected onBlinkCaret(pr: UI512PresenterWithMenuInterface, d: IdleEventDetails) {
        pr.timerSlowIdle.update(d.milliseconds);
        if (pr.timerSlowIdle.isDue()) {
            pr.timerSlowIdle.reset();

            /* blink the caret for this field */
            if (pr.getCurrentFocus()) {
                let el = pr.app.findEl(pr.getCurrentFocus());
                if (el && el instanceof UI512ElTextField && el.getB('canselecttext')) {
                    el.set('showcaret', !el.getB('showcaret'));
                }
            }
        }
    }

    /**
     * onIdle, continue scrolling if holding mouse down on field
     */
    onIdle(pr: UI512PresenterWithMenuInterface, d: IdleEventDetails) {
        /* scroll down more if user is still clicked on the down arrow */
        let clickedid = pr.trackClickedIds[0];
        if (pr.mouseDragStatus === MouseDragStatus.ScrollArrow && clickedid) {
            let moveAmt = getAmountIfScrollArrowClicked(clickedid);
            if (moveAmt) {
                let el = pr.app.findEl(clickedid);
                if (
                    el &&
                    RectUtils.hasPoint(
                        pr.trackMouse[0],
                        pr.trackMouse[1],
                        el.x,
                        el.y,
                        el.w,
                        el.h
                    )
                ) {
                    this.getScrollbarImpl().onScrollArrowClicked(pr, clickedid, moveAmt);
                }
            }
        }

        this.onBlinkCaret(pr, d);
        if (pr.useOSClipboard) {
            pr.clipManager.ensureReadyForPaste(d.milliseconds);
        }
    }
}

/**
 * default listeners for a presenter with text editing.
 */
export function addDefaultListeners(listeners: { [t: number]: FnEventCallback[] }) {
    let editTextBehavior = new UI512TextEvents();
    listeners[UI512EventType.MouseDown] = [
        BasicHandlers.trackMouseStatusMouseDown,
        BasicHandlers.trackCurrentElMouseDown,
        BasicHandlers.trackHighlightedButtonMouseDown,
        MenuListeners.onMouseDown,
        editTextBehavior.onMouseDownScroll.bind(editTextBehavior),
        editTextBehavior.onMouseDownSelect.bind(editTextBehavior)
    ];

    listeners[UI512EventType.MouseUp] = [
        BasicHandlers.trackMouseStatusMouseUp,
        BasicHandlers.trackCurrentElMouseUp,
        BasicHandlers.trackHighlightedButtonMouseUp,
        MenuListeners.onMouseUp,
        editTextBehavior.onMouseUp.bind(editTextBehavior)
    ];

    listeners[UI512EventType.Idle] = [
        editTextBehavior.onIdle.bind(editTextBehavior),
        BasicHandlers.onIdleRunCallbackQueueFromAsyncs
    ];

    listeners[UI512EventType.MouseMove] = [
        BasicHandlers.trackCurrentElMouseMove,
        editTextBehavior.onMouseMoveSetTextEditCursor.bind(editTextBehavior),
        editTextBehavior.onMouseMoveSelect.bind(editTextBehavior)
    ];

    listeners[UI512EventType.MouseEnter] = [
        BasicHandlers.trackHighlightedButtonMouseEnter,
        MenuListeners.onMouseEnter
    ];

    listeners[UI512EventType.MouseLeave] = [
        BasicHandlers.trackHighlightedButtonMouseLeave,
        MenuListeners.onMouseLeave
    ];

    listeners[UI512EventType.KeyDown] = [
        BasicHandlers.basicKeyShortcuts,
        editTextBehavior.onKeyDown.bind(editTextBehavior)
    ];

    listeners[UI512EventType.KeyUp] = [];

    listeners[UI512EventType.MouseDownDouble] = [
        BasicHandlers.trackMouseDoubleDown,
        editTextBehavior.onMouseDoubleDown.bind(editTextBehavior)
    ];

    listeners[UI512EventType.PasteText] = [
        editTextBehavior.onPasteText.bind(editTextBehavior)
    ];
}
