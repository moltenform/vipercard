
/* auto */ import { cAltProductName, cProductName } from './../../ui512/utils/util512Productname';
/* auto */ import { assertTrue, trueIfDefinedAndNotNull } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, last } from './../../ui512/utils/util512';

/**
 * when re-writing syntax, sometimes we want to construct a token, and make it
 * look just as if it had come from the lexer.
 * use this class to build a fake token based on a real token
 */
export class BuildFakeTokens {
    readonly knownImages: { [tkname: string]: string } = {};
    constructor() {
        this.knownImages[tks.tkNewLine.name] = '\n';
        this.knownImages[tks.tkComma.name] = ',';
        this.knownImages[tks.tkLParen.name] = '(';
        this.knownImages[tks.tkRParen.name] = ')';
        this.knownImages[tks.tkSyntaxPlaceholder.name] = Util512.repeat(99, '?').join('');
    }

    /**
     * make a syntax marker token
     */
    makeSyntaxMarker(basis: chevrotain.IToken, whichMarker = '') {
        if (whichMarker === '') {
            return this.make(basis, tks.tkComma);
        } else if (whichMarker === ',') {
            return this.make(basis, tks.tkSyntaxPlaceholder);
        } else {
            assertTrue(false, '8]|expected "" or ","', whichMarker);
        }
    }

    /**
     * make a greater than, less than or equal token
     */
    makeGreaterLessThanEqual(
        basis: chevrotain.IToken,
        symbols: TypeGreaterLessThanEqual
    ) {
        return this.makeImpl(basis, tks.tkGreaterOrLessEqualOrEqual, symbols);
    }

    /**
     * make a plus or minus token
     */
    makePlusMinus(basis: chevrotain.IToken, symbol: string) {
        assertTrue(symbol === '+' || symbol === '-', '8[|expected + or -');
        return this.makeImpl(basis, tks.tkPlusOrMinus, symbol);
    }

    /**
     * make a numeric literal
     */
    makeNumLiteral(basis: chevrotain.IToken, n: number) {
        return this.makeImpl(basis, tks.tkNumLiteral, n.toString());
    }

    /**
     * make a string literal
     */
    makeStrLiteral(basis: chevrotain.IToken, s: string) {
        return this.makeImpl(basis, tks.tkStringLiteral, '"' + s + '"');
    }

    /**
     * make an arbitrary token, pass in the constructor
     */
    make(basis: chevrotain.IToken, type: chevrotain.TokenType) {
        let image = this.knownImages[type.name];
        assertTrue(trueIfDefinedAndNotNull(image), '8@|image is undefined', type.name);
        return this.makeImpl(basis, type, image);
    }

    /**
     * make a Tkidentifier
     */
    makeIdentifier(basis: chevrotain.IToken, s: string) {
        return this.makeImpl(basis, tks.tkIdentifier, s);
    }

    /**
     * implementation
     */
    protected makeImpl(
        basis: chevrotain.IToken,
        type: chevrotain.TokenType,
        image: string
    ) {
        let cloned = cloneToken(basis);
        cloned.image = image;
        cloned.endOffset = cloned.startOffset + image.length;
        cloned.endColumn = trueIfDefinedAndNotNull(cloned.startColumn)
            ? cloned.startColumn + image.length
            : undefined;
        cloned.endLine = cloned.startLine;
        cloned.tokenType = type;
        assertTrue(
            trueIfDefinedAndNotNull(type.tokenTypeIdx),
            'does not have a idx yet?',
            type.name
        );
        cloned.tokenTypeIdx = type.tokenTypeIdx;
        return cloned;
    }
}

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
    /* current tokens that aren't in the list below */
    // a: true, we now allow this
    // an: true,
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
// we'll also add to this list during genparse, see below

/* check_long_lines_silence_subsequent */

