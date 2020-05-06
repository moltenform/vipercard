


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

## Background objects

Background objects are tricky. For say bg fld when sharedtext is off, state (position) is shared, some state (contents) are unique per-card.

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
* CONS:
    * more memory, slower because changes need to be replicated
    * when the user asks for the "id" of one of these, they won't get its true id.



 
   








