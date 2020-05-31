
import os
import sys
sys.path.append('../tools/typescript-super-auto-import/bn_python_common.zip')
from bn_python_common import *

def go(smaller):
    srcs = [
        # in most cases we use the minification doesn't really matter, since it will be served over gzip it only saves a few kb
        "./base64-js-1.3.1/base64js.min.js", # the non-minified version isn't packaged
        "./bowser-2.9/bowser-2.9-bundled.js", # the non-minified version isn't packaged
        "./golly/golly.js",
        ]
    
    out = '\n// externalmanualbundle\n// changes here will be overwritten\n\n'
    for src in srcs:
        out += f'\n\n// begin:{src}\n'
        out += files.readall(src, encoding='utf-8')

    outname = './externalmanualbundlemin.js' if smaller else './externalmanualbundlebig.js'
    trace('writing to', outname)
    out = tabsToSpaces(out)
    files.writeall(outname, out, encoding='utf-8')
    
    srcs = [
        # in most cases we use the minification doesn't really matter, since it will be served over gzip it only saves a few kb
        "./chevrotain-6.5.0/chevrotain.min.js" if smaller else "./chevrotain-6.5.0/chevrotain.js",
        "./FileSaver.js-2.0.2/FileSaver.min.js" if smaller else "./FileSaver.js-2.0.2/FileSaver.js",
        "./js-lru/js-lru.js",
        "./lz-string-1.4.4/lz-string.min.js" if smaller else "./lz-string-1.4.4/lz-string.js",
        ]
    
    out = '\n// externaldelaybundle\n// changes here will be overwritten\n\n'
    for src in srcs:
        out += f'\n\n// begin:{src}\n'
        out += files.readall(src, encoding='utf-8')

    outname = './externaldelaybundlemin.js' if smaller else './externaldelaybundlebig.js'
    trace('writing to', outname)
    out = tabsToSpaces(out)
    files.writeall(outname, out, encoding='utf-8')
    
def tabsToSpaces(s):
    return s.replace('\t', '    ')

def goAll():
    go(True)
    go(False)

if __name__ == '__main__':
    goAll()
