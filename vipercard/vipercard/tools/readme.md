
* Describing the tools in `./vipercard/tools`:
* `add-assert-markers`
    * Adds unique markers to asserts
    * So, if a user sees an assert saying for example `q6i` we can grep the codebase and pinpoint the location
    * Markers are also shown for script errors, in the details
* `genparse`
    * Creates a chevrotain parser out of a bnf-style input file
    * Can also auto-create some visitor-methods
    * Can also generate a list of tokens, an interface, and more
* `set_tsconfig_flavor`
    * We use a different tsconfig file for development and prod, this script selects the right one.
* `prettier-except-long-imports`
    * Runs `prettier` on all code
    * Leaves long import lines at the top of a file intact.
    * Runs several other checks that test for long comments/strings, unsafe null coalesce, unreferenced tests, loose-typed arrays, non-regex replace, and more.
    * Can automatically insert `longstr()` to help breaking up long strings.
    * You can specify a subset of the files to have longer line lengths
    * How to run it: `npm run prettierexceptlongimports` or Ctrl-Shift-B in vscode
* `typescript-super-auto-import`
    * Automatically add `import()` statements for exported symbols.
    * Can auto-insert copyright header.
    * Checks for duplicate exports.
    * Ensures correct layering order (files mustn't directly call code from a higher module) based on `layers.cfg`
    * How to run it: `npm run autoimportmodules` or Ctrl-Shift-B in vscode


