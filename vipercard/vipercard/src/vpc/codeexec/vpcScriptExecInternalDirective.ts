
/* auto */ import { VpcVal, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { RememberHistory } from './../vpcutils/vpcUtils';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcElType, VpcVisualEffectSpec, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { VpcElCard } from './../vel/velCard';
/* auto */ import { VpcElBase } from './../vel/velBase';
/* auto */ import { O, bool } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, ValHolder } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * provide advanced capabilities to scripts.
 * this is, for example, how doMenu can accomplish so many things
 */
export abstract class VpcExecInternalDirectiveAbstract {
    outside: OutsideWorldReadWrite

    abstract setGlobal(key:string, v:VpcVal):void;
    abstract getGlobal(key:string):VpcVal;
    abstract getCardHistory():RememberHistory;
    abstract goMakevelwithoutmsg(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]):VpcElBase
    abstract goRemovevelwithoutmsg(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]):void
    abstract createOneVelUsedOnlyByDeserialize(parentId: string, type: VpcElType, insertIndex:number, newId: O<string>):VpcElBase

    go(directive:string, param:ValHolder<string>, msg:[string,string]) {
        let cur = this.outside.Model().getCurrentCard()
        Util512.callAsMethodOnClass("VpcExecInternalDirectiveAbstract", this, 'go' + Util512.capitalizeFirst(directive), [param, cur, msg], false)
    }

    goCloseorexitfield(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let seld = this.outside.GetSelectedField();
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

    goGotocardsendnomessages(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let nextCardId = VpcValS(param.val)
            checkThrow(nextCardId && nextCardId.isItInteger(), 'Rj|');
            this.outside.SetCurCardNoOpenCardEvt(nextCardId.readAsString());
    }

    goViseffect(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        let nextCardId = VpcValS(param.val)
        let spec = this.getGlobal('$currentVisEffect').readAsString().split('|');
            this.setGlobal('$currentVisEffect', VpcValS(''))
            if (spec.length >= 4) {
                let parsed = VpcVisualEffectSpec.getVisualEffect(spec);
                console.log(nextCardId, parsed);
            }
    }

    goReturntomsgbox(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
        this.outside.WriteToReplMessageBox('', true);
    }

    goApplyBackForth(param:ValHolder<string>, cur:VpcElCard, msg:[string,string]) {
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

