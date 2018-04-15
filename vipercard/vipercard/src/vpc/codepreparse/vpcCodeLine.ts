
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { VpcLineCategory } from '../../vpc/codepreparse/vpcPreparseCommon.js';

/* see comment at the top of _vpcAllCode_.ts for an overview */

/**
 * a line of code.
 * can span multiple user-typed lines if the \ escape across lines,
 * the offset to the user-typed source code is offset
 */
export class VpcCodeLine {
    /* unique id for this line */
    readonly lineId: number;

    /* first token of the code in the line */
    readonly firstToken: ChvIToken;

    /* parsing entry point */
    protected parseRule: O<Function>;

    /* list of tokens, if any, that should be sent to parser */
    excerptToParse: ChvIToken[] = [];

    /* category */
    ctg = VpcLineCategory.Invalid;

    /* other associated lines, e.g. end repeat links to the initial repeat */
    blockInfo: O<VpcCodeLineReference[]>;

    /* represent the line joined into a string */
    allImages: O<string>;

    /* holds all tokens in the line, nulled out when not needed to save memory */
    tmpEntireLine: O<ChvIToken[]>;

    /* the actual offset in the user-typed source code ('error on line 234') */
    offset = -1;

    /**
     * make an instance
     */
    public constructor(lineId: number, line: ChvIToken[]) {
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
            for (let tk of this.tmpEntireLine) {
                this.allImages += tk.image;
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
