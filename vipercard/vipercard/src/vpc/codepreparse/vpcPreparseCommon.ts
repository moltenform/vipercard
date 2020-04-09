
/* auto */ import { CodeLimits } from './../vpcutils/vpcUtils';
/* auto */ import { ChvITk, isTkType, tks } from './../codeparse/vpcTokens';
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';

/**
 * make every symbol lowercase, because the language is case insensitive
 */
export class MakeLowerCase {
    go(tk: ChvITk) {
        if (tk.tokenType !== tks.tkStringLiteral) {
            tk.image = tk.image.toLowerCase();
        }
    }
}

/**
 * efficiently splits an array of tokens by line,
 * producing an iterator
 */
export class SplitIntoLinesAndMakeLowercase {
    index = 0;
    constructor(protected instream: ChvITk[], protected makeLower: MakeLowerCase) {}

    nextWithNewlines(): O<ChvITk[]> {
        let currentLine: ChvITk[] = [];
        let limit = new LoopLimit(CodeLimits.MaxTokensInLine, 'maxTokensInLine');
        while (limit.next()) {
            let tk = this.instream[this.index];
            this.index += 1;

            /* have we reached the end of the stream? */
            if (tk === undefined) {
                return currentLine.length ? currentLine : undefined;
            }

            if (isTkType(tk, tks.tkNewLine)) {
                return currentLine;
            } else {
                this.makeLower.go(tk);
                currentLine.push(tk);
            }
        }
        return undefined;
    }

    next(): O<ChvITk[]> {
        while (true) {
            let next = this.nextWithNewlines();
            if (next === undefined) {
                return undefined;
            } else if (next && next.length === 0) {
                continue; /* skip empty lines */
            } else if (next && next.length === 1 && isTkType(next[0], tks.tkNewLine)) {
                continue; /* skip only newlines */
            } else {
                return next;
            }
        }
    }
}

/**
 * every line of code is assigned a category
 */
export enum VpcLineCategory {
    __isUI512Enum = 1,
    Invalid,
    HandlerStart,
    HandlerEnd,
    HandlerExit,
    ProductExit,
    HandlerPass,
    ReturnExpr,
    IfStart,
    IfElsePlain,
    IfEnd,
    RepeatExit,
    RepeatNext,
    RepeatForever,
    RepeatEnd,
    DeclareGlobal,
    Statement,
    GoCardImpl,
    CallDynamic,
    CallHandler
}

/**
 * enforce an upper bound on the number of iterations in a loop
 */
export class LoopLimit {
    count: number;
    constructor(protected maxcount: number, protected msg = '') {
        this.count = maxcount;
    }

    next(): true {
        this.count--;
        if (this.count < 0) {
            throw makeVpcScriptErr(
                longstr(`5n|Unfortunately, we need to have
            limitations on scripts, in order to prevent denial of service.
                for ${this.msg}, the limit is ${this.maxcount}`)
            );
        }

        return true;
    }
}

/**
 * a line of code.
 * can span multiple user-typed lines if the \ escape across lines,
 * the offset to the user-typed source code is offset
 */
export class VpcCodeLine {
    /* unique id for this line */
    readonly lineId: number;

    /* first token of the code in the line */
    readonly firstToken: ChvITk;

    /* parsing entry point */
    protected parseRule: O<Function>;

    /* list of tokens, if any, that should be sent to parser */
    excerptToParse: ChvITk[] = [];

    /* category */
    ctg = VpcLineCategory.Invalid;

    /* other associated lines, e.g. end repeat links to the initial repeat */
    blockInfo: O<VpcCodeLineReference[]>;

    /* represent the line joined into a string */
    allImages: O<string>;

    /* holds all tokens in the line, nulled out when not needed to save memory */
    tmpEntireLine: O<ChvITk[]>;

    /* the actual offset in the user-typed source code ('error on line 234') */
    offset = -1;

    /**
     * make an instance
     */
    constructor(lineId: number, line: ChvITk[]) {
        this.lineId = lineId;
        this.firstToken = line[0];
        this.tmpEntireLine = line;
    }

    /**
     * get parser entry point
     */
    getParseRule() {
        return this.parseRule;
    }

    /**
     * set parser entry point
     */
    setParseRule(fn: O<Function>) {
        this.parseRule = fn;

        /* while we're here, let's store 'allImages' as a string
        we can later use the string to uniquely identify a parsed line of code
        and re-use the CST */
        assertTrue(this.tmpEntireLine && this.tmpEntireLine.length, `5)|invalid line`);
        if (fn && this.tmpEntireLine) {
            this.allImages = '';
            for (let i = 0, len = this.tmpEntireLine.length; i < len; i++) {
                this.allImages += this.tmpEntireLine[i].image;
                this.allImages += '~';
            }
        }
    }
}

/**
 * a weak reference to a line of code
 */
export class VpcCodeLineReference {
    readonly offset: number;
    readonly lineId: number;
    constructor(line: VpcCodeLine) {
        assertTrue(line.offset !== undefined && line.offset >= 0, '5t|invalid line');
        assertTrue(line.lineId !== undefined && line.lineId >= 0, '5s|invalid line');
        this.offset = line.offset;
        this.lineId = line.lineId;
    }
}

/**
 * RequestHandlerCall means to call a handler (and eval each argument)
 * RequestEval means to eval one expression
 */
export enum CodeSymbols {
    RequestHandlerCall = '$requesthandlercall',
    RequestEval = '$requesteval'
}

/**
 * some variable names can't be used because they are separate tokens in the lexer
 * since a variable name must be a TkIdentifier token, if you tried to do this,
 * you'd get a weird "syntax error" instead of just saying "you can't use this variable name"
 *
 * so let's do a few basic checks here to try to give you a better error message
 */
export function checkCommonMistakenVarNames(tk: O<ChvITk>) {
    checkThrow(!tk || !isTkType(tk, tks.tkAdjective), `8f|we don't support variables named "short", "long", etc`);

    checkThrow(!tk || !isTkType(tk, tks._contains), `Ji|we don't support variables named "contains"`);
    checkThrow(!tk || !isTkType(tk, tks._within), `8d|we don't support variables named "within"`);
    checkThrow(!tk || !isTkType(tk, tks._to), `8c|we don't support variables named "id"`);
    checkThrow(
        !tk || !isTkType(tk, tks.tkOrdinal),
        longstr(
            `Jh|we don't support variables with names like
            "first", "last", "second", "middle", "any"`,
            ''
        )
    );
    checkThrow(
        !tk || !isTkType(tk, tks.tkChunkGranularity),
        `Jg|we don't support variables with names like "char", "word", "item", "line"`
    );
    checkThrow(!tk || !isTkType(tk, tks.tkMultDivideExpDivMod), `Jf|we don't support variables with names like "div", "mod"`);
}
