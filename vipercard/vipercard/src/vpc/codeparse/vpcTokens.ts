
/* auto */ import { checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { cAltProductName, cProductName, trueIfDefinedAndNotNull } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512 } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * check the type of a token
 */
export function isTkType(tk: chevrotain.IToken, tkType: chevrotain.TokenType) {
    return tk.tokenType === tkType;
}

/**
 * allowed symbols fpr makeGreaterLessThanEqual
 */
export type TypeGreaterLessThanEqual = '=' | '==' | '<' | '>' | '<=' | '>=';

/**
 * a plain-JS object from the parser, the CST
 */
export type VpcParsed = any;

/**
 * create an object cloning the token,
 * TestCloneToken will verify that no properties were missed
 */
export function cloneToken(tk: chevrotain.IToken): chevrotain.IToken {
    return {
        image: tk.image,
        startOffset: tk.startOffset,
        startLine: tk.startLine,
        startColumn: tk.startColumn,
        endOffset: tk.endOffset,
        endLine: tk.endLine,
        endColumn: tk.endColumn,
        isInsertedInRecovery: tk.isInsertedInRecovery,
        tokenTypeIdx: tk.tokenTypeIdx,
        tokenType: tk.tokenType,
        payload: tk.payload
    };
}

/**
 * a list of disallowed variable names.
 * includes both actual tokens in the grammar and
 * tkidentifiers that we just don't want to be used as variable names
 */
export const alsoReservedWordsList: { [key: string]: boolean } = {
    /* a: true, we now allow this as a variable name */
    div: true,
    mod: true,
    owner: true,
    name: true,

    /* processed at an early stage */
    on: true,
    end: true,
    exit: true,
    pass: true,
    return: true,
    if: true,
    else: true,
    while: true,
    until: true,
    global: true,

    /* tokens from realVpc000 that aren't OneOfWords or SAME */
    commandchar: true,
    cmdchar: true,
    message: true,
    msg: true,
    previous: true,
    prev: true,
    of: true,
    in: true,
    it: true,

    /* tokens from realVpc000, includes all built-in commands */
    do: true,
    send: true,
    the: true,
    put: true,
    set: true,
    last: true,
    mid: true,
    middle: true,
    repeat: true,
    any: true,
    true: true,
    false: true,
    first: true,
    second: true,
    third: true,
    fourth: true,
    fifth: true,
    sixth: true,
    seventh: true,
    eighth: true,
    ninth: true,
    tenth: true,
    this: true,
    next: true,
    box: true,
    window: true,
    word: true,
    item: true,
    line: true,
    to: true,
    me: true,
    target: true,
    id: true,
    stack: true,
    before: true,
    after: true,
    into: true,
    plain: true,
    bold: true,
    italic: true,
    underline: true,
    outline: true,
    shadow: true,
    condense: true,
    extend: true,
    from: true,
    push: true,
    open: true,
    close: true,
    left: true,
    right: true,
    up: true,
    down: true,
    out: true,
    top: true,
    bottom: true,
    center: true,
    rect: true,
    select: true,
    text: true,
    shiftkey: true,
    optionkey: true,
    commandkey: true,
    add: true,
    answer: true,
    with: true,
    or: true,
    ask: true,
    password: true,
    beep: true,
    choose: true,
    tool: true,
    click: true,
    at: true,
    delete: true,
    disable: true,
    divide: true,
    by: true,
    drag: true,
    enable: true,
    get: true,
    go: true,
    hide: true,
    menubar: true,
    lock: true,
    screen: true,
    messages: true,
    error: true,
    dialogs: true,
    recent: true,
    multiply: true,
    reset: true,
    paint: true,
    printing: true,
    show: true,
    all: true,
    sort: true,
    ascending: true,
    descending: true,
    numeric: true,
    international: true,
    datetime: true,
    lines: true,
    items: true,
    subtract: true,
    unlock: true,
    visual: true,
    effect: true,
    wait: true,
    for: true,
    long: true,
    short: true,
    abbrev: true,
    abbr: true,
    abbreviated: true,
    length: true,
    result: true,
    paramcount: true,
    params: true,
    number: true,
    words: true,
    there: true,
    is: true,
    no: true,
    not: true,
    integer: true,
    point: true,
    logical: true,
    and: true,
    contains: true,
    within: true
};

alsoReservedWordsList[cProductName.toLowerCase()] = true;
alsoReservedWordsList[cAltProductName.toLowerCase()] = true;
/* we'll also add to this list during genparse, see below */

/* check_long_lines_silence_subsequent */

/* generated code, any changes past this point will be lost: --------------- */
/* as a map so that we get quick access */
export const tks = {
tkStringLiteral: undefined as any as chevrotain.TokenType,
tkBlockComment: undefined as any as chevrotain.TokenType,
tkLineComment: undefined as any as chevrotain.TokenType,
tkContinuedLineOrWhiteSpace: undefined as any as chevrotain.TokenType,
tkCardAtEndOfLine: undefined as any as chevrotain.TokenType,
tkBgAtEndOfLine: undefined as any as chevrotain.TokenType,
tkStackAtEndOfLine: undefined as any as chevrotain.TokenType,
tkNewLine: undefined as any as chevrotain.TokenType,
tkSyntaxMark: undefined as any as chevrotain.TokenType,
tkNumLiteral: undefined as any as chevrotain.TokenType,
tkStack: undefined as any as chevrotain.TokenType,
tkBg: undefined as any as chevrotain.TokenType,
tkBgPlural: undefined as any as chevrotain.TokenType,
tkCard: undefined as any as chevrotain.TokenType,
tkCardPlural: undefined as any as chevrotain.TokenType,
tkBtn: undefined as any as chevrotain.TokenType,
tkBtnPlural: undefined as any as chevrotain.TokenType,
tkFld: undefined as any as chevrotain.TokenType,
tkFldPlural: undefined as any as chevrotain.TokenType,
tkPart: undefined as any as chevrotain.TokenType,
tkPartPlural: undefined as any as chevrotain.TokenType,
tkProductName: undefined as any as chevrotain.TokenType,
tkAdjective: undefined as any as chevrotain.TokenType,
tkOrdinal: undefined as any as chevrotain.TokenType,
tkPosition: undefined as any as chevrotain.TokenType,
tkChunkGranularity: undefined as any as chevrotain.TokenType,
tkInOnly: undefined as any as chevrotain.TokenType,
tkOfOnly: undefined as any as chevrotain.TokenType,
tkA: undefined as any as chevrotain.TokenType,
_not: undefined as any as chevrotain.TokenType,
_there: undefined as any as chevrotain.TokenType,
_is: undefined as any as chevrotain.TokenType,
_no: undefined as any as chevrotain.TokenType,
_and: undefined as any as chevrotain.TokenType,
_or: undefined as any as chevrotain.TokenType,
_contains: undefined as any as chevrotain.TokenType,
_within: undefined as any as chevrotain.TokenType,
_the: undefined as any as chevrotain.TokenType,
_message: undefined as any as chevrotain.TokenType,
_window: undefined as any as chevrotain.TokenType,
_windows: undefined as any as chevrotain.TokenType,
_box: undefined as any as chevrotain.TokenType,
_me: undefined as any as chevrotain.TokenType,
_recent: undefined as any as chevrotain.TokenType,
_back: undefined as any as chevrotain.TokenType,
_forth: undefined as any as chevrotain.TokenType,
_marked: undefined as any as chevrotain.TokenType,
_to: undefined as any as chevrotain.TokenType,
_menuItem: undefined as any as chevrotain.TokenType,
_menu: undefined as any as chevrotain.TokenType,
_id: undefined as any as chevrotain.TokenType,
_number: undefined as any as chevrotain.TokenType,
_selection: undefined as any as chevrotain.TokenType,
_target: undefined as any as chevrotain.TokenType,
tkComma: undefined as any as chevrotain.TokenType,
tkLParen: undefined as any as chevrotain.TokenType,
tkRParen: undefined as any as chevrotain.TokenType,
tkPlusOrMinus: undefined as any as chevrotain.TokenType,
tkMultDivideExpDivMod: undefined as any as chevrotain.TokenType,
tkStringConcat: undefined as any as chevrotain.TokenType,
tkGreaterOrLessEqualOrEqual: undefined as any as chevrotain.TokenType,
tkUnaryVipercardProperties: undefined as any as chevrotain.TokenType,
tkAllUnaryPropertiesIfNotAlready: undefined as any as chevrotain.TokenType,
tkAllNullaryOrUnaryPropertiesIfNotAlready: undefined as any as chevrotain.TokenType,
tkIdentifier: undefined as any as chevrotain.TokenType,
}
export const allVpcTokens:chevrotain.TokenType[] = []


