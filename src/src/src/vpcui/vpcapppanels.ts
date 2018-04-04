
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { IsPropPanel, VpcPanelScriptEditor } from "../vpcui/vpcappscripteditor.js";
import { BorderDecorationConsts, PalBorderDecorationConsts, WndBorderDecorationConsts, UI512CompBase, UI512CompRadioButtonGroup, UI512CompToolbox } from "../ui512/ui512composites.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { SelAndEntryImpl, IGenericTextField, UI512ElTextFieldAsGeneric, SelAndEntry, ClipManager } from "../ui512/ui512elementstextselect.js";
import { VpcAppToolboxes, VpcAppResizeHandles, VpcAppCoverArea, VpcAppFullScreenCovers } from "../vpcui/vpcapptoolpalette.js";
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

abstract class PropPanelCompositeBase extends UI512CompBase implements IsPropPanel {
    isPropPanelCompositeBase = true
    appli:IVpcStateInterface
    isExclusive = false;
    compositeType = "PropPanelCompositeBase";
    firstSectionH = 100
    secondSectionH = 162
    thirdSectionH = 100
    cbGetAndValidateSelectedVel:(prp:string)=>O<VpcElBase>;
    protected static numeric: { [key: string]: boolean } = { 'icon' : true};
    topInputs:[string, string, number][] = []

    leftChoices:[string, string][] = []
    leftChoicesX = 20
    leftChoicesW = 130
    leftChoicesH = 117
    rightOptions:[string, string][] = []
    rightOptionsX = 216
    readonly abstract velTypeShortName:string
    readonly abstract velTypeLongName:string
    readonly abstract velType:VpcElType

