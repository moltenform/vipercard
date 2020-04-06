
# Ben Fisher, 2018
# MIT license

import os
import sys
import re
sys.path.append('../typescript-super-auto-import/bn_python_common.zip')
from bn_python_common import *
sys.path.append('../typescript-super-auto-import')
from ts_parsing import *

def placeImportsOnOneLine(s):
    lines = s.replace('\r\n', '\n').split('\n')
    outlines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        i += 1
        if line.startswith('/* auto */ import {') and not ';' in line:
            outlines.append(line)
            while True:
                line = lines[i]
                if not outlines[-1].endswith(' '): 
                    outlines[-1] += ' '
                outlines[-1] += line.strip()
                i += 1
                if ';' in line or '}' in line:
                    break
        else:
            outlines.append(line)
    
    # place empty line to start the file, looks nicer,
    # and also is needed by our typescript-super-auto-import
    if outlines[0] != '':
        outlines.insert(0, '')
    return '\n'.join(outlines)

def addFinalLineAndRemoveRightWhitespace(lines):
    if lines[-1] != '':
        print('adding final blank line')
        lines.append('')
    
    for i in range(len(lines)):
        stripped = lines[i].rstrip()
        if lines[i] != stripped:
            print('removing whitespace on right of line')
        lines[i] = stripped

testInput = r'''
not an import
not an import {
not an import { from "invalid.js";
import { a, b, c } from
    "leave.js";
/* auto */ import { a } from "good1.js";
/* auto */ import { a, b, c } from "good2.js";
/* auto */ import { a, b, c } from "good3.js";
/* auto */ import { a, b, c } from
    "not good1.js";
/* auto */ import { a, b, c } from
    "not good2.js";
/* auto */ import { a, b, c }
    from "not good3.js";
/* auto */ import { a, b, c 
    }  from "not good4.js";
other code
/* auto */ import { a, b,
    c
} from "not good5.js";
other code
/* auto */ import { 
    a, b,
    c 
    } from "not good6.js";
remaining code
other code
'''

testExpected = r'''
not an import
not an import {
not an import { from "invalid.js";
import { a, b, c } from
    "leave.js";
/* auto */ import { a } from "good1.js";
/* auto */ import { a, b, c } from "good2.js";
/* auto */ import { a, b, c } from "good3.js";
/* auto */ import { a, b, c } from "not good1.js";
/* auto */ import { a, b, c } from "not good2.js";
/* auto */ import { a, b, c } from "not good3.js";
/* auto */ import { a, b, c }  from "not good4.js";
other code
/* auto */ import { a, b, c } from "not good5.js";
other code
/* auto */ import { a, b, c } from "not good6.js";
remaining code
other code
'''

got = placeImportsOnOneLine(testInput)
assertEq(testExpected, got)


