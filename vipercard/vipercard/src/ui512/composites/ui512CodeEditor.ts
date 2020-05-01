
/* auto */ import { TextSelModify } from './../textedit/ui512TextSelModify';
/* auto */ import { UI512ElTextFieldAsGeneric } from './../textedit/ui512GenericField';
/* auto */ import { FormattedText } from './../drawtext/ui512FormattedText';
/* auto */ import { KeyDownEventDetails } from './../menu/ui512Events';
/* auto */ import { UI512ElTextField, UI512FldStyle } from './../elements/ui512ElementTextField';
/* auto */ import { UI512Application } from './../elements/ui512ElementApp';
/* auto */ import { UI512DrawText } from './../drawtext/ui512DrawText';
/* auto */ import { UI512CompBase, WndBorderDecorationConsts } from './ui512Composites';
/* auto */ import { UI512AutoIndent, UI512CompCodeEditorFont } from './ui512CodeEditorAutoIndent';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a code editor
 * to use this composite,
 * create an onKeyDown listener in your presenter
 * that forwards the event to this object's respondKeydown
 *
 * see uiDemoComposites for an example.
 */
export class UI512CompCodeEditor extends UI512CompBase {
    hasCloseBtn = false;
    autoCreateBlock = true;
    compositeType = 'editor';
    lineCommentPrefix = '//~ ';
    el: UI512ElTextField;
    autoIndent = new UI512AutoIndent();
    constructor(compositeId: string) {
        super(compositeId);
    }

    /**
     * draw UI
     */
    createSpecific(app: UI512Application) {
        let grp = app.getGroup(this.grpId);
        let headerHeight = this.drawWindowDecoration(
            app,
            new WndBorderDecorationConsts(),
            this.hasCloseBtn
        );

        let curY = this.y + headerHeight - 1;
        const spacerHeight = headerHeight;
        let spacer = this.genBtn(app, grp, 'spacer');
        spacer.set('autohighlight', false);
        spacer.setDimensions(this.x, curY, this.logicalWidth, spacerHeight);
        curY += spacerHeight - 1;

        this.el = this.genChild(app, grp, 'editor', UI512ElTextField);
        this.el.set('style', UI512FldStyle.Rectangle);
        this.el.set('labelwrap', false);
        this.el.set('scrollbar', true);
        this.el.set('defaultFont', UI512CompCodeEditorFont.font);
        this.el.setDimensionsX1Y1(
            this.x,
            curY,
            this.x + this.logicalWidth,
            this.y + this.logicalHeight
        );
    }

    /**
     * set content of code editor
     */
    setContent(s: string) {
        s = UI512DrawText.setFont(s, UI512CompCodeEditorFont.font);
        let txt = FormattedText.newFromSerialized(s);
        this.el.setFmTxt(txt);
    }

    /**
     * set the caption at the top
     */
    setCaption(app: UI512Application, s: string) {
        let grp = app.getGroup(this.grpId);
        let el = grp.findEl(this.getElId('caption'));
        if (el) {
            el.set('labeltext', s);
        }
    }

    /**
     * see if any shortcut keys were pressed, and respond accordingly
     */
    respondKeydown(d: KeyDownEventDetails) {
        if (!this.el.getB('canselecttext') || !this.el.getB('canedit')) {
            return;
        }

        let gel = new UI512ElTextFieldAsGeneric(this.el);
        let wasShortcut = true;
        switch (d.readableShortcut) {
            case 'Cmd+D':
                TextSelModify.changeTextDuplicate(gel);
                break;
            case 'Cmd+L':
                TextSelModify.changeTextDeleteLine(gel);
                break;
            case 'Cmd+Q':
                /* would use Ctrl Q to add comment, Ctrl Shift Q to uncomment */
                /* or Ctrl - to add comment, Ctrl Shift - to uncomment */
                /* but Ctrl Shift Q always exits chrome event if preventDefault==true */
                /* and Ctrl - is about setting zoom level, so don't use it */
                /* so I guess I'll just follow SciTE's model where */
                /* Ctrl Q adds or removes based on what is there */
                TextSelModify.changeTextToggleLinePrefix(gel, this.lineCommentPrefix);
                break;
            case 'NumpadEnter':
            /* falls through */
            case 'Enter':
                /* run auto-indent when you hit Enter */
                TextSelModify.changeTextInsert(gel, '\n');
                this.autoIndent.runAutoIndentAll(this.el);
                break;
            case 'Tab':
                this.autoIndent.runAutoIndentAll(this.el);
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
