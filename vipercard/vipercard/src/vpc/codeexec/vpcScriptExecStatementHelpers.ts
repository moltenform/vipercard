
/* auto */ import { IntermedMapOfIntermedVals, VpcVal } from './../vpcutils/vpcVal';
/* auto */ import { VpcCodeLine } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { assertTrue, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { isString } from './../../ui512/utils/util512';

export class VpcScriptExecuteStatementHelpers {
    outside: OutsideWorldReadWrite;

    

    /**
     * click, drag implementation
     */
    clickOrDrag(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, expectSee: string) {
        let nm = 'RuleLvl4Expression';
        let argsGiven: number[] = [];
        let ar = vals.vals[nm];
        if (ar && ar.length) {
            let arVals = ar as VpcVal[];
            for (let i = 0, len = arVals.length; i < len; i++) {
                let item = arVals[i];
                assertTrue(item instanceof VpcVal, 'JO|every item must be a vpcval');
                argsGiven.push(item.readAsStrictInteger());
            }
        }

        checkThrow(argsGiven.length > 1, 'JN|not enough args');
        let mods = ModifierKeys.None;
        let allIdentifiers = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
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
     * get all child strings
     */
    getAllChildStrs(vals: IntermedMapOfIntermedVals, nm: string, atLeastOne: boolean): string[] {
        let ret: string[] = [];
        if (vals.vals[nm]) {
            for (let i = 0, len = vals.vals[nm].length; i < len; i++) {
                let child = vals.vals[nm][i];
                checkThrow(isString(child), '7T|');
                ret.push(child);
            }
        } else {
            checkThrow(!atLeastOne, '7S|no child');
        }

        return ret;
    }
}
