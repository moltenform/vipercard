
from base90 import *
from assertmarkerutils import *
import readconfig

# Ben Fisher, 2018
# this script adds markers to asserts
# it even works if there is a complex condition to be tested
# and it works across multiple lines

def go(srcdirectory, previewOnly):
    assertTrueMsg(files.isdir(srcdirectory), 'directory not found', srcdirectory)
    currentSavedFile = './current_assert_id.txt'
    firstNum = int(files.readall(currentSavedFile, encoding='utf-8').strip()) if files.exists(currentSavedFile) else 1
    state = Bucket(latestMarker = firstNum)
    marksAleadySeen = {}
    
    try:
        for f, short in files.recursefiles(srcdirectory):
            if short.lower().endswith('.ts') and not short in skipFiles:
                goForFile(f, previewOnly, state, marksAleadySeen)
    finally:
        if not previewOnly:
            trace(f'first={firstNum} last={state.latestMarker}')
            files.writeall(currentSavedFile, f'{state.latestMarker}\n', encoding='utf-8')
    
    for key in skipThese:
        if skipThese[key] != 'seen':
            warn('expected to skip this, but not seen. this might mean we accidentally wrote an assert marker ' +
                'to the signature of an assert itself, or it could just mean that the list is not up to date. \n' + key)


def goForFile(f, previewOnly, state, marksAleadySeen):
    content = files.readall(f, encoding='utf-8')
    newcontent = goForFileProcess(f, previewOnly, state, marksAleadySeen, content)
    if newcontent != content: 
        if not previewOnly:
            files.writeall(f, newcontent, encoding='utf-8')

def goForFileProcess(f, previewOnly, state, marksAleadySeen, content):
    skipIfInGeneratedCode = GeneratedCodeDetector(content, f)
    matches = []
    for m in re.finditer(reAssertsToMarker, content):
        which = m.group(0).split('(')[0]
        posStart = m.start(0)
        if not skipIfInGeneratedCode.isInsideGeneratedCode(posStart):
            matches.append((posStart, which))
        
    # iterate the matches backwards so we can alter the string without altering indexes in the document
    matches.reverse()
    for posStart, which in matches:
        prefix, args, suffix, totalLength = parseArguments(content, posStart, f)
        looksLike = prefix+','.join(args)+suffix
        assertTrueMsg(prefix.startswith(which + '('), 'wrong offset? ', looksLike, file=f)
        needRepl = processOneCall(f, state, content, looksLike, marksAleadySeen, posStart, which, prefix, args, suffix, totalLength)
        if needRepl:
            replWith = prefix+','.join(args)+suffix
            trace(f'\t{looksLike}\n\t{replWith}\n')
            assertTrueMsg(len(replWith) >= totalLength, 'making it shorter?', file=f)
            content = splice(content, posStart, totalLength, replWith)
    
    return content

def processOneCall(f, state, content, looksLike, marksAleadySeen, posStart, which, prefix, args, suffix, totalLength):
    reFindMarker = r'''^\s*LS("[^"][^"]|'[^'][^']|`[^`][^`])\|'''
    reFindQuote = r'''^\s*LS(["'`])'''
    reFindMarker = reFindMarker.replace('LS', r'(?:longstr\(\s*)?')
    reFindQuote = reFindQuote.replace('LS', r'(?:longstr\(\s*)?')

    for key in skipThese:
        if key in looksLike:
            skipThese[key] = 'seen'
            return False

    wantIndex = desiredArgIndex[which]
    for narg, arg in enumerate(args):
        fndQuote = re.search(reFindQuote, arg)
        if fndQuote:
            fndMarker = re.search(reFindMarker, arg)
            if fndMarker:
                # it's apparently already marked. make sure it's not a duplicate
                thefoundMarker = fndMarker.group(1)[1:]
                alreadySaw = marksAleadySeen.get(thefoundMarker, False)
                if not alreadySaw:
                    marksAleadySeen[thefoundMarker] = True
                    return False
                else:
                    # duplicate or invalid marker
                    newmarker = genNewMarker(state)
                    assertTrueMsg(2 == len(newmarker), len(newmarker), file=f)
                    marksAleadySeen[newmarker] = True
                    args[narg] = splice(args[narg], fndMarker.start(1)+1, 2, newmarker)
                    return True
            else:
                # string with no marker. add a marker
                if narg >= wantIndex:
                    ind = fndQuote.start(1) + 1
                    newmarker = genNewMarker(state)
                    assertTrueMsg(2 == len(newmarker), len(newmarker), file=f)
                    marksAleadySeen[newmarker] = True
                    args[narg] = splice(args[narg], ind, 0, newmarker + '|' )
                    return True
    # no string literals found at all
    assertTrueMsg(False, 'no string literals found', looksLike, file=f, linenum=lineOffset(content, posStart))

def lineOffset(contents, posStart):
    lines = contents.split('\n')
    total = 0
    for i, line in enumerate(lines):
        total += len(line) + 1
        if total >= posStart:
            return i + 1
    return 1

