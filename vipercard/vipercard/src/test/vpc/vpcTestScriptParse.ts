
/* auto */ import { assertTrue, cProductName, makeVpcScriptErr, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ChvLexer } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { tks, tokenType } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { VpcChvParser } from '../../vpc/codeparse/vpcParser.js';
/* auto */ import { getParsingObjects } from '../../vpc/codeparse/vpcVisitor.js';

declare var saveAs: any;

export class TestVpcParsing extends UI512TestBase {
    lexer: ChvLexer;
    parser: VpcChvParser;
    visitor: Object;
    constructor() {
        super();
        [this.lexer, this.parser, this.visitor] = getParsingObjects();
        assertTrue(this.lexer, '1<|bad input');
        assertTrue(this.parser, '1;|bad input');
    }

    testExp(sInput: string, sExpected: string) {
        return this.testParse('get ' + sInput, 'RuleBuiltinCmdGet', sExpected, '');
    }

    assertFailsParseExp(sInput: string, sErrExpected: string) {
        return this.testParse('get ' + sInput, 'RuleBuiltinCmdGet', '', sErrExpected);
    }

    testCmdSet(sInput: string, sExpected: string) {
        assertTrue(sInput.startsWith('set '), '1:|expected start with set');
        return this.testParse(sInput, 'RuleBuiltinCmdSet', sExpected, '');
    }

    assertFailsCmdSet(sInput: string, sErrExpected: string) {
        assertTrue(sInput.startsWith('set '), '1/|expected start with set');
        return this.testParse(sInput, 'RuleBuiltinCmdSet', '', sErrExpected);
    }

    testCmd(sInput: string, sExpected: string) {
        let sCmd = sInput.split(' ')[0];
        assertTrue(sInput.startsWith(sCmd + ' '), '1.|expected start with ' + sCmd);
        let firstCapital = sCmd[0].toUpperCase() + sCmd.slice(1);
        firstCapital = firstCapital === 'Go' ? 'GoCard' : firstCapital;
        return this.testParse(sInput, 'RuleBuiltinCmd' + firstCapital, sExpected, '');
    }

    assertFailsCmd(sInput: string, sErrExpected: string) {
        let sCmd = sInput.split(' ')[0];
        assertTrue(sInput.startsWith(sCmd + ' '), '1-|expected start with ' + sCmd);
        let firstCapital = sCmd[0].toUpperCase() + sCmd.slice(1);
        firstCapital = firstCapital === 'Go' ? 'GoCard' : firstCapital;
        return this.testParse(sInput, 'RuleBuiltinCmd' + firstCapital, '', sErrExpected);
    }

    protected testParse(sInput: string, sTopRule: string, sExpected: string, sErrExpected: string) {
        let lexResult = this.lexer.tokenize(sInput);
        assertTrue(!lexResult.errors.length, `1,|${lexResult.errors[0]}`);
        this.parser.input = lexResult.tokens;
        let cst = Util512.callAsMethodOnClass('parser', this.parser, sTopRule, [], false);
        if (this.parser.errors.length) {
            if (sErrExpected.length) {
                if (sErrExpected === 'GETTING') {
                    let got = this.parser.errors[0]
                        .toString()
                        .substr(0, 50)
                        .split('\r')[0]
                        .split('\n')[0];
                    console.error(`for input ${sInput} got\n${got}`);
                    return;
                }

                assertTrue(
                    scontains(this.parser.errors[0].toString(), sErrExpected),
                    `1+|for input ${sInput} got different failure message, expected ${sErrExpected} ${
                        this.parser.errors
                    }`
                );
                return;
            } else {
                assertTrue(false, `1*|for input ${sInput} got parse errors ${this.parser.errors}`);
            }
        } else {
            if (sErrExpected.length > 0) {
                let got = this.flattenParseTree(cst);
                assertTrue(false, `1)|for input ${sInput} expected failure but succeeded (${got}).`);
            }
        }

        let flattened = this.flattenParseTree(cst);
        sExpected = sExpected.replace(/\r\n/g, '\n');
        sExpected = sExpected.replace(/\t/g, '    ');
        flattened = flattened.substr((sTopRule + '(').length - 'Rule'.length);
        if (sTopRule === 'RuleBuiltinCmdGet') {
            flattened = flattened.substr(0, flattened.length - ` $get )`.length);
        } else if (sTopRule === 'RuleBuiltinCmdSet') {
            let indexOfSet = flattened.indexOf('$set');
            assertTrue(indexOfSet !== -1, '1(|expected $set in output');
            flattened = flattened.substr(0, indexOfSet + '$set'.length);
        }

        flattened = flattened
            .split('\n')
            .map(s => s.substr(4))
            .join('\n');
        flattened = flattened.trim();

        // assertEq(sExpected, flattened, '1&|')
        if (sExpected.replace(/ /g, '') !== flattened.replace(/ /g, '')) {
            console.error(`err--for ${sInput} we got \n${flattened}\n`);
        }
    }

    skipPrintingIfNotSet: { [key: string]: [[string, number], [string, number]] } = {
        RuleExpr: [['RuleLvl1Expression', 1], ['RuleLvl1Expression', 0]],
        RuleLvl1Expression: [['RuleLvl2Expression', 1], ['RuleLvl2Expression', 0]],
        RuleLvl2Expression: [['RuleLvl2Sub', 0], ['RuleLvl3Expression', 0]],
        RuleLvl3Expression: [['RuleLvl4Expression', 1], ['RuleLvl4Expression', 0]],
        RuleLvl4Expression: [['RuleLvl5Expression', 1], ['RuleLvl5Expression', 0]],
        RuleLvl5Expression: [['RuleLvl6Expression', 1], ['RuleLvl6Expression', 0]]
    };

    flattenParseTree(obj: any) {
        let formatRuleName = (s: string) => {
            if (s.startsWith('Rule')) {
                s = s.substr('Rule'.length);
            }

            s = s.replace(/Expression/g, 'Expr');
            return s;
        };

        let formatImage = (tk: any) => {
            if (tk.tokenType === tokenType(tks.TokenTkstringliteral)) {
                return ' ' + tk.image;
            } else if (tk.tokenType === tokenType(tks.TokenTkidentifier)) {
                return ' $' + tk.image;
            } else if (tk.tokenType === tokenType(tks.TokenTklparen) || tk.tokenType === tokenType(tks.TokenTkrparen)) {
                return ' "' + tk.image + '"';
            } else {
                return ' ' + tk.image;
            }
        };

        let flattenParseTreeRecurse = (current: any): string[] => {
            let skips = this.skipPrintingIfNotSet[current.name];
            const ch = current.children;
            if (skips) {
                // make the output shorter, only showing the expression chain if it adds anything new
                let [important, fallback] = skips;
                if (!ch[important[0]][important[1]]) {
                    assertTrue(ch[fallback[0]], `1%|${current.name} ${fallback[0]}`);
                    assertTrue(ch[fallback[0]][fallback[1]], `1$|${current.name} ${fallback}`);
                    return flattenParseTreeRecurse(ch[fallback[0]][fallback[1]]);
                }
            } else if (current.name === 'RuleLvl6Expression') {
                // make the output shorter, only showing a Lvl6Expression if it adds anything new
                if (!ch.TokenTkplusorminus[0] && !ch.TokenNot[0] && !ch.RuleHChunk[0]) {
                    if (ch.RuleExprSource[0]) {
                        return flattenParseTreeRecurse(ch.RuleExprSource[0]);
                    }
                }
            }

            let keys = Object.keys(ch);
            keys.sort();
            let ret = [];
            ret.push(formatRuleName(current.name) + '(');
            for (let key of keys) {
                for (let i = 0; i < ch[key].length; i++) {
                    if (ch[key][i].image) {
                        ret[ret.length - 1] += formatImage(ch[key][i]);
                    } else if (ch[key][i].children) {
                        let newret = flattenParseTreeRecurse(ch[key][i]);
                        ret = ret.concat(newret.map(s => '    ' + s));
                    } else {
                        assertTrue(false, '1#|unknown entitity, not token or subrule?');
                    }
                }
            }

            ret[ret.length - 1] += ' )';
            return ret;
        };

        return flattenParseTreeRecurse(obj).join('\n');
    }

