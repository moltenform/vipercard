
/* auto */ import { O, cProductName } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { isString } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { KeyDownEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppInterfaceLayer } from '../../vpcui/modelrender/vpcPaintRender.js';

export abstract class VpcAppMenuStructure extends VpcAppInterfaceLayer {
    constructor() {
        super();
        this.initkeymappings();
    }

    protected getMenuStruct() {
        return [
            [
                'mnuHeaderOS|icon:001:80:26',
                [
                    'mnuOSAbout|lngAbout %cProductName...|',
                    'mnuOSDonate|lngDonate...|',
                    '|---|',
                    'mnuReportErr|lngReport an error...|',
                    'mnuReportSec|lngReport security issue...|',
                    'mnuFlagStack|lngFlag content...|',
                ],
            ],
            [
                'mnuHeaderFile|lngFile',
                [
                    'mnuNewStack|lngNew stack|',
                    '|---|',
                    'mnuOpen|lngOpen stack...|',
                    '|---|',
                    'mnuSave|lngSave stack|\xBD S',
                    'mnuSaveAs|lngSave stack as...|',
                    'mnuExportStack|lngSave to .json...|',
                    '|---|',
                    'mnuShareALink|lngShare a link...|',
                    'mnuPublishFeatured|lngPublish to featured...|',
                    '|---|',
                    'mnuQuit|lngQuit %cProductName|\xBD U',
                ],
            ],
            [
                'mnuHeaderEdit|lngEdit',
                [
                    'mnuUndo|lngUndo|\xBD Z',
                    'mnuRedo|lngRedo|\xBD Y',
                    '|---|',
                    'mnuCut|lngCut Text|\xBD X',
                    'mnuCopy|lngCopy Text|\xBD C',
                    'mnuPaste|lngPaste Text|\xBD V',
                    'mnuClear|lngClear|',
                    '|---|',
                    'mnuUseHostClipboard|lngUse OS Clipboard|',
                    '|---|',
                    'mnuCopyCardOrVel|lngCopy Card|',
                    'mnuPasteCardOrVel|lngPaste Card|',
                    '|---|',
                    'mnuNewCard|lngNew Card|',
                    'mnuDelCard|lngDelete Card|',
                    // "mnuDupeCard|lngDuplicate Card|",
                ],
            ],
            [
                'mnuHeaderGo|lngGo',
                [
                    'mnuGoCardFirst|lngFirst|\xBD 1',
                    'mnuGoCardPrev|lngPrev|\xBD 2',
                    'mnuGoCardNext|lngNext|\xBD 3',
                    'mnuGoCardLast|lngLast|\xBD 4',
                    '|---|',
                    'mnuMsgBox|lngMessage Box|\xBD M',
                ],
            ],
            [
                'mnuHeaderTools|lngTools',
                [
                    'mnuItemTool2|lngBrowse|',
                    'mnuItemTool3|lngButton|',
                    'mnuItemTool4|lngField|',
                    'mnuItemTool5|lngSelect|',
                    'mnuItemTool6|lngBrush|',
                    'mnuItemTool7|lngBucket|',
                    'mnuItemTool8|lngStamp|',
                    'mnuItemTool9|lngPencil|',
                    'mnuItemTool10|lngLine|',
                    'mnuItemTool11|lngLasso|',
                    'mnuItemTool12|lngEraser|',
                    'mnuItemTool13|lngRect|',
                    'mnuItemTool14|lngOval|',
                    'mnuItemTool15|lngRoundrect|',
                    'mnuItemTool16|lngCurve|',
                    'mnuItemTool17|lngSpray|',
                ],
            ],
            [
                'mnuHeaderObjects|lngObjects',
                [
                    'mnuCardInfo|lngCard Info...|',
                    'mnuStackInfo|lngStack Info...|',
                    '|---|',
                    'mnuObjectsNewBtn|lngNew Button|',
                    'mnuObjectsNewFld|lngNew Field|',
                ],
            ],
            [
                'mnuHeaderDraw|lngDraw',
                [
                    'mnuPaintWideLines|lngWide lines|',
                    '|---|',
                    'mnuPaintBlackLines|lngBlack lines|',
                    'mnuPaintWhiteLines|lngWhite lines|',
                    '|---|',
                    'mnuPaintNoFill|lngNo fill|',
                    'mnuPaintBlackFill|lngBlack fill|',
                    'mnuPaintWhiteFill|lngWhite fill|',
                    '|---|',
                    'mnuPaintDrawMult|lngMultiple|',
                    'mnuPaintManyCopies|lngMany copies...|',
                    '|---|',
                    'mnuExportGif|lngAnimated .gif...|',
                ],
            ],
            [
                'mnuHeaderFont|lngFont',
                [
                    'mnuItemSetFontFaceChicago|lngChicago|',
                    'mnuItemSetFontFaceGeneva|lngGeneva|',
                    'mnuItemSetFontFaceCourier|lngCourier|',
                    'mnuItemSetFontFaceTimes|lngTimes|',
                    'mnuItemSetFontFaceNew York|lngNew York|',
                ],
            ],
            [
                'mnuHeaderFontStyle|lngStyle',
                [
                    'mnuSetFontStylePlain|lngPlain|',
                    'mnuSetFontStyleBold|lngBold|',
                    'mnuSetFontStyleItalic|lngItalic|',
                    'mnuSetFontStyleUnderline|lngUnderline|',
                    'mnuSetFontStyleOutline|lngOutline|',
                    'mnuSetFontStyleCondense|lngCondense|',
                    'mnuSetFontStyleExtend|lngExtend|',
                    '|---|',
                    'mnuSetAlignLeft|lngAlign Left|',
                    'mnuSetAlignCenter|lngAlign Center|',
                    '|---|',
                    'mnuItemSetFontSize9|lng9|',
                    'mnuItemSetFontSize10|lng10|',
                    'mnuItemSetFontSize12|lng12|',
                    'mnuItemSetFontSize14|lng14|',
                    'mnuItemSetFontSize18|lng18|',
                    'mnuItemSetFontSize24|lng24|',
                ],
            ],
            ['topClock|lng12/28/18', 776, ['|lngPlaceholder|']],
            [
                'mnuHeaderHelpIcon|icon:001:75:27',
                864,
                [
                    'mnuOSAbout2|lngAbout %cProductName...|',
                    '|---|',
                    'mnuDlgHelpScreenshots|lngExamples & Tutorials...|',
                    'mnuDlgHelpReference|lngScript Reference...|',
                ],
            ],
            [
                'mnuHeaderAppIcon|icon:001:78:27',
                891,
                [
                    'mnuSysAppsHideProduct|lngHide %cProductName|',
                    'mnuSysAppsHideOthers|lngHide Others|',
                    'mnuSysAppsShowAll|lngShow All|',
                    '|---|',
                    'mnuSysAppsCheckProduct|lng%cProductName|',
                ],
            ],
        ];
    }

