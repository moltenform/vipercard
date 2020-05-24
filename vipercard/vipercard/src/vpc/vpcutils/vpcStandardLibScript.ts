
/* auto */ import { OrdinalOrPosition, checkThrow } from './vpcEnums';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */



/**
 * some of ViperCard is implemented in ViperCard!
 * commands like push and pop are simple enough to be
 * implemented right here without much custom parsing.
 * if code here needs special abilities, we'll call
 * internalvpcmessagesdirective, which can do anything.
 */
export const VpcStandardLibScript = /* static class */ {
    handlersImplementedInSoftware: {
        push: true,
        pop: true,
        choose: true,
        domenu: true,
        help: true
    },

    script: `
-- we could put a default "on mousedown" here, but instead we designate
-- messages like mousedown to become a no-op if they are missing, for perf.

-- MESSAGES THAT THE USER CAN OVERRIDE ---------------------
on choose whichTool
    vpccalluntrappablechoose whichTool
end choose

on errorDialog pa
    vpccalluntrappableerrordialog pa
end errorDialog

on help
    errorDialog "Help is not supported."
end help

on arrowkey direction
    if direction == "right" then
        go next
    else if direction == "left" then
        go prev
    end if
end arrowkey

on push
    global internalvpcpushimpl
    put return & the short id of this cd after internalvpcpushimpl
end push

on pop actuallyMove
    global internalvpcpushimpl
    put internalvpcpushimplgetlastonstack() into theId
    if actuallyMove then
        go to cd id theId
    end if
    return the long id of cd id theId
end pop

function internalvpcpushimplgetlastonstack
    global internalvpcpushimpl
    if the number of lines of internalvpcpushimpl <= 1 then
        return the short id of cd 1
    end if
    repeat with x = the number of lines of internalvpcpushimpl down to 1
        if there is a cd id (line x of internalvpcpushimpl) then
            put line x of internalvpcpushimpl into ret
            put line 1 to (x-1) of internalvpcpushimpl into internalvpcpushimpl
            return ret
        end if
    end repeat
    return the short id of cd 1
end internalvpcpushimplgetlastonstack

-- HELPERS FOR MOVING, CREATING, DELETING OBJECTS
-- it's much simpler to send messages in code

-- 'go cd 1' becomes this:
on internalvpcmovecardhelper nextId, shouldSuspendHistory
    -- cache card id in case another gotocard happens
    -- order confirmed for all of these, in the product
    put goCardDestinationFromObjectId(nextId) into nextCard
    put the short id of this cd into prevCard
    if prevCard != nextCard and length(nextCard) > 0 then
        internalvpcmessagesdirective "closeorexitfield" prevCard
        send "closecard" to cd id prevCard
        if the short id of (the owner of cd id prevCard) is not the short id of (the owner of cd id nextCard) then
            send "closebackground" to cd id prevCard
        end if
        global internalvpcmovecardimplsuspendhistory
        if length(shouldSuspendHistory) > 0 then
            put 1 into internalvpcmovecardimplsuspendhistory
        end if
        internalvpcmessagesdirective "viseffect" nextCard
        internalvpcmessagesdirective "gotocardsendnomessages" nextCard
        put 0 into internalvpcmovecardimplsuspendhistory
        if the short id of (the owner of cd id prevCard) is not the short id of (the owner of cd id nextCard) then
            send "openbackground" to cd id nextCard
        end if
        send "opencard" to cd id nextCard
    else if length(nextCard) > 0 then
        internalvpcmessagesdirective "viseffect" nextCard
    end if
    if shouldSuspendHistory == "applyback" then
        put "back" into vsend
        internalvpcmessagesdirective "applybackforth" vsend
    else if shouldSuspendHistory == "applyforth" then
        put "forth" into vsend
        internalvpcmessagesdirective "applybackforth" vsend
    end if
    if length(nextCard) > 0 then
        return ""
    else
        return "No such card"
    end if
end internalvpcmovecardhelper

function goCardDestinationFromObjectId nextId
    if objectById(nextId) == "" then
        -- returns "" if the object does not exist
        return ""
    end if
    put word 1 of objectById(nextId) into objType
    if word 2 of objectById(nextId) is "button" then
        errordialog "Cannot go to a button"
    else if word 2 of objectById(nextId) is "field" then
        errordialog "Cannot go to a field"
    else if objType == "card" then
        return nextId
    else if objType == "bkgnd" then
        if the short id of (the owner of this cd) is nextId then
            return the short id of this cd
        else
            return the short id of cd 1 of bkgnd id nextId
        end if
    else if objType == "stack" then
        return the short id of this cd
    else
        errordialog "Cannot go to this type of object"
    end if
end goCardDestinationFromObjectId

-- 'delete cd btn 1' becomes this:
on internalvpcdeletevelhelper internalId, userfacingId
    if objectById(internalId) == "" then
        errorDialog "Delete failed, object not found."
    end if
    -- 1) send messages
    put word 1 of objectById(internalId) into objType
    if word 2 of objectById(internalId) is "button" then
        if objType is "bkgnd" then
            send "deleteButton" to bkgnd btn id userfacingId
        else
            send "deleteButton" to cd btn id userfacingId
        end if
    else if word 2 of objectById(internalId) is "field" then
        if objType is "bkgnd" then
            send "deleteField" to bkgnd fld id userfacingId
        else
            send "deleteField" to cd fld id userfacingId
        end if
    else if objType == "card" then
        if internalId == the short id of this cd then
            put the short id of this cd into prevCd
            go next
            if the short id of this cd is prevCd then
                errorDialog "Delete failed, cannot delete this card. Is it the only card in the stack?"
            end if
        end if

        send "deleteCard" to cd id internalId
        if the number of cds in (the owner of cd id internalId) is 1 then
            send "deleteBackground" to cd id internalId
        end if
    else if objType = "bkgnd" then
        internalvpcdeletevelhelper_bg internalId
    else
        errorDialog "Cannot delete this type of object"
    end if

    -- 2) remove it
    if objType != "bkgnd" then
        put internalId into sendParam
        internalvpcmessagesdirective "removevelwithoutmsg" sendParam
        return sendParam
    end if
end internalvpcdeletevelhelper





on internalvpcdeletevelhelper_bg bgId
    if the short id of (the owner of this cd) is bgId then
        -- try to find the first card that's not not in the bg and go there
        put "" into found
        repeat with x = 1 to the number of cards
            if the short id of (the owner of cd x) is not bgId then
                put the short id of cd x into found
                exit repeat
            end if
        end repeat
        if length(found) <= 0 then
             errorDialog "Cannot delete this background, is it the only background?"
        end if
        go to card id found
    end if
    put "" into toDelete
    repeat with x = 1 to the number of cards in bg id bgId
        put the short id of cd x of bg id bgId into line x of toDelete
    end repeat
    repeat with x = 1 to the number of lines in toDelete
        delete cd id (line x of toDelete)
    end repeat
end internalvpcdeletevelhelper_bg


--on internalvpcnewbghelper
--    put the short id of this cd into prevCard
--    internalvpcmessagesdirective "closeorexitfield" prevCard
--    send "closecard" to cd id prevCard
--    send "closebackground" to cd id prevCard
--    internalvpcmessagesdirective "makenewbgsendnomessages"
--    put the result into nextCard
--    internalvpcmessagesdirective "gotocardsendnomessages" nextCard
--    send "newbackground" to cd id nextCard
--    send "newcard" to cd id nextCard
--    send "openbackground" to cd id nextCard
--    send "opencard" to cd id nextCard
--end internalvpcnewbghelper


       `.replace(/\r\n/g, '\n')
};