    tests = [
        'test_parse_simpleExpressions',
        () => {
            this.testExp('4', `ExprSource( 4 )`);
            this.testExp(
                '1+2',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                '1 + 2',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                '011  +  02.2',
                `Lvl4Expr(
    ExprSource( 011 )
    ExprSource( 02.2 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                '11  +  (2 * 3)',
                `Lvl4Expr(
    ExprSource( 11 )
    Lvl6Expr(
        Lvl5Expr(
            ExprSource( 2 )
            ExprSource( 3 )
            OpMultDivideExpDivMod( * ) ) "(" ")" )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                '11  *  (2 + 3)',
                `Lvl5Expr(
    ExprSource( 11 )
    Lvl6Expr(
        Lvl4Expr(
            ExprSource( 2 )
            ExprSource( 3 )
            OpPlusMinus( + ) ) "(" ")" )
    OpMultDivideExpDivMod( * ) )`
            );

            this.assertThrows('', 'expect throw', () => {
                throw makeVpcScriptErr(`1!|a tip: these tests intentionally throw exceptions,
                    so you should set debugger to break on 'Uncaught Exceptions' not 'All Exceptions'. expect throw`);
            });

            // lexing should take care of this
            this.testExp(
                '1 + \\\n2',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                '1 + \\\n\\\n2',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                '1 + \\\n    \\\n2',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
            );
            this.assertFailsParseExp('1 + \n 2', 'NoViableAltException: Expecting: one of these');
            this.assertFailsParseExp('1 + \\\n\n 2', 'NoViableAltException: Expecting: one of these');
        },
        'test_parse_unaryMinusAndSubtraction',
        () => {
            this.testExp(
                '1-2-3',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpPlusMinus( - )
    OpPlusMinus( - ) )`
            );
            this.testExp(
                '1 - 2 - 3',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpPlusMinus( - )
    OpPlusMinus( - ) )`
            );
            this.testExp(
                '1.0-2.0-3.0',
                `Lvl4Expr(
    ExprSource( 1.0 )
    ExprSource( 2.0 )
    ExprSource( 3.0 )
    OpPlusMinus( - )
    OpPlusMinus( - ) )`
            );
            this.testExp(
                '(1)-(2)-(3)',
                `Lvl4Expr(
    Lvl6Expr(
        ExprSource( 1 ) "(" ")" )
    Lvl6Expr(
        ExprSource( 2 ) "(" ")" )
    Lvl6Expr(
        ExprSource( 3 ) "(" ")" )
    OpPlusMinus( - )
    OpPlusMinus( - ) )`
            );
            this.testExp(
                '(1)- -(2)- -(3)',
                `Lvl4Expr(
    Lvl6Expr(
        ExprSource( 1 ) "(" ")" )
    Lvl6Expr(
        ExprSource( 2 ) "(" - ")" )
    Lvl6Expr(
        ExprSource( 3 ) "(" - ")" )
    OpPlusMinus( - )
    OpPlusMinus( - ) )`
            );
            this.testExp(
                '- 1 - - 2 - - 3- -4',
                `Lvl4Expr(
    Lvl6Expr(
        ExprSource( 1 ) - )
    Lvl6Expr(
        ExprSource( 2 ) - )
    Lvl6Expr(
        ExprSource( 3 ) - )
    Lvl6Expr(
        ExprSource( 4 ) - )
    OpPlusMinus( - )
    OpPlusMinus( - )
    OpPlusMinus( - ) )`
            );
        },
        'test_parse_everyLevelOfExpression',
        () => {
            this.testExp(
                'true and false',
                `Expr(
    ExprSource(
        HSimpleContainer( $true ) )
    ExprSource(
        HSimpleContainer( $false ) )
    OpLogicalOrAnd( and ) )`
            );
            this.testExp(
                'true and false or true',
                `Expr(
    ExprSource(
        HSimpleContainer( $true ) )
    ExprSource(
        HSimpleContainer( $false ) )
    ExprSource(
        HSimpleContainer( $true ) )
    OpLogicalOrAnd( and )
    OpLogicalOrAnd( or ) )`
            );
            this.testExp(
                '1 > 2',
                `Lvl1Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpEqualityGreaterLessOrContains( > ) )`
            );
            this.testExp(
                '1 > 2 != 3',
                `Lvl1Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpEqualityGreaterLessOrContains( > )
    OpEqualityGreaterLessOrContains( != ) )`
            );
            this.testExp(
                'x contains y',
                `Lvl1Expr(
    ExprSource(
        HSimpleContainer( $x ) )
    ExprSource(
        HSimpleContainer( $y ) )
    OpEqualityGreaterLessOrContains( contains ) )`
            );
            this.testExp(
                'x contains y contains z',
                `Lvl1Expr(
    ExprSource(
        HSimpleContainer( $x ) )
    ExprSource(
        HSimpleContainer( $y ) )
    ExprSource(
        HSimpleContainer( $z ) )
    OpEqualityGreaterLessOrContains( contains )
    OpEqualityGreaterLessOrContains( contains ) )`
            );
            this.testExp(
                'x is not a number',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2TypeCheck( number $a ) not )
    ExprSource(
        HSimpleContainer( $x ) ) is )`
            );
            this.testExp(
                'x is not a number is a point',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2TypeCheck( number $a ) not )
    Lvl2Sub(
        Lvl2TypeCheck( $a $point ) )
    ExprSource(
        HSimpleContainer( $x ) ) is is )`
            );
            this.testExp(
                '1 is not in 2',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            ExprSource( 2 ) in ) not )
    ExprSource( 1 ) is )`
            );
            this.testExp(
                '1 is not in 2 is in 3',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            ExprSource( 2 ) in ) not )
    Lvl2Sub(
        Lvl2Within(
            ExprSource( 3 ) in ) )
    ExprSource( 1 ) is is )`
            );
            this.testExp(
                'x is not within y',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            ExprSource(
                HSimpleContainer( $y ) ) within ) not )
    ExprSource(
        HSimpleContainer( $x ) ) is )`
            );
            this.testExp(
                'x is not within y is within z',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            ExprSource(
                HSimpleContainer( $y ) ) within ) not )
    Lvl2Sub(
        Lvl2Within(
            ExprSource(
                HSimpleContainer( $z ) ) within ) )
    ExprSource(
        HSimpleContainer( $x ) ) is is )`
            );
            this.testExp(
                '1 is not 2',
                `Lvl2Expr(
    Lvl2Sub(
        ExprSource( 2 ) not )
    ExprSource( 1 ) is )`
            );
            this.testExp(
                '1 is not 2 is 3',
                `Lvl2Expr(
    Lvl2Sub(
        ExprSource( 2 ) not )
    Lvl2Sub(
        ExprSource( 3 ) )
    ExprSource( 1 ) is is )`
            );
            this.testExp(
                'x && y',
                `Lvl3Expr(
    ExprSource(
        HSimpleContainer( $x ) )
    ExprSource(
        HSimpleContainer( $y ) )
    OpStringConcat( && ) )`
            );
            this.testExp(
                'x && y & z',
                `Lvl3Expr(
    ExprSource(
        HSimpleContainer( $x ) )
    ExprSource(
        HSimpleContainer( $y ) )
    ExprSource(
        HSimpleContainer( $z ) )
    OpStringConcat( && )
    OpStringConcat( & ) )`
            );
            this.testExp(
                '1 + 2',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                '1 + 2 - 3',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpPlusMinus( + )
    OpPlusMinus( - ) )`
            );
            this.testExp(
                '1 * 2',
                `Lvl5Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpMultDivideExpDivMod( * ) )`
            );
            this.testExp(
                '1 * 2 / 3',
                `Lvl5Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpMultDivideExpDivMod( * )
    OpMultDivideExpDivMod( / ) )`
            );
            this.testExp(
                'not true',
                `Lvl6Expr(
    ExprSource(
        HSimpleContainer( $true ) ) not )`
            );
            this.testExp(
                '- (1)',
                `Lvl6Expr(
    ExprSource( 1 ) "(" - ")" )`
            );

            // cases that should fail
            this.assertFailsParseExp(`(1`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsParseExp(`1(`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`1*`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`1-`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`1()`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`()1`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`()`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(``, `NoViableAltException: Expecting: one of these poss`);

            // we don't want two consecutive TkIdentifiers to be a valid expression,
            // not that important but it makes parsing more streamlined.
            this.assertFailsParseExp(`var1 var2`, `NotAllInputParsedException: Redundant input, expec`);

            // we don't want points to be a valid expression in general,
            // I just think it's a good idea
            this.assertFailsParseExp(`1, 2`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`var1, var2`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`(1, 2)`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsParseExp(`(1, 2, 3)`, `MismatchedTokenException: Expecting token of type `);

            // let's not accept these either
            this.assertFailsParseExp(`1 2`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`1 2 3`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`(1 2)`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsParseExp(`(1 2 3)`, `MismatchedTokenException: Expecting token of type `);
        },
        'test_parse_expressionPrecedence',
        () => {
            // for 1+2*3
            // I call this "lower to higher", the first operator in the input string ("+") is done last.
            // for 1*2+3
            // I call this "higher to lower", the first operator in the input string ("*") is done first.
            // lvl0 to higher
            this.testExp(
                '1 and 2 is not a number',
                `Expr(
    ExprSource( 1 )
    Lvl2Expr(
        Lvl2Sub(
            Lvl2TypeCheck( number $a ) not )
        ExprSource( 2 ) is )
    OpLogicalOrAnd( and ) )`
            );
            this.testExp(
                '1 and 2 mod 3',
                `Expr(
    ExprSource( 1 )
    Lvl5Expr(
        ExprSource( 2 )
        ExprSource( 3 )
        OpMultDivideExpDivMod( mod ) )
    OpLogicalOrAnd( and ) )`
            );
            this.testExp(
                'not 1 and 2',
                `Expr(
    Lvl6Expr(
        ExprSource( 1 ) not )
    ExprSource( 2 )
    OpLogicalOrAnd( and ) )`
            );
            // lvl 1 to higher
            this.testExp(
                '1 > 2 is within "a"',
                `Lvl1Expr(
    ExprSource( 1 )
    Lvl2Expr(
        Lvl2Sub(
            Lvl2Within(
                ExprSource( "a" ) within ) )
        ExprSource( 2 ) is )
    OpEqualityGreaterLessOrContains( > ) )`
            );
            this.testExp(
                '1 > 2 && "a"',
                `Lvl1Expr(
    ExprSource( 1 )
    Lvl3Expr(
        ExprSource( 2 )
        ExprSource( "a" )
        OpStringConcat( && ) )
    OpEqualityGreaterLessOrContains( > ) )`
            );
            this.testExp(
                'not 1>2',
                `Lvl1Expr(
    Lvl6Expr(
        ExprSource( 1 ) not )
    ExprSource( 2 )
    OpEqualityGreaterLessOrContains( > ) )`
            );
            // lvl 1 to lower
            this.testExp(
                '1 > 2 and 3',
                `Expr(
    Lvl1Expr(
        ExprSource( 1 )
        ExprSource( 2 )
        OpEqualityGreaterLessOrContains( > ) )
    ExprSource( 3 )
    OpLogicalOrAnd( and ) )`
            );
            // lvl 2 to higher
            this.testExp(
                '1 is in 2 + 3',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            Lvl4Expr(
                ExprSource( 2 )
                ExprSource( 3 )
                OpPlusMinus( + ) ) in ) )
    ExprSource( 1 ) is )`
            );
            this.testExp(
                '1 is 2 mod 3',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl5Expr(
            ExprSource( 2 )
            ExprSource( 3 )
            OpMultDivideExpDivMod( mod ) ) )
    ExprSource( 1 ) is )`
            );
            // path "is a number" terminates, confirmed is consisent with the emulator.
            this.assertFailsParseExp(`1 is a number & 2`, `NotAllInputParsedException: Redundant input, expecting EOF`);

            // lvl 2 to lower
            this.testExp(
                '1 is a number > 2',
                `Lvl1Expr(
    Lvl2Expr(
        Lvl2Sub(
            Lvl2TypeCheck( number $a ) )
        ExprSource( 1 ) is )
    ExprSource( 2 )
    OpEqualityGreaterLessOrContains( > ) )`
            );
            this.testExp(
                '1 is in 2 contains 3',
                `Lvl1Expr(
    Lvl2Expr(
        Lvl2Sub(
            Lvl2Within(
                ExprSource( 2 ) in ) )
        ExprSource( 1 ) is )
    ExprSource( 3 )
    OpEqualityGreaterLessOrContains( contains ) )`
            );
            this.testExp(
                '1 is 2 or 3',
                `Expr(
    Lvl2Expr(
        Lvl2Sub(
            ExprSource( 2 ) )
        ExprSource( 1 ) is )
    ExprSource( 3 )
    OpLogicalOrAnd( or ) )`
            );
            // lvl 3 to higher
            this.testExp(
                `"a" && "b" + 1`,
                `Lvl3Expr(
    ExprSource( "a" )
    Lvl4Expr(
        ExprSource( "b" )
        ExprSource( 1 )
        OpPlusMinus( + ) )
    OpStringConcat( && ) )`
            );
            this.testExp(
                `"a" & "b" div 1`,
                `Lvl3Expr(
    ExprSource( "a" )
    Lvl5Expr(
        ExprSource( "b" )
        ExprSource( 1 )
        OpMultDivideExpDivMod( div ) )
    OpStringConcat( & ) )`
            );
            // lvl 3 to lower
            this.testExp(
                `"a" && "b" is a number`,
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2TypeCheck( number $a ) )
    Lvl3Expr(
        ExprSource( "a" )
        ExprSource( "b" )
        OpStringConcat( && ) ) is )`
            );
            this.testExp(
                `("a" is a number) && "b"`,
                `Lvl3Expr(
    Lvl6Expr(
        Lvl2Expr(
            Lvl2Sub(
                Lvl2TypeCheck( number $a ) )
            ExprSource( "a" ) is ) "(" ")" )
    ExprSource( "b" )
    OpStringConcat( && ) )`
            );
            this.testExp(
                `"a" & "b" > 1`,
                `Lvl1Expr(
    Lvl3Expr(
        ExprSource( "a" )
        ExprSource( "b" )
        OpStringConcat( & ) )
    ExprSource( 1 )
    OpEqualityGreaterLessOrContains( > ) )`
            );
            // lvl 4 to higher
            this.testExp(
                `1 + 2 * 3`,
                `Lvl4Expr(
    ExprSource( 1 )
    Lvl5Expr(
        ExprSource( 2 )
        ExprSource( 3 )
        OpMultDivideExpDivMod( * ) )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                `1 - 2 div 3`,
                `Lvl4Expr(
    ExprSource( 1 )
    Lvl5Expr(
        ExprSource( 2 )
        ExprSource( 3 )
        OpMultDivideExpDivMod( div ) )
    OpPlusMinus( - ) )`
            );
            // lvl 4 to lower
            this.testExp(
                `1 + 2 is 3`,
                `Lvl2Expr(
    Lvl2Sub(
        ExprSource( 3 ) )
    Lvl4Expr(
        ExprSource( 1 )
        ExprSource( 2 )
        OpPlusMinus( + ) ) is )`
            );
            this.testExp(
                `1 - 2 is within 3`,
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            ExprSource( 3 ) within ) )
    Lvl4Expr(
        ExprSource( 1 )
        ExprSource( 2 )
        OpPlusMinus( - ) ) is )`
            );
            // lvl 5 to higher
            this.testExp(
                `not 1 * 2`,
                `Lvl5Expr(
    Lvl6Expr(
        ExprSource( 1 ) not )
    ExprSource( 2 )
    OpMultDivideExpDivMod( * ) )`
            );
            this.testExp(
                `- 1 mod 2`,
                `Lvl5Expr(
    Lvl6Expr(
        ExprSource( 1 ) - )
    ExprSource( 2 )
    OpMultDivideExpDivMod( mod ) )`
            );
            this.testExp(
                `1 * sin(2)`,
                `Lvl5Expr(
    ExprSource( 1 )
    ExprSource(
        FnCall(
            FnCallWithParens(
                ExprSource( 2 ) $sin "(" ")" ) ) )
    OpMultDivideExpDivMod( * ) )`
            );
            this.testExp(
                `1 * the result`,
                `Lvl5Expr(
    ExprSource( 1 )
    ExprSource(
        FnCall(
            FnCallWithoutParensOrGlobalGetPropOrTarget( the $result ) ) )
    OpMultDivideExpDivMod( * ) )`
            );
            this.testExp(
                `1 * the result * 2`,
                `Lvl5Expr(
    ExprSource( 1 )
    ExprSource(
        FnCall(
            FnCallWithoutParensOrGlobalGetPropOrTarget( the $result ) ) )
    ExprSource( 2 )
    OpMultDivideExpDivMod( * )
    OpMultDivideExpDivMod( * ) )`
            );
            // level 5 to lower
            this.testExp(
                `1 * 2 + 3`,
                `Lvl4Expr(
    Lvl5Expr(
        ExprSource( 1 )
        ExprSource( 2 )
        OpMultDivideExpDivMod( * ) )
    ExprSource( 3 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                `1 / 2 contains 3`,
                `Lvl1Expr(
    Lvl5Expr(
        ExprSource( 1 )
        ExprSource( 2 )
        OpMultDivideExpDivMod( / ) )
    ExprSource( 3 )
    OpEqualityGreaterLessOrContains( contains ) )`
            );
            // above level 5
            this.testExp(
                `1 * style of cd btn "a"`,
                `Lvl5Expr(
    ExprSource( 1 )
    ExprSource(
        ExprGetProperty(
            AnyPropertyName( $style )
            Object(
                ObjectBtn(
                    ExprSource( "a" ) btn cd ) ) of ) )
    OpMultDivideExpDivMod( * ) )`
            );
            this.testExp(
                `1 & the style of cd btn var & 2`,
                `Lvl3Expr(
    ExprSource( 1 )
    ExprSource(
        ExprGetProperty(
            AnyPropertyName( $style )
            Object(
                ObjectBtn(
                    ExprSource(
                        HSimpleContainer( $var ) ) btn cd ) ) the of ) )
    ExprSource( 2 )
    OpStringConcat( & )
    OpStringConcat( & ) )`
            );
            this.testExp(
                `1 & the length of var & 2`,
                `Lvl3Expr(
    ExprSource( 1 )
    ExprSource(
        FnCall(
            FnCall_Length(
                ExprSource(
                    HSimpleContainer( $var ) ) length the of ) ) )
    ExprSource( 2 )
    OpStringConcat( & )
    OpStringConcat( & ) )`
            );
            // parsed this way because btn names are <FACTOR>, not <ARITH>
            this.testExp(
                `cd btn 1 + 1`,
                `Lvl4Expr(
    ExprSource(
        HSimpleContainer(
            ObjectPart(
                ObjectBtn(
                    ExprSource( 1 ) btn cd ) ) ) )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
            );
            // parsed this way because btn names are <FACTOR>, not <ARITH>
            this.testExp(
                `not there is a cd btn the number of cds + 1`,
                `Lvl4Expr(
    Lvl6Expr(
        ExprSource(
            FnCall(
                ExprThereIs(
                    Object(
                        ObjectBtn(
                            ExprSource(
                                FnCall(
                                    FnCallNumberOf(
                                        FnCallNumberOf_3( cds ) number the of ) ) ) btn cd ) ) is there $a ) ) ) not )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
            );
            // high-level precedence
            this.testExp(
                `cd fld 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) cd fld ) ) ) )`
            );
            this.testExp(
                `cd fld 1 of cd (cd fld 1)`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 )
                ObjectCard(
                    Lvl6Expr(
                        ExprSource(
                            HSimpleContainer(
                                ObjectPart(
                                    ObjectFld(
                                        ExprSource( 1 ) cd fld ) ) ) ) "(" ")" ) cd )
                Of( of ) cd fld ) ) ) )`
            );
            this.testExp(
                `cd fld 1 of cd the result + 1`,
                `Lvl4Expr(
    ExprSource(
        HSimpleContainer(
            ObjectPart(
                ObjectFld(
                    ExprSource( 1 )
                    ObjectCard(
                        ExprSource(
                            FnCall(
                                FnCallWithoutParensOrGlobalGetPropOrTarget( the $result ) ) ) cd )
                    Of( of ) cd fld ) ) ) )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                `char 1 of "a" + 2`,
                `Lvl4Expr(
    Lvl6Expr(
        ExprSource( "a" )
        HChunk(
            HChunk_1(
                HChunkAmt( 1 ) )
            Of( of ) char ) )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                `char (1 + 2) of "a" + 3`,
                `Lvl4Expr(
    Lvl6Expr(
        ExprSource( "a" )
        HChunk(
            HChunk_1(
                HChunkAmt(
                    Lvl4Expr(
                        ExprSource( 1 )
                        ExprSource( 2 )
                        OpPlusMinus( + ) ) "(" ")" ) )
            Of( of ) char ) )
    ExprSource( 3 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                `char (char 1 of "a") of "b"`,
                `Lvl6Expr(
    ExprSource( "b" )
    HChunk(
        HChunk_1(
            HChunkAmt(
                Lvl6Expr(
                    ExprSource( "a" )
                    HChunk(
                        HChunk_1(
                            HChunkAmt( 1 ) )
                        Of( of ) char ) ) "(" ")" ) )
        Of( of ) char ) )`
            );
            this.testExp(
                `char (char 1 of (char 2 of "a")) of "b"`,
                `Lvl6Expr(
    ExprSource( "b" )
    HChunk(
        HChunk_1(
            HChunkAmt(
                Lvl6Expr(
                    Lvl6Expr(
                        ExprSource( "a" )
                        HChunk(
                            HChunk_1(
                                HChunkAmt( 2 ) )
                            Of( of ) char ) )
                    HChunk(
                        HChunk_1(
                            HChunkAmt( 1 ) )
                        Of( of ) char ) "(" ")" ) "(" ")" ) )
        Of( of ) char ) )`
            );
            this.testExp(
                `char (char (char 1 of "a") of "b") of "c"`,
                `Lvl6Expr(
    ExprSource( "c" )
    HChunk(
        HChunk_1(
            HChunkAmt(
                Lvl6Expr(
                    ExprSource( "b" )
                    HChunk(
                        HChunk_1(
                            HChunkAmt(
                                Lvl6Expr(
                                    ExprSource( "a" )
                                    HChunk(
                                        HChunk_1(
                                            HChunkAmt( 1 ) )
                                        Of( of ) char ) ) "(" ")" ) )
                        Of( of ) char ) ) "(" ")" ) )
        Of( of ) char ) )`
            );
        },
        'test_parse_partsOfExpressions',
        () => {
            // HChunk
            this.testExp(
                `word 1 of "a"`,
                `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HChunk_1(
            HChunkAmt( 1 ) )
        Of( of ) word ) )`
            );
            this.testExp(
                `word 1 to 2 of "a"`,
                `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HChunk_1(
            HChunkAmt( 1 )
            HChunkAmt( 2 ) to )
        Of( of ) word ) )`
            );
            this.testExp(
                `word (1+2) of "a"`,
                `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HChunk_1(
            HChunkAmt(
                Lvl4Expr(
                    ExprSource( 1 )
                    ExprSource( 2 )
                    OpPlusMinus( + ) ) "(" ")" ) )
        Of( of ) word ) )`
            );
            this.testExp(
                `word (1+2) to (3+4) of "a"`,
                `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HChunk_1(
            HChunkAmt(
                Lvl4Expr(
                    ExprSource( 1 )
                    ExprSource( 2 )
                    OpPlusMinus( + ) ) "(" ")" )
            HChunkAmt(
                Lvl4Expr(
                    ExprSource( 3 )
                    ExprSource( 4 )
                    OpPlusMinus( + ) ) "(" ")" ) to )
        Of( of ) word ) )`
            );
            this.testExp(
                `word 1 of (word 2 of "a")`,
                `Lvl6Expr(
    Lvl6Expr(
        ExprSource( "a" )
        HChunk(
            HChunk_1(
                HChunkAmt( 2 ) )
            Of( of ) word ) )
    HChunk(
        HChunk_1(
            HChunkAmt( 1 ) )
        Of( of ) word ) "(" ")" )`
            );
            this.testExp(
                `first word of "a"`,
                `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HOrdinal( first )
        Of( of ) word ) )`
            );
            this.testExp(
                `fifth word of "a"`,
                `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HOrdinal( fifth )
        Of( of ) word ) )`
            );
            // Lvl6Expression
            this.testExp(
                `(1)`,
                `Lvl6Expr(
    ExprSource( 1 ) "(" ")" )`
            );
            this.testExp(
                `("a")`,
                `Lvl6Expr(
    ExprSource( "a" ) "(" ")" )`
            );
            this.testExp(
                `((1))`,
                `Lvl6Expr(
    Lvl6Expr(
        ExprSource( 1 ) "(" ")" ) "(" ")" )`
            );
            this.testExp(
                `(((1)))`,
                `Lvl6Expr(
    Lvl6Expr(
        Lvl6Expr(
            ExprSource( 1 ) "(" ")" ) "(" ")" ) "(" ")" )`
            );
            // ExprGetProperty
            this.testExp(
                `prop of this cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) of ) )`
            );
            this.testExp(
                `the prop of this cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) the of ) )`
            );
            this.testExp(
                `long prop of this cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) long of ) )`
            );
            this.testExp(
                `the long prop of this cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) the long of ) )`
            );
            this.testExp(
                `id of this cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( id )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) of ) )`
            );
            this.testExp(
                `the id of this cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( id )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) the of ) )`
            );
            this.testExp(
                `prop of word 1 of cd fld 2`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        HChunk(
            HChunk_1(
                HChunkAmt( 1 ) )
            Of( of ) word )
        ObjectFld(
            ExprSource( 2 ) cd fld ) of ) )`
            );
            this.testExp(
                `prop of word 1 to 2 of cd fld 3`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        HChunk(
            HChunk_1(
                HChunkAmt( 1 )
                HChunkAmt( 2 ) to )
            Of( of ) word )
        ObjectFld(
            ExprSource( 3 ) cd fld ) of ) )`
            );
            this.testExp(
                `prop of cd fld 1`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectFld(
                ExprSource( 1 ) cd fld ) ) of ) )`
            );
            this.testExp(
                `prop of cd btn 1`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBtn(
                ExprSource( 1 ) btn cd ) ) of ) )`
            );

            // Object corner-cases
            this.testExp(
                `prop of the target`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            Object_1( the $target ) ) of ) )`
            );
            this.testExp(
                `prop of target`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            Object_1( $target ) ) of ) )`
            );
            this.testExp(
                `prop of ${cProductName}`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            Object_1( $${cProductName} ) ) of ) )`
            );
            this.testExp(
                `prop of me`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            Object_1( $me ) ) of ) )`
            );

            // cards/bgs can't stand alone as an expression
            this.assertFailsParseExp(`cd 1`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`this cd`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`(cd 1)`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`(this cd)`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsParseExp(`bg 1`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`this bg`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`(bg 1)`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`(this bg)`, `MismatchedTokenException: Expecting token of type `);

            // this will fail at a later stage, right now thinks target() is a function
            // this.assertFailsParseExp(#the target#, ##)
            // this.assertFailsParseExp(#(the target)#, ##)

            // Fields (they are 'containers' and as such can stand alone)
            this.testExp(
                `cd fld 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) cd fld ) ) ) )`
            );
            this.testExp(
                `cd fld id 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) id cd fld ) ) ) )`
            );
            this.testExp(
                `card field "a"`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( "a" ) card field ) ) ) )`
            );
            this.testExp(
                `card field "a" & "b"`,
                `Lvl3Expr(
    ExprSource(
        HSimpleContainer(
            ObjectPart(
                ObjectFld(
                    ExprSource( "a" ) card field ) ) ) )
    ExprSource( "b" )
    OpStringConcat( & ) )`
            );
            this.testExp(
                `bg fld 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) bg fld ) ) ) )`
            );
            this.testExp(
                `bg fld id 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) id bg fld ) ) ) )`
            );
            this.testExp(
                `background fld 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) background fld ) ) ) )`
            );
            this.testExp(
                `background fld id 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) id background fld ) ) ) )`
            );
            this.testExp(
                `cd fld 1 of cd 2`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 )
                ObjectCard(
                    ExprSource( 2 ) cd )
                Of( of ) cd fld ) ) ) )`
            );
            this.testExp(
                `cd fld id 1 of cd id 2`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 )
                ObjectCard(
                    ExprSource( 2 ) id cd )
                Of( of ) id cd fld ) ) ) )`
            );

            // Buttons (they are 'containers' and as such can stand alone)
            this.testExp(
                `cd btn 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) btn cd ) ) ) )`
            );
            this.testExp(
                `cd btn id 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) id btn cd ) ) ) )`
            );
            this.testExp(
                `card button "a"`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( "a" ) button card ) ) ) )`
            );
            this.testExp(
                `card button "a"`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( "a" ) button card ) ) ) )`
            );
            this.testExp(
                `bg btn 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) bg btn ) ) ) )`
            );
            this.testExp(
                `bg btn id 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) id bg btn ) ) ) )`
            );
            this.testExp(
                `background btn 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) background btn ) ) ) )`
            );
            this.testExp(
                `background btn id 1`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) id background btn ) ) ) )`
            );
            this.testExp(
                `cd btn 1 of cd 2`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 )
                ObjectCard(
                    ExprSource( 2 ) cd )
                Of( of ) btn cd ) ) ) )`
            );
            this.testExp(
                `cd btn id 1 of cd id 2`,
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 )
                ObjectCard(
                    ExprSource( 2 ) id cd )
                Of( of ) id btn cd ) ) ) )`
            );

            // we currently want the cd or btn prefix. emulator assumes bg for flds at least, which is odd.
            this.assertFailsParseExp(`btn 1`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`prop of btn 1`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`fld 1`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`prop of fld 1`, `NoViableAltException: Expecting: one of these poss`);

            // Cards
            this.testExp(
                `prop of cd 1`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                ExprSource( 1 ) cd ) ) of ) )`
            );
            this.testExp(
                `prop of cd id 1`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                ExprSource( 1 ) id cd ) ) of ) )`
            );
            this.testExp(
                `prop of first cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HOrdinal( first ) cd ) ) of ) )`
            );
            this.testExp(
                `prop of last cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HOrdinal( last ) cd ) ) of ) )`
            );
            this.testExp(
                `prop of prev cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $prev ) cd ) ) of ) )`
            );
            this.testExp(
                `prop of next cd`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $next ) cd ) ) of ) )`
            );

            // Bkgnds
            this.testExp(
                `prop of bg 1`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                ExprSource( 1 ) bg ) ) of ) )`
            );
            this.testExp(
                `prop of bg id 1`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                ExprSource( 1 ) id bg ) ) of ) )`
            );
            this.testExp(
                `prop of first bg`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                HOrdinal( first ) bg ) ) of ) )`
            );
            this.testExp(
                `prop of last bg`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                HOrdinal( last ) bg ) ) of ) )`
            );
            this.testExp(
                `prop of prev bg`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                HPosition( $prev ) bg ) ) of ) )`
            );
            this.testExp(
                `prop of next bg`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                HPosition( $next ) bg ) ) of ) )`
            );

            // Stacks (placeholder)
            this.testExp(
                `prop of this stack`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectStack( stack $this ) ) of ) )`
            );
            this.testExp(
                `there is a this stack`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectStack( stack $this ) ) is there $a ) ) )`
            );
            this.assertFailsParseExp(`prop of stack`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`there is a stack`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`prop of stack "a"`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`there is a stack "a"`, `NoViableAltException: Expecting: one of these poss`);

            // other possible HSimpleContainers
            this.testExp(
                `1 + cd fld "a"`,
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource(
        HSimpleContainer(
            ObjectPart(
                ObjectFld(
                    ExprSource( "a" ) cd fld ) ) ) )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                `cd fld "a" + 1`,
                `Lvl4Expr(
    ExprSource(
        HSimpleContainer(
            ObjectPart(
                ObjectFld(
                    ExprSource( "a" ) cd fld ) ) ) )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
            );
        },
        'test_parse_functionCalls',
        () => {
            // length
            this.testExp(
                `the length of "a"`,
                `ExprSource(
    FnCall(
        FnCall_Length(
            ExprSource( "a" ) length the of ) ) )`
            );
            this.testExp(
                `the length of "a" + 1`,
                `Lvl4Expr(
    ExprSource(
        FnCall(
            FnCall_Length(
                ExprSource( "a" ) length the of ) ) )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                `length("a")`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( "a" ) length "(" ")" ) ) )`
            );
            this.testExp(
                `the length("a")`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( "a" ) length the "(" ")" ) ) )`
            );
            this.testExp(
                `char (length("a")) of "b"`,
                `Lvl6Expr(
    ExprSource( "b" )
    HChunk(
        HChunk_1(
            HChunkAmt(
                ExprSource(
                    FnCall(
                        FnCallWithParens(
                            ExprSource( "a" ) length "(" ")" ) ) ) "(" ")" ) )
        Of( of ) char ) )`
            );

            // nullary
            this.testExp(
                `time()`,
                `ExprSource(
    FnCall(
        FnCallWithParens( $time "(" ")" ) ) )`
            );
            this.testExp(
                `time ()`,
                `ExprSource(
    FnCall(
        FnCallWithParens( $time "(" ")" ) ) )`
            );
            this.testExp(
                `time \\\n ()`,
                `ExprSource(
    FnCall(
        FnCallWithParens( $time "(" ")" ) ) )`
            );
            this.testExp(
                `(time())`,
                `Lvl6Expr(
    ExprSource(
        FnCall(
            FnCallWithParens( $time "(" ")" ) ) ) "(" ")" )`
            );
            this.testExp(
                `the time()`,
                `ExprSource(
    FnCall(
        FnCallWithParens( the $time "(" ")" ) ) )`
            );
            this.testExp(
                `not time()`,
                `Lvl6Expr(
    ExprSource(
        FnCall(
            FnCallWithParens( $time "(" ")" ) ) ) not )`
            );
            this.testExp(
                `not the time()`,
                `Lvl6Expr(
    ExprSource(
        FnCall(
            FnCallWithParens( the $time "(" ")" ) ) ) not )`
            );
            this.testExp(
                `the target`,
                `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $target ) ) )`
            );
            this.testExp(
                `the long target`,
                `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the long $target ) ) )`
            );

            this.assertFailsParseExp(`time() time()`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`time() 1`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`1 time()`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`1.23()`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`the ()`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`+ ()`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`the long target()`, `Redundant input, expecting EOF`);

            // arguments
            this.testExp(
                `time(f1())`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource(
                FnCall(
                    FnCallWithParens( $f1 "(" ")" ) ) ) $time "(" ")" ) ) )`
            );
            this.testExp(
                `time((1))`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            Lvl6Expr(
                ExprSource( 1 ) "(" ")" ) $time "(" ")" ) ) )`
            );
            this.testExp(
                `time(1,2)`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( 1 )
            ExprSource( 2 ) , $time "(" ")" ) ) )`
            );
            this.testExp(
                `time(1*2,3)`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            Lvl5Expr(
                ExprSource( 1 )
                ExprSource( 2 )
                OpMultDivideExpDivMod( * ) )
            ExprSource( 3 ) , $time "(" ")" ) ) )`
            );
            this.testExp(
                `time(not 1,3)`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            Lvl6Expr(
                ExprSource( 1 ) not )
            ExprSource( 3 ) , $time "(" ")" ) ) )`
            );
            this.testExp(
                `time(1,2,3)`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( 1 )
            ExprSource( 2 )
            ExprSource( 3 ) , , $time "(" ")" ) ) )`
            );
            this.testExp(
                `f1(f2(1,2))`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource(
                FnCall(
                    FnCallWithParens(
                        ExprSource( 1 )
                        ExprSource( 2 ) , $f2 "(" ")" ) ) ) $f1 "(" ")" ) ) )`
            );
            this.testExp(
                `f1(1,f2(2,3),4)`,
                `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( 1 )
            ExprSource(
                FnCall(
                    FnCallWithParens(
                        ExprSource( 2 )
                        ExprSource( 3 ) , $f2 "(" ")" ) ) )
            ExprSource( 4 ) , , $f1 "(" ")" ) ) )`
            );
            this.assertFailsParseExp(`f1(1,f2(2,3)),4`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`f1((1,2)`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsParseExp(`f1(1 2)`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsParseExp(`f1(1 2 3)`, `MismatchedTokenException: Expecting token of type `);

            // allowed without parens
            this.testExp(
                `the target`,
                `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $target ) ) )`
            );
            this.testExp(
                `the long target`,
                `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the long $target ) ) )`
            );
            this.testExp(
                `the long target + 1`,
                `Lvl4Expr(
    ExprSource(
        FnCall(
            FnCallWithoutParensOrGlobalGetPropOrTarget( the long $target ) ) )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
            );
            this.testExp(
                `the params`,
                `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $params ) ) )`
            );
            this.testExp(
                `the paramcount`,
                `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $paramcount ) ) )`
            );
            this.testExp(
                `not the paramcount + 1`,
                `Lvl4Expr(
    Lvl6Expr(
        ExprSource(
            FnCall(
                FnCallWithoutParensOrGlobalGetPropOrTarget( the $paramcount ) ) ) not )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
            );
            this.assertFailsParseExp(`the target params`, `NotAllInputParsedException: Redundant input, expec`);

            // but parens are ok too if you want, as long as there is no adjective
            this.testExp(
                `the target()`,
                `ExprSource(
    FnCall(
        FnCallWithParens( the $target "(" ")" ) ) )`
            );
            this.testExp(
                `the params()`,
                `ExprSource(
    FnCall(
        FnCallWithParens( the $params "(" ")" ) ) )`
            );
            this.testExp(
                `the paramcount()`,
                `ExprSource(
    FnCall(
        FnCallWithParens( the $paramcount "(" ")" ) ) )`
            );
            this.testExp(
                `not the paramcount() + 1`,
                `Lvl4Expr(
    Lvl6Expr(
        ExprSource(
            FnCall(
                FnCallWithParens( the $paramcount "(" ")" ) ) ) not )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
            );

            // number of
            this.testExp(
                `the number of words of "a"`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_1(
                ExprSource( "a" )
                Of( of ) words ) number the of ) ) )`
            );
            this.testExp(
                `the number of words of "a" && "b"`,
                `Lvl3Expr(
    ExprSource(
        FnCall(
            FnCallNumberOf(
                FnCallNumberOf_1(
                    ExprSource( "a" )
                    Of( of ) words ) number the of ) ) )
    ExprSource( "b" )
    OpStringConcat( && ) )`
            );
            this.testExp(
                `the number of chars in "a"`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_1(
                ExprSource( "a" )
                Of( in ) chars ) number the of ) ) )`
            );
            this.testExp(
                `the number of items in "a"`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_1(
                ExprSource( "a" )
                Of( in ) items ) number the of ) ) )`
            );
            this.testExp(
                `the number of cd btns`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( btns cd ) number the of ) ) )`
            );
            this.testExp(
                `the number of cd flds`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( cd flds ) number the of ) ) )`
            );
            this.testExp(
                `the number of bg btns`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( bg btns ) number the of ) ) )`
            );
            this.testExp(
                `the number of bg flds`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( bg flds ) number the of ) ) )`
            );
            this.assertFailsParseExp(`the number of btns`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`the number of flds`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`the number of cd cds`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`the number of cd x`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(`the number of x in "a"`, `NoViableAltException: Expecting: one of these poss`);
            this.testExp(
                `the rect of cd btn "p1"`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $rect )
        Object(
            ObjectBtn(
                ExprSource( "p1" ) btn cd ) ) the of ) )`
            );
            this.testExp(
                `the rect of bg btn "p1"`,
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $rect )
        Object(
            ObjectBtn(
                ExprSource( "p1" ) bg btn ) ) the of ) )`
            );
            this.testExp(
                `the number of cds`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_3( cds ) number the of ) ) )`
            );
            this.testExp(
                `the number of cds of bg 1`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_3(
                ObjectBg(
                    ExprSource( 1 ) bg )
                Of( of ) cds ) number the of ) ) )`
            );
            this.testExp(
                `the number of cds of bg 1 of this stack`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_3(
                ObjectBg(
                    ExprSource( 1 )
                    ObjectStack( stack $this )
                    Of( of ) bg )
                Of( of ) cds ) number the of ) ) )`
            );
            this.testExp(
                `the number of cds of this stack`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_3(
                ObjectStack( stack $this )
                Of( of ) cds ) number the of ) ) )`
            );
            this.testExp(
                `the number of bgs`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_4( bgs ) number the of ) ) )`
            );
            this.testExp(
                `the number of bgs of this stack`,
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_4(
                ObjectStack( stack $this )
                Of( of ) bgs ) number the of ) ) )`
            );
            this.assertFailsParseExp(`the long number of cds`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`the number of this stack`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`the number of cd bg 1`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsParseExp(
                `the number of words of bg 1`,
                `NoViableAltException: Expecting: one of these poss`
            );

            // there-is
            this.testExp(
                `there is a cd 1`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectCard(
                    ExprSource( 1 ) cd ) ) is there $a ) ) )`
            );
            this.testExp(
                `there is a cd x`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectCard(
                    ExprSource(
                        HSimpleContainer( $x ) ) cd ) ) is there $a ) ) )`
            );
            this.testExp(
                `there is a cd btn 1`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectBtn(
                    ExprSource( 1 ) btn cd ) ) is there $a ) ) )`
            );
            this.testExp(
                `there is a cd btn x`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectBtn(
                    ExprSource(
                        HSimpleContainer( $x ) ) btn cd ) ) is there $a ) ) )`
            );
            this.testExp(
                `there is a this stack`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectStack( stack $this ) ) is there $a ) ) )`
            );
            this.testExp(
                `there is a me`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                Object_1( $me ) ) is there $a ) ) )`
            );
            this.testExp(
                `there is a target`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                Object_1( $target ) ) is there $a ) ) )`
            );
            this.testExp(
                `there is a the target`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                Object_1( the $target ) ) is there $a ) ) )`
            );
            this.testExp(
                `there is a ${cProductName}`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                Object_1( $${cProductName} ) ) is there $a ) ) )`
            );

            // we currently require "cd btn", "btn" alone shouldn't parse
            this.assertFailsParseExp(`there is a btn 1`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`there is a (cd 1)`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`there is a (cd btn 1)`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsParseExp(`there is a (cd fld 1)`, `NoViableAltException: Expecting: one of these poss`);
            this.testExp(
                `there is not a card 1`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectCard(
                    ExprSource( 1 ) card ) ) is not there $a ) ) )`
            );
            this.testExp(
                `there is not a card x`,
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectCard(
                    ExprSource(
                        HSimpleContainer( $x ) ) card ) ) is not there $a ) ) )`
            );
            this.assertFailsParseExp(`there is not cd btn 1`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsParseExp(`there not cd btn 1`, `MismatchedTokenException: Expecting token of type `);
        },
        'test_parse_builtinCmdSet',
        () => {
            // basic syntax
            this.testCmdSet(
                `set the prop to 1`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 1 ) ) the $set`
            );
            this.testCmdSet(
                `set the prop to -1`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl6Expr(
        ExprSource( 1 ) - ) ) the $set`
            );
            this.testCmdSet(
                `set the prop to 1 + 1`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl4Expr(
        ExprSource( 1 )
        ExprSource( 1 )
        OpPlusMinus( + ) ) ) the $set`
            );
            this.testCmdSet(
                `set the prop to (1 < 2)`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl6Expr(
        Lvl1Expr(
            ExprSource( 1 )
            ExprSource( 2 )
            OpEqualityGreaterLessOrContains( < ) ) "(" ")" ) ) the $set`
            );
            this.testCmdSet(
                `set prop to 1`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 1 ) ) $set`
            );

            // hm, a TkIdentifier is currently a valid <Object>. not ideal but saves a few tokens.
            // we'll fail at a later stage.
            // this.assertFailsParseSetExp(#set prop of x to 1#, ##)

            // cases that should fail
            this.assertFailsCmdSet(`set prop in cd btn 1 to 2`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsCmdSet(
                `set prop of cd btn 1 to 2 > 3`,
                `NotAllInputParsedException: Redundant input, expec`
            ); // we only allow arith, nothing below
            this.assertFailsCmdSet(
                `set prop of cd btn 1 to 2 and 3`,
                `NotAllInputParsedException: Redundant input, expec`
            ); // we only allow arith, nothing below

            // targets
            this.testCmdSet(
                `set prop of cd 1 to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectCard(
        ExprSource( 1 ) cd ) ) $set`
            );
            this.testCmdSet(
                `set prop of bg 1 to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBg(
        ExprSource( 1 ) bg ) ) $set`
            );
            this.testCmdSet(
                `set prop of cd x to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectCard(
        ExprSource(
            HSimpleContainer( $x ) ) cd ) ) $set`
            );
            this.testCmdSet(
                `set prop of bg x to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBg(
        ExprSource(
            HSimpleContainer( $x ) ) bg ) ) $set`
            );
            this.testCmdSet(
                `set prop of cd btn 1 to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBtn(
        ExprSource( 1 ) btn cd ) ) $set`
            );
            this.testCmdSet(
                `set prop of cd btn 1 of cd 2 to 3`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 3 ) )
Object(
    ObjectBtn(
        ExprSource( 1 )
        ObjectCard(
            ExprSource( 2 ) cd )
        Of( of ) btn cd ) ) $set`
            );
            this.testCmdSet(
                `set prop of cd fld 1 to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectFld(
        ExprSource( 1 ) cd fld ) ) $set`
            );
            this.testCmdSet(
                `set prop of cd fld 1 to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectFld(
        ExprSource( 1 ) cd fld ) ) $set`
            );
            this.testCmdSet(
                `set prop of this stack to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectStack( stack $this ) ) $set`
            );
            this.testCmdSet(
                `set prop of the target to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    Object_1( the $target ) ) $set`
            );
            this.testCmdSet(
                `set prop of me to 2`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    Object_1( $me ) ) $set`
            );

            // using keyword "to" more than once
            this.testCmdSet(
                `set prop to chars 1 to 2 of "a"`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl6Expr(
        ExprSource( "a" )
        HChunk(
            HChunk_1(
                HChunkAmt( 1 )
                HChunkAmt( 2 ) to )
            Of( of ) chars ) ) ) $set`
            );
            this.testCmdSet(
                `set prop of chars 1 to 2 of cd fld 1 to chars 3 to 4 of "a"`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl6Expr(
        ExprSource( "a" )
        HChunk(
            HChunk_1(
                HChunkAmt( 3 )
                HChunkAmt( 4 ) to )
            Of( of ) chars ) ) )
