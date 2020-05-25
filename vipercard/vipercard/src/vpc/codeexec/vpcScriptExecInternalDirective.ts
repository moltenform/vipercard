
/* auto */ import { VpcVal, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { RememberHistory } from './../vpcutils/vpcUtils';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcElType, VpcVisualEffectSpec, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { VpcElField } from './../vel/velField';
/* auto */ import { VpcElCard } from './../vel/velCard';
/* auto */ import { VpcElBase } from './../vel/velBase';
/* auto */ import { O, bool } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, ValHolder } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * provide advanced capabilities to scripts.
 * this is, for example, how doMenu can accomplish so many things
 * fully implemented in a higher level.
 */
export abstract class VpcExecInternalDirectiveAbstract {
    outside: OutsideWorldReadWrite
    abstract setGlobal(key:string, v:VpcVal):void;
    abstract getGlobal(key:string):VpcVal;
    abstract getCardHistory():RememberHistory;
    abstract goMakevelwithoutmsg(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]):VpcElBase
    abstract goRemovevelwithoutmsg(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]):void
    abstract createOneVelUsedOnlyByDeserialize(parentId: string, type: VpcElType, insertIndex:number, newId: O<string>):VpcElBase
    abstract setSelection(vel:VpcElField, start:number, end:number):void

    /**
     * run a directive
     */
    go(directive:string, param:ValHolder<string>, msg:[string,string]) {
        let cur = this.outside.Model().getCurrentCard()
        Util512.callAsMethodOnClass("VpcExecInternalDirectiveAbstract", this, 'go' + Util512.capitalizeFirst(directive), [param, cur, msg], false, '', true /*okIfOnParentClass*/)
    }

    /**
     * sends either the closeField or exitField message
     */
    goCloseorexitfield(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let seld = this.outside.FindSelectedTextBounds()[0];
        if (seld && seld.parentIdInternal === cur.idInternal) {
            let fieldsRecent = this.outside.GetFieldsRecentlyEdited().val;
            if (fieldsRecent[seld.idInternal]) {
                msg[0] = 'closefield';
                msg[1] = seld.idInternal;
                fieldsRecent[seld.idInternal] = false;
            }
            else {
                msg[0] = 'exitfield';
                msg[1] = seld.idInternal;
            }
            /* we're changing cards, so mark the other ones false too */
            this.outside.GetFieldsRecentlyEdited().val = {};
        }
    }

    /**
     * sets current card
     */
    goGotocardsendnomessages(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let nextCardId = VpcValS(param.val)
            checkThrow(nextCardId && nextCardId.isItInteger(), 'Rj|');
            this.outside.SetCurCardNoOpenCardEvt(nextCardId.readAsString());
    }

    /**
     * starts visual effect
     */
    goViseffect(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let nextCardId = VpcValS(param.val)
        let spec = this.getGlobal('$currentVisEffect').readAsString().split('|');
            this.setGlobal('$currentVisEffect', VpcValS(''))
            if (spec.length >= 4) {
                let parsed = VpcVisualEffectSpec.getVisualEffect(spec);
                console.log(nextCardId, parsed);
            }
    }

    /**
     * return focus to messagebox
     */
    goReturntomsgbox(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        this.outside.WriteToReplMessageBox('', true);
    }

    /**
     * implement 'go back' and 'go forth'
     */
    goApplybackforth(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let fallback = () => cur.idInternal;
            let cardExists = (s: string) => {
                let ref = new RequestedVelRef(VpcElType.Card);
                ref.lookById = Util512.parseInt(s);
                return bool(this.outside.ElementExists(ref));
            };
            
            if (param.val === 'back') {
                this.getCardHistory().walkPreviousWhileAcceptible(fallback, cardExists);
            }
            else {
                this.getCardHistory().walkNextWhileAcceptible(fallback, cardExists);
            }
    }
}

