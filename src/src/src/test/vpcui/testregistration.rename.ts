
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { Tests_BaseClass } from '../../ui512/utils/utilsTest.js';
/* auto */ import { Test_CanvasWrapper, Test_ui512Utils } from '../../test/ui512/testui512utils.js';
/* auto */ import { Test_CodeEditorHelpers, Test_ui512Elements } from '../../test/ui512/testui512elements.js';
/* auto */ import { Test_CanvasComparison, Test_DrawText, Test_RenderTextUtils } from '../../test/ui512/uidemotext.js';
/* auto */ import { Test_DrawPaint } from '../../test/ui512/uidemopaint.js';
/* auto */ import { Test_DrawButtons } from '../../test/ui512/uidemobuttons.js';
/* auto */ import { Test_DrawMenus } from '../../test/ui512/uidemomenus.js';
/* auto */ import { Test_DrawTextEdit, Test_SelAndEntry } from '../../test/ui512/uidemotextedit.js';
/* auto */ import { Test_DrawComposites } from '../../test/ui512/uidemocomposites.js';
/* auto */ import { Test_VpcUtils } from '../../test/vpc/vpctestutils.js';
/* auto */ import { Test_Parsing } from '../../test/vpc/vpctestscriptparse.js';
/* auto */ import { Test_ScriptRun } from '../../test/vpc/vpctestscriptrun.js';
/* auto */ import { Test_ScriptEval } from '../../test/vpc/vpctestscripteval.js';
/* auto */ import { Test_BasicServerTests, Test_ServerTests } from '../../test/vpc/vpctestserver.js';

export function runTestsImpl(root: Root, all = true) {
    let registeredTests = [
        [() => new Test_VpcUtils()],
        [() => new Test_Parsing()],
        [() => new Test_ScriptEval(root)],
        [() => new Test_ScriptRun(root)],
        [() => new Test_ui512Utils()],
        [() => new Test_ui512Elements()],
        [() => new Test_CanvasWrapper()],
        [() => new Test_CanvasComparison()],
        [() => new Test_CodeEditorHelpers(root)],
        [() => new Test_RenderTextUtils()],
        [() => new Test_SelAndEntry(root)],
        [() => new Test_DrawButtons()],
        [() => new Test_DrawMenus()],
        [() => new Test_DrawTextEdit()],
        [() => new Test_DrawComposites()],
        [() => new Test_DrawText()],
        [() => new Test_DrawPaint()],
        [() => new Test_BasicServerTests()],
        [() => new Test_ServerTests()],
    ];

    Tests_BaseClass.runTestsArray(root, registeredTests, all);
}
