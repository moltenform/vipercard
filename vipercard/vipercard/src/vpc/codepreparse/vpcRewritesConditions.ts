
/* auto */ import { ChvITk } from './../codeparse/vpcTokens';
/* auto */ import { VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { O, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { checkThrowEq, last } from './../../ui512/utils/util512';

export namespace VpcRewritesConditions {
    export function splitSinglelineIf(line: ChvITk[], rw:VpcSuperRewrite): ChvITk[][] {
        checkThrowEq('if', line[0].image, '');
        let findThen = rw.searchTokenGivenEnglishTermInParensLevel(0, line, line[0], 'then');
        checkThrow(findThen !== -1, 'if statement, no "then" found');
        if (findThen === line.length - 1) {
            // already on different lines, we are fine
            return [line];
        } else {
            let firstPart = line.slice(0, findThen + 1);
            let secondPart = line.slice(findThen + 1);
            let template = `
%ARG0%
    %ARG1%
end if`;
            return rw.go(template, line[0], [firstPart, secondPart]);
        }
    }
}

export namespace VpcRewritesConditionsNoElseIfClauses {
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
    function buildTree(lines: ChvITk[][]) {
        let root = new IfConstruct(undefined);
        root.isRoot = true;
        root.clauses = [new IfConstructClause([], true)];
        let current = root;
        for (let line of lines) {
            let arisLineIf = isLineIf(line);
            let arisLineElseCondition = isLineElseCondition(line);
            if (arisLineIf) {
                let clause = new IfConstructClause(arisLineIf, true);
                let construct = new IfConstruct(current);
                construct.clauses = [clause];
                last(current.clauses).children.push(construct);
                current = construct;
            } else if (arisLineElseCondition) {
                checkThrow(!current.isRoot, 'else outside of if?');
                checkThrow(!current.hasSeenPlainElse, "can't have conditional else after plain else");
                let clause = new IfConstructClause(arisLineElseCondition, false);
                current.clauses.push(clause);
            } else if (isLineElsePlain(line)) {
                current.hasSeenPlainElse = true;
                let clause = new IfConstructClause([], false);
                current.clauses.push(clause);
            } else if (isLineEndIf(line)) {
                checkThrow(!current.isRoot && current.parent, "can't have an end if outside an if");
                current = current.parent;
            } else {
                last(current.clauses).children.push(line);
            }
        }
        return root;
    }

    function transformTreeRecurse(node: IfConstruct, rw:VpcSuperRewrite, output: ChvITk[][]) {
        let numberOfEndIfsNeeded = 0;
        if (!node.isRoot) {
            let firstLine = rw.go('if %ARG0% then', node.clauses[0].condition[0], [node.clauses[0].condition]);
            output.push(firstLine[0]);
            numberOfEndIfsNeeded = 1;
        }
        for (let clause of node.clauses) {
            if (!clause.isFirst) {
                if (clause.condition.length) {
                    output.push([rw.tokenFromEnglishTerm('else', node.clauses[0].condition[0])]);
                    let line = rw.go('if %ARG0% then', clause.condition[0], [clause.condition]);
                    output.push(line[0]);
                    numberOfEndIfsNeeded += 1;
                } else {
                    output.push([rw.tokenFromEnglishTerm('else', node.clauses[0].condition[0])]);
                }
            }
            for (let item of clause.children) {
                if (item instanceof IfConstruct) {
                    transformTreeRecurse(node, rw, output);
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

    export function goNoElseIfClauses(lines: ChvITk[][], rw:VpcSuperRewrite) {
        let construct = buildTree(lines);
        let ret: ChvITk[][] = [];
        transformTreeRecurse(construct, rw, ret);
        return ret;
    }
}

function testonly() {
    /*
    if 0 == 0 then
        if 1 == 1 then
            if 1a == 1a then
            else if 2a == 2a then
            else if 3a == 3a then
            end if
        else if 2 == 2 then
            if 1b == 1b then
            else if 2b == 2b then
            else if 3b == 3b then
            end if
        else if 3 == 3 then
            if 1c == 1c then
            else if 2c == 2c then
            else if 3c == 3c then
            end if
        end if
    else
        if 1 == 1 then
            if 1d == 1d then
            else if 2d == 2d then
            else if 3d == 3d then
            end if
        else if 2 == 2 then
            if 1e == 1e then
            else if 2e == 2e then
            else if 3e == 3e then
            end if
        else if 3 == 3 then
            if 1f == 1f then
            else if 2f == 2f then
            else if 3f == 3f then
            end if
        end if
    end if

    */
}
