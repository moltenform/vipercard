# Ben Fisher, 2018
# MIT license

from ts_parsing import *

def whichLicense(f):
    if '/bridge/' in f.replace('\\', '/'):
        return None
    
    isMIT = {}
    isMIT['util512.ts'] = 1
    isMIT['util512assert.ts'] = 1
    isMIT['util512higher.ts'] = 1
    isMIT['testtop.ts'] = 1
    isMIT['testutils.ts'] = 1
    isMIT['testutil512.ts'] = 1
    isMIT['testutil512assert.ts'] = 1
    isMIT['testutil512class.ts'] = 1
    isMIT['testutil512higher.ts'] = 1
    if files.getname(f).lower() in isMIT:
        return '/* Released under the MIT license */'
    else:
        return '/* Released under the GPLv3 license */'

def addCopyrightIfRequested(f, linesWithNoAuto, newLinesToAdd, addCopyright):
    if addCopyright and addCopyright not in '\n'.join(linesWithNoAuto):
        which = whichLicense(f)
        if which:
            newLinesToAdd.append('')
            newLinesToAdd.append(addCopyright)
            newLinesToAdd.append(which)
            newLinesToAdd.append('')





    
