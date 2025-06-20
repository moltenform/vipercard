
from readgrammarinput import *


def goForRules(st):
    out = []
    out.append("")
    for rule in st.rules:
        goForRule(out, rule)
    out.append("")
    return out
    
def goForRule(out, rule):
    out.append("")
    out.append(f"Rule{rule.name} = this.RULE('Rule{rule.name}', " + '() => {')
    outRuleDefn = []
    lst = goPrepRule(rule.val, rule.origLine)
    buildRuleDefinition(outRuleDefn, lst, rule.origLine)
    addNumerals(outRuleDefn)
    out.extend(outRuleDefn)
    out.append("});")

def goPrepRule(s, origLine):
    mapToSpecialChars = {
        '{': ' { ',
        '}': ' } ',
        '|': ' | ',
        '[': ' [ ',
        ']': ' ] ',
        '/': ' / ',
        '<': ' <',
        '>': '> ',
    }
    s = s.replace('MANY{{', 'MANY\x01\x01')
    s = s.replace('MANYSEP{{', 'MANYSEP\x01\x01')
    s = s.replace('ATLEASTONESEP{{', 'ATLEASTONESEP\x01\x01')
    s = s.replace('}}ENDMANY', '\x01\x01ENDMANY')
    s = s.replace('}}ENDMANYSEP', '\x01\x01ENDMANYSEP')
    s = s.replace('}}ENDATLEASTONESEP', '\x01\x01ENDATLEASTONESEP')
    # replace with special chars and adds spaces
    for key in mapToSpecialChars:
        s = s.replace(key, mapToSpecialChars[key])
    
    # remove spaces inside the many ones, they are special and will be handled all at once
    def removeSpacesWithinCh(content, start, end):
        if not start in content: return content
        assertEq(2, len(content.split(start)), 'currently can only appear once', start, origLine)
        assertEq(2, len(content.split(end)), 'currently can only appear once', end, origLine)
        before = content.split(start)[0]
        inside = content.split(start)[1].split(end)[0]
        inside = inside.replace(' ', '__space__')
        after = content.split(end)[1]
        return before + start + inside + end + after
    s = removeSpacesWithinCh(s, 'MANY\x01\x01', '\x01\x01ENDMANY')
    s = removeSpacesWithinCh(s, 'MANYSEP\x01\x01', '\x01\x01ENDMANYSEP')
    s = removeSpacesWithinCh(s, 'ATLEASTONESEP\x01\x01', '\x01\x01ENDATLEASTONESEP')
    
    return re.split('\s+', s.strip())

def buildRuleDefinition(out, lst, origLine):
    helpTrackContext = []
    i=-1
    while i < len(lst)-1:
        i+=1
        item = lst[i]
        item = item.strip()
        if item.startswith('MANY\x01\x01') or item.startswith('MANYSEP\x01\x01') or item.startswith('ATLEASTONESEP\x01\x01'):
            handleSpecial(item, out, origLine)
        elif item == '{':
            # begin an alternate
            if lst[i+1].startswith('MAX_LOOKAHEAD'):
                i+=1
                a, lookahead = lst[i].split('=')
                out.append('this.OR000({')
                out.append(f'MAX_LOOKAHEAD: {lookahead.strip()},')
                out.append(f'DEF: [')
                out.append('{')
                out.append('ALT: () => {')
                helpTrackContext.append('OR_WITH_OPTIONS')
            else:
                out.append('this.OR000([')
                out.append('{')
                out.append('ALT: () => {')
                helpTrackContext.append('OR')
        elif item == '|':
            # add an alternate
            out.append('}')
            out.append('},')
            out.append('{')
            out.append('ALT: () => {')
            assertTrue(len(helpTrackContext) > 0, origLine)
            assertTrue(helpTrackContext[-1].startswith("OR"), origLine)
        elif item == '}':
            # close an alternate
            assertTrue(len(helpTrackContext) > 0, origLine)
            if helpTrackContext[-1]=='OR':
                out.append('}')
                out.append('}')
                out.append(']);')
            elif helpTrackContext[-1]=='OR_WITH_OPTIONS':
                out.append('}')
                out.append('}')
                out.append(']});')
            else:
                assertTrue(helpTrackContext[-1].startswith("OR"), origLine)
            helpTrackContext.pop()
        elif item == '[':
            # begin an option
            out.append('this.OPTION000(() => {')
            helpTrackContext.append('OPTION')
        elif item == ']':
            # close an option
            out.append('});')
            assertTrue(len(helpTrackContext) > 0, origLine)
            assertEq("OPTION", helpTrackContext[-1], origLine)
            helpTrackContext.pop()
        else:
            renderSimpleEntry(out, item, origLine, f'unknown symbol/character ({item})')
    
    assertEq(0, len(helpTrackContext), origLine)

