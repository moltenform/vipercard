
/* auto */ import { VpcVal, VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { RememberHistory } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { UndoableActionCreateVel, UndoableActionDeleteVel } from './../state/vpcUndo';
/* auto */ import { VpcExecInternalDirectiveAbstract } from './../../vpc/codeexec/vpcScriptExecInternalDirective';
/* auto */ import { RequestedVelRef } from './../../vpc/vpcutils/vpcRequestedReference';
/* auto */ import { VpcPresenterInterface } from './vpcPresenterInterface';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcElType, checkThrow, checkThrowInternal, vpcElTypeShowInUI } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { VpcElBase, VpcElSizable } from './../../vpc/vel/velBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder, longstr } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { UI512DrawText } from './../../ui512/drawtext/ui512DrawText';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */



/**
 * complete implementation of VpcExecInternalDirective 
 */
export class VpcExecInternalDirectiveFull extends VpcExecInternalDirectiveAbstract {
    constructor(protected pr:VpcPresenterInterface, protected vci:VpcStateInterface) {
        super()
    }

    setGlobal(key:string, v:VpcVal) {
        this.pr.vci.getCodeExec().globals.set(key, v)
    }
    getGlobal(key:string):VpcVal {
        return this.pr.vci.getCodeExec().globals.getOrFallback(key, VpcValS(''))
    }
    getCardHistory():RememberHistory {
        return this.pr.vci.getCodeExec().cardHistory
    }
    
    goMakevelwithoutmsg(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let vel:VpcElBase
        if (param.val==='btn' || param.val==='button') {
            vel = this.makeBtnFldWithoutMsg(VpcElType.Btn)
        } else if (param.val==='fld' || param.val==='field') {
            vel = this.makeBtnFldWithoutMsg(VpcElType.Fld)
        } else if (param.val==='card' || param.val==='dupecardpaint') {
            vel = this.makeCardWithoutMsg(cur, param.val==='dupecardpaint')
        } else if (param.val==='bg' || param.val==='bkgnd') {
            vel = this.makeBgWithoutMsg(cur)
        } else {
            checkThrowInternal(false, "cannot make this type")
        }

        param.val = vel.getUserFacingId()
        return vel
    }

    goRemovevelwithoutmsg(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let idInternal = param.val
        let ref = new RequestedVelRef(VpcElType.Unknown)
        ref.lookById = Util512.parseInt(idInternal) ?? 0
        ref.partIsCdOrBg = true
        let vel = this.outside.ResolveVelRef(ref)
        if (vel) {
            this.removeVel(vel);
            param.val = vel.getUserFacingId()
        } else {
            param.val = ''
        }
    }

    protected makeBgWithoutMsg(cur:VpcElCard) { 
        let bg = this.createVel(this.pr.vci.getModel().stack.idInternal, VpcElType.Bg, -1);
        this.createVel(bg.idInternal, VpcElType.Card, -1);
        return bg
    }

    protected makeCardWithoutMsg(cur:VpcElCard, isDupePaint:boolean) {
        let paint = cur.getS('paint');
        let currentBg = this.pr.vci.getModel().getById(VpcElBg, cur.parentIdInternal);
        let currentIndex = currentBg.cards.findIndex(cd => cd.idInternal === cur.idInternal);
        let indexRelativeToBg = currentIndex === -1 ? 0 : currentIndex + 1;
        let vel = this.createVel(cur.parentIdInternal, VpcElType.Card, indexRelativeToBg);
        if (isDupePaint) {
            /* can't use copy card/paste card since it's not yet impl'd */
            /* use this workaround instead (only copies the paint) */
            vel.setOnVel('paint', paint, this.pr.vci.getModel());
        }
        return vel
    }