    keymappings: { [key: string]: ((self: VpcAppMenuStructure) => O<string>) | string } = {};

    initkeymappings() {
        this.keymappings['ArrowLeft'] = (self: VpcAppMenuStructure) => {
            if (self.appli.getTool() !== VpcTool.browse) {
                return 'onlyIfNotInTextField/mnuGoCardPrev';
            }
        };
        this.keymappings['ArrowRight'] = (self: VpcAppMenuStructure) => {
            if (self.appli.getTool() !== VpcTool.browse) {
                return 'onlyIfNotInTextField/mnuGoCardNext';
            }
        };

        /*
            Non-catchable chrome shortcuts :(
                Ctrl-T
                Ctrl-W
                Ctrl-N
                Ctrl-Shift-Q
            */
        this.keymappings['Home'] = 'onlyIfNotInTextField/mnuGoCardFirst';
        this.keymappings['End'] = 'onlyIfNotInTextField/mnuGoCardLast';
        this.keymappings['Backspace'] = 'onlyIfNotInTextField/mnuClear';
        this.keymappings['Delete'] = 'onlyIfNotInTextField/mnuClear';
        this.keymappings['Cmd+E'] = 'mnuExportStack';
        this.keymappings['Cmd+S'] = 'mnuSave';
        this.keymappings['Cmd+Shift+S'] = 'mnuSaveAs';
        this.keymappings['Cmd+U'] = 'mnuQuit';
        this.keymappings['Cmd+1'] = 'mnuGoCardFirst';
        this.keymappings['Cmd+2'] = 'mnuGoCardPrev';
        this.keymappings['Cmd+3'] = 'mnuGoCardNext';
        this.keymappings['Cmd+4'] = 'mnuGoCardLast';
        this.keymappings['Cmd+M'] = 'mnuMsgBox';
        this.keymappings['Cmd+Shift+J'] = 'mnuCreateManyButtons';
    }

    translateHotkey(d: KeyDownEventDetails): O<string> {
        if (!d.repeated) {
            let mapped = this.keymappings[d.readableShortcut];
            if (isString(mapped)) {
                return mapped as string;
            } else if (typeof mapped === 'function') {
                return mapped(this);
            } else {
                return undefined;
            }
        }

        return undefined;
    }
}
