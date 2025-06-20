# Ben Fisher, 2018
# MIT license

from ts_parsing import *

def whichLicense(config, default, f):
    f = f.replace('\\', '/')
    for key in config['copyrightSkipPathsThatIncludeThis']:
        if key.strip() in f:
            return None
    
    for key in config['copyrightOverrides']:
        if files.getName(f).lower() == key.strip().lower():
            return config['copyrightOverrides'][key].strip()
        
    return default

def addCopyrightIfEnabled(config, f, linesWithNoAuto, newLinesToAdd):
    firstline = config['main']['copyrightFirstLine'].strip()
    default = config['main']['copyrightDefault'].strip()
    if not firstline:
        trace('not setting copyright, copyrightFirstLine is empty.')
        return
    if not default:
        trace('not setting copyright, copyrightDefault is empty.')
        return
    
    secondline = whichLicense(config, default, f)
    if secondline:
        contents = '\n'.join(linesWithNoAuto)
        if firstline in contents:
            # it looks like we've already added the copyright
            assertTrueMsg(firstline+'\n'+secondline in contents, "second line differs from what was expected", file=f)
            return
        
        newLinesToAdd.append('')
        newLinesToAdd.append(firstline)
        newLinesToAdd.append(secondline)
        newLinesToAdd.append('')





    
