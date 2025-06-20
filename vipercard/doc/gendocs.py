

# gendocs.py
# Ben Fisher, 2017

import re
import json
import sys
from collections import OrderedDict
import enum

# if documentation needs to have a real ^ or ` character,
# it should use $caret$ or $backtic1$ or $backtic$

sys.path.append('../vipercard/tools/typescript-super-auto-import/bn_python_common.zip')
from bn_python_common import *

def parseSection(txt):
    out = []
    longOnes = re.compile('\n' +'=' * 50 + '*\n')
    pts = re.split(longOnes, txt)
    assertTrue(not pts[0].strip(), 'text outside?', pts[0].strip())
    pts.pop(0) # get rid of any first ones
    if len(pts)%2 != 0:
        assertTrue(False, "uneven start and stop titles?")
    for title, body in takeBatch(pts, 2):
        title = title.strip()
        assertTrue(title.startswith('===='), 'not a title?', title)
        title = title.replace('=', '').strip()
        title = title.replace('___', ' ')
        assertTrue(not '\n' in title, 'title must be one line')
        body = parseBody(body, title)
        if title.strip()[0] == '(':
            shortTitle = title
        else:
            shortTitle = title.split('(')[0]
        
        out.append((shortTitle, title, body))
    return out
    
def parseBody(txt, title):
    # Examples should automatically be given code-formatting
    exfind = '\nExamples:'
    hasExamples = txt.find(exfind)
    if hasExamples!=-1:
        txt = txt[0:hasExamples + len(exfind)] + '\n`' + txt[hasExamples + len(exfind):] + '\n`\n'
    
    # check code-formatting
    # a - 1
    # a`b`c - 3
    # a`b ` c `d `e -5
    assertTrue(len(txt.split('`')) % 2 == 1, "unclosed `?", title)
    # check sub-headers
    assertTrue(len(txt.split('^')) % 2 == 1, "unclosed ^?", title)
    if not txt.endswith('\n'):
        txt+='\n'
    return txt
    
def parseAll(f):
    trace('parsing...')
    out = OrderedDict()
    for f, short in files.listFiles(f):
        if short.startswith('reference_') and not '.' in short:
            trace(f'{short}...')
            section = parseSection(files.readAll(f, encoding='utf-8'))
            out[short] = section
    return out
    
if __name__=='__main__':
    parseAll('.')
