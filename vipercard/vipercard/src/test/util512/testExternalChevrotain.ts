
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
import { assertTrue } from '../../ui512/utils/util512Assert';

let t = new SimpleUtil512TestCollection('testCollectionExternalChevrotain');
export let testCollectionExternalChevrotain = t;

const Identifier = chevrotain.createToken({ name: "Identifier", pattern: /[a-zA-Z]\w*/ })
// We specify the "longer_alt" property to resolve keywords vs identifiers ambiguity.
// See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
const Select = chevrotain.createToken({
    name: "Select",
    pattern: /SELECT/,
    longer_alt: Identifier
})
const From = chevrotain.createToken({
    name: "From",
    pattern: /FROM/,
    longer_alt: Identifier
})
const Where = chevrotain.createToken({
    name: "Where",
    pattern: /WHERE/,
    longer_alt: Identifier
})

const Comma = chevrotain.createToken({ name: "Comma", pattern: /,/ })

const Integer = chevrotain.createToken({ name: "Integer", pattern: /0|[1-9]\d*/ })

const GreaterThan = chevrotain.createToken({ name: "GreaterThan", pattern: />/ })

const LessThan = chevrotain.createToken({ name: "LessThan", pattern: /</ })

const WhiteSpace = chevrotain.createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: chevrotain.Lexer.SKIPPED
})

// note we are placing WhiteSpace first as it is very common thus it will speed up the lexer.
let allTokens = [
    WhiteSpace,
    // "keywords" appear before the Identifier
    Select,
    From,
    Where,
    Comma,
    // The Identifier must appear after the keywords because all keywords are valid identifiers.
    Identifier,
    Integer,
    GreaterThan,
    LessThan
]

class SelectParser extends chevrotain.CstParser {
    constructor() {
        super(allTokens)
        if (SelectParser.wasInited) {
            assertTrue(false, "note: probably intended to only create one instance")
        }
        SelectParser.wasInited = true
        this.performSelfAnalysis()
    }

    static wasInited = false

    public selectStatement = this.RULE("selectStatement", () => {
            this.SUBRULE(this.selectClause)
            this.SUBRULE(this.fromClause)
            this.OPTION(() => {
                this.SUBRULE(this.whereClause)
            })
        })

    public selectClause = this.RULE("selectClause", () => {
        this.CONSUME(Select)
        this.AT_LEAST_ONE_SEP({
            SEP: Comma,
            DEF: () => {
                this.CONSUME(Identifier)
            }
        })
    })

    public fromClause = this.RULE("fromClause", () => {
        this.CONSUME(From)
        this.CONSUME(Identifier)
    })

    public whereClause = this.RULE("whereClause", () => {
        this.CONSUME(Where)
        this.SUBRULE(this.expression)
    })

    // The "rhs" and "lhs" (Right/Left Hand Side) labels will provide easy
    // to use names during CST Visitor (step 3a).
    public expression = this.RULE("expression", () => {
        this.SUBRULE(this.atomicExpression, { LABEL: "lhs" })
        this.SUBRULE(this.relationalOperator)
        this.SUBRULE2(this.atomicExpression, { LABEL: "rhs" }) // note the '2' suffix to distinguish
        // from the 'SUBRULE(atomicExpression)'
        // 2 lines above.
    })

    public atomicExpression = this.RULE("atomicExpression", () => {
        this.OR([
            { ALT: () => this.CONSUME(Integer) },
            { ALT: () => this.CONSUME(Identifier) }
        ])
    })

    public relationalOperator = this.RULE("relationalOperator", () => {
        this.OR([
            { ALT: () => this.CONSUME(GreaterThan) },
            { ALT: () => this.CONSUME(LessThan) }
        ])
    })
}

t.test('TestExampleChevrotain', () => {
    let SelectLexer = new chevrotain.Lexer(allTokens);

    const parser = new SelectParser() // can only be inited once

    function parseInput(text:string) {
        const lexingResult = SelectLexer.tokenize(text)
        // "input" is a setter which will reset the parser's state.
        parser.input = lexingResult.tokens
        parser.selectStatement()

        if (parser.errors.length > 0) {
            throw new Error("sad sad panda, Parsing errors detected")
        }
    }

    const inputText = "SELECT column1 FROM table2"
    parseInput(inputText)
});

