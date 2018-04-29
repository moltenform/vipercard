
from ts_exports_read import *
import subprocess

prettier = r'../vipercard/node_modules/prettier/bin-prettier.js'
tslint = r'../vipercard/node_modules/tslint/bin/tslint'

def goTsLint(srcdirectory):
    args = ['node', tslint,  '--project', '../vipercard/tsconfig.json', '--config', '../vipercard/tslint.json']
    retcode, stdout, stderr = runProcess(args, throwOnFailure=None)
    sterr = (stderr.decode('utf8').replace('\\n', '\n'))
    stout = (stdout.decode('utf8').replace('\\n', '\n'))
    allout = sterr + '\n' + stout
    # reformat errors for SciTE
    allout = re.sub(r'ts\[([0-9]+), ([0-9]+)]:', r'ts:\1:\2:', allout)
    print(allout)

def goPrettier(srcdirectory):
    for file, short in recursefiles(srcdirectory):
        file = file.replace('\\', '/')
        if short.endswith('.ts'):
            print(file)
            # we don't want the import to spill across multiple lines.
            # could do this by passing a range-start to prettier, but instead let's write it ourselves.
            args = ['node', prettier, '--config', './run_prettier.json', '--write', file]
            r = runProcess(args)
            print(r)
            
            alltxt = myfilesreadall(file)
            alltxtNew = placeImportsOnOneLine(alltxt)
            if alltxt != alltxtNew:
                print('placing import {} back all on one line')
                myfileswriteall(file, alltxtNew)
            
def placeImportsOnOneLine(s):
    lines = s.replace('\r\n', '\n').split('\n')
    outlines = []
    i = 0
    while i<len(lines):
        line = lines[i]
        if line.startswith('/* auto */ import {') and not ';' in line:
            outlines.append(line)
            i+=1
            while True:
                line = lines[i]
                if not outlines[-1].endswith(' '): 
                    outlines[-1] += ' '
                outlines[-1] += line.strip()
                i+=1
                if ';' in line:
                    break
        else:
            outlines.append(line)
            i += 1
    
    # place empty line to start the file, looks nicer
    if outlines[0] != '':
        outlines.insert(0, '')
    return '\n'.join(outlines)

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
    from
    "not good3.js";
/* auto */ import { a, b, c 
    }
    from
    "not good4.js";
other code
/* auto */ import { a, b,
    c
    }
    from
    "not good5.js";
other code
/* auto */ import { 
    a, b,
    c 
    }
    from
    "not good6.js";
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
/* auto */ import { a, b, c } from "not good4.js";
other code
/* auto */ import { a, b, c } from "not good5.js";
other code
/* auto */ import { a, b, c } from "not good6.js";
remaining code
other code
'''

got = placeImportsOnOneLine(testInput)
assertEq(testExpected, got)

if __name__ == '__main__':
    # "trailingComma": "es5", 
    # "trailingComma": "none", 
    srcdirectory = '../vipercard/src'
    goPrettier(srcdirectory)
    goTsLint(srcdirectory)
