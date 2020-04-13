
/* auto */ import { CodeLimits } from './../vpcutils/vpcUtils';
/* auto */ import { ChvITk, isTkType, tks } from './../codeparse/vpcTokens';
/* auto */ import { IVpcCodeLine, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { last, longstr } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
    IsInternalvpcmessagesdirective,
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
            checkThrow(false, 
                longstr(`5n|Unfortunately, we need to have
            limitations on scripts, in order to prevent denial of service.
                for ${this.msg}, the limit is ${this.maxcount}`)
            );
        }

        return true;
    }
}

export type ChvRuleFnType = (idxInCallingRule?: number, ...args: any[]) => chevrotain.CstNode;

/**
 * a line of code.
 * can span multiple user-typed lines if the \ escape across lines,
 * the offset to the user-typed source code is offset
 */
export class VpcCodeLine implements IVpcCodeLine {
    /* unique id for this line */
    readonly lineId: number;

    /* first token of the code in the line. useful to keep because
    it points to the current line, and stores original command in
    case transformations are done later. */
    readonly firstToken: ChvITk;

    /* parsing entry point */
    protected parseRule: O<ChvRuleFnType>;

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
    setParseRule(fn: O<ChvRuleFnType>) {
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

export class VpcCurrentParseStage {
    //~ static currentStage = VpcErrStage.
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
    if (!tk) {
        return;
    }
    if (
        tk.tokenType === tks._number ||
        tk.tokenType === tks.tkA ||
        tk.tokenType === tks.tkIdentifier ||
        tk.tokenType === tks.tkAllNullaryOrUnaryPropertiesIfNotAlready ||
        tk.tokenType === tks.tkAllUnaryPropertiesIfNotAlready
    ) {
        /* these ones we've explicitly said are ok variable names */
        return;
    }

    /* regex from "([^=]+)=OneOfWords\(([^)]+)\)" to
    checkThrow(tk.tokenType !== tks.\1, "we don't support variable names like \2");
    */
    checkThrow(tk.tokenType !== tks.tkStack, "we don't support variable names like stack");
    checkThrow(tk.tokenType !== tks.tkBg, "we don't support variable names like background,bkgnd,bg");
    checkThrow(tk.tokenType !== tks.tkBgPlural, "we don't support variable names like backgrounds,bkgnds,bgs");
    checkThrow(tk.tokenType !== tks.tkCard, "we don't support variable names like card,cd");
    checkThrow(tk.tokenType !== tks.tkCardPlural, "we don't support variable names like cards,cds");
    checkThrow(tk.tokenType !== tks.tkBtn, "we don't support variable names like button,btn");
    checkThrow(tk.tokenType !== tks.tkBtnPlural, "we don't support variable names like buttons,btns");
    checkThrow(tk.tokenType !== tks.tkFld, "we don't support variable names like field,fld");
    checkThrow(tk.tokenType !== tks.tkFldPlural, "we don't support variable names like fields,flds");
    checkThrow(tk.tokenType !== tks.tkPart, "we don't support variable names like part");
    checkThrow(tk.tokenType !== tks.tkPartPlural, "we don't support variable names like parts");
    checkThrow(tk.tokenType !== tks.tkTopObject, "we don't support variable names like hypercard,vipercard");
    checkThrow(tk.tokenType !== tks.tkAdjective, "we don't support variable names like long,short,abbrev,abbr,abbreviated");
    checkThrow(
        tk.tokenType !== tks.tkOrdinal,
        longstr(`we don't support variable names like last,
         mid,middle,any,first,second,third,fourth,fifth,
         sixth,seventh,eigth,ninth,tenth`)
    );
    checkThrow(tk.tokenType !== tks.tkPosition, "we don't support variable names like this,prev,next");
    checkThrow(
        tk.tokenType !== tks.tkChunkGranularity,
        "we don't support variable names like characters,chars,words,items,lines"
    );
    checkThrow(tk.tokenType !== tks.tkInOnly, "we don't support variable names like in");
    checkThrow(tk.tokenType !== tks.tkOfOnly, "we don't support variable names like of");
    checkThrow(tk.tokenType !== tks._not, "we don't support variable names like not");
    checkThrow(tk.tokenType !== tks._there, "we don't support variable names like there");
    checkThrow(tk.tokenType !== tks._is, "we don't support variable names like is");
    checkThrow(tk.tokenType !== tks._no, "we don't support variable names like no");
    checkThrow(tk.tokenType !== tks._and, "we don't support variable names like and");
    checkThrow(tk.tokenType !== tks._or, "we don't support variable names like or");
    checkThrow(tk.tokenType !== tks._contains, "we don't support variable names like contains");
    checkThrow(tk.tokenType !== tks._within, "we don't support variable names like within");
    checkThrow(tk.tokenType !== tks._the, "we don't support variable names like the");
    checkThrow(tk.tokenType !== tks._message, "we don't support variable names like msg,message");
    checkThrow(tk.tokenType !== tks._window, "we don't support variable names like window");
    checkThrow(tk.tokenType !== tks._windows, "we don't support variable names like windows");
    checkThrow(tk.tokenType !== tks._box, "we don't support variable names like box");
    checkThrow(tk.tokenType !== tks._me, "we don't support variable names like me");
    checkThrow(tk.tokenType !== tks._recent, "we don't support variable names like recent");
    checkThrow(tk.tokenType !== tks._back, "we don't support variable names like back");
    checkThrow(tk.tokenType !== tks._forth, "we don't support variable names like forth");
    checkThrow(tk.tokenType !== tks._marked, "we don't support variable names like marked");
    checkThrow(tk.tokenType !== tks._to, "we don't support variable names like to");
    checkThrow(tk.tokenType !== tks._menuItem, "we don't support variable names like menuitems?");
    checkThrow(tk.tokenType !== tks._menu, "we don't support variable names like menu");
    checkThrow(tk.tokenType !== tks._id, "we don't support variable names like id");
    checkThrow(tk.tokenType !== tks._number, "we don't support variable names like number");
    checkThrow(tk.tokenType !== tks._selection, "we don't support variable names like selection");
}