/* generated code, any changes past this point will be lost: --------------- */

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
alsoReservedWordsList['eigth'] = true;
alsoReservedWordsList['ninth'] = true;
alsoReservedWordsList['tenth'] = true;
alsoReservedWordsList['this'] = true;
alsoReservedWordsList['prev'] = true;
alsoReservedWordsList['next'] = true;
alsoReservedWordsList['character'] = true;
alsoReservedWordsList['characters'] = true;
alsoReservedWordsList['char'] = true;
alsoReservedWordsList['chars'] = true;
alsoReservedWordsList['word'] = true;
alsoReservedWordsList['words'] = true;
alsoReservedWordsList['item'] = true;
alsoReservedWordsList['items'] = true;
alsoReservedWordsList['line'] = true;
alsoReservedWordsList['lines'] = true;
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
alsoReservedWordsList['target'] = true;
alsoReservedWordsList['recent'] = true;
alsoReservedWordsList['back'] = true;
alsoReservedWordsList['forth'] = true;
alsoReservedWordsList['marked'] = true;
alsoReservedWordsList['to'] = true;
alsoReservedWordsList['menuitem'] = true;
alsoReservedWordsList['menuitems'] = true;
alsoReservedWordsList['menu'] = true;
alsoReservedWordsList['id'] = true;
alsoReservedWordsList['number'] = true;
alsoReservedWordsList['selection'] = true;
alsoReservedWordsList['autohilite'] = true;
alsoReservedWordsList['autoselect'] = true;
alsoReservedWordsList['autotab'] = true;
alsoReservedWordsList['bottom'] = true;
alsoReservedWordsList['bottomright'] = true;
alsoReservedWordsList['cantabort'] = true;
alsoReservedWordsList['cantdelete'] = true;
alsoReservedWordsList['cantmodify'] = true;
alsoReservedWordsList['cantpeek'] = true;
alsoReservedWordsList['checkmark'] = true;
alsoReservedWordsList['commandchar'] = true;
alsoReservedWordsList['dontsearch'] = true;
alsoReservedWordsList['dontwrap'] = true;
alsoReservedWordsList['enabled'] = true;
alsoReservedWordsList['family'] = true;
alsoReservedWordsList['fixedlineheight'] = true;
alsoReservedWordsList['freesize'] = true;
alsoReservedWordsList['height'] = true;
alsoReservedWordsList['hilite'] = true;
alsoReservedWordsList['icon'] = true;
alsoReservedWordsList['left'] = true;
alsoReservedWordsList['location'] = true;
alsoReservedWordsList['locktext'] = true;
alsoReservedWordsList['markchar'] = true;
alsoReservedWordsList['menumessage'] = true;
alsoReservedWordsList['multiplelines'] = true;
alsoReservedWordsList['name'] = true;
alsoReservedWordsList['owner'] = true;
alsoReservedWordsList['partnumber'] = true;
alsoReservedWordsList['rectangle'] = true;
alsoReservedWordsList['reporttemplates'] = true;
alsoReservedWordsList['right'] = true;
alsoReservedWordsList['script'] = true;
alsoReservedWordsList['scroll'] = true;
alsoReservedWordsList['sharedhilite'] = true;
alsoReservedWordsList['sharedtext'] = true;
alsoReservedWordsList['showlines'] = true;
alsoReservedWordsList['showname'] = true;
alsoReservedWordsList['showpict'] = true;
alsoReservedWordsList['size'] = true;
alsoReservedWordsList['style'] = true;
alsoReservedWordsList['textalign'] = true;
alsoReservedWordsList['titlewidth'] = true;
alsoReservedWordsList['top'] = true;
alsoReservedWordsList['topleft'] = true;
alsoReservedWordsList['visible'] = true;
alsoReservedWordsList['widemargins'] = true;
alsoReservedWordsList['width'] = true;
alsoReservedWordsList['zoomed'] = true;
alsoReservedWordsList['scriptinglanguage'] = true;
alsoReservedWordsList['textfont'] = true;
alsoReservedWordsList['textheight'] = true;
alsoReservedWordsList['textsize'] = true;
alsoReservedWordsList['textstyle'] = true;
alsoReservedWordsList['version'] = true;

