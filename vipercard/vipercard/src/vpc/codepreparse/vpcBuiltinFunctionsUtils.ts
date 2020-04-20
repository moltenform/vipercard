
/* auto */ import { VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { PropAdjective } from './../vpcutils/vpcEnums';
/* auto */ import { vpcVersion } from './../../ui512/utils/util512Base';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * separate utilities for builtin functions
 */
export namespace VpcBuiltinFunctionsDateUtils {
    /* month names. clearly not yet internationalized. */
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
    
    /* render short date. */
    function getShortDate() {
        let [nDay, nMonth, nYear] = getDateCurrent();
        return `${nMonth + 1}/${nDay}/${nYear}`;
    }
    
    /* render abbrev date. */
    function getAbbrevDate() {
        let [nDay, nMonth, nYear] = getDateCurrent();
        return `${day_names_short[nDay]}, ${month_names_short[nMonth]} ${nDay}, ${nYear}`;
    }
    
    /* render long date. */
    function getLongDate() {
        let [nDay, nMonth, nYear] = getDateCurrent();
        return `${day_names[nDay]}, ${month_names[nMonth]} ${nDay}, ${nYear}`;
    }
    
    /* get date info from javascript. month is 0-based. */
    function getDateCurrent(): [number, number, number] {
        let d = new Date();
        return [d.getDay(), d.getMonth(), d.getFullYear()];
    }
    
    /* get the current date as a string */
    export function go(adjective: PropAdjective) {
        if (adjective === PropAdjective.Abbrev) {
            return VpcValS(getAbbrevDate());
        } else if (adjective === PropAdjective.Long) {
            return VpcValS(getLongDate());
        } else {
            return VpcValS(getShortDate());
        }
    }
    
    /* get the product version */
    export function getVersion(adjective: PropAdjective) {
        if (adjective === PropAdjective.Long) {
            return VpcValS(vpcVersion);
        } else {
            return VpcValS(vpcVersion[0] + '.' + vpcVersion[1]);
        }
    }
}
