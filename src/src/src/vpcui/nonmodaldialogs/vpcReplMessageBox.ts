
/* auto */ import { O, cleanExceptionMsg, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { TextFontSpec, TextFontStyling } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { KeyDownEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { SelAndEntry } from '../../ui512/textedit/ui512TextSelect.js';
/* auto */ import { PalBorderDecorationConsts } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcScriptErrorBase } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcFormNonModalDialogBase, VpcFormNonModalDialogFormBase } from '../../vpcui/nonmodaldialogs/vpcNonModalCommon.js';

export class StackHistory {
    pointer = 0;
    stack: string[] = [];
    protected getAt() {
        this.pointer = fitIntoInclusive(this.pointer, 0, this.stack.length);
        if (this.pointer === this.stack.length) {
            return '';
        } else {
            return this.stack[this.pointer];
        }
    }
    getUp() {
        this.pointer -= 1;
        return this.getAt();
    }
    getDown() {
        this.pointer += 1;
        return this.getAt();
    }
    push(s: string) {
        this.stack.push(s);
        this.pointer = this.stack.length;
    }
}

export class VpcAppNonModalDialogReplBox extends VpcFormNonModalDialogBase {
    isVpcAppNonModalDialogReplBox = true;
    showHeader = true;
    captionText = '';
    hasCloseBtn = true;
    entry: UI512ElTextField;
    scrollGot: UI512ElTextField;
    historyTyped = new StackHistory();
    constructor(protected appli: IVpcStateInterface) {
        super('VpcAppNonModalDialogReplBox' + Math.random());
        let app = this.appli.UI512App();

        VpcFormNonModalDialogFormBase.standardWindowBounds(this, appli);
        this.x -= 1;
        this.y += 188;
        this.logicalHeight -= 188;
    }

    createSpecific(app: UI512Application) {
        let grp = app.getGroup(this.grpid);

        let headheight = 0;
        if (this.showHeader) {
            headheight = this.drawWindowDecoration(app, new PalBorderDecorationConsts(), this.hasCloseBtn) - 1;
        }

        let bg = this.genBtn(app, grp, 'bg');
        bg.set('autohighlight', false);
        bg.set('style', this.showHeader ? UI512BtnStyle.rectangle : UI512BtnStyle.opaque);
        bg.setDimensions(this.x, this.y + headheight, this.logicalWidth, this.logicalHeight - headheight);

        this.scrollGot = this.genChild(app, grp, 'scrollGot', UI512ElTextField);
        this.scrollGot.setDimensions(this.x + 14 + 5, this.y + 50 + 5, 460 + 15, 50);
        this.scrollGot.set('style', UI512FldStyle.rectangle);
        this.scrollGot.set('scrollbar', true);
        this.scrollGot.set('canedit', false);

        let dasheline = this.genBtn(app, grp, 'dasheline');
        dasheline.setDimensions(this.x + 14 - 1, this.y + 30 + 9 + 1, 490, 8);
        dasheline.set('iconsetid', '000');
        dasheline.set('iconnumber', 1);
        dasheline.set('iconadjustheight', -47);
        dasheline.set('autohighlight', false);
        dasheline.set('style', UI512BtnStyle.opaque);

        this.entry = this.genChild(app, grp, 'entry', UI512ElTextField);
        this.entry.setDimensions(this.x + 18 - 1, this.y + 15 + 9 + 1, 478, 30);
        this.entry.set('style', UI512FldStyle.transparent);

        this.entry.set('multiline', false);
        this.appli.getController().setCurrentFocus(this.entry.id);
        this.entry.set('defaultFont', 'geneva');
        let msg = 'put "abc"';
        this.setFontAndText(this.entry, msg, 'geneva', 12);
        this.setFontAndText(this.scrollGot, '', 'monaco', 9);
        this.entry.set('selcaret', msg.length);
        this.entry.set('selend', msg.length);
    }

    setFontAndText(el: UI512ElTextField, s: string, typfacename: string, siz: number) {
        let spec = new TextFontSpec(typfacename, TextFontStyling.Default, siz);
        el.set('defaultFont', spec.toSpecString());
        let t = FormattedText.newFromPersisted(TextRendererFontManager.setInitialFont(s, spec.toSpecString()));
        el.setftxt(t);
    }

    onClickBtn(short: string, el: UI512Element, appli: IVpcStateInterface): void {
        if (short && short === 'closebtn') {
            this.appli.setNonModalDialog(undefined);
        }
    }

    onMouseDown(short: string, el: UI512Element, appli: IVpcStateInterface): void {}

    onKeyDown(elid: O<string>, short: O<string>, d: KeyDownEventDetails): void {
        if (short === 'entry' && (d.readableShortcut === 'Enter' || d.readableShortcut === 'Return')) {
            this.launchScript(this.entry.get_ftxt().toUnformatted());
            d.setHandled();
        } else if (short === 'entry' && d.readableShortcut === 'ArrowUp') {
            this.replHistory(true);
        } else if (short === 'entry' && d.readableShortcut === 'ArrowDown') {
            this.replHistory(false);
        }
    }

    replHistory(upwards: boolean) {
        let retrieved = upwards ? this.historyTyped.getUp() : this.historyTyped.getDown();
        this.setFontAndText(this.entry, retrieved, 'geneva', 12);
        // set caret to the end
        this.entry.set('selcaret', retrieved.length);
        this.entry.set('selend', retrieved.length);
    }

