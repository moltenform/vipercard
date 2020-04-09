
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
}
