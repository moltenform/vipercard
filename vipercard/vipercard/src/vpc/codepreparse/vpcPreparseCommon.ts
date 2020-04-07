
/* auto */ import { CodeLimits, CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { BuildFakeTokens, ChvITk, isTkType, listOfAllWordLikeTokens, tks } from './../codeparse/vpcTokens';
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, last } from './../../ui512/utils/util512';

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
export class SplitIntoLinesProducer {
    index = 0;
    constructor(
        protected instream: ChvITk[],
        protected idGen: CountNumericId,
        protected makeLower: MakeLowerCase
    ) {}

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
    RepeatUntil,
    RepeatWhile,
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

    next() {
        this.count--;
        if (this.count < 0) {
            throw makeVpcScriptErr(`5n|Unfortunately, we need to have limitations on scripts, in order to prevent denial of service.
                for ${this.msg}, the limit is ${this.maxcount}`);
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
 * helps rewrite code
   example:
   `
    put %ARG0% into x
    put %ARG1% into $loopbound%UNIQUE%
    repeat
        if x >= $loopbound%UNIQUE% then
            exit repeat
        end if
        put x + 1 into x
        %SYNPLACEHOLDER%
        %ARGMANY%
    end repeat`
 */
export class VpcSuperRewrite {
    static CounterForUniqueNames = 1000;
    public static go(
        s: string,
        realTokenAsBasis: ChvITk,
        args: ChvITk[][],
        argMany?: ChvITk[][]
    ): ChvITk[][] {
        let ret: ChvITk[][] = [];
        VpcSuperRewrite.CounterForUniqueNames += 1;
        s = s.trim();
        s = s.replace(/%UNIQUE%/g, 'unique' + VpcSuperRewrite.CounterForUniqueNames);
        let lines = s.replace(/\r\n/g, '\n').split('\n');
        for (let line of lines) {
            if (line.trim() === '%ARGMANY%' && argMany) {
                Util512.extendArray(ret, argMany);
            } else {
                let terms = line.split(/\s+/);
                ret.push([]);
                for (let term of terms) {
                    VpcSuperRewrite.addTerm(ret, term, args, realTokenAsBasis);
                }
            }
        }
        return ret;
    }

    static addTerm(
        ret: ChvITk[][],
        term: string,
        args: ChvITk[][],
        realTokenAsBasis: ChvITk
    ) {
        if (term.startsWith('%ARG')) {
            checkThrowEq('%', term[term.length - 1], '')
            let sn = term.replace(/%ARG/g, '').replace(/%/g, '');
            let n = Util512.parseIntStrict(sn);
            checkThrow(
                typeof n === 'number' && n >= 0 && n < args.length,
                'internal error in template'
            );
            Util512.extendArray(last(ret), args[n]);
        } else {
            let newToken = VpcSuperRewrite.tokenFromEnglishTerm(term, realTokenAsBasis);
            last(ret).push(newToken);
        }
    }

    static tokenFromEnglishTerm(term: string, realTokenAsBasis: ChvITk) {
        let tktype = listOfAllWordLikeTokens[term];
        if (!tktype) {
            tktype = tks.tkIdentifier;
            checkThrow(
                term.match(/^[a-zA-Z][0-9a-zA-Z]*$/),
                'internal error in template, not a known symbol or valid tkidentifier'
            );
        }

        return BuildFakeTokens.inst.makeImpl(realTokenAsBasis, tktype, term);
    }

    static replaceEnglishTermTokenOnceWithEnglishTermToken(
        line: ChvITk[],
        realTokenAsBasis: ChvITk,
        term1: string,
        term2: string
    ) {
        let tk1 = VpcSuperRewrite.tokenFromEnglishTerm(term1, realTokenAsBasis);
        let index = line.findIndex(
            t => t.tokenType === tk1.tokenType && t.image === tk1.image
        );
        if (index !== -1) {
            let tk2 = VpcSuperRewrite.tokenFromEnglishTerm(term2, line[index]);
            line[index] = tk2;
            return true;
        }
        return false;
    }

    static searchTokenGivenEnglishTerm(
        line: ChvITk[],
        realTokenAsBasis: ChvITk,
        term: string
    ) {
        let tk1 = VpcSuperRewrite.tokenFromEnglishTerm(term, realTokenAsBasis);
        return line.findIndex(
            t => t.tokenType === tk1.tokenType && t.image === tk1.image
        );
    }

    static searchTokenGivenEnglishTermInParensLevel(
        wantedLevel: number,
        line: ChvITk[],
        realTokenAsBasis: ChvITk,
        term: string
    ) {
        let tk1 = VpcSuperRewrite.tokenFromEnglishTerm(term, realTokenAsBasis);
        let lvl = 0;
        for (let i = 0; i < line.length; i++) {
            let t = line[i];
            if (t.tokenType === tks.tkLParen) {
                lvl += 1;
            } else if (t.tokenType === tks.tkRParen) {
                lvl -= 1;
            } else if (
                t.tokenType === tk1.tokenType &&
                t.image === tk1.image &&
                lvl === wantedLevel
            ) {
                return i;
            }
        }
        return -1;
    }

    static generateUniqueVariable(realTokenAsBasis: ChvITk, prefix: string) {
        VpcSuperRewrite.CounterForUniqueNames += 1;
        let image = '$unique_' + prefix + VpcSuperRewrite.CounterForUniqueNames;
        return BuildFakeTokens.inst.makeImpl(realTokenAsBasis, tks.tkIdentifier, image);
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