HChunk(
    HChunk_1(
        HChunkAmt( 1 )
        HChunkAmt( 2 ) to )
    Of( of ) chars )
ObjectFld(
    ExprSource( 1 ) cd fld ) $set`
            );

            // chunks of fields
            this.testCmdSet(
                `set prop of word 1 to 2 of cd fld 3 to 4`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 4 ) )
HChunk(
    HChunk_1(
        HChunkAmt( 1 )
        HChunkAmt( 2 ) to )
    Of( of ) word )
ObjectFld(
    ExprSource( 3 ) cd fld ) $set`
            );
            this.testCmdSet(
                `set prop of item 1 to (2 + 3) of cd fld 4 to 5`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 5 ) )
HChunk(
    HChunk_1(
        HChunkAmt( 1 )
        HChunkAmt(
            Lvl4Expr(
                ExprSource( 2 )
                ExprSource( 3 )
                OpPlusMinus( + ) ) "(" ")" ) to )
    Of( of ) item )
ObjectFld(
    ExprSource( 4 ) cd fld ) $set`
            );

            // can't take chunks of anything else
            this.assertFailsCmdSet(
                `set prop of word 1 to 2 of cd 3 to 4`,
                `NoViableAltException: Expecting: one of these poss`
            );
            this.assertFailsCmdSet(
                `set prop of word 1 to 2 of bg 3 to 4`,
                `NoViableAltException: Expecting: one of these poss`
            );
            this.assertFailsCmdSet(
                `set prop of word 1 to 2 of cd btn 3 to 4`,
                `NoViableAltException: Expecting: one of these poss`
            );
            this.assertFailsCmdSet(
                `set prop of word 1 to 2 of this stack to 4`,
                `NoViableAltException: Expecting: one of these poss`
            );
            this.assertFailsCmdSet(
                `set prop of word 1 to 2 of x to 4`,
                `NoViableAltException: Expecting: one of these poss`
            );

            // will fail at runtime, but syntax is valid
            this.testCmdSet(
                `set the id of cd btn 1 to 2`,
                `AnyPropertyName( id )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBtn(
        ExprSource( 1 ) btn cd ) ) the $set`
            );
            this.testCmdSet(
                `set the id of cd btn id 1 to 2`,
                `AnyPropertyName( id )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBtn(
        ExprSource( 1 ) id btn cd ) ) the $set`
            );

            // types of things to set to
            this.testCmdSet(
                `set prop to ta`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $ta ) ) ) $set`
            );
            this.testCmdSet(
                `set prop to ta, tb`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $ta ) )
    ExprSource(
        HSimpleContainer( $tb ) ) , ) $set`
            );
            this.testCmdSet(
                `set prop to ta, tb, tc`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $ta ) )
    ExprSource(
        HSimpleContainer( $tb ) )
    ExprSource(
        HSimpleContainer( $tc ) ) , , ) $set`
            );
            this.testCmdSet(
                `set prop to ta, tb, tc, td`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $ta ) )
    ExprSource(
        HSimpleContainer( $tb ) )
    ExprSource(
        HSimpleContainer( $tc ) )
    ExprSource(
        HSimpleContainer( $td ) ) , , , ) $set`
            );
            this.testCmdSet(
                `set prop to ta, tb, tc, td, te`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $ta ) )
    ExprSource(
        HSimpleContainer( $tb ) )
    ExprSource(
        HSimpleContainer( $tc ) )
    ExprSource(
        HSimpleContainer( $td ) )
    ExprSource(
        HSimpleContainer( $te ) ) , , , , ) $set`
            );
            this.testCmdSet(
                `set prop to opaque`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $opaque ) ) ) $set`
            );
            this.testCmdSet(
                `set prop to bold`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $bold ) ) ) $set`
            );
            this.testCmdSet(
                `set prop to bold, italic`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $bold ) )
    ExprSource(
        HSimpleContainer( $italic ) ) , ) $set`
            );
            this.testCmdSet(
                `set prop to bold, italic, shadow`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $bold ) )
    ExprSource(
        HSimpleContainer( $italic ) )
    ExprSource(
        HSimpleContainer( $shadow ) ) , , ) $set`
            );
            this.testCmdSet(
                `set prop to (1), (2)`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl6Expr(
        ExprSource( 1 ) "(" ")" )
    Lvl6Expr(
        ExprSource( 2 ) "(" ")" ) , ) $set`
            );
            this.testCmdSet(
                `set prop to (1+2), (3+4)`,
                `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl6Expr(
        Lvl4Expr(
            ExprSource( 1 )
            ExprSource( 2 )
            OpPlusMinus( + ) ) "(" ")" )
    Lvl6Expr(
        Lvl4Expr(
            ExprSource( 3 )
            ExprSource( 4 )
            OpPlusMinus( + ) ) "(" ")" ) , ) $set`
            );

            this.assertFailsCmdSet(`set prop to cd 1`, `NoViableAltException: Expecting: one of these poss`);
            this.assertFailsCmdSet(`set prop prop to 1`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsCmdSet(`set prop to (ta, tb)`, `MismatchedTokenException: Expecting token of type `);
            this.assertFailsCmdSet(`set prop to ta tb`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsCmdSet(`set prop to 1 2`, `NotAllInputParsedException: Redundant input, expec`);
            this.assertFailsCmdSet(`set prop to`, `EarlyExitException: Expecting: expecting at least `);
            this.assertFailsCmdSet(`set prop to ,`, `EarlyExitException: Expecting: expecting at least `);
            this.assertFailsCmdSet(`set prop to 1,`, `NoViableAltException: Expecting: one of these poss`);
        },
        'test_parse_otherBuiltinCmds',
        () => {
            // add
            this.testCmd(
                'add x to y',
                `HContainer(
    HSimpleContainer( $y ) )
