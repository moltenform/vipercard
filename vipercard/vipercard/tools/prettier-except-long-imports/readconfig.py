
import configparser
from place_imports_one_line import *

def go(f):
    cfg = configparser.ConfigParser(delimiters='=')
    # make it case-sensitive
    cfg.optionxform = str
    cfg.read(f)
    
    dir = cfg['main']['dir']
    confirmExists(f, dir, 'dir')
    dir = os.path.abspath(dir)
    
    prettierCfg = cfg['main']['prettierCfg']
    confirmExists(f, prettierCfg, 'prettierCfg')
    assertTrueMsg(prettierCfg.endswith('.js'), f"we don't yet support prettier config types besides .js", file=f)
    
    prettierPath = cfg['main']['prettierPath']
    confirmExists(f, prettierPath, 'prettierPath')
    
    allowLongerLinesOn = []
    for key in cfg['allowLongerLinesOn']:
        v = int(cfg['allowLongerLinesOn'][key])
        if v:
            allowLongerLinesOn.append(key.strip())
    
    tasksDisabled = Bucket()
    for task in knownTasks:
        object.__setattr__(tasksDisabled, task.strip(), False)
    
    for key in cfg['checksToDo']:
        assertTrueMsg(key.strip() in knownTasks, f"unknown task '{key}'", file=f)
        v = int(cfg['checksToDo'][key])
        if not v:
            object.__setattr__(tasksDisabled, key.strip(), True)
    
    return dir, prettierCfg, prettierPath, allowLongerLinesOn, tasksDisabled

def confirmExists(f, path, name):
    if not files.exists(path):
        assertTrueMsg(False, f"in {f} you set {name} to '{path}' but that path does not exist", file=f)

def readconfig():
    assertTrueMsg(files.isFile('config.cfg'), "Could not find config.cfg")
    return go('config.cfg')


knownTasks = [s.strip() for s in '''
    doPlaceImportsOnOneLine
    addFinalLineAndRemoveRightWhitespace
    autoHelpIfTestNamesTooLong
    autoHelpLongLines
    autoHelpSetTestCollectionName
    check_tests_referenced
    check_for_null_coalesce
    additional_checks'''.replace('\r\n', '\n').split('\n') if s]

def absPathToRelative(p):
    p = p.replace('\\', '/')
    me = os.path.abspath(__file__).replace('\\', '/')
    common = os.path.commonpath([me, p])
    assertTrueMsg(common, "paths have nothing in common")
    return os.path.relpath(p, files.getParent(me))

def shouldAllowLongerLinesOn(p, allowLongerLinesOn):
    import fnmatch
    p = absPathToRelative(p)
    for pattern in allowLongerLinesOn:
        if fnmatch.fnmatch(p, pattern):
            return True
    return False

if __name__=='__main__':
    dir, prettierCfg, prettierPath, allowLongerLinesOn, tasksDisabled = readconfig()
    trace(dir)
    trace(prettierCfg)
    trace(prettierPath)
    trace(allowLongerLinesOn)
    trace(tasksDisabled)
    
    