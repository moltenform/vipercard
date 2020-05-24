
/* auto */ import { BatchType, ScriptTestBatch, TestVpcScriptRunBase } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { ValHolder, cast } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03lexer');
export let testCollection03lexer = t;

export let h3 = YetToBeDefinedTestHelper<TestVpc03>();
t.atest('--init--testCollection03lexer', async () => {
    if (!h3) {
        h3 = new TestVpc03(t);
        return h3.initEnvironment();
    }
});
t.test('03StringLiterals', () => {
    let b = new ScriptTestBatch();
    /* basic */
    b.t('put "" into x\\x', '');
    b.t('put "a" into x\\x', 'a');
    b.t('put "a--comment ok" into x\\x', 'a--comment ok');
    b.t('put "a--[[comment]]" into x\\x', 'a--[[comment]]');
    b.t('put "a into x" into x\\x', 'a into x');
    b.t('put "a""b" into x\\x', 'ERR:parse');
    b.t("put 'a' into x\\x", 'PREPARSEERR:lex');
    b.t("put '' into x\\x", 'PREPARSEERR:lex');
    b.t('put " into x\\x', 'PREPARSEERR:lex');
    b.t('put "\n" into x\\x', 'PREPARSEERR:lex');
    b.t('put "a\nb" into x\\x', 'PREPARSEERR:lex');
    /* things right after the quotes */
    b.t('put ("a") into x\\x', 'a');
    b.t('put "1"+"2" into x\\x', '3');
    b.t('put "a"id x\\x', 'PREPARSEERR:lex');
    b.t('put "a"stack x\\x', 'PREPARSEERR:lex');
    b.t('put "a"into x\\x', 'PREPARSEERR:lex');
    b.t('put "a"4 into x\\x', 'PREPARSEERR:lex');
    /* things right before the quotes */
    b.t('put )"b" into x\\x', 'ERR:');
    b.t('put -"4" into x\\x', '-4');
    b.t('put id"b" into x\\x', 'ERR:');
    b.t('put stack"b" into x\\x', 'ERR:');
    b.t('put into"b" into x\\x', 'PREPARSEERR:only see one');
    b.t('put 4"b" into x\\x', 'ERR:');
    /* works, but maybe shouldn't */
    b.t('put"4" into x\\x', '4');
    b.t('put 4 into x\ndivide x by"2"\\x', '2');
    b.t('there is a cd btn"xyz"', 'false');
    b.batchEvaluate(h3);
});
t.test('03BlockComment', () => {
    let b = new ScriptTestBatch();
    /* block comments */
    b.t('put "abc" --[[ignore this]] into x\\x', 'abc');
    b.t('put "abc" --[[ignore ??? this @@@ ]] into x\\x', 'abc');
    b.t('put "abc" --[[put "d" into x]] into x\\x', 'abc');
    b.t('put "A" into x\n--[[put "B" into x]]\\x', 'A');
    b.t('--[[]]\\1', '1');
    b.t('--[[commented out]]\\1', '1');
    /* block comments containing odd characters */
    b.t('put "a" & "c" into x\\x', 'ac');
    b.t('put "a" --[[ & "b"]] & "c" into x\\x', 'ac');
    b.t('put "a" --[[ & "b"] & "c" ]] & "c" into x\\x', 'ac');
    b.t('put "abc" --[[put "d" into x]] into x\\x', 'abc');
    b.t('put "abc" --[[put "d" into x --]] into x\\x', 'abc');
    b.t('put "abc" --[[put "d" into x -- line]] into x\\x', 'abc');
    b.t('put "" --[[ no nested --[[ ? ]] ? ]] into x\\x', 'PREPARSEERR:lex');
    b.t('put "a" --[[ & "]] & "c" into x\\x', 'ac');
    /* block comments span lines */
    b.t('--[[\n]]\\1', '1');
    b.t('put "a" --[[\n]] & "c" into x\\x', 'ac');
    b.t('put "a" --[[{BSLASH}\n]] & "c" into x\\x', 'ac');
    b.t('put "a" --[[ & "b"\n]] & "c" into x\\x', 'ac');
    b.t('put "a" into x\n--[[put "d" into x ]]\\x', 'a');
    b.t('put "a" into x\n--[[put "d" into x\nput "d" into x ]]\\x', 'a');
    b.t('put "a" into x\n--[[put "d" into x\nput "d" into x ]]put "b" into x\\x', 'b');
    b.t('put "a" into x\n--[[put "d" into x\nput "d" into x ]]\nput "b" into x\\x', 'b');
    /* block comments unmatched */
    /* important that --[[ is never a valid line comment */
    b.t('put "a" --[[\\x', 'PREPARSEERR:lex');
    b.t('put "a" ]]\\x', 'PREPARSEERR:lex');
    b.t('put "a" [[\\x', 'PREPARSEERR:lex');
    b.t('put "a" -[[\\x', 'PREPARSEERR:lex');
    b.batchEvaluate(h3);
});
t.test('03LineComment', () => {
    let b = new ScriptTestBatch();
    /* line comments */
    b.t('put "abc" into x --\\x', 'abc');
    b.t('put "a" into x --\nput "b" into x\\x', 'b');
    b.t('put "a" into x --?\nput "b" into x\\x', 'b');
    b.t('put "a" into x\nput "b" --into x\\x', 'a');
    b.t('put "abc" into x -- ? -- ?\\x', 'abc');
    /* line comments shouldn't be carried over */
    b.t('put "a" into x --{BSLASH}\nput "c" into x\\x', 'c');
    b.t('put "a" into x -- a {BSLASH}\nput "c" into x\\x', 'c');
    b.t('put "a" into x -- a {BSLASH}\nput --"c" into x\\x', 'PREPARSEERR:4:not enough');
    b.batchEvaluate(h3);
});
t.test('03ContinuedLineOrWhiteSpace', () => {
    /* \xC2 is logical not in mac-roman encoding (utf8 is ¬)*/
    let b = new ScriptTestBatch();
    b.t('put "123" \n into x --\\x', 'PREPARSEERR:4:looked like');
    b.t('put "123" {BSLASH}\n into x --\\x', '123');
    b.t('put "456" ¬\n into x --\\x', '456');
    /* can continue with no whitespace */
    b.t('put 4*{BSLASH}\n5 into x --\\x', '20');
    b.batchEvaluate(h3);
});
t.test('03NewLine', () => {
    let b = new ScriptTestBatch();
    /* basics */
    b.t('put 1 into x\nadd 1 to x\\x', '2');
    b.t('put 1 into x\n\nadd 1 to x\\x', '2');
    b.t('put 1 into x\n\n\nadd 1 to x\\x', '2');
    b.t('put 1 into x\n  \n  \nadd 1 to x\\x', '2');
    /* our test framework converts to linux newlines */
    b.t('put 1 into x\radd 1 to x\\x', '2');
    b.t('put 1 into x\r\nadd 1 to x\\x', '2');
    b.t('put 1 into x\r\radd 1 to x\\x', '2');
    b.batchEvaluate(h3);
});
t.test('03NumLiteral', () => {
    let b = new ScriptTestBatch();
    /* basics */
    b.t('0', '0');
    b.t('2', '2');
    b.t('012', '12');
    b.t('0012', '12');
    b.t('0.5', '0.5');
    /* negative (actually not in lexer, but we'll test here) */
    b.t('-0', '0');
    b.t('-2', '-2');
    b.t('-012', '-12');
    b.t('-0012', '-12');
    b.t('-0.5', '-0.5');
    /* sci notation */
    b.t('2e-2', '0.02');
    b.t('2e-1', '0.2');
    b.t('2e-0', '2');
    b.t('2e0', '2');
    b.t('2e1', '20');
    b.t('2e2', '200');
    b.t('2e+0', '2');
    b.t('2e+1', '20');
    b.t('2e+2', '200');
    b.t('2e00', '2');
    b.t('2e01', '20');
    b.t('2e02', '200');
    /* sci notation with decimal */
    b.t('2.3e-2', '0.023');
    b.t('2.3e-1', '0.23');
    b.t('2.3e-0', '2.3');
    b.t('2.3e0', '2.3');
    b.t('2.3e1', '23');
    b.t('2.3e2', '230');
    b.t('2.3e+0', '2.3');
    b.t('2.3e+1', '23');
    b.t('2.3e+2', '230');
    b.t('2.3e00', '2.3');
    b.t('2.3e01', '23');
    b.t('2.3e02', '230');
    /* we are case insensitive */
    b.t('2E0', '2');
    b.t('2E1', '20');
    b.t('2E2', '200');
    /* invalid sci notation */
    b.t('2a0', 'PREPARSEERR:lex');
    b.t('2ee0', 'PREPARSEERR:lex');
    b.t('2e1.3', 'PREPARSEERR:lex');
    b.t('2e.3', 'PREPARSEERR:lex');
    b.t('2e.3', 'PREPARSEERR:lex');
    b.t('2e+', 'PREPARSEERR:lex');
    b.t('2e-', 'PREPARSEERR:lex');
    b.t('2 e 0', 'ERR:');
    b.t('2 e +1', 'ERR:');
    b.t('2 e -1', 'ERR:');
    /* something right before */
    b.t('put1 into x\\x', 'ERR:parse err');
    b.t('put 4 into x\ndivide x by2\\x', 'PREPARSEERR:4:did not see by');
    b.t('put 4 into x\nsubtract1 from x\\x', 'ERR:5:parse err');
    b.t('put --[[c]]4 into x\\x', '4');
    /* something right after */
    b.t('put 1into x\\x', 'PREPARSEERR:lex');
    b.t('put 4 into x\nadd 1to x\\x', 'PREPARSEERR:4:lex');
    b.t('put 4 into x\nsubtract 1from x\\x', 'PREPARSEERR:4:lex');
    b.t('put 4--[[c]] into x\\x', '4');
    /* surrounded by symbols */
    b.t('put 3 into x\\x/1', '3');
    b.t('put 3 into x\\x+1', '4');
    b.t('put 3 into x\\x+(1)', '4');
    b.t('put 3 into x\\1/x', '0.3333333');
    b.t('put 3 into x\\1+x', '4');
    b.t('put 3 into x\\(1)+x', '4');
    b.t('3/1', '3');
    b.t('1+1', '2');
    b.t('1+(1)', '2');
    b.t('there is a cd btn1234', 'ERR:no variable');
    b.batchEvaluate(h3, [], BatchType.floatingPoint);
});
t.test('03Identifier', () => {
    let b = new ScriptTestBatch();
    /* basics */
    b.t('put 9 into b\\b', '9');
    b.t('put 9 into a9\\a9', '9');
    b.t('put 9 into a9$\\a9$', '9');
    b.t('put 9 into a9$_\\a9$_', '9');
    b.t('put 9 into 9\\0', 'ERR:parse');
    b.t('put 9 into 9a\\0', 'PREPARSEERR:');
    b.t('put 9 into $a\\0', 'PREPARSEERR:');
    /* varnames explicitly allowed */
    b.t('put 9 into a\\a', '9');
    b.t('put 9 into an\\an', 'ERR:not allowed');
    b.t('put 9 into number\\number', '9');
    /* properties can be valid var names,
    this is also covered in 02 tests */
    b.t('put 9 into alltext\\alltext', '9');
    b.t('put 9 into defaulttextstyle\\defaulttextstyle', '9');
    b.t('put 9 into autoselect\\autoselect', '9');
    b.t('put 9 into cantdelete\\cantdelete', '9');
    b.t('put 9 into textsize\\textsize', '9');
    b.t('put 9 into textstyle\\textstyle', '9');
    b.t('put 9 into id\\0', 'PREPARSEERR:support');
    b.batchEvaluate(h3);
});

