
/* auto */ import { VpcNonModalBase, VpcNonModalFormBase } from './vpcLyrNonModalHolder';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { RectUtils } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { RespondToErr, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O, tostring } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, cast } from './../../ui512/utils/util512';
/* auto */ import { TextSelModify } from './../../ui512/textedit/ui512TextSelModify';
/* auto */ import { UI512ElTextFieldAsGeneric } from './../../ui512/textedit/ui512GenericField';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { UI512ElTextField, UI512FldStyle } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { UI512DrawText } from './../../ui512/drawtext/ui512DrawText';
/* auto */ import { WndBorderDecorationConsts } from './../../ui512/composites/ui512Composites';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * documentation viewer
 * used for both
 * "examples" (currently points to youtube example videos)
 * and
 * "reference" (complete scripting reference)
 */
export class VpcNonModalDocViewer extends VpcNonModalBase {
    compositeType = 'VpcNonModalDocViewer';
    hasCloseBtn = true;
    adjustedStartVidBtn = false;
    cbShowVids: O<() => void>;
    constructor(protected vci: VpcStateInterface, public type: DialogDocsType) {
        super('VpcNonModalDocViewer' + Math.random());

        /* set size of window. LargeWindowBounds is an alternative */
        VpcNonModalFormBase.standardWindowBounds(this, vci);
    }

    /**
     * data for examples
     */
    readonly examplesInfo: [string, string, number][] = [
        ['vid1', 'lngVideo: Animation', 1],
        ['vid2', 'lngVideo: Game', 1],
        ['vid3', 'lngVideo: Art', 1]
    ];

    /**
     * data for script reference
     */
    readonly referenceInfo: [string, string, string[]][] = [
        /* prettier-ignore */
        ["overview", "lngOverview", ["Introduction", "Scripting", "Expressions", "Message Box", "Lists/Arrays", "Variables", "User Functions", "Text and Chunks", "Objects", "Structure", "Examples", "Tips & Shortcuts", "What's New", "Credits"]],
        /* prettier-ignore */
        ["commands", "lngCommands", ["add", "answer", "ask", "beep", "choose tool", "click", "create", "do", "doMenu", "dial", "disable", "divide", "delete ", "drag", "enable", "go to card", "hide", "multiply", "lock screen", "play", "put", "replace", "select", "send", "set", "show", "sort", "subtract", "unlock screen", "wait", "visual effect"]],
        /* prettier-ignore */
        ["syntax", "lngSyntax", ["(Operators)", "(Constants)", "global", "if/then", "short if/then", "exit repeat", "exit", "exit to ViperCard", "next repeat", "pass", "repeat", "return"]],
        /* prettier-ignore */
        ["properties", "lngProperties", ["id", "name", "number", "owner", "script", "btn: autohilite", "btn: checkmark", "btn: enabled", "btn: left", "btn: loc, location", "btn: height", "btn: hilite", "btn: label", "btn: icon", "btn: rect, rectangle", "btn: showlabel", "btn: style", "btn: textalign", "btn: textfont", "btn: textsize", "btn: textstyle", "btn: top", "btn: topleft", "btn: visible", "btn: width", "fld: alltext", "fld: dontwrap", "fld: enabled", "fld: defaulttextfont", "fld: defaulttextsize", "fld: defaulttextstyle", "fld: left", "fld: loc, location", "fld: locktext", "fld: height", "fld: rect, rectangle", "fld: scroll", "fld: singleline", "fld: style", "fld: textalign", "fld: textfont", "fld: textsize", "fld: textstyle", "fld: top", "fld: topleft", "fld: width", "fld: visible", "cursor", "filled", "lineColor", "lineSize", "itemdelimiter", "idlerate", "multiple", "pattern"]],
        /* prettier-ignore */
        ["functions", "lngFunctions", ["abs", "atan", "average", "charToNum", "clickH", "clickLoc", "clickV", "commandKey", "contains", "cos", "date", "exp", "exp2", "is a", "is in", "keyChar", "keyRepeated", "length", "ln", "log2", "max", "me", "min", "mouse", "mouseClick", "mouseH", "mouseLoc", "mouseV", "number", "numberToStr", "numToChar", "objectById", "offset", "optionKey", "param", "paramCount", "params", "random", "result", "round", "screenRect", "seconds", "selectedChunk", "selectedField", "selectedLine", "selectedText", "the selection", "shiftKey", "sqrt", "sin", "strToNumber", "sum", "tan", "target", "there is a", "ticks", "tool", "toLowerCase", "toUpperCase", "trunc", "annuity", "compound"]],
        /* prettier-ignore */
        ["events", "lngEvent Handlers", ["afterKeyDown", "afterKeyUp", "closeBackground", "closeCard", "closeField", "exitField", "idle", "mouseDoubleClick", "mouseDown", "mouseEnter", "mouseLeave", "mouseUp", "mouseWithin", "openBackground", "openCard", "openField", "openStack"]],
        /* prettier-ignore */
        ["compatibility", "lngCompatibility", ["(Compatibility)", "abbrev id", "abbrev name", "arrowKey", "bottom", "botright", "diskSpace", "environment", "errorDialog", "exp1", "freesize", "get", "heapSpace", "ln1", "long name", "mark", "marked", "on errorDialog", "right", "pop", "push", "size", "stacksInUse", "stackSpace", "suspended", "systemVersion", "trappable: on arrowKey", "trappable: on doMenu", "trappable: on help", "unmark", "version"]]
    ];

