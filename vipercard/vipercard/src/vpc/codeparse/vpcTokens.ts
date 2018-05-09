
/* auto */ import { assertTrue, cAltProductName, cProductName } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ChvIToken, ChvLexer, ChvToken } from '../../vpc/codeparse/bridgeChv.js';

/**
 * allowed symbols fpr makeGreaterLessThanEqual
 */
export type TypeGreaterLessThanEqual = '=' | '==' | '<' | '>' | '<=' | '>=';

/**
 * a plain-JS object from the parser, the CST
 */
export type VpcParsed = any;

/**
 * when re-writing syntax, sometimes we need to construct a token, and make it
 * look as if it had come from the lexer.
 * use this class to build a fake token based on a real token
 */
export class BuildFakeTokens {
    readonly knownImages: { [tknumber: number]: string } = {};
    constructor() {
        this.knownImages[tokenType(tks.TokenTknewline)] = '\n';
        this.knownImages[tokenType(tks.TokenTkcomma)] = ',';
        this.knownImages[tokenType(tks.TokenTklparen)] = '(';
        this.knownImages[tokenType(tks.TokenTkrparen)] = ')';
        this.knownImages[tokenType(tks.TokenTo)] = 'to';
    }

    /**
     * make a syntax marker token
     */
    makeSyntaxMarker(basis: ChvIToken, whichMarker = '') {
        assertTrue(whichMarker === '' || whichMarker === ',', '8]|expected "" or ","');
        return whichMarker === ',' ? this.make(basis, tks.TokenTkcomma) : this.make(basis, tks.TokenTknewline);
    }

    /**
     * make a greater than, less than or equal token
     */
    makeGreaterLessThanEqual(basis: ChvIToken, symbols: TypeGreaterLessThanEqual) {
        return this.makeImpl(basis, tokenType(tks.TokenTkgreaterorlessequalorequal), symbols);
    }

    /**
     * make a plus or minus token
     */
    makePlusMinus(basis: ChvIToken, symbol: string) {
        assertTrue(symbol === '+' || symbol === '-', '8[|expected + or -');
        return this.makeImpl(basis, tokenType(tks.TokenTkplusorminus), symbol);
    }

    /**
     * make a numeric literal
     */
    makeNumLiteral(basis: ChvIToken, n: number) {
        return this.makeImpl(basis, tokenType(tks.TokenTknumliteral), n.toString());
    }

    /**
     * make a string literal
     */
    makeStrLiteral(basis: ChvIToken, s: string) {
        return this.makeImpl(basis, tokenType(tks.TokenTkstringliteral), '"' + s + '"');
    }

    /**
     * make an arbitrary token, pass in the constructor
     */
    make(basis: ChvIToken, ctr: { new (...args: any[]): any }) {
        let number = tokenType(ctr);
        let image = this.knownImages[number];
        assertTrue(image !== undefined, '8@|image is undefined');
        return this.makeImpl(basis, number, image);
    }

    /**
     * make a Tkidentifier
     */
    makeIdentifier(basis: ChvIToken, s: string) {
        return this.makeImpl(basis, tokenType(tks.TokenTkidentifier), s);
    }

    /**
     * implementation
     */
    protected makeImpl(basis: ChvIToken, n: number, image: string) {
        let cloned = cloneToken(basis);
        cloned.tokenClassName = 0;
        cloned.tokenType = n;
        cloned.image = image;
        cloned.endOffset = cloned.startOffset + image.length;
        return cloned;
    }
}

/**
 * get the type number from a token class
 */
export function tokenType(ctr: { new (...args: any[]): any }): number {
    /* tokenType is added by chevrotain at runtime */
    let tk = (ctr as any).tokenType;
    assertTrue(tk !== undefined && tk !== null, '8^|tk is null');
    return tk;
}

/**
 * is this token an instance of this token class?
 */
export function isTkType(tk: ChvIToken, ctr: { new (...args: any[]): any }) {
    return tk && tk.tokenType === tokenType(ctr);
}

