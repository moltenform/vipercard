
/* auto */ import { cProductName } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, assertEqWarn } from '../../ui512/utils/utils512.js';
/* auto */ import { VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { TestVpcScriptRunBase } from '../../test/vpc/vpcTestScriptRunBase.js';

/**
 * test running ViperCard scripts.
 *
 * the syntax for a "test batch" is a tuple
 * [{script expression}, {expected result}]
 * for example, the following test passes:
 * ['1 + 1', '2']
 *
 * if you are testing a more complex expression or
 * command, you can write multiple lines, and use \\
 * at the end of the string to indicate what should be compared,
 * for example,
 *  ['put 1 + 1 into x\\x', '2']
 *
 *  or even
 *  ['put 1 into a \n put a + 1 into x\\x', '2']
 * the \\x means to evaluate x and compare it with 2.
 *
 */
export class TestVpcScriptRun extends TestVpcScriptRunBase {
    tests = [
        'async/vpctestscriptruninit',
        async () => {
            await this.initEnvironment();
        },
        'test_checkLexing',
        () => {
            let batch: [string, string][];
            batch = [
                /* empty lines don't interfere with scripts */
                ['\n\n\n\nput 1 into t1\n\n\n\\t1', '1'],

                /* wrong indentation doesn't interfere with scripts */
                ['\n         put 1 into t2\n\\t2', '1'],
                ['\n\t\t\t\t\tput 1 into t3\n\\t3', '1'],

                /* trailing whitespace doesn't interfere with scripts */
                ['\nput 1 into t4           \n\\t4', '1'],
                ['\nput 1 into t5\t\t\t\t\t\n\\t5', '1'],

                /* continued lines */
                ['put 1 {BSLASH}\n into t6\\t6', '1'],
                ['put {BSLASH}\n 1 {BSLASH}\n into {BSLASH}\n t7\\t7', '1'],
                ['put 8 into t8{BSLASH}\n{BSLASH}\n{BSLASH}\n\\t8', '8'],
                ['{BSLASH}\n{BSLASH}\n{BSLASH}\nput 9 into t9\\t9', '9'],

                /* continued lines with whitespace after the backslash */
                ['put 1 {BSLASH} \n into t6\\t6', '1'],
                ['put {BSLASH}\t  \n 1 {BSLASH}\t  \n into {BSLASH}\t  \n t7\\t7', '1'],

                /* continued lines should still show errors on the expected line */
                ['put {BSLASH}\n xyz into tnot\\tnot', 'ERR:no variable found with this name'],
                ['1 {BSLASH}\n + {BSLASH}\n xyz', 'ERR:no variable found with this name'],

                /* continue a across a line */
                ['put "a" & {BSLASH}\n "b" into test\\test', 'ab'],
                ['put 2 + {BSLASH}\n 3 into test\\test', '5'],

                /* string literal can contain comment symbols */
                ['put "--thetest" into test\\test', '--thetest'],
                ['put "  --thetest" into test\\test', '  --thetest'],
                ['put "aa--thetest" into test\\test', 'aa--thetest'],
                ['put "aa--thetest--test" into test\\test', 'aa--thetest--test'],

                /* lexing: most but not all constructs need whitespace */
                ['2*3*4', '24'],
                ['2 * 3 * 4', '24'],
                ['put 2 into myvar\\myvar', '2'],
                ['2*myvar*3', '12'],
                ['7 mod 3', '1'],
                ['7 div 3', '2'],
                ['7 mod3', 'ERR:MismatchedTokenException'],
                ['7 div3', 'ERR:MismatchedTokenException'],

                /* lexing: strings don't need space */
                ['"a"&"b"', 'ab'],
                ['"a"&&"b"', 'a b'],
                ['"single\'quotes ok"', "single'quotes ok"],
                ['"single\'quotes\'ok"', "single'quotes'ok"],

                /* it is ok if identifiers contain a keyword. ("of" is a keyword) */
                /* if "of" is a keyword, "of_" is still an ok variable name */
                /* this is why it's important that the lexer regex is */
                /* /of(?![a-zA-Z0-9_])/ and not just /of/ */
                ['put 4 into put4into\\put4into', '4'],
                ['put 4 into ofa\\ofa', '4'],
                ['put 4 into ofcards\\ofcards', '4'],
                ['put 4 into ofnumber\\ofnumber', '4'],
                ['put 4 into ofto\\ofto', '4'],
                ['put 4 into of_to\\of_to', '4'],
                ['put 4 into ofa\\ofa', '4'],
                ['put 4 into ofA\\ofA', '4'],
                ['put 4 into of1\\of1', '4'],
                ['put 4 into aof\\aof', '4'],
                ['put 4 into Aof\\Aof', '4'],
                ['put 4 into Zof\\Zof', '4'],
                ['put 4 into a\\a', '4'],
                ['put 4 into aa\\aa', '4'],

                /* dest needs to be a token of type TkIdentifier */
                ['put 4 into short\\0', 'ERR:support variables'],
                ['put 4 into long\\0', 'ERR:support variables'],
                ['put 4 into number\\0', 'ERR:support variables'],
                ['put 4 into length\\0', 'ERR:support variables'],
                ['put 4 into id\\0', 'ERR:support variables'],
                ['put 4 into if\\0', 'ERR:name not allowed'],
                ['put 4 into 4\\0', 'ERR:NotAllInputParsedException'],
                ['put 4 into in\\0', 'ERR:NotAllInputParsedException'],
                ['put 4 into and\\0', 'ERR:NotAllInputParsedException'],
                ['put 4 into autohilite\\0', 'ERR:name not allowed']
            ];

            this.testBatchEvaluate(batch);

            /* string literal cannot contain contline symbol since it has a newline */
            this.assertCompileErrorIn('put "a{BSLASH}\nb" into test', 'unexpected character: ->"<-', 3);
            this.assertCompileErrorIn('put "{BSLASH}\n" into test', 'unexpected character: ->"<-', 3);
            this.assertCompileErrorIn('put "{BSLASH}\n{BSLASH}\n" into test', 'unexpected character: ->"<-', 3);
            this.assertCompileErrorIn(
                'put {BSLASH}\n"{BSLASH}\n{BSLASH}\n"{BSLASH}\n into test',
                'unexpected character: ->"<-',
                4
            );

            /* we changed lexer to disallow this, since it is clearly wrong */
            this.assertCompileErrorIn('put 3into test', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3into into test', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3sin into test', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3of into test', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3id into test', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3e into test', 'unexpected character', 3);
            this.assertCompileErrorIn('put 7mod3 into test', 'unexpected character', 3);
            this.assertCompileErrorIn('put 7mod 3 into test', 'unexpected character', 3);
            this.assertCompileErrorIn('put 7div3 into test', 'unexpected character', 3);
            this.assertCompileErrorIn('put 7div 3 into test', 'unexpected character', 3);

            /* for keywords/semikeywords that would be a common variable name, check */
            this.assertCompileErrorIn('x = 4', "this isn't C", 3);
            this.assertCompileErrorIn('xyz(4)', "this isn't C", 3);
            this.assertCompileErrorIn('sin(4)', "this isn't C", 3);

            batch = [
                /* comments */
                [
                    `get 1 + 2 -- + 3 -- + 4
put it into x\\x`,
                    '3'
                ],
                [
                    `get 1 + 2 -- + 3 + 4
put it into x\\x`,
                    '3'
                ],
                [
                    `get 1 + 2 -- + 3
put it into x\\x`,
                    '3'
                ],
                [
                    `get 1 + 2 -- 3
put it into x\\x`,
                    '3'
                ],
                [
                    `get 1 + 2 --3
put it into x\\x`,
                    '3'
                ],
                [
                    `get 1 + 2--3
put it into x\\x`,
                    '3'
                ],
                [
                    `get 1 + 2-- 3
put it into x\\x`,
                    '3'
                ],
                [
                    `get 1 + 2- -3
put it into x\\x`,
                    '6'
                ],
                [
                    `get 1 + 2 - -3
put it into x\\x`,
                    '6'
                ],
                [
                    `get 1 + 2 - - 3
put it into x\\x`,
                    '6'
                ],
                [
                    `put 1 into x
-- put x + 1 into x
put x into x\\x`,
                    '1'
                ],
                [
                    `put 1 into x
-- put x + 1 into x
-- put x + 1 into x
-- put x + 1 into x
put x into x\\x`,
                    '1'
                ],
                [
                    `put 1 into x--'lex''error' #$%$%
  -- put x + 1 into x 'lex''error' #$%$%
put x into x\\x`,
                    '1'
                ],
                [
                    `put 1 into x--parse 0 error 0 number number number
    -- put x + 1 into x 0 parse 0 error 0 number number number
put x into x\\x`,
                    '1'
                ]
            ];
            this.testBatchEvaluate(batch);

            /* lexing: baseline for runGeneralCode */
            this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS('(placeholder)'));
            this.runGeneralCode('', 'global testresult \n put 123.0 into testresult');
            assertEq('123', this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(), '24|');

            /* lexing: invalid num literals */
            this.assertCompileErrorIn('put . into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put .5 into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put x.5 into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put e.5 into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put .e into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put .e2 into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put .e+2 into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put .3e into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3.4e into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3.4e 2 into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3.4ee into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3.4e4e into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put 3.44. into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put 0..1 into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put 4.. into x', 'unexpected character', 3);

            /* lexing: invalid string literals */
            this.assertCompileErrorIn('put "abc into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put "abc\ndef" into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put "\n" into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put " into x', 'unexpected character', 3);
            this.assertCompileErrorIn('put """ into x', 'unexpected character', 3);
            this.assertLineError('put a"" into x', 'MismatchedToken', 3);
            this.assertLineError('put ""a into x', 'MismatchedToken', 3);
            this.assertLineError('put a""a into x', 'MismatchedToken', 3);
            this.assertLineError('put 1"" into x', 'MismatchedToken', 3);
            this.assertLineError('put ""1 into x', 'MismatchedToken', 3);
            this.assertLineError('put 1""1 into x', 'MismatchedToken', 3);
            this.assertLineError('put """" into x', 'MismatchedToken', 3);
            this.assertLineError('put "a""b" into x', 'MismatchedToken', 3);
            this.assertLineError('put "a" "b" into x', 'MismatchedToken', 3);

            /* invalid identifiers */
            this.assertLineError('put "abc" into 1', 'NotAllInputParsedException', 3);
            this.assertLineError('put "abc" into 1 x', 'NotAllInputParsedException', 3);
            this.assertLineError('put "abc" into b c', 'NotAllInputParsedException', 3);
            this.assertLineError('put "abc" into "def"', 'NotAllInputParsedException', 3);
            this.assertCompileErrorIn('put "abc" into \x03', 'unexpected character', 3);
            this.assertCompileErrorIn('put "abc" into b\x03', 'unexpected character', 3);
            this.assertCompileErrorIn('put "abc" into \xf1', 'unexpected character', 3);
            this.assertCompileErrorIn('put "abc" into b\xf1', 'unexpected character', 3);

            /* not valid because it's something else */
            let notvalid = `pi,it,one,true,cr,autohilite,style,cursor,dontwrap,
                script,owner,name,target,sin,result,params,
                mouse,screenrect,from,into,after,before,at,with,on,
                end,exit,pass,return,if,else,while,until,global`;
            /* not 'id' 'of' 'length' 'first' because they are different tokens */
            let disallowedAsHandler = notvalid.replace(/\s/g, '').split(',');
            let disallowedAsVar = disallowedAsHandler
                .concat(['mouseup'])
                .filter(s => s !== 'before' && s !== 'into' && s !== 'after');

            /* can't use this as a name for variables */
            for (let reserved of disallowedAsVar) {
                this.assertLineError(`put "abc" into ${reserved}`, 'name not allowed', 3);
            }

            /* can't use this as a name for loop variables */
            for (let reserved of disallowedAsVar) {
                this.assertCompileErrorIn(`repeat with ${reserved} = 1 to 3\nend repeat`, 'reserved word', 3);
            }

            /* can't use this as a name for globals */
            for (let reserved of disallowedAsVar.concat(['before', 'after', 'into'])) {
                this.assertCompileErrorIn(`global ${reserved}`, 'reserved word', 3);
            }

            /* can't use this as a name for params */
            for (let reserved of disallowedAsVar.concat(['before', 'after', 'into'])) {
                this.assertCompileError(
                    `on myhandler p1, ${reserved}` + '\nglobal x\n' + `end myhandler`,
                    'reserved word',
                    1
                );
            }

            /* can't use this as a name for handlers */
            for (let reserved of disallowedAsHandler) {
                this.assertCompileError(`on ${reserved}` + '\nglobal x\n' + `end ${reserved}`, 'reserved word', 1);
            }

            /* can't use this as a name for calling a handler */
            for (let reserved of disallowedAsHandler) {
                let expectErr = 'reserved word';
                if (reserved === 'on') {
                    expectErr = 'invalid name';
                } else if (reserved === 'end' || reserved === 'exit' || reserved === 'pass') {
                    expectErr = 'wrong line length';
                } else if (reserved === 'if' || reserved === 'else') {
                    expectErr = 'end with "then"';
                } else if (reserved === 'return') {
                    expectErr = 'NotAllInputParsedException';
                }

                this.runGeneralCode('', `${reserved} 1, 2, 3`, expectErr, 3);
            }

            /* can't use these names, (different token type), checkCommonMistakenVarNames */
            let notvalidDifferentTokenType = `short,long,abbrev,number,length,
                id,first,second,last,mid,any,tenth`;
            let notvalidDifferentTks = notvalidDifferentTokenType.replace(/\s/g, '').split(',');

            /* try to use it as a variable name */
            for (let reserved of notvalidDifferentTks) {
                this.assertCompileErrorIn(`put 4 into ${reserved}`, 'support variables', 3);
            }

            /* try to use it as a parameter name */
            for (let reserved of notvalidDifferentTks) {
                this.assertCompileError(`on myHandler v1, ${reserved}\nend myHandler`, 'support variables', 1);
            }

            /* try to use it as a custom handler name */
            for (let reserved of notvalidDifferentTks) {
                this.assertCompileError(`on ${reserved}\nend ${reserved}`, 'support variables', 1);
            }
        },
        'test_execCommands',
        () => {
            /* choose tool */
            this.assertCompileErrorIn('choose', 'not enough args', 3);
            this.assertCompileErrorIn('choose tool', 'not enough args', 3);
            this.assertCompileErrorIn('choose 3', 'not enough args', 3);
            this.assertCompileErrorIn('choose pencil', 'not enough args', 3);
            this.assertCompileErrorIn('choose "pencil"', 'not enough args', 3);
            this.assertCompileErrorIn('choose "pencil" xyz', 'did not see the keyword', 3);
            this.assertCompileErrorIn('choose "pencil" "tool"', 'did not see the keyword', 3);

            let batch: [string, string][];
            batch = [
                ['choose "browse" tool\\tool()', 'browse'],
                ['choose "button" tool\\tool()', 'ERR:drawing only'],
                ['choose "field" tool\\tool()', 'ERR:drawing only'],
                ['choose "select" tool\\tool()', 'ERR:drawing only'],
                ['choose "brush" tool\\tool()', 'brush'],
                ['choose "bucket" tool\\tool()', 'bucket'],
                ['choose "stamp" tool\\tool()', 'ERR:drawing only'],
                ['choose "pencil" tool\\tool()', 'pencil'],
                ['choose "line" tool\\tool()', 'line'],
                ['choose "curve" tool\\tool()', 'curve'],
                ['choose "lasso" tool\\tool()', 'ERR:drawing only'],
                ['choose "eraser" tool\\tool()', 'eraser'],
                ['choose "rect" tool\\tool()', 'rect'],
                ['choose "oval" tool\\tool()', 'oval'],
                ['choose "roundrect" tool\\tool()', 'roundrect'],
                ['choose "spray" tool\\tool()', 'spray'],
                ['choose "spray can" tool\\tool()', 'spray'],
                ['choose "round rect" tool\\tool()', 'roundrect'],
                ['choose "round  rect" tool\\tool()', 'roundrect'],
                ['choose "xyz" tool\\tool()', 'ERR:Not a valid choice'],
                ['choose "" tool\\tool()', 'ERR:valid tool name']
            ];

            this.testBatchEvaluate(batch);

            /* add, subtract, divide, multiply */
            this.setCurrentCard(this.elIds.card_b_c);
            this.runGeneralCode('', 'put "0" into cd fld "p1"');
            this.assertLineError('add 4 with cd fld "p1"', 'MismatchedTokenException', 3);
            this.assertLineError('add 4 into cd fld "p1"', 'MismatchedTokenException', 3);
            this.assertLineError('add 4 from cd fld "p1"', 'MismatchedTokenException', 3);
            this.assertLineError('add 4 from cd fld "to"', 'MismatchedTokenException', 3);
            this.assertLineError('add 4 to', 'NoViableAltException', 3);
            this.assertLineError('add to cd fld "p1"', 'NoViableAltException', 3);
            this.assertCompileErrorIn('subtract 4 with cd fld "p1"', 'did not see the keyword', 3);
            this.assertCompileErrorIn('subtract 4 into cd fld "p1"', 'did not see the keyword', 3);
            this.assertCompileErrorIn('subtract 4 to cd fld "p1"', 'did not see the keyword', 3);
            this.assertCompileErrorIn('subtract 4 to cd fld "from"', 'did not see the keyword', 3);
            this.assertLineError('subtract 4 from', 'NoViableAltException', 3);
            this.assertLineError('subtract from cd fld "p1"', 'NoViableAltException', 3);
            this.assertCompileErrorIn('divide cd fld "p1"', 'did not see the keyword', 3);
            this.assertCompileErrorIn('divide cd fld "p1" to 4', 'did not see the keyword', 3);
            this.assertCompileErrorIn('divide cd fld "p1" with 4', 'did not see the keyword', 3);
            this.assertCompileErrorIn('divide cd fld "p1" from 4', 'did not see the keyword', 3);
            this.assertCompileErrorIn('divide cd fld "by" from 4', 'did not see the keyword', 3);
            this.assertLineError('divide cd fld "p1" by', 'NoViableAltException', 3);
            this.assertCompileErrorIn('multiply cd fld "p1"', 'did not see the keyword', 3);
            this.assertCompileErrorIn('multiply cd fld "p1" to 4', 'did not see the keyword', 3);
            this.assertCompileErrorIn('multiply cd fld "p1" with 4', 'did not see the keyword', 3);
            this.assertCompileErrorIn('multiply cd fld "p1" from 4', 'did not see the keyword', 3);
            this.assertCompileErrorIn('multiply cd fld "by" from 4', 'did not see the keyword', 3);
            this.assertLineError('multiply cd fld "p1" by', 'NoViableAltException', 3);

            batch = [
                /* operations */
                ['put 4 into x\\x', '4'],
                ['add (1+2) to x\\x', '7'],
                ['subtract (1+2) from x\\x', '4'],
                ['multiply x by (1+2)\\x', '12'],
                ['divide x by (1+3)\\x', '3'],

                /* operations, field */
                ['put "4" into cd fld "p1"\\0', '0'],
                ['add (1+2) to cd fld "p1"\\cd fld "p1"', '7'],
                ['subtract (1+2) from cd fld "p1"\\cd fld "p1"', '4'],
                ['multiply cd fld "p1" by (1+2)\\cd fld "p1"', '12'],
                ['divide cd fld "p1" by (1+3)\\cd fld "p1"', '3'],

                /* by item */
                ['put "3,4,5" into x\\0', '0'],
                ['add (1+2) to item 2 of x\\item 2 of x', '7'],
                ['subtract (1+2) from item 2 of x\\item 2 of x', '4'],
                ['multiply item 2 of x by (1+2)\\item 2 of x', '12'],
                ['divide item 2 of x by (1+3)\\item 2 of x', '3'],
                ['chartonum(x=="3,3,5")', '116'],

                /* by word */
                ['put "3  4  5" into x\\0', '0'],
                ['add (1+2) to word 2 of x\\word 2 of x', '7'],
                ['subtract (1+2) from word 2 of x\\word 2 of x', '4'],
                ['multiply word 2 of x by (1+2)\\word 2 of x', '12'],
                ['divide word 2 of x by (1+3)\\word 2 of x', '3'],
                ['chartonum(x=="3  3  5")', '116'],

                /* by char */
                ['put "345" into x\\0', '0'],
                ['add (1+2) to char 2 to 2 of x\\x', '375'],
                ['subtract (1+2) from char 2 to 2 of x\\x', '345'],
                ['multiply char 2 to 2 of x by (1+2)\\x', '3125'],
                ['divide char 2 to 3 of x by (1+3)\\x', '335'],

                /* not a number */
                ['put "4a" into cd fld "p2"\\0', '0'],
                ['add (1+2) to cd fld "p2"\\cd fld "p2"', 'ERR:expected a number'],
                ['subtract (1+2) from cd fld "p2"\\cd fld "p2"', 'ERR:expected a number'],
                ['multiply cd fld "p2" by (1+2)\\cd fld "p2"', 'ERR:expected a number'],
                ['divide cd fld "p2" by (1+3)\\cd fld "p2"', 'ERR:expected a number']
            ];

            this.testBatchEvaluate(batch, true);

            /* changing current card */
            this.setCurrentCard(this.elIds.card_b_c);
            this.assertCompileErrorIn('go', 'on its own', 3);
            this.assertCompileErrorIn('go back', "don't support", 3);
            this.assertCompileErrorIn('go forth', "don't support", 3);
            this.assertLineError('go "a"', 'NoViableAltException', 3);
            this.assertLineError('go 1', 'NoViableAltException', 3);
            this.assertLineError('go to cd btn id 1', 'NoViableAltException', 3);
            this.assertLineError('go to cd btn "p1"', 'NoViableAltException', 3);
            this.assertLineError('go xyz', 'Not a valid choice', 3);
            batch = [
                /* ord/position */
                ['the short id of this cd', `${this.elIds.card_b_c}`],
                ['go next\\the short id of this cd', `${this.elIds.card_b_d}`],
                ['go prev\\the short id of this cd', `${this.elIds.card_b_c}`],
                ['go previous\\the short id of this cd', `${this.elIds.card_b_b}`],
                ['go next\\the short id of this cd', `${this.elIds.card_b_c}`],
                ['go first\\the short id of this cd', `${this.elIds.card_a_a}`],
                ['go last\\the short id of this cd', `${this.elIds.card_c_d}`],
                ['go third\\the short id of this cd', `${this.elIds.card_b_c}`],

                /* object reference */
                ['go to this stack\\the short id of this cd', `${this.elIds.card_b_c}`],
                ['go to stack "other"\\the short id of this cd', `ERR:NoViableAltException`],
                ['go to stack id 999\\the short id of this cd', `ERR:NoViableAltException`],
                [`go to stack id ${this.vcstate.model.stack.id}\\the short id of this cd`, `ERR:NoViableAltException`],
                ['go to bg 1\\the short id of this cd', `${this.elIds.card_a_a}`],
                ['go to bg 3\\the short id of this cd', `${this.elIds.card_c_d}`],
                ['go to bg 2\\the short id of this cd', `${this.elIds.card_b_b}`],
                ['go to card 1\\the short id of this cd', `${this.elIds.card_a_a}`],
                ['go to card 4\\the short id of this cd', `${this.elIds.card_b_d}`],
                ['go to card 1 of this stack\\the short id of this cd', `ERR:MismatchedTokenException`],
                ['go to card 4 of this stack\\the short id of this cd', `ERR:MismatchedTokenException`],
                ['go to card 1 of bg 2\\the short id of this cd', `${this.elIds.card_b_b}`],
                ['go to card 1 of bg 3\\the short id of this cd', `${this.elIds.card_c_d}`],
                ['go to card 1 of bg 2 of this stack\\the short id of this cd', `${this.elIds.card_b_b}`],
                ['go to card 1 of bg 3 of this stack\\the short id of this cd', `${this.elIds.card_c_d}`],

                /* reference by name */
                ['go to card 1\ngo to card "a"\\the short id of this cd', `${this.elIds.card_a_a}`],
                ['go to card 1\ngo to card "b"\\the short id of this cd', `${this.elIds.card_b_b}`],
                ['go to card 1\ngo to card "c"\\the short id of this cd', `${this.elIds.card_b_c}`],
                ['go to card 1\ngo to card "d"\\the short id of this cd', `${this.elIds.card_b_d}`],
                ['go to card 1\ngo to card "d" of bg 2\\the short id of this cd', `${this.elIds.card_b_d}`],
                ['go to card 1\ngo to card "d" of bg 3\\the short id of this cd', `${this.elIds.card_c_d}`],

                /* getCardByOrdinal */
                ['go to card 1\\the short id of next cd', `${this.elIds.card_b_b}`],
                ['go to card 2\\the short id of next cd', `${this.elIds.card_b_c}`],
                ['go to card 3\\the short id of next cd', `${this.elIds.card_b_d}`],
                ['go to card 4\\the short id of next cd', `${this.elIds.card_c_d}`]
            ];
            this.testBatchEvaluate(batch);

            this.setCurrentCard(this.elIds.card_b_c);
            batch = [
                /* not valid */
                ['enable cd 1', `ERR:MismatchedTokenException`],
                ['enable bg 1', `ERR:MismatchedTokenException`],
                ['enable cd fld "p1"', `ERR:MismatchedTokenException`],
                ['disable cd 1', `ERR:MismatchedTokenException`],
                ['disable bg 1', `ERR:MismatchedTokenException`],
                ['disable cd fld "p1"', `ERR:MismatchedTokenException`],

                /* valid */
                ['disable cd btn "p1"\\the enabled of cd btn "p1"', `false`],
                ['disable cd btn "p1"\\the enabled of cd btn "p1"', `false`],
                ['enable cd btn "p1"\\the enabled of cd btn "p1"', `true`],
                ['enable cd btn "p1"\\the enabled of cd btn "p1"', `true`]
            ];
            this.testBatchEvaluate(batch);

            this.setCurrentCard(this.elIds.card_b_c);
            batch = [
                /* not valid */
                ['hide\\0', `ERR:NoViableAltException`],
                ['hide cd 1\\0', `ERR:NoViableAltException`],
                ['hide bg 1\\0', `ERR:NoViableAltException`],
                ['hide this stack\\0', `ERR:NotAllInputParsedException`],
                ['show\\0', `ERR:NoViableAltException`],
                ['show cd 1\\0', `ERR:NotAllInputParsedException`],
                ['show bg 1\\0', `ERR:NoViableAltException`],
                ['show this stack\\0', `ERR:NotAllInputParsedException`],
                ['show cd btn "p1" from 12, 23\\0', `ERR:NotAllInputParsedException`],
                ['show cd btn "p1" into 12, 23\\0', `ERR:NotAllInputParsedException`],
                ['show cd btn "p1" xyz 12, 23\\0', `ERR:NotAllInputParsedException`],
                ['show cd btn "p1" at 12\\0', `ERR:MismatchedTokenException`],
                ['show cd btn "p1" at "12a,23"\\0', `ERR:MismatchedTokenException`],
                ['show cd btn "p1" at "12,23a"\\0', `ERR:MismatchedTokenException`],
                ['show cd btn "p1" at 12, 23, 34\\0', `ERR:NotAllInputParsedException`],
                ['show cd btn "p1" at "12", "23", "34"\\0', `ERR:NotAllInputParsedException`],
                ['show cd btn "p1" at "12, 23, 34"\\0', `ERR:MismatchedTokenException`],

                /* valid */
                ['hide cd btn "p1"\\the visible of cd btn "p1"', `false`],
                ['hide cd btn "p1"\\the visible of cd btn "p1"', `false`],
                ['show cd btn "p1"\\the visible of cd btn "p1"', `true`],
                ['show cd btn "p1"\\the visible of cd btn "p1"', `true`],
                ['hide cd fld "p1"\\the visible of cd fld "p1"', `false`],
                ['hide cd fld "p1"\\the visible of cd fld "p1"', `false`],
                ['show cd fld "p1"\\the visible of cd fld "p1"', `true`],
                ['show cd fld "p1"\\the visible of cd fld "p1"', `true`],

                /* set locations */
                ['set the rect of cd btn "p1" to 10, 20, 40, 60\\0', `0`],
                ['show cd btn "p1" at 123, 234\\the loc of cd btn "p1"', `123,234`],
                ['show cd btn "p1" at 12, 23\\the loc of cd btn "p1"', `12,23`],
                ['show cd btn "p1" at "12", "23"\\the loc of cd btn "p1"', `12,23`],
                ['show cd btn "p1" at "12, 23"\\the loc of cd btn "p1"', `ERR:MismatchedTokenException`],
                ['show cd btn "p1" at (12), (" 23 ")\\the loc of cd btn "p1"', `12,23`],
                ['set the rect of cd fld "p1" to 10, 20, 40, 60\\0', `0`],
                ['show cd fld "p1" at 123, 234\\the loc of cd fld "p1"', `123,234`],
                ['show cd fld "p1" at 12, 23\\the loc of cd fld "p1"', `12,23`],
                ['show cd fld "p1" at "12", "23"\\the loc of cd fld "p1"', `12,23`],
                ['show cd fld "p1" at "12, 23"\\the loc of cd fld "p1"', `ERR:MismatchedTokenException`],
                ['show cd fld "p1" at (12), (" 23 ")\\the loc of cd fld "p1"', `12,23`]
            ];
            this.testBatchEvaluate(batch);

            batch = [
                ['put "pear,Apple2,z11,z2,11,2,apple1,peach" into initlist\\0', '0'],
                ['put initlist into x\\0', `0`],
                ['sort items of x\\x', `11,2,apple1,Apple2,peach,pear,z11,z2`],
                ['put initlist into x\\0', `0`],
                ['sort ascending items of x text\\x', `11,2,apple1,Apple2,peach,pear,z11,z2`],
                ['put initlist into x\\0', `0`],
                ['sort descending items of x text\\x', `z2,z11,pear,peach,Apple2,apple1,2,11`],
                ['put initlist into x\\0', `0`],
                ['sort items of x numeric\\x', `2,11,apple1,Apple2,peach,pear,z11,z2`],
                ['put initlist into x\\0', `0`],
                ['sort descending items of x numeric\\x', `z2,z11,pear,peach,Apple2,apple1,11,2`],
                ['put "pear"&cr&"Apple2"&cr&"z11"&cr&"z2"&cr&"11"&cr&"2"&cr&"apple1"&cr&"peach" into initlist\\0', `0`],
                ['put initlist into x\\0', `0`],
                ['sort lines of x\\x', `11\n2\napple1\nApple2\npeach\npear\nz11\nz2`],
                ['put initlist into x\\0', `0`],
                ['sort ascending lines of x text\\x', `11\n2\napple1\nApple2\npeach\npear\nz11\nz2`],
                ['put initlist into x\\0', `0`],
                ['sort descending lines of x text\\x', `z2\nz11\npear\npeach\nApple2\napple1\n2\n11`],
                ['put initlist into x\\0', `0`],
                ['sort lines of x numeric\\x', `2\n11\napple1\nApple2\npeach\npear\nz11\nz2`],
                ['put initlist into x\\0', `0`],
                ['sort descending lines of x numeric\\x', `z2\nz11\npear\npeach\nApple2\napple1\n11\n2`],
                ['sort xyz items of x\\x', `ERR:Not a valid choice`],
                ['sort xyz items of x xyz\\x', `ERR:Not a valid choice`],
                ['sort items of x xyz\\x', `ERR:Not a valid choice`],
                ['sort xyz of x\\x', `ERR:MismatchedTokenException`],
                ['sort xyz xyz of x\\x', `ERR:MismatchedTokenException`]
            ];
            this.testBatchEvaluate(batch);

            batch = [
                /* not yet supported */
                ['put "abcdef,123,456" into initlist\\0', '0'],
                ['put initlist into x\\0', '0'],
                ['delete cd btn "a1"\\0', 'ERR:not yet supported'],
                ['delete cd fld "a1"\\0', 'ERR:not yet supported'],
                ['delete cd 1\\0', 'ERR:NoViableAltException'],
                ['put "a" into x\ndelete x\\0', 'ERR:5:NoViableAltException'],
                ['put "abcdef,123,456" into x\ndelete item 2 of x\\x', 'ERR:5:not yet supported'],
                ['put "abcdef,123,456" into x\ndelete item 1 to 2 of x\\x', 'ERR:5:not yet supported'],
                ['put "abcdef,123,456" into x\ndelete item 999 of x\\x', 'ERR:5:not yet supported'],
                ['put "abcdef,123,456" into x\ndelete word 999 of x\\x', 'ERR:5:not yet supported'],
                ['put "abcdef,123,456" into x\ndelete line 999 of x\\x', 'ERR:5:not yet supported'],
                ['put "abcdef,123,456" into x\ndelete item 1 to 999 of x\\x', 'ERR:5:not yet supported'],
                ['put "abcdef,123,456" into x\ndelete item 2 to 999 of x\\x', 'ERR:5:not yet supported'],

                /* normal chunks */
                ['put "abcdef,123,456" into initlist\\0', '0'],
                ['put initlist into x\\0', '0'],
                ['delete first char of x\\x', 'bcdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['delete char 2 of x\\x', 'acdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['delete char 2 to 5 of x\\x', 'af,123,456'],

                /* big numbers */
                ['put initlist into x\\0', '0'],
                ['delete char 999 of x\\x', 'abcdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['delete char 2 to 999 of x\\x', 'a'],
                ['put initlist into x\\0', '0'],
                ['delete char 1 to 999 of x\\x', '']
            ];
            this.testBatchEvaluate(batch);

            this.setCurrentCard(this.elIds.card_b_c);
            batch = [
                ['put "abc"\\0', 'ERR:missing into'],
                ['put "abc" xyz\\0', 'ERR:missing into'],
                ['put "abc" xyz x\\0', 'ERR:missing into'],
                ['put "abc" xyz cd fld "p1"\\0', 'ERR:missing into'],
                ['put "abc" xyz line 1 to into of cd fld "p1"\\0', 'ERR:MismatchedTokenException'],
                ['put "abc" into line 1 to into of cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" into line 1 to before of cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" into line 1 to after of cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" before line 1 to into of cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" before line 1 to before of cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" before line 1 to after of cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" after line 1 to into of cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" after line 1 to before of cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" after line 1 to after of cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" into into cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" into after cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" into before cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" before into cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" before after cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" before before cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" after into cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" after after cd fld "p1"\\0', 'ERR:only see one'],
                ['put "abc" after before cd fld "p1"\\0', 'ERR:only see one'],
                ['put "ab,cd,ef,12,34,56,78" into inititms\\0', '0'],
                ['put "abcdef,123,456" into initlist\\0', '0'],

                /* empty string into */
                ['put initlist into x\\0', '0'],
                ['put "" into char 2 of x\\x', 'acdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "" into char 2 to 5 of x\\x', 'af,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "" into char 999 of x\\x', 'abcdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "" into char 888 to 999 of x\\x', 'abcdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "" into char 2 to 999 of x\\x', 'a'],

                /* empty string before/after */
                ['put initlist into x\\0', '0'],
                ['put "" before char 2 of x\\x', 'abcdef,123,456'],
                ['put "" after char 2 of x\\x', 'abcdef,123,456'],
                ['put "" before char 2 to 5 of x\\x', 'abcdef,123,456'],
                ['put "" after char 2 to 5 of x\\x', 'abcdef,123,456'],
                ['put "" before char 999 of x\\x', 'abcdef,123,456'],
                ['put "" after char 999 of x\\x', 'abcdef,123,456'],
                ['put "" before char 888 to 999 of x\\x', 'abcdef,123,456'],
                ['put "" after char 888 to 999 of x\\x', 'abcdef,123,456'],

                /* medium sized string into */
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" into char 2 of x\\x', 'aqwertyqwertycdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" into char 2 to 5 of x\\x', 'aqwertyqwertyf,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" into char 999 of x\\x', 'abcdef,123,456qwertyqwerty'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" into char 888 to 999 of x\\x', 'abcdef,123,456qwertyqwerty'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" into char 2 to 999 of x\\x', 'aqwertyqwerty'],

                /* medium sized string before/after */
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" before char 2 of x\\x', 'aqwertyqwertybcdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" after char 2 of x\\x', 'abqwertyqwertycdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" before char 2 to 5 of x\\x', 'aqwertyqwertybcdef,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" after char 2 to 5 of x\\x', 'abcdeqwertyqwertyf,123,456'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" before char 999 of x\\x', 'abcdef,123,456qwertyqwerty'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" after char 999 of x\\x', 'abcdef,123,456qwertyqwerty'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" before char 888 to 999 of x\\x', 'abcdef,123,456qwertyqwerty'],
                ['put initlist into x\\0', '0'],
                ['put "qwertyqwerty" after char 888 to 999 of x\\x', 'abcdef,123,456qwertyqwerty'],

                /* items */
                ['put inititms into x\\0', '0'],
                ['put "" into item 2 of x\\x', 'ab,,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "" into item 2 to 5 of x\\x', 'ab,,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "" into item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
                ['put inititms into x\\0', '0'],
                ['put "" into item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
                ['put inititms into x\\0', '0'],
                ['put "" into item 2 to 999 of x\\x', 'ab,'],

                /* empty string before/after */
                ['put inititms into x\\0', '0'],
                ['put "" before item 2 of x\\x', 'ab,cd,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "" after item 2 of x\\x', 'ab,cd,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "" before item 2 to 5 of x\\x', 'ab,cd,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "" after item 2 to 5 of x\\x', 'ab,cd,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "" before item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
                ['put inititms into x\\0', '0'],
                ['put "" after item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
                ['put inititms into x\\0', '0'],
                ['put "" before item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
                ['put inititms into x\\0', '0'],
                ['put "" after item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
                ['put inititms into x\\0', '0'],
                ['put "" before item 2 to 12 of x\\x', 'ab,cd,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "" after item 2 to 12 of x\\x', 'ab,cd,ef,12,34,56,78'],

                /* medium sized string into */
                ['put inititms into x\\0', '0'],
                ['put "qwerty" into item 2 of x\\x', 'ab,qwerty,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" into item 2 to 5 of x\\x', 'ab,qwerty,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" into item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" into item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" into item 2 to 12 of x\\x', 'ab,qwerty'],

                /* medium sized string before/after */
                ['put inititms into x\\0', '0'],
                ['put "qwerty" before item 2 of x\\x', 'ab,qwertycd,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" after item 2 of x\\x', 'ab,cdqwerty,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" before item 2 to 5 of x\\x', 'ab,qwertycd,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" after item 2 to 5 of x\\x', 'ab,cd,ef,12,34qwerty,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" before item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" after item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" before item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" after item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" before item 2 to 12 of x\\x', 'ab,qwertycd,ef,12,34,56,78'],
                ['put inititms into x\\0', '0'],
                ['put "qwerty" after item 2 to 12 of x\\x', 'ab,cd,ef,12,34,56,78qwerty'],

                /* with variables that aren't yet defined */
                /* we'll treat it as an empty string, unless you are trying to use with a chunk */
                ['put "abc" into newvar1\\newvar1', 'abc'],
                ['put "abc" before newvar2\\newvar2', 'abc'],
                ['put "abc" after newvar3\\newvar3', 'abc'],
                ['put "abc" into char 2 of newvar4\\0', 'ERR:no variable found'],
                ['put "abc" before char 2 of newvar5\\0', 'ERR:no variable found'],
                ['put "abc" after char 2 of newvar6\\0', 'ERR:no variable found'],
                ['put "abc" into char 2 to 3 of newvar7\\0', 'ERR:no variable found'],
                ['put "abc" before char 2 to 3 of newvar8\\0', 'ERR:no variable found'],
                ['put "abc" after char 2 to 3 of newvar9\\0', 'ERR:no variable found']
            ];
            this.testBatchEvaluate(batch);

            batch = [
                ['get 1+2\\it', `3`],
                ['get xyz()\\it', `ERR:no handler`],
                ['get the environment\\it', `development`],
                ['get the systemversion()\\it', `7.55`],
                ['get abs(-2)\\it', `2`],
                ['get sum(3,4,5)\\it', `12`],
                ['get - char 1 to 2 of 345\\it', `-34`],
                ['get not true\\it', `false`],
                ['get\\0', `ERR:NoViableAltException`],
                ['get the\\0', `ERR:NoViableAltException`],
                ['put 123 into it\\0', `ERR:variable name not allowed`]
            ];
            this.testBatchEvaluate(batch);
        },
        'test_ifStatementsAndRepeats',
        () => {
            /*
            important to reset flags in a loop:
            the state of which if branch has been taken
            must not be used after encountering "next repeat"
                repeat with x = 1 to 4
                    if x = 2 then
                        print "a"
                    else if x = 3 then
                        next repeat
                    else
                        print "b"
                    end if
                end repeat
            */
            let batch: [string, string][];
            batch = [
                [
                    `put 2 into x
if 2+3 > 4 then
put 3 into x
end if` + '\\x',
                    '3'
                ],
                [
                    `put 2 into x
if 2+3 < 4 then
put 3 into x
end if` + '\\x',
                    '2'
                ],
                [
                    `put 2 into x
if 2+3 > 4 and the number of cds in this stack is in "456" then
put 3 into x
end if` + '\\x',
                    '3'
                ],
                [
                    `put 2 into x
if 2+3 > 4 and the number of cds in this stack is not in "456" then
put 3 into x
end if` + '\\x',
                    '2'
                ],
                [
                    `put 2 into x
if 2+3 < 4 or the number of cds in this stack is in "456" then
put 3 into x
end if` + '\\x',
                    '3'
                ],
                [
                    `put 2 into x
if 2+3 < 4 or the number of cds in this stack is not in "456" then
put 3 into x
end if` + '\\x',
                    '2'
                ],
                [
                    `put 2 into x
if 2+3 < 4 then
put 3 into x
else if 2+3 is 6 then
put 4 into x
end if` + '\\x',
                    '2'
                ],
                [
                    `put 2 into x
if 2+3 < 4 then
put 3 into x
else if 2+3 is 5 then
put 4 into x
end if` + '\\x',
                    '4'
                ],
                [
                    `if 2+3 < 4 then
put 100 into x
else
put 101 into x
end if` + '\\x',
                    '101'
                ],
                [
                    `if 2+3 > 4 then
put 100 into x
else
put 101 into x
end if` + '\\x',
                    '100'
                ],
                /* use counter to see which loop conditions have been evaluated */
                [
                    `put counting() into cfirst
if char 1 of counting() is "z" or 2+3 is 5 then
put 1000 into x
else if char 1 of counting() is "z" or 2+3 is 6 then
put 1001 into x
else if char 1 of counting() is "z" or 2+3 is 7 then
put 1002 into x
else
put 1003 into x
end if` + '\\x && (counting() - cfirst)',
                    '1000 2'
                ],
                [
                    `put counting() into cfirst
if char 1 of counting() is "z" or 2+3 is 4 then
put 1000 into x
else if char 1 of counting() is "z" or 2+3 is 5 then
put 1001 into x
else if char 1 of counting() is "z" or 2+3 is 6 then
put 1002 into x
else
put 1003 into x
end if` + '\\x && (counting() - cfirst)',
                    '1001 3'
                ],
                [
                    `put counting() into cfirst
if char 1 of counting() is "z" or 2+3 is 3 then
put 1000 into x
else if char 1 of counting() is "z" or 2+3 is 4 then
put 1001 into x
else if char 1 of counting() is "z" or 2+3 is 5 then
put 1002 into x
else
put 1003 into x
end if` + '\\x && (counting() - cfirst)',
                    '1002 4'
                ],
                [
                    `put counting() into cfirst
if char 1 of counting() is "z" or 2+3 is 2 then
put 1000 into x
else if char 1 of counting() is "z" or 2+3 is 3 then
put 1001 into x
else if char 1 of counting() is "z" or 2+3 is 4 then
put 1002 into x
else
put 1003 into x
end if` + '\\x && (counting() - cfirst)',
                    '1003 4'
                ],
                /* order matters */
                [
                    `if char 1 of "abc" is "b" then
put 20 into x
else if char 1 of "abc" is "a" then
put 21 into x
else if true then
put 22 into x
end if\\x`,
                    '21'
                ],
                /* nested if */
                [
                    `if 4 > 3 then
if 4 > 2 then
if 4 > 1 then
put 100 into x
end if
end if
end if\\x`,
                    '100'
                ]
            ];
            this.testBatchEvaluate(batch);

            /* repeats */
            batch = [
                /* simple loop */
                [
                    `put "a" into s
put 0 into i
repeat while i<3
put s && i into s
put i+1 into i
end repeat\\s`,
                    `a 0 1 2`
                ],
                /* condition never true */
                [
                    `put "a" into s
put 0 into i
repeat while i>0
put s && i into s
put i+1 into i
end repeat\\s`,
                    `a`
                ],
                /* simple loop */
                [
                    `put "b" into s
put 0 into i
repeat until i>=3
put s && i into s
put i+1 into i
end repeat\\s`,
                    `b 0 1 2`
                ],
                /* condition never true */
                [
                    `put "b" into s
put 0 into i
repeat until i>=0
put s && i into s
put i+1 into i
end repeat\\s`,
                    `b`
                ],
                /* nested loop, and a second loop right after the first */
                [
                    `put "a" into s
put 0 into i
repeat while i<3
put 0 into j
repeat while j<2
put s && "j" & j into s
put j+1 into j
end repeat
put s && i into s
put i+1 into i
end repeat
repeat while j<4
put s && "j" & j into s
put j+1 into j
end repeat\\s`,
                    `a j0 j1 0 j0 j1 1 j0 j1 2 j2 j3`
                ],
                /* inner loop changes iteration count */
                [
                    `put "a" into s
put 0 into i
repeat while i<3
put i+1 into i
put 0 into j
repeat while j<i
put s && i & "," & j into s
put j+1 into j
end repeat
end repeat\\s`,
                    `a 1,0 2,0 2,1 3,0 3,1 3,2`
                ],
                /* condition must be checked every iteration */
                [
                    `put "b" into s
put 0 into i
put counting() into firstc
repeat until i>=(3 + counting() * 0)
put s && i into s
put i+1 into i
end repeat\\s && (counting() - firstc)`,
                    `b 0 1 2 5`
                ],
                /* "times" syntax rewriting, simplest form. */
                /* currently, the condition is evaluated every time. */
                [
                    `put "a" into s
put counting() into firstc
repeat (counting() * 0 + 3) times
put s && "a" into s
end repeat\\s && (counting() - firstc)`,
                    `a a a a 5`
                ],
                /* "times" syntax rewriting, loop never done */
                [
                    `put "a" into s
put counting() into firstc
repeat (counting() * 0 + 0) times
put s && "a" into s
end repeat\\s && (counting() - firstc)`,
                    `a 2`
                ],
                /* "times" syntax rewriting, loop never done */
                [
                    `put "a" into s
put counting() into firstc
repeat (counting() * 0 - 1) times
put s && "a" into s
end repeat\\s && (counting() - firstc)`,
                    `a 2`
                ],
                /* "with" syntax rewriting, simplest form. */
                [
                    `put "a" into s
put counting() into firstc
repeat with x = 1 to (counting() * 0 + 3)
put s && "a" & x into s
end repeat\\s && (counting() - firstc)`,
                    `a a1 a2 a3 5`
                ],
                /* "with" syntax rewriting, loop never done */
                [
                    `put "a" into s
put counting() into firstc
repeat with x = 1 to (counting() * 0 + 0)
put s && "a" into s
end repeat\\s && (counting() - firstc)`,
                    `a 2`
                ],
                /* "with" syntax rewriting, loop never done */
                [
                    `put "a" into s
put counting() into firstc
repeat with x = 1 to (counting() * 0 - 1)
put s && "a" into s
end repeat\\s && (counting() - firstc)`,
                    `a 2`
                ],
                /* "with down" syntax rewriting, simplest form. */
                [
                    `put "a" into s
put counting() into firstc
repeat with x = 3 down to (counting() * 0)
put s && "a" & x into s
end repeat\\s && (counting() - firstc)`,
                    `a a3 a2 a1 a0 6`
                ],
                /* "with down" syntax rewriting, loop never done */
                [
                    `put "a" into s
put counting() into firstc
repeat with x = 0 down to (1 + counting() * 0)
put s && "a" into s
end repeat\\s && (counting() - firstc)`,
                    `a 2`
                ],
                /* "with down" syntax rewriting, loop never done */
                [
                    `put "a" into s
put counting() into firstc
repeat with x = -1 down to (1 + counting() * 0)
put s && "a" into s
end repeat\\s && (counting() - firstc)`,
                    `a 2`
                ],
                /* "with" syntax rewriting, expect start only eval'd once */
                [
                    `put "a" into s
put counting() into firstc
repeat with x = (counting() * 0 + 1) to 3
put s && "a" into s
end repeat\\s && (counting() - firstc)`,
                    `a a a a 2`
                ],
                /* "with" syntax rewriting, nested loop */
                [
                    `put "a" into s
repeat with i = 0 to 2
repeat with j = 0 to 1
put s && "j" & j into s
end repeat
put s && i into s
end repeat
repeat with k = j to 4
put s && "k" & k into s
end repeat\\s`,
                    `a j0 j1 0 j0 j1 1 j0 j1 2 k1 k2 k3 k4`
                ],
                /* "with" syntax rewriting, inner loop count changes */
                [
                    `put "a" into s
repeat with i = 0 + 0 to 2 + 0
repeat with j = 0 + 0 to i
put s && (i+1) & "," & j into s
end repeat
end repeat\\s`,
                    `a 1,0 2,0 2,1 3,0 3,1 3,2`
                ],
                /* simple test next repeat */
                [
                    `put "a" into s
repeat with x = 1 to 3
put s && x into s
next repeat
put "_" into s
end repeat\\s`,
                    `a 1 2 3`
                ],
                /* simple test exit repeat */
                [
                    `put "a" into s
repeat with x = 1 to 3
put s && x into s
exit repeat
put "_" into s
end repeat\\s`,
                    `a 1`
                ],
                /* next repeat in the nested loop */
                [
                    `put "a" into s
repeat with i = 0 to 2
repeat with j = 0 to i
put s && (i+1) & "," & j into s
next repeat
put "_" into s
end repeat
end repeat\\s`,
                    `a 1,0 2,0 2,1 3,0 3,1 3,2`
                ],
                /* next repeat out of the nested loop */
                [
                    `put "a" into s
repeat with i = 0 to 2
repeat with j = 0 to i
put s && (i+1) into s
put s & "," & j into s
end repeat
next repeat
put "_" into s
end repeat\\s`,
                    `a 1,0 2,0 2,1 3,0 3,1 3,2`
                ],
                /* exit repeat in the nested loop */
                [
                    `put "a" into s
repeat with i = 0 to 2
repeat with j = 0 to i
put s && (i+1) & "," & j into s
exit repeat
put "_" into s
end repeat
end repeat\\s`,
                    `a 1,0 2,0 3,0`
                ],
                /* exit repeat out of the nested loop */
                [
                    `put "a" into s
repeat with i = 0 to 2
repeat with j = 0 to i
put s && (i+1) into s
put s & "," & j into s
end repeat
exit repeat
put "_" into s
end repeat\\s`,
                    `a 1,0`
                ]
            ];

            this.testBatchEvaluate(batch);

            /* repeats and if statements */
            batch = [
                /* if statement inside a loop */
                [
                    `put "a" into s
repeat with x = 1 to 4
if x == 2 or x == 4 then
put s && x into s
end if
end repeat\\s`,
                    `a 2 4`
                ],
                /* nested if statement inside a loop */
                [
                    `put "a" into s
repeat with x = 1 to 5
if x >= 3 then
    if x >= 4 then
        if x >= 5 then
            put "got5" after s
        else
            put "got4" after s
        end if
    else
        put "got3" after s
    end if
else
    if x >= 2 then
        put "got2" after s
    else
        if x >= 1 then
            put "got1" after s
        else
            put "_" after s
        end if
    end if
end if
end repeat\\s`,
                    `agot1got2got3got4got5`
                ],
                /* if statement and exit repeat */
                [
                    `put "a" into s
repeat with x = 1 to 4
put s && x into s
if x == 2 then
exit repeat
end if
end repeat\\s`,
                    `a 1 2`
                ],
                /* if statement and next repeat */
                [
                    `put "a" into s
repeat with x = 1 to 4
put s && x into s
if x == 2 then
next repeat
end if
put s & "-" into s
end repeat\\s`,
                    `a 1- 2 3- 4-`
                ],
                /* nested if statement and exit repeat */
                [
                    `put "a" into s
repeat with x = 1 to 6
put s && x into s
if x mod 2 is 0 then
if x > 2 then
exit repeat
end if
end if
end repeat\\s`,
                    `a 1 2 3 4`
                ],
                /* nested if statement and next repeat */
                [
                    `put "a" into s
repeat with x = 1 to 6
put s && x into s
if x mod 2 is 0 then
if x > 2 then
next repeat
end if
end if
put s & "-" into s
end repeat\\s`,
                    `a 1- 2- 3- 4 5- 6`
                ],
                /* exit repeat out of infinite loop */
                [
                    `put "a" into s
repeat
put s & "a" into s
if the length of s > 4 then
exit repeat
end if
end repeat\\s`,
                    `aaaaa`
                ],
                /* if statements *must* be reset */
                [
                    `put "a" into s
repeat with x = 1 to 4
    if x is 1 then
        put s && "a" into s
    else if x is 4 then
        put s && "z" into s
    else if x is 3 then
        next repeat
    else
        put s && "b" into s
    end if
    put s & "-" into s
end repeat\\s`,
                    `a a- b- z-`
                ],
                /* loop inside of an if */
                [
                    `put "a" into s
if char 1 of "abc" is "a" then
repeat with x = 1 to 3
put s&&x into s
end repeat
else
put "_" into s
end if\\s`,
                    `a 1 2 3`
                ]
            ];
            this.testBatchEvaluate(batch);

            /* locals, globals, and variable scopes */
            this.vcstate.runtime.codeExec.globals.set('testvar', VpcValS('1'));
            batch = [
                /* simple locals read/write */
                ['put 3 into x\\x', '3'],
                ['3 * x', '9'],
                ['put 4 into x\\x', '4'],
                ['3 * x', '12'],

                /* simple globals read/write */
                ['global gx\\0', '0'],
                ['put 3 into gx\\gx', '3'],
                ['3 * gx', '9'],
                ['put 4 into gx\\gx', '4'],
                ['3 * gx', '12'],

                /* variable not defined */
                ['3 * undefinedlocal', 'ERR:no variable found'],

                /* declaring a global gives it "" */
                ['global newlydefinedglobal\\"a" & newlydefinedglobal', 'a'],
                ['global newlydefinedglobal\\newlydefinedglobal is ""', 'true'],

                /* if you don't declare it as a global, it is treated as a local */
                ['3 * testvar', 'ERR:no variable found'],
                ['put "z" into testvar\\testvar', 'z'],
                ['put "z" into testvar\nglobal testvar\\testvar', '1']
            ];
            this.testBatchEvaluate(batch);
        },
        'test_calls',
        () => {
            let batch: [string, string][];
            batch = [
                /* attempt to call something that isn't a valid custom handler */
                ['3 + abs(4)', '7'],
                ['3 + xyz(4)', 'ERR:no handler'],
                ['3 + mousewithin(4)', 'ERR:no such function'],
                ['3 + with(4)', 'ERR:no such function'],
                ['3 + at(4)', 'ERR:no such function'],
                ['3 + into(4)', 'ERR:only see one'],
                ['3 + from(4)', 'ERR:no such function'],
                ['3 + autohilite(4)', 'ERR:no such function'],
                ['3 + style(4)', 'ERR:no such function'],
                ['3 + locktext(4)', 'ERR:no such function'],
                ['3 + one(4)', 'ERR:no such function'],
                ['3 + pi(4)', 'ERR:no such function'],

                /* the result before anything is called */
                ['put 3 into result\\0', 'ERR:name not allowed'],
                ['result()', ''],
                ['the result()', '']
            ];
            this.testBatchEvaluate(batch);

            /* call a custom handler */
            this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS('(placeholder)'));
            this.runGeneralCode(
                `on myhandler
global x
put x + 1 into x
end myhandler`,
                `global x, testresult
put 3 into x
myhandler
put x into testresult`
            );
            assertEqWarn('4', this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(), '23|');

            /* wrong name for the handler */
            this.runGeneralCode(
                `on myhandler
global x
put x + 1 into x
end myhandler`,
                `global x, testresult
put 3 into x
myhandler2
put x into testresult`,
                'no handler',
                8
            );

            /* longer call stack */
            this.runGeneralCode(
                `on myhandler1
global x
put x && "myhandler1" into x
end myhandler1
on myhandler2
global x
put x && "myhandler2" into x
myhandler1
put x && "j" into x
end myhandler2
on myhandler3
global x
put x && "myhandler3" into x
myhandler2
put x && "i" into x
end myhandler3
on myhandler4
global x
put x && "myhandler4" into x
myhandler3
put x && "h" into x
end myhandler4`,
                `global x, testresult
put "" into x
myhandler4
put x into testresult`
            );
            assertEqWarn(
                ' myhandler4 myhandler3 myhandler2 myhandler1 j i h',
                this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(),
                '22|'
            );
            /* return value from one must not bleed down into the rest */
            this.runGeneralCode(
                `on myhandler1
    return 4
end myhandler1
on myhandler2
    myhandler1
end myhandler2`,
                `global testresult
myhandler2
put "a" & the result into testresult`
            );
            assertEqWarn('a', this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(), '21|');
            /* handler with arguments */
            this.runGeneralCode(
                `on myhandler arg1
global x
if the paramcount is 1 and the params is "hi" then
put x && "myhandler" & arg1 into x
end if
end myhandler
on myhandlerMany arg1, arg2, arg3
global x
if the paramcount is 3 and the params is "h1,h2,h3" then
put x && "myhandlermany" & arg1 & arg2 & arg3 into x
end if
end myhandlerMany`,
                `global x, testresult
put "a" into x
myhandler "hi"
myhandler "not"
myhandlerMany "h1", "h2", "h3"
myhandlerMany "h1,h2,h3"
myhandler "hi"
put x into testresult`
            );
            assertEqWarn(
                'a myhandlerhi myhandlermanyh1h2h3 myhandlerhi',
                this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(),
                '20|'
            );
            /* expect arguments eval'd from left to right */
            this.runGeneralCode(
                `on myhandler a1, a2, a3
global x, testresult
put testresult && (a1 - x) into testresult
put testresult && (a2 - x) into testresult
put testresult && (a3 - x) into testresult
end myhandler`,
                `global x, testresult
put counting() into x
put "" into testresult
myhandler counting(), counting(), counting()`
            );
            assertEqWarn(' 1 2 3', this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(), '1~|');
            /* variadic handlers / giving a handler the wrong number of args */
            this.runGeneralCode(
                `on printargs a1, a2
global x
put cr & "#args=" & the paramcount after x
put " alla1=" & param(1) after x
put " alla2=" & param(2) after x
put " alla3=" & param(3) after x
put " alla=" & the params after x
put " a1=" & a1 after x
put " a2=" & a2 after x
end printargs`,
                `global x, testresult
put "" into x
printargs
printargs "a"
printargs ("a")
printargs "a", ("" & "b")
printargs "a", ("b")
printargs "a", "b"
printargs "a", "b", "c"
put x into testresult`
            );
            assertEqWarn(
                `
#args=0 alla1= alla2= alla3= alla= a1= a2=
#args=1 alla1=a alla2= alla3= alla=a a1=a a2=
#args=1 alla1=a alla2= alla3= alla=a a1=a a2=
#args=2 alla1=a alla2=b alla3= alla=a,b a1=a a2=b
#args=2 alla1=a alla2=b alla3= alla=a,b a1=a a2=b
#args=2 alla1=a alla2=b alla3= alla=a,b a1=a a2=b
#args=3 alla1=a alla2=b alla3=c alla=a,b,c a1=a a2=b`,
                this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(),
                '1}|'
            );

            /* handler with return value */
            this.runGeneralCode(
                `on myhandler arg1
global x
put arg1 + 1 into y
return arg1 * y
put x && "should not be reached" into x
end myhandler
`,
                `global x, testresult
put "" into x
myhandler 4
put the result into ret
put ret & x into testresult`
            );
            assertEqWarn('20', this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(), '1||');
            /* exit handler and exit product */
            this.runGeneralCode(
                `on myhandler arg1
global testresult
if arg1 is 10 then
exit myhandler
else if arg1 is 12 then
exit to ${cProductName}
end if
put testresult && "called" && arg1 into testresult
end myhandler
`,
                `global testresult
put "" into testresult
myhandler 9
myhandler 10
myhandler 11
myhandler 12
myhandler 13
myhandler 14`
            );
            assertEqWarn(
                ' called 9 called 11',
                this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(),
                '1{|'
            );
            /* recursion in a handler */
            this.runGeneralCode(
                `on myhandler p
if p is 1 then
    return p
else
    myhandler p-1
    put the result into got
    return p * got
end if
end myhandler
`,
                `global testresult
myhandler 4
put the result into testresult`
            );
            assertEqWarn('24', this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(), '1`|');
            /* a simple custom function! */
            this.runGeneralCode(
                `${this.customFunc} myfn p
return p * (p + 1)
end myfn
`,
                `global testresult
put myfn(2+myfn(3)) into testresult`
            );
            assertEqWarn('210', this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(), '1_|');
            /* recursion. use g to 1) verify number of recursive calls and */
            /* 2) run a real statement like "put" that can't be part of an eval'd expression */
            this.runGeneralCode(
                `${this.customFunc} recurse p
global g
put g + 1 into g
if p is 1 then
    return p
else
    return p * recurse(p-1)
end if
end recurse
`,
                `global testresult, g
put 0 into g
put recurse(5) into testresult
put testresult && g into testresult`
            );
            assertEqWarn('120 5', this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(), '1^|');
            /* mutual recursion */
            this.runGeneralCode(
                `${this.customFunc} isEven n
if n is 0 then
return true
else
return isOdd(n - 1)
end if
end isEven

${this.customFunc} isOdd n
if n is 0 then
return false
else
return isEven(n - 1)
end if
end isOdd
`,
                `global testresult
put isEven(8) && isEven(9) && isEven(10) into testresult`
            );
            assertEqWarn(
                'true false true',
                this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(),
                '1]|'
            );
            /* nesting/interesting custom function calls */
            /* we *manually* parse custom fn calls by counting parenthesis levels so this needs to be tested */
            this.setCurrentCard(this.elIds.card_a_a);
            this.updateObjectScript(
                this.elIds.card_a_a,
                `${this.customFunc} mm p1, p2, p3
        global g
        put g+1 into g
        return "m" & g & "(" & p1 & "," & p2 & "," & p3 & ")"
        end mm`
            );
            batch = [
                /* simple calls */
                ['global g\nput 0 into g\\0', '0'],
                ['put mm() into ret\\ret', 'm1(,,)'],
                ['put mm(1) into ret\\ret', 'm2(1,,)'],
                ['put mm(1,2) into ret\\ret', 'm3(1,2,)'],
                ['put mm(1,2,3) into ret\\ret', 'm4(1,2,3)'],
                /* expect to be called left to right */
                ['global g\nput 0 into g\\0', '0'],
                ['put mm(10) && mm(11) into ret\\ret', 'm1(10,,) m2(11,,)'],
                ['put (char 2 to 4 of mm(10)) && (char 2 to 4 of mm(11)) into ret\\ret', '3(1 4(1'],
                /* custom nested within builtin */
                ['global g\nput 0 into g\\0', '0'],
                ['put length(mm(1)) into ret\\ret', '7'],
                ['put max(0,1,max(1,2,length(mm(1)))) into ret\\ret', '7'],
                ['put sum(1,sum(1,2,length(mm(1)), 3), 4) into ret\\ret', '18'],
                ['put offset(mm(),3) into ret\\ret', '0'],
                ['put offset(mm(1),3) into ret\\ret', '0'],
                ['put offset(mm(1,2),3) into ret\\ret', '0'],
                ['put offset(mm(1,")"),3) into ret\\ret', '0'],
                /* builtin nested within custom */
                ['global g\nput 0 into g\\0', '0'],
                ['mm(max(1))', 'm1(1,,)'],
                ['mm(max(1,2))', 'm2(2,,)'],
                ['mm(max(1,2,3))', 'm3(3,,)'],
                ['mm(max(1),max(2))', 'm4(1,2,)'],
                ['mm(max(1,2),max(1,3))', 'm5(2,3,)'],
                ['mm(max(1,2,3),max(1,2,4))', 'm6(3,4,)'],
                ['mm(max(1,2,3),max(max(min(1,2),2),2,4),5)', 'm7(3,4,5)'],
                ['char (2) to (999) of (mm(max(1,2,3),max(max(min(1,2),2),2,4),5)) & (abs(-1))', '8(3,4,5)1'],
                /* custom inside custom */
                ['global g\nput 0 into g\\0', '0'],
                ['abs(1) && mm(mm()) && abs(1)', '1 m2(m1(,,),,) 1'],
                ['abs(1) && mm(mm(1)) && abs(1)', '1 m4(m3(1,,),,) 1'],
                ['abs(1) && mm(mm(1,max(2))) && abs(1)', '1 m6(m5(1,2,),,) 1'],
                ['abs(1) && mm(mm(1,max(2),max(3)),max(4)) && abs(1)', '1 m8(m7(1,2,3),4,) 1'],
                ['abs(1) && mm(max(1),mm(2),max(3)) && abs(1)', '1 m10(1,m9(2,,),3) 1'],
                /* even more nesting */
                ['global g\nput 0 into g\\0', '0'],
                ['abs(1) && mm(mm(mm(1))) && abs(1)', '1 m3(m2(m1(1,,),,),,) 1'],
                ['abs(1) && mm(mm(1),abs(2),mm(3)) && abs(1)', '1 m6(m4(1,,),2,m5(3,,)) 1'],
                ['abs(1) && mm(abs(1),mm(abs(2),mm(abs(3)))) && abs(1)', '1 m9(1,m8(2,m7(3,,),),) 1'],
                [
                    'abs(1) && mm(90+(1),90+(2),"" & mm(90+(3),90+(4),"" & mm(90+(5),90+(6)))) && abs(1)',
                    '1 m12(91,92,m11(93,94,m10(95,96,))) 1'
                ],
                /* currently allow the call on the other side as well */
                ['global g\nput 0 into g\\0', '0'],
                ['put "" into ret\nput "abc" into item (the length of mm(1)) of ret\\ret', ',,,,,,abc'],
                ['mm 2\nput the result into ret\\ret', 'm2(2,,)'],
                /* we can now call it from some other types of statements! */
                ['global g\nput 0 into g\\0', '0'],
                ['get mm(1)\\it', 'm1(1,,)'],
                ['put 0 into ret\nadd (the length of mm(1)) to ret\\ret', '7'],
                [
                    'put "0,0,0,0,0,0,0,0,0" into ret\nadd 3 to item (the length of mm(1)) of ret\\ret',
                    '0,0,0,0,0,0,3,0,0'
                ],
                ['get abs(mm(1))\\0', 'ERR:expected a number'],
                ['repeat while length(mm(1)) > 15\nend repeat\\0', 'ERR:support custom fn calls'],
                ['mm mm(1)\\0', 'ERR:support custom fn calls'],
                ['there is a cd btn mm(1)', 'false'],
                ['show cd btn mm(1)\\0', 'ERR:could not find the specified element'],
                ['enable cd btn mm(1)\\0', 'ERR:could not find the specified element'],
                /* currently can expand for initial if, but not else */
                [
                    `if char 1 of mm(1) is "m" then
            get 1
            else
            get 2
            end if\\it`,
                    '1'
                ],
                [
                    `if false then
            get 1
            else if char 1 of mm(1) is "m" then
            get 2
            end if\\it`,
                    'ERR:6:support custom fn calls'
                ],
                /* custom fn error reporting */
                ['get mm(1\\it', 'ERR:missing )'],
                ['get mm(abs(1\\it', 'ERR:missing )'],
                /* using blank lines, line number reporting should be affected */
                [
                    `put "abc" into x

            show cd btn "notfound"\\0`,
                    'ERR:6:could not find the specified'
                ],
                [
                    `put "abc" into x


            show cd btn "notfound"\\0`,
                    'ERR:7:could not find the specified'
                ],
                /* using continued lines, line number reporting should be affected */
                [
                    `put "abc" {BSLASH}\n into x
            show cd btn "notfound"\\0`,
                    'ERR:6:could not find the specified'
                ],
                [
                    `put "abc" {BSLASH}\n into {BSLASH}\n x
            show cd btn "notfound"\\0`,
                    'ERR:7:could not find the specified'
                ],
                [
                    `put {BSLASH}\n "abc" {BSLASH}\n into {BSLASH}\n x
            show cd btn "notfound"\\0`,
                    'ERR:8:could not find the specified'
                ],
                /* but using put-expansion, line number reporting should not be affected, even though we're adding calls */
                [
                    `put mm(1) into x
            show cd btn "notfound"\\0`,
                    'ERR:5:could not find the specified'
                ],
                [
                    `put mm(1) && mm(1) into x
            show cd btn "notfound"\\0`,
                    'ERR:5:could not find the specified'
                ],
                [
                    `put mm(mm(1)) into x
            show cd btn "notfound"\\0`,
                    'ERR:5:could not find the specified'
                ],
                /* difference between what is allowed and what is not */
                ['global g\nput 0 into g\\0', '0'],
                ['mm()\\0', `ERR:isn't C`],
                ['mm ("")\\the result', 'm1(,,)'],
                ['mm(1)\\0', `ERR:isn't C`],
                ['mm (1)\\the result', 'm2(1,,)'],
                ['mm(1),(2)\\0', `ERR:isn't C`],
                ['mm (1),(2)\\the result', 'm3(1,2,)']
            ];
            this.testBatchEvaluate(batch);
            this.updateObjectScript(this.elIds.card_a_a, ``);

            /* disallow C-like function calls. if printargs is a handler, printargs ("a") is ok (I guess) */
            /* but not printargs("a") */
            this.assertCompileErrorIn(
                `put 1 into x
sin(3)
put 1 into x`,
                `this isn't C`,
                4
            );
            this.assertCompileErrorIn(
                `put 1 into x
myfn(3)
put 1 into x`,
                `this isn't C`,
                4
            );

            /* only block starts outside of scope */
            this.assertCompileError(
                `put 1 into x
on myhandler
end myhandler`,
                'can exist at this scope',
                1
            );
            this.assertCompileError(
                `
on myhandler
end myhandler
put 1 into x`,
                'can exist at this scope',
                4
            );
            /* cannot start handler inside handler */
            this.assertCompileError(
                `
on myhandler
on myhandler2
end myhandler2
end myhandler`,
                'inside an existing handler',
                3
            );
            /* cannot start handler inside handler */
            this.assertCompileError(
                `
        ${this.customFunc} myhandler
on myhandler2
end myhandler2
end myhandler`,
                'inside an existing handler',
                3
            );
            /* cannot start handler inside handler */
            this.assertCompileError(
                `
on myhandler
${this.customFunc} myhandler2
end myhandler2
end myhandler`,
                'inside an existing handler',
                3
            );
            /* mismatched handler name */
            this.assertCompileError(
                `
on myhandler1
end myhandler2`,
                'names mismatch',
                3
            );
            /* doesn't make sense to end here */
            this.assertCompileError(
                `
on myhandler1
end myhandler1
end myhandler1`,
                'can exist at this scope',
                4
            );
            /* mismatched handler name in exit */
            this.assertCompileError(
                `
on myhandler1
exit myhandler2
end myhandler1`,
                'but got exit',
                3
            );
            /* mismatched handler name in pass */
            this.assertCompileError(
                `
on myhandler1
pass myhandler2
end myhandler1`,
                'but got exit',
                3
            );
            /* mismatched handler name in end */
            this.assertCompileError(
                `
on myhandler1
end myhandler2
end myhandler1`,
                'names mismatch',
                3
            );
            /* no handler name */
            this.assertCompileError(
                `
on
get 1 + 2
end myhandler1`,
                'cannot have a line',
                2
            );
            /* no valid handler name */
            this.assertCompileError(
                `
on ,
get 1 + 2
end myhandler1`,
                'expected "on myhandler" but got',
                2
            );
            /* handler params invalid 1 */
            this.assertCompileError(
                `
on myhandler1 x y
get 1 + 2
end myhandler1`,
                'required comma',
                2
            );
            /* handler params invalid 2 */
            this.assertCompileError(
                `
on myhandler1 x , ,
get 1 + 2
end myhandler1`,
                'not a valid variable name',
                2
            );
            /* no handler end name */
            this.assertCompileError(
                `
on myhandler1
get 1 + 2
end`,
                'cannot have a line',
                4
            );
            /* duplicate handler name */
            this.assertCompileError(
                `
on myhandler
get 1 + 2
end myhandler
on myhandler
get 1 + 2
end myhandler`,
                'already exists',
                7
            );
            /* cannot exit repeat when no loop */
            this.assertCompileErrorIn(`exit repeat`, 'outside of a loop', 3);
            this.assertCompileErrorIn(
                `repeat while false
end repeat
exit repeat`,
                'outside of a loop',
                5
            );
            /* cannot next repeat when no loop */
            this.assertCompileErrorIn(`next repeat`, 'outside of a loop', 3);
            this.assertCompileErrorIn(
                `repeat while false
end repeat
next repeat`,
                'outside of a loop',
                5
            );
            /* cannot end repeat when no loop */
            this.assertCompileError(
                `
        on myhandler
        end repeat
        end myhandler`,
                'interleaved within',
                3
            );
            /* cannot else when no if */
            this.assertCompileError(
                `
        on myhandler
        else
        end if
        end myhandler`,
                'interleaved within',
                3
            );
            /* cannot else if when no if */
            this.assertCompileError(
                `
        on myhandler
        else if true then
        end if
        end myhandler`,
                'interleaved within',
                3
            );
            /* cannot else when after the if */
            this.assertCompileError(
                `
        on myhandler
        if true then
        end if
        else
        end if
        end myhandler`,
                'interleaved within',
                5
            );
            /* cannot else if when after the if */
            this.assertCompileError(
                `
        on myhandler
        if true then
        end if
        else if true then
        end if
        end myhandler`,
                'interleaved within',
                5
            );
            /* cannot end if when no if */
            this.assertCompileErrorIn(`end if`, 'interleaved within', 3);
            /* cannot say "else then" */
            this.assertCompileErrorIn(
                `if false then
        else then`,
                'cannot have a line',
                4
            );
            /* cannot say just "if" */
            this.assertCompileErrorIn(
                `if
        end if`,
                'expected line to end with',
                3
            );
            /* cannot ommit the "then" */
            this.assertCompileErrorIn(
                `if true
        end if`,
                'expected line to end with',
                3
            );
            /* cannot just say "return" */
            this.assertCompileErrorIn(`return`, 'cannot have a line that is just', 3);
            /* cannot just say "end" */
            this.assertCompileErrorIn(`end`, 'cannot have a line', 3);
            /* cannot just say "exit" */
            this.assertCompileErrorIn(`exit`, 'cannot have a line', 3);
            /* cannot just say "repeat while" */
            this.assertCompileErrorIn(
                `repeat while
        end repeat`,
                'without an expression',
                3
            );
            /* cannot just say "repeat until" */
            this.assertCompileErrorIn(
                `repeat until
        end repeat`,
                'without an expression',
                3
            );
            /* invalid repeat part 1 */
            this.assertLineError(
                `repeat xyz
        end repeat`,
                'no variable found with this name',
                3
            );
            /* invalid repeat part 2 */
            this.assertLineError(
                `repeat to
        end repeat`,
                'NoViableAltException',
                3
            );
            /* invalid repeat part 3, not quite enough tokens */
            this.assertCompileErrorIn(
                `repeat with x = 1 to
        end repeat`,
                'wrong length',
                3
            );
            /* invalid repeat part 4, not quite enough tokens */
            this.assertCompileErrorIn(
                `repeat with x = 1 down to
        end repeat`,
                'wrong length',
                3
            );

            /* interleaved blocks */
            this.assertCompileErrorIn(
                `repeat while false
if false then
end repeat
end if`,
                'interleaved within',
                5
            );
            this.assertCompileErrorIn(
                `repeat while false
if false then
put "a" into x
else
end repeat
end if`,
                'interleaved within',
                7
            );
            this.assertCompileErrorIn(
                `if false then
repeat while false
end if
end repeat`,
                'interleaved within',
                5
            );
            this.assertCompileErrorIn(
                `if false then
repeat while false
else
put "a" into x
end if
end repeat`,
                'interleaved within',
                5
            );
            /* forgot to close the block */
            this.assertCompileError(
                `
on myhandler
repeat while false
end myhandler`,
                'interleaved within',
                4
            );
            this.assertCompileError(
                `
on myhandler
if false then
end myhandler`,
                'interleaved within',
                4
            );
            this.assertCompileError(
                `
on myhandler
if false then
else
end myhandler`,
                'interleaved within',
                5
            );
            this.runGeneralCode(
                `
on myhandler
put 3 into x`,
                '',
                'at end of',
                3,
                true,
                true
            );
        },
        'test_scriptMessagePassing',
        () => {
            this.setCurrentCard(this.elIds.card_a_a);
            let parents = [this.vcstate.model.stack.id, this.elIds.bg_a, this.elIds.card_a_a];
            for (let parent of parents) {
                /* reset all scripts */
                parents.map(id => this.updateObjectScript(id, ''));
                this.updateObjectScript(this.elIds.btn_go, '');

                let script = `
                on mouseup
                global testresult
                put " me=" & the short id of me after testresult
                put " target=" & the short id of the target after testresult
                end mouseup`;

                /* if there is nothing in the button script but something in a parent script, the parent script should be called instead */
                this.updateObjectScript(this.elIds.btn_go, '');
                this.updateObjectScript(parent, script);
                this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS(''));
                this.runGeneralCode('', '', undefined, undefined, undefined, true);
                let expectedMe = parent;
                assertEqWarn(
                    ` me=${expectedMe} target=${this.elIds.btn_go}`,
                    this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(),
                    '1[|'
                );

                /* if there is something in the button script and something in a parent script, the parent script is not called */
                this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS(''));
                this.runGeneralCode(
                    '',
                    `global testresult
                put "button script instead" after testresult`
                );
                assertEqWarn(
                    `button script instead`,
                    this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(),
                    '1@|'
                );

                /* if the button script calls exit to product, the parent script also isn't called */
                /* (currently has the same effect has just exiting with no call to pass) */
                this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS(''));
                this.runGeneralCode(
                    '',
                    `global testresult
                put "a" after testresult
                exit to ${cProductName}
                put "b" after testresult`
                );
                assertEqWarn(`a`, this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(), '1?|');

                /* pass upwards from the button script to the parent script */
                this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS(''));
                this.runGeneralCode(
                    '',
                    `global testresult
                put "a" after testresult
                pass mouseUp
                put "b" after testresult`
                );
                assertEqWarn(
                    `a me=${expectedMe} target=${this.elIds.btn_go}`,
                    this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(),
                    '1>|'
                );

                /* local variables should not bleed over into another scope (upwards) */
                this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS(''));
                this.updateObjectScript(
                    parent,
                    `${this.customFunc} parentfn p1
                return "got" && myLocal && x && the short id of the target
                end parentfn`
                );
                this.assertLineError(
                    `global testresult
                put "a" into myLocal
                put parentfn("abc") into testresult`,
                    'no variable found',
                    2
                );

                /* local variables should not bleed over into another scope (downwards) */
                this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS(''));
                this.updateObjectScript(
                    parent,
                    `${this.customFunc} parentfn p1
                put "abc" into myLocal
                return "got" && x && the short id of the target
                end parentfn`
                );
                this.assertLineError(
                    `global testresult
                put parentfn("abc") into testresult
                put myLocal after testresult`,
                    'no variable found',
                    3
                );

                /* child can call a function in the parent script */
                this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS(''));
                this.updateObjectScript(
                    parent,
                    `${this.customFunc} parentfn p1
                return "got" && p1 && the short id of me
                end parentfn`
                );
                this.runGeneralCode(
                    '',
                    `global testresult
                put parentfn("abc") into testresult`
                );
                assertEqWarn(
                    `got abc ${expectedMe}`,
                    this.vcstate.runtime.codeExec.globals.get('testresult').readAsString(),
                    '1=|'
                );

                /* the parent script can't access function down in the button script though */
                this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS(''));
                this.updateObjectScript(
                    parent,
                    `on mouseup
                global testresult
                put childfn("abc") into testresult
                end mouseup`
                );
                this.updateObjectScript(
                    this.elIds.btn_go,
                    `${this.customFunc} childfn p1
                return "got" && p1 && the short id of me
                end childfn`
                );
                this.runGeneralCode('', '', 'no handler', 3, false, true);
            }
        }
    ];
}
