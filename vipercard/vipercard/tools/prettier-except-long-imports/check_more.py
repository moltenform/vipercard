from place_imports_one_line import *

def shouldWarnHasReplaceString(line):
    # s.replace('a', 'b') only replaces once unlike most languages.
    # we should warn you to use a regex like s.replace(/a/g, 'b' instead)
    if re.search(r'''\.replace\(\s*['"`]''', line):
        return True

def shouldWarnArraysThisLine(line):
    # let ar = []; silently gives you an array of type any!
    # warn you to provide an explicit type
    if re.search(r' [a-zA-Z0-9]+ = \[\]', line):
        return True

def checkText(f, lines):
    assertTrue(isinstance(f, str))
    assertTrue(isinstance(lines, list))
    for i, line in enumerate(lines):
        if shouldWarnArraysThisLine(line):
            showWarningGccStyle(f, i+1, f'saw a statement like "let ar = [];" but we dissallow implicit any[] arrays')
            trace(f'use "let ar:any = [];" if this was intended')
            warn('')
        if shouldWarnHasReplaceString(line):
            showWarningGccStyle(f, i+1, f'''saw a statement like "s.replace('a', 'b')" but you usually mean "s.replace(/a/g, 'b')" ''')
            warn('')
            
    # finds the case where it goes across different lines
    allContent = '\n'.join(lines)
    if shouldWarnHasReplaceString(allContent):
        showWarningGccStyle(f, 1,  f'''saw a statement like "s.replace('a', 'b')" but you usually mean "s.replace(/a/g, 'b')" ''')
        warn('')

def tests():
    assertTrue(shouldWarnArraysThisLine('let ar = [];'))
    assertTrue(not shouldWarnArraysThisLine('let ar:mytype = [];'))
    assertTrue(not shouldWarnArraysThisLine('let ar:number[] = [];'))
    assertTrue(shouldWarnArraysThisLine(' ar = [];'))
    assertTrue(not shouldWarnArraysThisLine(' ar:mytype = [];'))
    assertTrue(not shouldWarnArraysThisLine(' ar:number[] = [];'))
    
    assertTrue(shouldWarnHasReplaceString('s.replace("a", "b")'))
    assertTrue(shouldWarnHasReplaceString("s.replace('a', 'b')"))
    assertTrue(not shouldWarnHasReplaceString('s.replace(/a/, "b")'))
    assertTrue(not shouldWarnHasReplaceString('s.replace(/a/g, "b")'))
    assertTrue(shouldWarnHasReplaceString('s.replace( "a", "b")'))
    assertTrue(shouldWarnHasReplaceString('s.replace( \n "a", "b")'))
    assertTrue(shouldWarnHasReplaceString('s.replace(\n"a", "b")'))

tests()
