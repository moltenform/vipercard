
/* auto */ import { O, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObject } from '../../ui512/utils/utils512.js';
/* auto */ import { CodeLimits, CountNumericId } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { isTkType, tks } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { VpcChvParser } from '../../vpc/codeparse/vpcParser.js';

/* see comment at the top of _vpcAllCode_.ts for an overview */

/**
 * make every symbol lowercase, because the language is case insensitive
 */
export class MakeLowerCase {
    go(tk: ChvIToken) {
        if (!isTkType(tk, tks.TokenTkstringliteral)) {
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
    constructor(protected instream: ChvIToken[], protected idGen: CountNumericId, protected makeLower: MakeLowerCase) {}

    nextWithNewlines(): O<ChvIToken[]> {
        let currentLine: ChvIToken[] = [];
        let limit = new LoopLimit(CodeLimits.MaxTokensInLine, 'maxTokensInLine');
        while (limit.next()) {
            let tk = this.instream[this.index];
            this.index += 1;

            /* have we reached the end of the stream? */
            if (tk === undefined) {
                return currentLine.length ? currentLine : undefined;
            }

            if (isTkType(tk, tks.TokenTknewline)) {
                return currentLine;
            } else {
                this.makeLower.go(tk);
                currentLine.push(tk);
            }
        }
    }

    next(): O<ChvIToken[]> {
        while (true) {
            let next = this.nextWithNewlines();
            if (next === undefined) {
                return undefined;
            } else if (next && next.length === 0) {
                continue; /* skip empty lines */
            } else if (next && next.length === 1 && isTkType(next[0], tks.TokenTknewline)) {
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
    IfElse,
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
 * map a builtin command to an initial parser rule
 */
export class MapBuiltinCmds extends MapKeyToObject<Function> {
    constructor(parser: VpcChvParser) {
        super();
        this.add('add', parser.RuleBuiltinCmdAdd);
        this.add('answer', parser.RuleBuiltinCmdAnswer);
        this.add('ask', parser.RuleBuiltinCmdAsk);
        this.add('beep', parser.RuleBuiltinCmdBeep);
        this.add('choose', parser.RuleBuiltinCmdChoose);
        this.add('click', parser.RuleBuiltinCmdClick);
        this.add('create', parser.RuleBuiltinCmdCreate);
        this.add('delete', parser.RuleBuiltinCmdDelete);
        this.add('disable', parser.RuleBuiltinCmdDisable);
        this.add('divide', parser.RuleBuiltinCmdDivide);
        this.add('drag', parser.RuleBuiltinCmdDrag);
        this.add('enable', parser.RuleBuiltinCmdEnable);
        this.add('get', parser.RuleBuiltinCmdGet);
        this.add('hide', parser.RuleBuiltinCmdHide);
        this.add('lock', parser.RuleBuiltinCmdLock);
        this.add('multiply', parser.RuleBuiltinCmdMultiply);
        this.add('play', parser.RuleBuiltinCmdPlay);
        this.add('put', parser.RuleBuiltinCmdPut);
        this.add('replace', parser.RuleBuiltinCmdReplace);
        this.add('reset', parser.RuleBuiltinCmdReset);
        this.add('set', parser.RuleBuiltinCmdSet);
        this.add('show', parser.RuleBuiltinCmdShow);
        this.add('sort', parser.RuleBuiltinCmdSort);
        this.add('subtract', parser.RuleBuiltinCmdSubtract);
        this.add('unlock', parser.RuleBuiltinCmdUnlock);
        this.add('visual', parser.RuleBuiltinCmdVisual);
        this.add('wait', parser.RuleBuiltinCmdWait);
        this.freeze();
    }
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
