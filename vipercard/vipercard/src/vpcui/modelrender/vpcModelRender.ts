
/* auto */ import { O, assertTrue, assertTrueWarn, checkThrow, makeVpcInternalErr, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { getRoot, isString } from '../../ui512/utils/utils512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { ElementObserver, ElementObserverVal, UI512Settable } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { GenericTextField } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { VpcElType, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField, VpcFldStyleInclScroll } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcUILayer } from '../../vpcui/state/vpcInterface.js';

/**
 * loop through the vels on the page and create UI512elements to be rendered
 * map changes to a vel to a change in the corresponding UI512element
 */
export class VpcModelRender extends VpcUILayer implements ElementObserver {
    grp: UI512ElGroup;
    directMapProperty: { [key: string]: string } = {};
    indirectProperty: { [key: string]: (vel: VpcElBase, el: UI512Element, newVal: ElementObserverVal) => void } = {};
    propertiesCouldUnFocus: { [key: string]: boolean } = {};

    /* cause VPC UI to be redrawn */
    needUIToolsRedraw = true;

    /* cause VPC UI and also every vel to be redrawn */
    needFullRedraw = true;

    /* when a script has just unlocked the screen, need to redraw */
    needFullRedrawBecauseScreenWasLocked = true;

    /**
     * create our UI512ElGroup and intialize property maps
     */
    init() {
        this.grp = new UI512ElGroup('VpcModelRender');
        this.vci.UI512App().addGroup(this.grp);
        this.initButtonProps();
        this.initFieldProps();
        this.initLocationProps();
    }

    /**
     * when a script has just unlocked the screen, need to redraw
     */
    checkIfScreenWasJustUnlocked() {
        let screenlocked = this.vci.getOptionB('screenLocked');
        if (!screenlocked && this.needFullRedrawBecauseScreenWasLocked) {
            this.needFullRedraw = true;
            this.needFullRedrawBecauseScreenWasLocked = false;
        }
    }

    /**
     * when this layer is refreshed, and a fullredraw is needed, redraw everything from scratch
     */
    updateUI512Els() {
        if (this.needFullRedraw) {
            this.fullRedrawFromScratch();
            this.needFullRedraw = false;
        }
    }

    /**
     * on the next render(), redraw everything
     */
    fullRedrawNeeded() {
        this.needFullRedraw = true;
        this.needUIToolsRedraw = true;
    }

    /**
     * on the next render(), redraw the ui
     */
    uiRedrawNeeded() {
        this.needUIToolsRedraw = true;
    }

    /**
     * a change has been seen
     */
    changeSeen(
        context: ChangeContext,
        velId: string,
        propName: string,
        prev: ElementObserverVal,
        newVal: ElementObserverVal
    ) {
        if (!this.vci) {
            checkThrow(
                propName.startsWith('increasingnum'),
                'KV|we only expect increasingnum to be changed before init()'
            );
            return;
        }

        let vel = this.vci.getModel().findByIdUntyped(velId);
        if (vel) {
            this.applyOneChangeIfApplicable(vel, propName, newVal, false);
        }
    }

    /**
     * apply the change, if the vel type is one we listen to
     * for example, if change is to a vel on a different card, ignore the change
     */
    protected applyOneChangeIfApplicable(
        vel: VpcElBase,
        propName: string,
        newVal: ElementObserverVal,
        fromScratch: boolean
    ) {
        let currentCardId = this.vci.getOptionS('currentCardId');
        let screenlocked = this.vci.getOptionB('screenLocked');
        let type = vel.getType();
        if (type === VpcElType.Product && propName === 'suggestedIdleRate') {
            this.changeIdleRate(newVal);
        } else if (screenlocked) {
            this.needFullRedrawBecauseScreenWasLocked = true;
        } else if (propName === 'script') {
            this.needUIToolsRedraw = true;
        } else if (type === VpcElType.Fld || type === VpcElType.Btn) {
            if (vel.parentId === currentCardId) {
                this.applyOneChange(vel, propName, newVal, fromScratch);
            }
        } else if (type === VpcElType.Card && vel.id === currentCardId) {
            if (propName === 'paint') {
                this.needUIToolsRedraw = true;
            }
        } else if (type === VpcElType.Product) {
            this.needUIToolsRedraw = true;
            if (propName === 'currentCardId') {
                this.fullRedrawNeeded();
            }
        }
    }

    /**
     * helper function for refreshing a label
     */
    protected refreshLabelWithFont(vel: VpcElBase, target: UI512Element) {
        if (vel instanceof VpcElButton) {
            let lbl = vel.getB('showlabel') ? UI512DrawText.setFont(vel.getS('label'), vel.getFontAsUI512()) : '';
            target.set('labeltext', lbl);
        } else {
            throw makeVpcInternalErr(`6+|expected button`);
        }
    }

    /**
     * redraw all vels on the card, from scratch
     */
    protected fullRedrawFromScratch() {
        let currentCardId = this.vci.getOptionS('currentCardId');
        let currentCard = this.vci.getModel().getById(currentCardId, VpcElCard);
        this.grp.removeAllEls();
        for (let i = 0, len = currentCard.parts.length; i < len; i++) {
            let part = currentCard.parts[i];
            let partAsBtn = part as VpcElButton;
            let partAsField = part as VpcElField;
            if (partAsBtn && partAsBtn.isVpcElButton) {
                this.buildBtnFromScratch(partAsBtn);
            } else if (partAsField && partAsField.isVpcElField) {
                this.buildFldFromScratch(partAsField);
            } else {
                throw makeVpcInternalErr('6*|invalid part type');
            }
        }

        this.seeIfCurrentFocusMakesSense();

        for (let i = 0, len = currentCard.parts.length; i < len; i++) {
            /* change something on an ui512el to trigger redraw */
            let part = currentCard.parts[i];
            let target = this.findVelIdToEl(currentCard.parts[0].id);
            if (target) {
                target.set('x', target.getN('x') + 1);
                target.set('x', target.getN('x') - 1);
                break;
            }
        }
    }

    /**
     * does this ui512element id belong to a vel or to the vpc background?
     */
    isVelOrBg(id: string) {
        return id.startsWith('VpcModelRender$$') && !scontains(id, '##sb##');
    }

    /**
     * from ui512element id to vel id, or undefined
     */
    elIdToVelId(id: string): O<string> {
        if (scontains(id, '##sb##')) {
            /* scrollbar parts aren't considered part of the vel */
            return undefined;
        } else if (id.startsWith('VpcModelRender$$')) {
            return id.substr('VpcModelRender$$'.length);
        } else if (id === 'VpcModelRender$$renderbg') {
            return undefined;
        } else {
            return undefined;
        }
    }

    /**
     * from ui512element id to vel, or undefined
     */
    findElIdToVel(id: string): O<VpcElBase> {
        let card = this.vci.getModel().getCurrentCard();
        let vel = this.vci.getModel().findByIdUntyped(this.elIdToVelId(id));
        if (vel && vel.parentId === card.id) {
            return vel;
        } else {
            return undefined;
        }
    }

    /**
     * from vel id to ui512element id
     */
    velIdToElId(id: string): string {
        return 'VpcModelRender$$' + id;
    }

    /**
     * from vel id to ui512element, or undefined
     */
    findVelIdToEl(id: string) {
        return this.grp.findEl('VpcModelRender$$' + id);
    }

    /**
     * from vel id to ui512element, or throw
     */
    getVelIdToEl(id: string) {
        return this.grp.getEl('VpcModelRender$$' + id);
    }

    /**
     * build a button from scratch
     */
    protected buildBtnFromScratch(vpcel: VpcElButton) {
        let target = new UI512ElButton(this.velIdToElId(vpcel.id));
        this.grp.addElement(this.vci.UI512App(), target);
        for (let i = 0, len = VpcElButton.keyPropertiesList.length; i < len; i++) {
            let prop = VpcElButton.keyPropertiesList[i];
            let newVal = vpcel.getGeneric(prop);
            this.applyOneChange(vpcel, prop, newVal, true);
        }
    }

    /**
     * build a field from scratch
     */
    protected buildFldFromScratch(vpcel: VpcElField) {
        let target = new UI512ElTextField(this.velIdToElId(vpcel.id));
        this.grp.addElement(this.vci.UI512App(), target);
        for (let i = 0, len = VpcElField.keyPropertiesList.length; i < len; i++) {
            let prop = VpcElField.keyPropertiesList[i];
            let newVal = vpcel.getGeneric(prop);
            this.applyOneChange(vpcel, prop, newVal, true);
        }

        target.setFmTxt(vpcel.getFmTxt());
    }

    /**
     * apply one change,
     * mapping a vel change to a ui512element change
     */
    protected applyOneChange(vel: VpcElBase, propName: string, newVal: ElementObserverVal, fromScratch: boolean) {
        assertTrue(vel.getType() === VpcElType.Fld || vel.getType() === VpcElType.Btn, 'KU|');
        let key = vel.getType().toString() + '/' + propName;
        let target = this.findVelIdToEl(vel.id);
        if (target) {
            let fnSetProperty = this.indirectProperty[key];
            let ui512propname = this.directMapProperty[key];
            if (fnSetProperty !== undefined) {
                fnSetProperty(vel, target, newVal);
            } else if (ui512propname !== undefined) {
                target.set(ui512propname, newVal);
            } else if (propName === UI512Settable.fmtTxtVarName) {
                let newvAsText = newVal as FormattedText;
                assertTrue(newvAsText && newvAsText.isFormattedText, '6)|bad formatted text', vel.id);
                target.setFmTxt(newvAsText);
            } else {
                /* it's a property that doesn't impact rendering. that's ok. */
            }
        } else if (!this.needFullRedraw && !this.needFullRedrawBecauseScreenWasLocked) {
            assertTrueWarn(false, `6(|did not find rendered corresponing ${vel.id}`);
        }

        if (!fromScratch && this.propertiesCouldUnFocus[key]) {
            /* e.g. if we've set the locktext on the focused field to true, move the focus */
            this.seeIfCurrentFocusMakesSense();
        }
    }

    /**
     * change the onIdle rate
     */
    protected changeIdleRate(s: ElementObserverVal) {
        if (isString(s)) {
            getRoot().setTimerRate(s.toString());
        }
    }

    /**
     * can the field have focus, given its properties
     */
    static canFieldHaveFocus(vel: VpcElField) {
        return vel.getB('enabled') && !vel.getB('locktext') && vel.getB('visible');
    }

    /**
     * e.g. if we've set the locktext on the focused field to true, move the focus
     */
    seeIfCurrentFocusMakesSense() {
        let focusedId = this.vci.getCurrentFocus();
        if (!focusedId || !focusedId.startsWith('VpcModelRender$$')) {
            /* if it's another ui element like a box in edit panel having focus, ok */
            return;
        }

        let focusedVel = this.findElIdToVel(focusedId);
        let focusedVelAsFld = focusedVel as VpcElField;
        if (!focusedVel || !focusedVelAsFld.isVpcElField) {
            /* missing or non-field focus */
            this.vci.setCurrentFocus(undefined);
        } else if (!VpcModelRender.canFieldHaveFocus(focusedVelAsFld)) {
            /* field not enabled/visible */
            this.vci.setCurrentFocus(undefined);
        } else {
            let parent = this.vci.getModel().getById(focusedVel.parentId, VpcElCard);
            let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
            if (parent.getType() === VpcElType.Card && parent.id !== currentCardId) {
                /* field not on the current card */
                this.vci.setCurrentFocus(undefined);
            } else if (parent.getType() === VpcElType.Bg) {
                let currentCard = this.vci.getModel().getById(currentCardId, VpcElCard);
                if (parent.id !== currentCard.parentId) {
                    /* field not on the current bg */
                    this.vci.setCurrentFocus(undefined);
                }
            }
        }
    }

    /**
     * map setting the position
     */
    protected initLocationProps() {
        for (let type of [VpcElType.Btn, VpcElType.Fld]) {
            this.directMapProperty[type + '/w'] = 'w';
            this.directMapProperty[type + '/h'] = 'h';
            this.indirectProperty[type + '/x'] = (vel, el, newVal) => {
                el.set('x', this.vci.userBounds()[0] + (newVal as number));
            };

            this.indirectProperty[type + '/y'] = (vel, el, newVal) => {
                el.set('y', this.vci.userBounds()[1] + (newVal as number));
            };
        }
    }

    /**
     * map setting field properties
     */
    protected initFieldProps() {
        this.indirectProperty[VpcElType.Fld + '/dontwrap'] = (vel, el, newVal) => {
            el.set('labelwrap', !newVal);
        };

        this.indirectProperty[VpcElType.Fld + '/singleline'] = (vel, el, newVal) => {
            el.set('multiline', !newVal);
        };

        this.indirectProperty[VpcElType.Fld + '/enabled'] = (vel, el, newVal) => {
            let isEdit = getToolCategory(this.vci.getOptionN('currentTool')) === VpcToolCtg.CtgEdit;
            el.set('enabledstyle', newVal);
            el.set('enabled', isEdit ? true : newVal);
        };

        this.indirectProperty[VpcElType.Fld + '/locktext'] = (vel, el, newVal) => {
            el.set('canselecttext', !newVal);
            el.set('canedit', !newVal);
        };

        this.directMapProperty[VpcElType.Fld + '/selcaret'] = 'selcaret';
        this.directMapProperty[VpcElType.Fld + '/selend'] = 'selend';
        this.directMapProperty[VpcElType.Fld + '/scroll'] = 'scrollamt';
        this.indirectProperty[VpcElType.Fld + '/style'] = (vel, el, newVal) => {
            let wasScroll = el.getB('scrollbar');
            if (newVal === VpcFldStyleInclScroll.Scrolling) {
                el.set('style', UI512FldStyle.Rectangle);
                el.set('scrollbar', true);
            } else {
                el.set('style', newVal);
                el.set('scrollbar', false);
            }
            if (wasScroll !== el.getB('scrollbar')) {
                this.vci.getPresenter().rebuildFieldScrollbars();
            }
        };

        this.directMapProperty[VpcElType.Fld + '/scrollbar'] = 'scrollbar';
        this.indirectProperty[VpcElType.Fld + '/visible'] = (vel, el, newVal) => {
            let isEdit = getToolCategory(this.vci.getOptionN('currentTool')) === VpcToolCtg.CtgEdit;
            el.set('visible', isEdit ? true : newVal);
        };

        this.indirectProperty[VpcElType.Fld + '/textalign'] = (vel, el, newVal) => {
            el.set('labelhalign', newVal !== 'left');
        };

        /* these ones should make us call seeIfCurrentFocusMakesSense() */
        this.propertiesCouldUnFocus[VpcElType.Fld + '/enabled'] = true;
        this.propertiesCouldUnFocus[VpcElType.Fld + '/locktext'] = true;
        this.propertiesCouldUnFocus[VpcElType.Fld + '/visible'] = true;
    }

    /**
     * map setting button properties
     */
    protected initButtonProps() {
        this.directMapProperty[VpcElType.Btn + '/autohilite'] = 'autohighlight';
        this.indirectProperty[VpcElType.Btn + '/enabled'] = (vel, el, newVal) => {
            let isEdit = getToolCategory(this.vci.getOptionN('currentTool')) === VpcToolCtg.CtgEdit;
            el.set('enabledstyle', newVal);
            el.set('enabled', isEdit ? true : newVal);
        };

        this.directMapProperty[VpcElType.Btn + '/hilite'] = 'highlightactive';
        this.directMapProperty[VpcElType.Btn + '/checkmark'] = 'checkmark';
        this.indirectProperty[VpcElType.Btn + '/icon'] = (vel, el, newVal) => {
            el.set('iconnumber', (newVal as number) - 1);
            el.set('icongroupid', getIconGroupId(vel, el, newVal));
        };

        this.indirectProperty[VpcElType.Btn + '/showlabel'] = (vel, el, newVal) => {
            this.refreshLabelWithFont(vel, el);
        };

        this.directMapProperty[VpcElType.Btn + '/style'] = 'style';
        this.indirectProperty[VpcElType.Btn + '/label'] = (vel, el, newVal) => {
            el.set('labeltext', newVal);
            this.refreshLabelWithFont(vel, el);
        };

        this.indirectProperty[VpcElType.Btn + '/textfont'] = (vel, el, newVal) => {
            this.refreshLabelWithFont(vel, el);
        };

        this.indirectProperty[VpcElType.Btn + '/textsize'] = (vel, el, newVal) => {
            this.refreshLabelWithFont(vel, el);
        };

        this.indirectProperty[VpcElType.Btn + '/textstyle'] = (vel, el, newVal) => {
            this.refreshLabelWithFont(vel, el);
        };

        this.indirectProperty[VpcElType.Btn + '/textalign'] = (vel, el, newVal) => {
            el.set('labelhalign', newVal !== 'left');
        };

        this.indirectProperty[VpcElType.Btn + '/visible'] = (vel, el, newVal) => {
            let isEdit = getToolCategory(this.vci.getOptionN('currentTool')) === VpcToolCtg.CtgEdit;
            el.set('visible', isEdit ? true : newVal);
        };
    }
}

/**
 * implementation of GenericTextField for vel text fields
 *
 * let's say you are typing on the keyboard to insert a letter into the text field.
 * if this is a UI512 text field, we can directly insert the letter.
 * but if it is a ViperCard text field,
 * we need to update the _VpcElField_ model first
 */
export class VpcTextFieldAsGeneric implements GenericTextField {
    constructor(protected el512: UI512ElTextField, protected impl: VpcElField) {}

    setFmtTxt(newTxt: FormattedText, context: ChangeContext) {
        this.impl.setFmTxt(newTxt, context);
    }

    getFmtTxt(): FormattedText {
        return this.impl.getFmTxt();
    }

    canEdit() {
        return !this.impl.getB('locktext');
    }

    canSelectText(): boolean {
        return !this.impl.getB('locktext');
    }

    isMultiline(): boolean {
        return !this.impl.getB('singleline');
    }

    setSel(a: number, b: number): void {
        this.impl.set('selcaret', a);
        this.impl.set('selend', b);
    }

    getSel(): [number, number] {
        return [this.impl.getN('selcaret'), this.impl.getN('selend')];
    }

    getID(): string {
        return this.impl.id;
    }

    getHeight(): number {
        return this.impl.getN('h');
    }

    getDefaultFont(): string {
        return this.impl.getDefaultFontAsUi512();
    }

    getReadOnlyUI512(): UI512ElTextField {
        return this.el512;
    }

    getScrollAmt(): number {
        return this.impl.getN('scroll');
    }

    setScrollAmt(n: O<number>): void {
        if (n !== undefined && n !== null) {
            return this.impl.set('scroll', n);
        }
    }
}

/**
 * certain stacks, instead of using default icon set, use another icon set
 */
function getIconGroupId(vel: VpcElBase, el: UI512Element, newVal: ElementObserverVal) {
    if (!newVal) {
        return '';
    } else if (vel.getS('name').startsWith('glider_sprites')) {
        return 'gliderSprites';
    } else if (vel.getS('name').startsWith('glider_bg')) {
        return 'gliderBg';
    } else if (vel.getS('name').startsWith('spacegame_sprites')) {
        return 'spacegame';
    } else {
        return '002';
    }
}