    /**
     * cache script reference data loaded from server
     */
    referenceJsonData = new JsonDocumentationStructure();

    /**
     * add list entries and choose the first
     */
    initialPopulate() {
        let grp = this.vci.UI512App().getGroup(this.grpId);
        let topGeneric = grp.getEl(this.getElId('topChoice'));
        let top = cast(UI512ElTextField, topGeneric);
        if (this.type === DialogDocsType.Reference) {
            let choices = this.referenceInfo.map(item => lng(item[1]));
            UI512ElTextField.setListChoices(top, choices);
        } else if (this.type === DialogDocsType.Examples) {
            let choices = this.examplesInfo.map(item => lng(item[1]));
            UI512ElTextField.setListChoices(top, choices);
            let btmGeneric = grp.getEl(this.getElId('btmChoice'));
            btmGeneric.set('visible', false);
        }

        /* auto-choose the first entry in the list */
        let lftgel = new UI512ElTextFieldAsGeneric(top);
        TextSelModify.selectLineInField(lftgel, 0);
        this.onChooseCategory(top);
    }

    /**
     * which line of a listbox is selected
     */
    protected getChosenCategoryNumber(top: UI512ElTextField): O<number> {
        let gel = new UI512ElTextFieldAsGeneric(cast(UI512ElTextField, top));
        return TextSelModify.selectByLinesWhichLine(gel);
    }

    /**
     * when a category is chosen
     */
    protected onChooseCategory(top: UI512ElTextField) {
        let ctg = this.getChosenCategoryNumber(top);
        let lns: string[] = [];
        if (ctg !== undefined && this.type === DialogDocsType.Reference) {
            let ctginfo = this.referenceInfo[ctg];
            if (ctginfo) {
                lns = ctginfo[2];
            }
        } else if (ctg !== undefined && this.type === DialogDocsType.Examples) {
            let ctginfo = this.examplesInfo[ctg];
            if (ctginfo) {
                let nTotal = ctginfo[2];
                lns = Util512.range(0, nTotal).map(n => (n + 1).toString());
            }
        }

        /* reset right side */
        let grp = this.vci.UI512App().getGroup(this.grpId);
        this.resetRightSide(grp, false);

        /* deselect bottom choice */
        let btmGeneric = grp.findEl(this.getElId('btmChoice'));
        if (btmGeneric) {
            if (ctg !== undefined && this.type === DialogDocsType.Examples) {
                this.onChooseExampleVid(ctg, grp);
            }

            let btm = cast(UI512ElTextField, btmGeneric);
            UI512ElTextField.setListChoices(btm, lns);
            btm.set('selcaret', 0);
            btm.set('selend', 0);
            btm.set('scrollamt', 0);
        }
    }

