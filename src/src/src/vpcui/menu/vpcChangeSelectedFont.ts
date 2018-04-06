
/* auto */ import { O, assertTrueWarn, checkThrow, makeVpcInternalErr, msgNotification } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { PropAdjective, RequestedChunkType, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcValS } from '../../vpc/vpcutils/vpcval.js';
/* auto */ import { RequestedChunk } from '../../vpc/vpcutils/vpcchunk.js';
/* auto */ import { RequestedVelRef } from '../../vpc/vpcutils/vpcoutsideclasses.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velbase.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcappli.js';

export class VpcChangeSelectedFont {
    cbGetEditToolSelectedFldOrBtn: () => O<VpcElBase>;
    constructor(protected appli: IVpcStateInterface) {}

    runFontMenuActionsIfApplicable(s: string) {
        if (s.startsWith('mnuItemTool')) {
            let toolNumber = parseInt(s.substr('mnuItemTool'.length), 10);
            toolNumber = isFinite(toolNumber) ? toolNumber : VpcTool.browse;
            this.appli.setTool(toolNumber);
            return true;
        } else if (s.startsWith('mnuItemSetFontFace')) {
            let v = s.substr('mnuItemSetFontFace'.length);
            this.setFont(v, /*btn*/ 'textfont', /*fld*/ 'textfont', /*sel*/ 'textfont');
            return true;
        } else if (s.startsWith('mnuItemSetFontSize')) {
            let v = s.substr('mnuItemSetFontSize'.length);
            this.setFont(v, /*btn*/ 'textsize', /*fld*/ 'textsize', /*sel*/ 'textsize');
            return true;
        } else if (s.startsWith('mnuSetFontStyle')) {
            let v = s.substr('mnuSetFontStyle'.length);
            this.setFont(v, /*btn*/ 'textstyle', /*fld*/ 'textstyle', /*sel*/ 'textstyle');
            return true;
        } else if (s.startsWith('mnuSetAlign')) {
            let v = s.substr('mnuSetAlign'.length);
            this.setAlign(v);
            return true;
        } else {
            return false;
        }
    }

    setAlign(v: string) {
        let worked = this.setAlignImpl(v);
        if (!worked) {
            throw makeVpcInternalErr(
                msgNotification +
                    this.appli.lang().translate('lngNo selection found. Select a button or field.')
            );
        }
    }

    setAlignImpl(v: string) {
        v = v.toLowerCase();
        let seled = this.cbGetEditToolSelectedFldOrBtn();
        if (seled) {
            seled.setProp('textalign', VpcValS(v));
            return true;
        } else {
            let chunksel = this.getActiveChunkSel();
            if (chunksel) {
                // we don't yet support setting alignment on a per-paragraph basis
                chunksel[0].setProp('textalign', VpcValS(v));
                return true;
            }
        }
    }

    setFont(v: string, forBtn: string, forFld: string, forSel: string) {
        let worked = this.setFontImpl(v, forBtn, forFld, forSel);
        if (!worked) {
            throw makeVpcInternalErr(
                msgNotification +
                    this.appli
                        .lang()
                        .translate(
                            'lngNo selection found. Either select a button or \nfield, or use the browse tool to select a few\n letters.'
                        )
            );
        }
    }

    protected toggleStyle(allstyle: string, v: string) {
        if (v === 'plain') {
            // user is setting font to plain, so lose the other formatting
            return 'plain';
        }

        checkThrow(allstyle !== 'mixed', 'did not expected to see "mixed".');
        let parts = allstyle.split(',');
        parts = parts.filter(s => s !== 'plain');
        let foundIndex = parts.findIndex(s => s === v);
        if (foundIndex === -1) {
            parts.push(v);
        } else {
            parts.splice(foundIndex, 1);
        }

        return parts.length ? parts.join(',') : 'plain';
    }

    getActiveChunkSel(): O<[VpcElBase, number, number]> {
        let vel = this.appli.getCurrentFocusVelField();
        if (vel) {
            // note: get from focused, not vel, since it's more up to date?
            // no, since we're acting on the vel, get everything from one for consistency
            let selcaret = fitIntoInclusive(vel.get_n('selcaret'), 0, vel.get_ftxt().len());
            let selend = fitIntoInclusive(vel.get_n('selend'), 0, vel.get_ftxt().len());
            if (selcaret !== selend) {
                return [vel, Math.min(selcaret, selend), Math.max(selcaret, selend)];
            }
        }

        return undefined;
    }

    setFontImpl(v: string, forBtn: string, forFld: string, forSel: string) {
        v = v.toLowerCase();
        let seled = this.cbGetEditToolSelectedFldOrBtn();
        if (seled) {
            let which = seled.getType() === VpcElType.Btn ? forBtn : forFld;
            if (forSel !== 'textstyle') {
                seled.setProp(which, VpcValS(v));
                return true;
            } else {
                let curstyle = seled
                    .getProp('textstyle')
                    .readAsString()
                    .toLowerCase();
                curstyle = this.toggleStyle(curstyle, v);
                seled.setProp('textstyle', VpcValS(curstyle));
                return true;
            }
        } else {
            let chunksel = this.getActiveChunkSel();
            if (chunksel) {
                let [vel, b1, b2] = chunksel;
                let chunk = new RequestedChunk(b1);
                chunk.last = b2;
                // adjust the range because vpc is both 1-based and inclusive
                chunk.first += 1;

                chunk.type = RequestedChunkType.Chars;
                let velref = new RequestedVelRef(VpcElType.Fld);
                let idn = parseInt(vel.id, 10);
                checkThrow(isFinite(idn), 'non numeric id?', vel.id);
                velref.lookById = idn;
                if (forSel !== 'textstyle') {
                    this.appli.getOutside().SetProp(velref, forSel, VpcValS(v), chunk);
                    return true;
                } else {
                    // do this character by character, because styles can differ
                    // 1) if one of the letters was bold, setting the selection to italic shouldn't lose the bold of that one
                    // 2) besides, if we looked up current style of all the selection, it might return 'mixed' and we wouldn't know how to flip
                    assertTrueWarn(chunk.first <= chunk.last, '', chunk.first, chunk.last);
                    for (let i = chunk.first; i <= chunk.last; i++) {
                        let subchunk = new RequestedChunk(i);
                        subchunk.first = i;
                        subchunk.last = i;
                        subchunk.type = RequestedChunkType.Chars;
                        let curstyle = this.appli
                            .getOutside()
                            .GetProp(velref, forSel, PropAdjective.empty, subchunk)
                            .readAsString();
                        curstyle = this.toggleStyle(curstyle, v);
                        this.appli.getOutside().SetProp(velref, forSel, VpcValS(curstyle), subchunk);
                    }

                    return true;
                }
            }
        }
    }
}
