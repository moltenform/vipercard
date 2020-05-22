<!---
this is a generated file, changes will be lost.
-->

[Overview](./reference_01_overview.md) | [Commands](./reference_02_commands.md) | [Syntax](./reference_03_syntax.md) | [Properties](./reference_04_properties.md) | [Functions](./reference_05_functions.md) | [Event Handlers](./reference_06_events.md) | Compatibility



## (Compatibility)


These are provided for compatibility with HyperCard. They might have hard-coded values/reduced functionality, and are unlikely to be useful in new scripts.

You can enable compatibility mode for a stack by choosing `Object->Stack info...` and clicking `Compatibility` in the panel on the right. This setting is saved with the stack and makes these changes for compatibility.
* You can say `btn 2` instead of `cd btn 2`
* You can say `put "A" into item 3 of char 2 of x` which doesn't usually make sense
* You can say `put "new" into item 4 of line 3 of x` and get more intuitive behavior
* Uses HyperCard's less useful form for `long id`, `owner`, and `the target`.


## abbrev id



Examples:

```


put the abbrev id of cd fld "myFld" into z



```



## abbrev name



Examples:

```


put the abbrev name of cd fld "myFld" into z


```



## arrowKey


Sends an `arrowKey` message. By default, `arrowKey left` goes to the previous card, and `arrowKey right` goes to the next card, but this can be overridden in a card script or stack script.


## bottom


Equivalent to the top of the object + the height of the object.

Examples:

```


put the bottom of cd fld "myFld" into z


```



## botright



Examples:

```


put the botright of cd btn "myBtn" into z


```



## diskSpace()


(Deprecated and hard-coded).

Examples:

```


put diskSpace() into x




```



## environment


(Deprecated and hard-coded, for backwards compatibility only)

Examples:

```


put the environment into z




```



## errorDialog



Causes a runtime error at the current line.

Examples:

```


errorDialog "Not a number"


```



## exp1(x)


(e to the power of x) minus 1.

Examples:

```


put exp1(0.5) into x


```



## freesize


(Deprecated and hard-coded, for backwards compatibility only)

Examples:

```


put the freesize of this stack into z


```



## get


Evaluates any expression and saves the result to the variable "it".

The 'put' command is typically more useful.

Examples:

```


get 2+3
put it into x
answer x -- shows 5

get the width of cd btn "myBtn"
put it into x
answer x -- shows the width of the specified button


```



## heapSpace()


(Deprecated and hard-coded).

Examples:

```


put heapSpace() into x



```



## ln1(x)


Natural logarithm of (x + 1)

Examples:

```


put ln1(0.5) into x


```



## long name



Examples:

```


put the long name of cd fld "myFld" into z


```



## mark


Fully functional, might not be useful.

Sets the "marked" property on a card to true.


```

mark card id 1234
mark cards where the name of this card contains "b"
mark all cards

```


When cards are marked, you can conveniently reference them:

```

marked card 4
prev marked card
next marked card
first marked card
second marked card
last marked card

```



## marked


You can mark a card.

Examples:

```


answer the marked of cd 4
set the marked of cd 4 to true


```



## on errorDialog



(Included for compatibility, unlikely to be useful for writing scripts).

A few error messages create an errorDialog event. The default response is

to show a script error at the offending line. If you write your own errorDialog

handler you can catch these events. However, because nearly all errors do not

go through errorDialog, this is unlikely to be useful.


## right


Equivalent to the left of the object + the width of the object.

Examples:

```


put the right of cd fld "myFld" into z



```



## pop


Functional, but not recommended in new code.

Examples:

```


push card
go to card 7
pop card into x
go to card x


```



## push


Functional, but not recommended in new code.

Examples:

```


push card
go to card 7
pop card



```



## size


(Deprecated and hard-coded, for backwards compatibility only)

Examples:

```


put the size of this stack into z


```



## stacksinuse


(Deprecated and hard-coded, for backwards compatibility only)

Examples:

```


put the stacksinuse into z



```



## stackSpace()


(Deprecated and hard-coded).

Examples:

```


put stackSpace() into x



```



## suspended


(Deprecated and hard-coded, for backwards compatibility only)

Examples:

```


put the suspended into z




```



## systemVersion


(Deprecated and hard-coded).

To get the current software version, use

```
put the version into x
```

or

```
put the long version into x
```

instead.

Examples:

```


put systemVersion() into x


```



## trappable: on arrowKey


You can make a custom `arrowKey` handler that overrides the default one.


## trappable: on doMenu


You can make a custom `doMenu` handler that overrides the default one.

Hold the Shift key to bypass a customized `doMenu`.

Examples:

```


-- in a card's script
on doMenu p1, p2
    if p1 == "New Card" then
        answer "Making a new card"
    end if
    send "doMenu "&quote&p1&quote&", "&quote&p2&quote to this stack
end doMenu

```



## trappable: on help


You can make a custom `help` handler that overrides the default one. However, the default one won't really ever be called, since you can't choose `Help` from the `Go` menu in ViperCard.


## unmark


Fully functional, might not be useful.

Sets the "marked" property on a card to false.

Examples:

```


unmark card id 1234
unmark all cards


```



## version



Examples:

```


put the version into z



```



## long version



Examples:

```


put the long version into z


```