    /**
     * when a video category is chosen, set the button name
     */
    protected onChooseExampleVid(ctg: number, grp: UI512ElGroup) {
        let ctginfo = this.examplesInfo[ctg];
        if (ctginfo) {
            let starting = this.getElId('btmChoice');
            for (let el of grp.iterEls()) {
                if (el.id.startsWith(starting)) {
                    el.set('visible', !ctginfo[0].startsWith('vid'));
                }
            }

            let vidTitles = [
                'Video 1:\nhow to make\nan animated GIF',
                'Video 2:\nhow to make a game',
                'Video 3:\nhow to make\ninteractive art'
            ];

            let btnStartVid = grp.getEl(this.getElId('btnStartVid'));
            btnStartVid.set('visible', ctginfo[0].startsWith('vid'));
            btnStartVid.set('labeltext', tostring(vidTitles[ctg]));
            if (ctginfo[0].startsWith('vid')) {
                let rghtBackground = grp.findEl(this.getElId('rghtBackground'));
                if (rghtBackground) {
                    rghtBackground.set('labeltext', '');
                }
            }
        }
    }

    /**
     * clear all content on the right side
     */
    protected resetRightSide(grp: UI512ElGroup, isWaiting: boolean) {
        let rghtFld = grp.findEl(this.getElId('rghtFld'));
        let rghtBackground = grp.findEl(this.getElId('rghtBackground'));
        if (rghtFld) {
            rghtFld.set('scrollamt', 0);
            rghtFld.setFmTxt(FormattedText.newFromUnformatted(isWaiting ? ' ... ' : ''));
        }

        if (rghtBackground) {
            if (!isWaiting && this.type === DialogDocsType.Examples) {
                this.giveRightBtnText(rghtBackground);
            } else {
                rghtBackground.set('labeltext', '');
            }
        }
    }

    /**
     * show the json data on the right side
     */
    protected referenceShowData(grp: UI512ElGroup, btm: UI512ElTextField, ctg: number, jsonData: JsonDocumentationStructure) {
        let entryTitles = this.referenceInfo[ctg][2];
        let gel = new UI512ElTextFieldAsGeneric(btm);
        let ln = TextSelModify.selectByLinesWhichLine(gel);
        if (ln !== undefined) {
            let entryTitle = entryTitles[ln];
            if (entryTitle) {
                for (let i = 0, len = jsonData.entries.length; i < len; i++) {
                    let jsonEntry = jsonData.entries[i];
                    if (
                        jsonEntry.body &&
                        (jsonEntry.title.toLowerCase() === entryTitle.toLowerCase() ||
                            jsonEntry.title.split('(')[0].toLowerCase() === entryTitle.toLowerCase())
                    ) {
                        let btnStartVid = grp.getEl(this.getElId('btnStartVid'));
                        if (entryTitle.toLowerCase() === 'introduction') {
                            btnStartVid.set('visible', true);
                            btnStartVid.set('labeltext', '(Open a tutorial vid)');
                            if (!this.adjustedStartVidBtn) {
                                this.adjustedStartVidBtn = true;
                                btnStartVid.set('h', btnStartVid.getN('h') - 30);
                                btnStartVid.set('y', btnStartVid.getN('y') + 50);
                                btnStartVid.set('x', btnStartVid.getN('x') - 10);
                            }
                        } else {
                            btnStartVid.set('visible', false);
                        }

                        let txt = FormattedText.newFromSerialized(jsonEntry.body);
                        let rghtFld = grp.findEl(this.getElId('rghtFld'));
                        if (rghtFld) {
                            rghtFld.setFmTxt(txt);
                            return;
                        }
                    }
                }
            }
        }
    }