    busy = false;
    rememberedTool = VpcTool.button;
    launchScript(scr: string) {
        scr = scr.trim();
        if (!scr || !scr.length) {
            return;
        }

        if (!this.busy) {
            this.busy = true;
            let transformed = VpcAppNonModalDialogReplBox.transformText(scr);
            let fakeVel = this.getOrMakeFakeButton();
            fakeVel.set('script', transformed);
            let code = fakeVel.get_s('script');
            this.appli.getCodeExec().updateChangedCode(fakeVel, code);

            this.historyTyped.push(scr);
            this.appendToOutput('> ' + scr + ' ...', false);
            this.setFontAndText(this.entry, '', 'geneva', 12);

            let fakeEl: any = new Object();
            fakeEl.id = 'VpcModelRender$$' + fakeVel.id;
            fakeEl.x = fakeVel.get_n('x');
            fakeEl.y = fakeVel.get_n('y');
            fakeEl.w = fakeVel.get_n('w');
            fakeEl.h = fakeVel.get_n('h');

            this.rememberedTool = this.appli.getTool();
            this.appli.setTool(VpcTool.browse);
            // inject fake event
            this.appli.getCodeExec().lastEncounteredScriptErr = undefined;
            let simEvent = new MouseUpEventDetails(
                0,
                fakeVel.get_n('x') + 1,
                fakeVel.get_n('y') + 1,
                0,
                ModifierKeys.None
            );
            simEvent.elClick = fakeEl;
            simEvent.elRaw = fakeEl;

            // do this last because it could throw synchronously and call onScriptErr right away
            this.appli.scheduleScriptEventSend(simEvent);
        }
    }

    appendToOutput(s: string, truncElipses: boolean) {
        let alltxt = this.scrollGot.get_ftxt().toUnformatted();
        if (truncElipses && alltxt.endsWith(' ...')) {
            alltxt = alltxt.slice(0, -1 * ' ...'.length);
        }
        if (truncElipses && alltxt.endsWith(' ...\n')) {
            alltxt = alltxt.slice(0, -1 * ' ...\n'.length);
        }
        alltxt = alltxt.trim();
        if (alltxt.length) {
            alltxt += '\n';
        }

        alltxt += s;
        alltxt += '\n'; // hack, looks better
        this.setFontAndText(this.scrollGot, alltxt, 'monaco', 9);
        let gel = new UI512ElTextFieldAsGeneric(this.scrollGot);
        SelAndEntry.changeSelGoDocHomeEnd(gel, false /* isLeft*/, false /* isExtend*/);
    }

    getOrMakeFakeButton() {
        let currentCardId = this.appli.getOption_s('currentCardId');
        let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
        for (let part of currentCard.parts) {
            if (VpcElBase.isActuallyMsgRepl(part)) {
                return part;
            }
        }

        // we'll have to generate it
        let newPart = this.appli.createElem(currentCardId, VpcElType.Btn, 0);
        newPart.set('name', VpcElBase.nameForMsgRepl());
        newPart.set('x', -100);
        newPart.set('y', -100);
        newPart.set('w', 10);
        newPart.set('h', 10);
        return newPart;
    }

    onScriptErr(scriptErr: VpcScriptErrorBase) {
        // note that script errors are to be expected -- it's how we get the signal back after running a script
        this.busy = false;
        this.appli.setTool(this.rememberedTool);

        if (
            scriptErr &&
            scriptErr.details &&
            scontains(scriptErr.details, 'intentional_cause_script_error_leaving_repl_box')
        ) {
            let vGot = this.appli.getCodeExec().globals.find('g_msg_repl_box_contents');
            this.appendToOutput(vGot ? vGot.readAsString().trim() : 'Unknown (not set)', true);
        } else if (scriptErr) {
            this.appendToOutput('Error: ' + cleanExceptionMsg(scriptErr.details), true);
        } else {
            this.appendToOutput('Unknown', true);
        }

        // set focus back
        this.appli.getController().setCurrentFocus(this.entry.id);
    }

    static makeAllVarsGlobals(linesImproved: string[], lineWithNoStringLiterals: string) {
        let splitter = /[a-zA-Z][0-9a-zA-Z_]*(?!\()/g;
        let allMatches = lineWithNoStringLiterals.match(splitter);
        let reserved = new CheckReservedWords();
        if (allMatches) {
            allMatches.shift(); // we don't want the first match
            for (let match of allMatches) {
                if (reserved.okLocalVar(match)) {
                    linesImproved.push(`global ${match}`);
                }
            }
        }
    }

    static transformText(scr: string) {
        let lines = scr.split(';');
        let linesImproved: string[] = [];
        lines.map(line => {
            line = line.trim();

            let lineWithNoStringLiterals = line.replace(/".*?"/g, '');
            VpcAppNonModalDialogReplBox.makeAllVarsGlobals(linesImproved, lineWithNoStringLiterals);
            if (
                lineWithNoStringLiterals.startsWith('put ') &&
                !scontains(lineWithNoStringLiterals, ' into ') &&
                !scontains(lineWithNoStringLiterals, ' after ') &&
                !scontains(lineWithNoStringLiterals, ' before ')
            ) {
                line += ' after g_msg_repl_box_contents';
                linesImproved.push(line);
                linesImproved.push('put newline after g_msg_repl_box_contents');
            } else {
                linesImproved.push(line);
            }
        });

        let total = `-- this is not a real object script, it is a temporary
-- script for the message repl box. any code
-- written here will not be saved.
on mouseUp
global g_msg_repl_box_contents
put "" into g_msg_repl_box_contents
`;
        total += linesImproved.join('\n');
        total += '\nintentional_cause_script_error_leaving_repl_box';
        total += '\nend mouseUp';
        return total;
    }
}