def renderSimpleEntry(out, item, origLine, context):
    tp = determineEntry(item, origLine, otherOk=True)
    if tp == 'token':
        out.append(f'this.CONSUME000({renderToken(item)})')
    elif tp == 'rule':
        out.append(f'this.SUBRULE000({renderRule(item)})')
    else:
        assertTrue(False, context, origLine)

def popIfEquals(lst, expect, origLine):
    assertEq(expect, lst[-1], 'or group with only one option?', origLine)
    lst.pop()

def handleSpecial(item, out, origLine):
    type = item.split('\x01')[0]
    contents = item.split('\x01')[2]
    contents = contents.replace('__space__', ' ')
    contentsList = re.split('\s+', contents.strip())
    if type == 'ATLEASTONESEP' or type == 'MANYSEP':
        outText = 'AT_LEAST_ONE_SEP' if type == 'ATLEASTONESEP' else 'MANY_SEP'
        assertEq(3, len(contentsList), f'{type} expects {{a / b}}', origLine )
        assertEq('token', determineEntry(contentsList[0], origLine, otherOk=True), f'{type} currently  expects first part to be a token', origLine )
        assertEq('/', contentsList[1], f'{type} currently  expects 2nd part to be a /', origLine )
        assertEq('rule', determineEntry(contentsList[2], origLine, otherOk=True), f'{type} currently  expects 3rd part to be a subrule', origLine )
        out.append(f'this.{outText}000' + '({')
        out.append(f'SEP: {renderToken(contentsList[0])},')
        out.append('DEF: () => {')
        out.append(f'this.SUBRULE000({renderRule(contentsList[2])});')
        out.append('}')
        out.append('});')
    elif type=='MANY':
        out.append(f'this.{type}000' + '(() => {')
        for item in contentsList:
            renderSimpleEntry(out, item, origLine, 'a MANY block can only contain simple subrules+tokens')
            
        out.append('});')
    else:
        assertTrue(False, 'unknown type', type)
        
def determineEntry(s, origLine, otherOk, moreContext=''):
    if s.startswith('<') and s.endswith('>'):
        return 'rule'
    elif s.startswith('_') or s.startswith('tk'):
        return 'token'
    else:
        if otherOk:
            return '(other)'
        else:
            assertTrue(False, f'not a rule or token, what is it? ({s})', moreContext, origLine)

def renderToken(s):
    return 'tks.' + s
def renderRule(s):
    if s.startswith('<'):
        assertTrue(s.endswith('>'), s)
        s = s[1:-1]
    return f'this.Rule{s}'
    
def addNumeralsIm(lines, plainSearch, reSearch, sophisticated=False):
    assertTrue(plainSearch in reSearch)
    assertTrue('000' in plainSearch)
    count = 0
    haveSeen = {}
    for i, line in enumerate(lines):
        fnd = re.search(reSearch, line)
        if fnd:
            if sophisticated:
                assertTrue(len(fnd.group(1)) > 0)
                key = fnd.group(1).replace(' ','').replace('\t','').replace(';','')
                if key not in haveSeen:
                    haveSeen[key] = 0
                haveSeen[key] += 1
                newFnName = plainSearch.replace('000', str(haveSeen[key]))
                lines[i] = line.replace(plainSearch, newFnName)
            else:
                count += 1
                newFnName = plainSearch.replace('000', str(count))
                lines[i] = line.replace(plainSearch, newFnName)

def addNumerals(lines):
    # these ones are more sophisticated- only increment the number if the actual string inside matches too
    addNumeralsIm(lines, 'CONSUME000', r'this\.CONSUME000(\([^)]+\))', True)
    addNumeralsIm(lines, 'SUBRULE000', r'this\.SUBRULE000(\([^)]+\))', True)
    # these ones are more basic - increment every time we see an option(), even if the insides are different and we don't have to
    # probably fine though, since there won't be too many of these
    addNumeralsIm(lines, 'OPTION000', r'this\.OPTION000\(\(\) => {')
    addNumeralsIm(lines, 'OR000', r'(this\.OR000\(\[|this\.OR000\({)')
    addNumeralsIm(lines, 'AT_LEAST_ONE_SEP000', r'this\.AT_LEAST_ONE_SEP000\(')
    addNumeralsIm(lines, 'MANY_SEP000', r'this\.MANY_SEP000\(')
    addNumeralsIm(lines, 'MANY000', r'this\.MANY000\(')


def writeIntoOutput(f, s):
    content = files.readAll(f, encoding='utf-8')
    assertEq(2, len(content.split(gStart)), 'must appear once', f, gStart)
    assertEq(2, len(content.split(gEnd)), 'must appear once', f, gEnd)
    before = content.split(gStart)[0]
    after = content.split(gEnd)[1]
    news = before + gStart + s + gEnd + after
    files.writeAll(f, news, encoding='utf-8')