    /**
     * user clicked on an item
     */
    protected onChooseItem(btm: UI512ElTextField) {
        let grp = this.vci.UI512App().getGroup(this.grpId);
        let topGeneric = grp.getEl(this.getElId('topChoice'));
        let top = cast(UI512ElTextField, topGeneric);
        let ctg = this.getChosenCategoryNumber(top);
        this.resetRightSide(grp, true);

        if (ctg !== undefined) {
            if (this.type === DialogDocsType.Reference) {
                this.onChooseReferenceItem(ctg, grp, btm);
            } else if (this.type === DialogDocsType.Examples) {
                let section = this.examplesInfo[ctg];
                if (section) {
                    let sectionId = section[0];
                    this.examplesShowData(grp, btm, ctg, sectionId);
                }
            }
        }
    }

    /**
     * user clicked on a reference item, begin async load if hasn't loaded yet
     */
    protected onChooseReferenceItem(ctg: number, grp: UI512ElGroup, btm: UI512ElTextField) {
        let section = this.referenceInfo[ctg];
        if (section) {
            let sectionId = section[0];
            let jsonData = this.referenceJsonData[sectionId];
            if (jsonData) {
                this.referenceShowData(grp, btm, ctg, jsonData);
            } else {
                let url = '/resources03a/docs/ref' + sectionId + '.json';
                let afn = async () => {
                    let obj = await Util512Higher.asyncLoadJson(url);
                    assertTrue(obj.entries, 'KW|');
                    this.referenceJsonData[sectionId] = obj;
                    this.onChooseItem(btm);
                };

                Util512Higher.syncToAsyncTransition(afn(), 'ChooseReferenceItem', RespondToErr.Alert);
            }
        }
    }

    /**
     * show the button linking to video
     */
    protected examplesShowData(grp: UI512ElGroup, btm: UI512ElTextField, ctg: number, sectionId: string) {
        let gel = new UI512ElTextFieldAsGeneric(btm);
        let ln = TextSelModify.selectByLinesWhichLine(gel);
        if (ln !== undefined && ln >= 0 && ln < this.examplesInfo[ctg][2]) {
            this.resetRightSide(grp, true);
        }
    }

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        /* draw a 1px border around the panel */
        let grp = app.getGroup(this.grpId);
        let bg = this.genBtn(app, grp, 'bg');
        bg.set('autohighlight', false);
        bg.setDimensions(this.x, this.y, this.logicalWidth, this.logicalHeight);

