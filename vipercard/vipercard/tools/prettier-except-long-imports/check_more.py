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

def shouldWarnApplyCall(line, silent=False):
    if '.apply(' in line:
        if '/* warn-apply-ok */' in line:
            return False
        
        withinParens = line.split('.apply(')[1].split(')')[0].strip()
        if not withinParens:
            if not silent:
                trace('prettier put it onto many lines')
            return True
        if '(' in withinParens:
            # a nested call like .apply(other()) that we're too lazy to parse
            return True
        if '...' in withinParens:
            # something like [...args] is still dangerous
            return True
        justOneWord = '^(\.|\w)+$'
        if re.search(justOneWord, withinParens):
            return False
        definiteList = '^(\.|\w)+, \[.*?\]$'
        if re.search(definiteList, withinParens):
            return False
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
        if shouldWarnApplyCall(line):
            showWarningGccStyle(f, i+1, f'''apply like a.apply(b) or a.apply(b, [c, d]) are ok, not a.apply(b, args)''')
            trace(f"we think it's unsafe because there could be max arg limits.")
            trace(f'use /* warn-apply-ok */ if this was intended')
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
    
    assertTrue(not shouldWarnApplyCall('a.apply', silent=True))
    assertTrue(shouldWarnApplyCall('a.apply(', silent=True))
    assertTrue(shouldWarnApplyCall('a.apply(\n', silent=True))
    assertTrue(shouldWarnApplyCall('a.apply(a, b', silent=True))
    assertTrue(shouldWarnApplyCall('a.apply(a, b)', silent=True))
    assertTrue(shouldWarnApplyCall('a.apply(a, b, c)', silent=True))
    assertTrue(shouldWarnApplyCall('a.apply(a, b[0])', silent=True))
    assertTrue(shouldWarnApplyCall('a.apply(a, [...args])', silent=True))
    assertTrue(shouldWarnApplyCall('a.apply(a?b, b', silent=True))
    assertTrue(not shouldWarnApplyCall('a.apply(a)', silent=True))
    assertTrue(not shouldWarnApplyCall('a.apply(abc)', silent=True))
    assertTrue(not shouldWarnApplyCall('a.apply(a, [])', silent=True))
    assertTrue(not shouldWarnApplyCall('a.apply(a.b, [])', silent=True))
    assertTrue(not shouldWarnApplyCall('a.apply(a, [0])', silent=True))
    assertTrue(not shouldWarnApplyCall('a.apply(a, [0, 1, 2])', silent=True))
    assertTrue(not shouldWarnApplyCall('a.apply(a, [0, [1], 2])', silent=True))
    assertTrue(not shouldWarnApplyCall('a.apply(a, b, c) /* warn-apply-ok */', silent=True))
    assertTrue(not shouldWarnApplyCall('a.apply(a, b[0]) /* warn-apply-ok */', silent=True))


tests()
