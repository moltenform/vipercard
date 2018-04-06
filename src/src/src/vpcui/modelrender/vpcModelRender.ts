
/* auto */ import { O, assertTrue, assertTrueWarn, makeVpcInternalErr, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RepeatingTimer, getRoot, isString } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { ElementObserver, ElementObserverVal, UI512Settable } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { IGenericTextField } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { VpcElType, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { UI512FldStyleInclScrolling, VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcAppInterfaceLayer } from '../../vpcui/modelrender/vpcPaintRender.js';

export class VpcModelRender extends VpcAppInterfaceLayer implements ElementObserver {
    grp: UI512ElGroup;
    directMapProperty: { [key: string]: string } = {};
    indirectProperty: { [key: string]: (elv: VpcElBase, el: UI512Element, newv: ElementObserverVal) => void } = {};
    propertiesCouldUnFocus: { [key: string]: boolean } = {};

    needUIToolsRedraw = true;
    needFullRedraw = true;
    needFullRedrawBecauseScreenWasLocked = true;
    constructor() {
        super();

        // buttons
        this.directMapProperty[VpcElType.Btn + '/autohilite'] = 'autohighlight';
        this.indirectProperty[VpcElType.Btn + '/enabled'] = (vel, el, newv) => {
            let isEdit = getToolCategory(this.appli.getOption_n('currentTool')) === VpcToolCtg.ctgEdit;
            el.set('enabledstyle', newv);
            el.set('enabled', isEdit ? true : newv);
        };
        this.directMapProperty[VpcElType.Btn + '/hilite'] = 'highlightactive';
        this.directMapProperty[VpcElType.Btn + '/checkmark'] = 'checkmark';
        this.indirectProperty[VpcElType.Btn + '/icon'] = (vel, el, newv) => {
            el.set('iconnumber', (newv as number) - 1, ChangeContext.FromRenderModel);
            el.set('iconsetid', getIconSetId(vel, el, newv), ChangeContext.FromRenderModel);
        };
        this.indirectProperty[VpcElType.Btn + '/showlabel'] = (vel, el, newv) => {
            this.refreshLabelWithFont(vel, el);
        };
        this.directMapProperty[VpcElType.Btn + '/style'] = 'style';
        this.indirectProperty[VpcElType.Btn + '/label'] = (vel, el, newv) => {
            el.set('labeltext', newv);
            this.refreshLabelWithFont(vel, el);
        };
        this.indirectProperty[VpcElType.Btn + '/textfont'] = (vel, el, newv) => {
            this.refreshLabelWithFont(vel, el);
        };
        this.indirectProperty[VpcElType.Btn + '/textsize'] = (vel, el, newv) => {
            this.refreshLabelWithFont(vel, el);
        };
        this.indirectProperty[VpcElType.Btn + '/textstyle'] = (vel, el, newv) => {
            this.refreshLabelWithFont(vel, el);
        };
        this.indirectProperty[VpcElType.Btn + '/textalign'] = (vel, el, newv) => {
            el.set('labelhalign', newv !== 'left', ChangeContext.FromRenderModel);
        };
        this.indirectProperty[VpcElType.Btn + '/visible'] = (vel, el, newv) => {
            let isEdit = getToolCategory(this.appli.getOption_n('currentTool')) === VpcToolCtg.ctgEdit;
            el.set('visible', isEdit ? true : newv);
        };

        // fields
        // changing defaulttextfont, defaulttextsize, defaulttextstyle does nothing on its own
        this.indirectProperty[VpcElType.Fld + '/dontwrap'] = (vel, el, newv) => {
            el.set('labelwrap', !newv, ChangeContext.FromRenderModel);
        };
        this.indirectProperty[VpcElType.Fld + '/singleline'] = (vel, el, newv) => {
            el.set('multiline', !newv, ChangeContext.FromRenderModel);
        };
        this.indirectProperty[VpcElType.Fld + '/enabled'] = (vel, el, newv) => {
            let isEdit = getToolCategory(this.appli.getOption_n('currentTool')) === VpcToolCtg.ctgEdit;
            el.set('enabledstyle', newv);
            el.set('enabled', isEdit ? true : newv);
        };
        this.indirectProperty[VpcElType.Fld + '/locktext'] = (vel, el, newv) => {
            el.set('canselecttext', !newv, ChangeContext.FromRenderModel);
            el.set('canedit', !newv, ChangeContext.FromRenderModel);
        };
        this.directMapProperty[VpcElType.Fld + '/selcaret'] = 'selcaret';
        this.directMapProperty[VpcElType.Fld + '/selend'] = 'selend';
        this.directMapProperty[VpcElType.Fld + '/scroll'] = 'scrollamt';
        this.indirectProperty[VpcElType.Fld + '/style'] = (vel, el, newv) => {
            let wasScroll = el.get_b('scrollbar');
            if (newv === UI512FldStyleInclScrolling.scrolling) {
                el.set('style', UI512FldStyle.rectangle, ChangeContext.FromRenderModel);
                el.set('scrollbar', true, ChangeContext.FromRenderModel);
            } else {
                el.set('style', newv, ChangeContext.FromRenderModel);
                el.set('scrollbar', false, ChangeContext.FromRenderModel);
            }

            if (wasScroll !== el.get_b('scrollbar')) {
                this.appli.getController().rebuildFieldScrollbars();
            }
        };

        this.directMapProperty[VpcElType.Fld + '/scrollbar'] = 'scrollbar';
        this.indirectProperty[VpcElType.Fld + '/visible'] = (vel, el, newv) => {
            let isEdit = getToolCategory(this.appli.getOption_n('currentTool')) === VpcToolCtg.ctgEdit;
            el.set('visible', isEdit ? true : newv);
        };
        this.indirectProperty[VpcElType.Fld + '/textalign'] = (vel, el, newv) => {
            el.set('labelhalign', newv !== 'left', ChangeContext.FromRenderModel);
        };

        // location
        for (let type of [VpcElType.Btn, VpcElType.Fld]) {
            this.indirectProperty[type + '/x'] = (vel, el, newv) => {
                el.set('x', this.appli.userBounds()[0] + (newv as number), ChangeContext.FromRenderModel);
            };
            this.indirectProperty[type + '/y'] = (vel, el, newv) => {
                el.set('y', this.appli.userBounds()[1] + (newv as number), ChangeContext.FromRenderModel);
            };
            this.indirectProperty[type + '/w'] = (vel, el, newv) => {
                el.set('w', newv, ChangeContext.FromRenderModel);
            };
            this.indirectProperty[type + '/h'] = (vel, el, newv) => {
                el.set('h', newv, ChangeContext.FromRenderModel);
            };
        }

        // invalidating focus
        this.propertiesCouldUnFocus[VpcElType.Fld + '/enabled'] = true;
        this.propertiesCouldUnFocus[VpcElType.Fld + '/locktext'] = true;
        this.propertiesCouldUnFocus[VpcElType.Fld + '/visible'] = true;
    }

    init() {
        this.grp = new UI512ElGroup('VpcModelRender');
        this.appli.UI512App().addGroup(this.grp);
    }

    checkIfScreenWasJustUnlocked() {
        let screenlocked = this.appli.getOption_b('screenLocked');
        if (!screenlocked && this.needFullRedrawBecauseScreenWasLocked) {
            this.needFullRedraw = true;
            this.needFullRedrawBecauseScreenWasLocked = false;
        }
    }

    updateUI512Els() {
        if (this.needFullRedraw) {
            this.fullRedrawFromScratch();
            this.needFullRedraw = false;
        }
    }

    fullRedrawNeeded() {
        this.needFullRedraw = true;
        this.needUIToolsRedraw = true;
    }

    uiRedrawNeeded() {
        this.needUIToolsRedraw = true;
    }

    changeSeen(
        context: ChangeContext,
        velId: string,
        propname: string,
        prev: ElementObserverVal,
        newv: ElementObserverVal
    ) {
        if (propname.startsWith('increasingnumber')) {
            return;
        }

        let vel = this.appli.getModel().findByIdUntyped(velId);
        if (vel) {
            this.aboutToApplyOneChange(vel, propname, newv, false);
        }
    }

    protected aboutToApplyOneChange(vel: VpcElBase, propname: string, newv: ElementObserverVal, fromScratch: boolean) {
        let currentCardId = this.appli.getOption_s('currentCardId');
        let screenlocked = this.appli.getOption_b('screenLocked');
        if (vel.getType() === VpcElType.Product && propname === 'suggestedIdleRate') {
            this.changeIdleRate(newv);
        } else if (screenlocked) {
            this.needFullRedrawBecauseScreenWasLocked = true;
        } else {
            let type = vel.getType();
            if (propname === 'script') {
                this.needUIToolsRedraw = true;
            } else if (type === VpcElType.Fld || type === VpcElType.Btn) {
                if (vel.parentId === currentCardId) {
                    this.applyOneChange(vel, propname, newv, fromScratch);
                }
            } else if (type === VpcElType.Card && vel.id === currentCardId) {
                if (propname === 'paint') {
                    // vpcmodelrenderpaint will take care of the rest
                    this.needUIToolsRedraw = true;
                }
            } else if (type === VpcElType.Product) {
                this.needUIToolsRedraw = true;
                if (propname === 'currentCardId') {
                    this.fullRedrawNeeded();
                }
            }
        }
    }

    protected refreshLabelWithFont(elv: VpcElBase, target: UI512Element) {
        if (elv instanceof VpcElButton) {
            let lbl = elv.get_b('showlabel')
                ? TextRendererFontManager.setInitialFont(elv.get_s('label'), elv.getFontAsUi512())
                : '';
            target.set('labeltext', lbl, ChangeContext.FromRenderModel);
        } else {
            throw makeVpcInternalErr(`6+|expected button`);
        }
    }

    protected fullRedrawFromScratch() {
        let currentCardId = this.appli.getOption_s('currentCardId');
        let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
        let currentBgid = currentCard.parentId;

        this.grp.removeAllEls();
        for (let part of currentCard.parts) {
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

        for (let part of currentCard.parts) {
            // make sure to edit something!!
            let target = this.findVpcToUi512(currentCard.parts[0].id);
            if (target) {
                target.set('x', target.get_n('x') + 1);
                target.set('x', target.get_n('x') - 1);
            }
        }
    }

    isVelOrBg(id: string) {
        return id.startsWith('VpcModelRender$$') && !scontains(id, '##sb##');
    }

    elIdToVelId(id: string): O<string> {
        if (scontains(id, '##sb##')) {
            return undefined;
        } else if (id === 'VpcModelRender$$renderbg') {
            return undefined;
        } else if (id.startsWith('VpcModelRender$$')) {
            return id.substr('VpcModelRender$$'.length);
        } else {
            return undefined;
        }
    }

    velIdToElId(id: string): string {
        return 'VpcModelRender$$' + id;
    }

    elIdToVel(id: string): O<VpcElBase> {
        let card = this.appli.getModel().getCurrentCard();
        let vel = this.appli.getModel().findByIdUntyped(this.elIdToVelId(id));
        if (vel && vel.parentId === card.id) {
            return vel;
        } else {
            return undefined;
        }
    }

    velIdToEl(id: string) {
        return this.appli.UI512App().findElemById(this.velIdToElId(id));
    }

    protected buildBtnFromScratch(vpcel: VpcElButton) {
        let target = new UI512ElButton(this.velIdToElId(vpcel.id));
        this.grp.addElement(this.appli.UI512App(), target);
        for (let prop of VpcElButton.attributesList) {
            let newv = vpcel.get_generic(prop);
            this.applyOneChange(vpcel, prop, newv, true);
        }
    }

    protected buildFldFromScratch(vpcel: VpcElField) {
        let target = new UI512ElTextField(this.velIdToElId(vpcel.id));
        this.grp.addElement(this.appli.UI512App(), target);
        for (let prop of VpcElField.attributesList) {
            let newv = vpcel.get_generic(prop);
            this.applyOneChange(vpcel, prop, newv, true);
        }

        target.setftxt(vpcel.get_ftxt(), ChangeContext.FromRenderModel);
    }

    protected applyOneChange(vel: VpcElBase, propname: string, newv: ElementObserverVal, fromScratch: boolean) {
        assertTrue(vel.getType() === VpcElType.Fld || vel.getType() === VpcElType.Btn, '');
        let key = vel.getType().toString() + '/' + propname;
        let fnSetProperty = this.indirectProperty[key];
        let ui512propname = this.directMapProperty[key];
        let target = this.findVpcToUi512(vel.id);
        if (target) {
            if (fnSetProperty !== undefined) {
                fnSetProperty(vel, target, newv);
            } else if (ui512propname !== undefined) {
                target.set(ui512propname, newv, ChangeContext.FromRenderModel);
            } else if (propname === UI512Settable.formattedTextField) {
                let newvAsText = newv as FormattedText;
                assertTrue(newvAsText && newvAsText.isFormattedText, '6)|bad formatted text', vel.id);
                target.setftxt(newvAsText, ChangeContext.FromRenderModel);
            } else {
                // it's a property that doesn't impact rendering. that's ok.
            }
        } else if (!this.needFullRedraw && !this.needFullRedrawBecauseScreenWasLocked) {
            assertTrueWarn(false, `6(|did not find rendered corresponing ${vel.id}`);
        }

        if (!fromScratch && this.propertiesCouldUnFocus[key]) {
            this.seeIfCurrentFocusMakesSense();
        }
    }

    findVpcToUi512(id: string) {
        return this.grp.findEl('VpcModelRender$$' + id);
    }

    getVpcToUi512(id: string) {
        return this.grp.getEl('VpcModelRender$$' + id);
    }

    findUi512ToVpc(id: O<string>) {
        if (id && id.startsWith('VpcModelRender$$')) {
            let vpcid = id.substr('VpcModelRender$$'.length);
            return this.appli.getModel().findByIdUntyped(vpcid);
        } else {
            return undefined;
        }
    }

    protected changeIdleRate(s: ElementObserverVal) {
        if (isString(s)) {
            // should still be slower than the keyboard rate,
            // because we don't want idle rates to win over keydown events
            let rate = s === 'faster' ? 50 : 100;
            (getRoot() as any).timerSendIdleEvent = new RepeatingTimer(rate);
        }
    }

    static fieldPropsCompatibleWithFocus(vel: VpcElField) {
        return vel.get_b('enabled') && !vel.get_b('locktext') && vel.get_b('visible');
    }

    seeIfCurrentFocusMakesSense() {
        let focusid = this.appli.getCurrentFocus();
        if (!focusid || !focusid.startsWith('VpcModelRender$$')) {
            // if it's another ui element like a box in edit panel having focus, ok
            return;
        }

        let focusvpc = this.findUi512ToVpc(focusid);
        let focusvpcAsFld = focusvpc as VpcElField;
        if (!focusvpc || !focusvpcAsFld.isVpcElField) {
            // missing or non-field focus
            this.appli.setCurrentFocus(undefined);
        } else if (!VpcModelRender.fieldPropsCompatibleWithFocus(focusvpcAsFld)) {
            // field not enabled/visible
            this.appli.setCurrentFocus(undefined);
        } else {
            let parent = this.appli.getModel().getById(focusvpc.parentId, VpcElCard);
            let currentCardId = this.appli.getModel().productOpts.get_s('currentCardId');
            if (parent.getType() === VpcElType.Card && parent.id !== currentCardId) {
                // field not on the current card
                this.appli.setCurrentFocus(undefined);
            } else if (parent.getType() === VpcElType.Bg) {
                let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
                if (parent.id !== currentCard.parentId) {
                    // field not on the current bg
                    this.appli.setCurrentFocus(undefined);
                }
            }
        }
    }
}

export class VpcElTextFieldAsGeneric implements IGenericTextField {
    constructor(protected el512: UI512ElTextField, protected impl: VpcElField) {}
    setftxt(newtxt: FormattedText, context: ChangeContext) {
        this.impl.setftxt(newtxt, context);
    }
    getftxt(): FormattedText {
        return this.impl.get_ftxt();
    }
    canEdit() {
        return !this.impl.get_b('locktext');
    }
    canSelectText(): boolean {
        return !this.impl.get_b('locktext');
    }
    isMultiline(): boolean {
        return !this.impl.get_b('singleline');
    }
    setSel(a: number, b: number): void {
        this.impl.set('selcaret', a);
        this.impl.set('selend', b);
    }
    getSel(): [number, number] {
        return [this.impl.get_n('selcaret'), this.impl.get_n('selend')];
    }
    identifier(): string {
        return this.impl.id;
    }
    getHeight(): number {
        return this.impl.get_n('h');
    }
    getDefaultFont(): string {
        return this.impl.getDefaultFontAsUi512();
    }
    getReadonlyUi512(): UI512ElTextField {
        return this.el512;
    }
    getScrollAmt(): number {
        return this.impl.get_n('scroll');
    }
    setScrollAmt(n: O<number>): void {
        if (n !== undefined && n !== null) {
            return this.impl.set('scroll', n);
        }
    }
}

function getIconSetId(vel: VpcElBase, el: UI512Element, newv: ElementObserverVal) {
    if (!newv) {
        return '';
    } else if (vel.get_s('name').startsWith('glider_sprites')) {
        return 'glider_sprites';
    } else if (vel.get_s('name').startsWith('glider_bg')) {
        return 'glider_bg';
    } else if (vel.get_s('name').startsWith('spacegame_sprites')) {
        return 'spacegame';
    } else {
        return '002';
    }
}
