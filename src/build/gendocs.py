
from ben_python_common import *
import re
import json
sections = {}



sections['fundamentals'] = r'''

=====
Introduction
=====

If you are new, please see the Tutorial Screenshots first!
(From the Help menu, select Tutorial Screenshots...)


The documentation here is technical and unpolished;
it will be improved over time.

=====
Fundamentals
=====
All objects, including all buttons, fields, and cards, have an associated set of code called a "script."

Here is an example script:
`on mouseUp
    answer "hello, world"
end mouseUp`

If this script is placed in a button, and the Browse tool is chosen
(looks like a hand), the code will be run when the button is clicked.

A line of code beginning with -- is ignored.
This is often used to write explanatory comments.
It can also be used to temporarily "disable" some code.
You can press Ctrl-Q in the script editor to quickly
comment-out or uncomment a line.

`on mouseUp
    -- this line is a comment
    answer "hello, world"
end mouseUp`


Indentation is not mandatory, but it is recommended for clarity.
The code editor will automatically add indentation
whenever you press Enter.

Statements must appear on separate lines.

The language is not case sensitive. "on mouseup" and 
"on mouseUp" are equivalent.

A long line of code can be continued with a backslash, e.g.

`answer ("here is how to continue" & \
    "code across two lines")`

A common data type is a string (a sequence of text).

`put "abc" into x`

Double-quotes ("), not single-quotes ('), must be used.
A string with length 0, "", is perfectly valid and used often to 
represent a missing value. You may see this referred to as 
an 'empty string'. You can easily test for an empty string 
with code like:
`if x is "" then
    answer "empty string"
end if`

To include a double-quote character in a string, use the quote constant,

`answer (quote & "a" & quote) -- displays "a"`

Valid numbers include 123, 123.456, and scientific notation like 
1.23e6 which means 1.23 multiplied by (10 to the 6th power).
Numbers can be in the range [-1e18, 1e18], if a number is 
taken outside this range a runtime error will be thrown.
Division by zero, logarithm of a negative, and so on will also 
cause a runtime error.

`sqrt(0.5)` is a function call meaning to take the square root 
of 0.5. `sqrt` is a built-in function, but we can also write a 
user-defined function. `sum(1, 2)` is a function call that 
adds 1 and 2 and returns 3. A comma separates the 
values sent. Function calls can be nested, for example,
`sum(1, sum(2, 3))`.

Buttons and fields are referred to as "objects".
Cards are also a type of object.
And, the entire project, referred to as a "stack", is an object.

A script can set properties of an object with syntax like:
`set the width of cd btn "myBtn" to 450`
One can also refer to an object by id:
`set the width of cd btn id 1234 to 450`

See the "set" command documentation for a list of properties 
that can be set.

When you are in the Browse tool and you interact with the page 
by clicking on buttons or pressing keystrokes, this causes 
messages to be fired.

If you click a button, and if that button has a script that happens
to have a function called "on mouseUp" defined, then the code in
that function will be run.
    
=====
Expressions
=====

A set of computations such as `1+2+3+4` or 
`sqrt(0.5) + sqrt(0.6)` is an expression. Expressions can contain
any level of nested sub-expressions, for example,

`sqrt(0.5)
sqrt(0.5 + sqrt(0.6))
sqrt(0.5 + sqrt(0.6 + sqrt(0.7)))`
are all valid.

Parentheses are used to dictate the order of operations, since
`3*(4+5)`
gives a different answer than
`(3*4)+5`

Parentheses are also used for grouping an expression.
for example, we needed to get the (n + 1)th line of a 
variable, we would type `answer (line (n + 1) of x)`

Do not type something like
`answer (line n + 1 of x) -- this is hard to read.`
this is unclear, and will often cause syntax errors.

In the expression `2+3`, the `+` is called an operator.

Here are the operators that can be used.
`2 * 3`
	multiplication
`2 / 3`
	division
`2 $caret$ 3`
	raise to the third power
`7 div 5`
	truncated division
`7 mod 5`
	modulo
`2 > 3`
	greater than
`2 < 3`
	less than
`2 >= 3`
	greater than or equal to
`2 <= 3`
	less than or equal to
`2  ==  3`
	equal to
`2  !=  3`
	not equal to
`"abc" is "def"`
	equal to
`"abc" is not "def"`
	not equal to
`2 + 3`
	addition
`2 - 3`
	subtraction

`&` and `&&` combine two strings (concatenation).
`put "a" & "b" into x
answer x -- displays "ab"
put "a" && "b" into x
answer x -- displays "a b"`

^Logical operators^
the constants 'true' and 'false' are used often.
internally there is no distinct boolean type, but the strings 
"true" and "false" are interpreted as true and false respectively.
`true and false`
    logical and
`true or false`
    logical or
`not true`
    logical not

logical operations are not guaranteed to be short-circuiting.
in other words,
`put (true or myfunction()) into x`
still will call `myfunction`, when it hypothetically could have 
been skipped.

=====
Variables
=====

To introduce a variable, use the "put" command to place contents 
into it. Running `put 3 into x` is valid even if x has never been
used before.

If you try to read from a variable before it has been introduced, 
a runtime error will occur.

Variable names and function names are case insensitive.

Variable names cannot begin with a numeral, and can contain 
underscores but no other punctuation. Certain words cannot be 
used as variable names because they are already keywords 
or built-in functions. For example, you cannot have a variable 
named "line" because this is a keyword. You cannot have a 
variable named "result" because this is a built-in function.

Use "global" to declare a variable as a global.
1) it can be accessed from any other script
2) its contents are saved even after the function is complete.

A runtime error can be thrown if a variable has the wrong 
type, e.g.
`put "abc" into x
put 4 into y
put x + y into z`
The addition operator requires numbers, and so creates a 
runtime error when getting the string `"abc"`.

The functions
`strToNumber`
and
`numberToStr`
can be used to move back and forth.

Logical types must be either true or false.
`put (true and false) into x -- valid
put (true and 1) into x -- runtime error, expected true or false`

Numeric comparison understands equivalent representations, 
for example:
`put (456 is "456.00") into x -- true
put (456 is "00456.00") into x -- true`

A "point" data type is two numbers separated by a comma. 
This can save typing.
`set the left of cd btn "myBtn" to 10
set the top of cd btn "myBtn" to 20`
is equivalent to
`set the topleft of cd btn "myBtn" to "10, 20"`

=====
Structure
=====

^Scripts^
A script contains zero or more functions.
No code or declarations can exist outside of a function.


^Functions^
Functions look like this
    `on mouseup 
        answer "hello world"
    end mouseup`
or this
    `function myAddition p1, p2
        return p1 + p2
    end myAddition`

Nested functions are not currently supported.

^Loops^
`repeat with x = 1 to 3
    ...other code here...
end repeat`

Refer to `repeat` under "commands" for more information.

^If conditions^
`if x > 1 then
    ...other code here...
else
    ...other code here...
end if`
Refer to `if` under "commands" for more information.


^Statements^
Every statement has exactly one command.
For example, 
    `put sqrt(0.5) into x`
is a valid statement.
You cannot have a line that is just
    `sqrt(0.5)`
with no command, this is a syntax error.
    
Statements occur on separate lines, there's no way to cram 
more than one statement onto a line.
    
^Expressions^
A set of computations such as `1+2+3+4` or 
`sqrt(0.5) + sqrt(0.6)` is an expression. Most places that 
have a value can be given an expression, for example,
`go card 2
go card (x + 1)

put "abc" into cd fld "myFld"
put "abc" into cd fld (nameOfMyField & "Fld")

put "a" into line 4 of myList
put "a" into line (x+1) of myList

set the left of cd btn "myBtn" to x
set the left of cd btn (nameOfBtn) to (45 + 50 * cos(theta))
`


=====
Lists/arrays
=====

Here's a common way to create a list:

`put "" into myList
repeat with x = 1 to 5
    put 0 into line x of myList
end repeat`

How to append a number to the list:

`put newline & 20 after myList`

How to add 10 to each element of the list:

`repeat with x = 1 to the number of lines in myList
    put (line x of myList) + 10 into line x of myList
end repeat
`

`myList` is a normal variable, it can be passed as an 
argument and so on.

=====
Custom funcs
=====
Here is an example of how to define and call a custom function.
`function myAddition p1, p2
    return p1 + p2
end myAddition
on mouseUp
    put myAddition(1,2) into x
end mouseUp`

A current limitation is that custom functions can only be called 
from the "put" command or the "return" command.
For example, if there is a custom function myAddition,
    `put myAddition(4,5) into x`
is supported,
    `return myAddition(4,5)`
is supported,
but
    `set the width of cd btn "btn1" to myAddition(4,5)`
is not yet supported.

Recursion is supported.

You can define variadic functions (that accept any number of 
values), see the documentation for the paramCount() function.

No error is thrown if the incorrect number of arguments is given. 
Missing arguments are given the empty string ("").
`myAddition(7, 8, 9) -- the extra argument 9 is ignored
myAddition(7, 8) -- p1 is assigned 7, p2 is assigned 8
myAddition(7) -- p1 is assigned 7, p2 is assigned ""
myAddition() -- p1 is assigned "", p2 is assigned ""`

The message hierarchy:
Messages bubble upwards from an object, to the parent card, 
to the stack, until they are handled.
If you click on a button:
    A mouseUp message is created
    Script of the button is examined. 
    If there is an 'on mouseUp' handler,
        Run the code in the mouseUp handler.
        If the handler completes, stop running code, we're done.
        If the handler calls 'pass mouseUp', continue:
    Script of the current card is examined.
    If there is an 'on mouseUp' handler,
        Run the code in the mouseUp handler.
        If the handler completes, stop running code, we're done.
        If the handler calls 'pass mouseUp', continue:
    Script of the current stack is examined.
    If there is an 'on mouseUp' handler,
        Run the code in the mouseUp handler.

Similarly, if you are typing text in a field, and type the letter 'a':
    A afterKeyUp message is created
    Script of the current field is examined.
    If there is an 'on afterKeyUp' handler,
        Run the code in the afterKeyUp handler.
        If the handler completes, stop running code, we're done.
        If the handler calls 'pass afterKeyUp', continue:
    Script of the current card is examined.
    If there is an 'on afterKeyUp' handler,
        Run the code in the afterKeyUp handler.
        If the handler completes, stop running code, we're done.
        If the handler calls 'pass afterKeyUp', continue:
    Script of the current stack is examined.
    If there is an 'on afterKeyUp' handler,
        Run the code in the mouseUp handler.

See documentation of the 'pass' command for an example.

Calls to custom commands and procedures also bubble upwards 
in the same way. A function in the stack's script can be called 
from any handler on a card, field, or button. A function in the 
card's script can be called from any handler in a field or button.
So, it is useful to put commonly used utility code in a stack 
script so that it can be called from anywhere.
=====
Chunks
=====

We call a reference to a part of a container a "chunk". These 
examples demonstrate what can be done with chunk expressions:

`answer (char 2 of "abcd") -- displays "b"
answer (char 2 to 3 of "abcd") -- displays "bc"
answer (item 2 of "a,b,c,d") -- displays "b"
answer (item 2 to 3 of "a,b,c,d") -- displays "b,c"
answer (word 2 of "a b c d") -- displays "b"
answer (word 2 to 3 of "a b c d") -- displays "b c"
put "a" & newline & "b" & newline & "c" & newline into lines
answer (line 2 of lines) -- displays "b"
answer (line 2 to 3 of lines) -- displays "b" & newline & "c"

answer (first char of "abcd") -- displays "a"
answer (second char of "abcd") -- displays "b"
answer (any char of "abcd") -- displays a random choice
answer (middle char of "abcd") 
answer (last char of "abcd") 

put "x" into char 2 of "abcd"
put "x" into char 2 to 3 of "abcd"
put "x" into item 2 of "a,b,c,d"
put "x" into item 2 to 3 of "a,b,c,d"
put "x" into word 2 of "a b c d"
put "x" into word 2 to 3 of "a b c d"`

chunks can be nested arbitrarily, as in
`(char 2 of (char 2 to 3 of "abcd"))`
or
`(char (line 4 of myList) of "abcd")`

the itemdelimeter is "," by default but can be changed.
this can be helpful for simple parsing.
`put "abc|def|ghi" into x
set the itemdelimiter to "|"
answer (item 2 of x) -- displays "def"`



=====
Constants
=====
Use `newline` to refer to a new line character.
Let's say you wanted two lines of text in a field, you would use 
the following:
`put "first line" & newline & "second line" into cd fld "myFld"`

(You shouldn't have to be concerned with newline platform 
differences: the constants return, cr, linefeed are present for 
backwards compatibility, but they are are all mapped to \n ascii 
10 internally. If you are running windows, when you copy text 
we'll automatically convert to \r\n newlines so if you paste 
into notepad, it looks right.)

The following constants are defined:
`
pi
newline
tab
empty
quote
one
two
three
four
five
six
seven
eight
nine
ten
colon
comma
true
false
up
down
space
return
cr
formfeed
linefeed`

=====
Credits
=====

ViperCard
https://github.com/downpoured/vipercard
Copyright (C) 2018 Ben Fisher

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. 

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

ViperCard uses the following libraries:

Chevrotain
    https://github.com/SAP/chevrotain
    Apache License 2.0
FileSaver.js
    https://github.com/eligrey/FileSaver.js
    MIT License
Golly
    https://github.com/dannygarcia/golly
    MIT License
JSGIF
    https://github.com/antimatter15/jsgif
    MIT License
js-lru
    https://github.com/rsms/js-lru
    MIT license
Clipboard.js
    https://github.com/zenorocha/clipboard.js/
    MIT License
Bresenham easy.filter
    http://members.chello.at/easyfilter/bresenham.html
    written permission of author

and a small excerpt from the SciTE code editor,
ported from C++ to TypeScript by Ben Fisher
SciTE
    https://www.scintilla.org/SciTE.html
    https://www.scintilla.org/License.txt
'''


