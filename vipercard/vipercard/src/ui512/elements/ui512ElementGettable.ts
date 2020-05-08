
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertTrue, checkThrow512 } from './../utils/util512Assert';
/* auto */ import { assertEq, assertWarnEq, slength } from './../utils/util512';
/* auto */ import { ChangeContext } from './../draw/ui512Interfaces';
/* auto */ import { FormattedText } from './../drawtext/ui512FormattedText';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* properties can be any one of these types */
export type ElementObserverVal = string | boolean | number | FormattedText;

/**
 * a "Gettable" class has all of its properties marked as protected,
 * and allows access to them through a get() method.
 * types are currently verified at runtime.
 */
export abstract class UI512Gettable {
    getN(s: string): number {
        let v = (this as any)['_' + s]; /* gettable */
        assertEq(typeof 0, typeof v, `2+|${s} expected type ${typeof 0}`);
        return v;
    }

    getS(s: string): string {
        let v = (this as any)['_' + s]; /* gettable */
        assertWarnEq(typeof '', typeof v, `2*|${s} expected type ${typeof ''}`);
        return v;
    }

    getB(s: string): boolean {
        let v = (this as any)['_' + s]; /* gettable */
        assertEq('boolean', typeof v, `2)|${s} expected type 'boolean'}`);
        return v;
    }

    getGeneric(s: string): ElementObserverVal {
        let v = (this as any)['_' + s]; /* gettable */
        assertTrue(v !== null && v !== undefined, `2(|${s} undefined`);
        return v;
    }

    ui512GettableHas(s: string): boolean {
        let v = (this as any)['_' + s]; /* gettable */
        return v !== null && v !== undefined;
    }
}

/**
 * a "Settable" class has all of its properties marked as protected,
 * and allows access to them through a set() method.
 *
 * ChangeContext can indicate the origin of the event, it
 * currently has no effect anywhere.
 */
export abstract class UI512Settable extends UI512Gettable {
    static readonly fmtTxtVarName = 'ftxt';
    readonly idInternal: string;
    protected dirty = true;
    protected locked = false;
    protected static readonly emptyFmTxt = new FormattedText();
    observer: ElementObserver;

    lock(locked: boolean) {
        this.locked = locked;
    }

    constructor(id: string, observer: ElementObserver = elementObserverDefault) {
        super();
        assertTrue(slength(id), '2%|invalid id');
        assertTrue(!id.includes('|'), '2$|invalid id');
        this.idInternal = id;
        this.observer = observer;
        UI512PublicSettable.emptyFmTxt.lock();
    }

    protected setImplInternal(
        makeAccessDifficult: MakeAccessDifficult,
        s: string,
        newVal: ElementObserverVal,
        defaultVal: O<ElementObserverVal>,
        context: ChangeContext
    ) {
        checkThrow512(
            !this.locked,
            'O:|tried to set value when locked. setting during refresh()?'
        );
        let prevVal = (this as any)['_' + s];
        (this as any)['_' + s] = newVal; /* gettable */
        if (prevVal !== newVal) {
            if (defaultVal === undefined) {
                /* type check mandatory */
                assertEq(
                    typeof prevVal,
                    typeof newVal,
                    `2#|property ${s} type mismatch, did you misspell a prop name?`
                );
            } else {
                /* skip the type check, since the prev val might be undefined */
                if (prevVal === undefined || prevVal === null) {
                    prevVal = defaultVal;
                }
            }

            this.dirty = true;
            if (newVal instanceof FormattedText) {
                newVal.lock();
            }

            this.observer.changeSeen(context, this.idInternal, s, prevVal, newVal);
        }
    }

    getDirty() {
        return this.dirty;
    }

    setDirty(newVal: boolean, context = ChangeContext.Default) {
        this.dirty = newVal;
        if (newVal) {
            this.observer.changeSeen(context, this.idInternal, '', '', '');
        }
    }
}

/**
 * not only settable, but lets anyone set things
 */
export abstract class UI512PublicSettable extends UI512Settable {
    protected setImpl(
        s: string,
        newVal: ElementObserverVal,
        defaultVal: O<ElementObserverVal>,
        context: ChangeContext
    ) {
        this.setImplInternal(makeAccessDifficult, s, newVal, defaultVal, context);
    }

    set(s: string, newVal: ElementObserverVal, context = ChangeContext.Default) {
        this.setImplInternal(makeAccessDifficult, s, newVal, undefined, context);
    }

    get id(): string {
        return this.idInternal;
    }
}

/**
 * don't want people outside this file calling this
 */
class MakeAccessDifficult {}
const makeAccessDifficult = new MakeAccessDifficult();

/**
 * relay an Observer event to two classes.
 */
export class ElementObserverToTwo implements ElementObserver {
    observer1: ElementObserver;
    observer2: ElementObserver;
    changeSeen(
        context: ChangeContext,
        elId: string,
        propName: string,
        prevVal: ElementObserverVal,
        newVal: ElementObserverVal
    ) {
        this.observer1.changeSeen(context, elId, propName, prevVal, newVal);
        this.observer2.changeSeen(context, elId, propName, prevVal, newVal);
    }
}

/* when properties are set on an Element, an Observer can be attached
to receive a callback for all changes */
export interface ElementObserver {
    changeSeen(
        context: ChangeContext,
        elId: string,
        propName: string,
        prevVal: ElementObserverVal,
        newVal: ElementObserverVal
    ): void;
}

/* all Elements must have an observer,
so use this class if the observer truly isn't needed */
export class ElementObserverNoOp implements ElementObserver {
    changeSeen(
        context: ChangeContext,
        elId: string,
        propName: string,
        prevVal: ElementObserverVal,
        newVal: ElementObserverVal
    ) {}
}

/* Default to this, to remind you to attach to a better Observer. */
export class ElementObserverDefault implements ElementObserver {
    changeSeen(
        context: ChangeContext,
        elId: string,
        propName: string,
        prevVal: ElementObserverVal,
        newVal: ElementObserverVal
    ) {
        assertTrue(false, '2,|no observer attached');
    }
}

/* pre-made instances for convenience */
export const elementObserverNoOp = new ElementObserverNoOp();
export const elementObserverDefault = new ElementObserverDefault();
