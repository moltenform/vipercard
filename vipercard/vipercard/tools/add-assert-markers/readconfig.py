
from assertmarkerutils import *
import configparser

def go(f):
    cfg = configparser.ConfigParser(delimiters='=')
    # make it case-sensitive
    cfg.optionxform = str
    cfg.read(f)
    
    dir = cfg['main']['dir']
    dir = os.path.abspath(dir)
    
    desiredArgIndex = {}
    for key in cfg['assertsToMarkAndWhichArgument']:
        desiredArgIndex[key.strip()] = \
            int(cfg['assertsToMarkAndWhichArgument'][key])
    assertTrueMsg(len(desiredArgIndex) > 0, 
        'no entries in assertsToMarkAndWhichArgument')
    
    skipThese = {}
    for key in cfg['linesToSkip']:
        val = cfg['linesToSkip'][key]
        assertEq('skip', val, 'for key', key)
        skipThese[key.strip().replace('{{NEWLINE}}', '\n')] = True
    
    skipFiles = {}
    for key in cfg['filesToSkip']:
        val = cfg['filesToSkip'][key]
        assertEq('skip', val, 'for key', key)
        skipFiles[key.strip().replace('{{NEWLINE}}', '\n')] = True
    
    return dir, desiredArgIndex, skipThese, skipFiles

def readconfig():
    assertTrueMsg(files.isFile('config.cfg'), "Could not find config.cfg")
    return go('config.cfg')
    
if __name__=='__main__':
    dir, desiredArgIndex, skipThese, skipFiles = readconfig()
    trace(desiredArgIndex)
    trace(skipThese)
    trace(skipFiles)

