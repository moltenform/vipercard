
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, RepeatingTimer } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { NullaryFn } from '../../ui512/utils/utilsTestCanvas.js';

/**
 * clipboard for copying/pasting text
 */
export interface ClipManagerInterface {
    ensureReadyForPaste(milliseconds: number): void;
    paste(useOSClipboard: boolean): void;
    copy(s: string, useOSClipboard: boolean): boolean;
}

/**
 * in original os, you had to hold mouse down on the menus the entire time
 * in ours, you can click once and the menu stays open
 */
export enum MenuOpenState {
    __isUI512Enum = 1,
    MenusClosed,
    MenusOpenInitialMouseDown,
    MenusOpen
}

/**
 * type of event
 */
export enum UI512EventType {
    __isUI512Enum = 1,
    None,
    KeyUp,
    KeyDown,
    MouseDown,
    MouseDownDouble,
    MouseUp,
    MouseMove,
    MouseEnter,
    MouseLeave,
    MenuItemClicked,
    PasteText,
    Idle,
    FocusChanged
}

/**
 * context of change
 * e.g., changes from renderModel could hypothetically use a different value here,
 * since it's a different type of change than one coming directly from user.
 * (not currently used)
 */
export enum ChangeContext {
    __isUI512Enum = 1,
    Default
}

/**
 * current mouse drag status
 * there's no use extending this to every type of drag action,
 * tried that, but in all meaningful drag actions, one needs to maintain state
 * beyond just mouse-down or mouse-up.
 */
export enum MouseDragStatus {
    __isUI512Enum = 1,
    None,
    ScrollArrow,
    SelectingText,
    DragAndDrop
}

/**
 * a _TemporaryIgnoreEvents_ temporarily replaces all event listeners in a presenter.
 */
export interface TemporarilyIgnoreEventsInterface {
    whenComplete(): void;
    shouldRestore(ms: number): boolean;
}

/**
 * a Presenter receives Events,
 * updates Models accordingly,
 * and sends Models to ElementsView to be drawn.
 */
export interface UI512PresenterInterface {
    clipManager: ClipManagerInterface;
    timerSlowIdle: RepeatingTimer;
    useOSClipboard: boolean;
    mouseDragStatus: number;
    removeEl(grpId: string, elId: string, context?: ChangeContext): void;
    rebuildFieldScrollbars(): void;
    trackMouse: number[];
    trackPressedBtns: boolean[];
    trackClickedIds: O<string>[];
    listeners: { [t: number]: Function[] };
    callbackQueueFromAsyncs: (O<NullaryFn>)[];
    continueEventAfterError: boolean;
    needRedraw: boolean;
    inited: boolean;
    openState: MenuOpenState;
    tmpIgnore: O<TemporarilyIgnoreEventsInterface>;
    importMouseTracking(other: UI512PresenterInterface): void;
    getCurrentFocus(): O<string>;
    setCurrentFocus(next: O<string>): void;
    listenEvent(type: UI512EventType, fn: Function): void;
    changeSeen(context: ChangeContext): void;
    render(canvas: CanvasWrapper, ms: number, cmpTotal: RenderComplete): void;
    invalidateAll(): void;
    placeCallbackInQueue(cb: () => void): void;
    removeEl(grpId: string, elId: string, context: ChangeContext): void;
    rebuildFieldScrollbars(): void;
}