sections['functions'] = r'''

=====
diskSpace()
=====
(Deprecated and hard-coded).
Examples:

put diskSpace() into x


=====
heapSpace()
=====
(Deprecated and hard-coded).
Examples:

put heapSpace() into x


=====
stackSpace()
=====
(Deprecated and hard-coded).
Examples:

put stackSpace() into x


=====
systemVersion()
=====
(Deprecated and hard-coded).
To get the current software version, use
put the version into x
or
put the long version into x
instead.

Examples:

put systemVersion() into x


=====
seconds()
=====
Seconds since January 1, 1904.
Examples:

put seconds() into x


=====
ticks()
=====
Ticks (60th of a second) since January 1, 1904.
Examples:

put ticks() into x


=====
random(n)
=====
n must be an integer.
Returns random value between 1 and n.
Examples:

put random(20) into roll


=====
round(x)
=====
Returns integer nearest to number. Odd integers plus 0.5 
round up, even integers plus 0.5 round down.
Examples:

put round(1.7) into x


=====
screenRect()
=====

Examples:

put screenRect() into x


=====
charToNum(x)
=====
From ascii-like number to a character.
Note that characters in a field are displayed in Mac OS Roman
encoding.

Note that the newline character is always \n (10).
Examples:

put charToNum(97) into x


=====
numToChar(x)
=====
From a character to an ascii-like number.
Note that characters in a field are displayed in Mac OS Roman
encoding.

Note that the newline character is always \n (10).
Examples:

put numToChar("a") into x


=====
strToNumber(x)
=====
Parse string to number.
Supports scientific notation.
If cannot be parsed, returns "false"
Examples:

put strToNumber("12") into x
put strToNumber("-12") into x
put strToNumber("1e6") into x


=====
numberToStr(x)
=====
Convert number to string.
Examples:

put numberToStr(0.5) into x


=====
offset(needle, haystack)
=====
Note: one-based indexing.
If needle is not found, returns 0.
Examples:

put offset("b", "abc") into x


=====
max(...)
=====
Supports any number of arguments.
You can also provide a comma-delimited string.
Examples:

put max(1,2,3) into x
put max("45,49,40") into x -- returns 49


=====
min()
=====
Supports any number of arguments.
You can also provide a comma-delimited string.
Examples:

put min(1,2,3) into x
put min("45,49,40") into x -- returns 40


=====
sum()
=====

Supports any number of arguments.
You can also provide a comma-delimited string.
Examples:

put sum(1,2,3) into x
put sum("1,2,3") into x -- returns 6

=====
commandKey()
=====
In an afterkeydown or afterkeyup handler, check if this modifier 
key is pressed.
Examples:

put commandKey() into x

put cmdkey() into x -- same as above.


=====
optionKey()
=====
In an afterkeydown or afterkeyup handler, check if this modifier 
key is pressed.
Examples:

put optionKey() into x


=====
shiftKey()
=====
In an afterkeydown or afterkeyup handler, check if this modifier 
key is pressed.
Examples:

put shiftKey() into x

=====
keyRepeated()
=====
In an afterkeydown handler, did this event come from the user holding the key down?
Examples:

if not keyRepeated() then
    add 1 to uniqueKeyPresses
end if

=====
keyChar()
=====
In an afterkeydown or afterkeyup handler, check the character.
Is affected by shift.
Examples:

put keyChar() into x
on afterKeyDown
    if keyChar() is "i" and not shiftKey() and \
            optionKey() and not commandKey() then
        answer "you pressed option-i"
    else if keyChar() is "U" and shiftKey() and \
            not optionKey() and not commandKey() then
        answer "you pressed shift-u"
    end if
end afterKeyDown

=====
clickh()
=====
In a mousedown or mouseup handler, get click x coordinate.
Examples:

put clickh() into x


=====
clickloc()
=====
In a mousedown or mouseup handler, get click coordinates.

Examples:

put clickloc() into x


=====
clickv()
=====
In a mousedown or mouseup handler, get click y coordinate.

Examples:

put clickv() into x


=====
mouse()
=====
Is the mouse button currently down.
Examples:

put mouse() into x


=====
mouseclick()
=====
Are we currently handling a mousedown or mouseup event.

Examples:

put mouseclick() into x


=====
mouseh()
=====
The x coordinate of mouse location.
Examples:

put mouseh() into x


=====
mouseloc()
=====
The coordinates of mouse location.

Examples:

put mouseloc() into x


=====
mousev()
=====
The y coordinate of mouse location.

Examples:

put mousev() into x


=====
param(n)
=====
Get the nth value passed into the current procedure. Can be used
to build a function that takes any number of arguments, 
see example.

Examples:

on mySumOfNumbers
    put 0 into total
    repeat with x = 1 to paramCount()
        put total + param(x) into total
    end repeat
    answer ("total is" && total)
end mySumOfNumbers

on mouseUp
    mySumOfNumbers 1, 2, 3
end mouseUp

=====
paramCount()
=====
Get the number of values passed into the current procedure.
Can be used to build a function that takes any number of 
arguments, see example.

Examples:

on mySumOfNumbers
    put 0 into total
    repeat with x = 1 to paramCount()
        put total + param(x) into total
    end repeat
    answer ("total is" && total)
end mySumOfNumbers

on mouseUp
    mySumOfNumbers 1, 2, 3
end mouseUp

=====
params()
=====
Get all of the values passed into the current procedure.
Examples:

put params() into x


=====
result()
=====
The return value of the last called function or procedure.
Examples:

on myProc
    return "a"
end myProc
on mouseUp
    myProc
    answer (result())
end mouseUp

=====
selectedChunk()
=====
Current selection, looks something like 'char 2 to 4 of cd fld id 
1234'.

Examples:

put selectedChunk() into x


=====
selectedField()
=====
The field that contains current selected text, looks something 
like 'cd fld id 1234'.

Examples:

put selectedField() into x


=====
selectedLine()
=====
The number of the line of the current selected text.
Examples:

put selectedLine() into x


=====
selectedText()
=====
The value of the current selected text.

Examples:

put selectedText() into x


=====
tool()
=====
The tool to be used when programmatically drawing shapes.
(Not the actual tool, which would always be Browse)

See also: the click, drag commands.

Examples:

choose "pencil" tool
click at 10,20
-- this draws a black pixel at the coordinates x=10, y=20
put tool() into x


=====
abs(x)
=====
Absolute value.
Examples:

put abs(-0.5) into x
put abs(0.5) into x


=====
atan(x)
=====

Arctangent, in radians.
Examples:

put atan(0.5) into x


=====
sin(x)
=====

Examples:

put sin(0.5) into x


=====
cos(x)
=====

Examples:

put cos(0.5) into x


=====
tan(x)
=====

Examples:

put tan(0.5) into x


=====
ln(x)
=====

Examples:

put ln(0.5) into x


=====
ln1(x)
=====
Natural logarithm of (x + 1)
Examples:

put ln1(0.5) into x


=====
log2(x)
=====

Examples:

put log2(0.5) into x


=====
exp(x)
=====
e to the power of x.
Examples:

put exp(0.5) into x


=====
exp1(x)
=====
(e to the power of x) minus 1.

Examples:

put exp1(0.5) into x


=====
exp2(x)
=====
2 to the power of x.

Examples:

put exp2(0.5) into x


=====
sqrt(x)
=====

Examples:

put sqrt(0.5) into x


=====
trunc(x)
=====
Get integer part of a number.
i.e. for positive numbers, always round down to the nearest 
integer.

Examples:

put trunc(0.5) into x

=====
target
=====
Refers to the object that was most recently acted on.
Here's one reason why this can be useful:
If you have many buttons that all basically perform the same 
action, you could have an 'on mouseup' handler in the card script
instead of a separate script within each button. This script in the
card could check the target to see which, if any, of the buttons
were clicked.

Similar to, but distinct from 'me'.

Examples:

put the id of target into theTarget

set the width of the target to 100

=====
me
=====
Refers to the object that owns the current script.

Similar to, but distinct from 'target'.

Examples:

put the id of me into theTarget

set the width of me to 100

=====
length(s)
=====
Returns the length of a string, in characters.
Also supports alternate syntax 'the length of "abc"'.

Examples:

answer length("abc") -- displays 3
answer (the length of "") -- displays 0
answer (the length of "abc") -- displays 3
=====
number
=====
Can be used to either count number of objects, or to count
lines/items in a string.

Examples:

answer (the number of chars in "1,2,3")
answer (the number of items in "1,2,3")
answer (the number of words in "1,2,3")
answer (the number of lines in "1,2,3")
answer (the number of cards)
answer (the number of card buttons)
answer (the number of card fields)
=====
there___is___a
=====
Check for the existence of an object

Examples:

if there is a cd btn id 12345 then
    answer "found"
end if
=====
is___a
=====
Check the type of an expression.

Examples:

if x is a number then
    answer "a"
end if
if x is a integer then
    answer "b"
end if
if x is a logical then
    answer "c"
end if
if x is a point then
    answer "d"
end if
if x is a rect then
    answer "e"
end if

=====
is___in
=====

Examples:

if "b" is in "abc" then
    answer "yes"
end if
=====
is___within
=====

Same as "is in".

Examples:

if "b" is in "abc" then
    answer "yes"
end if
=====
contains
=====

Examples:

if "abc" contains "b" then
    answer "yes"
end if
'''


