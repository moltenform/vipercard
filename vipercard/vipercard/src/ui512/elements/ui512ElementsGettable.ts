
/* auto */ import { assertTrue, checkThrowUI512, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';

/* properties can be any one of these types */
export type ElementObserverVal = string | boolean | number | FormattedText;

/* when properties are set on an Element, an Observer can be attached to receive a callback for all changes */
export interface ElementObserver {
    changeSeen(
        context: ChangeContext,
        elId: string,
        propName: string,
        prevVal: ElementObserverVal,
        newVal: ElementObserverVal
    ): void;
}

/* all Elements must have an observer. so use this class if the observer truly isn't needed */
export class ElementObserverNoOp implements ElementObserver {
    changeSeen(
        context: ChangeContext,
        elId: string,
        propName: string,
        prevVal: ElementObserverVal,
        newVal: ElementObserverVal
    ) {}
}

/* Elements have this observer by default, to remind you to attach to a better Observer. */
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

/**
 * a "Gettable" class has all of its properties marked as protected,
 * and allows access to them through a get() method.
 * types are checked at runtime, since we've forfeited TS's compile time checking.
 */
export abstract class UI512Gettable {
    getN(s: string): number {
        let v = this.get(s);
        assertEq(typeof 0, typeof v, `2+|${s} expected type ${typeof 0}`);
        return v;
    }

    getS(s: string): string {
        let v = this.get(s);
        assertEq(typeof '', typeof v, `2*|${s} expected type ${typeof ''}`);
        return v;
    }

    getB(s: string): boolean {
        let v = this.get(s);
        assertEq('boolean', typeof v, `2)|${s} expected type 'boolean'}`);
        return v;
    }

    get_generic(s: string): ElementObserverVal {
        let v = this.get(s);
        assertTrue(v !== null && v !== undefined, `2(|${s} undefined`);
        return v;
    }

    protected get(s: string): any {
        let v: any = (this as any)['_' + s]; /* gettable */
        return v;
    }

    get_ftxt(): FormattedText {
        let v = this.get(UI512Settable.formattedTextField);
        let ftxt = v as FormattedText;
        assertTrue(ftxt && ftxt.isFormattedText, `2&|did not get formatted text as expected`);

        /* ensure the "lock" bit has been set before we allow access
        otherwise, you could make changes to the object and we'd never recieve any change notification */
        ftxt.lock();
        return ftxt;
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
    static readonly formattedTextField = 'ftxt';
    readonly id: string;
    protected dirty = true;
    protected locked = false;
    observer: ElementObserver;

    lock(locked: boolean) {
        this.locked = locked;
    }

    constructor(id: string, observer: ElementObserver = elementObserverDefault) {
        super();
        assertTrue(slength(id), '2%|invalid id');
        assertTrue(!scontains(id, '|'), '2$|invalid id');
        this.id = id;
        this.observer = observer;
    }

    /* type inference works well enough that you shouldn't ever have to specify the type. */
    set(s: string, newVal: ElementObserverVal, context = ChangeContext.Default) {
        checkThrowUI512(!this.locked, '6L|tried to set value when locked. setting during refresh()?');
        let prevVal = this.get(s);
        assertEq(typeof prevVal, typeof newVal, `2#|property ${s} type mismatch`);
        (this as any)['_' + s] = newVal; /* gettable */
        if (prevVal !== newVal) {
            this.dirty = true;
            this.observer.changeSeen(context, this.id, s, prevVal, newVal);
        }
    }

    setftxt(newTxt: FormattedText, context = ChangeContext.Default) {
        checkThrowUI512(!this.locked, 'tried to set value when locked. setting during refresh()?');
        let prevVal = this.get_ftxt();
        assertTrue(!!newTxt, '2!|invalid newtxt', this.id);
        (this as any)['_' + UI512Settable.formattedTextField] = newTxt; /* gettable */
        if (prevVal !== newTxt) {
            this.dirty = true;
            newTxt.lock();
            this.observer.changeSeen(context, this.id, UI512Settable.formattedTextField, prevVal, newTxt);
        }
    }

    getDirty() {
        return this.dirty;
    }

    setDirty(newval: boolean, context = ChangeContext.Default) {
        this.dirty = newval;
        if (newval) {
            this.observer.changeSeen(context, this.id, '', '', '');
        }
    }
}

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
