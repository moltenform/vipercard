
# Ben Fisher, 2018
# MIT license

from place_imports_one_line import *
import re

def go(srcdirectory):
    for f, short in files.recursefiles(srcdirectory):
        f = f.replace('\\', '/')
        if short.endswith('.ts'):
            goPerFile(f)

def goPerFile(f):
    if '/bridge/' in f:
        return
    isTestCode = '/test/' in f  or '/ui512demo/' in f 
    if files.getname(f).lower() in ('vpctokens.ts', 'vpcvisitor.ts','vpcparser.ts','vpcvisitormixin.ts'):
        isTestCode = True
        
    lines = getFileLines(f, 'singlelineonly')
    results = []
    for i, line in enumerate(lines):
        if i==0: continue
        prevLine = lines[i-1]
        prevLineComment = prevLine.strip().endswith('*/')
        curLineStart = False
        linestrip = line.strip()
        if linestrip.startswith('export ') or \
            linestrip.startswith('class ') or \
            linestrip.startswith('function ') or \
            linestrip.startswith('interface ') or \
            linestrip.startswith('namespace ') or \
            linestrip.startswith('abstract ') or \
            linestrip.startswith('static ') or \
            linestrip.startswith('async ') or \
            linestrip.startswith('protected ') or \
            linestrip.startswith('private ') or \
            linestrip.startswith('public ') or \
            linestrip.startswith('type '):
                curLineStart = True
        
        # does it look like a method?
        # hopefully won't catch fn calls because those hopefully have a period
        if not isTestCode and not line.endswith(';') and re.search('^ +[a-zA-Z0-9]+\(', line):
            curLineStart = True
        
        if line.strip().startswith('constructor('):
            curLineStart = False
        if line.strip().startswith('assert'):
            curLineStart = False
        if line.strip().startswith('checkThrow'):
            curLineStart = False
        
        if curLineStart and not prevLineComment and not prevLine.endswith(';') and not prevLine.endswith(',') and not prevLine.endswith('{') and not prevLine.endswith('(') \
            and not prevLine.endswith(':') \
            and not prevLine.endswith('>') \
            and not prevLine.endswith('+') \
            and not prevLine.endswith('-') \
            and not prevLine.endswith('&&') \
            and not prevLine.endswith('||'):
            results.append((f, i+1, 'expected a comment'))
    
    # show the results backwards so that as you're fixing it, the offsets are still ok
    results.reverse()
    for a,b,c in results:
        showWarningGccStyle(a,b,c)

if __name__ == '__main__':
    dir = os.path.abspath('../../src')
    go(dir)
