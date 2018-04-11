
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, cast } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { SelAndEntry } from '../../ui512/textedit/ui512TextModify.js';
/* auto */ import { WndBorderDecorationConsts } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcFormNonModalDialogBase, VpcFormNonModalDialogFormBase } from '../../vpcui/nonmodaldialogs/vpcNonModalCommon.js';

export enum DialogDocsType {
    None,
    Screenshots,
    Reference
}

function dialogDocsTypeToStr(e: DialogDocsType) {
    if (e === DialogDocsType.Screenshots) {
        return 'lngViperCard Examples';
    } else if (e === DialogDocsType.Reference) {
        return 'lngComplete Script Reference';
    } else {
        return '';
    }
}

export class VpcAppNonModalDialogDocs extends VpcFormNonModalDialogBase {
    isVpcAppNonModalDialogDocs = true;
    compositeType = 'VpcAppNonModalDialogDocs';
    hasCloseBtn = true;
    readonly screenshotsInfo: [string, string, number][] = [
        ['vid1', 'lngVideo: Animation', 1],
        ['vid2', 'lngVideo: Game', 1],
        ['vid3', 'lngVideo: Art', 1]
        // ['anim', 'lngSteps: Animation', 29],
        // ['hello', 'lngSteps: Script', 11],
    ];
    readonly referenceInfo: [string, string, string[]][] = [
        // prettier-ignore
        ['fundamentals', 'lngFundamentals', ['Introduction', 'Fundamentals', 'Expressions', 'Variables', 'Structure', 'Lists/arrays', 'Custom funcs', 'Chunks', 'Constants', 'Tips & Shortcuts', 'Credits']],
        // prettier-ignore
        ['functions', 'lngFunctions', ['abs', 'atan', 'charToNum', 'clickh', 'clickloc', 'clickv', 'commandKey', 'contains', 'cos', 'diskSpace', 'exp', 'exp1', 'exp2', 'heapSpace', 'is a', 'is in', 'is within', 'keyChar', 'keyRepeated', 'length', 'ln', 'ln1', 'log2', 'max', 'me', 'min', 'mouse', 'mouseclick', 'mouseh', 'mouseloc', 'mousev', 'numToChar', 'number', 'numberToStr', 'offset', 'optionKey', 'param', 'paramCount', 'params', 'random', 'result', 'round', 'screenRect', 'seconds', 'selectedChunk', 'selectedField', 'selectedLine', 'selectedText', 'shiftKey', 'sin', 'sqrt', 'stackSpace', 'strToNumber', 'sum', 'systemVersion', 'tan', 'target', 'there is a', 'ticks', 'tool', 'trunc']],
        // prettier-ignore
        ['event_handlers', 'lngEvent Handlers', ['on afterKeyDown', 'on afterKeyUp', 'on closeCard', 'on idle', 'on mouseDoubleClick', 'on mouseDown', 'on mouseEnter', 'on mouseLeave', 'on mouseUp', 'on mouseWithin', 'on openCard', 'on openStack']],
        // prettier-ignore
        ['commands', 'lngCommands', ['add', 'answer', 'ask', 'beep', 'choose', 'click', 'create', 'delete', 'disable', 'divide', 'drag', 'enable', 'exit', 'exit repeat', 'get', 'global', 'go', 'hide', 'if/then', 'lock screen', 'multiply', 'next repeat', 'pass', 'put', 'repeat', 'return', 'set', 'show', 'sort', 'subtract', 'unlock screen', 'wait']],
        // prettier-ignore
        ['properties', 'lngProperties', ['btn: abbrev id', 'btn: abbrev name', 'btn: autohilite', 'btn: botright', 'btn: bottom', 'btn: bottomright', 'btn: checkmark', 'btn: enabled', 'btn: height', 'btn: hilite', 'btn: icon', 'btn: id', 'btn: label', 'btn: left', 'btn: loc', 'btn: location', 'btn: long id', 'btn: long name', 'btn: name', 'btn: rect', 'btn: rectangle', 'btn: right', 'btn: script', 'btn: short id', 'btn: short name', 'btn: showlabel', 'btn: style', 'btn: textalign', 'btn: textfont', 'btn: textsize', 'btn: textstyle', 'btn: top', 'btn: topleft', 'btn: visible', 'btn: width', 'card: abbrev id', 'card: abbrev name', 'card: id', 'card: long id', 'card: long name', 'card: name', 'card: short id', 'card: short name', 'fld: abbrev id', 'fld: abbrev name', 'fld: alltext', 'fld: botright', 'fld: bottom', 'fld: bottomright', 'fld: defaulttextfont', 'fld: defaulttextsize', 'fld: defaulttextstyle', 'fld: dontwrap', 'fld: enabled', 'fld: height', 'fld: id', 'fld: left', 'fld: loc', 'fld: location', 'fld: locktext', 'fld: long id', 'fld: long name', 'fld: name', 'fld: rect', 'fld: rectangle', 'fld: right', 'fld: scroll', 'fld: short id', 'fld: short name', 'fld: singleline', 'fld: style', 'fld: textalign', 'fld: textfont', 'fld: textsize', 'fld: textstyle', 'fld: top', 'fld: topleft', 'fld: visible', 'fld: width', 'global: environment', 'global: freesize', 'global: idlerate', 'global: itemdelimiter', 'global: long version', 'global: size', 'global: stacksinuse', 'global: suspended', 'global: version']],
    ];
    referenceJsonData: { [key: string]: any } = {};