/* as a map so that we get quick access */
export function initAllVpcTokens() {
if (!tks.tkStringLiteral) {
tks.tkStringLiteral = chevrotain.createToken({
name: "tkStringLiteral",
pattern: /"[^"\n]*"(?![a-zA-Z0-9_])/i,
});
tks.tkBlockComment = chevrotain.createToken({
name: "tkBlockComment",
pattern: /--\[\[.*?\]\]/i,
group: chevrotain.Lexer.SKIPPED,line_breaks:true,
});
tks.tkLineComment = chevrotain.createToken({
name: "tkLineComment",
pattern: /--[^\n]*/i,
group: chevrotain.Lexer.SKIPPED,
});
tks.tkContinuedLineOrWhiteSpace = chevrotain.createToken({
name: "tkContinuedLineOrWhiteSpace",
pattern: /(?:[ \t]+)|(?:[\\\xC2][ \t]*\n)/i,
group: chevrotain.Lexer.SKIPPED,line_breaks:true,
});
tks.tkCardAtEndOfLine = chevrotain.createToken({
name: "tkCardAtEndOfLine",
pattern: /(?:card|cd)(?=\s*\n)/i,
});
tks.tkBgAtEndOfLine = chevrotain.createToken({
name: "tkBgAtEndOfLine",
pattern: /(?:background|bkgnd|bg)(?=\s*\n)/i,
});
tks.tkStackAtEndOfLine = chevrotain.createToken({
name: "tkStackAtEndOfLine",
pattern: /stack(?=\s*\n)/i,
});
tks.tkNewLine = chevrotain.createToken({
name: "tkNewLine",
pattern: /\n+/i,
line_breaks:true,
});
tks.tkSyntaxMark = chevrotain.createToken({
name: "tkSyntaxMark",
pattern: /\?{9}/i,
});
tks.tkNumLiteral = chevrotain.createToken({
name: "tkNumLiteral",
pattern: /[0-9]+(?:\.[0-9]*)?(?:e[-+]?[0-9]+)?(?![a-zA-Z0-9_])/i,
});
tks.tkStack = chevrotain.createToken({
name: "tkStack",
pattern: /(?:stack(?![a-zA-Z0-9_]))/i,
});
tks.tkBg = chevrotain.createToken({
name: "tkBg",
pattern: /(?:background(?![a-zA-Z0-9_]))|(?:bkgnd(?![a-zA-Z0-9_]))|(?:bg(?![a-zA-Z0-9_]))/i,
});
tks.tkBgPlural = chevrotain.createToken({
name: "tkBgPlural",
pattern: /(?:backgrounds(?![a-zA-Z0-9_]))|(?:bkgnds(?![a-zA-Z0-9_]))|(?:bgs(?![a-zA-Z0-9_]))/i,
});
tks.tkCard = chevrotain.createToken({
name: "tkCard",
pattern: /(?:card(?![a-zA-Z0-9_]))|(?:cd(?![a-zA-Z0-9_]))/i,
});
tks.tkCardPlural = chevrotain.createToken({
name: "tkCardPlural",
pattern: /(?:cards(?![a-zA-Z0-9_]))|(?:cds(?![a-zA-Z0-9_]))/i,
});
tks.tkBtn = chevrotain.createToken({
name: "tkBtn",
pattern: /(?:button(?![a-zA-Z0-9_]))|(?:btn(?![a-zA-Z0-9_]))/i,
});
tks.tkBtnPlural = chevrotain.createToken({
name: "tkBtnPlural",
pattern: /(?:buttons(?![a-zA-Z0-9_]))|(?:btns(?![a-zA-Z0-9_]))/i,
});
tks.tkFld = chevrotain.createToken({
name: "tkFld",
pattern: /(?:field(?![a-zA-Z0-9_]))|(?:fld(?![a-zA-Z0-9_]))/i,
});
tks.tkFldPlural = chevrotain.createToken({
name: "tkFldPlural",
pattern: /(?:fields(?![a-zA-Z0-9_]))|(?:flds(?![a-zA-Z0-9_]))/i,
});
tks.tkPart = chevrotain.createToken({
name: "tkPart",
pattern: /(?:part(?![a-zA-Z0-9_]))/i,
});
tks.tkPartPlural = chevrotain.createToken({
name: "tkPartPlural",
pattern: /(?:parts(?![a-zA-Z0-9_]))/i,
});
tks.tkProductName = chevrotain.createToken({
name: "tkProductName",
pattern: /(?:hypercard(?![a-zA-Z0-9_]))|(?:vipercard(?![a-zA-Z0-9_]))/i,
});
tks.tkAdjective = chevrotain.createToken({
name: "tkAdjective",
pattern: /(?:long(?![a-zA-Z0-9_]))|(?:short(?![a-zA-Z0-9_]))|(?:abbrev(?![a-zA-Z0-9_]))|(?:abbr(?![a-zA-Z0-9_]))|(?:abbreviated(?![a-zA-Z0-9_]))/i,
});
tks.tkOrdinal = chevrotain.createToken({
name: "tkOrdinal",
pattern: /(?:last(?![a-zA-Z0-9_]))|(?:mid(?![a-zA-Z0-9_]))|(?:middle(?![a-zA-Z0-9_]))|(?:any(?![a-zA-Z0-9_]))|(?:first(?![a-zA-Z0-9_]))|(?:second(?![a-zA-Z0-9_]))|(?:third(?![a-zA-Z0-9_]))|(?:fourth(?![a-zA-Z0-9_]))|(?:fifth(?![a-zA-Z0-9_]))|(?:sixth(?![a-zA-Z0-9_]))|(?:seventh(?![a-zA-Z0-9_]))|(?:eighth(?![a-zA-Z0-9_]))|(?:ninth(?![a-zA-Z0-9_]))|(?:tenth(?![a-zA-Z0-9_]))/i,
});
tks.tkPosition = chevrotain.createToken({
name: "tkPosition",
pattern: /(?:this(?![a-zA-Z0-9_]))|(?:prev(?![a-zA-Z0-9_]))|(?:previous(?![a-zA-Z0-9_]))|(?:next(?![a-zA-Z0-9_]))/i,
});
tks.tkChunkGranularity = chevrotain.createToken({
name: "tkChunkGranularity",
pattern: /(?:characters?(?![a-zA-Z0-9_]))|(?:chars?(?![a-zA-Z0-9_]))|(?:words?(?![a-zA-Z0-9_]))|(?:items?(?![a-zA-Z0-9_]))|(?:lines?(?![a-zA-Z0-9_]))/i,
});
tks.tkInOnly = chevrotain.createToken({
name: "tkInOnly",
pattern: /(?:in(?![a-zA-Z0-9_]))/i,
});
tks.tkOfOnly = chevrotain.createToken({
name: "tkOfOnly",
pattern: /(?:of(?![a-zA-Z0-9_]))/i,
});
tks.tkA = chevrotain.createToken({
name: "tkA",
pattern: /(?:a(?![a-zA-Z0-9_]))|(?:an(?![a-zA-Z0-9_]))/i,
});
tks._not = chevrotain.createToken({
name: "_not",
pattern: /(?:not(?![a-zA-Z0-9_]))/i,
});
tks._there = chevrotain.createToken({
name: "_there",
pattern: /(?:there(?![a-zA-Z0-9_]))/i,
});
tks._is = chevrotain.createToken({
name: "_is",
pattern: /(?:is(?![a-zA-Z0-9_]))/i,
});
tks._no = chevrotain.createToken({
name: "_no",
pattern: /(?:no(?![a-zA-Z0-9_]))/i,
});
tks._and = chevrotain.createToken({
name: "_and",
pattern: /(?:and(?![a-zA-Z0-9_]))/i,
});
tks._or = chevrotain.createToken({
name: "_or",
pattern: /(?:or(?![a-zA-Z0-9_]))/i,
});
tks._contains = chevrotain.createToken({
name: "_contains",
pattern: /(?:contains(?![a-zA-Z0-9_]))/i,
});
tks._within = chevrotain.createToken({
name: "_within",
pattern: /(?:within(?![a-zA-Z0-9_]))/i,
});
tks._the = chevrotain.createToken({
name: "_the",
pattern: /(?:the(?![a-zA-Z0-9_]))/i,
});
tks._message = chevrotain.createToken({
name: "_message",
pattern: /(?:msg(?![a-zA-Z0-9_]))|(?:message(?![a-zA-Z0-9_]))/i,
});
tks._window = chevrotain.createToken({
name: "_window",
pattern: /(?:window(?![a-zA-Z0-9_]))/i,
});
tks._windows = chevrotain.createToken({
name: "_windows",
pattern: /(?:windows(?![a-zA-Z0-9_]))/i,
});
tks._box = chevrotain.createToken({
name: "_box",
pattern: /(?:box(?![a-zA-Z0-9_]))/i,
});
tks._me = chevrotain.createToken({
name: "_me",
pattern: /(?:me(?![a-zA-Z0-9_]))/i,
});
tks._recent = chevrotain.createToken({
name: "_recent",
pattern: /(?:recent(?![a-zA-Z0-9_]))/i,
});
tks._back = chevrotain.createToken({
name: "_back",
pattern: /(?:back(?![a-zA-Z0-9_]))/i,
});
tks._forth = chevrotain.createToken({
name: "_forth",
pattern: /(?:forth(?![a-zA-Z0-9_]))/i,
});
tks._marked = chevrotain.createToken({
name: "_marked",
pattern: /(?:marked(?![a-zA-Z0-9_]))/i,
});
tks._to = chevrotain.createToken({
name: "_to",
pattern: /(?:to(?![a-zA-Z0-9_]))/i,
});
tks._menuItem = chevrotain.createToken({
name: "_menuItem",
pattern: /(?:menuitems?(?![a-zA-Z0-9_]))/i,
});
tks._menu = chevrotain.createToken({
name: "_menu",
pattern: /(?:menu(?![a-zA-Z0-9_]))/i,
});
tks._id = chevrotain.createToken({
name: "_id",
pattern: /(?:id(?![a-zA-Z0-9_]))/i,
});
tks._number = chevrotain.createToken({
name: "_number",
pattern: /(?:number(?![a-zA-Z0-9_]))/i,
});
tks._selection = chevrotain.createToken({
name: "_selection",
pattern: /(?:selection(?![a-zA-Z0-9_]))/i,
});
tks._target = chevrotain.createToken({
name: "_target",
pattern: /(?:target(?![a-zA-Z0-9_]))/i,
});
tks.tkComma = chevrotain.createToken({
name: "tkComma",
pattern: /,/i,
});
tks.tkLParen = chevrotain.createToken({
name: "tkLParen",
pattern: /\(/i,
});
tks.tkRParen = chevrotain.createToken({
name: "tkRParen",
pattern: /\)/i,
});
tks.tkPlusOrMinus = chevrotain.createToken({
name: "tkPlusOrMinus",
pattern: /(?:\+)|(?:-)/i,
});
tks.tkMultDivideExpDivMod = chevrotain.createToken({
name: "tkMultDivideExpDivMod",
pattern: /(?:\*)|(?:\/)|(?:\^)|(?:div(?![a-zA-Z0-9_]))|(?:mod(?![a-zA-Z0-9_]))/i,
});
tks.tkStringConcat = chevrotain.createToken({
name: "tkStringConcat",
pattern: /(?:&&)|(?:&)/i,
});
tks.tkGreaterOrLessEqualOrEqual = chevrotain.createToken({
name: "tkGreaterOrLessEqualOrEqual",
pattern: /(?:<>)|(?:>=?)|(?:<=?)|(?:!=)|(?:==?)|(?:\xB2)|(?:\xB3)|(?:\xAD)/i,
});
tks.tkUnaryVipercardProperties = chevrotain.createToken({
name: "tkUnaryVipercardProperties",
pattern: /(?:alltext(?![a-zA-Z0-9_]))|(?:label(?![a-zA-Z0-9_]))|(?:showlabel(?![a-zA-Z0-9_]))|(?:singleline(?![a-zA-Z0-9_]))|(?:defaulttextstyle(?![a-zA-Z0-9_]))|(?:defaulttextfont(?![a-zA-Z0-9_]))|(?:defaulttextsize(?![a-zA-Z0-9_]))/i,
});
tks.tkAllUnaryPropertiesIfNotAlready = chevrotain.createToken({
name: "tkAllUnaryPropertiesIfNotAlready",
pattern: /(?:autohilite(?![a-zA-Z0-9_]))|(?:autoselect(?![a-zA-Z0-9_]))|(?:autotab(?![a-zA-Z0-9_]))|(?:bottom(?![a-zA-Z0-9_]))|(?:bottomright(?![a-zA-Z0-9_]))|(?:cantabort(?![a-zA-Z0-9_]))|(?:cantdelete(?![a-zA-Z0-9_]))|(?:cantmodify(?![a-zA-Z0-9_]))|(?:cantpeek(?![a-zA-Z0-9_]))|(?:checkmark(?![a-zA-Z0-9_]))|(?:commandchar(?![a-zA-Z0-9_]))|(?:dontsearch(?![a-zA-Z0-9_]))|(?:dontwrap(?![a-zA-Z0-9_]))|(?:enabled(?![a-zA-Z0-9_]))|(?:family(?![a-zA-Z0-9_]))|(?:fixedlineheight(?![a-zA-Z0-9_]))|(?:freesize(?![a-zA-Z0-9_]))|(?:height(?![a-zA-Z0-9_]))|(?:hilite(?![a-zA-Z0-9_]))|(?:icon(?![a-zA-Z0-9_]))|(?:left(?![a-zA-Z0-9_]))|(?:location(?![a-zA-Z0-9_]))|(?:locktext(?![a-zA-Z0-9_]))|(?:markchar(?![a-zA-Z0-9_]))|(?:menumessage(?![a-zA-Z0-9_]))|(?:multiplelines(?![a-zA-Z0-9_]))|(?:name(?![a-zA-Z0-9_]))|(?:owner(?![a-zA-Z0-9_]))|(?:partnumber(?![a-zA-Z0-9_]))|(?:rectangle(?![a-zA-Z0-9_]))|(?:reporttemplates(?![a-zA-Z0-9_]))|(?:right(?![a-zA-Z0-9_]))|(?:script(?![a-zA-Z0-9_]))|(?:scroll(?![a-zA-Z0-9_]))|(?:sharedhilite(?![a-zA-Z0-9_]))|(?:sharedtext(?![a-zA-Z0-9_]))|(?:showlines(?![a-zA-Z0-9_]))|(?:showname(?![a-zA-Z0-9_]))|(?:showpict(?![a-zA-Z0-9_]))|(?:size(?![a-zA-Z0-9_]))|(?:style(?![a-zA-Z0-9_]))|(?:textalign(?![a-zA-Z0-9_]))|(?:titlewidth(?![a-zA-Z0-9_]))|(?:top(?![a-zA-Z0-9_]))|(?:topleft(?![a-zA-Z0-9_]))|(?:visible(?![a-zA-Z0-9_]))|(?:widemargins(?![a-zA-Z0-9_]))|(?:width(?![a-zA-Z0-9_]))|(?:zoomed(?![a-zA-Z0-9_]))/i,
});
tks.tkAllNullaryOrUnaryPropertiesIfNotAlready = chevrotain.createToken({
name: "tkAllNullaryOrUnaryPropertiesIfNotAlready",
pattern: /(?:scriptinglanguage(?![a-zA-Z0-9_]))|(?:textfont(?![a-zA-Z0-9_]))|(?:textheight(?![a-zA-Z0-9_]))|(?:textsize(?![a-zA-Z0-9_]))|(?:textstyle(?![a-zA-Z0-9_]))|(?:version(?![a-zA-Z0-9_]))/i,
});
tks.tkIdentifier = chevrotain.createToken({
name: "tkIdentifier",
pattern: /[a-zA-Z][0-9a-zA-Z$_]*/i,
});
}

