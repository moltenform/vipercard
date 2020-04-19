
/* auto */ import { WritableContainer } from './vpcUtils';
/* auto */ import { SortType, VpcGranularity, checkThrow } from './vpcEnums';
/* auto */ import { util512Sort } from './../../ui512/utils/util512';


/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

export class ChunkResolutionSort {
    /**
     * sort a container by chunks.
     * text sorting (default), compares text, not case sensitive.
     * numeric sorting, interpret as numbers, e.g. 10 sorts after 2.
     * international sorting, compares text using current locale.
     */
    static applySort(cont: WritableContainer, itemDel: string, type: VpcGranularity, sortType: SortType, ascend: boolean) {
        let splitBy: string;
        if (type === VpcGranularity.Chars) {
            splitBy = '';
        } else if (type === VpcGranularity.Items) {
            splitBy = itemDel;
        } else if (type === VpcGranularity.Lines) {
            splitBy = '\n';
        } else {
            checkThrow(false, `5/|we don't currently support sorting by ${type}`);
        }

        let split = cont.getRawString().split(splitBy);
        let sorter: (a: string, b: string) => number;
        if (sortType === SortType.Numeric) {
            sorter = (a, b) => {
                /* don't use a different comparison if both inputs are numbers */
                /* that would be an inconsistent comparison */
                /* if there are some strings/some numbers in the array */
                let na = parseFloat(a);
                let nb = parseFloat(b);
                na = isFinite(na) ? na : Infinity;
                nb = isFinite(nb) ? nb : Infinity;
                return util512Sort([na, a.toLowerCase()], [nb, b.toLowerCase()]);
            };
        } else if (sortType === SortType.Text) {
            sorter = (a, b) => {
                a = a.toLowerCase();
                b = b.toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            };
        } else if (sortType === SortType.International) {
            sorter = (a, b) => {
                return a.localeCompare(b);
            };
        } else {
            checkThrow(false, `5.|Don't yet support sorting by style ${sortType}`);
        }

        split.sort(sorter);
        if (!ascend) {
            split.reverse();
        }

        let result = split.join(splitBy);
        cont.splice(0, cont.len(), result);
    }

    /**
     * lets you sort by a custom expression.
     * written in vipercard itself so that it's easy to plug in the expression.
     */
    static internalDelim = '\x01\x01\x01vpcinternal\x01\x01\x01';
    static writeCodeCustomSort(granularity:string, sortOptions: Map<string, string>) {
        /* let's build a sort here! use decorate-sort-undecorate */
        if (granularity !== 'items' && granularity !== 'lines') {
            checkThrow(false, 'We only support sorting by lines or items');
        }

        /* check_long_lines_silence_subsequent */
        let delimExpr = granularity === 'items' ? 'the itemDel' : 'cr';
        /* the first char of the delim should probably be a 'small' character */
        /* can't use a repeat-with ... */
        let template = `
put ( %ARG0% ) %INTO% content%UNIQUE%
if length ( content%UNIQUE% ) > 0 then
if "${ChunkResolutionSort.internalDelim}" is in content%UNIQUE% then
    errordialog "Cannot~sort~by~this~type~of~expression."
end if
put "" %INTO% tosort%UNIQUE%
repeat with loop%UNIQUE% = 1 to the number of ${granularity} of content%UNIQUE%
    put ${granularity} loop%UNIQUE% of content%UNIQUE% %INTO% each
    put ( %ARG1% ) %INTO% sortkey%UNIQUE%
    put sortkey%UNIQUE% & "${ChunkResolutionSort.internalDelim}" & each & ${delimExpr} %AFTER% tosort%UNIQUE%
end repeat
put char 1 to ( length ( tosort%UNIQUE% ) - length ( ${delimExpr} ) ) of tosort%UNIQUE% %INTO% tosort%UNIQUE%
sort "${sortOptions['method']}" "${sortOptions['order']}" ${granularity} of tosort%UNIQUE%
put "" %INTO% result%UNIQUE%
repeat with loop%UNIQUE% = 1 to the number of ${granularity} of tosort%UNIQUE%
    put ${granularity} loop%UNIQUE% of tosort%UNIQUE% %INTO% each
    put char ( offset ( "${ChunkResolutionSort.internalDelim}" , each ) + ${ChunkResolutionSort.internalDelim.length} ) to ( the length of each ) of each %INTO% each
    put each & ${delimExpr} %AFTER% result%UNIQUE%
end repeat
put char 1 to ( the length of result%UNIQUE% - the length of ${delimExpr} ) of result%UNIQUE% %INTO% result%UNIQUE%
put result%UNIQUE% %INTO% %ARG0%
end if`;
        return template;
    }
}
