
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
alsoReservedWordsList['backgrounds'] = true;
alsoReservedWordsList['bkgnd'] = true;
alsoReservedWordsList['bkgnds'] = true;
alsoReservedWordsList['bg'] = true;
alsoReservedWordsList['bgs'] = true;
alsoReservedWordsList['card'] = true;
alsoReservedWordsList['cards'] = true;
alsoReservedWordsList['cd'] = true;
alsoReservedWordsList['cds'] = true;
alsoReservedWordsList['button'] = true;
alsoReservedWordsList['buttons'] = true;
alsoReservedWordsList['btn'] = true;
alsoReservedWordsList['btns'] = true;
alsoReservedWordsList['field'] = true;
alsoReservedWordsList['fields'] = true;
alsoReservedWordsList['fld'] = true;
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
alsoReservedWordsList['pattern'] = true;
alsoReservedWordsList['tool'] = true;
alsoReservedWordsList['scroll'] = true;
alsoReservedWordsList['fatbits'] = true;
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
alsoReservedWordsList['box'] = true;
alsoReservedWordsList['me'] = true;
alsoReservedWordsList['target'] = true;
alsoReservedWordsList['recent'] = true;
alsoReservedWordsList['back'] = true;
alsoReservedWordsList['forth'] = true;
alsoReservedWordsList['marked'] = true;
alsoReservedWordsList['to'] = true;
alsoReservedWordsList['menuitem'] = true;
alsoReservedWordsList['menu'] = true;
alsoReservedWordsList['id'] = true;
alsoReservedWordsList['number'] = true;
alsoReservedWordsList['selection'] = true;

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
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkBgOrPlural: chevrotain.createToken({
        name: 'tkBgOrPlural',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkCardOrPlural: chevrotain.createToken({
        name: 'tkCardOrPlural',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkBtnOrPlural: chevrotain.createToken({
        name: 'tkBtnOrPlural',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkFldOrPlural: chevrotain.createToken({
        name: 'tkFldOrPlural',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkPartOrPlural: chevrotain.createToken({
        name: 'tkPartOrPlural',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkTopObject: chevrotain.createToken({
        name: 'tkTopObject',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkAdjective: chevrotain.createToken({
        name: 'tkAdjective',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkOtherWindowType: chevrotain.createToken({
        name: 'tkOtherWindowType',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkOrdinal: chevrotain.createToken({
        name: 'tkOrdinal',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkPosition: chevrotain.createToken({
        name: 'tkPosition',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkChunkGranularity: chevrotain.createToken({
        name: 'tkChunkGranularity',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkInOnly: chevrotain.createToken({
        name: 'tkInOnly',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    tkOfOnly: chevrotain.createToken({
        name: 'tkOfOnly',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _not: chevrotain.createToken({
        name: '_not',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _there: chevrotain.createToken({
        name: '_there',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _is: chevrotain.createToken({
        name: '_is',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _no: chevrotain.createToken({
        name: '_no',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _and: chevrotain.createToken({
        name: '_and',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _or: chevrotain.createToken({
        name: '_or',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _contains: chevrotain.createToken({
        name: '_contains',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _within: chevrotain.createToken({
        name: '_within',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _the: chevrotain.createToken({
        name: '_the',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _message: chevrotain.createToken({
        name: '_message',
        pattern: /(?:item(?![a-zA-Z0-9_]))|(?:item(?![a-zA-Z0-9_]))/i
    }),
    _window: chevrotain.createToken({
        name: '_window',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _box: chevrotain.createToken({
        name: '_box',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _me: chevrotain.createToken({
        name: '_me',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _target: chevrotain.createToken({
        name: '_target',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _recent: chevrotain.createToken({
        name: '_recent',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _back: chevrotain.createToken({
        name: '_back',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _forth: chevrotain.createToken({
        name: '_forth',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _marked: chevrotain.createToken({
        name: '_marked',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _to: chevrotain.createToken({
        name: '_to',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _menuItem: chevrotain.createToken({
        name: '_menuItem',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _menu: chevrotain.createToken({
        name: '_menu',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _id: chevrotain.createToken({
        name: '_id',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _number: chevrotain.createToken({
        name: '_number',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
    }),
    _selection: chevrotain.createToken({
        name: '_selection',
        pattern: /(?:item(?![a-zA-Z0-9_]))/i
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
        pattern: /(?:item)|(?:item)/i
    }),
    tkMultDivideExpDivMod: chevrotain.createToken({
        name: 'tkMultDivideExpDivMod',
        pattern: /(?:item)|(?:item)|(?:item)|(?:item)|(?:item)/i
    }),
    tkStringConcat: chevrotain.createToken({
        name: 'tkStringConcat',
        pattern: /(?:item)|(?:item)/i
    }),
    tkGreaterOrLessEqualOrEqual: chevrotain.createToken({
        name: 'tkGreaterOrLessEqualOrEqual',
        pattern: /(?:item)|(?:item)|(?:item)|(?:item)|(?:item)|(?:item)|(?:item)|(?:item)/i
    }),
    tkIdentifier: chevrotain.createToken({
        name: 'tkIdentifier',
        pattern: /[a-zA-Z][0-9a-zA-Z_]*/i
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
    tks.tkBgOrPlural,
    tks.tkCardOrPlural,
    tks.tkBtnOrPlural,
    tks.tkFldOrPlural,
    tks.tkPartOrPlural,
    tks.tkTopObject,
    tks.tkAdjective,
    tks.tkOtherWindowType,
    tks.tkOrdinal,
    tks.tkPosition,
    tks.tkChunkGranularity,
    tks.tkInOnly,
    tks.tkOfOnly,
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
    tks.tkIdentifier
];

/* generated code, any changes above this point will be lost: --------------- */

Object.freeze(alsoReservedWordsList);
Object.freeze(tks);
Object.freeze(allVpcTokens);
