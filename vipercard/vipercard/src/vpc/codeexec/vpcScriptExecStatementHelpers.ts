
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { VpcScriptMessage } from './../vpcutils/vpcUtils';
/* auto */ import { ChvITk, tks, tkstr } from './../codeparse/vpcTokens';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcCodeLine } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { checkThrow, checkThrowEq, checkThrowInternal } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../../ui512/utils/util512Assert';
/* auto */ import { AnyParameterCtor, cast } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* see the section in internaldocs.md to read how we execute code. */

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
            /* follow original product, treat empty string as 0 */
            let f1 = s ? VpcValS(s).readAsStrictNumeric() : 0;
            let f2 = val.readAsStrictNumeric();
            let res = fn(f1, f2);
            return VpcValN(res).readAsString();
        };

        this.outside.ContainerModify(container, getResultAsString);
    }

    /**
     * click, drag implementation
     */
    clickOrDrag(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, expectSee: string, msg: VpcScriptMessage) {
        let argsGiven: number[] = [];
        checkThrow(
            vals.vals[tkstr.RuleHBuiltinCmdDrag_1] && vals.vals[tkstr.RuleHBuiltinCmdDrag_1].length,
            'R>|no RuleHBuiltinCmdDrag_1'
        );
        for (let big of vals.vals[tkstr.RuleHBuiltinCmdDrag_1]) {
            let a1 = cast(IntermedMapOfIntermedVals, big);
            for (let item of a1.vals[tkstr.RuleLvl4Expression]) {
                assertTrue(item instanceof VpcVal, 'JO|every item must be a vpcval');
                /* confirmed in emulator that floats are not accepted here */
                let coords = item.isIntegerList(2);
                if (coords) {
                    argsGiven = argsGiven.concat(coords);
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
        if (msg && argsGiven.length >= 2) {
            checkThrowInternal(msg instanceof VpcScriptMessage, 'VK|wrong type');
            /* add click to the pr's click tracking.
            confirmed in emulator that it uses first coordinates.
            don't update lastSeenClickId--
            we should update clickLoc() but not mouseClick() */
            msg.clickLoc[0] = argsGiven[0];
            msg.clickLoc[1] = argsGiven[1];
        }
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
            checkThrowEq(1, got.length, '7d|expected length 1');
            let gotAsMap = got[0];
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
            checkThrowEq(1, got.length, '7b|expected length 1');
            let gotAsVal = got[0];
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
            checkThrowEq(1, got.length, '7X|expected length 1');
            let gotAsVelRef = got[0];
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

    /**
     * if a literal, return the literal, otherwise treat it as a variable
     */
    getValAsLiteralOrVar(tk: ChvITk): string {
        if (tk.tokenType === tks.tkStringLiteral) {
            return tk.image.slice(1, -1);
        } else if (tk.tokenType === tks.tkNumLiteral) {
            return tk.image;
        } else {
            return this.outside.ReadVarContents(tk.image).readAsString();
        }
    }
}