/**
 * create an object cloning the token,
 * TestCloneToken will verify that no properties were missed
 */
export function cloneToken(tk: ChvIToken): ChvIToken {
    return {
        image: tk.image,
        startOffset: tk.startOffset,
        startLine: tk.startLine,
        startColumn: tk.startColumn,
        endOffset: tk.endOffset,
        endLine: tk.endLine,
        endColumn: tk.endColumn,
        isInsertedInRecovery: tk.isInsertedInRecovery,
        tokenType: tk.tokenType,
        tokenClassName: tk.tokenClassName
    };
}

/**
 * a list of disallowed variable names.
 * includes both actual tokens in the grammar and
 * tkidentifiers that we just don't want to be used as variable names
 */
export const alsoReservedWordsList: { [key: string]: boolean } = {
    /* current tokens that aren't in the list below */
    div: true,
    mod: true,
    a: true,
    an: true,
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
Object.freeze(alsoReservedWordsList);

/* generated code, any changes past this point will be lost: --------------- */

class TokenTkcomment extends ChvToken {
    static PATTERN = /--[^\n]*/;
    static GROUP = ChvLexer.SKIPPED;
}

class TokenTkcontinuedlineorwhitespace extends ChvToken {
    static PATTERN = /(?:[ \t]+)|(?:\\[ \t]*\n)/;
    static GROUP = ChvLexer.SKIPPED;
    static LINE_BREAKS = true;
}

class TokenTknewline extends ChvToken {
    static PATTERN = /\n+/;
    static LINE_BREAKS = true;
}

class TokenTknumliteral extends ChvToken {
    static PATTERN = /[0-9]+(\.[0-9]*)?(e[-+]?[0-9]+)?(?![a-zA-Z_])/;
}

class TokenTkstringliteral extends ChvToken {
    static PATTERN = /"[^"\n]*"/;
}

class TokenTkbkgndorpluralsyn extends ChvToken {
    static PATTERN = /(?:backgrounds?(?![a-zA-Z0-9_]))|(?:bkgnds?(?![a-zA-Z0-9_]))|(?:bgs?(?![a-zA-Z0-9_]))/i;
}

class TokenTkcardorpluralsyn extends ChvToken {
    static PATTERN = /(?:cards?(?![a-zA-Z0-9_]))|(?:cds?(?![a-zA-Z0-9_]))/i;
}

class TokenTkbtnorpluralsyn extends ChvToken {
    static PATTERN = /(?:buttons?(?![a-zA-Z0-9_]))|(?:btns?(?![a-zA-Z0-9_]))/i;
}

class TokenTkfldorpluralsyn extends ChvToken {
    static PATTERN = /(?:fields?(?![a-zA-Z0-9_]))|(?:flds?(?![a-zA-Z0-9_]))/i;
}

class TokenTkofonly extends ChvToken {
    static PATTERN = /(?:of(?![a-zA-Z0-9_]))/i;
}

class TokenTkinonly extends ChvToken {
    static PATTERN = /(?:in(?![a-zA-Z0-9_]))/i;
}

class TokenTkcharorwordoritemorlineorplural extends ChvToken {
    static PATTERN = /(?:characters?(?![a-zA-Z0-9_]))|(?:chars?(?![a-zA-Z0-9_]))|(?:words?(?![a-zA-Z0-9_]))|(?:items?(?![a-zA-Z0-9_]))|(?:lines?(?![a-zA-Z0-9_]))/i;
}

