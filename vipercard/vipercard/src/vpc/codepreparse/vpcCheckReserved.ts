
/* auto */ import { VariableCollectionConstants } from './../vpcutils/vpcVarCollection';
/* auto */ import { alsoReservedWordsList, listOfAllBuiltinCommandsInOriginalProduct } from './../codeparse/vpcTokens';
/* auto */ import { VpcBuiltinMsg } from './../vpcutils/vpcEnums';
/* auto */ import { VpcBuiltinFunctions } from './vpcBuiltinFunctions';
/* auto */ import { VpcElProductOpts } from './../vel/velProductOpts';
/* auto */ import { bool, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { findStrToEnum, slength } from './../../ui512/utils/util512';

/**
 * provides ways to see if a certain term is ok to use as a variable name,
 * or if it is a reserved term that is disallowed
 */
export class CheckReservedWords {
    readonly constants = new VariableCollectionConstants();
    isBuiltinHandler(s: string): boolean {
        /* "mouseup", "arrowkey" */
        s = s.toLowerCase();
        return findStrToEnum(VpcBuiltinMsg, s) !== undefined;
    }

    isBuiltinVarOrConstant(s: string): boolean {
        /* "pi", "result" */
        return (
            bool(this.constants.find(s)) || bool(s === 'result') || bool(s === '$result')
        );
    }

    isPropertyName(s: string): boolean {
        /* "autohilite", "style" */
        return VpcElProductOpts.isAnyProp(s);
    }

    isBuiltinFunction(s: string): boolean {
        /* "sin", "length", "result" */
        return VpcBuiltinFunctions.isFunction(s);
    }

    isKeyword(s: string): boolean {
        /* "put" "do" "replace" */
        let isCmd =
            listOfAllBuiltinCommandsInOriginalProduct[s.toLowerCase()] !== undefined;

        /* "from", "with", "to", "end" */
        return isCmd || bool(alsoReservedWordsList[s]);
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
        // new: local variables can be property names.
        checkThrow(slength(s), `7(|invalid identifier ${s}`);
        return (
            !this.isKeyword(s) &&
            !this.isBuiltinHandler(s) &&
            !this.isBuiltinFunction(s) &&
            !this.isBuiltinVarOrConstant(s)
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
