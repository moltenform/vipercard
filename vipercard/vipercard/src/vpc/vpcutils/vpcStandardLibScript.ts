
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
   end domenu

       `;
}