class TokenTkordinal extends ChvToken {
    static PATTERN = /(?:last(?![a-zA-Z0-9_]))|(?:mid(?![a-zA-Z0-9_]))|(?:middle(?![a-zA-Z0-9_]))|(?:any(?![a-zA-Z0-9_]))|(?:first(?![a-zA-Z0-9_]))|(?:second(?![a-zA-Z0-9_]))|(?:third(?![a-zA-Z0-9_]))|(?:fourth(?![a-zA-Z0-9_]))|(?:fifth(?![a-zA-Z0-9_]))|(?:sixth(?![a-zA-Z0-9_]))|(?:seventh(?![a-zA-Z0-9_]))|(?:eighth(?![a-zA-Z0-9_]))|(?:ninth(?![a-zA-Z0-9_]))|(?:tenth(?![a-zA-Z0-9_]))/i;
}

class TokenTkadjective extends ChvToken {
    static PATTERN = /(?:long(?![a-zA-Z0-9_]))|(?:short(?![a-zA-Z0-9_]))|(?:abbreviated(?![a-zA-Z0-9_]))|(?:abbrev(?![a-zA-Z0-9_]))|(?:abbr(?![a-zA-Z0-9_]))/i;
}

class TokenTkmultdivideexpdivmod extends ChvToken {
    static PATTERN = /(?:\*)|(?:\/)|(?:\^)|(?:div(?![a-zA-Z0-9_]))|(?:mod(?![a-zA-Z0-9_]))/i;
}

class TokenTkgreaterorlessequalorequal extends ChvToken {
    static PATTERN = /(?:<>)|(?:>=?)|(?:<=?)|(?:!=)|(?:==?)/i;
}

class TokenTkconcatdoubleorsingle extends ChvToken {
    static PATTERN = /&&?/;
}

class TokenTkplusorminus extends ChvToken {
    static PATTERN = /(?:\+)|(?:-)/i;
}

class TokenTkcomma extends ChvToken {
    static PATTERN = /,/;
}

class TokenTklparen extends ChvToken {
    static PATTERN = /\(/;
}

class TokenTkrparen extends ChvToken {
    static PATTERN = /\)/;
}

class TokenThe extends ChvToken {
    static PATTERN = /the(?![a-zA-Z0-9_])/i;
}

class TokenTo extends ChvToken {
    static PATTERN = /to(?![a-zA-Z0-9_])/i;
}

class TokenStack extends ChvToken {
    static PATTERN = /stack(?![a-zA-Z0-9_])/i;
}

class TokenOr extends ChvToken {
    static PATTERN = /or(?![a-zA-Z0-9_])/i;
}

class TokenLength extends ChvToken {
    static PATTERN = /length(?![a-zA-Z0-9_])/i;
}

class TokenThere extends ChvToken {
    static PATTERN = /there(?![a-zA-Z0-9_])/i;
}

class TokenIs extends ChvToken {
    static PATTERN = /is(?![a-zA-Z0-9_])/i;
}

class TokenNot extends ChvToken {
    static PATTERN = /not(?![a-zA-Z0-9_])/i;
}

class TokenAnd extends ChvToken {
    static PATTERN = /and(?![a-zA-Z0-9_])/i;
}

class TokenContains extends ChvToken {
    static PATTERN = /contains(?![a-zA-Z0-9_])/i;
}

class TokenId extends ChvToken {
    static PATTERN = /id(?![a-zA-Z0-9_])/i;
}

class TokenWithin extends ChvToken {
    static PATTERN = /within(?![a-zA-Z0-9_])/i;
}

class TokenNumber extends ChvToken {
    static PATTERN = /number(?![a-zA-Z0-9_])/i;
}

class TokenTkidentifier extends ChvToken {
    static PATTERN = new RegExp('[a-zA-Z][0-9a-zA-Z_]*');
}