def genNewMarker(state):
    state.latestMarker += 1
    ret = toBase90(state.latestMarker)
    ret = ret.ljust(2, '0')
    return ret

class GeneratedCodeDetector(object):
    gStart = '/* generated code, any changes past this point will be lost: --------------- */'
    gEnd = '/* generated code, any changes above this point will be lost: --------------- */'
    startInd = None
    endInd = None
    def __init__(self, contents, f=''):
        pts = contents.split(self.gStart)
        if len(pts)==1:
            return
        elif len(pts)==2:
            self.startInd = contents.find(self.gStart)
            self.endInd = contents.find(self.gEnd)
            assertTrue(self.startInd >= 0, 'not seen', self.gStart, f)
            assertTrue(self.endInd >= 0, 'not seen', self.gEnd, f)
            self.startInd += len(self.gStart)
        else:
            assertTrue(False, 'we only support one generated code chunk per file', f)
    def isInsideGeneratedCode(self, index):
        if self.startInd is None or self.endInd is None:
            return False
        return index > self.startInd and index < self.endInd

def tests():
    assertEq(('other fn(', ['1', '2', '3'], ')', 15), parseArguments("other fn(1,2,3)", 0))
    assertEq(('other fn(', ['a b', 'c d', 'e f'], ')', 21), parseArguments("other fn(a b,c d,e f)", 0))
    assertEq(('other fn(', ['ff(a)', 'ff(b)'], ')', 21), parseArguments("other fn(ff(a),ff(b))", 0))
    assertEq(('other fn(', ['ff(f1(a,b), f2(c,d))', 'ff(b)'], ')', 36), parseArguments("other fn(ff(f1(a,b), f2(c,d)),ff(b))", 0))
    assertEq(('other fn(', ['"1,2,3"', '2', '3'], ')', 21), parseArguments('other fn("1,2,3",2,3)', 0))
    assertEq(('other fn(', ['"1\\"2,3"', '2', '3'], ')', 22), parseArguments('other fn("1\\"2,3",2,3)', 0))
    assertEq(('other fn(', ["'1,2,3'", '2', '3'], ')', 21), parseArguments("other fn('1,2,3',2,3)", 0))
    assertEq(('other fn(', ["'1\\'2,3'", '2', '3'], ')', 22), parseArguments("other fn('1\\'2,3',2,3)", 0))
    assertEq(('other fn(', ['`1,2,3`', '2', '3'], ')', 21), parseArguments("other fn(`1,2,3`,2,3)", 0))
    assertEq(('other fn(', ["`1\\'2,3`", '2', '3'], ')', 22), parseArguments("other fn(`1\\'2,3`,2,3)", 0))
    assertEq(('other fn(', ['[1,2]', '2', '3'], ')', 19), parseArguments("other fn([1,2],2,3)", 0))
    assertEq(('other fn(', ['[1,f(a,b)]', '2', '3'], ')', 24), parseArguments("other fn([1,f(a,b)],2,3)", 0))
    assertEq(('other fn(', ['f([1,2],3)', '2', '3'], ')', 24), parseArguments("other fn(f([1,2],3),2,3)", 0))

    assertEq(('fn(', ['1', '2', '3'], ')', 9), parseArguments("'test_test' otherotherotherotherotherother fn(1,2,3)", 43))
    assertEq(('fn(', ['1', '2', '3'], ')', 9), parseArguments("'test\\'tes' otherotherotherotherotherother fn(1,2,3)", 43))

    gStart = GeneratedCodeDetector('').gStart
    gEnd = GeneratedCodeDetector('').gEnd
    exampleDoc = f'first\nlines\n\nthen\n{gStart}\ninside\nthe_generated\narea\n{gEnd}outside\nagain'
    detector = GeneratedCodeDetector(exampleDoc)
    assertTrue(not detector.isInsideGeneratedCode(0))
    assertTrue(not detector.isInsideGeneratedCode(1))
    assertTrue(not detector.isInsideGeneratedCode(exampleDoc.find('then')))
    assertTrue(detector.isInsideGeneratedCode(exampleDoc.find('inside')))
    assertTrue(detector.isInsideGeneratedCode(exampleDoc.find('the_generated')))
    assertTrue(detector.isInsideGeneratedCode(exampleDoc.find('area')))
    assertTrue(not detector.isInsideGeneratedCode(exampleDoc.find('outside')))
    assertTrue(not detector.isInsideGeneratedCode(exampleDoc.find('again')))

tests()

if __name__=='__main__':
    dir, desiredArgIndex, skipThese, skipFiles = readconfig.readconfig()
    sAssertsToMarker = '|'.join( '\\b' + k + '\\(' for k in desiredArgIndex.keys())
    reAssertsToMarker = re.compile(sAssertsToMarker)

    previewOnly = True
    #~ previewOnly = False
    go(dir, previewOnly)

