
/* auto */ import { RememberHistory, VpcScriptMessageMsgBoxCode } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { VpcNonModalBase, VpcNonModalFormBase } from './vpcLyrNonModalHolder';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcErr, VpcTool, cleanExceptionMsg } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { CheckReservedWords } from './../../vpc/codepreparse/vpcCheckReserved';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { TextSelModify } from './../../ui512/textedit/ui512TextSelModify';
/* auto */ import { UI512ElTextFieldAsGeneric } from './../../ui512/textedit/ui512GenericField';
/* auto */ import { FormattedText } from './../../ui512/draw/ui512FormattedText';
/* auto */ import { KeyDownEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElTextField, UI512FldStyle } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { UI512BtnStyle } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { TextFontSpec, TextFontStyling } from './../../ui512/draw/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../../ui512/draw/ui512DrawText';
/* auto */ import { PalBorderDecorationConsts } from './../../ui512/composites/ui512Composites';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a "message box" where you can type in code and evaluate it
 * redesigned by Ben Fisher, you can now see previous entries,
 * much closer to a traditional REPL than the original.
 *
 * we currently run what you type in a message box by
 * making a hidden button on the card and running a handler there.
 * this way you can call card/bg/stack handlers.
 */
export class VpcNonModalReplBox extends VpcNonModalBase {
    showHeader = true;
    captionText = '';
    hasCloseBtn = true;
    entry: UI512ElTextField;
    showResults: UI512ElTextField;
    history = new RememberHistory();
    rememberedTool = VpcTool.Button;
    constructor(protected vci: VpcStateInterface) {
        super('VpcNonModalReplBox' + Math.random());
        this.vci.UI512App();
        this.adjustDimensions(vci);
    }

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        let headheight = 0;
        if (this.showHeader) {
            headheight = this.drawWindowDecoration(app, new PalBorderDecorationConsts(), this.hasCloseBtn) - 1;
        }

        let grp = app.getGroup(this.grpId);
        let bg = this.genBtn(app, grp, 'bg');
        bg.set('autohighlight', false);
        bg.set('style', this.showHeader ? UI512BtnStyle.Rectangle : UI512BtnStyle.Opaque);
        bg.setDimensions(this.x, this.y + headheight, this.logicalWidth, this.logicalHeight - headheight);

        this.showResults = this.genChild(app, grp, 'scrollGot', UI512ElTextField);
        this.showResults.setDimensions(this.x + 14 + 5, this.y + 50 + 5, 460 + 15, 50);
        this.showResults.set('style', UI512FldStyle.Rectangle);
        this.showResults.set('scrollbar', true);
        this.showResults.set('canedit', true);

        let dashedLine = this.genBtn(app, grp, 'dashedLine');
        dashedLine.setDimensions(this.x + 14 - 1, this.y + 30 + 9 + 1, 490, 8);
        dashedLine.set('icongroupid', '000');
        dashedLine.set('iconnumber', 1);
        dashedLine.set('iconadjustheight', -47);
        dashedLine.set('autohighlight', false);
        dashedLine.set('style', UI512BtnStyle.Opaque);

        this.entry = this.genChild(app, grp, 'entry', UI512ElTextField);
        this.entry.setDimensions(this.x + 18 - 1, this.y + 15 + 9 + 1, 478, 30);
        this.entry.set('style', UI512FldStyle.Transparent);

