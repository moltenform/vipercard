
/* auto */ import { VpcEditPanels } from './vpcPanelsInterface';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcErrStage, checkThrowInternal, vpcElTypeToString } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { MapKeyToObjectCanSet, getEnumToStrOrFallback } from './../../ui512/utils/util512';
/* auto */ import { TextSelModify } from './../../ui512/textedit/ui512TextSelModify';
/* auto */ import { UI512TextEvents } from './../../ui512/textedit/ui512TextEvents';
/* auto */ import { UI512PresenterBase } from './../../ui512/presentation/ui512PresenterBase';
/* auto */ import { UI512ElTextFieldAsGeneric } from './../../ui512/textedit/ui512GenericField';
/* auto */ import { KeyDownEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElTextField, UI512FldStyle } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { UI512ElLabel } from './../../ui512/elements/ui512ElementLabel';
/* auto */ import { UI512BtnStyle } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { TextFontStyling, textFontStylingToString } from './../../ui512/draw/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../../ui512/draw/ui512DrawText';
/* auto */ import { WndBorderDecorationConsts } from './../../ui512/composites/ui512Composites';
/* auto */ import { UI512CompCodeEditorFont } from './../../ui512/composites/ui512CodeEditorAutoIndent';
/* auto */ import { UI512CompCodeEditor } from './../../ui512/composites/ui512CodeEditor';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * the ViperCard script editor
 */
export class VpcPanelScriptEditor extends UI512CompCodeEditor implements VpcEditPanels {
    hasCloseBtn = true;
    autoCreateBlock = true;
    compositeType = 'VpcPanelScriptEditor';
    lineCommentPrefix = '--~ ';
    vci: VpcStateInterface;
    needsToBeSaved = new MapKeyToObjectCanSet<boolean>();
    cbGetAndValidateSelectedVel: (prp: string) => O<VpcElBase>;
    cbAnswerMsg: (s: string, cb: () => void) => void;
    protected status1a: UI512ElLabel;
    protected status2a: UI512ElLabel;
    protected status2b: UI512ElLabel;
    protected lastErrInfo: O<[string, string, number, VpcErrStage]>;
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

