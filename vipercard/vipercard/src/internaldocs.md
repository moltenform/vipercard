


## Code Compilation + Execution

A description of how ViperCard compiles and executes scripts.
```
Done on a per-script basis.
Part 1: processing
    Run lexer, getting a list of tokens
    SplitIntoLinesAndMakeLowercase yields one line at a time
    We'll then process these lines.
    We do pre-processing before handing to the parser,
    one reason being that the ViperCard language has dozens
    of unquoted terms, and it would be unwieldly if they were
    all different tokens, so it's best to transform in software,
    for example to add quotes or to add 'syntax markers'
    that tell the parser that this term isn't just a variable,
    it's part of the syntax.

    processing steps include:
    making tokens lower-case, since the language is case insensitive,

    SyntaxRewriter rewrites syntax for some lines:
    1) To minimize number of tokens needed in the lexer (for faster lexing)
        for example:
        ask line 2 of x with "defaultText"
        we could make 'with' a token so that it wouldn't get lumped into the expression
            line 2 of x.
        but we want to minimze number of tokens.
        so instead, during codepreparse, if the command is ask, replace any tokens
            that are exactly 'with'.
        ask line 2 of x $syntaxmarker$ "defaultText"
        a $syntaxmarker$ is never part of an expression, and so the parser has no difficulty.
    2) Transform "repeat with x=1 to 5" into a "repeat while" loop with same functionality
    3) To simplify parsing for a few commands
    4) To expand custom function calls in an expression
        We don't want a custom function call inside an expression, because the custom
        fn call could take an arbitrarily long time to run, and we can't pause
        execution halfway through evaling an expression. We also want evalling an
        expression to be a pure function with no side effects (which we
        enforce by providing it with an interface that has readonly methods).
        So, if a function call occurs inside an expression, we pull it outside:

        put 2 * mycustomfunc(5 + mycustomfunc(7 + sin(x))) into x
            -->
        mycustomfunc(7 + sin(x))
        put the result into tmp001
        put 2 * mycustomfunc(5 + tmp001) into x
            -->
        mycustomfunc(7 + sin(x))
        put the result into tmp001
        mycustomfunc(5 + tmp001)
        put the result into tmp002
        put 2 * tmp002 into x

    Next, DetermineCategory determines if a line is a syntax element like "end repeat"
    If the syntax element has an expression to evaluate, put the expression into the
    line's excerptToParse. Otherwise, we can skip running the parser entirely on the line,
    for better perf.
    Run BranchProcessing so that syntax elements like "end repeat" see where to jump
        to the corresponding "repeat"
    Run BranchProcessing to confirm hierarchical structure: an "else" must appear in
        a valid "if", "end myHandler" must follow "on myHandler"

    Finally everything gets put into a list of CodeLines.
    Each line has an offset, and loops work by the if statement containing a list
    of offsets where it can tell the interpreter to jump to.
    The list of code is put in a VpcCodeCollection, and then cached.

Part 2: execution
    when you say, click on a button, the message is added to a queue.
    code execution will then see the message in the queue and create a
    framestack for it. each frame stores local variables and the current line offset,
    so it can move from line to line. when calling a function, a frame is
    pushed onto the stack. when returning from a function, the frame
    is popped from the stack, so that we'll continue running the caller's code.
    when the last frame is popped, we know we're done.

    Code execution walks line-by-line through the list, running one line at a time
    It checks the type of the line:
        If there is no expression to be parsed, run the line and continue (such as
            onMouseUp or end repeat)
        Else if there is an expression to be parsed, see if it is in the
            cache of parsed lines, and use that if possible, otherwise run the parser.
        Take the CST (tree of parsed data) and pass it to the Visitor to evaluate it.
            for expressions, visiting evaluates and returns a single VpcVal value
            for commands, visiting creates a IntermedMapOfIntermedVals object
                which code execution can easily see the results of.
    We don't run the script continuously, we frequently let other events/ui drawing
        occur. this also saves us if the user writes an infinite loop.
        the scheduler will call into us again in a few milliseconds.
    If the stack of execution frames is empty, we've completed the script.
```
## Call-method-by-name

```
I often use enums to call into a method on a class. For example, in
the class VelResolveReference I have methods goBtn() goFld() goCard()
and so on, but searching for the string goBtn(), the method doesn't
seem to ever be called.

I use callAsMethodOnClass, which turns VpcElType.Btn to the string
"Btn", forms the string "goBtn", finds a method of that name on
the class, and calls it. That way I don't need any switch statement,
if-thens, or table of function pointers, it saves space and effort!

```
## Source code layers

