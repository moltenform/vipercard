
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { tkstr } from './../codeparse/vpcTokens';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcCodeLine } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { AnyParameterCtor, Util512 } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* see the top of vpcTopPreparse.ts to read how we execute code. */

/**
 * helpers for executing statements
 */
export class VpcScriptExecuteStatementHelpers {
    outside: OutsideWorldReadWrite;

    /**
     * implementation of add, subtract, etc
     */
    goMathAlter(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, fn: (a: number, b: number) => number) {
        let val = ensureDefined(this.findChildVal(vals, tkstr.RuleLvl1Expression), '5M|');
        let container = ensureDefined(this.findChildAndCast(RequestedContainerRef, vals, tkstr.RuleHContainer), '5L|');
        let getResultAsString = (s: string) => {
            let f1 = VpcValS(s).readAsStrictNumeric();
            let f2 = val.readAsStrictNumeric();
            let res = fn(f1, f2);
            return VpcValN(res).readAsString();
        };

        this.outside.ContainerModify(container, getResultAsString);
    }

    /**
     * click, drag implementation
     */
    clickOrDrag(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, expectSee: string) {
        let nm = tkstr.RuleLvl4Expression;
        let argsGiven: number[] = [];
        let ar = vals.vals[nm];
        if (ar && ar.length) {
            let arVals = ar as VpcVal[];
            for (let i = 0, len = arVals.length; i < len; i++) {
                let item = arVals[i];
                assertTrue(item instanceof VpcVal, 'JO|every item must be a vpcval');
                let coords = item.isIntegerList(2);
                if (coords) {
                    Util512.extendArray(argsGiven, coords);
                } else {
                    argsGiven.push(item.readAsStrictInteger());
                }
            }
        }

        checkThrow(argsGiven.length > 1, 'JN|not enough args');
        let mods = ModifierKeys.None;
        let allIdentifiers = this.getChildStrs(vals, tkstr.tkIdentifier, true);
        let sawExpected = false;
        for (let i = 0, len = allIdentifiers.length; i < len; i++) {
            let id = allIdentifiers[i];
            if (id === 'shiftkey') {
                mods |= ModifierKeys.Shift;
            } else if (id === 'optionkey') {
                mods |= ModifierKeys.Opt;
            } else if (id === 'commandkey' || id === 'cmdkey') {
                mods |= ModifierKeys.Cmd;
            } else if (id === expectSee) {
                sawExpected = true;
            }
        }

        checkThrow(sawExpected, 'JM|syntax error did not see ', expectSee);
        this.outside.SimulateClick(argsGiven, mods);
    }

    /**
     * get string literal params
     */
    getLiteralParams(vals: IntermedMapOfIntermedVals, nm = tkstr.tkStringLiteral): string[] {
        let strs = this.getChildStrs(vals, nm, false);
        for (let i = 0; i < strs.length; i++) {
            strs[i] = strs[i].toLowerCase();
            if (strs[i].startsWith('"') && strs[i].endsWith('"')) {
                strs[i] = strs[i].toLowerCase().slice(1, -1);
            }
        }

        return strs;
    }

    /**
     * get child strings
     */
    getChildStrs(vals: IntermedMapOfIntermedVals, nm: string, atLeastOne: boolean): string[] {
        let ret: string[] = [];
        if (vals.vals[nm]) {
            for (let i = 0, len = vals.vals[nm].length; i < len; i++) {
                let child = vals.vals[nm][i];
                checkThrow(typeof child === 'string', '7T|not a string');
                ret.push(child);
            }
        } else {
            checkThrow(!atLeastOne, '7S|no child');
        }

        return ret;
    }

    /**
     * get child VpcVals
     */
    getChildVpcVals(vals: IntermedMapOfIntermedVals, nm: string, atLeastOne: boolean): VpcVal[] {
        let ret: VpcVal[] = [];
        if (vals.vals[nm]) {
            for (let i = 0, len = vals.vals[nm].length; i < len; i++) {
                let child = vals.vals[nm][i];
                checkThrow(child instanceof VpcVal, 'JS|');
                ret.push(child);
            }
        } else {
            checkThrow(!atLeastOne, 'JR|no child');
        }

        return ret;
    }

    /**
     * retrieve an expected IntermedMapOfIntermedVals from the visitor result
     */
    findChildMap(vals: IntermedMapOfIntermedVals, nm: string): O<IntermedMapOfIntermedVals> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsMap = got[0] as IntermedMapOfIntermedVals;
            checkThrowEq(1, got.length, '7d|expected length 1');
            checkThrow(gotAsMap instanceof IntermedMapOfIntermedVals, '7c|wrong type');
            return gotAsMap;
        } else {
            return undefined;
        }
    }

    /**
     * retrieve an expected VpcVal from the visitor result
     */
    findChildVal(vals: IntermedMapOfIntermedVals, nm: string): O<VpcVal> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsVal = got[0] as VpcVal;
            checkThrowEq(1, got.length, '7b|expected length 1');
            checkThrow(gotAsVal instanceof VpcVal, '7a|wrong type');
            return gotAsVal;
        } else {
            return undefined;
        }
    }

    /**
     * retrieve an expected string from the visitor result
     */
    findChildStr(vals: IntermedMapOfIntermedVals, nm: string): O<string> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsString = got[0] as string;
            checkThrowEq(1, got.length, '7Z|expected length 1');
            checkThrow(typeof gotAsString === 'string', '7Y|wrong type');
            return gotAsString;
        } else {
            return undefined;
        }
    }

    /**
     * retrieve an expected RequestedVelRef from the visitor result
     */
    findChildVelRef(vals: IntermedMapOfIntermedVals, nm: string): O<RequestedVelRef> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsVelRef = got[0] as RequestedVelRef;
            checkThrowEq(1, got.length, '7X|expected length 1');
            checkThrow(gotAsVelRef instanceof RequestedVelRef, '7W|wrong type');
            return gotAsVelRef;
        } else {
            return undefined;
        }
    }

    /**
     * retrieve an expected type of VpcIntermedValBase from the visitor result
     */
    findChildAndCast<T extends VpcIntermedValBase>(ctor: AnyParameterCtor<T>, vals: IntermedMapOfIntermedVals, nm: string): O<T> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsT = got[0] as T;
            checkThrowEq(1, got.length, '7V|expected length 1');
            return gotAsT;
        } else {
            return undefined;
        }
    }
}