Object.freeze(tks);

/* as an array, since order matters */
if (allVpcTokens.length <= 1) {
allVpcTokens[0] = tks.tkStringLiteral
allVpcTokens[1] = tks.tkBlockComment
allVpcTokens[2] = tks.tkLineComment
allVpcTokens[3] = tks.tkContinuedLineOrWhiteSpace
allVpcTokens[4] = tks.tkCardAtEndOfLine
allVpcTokens[5] = tks.tkBgAtEndOfLine
allVpcTokens[6] = tks.tkStackAtEndOfLine
allVpcTokens[7] = tks.tkNewLine
allVpcTokens[8] = tks.tkSyntaxMark
allVpcTokens[9] = tks.tkNumLiteral
allVpcTokens[10] = tks.tkStack
allVpcTokens[11] = tks.tkBg
allVpcTokens[12] = tks.tkBgPlural
allVpcTokens[13] = tks.tkCard
allVpcTokens[14] = tks.tkCardPlural
allVpcTokens[15] = tks.tkBtn
allVpcTokens[16] = tks.tkBtnPlural
allVpcTokens[17] = tks.tkFld
allVpcTokens[18] = tks.tkFldPlural
allVpcTokens[19] = tks.tkPart
allVpcTokens[20] = tks.tkPartPlural
allVpcTokens[21] = tks.tkProductName
allVpcTokens[22] = tks.tkAdjective
allVpcTokens[23] = tks.tkOrdinal
allVpcTokens[24] = tks.tkPosition
allVpcTokens[25] = tks.tkChunkGranularity
allVpcTokens[26] = tks.tkInOnly
allVpcTokens[27] = tks.tkOfOnly
allVpcTokens[28] = tks.tkA
allVpcTokens[29] = tks._not
allVpcTokens[30] = tks._there
allVpcTokens[31] = tks._is
allVpcTokens[32] = tks._no
allVpcTokens[33] = tks._and
allVpcTokens[34] = tks._or
allVpcTokens[35] = tks._contains
allVpcTokens[36] = tks._within
allVpcTokens[37] = tks._the
allVpcTokens[38] = tks._message
allVpcTokens[39] = tks._window
allVpcTokens[40] = tks._windows
allVpcTokens[41] = tks._box
allVpcTokens[42] = tks._me
allVpcTokens[43] = tks._recent
allVpcTokens[44] = tks._back
allVpcTokens[45] = tks._forth
allVpcTokens[46] = tks._marked
allVpcTokens[47] = tks._to
allVpcTokens[48] = tks._menuItem
allVpcTokens[49] = tks._menu
allVpcTokens[50] = tks._id
allVpcTokens[51] = tks._number
allVpcTokens[52] = tks._selection
allVpcTokens[53] = tks._target
allVpcTokens[54] = tks.tkComma
allVpcTokens[55] = tks.tkLParen
allVpcTokens[56] = tks.tkRParen
allVpcTokens[57] = tks.tkPlusOrMinus
allVpcTokens[58] = tks.tkMultDivideExpDivMod
allVpcTokens[59] = tks.tkStringConcat
allVpcTokens[60] = tks.tkGreaterOrLessEqualOrEqual
allVpcTokens[61] = tks.tkUnaryVipercardProperties
allVpcTokens[62] = tks.tkAllUnaryPropertiesIfNotAlready
allVpcTokens[63] = tks.tkAllNullaryOrUnaryPropertiesIfNotAlready
allVpcTokens[64] = tks.tkIdentifier
Object.freeze(allVpcTokens);

}
}