sections['event_handlers'] = r'''
=====
on___openCard
=====
This feature will arrive in a future version...

=====
on___openStack
=====
This feature will arrive in a future version...

=====
on___closeCard
=====
This feature will arrive in a future version...

=====
on___idle
=====
Sent repeatedly to the current card. Can be used for a game loop.

(Note that to terminate a script that is being called repeatedly, 
you can change to the button or field tool.)

To get faster idle calls, at the expense of heavier cpu usage,
use
`set the idlerate to "faster"`
=====
on___mouseDoubleClick
=====
Remember that scripts are only run when you're in the Browse
tool (hand-shape). Create a button and type the example below.
Now when you choose the browse tool and double-click the
button, your code will run.

Examples:

on mouseDoubleClick
    answer "you double-clicked this button."
end mouseDoubleClick

=====
on___mouseDown
=====
Remember that scripts are only run when you're in the
Browse tool (hand-shape). Called whenever the mouse is 
pressed down onto the object. Create a button and type the 
example below. Now when you choose the browse tool and 
click the button, your code will run.

Examples:

on mouseDown
    answer "code is running."
end mouseDown
=====
on___mouseUp
=====
Remember that scripts are only run when you're in the Browse tool
(hand-shape). Called whenever the mouse is clicked. To be precise,
when the mouse is pressed down onto the object, and released on
the same object. Create a button and type the example below. 
Now when you choose the browse tool and click the button, 
your code will run.

Examples:

on mouseUp
    answer "code is running."
end mouseUp

=====
on___mouseEnter
=====
Remember that scripts are only run when you're in the Browse tool
(hand-shape). Called whenever the mouse enters the object.

=====
on___mouseLeave
=====
Remember that scripts are only run when you're in the Browse tool
(hand-shape). Called whenever the mouse leaves the object.

=====
on___mouseWithin
=====
Called repeatedly when the cursor is inside the object.
You can use the mouseloc() function to get the position of the 
cursor. This can be used to create drag/drop effects.

(Note that to terminate a script that is being called repeatedly, 
you can change to the button or field tool.)

=====
on___afterKeyDown
=====

Called when a key is pressed.
You can use the functions `keyChar()`,  `shiftKey()`,  `optionKey()`, 
and `commandKey()`, to determine which key(s) where pressed.

`keyRepeated()` can be used to see if the key event comes from
the key having been held down.

Examples:

on afterKeyDown
    if keyChar() is "i" and not shiftKey() and \
            optionKey() and not commandKey() then
        answer "you pressed option-i"
    else if keyChar() is "U" and shiftKey() and \
            not optionKey() and not commandKey() then
        answer "you pressed shift-u"
    end if
end afterKeyDown
=====
on___afterKeyUp
=====

Called when a key is pressed and released.
You can use the functions keyChar(), shiftKey(), optionKey(), and
commandKey(), to determine which key(s) where pressed.

Examples:

on afterKeyUp
    if keyChar() is "i" and not shiftKey() and \
            optionKey() and not commandKey() then
        answer "you pressed option-i"
    else if keyChar() is "U" and shiftKey() and \
            not optionKey() and not commandKey() then
        answer "you pressed shift-u"
    end if
end afterKeyUp

'''