        this.autoIndent.caseSensitive = false;
        this.autoIndent.useTabs = true;
        this.autoIndent.useAutoIndent = true;
        this.autoIndent.useAutoCreateBlock = true;
        this.autoIndent.lineDoesNotActuallyStartBlock = s => this.lineDoesNotActuallyStartBlock(s);
    }

    /**
     * a higher layer will tells us info about the current error
     */
    setLastErrInfo(velId: string, errDetails: string, lineNum: number, stage: VpcErrStage) {
        this.lastErrInfo = [velId, errDetails, lineNum, stage];
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
            this.setContent(lng('lngElement not found.'));
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
            this.refreshStatusLabels(app);
        }
    }

    /**
     * refresh status labels,
     * shows the last error encountered by the codeExec object
     */
    refreshStatusLabels(app: UI512Application) {
        if (this.lastErrInfo) {
            let [velId, errDetails, lineNum, stage] = this.lastErrInfo;
            let sStage = getEnumToStrOrFallback(VpcErrStage, stage);
            this.status1a.set('labeltext', sStage);
            let sLine = ` ${lineNum}`;
            sLine = UI512DrawText.setFont(sLine, this.monaco);
            this.status2a.set('labeltext', sLine);
            let sAll = `Script error: ${errDetails}`;
            sAll = UI512DrawText.setFont(sAll, this.monaco);
            this.status2b.set('labeltext', sAll);
        } else {
            this.status1a.set('labeltext', '');
            this.status2a.set('labeltext', '');
            this.status2b.set('labeltext', '');
        }

        /* does script have unsaved changes? */
        let velid = this.vci.getOptionS('viewingScriptVelId');

        let grp = app.getGroup(this.grpId);
        let btnCompile = grp.getEl(this.getElId('btnScriptEditorCompile'));
        if (this.needsToBeSaved.find(velid)) {
            btnCompile.set('labeltext', UI512DrawText.setFont(lng('lngSave Script'), this.genevaBold));
        } else {
            btnCompile.set('labeltext', UI512DrawText.setFont(lng('lngSave Script'), this.genevaPlain));
        }
    }

    /**
     * user has clicked 'Save Script'
     */
    protected onBtnSaveScript() {
        let vel = this.cbGetAndValidateSelectedVel('viewingScriptVelId');
        if (!vel) {
            return;
        }

        /* saves script */
        this.saveChangesToModel(this.vci.UI512App(), false);

        /* clear the encountered error message */
        this.lastErrInfo = undefined;
        this.needsToBeSaved.remove(vel.id);
        this.refreshStatusLabels(this.vci.UI512App());
        this.vci.causeUIRedraw();
    }

    /**
     * scroll to and highlight the target line
     */
    scrollToErrorPosition(pr: O<UI512PresenterBase>) {
        if (this.lastErrInfo !== undefined) {
            let lineNum = this.lastErrInfo[2] ?? 0;
            lineNum -= 1; /* from 1-based to 0-based */
            lineNum = Math.max(0, lineNum);
            let gel = new UI512ElTextFieldAsGeneric(this.el);
            TextSelModify.selectLineInField(gel, lineNum);

            if (pr) {
                pr.setCurrentFocus(this.el.id);
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
                this.needsToBeSaved.set(vel.id, true);
                this.refreshStatusLabels(this.vci.UI512App());
            }
        }

        super.respondKeydown(d);

        /* typically changes are saved to model after every keypress,
        but let's save less often, after every Enter key is pressed.
        this way, it's better when you hit undo.
        note that we call saveChangesToModel after super.respondKeydown
        in order to include any indentation/text insertion changes.*/
        if (d.readableShortcut.toLowerCase().search(/\benter\b/) !== -1) {
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
                this.onBtnSaveScript();
            } else if (short === 'status2a') {
                /* user clicked the line number, scroll to that line */
                this.scrollToErrorPosition(undefined);
            } else if (short === 'status2b') {
                /* user clicked the error message, show the details */
                if (this.lastErrInfo) {
                    let sDetails = this.lastErrInfo[1];
                    if (!sDetails.startsWith('Note:')) {
                        sDetails = 'Details: ' + sDetails;
                    }

                    this.cbAnswerMsg(sDetails, () => {});
                    /* remember to not run other code after showing modal dialog */
                }
            }
        }
    }

    /** strip these */
    protected stripStringsAndComments(s: string) {
        s = s.split('--')[0];
        s = s.replace(/"[^"]+"/g, '');
        return s;
    }

    /**
     * let's support single-line ifs...
     * and singleline else statements.
     */
    protected lineDoesNotActuallyStartBlock(s: string) {
        s = s.toLowerCase().trim();
        if (s.startsWith('if ')) {
            s = this.stripStringsAndComments(s);
            if (!s.endsWith(' then')) {
                let findThen = s.indexOf(' then ');
                if (findThen !== -1) {
                    return true;
                }
            }
        } else if (s.startsWith('else if ')) {
            s = this.stripStringsAndComments(s);
            if (!s.endsWith(' then')) {
                let findThen = s.indexOf(' then ');
                if (findThen !== -1) {
                    return true;
                }
            }
        } else if (s.trim() === 'else') {
        } else if (s.startsWith('else ')) {
            return true;
        }

        return false;
    }

    /**
     * message that there are pending changes
     */
    static readonly thereArePendingChanges = 'There are pending changes.';

    /**
     * save the script to the script property on the vel
     * if onlyCheckIfDirty is set, skip saving the script and only check if
     * there are unsaved changes
     */
    saveChangesToModel(app: UI512Application, onlyCheckIfDirty: boolean) {
        let vel = this.cbGetAndValidateSelectedVel('viewingScriptVelId');
        if (!vel || !this.el) {
            return;
        }

        let newscript = this.el.getFmTxt().toUnformatted();
        if (onlyCheckIfDirty) {
            let current = vel.getS('script');
            if (current !== newscript) {
                checkThrowInternal(false, VpcPanelScriptEditor.thereArePendingChanges);
            }
        } else {
            vel.set('script', newscript);
        }
    }

    /**
     * not relevant, there's nothing different in a bg
     */
    showOrHideBgSpecific(_app: UI512Application, _isBgPart: boolean) {}
}
