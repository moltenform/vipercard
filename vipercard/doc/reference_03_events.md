<!---
this is a generated file, changes will be lost.
-->


## on afterKeyDown

Called when a key is pressed.
You can use the functions `keyChar()`,  `shiftKey()`,  `optionKey()`, 
and `commandKey()`, to determine which key(s) where pressed.

`keyRepeated()` can be used to see if the key event comes from
the key having been held down.


Examples:

```
on afterKeyDown
    if keyChar() is "i" and not shiftKey() and \
            optionKey() and not commandKey() then
        answer "you pressed option-i"
    else if keyChar() is "U" and shiftKey() and \
            not optionKey() and not commandKey() then
        answer "you pressed shift-u"
    end if
end afterKeyDown
```





## on afterKeyUp

Called when a key is pressed and released.
You can use the functions keyChar(), shiftKey(), optionKey(), and
commandKey(), to determine which key(s) where pressed.


Examples:

```
on afterKeyUp
    if keyChar() is "i" and not shiftKey() and \
            optionKey() and not commandKey() then
        answer "you pressed option-i"
    else if keyChar() is "U" and shiftKey() and \
            not optionKey() and not commandKey() then
        answer "you pressed shift-u"
    end if
end afterKeyUp
```





## on closeCard

This feature will arrive in a future version...



## on idle

Sent repeatedly to the current card. Can be used for a game loop.

(Note that to terminate a script that is being called repeatedly, 
you can change to the button or field tool.)

To get faster idle calls, at the expense of heavier cpu usage,
use
`set the idlerate to "faster"`



## on mouseDoubleClick

Remember that scripts are only run when you're in the Browse
tool (hand-shape). Create a button and type the example below.
Now when you choose the browse tool and double-click the
button, your code will run.


Examples:

```
on mouseDoubleClick
    answer "you double-clicked this button."
end mouseDoubleClick
```





## on mouseDown

Remember that scripts are only run when you're in the
Browse tool (hand-shape). Called whenever the mouse is 
pressed down onto the object. Create a button and type the 
example below. Now when you choose the browse tool and 
click the button, your code will run.


Examples:

```
on mouseDown
    answer "code is running."
end mouseDown
```





## on mouseEnter

Remember that scripts are only run when you're in the Browse tool
(hand-shape). Called whenever the mouse enters the object.



## on mouseLeave

Remember that scripts are only run when you're in the Browse tool
(hand-shape). Called whenever the mouse leaves the object.



## on mouseUp

Remember that scripts are only run when you're in the Browse tool
(hand-shape). Called whenever the mouse is clicked. To be precise,
when the mouse is pressed down onto the object, and released on
the same object. Create a button and type the example below. 
Now when you choose the browse tool and click the button, 
your code will run.


Examples:

```
on mouseUp
    answer "code is running."
end mouseUp
```





## on mouseWithin

Called repeatedly when the cursor is inside the object.
You can use the mouseloc() function to get the position of the 
cursor. This can be used to create drag/drop effects.

(Note that to terminate a script that is being called repeatedly, 
you can change to the button or field tool.)



## on openCard

This feature will arrive in a future version...



## on openStack

This feature will arrive in a future version...