    lblNamingTip:UI512ElLabel;
    protected refreshTip(name:string, id:string) {
        let longname = this.appli.lang().translate(this.velTypeLongName)
        let txt = this.appli.lang().translate("lngRefer to this %typ in a script as")
        txt = txt.replace(/%typ/g, longname)
        txt += `\n${this.velTypeShortName} id ${id}`
        if (name.length) {
            txt += `\nor\n${this.velTypeShortName} "${name}"`
        }

        txt = TextRendererFontManager.setInitialFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString())
        this.lblNamingTip.set('labeltext', txt)
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        Util512.freezeProperty(this, 'topInputs')
        Util512.freezeProperty(this, 'leftChoices')
        Util512.freezeProperty(this, 'rightOptions')
        let grp = app.getGroup(this.grpid)
        let bg = this.genBtn(app, grp, 'bg')
        bg.set('autohighlight', false)
        bg.setDimensions(this.x, this.y, this.logicalWidth, this.logicalHeight)
        this.createTopInputs(app)
        this.createLeftChoices(app)
        this.createRightOptions(app)
        this.createLowerSection(app)
    }

    createTopInputs(app: UI512Application) {
        const lblX = 16, inputX = 170
        const inputH = 22
        const inputMargin = 11
        let totalUsedH = this.topInputs.length * inputH + (this.topInputs.length-1) * inputMargin
        let startY = this.y + Math.floor((this.firstSectionH - totalUsedH)/2)
        let curY = startY
        let grp = app.getGroup(this.grpid)
        for (let [lbltxt, inid, inputW] of this.topInputs) {
            let lbl = this.genChild<UI512ElLabel>(app, grp, `lbl##${inid}`, UI512ElLabel)
            lbl.set('labeltext', this.appli.lang().translate(lbltxt))
            lbl.set('labelhalign', false)
            lbl.set('labelvalign', true)
            lbl.setDimensions(this.x + lblX, curY, inputX - lblX, inputH)
            let inp = this.genChild<UI512ElTextField>(app, grp, `inp##${inid}`, UI512ElTextField)
            inp.set("multiline", false);
            inp.set("labelwrap", false);
            inp.set("nudgey", 2);
            inp.setDimensions(this.x + inputX, curY, inputW, inputH)
            curY += inputH + inputMargin
        }
    }

    createLeftChoices(app:UI512Application) {
        if (!this.leftChoices.length) {
            return
        }

        let grp = app.getGroup(this.grpid)
        let startY = this.y + this.firstSectionH + Math.floor((this.secondSectionH - this.leftChoicesH)/2)
        let fld = this.genChild<UI512ElTextField>(app, grp, `leftchoice`, UI512ElTextField)
        fld.set("scrollbar", true);
        fld.set("selectbylines", true);
        fld.set("multiline", true);
        fld.set("canselecttext", true);
        fld.set("canedit", false);
        fld.set("labelwrap", false);
        UI512ElTextField.setListChoices(fld, this.leftChoices.map(item=>this.appli.lang().translate(item[0])))
        fld.setDimensions(this.x + this.leftChoicesX, startY, this.leftChoicesW, this.leftChoicesH)
    }

    createRightOptions(app:UI512Application) {
        const inputH = 15
        const inputMargin = 3
        let totalUsedH = this.rightOptions.length * inputH + (this.rightOptions.length-1) * inputMargin
        let startY = this.y + this.firstSectionH + Math.floor((this.secondSectionH - totalUsedH)/2)
        let curY = startY
        let grp = app.getGroup(this.grpid)
        for (let [lbltxt, inid] of this.rightOptions) {
            let inp = this.genBtn(app, grp, `toggle##${inid}`)
            inp.set("style", UI512BtnStyle.checkbox);
            inp.set("labeltext", this.appli.lang().translate(lbltxt));
            inp.set("labelhalign", false);
            inp.set("labelvalign", true);
            inp.setDimensions(this.x + this.rightOptionsX, curY, this.logicalWidth - this.rightOptionsX, inputH)
            curY += inputH + inputMargin
        }
    }

    createLowerSection(app:UI512Application) {
        let tipsX = this.leftChoicesX + 0
        let tipsY = this.firstSectionH + this.secondSectionH - 9
        let grp = app.getGroup(this.grpid)
        this.lblNamingTip = this.genChild<UI512ElLabel>(app, grp, `lbl##tip`, UI512ElLabel)
        this.lblNamingTip.set("labelhalign", false);
        this.lblNamingTip.set("labelvalign", false);
        this.lblNamingTip.setDimensions(this.x + tipsX, 
            this.y + tipsY, this.logicalWidth - tipsX, this.logicalHeight - tipsY)
        
        const spaceFromRight = 55
        const spaceFromBottom = 17
        const btnW = 68
        const btnH = 23
        let scriptBtn = this.genBtn(app, grp, this instanceof PropPanelCompositeBlank ? 'btnGenPart' : 'btnScript')
        scriptBtn.set('labeltext', this.appli.lang().translate('lngScript...'))
        scriptBtn.set('style', UI512BtnStyle.osstandard)
        scriptBtn.setDimensions(this.x + this.logicalWidth - (btnW + spaceFromRight),
            this.y + this.logicalHeight - (btnH + spaceFromBottom), btnW, btnH)
        
        if (this instanceof PropPanelCompositeBlank) {
            scriptBtn.setDimensions(scriptBtn.x - 75, scriptBtn.y, scriptBtn.w + 75, scriptBtn.h)
        }
    }

    refreshFromModel(root: Root, app:UI512Application) {
        let vel = this.cbGetAndValidateSelectedVel('selectedVelId')
        if (!vel) {
            return
        }

        this.fillInValuesTip(app, vel)
        let grp = app.getGroup(this.grpid)
        for (let [lbltxt, inid, inputW] of this.topInputs) {
            let el = grp.getEl(this.getElId(`inp##${inid}`))
            let s = PropPanelCompositeBase.numeric[inid] ? vel.get_n(inid).toString() : vel.get_s(inid)
            el.setftxt(FormattedText.newFromUnformatted(s))
        }

        if (this.leftChoices.length) {
            let styl = vel.getProp('style').readAsString()
            let el = grp.getEl(this.getElId(`leftchoice`))
            let found = this.leftChoices.findIndex((item)=>(item[1].toLowerCase() === styl.toLowerCase()))
            if (found !== -1) {
                let wasScroll = el.get_n('scrollamt')
                let gel = new UI512ElTextFieldAsGeneric(cast(el, UI512ElTextField))
                SelAndEntry.selectLineInField(root, gel, found)
                el.set('scrollamt', wasScroll)
            } else {
                el.set('selcaret', 0)
                el.set('selend', 0)
            }
        }

        for (let [lbltxt, inid] of this.rightOptions) {
            let el = grp.getEl(this.getElId(`toggle##${inid}`))
            let val = vel.getProp(inid)
            el.set('checkmark', val.readAsStrictBoolean())
        }
    }

    fillInValuesTip(app:UI512Application, vel:VpcElBase) {
        this.refreshTip(vel.get_s('name'), vel.id)
    }

    saveChangesToModel(root: Root, app:UI512Application) {
        let vel = this.cbGetAndValidateSelectedVel('selectedVelId')
        if (!vel) {
            return
        }

        // truncate to first line if needed
        let grp = app.getGroup(this.grpid)
        let inidSingleLine = grp.findEl(this.getElId(`toggle##singleline`))
        if (inidSingleLine && inidSingleLine.get_b('checkmark')) {
            let firstLine = vel.get_ftxt().toUnformatted().split('\n')[0]
            vel.setftxt(FormattedText.newFromUnformatted(firstLine))
        }

        // if you are adding/removing a button's icon, set font as appropriate
        let elIcon = grp.findEl(this.getElId(`inp##icon`))
        if (elIcon && vel.getType() === VpcElType.Btn) {
            let typed = elIcon.get_ftxt().toUnformatted()
            let n = parseInt(typed, 10)
            let nextIcon = (isFinite(n) && n >= 0) ? n : 0
            let curIcon = vel.get_n('icon') || 0
            if (nextIcon === 0 && curIcon !== 0) {
                vel.set('textfont', 'chicago')
                vel.set('textstyle', 0)
                vel.set('textsize', 12)
            } else if (nextIcon !== 0 && curIcon === 0) {
                vel.set('textfont', 'geneva')
                vel.set('textstyle', 0)
                vel.set('textsize', 9)
            }
        }

        for (let [lbltxt, inid, inputW] of this.topInputs) {
            let el = grp.getEl(this.getElId(`inp##${inid}`))
            let typed = el.get_ftxt().toUnformatted()
            if (PropPanelCompositeBase.numeric[inid]) {
                let n = parseInt(typed, 10)
                n = (isFinite(n) && n >= 0) ? n : 0
                vel.setProp(inid, VpcValN(n))
            } else {
                vel.setProp(inid, VpcValS(typed))
            }
        }

        if (this.leftChoices.length) {
            let el = grp.getEl(this.getElId(`leftchoice`))
            let gel = new UI512ElTextFieldAsGeneric(cast(el, UI512ElTextField))                            
            let ln = SelAndEntry.selectByLinesWhichLine(gel)
            if (ln !== undefined && ln >= 0 && ln < this.leftChoices.length) {
                vel.setProp('style', VpcValS(this.leftChoices[ln][1]))
            }
        }

        for (let [lbltxt, inid] of this.rightOptions) {
            let el = grp.getEl(this.getElId(`toggle##${inid}`))
            let checked = el.get_b('checkmark')
            let val = vel.setProp(inid, VpcValBool(checked))
        }
    }
}

