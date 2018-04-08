
/* auto */ import { O, checkThrowUI512 } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { OrderedHash } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { largeArea } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { ElementObserver, elementObserverDefault } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';

export class UI512ElGroup {
    readonly id: string;
    observer: ElementObserver;
    protected elements = new OrderedHash<UI512Element>();
    protected visible = true;

    // perf optimization: restrict mouse interaction to be within bounds
    enableMouseInteraction = true;
    mouseInteractionBounds: [number, number, number, number] = [0, 0, largeArea, largeArea];

    constructor(id: string, observer: ElementObserver = elementObserverDefault) {
        this.id = id;
        this.observer = observer;
    }

    getVisible() {
        return this.visible;
    }

    setVisible(v: boolean, context = ChangeContext.Default) {
        if (v !== this.visible) {
            this.observer.changeSeen(context, '(groupSetVisible)', 'visible', this.visible, v);
            this.visible = v;
        }
    }

    updateBoundsBasedOnChildren() {
        let setAtLeastOne = false;
        let extremes = [
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ];

        for (let el of this.elements.iter()) {
            setAtLeastOne = true;
            extremes[0] = Math.min(extremes[0], el.x);
            extremes[1] = Math.min(extremes[1], el.y);
            extremes[2] = Math.max(extremes[2], el.right);
            extremes[3] = Math.max(extremes[3], el.bottom);
        }

        if (setAtLeastOne) {
            this.mouseInteractionBounds[0] = extremes[0];
            this.mouseInteractionBounds[1] = extremes[1];
            this.mouseInteractionBounds[2] = extremes[2] - extremes[0];
            this.mouseInteractionBounds[3] = extremes[3] - extremes[1];
        } else {
            this.mouseInteractionBounds[0] = 0;
            this.mouseInteractionBounds[1] = 0;
            this.mouseInteractionBounds[2] = 0;
            this.mouseInteractionBounds[3] = 0;
        }
    }

    getEl(id: string): UI512Element {
        return this.elements.get(id);
    }

    findEl(id: string): O<UI512Element> {
        return this.elements.find(id);
    }

    *iterEls() {
        for (let o of this.elements.iter()) {
            yield o;
        }
    }

    *iterElsReversed() {
        for (let o of this.elements.iterReversed()) {
            yield o;
        }
    }

    removeAllEls(context = ChangeContext.Default) {
        this.observer.changeSeen(context, '(removeallels)', '(removeallels)', 0, 0);
        this.elements.deleteAll();
    }

    addElementAfter(
        parent: UI512ApplicationInterface,
        elemIn: UI512Element,
        idOfZIndex: O<string>,
        context = ChangeContext.Default
    ) {
        // disallow any duplicates
        for (let grp of parent.iterGrps()) {
            checkThrowUI512(!grp.findEl(elemIn.id), `2x|dup ${elemIn.id} found in grp ${grp.id}`);
        }

        if (elemIn.observer === elementObserverDefault) {
            elemIn.observer = this.observer;
        }

        if (idOfZIndex) {
            // example: you are adding "elemC##test" and idOfZIndex=="elemC"
            // already existing are "elemA", "elemB", "elemC", "elemC##1", "elemC##2", "elemD"
            // want order to be "elemA", "elemB", "elemC", "elemC##1", "elemC##2", "elemC##test", "elemD"
            // validated in test_utils_addElementAfter
            let index = this.elements.getIndex(idOfZIndex);
            let first = this.elements.atIndex(index);
            if (first) {
                let firstid = first.id;
                while (true) {
                    index += 1;
                    let cur = this.elements.atIndex(index);
                    if (!cur || !cur.id.startsWith(firstid + '##')) {
                        break;
                    }
                }
            }

            this.elements.insertAt(elemIn.id, elemIn, index);
        } else {
            this.elements.insertNew(elemIn.id, elemIn);
        }

        this.observer.changeSeen(context, elemIn.id, '(addel)', 0, 0);
    }

    addElement(parent: UI512ApplicationInterface, elemIn: UI512Element, context = ChangeContext.Default) {
        return this.addElementAfter(parent, elemIn, undefined, context);
    }

    removeElement(id: string, context = ChangeContext.Default): boolean {
        let found = this.elements.find(id);
        if (found) {
            this.observer.changeSeen(context, found.id, '(removeel)', 0, 0);
        }

        return this.elements.delete(id);
    }

    countElems() {
        return this.elements.length();
    }
}

export interface UI512ApplicationInterface {
    iterGrps(): Iterable<UI512ElGroup>;
}