sections['commands'] = r'''
=====
add {number} to [chunk of] {container}
=====
Adds the value of number to the number in a container.

Examples:

put 2 into x
add 3 to x
answer x -- will display "5"

put "1,2,3" into x
add 3 to item 2 of x
answer x -- will display "1,5,3"

=====
answer {text}
answer {text} with {option1} or {option2} [or {option3}]
=====
Displays a dialog box.

Examples:

answer "abc" -- will display "abc"

answer "are you sure?" with "OK" or "cancel" 
-- user can choose OK or cancel
put it into whichChosen
if whichChosen is 1 then
    answer "clicked OK"
else if whichChosen is 2 then
    answer "clicked cancel"
end if
=====
ask {text}
ask {text} with {defaulttext}
=====
Displays a dialog box allowing the user to type in a response.
If the user clicks Cancel, the result will be an empty string "".

Examples:

ask "what is your favorite color?" with "blue"
put it into favColor
answer ("you chose" && favColor)
=====
beep
=====

Play the system beep sound.
=====
choose {toolname} tool
=====

Use the choose command for programmatically drawing pictures.
See the example.
Doesn't set the actual tool, which is always Browse when scripts 
are running.
See also: click, drag.

Examples:

choose "pencil" tool
click at 10,20
-- this draws a black pixel at the coordinates x=10, y=20

-- Currently supported tools include:
brush
bucket
pencil
line
rect
oval
roundrect
curve
spray
=====
click at {x}, {y}
=====
Use the click command for programmatically drawing pictures.
Remember to first use the choose command to indicate what to 
draw.

Examples:

choose "pencil" tool
click at 10,20
-- this draws a pixel at the coordinates x=10, y=20

=====
drag from {x1}, {y1} to {x2}, {y2}
=====
Use the drag command for programmatically drawing pictures.
Remember to first use the choose command to indicate what to 
draw.

Examples:

choose "line" tool
drag from 10,20 to 30,40
-- this draws a line starting at the coordinates (10,20) 
-- ending at (30,40)

=====
create btn|fld
=====
This feature will arrive in a future version...

=====
lock___screen
=====
This feature will arrive in a future version...

=====
unlock___screen
=====
This feature will arrive in a future version...

=====
delete char {i} of {container}
delete char {i} to {j} of {container}
delete btn|fld
=====

Examples:

put "abcde" into x
delete char 2 of x
answer x -- shows "acde"

put "abcde" into x
delete char 2 to 4 of x
answer x -- shows "ae"

As far as deleting a button or field, this feature will arrive in a 
future version...

=====
disable {button}
=====
Disables a button (sets the "enabled" property to true, so that the
button no longer responds to clicks).

=====
enable {button}
=====
Enables a button (sets the "enabled" property to false, so that the
button is no longer disabled).

=====
hide {button|field}
=====
Hides a button or field.

=====
show {button|field}
=====
Shows a button or field.


=====
get {expression}
=====
Evaluates any expression and saves the result to the variable "it".

Not very useful compared with the 'put' command, but it is here
for tradition's sake.

Examples:

get 2+3
put it into x
answer x -- shows 5

get the width of cd btn "myBtn"
put it into x
answer x -- shows the width of the specified button

=====
put {expression} into {container}
=====
Evaluates any expression and saves the result to a variable or 
container.

Examples:

put "hello" into cd fld "message"

put 2+3 into x
answer x -- shows 5

put "aa,bb,cc" into x
put "11" into item 2 of x
answer x -- shows "aa,11,cc"

put "abc" into x
put "q" into char 2 of x
answer x -- shows "aqc"

put "appended text" after x
put "prepended text" before x

=====
divide [chunk of] {container} by {number}
=====
Divides the number in a container by a number.

Examples:

put 12 into x
divide x by 3
answer x -- will display "4"

put "1,12,3" into x
divide item 2 of x by 3
answer x -- will display "1,4,3"

=====
multiply [chunk of] {container} by {number}
=====
Multiplies the number in a container by a number.

Examples:

put 12 into x
multiply x by 3
answer x -- will display "36"

put "1,12,3" into x
multiply item 2 of x by 3
answer x -- will display "1,36,3"
=====
subtract [chunk of] {container} from {number}
=====
Subtracts a number from the number in a container.

Examples:

put 12 into x
subtract 3 from x
answer x -- will display "9"

put "1,12,3" into x
subtract 3 from item 2 of x
answer x -- will display "1,9,3"

=====
go {number}
go {ordinal}
go {relativePosition}
=====
Go to a different card.

Examples:

go to card 1 -- goes to first card
go first -- goes to first card
go last -- goes to last card
go next -- goes to the next card
go prev -- goes to the previous card

The following are supported:
last
middle
any
first
second
third
fourth
fifth
sixth
seventh
eigth
ninth
tenth
next
previous
this
mid
prev

=====
set the {property} of {button|field} to {value}
set the {property} to {value}
set the {chunkproperty} of {chunk} of {field} to {value}
=====
Use the set command to change a property.

Some example properties:

`set the width of cd btn "myButton" to 100
set the topLeft of cd btn "myButton" to 24, 25
put the long name of btn "myButton" into x
set the textsize of char 2 to 4 of cd fld "myFld" to 18 
set the itemdelimiter to "|"`

See the "Properties" section of documentation for more.

=====
sort [lines|items|chars] of {container}
sort descending [lines|items|chars] of {container}
sort [lines|items|chars] of {container} [numeric|text|international]
=====

Sort styles:
For text sorting (default), compares text, not case sensitive.
For numeric sorting, interpret as numbers, e.g. 10 sorts after 2.
For international sorting, compares text using current locale.

Examples:

put "aa,cc,bb" into x
sort items of x
answer x -- displays "aa,bb,cc"

=====
wait {number} [seconds|milliseconds|ms|ticks]
=====
Pauses the script.

Examples:

wait 500 ms -- pauses for half a second.

(A paused script can be terminated by clicking the Stop icon in the
navigation palette, or by changing to the button or field tool.)

=====
global {variableName}
=====
Indicates that a variable is a global.
1) it can be accessed from any other script
2) the contents are saved even after the function is complete.
The contents are lost when the stack is exited, however, and are not saved to disk.

Examples:

global currentData1, currentData2
put "stored 1" into currentData1
put "stored 2" into currentData2

=====
return {expression}
=====
return a value from the current function.
Note: no lines of code after the return statement will be run.

Examples:

function myAddition p1, p2
    return p1 + p2
    answer "this line will never be reached"
end myAddition
on mouseUp
    put myAddition(1,2) into x
end mouseUp

=====
next___repeat
=====
Inside a loop, go back to the top of the loop, skipping the next 
line(s) of code. Equivalent to "continue" in C.

Examples:

repeat with x = 1 to 3
    if x == 2 then
        next repeat
    end if
    answer x
end repeat
-- displays 1
-- displays 3
-- and does not display 2
=====
exit___repeat
=====
Exit the current loop.
Equivalent to "break" in C.

Examples:

repeat with x = 1 to 3
    if x == 2 then
        break
    end if
    answer x
end repeat
-- displays 1
-- and does not display 2 or 3
=====
if/then
=====

Like in C, if a branch can be taken, all other else branches
will be skipped, as in the third example below.

Examples:

if x > 0 then
    answer "x is greater than 0"
end if

if x > 0 then
    answer "x is greater than 0"
else
    answer "x is not greater than 0"
end if

if 3+3 is 6 then
    answer "yes"
else if 2+2 is 4 then
    answer "not run, even though it is true"
end if

if x > 50 then
    answer "x is greater than 50"
else if x > 40 then
    answer "x is greater than 40"
else
    answer "x is not greater than 40"
end if

=====
repeat
=====
Use to create a loop.

Examples:

repeat with x = 1 to 5
    answer ("x is now" & x)
end repeat

repeat with x = 5 down to 1
    answer ("x is now" & x)
end repeat

repeat 3 times
    answer "hi"
end repeat

repeat forever
    answer "this is an infinite loop"
end repeat

put 0 into counter
repeat forever
    answer "but not this"
    add 1 to counter
    if counter > 3 then
        exit repeat
    end if
end repeat

put 0 into counter
repeat until counter > 3
    add 1 to counter
end repeat

put 0 into counter
repeat while counter <= 3
    add 1 to counter
end repeat

=====
exit
=====
Exits the current function, skipping over any subsequent lines 
of code. Similar to return, but does not return a value.

Examples:

on mouseUp
    put cd fld "fld1" into x
    if x is not a number then
        answer "you did not type a number"
        exit mouseUp
    end if
    put x * 2 into cd fld "fld1"
end mouseUp


=====
pass
=====
Exits the current function and calls a function higher in the
message hierarchy. For example, if a button has the script
`on mouseUp
    answer "button handling the event"
end mouseUp
and the current card has the script
on mouseUp
    answer "card handling the event"
end mouseUp`
and the button is clicked,
only the button's code will be run.

If you want both to be run, you can use the pass command.
If a button has the script
`on mouseUp
    answer "button handling the event"
    pass mouseUp
    -- any code here will be skipped
end mouseUp`
and the current card has the script
`on mouseUp
    answer "card handling the event"
end mouseUp`
and the button is clicked,
both will be run.

'''

