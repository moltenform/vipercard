
/* auto */ import { VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { ReadableContainer, WritableContainer } from './../vpcutils/vpcUtils';
/* auto */ import { checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldReadWrite } from './velOutsideInterfaces';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcHandleLinkedVels } from './velBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { slength } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
 * a readable + writable container
 */
export class RWContainerVar implements WritableContainer {
    constructor(protected outside: OutsideWorldReadWrite, public varName: string) {}
    isDefined() {
        return this.outside.IsVarDefined(this.varName);
    }

    getRawString() {
        return this.outside.ReadVarContents(this.varName).readAsString();
    }

    len() {
        return this.getRawString().length;
    }

    splice(insertion: number, lenToDelete: number, newText: string) {
        /* mimic Array.splice */
        let current = this.getRawString();
        let ret = '';
        ret += current.substring(0, insertion);
        ret += newText;
        ret += current.substring(insertion + lenToDelete);
        this.outside.SetVarContents(this.varName, VpcValS(ret));
    }

    setAll(newText: string) {
        this.outside.SetVarContents(this.varName, VpcValS(newText));
    }

    replaceAll(search: string, replaceWith: string) {
        let s = this.getRawString();
        let result = RWContainerVar.replaceAll(s, search, replaceWith);
        this.setAll(result);
    }

    static replaceAll(s: string, search: string, replace: string) {
        checkThrow(slength(search) > 0, 'Ts|you cannot search for an empty string, replace "" with "" in s is not allowed.');

        /* regular expressions would be faster, but we'd need to escape
        all metacharacters in the search string (hard to know if any metacharacters missed)
        and also need to be careful about special strings like $& in the replace string.
        so, until there's a standardized re.escape, use this. */
        return s.split(search).join(replace);
    }
}


/**
 * reading/writing content to a field
 */
export class RWContainerField implements WritableContainer {
    constructor(protected fld: VpcElField, protected h: VpcHandleLinkedVels) {}
    isDefined() {
        return true;
    }

    len() {
        /* this is fast, it's the reason we have a len() and not just getRawString().length */
        return this.fld.getCardFmTxt().len();
    }

    getRawString(): string {
        return this.fld.getCardFmTxt().toUnformatted();
    }

    splice(insertion: number, lenToDelete: number, newstring: string) {
        let txt = this.fld.getCardFmTxt();
        if (insertion === 0 && lenToDelete >= txt.len()) {
            /* follow emulator, there is different behavior
            (lose formatting) when replacing all text */
            this.fld.setProp('alltext', VpcValS(newstring), this.h);
        } else {
            let font = insertion >= 0 && insertion < txt.len() ? txt.fontAt(insertion) : this.fld.getDefaultFontAsUi512();
            let newTxt = FormattedText.byInsertion(txt, insertion, lenToDelete, newstring, font);
            this.fld.setCardFmTxt(newTxt, this.h);
        }
    }

    setAll(newText: string) {
        /* follow emulator, there is different behavior (lose formatting) when replacing all text */
        this.fld.setProp('alltext', VpcValS(newText), this.h);
    }

    replaceAll(search: string, replaceWith: string) {
        /* currently loses all formatting. this feature could be added if desired. */
        let s = this.getRawString();
        let result = RWContainerVar.replaceAll(s, search, replaceWith);
        this.setAll(result);
    }
}

/**
 * reading/writing content to 'the selection'
 */
export class RWContainerFldSelection implements WritableContainer {
    constructor(protected fld: O<VpcElField>, protected h: VpcHandleLinkedVels, protected start:number, protected end:number) {}
    isDefined() {
        return true;
    }

    len() {
        return this.end - this.start;
    }

    getRawString(): string {
        if (this.fld) {
            return this.fld.getCardFmTxt().toUnformatted().substring(this.start, this.end);
        } else {
            return ""
        }
    }

    splice(insertion: number, lenToDelete: number, newstring: string) {
        checkThrow(this.fld, "There isn't a selection")
        let txt = this.fld.getCardFmTxt();
        if (insertion === 0 && lenToDelete >= txt.len() && this.start === 0 && this.end >= txt.len()-1) {
            /* follow emulator, there is different behavior
            (lose formatting) when replacing all text */
            this.fld.setProp('alltext', VpcValS(newstring), this.h);
        } else {
            let slice = txt.slice(this.start, this.end)
            let font = insertion+this.start >= 0 && insertion+this.start < txt.len() ? txt.fontAt(insertion+this.start) : this.fld.getDefaultFontAsUi512();
            let newSliceContents = FormattedText.byInsertion(slice, insertion, lenToDelete, newstring, font);
            let newTxt = FormattedText.byInsertion(newSliceContents, this.start, this.end, newSliceContents.toUnformatted(), font)
            this.fld.setCardFmTxt(newTxt, this.h);
        }
    }

    setAll(newText: string) {
        this.splice(0, 0, newText)
    }

    replaceAll(search: string, replaceWith: string) {
        /* currently loses all formatting. this feature could be added if desired. */
        let s = this.getRawString();
        let result = RWContainerVar.replaceAll(s, search, replaceWith);
        this.setAll(result);
    }
}
