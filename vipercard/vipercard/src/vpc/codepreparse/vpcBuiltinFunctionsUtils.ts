
/* auto */ import { VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { PropAdjective } from './../vpcutils/vpcEnums';
/* auto */ import { vpcVersion } from './../../ui512/utils/util512Base';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

export namespace VpcBuiltinFunctionsDateUtils {
    const month_names = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day_names_short = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    function getShortDate() {
        let [nDay, nMonth, nYear] = getDateCurrent();
        return `${nMonth + 1}/${nDay}/${nYear}`;
    }
    function getAbbrevDate() {
        let [nDay, nMonth, nYear] = getDateCurrent();
        return `${day_names_short[nDay]}, ${month_names_short[nMonth]} ${nDay}, ${nYear}`;
    }
    function getLongDate() {
        let [nDay, nMonth, nYear] = getDateCurrent();
        return `${day_names[nDay]}, ${month_names[nMonth]} ${nDay}, ${nYear}`;
    }
    function getDateCurrent(): [number, number, number] {
        let d = new Date();
        return [d.getDay(), d.getMonth(), d.getFullYear()];
    }
    export function go(adjective: PropAdjective) {
        if (adjective === PropAdjective.Abbrev) {
            return VpcValS(getAbbrevDate());
        } else if (adjective === PropAdjective.Long) {
            return VpcValS(getLongDate());
        } else {
            return VpcValS(getShortDate());
        }
    }
    export function getVersion(adjective: PropAdjective) {
        if (adjective === PropAdjective.Long) {
            return VpcValS(vpcVersion)
        } else {
            return VpcValS(vpcVersion[0] + '.' + vpcVersion[1])
        }
    }
}