sections['properties'] = r'''

=====
btn: width
=====

Examples:

put the width of cd btn "myBtn" into z


=====
btn: height
=====

Examples:

put the height of cd btn "myBtn" into z


=====
btn: left
=====

Examples:

put the left of cd btn "myBtn" into z


=====
btn: top
=====

Examples:

put the top of cd btn "myBtn" into z


=====
btn: right
=====

Examples:

put the right of cd btn "myBtn" into z


=====
btn: bottom
=====

Examples:

put the bottom of cd btn "myBtn" into z


=====
btn: topleft
=====

Examples:

put the topleft of cd btn "myBtn" into z


=====
btn: botright
=====

Examples:

put the botright of cd btn "myBtn" into z


=====
btn: rect
=====

Examples:

put the rect of cd btn "myBtn" into z


=====
btn: loc
=====

Examples:

put the loc of cd btn "myBtn" into z


=====
btn: bottomright
=====

Examples:

put the bottomright of cd btn "myBtn" into z


=====
btn: rectangle
=====

Examples:

put the rectangle of cd btn "myBtn" into z


=====
btn: location
=====

Examples:

put the location of cd btn "myBtn" into z


=====
btn: autohilite
=====

Examples:

put the autohilite of cd btn "myBtn" into z


=====
btn: enabled
=====

Examples:

put the enabled of cd btn "myBtn" into z


=====
btn: hilite
=====

Examples:

put the hilite of cd btn "myBtn" into z


=====
btn: checkmark
=====

Examples:

put the checkmark of cd btn "myBtn" into z


=====
btn: icon
=====

Examples:

put the icon of cd btn "myBtn" into z


=====
btn: label
=====

Examples:

put the label of cd btn "myBtn" into z


=====
btn: showlabel
=====

Examples:

put the showlabel of cd btn "myBtn" into z


=====
btn: visible
=====

Examples:

put the visible of cd btn "myBtn" into z


=====
btn: textfont
=====

Examples:

put the textfont of cd btn "myBtn" into z


=====
btn: textsize
=====

Examples:

put the textsize of cd btn "myBtn" into z


=====
btn: textalign
=====

Examples:

put the textalign of cd btn "myBtn" into z


=====
btn: script
=====

Examples:

put the script of cd btn "myBtn" into z


=====
btn: textstyle
=====

Examples:

put the textstyle of cd btn "myBtn" into z


=====
btn: style
=====

Examples:

put the style of cd btn "myBtn" into z


=====
btn: id
=====

Examples:

put the id of cd btn "myBtn" into z


=====
btn: long id
=====

Examples:

put the long id of cd btn "myBtn" into z


=====
btn: abbrev id
=====

Examples:

put the abbrev id of cd btn "myBtn" into z


=====
btn: short id
=====

Examples:

put the short id of cd btn "myBtn" into z


=====
btn: name
=====

Examples:

put the name of cd btn "myBtn" into z


=====
btn: long name
=====

Examples:

put the long name of cd btn "myBtn" into z


=====
btn: abbrev name
=====

Examples:

put the abbrev name of cd btn "myBtn" into z


=====
btn: short name
=====

Examples:

put the short name of cd btn "myBtn" into z

=====
fld: width
=====

Examples:

put the width of cd fld "myFld" into z


=====
fld: height
=====

Examples:

put the height of cd fld "myFld" into z


=====
fld: left
=====

Examples:

put the left of cd fld "myFld" into z


=====
fld: top
=====

Examples:

put the top of cd fld "myFld" into z


=====
fld: right
=====

Examples:

put the right of cd fld "myFld" into z


=====
fld: bottom
=====

Examples:

put the bottom of cd fld "myFld" into z


=====
fld: topleft
=====

Examples:

put the topleft of cd fld "myFld" into z


=====
fld: botright
=====

Examples:

put the botright of cd fld "myFld" into z


=====
fld: rect
=====

Examples:

put the rect of cd fld "myFld" into z


=====
fld: loc
=====

Examples:

put the loc of cd fld "myFld" into z


=====
fld: bottomright
=====

Examples:

put the bottomright of cd fld "myFld" into z


=====
fld: rectangle
=====

Examples:

put the rectangle of cd fld "myFld" into z


=====
fld: location
=====

Examples:

put the location of cd fld "myFld" into z


=====
fld: dontwrap
=====

Examples:

put the dontwrap of cd fld "myFld" into z


=====
fld: enabled
=====

Examples:

put the enabled of cd fld "myFld" into z


=====
fld: locktext
=====

Examples:

put the locktext of cd fld "myFld" into z


=====
fld: singleline
=====

Examples:

put the singleline of cd fld "myFld" into z


=====
fld: scroll
=====

Examples:

put the scroll of cd fld "myFld" into z


=====
fld: defaulttextfont
=====

If the user deletes all text in a field and then types a letter, the font of this letter will be determined by the defaulttextfont.

Examples:

put the defaulttextfont of cd fld "myFld" into z


=====
fld: defaulttextsize
=====

If the user deletes all text in a field and then types a letter, the size of this letter will be determined by the defaulttextsize.

Examples:

put the defaulttextsize of cd fld "myFld" into z


=====
fld: visible
=====

Examples:

put the visible of cd fld "myFld" into z


=====
fld: textalign
=====

Examples:

put the textalign of cd fld "myFld" into z


=====
fld: alltext
=====

Examples:

put the alltext of cd fld "myFld" into z


=====
fld: defaulttextstyle
=====

If the user deletes all text in a field and then types a letter, the style of this letter will be determined by the defaulttextstyle.

Examples:

put the defaulttextstyle of cd fld "myFld" into z


=====
fld: style
=====

Examples:

put the style of cd fld "myFld" into z


=====
fld: textstyle
=====

By default, applies the property to the entire field.
`set the textstyle of cd fld "myFld" to "bold"
set the textstyle of cd fld "myFld" to "bold,italic"
set the textstyle of cd fld "myFld" to "plain"
put the textstyle of cd fld "myFld" into z`

We now support getting and setting by chunk!
`set the textstyle of char 3 to 4 of cd fld "myFld" to "bold"
put the textstyle of char 3 to 4 of cd fld "myFld" into z`

When querying for a property and there are multiple values,
returns the string "mixed".


=====
fld: textfont
=====

By default, applies the property to the entire field.
`set the textfont of cd fld "myFld" to "chicago"
put the textfont of cd fld "myFld" into z`

We now support getting and setting by chunk!
`set the textfont of char 3 to 4 of cd fld "myFld" to "geneva"
put the textfont of char 3 to 4 of cd fld "myFld" into z`

When querying for a property and there are multiple values,
returns the string "mixed".


=====
fld: textsize
=====

By default, applies the property to the entire field.
`set the textsize of cd fld "myFld" to "chicago"
put the textsize of cd fld "myFld" into z`

We now support getting and setting by chunk!
`set the textsize of char 3 to 4 of cd fld "myFld" to "geneva"
put the textsize of char 3 to 4 of cd fld "myFld" into z`

When querying for a property and there are multiple values,
returns the string "mixed".

=====
fld: id
=====

Examples:

put the id of cd fld "myFld" into z


=====
fld: long id
=====

Examples:

put the long id of cd fld "myFld" into z


=====
fld: abbrev id
=====

Examples:

put the abbrev id of cd fld "myFld" into z


=====
fld: short id
=====

Examples:

put the short id of cd fld "myFld" into z


=====
fld: name
=====

Examples:

put the name of cd fld "myFld" into z


=====
fld: long name
=====

Examples:

put the long name of cd fld "myFld" into z


=====
fld: abbrev name
=====

Examples:

put the abbrev name of cd fld "myFld" into z


=====
fld: short name
=====

Examples:

put the short name of cd fld "myFld" into z

=====
card: id
=====

Examples:

put the id of card id 1011 into z


=====
card: long id
=====

Examples:

put the long id of card id 1011 into z


=====
card: abbrev id
=====

Examples:

put the abbrev id of card id 1011 into z


=====
card: short id
=====

Examples:

put the short id of card id 1011 into z


=====
card: name
=====

Examples:

put the name of card id 1011 into z


=====
card: long name
=====

Examples:

put the long name of card id 1011 into z


=====
card: abbrev name
=====

Examples:

put the abbrev name of card id 1011 into z


=====
card: short name
=====

Examples:

put the short name of card id 1011 into z

=====
global: version
=====

Examples:

put the version into z


=====
global: long version
=====

Examples:

put the long version into z


=====
global: itemdelimiter
=====

Examples:

put the itemdelimiter into z


=====
global: idlerate
=====

Examples:

set the idlerate to "default"
set the idlerate to "faster"



=====
global: environment
=====
(Deprecated and hard-coded, for backwards compatibility only)

Examples:

put the environment into z


=====
global: freesize
=====
(Deprecated and hard-coded, for backwards compatibility only)

Examples:

put the freesize into z


=====
global: size
=====
(Deprecated and hard-coded, for backwards compatibility only)

Examples:

put the size into z


=====
global: stacksinuse
=====
(Deprecated and hard-coded, for backwards compatibility only)

Examples:

put the stacksinuse into z


=====
global: suspended
=====
(Deprecated and hard-coded, for backwards compatibility only)

Examples:

put the suspended into z



'''

