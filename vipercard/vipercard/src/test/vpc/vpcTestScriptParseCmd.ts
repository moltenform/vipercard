
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq, assertEqWarn } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ChvLexer } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { cloneToken, tks, tokenType } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { VpcChvParser } from '../../vpc/codeparse/vpcParser.js';
/* auto */ import { VpcVisitorInterface } from '../../vpc/codeparse/vpcVisitorMixin.js';
/* auto */ import { getParsingObjects } from '../../vpc/codeparse/vpcVisitor.js';

/**
 * test parsing a command
 */
let mTests: (string | Function)[] = [
    'TestVpcParseCmdSet.Basic syntax',
    () => {
        testCmdSet(
            `set the prop to 1`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 1 ) ) the $set`
        );
        testCmdSet(
            `set the prop to -1`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl6Expr(
        ExprSource( 1 ) - ) ) the $set`
        );
        testCmdSet(
            `set the prop to 1 + 1`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl4Expr(
        ExprSource( 1 )
        ExprSource( 1 )
        OpPlusMinus( + ) ) ) the $set`
        );
        testCmdSet(
            `set the prop to (1 < 2)`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl6Expr(
        Lvl1Expr(
            ExprSource( 1 )
            ExprSource( 2 )
            OpEqualityGreaterLessOrContains( < ) ) "(" ")" ) ) the $set`
        );
        testCmdSet(
            `set prop to 1`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 1 ) ) $set`
        );
    },
    'TestVpcParseCmdSet.confirm that cases that should fail, do fail',
    () => {
        assertFailsCmdSet(`set prop in cd btn 1 to 2`, `MismatchedTokenException: Expecting token of type `);
        assertFailsCmdSet(`set prop of cd btn 1 to 2 and 3`, `NotAllInputParsedException: Redundant input, expec`);

        /* hm, a TkIdentifier is currently a valid <Object>. not ideal but saves a few tokens. */
        /* we'll fail at a later stage. */
        /* this.assertFailsParseSetExp(#set prop of x to 1#, ##) */
    },
    'TestVpcParseCmdSet.test property targets',
    () => {
        testCmdSet(
            `set prop of cd 1 to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectCard(
        ExprSource( 1 ) cd ) ) $set`
        );
        testCmdSet(
            `set prop of bg 1 to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBg(
        ExprSource( 1 ) bg ) ) $set`
        );
        testCmdSet(
            `set prop of cd x to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectCard(
        ExprSource(
            HSimpleContainer( $x ) ) cd ) ) $set`
        );
        testCmdSet(
            `set prop of bg x to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBg(
        ExprSource(
            HSimpleContainer( $x ) ) bg ) ) $set`
        );
        testCmdSet(
            `set prop of cd btn 1 to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBtn(
        ExprSource( 1 ) btn cd ) ) $set`
        );
        testCmdSet(
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
        testCmdSet(
            `set prop of cd fld 1 to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectFld(
        ExprSource( 1 ) cd fld ) ) $set`
        );
        testCmdSet(
            `set prop of cd fld 1 to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectFld(
        ExprSource( 1 ) cd fld ) ) $set`
        );
        testCmdSet(
            `set prop of this stack to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectStack( stack $this ) ) $set`
        );
        testCmdSet(
            `set prop of the target to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    Object_1( the $target ) ) $set`
        );
        testCmdSet(
            `set prop of me to 2`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    Object_1( $me ) ) $set`
        );
    },
    'TestVpcParseCmdSet.using keyword "to" more than once',
    () => {
        testCmdSet(
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
        testCmdSet(
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
    },
    'TestVpcParseCmdSet.chunks of fields',
    () => {
        testCmdSet(
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
        testCmdSet(
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
    },
    "TestVpcParseCmdSet.can't take chunks of anything else",
    () => {
        assertFailsCmdSet(`set prop of word 1 to 2 of cd 3 to 4`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsCmdSet(`set prop of word 1 to 2 of bg 3 to 4`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsCmdSet(
            `set prop of word 1 to 2 of cd btn 3 to 4`,
            `NoViableAltException: Expecting: one of these poss`
        );
        assertFailsCmdSet(
            `set prop of word 1 to 2 of this stack to 4`,
            `NoViableAltException: Expecting: one of these poss`
        );
        assertFailsCmdSet(`set prop of word 1 to 2 of x to 4`, `NoViableAltException: Expecting: one of these poss`);
    },
    'TestVpcParseCmdSet.will fail at runtime, but syntax is valid',
    () => {
        testCmdSet(
            `set the id of cd btn 1 to 2`,
            `AnyPropertyName( id )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBtn(
        ExprSource( 1 ) btn cd ) ) the $set`
        );
        testCmdSet(
            `set the id of cd btn id 1 to 2`,
            `AnyPropertyName( id )
AnyPropertyVal(
    ExprSource( 2 ) )
Object(
    ObjectBtn(
        ExprSource( 1 ) id btn cd ) ) the $set`
        );
    },
    'TestVpcParseCmdSet.types of things to set to',
    () => {
        testCmdSet(
            `set prop to ta`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $ta ) ) ) $set`
        );
        testCmdSet(
            `set prop to ta, tb`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $ta ) )
    ExprSource(
        HSimpleContainer( $tb ) ) , ) $set`
        );
        testCmdSet(
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
        testCmdSet(
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
        testCmdSet(
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
        testCmdSet(
            `set prop to opaque`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $opaque ) ) ) $set`
        );
        testCmdSet(
            `set prop to bold`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $bold ) ) ) $set`
        );
        testCmdSet(
            `set prop to bold, italic`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    ExprSource(
        HSimpleContainer( $bold ) )
    ExprSource(
        HSimpleContainer( $italic ) ) , ) $set`
        );
        testCmdSet(
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
        testCmdSet(
            `set prop to (1), (2)`,
            `AnyPropertyName( $prop )
AnyPropertyVal(
    Lvl6Expr(
        ExprSource( 1 ) "(" ")" )
    Lvl6Expr(
        ExprSource( 2 ) "(" ")" ) , ) $set`
        );
        testCmdSet(
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
    },
    'TestVpcParseCmdSet.not a valid property set',
    () => {
        assertFailsCmdSet(`set prop to cd 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsCmdSet(`set prop prop to 1`, `MismatchedTokenException: Expecting token of type `);
        assertFailsCmdSet(`set prop to (ta, tb)`, `MismatchedTokenException: Expecting token of type `);
        assertFailsCmdSet(`set prop to ta tb`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsCmdSet(`set prop to 1 2`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsCmdSet(`set prop to`, `EarlyExitException: Expecting: expecting at least `);
        assertFailsCmdSet(`set prop to ,`, `EarlyExitException: Expecting: expecting at least `);
        assertFailsCmdSet(`set prop to 1,`, `NoViableAltException: Expecting: one of these poss`);
    },
    'TestVpcParseCmdAdd',
    () => {
        testCmd(
            'add x to y',
            `HContainer(
    HSimpleContainer( $y ) )
ExprSource(
    HSimpleContainer( $x ) ) $add to )`
        );
        testCmd(
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
        testCmd(
            'add 1 to cd fld o',
            `HContainer(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource(
                    HSimpleContainer( $o ) ) cd fld ) ) ) )
ExprSource( 1 ) $add to )`
        );
        testCmd(
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
        testCmd(
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
        testCmd(
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
    },
    'TestVpcParseCmdAdd.invalid syntax',
    () => {
        assertFailsCmd('add 1 + 2', 'MismatchedTokenException');
        assertFailsCmd('add 1 to 2', 'NoViableAltException');
        assertFailsCmd('add 1 to "abc"', 'NoViableAltException');
        assertFailsCmd('add 1 to line 2', 'NoViableAltException');
        assertFailsCmd('add 1 to line 2 to 3 of', 'NoViableAltException');
        assertFailsCmd('add 1 to cd x', 'NoViableAltException');
        assertFailsCmd('add 1 to bg x', 'NoViableAltException');
        assertFailsCmd('add 1 to the x', 'MismatchedTokenException');
        assertFailsCmd('add 1 to the left of cd btn 1', 'MismatchedTokenException');
    },
    'TestVpcParseCmdAnswer',
    () => {
        testCmd(
            'answer x',
            `ExprSource(
    HSimpleContainer( $x ) ) $answer )`
        );
        testCmd(
            'answer x \n y',
            `ExprSource(
    HSimpleContainer( $x ) )
ExprSource(
    HSimpleContainer( $y ) ) $answer`
        );
        testCmd(
            'answer x \n y or z1',
            `ExprSource(
    HSimpleContainer( $x ) )
ExprSource(
    HSimpleContainer( $y ) )
ExprSource(
    HSimpleContainer( $z1 ) ) or $answer`
        );
        testCmd(
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
        testCmd(
            'ask x',
            `ExprSource(
    HSimpleContainer( $x ) ) $ask )`
        );
        testCmd(
            'ask x \n y',
            `ExprSource(
    HSimpleContainer( $x ) )
ExprSource(
    HSimpleContainer( $y ) ) $ask`
        );
    },
    'TestVpcParseCmdMultiply',
    () => {
        testCmd(
            'multiply x \n 2',
            `HContainer(
    HSimpleContainer( $x ) )
ExprSource( 2 ) $multiply`
        );
        testCmd(
            'multiply x \n "2"',
            `HContainer(
    HSimpleContainer( $x ) )
ExprSource( "2" ) $multiply`
        );
    },
    'TestVpcParseCmdDrag',
    () => {
        testCmd(
            'drag from 2,3 to 4,5',
            `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 ) , , $drag $from to )`
        );
        testCmd(
            'drag from 2,3 to 4,5 \n shiftkey',
            `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 ) , , $drag $from $shiftkey
)`
        );
        testCmd(
            'drag from 2,3 to 4,5 \n shiftkey, optkey',
            `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 ) , , , $drag $from $shiftkey $optkey
)`
        );
        testCmd(
            'drag from 2,3 to 4,5 \n shiftkey, optkey, cmdkey',
            `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 ) , , , , $drag $from $shiftkey $optkey $cmdkey
)`
        );
        testCmd(
            'drag from 2,3 to 4,5 to 6,7',
            `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 )
ExprSource( 6 )
ExprSource( 7 ) , , , $drag $from to to )`
        );
        testCmd(
            'drag from 2,3 to 4,5 to 6,7 \n shiftkey',
            `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 )
ExprSource( 6 )
ExprSource( 7 ) , , , $drag $from $shiftkey
to )`
        );
        testCmd(
            'drag from 2,3 to 4,5 to 6,7 \n shiftkey, optkey',
            `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 )
ExprSource( 6 )
ExprSource( 7 ) , , , , $drag $from $shiftkey $optkey
to )`
        );
        testCmd(
            'drag from 2,3 to 4,5 to 6,7 \n shiftkey, optkey, cmdkey',
            `ExprSource( 2 )
ExprSource( 3 )
ExprSource( 4 )
ExprSource( 5 )
ExprSource( 6 )
ExprSource( 7 ) , , , , , $drag $from $shiftkey $optkey $cmdkey
to )`
        );
    },
    'TestVpcParseCmdPut',
    () => {
        testCmd(
            'put 1+2 \n into \n x',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put 1+2 \n before \n x',
            `Lvl4Expr(
    ExprSource( 1 )
    ExprSource( 2 )
    OpPlusMinus( + ) )
HContainer(
    HSimpleContainer( $x ) ) $put $before`
        );
        testCmd(
            'put 1 \n into \n x',
            `ExprSource( 1 )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put "abc" \n into \n x',
            `ExprSource( "abc" )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put cd fld 1 \n into \n x',
            `ExprSource(
    HSimpleContainer(
        ObjectPart(
            ObjectFld(
                ExprSource( 1 ) cd fld ) ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put y \n into \n x',
            `ExprSource(
    HSimpleContainer( $y ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put myfn(1,2) \n into \n x',
            `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( 1 )
            ExprSource( 2 ) , $myfn "(" ")" ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put sin(1) \n into \n x',
            `ExprSource(
    FnCall(
        FnCallWithParens(
            ExprSource( 1 ) $sin "(" ")" ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put result() \n into \n x',
            `ExprSource(
    FnCall(
        FnCallWithParens( $result "(" ")" ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put the result \n into \n x',
            `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the $result ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
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
        testCmd(
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
        testCmd(
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
        testCmd(
            'put the long version \n into \n x',
            `ExprSource(
    FnCall(
        FnCallWithoutParensOrGlobalGetPropOrTarget( the long $version ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put the number of cd btns \n into \n x',
            `ExprSource(
    FnCall(
        FnCallNumberOf(
            FnCallNumberOf_2( btns cd ) number the of ) ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
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
        testCmd(
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
        testCmd(
            'put 2 > 3 \n into \n x',
            `Lvl1Expr(
    ExprSource( 2 )
    ExprSource( 3 )
    OpEqualityGreaterLessOrContains( > ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put 2 is a number \n into \n x',
            `Lvl2Expr(
    Lvl2Sub(
        Lvl2TypeCheck( number $a ) )
    ExprSource( 2 ) is )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
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
        testCmd(
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
        testCmd(
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
        testCmd(
            'put 4/5 \n into \n x',
            `Lvl5Expr(
    ExprSource( 4 )
    ExprSource( 5 )
    OpMultDivideExpDivMod( / ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put 4 div 5 \n into \n x',
            `Lvl5Expr(
    ExprSource( 4 )
    ExprSource( 5 )
    OpMultDivideExpDivMod( div ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put (1) \n into \n x',
            `Lvl6Expr(
    ExprSource( 1 ) "(" ")" )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put -1 \n into \n x',
            `Lvl6Expr(
    ExprSource( 1 ) - )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put not true \n into \n x',
            `Lvl6Expr(
    ExprSource(
        HSimpleContainer( $true ) ) not )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
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
        testCmd(
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
        testCmd(
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
        testCmd(
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
    },
    'TestLexerRemembersInitialLine',
    () => {
        /* if chevrotain didn't remember this,
        when there was a runtime error,
        we'd take you to the wrong line number */
        let lexer = TestParseHelpers.instance.lexer;
        let input = 'put\\\n 4\\\n into\\\n x\nput 5\\\n into y';
        let lexResult = lexer.tokenize(input);
        assertTrue(!lexResult.errors.length, `HX|${lexResult.errors[0]}`);
        assertEq(9, lexResult.tokens.length, 'HW|');
        assertEq('1,2,3,4,4,5,5,6,6', lexResult.tokens.map(o => o.startLine).join(','), 'HV|');
        assertEq('1,2,3,4,4,5,5,6,6', lexResult.tokens.map(o => o.endLine).join(','), 'HU|');
        assertEq('put,4,into,x,\n,put,5,into,y', lexResult.tokens.map(o => o.image).join(','), 'HT|');
    },
    'TestCloneToken',
    () => {
        let lexer = TestParseHelpers.instance.lexer;
        let input = 'put 4 into x';
        let lexResult = lexer.tokenize(input);
        assertTrue(!lexResult.errors.length, `HS|${lexResult.errors[0]}`);
        assertEq(4, lexResult.tokens.length, 'HR|');
        assertEq('put,4,into,x', lexResult.tokens.map(o => o.image).join(','), 'HQ|');

        /* check that the properties we copy over in
        cloneToken are the same that the real lexer produces */
        let real = lexResult.tokens[0];
        let cloned = cloneToken(real);
        let realTokenKeys = Util512.getMapKeys(real as any);
        let clonedTokenKeys = Util512.getMapKeys(cloned as any);
        realTokenKeys.sort();
        clonedTokenKeys.sort();

        /* these ones we know we can ignore, after confirming they are undefined in the real object */
        assertEq(undefined, real.isInsertedInRecovery, 'HP|');
        assertEq(undefined, real.tokenClassName, 'HO|');
        clonedTokenKeys = clonedTokenKeys.filter(k => k !== 'isInsertedInRecovery' && k !== 'tokenClassName');
        assertEqWarn(realTokenKeys.join(','), clonedTokenKeys.join(','), 'HN|');
    }
];

/**
 * exported test class for mTests
 */
export class TestVpcParseCmd extends UI512TestBase {
    tests = mTests;
}

/**
 * helpers for testing parsing
 */
export class TestParseHelpers {
    static instance = new TestParseHelpers();
    lexer: ChvLexer;
    parser: VpcChvParser;
    visitor: VpcVisitorInterface;
    constructor() {
        [this.lexer, this.parser, this.visitor] = getParsingObjects();
        assertTrue(this.lexer, '1<|bad input');
        assertTrue(this.parser, '1;|bad input');
    }

    /**
     * parse the input, flatten the resulting syntax tree into a string,
     * and then compare the string to what was expected.
     *
     * if sErrExpected is set, expect there to be a parsing error
     * with an error message containing sErrExpected
     */
    testParse(sInput: string, sTopRule: string, sExpected: string, sErrExpected: string) {
        let lexResult = this.lexer.tokenize(sInput);
        assertTrue(!lexResult.errors.length, `1,|${lexResult.errors[0]}`);
        this.parser.input = lexResult.tokens;
        let cst = Util512.callAsMethodOnClass('parser', this.parser, sTopRule, [], false);
        let shouldCont = this.testParseRespondToErrs(sInput, sErrExpected, cst);
        if (!shouldCont) {
            return;
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
            .map(s => s.substr('$get'.length))
            .join('\n');

        flattened = flattened.trim();
        if (sExpected.replace(/ /g, '') !== flattened.replace(/ /g, '')) {
            UI512TestBase.warnAndAllowToContinue(`err--for ${sInput} we got \n${flattened}\n`);
        }
    }

    /**
     * respond to errors coming from the parser.
     * return false if we should return early
     */
    protected testParseRespondToErrs(sInput: string, sErrExpected: string, cst: any) {
        if (this.parser.errors.length) {
            if (sErrExpected.length) {
                if (sErrExpected === 'GETTING') {
                    let got = this.parser.errors[0]
                        .toString()
                        .substr(0, 50)
                        .split('\r')[0]
                        .split('\n')[0];
                    UI512TestBase.warnAndAllowToContinue(`for input ${sInput} got\n${got}`);
                    return false;
                }

                assertTrue(
                    scontains(this.parser.errors[0].toString(), sErrExpected),
                    `1+|for input ${sInput} got different failure message, expected ${sErrExpected} ${
                        this.parser.errors
                    }`
                );

                return false;
            } else {
                assertTrue(false, `1*|for input ${sInput} got parse errors ${this.parser.errors}`);
            }
        } else {
            if (sErrExpected.length > 0) {
                let got = this.flattenParseTree(cst);
                assertTrue(false, `1)|for input ${sInput} expected failure but succeeded (${got}).`);
            }
        }

        return true;
    }

    /**
     * return flattened parse tree as a string
     */
    flattenParseTree(obj: any) {
        return this.flattenParseTreeRecurse(obj).join('\n');
    }

    /**
     * to make the flattened parse tree more succinct, strip out these expressions if they are empty!
     */
    protected skipPrintingIfNotSet: { [key: string]: [[string, number], [string, number]] } = {
        RuleExpr: [['RuleLvl1Expression', 1], ['RuleLvl1Expression', 0]],
        RuleLvl1Expression: [['RuleLvl2Expression', 1], ['RuleLvl2Expression', 0]],
        RuleLvl2Expression: [['RuleLvl2Sub', 0], ['RuleLvl3Expression', 0]],
        RuleLvl3Expression: [['RuleLvl4Expression', 1], ['RuleLvl4Expression', 0]],
        RuleLvl4Expression: [['RuleLvl5Expression', 1], ['RuleLvl5Expression', 0]],
        RuleLvl5Expression: [['RuleLvl6Expression', 1], ['RuleLvl6Expression', 0]]
    };

    /**
     * format a rule name
     */
    protected formatRuleName(s: string) {
        if (s.startsWith('Rule')) {
            s = s.substr('Rule'.length);
        }

        s = s.replace(/Expression/g, 'Expr');
        return s;
    }

    /**
     * format an image (string)
     */
    protected formatImage(tk: any) {
        if (tk.tokenType === tokenType(tks.TokenTkstringliteral)) {
            return ' ' + tk.image;
        } else if (tk.tokenType === tokenType(tks.TokenTkidentifier)) {
            return ' $' + tk.image;
        } else if (tk.tokenType === tokenType(tks.TokenTklparen) || tk.tokenType === tokenType(tks.TokenTkrparen)) {
            return ' "' + tk.image + '"';
        } else {
            return ' ' + tk.image;
        }
    }

    /**
     * flatten the parse tree recursively
     * some expressions like RuleLvl6Expression are filtered out, to make
     * the output less verbose
     * (otherwise nearly every expression would output every level 1-6)
     */
    protected flattenParseTreeRecurse(current: any): string[] {
        let skips = this.skipPrintingIfNotSet[current.name];
        const ch = current.children;
        if (skips) {
            /* make the output shorter, only showing the expression chain if it adds anything new */
            let [important, fallback] = skips;
            if (!ch[important[0]][important[1]]) {
                assertTrue(ch[fallback[0]], `1%|${current.name} ${fallback[0]}`);
                assertTrue(ch[fallback[0]][fallback[1]], `1$|${current.name} ${fallback}`);
                return this.flattenParseTreeRecurse(ch[fallback[0]][fallback[1]]);
            }
        } else if (current.name === 'RuleLvl6Expression') {
            /* make the output shorter, only showing a Lvl6Expression if it adds anything new */
            if (!ch.TokenTkplusorminus[0] && !ch.TokenNot[0] && !ch.RuleHChunk[0]) {
                if (ch.RuleExprSource[0]) {
                    return this.flattenParseTreeRecurse(ch.RuleExprSource[0]);
                }
            }
        }

        let ret = this.flattenParserTreeRecurseTypical(ch, current);
        ret[ret.length - 1] += ' )';
        return ret;
    }

    /**
     * flatten the parse tree recursively
     */
    protected flattenParserTreeRecurseTypical(ch: any, current: any) {
        let keys = Object.keys(ch);
        keys.sort();
        let ret = [];
        ret.push(this.formatRuleName(current.name) + '(');
        for (let key of keys) {
            for (let i = 0; i < ch[key].length; i++) {
                if (ch[key][i].image) {
                    ret[ret.length - 1] += this.formatImage(ch[key][i]);
                } else if (ch[key][i].children) {
                    let newret = this.flattenParseTreeRecurse(ch[key][i]);
                    ret = ret.concat(newret.map(s => '    ' + s));
                } else {
                    assertTrue(false, '1#|unknown entitity, not token or subrule?');
                }
            }
        }

        return ret;
    }
}

/**
 * wrapper around testParse, for the set command
 */
function testCmdSet(sInput: string, sExpected: string) {
    assertTrue(sInput.startsWith('set '), '1:|expected start with set');
    return TestParseHelpers.instance.testParse(sInput, 'RuleBuiltinCmdSet', sExpected, '');
}

/**
 * wrapper around testParse, asserts that it fails with the expected message
 */
function assertFailsCmdSet(sInput: string, sErrExpected: string) {
    assertTrue(sInput.startsWith('set '), '1/|expected start with set');
    return TestParseHelpers.instance.testParse(sInput, 'RuleBuiltinCmdSet', '', sErrExpected);
}

/**
 * wrapper around testParse, for an arbitrary command
 * we'll get the rule name by extracting the first word from sInput
 */
function testCmd(sInput: string, sExpected: string) {
    let sCmd = sInput.split(' ')[0];
    assertTrue(sInput.startsWith(sCmd + ' '), '1.|expected start with ' + sCmd);
    let firstCapital = sCmd[0].toUpperCase() + sCmd.slice(1).toLowerCase();
    firstCapital = firstCapital === 'Go' ? 'GoCard' : firstCapital;
    return TestParseHelpers.instance.testParse(sInput, 'RuleBuiltinCmd' + firstCapital, sExpected, '');
}

/**
 * wrapper around testParse, asserts that it fails with the expected message
 */
function assertFailsCmd(sInput: string, sErrExpected: string) {
    let sCmd = sInput.split(' ')[0];
    assertTrue(sInput.startsWith(sCmd + ' '), '1-|expected start with ' + sCmd);
    let firstCapital = sCmd[0].toUpperCase() + sCmd.slice(1).toLowerCase();
    firstCapital = firstCapital === 'Go' ? 'GoCard' : firstCapital;
    return TestParseHelpers.instance.testParse(sInput, 'RuleBuiltinCmd' + firstCapital, '', sErrExpected);
}
