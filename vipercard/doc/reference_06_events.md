<!---
this is a generated file, changes will be lost.
-->

[Overview](./reference_01_overview.md) | [Commands](./reference_02_commands.md) | [Syntax](./reference_03_syntax.md) | [Properties](./reference_04_properties.md) | [Functions](./reference_05_functions.md) | Event Handlers | [Compatibility](./reference_07_compatibility.md)

## on afterKeyDown



Called when a key is pressed.

You can use the functions `keyChar()`,  `shiftKey()`,  `optionKey()`, and `commandKey()`, to determine which key(s) where pressed.

`keyRepeated()` can be used to see if the key event comes from the key having been held down.

Examples:


```


on afterKeyDown

if keyChar() is "i" and the shiftKey is up and \

the optionKey is down and the commandKey is up then

answer "you pressed option-i"

else if keyChar() is "U" and the shiftKey is down and \

the optionKey is up and the commandKey is up then

answer "you pressed shift-u"

end if

end afterKeyDown


```

## on afterKeyUp



Called when a key is pressed and released.

You can use the functions keyChar(), shiftKey(), optionKey(), and commandKey(), to determine which key(s) where pressed.

Examples:


```


on afterKeyUp

if keyChar() is "i" and the shiftKey is up and \

the optionKey is down and the commandKey is up then

answer "you pressed option-i"

else if keyChar() is "U" and the shiftKey is down and \

the optionKey is up and the commandKey is up then

answer "you pressed shift-u"

end if

end afterKeyUp


```

## on closeBackground


When you go to a different card, if the card belongs to a different background, the closeBackground message will be sent. (You're leaving one background and going to another).

Examples:


```


-- in a background's script

on closeBackground

answer "you have left this background"

end closeBackground


```

## on closeCard


Message sent upon leaving a card.

Because messages continue up the hierarchy until they are handled, you can also respond to closeCard in a stack script.

Examples:


```


-- in a card's script

on closeCard

answer "you have left this card"

end closeCard



```

## on closeField


Sent when the user clicks on a field to select it, types text into the field, and then de-selects the field.

If the browse tool is active, this message will be sent by the following:
* When typing text into a field, click outside the field
* When typing text into a field, press Enter
* When typing text into a field, go to a different card

See also: `openField` and `exitField`.

The message is sent to the target field and travels upward to the current card as usual.

Examples:


```


-- in a field's script

on closeField

-- do a simple check of what the user just typed

if not "@" in the target then

put "not a e-mail address" into cd fld "status"

else

put "" into cd fld "status"

end if

end closeField


```

## on exitField


Sent when the user clicks on a field to select it, does not type text into the field, and then de-selects the field.

If the browse tool is active, this message will be sent by the following:
* When a field is selected, click outside the field
* When a field is selected, press Enter
* When a field is selected, go to a different card

It's possible for exitField to be sent to the field more than once if some of the above actions happen at the same time.

See also: `openField` and `closeField`.

The message is sent to the target field and travels upward to the current card as usual.

Examples:


```


-- in a field's script

on openField

show cd btn "indicateCurrentlyEditingField"

end openField

on closeField

hide cd btn "indicateCurrentlyEditingField"

end closeField

on exitField

hide cd btn "indicateCurrentlyEditingField"

end exitField


```

## on idle


Sent repeatedly to the current card. Can be used for a game loop.

(Note that to terminate a script that is being called repeatedly, you can change to the button or field tool.)

To get faster idle calls, at the expense of heavier cpu usage, use `set the idlerate to "faster"`

## on mouseDoubleClick


Remember that scripts are only run when you're in the Browse tool (hand-shape). Create a button, edit its script, and type the example below. Now when you choose the browse tool and double-click the button, your code will run.

Examples:


```


on mouseDoubleClick

answer "you double-clicked this button."

end mouseDoubleClick


```

## on mouseDown


Remember that scripts are only run when you're in the Browse tool (hand-shape). Called whenever the mouse is pressed down onto the object. Create a button, edit its script, and type the example below. Now when you choose the browse tool and click the button, your code will run.

Examples:


```


on mouseDown

answer "code is running."

end mouseDown


```

## on mouseEnter


Remember that scripts are only run when you're in the Browse tool (hand-shape). Called whenever the mouse enters the object.

Examples:


```


on mouseEnter

set the icon of me to 12

end mouseDown


```

## on mouseLeave


Remember that scripts are only run when you're in the Browse tool (hand-shape). Called whenever the mouse leaves the object.

Examples:


```


on mouseLeave

set the icon of me to 10

end mouseLeave


```

## on mouseUp


Remember that scripts are only run when you're in the Browse tool (hand-shape). Called whenever the mouse is clicked. To be precise, when the mouse is pressed down onto the object, and released on the same object. Create a button, edit its script, type the example below. Now when you choose the browse tool and click the button, your code will run.

Examples:


```


on mouseUp

answer "hello, world."

end mouseUp


```

## on mouseWithin


Called repeatedly when the cursor is inside the object. You can use the mouseloc() function to get the position of the cursor. This can be used to create drag/drop effects.

(Note that to terminate a script that is being called repeatedly, you can change to the button or field tool.)

Examples:


```


on mouseWithin

set the loc of cd btn "follow" to the mouseLoc

end mouseWithin


```

## on openBackground


When you go to a different card, if the card belongs to a different background, the openBackground message will be sent. (You're leaving one background and going to another).

Examples:


```


-- in a background's script

on openBackground

answer "welcome to this background"

end openBackground


```

## on openCard


Message sent upon going to a card.

Because messages continue up the hierarchy until they are handled, you can also respond to openCard in a stack script.

Examples:


```


-- in a card's script

on openCard

answer "welcome to this card"

end openCard


```

## on openField


Sent to a field, when text is first selected in it.

See also: `closeField` and `exitField`.

Examples:


```


-- in a field's script

on openField

-- place default text in the field when you tab over to it...

put "abc" into the target

end openField


```

## on openStack


Message sent upon first opening the stack.

Examples:


```


-- in a stack's script

on openStack

answer "welcome to this card"

end openStack



```

