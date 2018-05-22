
/* auto */ import { O, checkThrow, makeVpcScriptErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { checkThrowEq, getStrToEnum, isString, slength } from '../../ui512/utils/utils512.js';
/* auto */ import { OrdinalOrPosition, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { RememberHistory } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { IntermedMapOfIntermedVals, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VarCollection } from '../../vpc/vpcutils/vpcVarCollection.js';
/* auto */ import { RequestedVelRef } from '../../vpc/vpcutils/vpcRequestedReference.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { VpcCodeLine } from '../../vpc/codepreparse/vpcCodeLine.js';

/**
 * implementation for the 'go' command
 * not as trivial as you'd think since we need to send the closecard + closebg events
 */
export class VpcExecGoCardHelpers {
    constructor(
        protected outside: OutsideWorldReadWrite,
        protected globals: VarCollection,
        protected locals: VarCollection,
        protected cardHistory: RememberHistory,
    ) {}

    /**
     * run one of the goCardImpl pieces that result from a 'go next' call
     */
    execGoCard(curLine: VpcCodeLine, visited: IntermedMapOfIntermedVals):[string, string] {
        let ret:[string, string] = ['', '']
        let [directive, varName, cardId] = this.visitGoCardImplStatement(visited)
        checkThrow(directive === 'gettarget' || cardId === undefined, '')
        if (directive === 'gettarget') {
            let currentCardId = this.outside.GetOptionS('currentCardId')
            if (cardId && slength(cardId)) {
                this.locals.set(varName, VpcValS(currentCardId + '\n' + cardId))
            } else {
                this.locals.set(varName, VpcValS(currentCardId + '\n' + '<notfound>'))
            }
        } else if (directive === 'set') {
            let whichCards = this.locals.get(varName).readAsString()
            let cardFrom = whichCards.split('\n')[0]
            let cardTo = whichCards.split('\n')[1]
            if (cardTo !== cardFrom && cardTo !== '<notfound>') {
                this.outside.SetCurCardNoOpenCardEvt(cardTo)
            }

            this.globals.set('internalvpcgocardimplsuspendhistory', VpcValN(0))
        } else if (directive === 'setresult') {
            let whichCards = this.locals.get(varName).readAsString()
            let cardTo = whichCards.split('\n')[1]
            let s = (cardTo && cardTo === '<notfound>') ? 'No such card.' : ''
            this.locals.set('$result',  VpcValS(s))
        } else if (directive === 'closefield') {
            let currentCardId = this.outside.GetOptionS('currentCardId')
            let seld = this.outside.GetSelectedField()
            if (seld && seld.parentId === currentCardId) {
                let fieldsRecent = this.outside.GetFieldsRecentlyEdited().val
                if (fieldsRecent[seld.id]) {
                    ret = ['closefield', seld.id]
                    fieldsRecent[seld.id] = false
                } else {
                    ret = ['exitfield', seld.id]
                }

                /* we're changing cards, so mark the other ones false too */
                this.outside.GetFieldsRecentlyEdited().val = {}
            }
        } else {
            ret = this.prepareOpenOrCloseEvent(directive, varName)
        }

        return ret
    }

    /**
     * prepare to send closecard, opencard, etc
     */
    protected prepareOpenOrCloseEvent(directive:string, varName:string):[string, string] {
        let whichCards = this.locals.get(varName).readAsString()
        let cardFrom = whichCards.split('\n')[0]
        let cardTo = whichCards.split('\n')[1]

        let velFrom = this.outside.FindVelById(cardFrom)
        let velTo = this.outside.FindVelById(cardTo)
        let bgFrom = velFrom ? velFrom.parentId : ''
        let bgTo = velTo ? velTo.parentId : ''

        let ret:[string, string] = ['', '']
        directive = directive.toLowerCase()
        if (directive === 'closecard') {
            if (cardTo !== cardFrom && cardTo !== '<notfound>') {
                ret = ['closecard', cardFrom]
            }
        } else if (directive === 'opencard') {
            if (cardTo !== cardFrom && cardTo !== '<notfound>') {
                ret = ['opencard', cardTo]
            }
        } else if (directive === 'closebackground') {
            if (bgFrom !== bgTo && slength(bgFrom)) {
                ret = ['closebackground', bgFrom]
            }
        } else if (directive === 'openbackground') {
            if (bgFrom !== bgTo && slength(bgTo)) {
                ret = ['openbackground', bgTo]
            }
        } else {
            checkThrow(false, 'unknown directive')
        }

        return ret
    }

    /**
     * 'goCardImpl' can't use the same old evalRequestedExpression
     */
    protected visitGoCardImplStatement(vals: IntermedMapOfIntermedVals):[string, string, O<string>] {
        /* get the string */
        checkThrow(
            vals.vals.TokenTkstringliteral && vals.vals.TokenTkstringliteral[0],
            'visitSendStatement expected both RuleExpr and RuleObject'
        );
        let directive = vals.vals.TokenTkstringliteral[0].toString().replace(/"/g, '')

        /* get the variable */
        checkThrow(
            vals.vals.TokenTkidentifier && vals.vals.TokenTkidentifier[1],
            'visitSendStatement expected both RuleExpr and RuleObject'
        );
        let varName = vals.vals.TokenTkidentifier[1].toString()
        checkThrow(varName.toLowerCase().startsWith('tmpgovar'), '')

        /* get the card reference */
        let cardId:O<string>
        if (directive === 'gettarget') {
            cardId = this.valsToReferencedCardId(vals)
        }

        return [directive, varName, cardId]
    }

    /**
     * from the results of calling visit, get the target card id
     */
    protected valsToReferencedCardId(vals: IntermedMapOfIntermedVals):O<string> {
        let ref = this.findChildVelRef(vals, 'RuleNtDest');
        let curStack = this.getCurrentStack()
        if (vals.vals.TokenTkstringliteral && vals.vals.TokenTkstringliteral.length > 1) {
            /* returns card id if present in history, otherwise undefined */
            return this.goBackOrForth(vals.vals.TokenTkstringliteral[1] as string)
        } else if (ref) {
            let vel = this.outside.ResolveVelRef(ref)
            if (!vel) {
                /* according to docs, go to card "notExist" should fail silently */
                return undefined
            }

            let velAsStack = vel as VpcElStack;
            let velAsBg = vel as VpcElBg;
            let velAsCard = vel as VpcElCard;
            if (velAsCard && velAsCard.isVpcElCard) {
                /* e.g. go card 2 */
                return velAsCard.id
            } else if (velAsStack && velAsStack.isVpcElStack) {
                if (velAsStack.id !== curStack.id) {
                    /* e.g. go to stack "otherStack" */
                    throw makeVpcScriptErr("57|we don't support going to other stacks");
                } else {
                    /* nothing to do, we're already on this stack */
                    return this.outside.GetOptionS('currentCardId')
                }
            } else if (velAsBg && velAsBg.isVpcElBg && velAsBg.cards.length) {
                /* e.g. go to bg 2 */
                return this.goBasedOnBg(velAsBg)
            } else {
                /* e.g. go to cd btn 2 */
                throw makeVpcScriptErr('56|we only support going to a card or a bg');
            }
        } else {
            let shp: string;
            if (vals.vals.RuleHOrdinal) {
                /* e.g. go second card */
                shp = vals.vals.RuleHOrdinal[0] as string;
            } else if (vals.vals.RuleHPosition) {
                /* e.g. go next card */
                shp = vals.vals.RuleHPosition[0] as string;
            } else {
                throw makeVpcScriptErr('55|all choices null');
            }

            checkThrow(isString(shp), '7O|');
            let hp = getStrToEnum<OrdinalOrPosition>(OrdinalOrPosition, 'OrdinalOrPosition', shp);
            let currentCardId = this.outside.GetOptionS('currentCardId')
            return curStack.getCardByOrdinal(currentCardId, hp).id
        }
    }

    /**
     * confirmed in emulator: if sent to the same bg we're already at,
     * do not change the current card
     */
    protected goBasedOnBg(bg: VpcElBg) {
        let curCardId = this.outside.GetOptionS('currentCardId')
        let curCard = this.outside.FindVelById(curCardId)
        if (curCard && curCard.parentId === bg.id) {
            return curCardId
        } else {
           return bg.cards[0].id
        }
    }

    /**
     * retrieve an expected RequestedVelRef from the visitor result
     */
    protected findChildVelRef(vals: IntermedMapOfIntermedVals, nm: string): O<RequestedVelRef> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsVelRef = got[0] as RequestedVelRef;
            checkThrowEq(1, got.length, '7X|expected length 1');
            checkThrow(gotAsVelRef.isRequestedVelRef, '7W|wrong type');
            return gotAsVelRef;
        } else {
            return undefined;
        }
    }

    /**
     * resolve reference to a vel
     */
    protected getResolveChildVel(vals: IntermedMapOfIntermedVals, nm: string): VpcElBase {
        let ref = throwIfUndefined(this.findChildVelRef(vals, nm), '5K|not found', nm);
        return throwIfUndefined(this.outside.ResolveVelRef(ref), '5J|element not found');
    }

    /**
     * get current stack object
     */
    protected getCurrentStack() {
        let requestStack = new RequestedVelRef(VpcElType.Stack);
        requestStack.lookByRelative = OrdinalOrPosition.This;
        let stack = this.outside.ResolveVelRef(requestStack) as VpcElStack;
        checkThrow(stack && stack.isVpcElStack, '7P|');
        return stack
    }

    /**
     * implement "go back" and "go forth"
     */
    protected goBackOrForth(s:string):O<string> {
        checkThrow(s && isString(s), "expected string")
        s = s.replace(/"/g, '')
        let ret = ''
        if (s === 'back') {
            ret = this.cardHistory.walkPrevious()
        } else if (s === 'forth') {
            ret = this.cardHistory.walkNext()
        } else {
            checkThrow(false, "you can use go back or go forth, but not this", s)
        }

        return slength(ret) ? ret : undefined
    }
}