export const tks = {
    tkStringLiteral: chevrotain.createToken({
        name: 'tkStringLiteral',
        pattern: /"[^"\n]*"(?![a-zA-Z0-9_])/i
    }),
    tkBlockComment: chevrotain.createToken({
        name: 'tkBlockComment',
        pattern: /--\[\[[^\x5d]+\x5d/i,
        group: chevrotain.Lexer.SKIPPED,
        line_breaks: true
    }),
    tkLineComment: chevrotain.createToken({
        name: 'tkLineComment',
        pattern: /--[^\n]*/i,
        group: chevrotain.Lexer.SKIPPED
    }),
    tkContinuedLineOrWhiteSpace: chevrotain.createToken({
        name: 'tkContinuedLineOrWhiteSpace',
        pattern: /(?:[ \t]+)|(?:[\\\xC2][ \t]*\n)/i,
        group: chevrotain.Lexer.SKIPPED,
        line_breaks: true
    }),
    tkCardAtEndOfLine: chevrotain.createToken({
        name: 'tkCardAtEndOfLine',
        pattern: /(?:card|cd)(?=\s*\n)/i
    }),
    tkBgAtEndOfLine: chevrotain.createToken({
        name: 'tkBgAtEndOfLine',
        pattern: /(?:background|bkgnd|bg)(?=\s*\n)/i
    }),
    tkStackAtEndOfLine: chevrotain.createToken({
        name: 'tkStackAtEndOfLine',
        pattern: /stack(?=\s*\n)/i
    }),
    tkNewLine: chevrotain.createToken({
        name: 'tkNewLine',
        pattern: /\n+/i,
        line_breaks: true
    }),
    tkSyntaxPlaceholder: chevrotain.createToken({
        name: 'tkSyntaxPlaceholder',
        pattern: /\?{99}/i
    }),
    tkNumLiteral: chevrotain.createToken({
        name: 'tkNumLiteral',
        pattern: /[0-9]+(?:\.[0-9]*)?(?:e[-+]?[0-9]+)?(?![a-zA-Z0-9_])/i
    }),
    tkStack: chevrotain.createToken({
        name: 'tkStack',
        pattern: /(?:stack(?![a-zA-Z0-9_]))/i
    }),
    tkBg: chevrotain.createToken({
        name: 'tkBg',
        pattern: /(?:background(?![a-zA-Z0-9_]))|(?:bkgnd(?![a-zA-Z0-9_]))|(?:bg(?![a-zA-Z0-9_]))/i
    }),
    tkBgPlural: chevrotain.createToken({
        name: 'tkBgPlural',
        pattern: /(?:backgrounds(?![a-zA-Z0-9_]))|(?:bkgnds(?![a-zA-Z0-9_]))|(?:bgs(?![a-zA-Z0-9_]))/i
    }),
    tkCard: chevrotain.createToken({
        name: 'tkCard',
        pattern: /(?:card(?![a-zA-Z0-9_]))|(?:cd(?![a-zA-Z0-9_]))/i
    }),
    tkCardPlural: chevrotain.createToken({
        name: 'tkCardPlural',
        pattern: /(?:cards(?![a-zA-Z0-9_]))|(?:cds(?![a-zA-Z0-9_]))/i
    }),
    tkBtn: chevrotain.createToken({
        name: 'tkBtn',
        pattern: /(?:button(?![a-zA-Z0-9_]))|(?:btn(?![a-zA-Z0-9_]))/i
    }),
    tkBtnPlural: chevrotain.createToken({
        name: 'tkBtnPlural',
        pattern: /(?:buttons(?![a-zA-Z0-9_]))|(?:btns(?![a-zA-Z0-9_]))/i
    }),
    tkFld: chevrotain.createToken({
        name: 'tkFld',
        pattern: /(?:field(?![a-zA-Z0-9_]))|(?:fld(?![a-zA-Z0-9_]))/i
    }),
    tkFldPlural: chevrotain.createToken({
        name: 'tkFldPlural',
        pattern: /(?:fields(?![a-zA-Z0-9_]))|(?:flds(?![a-zA-Z0-9_]))/i
    }),
    tkPart: chevrotain.createToken({
        name: 'tkPart',
        pattern: /(?:part(?![a-zA-Z0-9_]))/i
    }),
    tkPartPlural: chevrotain.createToken({
        name: 'tkPartPlural',
        pattern: /(?:parts(?![a-zA-Z0-9_]))/i
    }),
    tkTopObject: chevrotain.createToken({
        name: 'tkTopObject',
        pattern: /(?:hypercard(?![a-zA-Z0-9_]))|(?:vipercard(?![a-zA-Z0-9_]))/i
    }),
    tkAdjective: chevrotain.createToken({
        name: 'tkAdjective',
        pattern: /(?:long(?![a-zA-Z0-9_]))|(?:short(?![a-zA-Z0-9_]))|(?:abbrev(?![a-zA-Z0-9_]))|(?:abbr(?![a-zA-Z0-9_]))|(?:abbreviated(?![a-zA-Z0-9_]))/i
    }),
    tkOrdinal: chevrotain.createToken({
        name: 'tkOrdinal',
        pattern: /(?:last(?![a-zA-Z0-9_]))|(?:mid(?![a-zA-Z0-9_]))|(?:middle(?![a-zA-Z0-9_]))|(?:any(?![a-zA-Z0-9_]))|(?:first(?![a-zA-Z0-9_]))|(?:second(?![a-zA-Z0-9_]))|(?:third(?![a-zA-Z0-9_]))|(?:fourth(?![a-zA-Z0-9_]))|(?:fifth(?![a-zA-Z0-9_]))|(?:sixth(?![a-zA-Z0-9_]))|(?:seventh(?![a-zA-Z0-9_]))|(?:eigth(?![a-zA-Z0-9_]))|(?:ninth(?![a-zA-Z0-9_]))|(?:tenth(?![a-zA-Z0-9_]))/i
    }),
    tkPosition: chevrotain.createToken({
        name: 'tkPosition',
        pattern: /(?:this(?![a-zA-Z0-9_]))|(?:prev(?![a-zA-Z0-9_]))|(?:next(?![a-zA-Z0-9_]))/i
    }),
    tkChunkGranularity: chevrotain.createToken({
        name: 'tkChunkGranularity',
        pattern: /(?:characters?(?![a-zA-Z0-9_]))|(?:chars?(?![a-zA-Z0-9_]))|(?:words?(?![a-zA-Z0-9_]))|(?:items?(?![a-zA-Z0-9_]))|(?:lines?(?![a-zA-Z0-9_]))/i
    }),
    tkInOnly: chevrotain.createToken({
        name: 'tkInOnly',
        pattern: /(?:in(?![a-zA-Z0-9_]))/i
    }),
    tkOfOnly: chevrotain.createToken({
        name: 'tkOfOnly',
        pattern: /(?:of(?![a-zA-Z0-9_]))/i
    }),
    tkA: chevrotain.createToken({
        name: 'tkA',
        pattern: /(?:a(?![a-zA-Z0-9_]))|(?:an(?![a-zA-Z0-9_]))/i
    }),
    _not: chevrotain.createToken({
        name: '_not',
        pattern: /(?:not(?![a-zA-Z0-9_]))/i
    }),
    _there: chevrotain.createToken({
        name: '_there',
        pattern: /(?:there(?![a-zA-Z0-9_]))/i
    }),
    _is: chevrotain.createToken({
        name: '_is',
        pattern: /(?:is(?![a-zA-Z0-9_]))/i
    }),
    _no: chevrotain.createToken({
        name: '_no',
        pattern: /(?:no(?![a-zA-Z0-9_]))/i
    }),
    _and: chevrotain.createToken({
        name: '_and',
        pattern: /(?:and(?![a-zA-Z0-9_]))/i
    }),
    _or: chevrotain.createToken({
        name: '_or',
        pattern: /(?:or(?![a-zA-Z0-9_]))/i
    }),
    _contains: chevrotain.createToken({
        name: '_contains',
        pattern: /(?:contains(?![a-zA-Z0-9_]))/i
    }),
    _within: chevrotain.createToken({
        name: '_within',
        pattern: /(?:within(?![a-zA-Z0-9_]))/i
    }),
    _the: chevrotain.createToken({
        name: '_the',
        pattern: /(?:the(?![a-zA-Z0-9_]))/i
    }),
    _message: chevrotain.createToken({
        name: '_message',
        pattern: /(?:msg(?![a-zA-Z0-9_]))|(?:message(?![a-zA-Z0-9_]))/i
    }),
    _window: chevrotain.createToken({
        name: '_window',
        pattern: /(?:window(?![a-zA-Z0-9_]))/i
    }),
    _windows: chevrotain.createToken({
        name: '_windows',
        pattern: /(?:windows(?![a-zA-Z0-9_]))/i
    }),
    _box: chevrotain.createToken({
        name: '_box',
        pattern: /(?:box(?![a-zA-Z0-9_]))/i
    }),
    _me: chevrotain.createToken({
        name: '_me',
        pattern: /(?:me(?![a-zA-Z0-9_]))/i
    }),
    _target: chevrotain.createToken({
        name: '_target',
        pattern: /(?:target(?![a-zA-Z0-9_]))/i
    }),
    _recent: chevrotain.createToken({
        name: '_recent',
        pattern: /(?:recent(?![a-zA-Z0-9_]))/i
    }),
    _back: chevrotain.createToken({
        name: '_back',
        pattern: /(?:back(?![a-zA-Z0-9_]))/i
    }),
    _forth: chevrotain.createToken({
        name: '_forth',
        pattern: /(?:forth(?![a-zA-Z0-9_]))/i
    }),
    _marked: chevrotain.createToken({
        name: '_marked',
        pattern: /(?:marked(?![a-zA-Z0-9_]))/i
    }),
    _to: chevrotain.createToken({
        name: '_to',
        pattern: /(?:to(?![a-zA-Z0-9_]))/i
    }),
    _menuItem: chevrotain.createToken({
        name: '_menuItem',
        pattern: /(?:menuitems?(?![a-zA-Z0-9_]))/i
    }),
    _menu: chevrotain.createToken({
        name: '_menu',
        pattern: /(?:menu(?![a-zA-Z0-9_]))/i
    }),
    _id: chevrotain.createToken({
        name: '_id',
        pattern: /(?:id(?![a-zA-Z0-9_]))/i
    }),
    _number: chevrotain.createToken({
        name: '_number',
        pattern: /(?:number(?![a-zA-Z0-9_]))/i
    }),
    _selection: chevrotain.createToken({
        name: '_selection',
        pattern: /(?:selection(?![a-zA-Z0-9_]))/i
    }),
    tkComma: chevrotain.createToken({
        name: 'tkComma',
        pattern: /,/i
    }),
    tkLParen: chevrotain.createToken({
        name: 'tkLParen',
        pattern: /\(/i
    }),
    tkRParen: chevrotain.createToken({
        name: 'tkRParen',
        pattern: /\)/i
    }),
    tkPlusOrMinus: chevrotain.createToken({
        name: 'tkPlusOrMinus',
        pattern: /(?:\+)|(?:-)/i
    }),
    tkMultDivideExpDivMod: chevrotain.createToken({
        name: 'tkMultDivideExpDivMod',
        pattern: /(?:\*)|(?:\/)|(?:\^)|(?:div(?![a-zA-Z0-9_]))|(?:mod(?![a-zA-Z0-9_]))/i
    }),
    tkStringConcat: chevrotain.createToken({
        name: 'tkStringConcat',
        pattern: /(?:&&)|(?:&)/i
    }),
    tkGreaterOrLessEqualOrEqual: chevrotain.createToken({
        name: 'tkGreaterOrLessEqualOrEqual',
        pattern: /(?:<>)|(?:>=?)|(?:<=?)|(?:!=)|(?:==?)|(?:\xB2)|(?:\xB3)|(?:\xAD)/i
    }),
    tkIdentifier: chevrotain.createToken({
        name: 'tkIdentifier',
        pattern: /[a-zA-Z][0-9a-zA-Z_]*/i
    }),
    tkAllUnaryPropertiesIfNotAlready: chevrotain.createToken({
        name: 'tkAllUnaryPropertiesIfNotAlready',
        pattern: /(?:autohilite(?![a-zA-Z0-9_]))|(?:autoselect(?![a-zA-Z0-9_]))|(?:autotab(?![a-zA-Z0-9_]))|(?:bottom(?![a-zA-Z0-9_]))|(?:bottomright(?![a-zA-Z0-9_]))|(?:cantabort(?![a-zA-Z0-9_]))|(?:cantdelete(?![a-zA-Z0-9_]))|(?:cantmodify(?![a-zA-Z0-9_]))|(?:cantpeek(?![a-zA-Z0-9_]))|(?:checkmark(?![a-zA-Z0-9_]))|(?:commandchar(?![a-zA-Z0-9_]))|(?:dontsearch(?![a-zA-Z0-9_]))|(?:dontwrap(?![a-zA-Z0-9_]))|(?:enabled(?![a-zA-Z0-9_]))|(?:family(?![a-zA-Z0-9_]))|(?:fixedlineheight(?![a-zA-Z0-9_]))|(?:freesize(?![a-zA-Z0-9_]))|(?:height(?![a-zA-Z0-9_]))|(?:hilite(?![a-zA-Z0-9_]))|(?:icon(?![a-zA-Z0-9_]))|(?:left(?![a-zA-Z0-9_]))|(?:location(?![a-zA-Z0-9_]))|(?:locktext(?![a-zA-Z0-9_]))|(?:markchar(?![a-zA-Z0-9_]))|(?:menumessage(?![a-zA-Z0-9_]))|(?:multiplelines(?![a-zA-Z0-9_]))|(?:name(?![a-zA-Z0-9_]))|(?:owner(?![a-zA-Z0-9_]))|(?:partnumber(?![a-zA-Z0-9_]))|(?:rectangle(?![a-zA-Z0-9_]))|(?:reporttemplates(?![a-zA-Z0-9_]))|(?:right(?![a-zA-Z0-9_]))|(?:script(?![a-zA-Z0-9_]))|(?:scroll(?![a-zA-Z0-9_]))|(?:sharedhilite(?![a-zA-Z0-9_]))|(?:sharedtext(?![a-zA-Z0-9_]))|(?:showlines(?![a-zA-Z0-9_]))|(?:showname(?![a-zA-Z0-9_]))|(?:showpict(?![a-zA-Z0-9_]))|(?:size(?![a-zA-Z0-9_]))|(?:style(?![a-zA-Z0-9_]))|(?:textalign(?![a-zA-Z0-9_]))|(?:titlewidth(?![a-zA-Z0-9_]))|(?:top(?![a-zA-Z0-9_]))|(?:topleft(?![a-zA-Z0-9_]))|(?:visible(?![a-zA-Z0-9_]))|(?:widemargins(?![a-zA-Z0-9_]))|(?:width(?![a-zA-Z0-9_]))|(?:zoomed(?![a-zA-Z0-9_]))/i
    }),
    tkAllNullaryOrUnaryPropertiesIfNotAlready: chevrotain.createToken({
        name: 'tkAllNullaryOrUnaryPropertiesIfNotAlready',
        pattern: /(?:scriptinglanguage(?![a-zA-Z0-9_]))|(?:textfont(?![a-zA-Z0-9_]))|(?:textheight(?![a-zA-Z0-9_]))|(?:textsize(?![a-zA-Z0-9_]))|(?:textstyle(?![a-zA-Z0-9_]))|(?:version(?![a-zA-Z0-9_]))/i
    })
};

export const allVpcTokens = [
    tks.tkStringLiteral,
    tks.tkBlockComment,
    tks.tkLineComment,
    tks.tkContinuedLineOrWhiteSpace,
    tks.tkCardAtEndOfLine,
    tks.tkBgAtEndOfLine,
    tks.tkStackAtEndOfLine,
    tks.tkNewLine,
    tks.tkSyntaxPlaceholder,
    tks.tkNumLiteral,
    tks.tkStack,
    tks.tkBg,
    tks.tkBgPlural,
    tks.tkCard,
    tks.tkCardPlural,
    tks.tkBtn,
    tks.tkBtnPlural,
    tks.tkFld,
    tks.tkFldPlural,
    tks.tkPart,
    tks.tkPartPlural,
    tks.tkTopObject,
    tks.tkAdjective,
    tks.tkOrdinal,
    tks.tkPosition,
    tks.tkChunkGranularity,
    tks.tkInOnly,
    tks.tkOfOnly,
    tks.tkA,
    tks._not,
    tks._there,
    tks._is,
    tks._no,
    tks._and,
    tks._or,
    tks._contains,
    tks._within,
    tks._the,
    tks._message,
    tks._window,
    tks._windows,
    tks._box,
    tks._me,
    tks._target,
    tks._recent,
    tks._back,
    tks._forth,
    tks._marked,
    tks._to,
    tks._menuItem,
    tks._menu,
    tks._id,
    tks._number,
    tks._selection,
    tks.tkComma,
    tks.tkLParen,
    tks.tkRParen,
    tks.tkPlusOrMinus,
    tks.tkMultDivideExpDivMod,
    tks.tkStringConcat,
    tks.tkGreaterOrLessEqualOrEqual,
    tks.tkIdentifier,
    tks.tkAllUnaryPropertiesIfNotAlready,
    tks.tkAllNullaryOrUnaryPropertiesIfNotAlready
];

/* generated code, any changes above this point will be lost: --------------- */

Object.freeze(alsoReservedWordsList);
Object.freeze(tks);
Object.freeze(allVpcTokens);
