
/* auto */ import { ChvITk } from './../codeparse/vpcTokens';
/* auto */ import { VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { last } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * in the original product you can write a one-line if like this,
 *       'if true then put 1+1 into x'
 * let's split it into different lines so it's easier to parse.
 */
export namespace VpcSplitSingleLineIf {
    export function go(line: ChvITk[], rw: VpcSuperRewrite): ChvITk[][] {
        checkThrowEq('if', line[0].image, '');
        let findThen = rw.searchTokenGivenEnglishTermInParensLevel(0, line, line[0], 'then');
        checkThrow(findThen !== -1, 'if statement, no "then" found');
        if (findThen === line.length - 1) {
            /* already on different lines, we are fine */
            return [line];
        } else {
            let firstPart = line.slice(0, findThen + 1);
            let secondPart = line.slice(findThen + 1);
            let template = `
%ARG0%
    %ARG1%
end if`;
            return rw.gen(template, line[0], [firstPart, secondPart]);
        }
    }
}

/**
 * get rid of else-if clauses, they don't support custom function calls
 * (which we expand into multiple lines)
 * also, at runtime, they require the framestack to have more state
 * (remembering if a clause has been taken) so it's more complex.
 * ideally this one needs access to the entire array.
 */
export namespace VpcRewriteNoElseIfClauses {
    /**
     * we'll build the code into a tree structure,
     * then walk the tree recursively to flatten it.
     */
    export function go(tree:TreeBuilder, rw: VpcSuperRewrite) {
        let ret: ChvITk[][] = [];
        flattenTreeRecurse(tree.root, rw, ret);
        return ret;
    }

    function isLineEndIf(l: ChvITk[]) {
        return l.length === 2 && l[0].image === 'end' && l[1].image === 'if';
    }

    function isLineIf(l: ChvITk[]) {
        if (l.length >= 1 && l[0].image === 'if') {
            checkThrow(l.length >= 3, "expect line starting with if to be 'if condition then'");
            checkThrowEq('then', last(l).image, "expect line starting with else to be 'if condition *then*'");
            return l.slice(1, -1);
        }

        return undefined;
    }

    function isLineElsePlain(l: ChvITk[]) {
        return l.length === 1 && l[0].image === 'else';
    }

    function isLineElseCondition(l: ChvITk[]) {
        if (l.length > 1 && l[0].image === 'else') {
            checkThrow(l.length >= 4, "expect line starting with else to be 'else if condition then'");
            checkThrowEq('if', l[1].image, "expect line starting with else to be 'else *if* condition then'");
            checkThrowEq('then', last(l).image, "expect line starting with else to be 'else if condition *then*'");
            return l.slice(2, -1);
        }
        return undefined;
    }

    class IfConstructClause {
        children: (ChvITk[] | IfConstruct)[] = [];
        constructor(public condition: ChvITk[], public isFirst: boolean) {}
    }

    class IfConstruct {
        clauses: IfConstructClause[];
        hasSeenPlainElse = false;
        isRoot = false;
        constructor(public parent: O<IfConstruct>) {}
    }

    /**
     * make a tree, where each if statement has clauses,
     * and each clause has either lines of code or if statements.
     * no transformations applied yet - the IfConstruct
     * will match 1-1 with the input code
     */
    export class TreeBuilder {
        root = new IfConstruct(undefined);
        current = this.root
        constructor() {
            this.root.isRoot = true;
            this.root.clauses = [new IfConstructClause([], true)];
        }

        addLine(line:ChvITk[]) {
            let arisLineIf = isLineIf(line);
            let arisLineElseCondition = isLineElseCondition(line);
            if (arisLineIf) {
                let clause = new IfConstructClause(arisLineIf, true);
                let construct = new IfConstruct(this.current);
                construct.clauses = [clause];
                last(this.current.clauses).children.push(construct);
                this.current = construct;
            } else if (arisLineElseCondition) {
                checkThrow(!this.current.isRoot, 'else outside of if?');
                checkThrow(!this.current.hasSeenPlainElse, "can't have conditional else after plain else");
                let clause = new IfConstructClause(arisLineElseCondition, false);
                this.current.clauses.push(clause);
            } else if (isLineElsePlain(line)) {
                this.current.hasSeenPlainElse = true;
                let clause = new IfConstructClause([], false);
                this.current.clauses.push(clause);
            } else if (isLineEndIf(line)) {
                checkThrow(!this.current.isRoot && this.current.parent, "can't have an end if outside an if");
                this.current = this.current.parent;
            } else {
                last(this.current.clauses).children.push(line);
            }
        }
    }

    /**
     * flatten the tree, and while doing so,
     * write out the clauses as separate if statements.
     */
    function flattenTreeRecurse(node: IfConstruct, rw: VpcSuperRewrite, output: ChvITk[][]) {
        let numberOfEndIfsNeeded = 0;
        if (!node.isRoot) {
            let firstLine = rw.gen('if %ARG0% then', node.clauses[0].condition[0], [node.clauses[0].condition]);
            output.push(firstLine[0]);
            numberOfEndIfsNeeded = 1;
        }
        for (let clause of node.clauses) {
            if (!clause.isFirst) {
                if (clause.condition.length) {
                    output.push([rw.tokenFromEnglishTerm('else', node.clauses[0].condition[0])]);
                    let line = rw.gen('if %ARG0% then', clause.condition[0], [clause.condition]);
                    output.push(line[0]);
                    numberOfEndIfsNeeded += 1;
                } else {
                    output.push([rw.tokenFromEnglishTerm('else', node.clauses[0].condition[0])]);
                }
            }
            for (let item of clause.children) {
                if (item instanceof IfConstruct) {
                    flattenTreeRecurse(node, rw, output);
                } else {
                    output.push(item);
                }
            }
        }

        for (let i = 0; i < numberOfEndIfsNeeded; i++) {
            output.push([
                rw.tokenFromEnglishTerm('end', node.clauses[0].condition[0]),
                rw.tokenFromEnglishTerm('if', node.clauses[0].condition[0])
            ]);
        }
    }
}