specialCharFontChange = "\x02"

def map(iterable, func):
    for i in iterable:
        yield func(i)

#~ class JsonicBucket(object):
    #~ _data=None
    #~ def __init__(self):
        #~ self._data = {}

    #~ def __getattribute__(self, name):
        #~ if name.startswith('_'):
            #~ return object.__getattribute__(self, name)
        #~ else:
            #~ return self._data[name]

    #~ def __setattribute__(self, name, value):
        #~ if name.startswith('_'):
            #~ object.__setattr__(self, name, value)
        #~ else:
            #~ self._data[name] = value

    #~ def __delattr__(self, name):
        #~ raise RuntimeError

def addFormatting(s):
    # ^ for bold
    # ` for code
    
    spl = s.split('^')
    assertTrue( len(spl)%2==1, 'extra ^?', len(spl), '\n\n'.join(map(spl, repr)))
    spl = s.split('`')
    assertTrue( len(spl)%2==1, 'extra `?', len(spl), '\n\n'.join(map(spl, repr)))
    counter = 0
    def doReplaceBold(np):
        nonlocal counter
        counter += 1
        if counter % 2 == 1:
            return f'{specialCharFontChange}times_12_+biuosdce{specialCharFontChange}'
        else:
            return f'{specialCharFontChange}times_12_biuosdce{specialCharFontChange}'
    s = re.sub(r'\^',doReplaceBold,s)
    
    counter = 0
    def doReplaceCodef(np):
        nonlocal counter
        counter += 1
        if counter % 2 == 1:
            return f'{specialCharFontChange}monaco_9_biuosdce{specialCharFontChange}'
        else:
            return f'{specialCharFontChange}times_12_biuosdce{specialCharFontChange}'
    s = re.sub(r'`',doReplaceCodef,s)
    
    s = s.replace(f'\nExamples:\n', f'\nExamples:\n{specialCharFontChange}monaco_9_biuosdce{specialCharFontChange}')
    
    
    s = f'{specialCharFontChange}times_12_biuosdce{specialCharFontChange}' + s
    s = s.replace('$caret$', '^').replace('$backtic$', '`')
    return s
    
