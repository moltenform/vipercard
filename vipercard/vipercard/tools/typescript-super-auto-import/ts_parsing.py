
# Ben Fisher, 2018
# MIT license

import os
import sys
import re
sys.path.append('bn_python_common.zip')
from bn_python_common import *

def getSymbolsFromLine(s):
    # negative lookahead so that we don't include abc| or abc"
    for m in re.finditer(r'''(^|[^'"`a-zA-Z_])([a-zA-Z_][0-9a-zA-Z_]*)(?!['"`|])''', s):
        yield m.group(2)

def getFileLines(f, tryToStripComments):
    assertTrue(tryToStripComments in (True, False, 'multilineonly'))
    text = files.readall(f, encoding='utf8')
    if tryToStripComments:
        text = simpleStripMultilineComments(text, '/*', '*/')
    lines = text.replace('\r\n', '\n').split('\n')
    if tryToStripComments and tryToStripComments != 'multilineonly':
        lines = [line.split('//')[0] for line in lines]
    return lines

def searchForNearbyFile(srcdirectory, name):
    if files.isfile(files.join(srcdirectory, f'{name}')):
        return files.join(srcdirectory, f'{name}')
    if files.isfile(files.join(srcdirectory, f'src/{name}')):
        return files.join(srcdirectory, f'src/{name}')
    if files.isfile(files.join(srcdirectory, f'../{name}')):
        return files.join(srcdirectory, f'../{name}')
    if files.isfile(files.join(srcdirectory, f'../src/{name}')):
        return files.join(srcdirectory, f'../src/{name}')
    if files.isfile(files.join(srcdirectory, f'../../{name}')):
        return files.join(srcdirectory, f'../../{name}')
    return None

def readPrettierRcContents(dir):
    cfg = searchForNearbyFile(dir, '.prettierrc.js')
    if cfg:
        return '\n'.join(getFileLines(cfg, tryToStripComments=True))
    else:
        return None

def simpleStripMultilineComments(text, open, close):
    # still fails on strings, but handles complicated/nested cases better
    # tests in check_for_null_coalesce.py
    while True:
        fnd = text.find(open)
        if (fnd == -1):
            return text

        cls = text[fnd:].find(close)
        if (cls == -1):
            return text[0: fnd]

        cls += fnd + len(close)
        text = text[0: fnd] + text[cls:]

def assertTrueMsg(condition, *messageArgs, file=None, linenum=1):
    if not condition:
        if file:
            showWarningGccStyle(file, linenum, *messageArgs)
        s = ' '.join(map(getPrintable, messageArgs)) if messageArgs else ''
        alert('Could not continue. ' + s)
        raise AssertionError(s)

def showWarningGccStyle(file, linenum, *messageArgs):
    # trace a gcc-style warning,
    # this way SciTE or vscode will make a clickable link.
    s = ' '.join(map(getPrintable, messageArgs)) if messageArgs else 'unknown warning'
    trace(f'{file}:{linenum}:1 warning: {s}')

def tests():
    testinput = '''abc, def, ghi, v1'''
    expected = ['abc', 'def', 'ghi', 'v1']
    assertEq(expected, list(getSymbolsFromLine(testinput)))
    testinput = '''  x = myFn('', h.walkNext(), 'GO|');'''
    expected = ['x', 'myFn', 'h', 'walkNext']
    assertEq(expected, list(getSymbolsFromLine(testinput)))
    testinput = ''' 's1', `s2`, "s3" '''
    expected = []
    assertEq(expected, list(getSymbolsFromLine(testinput)))

tests()