ExprSource(
    HSimpleContainer( $x ) ) $add to )`
            );
            this.testCmd(
                'add 1+2+3 to y',
                `HContainer(
    HSimpleContainer( $y ) )
Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpPlusMinus( + )
    OpPlusMinus( + ) ) $add to )`
            );
            this.testCmd(
                'add 1 to cd fld o',
                `HContainer(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource(
                    HSimpleContainer( $o ) ) cd fld ) ) ) )
ExprSource( 1 ) $add to )`
            );
            this.testCmd(
                'add 1 to line 2 of cd fld o',
                `HContainer(
    HChunk(
        HChunk_1(
            HChunkAmt( 2 ) )
        Of( of ) line )
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource(
                    HSimpleContainer( $o ) ) cd fld ) ) ) )
ExprSource( 1 ) $add to )`
            );
            this.testCmd(
                'add 1 to line 2 to 3 of cd fld o',
                `HContainer(
    HChunk(
        HChunk_1(
            HChunkAmt( 2 )
            HChunkAmt( 3 ) to )
        Of( of ) line )
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource(
                    HSimpleContainer( $o ) ) cd fld ) ) ) )
ExprSource( 1 ) $add to )`
            );
            this.testCmd(
                'add 1 to line 2 to (3*4) of cd fld o',
                `HContainer(
    HChunk(
        HChunk_1(
            HChunkAmt( 2 )
            HChunkAmt(
                Lvl5Expr(
                    ExprSource( 3 )
                    ExprSource( 4 )
                    OpMultDivideExpDivMod( * ) ) "(" ")" ) to )
        Of( of ) line )
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource(
                    HSimpleContainer( $o ) ) cd fld ) ) ) )
