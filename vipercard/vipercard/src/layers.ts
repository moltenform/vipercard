
import { isRelease } from './config.js';

/* code is separated into strict layers, */
/* to promote good design and eliminate circular references. */
/* a module can only import from modules below it on this list. */
/* enforced by autoimport.py */

/*

/ui512/root/
rootStartCanvas
rootUI512

/test/vpc/
testRegistrationRelease
testRegistration
vpcTestServer
vpcTestIntroProvider
vpcTestMsgBox
vpcTestScriptEval
vpcTestScriptExprLvl
vpcTestScriptRun
vpcTestScriptRunBase
vpcTestScriptParseExpr
vpcTestScriptParseCmd
vpcTestElements
vpcTestChunkResolution
vpcTestUtils

/test/ui512demo/
uiDemoBasic
uiDemoButtons
uiDemoComposites
uiDemoMenus
uiDemoPaint
uiDemoText
uiDemoTextEdit

/test/ui512/
testUI512CodeEditor
testUI512Composites
testUI512DrawText
testUI512MenuRender
testUI512ElementsViewButtons
testUI512Elements
testUI512Paint
testUI512PaintFlood
testUI512TextEdit
testUI512TextEditInteractions
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
vpcIntroPageFirst
vpcIntroPageOpen
vpcIntroPageLoading
vpcIntroPagePickFile
vpcIntroInterface
vpcIntroProvider
vpcIntroPageBase
vpcInterfaceImpl

/vpcui/presentation/
vpcPresenter
vpcPresenterInit
vpcPresenterEvents
vpcSave
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
vpcFormSendReport
vpcDocViewer
vpcLyrNonModalHolder

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
vpcLyrNotification
vpcLyrDragHandles
vpcLyrToolbox
vpcEditPanelsStack
vpcEditPanelsCard
vpcEditPanelsBtn
vpcEditPanelsFld
vpcEditPanelsEmpty
vpcEditPanelsBase
vpcScriptEditor
vpcPanelsInterface
vpcToolboxMain
vpcToolboxNav
vpcToolboxPatterns

/vpcui/modelrender/
vpcModelRender
vpcPaintRender
vpcGifExport

/vpcui/state/
vpcState
vpcOutsideImpl
vpcUndo
vpcStateSerialize
vpcCreateOrDelVel
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
vpcExpandCustomFns
vpcDetermineCategory
vpcCodeLine
vpcCheckReserved
vpcBuiltinFunctions
vpcPreparseCommon

/vpc/codeparse/
vpcVisitor
vpcVisitorMixin
vpcVisitorMethods
vpcParser
vpcTokens
bridgeChv

/vpc/vel/
velResolveName
velResolveContainer
velOutsideInterfaces
velModelTop
velProductOpts
velStack
velBg
velCard
velButton
velField
velSerialization
velBase

/vpc/vpcutils/
vpcRequestedReference
vpcInitIcons
vpcAudio
vpcChunkResolution
vpcStyleComplex
vpcVarCollection
vpcValEval
vpcVal
vpcUtils
vpcEnums

/ui512/composites/
ui512CodeEditor
ui512CodeEditorAutoIndent
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
ui512TextSelModify
ui512TextSelModifyImpl
ui512Scrollbar
ui512ClipManager
ui512GenericField
ui512TextLines

/ui512/menu/
ui512MenuListeners
ui512MenuAnimation
ui512MenuPositioning
ui512SuspendEvents
ui512PresenterWithMenu
ui512Events

/ui512/elements/
ui512ElementView
ui512ElementMenu
ui512ElementCanvasPiece
ui512ElementTextField
ui512ElementButton
ui512ElementLabel
ui512ElementApp
ui512ElementGroup
ui512Element
ui512ElementGettable

/ui512/draw/
ui512ImageDissolve
ui512ImageSerialization
ui512DrawBorders
ui512DrawIconManager
ui512DrawIconClasses
ui512DrawPaintDispatch
ui512DrawPainter
ui512DrawPainterClasses
ui512DrawPatterns
ui512DrawText
ui512DrawTextChar
ui512DrawTextArgs
ui512FormattedText
ui512DrawTextFontRequest
ui512DrawTextClasses
ui512TranslateCharset
ui512ImageCollection
ui512Interfaces

/ui512/lang/
langBase

/ui512/utils/
utilsTest
utilsTestCanvas
utilsDraw
utilsDrawConstants
utilsCursors
utils512
utilsAssert

/
layers
config

*/