class PropPanelCompositeBtn extends PropPanelCompositeBase {
    isPropPanelCompositeBtn = true
    compositeType = "PropPanelCompositeBtn";
    readonly velTypeShortName = 'cd btn'
    readonly velTypeLongName = 'lngbutton'
    readonly velType = VpcElType.Btn
    topInputs:[string, string, number][] = [
        ['lngButton Name:', 'name', 190],
        ['lngButton Label:', 'label', 190],
        ['lngIcon:', 'icon', 45]]

    leftChoices:[string, string][] = [
        ["lngOpaque", "opaque"],
        ["lngRectangle", "rectangle"],
        ["lngTransparent", "transparent"],
        ["lngRoundrect", "roundrect"],
        ["lngShadow", "shadow"],
        ["lngCheckbox", "checkbox"],
        ["lngRadio", "radio"],
        ["lngPlain", "plain"],
        ["lngOS Standard", "standard"],
        ["lngOS Default", "default"],
    ]

    rightOptions:[string, string][] = [
        ['lngShow Label', 'showlabel'],
        ['lngAuto Hilite', 'autohilite'],
        ['lngEnabled', 'enabled'],
    ]
}

class PropPanelCompositeField extends PropPanelCompositeBase {
    isPropPanelCompositeField = true
    compositeType = "PropPanelCompositeField";
    readonly velTypeShortName = 'cd fld'
    readonly velTypeLongName = 'lngfield'
    readonly velType = VpcElType.Fld
    topInputs:[string, string, number][] = [
        ['lngField Name:', 'name', 190]]

