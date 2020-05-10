
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcElType } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcEditPanelsBase } from './vpcEditPanelsBase';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { RespondToErr, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { cAltProductName } from './../../ui512/utils/util512Base';
/* auto */ import { UI512BtnStyle } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { TextFontSpec } from './../../ui512/drawtext/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../../ui512/drawtext/ui512DrawText';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * properties panel, for editing a stack's properties
 */
export class VpcEditPanelsStack extends VpcEditPanelsBase {
    compositeType = 'VpcEditPanelsStack';
    readonly velTypeShortName = '';
    readonly velTypeLongName = '';
    readonly velType = VpcElType.Stack;
    topInputs: [string, string, number][] = [['lngStack Name:', 'name', 190]];
    leftChoices: [string, string][] = [];
    rightOptions: [string, string, boolean][] = [];

    /**
     * you should refer to a stack as 'this stack' rather than by name or id
     */
    fillInValuesTip(app: UI512Application, vel: VpcElBase) {
        let txt = lng('lngRefer to the current stack in a script as\nthis stack');
        txt = UI512DrawText.setFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString());
        this.lblNamingTip.set('labeltext', txt);
    }

    /**
     * initialize layout for lower part of panel
     */
    createLowerSection(app: UI512Application) {
        super.createLowerSection(app)

        let grp = app.getGroup(this.grpId);
        const spaceFromRight = 130;
        const spaceFromBottom = 17;
        const btnW = 100+70;
        const btnH = 23;
        let scriptBtn = this.genBtn(app, grp, 'btnCompatibility');
        scriptBtn.set('labeltext', lng('lngCompatibility Mode...'));
        scriptBtn.set('style', UI512BtnStyle.OSStandard);
        scriptBtn.setDimensions(
            this.x + this.logicalWidth - (btnW + spaceFromRight),
            this.y + this.logicalHeight - (btnH + spaceFromBottom),
            btnW,
            btnH
        );
    }

    /**
     * user clicked on Compatibility
     */
    static onBtnCompatibility(vci: VpcStateInterface) {
        let fn = async() => {
            let isCurrently = vci.getModel().stack.getB('compatibilitymode')
            let offOn = isCurrently ? 'on':'off'
            let onOff = isCurrently ? 'off' : 'on'
            let msg = `Turn ${onOff} this setting for more compatibility with ${cAltProductName}? Currently is ${offOn}.`
            let chosen = await vci.answerMsgAsync(msg, 'OK', 'Cancel')
            if (chosen === 0) {
               /* clicked ok */
               vci.undoableAction(()=>vci.getModel().stack.setOnVel('compatibilitymode', !isCurrently, vci.getModel()))
            } else {
                /* clicked cancel or off the screen */
            }
        }

        Util512Higher.syncToAsyncTransition(fn(), 'onBtnCompatibility', RespondToErr.ConsoleErrOnly)
    }
}