ExprSource( 1 ) $add to )`
            );
            this.assertFailsCmd('add 1 + 2', 'MismatchedTokenException');
            this.assertFailsCmd('add 1 to 2', 'NoViableAltException');
            this.assertFailsCmd('add 1 to "abc"', 'NoViableAltException');
            this.assertFailsCmd('add 1 to line 2', 'NoViableAltException');
            this.assertFailsCmd('add 1 to line 2 to 3 of', 'NoViableAltException');
            this.assertFailsCmd('add 1 to cd x', 'NoViableAltException');
            this.assertFailsCmd('add 1 to bg x', 'NoViableAltException');
            this.assertFailsCmd('add 1 to the x', 'MismatchedTokenException');
            this.assertFailsCmd('add 1 to the left of cd btn 1', 'MismatchedTokenException');

            // answer
            this.testCmd(
                'answer x',
                `ExprSource(
    HSimpleContainer( $x ) ) $answer )`
            );
            this.testCmd(
                'answer x \n y',
                `ExprSource(
    HSimpleContainer( $x ) )
ExprSource(
    HSimpleContainer( $y ) ) $answer`
            );
            this.testCmd(
                'answer x \n y or z1',
                `ExprSource(
    HSimpleContainer( $x ) )
ExprSource(
    HSimpleContainer( $y ) )
