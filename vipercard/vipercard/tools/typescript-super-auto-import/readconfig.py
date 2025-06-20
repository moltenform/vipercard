import configparser
from ts_parsing import *

def go(f):
    cfg = configparser.ConfigParser(delimiters='=')
    # make it case-sensitive
    cfg.optionxform = str
    cfg.read(f)
    
    dir = cfg['main']['dir']
    confirmExists(f, dir, 'dir')
    dir = os.path.abspath(dir)
    
    useSingleQuotes = cfg['main']['useSingleQuotes']
    useSingleQuotes = int(useSingleQuotes)
    
    return dir, useSingleQuotes, cfg

def confirmExists(f, path, name):
    if not files.exists(path):
        assertTrueMsg(False, f"in {f} you set {name} to '{path}' but that path does not exist", file=f)

def readconfig():
    assertTrueMsg(files.isFile('config.cfg'), "Could not find config.cfg")
    return go('config.cfg')

if __name__=='__main__':
    dir, useSingleQuotes, cfg = readconfig()
    trace(dir)
    trace(useSingleQuotes)
    trace(cfg)
    
    

