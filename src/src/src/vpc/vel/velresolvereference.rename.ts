
/* auto */ import { checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { ReadableContainer, WritableContainer } from '../../vpc/vpcutils/vpcutils.js';
/* auto */ import { VpcValS } from '../../vpc/vpcutils/vpcval.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velbase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velfield.js';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite } from '../../vpc/vel/vpcoutsideinterfaces.js';

export function vpcElTypeAsSeenInName(tp: VpcElType) {
    switch (tp) {
        case VpcElType.Btn:
            return 'button';
        case VpcElType.Fld:
            return 'field';
        case VpcElType.Card:
            return 'card';
        case VpcElType.Bg:
            return 'bkgnd';
        case VpcElType.Stack:
            return 'stack';
        case VpcElType.Product:
            return '';
        default:
            throw makeVpcScriptErr(`4k|can't get name of el type ${tp}`);
    }
}

export class ReadableContainerStr implements ReadableContainer {
    constructor(protected s: string) {}
    isDefined() {
        return true;
    }

    getRawString() {
        return this.s;
    }

    len() {
        return this.s.length;
    }
}

export class ReadableContainerVar implements ReadableContainer {
    constructor(protected outside: OutsideWorldRead, public varname: string) {}
    isDefined() {
        return this.outside.IsVarDefined(this.varname);
    }

    getRawString() {
        return this.outside.ReadVarContents(this.varname).readAsString();
    }

    len() {
        return this.getRawString().length;
    }
}

export class WritableContainerVar extends ReadableContainerVar implements WritableContainer {
    constructor(protected outsideWritable: OutsideWorldReadWrite, varname: string) {
        super(outsideWritable, varname);
    }

    splice(insertion: number, lenToDelete: number, newtext: string) {
        let current = this.getRawString();
        let ret = '';
        ret += current.substring(0, insertion);
        ret += newtext;
        ret += current.substring(insertion + lenToDelete);
        this.outsideWritable.SetVarContents(this.varname, VpcValS(ret));
    }

    setAll(newtext: string) {
        this.outsideWritable.SetVarContents(this.varname, VpcValS(newtext));
    }
}

export class ReadableContainerField implements ReadableContainer {
    protected fld: VpcElField;
    constructor(vel: VpcElBase) {
        this.fld = vel as VpcElField;
        checkThrow(
            this.fld && this.fld.isVpcElField,
            `6[|currently we only support reading text from fld. to read label of button, use 'the label of cd btn 1'`
        );
    }

    isDefined() {
        return true;
    }

    len() {
        return this.fld.get_ftxt().len();
    }

    getRawString(): string {
        return this.fld.get_ftxt().toUnformatted();
    }
}

export class WritableContainerField extends ReadableContainerField implements WritableContainer {
    splice(insertion: number, lenToDelete: number, newstring: string) {
        let txt = this.fld.get_ftxt();
        if (insertion === 0 && lenToDelete >= txt.len()) {
            // follow emulator, different behavior (lose formatting) when replacing all text
            this.fld.setProp('alltext', VpcValS(newstring));
        } else {
            let font =
                insertion >= 0 && insertion < txt.len() ? txt.fontAt(insertion) : this.fld.getDefaultFontAsUi512();
            let newtxt = FormattedText.byInsertion(txt, insertion, lenToDelete, newstring, font);
            this.fld.setftxt(newtxt);
        }
    }

    setAll(newtext: string) {
        // follow emulator, different behavior (lose formatting) when replacing all text
        this.fld.setProp('alltext', VpcValS(newtext));
    }
}
