

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */


/**
 * if code here needs special abilities, we'll call
 * internalvpcmessagesdirective, which can do anything.
 * 
 * in the same scope as vpcStandardLibScript and can call anything there.
 */
export const VpcStandardLibDoMenu = /* static class */ {
    script: `

on domenu itemName, pb

    global doMenuResult
    put "" into doMenuResult
    put tolowercase(itemName) into pl
    if "|" in pl then
        errordialog ("not a valid domenu" && pl)
    end if
    put false into handled
    put "|" & pl & "|" into key
    put handled and domenu_edit(key, pl, pb) into handled
    put handled and domenu_movecard(key, pl, pb) into handled
    put handled and domenu_object(key, pl, pb) into handled
    put handled and domenu_paintsetting(key, pl, pb) into handled
    put handled and domenu_changefont(key, pl, pb) into handled
    put handled and domenu_changefontsize(key, pl, pb) into handled
    put handled and domenu_changetextstyle(key, pl, pb) into handled
    put handled and domenu_changetextstyletoggle(key, pl, pb) into handled
    if not handled then
        errorDialog ("Unknown domenu" && pl)
    end if
    return doMenuResult
end domenu

on domenu_edit key, pl, pb
    global doMenuResult
    put true into ret
    if pl == "clear" then
        put the selectedfield into theFld
        if theFld is not empty then
            put "" into the selection
            select char 3 of theFld
        end if
    else if pl == "new card" then
        put "card" into sendParam
        internalvpcmessagesdirective "makepart" sendParam
        put sendParam into doMenuResult
        go cd id doMenuResult
    else if pl == "duplicate card" then
        put "dupecard" into sendParam
        internalvpcmessagesdirective "makepart" sendParam
        put sendParam into doMenuResult
        go cd id doMenuResult
    else if pl == "delete card" then
        delete this card
    else
        put false into ret
    end if
    return ret
end domenu_edit


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
    else if pl == "last" then
        go last
    else if pl == "prev" or pl == "previous" then
        if pb == "FromUI" and the number of this cd is 1 then
            answer "You are already at the first card."
        else
            go prev
        end if
    else if pl == "next" then
        if pb == "FromUI" and the number of this cd >= the number of cds in this stack then
            answer "You are at the last-most card. You can create a new card by selecting 'New Card' from the Edit menu."
        else
            go prev
        end if
    else
        put false into ret
    end if
    return ret
end domenu_movecard

on domenu_object key, pl, pb
    global doMenuResult
    put true into ret
    if pl == "new button" then
        put "btn" into sendParam
        internalvpcmessagesdirective "makepart" sendParam
        put sendParam into doMenuResult
    else if pl == "new field" then
        put "fld" into sendParam
        internalvpcmessagesdirective "makepart" sendParam
        put sendParam into doMenuResult
    else
        put false into ret
    end if
    return ret
end domenu_object

on domenu_paintsetting key, pl, pb
    global doMenuResult
    put true into ret
    if pl == "wide lines"
        set the widelines to (not the widelines)
    else if pl == "black lines"
        -- DrawPatterns_clrBlack
        set the linecolor to 0 
    else if pl == "white lines"
        -- DrawPatterns_clrWhite
        set the linecolor to 1
    else if pl == "no fill"
        -- make-transparent
        set the fillcolor to -1
    else if pl == "black fill"
        -- DrawPatterns_clrBlack
        set the fillcolor to 0 
    else if pl == "white fill"
        -- DrawPatterns_clrWhite
        set the fillcolor to 1
    else if pl == "multiple"
        set the drawmultiple to (not the drawmultiple)
    else
        put false into ret
    end if
    return ret
end domenu_paintsetting

on domenu_changefont key, pl, pb
    put "|chicago|courier|geneva|new york|times|helvetica|monaco|symbol|" into keys
    if key in keys then
        if "setAll|" in pb then
            replace "setAll|" with "" in pb
            set the textfont of pb to pl
        else
            set the textfont of the selection to pl
        end if
        return true
    else
        return false
    end if
end domenu_changefont

on domenu_changefontsize key, pl, pb
    put "|9|10|12|14|18|24|" into keys
    if key in keys then
        if "setAll|" in pb then
            replace "setAll|" with "" in pb
            set the textsize of pb to pl
        else
            set the textsize of the selection to pl
        end if
        return true
    else
        return false
    end if
end domenu_changefontsize

on domenu_changefontstyle key, pl, pb
    put "|plain|bold|italic|underline|outline|condense|extend|grayed|" into keys
    if key in keys then
        if "setAll|" in pb then
            replace "setAll|" with "" in pb
            set the textstyle of pb to plain
        else if pl == "plain" then
            set the textstyle of the selection to plain
        else
            set the textstyle of the selection to "toggle-" & pl
        end if
        return true
    else
        return false
    end if
end domenu_changefontstyle

       `.replace(/\r\n/g, '\n')
};