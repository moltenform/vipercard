
/* auto */ import { cProductName } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { TestParseHelpers } from '../../test/vpc/vpcTestScriptParseCmd.js';

/**
 * test parsing an expression
 */
let mTests: (string | Function)[] = [
    'testScriptParseExpr.Simple Expressions',
    () => {
        testExp('4', `ExprSource( 4 )`);
        testExp(
            '1+2',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
        );
        testExp(
            '1 + 2',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
        );
        testExp(
            '011  +  02.2',
            `Lvl4Expr(
    ExprSource( 011 )
    ExprSource( 02.2 )
    OpPlusMinus( + ) )`
        );
        testExp(
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
        testExp(
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
    },
    'testScriptParseExpr.lexing should take care of this',
    () => {
        testExp(
            '1 + \\\n2',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
        );
        testExp(
            '1 + \\\n\\\n2',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
        );
        testExp(
            '1 + \\\n    \\\n2',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
        );
        assertFailsParseExp('1 + \n 2', 'NoViableAltException: Expecting: one of these');
        assertFailsParseExp('1 + \\\n\n 2', 'NoViableAltException: Expecting: one of these');
    },
    'testScriptParseUnaryMinusAndSubtraction',
    () => {
        testExp(
            '1-2-3',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpPlusMinus( - )
    OpPlusMinus( - ) )`
        );
        testExp(
            '1 - 2 - 3',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpPlusMinus( - )
    OpPlusMinus( - ) )`
        );
        testExp(
            '1.0-2.0-3.0',
            `Lvl4Expr(
    ExprSource( 1.0 )
    ExprSource( 2.0 )
    ExprSource( 3.0 )
    OpPlusMinus( - )
    OpPlusMinus( - ) )`
        );
        testExp(
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
        testExp(
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
        testExp(
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
    'testScriptParseExpr.EveryLevelOfExpression',
    () => {
        testExp(
            'true and false',
            `Expr(
    ExprSource(
        HSimpleContainer( $true ) )
    ExprSource(
        HSimpleContainer( $false ) )
    OpLogicalOrAnd( and ) )`
        );
        testExp(
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
        testExp(
            '1 > 2',
            `Lvl1Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpEqualityGreaterLessOrContains( > ) )`
        );
        testExp(
            '1 > 2 != 3',
            `Lvl1Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpEqualityGreaterLessOrContains( > )
    OpEqualityGreaterLessOrContains( != ) )`
        );
        testExp(
            'x contains y',
            `Lvl1Expr(
    ExprSource(
        HSimpleContainer( $x ) )
    ExprSource(
        HSimpleContainer( $y ) )
    OpEqualityGreaterLessOrContains( contains ) )`
        );
        testExp(
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
        testExp(
            'x is not a number',
            `Lvl2Expr(
    Lvl2Sub(
        Lvl2TypeCheck( number $a ) not )
    ExprSource(
        HSimpleContainer( $x ) ) is )`
        );
        testExp(
            'x is not a number is a point',
            `Lvl2Expr(
    Lvl2Sub(
        Lvl2TypeCheck( number $a ) not )
    Lvl2Sub(
        Lvl2TypeCheck( $a $point ) )
    ExprSource(
        HSimpleContainer( $x ) ) is is )`
        );
        testExp(
            '1 is not in 2',
            `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            ExprSource( 2 ) in ) not )
    ExprSource( 1 ) is )`
        );
        testExp(
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
        testExp(
            'x is not within y',
            `Lvl2Expr(
    Lvl2Sub(
        Lvl2Within(
            ExprSource(
                HSimpleContainer( $y ) ) within ) not )
    ExprSource(
        HSimpleContainer( $x ) ) is )`
        );
        testExp(
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
        testExp(
            '1 is not 2',
            `Lvl2Expr(
    Lvl2Sub(
        ExprSource( 2 ) not )
    ExprSource( 1 ) is )`
        );
        testExp(
            '1 is not 2 is 3',
            `Lvl2Expr(
    Lvl2Sub(
        ExprSource( 2 ) not )
    Lvl2Sub(
        ExprSource( 3 ) )
    ExprSource( 1 ) is is )`
        );
        testExp(
            'x && y',
            `Lvl3Expr(
    ExprSource(
        HSimpleContainer( $x ) )
    ExprSource(
        HSimpleContainer( $y ) )
    OpStringConcat( && ) )`
        );
        testExp(
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
        testExp(
            '1 + 2',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )`
        );
        testExp(
            '1 + 2 - 3',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpPlusMinus( + )
    OpPlusMinus( - ) )`
        );
        testExp(
            '1 * 2',
            `Lvl5Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpMultDivideExpDivMod( * ) )`
        );
        testExp(
            '1 * 2 / 3',
            `Lvl5Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    ExprSource( 3 )
    OpMultDivideExpDivMod( * )
    OpMultDivideExpDivMod( / ) )`
        );
        testExp(
            'not true',
            `Lvl6Expr(
    ExprSource(
        HSimpleContainer( $true ) ) not )`
        );
        testExp(
            '- (1)',
            `Lvl6Expr(
    ExprSource( 1 ) "(" - ")" )`
        );
    },
    'testScriptParseExpr.expressions that should fail',
    () => {
        /* cases that should fail */
        assertFailsParseExp(`(1`, `MismatchedTokenException: Expecting token of type `);
        assertFailsParseExp(`1(`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`1*`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`1-`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`1()`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`()1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`()`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(``, `NoViableAltException: Expecting: one of these poss`);

        /* we don't want two consecutive TkIdentifiers to be a valid expression, */
        /* not that important but it makes parsing more streamlined. */
        assertFailsParseExp(`var1 var2`, `NotAllInputParsedException: Redundant input, expec`);

        /* we don't want points to be a valid expression in general, */
        /* I just think it's a good idea */
        assertFailsParseExp(`1, 2`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`var1, var2`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`(1, 2)`, `MismatchedTokenException: Expecting token of type `);
        assertFailsParseExp(`(1, 2, 3)`, `MismatchedTokenException: Expecting token of type `);

        /* let's not accept these either */
        assertFailsParseExp(`1 2`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`1 2 3`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`(1 2)`, `MismatchedTokenException: Expecting token of type `);
        assertFailsParseExp(`(1 2 3)`, `MismatchedTokenException: Expecting token of type `);
    },
    'testScriptParseExpr.expression precedence, lvl0 to higher',
    () => {
        /* for 1+2*3 */
        /* I call this "lower to higher", the first operator in the input string ("+") is done last. */
        /* for 1*2+3 */
        /* I call this "higher to lower", the first operator in the input string ("*") is done first. */
        testExp(
            '1 and 2 is not a number',
            `Expr(
    ExprSource( 1 )
    Lvl2Expr(
        Lvl2Sub(
            Lvl2TypeCheck( number $a ) not )
        ExprSource( 2 ) is )
    OpLogicalOrAnd( and ) )`
        );
        testExp(
            '1 and 2 mod 3',
            `Expr(
    ExprSource( 1 )
    Lvl5Expr(
        ExprSource( 2 )
        ExprSource( 3 )
        OpMultDivideExpDivMod( mod ) )
    OpLogicalOrAnd( and ) )`
        );
        testExp(
            'not 1 and 2',
            `Expr(
    Lvl6Expr(
        ExprSource( 1 ) not )
    ExprSource( 2 )
    OpLogicalOrAnd( and ) )`
        );
    },
    'testScriptParseExpr.expression precedence, lvl 1 to higher',
    () => {
        testExp(
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
        testExp(
            '1 > 2 && "a"',
            `Lvl1Expr(
    ExprSource( 1 )
    Lvl3Expr(
        ExprSource( 2 )
        ExprSource( "a" )
        OpStringConcat( && ) )
    OpEqualityGreaterLessOrContains( > ) )`
        );
        testExp(
            'not 1>2',
            `Lvl1Expr(
    Lvl6Expr(
        ExprSource( 1 ) not )
    ExprSource( 2 )
    OpEqualityGreaterLessOrContains( > ) )`
        );
    },
    'testScriptParseExpr.expression precedence, lvl 1 to lower',
    () => {
        testExp(
            '1 > 2 and 3',
            `Expr(
    Lvl1Expr(
        ExprSource( 1 )
        ExprSource( 2 )
        OpEqualityGreaterLessOrContains( > ) )
    ExprSource( 3 )
    OpLogicalOrAnd( and ) )`
        );
    },
    'testScriptParseExpr.expression precedence, lvl 2 to higher',
    () => {
        testExp(
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
        testExp(
            '1 is 2 mod 3',
            `Lvl2Expr(
    Lvl2Sub(
        Lvl5Expr(
            ExprSource( 2 )
            ExprSource( 3 )
            OpMultDivideExpDivMod( mod ) ) )
    ExprSource( 1 ) is )`
        );
        /* path "is a number" terminates, confirmed is consisent with the emulator. */
        assertFailsParseExp(`1 is a number & 2`, `NotAllInputParsedException: Redundant input, expecting EOF`);
    },
    'testScriptParseExpr.expression precedence, lvl 2 to lower',
    () => {
        testExp(
            '1 is a number > 2',
            `Lvl1Expr(
    Lvl2Expr(
        Lvl2Sub(
            Lvl2TypeCheck( number $a ) )
        ExprSource( 1 ) is )
    ExprSource( 2 )
    OpEqualityGreaterLessOrContains( > ) )`
        );
        testExp(
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
        testExp(
            '1 is 2 or 3',
            `Expr(
    Lvl2Expr(
        Lvl2Sub(
            ExprSource( 2 ) )
        ExprSource( 1 ) is )
    ExprSource( 3 )
    OpLogicalOrAnd( or ) )`
        );
    },
    'testScriptParseExpr.expression precedence, lvl 3 to higher',
    () => {
        testExp(
            `"a" && "b" + 1`,
            `Lvl3Expr(
    ExprSource( "a" )
    Lvl4Expr(
        ExprSource( "b" )
        ExprSource( 1 )
        OpPlusMinus( + ) )
    OpStringConcat( && ) )`
        );
        testExp(
            `"a" & "b" div 1`,
            `Lvl3Expr(
    ExprSource( "a" )
    Lvl5Expr(
        ExprSource( "b" )
        ExprSource( 1 )
        OpMultDivideExpDivMod( div ) )
    OpStringConcat( & ) )`
        );
    },
    'testScriptParseExpr.expression precedence, lvl 3 to lower',
    () => {
        testExp(
            `"a" && "b" is a number`,
            `Lvl2Expr(
    Lvl2Sub(
        Lvl2TypeCheck( number $a ) )
    Lvl3Expr(
        ExprSource( "a" )
        ExprSource( "b" )
        OpStringConcat( && ) ) is )`
        );
        testExp(
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
        testExp(
            `"a" & "b" > 1`,
            `Lvl1Expr(
    Lvl3Expr(
        ExprSource( "a" )
        ExprSource( "b" )
        OpStringConcat( & ) )
    ExprSource( 1 )
    OpEqualityGreaterLessOrContains( > ) )`
        );
    },
    'testScriptParseExpr.expression precedence, lvl 4 to higher',
    () => {
        testExp(
            `1 + 2 * 3`,
            `Lvl4Expr(
    ExprSource( 1 )
    Lvl5Expr(
        ExprSource( 2 )
        ExprSource( 3 )
        OpMultDivideExpDivMod( * ) )
    OpPlusMinus( + ) )`
        );
        testExp(
            `1 - 2 div 3`,
            `Lvl4Expr(
    ExprSource( 1 )
    Lvl5Expr(
        ExprSource( 2 )
        ExprSource( 3 )
        OpMultDivideExpDivMod( div ) )
    OpPlusMinus( - ) )`
        );
    },
    'testScriptParseExpr.expression precedence, lvl 4 to lower',
    () => {
        testExp(
            `1 + 2 is 3`,
            `Lvl2Expr(
    Lvl2Sub(
        ExprSource( 3 ) )
    Lvl4Expr(
        ExprSource( 1 )
        ExprSource( 2 )
        OpPlusMinus( + ) ) is )`
        );
        testExp(
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
    },
    'testScriptParseExpr.expression precedence, lvl 5 to higher',
    () => {
        testExp(
            `not 1 * 2`,
            `Lvl5Expr(
    Lvl6Expr(
        ExprSource( 1 ) not )
    ExprSource( 2 )
    OpMultDivideExpDivMod( * ) )`
        );
        testExp(
            `- 1 mod 2`,
            `Lvl5Expr(
    Lvl6Expr(
        ExprSource( 1 ) - )
    ExprSource( 2 )
    OpMultDivideExpDivMod( mod ) )`
        );
        testExp(
            `1 * sin(2)`,
            `Lvl5Expr(
    ExprSource( 1 )
    ExprSource(
        FnCall(
            FnCallWithParens(
                ExprSource( 2 ) $sin "(" ")" ) ) )
    OpMultDivideExpDivMod( * ) )`
        );
        testExp(
            `1 * the result`,
            `Lvl5Expr(
    ExprSource( 1 )
    ExprSource(
        FnCall(
            FnCallWithoutParensOrGlobalGetPropOrTarget( the $result ) ) )
    OpMultDivideExpDivMod( * ) )`
        );
        testExp(
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
    },
    'testScriptParseExpr.expression precedence, level 5 to lower',
    () => {
        testExp(
            `1 * 2 + 3`,
            `Lvl4Expr(
    Lvl5Expr(
        ExprSource( 1 )
        ExprSource( 2 )
        OpMultDivideExpDivMod( * ) )
    ExprSource( 3 )
    OpPlusMinus( + ) )`
        );
        testExp(
            `1 / 2 contains 3`,
            `Lvl1Expr(
    Lvl5Expr(
        ExprSource( 1 )
        ExprSource( 2 )
        OpMultDivideExpDivMod( / ) )
    ExprSource( 3 )
    OpEqualityGreaterLessOrContains( contains ) )`
        );
    },
    'testScriptParseExpr.expression precedence, above level 5',
    () => {
        testExp(
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
        testExp(
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
        testExp(
            `1 & the length of var & 2`,
            `Lvl3Expr(
    ExprSource( 1 )
    ExprSource(
        FnCall(
            FnCallLength(
                ExprSource(
                    HSimpleContainer( $var ) ) length the of ) ) )
    ExprSource( 2 )
    OpStringConcat( & )
    OpStringConcat( & ) )`
        );
    },
    'testScriptParseExpr.expression precedence, parsed this way because btn names are <FACTOR>, not <ARITH>',
    () => {
        testExp(
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
        testExp(
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
    },
    'testScriptParseExpr.expression precedence, high-level precedence',
    () => {
        testExp(
            `cd fld 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) cd fld ) ) ) )`
        );
        testExp(
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
        testExp(
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
        testExp(
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
        testExp(
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
        testExp(
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
        testExp(
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
        testExp(
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
    'testScriptParseExpr.parts of expressions, HChunk',
    () => {
        testExp(
            `word 1 of "a"`,
            `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HChunk_1(
            HChunkAmt( 1 ) )
        Of( of ) word ) )`
        );
        testExp(
            `word 1 to 2 of "a"`,
            `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HChunk_1(
            HChunkAmt( 1 )
            HChunkAmt( 2 ) to )
        Of( of ) word ) )`
        );
        testExp(
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
        testExp(
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
        testExp(
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
        testExp(
            `first word of "a"`,
            `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HOrdinal( first )
        Of( of ) word ) )`
        );
        testExp(
            `fifth word of "a"`,
            `Lvl6Expr(
    ExprSource( "a" )
    HChunk(
        HOrdinal( fifth )
        Of( of ) word ) )`
        );
    },
    'testScriptParseExpr.parts of expressions, Lvl6Expression',
    () => {
        testExp(
            `(1)`,
            `Lvl6Expr(
    ExprSource( 1 ) "(" ")" )`
        );
        testExp(
            `("a")`,
            `Lvl6Expr(
    ExprSource( "a" ) "(" ")" )`
        );
        testExp(
            `((1))`,
            `Lvl6Expr(
    Lvl6Expr(
        ExprSource( 1 ) "(" ")" ) "(" ")" )`
        );
        testExp(
            `(((1)))`,
            `Lvl6Expr(
    Lvl6Expr(
        Lvl6Expr(
            ExprSource( 1 ) "(" ")" ) "(" ")" ) "(" ")" )`
        );
    },
    'testScriptParseExpr.parts of expressions, ExprGetProperty',
    () => {
        testExp(
            `prop of this cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) of ) )`
        );
        testExp(
            `the prop of this cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) the of ) )`
        );
        testExp(
            `long prop of this cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) long of ) )`
        );
        testExp(
            `the long prop of this cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) the long of ) )`
        );
        testExp(
            `id of this cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( id )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) of ) )`
        );
        testExp(
            `the id of this cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( id )
        Object(
            ObjectCard(
                HPosition( $this ) cd ) ) the of ) )`
        );
        testExp(
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
        testExp(
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
        testExp(
            `prop of cd fld 1`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectFld(
                ExprSource( 1 ) cd fld ) ) of ) )`
        );
        testExp(
            `prop of cd btn 1`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBtn(
                ExprSource( 1 ) btn cd ) ) of ) )`
        );
    },
    'testScriptParseExpr.parts of expressions, Object corner-cases',
    () => {
        testExp(
            `prop of the target`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            Object_1( the $target ) ) of ) )`
        );
        testExp(
            `prop of target`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            Object_1( $target ) ) of ) )`
        );
        testExp(
            `prop of ${cProductName}`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            Object_1( $${cProductName} ) ) of ) )`
        );
        testExp(
            `prop of me`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            Object_1( $me ) ) of ) )`
        );
    },
    "testScriptParseExpr.parts of expressions, cards/bgs can't stand alone as an expression",
    () => {
        assertFailsParseExp(`cd 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`this cd`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`(cd 1)`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`(this cd)`, `MismatchedTokenException: Expecting token of type `);
        assertFailsParseExp(`bg 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`this bg`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`(bg 1)`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`(this bg)`, `MismatchedTokenException: Expecting token of type `);

        /* this will fail at a later stage, right now thinks target() is a function */
        /* assertFailsParseExp(#the target#, ##) */
        /* assertFailsParseExp(#(the target)#, ##) */
    },
    "testScriptParseExpr.parts of expressions, Fields (they are 'containers' and as such can stand alone)",
    () => {
        testExp(
            `cd fld 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) cd fld ) ) ) )`
        );
        testExp(
            `cd fld id 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) id cd fld ) ) ) )`
        );
        testExp(
            `card field "a"`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( "a" ) card field ) ) ) )`
        );
        testExp(
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
        testExp(
            `bg fld 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) bg fld ) ) ) )`
        );
        testExp(
            `bg fld id 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) id bg fld ) ) ) )`
        );
        testExp(
            `background fld 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) background fld ) ) ) )`
        );
        testExp(
            `background fld id 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) id background fld ) ) ) )`
        );
        testExp(
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
        testExp(
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
    },
    "testScriptParseExpr.parts of expressions, Buttons (they are 'containers' and as such can stand alone)",
    () => {
        testExp(
            `cd btn 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) btn cd ) ) ) )`
        );
        testExp(
            `cd btn id 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) id btn cd ) ) ) )`
        );
        testExp(
            `card button "a"`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( "a" ) button card ) ) ) )`
        );
        testExp(
            `card button "a"`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( "a" ) button card ) ) ) )`
        );
        testExp(
            `bg btn 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) bg btn ) ) ) )`
        );
        testExp(
            `bg btn id 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) id bg btn ) ) ) )`
        );
        testExp(
            `background btn 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) background btn ) ) ) )`
        );
        testExp(
            `background btn id 1`,
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectBtn(
                ExprSource( 1 ) id background btn ) ) ) )`
        );
        testExp(
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
        testExp(
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
    },
    'testScriptParseExpr.parts of expressions, we require the cd or btn prefix.',
    () => {
        assertFailsParseExp(`btn 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`prop of btn 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`fld 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`prop of fld 1`, `NoViableAltException: Expecting: one of these poss`);
    },
    'testScriptParseExpr.parts of expressions, Cards',
    () => {
        testExp(
            `prop of cd 1`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                ExprSource( 1 ) cd ) ) of ) )`
        );
        testExp(
            `prop of cd id 1`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                ExprSource( 1 ) id cd ) ) of ) )`
        );
        testExp(
            `prop of first cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HOrdinal( first ) cd ) ) of ) )`
        );
        testExp(
            `prop of last cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HOrdinal( last ) cd ) ) of ) )`
        );
        testExp(
            `prop of prev cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $prev ) cd ) ) of ) )`
        );
        testExp(
            `prop of next cd`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectCard(
                HPosition( $next ) cd ) ) of ) )`
        );
    },
    'testScriptParseExpr.parts of expressions, Bkgnds',
    () => {
        testExp(
            `prop of bg 1`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                ExprSource( 1 ) bg ) ) of ) )`
        );
        testExp(
            `prop of bg id 1`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                ExprSource( 1 ) id bg ) ) of ) )`
        );
        testExp(
            `prop of first bg`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                HOrdinal( first ) bg ) ) of ) )`
        );
        testExp(
            `prop of last bg`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                HOrdinal( last ) bg ) ) of ) )`
        );
        testExp(
            `prop of prev bg`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                HPosition( $prev ) bg ) ) of ) )`
        );
        testExp(
            `prop of next bg`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectBg(
                HPosition( $next ) bg ) ) of ) )`
        );
    },
    'testScriptParseExpr.parts of expressions, Stacks',
    () => {
        testExp(
            `prop of this stack`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $prop )
        Object(
            ObjectStack( stack $this ) ) of ) )`
        );
        testExp(
            `there is a this stack`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectStack( stack $this ) ) is there $a ) ) )`
        );
    },
    "testScriptParseExpr.parts of expressions, you can't refer to other stacks",
    () => {
        assertFailsParseExp(`prop of stack`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`there is a stack`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`prop of stack "a"`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`there is a stack "a"`, `NoViableAltException: Expecting: one of these poss`);
    },
    'testScriptParseExpr.parts of expressions, other possible HSimpleContainers',
    () => {
        testExp(
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
        testExp(
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
    'testScriptParseFunctionCalls length',
    () => {
        testExp(
            `the length of "a"`,
            `ExprSource(
    FnCall(
        FnCallLength(
            ExprSource( "a" ) length the of ) ) )`
        );
        testExp(
            `the length of "a" + 1`,
            `Lvl4Expr(
    ExprSource(
        FnCall(
            FnCallLength(
                ExprSource( "a" ) length the of ) ) )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
        );
        testExp(
            `length("a")`,
            `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( "a" ) length "(" ")" ) ) )`
        );
        testExp(
            `the length("a")`,
            `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( "a" ) length the "(" ")" ) ) )`
        );
        testExp(
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
    },
    'testScriptParseFunctionCalls fn call with no args',
    () => {
        testExp(
            `time()`,
            `ExprSource(
    FnCall(
        FnCallWithParens( $time "(" ")" ) ) )`
        );
        testExp(
            `time ()`,
            `ExprSource(
    FnCall(
        FnCallWithParens( $time "(" ")" ) ) )`
        );
        testExp(
            `time \\\n ()`,
            `ExprSource(
    FnCall(
        FnCallWithParens( $time "(" ")" ) ) )`
        );
        testExp(
            `(time())`,
            `Lvl6Expr(
    ExprSource(
        FnCall(
            FnCallWithParens( $time "(" ")" ) ) ) "(" ")" )`
        );
        testExp(
            `the time()`,
            `ExprSource(
    FnCall(
        FnCallWithParens( the $time "(" ")" ) ) )`
        );
        testExp(
            `not time()`,
            `Lvl6Expr(
    ExprSource(
        FnCall(
            FnCallWithParens( $time "(" ")" ) ) ) not )`
        );
        testExp(
            `not the time()`,
            `Lvl6Expr(
    ExprSource(
        FnCall(
            FnCallWithParens( the $time "(" ")" ) ) ) not )`
        );
        testExp(
            `the target`,
            `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $target ) ) )`
        );
        testExp(
            `the long target`,
            `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the long $target ) ) )`
        );
    },
    'testScriptParseFunctionCalls ensure that invalid fn calls are rejected',
    () => {
        assertFailsParseExp(`time() time()`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`time() 1`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`1 time()`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`1.23()`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`the ()`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`+ ()`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`the long target()`, `Redundant input, expecting EOF`);
    },
    'testScriptParseFunctionCalls arguments',
    () => {
        testExp(
            `time(f1())`,
            `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource(
                FnCall(
                    FnCallWithParens( $f1 "(" ")" ) ) ) $time "(" ")" ) ) )`
        );
        testExp(
            `time((1))`,
            `ExprSource(
    FnCall(
        FnCallWithParens(
            Lvl6Expr(
                ExprSource( 1 ) "(" ")" ) $time "(" ")" ) ) )`
        );
        testExp(
            `time(1,2)`,
            `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( 1 )
            ExprSource( 2 ) , $time "(" ")" ) ) )`
        );
        testExp(
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
        testExp(
            `time(not 1,3)`,
            `ExprSource(
    FnCall(
        FnCallWithParens(
            Lvl6Expr(
                ExprSource( 1 ) not )
            ExprSource( 3 ) , $time "(" ")" ) ) )`
        );
        testExp(
            `time(1,2,3)`,
            `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( 1 )
            ExprSource( 2 )
            ExprSource( 3 ) , , $time "(" ")" ) ) )`
        );
        testExp(
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
        testExp(
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
    },
    "testScriptParseFunctionCalls arguments aren't given correctly",
    () => {
        assertFailsParseExp(`f1(1,f2(2,3)),4`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`f1((1,2)`, `MismatchedTokenException: Expecting token of type `);
        assertFailsParseExp(`f1(1 2)`, `MismatchedTokenException: Expecting token of type `);
        assertFailsParseExp(`f1(1 2 3)`, `MismatchedTokenException: Expecting token of type `);
    },
    'testScriptParseFunctionCalls allowed without parens',
    () => {
        testExp(
            `the target`,
            `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $target ) ) )`
        );
        testExp(
            `the long target`,
            `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the long $target ) ) )`
        );
        testExp(
            `the long target + 1`,
            `Lvl4Expr(
    ExprSource(
        FnCall(
            FnCallWithoutParensOrGlobalGetPropOrTarget( the long $target ) ) )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
        );
        testExp(
            `the params`,
            `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $params ) ) )`
        );
        testExp(
            `the paramcount`,
            `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $paramcount ) ) )`
        );
        testExp(
            `not the paramcount + 1`,
            `Lvl4Expr(
    Lvl6Expr(
        ExprSource(
            FnCall(
                FnCallWithoutParensOrGlobalGetPropOrTarget( the $paramcount ) ) ) not )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
        );

        assertFailsParseExp(`the target params`, `NotAllInputParsedException: Redundant input, expec`);
    },
    'testScriptParseFunctionCalls but parens are ok too if you want, as long as there is no adjective',
    () => {
        testExp(
            `the target()`,
            `ExprSource(
    FnCall(
        FnCallWithParens( the $target "(" ")" ) ) )`
        );
        testExp(
            `the params()`,
            `ExprSource(
    FnCall(
        FnCallWithParens( the $params "(" ")" ) ) )`
        );
        testExp(
            `the paramcount()`,
            `ExprSource(
    FnCall(
        FnCallWithParens( the $paramcount "(" ")" ) ) )`
        );
        testExp(
            `not the paramcount() + 1`,
            `Lvl4Expr(
    Lvl6Expr(
        ExprSource(
            FnCall(
                FnCallWithParens( the $paramcount "(" ")" ) ) ) not )
    ExprSource( 1 )
    OpPlusMinus( + ) )`
        );
    },
    'testScriptParseFunctionCalls number of',
    () => {
        testExp(
            `the number of words of "a"`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_1(
                ExprSource( "a" )
                Of( of ) words ) number the of ) ) )`
        );
        testExp(
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
        testExp(
            `the number of chars in "a"`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_1(
                ExprSource( "a" )
                Of( in ) chars ) number the of ) ) )`
        );
        testExp(
            `the number of items in "a"`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_1(
                ExprSource( "a" )
                Of( in ) items ) number the of ) ) )`
        );
        testExp(
            `the number of cd btns`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( btns cd ) number the of ) ) )`
        );
        testExp(
            `the number of cd flds`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( cd flds ) number the of ) ) )`
        );
        testExp(
            `the number of bg btns`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( bg btns ) number the of ) ) )`
        );
        testExp(
            `the number of bg flds`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( bg flds ) number the of ) ) )`
        );
    },
    'testScriptParseFunctionCalls invalid "number of" syntax',
    () => {
        assertFailsParseExp(`the number of btns`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`the number of flds`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`the number of cd cds`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`the number of cd x`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`the number of x in "a"`, `NoViableAltException: Expecting: one of these poss`);
    },
    'testScriptParseFunctionCalls number of, nested',
    () => {
        testExp(
            `the number of cds`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_3( cds ) number the of ) ) )`
        );
        testExp(
            `the number of cds of bg 1`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_3(
                ObjectBg(
                    ExprSource( 1 ) bg )
                Of( of ) cds ) number the of ) ) )`
        );
        testExp(
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
        testExp(
            `the number of cds of this stack`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_3(
                ObjectStack( stack $this )
                Of( of ) cds ) number the of ) ) )`
        );
        testExp(
            `the number of bgs`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_4( bgs ) number the of ) ) )`
        );
        testExp(
            `the number of bgs of this stack`,
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_4(
                ObjectStack( stack $this )
                Of( of ) bgs ) number the of ) ) )`
        );
    },
    'testScriptParseFunctionCalls number of, invalid',
    () => {
        assertFailsParseExp(`the long number of cds`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`the number of this stack`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`the number of cd bg 1`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsParseExp(`the number of words of bg 1`, `NoViableAltException: Expecting: one of these poss`);
    },
    'testScriptParse There-is-a',
    () => {
        testExp(
            `there is a cd 1`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectCard(
                    ExprSource( 1 ) cd ) ) is there $a ) ) )`
        );
        testExp(
            `there is a cd x`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectCard(
                    ExprSource(
                        HSimpleContainer( $x ) ) cd ) ) is there $a ) ) )`
        );
        testExp(
            `there is a cd btn 1`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectBtn(
                    ExprSource( 1 ) btn cd ) ) is there $a ) ) )`
        );
        testExp(
            `there is a cd btn x`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectBtn(
                    ExprSource(
                        HSimpleContainer( $x ) ) btn cd ) ) is there $a ) ) )`
        );
        testExp(
            `there is a this stack`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectStack( stack $this ) ) is there $a ) ) )`
        );
        testExp(
            `there is a me`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                Object_1( $me ) ) is there $a ) ) )`
        );
        testExp(
            `there is a target`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                Object_1( $target ) ) is there $a ) ) )`
        );
        testExp(
            `there is a the target`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                Object_1( the $target ) ) is there $a ) ) )`
        );
        testExp(
            `there is a ${cProductName}`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                Object_1( $${cProductName} ) ) is there $a ) ) )`
        );
    },
    'testScriptParse Invalid There-is-a, we require "cd btn", not "btn" alone',
    () => {
        assertFailsParseExp(`there is a btn 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`there is a (cd 1)`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`there is a (cd btn 1)`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(`there is a (cd fld 1)`, `NoViableAltException: Expecting: one of these poss`);
    },
    'testScriptParse there is not a',
    () => {
        testExp(
            `there is not a card 1`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectCard(
                    ExprSource( 1 ) card ) ) is not there $a ) ) )`
        );
        testExp(
            `there is not a card x`,
            `ExprSource(
    FnCall(
        ExprThereIs(
            Object(
                ObjectCard(
                    ExprSource(
                        HSimpleContainer( $x ) ) card ) ) is not there $a ) ) )`
        );

        assertFailsParseExp(`there is not cd btn 1`, `MismatchedTokenException: Expecting token of type `);
        assertFailsParseExp(`there not cd btn 1`, `MismatchedTokenException: Expecting token of type `);
    },

    'testScriptParseExpr.get rect property',
    () => {
        testExp(
            `the rect of cd btn "p1"`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $rect )
        Object(
            ObjectBtn(
                ExprSource( "p1" ) btn cd ) ) the of ) )`
        );
        testExp(
            `the rect of bg btn "p1"`,
            `ExprSource(
    ExprGetProperty(
        AnyPropertyName( $rect )
        Object(
            ObjectBtn(
                ExprSource( "p1" ) bg btn ) ) the of ) )`
        );
    }
];

/**
 * wrapper around testParse, for testing parsing an expression
 * uses the get command,
 * and then strips the get command out of the output as well
 */
function testExp(sInput: string, sExpected: string) {
    return TestParseHelpers.instance.testParse('get ' + sInput, 'RuleBuiltinCmdGet', sExpected, '');
}

/**
 * wrapper around testParse, asserts that it fails with the expected message
 */
function assertFailsParseExp(sInput: string, sErrExpected: string) {
    return TestParseHelpers.instance.testParse('get ' + sInput, 'RuleBuiltinCmdGet', '', sErrExpected);
}

/**
 * exported test class for mTests
 */
export class TestVpcParseExpr extends UI512TestBase {
    tests = mTests;
}