        let curY = this.y;
        let headheight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasCloseBtn);
        curY += headheight;

        let [top, btm] = this.createLayoutListboxes(curY, grp);
        let rghtFld = this.createLayoutRightFld(grp, top, headheight, btm);
        this.createLayoutRightBtn(grp, rghtFld);
        let caption = dialogDocsTypeToStr(this.type);
        grp.getEl(this.getElId('caption')).set('labeltext', lng(caption));
        this.initialPopulate();
    }

    /**
     * draw thw two listboxes on the left
     */
    protected createLayoutListboxes(curY: number, grp: UI512ElGroup) {
        curY += 15;
        let top = UI512ElTextField.makeChoiceBox(this.vci.UI512App(), grp, this.getElId('topChoice'), this.x + 15, curY);
        top.set('w', 131);
        curY += top.h + 15;
        let btm = UI512ElTextField.makeChoiceBox(this.vci.UI512App(), grp, this.getElId('btmChoice'), this.x + 15, curY);
        btm.set('w', 131);
        return [top, btm];
    }

    /**
     * show link to start video
     */
    protected createLayoutRightBtn(grp: UI512ElGroup, rghtFld: UI512ElTextField) {
        let rghtBackground = this.genBtn(this.vci.UI512App(), grp, 'rghtBtn');
        rghtBackground.set('autohighlight', false);
        rghtBackground.setDimensions(rghtFld.x, rghtFld.y, rghtFld.w, rghtFld.h);
        rghtBackground.set('visible', this.type !== DialogDocsType.Reference);
        rghtBackground.set('style', this.type === DialogDocsType.Examples ? UI512BtnStyle.Rectangle : UI512BtnStyle.Transparent);

        let btnStartVid = this.genBtn(this.vci.UI512App(), grp, 'btnStartVid');
        btnStartVid.set('style', UI512BtnStyle.OSStandard);
        btnStartVid.set('autohighlight', true);
        btnStartVid.set('labeltext', 'Start Video');
        btnStartVid.set('visible', this.type === DialogDocsType.Examples);
        btnStartVid.setDimensions(
            rghtFld.x + Math.round(rghtFld.w / 2) - 200 / 2,
            rghtFld.y + Math.round(rghtFld.h / 2) - 100 / 2,
            200,
            100
        );
    }

    /**
     * the field that holds documentation content
     */
    protected createLayoutRightFld(grp: UI512ElGroup, top: UI512ElTextField, headheight: number, btm: UI512ElTextField) {
        let rghtFld = this.genChild<UI512ElTextField>(this.vci.UI512App(), grp, 'rghtFld', UI512ElTextField);
        if (this.type === DialogDocsType.Examples) {
            rghtFld.setDimensionsX1Y1(
                top.x + top.w + 10,
                this.y + headheight - 1,
                this.x + this.logicalWidth,
                this.y + this.logicalHeight - 1
            );
            let shrunk = RectUtils.getSubRectRaw(rghtFld.x, rghtFld.y, rghtFld.w, rghtFld.h, 7, 7);
            if (shrunk) {
                rghtFld.setDimensions(shrunk[0], shrunk[1], shrunk[2], shrunk[3]);
            }
        } else {
            rghtFld.setDimensionsX1Y1(top.x + top.w + 10, top.y, this.x + this.logicalWidth, btm.bottom);
        }

        rghtFld.set('style', UI512FldStyle.Rectangle);
        rghtFld.set('canselecttext', true);
        rghtFld.set('canedit', false);
        rghtFld.set('scrollbar', this.type === DialogDocsType.Reference);
        return rghtFld;
    }

    /**
     * start the video in a new browser tab
     */
    protected clickedBtnStartVid() {
        if (this.type === DialogDocsType.Examples) {
            let grp = this.vci.UI512App().getGroup(this.grpId);
            let top = cast(UI512ElTextField, grp.getEl(this.getElId('topChoice')));
            let ctg = this.getChosenCategoryNumber(top);
            if (ctg !== undefined && this.examplesInfo[ctg]) {
                let num = this.examplesInfo[ctg][0].replace(/vid/g, '');
                window.open('/0.3/html/video' + num + '.html', '_blank');
            }
        } else {
            /* close this and load the tutorial one */
            if (this.cbShowVids) {
                this.cbShowVids();
            }
        }
    }

    /**
     * when showing example screenshots (the old way before youtube vids),
     * the right button to start showing screenshots
     */
    protected giveRightBtnText(rghtBackground: UI512Element) {
        let s = 'Click here to view a tutorial showing how to use ViperCard.';
        let style = 'b+iuosdce';
        s = UI512DrawText.setFont(s, `geneva_14_${style}`);
        rghtBackground.set('labeltext', s);
    }

    /**
     * route button click
     */
    onClickBtn(short: string, el: UI512Element, vci: VpcStateInterface): void {
        if (short === 'topChoice') {
            this.onChooseCategory(cast(UI512ElTextField, el));
        } else if (short === 'btmChoice') {
            this.onChooseItem(cast(UI512ElTextField, el));
        } else if (short === 'btnStartVid') {
            this.clickedBtnStartVid();
        }
    }

    /**
     * respond to mouse down
     */
    onMouseDown(short: string, el: UI512Element, vci: VpcStateInterface): void {}
}

/**
 * structure of the json documentation
 */
class JsonDocumentationStructure {
    name: string;
    entries: {
        title: string;
        body: string;
    }[];
}

/**
 * are we showing examples or script reference
 */
export enum DialogDocsType {
    None = 1,
    Examples,
    Reference
}

/**
 * used for the window caption
 */
function dialogDocsTypeToStr(e: DialogDocsType) {
    if (e === DialogDocsType.Examples) {
        return 'lngViperCard Examples';
    } else if (e === DialogDocsType.Reference) {
        return 'lngComplete Script Reference';
    } else {
        return '';
    }
}
