
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { VpcLineCategory } from '../../vpc/codepreparse/vpcPreparseCommon.js';

export class VpcCodeLine {
    readonly lineId: number;
    readonly firstToken: ChvIToken;
    protected parseRule: O<Function>;
    excerptToParse: ChvIToken[] = [];
    ctg = VpcLineCategory.invalid;
    blockInfo: O<VpcCodeLineReference[]>;
    allImages: O<string>;
    tmpEntireLine: O<ChvIToken[]>;
    offset = -1;
    public constructor(lineId: number, line: ChvIToken[]) {
        this.lineId = lineId;
        this.firstToken = line[0];
        this.tmpEntireLine = line;
    }

    getParseRule() {
        return this.parseRule;
    }

    setParseRule(fn: O<Function>) {
        // we store 'allImages' as a string to cache ASTs.
        assertTrue(this.tmpEntireLine && this.tmpEntireLine.length, `5)|line ${this.offset}`);
        if (fn && this.tmpEntireLine) {
            this.allImages = '';
            for (let tk of this.tmpEntireLine) {
                this.allImages += tk.image;
                this.allImages += '~';
            }
        }

        this.parseRule = fn;
    }
}

export class VpcCodeLineReference {
    readonly offset: number;
    readonly lineid: number;
    constructor(line: VpcCodeLine) {
        assertTrue(line.offset !== undefined && line.offset >= 0, '5t|invalid line');
        assertTrue(line.lineId !== undefined && line.lineId >= 0, '5s|invalid line');
        this.offset = line.offset;
        this.lineid = line.lineId;
    }
}
