
export class VpcStandardLibScript {
    /* provide script,

    only need to put the "trappable" ones here,
    the rest we'll handle by looking at listOfAllBuiltinEventsInOriginalProduct

    */
    static script = `
   on choose whichTool
       vpccalluntrappablechoose whichTool
   end choose

   on arrowkey direction
    if direction == "right" then
        go next
    end if
    if direction == "left" then
        go prev
    end if
   end arrowkey

       `;
}
