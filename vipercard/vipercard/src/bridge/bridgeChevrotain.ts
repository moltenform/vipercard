
/* [chevrotain](https://github.com/SAP/chevrotain)
it seems like the best way to use the chevrotain typings,
when potentially building as es6 modules,
is to add a reference in the "types" section of tsconfig.json.
doesn't need any modifications to the .d.ts
so I don't need a bridge file here, code can reference
`chevrotain.createToken` and it magically works.

this library is bundled into externalmanualbundle.js and exists on globalThis

in the past I had to have a custom chevrotain build because
I made a change to avoid a call to new Function(); this has since been fixed. */