    leftChoices:[string, string][] = [
        ["lngRectangle", "rectangle"],
        ["lngScrolling", "scrolling"],
        ["lngShadow", "shadow"],
        ["lngOpaque", "opaque"],
        ["lngTransparent", "transparent"],
    ]
        
    rightOptions:[string, string][] = [
        ['lngLock Text', 'locktext'],
        ['lngDon\'t Wrap', 'dontwrap'],
        ['lngSingle Line', 'singleline'],
        ['lngEnabled', 'enabled'],
    ]
}

class PropPanelCompositeCard extends PropPanelCompositeBase {
    isPropPanelCompositeCard = true
    compositeType = "PropPanelCompositeCard";
    readonly velTypeShortName = 'card'
    readonly velTypeLongName = 'lngcard'
    readonly velType = VpcElType.Card
    topInputs:[string, string, number][] = [['lngCard Name:', 'name', 190],]
    leftChoices:[string, string][] = []
    rightOptions:[string, string][] = []
}

class PropPanelCompositeStack extends PropPanelCompositeBase {
    isPropPanelCompositeStack = true
    compositeType = "PropPanelCompositeStack";
    readonly velTypeShortName = ''
    readonly velTypeLongName = ''
    readonly velType = VpcElType.Stack
    topInputs:[string, string, number][] = [['lngStack Name:', 'name', 190],]
    leftChoices:[string, string][] = []
    rightOptions:[string, string][] = []
    fillInValuesTip(app:UI512Application, vel:VpcElBase) {
        let txt = this.appli.lang().translate("lngRefer to this element in a script as\nthis stack")
        txt = TextRendererFontManager.setInitialFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString())
        this.lblNamingTip.set('labeltext', txt)
    }
}

class PropPanelCompositeBlank extends PropPanelCompositeBase {
    isPropPanelCompositeBlank = true
    compositeType = "PropPanelCompositeBlank";
    readonly velTypeShortName = ''
    readonly velTypeLongName = ''
    readonly velType = VpcElType.Unknown
    topInputs:[string, string, number][] = []
    leftChoices:[string, string][] = []
    rightOptions:[string, string][] = []
    createSpecific(app: UI512Application, lang: UI512Lang) {
        super.createSpecific(app, lang)

        let txt = this.appli.lang().translate("lngNothing is selected.")
        txt = TextRendererFontManager.setInitialFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString())
        this.lblNamingTip.set('labeltext', txt)
        this.lblNamingTip.setDimensions(this.lblNamingTip.x, this.lblNamingTip.y + 20, this.lblNamingTip.w, this.lblNamingTip.h)
    }

    refreshFromModel(root: Root, app:UI512Application) {
        let grp = app.getGroup(this.grpid)
        let btnGenPart = grp.getEl(this.getElId('btnGenPart'))
        let currentTool = this.appli.getOption_n('currentTool')
        let lbl = currentTool === VpcTool.button ? 'lngMake new button' : 'lngMake new field'
        btnGenPart.set('labeltext', this.appli.lang().translate(lbl))
    }
}

export class VpcAppPropPanel extends VpcAppInterfaceLayer {
    blank = new PropPanelCompositeBlank('editPanelBlank')
    panels = new MapKeyToObject<IsPropPanel>();
    editor = new VpcPanelScriptEditor('editPanelScript')
    active:O<IsPropPanel> = this.blank
    
