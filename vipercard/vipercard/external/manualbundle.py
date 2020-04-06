
smaller = False

srcs = [
    "./chevrotain-6.5.0/chevrotain.min.js" if smaller else "./chevrotain-6.5.0/chevrotain.js",
    # in most cases we use the non-minified version, since it will be served over gzip
    "./base64-js-1.3.1/base64js.min.js", # the non-minified version isn't packaged
    "./bowser-2.9/bowser-2.9-bundled.js",
    "./FileSaver.js-2.0.2/FileSaver.js",
    "./golly/golly.js",
    "./js-lru/js-lru.js",
    "./lz-string-1.4.4/lz-string.js",
    ]

import os
import sys
sys.path.append('../tools/typescript-super-auto-import/bn_python_common.zip')
from bn_python_common import *

def go():
    out = '\n// externalmanualbundle.js\n// changes here will be overwritten\n\n'
    for src in srcs:
        out += f'\n\n// begin:{src}\n'
        out += files.readall(src, encoding='utf-8')

    outname = './externalmanualbundle.js' if smaller else './externalmanualbundle_bigger.js'
    files.writeall(outname, out, encoding='utf-8')

if __name__ == '__main__':
    go()