ExprSource(
    HSimpleContainer( $z1 ) ) or $answer`
            );
            this.testCmd(
                'answer x \n y or z1 or z2',
                `ExprSource(
    HSimpleContainer( $x ) )
ExprSource(
    HSimpleContainer( $y ) )
ExprSource(
    HSimpleContainer( $z1 ) )
ExprSource(
    HSimpleContainer( $z2 ) ) or or $answer`
            );
            this.testCmd(
                'ask x',
                `ExprSource(
    HSimpleContainer( $x ) ) $ask )`
            );
            this.testCmd(
                'ask x \n y',
                `ExprSource(
    HSimpleContainer( $x ) )
ExprSource(
    HSimpleContainer( $y ) ) $ask`
            );

            // go
            this.testCmd('go to first', `HOrdinal( first ) $go to )`);
            this.testCmd('go first', `HOrdinal( first ) $go )`);
            this.testCmd(
                'go first cd',
                `NtDest(
    ObjectCard(
        HOrdinal( first ) cd ) ) $go )`
            );
            this.testCmd(
                'go first bg',
                `NtDest(
    ObjectBg(
        HOrdinal( first ) bg ) ) $go )`
            );
            this.testCmd(
                'go cd 2',
                `NtDest(
    ObjectCard(
        ExprSource( 2 ) cd ) ) $go )`
            );
            this.testCmd('go next', `HPosition( $next ) $go )`);
            this.testCmd('go back', `HPosition( $back ) $go )`);
            this.testCmd('go forth', `HPosition( $forth ) $go )`);
            this.assertFailsCmd('go 2', 'NoViableAltException');
            this.assertFailsCmd('go "abc"', 'NoViableAltException');

            // multiply
            this.testCmd(
                'multiply x \n 2',
                `HContainer(
    HSimpleContainer( $x ) )
