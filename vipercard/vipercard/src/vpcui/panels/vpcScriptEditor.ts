
/* auto */ import { O, cleanExceptionMsg, makeVpcInternalErr, msgNotification } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObjectCanSet, base10, slength } from '../../ui512/utils/utils512.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { TextFontStyling, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementLabel.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { KeyDownEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { TextSelModify } from '../../ui512/textedit/ui512TextSelModify.js';
/* auto */ import { UI512TextEvents } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512PresenterBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { WndBorderDecorationConsts } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { UI512CompCodeEditorFont } from '../../ui512/composites/ui512CodeEditorAutoIndent.js';
/* auto */ import { UI512CompCodeEditor } from '../../ui512/composites/ui512CodeEditor.js';
/* auto */ import { vpcElTypeToString } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcScriptErrorBase } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcExecFrame } from '../../vpc/codeexec/vpcScriptExecFrame.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcEditPanels } from '../../vpcui/panels/vpcPanelsInterface.js';

/**
 * the ViperCard script editor
 */
export class VpcPanelScriptEditor extends UI512CompCodeEditor implements VpcEditPanels {
    isVpcPanelScriptEditor = true;
    hasCloseBtn = true;
    autoCreateBlock = true;
    compositeType = 'VpcPanelScriptEditor';
    lineCommentPrefix = '--~ ';
    vci: VpcStateInterface;
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
            [/^function\s+(\w+)\b/, /^end\s+%MATCH%\b/, 'end %MATCH%']
        ];

        this.autoIndent.caseSensitive = true;
        this.autoIndent.useTabs = true;
        this.autoIndent.useAutoIndent = true;
        this.autoIndent.useAutoCreateBlock = true;
    }

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        /* constants */
        const spacerHeight = 6;
        const footerHeight = 65;

        /* occurs because apparent discrepency between
        'screenwidth' and bounds[2] */
        this.logicalWidth -= 46;

        /* draw a 1px border around the panel */
        let grp = app.getGroup(this.grpId);
        let bg = this.genBtn(app, grp, 'bg');
        bg.set('autohighlight', false);
        bg.setDimensions(this.x, this.y, this.logicalWidth, this.logicalHeight);

        /* draw window decoration */
        let headerHeight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasCloseBtn);

        /* draw spacer */
        let curY = this.y + headerHeight - 1;
        let spacer = this.genBtn(app, grp, 'spacer');
        spacer.set('autohighlight', false);
        spacer.setDimensions(this.x, curY, this.logicalWidth, spacerHeight);
        curY += spacerHeight - 1;

        /* draw the code editor field */
        this.el = this.genChild(app, grp, 'editor', UI512ElTextField);
        this.el.set('style', UI512FldStyle.Rectangle);
        this.el.set('labelwrap', false);
        this.el.set('scrollbar', true);
        this.el.set('defaultFont', UI512CompCodeEditorFont.font);
        this.el.set('nudgey', 2);
        this.el.setDimensions(this.x, curY, this.logicalWidth, this.y + this.logicalHeight - curY - footerHeight);

        /* draw status text row 1 */
        this.status1a = this.genChild(app, grp, 'status1a', UI512ElLabel);
        this.status1a.setDimensions(this.el.x + 5, this.el.bottom, this.el.w - 10, 20);

        /* draw status text row 2 */
        this.status2a = this.genChild(app, grp, 'status2a', UI512ElLabel);
        this.status2a.setDimensions(this.el.x + 5, this.el.bottom + 22, 90, 20);
        this.status2b = this.genChild(app, grp, 'status2b', UI512ElLabel);
        this.status2b.setDimensions(this.el.x + 60, this.el.bottom + 22, 224, 20);

        /* draw Save buttton */
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

    /**
     * refresh
     */
    refreshFromModel(app: UI512Application) {
        let vel = this.cbGetAndValidateSelectedVel('viewingScriptVelId');
        let grp = app.getGroup(this.grpId);
        if (!vel) {
            this.setStatusLabeltext('', undefined, '', '');
            grp.getEl(this.getElId('caption')).set('labeltext', lng('lngElement not found.'));
        } else {
            let caption = grp.getEl(this.getElId('caption'));
            let captionMsg = lng('lngScript of %c');
            let velName = vpcElTypeToString(vel.getType(), true) + ` "${vel.getS('name')}"`;
            captionMsg = captionMsg.replace(/%c/g, velName);
            captionMsg = captionMsg.substr(0, 36);
            caption.set('labeltext', captionMsg);

            let selcaret = this.el.getN('selcaret');
            let selend = this.el.getN('selend');
            let scrl = this.el.getN('scrollamt');
            this.setContent(vel.getS('script'));
            this.el.set('selcaret', selcaret);
            this.el.set('selend', selend);
            this.el.set('scrollamt', scrl);

            this.refreshStatusLabels(app, vel);
        }
    }

    /**
     * refresh status labels,
     * shows the last error encountered by the codeExec object
     */
    protected refreshStatusLabels(app: UI512Application, vel: VpcElBase) {
        let lastScriptErr = this.vci ? this.vci.getCodeExec().lastEncounteredScriptErr : undefined;
        this.status2a.set('labeltext', '');
        if (lastScriptErr && lastScriptErr.velId === vel.id) {
            /* check for "encountered" err */
            this.setStatusLabeltext(
                'lngEncountered a script error:',
                lastScriptErr.lineNumber,
                cleanExceptionMsg(lastScriptErr.details),
                cleanExceptionMsg(lastScriptErr.details)
            );
        } else {
            /* check for syntax err */
            let codeStatus = this.vci.getCodeExec().getCompiledScript(vel.id, vel.getS('script'));
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

        let grp = app.getGroup(this.grpId);
        let btnCompile = grp.getEl(this.getElId('btnScriptEditorCompile'));
        if (slength(this.status2a.getS('labeltext')) || this.needsCompilation.find(vel.id)) {
            btnCompile.set('labeltext', UI512DrawText.setFont(lng('lngSave Script'), this.genevaBold));
        } else {
            btnCompile.set('labeltext', UI512DrawText.setFont(lng('lngSave Script'), this.genevaPlain));
        }
    }

    /**
     * set status label,
     * sType is untranslated,
     * sMsg and sMsgMore are already translated
     */
    protected setStatusLabeltext(sType: string, n: O<number>, sMsg: string, sMsgMore: string) {
        this.status1a.set('labeltext', lng(sType));
        this.status2b.set('labeltext', UI512DrawText.setFont(sMsg, this.monaco));

        this.statusErrMoreDetails = sMsgMore;
        if (n === undefined) {
            this.status2a.set('labeltext', '');
        } else {
            let txt = lng('lngLine') + ` ${n},`;
            txt = UI512DrawText.setFont(txt, this.monaco);
            this.status2a.set('labeltext', txt);
        }
    }

    /**
     * user has clicked 'Save Script'
     */
    protected onBtnCompile() {
        let vel = this.cbGetAndValidateSelectedVel('viewingScriptVelId');
        if (!vel) {
            return;
        }

        /* run compilation */
        this.saveChangesToModel(this.vci.UI512App(), false);
        let code = vel.getS('script');
        this.vci.getCodeExec().updateChangedCode(vel, code);

        /* hide the "just encountered" message. */
        /* seems ok to do -- also might be possible for user to click hide. */
        let lastScriptErr = this.vci ? this.vci.getCodeExec().lastEncounteredScriptErr : undefined;
        if (lastScriptErr && lastScriptErr.velId === vel.id) {
            this.vci.getCodeExec().lastEncounteredScriptErr = undefined;
        }

        /* refresh. setting script does trigger uiredraw, but script has already been updated */
        /* because saveChangesToModel was called in mousedown. so need to manually cause update */
        this.needsCompilation.remove(vel.id);
        this.vci.causeUIRedraw();
    }

    /**
     * scroll to and highlight the target line
     */
    scrollToErrorPosition(pr: O<UI512PresenterBase>) {
        /* parse the line number out of the label text */
        let lineNumberText = this.status2a.getS('labeltext');
        if (this.el && lineNumberText.length > 0) {
            lineNumberText = lineNumberText.split(' ')[1].replace(/,/g, '');
            let lineNumber = Util512.parseInt(lineNumberText);
            if (Number.isFinite(lineNumber)) {
                lineNumber = Math.max(0, lineNumber - 1); /* from 1-based to 0-based */
                let gel = new UI512ElTextFieldAsGeneric(this.el);
                TextSelModify.selectLineInField(gel, lineNumber);

                if (pr) {
                    pr.setCurrentFocus(this.el.id);
                }
            }
        }
    }

    /**
     * respond to keydown
     */
    respondKeydown(d: KeyDownEventDetails) {
        if (!this.el || !this.el.getB('canselecttext') || !this.el.getB('canedit')) {
            return;
        }

        if (UI512TextEvents.keyDownProbablyCausesTextChange(d)) {
            /* make the 'save' button bold since we have unsaved changes */
            let vel = this.cbGetAndValidateSelectedVel('selectedVelId');
            if (vel) {
                this.needsCompilation.set(vel.id, true);
                this.refreshStatusLabels(this.vci.UI512App(), vel);
            }
        }

        super.respondKeydown(d);

        /* typically changes are saved to model after every keypress,
        but let's save even more often, after every Enter key is pressed.
        this way, when you hit undo, it won't take you back too far.
        note that we call saveChangesToModel after super.respondKeydown
        in order to include any indentation/text insertion changes.*/
        if (d.readableShortcut.search(/\bEnter\b/) !== -1) {
            this.saveChangesToModel(this.vci.UI512App(), false);
        }
    }

    /**
     * respond to mouse click
     */
    respondToClick(app: UI512Application, clicked: string) {
        if (clicked.endsWith('##btnScript')) {
            /* user clicked on 'edit script' in the lower right of the panel, so
            open the script editor */
            let validVel = this.cbGetAndValidateSelectedVel('selectedVelId');
            if (validVel) {
                this.vci.setOption('viewingScriptVelId', validVel.id);

                /* reset scroll, in case the last script we saw was really long */
                this.el.set('scrollamt', 0);

                /* filter out all temporary code */
                let script = validVel.getS('script')
                script = VpcExecFrame.filterTemporaryFromScript(script)
                validVel.set('script', script)

                this.refreshFromModel(app);
            }
        } else {
            let short = this.fromFullId(clicked);
            if (short === 'caption') {
                /* clicked the close box */
                this.saveChangesToModel(app, false);
                this.vci.setOption('viewingScriptVelId', '');
            } else if (short === 'btnScriptEditorCompile') {
                /* user clicked 'save script' */
                this.onBtnCompile();
            } else if (short === 'status2a') {
                /* user clicked the line number, scroll to that line */
                this.scrollToErrorPosition(undefined);
            } else if (short === 'status2b') {
                /* user clicked the error message, show the details */
                if (this.statusErrMoreDetails.trim().length) {
                    this.cbAnswerMsg(this.statusErrMoreDetails, () => {});
                    /* remember to not run other code after showing modal dialog */
                }
            }
        }
    }

    /**
     * message that there are pending changes
     */
    static readonly thereArePendingChanges = 'There are pending changes.';

    /**
     * save the script to the script property on the vel
     * if onlyCheckIfDirty is set, skip saving the script and only check if there are unsaved changes
     */
    saveChangesToModel(app: UI512Application, onlyCheckIfDirty: boolean) {
        /* note: here we will save the script text to the 'script' property */
        /* it is not until the user clicks Compile that the compiled script changes. */
        /* using this design because previously the compilation errors would often pop up. */
        let vel = this.cbGetAndValidateSelectedVel('viewingScriptVelId');
        if (!vel || !this.el) {
            return;
        }

        let newscript = this.el.getFmTxt().toUnformatted();
        if (onlyCheckIfDirty) {
            let current = vel.getS('script');
            if (current !== newscript) {
                throw makeVpcInternalErr(msgNotification + VpcPanelScriptEditor.thereArePendingChanges);
            }
        } else {
            vel.set('script', newscript);
        }
    }
}
