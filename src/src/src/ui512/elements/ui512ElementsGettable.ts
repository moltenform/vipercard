
/* auto */ import { assertTrue, checkThrowUI512, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';

export type ElementObserverVal = string | boolean | number | FormattedText;

export interface ElementObserver {
    changeSeen(
        context: ChangeContext,
        elid: string,
        propname: string,
        prev: ElementObserverVal,
        newv: ElementObserverVal
    ): void;
}

export class ElementObserverNoOp implements ElementObserver {
    changeSeen(
        context: ChangeContext,
        elid: string,
        propname: string,
        prev: ElementObserverVal,
        newv: ElementObserverVal
    ) {}
}

export class ElementObserverDefault implements ElementObserver {
    changeSeen(
        context: ChangeContext,
        elid: string,
        propname: string,
        prev: ElementObserverVal,
        newv: ElementObserverVal
    ) {
        assertTrue(false, '2,|no observer attached');
    }
}

export const elementObserverNoOp = new ElementObserverNoOp();
export const elementObserverDefault = new ElementObserverDefault();

export abstract class UI512Gettable {
    get_n(s: string): number {
        let v = this.get(s);
        assertEq(typeof 0, typeof v, `2+|property ${s} expected type ${typeof 0}`);
        return v as number;
    }

    get_s(s: string): string {
        let v = this.get(s);
        assertEq(typeof '', typeof v, `2*|property ${s} expected type ${typeof ''}`);
        return v as string;
    }

    get_b(s: string): boolean {
        let v = this.get(s);
        assertEq('boolean', typeof v, `2)|property ${s} expected type 'boolean'}`);
        return v as boolean;
    }

    get_generic(s: string): ElementObserverVal {
        return this.get(s);
    }

    protected get(s: string): any {
        let v: any = (this as any)['_' + s];
        assertTrue(v !== null && v !== undefined, `2(|property ${s} undefined`);
        return v;
    }

    get_ftxt(): FormattedText {
        let v = this.get(UI512Settable.formattedTextField);
        let ftxt = v as FormattedText;
        assertTrue(ftxt && ftxt.isFormattedText, `2&|did not get formatted text as expected`);
        // safe to allow access because the "lock" bit has been set
        ftxt.lock();
        return ftxt;
    }
}

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

    set<T>(s: string, newval: T, context = ChangeContext.Default) {
        checkThrowUI512(!this.locked, '6L|tried to set value when locked. setting during refresh()?');
        let prev = this.get(s);
        assertEq(typeof prev, typeof newval, `2#|property ${s} type mismatch`);
        (this as any)['_' + s] = newval;
        if (prev !== newval) {
            this.dirty = true;
            this.observer.changeSeen(context, this.id, s, prev, newval as any);
        }
    }

    setftxt(newtxt: FormattedText, context = ChangeContext.Default) {
        checkThrowUI512(!this.locked, 'tried to set value when locked. setting during refresh()?');
        let prev = this.get_ftxt();
        assertTrue(!!newtxt, '2!|invalid newtxt', this.id);
        (this as any)['_' + UI512Settable.formattedTextField] = newtxt;
        if (prev !== newtxt) {
            this.dirty = true;
            newtxt.lock();
            this.observer.changeSeen(context, this.id, UI512Settable.formattedTextField, prev, newtxt);
        }
    }

    getdirty() {
        return this.dirty;
    }

    setdirty(newval: boolean, context = ChangeContext.Default) {
        this.dirty = newval;
        if (newval) {
            this.observer.changeSeen(context, this.id, '', '', '');
        }
    }
}

export class ElementObserverToTwo implements ElementObserver {
    observer1: ElementObserver;
    observer2: ElementObserver;
    changeSeen(
        context: ChangeContext,
        elid: string,
        propname: string,
        prev: ElementObserverVal,
        newv: ElementObserverVal
    ) {
        this.observer1.changeSeen(context, elid, propname, prev, newv);
        this.observer2.changeSeen(context, elid, propname, prev, newv);
    }
}
