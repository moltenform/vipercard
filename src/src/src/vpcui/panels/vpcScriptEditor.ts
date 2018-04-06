
/* auto */ import { isRelease } from '../../config.js';
/* auto */ import { O, cleanExceptionMsg, makeVpcInternalErr, msgNotification } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObjectCanSet, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { TextFontStyling, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementsLabel.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { KeyDownEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { SelAndEntry } from '../../ui512/textedit/ui512TextSelect.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { WndBorderDecorationConsts } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { UI512CompCodeEditorFont } from '../../ui512/composites/ui512CodeEditorClasses.js';
/* auto */ import { UI512CompCodeEditor } from '../../ui512/composites/ui512CodeEditor.js';
/* auto */ import { vpcElTypeToString } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcScriptErrorBase } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { IsPropPanel } from '../../vpcui/panels/vpcPanelsBase.js';

export class VpcPanelScriptEditor extends UI512CompCodeEditor implements IsPropPanel {
    isVpcPanelScriptEditor = true;
    hasCloseBtn = true;
    autoCreateBlock = true;
    compositeType = 'VpcPanelScriptEditor';
    lineCommentPrefix = '--~ ';
    el: O<UI512ElTextField>;
    appli: IVpcStateInterface;

    needsCompilation = new MapKeyToObjectCanSet<boolean>();
    cbGetAndValidateSelectedVel: (prp: string) => O<VpcElBase>;
    cbAnswerMsg: (s: string, cb: () => void) => void;
    protected status1a: UI512ElLabel;
    protected status2a: UI512ElLabel;
    protected status2b: UI512ElLabel;
    protected statusErrMoreDetails: string;
    readonly monaco = `monaco_9_${textFontStylingToString(TextFontStyling.Default)}`;
    readonly genevaPlain = `geneva_10_${textFontStylingToString(TextFontStyling.Default)}`;
    readonly genevaBold = `geneva_10_${textFontStylingToString(TextFontStyling.Bold)}`;
    constructor(compositeId: string) {
        super(compositeId);
        this.autoIndent.lineContinuation = ['\\', '\xC2'];
        this.autoIndent.linesCauseIndent = [
            [/^repeat\b/, /^end\s+repeat\b/, 'end repeat'],
            [/^if\b/, /^(else\b)|(end\s+if)\b/, 'end if'],
            [/^else\b/, /^(else\b)|(end\s+if)\b/, ''],
            [/^on\s+(\w+)\b/, /^end\s+%MATCH%\b/, 'end %MATCH%'],
            [/^function\s+(\w+)\b/, /^end\s+%MATCH%\b/, 'end %MATCH%'],
        ];

        this.autoIndent.caseSensitive = true;
        this.autoIndent.useTabs = true;
        this.autoIndent.useAutoIndent = true;
        this.autoIndent.useAutoCreateBlock = true;
    }

    createSpecific(app: UI512Application) {
        // occurs because apparent discrepency between 'screenwidth' and bounds[2], not sure why those don't match
        this.logicalWidth -= 46;
        if (!isRelease) {
            console.log('maybe fix this...');
        }

        // constants
        const spacerHeight = 6;
        const footerHeight = 65;

        // draw a 1px border around the panel
        let grp = app.getGroup(this.grpid);
        let bg = this.genBtn(app, grp, 'bg');
        bg.set('autohighlight', false);
        bg.setDimensions(this.x, this.y, this.logicalWidth, this.logicalHeight);

        // draw window decoration
        let headerheight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasCloseBtn);

        // draw spacer
        let cury = this.y + headerheight - 1;
        let spacer = this.genBtn(app, grp, 'spacer');
        spacer.set('autohighlight', false);
        spacer.setDimensions(this.x, cury, this.logicalWidth, spacerHeight);
        cury += spacerHeight - 1;

        // draw the code editor field
        this.el = this.genChild(app, grp, 'editor', UI512ElTextField);
        this.el.set('style', UI512FldStyle.Rectangle);
        this.el.set('labelwrap', false);
        this.el.set('scrollbar', true);
        this.el.set('defaultFont', UI512CompCodeEditorFont.font);
        this.el.set('nudgey', 2);
        this.el.setDimensions(this.x, cury, this.logicalWidth, this.y + this.logicalHeight - cury - footerHeight);

        // draw status text row 1
        this.status1a = this.genChild(app, grp, 'status1a', UI512ElLabel);
        this.status1a.setDimensions(this.el.x + 5, this.el.bottom, this.el.w - 10, 20);

        // draw status text row 2
        this.status2a = this.genChild(app, grp, 'status2a', UI512ElLabel);
        this.status2a.setDimensions(this.el.x + 5, this.el.bottom + 22, 90, 20);
        this.status2b = this.genChild(app, grp, 'status2b', UI512ElLabel);
        this.status2b.setDimensions(this.el.x + 60, this.el.bottom + 22, 224, 20);

        // draw Save buttton
        const spaceFromRight = 9;
        const spaceFromBottom = 17;
        const btnW = 68 + 15;
        const btnH = 23;
        let btnCompile = this.genBtn(app, grp, 'btnScriptEditorCompile');
        btnCompile.set('labeltext', '');
        btnCompile.set('style', UI512BtnStyle.OSStandard);
        btnCompile.setDimensions(
            this.x + this.logicalWidth - (btnW + spaceFromRight),
            this.y + this.logicalHeight - (btnH + spaceFromBottom),
            btnW,
            btnH
        );
    }

    refreshFromModel(app: UI512Application) {
        let vel = this.cbGetAndValidateSelectedVel('viewingScriptVelId');
        let grp = app.getGroup(this.grpid);
        if (!vel) {
            this.setStatusLabeltext('', undefined, '', '');
            grp.getEl(this.getElId('caption')).set('labeltext', lng('lngElement not found.'));
        } else {
            let caption = grp.getEl(this.getElId('caption'));
            let captionMsg = lng('lngScript of %c');
            let velName = vpcElTypeToString(vel.getType(), true) + ` "${vel.get_s('name')}"`;
            captionMsg = captionMsg.replace(/%c/g, velName);
            captionMsg = captionMsg.substr(0, 36);
            caption.set('labeltext', captionMsg);

            let selcaret = this.el!.get_n('selcaret');
            let selend = this.el!.get_n('selend');
            let scrl = this.el!.get_n('scrollamt');
            let newftxt = FormattedText.newFromUnformatted(vel.get_s('script'));
            newftxt.setFontEverywhere(this.monaco);
            this.el!.setftxt(newftxt);
            this.el!.set('selcaret', selcaret);
            this.el!.set('selend', selend);
            this.el!.set('scrollamt', scrl);

            this.refreshStatusLabels(app, vel);
        }
    }

    protected refreshStatusLabels(app: UI512Application, vel: VpcElBase) {
        let lastScriptErr = this.appli ? this.appli.getCodeExec().lastEncounteredScriptErr : undefined;
        this.status2a.set('labeltext', '');
        if (lastScriptErr && lastScriptErr.velid === vel.id) {
            // check for "encountered" err
            this.setStatusLabeltext(
                'lngEncountered a script error:',
                lastScriptErr.lineNumber,
                cleanExceptionMsg(lastScriptErr.details),
                cleanExceptionMsg(lastScriptErr.details)
            );
        } else {
            // check for syntax err
            let codeStatus = this.appli.getCodeExec().findCode(vel.id);
            if (codeStatus instanceof VpcScriptErrorBase) {
                this.setStatusLabeltext(
                    'lngSyntax error:',
                    codeStatus.lineNumber,
                    cleanExceptionMsg(codeStatus.details),
                    cleanExceptionMsg(codeStatus.details)
                );
            } else {
                this.setStatusLabeltext('', undefined, '', '');
            }
        }

        let grp = app.getGroup(this.grpid);
        let btnCompile = grp.getEl(this.getElId('btnScriptEditorCompile'));
        if (slength(this.status2a.get_s('labeltext')) || this.needsCompilation.find(vel.id)) {
            btnCompile.set(
                'labeltext',
                TextRendererFontManager.setInitialFont(lng('lngSave Script'), this.genevaBold)
            );
        } else {
            btnCompile.set(
                'labeltext',
                TextRendererFontManager.setInitialFont(lng('lngSave Script'), this.genevaPlain)
            );
        }
    }

    protected setStatusLabeltext(sType: string, n: O<number>, sMsg: string, sMsgMore: string) {
        this.status1a.set('labeltext', lng(sType));
        this.status2b.set('labeltext', TextRendererFontManager.setInitialFont(sMsg, this.monaco));

        this.statusErrMoreDetails = sMsgMore;
        if (n === undefined) {
            this.status2a.set('labeltext', '');
        } else {
            let txt = lng('lngLine') + ` ${n},`;
            txt = TextRendererFontManager.setInitialFont(txt, this.monaco);
            this.status2a.set('labeltext', txt);
        }
    }

    protected onBtnCompile() {
        let vel = this.cbGetAndValidateSelectedVel('viewingScriptVelId');
        if (!vel) {
            return;
        }

        // run compilation
        this.saveChangesToModel(this.appli.UI512App(), false);
        let code = vel.get_s('script');
        this.appli.getCodeExec().updateChangedCode(vel, code);

        // hide the "just encountered" message.
        // seems ok to do -- also might be possible for user to click hide.
        let lastScriptErr = this.appli ? this.appli.getCodeExec().lastEncounteredScriptErr : undefined;
        if (lastScriptErr && lastScriptErr.velid === vel.id) {
            this.appli.getCodeExec().lastEncounteredScriptErr = undefined;
        }

        // refresh. setting script does trigger uiredraw, but script has already been updated
        // because saveChangesToModel was called in mousedown. so need to manually cause update
        this.needsCompilation.remove(vel.id);
        this.appli.causeUIRedraw();
    }

    scrollToErrorPosition(c: O<UI512ControllerBase>) {
        let linenotxt = this.status2a.get_s('labeltext');
        if (this.el && linenotxt.length > 0) {
            let thenums = linenotxt.split(' ')[1].replace(/,/g, '');
            let thenum = parseInt(thenums, 10);
            if (Number.isFinite(thenum)) {
                thenum = Math.max(0, thenum - 1); // from 1-based to 0-based
                let gel = new UI512ElTextFieldAsGeneric(this.el);
                SelAndEntry.selectLineInField(gel, thenum);

                if (c) {
                    c.setCurrentFocus(this.el.id);
                }
            }
        }
    }

    respondKeydown(d: KeyDownEventDetails) {
        if (!this.getEl().get_b('canselecttext') || !this.getEl().get_b('canedit')) {
            return;
        }

        if (
            d.readableShortcut.search(/\bBackspace\b/) !== -1 ||
            d.readableShortcut.search(/\bDelete\b/) !== -1 ||
            d.readableShortcut.search(/\bEnter\b/) !== -1 ||
            ((d.mods === 0 || d.mods === ModifierKeys.Shift) && d.keyChar.length === 1 && d.keyChar.charCodeAt(0) >= 32)
        ) {
            let vel = this.cbGetAndValidateSelectedVel('selectedVelId');
            if (vel) {
                this.needsCompilation.set(vel.id, true);
                this.refreshStatusLabels(this.appli.UI512App(), vel);
            }
        }

        super.respondKeydown(d);

        // proactively save changes to model, even more aggressively than every mousedown,
        // so that some other bug won't delete what you typed.
        // needs to go *after* respondKeydown because we want to include any indentation/text insertion changes
        if (d.readableShortcut.search(/\bEnter\b/) !== -1) {
            this.saveChangesToModel(this.appli.UI512App(), false);
        }
    }

    respondToClick(app: UI512Application, clicked: string): any {
        if (clicked.endsWith('##btnScript')) {
            let validVel = this.cbGetAndValidateSelectedVel('selectedVelId');
            if (validVel) {
                this.appli.setOption('viewingScriptVelId', validVel.id);
                this.refreshFromModel(app);
            }
        } else {
            let short = this.fromFullId(clicked);
            if (short === 'caption') {
                // clicked the close box
                this.saveChangesToModel(app, false);
                this.appli.setOption('viewingScriptVelId', '');
            } else if (short === 'btnScriptEditorCompile') {
                this.onBtnCompile();
            } else if (short === 'status2a') {
                this.scrollToErrorPosition(undefined);
            } else if (short === 'status2b') {
                if (this.statusErrMoreDetails.trim().length) {
                    this.cbAnswerMsg(this.statusErrMoreDetails, () => {});
                }
                // remember to not run other code after showing modal dialog
            }
        }
    }

    static readonly thereArePendingChanges = 'There are pending changes.';

    saveChangesToModel(app: UI512Application, onlyCheckIfDirty: boolean) {
        // note: here we will only save the script text to 'script'
        // it's only when user clicks Compile that the compiled script changes.
        // so it's kind of an inconsistent state
        // design open to future improvements (autocompile?)

        let vel = this.cbGetAndValidateSelectedVel('viewingScriptVelId');
        if (!vel || !this.el) {
            return;
        }

        let newscript = this.el.get_ftxt().toUnformatted();
        if (onlyCheckIfDirty) {
            let current = vel.get_s('script');
            if (current !== newscript) {
                throw makeVpcInternalErr(msgNotification + VpcPanelScriptEditor.thereArePendingChanges);
            }
        } else {
            vel.set('script', newscript);
        }
    }
}
