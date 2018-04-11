
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { TestUtilsAssert } from '../../test/ui512/testUtilsAssert.js';
/* auto */ import { TestUI512Utils } from '../../test/ui512/testUtilsUI512.js';
/* auto */ import { TestUtil512Class } from '../../test/ui512/testUtilsUI512Class.js';
/* auto */ import { TestUI512CanvasComparison } from '../../test/ui512/testUtilsCanvasWrapper.js';
/* auto */ import { TestUI512CanvasWrapper } from '../../test/ui512/testUtilsDraw.js';
/* auto */ import { TestFormattedText } from '../../test/ui512/testUI512FormattedText.js';
/* auto */ import { TestUI512TextSelectEvents } from '../../test/ui512/testUI512TextSelectEvents.js';
/* auto */ import { TestUI512SelAndEntry } from '../../test/ui512/testUI512TextModify.js';
/* auto */ import { TestDrawUI512TextEdit } from '../../test/ui512/testUI512TextEvents.js';
/* auto */ import { TestDrawUI512Paint } from '../../test/ui512/testUI512Paint.js';
/* auto */ import { TestUI512Elements } from '../../test/ui512/testUI512Elements.js';
/* auto */ import { TestDrawUI512Buttons } from '../../test/ui512/testUI512ElementsViewButtons.js';
/* auto */ import { TestDrawUI512Menus } from '../../test/ui512/testUI512MenuRender.js';
/* auto */ import { TestDrawUI512Text } from '../../test/ui512/testUI512DrawText.js';
/* auto */ import { TestDrawUI512Composites } from '../../test/ui512/testUI512Composites.js';
/* auto */ import { TestCodeEditorHelpers } from '../../test/ui512/testUI512CodeEditor.js';
/* auto */ import { TestVpcUtils } from '../../test/vpc/vpcTestUtils.js';
/* auto */ import { TestVpcParsing } from '../../test/vpc/vpcTestScriptParse.js';
/* auto */ import { TestVpcScriptRun } from '../../test/vpc/vpcTestScriptRun.js';
/* auto */ import { TestScriptEval } from '../../test/vpc/vpcTestScriptEval.js';
/* auto */ import { TestVpcBasicServerTests, TestVpcServerTests } from '../../test/vpc/vpcTestServer.js';


export function runTestsImpl(all = true) {
    let registeredTests = [
        [() => new TestCodeEditorHelpers()],
        [() => new TestDrawUI512Composites()],
        [() => new TestDrawUI512Text()],
        [() => new TestUI512Elements()],
        [() => new TestDrawUI512Buttons()],
        [() => new TestFormattedText()],
        [() => new TestDrawUI512Menus()],
        [() => new TestDrawUI512Paint()],
        [() => new TestDrawUI512TextEdit()],
        [() => new TestUI512SelAndEntry()],
        [() => new TestUI512TextSelectEvents()],
        [() => new TestUtilsAssert()],
        [() => new TestUI512CanvasComparison()],
        [() => new TestUI512CanvasWrapper()],
        [() => new TestUtil512Class()],
        [() => new TestUI512Utils()],
        [() => new TestScriptEval()],
        [() => new TestVpcParsing()],
        [() => new TestVpcScriptRun()],
        //[() => new TestVpcBasicServerTests()],
        //[() => new TestVpcServerTests()],
        [() => new TestVpcUtils()],
    ];

    UI512TestBase.runTestsArray(registeredTests, all);
}
