
/* auto */ import { O, assertTrueWarn, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { TextFontStyling } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { KeyDownEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { SelAndEntry } from '../../ui512/textedit/ui512TextSelect.js';
/* auto */ import { UI512CompBase, WndBorderDecorationConsts } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { UI512AutoIndent, UI512CompCodeEditorFont } from '../../ui512/composites/ui512CodeEditorClasses.js';

export class UI512CompCodeEditor extends UI512CompBase {
    hasCloseBtn = false;
    autoCreateBlock = true;
    compositeType = 'editor';
    lineCommentPrefix = '//~ ';
    el: O<UI512ElTextField>;
    autoIndent = new UI512AutoIndent();

    constructor(compositeId: string) {
        super(compositeId);
    }

    setFont(fontface: string, size: number, style: TextFontStyling) {
        assertTrueWarn(false, 'nyi');
    }

    getEl() {
        return throwIfUndefined(this.el, '2p|elem not created');
    }

    createSpecific(app: UI512Application) {
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasCloseBtn);

        let curY = this.y + headerheight - 1;
        const spacerheight = headerheight;
        let spacer = this.genBtn(app, grp, 'spacer');
        spacer.set('autohighlight', false);
        spacer.setDimensions(this.x, curY, this.logicalWidth, spacerheight);
        curY += spacerheight - 1;

        this.el = this.genChild(app, grp, 'editor', UI512ElTextField);
        this.el.set('style', UI512FldStyle.Rectangle);
        this.el.set('labelwrap', false);
        this.el.set('scrollbar', true);
        this.el.set('defaultFont', UI512CompCodeEditorFont.font);
        this.el.setDimensionsX1Y1(this.x, curY, this.x + this.logicalWidth, this.y + this.logicalHeight);
    }

    setContent(s: string) {
        s = UI512DrawText.setFont(s, UI512CompCodeEditorFont.font);
        let txt = FormattedText.newFromSerialized(s);
        this.getEl().setftxt(txt);
    }

    setCaption(app: UI512Application, s: string) {
        let grp = app.getGroup(this.grpid);
        let el = grp.findEl(this.getElId('caption'));
        if (el) {
            el.set('labeltext', s);
        }
    }

    respondKeydown(d: KeyDownEventDetails) {
        if (!this.getEl().get_b('canselecttext') || !this.getEl().get_b('canedit')) {
            return;
        }

        let gel = new UI512ElTextFieldAsGeneric(this.getEl());
        let wasShortcut = true;
        switch (d.readableShortcut) {
            case 'Cmd+D':
                SelAndEntry.changeTextDuplicate(gel);
                break;
            case 'Cmd+L':
                SelAndEntry.changeTextDeleteLine(gel);
                break;
            case 'Cmd+Q':
                // would use Ctrl Q to add comment, Ctrl Shift Q to uncomment
                // or Ctrl - to add comment, Ctrl Shift - to uncomment
                // but Ctrl Shift Q always exits chrome event if preventDefault==true
                // and Ctrl - is about setting zoom level, so don't use it
                // so I guess I'll just follow SciTE's model where
                // Ctrl Q adds or removes based on what is there
                SelAndEntry.changeTextToggleLinePrefix(gel, this.lineCommentPrefix);
                break;
            case 'Enter':
                SelAndEntry.changeTextInsert(gel, '\n');
                this.autoIndent.runAutoIndentAll(this.getEl());
                break;
            case 'Tab':
                this.autoIndent.runAutoIndentAll(this.getEl());
                break;
            default:
                wasShortcut = false;
                break;
        }

        if (wasShortcut) {
            d.setHandled();
        }
    }
}
