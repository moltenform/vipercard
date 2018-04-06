
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { TestUI512CanvasWrapper, TestUI512Utils } from '../../test/ui512/testui512utils.js';
/* auto */ import { TestCodeEditorHelpers, TestUI512Elements } from '../../test/ui512/testui512elements.js';
/* auto */ import { TestDrawUI512Text, TestRenderUI512TextUtils, TestUI512CanvasComparison } from '../../test/ui512/uidemotext.js';
/* auto */ import { TestDrawUI512Paint } from '../../test/ui512/uidemopaint.js';
/* auto */ import { TestDrawUI512Buttons } from '../../test/ui512/uidemobuttons.js';
/* auto */ import { TestDrawUI512Menus } from '../../test/ui512/uidemomenus.js';
/* auto */ import { TestDrawUI512TextEdit, TestUI512SelAndEntry } from '../../test/ui512/uidemotextedit.js';
/* auto */ import { TestDrawUI512Composites } from '../../test/ui512/uidemocomposites.js';
/* auto */ import { Test_VpcUtils } from '../../test/vpc/vpctestutils.js';
/* auto */ import { TestVpcParsing } from '../../test/vpc/vpctestscriptparse.js';
/* auto */ import { TestVpcScriptRun } from '../../test/vpc/vpctestscriptrun.js';
/* auto */ import { Test_ScriptEval } from '../../test/vpc/vpctestscripteval.js';

export function runTestsImpl(all = true) {
    let registeredTests = [
        [() => new Test_VpcUtils()],
        [() => new TestVpcParsing()],
        [() => new Test_ScriptEval()],
        [() => new TestVpcScriptRun()],
        [() => new TestUI512Utils()],
        [() => new TestUI512Elements()],
        [() => new TestUI512CanvasWrapper()],
        [() => new TestUI512CanvasComparison()],
        [() => new TestCodeEditorHelpers()],
        [() => new TestRenderUI512TextUtils()],
        [() => new TestUI512SelAndEntry()],
        [() => new TestDrawUI512Buttons()],
        [() => new TestDrawUI512Menus()],
        [() => new TestDrawUI512TextEdit()],
        [() => new TestDrawUI512Composites()],
        [() => new TestDrawUI512Text()],
        [() => new TestDrawUI512Paint()],
        // [() => new Test_BasicServerTests()],
        // [() => new Test_ServerTests()],
    ];

    UI512TestBase.runTestsArray(registeredTests, all);
}