/**
 * adds a few more elements
 */
export class TestVpc03 extends TestVpcScriptRunBase {
    populateModel() {
        super.populateModel()

        let makeVel = (typ:string) => {
            let creator = this.vcstate.vci.getCodeExec().directiveImpl
            return creator.goMakevelwithoutmsg(new ValHolder(typ), this.vcstate.model.getCurrentCard(), ['', ''])
        }

        this.vcstate.vci.setCurCardNoOpenCardEvt(this.ids.cdCD);
        let bgD = cast(VpcElBg, makeVel('bkgnd'))
        let cdDD = bgD.cards[0]    
        this.vcstate.vci.setCurCardNoOpenCardEvt(cdDD.idInternal);
        let cdDE = makeVel('card')
        this.vcstate.vci.setCurCardNoOpenCardEvt(cdDE.idInternal);
        let cdDF = makeVel('card')       
        this.vcstate.vci.setCurCardNoOpenCardEvt(cdDF.idInternal);
        let cdDG = makeVel('card')       
        this.vcstate.vci.setCurCardNoOpenCardEvt(cdDG.idInternal);
        let cdDH = makeVel('card')       
        this.ids.bgD = bgD.idInternal
        this.ids.cdDD = cdDD.idInternal
        this.ids.cdDE = cdDE.idInternal
        this.ids.cdDF = cdDF.idInternal
        this.ids.cdDG = cdDG.idInternal
        this.ids.cdDH = cdDH.idInternal
        this.vcstate.vci.setCurCardNoOpenCardEvt(this.ids.cdDE);
        let bDE1 = makeVel('button')        
        let fDE1 = makeVel('field')       
        let bDE2 = makeVel('button')        
        let fDE2 = makeVel('field') 
        let bDE3 = makeVel('button')         
        let fDE3 = makeVel('field')    
        this.ids.bDE1 = bDE1.idInternal
        this.ids.fDE1 = fDE1.idInternal
        this.ids.bDE2 = bDE2.idInternal
        this.ids.fDE2 = fDE2.idInternal
        this.ids.bDE3 = bDE3.idInternal
        this.ids.fDE3 = fDE3.idInternal
        this.vcstate.vci.setCurCardNoOpenCardEvt(this.ids.cdCD);
        bgD.setOnVel('name', 'd', this.vcstate.model);
        cdDD.setOnVel('name', 'd', this.vcstate.model);
        cdDE.setOnVel('name', 'e', this.vcstate.model);
        cdDF.setOnVel('name', 'f', this.vcstate.model);
        cdDG.setOnVel('name', 'g', this.vcstate.model);
        cdDH.setOnVel('name', 'h', this.vcstate.model);
        bDE1.setOnVel('name', 'de1', this.vcstate.model);
        bDE2.setOnVel('name', 'de2', this.vcstate.model);
        bDE3.setOnVel('name', 'de3', this.vcstate.model);
        fDE1.setOnVel('name', 'de1', this.vcstate.model);
        fDE2.setOnVel('name', 'de2', this.vcstate.model);
        fDE3.setOnVel('name', 'de3', this.vcstate.model);
        this.vcstate.vci.getCodeExec().doMaintenance()
    }
}
