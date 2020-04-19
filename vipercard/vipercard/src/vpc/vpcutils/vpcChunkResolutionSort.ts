
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

    static writeCodeCustomSort(sortOptions: Map<string, string>) {
        /* let's build a sort here! use decorate-sort-undecorate */
        if (sortOptions['granularity'] !== 'items' && sortOptions['granularity'] !== 'lines') {
            checkThrow(false, 'We only support sorting by lines or items');
        }

        /* check_long_lines_silence_subsequent */
        let delimExpr = sortOptions['granularity'] === 'items' ? 'the itemDel' : 'cr';
        /* the first char of the delim should probably be a 'small' character */
        let internalDelim = '\x01\x01\x01vpcinternal\x01\x01\x01';
        let template = `
put ( %ARG0% ) %INTO% content%UNIQUE%
if length ( content%UNIQUE% ) then
if "${internalDelim}" is in content%UNIQUE% then
    answer "Cannot sort by this type of expression."
    exit to ViperCard
end if
put "" %INTO% container%UNIQUE%
repeat with loop%UNIQUE% = 1 to the number of ${sortOptions['granularity']} of content%UNIQUE%
    put ${sortOptions['granularity']} loop%UNIQUE% of content%UNIQUE% %INTO% each
    put ( %ARG1% ) %INTO% sortkey%UNIQUE%
    put sortkey%UNIQUE% && "${internalDelim}" && each & ${delimExpr} %AFTER% container%UNIQUE%
end repeat
put char 1 to (the length of container%UNIQUE% - the length of ${delimExpr}) of container%UNIQUE% %INTO% container%UNIQUE%
%ARG2%
put "" %INTO% result%UNIQUE%
repeat with loop%UNIQUE% = 1 to the number of ${sortOptions['granularity']} of container%UNIQUE%
    put ${sortOptions['granularity']} loop%UNIQUE% of container%UNIQUE% %INTO% each
    put char ( offset ( "${internalDelim}" , each ) + ${internalDelim.length} ) to ( the length of each ) of each %INTO% each
    put each & ${delimExpr} %AFTER% result%UNIQUE%
end repeat
put char 1 to (the length of result%UNIQUE% - the length of ${delimExpr}) of result%UNIQUE% %INTO% result%UNIQUE%
put result%UNIQUE% %INTO% %ARG0%
end if`;
        return template;
    }
}
