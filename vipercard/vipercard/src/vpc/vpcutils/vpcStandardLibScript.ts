
export class VpcStandardLibScript {
    /* provide script,

    only need to put the "trappable" ones here,
    the rest we'll handle by looking at listOfAllBuiltinEventsInOriginalProduct

    */
    static script = `
on choose whichTool
    vpccalluntrappablechoose whichTool
end choose

on domenu a, b
    vpccalluntrappabledomenu a, b
end choose

on arrowkey direction
    if direction == "right" then
        go next
    end if
    if direction == "left" then
        go prev
    end if
end arrowkey

on internalvpcmovecardhelper nextCard, isBackForth
    -- cache card id in case another gotocard happens
    -- order confirmed for all of these, in the product
    put the short id of this cd into prevCard
    if cardId != nextCard and length(nextCard) then
        internalvpcmovecarddirective "closeorexitfield" prevCard
        send "closecard" to cd id prevCard
        if the id of the owner of cd id prevCard is not the id of the owner of cd id nextCard then
            send "closebackground" to cd id prevCard
        end if
        global internalvpcmovecardimplsuspendhistory
        if isBackForth then
            put 1 into internalvpcmovecardimplsuspendhistory
        end if
        internalvpcmovecarddirective "goToCardSendNoMessages" nextCard
        put 0 into internalvpcmovecardimplsuspendhistory
        if the id of the owner of cd id prevCard is not the id of the owner of cd id nextCard then
            send "openbackground" to cd id nextCard
        end if
        send "opencard" to cd id nextCard
    end if
    if length(nextCard) then
        return ""
    else
        return "No such card"
    end if
end internalvpcmovecardhelper

on internalvpcnewbghelper
    put the short id of this cd into prevCard
    internalvpcmovecarddirective "closeorexitfield" prevCard
    send "closecard" to cd id prevCard
    send "closebackground" to cd id prevCard
    internalvpcmovecarddirective "makenewbgsendnomessages"
    put the result into nextCard
    internalvpcmovecarddirective "goToCardSendNoMessages" nextCard
    send "newbackground" to cd id nextCard
    send "newcard" to cd id nextCard
    send "openbackground" to cd id nextCard
    send "opencard" to cd id nextCard
end internalvpcnewbghelper

on internalvpcnewcdhelper
    put the short id of this cd into prevCard
    internalvpcmovecarddirective "closeorexitfield" prevCard
    send "closecard" to cd id prevCard
    internalvpcmovecarddirective "makenewcdsendnomessages"
    put the result into nextCard
    internalvpcmovecarddirective "goToCardSendNoMessages" nextCard
    send "newcard" to cd id nextCard
    send "opencard" to cd id nextCard
end internalvpcnewcdhelper



       `;
}
