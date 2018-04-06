
/* auto */ import { O, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { OrderedHash } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { ElementObserver, elementObserverDefault } from '../../ui512/elements/ui512elementsgettable.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512ApplicationInterface, UI512ElGroup } from '../../ui512/elements/ui512elementsgroup.js';

export class UI512Application implements UI512ApplicationInterface {
    protected groups = new OrderedHash<UI512ElGroup>();
    observer: ElementObserver;
    bounds: number[] = [];

    constructor(bounds: number[], observer: ElementObserver = elementObserverDefault) {
        this.bounds = bounds;
        this.observer = observer;
    }

    getGroup(id: string) {
        return this.groups.get(id);
    }

    findGroup(id: string) {
        return this.groups.find(id);
    }

    *iterGrps() {
        for (let o of this.groups.iter()) {
            yield o;
        }
    }

    *iterGrpsReversed() {
        for (let o of this.groups.iterReversed()) {
            yield o;
        }
    }

    addGroup(grp: UI512ElGroup, context = ChangeContext.Default) {
        grp.observer = this.observer;
        this.groups.insertNew(grp.id, grp);
        this.observer.changeSeen(context, grp.id, '(addgrp)', 0, 0);
    }

    removeGroup(id: string, context = ChangeContext.Default) {
        this.groups.delete(id);
        this.observer.changeSeen(context, id, '(removegrp)', 0, 0);
    }

    coordsToElement(x: number, y: number) {
        for (let grp of this.groups.iterReversed()) {
            if (
                !grp.getVisible() ||
                !grp.enableMouseInteraction ||
                !RectUtils.hasPoint(
                    x,
                    y,
                    grp.mouseInteractionBounds[0],
                    grp.mouseInteractionBounds[1],
                    grp.mouseInteractionBounds[2],
                    grp.mouseInteractionBounds[3]
                )
            ) {
                continue;
            }

            for (let el of grp.iterElsReversed()) {
                if (el.visible) {
                    if (!el.transparentToClicks) {
                        if (RectUtils.hasPoint(x, y, el.x, el.y, el.w, el.h)) {
                            return el;
                        }
                    }
                }
            }
        }

        return undefined;
    }

    findElemByIdAndGroup(gpid: string, elemid: string) {
        let grp = this.groups.find(gpid);
        if (grp) {
            return grp.findEl(elemid);
        }

        return undefined;
    }

    findElemAndGroupById(elemid: O<string>): O<[UI512ElGroup, UI512Element]> {
        if (!elemid) {
            return undefined;
        }

        for (let grp of this.groups.iterReversed()) {
            let el = grp.findEl(elemid);
            if (el) {
                return [grp, el];
            }
        }

        return undefined;
    }

    findElemById(elemid: O<string>) {
        let found = this.findElemAndGroupById(elemid);
        if (found) {
            return found[1];
        }

        return undefined;
    }

    getElemById(elemid: string) {
        return throwIfUndefined(this.findElemById(elemid), '2w|not found ' + elemid);
    }
}
