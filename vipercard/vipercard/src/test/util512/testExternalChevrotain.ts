
/* auto */ import { getParsingObjects } from './../../vpc/codeparse/vpcVisitor';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollectionExternalChevrotain');
export let testCollectionExternalChevrotain = t;

const Identifier = chevrotain.createToken({ name: 'Identifier', pattern: /[a-zA-Z]\w*/ });
// We specify the "longer_alt" property to resolve keywords vs identifiers ambiguity.
// See: https://github.com/SAP/chevrotain/blob/master/
// examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
const Select = chevrotain.createToken({
    name: 'Select',
    pattern: /SELECT/,
    longer_alt: Identifier
});
const From = chevrotain.createToken({
    name: 'From',
    pattern: /FROM/,
    longer_alt: Identifier
});
const Where = chevrotain.createToken({
    name: 'Where',
    pattern: /WHERE/,
    longer_alt: Identifier
});

const Comma = chevrotain.createToken({ name: 'Comma', pattern: /,/ });

const Integer = chevrotain.createToken({ name: 'Integer', pattern: /0|[1-9]\d*/ });

const GreaterThan = chevrotain.createToken({ name: 'GreaterThan', pattern: />/ });

const LessThan = chevrotain.createToken({ name: 'LessThan', pattern: /</ });

const WhiteSpace = chevrotain.createToken({
    name: 'WhiteSpace',
    pattern: /\s+/,
    group: chevrotain.Lexer.SKIPPED
});

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
];

class SelectParser extends chevrotain.CstParser {
    constructor() {
        super(allTokens, {
            recoveryEnabled: false,
            outputCst: true,
            maxLookahead: 4 // better to set it definitely.
            // would set to 6 but it can get exponentially slower
            // and i think we'll get a warning if it's too small
        });

        this.performSelfAnalysis();
    }

    public selectStatement = this.RULE('selectStatement', () => {
        this.SUBRULE(this.selectClause);
        this.SUBRULE(this.fromClause);
        this.OPTION(() => {
            this.SUBRULE(this.whereClause);
        });
    });

    public selectClause = this.RULE('selectClause', () => {
        this.CONSUME(Select);
        this.AT_LEAST_ONE_SEP({
            SEP: Comma,
            DEF: () => {
                this.CONSUME(Identifier);
            }
        });
    });

    public fromClause = this.RULE('fromClause', () => {
        this.CONSUME(From);
        this.CONSUME(Identifier);
    });

    public whereClause = this.RULE('whereClause', () => {
        this.CONSUME(Where);
        this.SUBRULE(this.expression);
    });

    // The "rhs" and "lhs" (Right/Left Hand Side) labels will provide easy
    // to use names during CST Visitor (step 3a).
    public expression = this.RULE('expression', () => {
        this.SUBRULE(this.atomicExpression, { LABEL: 'lhs' });
        this.SUBRULE(this.relationalOperator);
        this.SUBRULE2(this.atomicExpression, { LABEL: 'rhs' });
        // note the '2' suffix to distinguish
        // from the 'SUBRULE(atomicExpression)'
        // 2 lines above.
    });

    public atomicExpression = this.RULE('atomicExpression', () => {
        this.OR([
            { ALT: () => this.CONSUME(Integer) },
            { ALT: () => this.CONSUME(Identifier) }
        ]);
    });

    public relationalOperator = this.RULE('relationalOperator', () => {
        this.OR([
            { ALT: () => this.CONSUME(GreaterThan) },
            { ALT: () => this.CONSUME(LessThan) }
        ]);
    });
}

// BaseVisitor constructors are accessed via a parser instance.
const parserInstance = new SelectParser();
const BaseSQLVisitor = parserInstance.getBaseCstVisitorConstructor();

class SQLToAstVisitor extends BaseSQLVisitor {
    constructor() {
        super();
        // The "validateVisitor" method is a helper utility which performs static analysis
        // to detect missing or redundant visitor methods
        this.validateVisitor();
    }

    selectStatement(ctx: any) {
        // "this.visit" can be used to visit non-terminals and will invoke the
        // correct visit method for the CstNode passed.
        const select = this.visit(ctx.selectClause);

        //  "this.visit" can work on either a CstNode or an Array of CstNodes.
        //  If an array is passed (ctx.fromClause is an array) it is equivalent
        //  to passing the first element of that array
        const from = this.visit(ctx.fromClause);

        // "whereClause" is optional, "this.visit" will ignore empty arrays (optional)
        const where = this.visit(ctx.whereClause);

        return {
            type: 'SELECT_STMT',
            selectClause: select,
            fromClause: from,
            whereClause: where
        };
    }

    selectClause(ctx: any) {
        // Each Terminal or Non-Terminal in a grammar rule are collected into
        // an array with the same name(key) in the ctx object.
        const columns = (ctx.Identifier as any[]).map(identToken => identToken.image);

        return {
            type: 'SELECT_CLAUSE',
            columns: columns
        };
    }

    fromClause(ctx: any) {
        const tableName = ctx.Identifier[0].image;

        return {
            type: 'FROM_CLAUSE',
            table: tableName
        };
    }

    whereClause(ctx: any) {
        const condition = this.visit(ctx.expression);

        return {
            type: 'WHERE_CLAUSE',
            condition: condition
        };
    }

    expression(ctx: any) {
        // Note the usage of the "rhs" and "lhs" labels defined in step 2 in the expression rule.
        const lhs = this.visit(ctx.lhs[0]);
        const operator = this.visit(ctx.relationalOperator);
        const rhs = this.visit(ctx.rhs[0]);

        return {
            type: 'EXPRESSION',
            lhs: lhs,
            operator: operator,
            rhs: rhs
        };
    }

    // these two visitor methods will return a string.
    atomicExpression(ctx: any) {
        if (ctx.Integer) {
            return ctx.Integer[0].image;
        } else {
            return ctx.Identifier[0].image;
        }
    }

    relationalOperator(ctx: any) {
        if (ctx.GreaterThan) {
            return ctx.GreaterThan[0].image;
        } else {
            return ctx.LessThan[0].image;
        }
    }
}

// Our visitor has no state, so a single instance is sufficient.
const toAstVisitorInstance = new SQLToAstVisitor();

t.test('TestExampleChevrotain', () => {
    // ensureOptimizations ensures the first-char can be found
    let SelectLexer = new chevrotain.Lexer(allTokens, { ensureOptimizations: true });

    function toAst(inputText: string) {
        // Lex
        const lexResult = SelectLexer.tokenize(inputText);
        parserInstance.input = lexResult.tokens;

        // Automatic CST created when parsing
        const cst = parserInstance.selectStatement();
        if (parserInstance.errors.length > 0) {
            throw Error(
                'Sad sad panda, parsing errors detected!\n' +
                    parserInstance.errors[0].message
            );
        }

        // Visit
        const ast = toAstVisitorInstance.visit(cst);
        return ast;
    }

    const inputText = 'SELECT column1 FROM table2';
    toAst(inputText);
});

function realParse(input: string) {
    // Lex
    let [lexer, parser, visitor] = getParsingObjects();
    let lexResult = lexer.tokenize(input);
    parser.input = lexResult.tokens;

    // Automatic CST created when parsing
    const cst = parser.RuleExpr();
    if (parser.errors.length > 0) {
        throw Error('got an error!\n' + parser.errors[0].message);
    }

    let a = 5;
    let b = a;

    // Visit
    const ast = visitor.visit(cst);
    return ast;
}

t.test('TestRealParser', () => {
    realParse('1 + 1');
});