alsoReservedWordsList['stack'] = true;
alsoReservedWordsList['background'] = true;
alsoReservedWordsList['bkgnd'] = true;
alsoReservedWordsList['bg'] = true;
alsoReservedWordsList['backgrounds'] = true;
alsoReservedWordsList['bkgnds'] = true;
alsoReservedWordsList['bgs'] = true;
alsoReservedWordsList['card'] = true;
alsoReservedWordsList['cd'] = true;
alsoReservedWordsList['cards'] = true;
alsoReservedWordsList['cds'] = true;
alsoReservedWordsList['button'] = true;
alsoReservedWordsList['btn'] = true;
alsoReservedWordsList['buttons'] = true;
alsoReservedWordsList['btns'] = true;
alsoReservedWordsList['field'] = true;
alsoReservedWordsList['fld'] = true;
alsoReservedWordsList['fields'] = true;
alsoReservedWordsList['flds'] = true;
alsoReservedWordsList['part'] = true;
alsoReservedWordsList['parts'] = true;
alsoReservedWordsList['hypercard'] = true;
alsoReservedWordsList['vipercard'] = true;
alsoReservedWordsList['long'] = true;
alsoReservedWordsList['short'] = true;
alsoReservedWordsList['abbrev'] = true;
alsoReservedWordsList['abbr'] = true;
alsoReservedWordsList['abbreviated'] = true;
alsoReservedWordsList['last'] = true;
alsoReservedWordsList['mid'] = true;
alsoReservedWordsList['middle'] = true;
alsoReservedWordsList['any'] = true;
alsoReservedWordsList['first'] = true;
alsoReservedWordsList['second'] = true;
alsoReservedWordsList['third'] = true;
alsoReservedWordsList['fourth'] = true;
alsoReservedWordsList['fifth'] = true;
alsoReservedWordsList['sixth'] = true;
alsoReservedWordsList['seventh'] = true;
alsoReservedWordsList['eighth'] = true;
alsoReservedWordsList['ninth'] = true;
alsoReservedWordsList['tenth'] = true;
alsoReservedWordsList['this'] = true;
alsoReservedWordsList['prev'] = true;
alsoReservedWordsList['previous'] = true;
alsoReservedWordsList['next'] = true;
alsoReservedWordsList['characters'] = true;
alsoReservedWordsList['character'] = true;
alsoReservedWordsList['chars'] = true;
alsoReservedWordsList['char'] = true;
alsoReservedWordsList['words'] = true;
alsoReservedWordsList['word'] = true;
alsoReservedWordsList['items'] = true;
alsoReservedWordsList['item'] = true;
alsoReservedWordsList['lines'] = true;
alsoReservedWordsList['line'] = true;
alsoReservedWordsList['in'] = true;
alsoReservedWordsList['of'] = true;
alsoReservedWordsList['a'] = true;
alsoReservedWordsList['an'] = true;
alsoReservedWordsList['not'] = true;
alsoReservedWordsList['there'] = true;
alsoReservedWordsList['is'] = true;
alsoReservedWordsList['no'] = true;
alsoReservedWordsList['and'] = true;
alsoReservedWordsList['or'] = true;
alsoReservedWordsList['contains'] = true;
alsoReservedWordsList['within'] = true;
alsoReservedWordsList['the'] = true;
alsoReservedWordsList['msg'] = true;
alsoReservedWordsList['message'] = true;
alsoReservedWordsList['window'] = true;
alsoReservedWordsList['windows'] = true;
alsoReservedWordsList['box'] = true;
alsoReservedWordsList['me'] = true;
alsoReservedWordsList['recent'] = true;
alsoReservedWordsList['back'] = true;
alsoReservedWordsList['forth'] = true;
alsoReservedWordsList['marked'] = true;
alsoReservedWordsList['to'] = true;
alsoReservedWordsList['menuitems'] = true;
alsoReservedWordsList['menuitem'] = true;
alsoReservedWordsList['menu'] = true;
alsoReservedWordsList['id'] = true;
alsoReservedWordsList['number'] = true;
alsoReservedWordsList['selection'] = true;
alsoReservedWordsList['target'] = true;