print(addFormatting('test ^bold^ and ^b^ ch'))

def goSection(s, sname):
    sname = sname[0].upper() + sname[1:]
    section = {}
    section['name'] = sname
    section['entries'] = []
    spl = s.split('=====\n')
    assertTrue( len(spl)%2==1, 'extra ====?', len(spl))
    assertTrue(spl[0].strip() =='', spl[0].strip())
    spl.pop(0)
    for shortheader, body in takeBatch(spl, 2):
        ret = {}
        header = shortheader.strip()
        body = body.strip()
        if sname.lower() in ['properties']:
            ret['title'] = header
            header = header.split(': ')[1]
        elif sname.lower() not in ['fundamentals']:
            ret['title'] = header
            ret['title'] = ret['title'].split(' ')[0]
            ret['title'] = ret['title'].split('(')[0]
            ret['title'] = ret['title'].replace('___', ' ')
            header = header.replace('___', ' ')
        else:
            ret['title'] = header
        
        body = addFormatting(body)
        ret['body'] = ''
        ret['body'] += f'{specialCharFontChange}times_24_biuosdce{specialCharFontChange}'
        ret['body'] +=header
        ret['body'] +='\n\n'
        ret['body'] += f'{specialCharFontChange}times_12_biuosdce{specialCharFontChange}'
        ret['body'] +=body
        ret['body'] = ret['body'].replace(f'{specialCharFontChange}Examples:\n', f'{specialCharFontChange}Examples:\n{specialCharFontChange}monaco_9_biuosdce{specialCharFontChange}')
        section['entries'].append(ret)
    
    if sname.lower() not in ['fundamentals']:
        section['entries'].sort(key=lambda x: x['title'])
    return section
    
def go():
    outloc = '../src/resources/docs/'
    for sectionname in sections:
        s = sections[sectionname].replace('\r\n', '\n')
        section = goSection(s, sectionname)
        path = f'{outloc}ref_{sectionname}.json'
        
        f = open(path, 'w', encoding='utf-8')
        f.write(json.dumps(section))
        f.write('\n')
        f.close()
        theArr = [se['title'] for se in section['entries']]
        theArrS = json.dumps(theArr)
        assertTrue(not '===' in theArrS)
        mapIt = dict(fundamentals='lngFundamentals',
            commands='lngCommands',
            functions='lngFunctions',
            event_handlers='lngEvent Handlers',
            properties='lngProperties')
        
        print('// prettier-ignore')
        print(f'["{sectionname}", "{mapIt[sectionname]}", {theArrS}],')
        

go()

