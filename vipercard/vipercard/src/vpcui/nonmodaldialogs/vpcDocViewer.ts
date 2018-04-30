
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, anyJson, cast } from '../../ui512/utils/utils512.js';
/* auto */ import { RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { TextSelModify } from '../../ui512/textedit/ui512TextSelModify.js';
/* auto */ import { WndBorderDecorationConsts } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcNonModalBase, VpcNonModalFormBase } from '../../vpcui/nonmodaldialogs/vpcLyrNonModalHolder.js';

/**
 * documentation viewer
 * used for both
 * "examples" (currently points to youtube example videos)
 * and
 * "reference" (complete scriping reference)
 */
export class VpcNonModalDocViewer extends VpcNonModalBase {
    isVpcNonModalDocViewer = true;
    compositeType = 'VpcNonModalDocViewer';
    hasCloseBtn = true;
    constructor(protected vci: VpcStateInterface, public type: DialogDocsType) {
        super('VpcNonModalDocViewer' + Math.random());

        /* set size of window */
        if (this.type === DialogDocsType.Examples) {
            VpcNonModalFormBase.largeWindowBounds(this, vci);
        } else {
            VpcNonModalFormBase.standardWindowBounds(this, vci);
        }
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
        ['fundamentals', 'lngFundamentals', ['Introduction', 'Fundamentals', 'Expressions', 'Variables', 'Structure', 'Lists/arrays', 'Custom funcs', 'Chunks', 'Constants', 'Tips & Shortcuts', 'Credits']],
        /* prettier-ignore */
        ['functions', 'lngFunctions', ['abs', 'atan', 'charToNum', 'clickh', 'clickloc', 'clickv', 'commandKey', 'contains', 'cos', 'diskSpace', 'exp', 'exp1', 'exp2', 'heapSpace', 'is a', 'is in', 'is within', 'keyChar', 'keyRepeated', 'length', 'ln', 'ln1', 'log2', 'max', 'me', 'min', 'mouse', 'mouseclick', 'mouseh', 'mouseloc', 'mousev', 'numToChar', 'number', 'numberToStr', 'offset', 'optionKey', 'param', 'paramCount', 'params', 'random', 'result', 'round', 'screenRect', 'seconds', 'selectedChunk', 'selectedField', 'selectedLine', 'selectedText', 'shiftKey', 'sin', 'sqrt', 'stackSpace', 'strToNumber', 'sum', 'systemVersion', 'tan', 'target', 'there is a', 'ticks', 'tool', 'trunc']],
        /* prettier-ignore */
        ['eventhandlers', 'lngEvent Handlers', ['on afterKeyDown', 'on afterKeyUp', 'on closeCard', 'on idle', 'on mouseDoubleClick', 'on mouseDown', 'on mouseEnter', 'on mouseLeave', 'on mouseUp', 'on mouseWithin', 'on openCard', 'on openStack']],
        /* prettier-ignore */
        ['commands', 'lngCommands', ['add', 'answer', 'ask', 'beep', 'choose', 'click', 'create', 'delete', 'disable', 'divide', 'drag', 'enable', 'exit', 'exit repeat', 'get', 'global', 'go', 'hide', 'if/then', 'lock screen', 'multiply', 'next repeat', 'pass', 'play', 'put', 'repeat', 'return', 'set', 'show', 'sort', 'subtract', 'unlock screen', 'wait']],
        /* prettier-ignore */
        ['properties', 'lngProperties', ['btn: abbrev id', 'btn: abbrev name', 'btn: autohilite', 'btn: botright', 'btn: bottom', 'btn: bottomright', 'btn: checkmark', 'btn: enabled', 'btn: height', 'btn: hilite', 'btn: icon', 'btn: id', 'btn: label', 'btn: left', 'btn: loc', 'btn: location', 'btn: long id', 'btn: long name', 'btn: name', 'btn: owner', 'btn: rect', 'btn: rectangle', 'btn: right', 'btn: script', 'btn: short id', 'btn: short name', 'btn: showlabel', 'btn: style', 'btn: textalign', 'btn: textfont', 'btn: textsize', 'btn: textstyle', 'btn: top', 'btn: topleft', 'btn: visible', 'btn: width', 'card: abbrev id', 'card: abbrev name', 'card: id', 'card: long id', 'card: long name', 'card: name', 'card: owner', 'card: short id', 'card: short name', 'fld: abbrev id', 'fld: abbrev name', 'fld: alltext', 'fld: botright', 'fld: bottom', 'fld: bottomright', 'fld: defaulttextfont', 'fld: defaulttextsize', 'fld: defaulttextstyle', 'fld: dontwrap', 'fld: enabled', 'fld: height', 'fld: id', 'fld: left', 'fld: loc', 'fld: location', 'fld: locktext', 'fld: long id', 'fld: long name', 'fld: name', 'fld: owner', 'fld: rect', 'fld: rectangle', 'fld: right', 'fld: scroll', 'fld: short id', 'fld: short name', 'fld: singleline', 'fld: style', 'fld: textalign', 'fld: textfont', 'fld: textsize', 'fld: textstyle', 'fld: top', 'fld: topleft', 'fld: visible', 'fld: width', 'global: environment', 'global: freesize', 'global: idlerate', 'global: itemdelimiter', 'global: long version', 'global: size', 'global: stacksinuse', 'global: suspended', 'global: version']],
    ];

