
/* auto */ import { checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { slength } from '../../ui512/utils/utils512.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ReadableContainer, WritableContainer } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';

/**
 * a readable container for a simple string.
 * (some readable containers are more complex, like a field that has formatted text)
 */
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

/**
 * a readable container for a script variable
 */
export class ReadableContainerVar implements ReadableContainer {
    constructor(protected outside: OutsideWorldRead, public varName: string) {}
    isDefined() {
        return this.outside.IsVarDefined(this.varName);
    }

    getRawString() {
        return this.outside.ReadVarContents(this.varName).readAsString();
    }

    len() {
        return this.getRawString().length;
    }
}

/**
 * a writable container
 */
export class WritableContainerVar extends ReadableContainerVar implements WritableContainer {
    constructor(protected outsideWritable: OutsideWorldReadWrite, varName: string) {
        super(outsideWritable, varName);
    }

    splice(insertion: number, lenToDelete: number, newText: string) {
        /* mimic Array.splice */
        let current = this.getRawString();
        let ret = '';
        ret += current.substring(0, insertion);
        ret += newText;
        ret += current.substring(insertion + lenToDelete);
        this.outsideWritable.SetVarContents(this.varName, VpcValS(ret));
    }

    setAll(newText: string) {
        this.outsideWritable.SetVarContents(this.varName, VpcValS(newText));
    }

    replaceAll(search:string, replaceWith:string) {
        let s = this.getRawString()
        let result = WritableContainerVar.replaceAll(s, search, replaceWith)
        this.setAll(result)
    }

    static replaceAll(s:string, search:string, replace:string) {
        checkThrow(slength(search) > 0,
            'you cannot search for an empty string, replace "" with "" in s is not allowed.')

        /* regular expressions would be faster, but we'd need to escape
        all metacharacters in the search string (hard to know if any metacharacters missed)
        and also need to be careful about special strings like $& in the replace string.
        so, until there's a standardized re.escape, use this. */
        return s.split(search).join(replace)
    }
}

/**
 * reading content from a field
 */
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
        /* this is fast, it's the reason we have a len() and not just getRawString().length */
        return this.fld.getFmTxt().len();
    }

    getRawString(): string {
        return this.fld.getFmTxt().toUnformatted();
    }
}

/**
 * writing content to a field
 */
export class WritableContainerField extends ReadableContainerField implements WritableContainer {
    splice(insertion: number, lenToDelete: number, newstring: string) {
        let txt = this.fld.getFmTxt();
        if (insertion === 0 && lenToDelete >= txt.len()) {
            /* follow emulator, there is different behavior (lose formatting) when replacing all text */
            this.fld.setProp('alltext', VpcValS(newstring));
        } else {
            let font =
                insertion >= 0 && insertion < txt.len() ? txt.fontAt(insertion) : this.fld.getDefaultFontAsUi512();
            let newTxt = FormattedText.byInsertion(txt, insertion, lenToDelete, newstring, font);
            this.fld.setFmTxt(newTxt);
        }
    }

    setAll(newText: string) {
        /* follow emulator, there is different behavior (lose formatting) when replacing all text */
        this.fld.setProp('alltext', VpcValS(newText));
    }

    replaceAll(search:string, replaceWith:string) {
        /* currently loses all formatting. this feature could be added if desired. */
        let s = this.getRawString()
        let result = WritableContainerVar.replaceAll(s, search, replaceWith)
        this.setAll(result)
    }
}
