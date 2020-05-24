
/* auto */ import { VpcUILayer } from './../state/vpcInterface';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { UI512MenuDefn } from './../../ui512/menu/ui512MenuPositioning';
/* auto */ import { KeyDownEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * provide menu structure and keybindings
 */
export abstract class VpcAppMenuStructure extends VpcUILayer {
    constructor() {
        super();
        this.initkeymappings();
    }

    /**
     * provide menu structure
     * with syntax
     * itemId|lngLabel|shortcutKey
     */
    protected getMenuStruct(): UI512MenuDefn[] {
        return [
            [
                'mnuHeaderOS|icon:001:80:26',
                [
                    'mnuOSAbout|lngAbout ViperCard...|',
                    'mnuOSDonate|lngDonate...|',
                    '|---|',
                    'mnuReportErr|lngReport an error...|',
                    'mnuReportSec|lngReport security issue...|',
                    'mnuFlagStack|lngFlag content...|'
                ]
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
                    'mnuQuit|lngQuit ViperCard|\xBD U'
                ]
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
                    'mnuDelCard|lngDelete Card|'
                ]
            ],
            [
                'mnuHeaderGo|lngGo',
                [
                    'mnuGoCardFirst|lngFirst|\xBD 1',
                    'mnuGoCardPrev|lngPrev|\xBD 2',
                    'mnuGoCardNext|lngNext|\xBD 3',
                    'mnuGoCardLast|lngLast|\xBD 4',
                    '|---|',
                    'mnuMsgBox|lngMessage Box|\xBD M'
                ]
            ],
            [
                'mnuHeaderTools|lngTools',
                [
                    'mnuItemTool3|lngBrowse|',
                    'mnuItemTool4|lngButton|',
                    'mnuItemTool5|lngField|',
                    'mnuItemTool6|lngSelect|',
                    'mnuItemTool7|lngBrush|',
                    'mnuItemTool8|lngBucket|',
                    'mnuItemTool9|lngStamp|',
                    'mnuItemTool10|lngPencil|',
                    'mnuItemTool11|lngLine|',
                    'mnuItemTool12|lngLasso|',
                    'mnuItemTool13|lngEraser|',
                    'mnuItemTool14|lngRect|',
                    'mnuItemTool15|lngOval|',
                    'mnuItemTool16|lngRoundrect|',
                    'mnuItemTool17|lngCurve|',
                    'mnuItemTool18|lngSpray|'
                ]
            ],
            [
                'mnuHeaderObjects|lngObjects',
                [
                    'mnuCardInfo|lngCard Info...|',
                    'mnuStackInfo|lngStack Info...|',
                    '|---|',
                    'mnuObjectsNewBtn|lngNew Button|',
                    'mnuObjectsNewFld|lngNew Field|'
                ]
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
                    'mnuExportGif|lngAnimated .gif...|'
                ]
            ],
            [
                'mnuHeaderFont|lngFont',
                [
                    'mnuItemSetFontChicago|lngChicago|',
                    'mnuItemSetFontGeneva|lngGeneva|',
                    'mnuItemSetFontCourier|lngCourier|',
                    'mnuItemSetFontTimes|lngTimes|',
                    'mnuItemSetFontNew York|lngNew York|',
                    'mnuItemSetFontHelvetica|lngHelvetica|',
                    'mnuItemSetFontMonaco|lngMonaco|',
                    'mnuItemSetFontSymbol|lngSymbol|'
                ]
            ],
            [
                'mnuHeaderFontStyle|lngStyle',
                [
                    'mnuItemSetFontPlain|lngPlain|',
                    'mnuItemSetFontBold|lngBold|',
                    'mnuItemSetFontItalic|lngItalic|',
                    'mnuItemSetFontUnderline|lngUnderline|',
                    'mnuItemSetFontOutline|lngOutline|',
                    'mnuItemSetFontCondense|lngCondense|',
                    'mnuItemSetFontExtend|lngExtend|',
                    'mnuItemSetFontGrayed|lngGrayed|',
                    '|---|',
                    'mnuItemSetFontAlignLeft|lngAlign Left|',
                    'mnuItemSetFontAlignCenter|lngAlign Center|',
                    '|---|',
                    'mnuItemSetFont9|lng9|',
                    'mnuItemSetFont10|lng10|',
                    'mnuItemSetFont12|lng12|',
                    'mnuItemSetFont14|lng14|',
                    'mnuItemSetFont18|lng18|',
                    'mnuItemSetFont24|lng24|'
                ]
            ],
            ['topClock|lng12/28/18', 776, ['|lngPlaceholder|']],
            [
                'mnuHeaderHelpIcon|icon:001:75:27',
                864,
                [
                    'mnuOSAbout2|lngAbout ViperCard...|',
                    '|---|',
                    'mnuDlgHelpExamples|lngExamples & Tutorials...|',
                    'mnuDlgHelpReference|lngScript Reference...|'
                ]
            ],
            [
                'mnuHeaderAppIcon|icon:001:78:27',
                891,
                [
                    'mnuSysAppsHideProduct|lngHide ViperCard|',
                    'mnuSysAppsHideOthers|lngHide Others|',
                    'mnuSysAppsShowAll|lngShow All|',
                    '|---|',
                    'mnuSysAppsCheckProduct|lngViperCard|'
                ]
            ]
        ];
    }

    /* map key to either a menu id, or a custom function */
    keyMappings: {
        [key: string]: ((self: VpcAppMenuStructure) => O<string>) | string;
    } = {};

    /**
     * populate keyMappings
     */
    initkeymappings() {
        /*
            Non-catchable chrome shortcuts :( include
                Ctrl-T
                Ctrl-W
                Ctrl-N
        */

        this.keyMappings['ArrowLeft'] = 'onlyIfNotInTextField/mnuOnArrowLeft';
        this.keyMappings['ArrowRight'] = 'onlyIfNotInTextField/mnuOnArrowRight';
        this.keyMappings['ArrowUp'] = 'onlyIfNotInTextField/mnuOnArrowUp';
        this.keyMappings['ArrowDown'] = 'onlyIfNotInTextField/mnuOnArrowDown';
        this.keyMappings['Home'] = 'onlyIfNotInTextField/mnuGoCardFirst';
        this.keyMappings['End'] = 'onlyIfNotInTextField/mnuGoCardLast';
        this.keyMappings['Backspace'] = 'onlyIfNotInTextField/mnuClear';
        this.keyMappings['Delete'] = 'onlyIfNotInTextField/mnuClear';
        this.keyMappings['Cmd+E'] = 'mnuExportStack';
        this.keyMappings['Cmd+S'] = 'mnuSave';
        this.keyMappings['Cmd+Shift+S'] = 'mnuSaveAs';
        this.keyMappings['Cmd+U'] = 'mnuQuit';
        this.keyMappings['Cmd+1'] = 'mnuGoCardFirst';
        this.keyMappings['Cmd+2'] = 'mnuGoCardPrev';
        this.keyMappings['Cmd+3'] = 'mnuGoCardNext';
        this.keyMappings['Cmd+4'] = 'mnuGoCardLast';
        this.keyMappings['Cmd+M'] = 'mnuMsgBox';
        this.keyMappings['Cmd+Shift+J'] = 'mnuCreateManyButtons';
    }

    /**
     * from key event, to menu id
     * returns menu id, or undefined if none found
     */
    translateHotkey(d: KeyDownEventDetails): O<string> {
        if (!d.repeated) {
            let mapped = this.keyMappings[d.readableShortcut];
            if (typeof mapped === 'string') {
                return mapped;
            } else if (typeof mapped === 'function') {
                return mapped(this);
            } else {
                return undefined;
            }
        }

        return undefined;
    }
}
