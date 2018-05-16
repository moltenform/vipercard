
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { TestUtilsAssert } from '../../test/ui512/testUtilsAssert.js';
/* auto */ import { TestUI512Utils } from '../../test/ui512/testUtilsUI512.js';
/* auto */ import { TestUtil512Class } from '../../test/ui512/testUtilsUI512Class.js';
/* auto */ import { TestUI512CanvasComparison } from '../../test/ui512/testUtilsCanvasWrapper.js';
/* auto */ import { TestUI512CanvasWrapper } from '../../test/ui512/testUtilsDraw.js';
/* auto */ import { TestFormattedText } from '../../test/ui512/testUI512FormattedText.js';
/* auto */ import { TestUI512TextSelectEvents } from '../../test/ui512/testUI512TextSelectEvents.js';
/* auto */ import { TestUI512SelAndEntry } from '../../test/ui512/testUI512TextModify.js';
/* auto */ import { TestDrawUI512TextEdit } from '../../test/ui512/testUI512TextEdit.js';
/* auto */ import { TestDrawUI512Paint } from '../../test/ui512/testUI512Paint.js';
/* auto */ import { TestUI512Elements } from '../../test/ui512/testUI512Elements.js';
/* auto */ import { TestDrawUI512Buttons } from '../../test/ui512/testUI512ElementsViewButtons.js';
/* auto */ import { TestDrawUI512Menus } from '../../test/ui512/testUI512MenuRender.js';
/* auto */ import { TestDrawUI512Text } from '../../test/ui512/testUI512DrawText.js';
/* auto */ import { TestDrawUI512Composites } from '../../test/ui512/testUI512Composites.js';
/* auto */ import { TestCodeEditorHelpers } from '../../test/ui512/testUI512CodeEditor.js';
/* auto */ import { TestVpcUtils } from '../../test/vpc/vpcTestUtils.js';
/* auto */ import { TestVpcChunkResolution } from '../../test/vpc/vpcTestChunkResolution.js';
/* auto */ import { TestVpcElements } from '../../test/vpc/vpcTestElements.js';
/* auto */ import { TestVpcParseCmd } from '../../test/vpc/vpcTestScriptParseCmd.js';
/* auto */ import { TestVpcParseExpr } from '../../test/vpc/vpcTestScriptParseExpr.js';
/* auto */ import { TestVpcScriptRunBase } from '../../test/vpc/vpcTestScriptRunBase.js';
/* auto */ import { TestVpcScriptRunCustomFns } from '../../test/vpc/vpcTestScriptRunCustomFns.js';
/* auto */ import { TestVpcScriptRunSyntax } from '../../test/vpc/vpcTestScriptRunSyntax.js';
/* auto */ import { TestVpcScriptRunCmd } from '../../test/vpc/vpcTestScriptRunCmd.js';
/* auto */ import { TestVpcScriptExprLvl } from '../../test/vpc/vpcTestScriptExprLvl.js';
/* auto */ import { TestVpcScriptEval } from '../../test/vpc/vpcTestScriptEval.js';
/* auto */ import { TestVpcMsgBox } from '../../test/vpc/vpcTestMsgBox.js';
/* auto */ import { TestVpcIntroProvider } from '../../test/vpc/vpcTestIntroProvider.js';
/* auto */ import { TestVpcServer } from '../../test/vpc/vpcTestServer.js';

export function runTestsImpl(all = true) {
    let registeredTests: (() => UI512TestBase)[] = [
        () => new TestCodeEditorHelpers(),
        () => new TestDrawUI512Composites(),
        () => new TestDrawUI512Text(),
        () => new TestUI512Elements(),
        () => new TestDrawUI512Buttons(),
        () => new TestFormattedText(),
        () => new TestDrawUI512Menus(),
        () => new TestDrawUI512Paint(),
        () => new TestDrawUI512TextEdit(),
        () => new TestUI512SelAndEntry(),
        () => new TestUI512TextSelectEvents(),
        () => new TestUtilsAssert(),
        () => new TestUI512CanvasComparison(),
        () => new TestUI512CanvasWrapper(),
        () => new TestUI512Utils(),
        () => new TestUtil512Class(),
        () => new TestVpcChunkResolution(),
        () => new TestVpcElements(),
        () => new TestVpcScriptEval(),
        () => new TestVpcScriptExprLvl(),
        () => new TestVpcParseCmd(),
        () => new TestVpcParseExpr(),
        () => new TestVpcScriptRunCmd(),
        () => new TestVpcScriptRunSyntax(),
        () => new TestVpcScriptRunBase(),
        () => new TestVpcScriptRunCustomFns(),
        () => new TestVpcServer(),
        () => new TestVpcUtils(),
        () => new TestVpcMsgBox(),
        () => new TestVpcIntroProvider()
    ];

    UI512TestBase.runTestsArray(registeredTests, all);
}