ExprSource( 2 ) $multiply`
            );
            this.testCmd(
                'multiply x \n "2"',
                `HContainer(
    HSimpleContainer( $x ) )
ExprSource( "2" ) $multiply`
            );

            // drag
            this.testCmd(
                'drag from 2,3 to 4,5',
                `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 ) , , $drag $from to )`
            );
            this.testCmd(
                'drag from 2,3 to 4,5 \n shiftkey',
                `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 ) , , $drag $from $shiftkey
)`
            );
            this.testCmd(
                'drag from 2,3 to 4,5 \n shiftkey, optkey',
                `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 ) , , , $drag $from $shiftkey $optkey
)`
            );
            this.testCmd(
                'drag from 2,3 to 4,5 \n shiftkey, optkey, cmdkey',
                `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 ) , , , , $drag $from $shiftkey $optkey $cmdkey
)`
            );
            this.testCmd(
                'drag from 2,3 to 4,5 to 6,7',
                `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 )
ExprSource( 6 )
ExprSource( 7 ) , , , $drag $from to to )`
            );
            this.testCmd(
                'drag from 2,3 to 4,5 to 6,7 \n shiftkey',
                `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 )
ExprSource( 6 )
ExprSource( 7 ) , , , $drag $from $shiftkey
to )`
            );
            this.testCmd(
                'drag from 2,3 to 4,5 to 6,7 \n shiftkey, optkey',
                `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 )
