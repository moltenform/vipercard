
/* auto */ import { VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { PropAdjective } from './../vpcutils/vpcEnums';
/* auto */ import { vpcVersion } from './../../ui512/utils/util512Base';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * separate utilities for builtin functions
 */
export const VpcBuiltinFunctionsDateUtils = /* static class */ {
    /* render short date. */
    _getShortDate() {
        let [nDay, nMonth, nYear] = this._getDateCurrent();
        return `${nMonth + 1}/${nDay}/${nYear}`;
    },

    /* render abbrev date. */
    _getAbbrevDate() {
        let [nDay, nMonth, nYear] = this._getDateCurrent();
        return `${lng(day_names_short[nDay])}, ${lng(month_names_short[nMonth])} ${nDay}, ${nYear}`;
    },

    /* render long date. */
    _getLongDate() {
        let [nDay, nMonth, nYear] = this._getDateCurrent();
        return `${lng(day_names[nDay])}, ${lng(month_names[nMonth])} ${nDay}, ${nYear}`;
    },

    /* get date info from javascript. month is 0-based. */
    _getDateCurrent(): [number, number, number] {
        let d = new Date();
        return [d.getDay(), d.getMonth(), d.getFullYear()];
    },

    /* get the current date as a string */
    go(adjective: PropAdjective) {
        if (adjective === PropAdjective.Abbrev) {
            return VpcValS(this._getAbbrevDate());
        } else if (adjective === PropAdjective.Long) {
            return VpcValS(this._getLongDate());
        } else {
            return VpcValS(this._getShortDate());
        }
    },

    /* get the product version */
    getVersion(adjective: PropAdjective) {
        if (adjective === PropAdjective.Long) {
            return VpcValS(vpcVersion);
        } else {
            return VpcValS(vpcVersion[0] + '.' + vpcVersion[1]);
        }
    }
};

const month_names = [
    'lngJanuary',
    'lngFebruary',
    'lngMarch',
    'lngApril',
    'lngMay',
    'lngJune',
    'lngJuly',
    'lngAugust',
    'lngSeptember',
    'lngOctober',
    'lngNovember',
    'lngDecember'
];

const month_names_short = [
    'lngJan',
    'lngFeb',
    'lngMar',
    'lngApr',
    'lngMay',
    'lngJun',
    'lngJul',
    'lngAug',
    'lngSep',
    'lngOct',
    'lngNov',
    'lngDec'
];
const day_names = ['lngSunday', 'lngMonday', 'lngTuesday', 'lngWednesday', 'lngThursday', 'lngFriday', 'lngSaturday'];
const day_names_short = ['lngSun', 'lngMon', 'lngTue', 'lngWed', 'lngThu', 'lngFri', 'lngSat'];