/* map word-like tokens to the token type, useful for 
 fabricating new tokens in rewrite stage. */
export const listOfAllWordLikeTokens:{ [key: string]: chevrotain.TokenType } = { }
listOfAllWordLikeTokens['stack'] = tks.tkStack;
listOfAllWordLikeTokens['background'] = tks.tkBg;
listOfAllWordLikeTokens['bkgnd'] = tks.tkBg;
listOfAllWordLikeTokens['bg'] = tks.tkBg;
listOfAllWordLikeTokens['backgrounds'] = tks.tkBgPlural;
listOfAllWordLikeTokens['bkgnds'] = tks.tkBgPlural;
listOfAllWordLikeTokens['bgs'] = tks.tkBgPlural;
listOfAllWordLikeTokens['card'] = tks.tkCard;
listOfAllWordLikeTokens['cd'] = tks.tkCard;
listOfAllWordLikeTokens['cards'] = tks.tkCardPlural;
listOfAllWordLikeTokens['cds'] = tks.tkCardPlural;
listOfAllWordLikeTokens['button'] = tks.tkBtn;
listOfAllWordLikeTokens['btn'] = tks.tkBtn;
listOfAllWordLikeTokens['buttons'] = tks.tkBtnPlural;
listOfAllWordLikeTokens['btns'] = tks.tkBtnPlural;
listOfAllWordLikeTokens['field'] = tks.tkFld;
listOfAllWordLikeTokens['fld'] = tks.tkFld;
listOfAllWordLikeTokens['fields'] = tks.tkFldPlural;
listOfAllWordLikeTokens['flds'] = tks.tkFldPlural;
listOfAllWordLikeTokens['part'] = tks.tkPart;
listOfAllWordLikeTokens['parts'] = tks.tkPartPlural;
listOfAllWordLikeTokens['hypercard'] = tks.tkProductName;
listOfAllWordLikeTokens['vipercard'] = tks.tkProductName;
listOfAllWordLikeTokens['long'] = tks.tkAdjective;
listOfAllWordLikeTokens['short'] = tks.tkAdjective;
listOfAllWordLikeTokens['abbrev'] = tks.tkAdjective;
listOfAllWordLikeTokens['abbr'] = tks.tkAdjective;
listOfAllWordLikeTokens['abbreviated'] = tks.tkAdjective;
listOfAllWordLikeTokens['last'] = tks.tkOrdinal;
listOfAllWordLikeTokens['mid'] = tks.tkOrdinal;
listOfAllWordLikeTokens['middle'] = tks.tkOrdinal;
listOfAllWordLikeTokens['any'] = tks.tkOrdinal;
listOfAllWordLikeTokens['first'] = tks.tkOrdinal;
listOfAllWordLikeTokens['second'] = tks.tkOrdinal;
listOfAllWordLikeTokens['third'] = tks.tkOrdinal;
listOfAllWordLikeTokens['fourth'] = tks.tkOrdinal;
listOfAllWordLikeTokens['fifth'] = tks.tkOrdinal;
listOfAllWordLikeTokens['sixth'] = tks.tkOrdinal;
listOfAllWordLikeTokens['seventh'] = tks.tkOrdinal;
listOfAllWordLikeTokens['eighth'] = tks.tkOrdinal;
listOfAllWordLikeTokens['ninth'] = tks.tkOrdinal;
listOfAllWordLikeTokens['tenth'] = tks.tkOrdinal;
listOfAllWordLikeTokens['this'] = tks.tkPosition;
listOfAllWordLikeTokens['prev'] = tks.tkPosition;
listOfAllWordLikeTokens['previous'] = tks.tkPosition;
listOfAllWordLikeTokens['next'] = tks.tkPosition;
listOfAllWordLikeTokens['characters'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['character'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['chars'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['char'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['words'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['word'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['items'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['item'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['lines'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['line'] = tks.tkChunkGranularity;
listOfAllWordLikeTokens['in'] = tks.tkInOnly;
listOfAllWordLikeTokens['of'] = tks.tkOfOnly;
listOfAllWordLikeTokens['a'] = tks.tkA;
listOfAllWordLikeTokens['an'] = tks.tkA;
listOfAllWordLikeTokens['not'] = tks._not;
listOfAllWordLikeTokens['there'] = tks._there;
listOfAllWordLikeTokens['is'] = tks._is;
listOfAllWordLikeTokens['no'] = tks._no;
listOfAllWordLikeTokens['and'] = tks._and;
listOfAllWordLikeTokens['or'] = tks._or;
listOfAllWordLikeTokens['contains'] = tks._contains;
listOfAllWordLikeTokens['within'] = tks._within;
listOfAllWordLikeTokens['the'] = tks._the;
listOfAllWordLikeTokens['msg'] = tks._message;
listOfAllWordLikeTokens['message'] = tks._message;
listOfAllWordLikeTokens['window'] = tks._window;
listOfAllWordLikeTokens['windows'] = tks._windows;
listOfAllWordLikeTokens['box'] = tks._box;
listOfAllWordLikeTokens['me'] = tks._me;
listOfAllWordLikeTokens['recent'] = tks._recent;
listOfAllWordLikeTokens['back'] = tks._back;
listOfAllWordLikeTokens['forth'] = tks._forth;
listOfAllWordLikeTokens['marked'] = tks._marked;
listOfAllWordLikeTokens['to'] = tks._to;
listOfAllWordLikeTokens['menuitems'] = tks._menuItem;
listOfAllWordLikeTokens['menuitem'] = tks._menuItem;
listOfAllWordLikeTokens['menu'] = tks._menu;
listOfAllWordLikeTokens['id'] = tks._id;
listOfAllWordLikeTokens['number'] = tks._number;
listOfAllWordLikeTokens['selection'] = tks._selection;
listOfAllWordLikeTokens['target'] = tks._target;
listOfAllWordLikeTokens['alltext'] = tks.tkUnaryVipercardProperties;
listOfAllWordLikeTokens['label'] = tks.tkUnaryVipercardProperties;
listOfAllWordLikeTokens['showlabel'] = tks.tkUnaryVipercardProperties;
listOfAllWordLikeTokens['singleline'] = tks.tkUnaryVipercardProperties;
listOfAllWordLikeTokens['defaulttextstyle'] = tks.tkUnaryVipercardProperties;
listOfAllWordLikeTokens['defaulttextfont'] = tks.tkUnaryVipercardProperties;
listOfAllWordLikeTokens['defaulttextsize'] = tks.tkUnaryVipercardProperties;
listOfAllWordLikeTokens['autohilite'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['autoselect'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['autotab'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['bottom'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['bottomright'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['cantabort'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['cantdelete'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['cantmodify'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['cantpeek'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['checkmark'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['commandchar'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['dontsearch'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['dontwrap'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['enabled'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['family'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['fixedlineheight'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['freesize'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['height'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['hilite'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['icon'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['left'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['location'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['locktext'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['markchar'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['menumessage'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['multiplelines'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['name'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['owner'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['partnumber'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['rectangle'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['reporttemplates'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['right'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['script'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['scroll'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['sharedhilite'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['sharedtext'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['showlines'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['showname'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['showpict'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['size'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['style'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['textalign'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['titlewidth'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['top'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['topleft'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['visible'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['widemargins'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['width'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['zoomed'] = tks.tkAllUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['scriptinglanguage'] = tks.tkAllNullaryOrUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['textfont'] = tks.tkAllNullaryOrUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['textheight'] = tks.tkAllNullaryOrUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['textsize'] = tks.tkAllNullaryOrUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['textstyle'] = tks.tkAllNullaryOrUnaryPropertiesIfNotAlready;
listOfAllWordLikeTokens['version'] = tks.tkAllNullaryOrUnaryPropertiesIfNotAlready;


/* list commands, even the ones we don't support. */
export const listOfAllBuiltinCommandsInOriginalProduct:{ [key: string]: boolean } = { }

listOfAllBuiltinCommandsInOriginalProduct['add'] = true;
listOfAllBuiltinCommandsInOriginalProduct['answer'] = true;
listOfAllBuiltinCommandsInOriginalProduct['arrowkey'] = true;
listOfAllBuiltinCommandsInOriginalProduct['ask'] = true;
listOfAllBuiltinCommandsInOriginalProduct['beep'] = true;
listOfAllBuiltinCommandsInOriginalProduct['choose'] = true;
listOfAllBuiltinCommandsInOriginalProduct['click'] = true;
listOfAllBuiltinCommandsInOriginalProduct['close'] = true;
listOfAllBuiltinCommandsInOriginalProduct['commandkeydown'] = true;
listOfAllBuiltinCommandsInOriginalProduct['controlkey'] = true;
listOfAllBuiltinCommandsInOriginalProduct['convert'] = true;
listOfAllBuiltinCommandsInOriginalProduct['copy'] = true;
listOfAllBuiltinCommandsInOriginalProduct['create'] = true;
listOfAllBuiltinCommandsInOriginalProduct['debug'] = true;
listOfAllBuiltinCommandsInOriginalProduct['delete'] = true;
listOfAllBuiltinCommandsInOriginalProduct['dial'] = true;
listOfAllBuiltinCommandsInOriginalProduct['disable'] = true;
listOfAllBuiltinCommandsInOriginalProduct['divide'] = true;
listOfAllBuiltinCommandsInOriginalProduct['domenu'] = true;
listOfAllBuiltinCommandsInOriginalProduct['drag'] = true;
listOfAllBuiltinCommandsInOriginalProduct['edit'] = true;
listOfAllBuiltinCommandsInOriginalProduct['enable'] = true;
listOfAllBuiltinCommandsInOriginalProduct['enterinfield'] = true;
listOfAllBuiltinCommandsInOriginalProduct['enterkey'] = true;
listOfAllBuiltinCommandsInOriginalProduct['export'] = true;
listOfAllBuiltinCommandsInOriginalProduct['find'] = true;
listOfAllBuiltinCommandsInOriginalProduct['functionkey'] = true;
listOfAllBuiltinCommandsInOriginalProduct['get'] = true;
listOfAllBuiltinCommandsInOriginalProduct['go'] = true;
listOfAllBuiltinCommandsInOriginalProduct['help'] = true;
listOfAllBuiltinCommandsInOriginalProduct['hide'] = true;
listOfAllBuiltinCommandsInOriginalProduct['import'] = true;
listOfAllBuiltinCommandsInOriginalProduct['keydown'] = true;
listOfAllBuiltinCommandsInOriginalProduct['lock'] = true;
listOfAllBuiltinCommandsInOriginalProduct['mark'] = true;
listOfAllBuiltinCommandsInOriginalProduct['multiply'] = true;
listOfAllBuiltinCommandsInOriginalProduct['open'] = true;
listOfAllBuiltinCommandsInOriginalProduct['open'] = true;
listOfAllBuiltinCommandsInOriginalProduct['open'] = true;
listOfAllBuiltinCommandsInOriginalProduct['open'] = true;
listOfAllBuiltinCommandsInOriginalProduct['play'] = true;
listOfAllBuiltinCommandsInOriginalProduct['pop'] = true;
listOfAllBuiltinCommandsInOriginalProduct['print'] = true;
listOfAllBuiltinCommandsInOriginalProduct['push'] = true;
listOfAllBuiltinCommandsInOriginalProduct['put'] = true;
listOfAllBuiltinCommandsInOriginalProduct['read'] = true;
listOfAllBuiltinCommandsInOriginalProduct['reply'] = true;
listOfAllBuiltinCommandsInOriginalProduct['request'] = true;
listOfAllBuiltinCommandsInOriginalProduct['reset'] = true;
listOfAllBuiltinCommandsInOriginalProduct['returninfield'] = true;
listOfAllBuiltinCommandsInOriginalProduct['returnkey'] = true;
listOfAllBuiltinCommandsInOriginalProduct['run'] = true;
listOfAllBuiltinCommandsInOriginalProduct['save'] = true;
listOfAllBuiltinCommandsInOriginalProduct['select'] = true;
listOfAllBuiltinCommandsInOriginalProduct['set'] = true;
listOfAllBuiltinCommandsInOriginalProduct['show'] = true;
listOfAllBuiltinCommandsInOriginalProduct['sort'] = true;
listOfAllBuiltinCommandsInOriginalProduct['start'] = true;
listOfAllBuiltinCommandsInOriginalProduct['stop'] = true;
listOfAllBuiltinCommandsInOriginalProduct['subtract'] = true;
listOfAllBuiltinCommandsInOriginalProduct['tabkey'] = true;
listOfAllBuiltinCommandsInOriginalProduct['type'] = true;
listOfAllBuiltinCommandsInOriginalProduct['unlock'] = true;
listOfAllBuiltinCommandsInOriginalProduct['unmark'] = true;
listOfAllBuiltinCommandsInOriginalProduct['visual'] = true;
listOfAllBuiltinCommandsInOriginalProduct['wait'] = true;
listOfAllBuiltinCommandsInOriginalProduct['write'] = true;
listOfAllBuiltinCommandsInOriginalProduct['do'] = true;
listOfAllBuiltinCommandsInOriginalProduct['exit'] = true;
listOfAllBuiltinCommandsInOriginalProduct['global'] = true;
listOfAllBuiltinCommandsInOriginalProduct['next'] = true;
listOfAllBuiltinCommandsInOriginalProduct['pass'] = true;
listOfAllBuiltinCommandsInOriginalProduct['return'] = true;
listOfAllBuiltinCommandsInOriginalProduct['send'] = true;
listOfAllBuiltinCommandsInOriginalProduct['if'] = true;
/* ones we've defined */
listOfAllBuiltinCommandsInOriginalProduct['vpccalluntrappablechoose'] = true;
listOfAllBuiltinCommandsInOriginalProduct['vpccalluntrappabledomenu'] = true;
listOfAllBuiltinCommandsInOriginalProduct['vpccalluntrappableerrordialog'] = true;
listOfAllBuiltinCommandsInOriginalProduct['replace'] = true;

/* list events, even the ones we don't support. */
export const listOfAllBuiltinEventsInOriginalProduct:{ [key: string]: boolean } = { }

listOfAllBuiltinEventsInOriginalProduct['choose'] = true;
listOfAllBuiltinEventsInOriginalProduct['domenu'] = true;
listOfAllBuiltinEventsInOriginalProduct['help'] = true;
listOfAllBuiltinEventsInOriginalProduct['arrowkey'] = true;
listOfAllBuiltinEventsInOriginalProduct['commandkeydown'] = true;
listOfAllBuiltinEventsInOriginalProduct['controlkey'] = true;
listOfAllBuiltinEventsInOriginalProduct['functionkey'] = true;
listOfAllBuiltinEventsInOriginalProduct['keydown'] = true;
listOfAllBuiltinEventsInOriginalProduct['returninfield'] = true;
listOfAllBuiltinEventsInOriginalProduct['returnkey'] = true;
listOfAllBuiltinEventsInOriginalProduct['tabkey'] = true;
listOfAllBuiltinEventsInOriginalProduct['errordialog'] = true;
listOfAllBuiltinEventsInOriginalProduct['appleevent'] = true;
listOfAllBuiltinEventsInOriginalProduct['appleevent'] = true;
listOfAllBuiltinEventsInOriginalProduct['closebackground'] = true;
listOfAllBuiltinEventsInOriginalProduct['closecard'] = true;
listOfAllBuiltinEventsInOriginalProduct['closefield'] = true;
listOfAllBuiltinEventsInOriginalProduct['closestack'] = true;
listOfAllBuiltinEventsInOriginalProduct['deletebackground'] = true;
listOfAllBuiltinEventsInOriginalProduct['deletebutton'] = true;
listOfAllBuiltinEventsInOriginalProduct['deletecard'] = true;
listOfAllBuiltinEventsInOriginalProduct['deletefield'] = true;
listOfAllBuiltinEventsInOriginalProduct['deletestack'] = true;
listOfAllBuiltinEventsInOriginalProduct['errordialog'] = true;
listOfAllBuiltinEventsInOriginalProduct['exitfield'] = true;
listOfAllBuiltinEventsInOriginalProduct['idle'] = true;
listOfAllBuiltinEventsInOriginalProduct['mousedoubleclick'] = true;
listOfAllBuiltinEventsInOriginalProduct['mousedown'] = true;
listOfAllBuiltinEventsInOriginalProduct['mouseenter'] = true;
listOfAllBuiltinEventsInOriginalProduct['mouseleave'] = true;
listOfAllBuiltinEventsInOriginalProduct['mousestilldown'] = true;
listOfAllBuiltinEventsInOriginalProduct['mouseup'] = true;
listOfAllBuiltinEventsInOriginalProduct['mousewithin'] = true;
listOfAllBuiltinEventsInOriginalProduct['movewindow'] = true;
listOfAllBuiltinEventsInOriginalProduct['newbackground'] = true;
listOfAllBuiltinEventsInOriginalProduct['newbutton'] = true;
listOfAllBuiltinEventsInOriginalProduct['newcard'] = true;
listOfAllBuiltinEventsInOriginalProduct['newfield'] = true;
listOfAllBuiltinEventsInOriginalProduct['newstack'] = true;
listOfAllBuiltinEventsInOriginalProduct['openbackground'] = true;
listOfAllBuiltinEventsInOriginalProduct['opencard'] = true;
listOfAllBuiltinEventsInOriginalProduct['openfield'] = true;
listOfAllBuiltinEventsInOriginalProduct['openstack'] = true;
listOfAllBuiltinEventsInOriginalProduct['quit'] = true;
listOfAllBuiltinEventsInOriginalProduct['resume'] = true;
listOfAllBuiltinEventsInOriginalProduct['resumestack'] = true;
listOfAllBuiltinEventsInOriginalProduct['sizewindow'] = true;
listOfAllBuiltinEventsInOriginalProduct['startup'] = true;
listOfAllBuiltinEventsInOriginalProduct['suspend'] = true;
listOfAllBuiltinEventsInOriginalProduct['suspendstack'] = true;

/* it would be too restrictive to say a variable can only be a tkidentifier. */
export function couldTokenTypeBeAVariableName(t: chevrotain.IToken) {
return t.tokenType === tks.tkIdentifier ||t.tokenType === tks._number ||t.tokenType === tks.tkA ||t.tokenType === tks.tkAllUnaryPropertiesIfNotAlready ||t.tokenType === tks.tkUnaryVipercardProperties ||t.tokenType === tks.tkAllNullaryOrUnaryPropertiesIfNotAlready 
}

/* so that we'll get compile-time error if a rule name is misspelled */
export const tkstr = {
    RuleHAllPropertiesThatCouldBeUnary: 'RuleHAllPropertiesThatCouldBeUnary',
    RuleHAnyFnNameOrAllPropertiesThatCouldBeNullary: 'RuleHAnyFnNameOrAllPropertiesThatCouldBeNullary',
    RuleHAnyFnName: 'RuleHAnyFnName',
    RuleHCouldBeAPropertyToSet: 'RuleHCouldBeAPropertyToSet',
    RuleHAnyAllowedVariableName: 'RuleHAnyAllowedVariableName',
    RuleObject: 'RuleObject',
    RuleObjectBtn: 'RuleObjectBtn',
    RuleObjectFld: 'RuleObjectFld',
    RuleObjectCard: 'RuleObjectCard',
    RuleObjectBg: 'RuleObjectBg',
    RuleObjectStack: 'RuleObjectStack',
    RuleObjectPart: 'RuleObjectPart',
    RuleObjectSpecial: 'RuleObjectSpecial',
    RuleObjectInterpretedFromString: 'RuleObjectInterpretedFromString',
    RuleOf: 'RuleOf',
    RuleOrdinal: 'RuleOrdinal',
    RulePosition: 'RulePosition',
    RuleMenuItem: 'RuleMenuItem',
    RuleMenu: 'RuleMenu',
    RuleWindow_1: 'RuleWindow_1',
    RuleWindow: 'RuleWindow',
    RuleMessageBox: 'RuleMessageBox',
    RuleHSimpleContainer: 'RuleHSimpleContainer',
    RuleHContainer: 'RuleHContainer',
    RuleHChunk: 'RuleHChunk',
    RuleHChunkOne: 'RuleHChunkOne',
    RuleHChunkBound: 'RuleHChunkBound',
    RuleHSource: 'RuleHSource',
    RuleHSource_1: 'RuleHSource_1',
    RuleHFnCallWParens: 'RuleHFnCallWParens',
    RuleHUnaryPropertyGet: 'RuleHUnaryPropertyGet',
    RuleHOldStyleFnNonNullary: 'RuleHOldStyleFnNonNullary',
    RuleHOldStyleFnNullaryOrNullaryPropGet: 'RuleHOldStyleFnNullaryOrNullaryPropGet',
    RuleHGenericFunctionCall: 'RuleHGenericFunctionCall',
    RuleFnCallNumberOf: 'RuleFnCallNumberOf',
    RuleFnCallNumberOf_1: 'RuleFnCallNumberOf_1',
    RuleFnCallNumberOf_5: 'RuleFnCallNumberOf_5',
    RuleFnCallNumberOf_6: 'RuleFnCallNumberOf_6',
    RuleFnCallNumberOf_7: 'RuleFnCallNumberOf_7',
    RuleFnCallNumberOf_8: 'RuleFnCallNumberOf_8',
    RuleFnCallNumberOf_9: 'RuleFnCallNumberOf_9',
    RuleFnCallThereIs: 'RuleFnCallThereIs',
    RuleAnyPropertyVal: 'RuleAnyPropertyVal',
    RuleExpr: 'RuleExpr',
    RuleLvl1Expression: 'RuleLvl1Expression',
    RuleLvl2Expression: 'RuleLvl2Expression',
    RuleLvl3Expression: 'RuleLvl3Expression',
    RuleLvl4Expression: 'RuleLvl4Expression',
    RuleLvl5Expression: 'RuleLvl5Expression',
    RuleLvl6Expression: 'RuleLvl6Expression',
    RuleAndOrOr: 'RuleAndOrOr',
    RuleContainsOrGreaterLessEqual: 'RuleContainsOrGreaterLessEqual',
    RuleIsExpression: 'RuleIsExpression',
    RuleBuiltinCmdAdd: 'RuleBuiltinCmdAdd',
    RuleBuiltinCmdAnswer: 'RuleBuiltinCmdAnswer',
    RuleBuiltinCmdAsk: 'RuleBuiltinCmdAsk',
    RuleBuiltinCmdBeep: 'RuleBuiltinCmdBeep',
    RuleBuiltinCmdVpccalluntrappablechoose: 'RuleBuiltinCmdVpccalluntrappablechoose',
    RuleBuiltinCmdClick: 'RuleBuiltinCmdClick',
    RuleBuiltinCmdDelete: 'RuleBuiltinCmdDelete',
    RuleBuiltinCmdDial: 'RuleBuiltinCmdDial',
    RuleBuiltinCmdDisable: 'RuleBuiltinCmdDisable',
    RuleBuiltinCmdDivide: 'RuleBuiltinCmdDivide',
    RuleBuiltinCmdVpccalluntrappabledomenu: 'RuleBuiltinCmdVpccalluntrappabledomenu',
    RuleBuiltinCmdDrag: 'RuleBuiltinCmdDrag',
    RuleHBuiltinCmdDrag_1: 'RuleHBuiltinCmdDrag_1',
    RuleBuiltinCmdEnable: 'RuleBuiltinCmdEnable',
    RuleBuiltinCmdVpccalluntrappableerrordialog: 'RuleBuiltinCmdVpccalluntrappableerrordialog',
    RuleBuiltinCmdHide: 'RuleBuiltinCmdHide',
    RuleBuiltinCmdLock: 'RuleBuiltinCmdLock',
    RuleBuiltinCmdMark: 'RuleBuiltinCmdMark',
    RuleBuiltinCmdMultiply: 'RuleBuiltinCmdMultiply',
    RuleBuiltinCmdPlay: 'RuleBuiltinCmdPlay',
    RuleBuiltinCmdPut: 'RuleBuiltinCmdPut',
    RuleBuiltinCmdReset: 'RuleBuiltinCmdReset',
    RuleBuiltinCmdReplace: 'RuleBuiltinCmdReplace',
    RuleBuiltinCmdSelect: 'RuleBuiltinCmdSelect',
    RuleBuiltinCmdSet: 'RuleBuiltinCmdSet',
    RuleBuiltinCmdShow: 'RuleBuiltinCmdShow',
    RuleBuiltinCmdSort: 'RuleBuiltinCmdSort',
    RuleBuiltinCmdStart: 'RuleBuiltinCmdStart',
    RuleBuiltinCmdStop: 'RuleBuiltinCmdStop',
    RuleBuiltinCmdSubtract: 'RuleBuiltinCmdSubtract',
    RuleBuiltinCmdUnlock: 'RuleBuiltinCmdUnlock',
    RuleBuiltinCmdVisual: 'RuleBuiltinCmdVisual',
    RuleBuiltinCmdWait: 'RuleBuiltinCmdWait',
    RuleCmdSend: 'RuleCmdSend',
    RuleInternalCmdRequestEval: 'RuleInternalCmdRequestEval',
    RuleInternalCmdUserHandler: 'RuleInternalCmdUserHandler',
    tkStringLiteral: 'tkStringLiteral',
    tkBlockComment: 'tkBlockComment',
    tkLineComment: 'tkLineComment',
    tkContinuedLineOrWhiteSpace: 'tkContinuedLineOrWhiteSpace',
    tkCardAtEndOfLine: 'tkCardAtEndOfLine',
    tkBgAtEndOfLine: 'tkBgAtEndOfLine',
    tkStackAtEndOfLine: 'tkStackAtEndOfLine',
    tkNewLine: 'tkNewLine',
    tkSyntaxMark: 'tkSyntaxMark',
    tkNumLiteral: 'tkNumLiteral',
    tkStack: 'tkStack',
    tkBg: 'tkBg',
    tkBgPlural: 'tkBgPlural',
    tkCard: 'tkCard',
    tkCardPlural: 'tkCardPlural',
    tkBtn: 'tkBtn',
    tkBtnPlural: 'tkBtnPlural',
    tkFld: 'tkFld',
    tkFldPlural: 'tkFldPlural',
    tkPart: 'tkPart',
    tkPartPlural: 'tkPartPlural',
    tkProductName: 'tkProductName',
    tkAdjective: 'tkAdjective',
    tkOrdinal: 'tkOrdinal',
    tkPosition: 'tkPosition',
    tkChunkGranularity: 'tkChunkGranularity',
    tkInOnly: 'tkInOnly',
    tkOfOnly: 'tkOfOnly',
    tkA: 'tkA',
    _not: '_not',
    _there: '_there',
    _is: '_is',
    _no: '_no',
    _and: '_and',
    _or: '_or',
    _contains: '_contains',
    _within: '_within',
    _the: '_the',
    _message: '_message',
    _window: '_window',
    _windows: '_windows',
    _box: '_box',
    _me: '_me',
    _recent: '_recent',
    _back: '_back',
    _forth: '_forth',
    _marked: '_marked',
    _to: '_to',
    _menuItem: '_menuItem',
    _menu: '_menu',
    _id: '_id',
    _number: '_number',
    _selection: '_selection',
    _target: '_target',
    tkComma: 'tkComma',
    tkLParen: 'tkLParen',
    tkRParen: 'tkRParen',
    tkPlusOrMinus: 'tkPlusOrMinus',
    tkMultDivideExpDivMod: 'tkMultDivideExpDivMod',
    tkStringConcat: 'tkStringConcat',
    tkGreaterOrLessEqualOrEqual: 'tkGreaterOrLessEqualOrEqual',
    tkUnaryVipercardProperties: 'tkUnaryVipercardProperties',
    tkAllUnaryPropertiesIfNotAlready: 'tkAllUnaryPropertiesIfNotAlready',
    tkAllNullaryOrUnaryPropertiesIfNotAlready: 'tkAllNullaryOrUnaryPropertiesIfNotAlready',
    tkIdentifier: 'tkIdentifier',
}

/* generated code, any changes above this point will be lost: --------------- */

Object.freeze(alsoReservedWordsList);

export type ChvITk = chevrotain.IToken;
export type ChvITkType = chevrotain.ITokenConfig;

listOfAllWordLikeTokens['+'] = tks.tkPlusOrMinus;
listOfAllWordLikeTokens['-'] = tks.tkPlusOrMinus;
listOfAllWordLikeTokens['('] = tks.tkLParen;
listOfAllWordLikeTokens[')'] = tks.tkRParen;
listOfAllWordLikeTokens['<'] = tks.tkGreaterOrLessEqualOrEqual;
listOfAllWordLikeTokens['<='] = tks.tkGreaterOrLessEqualOrEqual;
listOfAllWordLikeTokens['>'] = tks.tkGreaterOrLessEqualOrEqual;
listOfAllWordLikeTokens['>='] = tks.tkGreaterOrLessEqualOrEqual;
listOfAllWordLikeTokens['=='] = tks.tkGreaterOrLessEqualOrEqual;
listOfAllWordLikeTokens['\n'] = tks.tkNewLine;
listOfAllWordLikeTokens['%SYNPLACEHOLDER%'] = tks.tkSyntaxMark;
listOfAllWordLikeTokens['%MARK%'] = tks.tkSyntaxMark;

/**
 * when re-writing syntax, sometimes we want to construct a token, and make it
 * look just as if it had come from the lexer.
 * use this class to build a fake token based on a real token
 */
export const BuildFakeTokens = /* static class */ {
    strSyntaxMark: Util512.repeat(9, '?').join(''),
    /**
     * make a syntax marker token
     */
    makeSyntaxMarker(basis: chevrotain.IToken, whichMarker = '') {
        if (whichMarker === ',') {
            return this.make(basis, tks.tkComma);
        } else if (whichMarker === '') {
            return this.make(basis, tks.tkSyntaxMark);
        } else {
            assertTrue(false, '8]|expected "" or ","', whichMarker);
        }
    },

    /**
     * make an arbitrary token, pass in the constructor
     */
    make(basis: chevrotain.IToken, type: chevrotain.TokenType) {
        let image = getKnownImages()[type.name];
        assertTrue(trueIfDefinedAndNotNull(image), '8@|image is undefined', type.name);
        return this.makeTk(basis, type, image);
    },

    /**
     * make a string literal
     */
    makeStringLiteral(basis: chevrotain.IToken, unquoted: string) {
        return this.makeTk(basis, tks.tkStringLiteral, '"' + unquoted + '"');
    },

    /**
     * implementation
     */
    makeTk(basis: chevrotain.IToken, type: chevrotain.TokenType, image: string) {
        let cloned = cloneToken(basis);
        cloned.image = image;
        cloned.endOffset = cloned.startOffset + image.length;
        cloned.endColumn = trueIfDefinedAndNotNull(cloned.startColumn) ? cloned.startColumn + image.length : undefined;
        cloned.endLine = cloned.startLine;
        cloned.tokenType = type;
        assertTrue(trueIfDefinedAndNotNull(type.tokenTypeIdx), 'does not have a idx yet?', type.name);
        cloned.tokenTypeIdx = type.tokenTypeIdx;
        return cloned;
    }
};

const knownImages: { [tkname: string]: string } = {};
function getKnownImages() {
    if (!knownImages[tks.tkNewLine.name]) {
        knownImages[tks.tkNewLine.name] = '\n';
        knownImages[tks.tkComma.name] = ',';
        knownImages[tks.tkSyntaxMark.name] = BuildFakeTokens.strSyntaxMark;
    }

    return knownImages
}

