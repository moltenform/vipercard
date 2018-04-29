
/* auto */ import { O, checkThrowUI512 } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { OrderedHash } from '../../ui512/utils/utils512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { largeArea } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { ElementObserver, elementObserverDefault } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';

/**
 * a group of elements.
 * useful for say, a dialog box, because you can hide the entire group at once,
 * or close the entire group at once.
 * also, if mouseInteractionBounds is used, better perf to go from mouse coords to element.
 * this class has model state only: rendering logic should go in view, not here.
 */
export class UI512ElGroup {
    readonly id: string;
    observer: ElementObserver;
    protected elements = new OrderedHash<UI512Element>();
    protected visible = true;
    enableMouseInteraction = true;
    mouseInteractionBounds: [number, number, number, number] = [0, 0, largeArea, largeArea];

    constructor(id: string, observer: ElementObserver = elementObserverDefault) {
        this.id = id;
        this.observer = observer;
    }

    /**
     * is the group visible
     */
    getVisible() {
        return this.visible;
    }

    /**
     * set the group visibility
     */
    setVisible(v: boolean, context = ChangeContext.Default) {
        if (v !== this.visible) {
            this.observer.changeSeen(context, '(setVisible)', '(setVisible)', 0, 0);
            this.visible = v;
        }
    }

    /**
     * updateBoundsBasedOnChildren is a performance optimization:
     * to go from mouse coords to which element clicked, we loop through all elements
     * but since a group is likely confined to one area, we can check and maybe skip everything in the group
     */
    updateBoundsBasedOnChildren() {
        let setAtLeastOne = false;
        let maxBounds = [
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
            Number.NEGATIVE_INFINITY
        ];

        for (let el of this.elements.iter()) {
            setAtLeastOne = true;
            maxBounds[0] = Math.min(maxBounds[0], el.x);
            maxBounds[1] = Math.min(maxBounds[1], el.y);
            maxBounds[2] = Math.max(maxBounds[2], el.right);
            maxBounds[3] = Math.max(maxBounds[3], el.bottom);
        }

        if (setAtLeastOne) {
            this.mouseInteractionBounds[0] = maxBounds[0];
            this.mouseInteractionBounds[1] = maxBounds[1];
            this.mouseInteractionBounds[2] = maxBounds[2] - maxBounds[0];
            this.mouseInteractionBounds[3] = maxBounds[3] - maxBounds[1];
        } else {
            this.mouseInteractionBounds[0] = 0;
            this.mouseInteractionBounds[1] = 0;
            this.mouseInteractionBounds[2] = 0;
            this.mouseInteractionBounds[3] = 0;
        }
    }

    /**
     * look for element by id. throws if not found.
     */
    getEl(id: string): UI512Element {
        return this.elements.get(id);
    }

    /**
     * look for element by id. returns undefined if not found
     */
    findEl(id: string): O<UI512Element> {
        return this.elements.find(id);
    }

    /**
     * loop over elements. in z-order from background to foreground.
     */
    *iterEls() {
        for (let o of this.elements.iter()) {
            yield o;
        }
    }

    /**
     * loop over elements. in reversed z-order from foreground to background.
     */
    *iterElsReversed() {
        for (let o of this.elements.iterReversed()) {
            yield o;
        }
    }

    /**
     * remove all elements.
     */
    removeAllEls(context = ChangeContext.Default) {
        this.observer.changeSeen(context, '(removeallels)', '(removeallels)', 0, 0);
        this.elements.deleteAll();
    }

    /**
     * add an element to the group.
     * for convenience, attaches our Observer to the new element
     */
    addElementAfter(
        parent: UI512ApplicationInterface,
        elemIn: UI512Element,
        elToAddAfter: O<string>,
        context = ChangeContext.Default
    ) {
        /* disallow any duplicates */
        for (let grp of parent.iterGrps()) {
            checkThrowUI512(!grp.findEl(elemIn.id), `2x|dup ${elemIn.id} found in grp ${grp.id}`);
        }

        /* for convenience, copy our observer onto the new element */
        if (elemIn.observer === elementObserverDefault) {
            elemIn.observer = this.observer;
        }

        if (elToAddAfter) {
            /* if we are adding "elemC##test" and elToAddAfter=="elemC", and
            already existing are "elemA", "elemB", "elemC", "elemC##1", "elemC##2", "elemD"
            we want the order to be "elemA", "elemB", "elemC", "elemC##1", "elemC##2", "elemC##test", "elemD"
            validated in testAddElementAfter */
            let index = this.elements.getIndex(elToAddAfter);
            let first = this.elements.atIndex(index);
            if (first) {
                let firstId = first.id;
                while (true) {
                    index += 1;
                    let cur = this.elements.atIndex(index);
                    if (!cur || !cur.id.startsWith(firstId + '##')) {
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

    /**
     * add an element to the group.
     */
    addElement(parent: UI512ApplicationInterface, elemIn: UI512Element, context = ChangeContext.Default) {
        return this.addElementAfter(parent, elemIn, undefined, context);
    }

    /**
     * remove an element from the group.
     */
    removeElement(id: string, context = ChangeContext.Default): boolean {
        let found = this.elements.find(id);
        if (found) {
            this.observer.changeSeen(context, found.id, '(removeel)', 0, 0);
        }

        return this.elements.delete(id);
    }

    /**
     * return number of elements
     */
    countElems() {
        return this.elements.length();
    }
}

/**
 * forward declaration of application interface
 */
export interface UI512ApplicationInterface {
    iterGrps(): Iterable<UI512ElGroup>;
}