    protected makeBtnFldWithoutMsg(type:VpcElType) {
        /* make a button that is tall enough to show an icon */
        const defaultBtnW = 100;
        const defaultBtnH = 58;
        const defaultFldW = 100;
        const defaultFldH = 100;
        let w = 0;
        let h = 0;
        if (type === VpcElType.Btn) {
            w = defaultBtnW;
            h = defaultBtnH;
        } else if (type === VpcElType.Fld) {
            w = defaultFldW;
            h = defaultFldH;
        } else {
            checkThrowInternal(false, '6E|wrong type ' + type);
        }

        let currentCardId = this.pr.vci.getOutside().GetOptionS('currentCardId');
        let vel = this.createVel(currentCardId, type, -1) as VpcElSizable;
        assertTrue(vel instanceof VpcElSizable, '6u|not VpcElSizable');
        vel.setDimensions(0,0, w, h, this.pr.vci.getModel());
        vel.setOnVel(
            'name',
            longstr(`my ${vpcElTypeShowInUI(vel.getType())}
             ${this.pr.vci.getModel().stack.getNextNumberForElemName(this.pr.vci.getModel())}`),
            this.pr.vci.getModel()
        );

        if (type === VpcElType.Btn) {
            /* give it a style and initial script */
            vel.setProp('style', VpcValS('roundrect'), this.pr.vci.getModel());
            vel.setOnVel('label', lng('lngNew Button'), this.pr.vci.getModel());
            vel.setOnVel('showlabel', true, this.pr.vci.getModel());
            vel.setOnVel('script', 'on mouseUp\n\tanswer "the button was clicked."\nend mouseUp', this.pr.vci.getModel());
        } else if (type === VpcElType.Fld && vel instanceof VpcElField) {
            /* need to give it content, since we don't currently
            draw the lines, otherwise you'd see nothing there */
            let newTxt = FormattedText.newFromSerialized(
                UI512DrawText.setFont('abcde\nabcde\nabcde', vel.getDefaultFontAsUi512())
            );

            vel.setCardFmTxt(newTxt, this.pr.vci.getModel());
            vel.setProp('style', VpcValS('scrolling'), this.pr.vci.getModel());
        } else {
            checkThrowInternal(false, "btn or fld expected")
        }

        return vel
    }

    /**
     * create an element and add it to the model
     */
    protected createVel(parentId: string, type: VpcElType, insertIndex = -1, newId: O<string> = undefined) {
        if (!newId) {
            newId = this.pr.vci.getModel().stack.getNextId(this.pr.vci.getModel());
        }

        checkThrow(newId.match(/^[0-9]+$/), 'Ku|id should be purely numeric', newId);
        let cr = new UndoableActionCreateVel(newId, parentId, type, false, insertIndex);
        this.pr.vci.doChangeSeenCreationDeletion(cr)
        cr.do(this.pr.vci);
        return this.pr.vci.getModel().getByIdUntyped(newId);
    }

    /**
     * remove an element from the model, includng children
     */
    protected removeVel(vel: VpcElBase) {
        if (vel instanceof VpcElCard) {
            let totalCardNum = this.pr.vci
                .getModel()
                .stack.bgs.map(bg => bg.cards.length)
                .reduce(Util512.add);
            checkThrow(totalCardNum > 1, '8%|Cannot delete the only card of a stack');
            let curCard = this.pr.vci.getOptionS('currentCardId');
            checkThrow(vel.idInternal !== curCard, 'UM|cannot delete the current card');

            /* if deleting a card, first delete all of its children */
            /* that way there won't be orphan parts in the mapModelById */
            let partsToRemove: VpcElBase[] = [];
            for (let part of vel.parts) {
                assertTrue(part instanceof VpcElButton || part instanceof VpcElField, '6M|bad type');
                partsToRemove.push(part);
            }

            for (let part of partsToRemove) {
                this.removeElemImpl(part);
            }
        }

        UndoableActionDeleteVel.checkIfCanDelete(vel, this.pr.vci);
        this.removeElemImpl(vel);

        if (vel.getType() === VpcElType.Card) {
            let parentBg = this.pr.vci.getModel().getById(VpcElBg, vel.parentIdInternal);
            if (parentBg && parentBg.cards.length === 0) {
                /* if a bg has no remaining cards, let's remove the bg */
                this.removeElemImpl(parentBg);
            }
        }
    }

    /**
     * remove a single element from the model
     */
    protected removeElemImpl(vel: VpcElBase) {
        let action = new UndoableActionDeleteVel(vel, this.pr.vci);
        this.pr.vci.doChangeSeenCreationDeletion(action)
        action.do(this.pr.vci);
    }
}

