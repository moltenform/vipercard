
/* auto */ import { VariableCollectionConstants } from './../vpcutils/vpcVarCollection';
/* auto */ import { alsoReservedWordsList, listOfAllBuiltinCommandsInOriginalProduct, listOfAllBuiltinEventsInOriginalProduct } from './../codeparse/vpcTokens';
/* auto */ import { VpcStandardLibScript } from './../vpcutils/vpcStandardLibScript';
/* auto */ import { VpcBuiltinMsg, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { VpcBuiltinFunctions } from './vpcBuiltinFunctions';
/* auto */ import { VpcElProductOpts } from './../vel/velProductOpts';
/* auto */ import { bool } from './../../ui512/utils/util512Base';
/* auto */ import { findStrToEnum, slength } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * provides ways to see if a certain term is ok to use as a variable name,
 * or if it is a reserved term that is disallowed.
 * Needed because many keywords aren't separate tokens,
 * you shouldn't be able to create a variable named "repeat" even though
 * it lexes as a tkidentifier.
 */
export class CheckReservedWords {
    readonly constants = new VariableCollectionConstants();
    isBuiltinHandler(s: string): boolean {
        /* "mouseup", "arrowkey" */
        s = s.toLowerCase();
        return (
            bool(findStrToEnum(VpcBuiltinMsg, s)) ||
            listOfAllBuiltinEventsInOriginalProduct[s] ||
            VpcStandardLibScript.handlersImplementedInSoftware[s]
        );
    }

    isBuiltinVarOrConstant(s: string): boolean {
        /* "pi", "result" */
        return bool(this.constants.find(s)) || /* bool */ s === 'result' || s === '$result';
    }

    isPropertyName(s: string): boolean {
        /* "autohilite", "style" */
        return bool(VpcElProductOpts.isAnyProp(s));
    }

    isBuiltinFunction(s: string): boolean {
        /* "sin", "length", "result" */
        return VpcBuiltinFunctions.isFunction(s);
    }

    isKeyword(s: string): boolean {
        /* "put" "do" "replace" */
        let isCmd = listOfAllBuiltinCommandsInOriginalProduct[s.toLowerCase()] !== undefined;

        /* "from", "with", "to", "end" */
        return isCmd || /* bool */ alsoReservedWordsList[s];
    }

    okHandlerName(s: string) {
        /* user is making a new handler like on myOperation */
        checkThrow(slength(s), `7)|invalid identifier ${s}`);
        if (!s.match(/^[A-Za-z_$]/)) {
            return false;
        }
        return (
            this.isBuiltinHandler(s) ||
            (!this.isKeyword(s) && !this.isPropertyName(s) && !this.isBuiltinFunction(s) && !this.isBuiltinVarOrConstant(s))
        );
    }

    okLocalVar(s: string) {
        if (s === 'number' || s === 'a' || s === 'it') {
            /* these ones we've explicitly said are ok variable names.
            see also checkCommonMistakenVarNames */
            return true;
        }

        if (!s.match(/^[A-Za-z$_][A-Za-z0-9$_]*$/)) {
            return false;
        }

        /* new: don't need to check this.isPropertyName,
        it'd fine for local variables to shadow a property name. */
        checkThrow(slength(s), `7(|invalid identifier ${s}`);
        return !this.isKeyword(s) && !this.isBuiltinHandler(s) && !this.isBuiltinFunction(s) && !this.isBuiltinVarOrConstant(s);
    }

    potentialUserFn(s: string) {
        checkThrow(s.match(/^[A-Za-z$]/), 'SK|must start with a letter');
        checkThrow(slength(s), `7&|invalid identifier ${s}`);
        return (
            !this.isKeyword(s) &&
            !this.isBuiltinHandler(s) &&
            !this.isPropertyName(s) &&
            !this.isBuiltinFunction(s) &&
            !this.isBuiltinVarOrConstant(s)
        );
    }
}
