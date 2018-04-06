
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, RepeatingTimer } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { NullaryFn } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langBase.js';

export interface ClipManagerInterface {
    ensureReadyForPaste(milliseconds: number): void;
    paste(useOSClipboard: boolean): void;
    copy(s: string, useOSClipboard: boolean): boolean;
}

export enum MenuOpenState {
    __isUI512Enum = 1,
    MenusClosed,
    MenusOpenInitialMouseDown,
    MenusOpen,
}

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
    FocusChanged,
}

// changecontext, for future extensibility.
// currently has no functional impact.
export enum ChangeContext {
    __isUI512Enum = 1,
    Default,
    FromRenderModel,
}

export enum MouseDragStatus {
    __isUI512Enum = 1,
    None,
    ScrollArrow,
    SelectingText,
    DragAndDrop,
}

export interface TemporaryIgnoreEventsInterface {
    whenComplete(): void;
    shouldRestore(ms: number): boolean;
}

export interface UI512PresenterInterface {
    clipManager: ClipManagerInterface;
    timerSlowIdle: RepeatingTimer;
    useOSClipboard: boolean;
    mouseDragStatus: number;
    lang: UI512Lang;

    removeEl(gpid: string, elid: string, context?: ChangeContext): void;
    rebuildFieldScrollbars(): void;

    trackMouse: number[];
    trackPressedBtns: boolean[];
    trackClickedIds: O<string>[];
    trackKeyCmd: boolean;
    trackKeyOption: boolean;
    trackKeyShift: boolean;
    listeners: { [t: number]: Function[] };
    callbackQueueFromAsyncs: (O<NullaryFn>)[];
    continueEventAfterError: boolean;
    needRedraw: boolean;
    inited: boolean;
    openState: MenuOpenState;
    tmpIgnore: O<TemporaryIgnoreEventsInterface>;

    importMouseTracking(other: UI512PresenterInterface): void;

    getCurrentFocus(): O<string>;

    setCurrentFocus(next: O<string>): void;

    listenEvent(type: UI512EventType, fn: Function): void;

    changeSeen(context: ChangeContext): void;

    render(canvas: CanvasWrapper, ms: number, cmptotal: RenderComplete): void;

    invalidateAll(): void;

    placeCallbackInQueue(cb: () => void): void;

    removeEl(gpid: string, elid: string, context: ChangeContext): void;
    rebuildFieldScrollbars(): void;
}
