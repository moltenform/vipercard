
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { TestUI512CanvasWrapper, TestUI512Utils } from '../../test/ui512/testUI512Utils.js';
/* auto */ import { TestCodeEditorHelpers, TestUI512Elements } from '../../test/ui512/testUI512Elements.js';
/* auto */ import { TestDrawUI512Text, TestRenderUI512TextUtils, TestUI512CanvasComparison } from '../../test/ui512/uiDemoText.js';
/* auto */ import { TestDrawUI512Paint } from '../../test/ui512/uiDemoPaint.js';
/* auto */ import { TestDrawUI512Buttons } from '../../test/ui512/uiDemoButtons.js';
/* auto */ import { TestDrawUI512Menus } from '../../test/ui512/uiDemoMenus.js';
/* auto */ import { TestDrawUI512TextEdit, TestUI512SelAndEntry } from '../../test/ui512/uiDemoTextEdit.js';
/* auto */ import { TestDrawUI512Composites } from '../../test/ui512/uiDemoComposites.js';
/* auto */ import { Test_VpcUtils } from '../../test/vpc/vpcTestUtils.js';
/* auto */ import { TestVpcParsing } from '../../test/vpc/vpcTestScriptParse.js';
/* auto */ import { TestVpcScriptRun } from '../../test/vpc/vpcTestScriptRun.js';
/* auto */ import { Test_ScriptEval } from '../../test/vpc/vpcTestScriptEval.js';

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
