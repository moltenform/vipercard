
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

let t = new SimpleUtil512TestCollection('testCollectionExternalChevrotain');
export let testCollectionExternalChevrotain = t;

t.test('TestExampleChevrotain', () => {
    let Identifier = chevrotain.createToken({ name: 'Identifier', pattern: /[a-zA-Z]\w*/ });
    let allTokens = [
        chevrotain.createToken({
            name: 'Select',
            pattern: /SELECT/,
            longer_alt: Identifier
        }),
        chevrotain.createToken({
            name: 'From',
            pattern: /FROM/,
            longer_alt: Identifier
        }),
        chevrotain.createToken({
            name: 'Where',
            pattern: /WHERE/,
            longer_alt: Identifier
        }),
        chevrotain.createToken({ name: 'Comma', pattern: /,/ }),
        Identifier, // The Identifier must appear after the keywords 
        // because all keywords are valid identifiers.
        chevrotain.createToken({ name: 'Integer', pattern: /0|[1-9]\d*/ }),
        chevrotain.createToken({ name: 'GreaterThan', pattern: />/ }),
        chevrotain.createToken({ name: 'LessThan', pattern: /</ }),
        chevrotain.createToken({
            name: 'WhiteSpace',
            pattern: /\s+/,
            group: chevrotain.Lexer.SKIPPED
        })
    ];
    let SelectLexer = new chevrotain.Lexer(allTokens);
    let inputText = 'SELECT column1 FROM table2';
    let lexingResult = SelectLexer.tokenize(inputText);
    let b = lexingResult;
});