    constructor(protected appli: VpcStateInterface, public type: DialogDocsType) {
        super('vpcAppNonModalDialogDocs' + Math.random());

        // adjust size
        if (this.type === DialogDocsType.Screenshots) {
            VpcFormNonModalDialogFormBase.largeWindowBounds(this, appli);
        } else {
            VpcFormNonModalDialogFormBase.standardWindowBounds(this, appli);
        }
    }

    initialPopulate() {
        let grp = this.appli.UI512App().getGroup(this.grpId);
        let topGeneric = grp.getEl(this.getElId('topChoice'));
        let top = cast(topGeneric, UI512ElTextField);
        if (this.type === DialogDocsType.Reference) {
            let choices = this.referenceInfo.map(item => lng(item[1]));
            UI512ElTextField.setListChoices(top, choices);
        } else if (this.type === DialogDocsType.Screenshots) {
            let choices = this.screenshotsInfo.map(item => lng(item[1]));
            UI512ElTextField.setListChoices(top, choices);
            let btmGeneric = grp.getEl(this.getElId('btmChoice'));
            btmGeneric.set('visible', false);
        }

        // auto-choose the first entry in the list
        let lftgel = new UI512ElTextFieldAsGeneric(top);
        SelAndEntry.selectLineInField(lftgel, 0);
        this.onChooseCategory(top);
    }

    protected getChosenCategoryNumber(top: UI512ElTextField): O<number> {
        let gel = new UI512ElTextFieldAsGeneric(cast(top, UI512ElTextField));
        let ln = SelAndEntry.selectByLinesWhichLine(gel);
        return ln;
    }