    /**
     * cache script reference data loaded from server
     */
    referenceJsonData: { [key: string]: anyJson } = {};

    /**
     * add list entries and choose the first
     */
    initialPopulate() {
        let grp = this.vci.UI512App().getGroup(this.grpId);
        let topGeneric = grp.getEl(this.getElId('topChoice'));
        let top = cast(topGeneric, UI512ElTextField);
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
        let gel = new UI512ElTextFieldAsGeneric(cast(top, UI512ElTextField));
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
                lns = Util512.range(nTotal).map(n => (n + 1).toString());
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

            let btm = cast(btmGeneric, UI512ElTextField);
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
            btnStartVid.set('labeltext', '' + vidTitles[ctg]);
            if (ctginfo[0].startsWith('vid')) {
                let rghtBtn = grp.getEl(this.getElId('rghtBtn'));
                rghtBtn.set('labeltext', '');
            }
        }
    }

    /**
     * clear all content on the right side
     */
    protected resetRightSide(grp: UI512ElGroup, isWaiting: boolean) {
        let rghtFld = grp.findEl(this.getElId('rghtFld'));
        let rghtBtn = grp.findEl(this.getElId('rghtBtn'));
        if (rghtFld) {
            rghtFld.set('scrollamt', 0);
            rghtFld.setFmTxt(FormattedText.newFromUnformatted(isWaiting ? ' ... ' : ''));
        }

        if (rghtBtn) {
            rghtBtn.set('iconnumber', 0);
            rghtBtn.set('icongroupid', '');

            if (!isWaiting && this.type === DialogDocsType.Examples) {
                this.giveRightBtnText(rghtBtn);
            } else {
                rghtBtn.set('labeltext', '');
            }
        }
    }

    /**
     * show the json data on the right side
     */
    protected referenceShowData(grp: UI512ElGroup, btm: UI512ElTextField, ctg: number, jsonData: anyJson) {
        let entryTitles = this.referenceInfo[ctg][2];
        let gel = new UI512ElTextFieldAsGeneric(btm);
        let ln = TextSelModify.selectByLinesWhichLine(gel);
        if (ln !== undefined) {
            let entryTitle = entryTitles[ln];
            if (entryTitle) {
                for (let jsonEntry of jsonData.entries) {
                    if (jsonEntry.body && jsonEntry.title.toLowerCase() === entryTitle.toLowerCase()) {
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
        let top = cast(topGeneric, UI512ElTextField);
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
                let url = '/resources/docs/ref' + sectionId + '.json';
                let req = new XMLHttpRequest();
                Util512.beginLoadJson(url, req, sjson => {
                    this.vci.placeCallbackInQueue(() => {
                        let parsedJson = JSON.parse(sjson);
                        assertTrue(parsedJson.entries, '');
                        this.referenceJsonData[sectionId] = parsedJson;
                        this.onChooseItem(btm);
                    });
                });
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
            this.resetRightSide(grp, true); /* show the "..." */
            let rghtBtn = grp.findEl(this.getElId('rghtBtn'));
            if (rghtBtn) {
                rghtBtn.set('iconnumber', ln);
                rghtBtn.set('icongroupid', 'screenshots_' + sectionId);
            }
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
        let top = UI512ElTextField.makeChoiceBox(
            this.vci.UI512App(),
            grp,
            this.getElId('topChoice'),
            this.x + 15,
            curY
        );
        top.set('w', 131);
        curY += top.h + 15;
        let btm = UI512ElTextField.makeChoiceBox(
            this.vci.UI512App(),
            grp,
            this.getElId('btmChoice'),
            this.x + 15,
            curY
        );
        btm.set('w', 131);
        return [top, btm];
    }

    /**
     * when showing example screenshots (the old way before youtube vids),
     * the right button holds the screenshot as an icon
     */
    protected createLayoutRightBtn(grp: UI512ElGroup, rghtFld: UI512ElTextField) {
        let rghtBtn = this.genBtn(this.vci.UI512App(), grp, 'rghtBtn');
        rghtBtn.set('autohighlight', false);
        rghtBtn.setDimensions(rghtFld.x, rghtFld.y, rghtFld.w, rghtFld.h);
        rghtBtn.set('visible', this.type !== DialogDocsType.Reference);
        rghtBtn.set(
            'style',
            this.type === DialogDocsType.Examples ? UI512BtnStyle.Rectangle : UI512BtnStyle.Transparent
        );

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
    protected createLayoutRightFld(
        grp: UI512ElGroup,
        top: UI512ElTextField,
        headheight: number,
        btm: UI512ElTextField
    ) {
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
    protected clickedBtnStartVid(rightBtn: UI512Element) {
        if (this.type === DialogDocsType.Examples) {
            let grp = this.vci.UI512App().getGroup(this.grpId);
            let btmGeneric = grp.getEl(this.getElId('btmChoice'));
            let top = cast(grp.getEl(this.getElId('topChoice')), UI512ElTextField);
            let ctg = this.getChosenCategoryNumber(top);
            if (ctg !== undefined && this.examplesInfo[ctg]) {
                let num = this.examplesInfo[ctg][0].replace('vid', '');
                let redirectWindow = window.open('/0.2/html/video' + num + '.html', '_blank');
            }
        }
    }

    /**
     * when showing example screenshots (the old way before youtube vids),
     * the right button to start showing screenshots
     */
    protected giveRightBtnText(rghtBtn: UI512Element) {
        let s = 'Click here to view a tutorial showing how to use ViperCard.';
        let style = 'b+iuosdce';
        s = UI512DrawText.setFont(s, `geneva_14_${style}`);
        rghtBtn.set('labeltext', s);
    }

    /**
     * when showing example screenshots (the old way before youtube vids),
     * advance to the next screenshot
     */
    protected clickedRightBtn(rightBtn: UI512Element) {
        if (this.type === DialogDocsType.Examples) {
            /* advance to the next picture, if applicable. */
            let grp = this.vci.UI512App().getGroup(this.grpId);
            let btmGeneric = grp.getEl(this.getElId('btmChoice'));
            let btm = cast(btmGeneric, UI512ElTextField);
            let gel = new UI512ElTextFieldAsGeneric(btm);
            let lnCurrent = TextSelModify.selectByLinesWhichLine(gel);
            let lastLine =
                btm
                    .getFmTxt()
                    .toUnformatted()
                    .split('\n').length - 1;
            lastLine -= 1; /* compensate for last empty line */
            if (lastLine <= 1) {
                return; /* looks like a "video" one */
            }

            if (lnCurrent !== undefined && lnCurrent < lastLine) {
                lnCurrent += 1;
                TextSelModify.selectLineInField(gel, lnCurrent);
                this.onChooseItem(btm);
            } else if (lnCurrent === undefined) {
                lnCurrent = 0;
                TextSelModify.selectLineInField(gel, lnCurrent);
                this.onChooseItem(btm);
            }
        }
    }

    /**
     * route button click
     */
    onClickBtn(short: string, el: UI512Element, vci: VpcStateInterface): void {
        if (short === 'topChoice') {
            this.onChooseCategory(cast(el, UI512ElTextField));
        } else if (short === 'btmChoice') {
            this.onChooseItem(cast(el, UI512ElTextField));
        } else if (short === 'rghtBtn') {
            this.clickedRightBtn(el);
        } else if (short === 'btnStartVid') {
            this.clickedBtnStartVid(el);
        }
    }

    /**
     * respond to mouse down
     */
    onMouseDown(short: string, el: UI512Element, vci: VpcStateInterface): void {}
}

/**
 * are we showing examples or script reference
 */
export enum DialogDocsType {
    None,
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
