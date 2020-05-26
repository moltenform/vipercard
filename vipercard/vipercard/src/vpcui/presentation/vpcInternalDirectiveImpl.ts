
/* auto */ import { VpcVal, VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { RememberHistory } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { UndoableActionCreateVel, UndoableActionDeleteVel } from './../state/vpcUndo';
/* auto */ import { VpcStateSerialize } from './../state/vpcStateSerialize';
/* auto */ import { VpcExecInternalDirectiveAbstract } from './../../vpc/codeexec/vpcScriptExecInternalDirective';
/* auto */ import { RequestedVelRef } from './../../vpc/vpcutils/vpcRequestedReference';
/* auto */ import { VpcPresenterInterface } from './vpcPresenterInterface';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcElType, VpcTool, checkThrow, checkThrowInternal, checkThrowNotifyMsg, vpcElTypeShowInUI } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcGettableSerialization } from './../../vpc/vel/velSerialization';
/* auto */ import { VpcElField, VpcTextFieldAsGeneric } from './../../vpc/vel/velField';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { VpcElBase, VpcElSizable } from './../../vpc/vel/velBase';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { Util512SerializableHelpers } from './../../ui512/utils/util512Serialize';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder, longstr } from './../../ui512/utils/util512';
/* auto */ import { TextSelModify } from './../../ui512/textedit/ui512TextSelModify';
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

    /**
     * set contents of global var
     */
    setGlobal(key:string, v:VpcVal) {
        this.vci.getCodeExec().globals.set(key, v)
    }

    /**
     * get contents of global var
     */
    getGlobal(key:string):VpcVal {
        return this.vci.getCodeExec().globals.getOrFallback(key, VpcValS(''))
    }

    /**
     * access cardhistory array
     */
    getCardHistory():RememberHistory {
        return this.vci.getCodeExec().cardHistory
    }
    
    /**
     * make a new vel, can't send messages like newButton
     */
    goMakevelwithoutmsg(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let vel:VpcElBase
        let isFromUI = false
        if (param.val.toLowerCase().endsWith('fromui')) {
            isFromUI = true
            param.val = param.val.replace(/fromui/i, '')
        }

        if (param.val==='btn' || param.val==='button') {
            vel = this.makeBtnFldWithoutMsg(VpcElType.Btn, isFromUI)
        } else if (param.val==='fld' || param.val==='field') {
            vel = this.makeBtnFldWithoutMsg(VpcElType.Fld, isFromUI)
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

    /**
     * paste a copied vel
     */
    goPastecardorvel(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let id = this.vci.getOptionS('copiedVelId');
        let found = this.vci.getModel().findByIdUntyped(id);
        if (found && (found.getType() === VpcElType.Btn || found.getType() === VpcElType.Fld)) {
           checkThrow(!found.getS('is_bg_velement_id'), "bg elems not yet supported")
            let dupe = this.makeBtnFldWithoutMsg(found.getType(), true);
            let asObj = VpcGettableSerialization.serializeGettable(found);
            let asNewObj = JSON.parse(JSON.stringify(asObj))
            VpcGettableSerialization.deserializeSettable(dupe, asNewObj, this.outside.Model())

            /* move it a bit */
            let amtToMove = Util512Higher.getRandIntInclusiveWeak(10, 50);
            dupe.setOnVel('x', Math.min(ScreenConsts.xAreaWidth, dupe.getN('x') + amtToMove), this.vci.getModel())
            dupe.setOnVel('y', Math.min(ScreenConsts.yAreaHeight, dupe.getN('y') + amtToMove), this.vci.getModel())
        } else if (id && id.length) {
            checkThrowNotifyMsg(false, 'U9|Pasting this type of element is not yet supported.');
        } else {
            checkThrowNotifyMsg(false, 'U8|Nothing has been copied.');
        }
    }

    /**
     * remove a vel
     */
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

    /**
     * make a background
     */
    protected makeBgWithoutMsg(cur:VpcElCard) { 
        let bg = this.createOneVelUsedOnlyByDeserialize(this.vci.getModel().stack.idInternal, VpcElType.Bg, -1);
        this.createOneVelUsedOnlyByDeserialize(bg.idInternal, VpcElType.Card, -1);
        return bg
    }

    /**
     * make a card
     */
    protected makeCardWithoutMsg(cur:VpcElCard, isDupePaint:boolean) {
        let paint = cur.getS('paint');
        let currentBg = this.vci.getModel().getById(VpcElBg, cur.parentIdInternal);
        let currentIndex = currentBg.cards.findIndex(cd => cd.idInternal === cur.idInternal);
        let indexRelativeToBg = currentIndex === -1 ? 0 : currentIndex + 1;
        let vel = this.createOneVelUsedOnlyByDeserialize(cur.parentIdInternal, VpcElType.Card, indexRelativeToBg);
        if (isDupePaint) {
            /* can't use copy card/paste card since it's not yet impl'd */
            /* use this workaround instead (only copies the paint) */
            vel.setOnVel('paint', paint, this.vci.getModel());
        }
        return vel
    }

    /**
     * make a btn or fld
     */
    protected makeBtnFldWithoutMsg(type:VpcElType, fromui:boolean) {
        /* make a button that is tall enough to show an icon, since
        in prev versions icon clipping didn't work well */
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

        let newX = this.pr.userBounds[0] + Util512Higher.getRandIntInclusiveWeak(20, 200);
        let newY = this.pr.userBounds[1] + Util512Higher.getRandIntInclusiveWeak(20, 200);
        let currentCardId = this.vci.getOutside().GetOptionS('currentCardId');
        let vel = this.createOneVelUsedOnlyByDeserialize(currentCardId, type, -1);
        assertTrue(vel instanceof VpcElSizable, '6u|not VpcElSizable');
        vel.setDimensions(newX,newY, w, h, this.vci.getModel());
        vel.setOnVel(
            'name',
            longstr(`my ${vpcElTypeShowInUI(vel.getType())}
             ${this.vci.getModel().stack.getNextNumberForElemName(this.vci.getModel(), type === VpcElType.Btn)}`),
            this.vci.getModel()
        );

        if (type === VpcElType.Btn) {
            /* give it a style and initial script */
            vel.setProp('style', VpcValS('roundrect'), this.vci.getModel());
            vel.setOnVel('label', lng('lngNew Button'), this.vci.getModel());
            vel.setOnVel('showlabel', true, this.vci.getModel());
            vel.setOnVel('script', 'on mouseUp\n\tanswer "the button was clicked."\nend mouseUp', this.vci.getModel());
        } else if (type === VpcElType.Fld && vel instanceof VpcElField) {
            /* need to give it content, since we don't currently
            draw the lines, otherwise you'd see nothing there */
            let newTxt = FormattedText.newFromSerialized(
                UI512DrawText.setFont('abcde\nabcde\nabcde', vel.getDefaultFontAsUi512())
            );

            vel.setFmTxt(newTxt, this.vci.getModel());
            vel.setProp('style', VpcValS('scrolling'), this.vci.getModel());
        } else {
            checkThrowInternal(false, "btn or fld expected")
        }

        /* important: only mess with proppanels if not fromui!
        otherwise closing the invisible panel will set props on the object */
        if (fromui) {
            /* save *before* setting selectedVelId */
            this.pr.lyrPropPanel.saveChangesToModel(false);
            this.pr.lyrPropPanel.updateUI512Els();
            this.vci.setOption('selectedVelId', vel.idInternal);
            this.vci.setOption('viewingScriptVelId', '');

            /* update before tool is set */
            this.pr.lyrPropPanel.updateUI512Els();

            /* change tool -- so we can see it selected  */
            let needChangeTool = type === VpcElType.Btn ? VpcTool.Button : VpcTool.Field
            this.setUpcomingTool(needChangeTool)
        }
        
        return vel
    }

    /**
     * in a menu action, current tool might temporarily be browse
     */
    protected getUpcomingTool() {
        if (this.vci.getTool() === VpcTool.Browse) {
            return this.vci.getCodeExec().silenceMessagesForUIAction.val ?? this.vci.getTool()
        } else {
            return this.vci.getTool()
        }
    }

    /**
     * in a menu action, set subsequent tool
     */
    protected setUpcomingTool(t:VpcTool) {
        if (this.vci.getTool() === VpcTool.Browse && this.vci.getCodeExec().silenceMessagesForUIAction.val) {
            this.vci.getCodeExec().silenceMessagesForUIAction.val = t
        } else {
            this.vci.setTool(t)
        }
    }

    /**
     * create an element and add it to the model
     */
    createOneVelUsedOnlyByDeserialize(parentId: string, type: VpcElType, insertIndex = -1, newId: O<string> = undefined) {
        if (!newId) {
            newId = this.vci.getModel().stack.getNextId(this.vci.getModel());
        }

        checkThrow(newId.match(/^[0-9]+$/), 'Ku|id should be purely numeric', newId);
        let cr = new UndoableActionCreateVel(newId, parentId, type, false, insertIndex);
        this.vci.doChangeSeenCreationDeletion(cr)
        cr.do(this.vci);
        return this.vci.getModel().getByIdUntyped(newId);
    }

    /**
     * remove an element from the model, includng children
     */
    protected removeVel(vel: VpcElBase) {
        if (vel instanceof VpcElCard) {
            let totalCardNum = this.vci
                .getModel()
                .stack.bgs.map(bg => bg.cards.length)
                .reduce(Util512.add);
            checkThrow(totalCardNum > 1, '8%|Cannot delete the only card of a stack');
            let curCard = this.vci.getOptionS('currentCardId');
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

        UndoableActionDeleteVel.checkIfCanDelete(vel, this.vci);
        this.removeElemImpl(vel);

        if (vel.getType() === VpcElType.Card) {
            let parentBg = this.vci.getModel().getById(VpcElBg, vel.parentIdInternal);
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
        let action = new UndoableActionDeleteVel(vel, this.vci);
        this.vci.doChangeSeenCreationDeletion(action)
        action.do(this.vci);
    }

    /**
     * set the selected text
     * we don't need to send a selected-field-changed event, it will 
     * be sent by the ui512 layer.
     */
    setSelection(vel:O<VpcElField>, start:number, end:number):void {
        this.vci.causeFullRedraw()
        if (!vel) {
            /* clear the selection */
            this.pr.setCurrentFocus(undefined, false /* skip sending event */)
            return
        }

        let elId = this.pr.lyrModelRender.velIdToElId(vel.idInternal)
        let findEl = this.pr.app.findEl(elId)
        if (findEl) {
            vel.setOnVel('selcaret', start, this.outside.Model())
            vel.setOnVel('selend', end, this.outside.Model())
            let generic = new VpcTextFieldAsGeneric(undefined, vel, this.outside.Model());
            let newbounds = TextSelModify.getSelectedTextBounds(generic);
            /* also checks if the field has lockedtext/can'tselect */
            if (newbounds) {
                /* let's be kind and fix up the bounds so if you send it something
                weird/negative/backwards, we'll repair it here  */
                vel.setOnVel('selcaret', newbounds[0], this.outside.Model())
                vel.setOnVel('selend', newbounds[1], this.outside.Model())
                this.pr.setCurrentFocus(elId, false /* skip sending event */)
            }
        }
    }
}