* We make sure that every `.ts` file is strictly ordered into a layer. Code in lower layers cannot call directly call code in a higher layer.
* This prevents circular dependencies and encourages good non-monolithic design.
* It also ensures that test code can be cleanly cut away from product code; by making test code live above product code, the product code is unable to have any dependencies on it.
* Layers are specified in `layers.cfg` and enforced by the `super-auto-import` python script.
* For cases where lower code needs to call into higher code, it can do so indirectly with so-called "dependency inversion". This can be a simple callback function, or for more structured callbacks, an interface.
* For example: when a script executes code, it makes sense for this to be a low-level module depending only on the parser. Certain commands, though, need to interact with the UI and cause changes to it. If script execution were above the UI, though, this wouldn't really be right, because UI actions need to cause script execution to run.
    * We can solve this situation elegantly by creating an interface called `OutsideWorld`. 
    * First, the interface is defined. The interface can be defined at a very low level, since it has no implementation. The methods on the interface are all semantically meaningful, instead of exposing data structures they provide actions like `WriteToMessageBox()`, `GetCurrentTool()`, and `CountElements()`.
    * Then, script execution is written to act on an instance that implements the interface. As a side benefit, test code can verify script execution by providing a controlled and monitored implementation of the interface. The interface can even be split into read-only methods and read-write methods, since parts of script execution like expression evaluation should be essentially idempotent.
    * Finally, in the higher UI layer, there is a `VpcOutsideImpl` class that fully implements the interface. In effect, the lower-level script execution code is calling up into higher UI code, but in a controlled and organized way.
* This type of organization is also useful for maintaining re-usability of lower layers. For example, it's easier to keep the `util512` layer free of ViperCard-specific functionality, and thus more re-usable for other projects, because it is kept lower than application code. 

## Rendering

* A Model-View-Presenter pattern is used
* From a thousand-foot perspective:
    * The models (for example ui512ElementButton) are basically inert buckets of data
        * The only logic they have is that when a property is changed, it sets a global flag that we need to draw something.
    * The view classes have methods that take a model and draw it to a canvas.
    * The presenter manages events and routes them to the correct action, which might cause changes to a model. It uses the view classes to draw the model onto the canvas.
* ViperCard elements aka Vels are built on top of UI512 elements aka Els. 
* The pattern is used twice - Vel models cause changes to UI512 models 
* Example - what happens when you click down onto a button:
    * mouse event is sent to a Presenter
    * the Presenter routes the event to mousedown handling
    * mousedown handling in vipercard sets the hilite on the Vel model to true
    * listeners on the Vel model record that "the hilite changed" and that we need a redraw
    * a very short time later, a drawframe tick occurs
    * the Presenter sees that the redraw flag is set, and goes through the changes. It calls vpcmodelrender, which maps the "hilite" property on the vel model to the "hilite" property on a  corresponding ui512 model, and sets it to true.
    * listeners on the UI512 model record that we need a full-redraw
    * a very short time later, a drawframe tick occurs
    * we notice that the need-full-redraw flag is set, so we draw everything again onto the canvas.

## Background objects

Background objects are tricky. For say bg fld when sharedtext is off, state (position) is shared, some state (contents) are unique per-card.

Confirmed in emulator that every bg field has shared fallback text for when sharedtext is set to true. Note that when the sharedtext is true, you can only edit the field contents when you go edit->background. When you transition from 
sharedtext on and off, it also preserves the per-card content. So each field must maintain both per-card and shared text. And the same for scrollposition.

We used to internally store things like this:

```
stack
    bg
        bg1
            bgparts
                bgfldA
                    contents#cardid1
                    contents#cardid2
                bgfldB
                    contents#cardid1
                    contents#cardid2
            cards
                cd1
                    cardparts
                        cdfldC
                            contents
                cd2
                    cardparts
                        cdfldD
                            contents
```
* PROS:
    * conceptually, there is only one bgflda, so makes sense to have only one field instance
    * no chance of diverged state where updating another object fails, no need to replicate changes. copy/paste card and duplicate card are simple.
    * faster, no replication
* CONS:
    * need to run maintenance and cleanup #card3 when card3 is deleted
    * need to remember to pass in the correct card context, which 99% of the time is the current card but sometimes isn't, which likely would lead to bugs.
    * would want to change vel api so that myFld.set('text', newText) cannot be accessed without providing a card id - and need to prevent it at compile time. requires wide code change.
    * eventually realized that this means nearly all object references need to be a (object, currentcard) tuple -- because depending on which card is the context, the state is different!

```
the final straw was this test: 
-- script of bg fld 1
on dofoo
  answer word 1 of me
end dofoo
-- and run these
send dofoo to bg fld 1 of cd 1
send dofoo to bg fld 1 of cd 2
-- they will get different results based on the accessed card...
-- so this means the script mechanism also needs to worry about 
```

