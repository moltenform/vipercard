
/* auto */ import { VarCollection } from './../vpcutils/vpcVarCollection';
/* auto */ import { IntermedMapOfIntermedVals, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { RememberHistory } from './../vpcutils/vpcUtils';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcCodeLine } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { VpcElType } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { VpcElBg } from './../vel/velBg';
/* auto */ import { VpcElBase } from './../vel/velBase';
/* auto */ import { O, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { isString, slength, castVerifyIsStr } from './../../ui512/utils/util512';

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
        protected cardHistoryPush: RememberHistory
    ) {}

    /**
     * run one of the goCardImpl pieces that result from a 'go next' call
     * we'll store our state in a local variable
     */
    execGoCard(curLine: VpcCodeLine, visited: IntermedMapOfIntermedVals): [string, string] {
        let ret: [string, string] = ['', ''];
        let [directive, varName, cardId] = this.visitGoCardImplStatement(visited);
        let currentCardId = this.outside.GetOptionS('currentCardId');
        if (directive === 'gettarget') {
            if (cardId) {
                this.locals.set('$result', VpcValS(cardId));
            } else {
                this.locals.set('$result', VpcValS('No such card.'));
            }

            if (!cardId || cardId === currentCardId) {
                this.locals.set(varName, VpcValS('$no-op\n$no-op'));
            } else {
                this.locals.set(varName, VpcValS(currentCardId + '\n' + cardId));
            }
        } else {
            let [cdFrom, cdTo] = this.locals.get(varName).readAsString().split('\n');
            this.locals.set('$result', VpcValS(''));
            if (cdFrom === '$no-op') {
                this.locals.set('$result', VpcValS('No such card.'));
            } else if (directive === 'move') {
                let whichCards = this.locals.get(varName).readAsString();
                let cardFrom = whichCards.split('\n')[0];
                let cardTo = whichCards.split('\n')[1];
                this.outside.SetCurCardNoOpenCardEvt(cardTo);
            } else if (directive === 'setresult') {
                /* we've already set the result. */
            } else if (directive === 'closeorexitfield') {
                let currentCardId = this.outside.GetOptionS('currentCardId');
                let seld = this.outside.GetSelectedField();
                if (seld && seld.parentId === currentCardId) {
                    let fieldsRecent = this.outside.GetFieldsRecentlyEdited().val;
                    if (fieldsRecent[seld.id]) {
                        ret = ['closefield', seld.id];
                        fieldsRecent[seld.id] = false;
                    } else {
                        ret = ['exitfield', seld.id];
                    }

                    /* we're changing cards, so mark the other ones false too */
                    this.outside.GetFieldsRecentlyEdited().val = {};
                }
            } else {
                ret = this.prepareOpenOrCloseEvent(directive, varName);
            }
        }

        return ret;
    }

    /**
     * prepare to send closecard, opencard, etc
     */
    protected prepareOpenOrCloseEvent(directive: string, varName: string): [string, string] {
        let [cardFrom, cardTo] = this.locals.get(varName).readAsString().split('\n');

        let velFrom = this.outside.FindVelById(cardFrom);
        let velTo = this.outside.FindVelById(cardTo);
        let bgFrom = velFrom ? velFrom.parentId : '';
        let bgTo = velTo ? velTo.parentId : '';

        let ret: [string, string] = ['', ''];
        directive = directive.toLowerCase();
        if (directive === 'closecard') {
            ret = ['closecard', cardFrom];
        } else if (directive === 'opencard') {
            ret = ['opencard', cardTo];
        } else if (directive === 'closebackground') {
            if (bgFrom !== bgTo && slength(bgFrom)) {
                ret = ['closebackground', bgFrom];
            }
        } else if (directive === 'openbackground') {
            if (bgFrom !== bgTo && slength(bgTo)) {
                ret = ['openbackground', bgTo];
            }
        } else {
            checkThrow(false, 'unknown directive');
        }

        return ret;
    }

    /**
     * 'goCardImpl' can't use the same old evalRequestedExpression
     */
    protected visitGoCardImplStatement(vals: IntermedMapOfIntermedVals): [string, string, O<string>] {
        /* get the string */
        checkThrow(
            vals.vals.TokenTkstringliteral && vals.vals.TokenTkstringliteral[0],
            'visitSendStatement expected both RuleExpr and RuleObject'
        );
        let directive = vals.vals.TokenTkstringliteral[0].toString().replace(/"/g, '');

        /* get the variable */
        checkThrow(
            vals.vals.TokenTkidentifier && vals.vals.TokenTkidentifier[1],
            'visitSendStatement expected both RuleExpr and RuleObject'
        );
        let varName = vals.vals.TokenTkidentifier[1].toString();
        checkThrow(varName.toLowerCase().startsWith('tmpgovar'), '');

        /* get the card reference */
        let cardId: O<string>;
        if (directive === 'gettarget') {
            cardId = this.valsToReferencedCardId(vals);
        }

        return [directive, varName, cardId];
    }

    /**
     * from the results of calling visit, get the target card id
     * more complicated because we need to support "go 1"
     */
    protected valsToReferencedCardId(vals: IntermedMapOfIntermedVals): O<string> {
        let currentCardId = this.outside.GetOptionS('currentCardId');
        let vel: O<VpcElBase>;
        if (vals.vals.RuleHOrdinal) {
            /* e.g. `go second` */
            let ref = new RequestedVelRef(VpcElType.Card);
            ref.lookByRelative = IntermedMapOfIntermedVals.getOrdinalOrPosition(vals, 'RuleHOrdinal');
            vel = this.outside.ResolveVelRef(ref)[0];
        } else if (vals.vals.RuleHPosition) {
            /* e.g. `go first` */
            let ref = new RequestedVelRef(VpcElType.Card);
            ref.lookByRelative = IntermedMapOfIntermedVals.getOrdinalOrPosition(vals, 'RuleHPosition');
            vel = this.outside.ResolveVelRef(ref)[0];
        } else if (vals.vals.RuleHBuiltinCmdGoDest) {
            /* e.g. `go card 1` */
            /* this also includes `go back` since `back` is always a card */
            let ref = vals.vals.RuleHBuiltinCmdGoDest[0] as RequestedVelRef;
            checkThrow(ref instanceof RequestedVelRef, '');
            vel = this.outside.ResolveVelRef(ref)[0];
        } else if (vals.vals.tkStringLiteral) {
            /* be kind and accept `go "back"` even though the product doesn't */
            let s = castVerifyIsStr(vals.vals.tkStringLiteral[0]);
            if (s === 'back' || s === 'forth' || s === 'recent') {
                return this.goBackOrForth(s, currentCardId);
            } else if (s === 'push' || s === 'pop') {
                return this.goPushOrPop(s, currentCardId);
            } else {
                checkThrow(false, `unknown place to go to. did you mean 'go card "foo" instead?`);
            }
        }

        if (vel) {
            if (vel.getType() === VpcElType.Card) {
                return vel.id;
            } else if (vel.getType() === VpcElType.Bg) {
                // if in same bg do not move
                if (this.outside.FindVelById(currentCardId)?.parentId === vel.id) {
                    return currentCardId;
                } else {
                    return (vel as VpcElBg)?.cards[0]?.id;
                }
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    /**
     * implement "go back" and "go forth"
     */
    protected goBackOrForth(s: string, currentCardId: string): O<string> {
        checkThrow(s && isString(s), 'expected string');
        let fallback = () => currentCardId;
        s = s.replace(/"/g, '');
        let ret = '';
        if (s === 'back' || s === 'recent') {
            ret = this.cardHistory.walkPrevious(fallback);
        } else if (s === 'forth') {
            ret = this.cardHistory.walkNext(fallback);
        } else {
            checkThrow(false, 'you can use go back or go forth, but not this', s);
        }

        return slength(ret) ? ret : undefined;
    }

    /**
     * implement "go push" and "go pop"
     */
    protected goPushOrPop(s: string, currentCardId: string): O<string> {
        checkThrow(s && isString(s), 'expected string');
        let fallback = () => currentCardId;
        s = s.replace(/"/g, '');
        let ret = '';
        if (s === 'push') {
            this.cardHistoryPush.append(currentCardId);
            ret = currentCardId;
        } else if (s === 'pop') {
            ret = this.cardHistoryPush.pop(fallback);
        } else {
            checkThrow(false, 'you can use push or pop, but not this', s);
        }

        return slength(ret) ? ret : undefined;
    }
}
