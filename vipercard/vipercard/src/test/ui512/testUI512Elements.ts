
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { getUI512WindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { largeArea } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { ElementObserverNoOp } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { GridLayout, UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';

export class TestUI512Elements extends UI512TestBase {
    tests = [
        'testGrpFindById',
        () => {
            let [app, grp] = this.makeFakeGroup();

            /* find existing */
            let el = grp.findEl('btn1');
            assertEq('btn1', el!.id, '');

            /* find not existing */
            el = grp.findEl('btn9');
            assertEq(undefined, el, '');

            /* get existing */
            el = grp.getEl('btn1');
            assertEq('btn1', el.id, '');

            /* get not existing */
            this.assertThrows('', 'not find', () => grp.getEl('btn9'));
        },
        'testAppFindById',
        () => {
            let [app, grp] = this.makeFakeGroup();
            let fakeGrp2 = new UI512ElGroup('fakegrp2');
            app.addGroup(fakeGrp2);
            let btn4 = new UI512ElButton('btn4');
            fakeGrp2.addElement(app, btn4);
            let btn5 = new UI512ElButton('btn5');
            fakeGrp2.addElement(app, btn5);
            btn4.set('labeltext', 'fromnewgroup');
            btn5.set('labeltext', 'fromnewgroup');

            /* find existing */
            let el = app.findEl('btn1');
            assertEq('btn1', el!.id, '');
            assertEq('', el!.getS('labeltext'), '');

            /* find not existing */
            el = app.findEl('btn9');
            assertEq(undefined, el, '');

            /* get existing */
            el = app.getEl('btn1');
            assertEq('btn1', el.id, '');
            assertEq('', el.getS('labeltext'), '');

            /* get not existing */
            this.assertThrows('', 'not found', () => app.getEl('btn9'));

            /* from other group */
            el = app.getEl('btn4');
            assertEq('btn4', el.id, '');
            assertEq('fromnewgroup', el.getS('labeltext'), '');
        },
        'testCoordsToElement',
        () => {
            let [app, grp] = this.makeFakeGroup();
            grp.getEl('btn1').setDimensionsX1Y1(10, 20, 100, 200);
            grp.getEl('btn2').setDimensionsX1Y1(20, 30, 110, 210);

            /* where no element is */
            let el = app.coordsToElement(5, 15);
            assertEq(undefined, el, '');

            /* where only first element is */
            el = app.coordsToElement(15, 25);
            assertEq('btn1', el!.id, '');

            /* where both elements are (highest gets priority) */
            el = app.coordsToElement(70, 80);
            assertEq('btn2', el!.id, '');

            /* where only second element is */
            el = app.coordsToElement(105, 205);
            assertEq('btn2', el!.id, '');

            /* where no element is */
            el = app.coordsToElement(115, 215);
            assertEq(undefined, el, '');
        },
        'test_updateBoundsBasedOnChildren',
        () => {
            let [app, grp] = this.makeFakeGroup();
            assertEq([0, 0, largeArea, largeArea], grp.mouseInteractionBounds, '');
            grp.updateBoundsBasedOnChildren();
            assertEq([0, 0, 0, 0], grp.mouseInteractionBounds, '');
            grp.getEl('btn1').setDimensions(15, 30, 40, 50);
            grp.getEl('btn2').setDimensions(15, 30, 40, 50);
            grp.getEl('btn3').setDimensions(15, 30, 40, 50);
            grp.updateBoundsBasedOnChildren();
            assertEq([15, 30, 40, 50], grp.mouseInteractionBounds, '');
            grp.getEl('btn1').setDimensions(15, 30, 40, 50);
            grp.getEl('btn2').setDimensions(20, 30, 40, 60);
            grp.getEl('btn3').setDimensions(25, 30, 400, 49);
            grp.updateBoundsBasedOnChildren();
            assertEq([15, 30, 410, 60], grp.mouseInteractionBounds, '');
        },
        'test_addElementAfter',
        () => {
            let [app, grp] = this.makeFakeGroup();
            assertEq('btn1,btn2,btn3,', this.listElems(grp), '');

            /* disallow adding duplicates */
            let btn3dupe = new UI512ElButton('btn3');
            this.assertThrows('', 'found in grp', () => grp.addElement(app, btn3dupe));
            assertEq('btn1,btn2,btn3,', this.listElems(grp), '');

            /* add after everything */
            let btn4 = new UI512ElButton('btn4');
            grp.addElementAfter(app, btn4, 'btn3');
            assertEq('btn1,btn2,btn3,btn4,', this.listElems(grp), '');

            /* add with special suffix 1 */
            let btn2_start = new UI512ElButton('btn2##start');
            grp.addElementAfter(app, btn2_start, 'btn2');
            assertEq('btn1,btn2,btn2##start,btn3,btn4,', this.listElems(grp), '');

            /* add with special suffix 2 */
            let btn2_next = new UI512ElButton('btn2##next');
            grp.addElementAfter(app, btn2_next, 'btn2');
            assertEq('btn1,btn2,btn2##start,btn2##next,btn3,btn4,', this.listElems(grp), '');

            /* add with special suffix 3 */
            let btn2_third = new UI512ElButton('btn2##3');
            grp.addElementAfter(app, btn2_third, 'btn2');
            assertEq('btn1,btn2,btn2##start,btn2##next,btn2##3,btn3,btn4,', this.listElems(grp), '');
        },
        'testGridLayout',
        () => {
            let grid = new GridLayout(100, 200, 30, 40, [1, 2, 3], [4, 5, 6], 7, 8);
            let results: number[][] = [];
            grid.combinations((n, a, b, bnds) => {
                results.push([n, a, b, bnds[0], bnds[1], bnds[2], bnds[3]]);
            });

            assertEq(
                [
                    [0, 1, 4, 100, 200, 30, 40],
                    [1, 2, 4, 137, 200, 30, 40],
                    [2, 3, 4, 174, 200, 30, 40],
                    [3, 1, 5, 100, 248, 30, 40],
                    [4, 2, 5, 137, 248, 30, 40],
                    [5, 3, 5, 174, 248, 30, 40],
                    [6, 1, 6, 100, 296, 30, 40],
                    [7, 2, 6, 137, 296, 30, 40],
                    [8, 3, 6, 174, 296, 30, 40]
                ],
                results,
                ''
            );
        }
    ];

    protected makeFakeGroup(): [UI512Application, UI512ElGroup] {
        let bounds = getUI512WindowBounds();
        let fakeApp = new UI512Application(bounds, new ElementObserverNoOp());
        let fakeGrp = new UI512ElGroup('fakegrp');
        fakeApp.addGroup(fakeGrp);
        let btn1 = new UI512ElButton('btn1');
        fakeGrp.addElement(fakeApp, btn1);
        let btn2 = new UI512ElButton('btn2');
        fakeGrp.addElement(fakeApp, btn2);
        let btn3 = new UI512ElButton('btn3');
        fakeGrp.addElement(fakeApp, btn3);
        return [fakeApp, fakeGrp];
    }

    protected listElems(grp: UI512ElGroup) {
        let s = '';
        for (let el of grp.iterEls()) {
            s += el.id + ',';
        }

        return s;
    }
}