    // set in initLayers
    model: VpcModel
    handles: VpcAppResizeHandles
    init(root:Root) {
        this.editor.appli = this.appli
        this.panels.add(VpcElType.Btn.toString(), new PropPanelCompositeBtn('editPanelBtn'))
        this.panels.add(VpcElType.Card.toString(), new PropPanelCompositeCard('editPanelCd'))
        this.panels.add(VpcElType.Fld.toString(), new PropPanelCompositeField('editPanelFld'))
        this.panels.add(VpcElType.Stack.toString(), new PropPanelCompositeStack('editPanelStack'))
        this.panels.add(VpcElType.Unknown.toString(), throwIfUndefined(this.blank, '6v|'))
        this.panels.add(VpcElType.Product.toString(), this.editor)
        for (let panel of this.panels.getVals()) {
            panel.appli = this.appli
            panel.x = this.appli.bounds()[0] + ScreenConsts.xareawidth + 1
            panel.y = this.appli.bounds()[1] + ScreenConsts.ymenubar + VpcAppToolboxes.toolsIconH + 8
            panel.logicalWidth = ScreenConsts.screenwidth - (ScreenConsts.xareawidth + 1)
            panel.logicalHeight = ScreenConsts.yareaheight - VpcAppToolboxes.toolsIconH
            panel.create(this.appli.getUi512App(), this.appli.lang())
            panel.setVisible(this.appli.getUi512App(), false)
            panel.cbGetAndValidateSelectedVel = (b) => this.getAndValidateSelectedVel(b)
        }
    }

    getEditToolSelectedFldOrBtn() {
        let vel = this.getAndValidateSelectedVel('selectedVelId')
        if (vel && (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld)) {
            return vel
        } else {
            return undefined
        }
    }

    getAndValidateSelectedVel(propname:string) {
        // the selectedVelId could be out of date.
        let selVel = this.appli.getOption_s(propname)
        let vel = this.appli.getModel().findByIdUntyped(selVel)
        let currentCard = this.appli.getModel().getCurrentCard().id
        if (vel && getToolCategory(this.appli.getTool()) === VpcToolCtg.ctgEdit) {
            // make sure the parent makes sense
            if (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld) {
                if (vel.parentId === currentCard) {
                    return vel
                }
            } else if (vel.getType() === VpcElType.Card) {
                if (vel.id === currentCard) {
                    return vel
                }
            } else if (vel.getType() === VpcElType.Stack) {
                return vel
            }
        }

        return undefined
    }

    refresh(root:Root) {
        let selected = this.getAndValidateSelectedVel('selectedVelId')
        let shouldBeActive: O<IsPropPanel>
        if (getToolCategory(this.appli.getOption_n('currentTool')) !== VpcToolCtg.ctgEdit) {
            shouldBeActive = undefined
        } else if (!selected) {
            shouldBeActive = this.blank
        } else if (this.appli.getOption_b('viewingScript')) {
            shouldBeActive = this.editor
        } else {
            shouldBeActive = this.panels.find(selected.getType().toString()) || 
                this.blank
        }

        for (let panel of this.panels.getVals()) {
            panel.setVisible(this.appli.getUi512App(), false)
        }

        if (shouldBeActive) {
            shouldBeActive.setVisible(this.appli.getUi512App(), true)
        }

        this.active = shouldBeActive
        if (this.active) {
            this.active.refreshFromModel(root, this.appli.getUi512App())            
        }
    }

    respondKeydown(root:Root, d: KeyDownEventDetails) {
        if (this.active && this.active instanceof PropPanelCompositeBase && d.readableShortcut === 'Enter') {
            this.active.saveChangesToModel(root, this.appli.getUi512App())
            this.refresh(root)
            d.setHandled()
        }
    }
        
    respondMouseUp(root: Root, d: MouseUpEventDetails) {
        if (this.active && d.elClick) {
            let isOnPanel = this.active.fromFullId(d.elClick.id)
            if (isOnPanel) {
                this.active.saveChangesToModel(root, this.appli.getUi512App())
                this.refresh(root)

                if (d.elClick.id && d.elClick.id.endsWith("##btnScript")) {
                    this.editor.sendClick(root, this.appli.getUi512App(), d.elClick.id)   
                } else if (d.elClick.id && scontains(d.elClick.id, "##VpcPanelScriptEditor##")) {
                    this.editor.sendClick(root, this.appli.getUi512App(), d.elClick.id)   
                } else if (d.elClick.id && d.elClick.id.endsWith("##btnGenPart")) {
                    let action = this.appli.getOption_n('currentTool') === VpcTool.button ? 'mnuObjectsNewBtn' : 'mnuObjectsNewFld'
                    this.appli.performMenuAction(action)
                }
            }
        }
    }
}