New design:
```
stack
    bg
        bg1
            cards
                cd1
                    cardparts
                        bgfldA (linked to all other idbgfldA)
                        bgfldB (linked to all other idbgfldB)
                        cdfldC
                cd2
                    cardparts
                        bgfldA (linked to all other idbgfldA)
                        bgfldB (linked to all other idbgfldB)
                        cdfldD

(there are now many bgfldA instances)
```

* PROS:
    * don't need to pass a tuple of (object, cardid) everywhere.
    * having prop##cardid was inelegant anyways.
    * does need to change the .set() api, but it can be done easily (changes are mechanical, not thoughtful)
    * might simplify rendering code, since it won't need to listen to both cd and bg vel changes
        * also only the set() calls need to be changed, not the get() calls
* CONS:
    * more memory, slower because changes need to be replicated
    * when the user asks for the "id" of one of these, they won't get its true id.
    * copy/paste/duplicate card is more interesting

* note that in original product, a bg item can call script in current card,
* leading more support to my design where "bg" items do in a sense live on the current card
* in my "ownerOf" function, though, I'll still say that bg items belong to the bg because that's more useful.

## Pseudo-functions that refer to objects

* The original product has subtly complex behavior for these pseudo-functions.
* consider this:
    * make a field
    * type abc into the field
    * edit script of the fld, `on f answer the target end f`
    * on card 1, in msg box type `send f to cd fld 1`
    * the result is a string like `card field "myFld"`
    * edit script of the fld, `on f answer target end f`
    * on card 1, in msg box type `send f to cd fld 1`
    * the result is now `abc`, it's getting the contents
    * In my terminology, `the target` returns a string, but `target` returns a true object reference.
* consider this (even subtler):
    * make a background checkmark button across two cards
    * set the sharedhilite of the button to false
    * set the autohilite of the button to true
    * edit script of the button, `on f answer the hilite of the target end f`
    * on card 2 make the button checked
    * on card 1, in msg box type `send f to bg btn 1 of cd 2`
    * the result is `true`, it's reading as a true object
    * edit script of the button, `on f answer the hilite of (the target) end f`
    * on card 1, in msg box type `send f to bg btn 1 of cd 2`
    * the result is `false` - in this context, the parens cause `(the target)` to be treated as a function call that returns a string, and evaluating that string as an object leads to different results because the current card is still card 1!
* As far as I can tell, this is the behavior:
    * `me` returns a true object reference. (`answer me` gets fld contents.)
    * `target` returns a true object reference. (`answer target` gets fld contents.)
    * when setting/getting a property, `of the target` returns a true object reference. (`the hilite of the target` refers to the correct object.)
    * in all other instances, `the target` returns a string. (`answer the target` shows the name of the object. `the hilite of (the target)` disrupts the special case and is the same as saying `put the target into x; get hilite of x`, in which case `x` holds a normal string the same as any other string.)
    * `the owner of` returns a string. (`answer the owner of this cd` shows the name.)
* How we implement it:
    * It's mostly laid out in `bgrammar_01.ccc`
    * The catch is: how do we know when `the target` should not be a string?
    * the places I know of where it shouldn't be a string:
        * prop `get the {propname} of the target`
        * prop `set the {propname} of the target`
        * chunk prop `get the textstyle of char 3 of the target`
        * chunk prop `set the textstyle of char 3 of the target to bold`
    * implementation:
        * handle the first two cases in string-rewriting, `vpcRewritesGlobal.ts` to turn `the target` into `target`
        * handle the second two cases in parsing, see the `RuleHUnaryPropertyGet` visitor and `goSet()` in `execStatement.ts` 
        * possible alternate approach: special-case `the target` everywhere, so it's not a normal function call like it is now.


## Tools

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


## Exception handling

```
We don't want any exception to be accidentally swallowed silently.
It's not enough to just put an alert in assertTrue,
because this won't cover base javascript errors like null-dereference.
It's important to show errors visibly so not to silently fall into
a bad state, and also we can log into local storage.
So, EVERY TOP OF THE CALL STACK must catch errors and send them to respondUI512Error
This includes:
         events from the browser (e.g. via golly)
             make sure they are wrapped in trycatch
         onload callbacks
             for images, json, server requests, dynamic script loading
             look for "addEventListener" and "onload"
             make sure they are wrapped in showMsgIfExceptionThrown
         setinterval and settimeout. use eslint ban / ban to stop them.
             use syncToAsyncAfterPause instead
         all async code
             use syncToAsyncTransition
         placeCallbackInQueue
             already ok because it's under the drawframe event.
```








