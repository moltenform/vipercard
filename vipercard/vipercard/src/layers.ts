
import { isRelease } from './config.js';

/* code is separated into strict layers, */
/* to promote good design and eliminate circular references. */
/* a module can only import from modules below it on this list. */
/* enforced by ts_exports_autoimport.py */

/*

/ui512/root/
rootStartCanvas
rootUI512

/test/vpcui/
testRegistration

/test/vpc/
vpcTestServer
vpcTestScriptEval
vpcTestScriptRun
vpcTestScriptParse
vpcTestUtils

/test/ui512/
uiDemoBasic
uiDemoButtons
uiDemoComposites
uiDemoMenus
uiDemoPaint
uiDemoText
uiDemoTextEdit
testUI512CodeEditor
testUI512Composites
testUI512DrawText
testUI512MenuRender
testUI512ElementsViewButtons
testUI512Elements
testUI512Paint
testUI512PaintFlood
testUI512TextEvents
testUI512TextModify
testUI512TextSelectEvents
testUI512FormattedText
testUtilsDraw
testUtilsCanvasWrapper
testUtilsUI512Class
testUtilsUI512
testUtilsAssert

/vpcui/intro/
vpcIntro
vpcIntroFirst
vpcIntroOpen
vpcIntroLoading
vpcIntroPickFile
vpcIntroInterface
vpcIntroProvider
vpcIntroBase
vpcInterfaceImpl

/vpcui/presentation/
vpcPresenter
vpcPresenterInit
vpcPresenterEvents
vpcPresenterSave
vpcPresenterInterface

/vpcui/menu/
vpcAppMenuActions
vpcChangeSelectedFont
vpcAboutDialog
vpcMenu
vpcMenuStructure

/vpcui/nonmodaldialogs/
vpcFormLogin
vpcFormNewUser
vpcReplMessageBox
vpcSendErrReport
vpcDocViewer
vpcNonModalCommon

/vpcui/tools/
vpcToolBrowse
vpcToolEdit
vpcToolLasso
vpcToolSelect
vpcToolSelectBase
vpcToolCurve
vpcToolShape
vpcToolSmear
vpcToolStamp
vpcToolBucket
vpcToolBase

/vpcui/panels/
vpcLyrPanels
vpcLyrNotifications
vpcLyrDragHandles
vpcLyrToolbox
vpcEditPanelsStack
vpcEditPanelsCard
vpcEditPanelsBtn
vpcEditPanelsFld
vpcEditPanelsEmpty
vpcEditPanelsBase
vpcScriptEditor
vpcPanelsBase
vpcToolboxTools
vpcToolboxNav
vpcToolboxPatterns

/vpcui/modelrender/
vpcModelRender
vpcPaintRender
vpcGifExport

/vpcui/state/
vpcState
vpcFullOutside
vpcUndo
vpcStateSerialize
vpcRawCreate
vpcInterface

/vpc/request/
vpcRequest
vpcSigned
bridgeTextEncoding

/vpc/codeexec/
vpcScriptExecTop
vpcScriptExecFrameStack
vpcScriptExecFrame
vpcScriptExecStatement
vpcScriptExecAsync
vpcScriptCacheParsed
bridgeJSLru

/vpc/codepreparse/
vpcAllCode
vpcBranchProcessing
vpcRewrite
vpcExpandFnCalls
vpcDetermineCategory
vpcCodeLine
vpcCheckReserved
vpcScriptFunctions
vpcPreparseCommon

/vpc/codeparse/
vpcVisitor
vpcVisitorMethods
vpcRules
vpcTokens
bridgeChv

/vpc/vel/
velResolveName
velResolveReference
velModel
vpcOutsideInterfaces
velProductOpts
velStack
velBg
velCard
velButton
velField
velSerialize
velBase

/vpc/vpcutils/
vpcRequestedReference
vpcInitIcons
vpcAudio
vpcChunk
vpcStyleComplex
vpcVarCollection
vpcValEval
vpcVal
vpcUtils
vpcEnums

/ui512/composites/
ui512CodeEditor
ui512CodeEditorClasses
ui512ModalDialog
ui512Toolbox
ui512ButtonGroup
ui512Composites

/ui512/presentation/
ui512Presenter
ui512PresenterBase

/ui512/textedit/
ui512TextEvents
ui512BasicHandlers
ui512TextModify
ui512TextModifyClasses
ui512Scrollbar
ui512Clipboard
ui512GenericField
ui512TextLines

/ui512/menu/
ui512MenuListeners
ui512MenuAnimation
ui512MenuRender
ui512PresenterWithMenu
ui512Events

/ui512/elements/
ui512ElementsView
ui512ElementsMenu
ui512ElementsCanvasPiece
ui512ElementsTextField
ui512ElementsButton
ui512ElementsLabel
ui512ElementsApp
ui512ElementsGroup
ui512ElementsBase
ui512ElementsGettable

/ui512/draw/
ui512ImageDissolve
ui512ImageSerialize
ui512DrawBorders
ui512DrawIcon
ui512DrawIconClasses
ui512DrawPaintDispatch
ui512DrawPaint
ui512DrawPaintClasses
ui512DrawPattern
ui512DrawText
ui512DrawTextChar
ui512DrawTextParams
ui512FormattedText
ui512DrawTextRequestData
ui512DrawTextClasses
ui512DrawTextTransCharset
ui512ImageCollection
ui512Interfaces

/ui512/lang/
langBase

/ui512/utils/
utilsTestCanvas
utilsDraw
utilsDrawConstants
utilsTest
utilsCursors
utilsUI512
utilsAssert

/
layers
config

*/
