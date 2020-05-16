
/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * if code here needs special abilities, we'll call
 * internalvpcmessagesdirective, which can do anything.
 * 
 * in the same scope as vpcStandardLibScript and can call anything there.
 */
export const VpcStandardLibDoMenu = /* static class */ {
    script: `

on domenu pa, pb
    put tolowercase(pa) into pl
    if "|" in pl then
        errordialog "not a valid domenu"
    end if
    put false into handled
    put "|" & pl & "|" into key
    put handled and domenu_movecard(key, pl, pb) into handled
    put handled and domenu_paintsetting(key, pl, pb) into handled
    put handled and domenu_changefont(key, pl, pb) into handled
    put handled and domenu_changefontsize(key, pl, pb) into handled
    put handled and domenu_changetextstyle(key, pl, pb) into handled
    put handled and domenu_changetextstyletoggle(key, pl, pb) into handled
    if not handled then
        vpccalluntrappabledomenu pl, pb
    end if
end domenu

on domenu_movecard key, pl, pb
    put true into ret
    if pl == "back" then
        go back
    else if pl == "home" then
        go to card 1
    else if pl == "help" then
        send "help" to this card
    else if pl == "recent" then
        go recent
    else if pl == "first" then
        go first
    else if pl == "prev" then
        go Prev
    else if pl == "next" then
        go Next
    else if pl == "last" then
        go Last
    else if pl == "prevnowrap" then
        if the number of this cd is 1 then
            answer "You are already at the first card."
        else
            go prev
        end if
    else if pl == "nextnowrap" then
        if the number of this cd is the number of cards in this stack then
            answer "You are at the last-most card. You can create a new card by selecting 'New Card' from the Edit menu."
        else
            go next
        end if
    else
        put false into ret
    end if
    return ret
end domenu_movecard

on domenu_changefont key, pl, pb
    put "|chicago|courier|geneva|new york|times|helvetica|monaco|symbol|" into keys
    if key in keys then
        set the textfont of the selection to pl
        return true
    else
        return false
    end if
end domenu_changefont
on domenu_changefontsize key, pl, pb
    put "|9|10|12|14|18|24|" into keys
    if key in keys then
        set the textfont of the selection to pl
        return true
    else
        return false
    end if
end domenu_changefontsize
on domenu_changefontstyle key, pl, pb
    put "|plain|bold|italic|underline|outline|condense|extend|grayed|" into keys
    if key in keys then
        if pl == "plain" then
            set the textfont of the selection to plain
        else
            set the textfont of the selection to "toggle-" & pl
        end if
        return true
    else
        return false
    end if
end domenu_changefontstyle

       `
};