        this.entry.set('multiline', false);
        this.vci.getPresenter().setCurrentFocus(this.entry.id);
        this.entry.set('defaultFont', 'geneva');
        let msg = 'put "abc"';
        this.setFontAndText(this.entry, msg, 'geneva', 12);
        this.setFontAndText(this.showResults, '', 'monaco', 9);
        this.entry.set('selcaret', msg.length);
        this.entry.set('selend', msg.length);
    }

    /**
     * make the window smaller
     */
    protected adjustDimensions(vci: VpcStateInterface) {
        VpcNonModalFormBase.standardWindowBounds(this, vci);
        this.x -= 1;
        this.y += 188;
        this.logicalHeight -= 188;
    }

    /**
     * set the font and text fo a field
     */
    setFontAndText(el: UI512ElTextField, s: string, typfacename: string, pts: number) {
        let spec = new TextFontSpec(typfacename, TextFontStyling.Default, pts);
        el.set('defaultFont', spec.toSpecString());
        let t = FormattedText.newFromSerialized(UI512DrawText.setFont(s, spec.toSpecString()));
        el.setFmTxt(t);
    }

    /**
     * respond to button click
     */
    onClickBtn(short: string, el: UI512Element, vci: VpcStateInterface): void {
        if (short && short === 'closebtn') {
            this.vci.setNonModalDialog(undefined);
        }
    }

    /**
     * respond to button down
     */
    onMouseDown(short: string, el: UI512Element, vci: VpcStateInterface): void {}

    /**
     * use the arrow keys up and down to view history
     */
    onKeyDown(elId: O<string>, short: O<string>, d: KeyDownEventDetails): void {
        if (short === 'entry' && (d.readableShortcut === 'Enter' || d.readableShortcut === 'Return')) {
            this.launchScript(this.entry.getFmTxt().toUnformatted());
            d.setHandled();
        } else if (short === 'entry' && d.readableShortcut === 'ArrowUp') {
            this.replHistory(true);
        } else if (short === 'entry' && d.readableShortcut === 'ArrowDown') {
            this.replHistory(false);
        }
    }

    /**
     * user is viewing what they've previously entered,
     * like pressing arrow key up/down in bash
     */
    replHistory(upwards: boolean) {
        let fallback = () => '';
        let retrieved = upwards ? this.history.walkPrevious(fallback) : this.history.walkNext(fallback);
        this.setFontAndText(this.entry, retrieved, 'geneva', 12);

        /* set caret to the end */
        this.entry.set('selcaret', retrieved.length);
        this.entry.set('selend', retrieved.length);
    }

    /**
     * launch the script
     */
    launchScript(scr: string) {
        scr = scr.trim();
        if (!scr || !scr.length) {
            return;
        }

        /* don't need to have a "busy" state,
        they'd still be queued. */
        this.history.append(scr);
        this.appendToOutput('> ' + scr + ' ...', false);
        this.setFontAndText(this.entry, '', 'geneva', 12);

        /* prepare to run the code */
        let codeBody = VpcNonModalReplBox.transformText(scr);
        let curCard = this.vci.getOptionS('currentCardId');

        this.rememberedTool = this.vci.getTool();
        this.vci.setTool(VpcTool.Browse);

        /* do this last because it could throw
        synchronously and call onScriptErr right away */
        this.vci.getCodeExec().runMsgBoxCodeOrThrow(codeBody, curCard, true);
    }

    /**
     * append the results
     */
    appendToOutput(sToAdd: string, truncEllipses: boolean) {
        let results = this.showResults.getFmTxt().toUnformatted();
        if (truncEllipses && results.endsWith(' ...')) {
            results = results.slice(0, -1 * ' ...'.length);
        }

        if (truncEllipses && results.endsWith(' ...\n')) {
            results = results.slice(0, -1 * ' ...\n'.length);
        }

        results = results.trim();
        if (results.length) {
            results += '\n';
        }

        results += sToAdd;
        results += '\n'; /* looks better */
        this.setFontAndText(this.showResults, results, 'monaco', 9);

        /* scroll down to the end */
        let gel = new UI512ElTextFieldAsGeneric(this.showResults);
        TextSelModify.changeSelGoDocHomeEnd(gel, false /* isLeft*/, false /* isExtend*/);
    }

    /**
     * respond to a script error
     * sometimes it's a script error we intentionally made!
     */
    onScriptErr(scriptErr: VpcErr) {
        /* note that script errors are to be expected --
        it's how we get the signal back after running a script,
        we intentionally try to call a handler that doesn't exist. */
        /* go back to the previous tool */
        this.vci.setTool(this.rememberedTool);
        if (scriptErr && scriptErr.message && scriptErr.message.includes(VpcScriptMessageMsgBoxCode.markIntentionalErr)) {
        /* it wasn't actually an error, we internally caused it */
        } else if (scriptErr) {
        this.appendToOutput('Error: ' + cleanExceptionMsg(scriptErr.clsAsErr()), true);
        } else {
        this.appendToOutput('Unknown', true);
        }
        
        /* set focus back */
        this.vci.getPresenter().setCurrentFocus(this.entry.id);
    }

    /**
     * add declare 'global x' to the script if you refer to a variable 'x'
     */
    static makeAllVarsGlobals(linesImproved: string[], lineWithNoStringLiterals: string) {
        let splitter = /[a-zA-Z_][0-9a-zA-Z_]*(?![0-9a-zA-Z_(])/g;
        let allMatches = lineWithNoStringLiterals.match(splitter);
        let reserved = new CheckReservedWords();
        if (allMatches) {
            /* we don't want the first match, which is the command name like 'put' */
            allMatches.shift();
            for (let match of allMatches) {
                if (reserved.okLocalVar(match)) {
                    linesImproved.push(`global ${match}`);
                }
            }
        }
    }

    /**
     * transform the script, making all variables global
     */
    static transformText(scr: string) {
        let lines = scr.split(';');
        let linesOut: string[] = [];
        lines.map(line => {
            line = line.trim();
            let lineWithNoStringLiterals = VpcNonModalReplBox.removeStringLiterals(line);
            VpcNonModalReplBox.makeAllVarsGlobals(linesOut, lineWithNoStringLiterals);
            linesOut.push(line);
        });

        let total = ``;
        total += linesOut.join('\n');
        return total;
    }

    /**
     * disregard string literals when looking for variable names
     */
    static removeStringLiterals(s: string) {
        return s.replace(/".*?"/g, '');
    }
}