export const listTokens = [
    /* note: order matters here */
    TokenTkcomment,
    TokenTkcontinuedlineorwhitespace,
    TokenTknewline,
    TokenTknumliteral,
    TokenTkstringliteral,
    TokenTkbkgndorpluralsyn,
    TokenTkcardorpluralsyn,
    TokenTkbtnorpluralsyn,
    TokenTkfldorpluralsyn,
    TokenTkofonly,
    TokenTkinonly,
    TokenTkcharorwordoritemorlineorplural,
    TokenTkordinal,
    TokenTkadjective,
    TokenTkmultdivideexpdivmod,
    TokenTkgreaterorlessequalorequal,
    TokenTkconcatdoubleorsingle,
    TokenTkplusorminus,
    TokenTkcomma,
    TokenTklparen,
    TokenTkrparen,
    TokenThe,
    TokenTo,
    TokenStack,
    TokenOr,
    TokenLength,
    TokenThere,
    TokenIs,
    TokenNot,
    TokenAnd,
    TokenContains,
    TokenId,
    TokenWithin,
    TokenNumber,
    TokenTkidentifier
];

export const tks = {
    TokenTkcomment: TokenTkcomment,
    TokenTkcontinuedlineorwhitespace: TokenTkcontinuedlineorwhitespace,
    TokenTknewline: TokenTknewline,
    TokenTknumliteral: TokenTknumliteral,
    TokenTkstringliteral: TokenTkstringliteral,
    TokenTkbkgndorpluralsyn: TokenTkbkgndorpluralsyn,
    TokenTkcardorpluralsyn: TokenTkcardorpluralsyn,
    TokenTkbtnorpluralsyn: TokenTkbtnorpluralsyn,
    TokenTkfldorpluralsyn: TokenTkfldorpluralsyn,
    TokenTkofonly: TokenTkofonly,
    TokenTkinonly: TokenTkinonly,
    TokenTkcharorwordoritemorlineorplural: TokenTkcharorwordoritemorlineorplural,
    TokenTkordinal: TokenTkordinal,
    TokenTkadjective: TokenTkadjective,
    TokenTkmultdivideexpdivmod: TokenTkmultdivideexpdivmod,
    TokenTkgreaterorlessequalorequal: TokenTkgreaterorlessequalorequal,
    TokenTkconcatdoubleorsingle: TokenTkconcatdoubleorsingle,
    TokenTkplusorminus: TokenTkplusorminus,
    TokenTkcomma: TokenTkcomma,
    TokenTklparen: TokenTklparen,
    TokenTkrparen: TokenTkrparen,
    TokenThe: TokenThe,
    TokenTo: TokenTo,
    TokenStack: TokenStack,
    TokenOr: TokenOr,
    TokenLength: TokenLength,
    TokenThere: TokenThere,
    TokenIs: TokenIs,
    TokenNot: TokenNot,
    TokenAnd: TokenAnd,
    TokenContains: TokenContains,
    TokenId: TokenId,
    TokenWithin: TokenWithin,
    TokenNumber: TokenNumber,
    TokenTkidentifier: TokenTkidentifier
};

Object.freeze(tks);
Object.freeze(listTokens);

export const partialReservedWordsList: { [key: string]: boolean } = {
    abbr: true,
    abbrev: true,
    abbreviated: true,
    and: true,
    any: true,
    background: true,
    backgrounds: true,
    bg: true,
    bgs: true,
    bkgnd: true,
    bkgnds: true,
    btn: true,
    btns: true,
    button: true,
    buttons: true,
    card: true,
    cards: true,
    cd: true,
    cds: true,
    char: true,
    character: true,
    characters: true,
    chars: true,
    contains: true,
    eighth: true,
    field: true,
    fields: true,
    fifth: true,
    first: true,
    fld: true,
    flds: true,
    fourth: true,
    id: true,
    in: true,
    is: true,
    item: true,
    items: true,
    last: true,
    length: true,
    line: true,
    lines: true,
    long: true,
    mid: true,
    middle: true,
    ninth: true,
    not: true,
    number: true,
    of: true,
    or: true,
    second: true,
    seventh: true,
    short: true,
    sixth: true,
    stack: true,
    tenth: true,
    the: true,
    there: true,
    third: true,
    to: true,
    within: true,
    word: true,
    words: true
};

Object.freeze(partialReservedWordsList);

/* generated code, any changes above this point will be lost: --------------- */