ExprSource( 6 )
ExprSource( 7 ) , , , , $drag $from $shiftkey $optkey
to )`
            );
            this.testCmd(
                'drag from 2,3 to 4,5 to 6,7 \n shiftkey, optkey, cmdkey',
                `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 )
ExprSource( 6 )
ExprSource( 7 ) , , , , , $drag $from $shiftkey $optkey $cmdkey
to )`
            );

            // put
            this.testCmd(
                'put 1+2 \n into \n x',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put 1+2 \n before \n x',
                `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )
HContainer(
    HSimpleContainer( $x ) ) $put $before`
            );
            this.testCmd(
                'put 1 \n into \n x',
                `ExprSource( 1 )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put "abc" \n into \n x',
                `ExprSource( "abc" )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put cd fld 1 \n into \n x',
                `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) cd fld ) ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put y \n into \n x',
                `ExprSource(
    HSimpleContainer( $y ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put myfn(1,2) \n into \n x',
                `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( 1 )
            ExprSource( 2 ) , $myfn "(" ")" ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put sin(1) \n into \n x',
                `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( 1 ) $sin "(" ")" ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put result() \n into \n x',
                `ExprSource(
    FnCall(
        FnCallWithParens( $result "(" ")" ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put the result \n into \n x',
                `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $result ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put the left of cd btn 1 \n into \n x',
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $left )
        Object(
            ObjectBtn(
                ExprSource( 1 ) btn cd ) ) the of ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put the textfont of line 1 of cd fld 1 \n into \n x',
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $textfont )
        HChunk(
            HChunk_1(
                HChunkAmt( 1 ) )
            Of( of ) line )
        ObjectFld(
            ExprSource( 1 ) cd fld ) the of ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put the long name of cd fld 1 \n into \n x',
                `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $name )
        Object(
            ObjectFld(
                ExprSource( 1 ) cd fld ) ) the long of ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put the long version \n into \n x',
                `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the long $version ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put the number of cd btns \n into \n x',
                `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( btns cd ) number the of ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put there is a cd btn y \n into \n x',
                `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectBtn(
                    ExprSource(
                        HSimpleContainer( $y ) ) btn cd ) ) is there $a ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put true or false \n into \n x',
                `Expr(
    ExprSource(
        HSimpleContainer( $true ) )
    ExprSource(
        HSimpleContainer( $false ) )
    OpLogicalOrAnd( or ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put 2 > 3 \n into \n x',
                `Lvl1Expr(
    ExprSource( 2 )
    ExprSource( 3 )
    OpEqualityGreaterLessOrContains( > ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put 2 is a number \n into \n x',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2TypeCheck( number $a ) )
    ExprSource( 2 ) is )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put y is within z \n into \n x',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            ExprSource(
                HSimpleContainer( $z ) ) within ) )
    ExprSource(
        HSimpleContainer( $y ) ) is )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put y is in z \n into \n x',
                `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            ExprSource(
                HSimpleContainer( $z ) ) in ) )
    ExprSource(
        HSimpleContainer( $y ) ) is )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put y & z \n into \n x',
                `Lvl3Expr(
    ExprSource(
        HSimpleContainer( $y ) )
    ExprSource(
        HSimpleContainer( $z ) )
    OpStringConcat( & ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put 4/5 \n into \n x',
                `Lvl5Expr(
    ExprSource( 4 )
    ExprSource( 5 )
    OpMultDivideExpDivMod( / ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put 4 div 5 \n into \n x',
                `Lvl5Expr(
    ExprSource( 4 )
    ExprSource( 5 )
    OpMultDivideExpDivMod( div ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put (1) \n into \n x',
                `Lvl6Expr(
    ExprSource( 1 ) "(" ")" )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put -1 \n into \n x',
                `Lvl6Expr(
    ExprSource( 1 ) - )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put not true \n into \n x',
                `Lvl6Expr(
    ExprSource(
        HSimpleContainer( $true ) ) not )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put first line of y \n into \n x',
                `Lvl6Expr(
    ExprSource(
        HSimpleContainer( $y ) )
    HChunk(
        HOrdinal( first )
        Of( of ) line ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put line 1 of y \n into \n x',
                `Lvl6Expr(
    ExprSource(
        HSimpleContainer( $y ) )
    HChunk(
        HChunk_1(
            HChunkAmt( 1 ) )
        Of( of ) line ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put line 1 to 2 of y \n into \n x',
                `Lvl6Expr(
    ExprSource(
        HSimpleContainer( $y ) )
    HChunk(
        HChunk_1(
            HChunkAmt( 1 )
            HChunkAmt( 2 ) to )
        Of( of ) line ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
            this.testCmd(
                'put not char 1 of (char 2 of y) \n into \n x',
                `Lvl6Expr(
    Lvl6Expr(
        ExprSource(
            HSimpleContainer( $y ) )
        HChunk(
            HChunk_1(
                HChunkAmt( 2 ) )
            Of( of ) char ) )
    HChunk(
        HChunk_1(
            HChunkAmt( 1 ) )
        Of( of ) char ) not "(" ")" )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
            );
        }
    ];
}
