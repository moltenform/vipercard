
/* auto */ import { checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { findStrToEnum, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { VpcBuiltinMsg } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VariableCollectionConstants } from '../../vpc/vpcutils/vpcVarCollection.js';
/* auto */ import { VpcElProductOpts } from '../../vpc/vel/velProductOpts.js';
/* auto */ import { alsoReservedWordsList, partialReservedWordsList } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { VpcBuiltinFunctions } from '../../vpc/codepreparse/vpcScriptFunctions.js';

export enum CodeSymbols {
    RequestHandlerCall = '$requesthandlercall',
    RequestEval = '$requesteval'
}

export class CheckReservedWords {
    constants = new VariableCollectionConstants();
    isBuiltinHandler(s: string): boolean {
        // "mouseup", "arrowkey"
        return findStrToEnum<VpcBuiltinMsg>(VpcBuiltinMsg, s) !== undefined;
    }

    isBuiltinVarOrConstant(s: string): boolean {
        // "pi", "result"
        return !!this.constants.find(s) || s === 'result' || s === '$result';
    }

    isPropertyName(s: string): boolean {
        // "autohilite", "style"
        return VpcElProductOpts.isAnyProp(s);
    }

    isBuiltinFunction(s: string): boolean {
        // "sin", "length", "result"
        return VpcBuiltinFunctions.isFunction(s);
    }

    isKeyword(s: string): boolean {
        // "from", "with", "to", "end"
        return partialReservedWordsList[s] || alsoReservedWordsList[s];
    }

    okHandlerName(s: string) {
        checkThrow(slength(s), `7)|invalid identifier ${s}`);
        return (
            this.isBuiltinHandler(s) ||
            (!this.isKeyword(s) &&
                !this.isPropertyName(s) &&
                !this.isBuiltinFunction(s) &&
                !this.isBuiltinVarOrConstant(s))
        );
    }

    okLocalVar(s: string) {
        checkThrow(slength(s), `7(|invalid identifier ${s}`);
        return (
            s === 'a' ||
            (!this.isKeyword(s) &&
                !this.isBuiltinHandler(s) &&
                !this.isPropertyName(s) &&
                !this.isBuiltinFunction(s) &&
                !this.isBuiltinVarOrConstant(s))
        );
    }

    potentialUserFn(s: string) {
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
