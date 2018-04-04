
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { clrBlack, clrWhite, clrTransp, makePainterCvDataDraw, makePainterCvDataWithPatternSupport, simplifyPattern, needsPatternSupport, makePainterCvCanvas, UI512Painter, DissolveImages, UI512ImageSerialization } from "../ui512/ui512paint.js";
import { UI512ViewDraw, PaintOntoCanvasShapes, PaintOntoCanvas } from "../ui512/ui512elementsdefaultview.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { PrpTyp, VpcElBase, VpcElSizable, VpcElButton, UI512FldStyleInclScrolling, VpcElField, VpcElCard, VpcElBg, VpcElStack } from "../vpcscript/vpcelements.js";
import { RequestedVelRef, RequestedContainerRef, VpcModel, vpcElTypeAsSeenInName, ReadableContainerStr, ReadableContainerVar, WritableContainerVar, ReadableContainerField, WritableContainerField, VpcScriptMessage, OutsideWorldRead, OutsideWorldReadWrite, VpcElProductOpts } from "../vpcscript/vpcelementstop.js";
import { cProductName, cTkSyntaxMarker, makeVpcScriptErr, makeVpcInternalErr, checkThrow, checkThrowEq, FormattedSubstringUtil, CodeLimits, VpcIntermedValBase, IntermedMapOfIntermedVals, VpcVal, VpcValS, VpcValN, VpcValBool, VarCollection, VariableCollectionConstants, VpcEvalHelpers, ReadableContainer, WritableContainer, RequestedChunk, ChunkResolution, VpcUI512Serialization, CountNumericId } from "../vpcscript/vpcutil.js";
import { RequestedChunkType, PropAdjective, SortStyle, OrdinalOrPosition, RequestedChunkTextPreposition, VpcElType, VpcTool, toolToPaintOntoCanvasShapes, VpcToolCtg, getToolCategory, VpcBuiltinMsg, getMsgNameFromType, VpcOpCtg, getPositionFromOrdinalOrPosition } from "../vpcscript/vpcenums.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */


export class VpcRenderPaint {
    canvases = new MapKeyToObjectCanSet<[number, CanvasWrapper]>();
    canvasesForPainting: CanvasWrapper[];

    paintgrp: UI512ElGroup;
    readonly userPaintW: number;
    readonly userPaintH: number;
    constructor(protected appli: IVpcStateInterface) {
        this.userPaintW = this.appli.userBounds()[2];
        this.userPaintH = this.appli.userBounds()[3];
    }

    grpReset() {
        let mainPaint = this.appli.getUi512App().getElemById("VpcModelRender$$renderbg");
        this.paintgrp.removeAllEls();
        this.paintgrp.addElement(this.appli.getUi512App(), mainPaint);
    }

    getCanvasForPainting(n: number) {
        n -= 1;
        if (this.canvasesForPainting[n] === undefined) {
            this.canvasesForPainting[n] = CanvasWrapper.createMemoryCanvas(this.userPaintW, this.userPaintH);
        }

        this.canvasesForPainting[n].clear();
        return this.canvasesForPainting[n];
    }
    cachedPainter: O<UI512Painter>;

    onNonTrivialChangeSeen() {}

    doPaintUpdate() {}

    init() {}
    commitSimulatedClicks(queue: PaintOntoCanvas[]) {}

    drawFromClick() {
        let world = new VpcOutsideWorld(this.appli.lang());
        //world.paintOptionsFromCurrentOptions(true, mods)
    }

    protected drawSmear(tl: VpcTool, args: number[], canvas: CanvasWrapper, painter: refparam<UI512Painter>) {
        if (args.length === 2) {
            args.push(args[0]);
            args.push(args[1]);
        }

        checkThrowEq(4, args.length, "unexpected # of args");
    }
}