    protected onChooseCategory(top: UI512ElTextField) {
        let ctg = this.getChosenCategoryNumber(top);
        let lns: string[] = [];
        if (ctg !== undefined && this.type === DialogDocsType.Reference) {
            let ctginfo = this.referenceInfo[ctg];
            if (ctginfo) {
                lns = ctginfo[2];
            }
        } else if (ctg !== undefined && this.type === DialogDocsType.Screenshots) {
            let ctginfo = this.screenshotsInfo[ctg];
            if (ctginfo) {
                let nTotal = ctginfo[2];
                lns = Util512.range(nTotal).map(n => (n + 1).toString());
            }
        }

        // reset right side
        let grp = this.appli.UI512App().getGroup(this.grpId);
        this.resetRightSide(grp, false);

        // deselect bottom choice
        let btmGeneric = grp.findEl(this.getElId('btmChoice'));
        if (btmGeneric) {
            if (ctg !== undefined && this.type === DialogDocsType.Screenshots) {
                let ctginfo = this.screenshotsInfo[ctg];
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

            let btm = cast(btmGeneric, UI512ElTextField);
            UI512ElTextField.setListChoices(btm, lns);
            btm.set('selcaret', 0);
            btm.set('selend', 0);
            btm.set('scrollamt', 0);
        }
    }

    protected resetRightSide(grp: UI512ElGroup, isWaiting: boolean) {
        let rghtFld = grp.findEl(this.getElId('rghtFld'));
        let rghtBtn = grp.findEl(this.getElId('rghtBtn'));
        if (rghtFld) {
            rghtFld.set('scrollamt', 0);
            rghtFld.setftxt(FormattedText.newFromUnformatted(isWaiting ? ' ... ' : ''));
        }
        if (rghtBtn) {
            rghtBtn.set('iconnumber', 0);
            rghtBtn.set('icongroupid', '');

            if (!isWaiting && this.type === DialogDocsType.Screenshots) {
                this.giveRightBtnText(rghtBtn);
            } else {
                rghtBtn.set('labeltext', '');
            }
        }
    }

    protected referenceShowData(grp: UI512ElGroup, btm: UI512ElTextField, ctg: number, jsonData: any) {
        let entryTitles = this.referenceInfo[ctg][2];
        let gel = new UI512ElTextFieldAsGeneric(btm);
        let ln = SelAndEntry.selectByLinesWhichLine(gel);
        if (ln !== undefined) {
            let entryTitle = entryTitles[ln];
            if (entryTitle) {
                for (let jsonEntry of jsonData.entries) {
                    if (jsonEntry.body && jsonEntry.title.toLowerCase() === entryTitle.toLowerCase()) {
                        let txt = FormattedText.newFromSerialized(jsonEntry.body);
                        let rghtFld = grp.findEl(this.getElId('rghtFld'));
                        if (rghtFld) {
                            rghtFld.setftxt(txt);
                            return;
                        }
                    }
                }
            }
        }
    }

    protected onChooseItem(btm: UI512ElTextField) {
        let grp = this.appli.UI512App().getGroup(this.grpId);
        let topGeneric = grp.getEl(this.getElId('topChoice'));
        let top = cast(topGeneric, UI512ElTextField);
        let ctg = this.getChosenCategoryNumber(top);
        this.resetRightSide(grp, true);

        if (ctg !== undefined) {
            if (this.type === DialogDocsType.Reference) {
                let section = this.referenceInfo[ctg];
                if (section) {
                    let sectionid = section[0];
                    let jsonData = this.referenceJsonData[sectionid];
                    if (jsonData) {
                        this.referenceShowData(grp, btm, ctg, jsonData);
                    } else {
                        let url = '/resources/docs/ref_' + sectionid + '.json';
                        let req = new XMLHttpRequest();
                        Util512.beginLoadJson(url, req, sjson => {
                            this.appli.placeCallbackInQueue(() => {
                                let parsedJson = JSON.parse(sjson);
                                assertTrue(parsedJson.entries, '');
                                this.referenceJsonData[sectionid] = parsedJson;
                                this.onChooseItem(btm);
                            });
                        });
                    }
                }
            } else if (this.type === DialogDocsType.Screenshots) {
                let section = this.screenshotsInfo[ctg];
                if (section) {
                    let sectionid = section[0];
                    this.screenshotsShowData(grp, btm, ctg, sectionid);
                }
            }
        }
    }

    protected screenshotsShowData(grp: UI512ElGroup, btm: UI512ElTextField, ctg: number, sectionid: string) {
        let gel = new UI512ElTextFieldAsGeneric(btm);
        let ln = SelAndEntry.selectByLinesWhichLine(gel);
        if (ln !== undefined && ln >= 0 && ln < this.screenshotsInfo[ctg][2]) {
            this.resetRightSide(grp, true); // show the "..."
            let rghtBtn = grp.findEl(this.getElId('rghtBtn'));
            if (rghtBtn) {
                rghtBtn.set('iconnumber', ln);
                rghtBtn.set('icongroupid', 'screenshots_' + sectionid);
            }
        }
    }

    createSpecific(app: UI512Application) {
        // draw a 1px border around the panel
        let grp = app.getGroup(this.grpId);
        let bg = this.genBtn(app, grp, 'bg');
        bg.set('autohighlight', false);
        bg.setDimensions(this.x, this.y, this.logicalWidth, this.logicalHeight);

        let curY = this.y;
        let headheight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasCloseBtn);
        curY += headheight;

        curY += 15;
        let top = UI512ElTextField.makeChoiceBox(
            this.appli.UI512App(),
            grp,
            this.getElId('topChoice'),
            this.x + 15,
            curY
        );
        top.set('w', 131);
        curY += top.h + 15;
        let btm = UI512ElTextField.makeChoiceBox(
            this.appli.UI512App(),
            grp,
            this.getElId('btmChoice'),
            this.x + 15,
            curY
        );
        btm.set('w', 131);

        let rghtFld = this.genChild<UI512ElTextField>(this.appli.UI512App(), grp, 'rghtFld', UI512ElTextField);
        if (this.type === DialogDocsType.Screenshots) {
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

        let rghtBtn = this.genBtn(this.appli.UI512App(), grp, 'rghtBtn');
        rghtBtn.set('autohighlight', false);
        rghtBtn.setDimensions(rghtFld.x, rghtFld.y, rghtFld.w, rghtFld.h);
        rghtBtn.set('visible', this.type !== DialogDocsType.Reference);
        rghtBtn.set(
            'style',
            this.type === DialogDocsType.Screenshots ? UI512BtnStyle.Rectangle : UI512BtnStyle.Transparent
        );

        let btnStartVid = this.genBtn(this.appli.UI512App(), grp, 'btnStartVid');
        btnStartVid.set('style', UI512BtnStyle.OSStandard);
        btnStartVid.set('autohighlight', true);
        btnStartVid.set('labeltext', 'Start Video');
        btnStartVid.set('visible', this.type === DialogDocsType.Screenshots);
        btnStartVid.setDimensions(
            rghtFld.x + Math.round(rghtFld.w / 2) - 200 / 2,
            rghtFld.y + Math.round(rghtFld.h / 2) - 100 / 2,
            200,
            100
        );

        let caption = dialogDocsTypeToStr(this.type);
        grp.getEl(this.getElId('caption')).set('labeltext', lng(caption));

        this.initialPopulate();
    }

    protected giveRightBtnText(rghtBtn: UI512Element) {
        let s = 'Click here to view a tutorial showing how to use ViperCard.';
        let style = 'b+iuosdce';
        s = UI512DrawText.setFont(s, `geneva_14_${style}`);
        rghtBtn.set('labeltext', s);
    }

    protected clickedBtnStartVid(rightBtn: UI512Element) {
        if (this.type === DialogDocsType.Screenshots) {
            let grp = this.appli.UI512App().getGroup(this.grpId);
            let btmGeneric = grp.getEl(this.getElId('btmChoice'));
            let top = cast(grp.getEl(this.getElId('topChoice')), UI512ElTextField);
            let ctg = this.getChosenCategoryNumber(top);
            if (ctg !== undefined && this.screenshotsInfo[ctg]) {
                let num = this.screenshotsInfo[ctg][0].replace('vid', '');
                let redirectWindow = window.open('/0.2/html/video' + num + '.html', '_blank');
            }
        }
    }

    protected clickedRightBtn(rightBtn: UI512Element) {
        if (this.type === DialogDocsType.Screenshots) {
            // advance to the next picture, if applicable.
            let grp = this.appli.UI512App().getGroup(this.grpId);
            let btmGeneric = grp.getEl(this.getElId('btmChoice'));
            let btm = cast(btmGeneric, UI512ElTextField);
            let gel = new UI512ElTextFieldAsGeneric(btm);
            let lnCurrent = SelAndEntry.selectByLinesWhichLine(gel);
            let lastLine =
                btm
                    .get_ftxt()
                    .toUnformatted()
                    .split('\n').length - 1;
            lastLine -= 1; // compensate for last empty line
            if (lastLine <= 1) {
                return; // looks like a "video" one
            }

            if (lnCurrent !== undefined && lnCurrent < lastLine) {
                lnCurrent += 1;
                SelAndEntry.selectLineInField(gel, lnCurrent);
                this.onChooseItem(btm);
            } else if (lnCurrent === undefined) {
                lnCurrent = 0;
                SelAndEntry.selectLineInField(gel, lnCurrent);
                this.onChooseItem(btm);
            }
        }
    }

    onClickBtn(short: string, el: UI512Element, appli: VpcStateInterface): void {
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

    onMouseDown(short: string, el: UI512Element, appli: VpcStateInterface): void {}
}
