
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';

export class VpcScriptExecuteStatementHelpers {
    outside: OutsideWorldReadWrite;

    /**
     * implementation of add, subtract, etc
     */
    goMathAlter(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, fn: (a: number, b: number) => number) {
        let val = throwIfUndefined(this.findChildVal(vals, 'RuleLvl1Expression'), '5M|');
        let container = throwIfUndefined(this.findChildOther(RequestedContainerRef, vals, 'RuleHContainer'), '5L|');

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
}
