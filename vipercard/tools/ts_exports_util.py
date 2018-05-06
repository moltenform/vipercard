
# ts_exports_util.py
# Ben Fisher, 2017

import os as _os
import sys
import subprocess

def exists(s):
    return _os.path.exists(s)

def recursefiles(root, filenamesOnly=False, allowedexts=None,
        fnFilterDirs=None, includeFiles=True, includeDirs=False, topdown=True):
    assert _os.path.isdir(root)
    
    for (dirpath, dirnames, filenames) in _os.walk(root, topdown=topdown):
        if fnFilterDirs:
            newdirs = [dir for dir in dirnames if fnFilterDirs(join(dirpath, dir))]
            dirnames[:] = newdirs
        
        if includeFiles:
            for filename in (filenames if sys.platform.startswith('win') else sorted(filenames)):
                if not allowedexts or getext(filename) in allowedexts:
                    yield filename if filenamesOnly else (dirpath + _os.path.sep + filename, filename)
        
        if includeDirs:
            yield getname(dirpath) if filenamesOnly else (dirpath, getname(dirpath))

def splice(s, insertionpoint, lenToDelete, newtext):
    return s[0:insertionpoint] + newtext + s[insertionpoint + lenToDelete:]


def assertTrue(condition, *messageArgs):
    if not condition:
        msg = ' '.join(map(getPrintable, messageArgs)) if messageArgs else ''
        raise AssertionError(msg)
        
def assertEq(expected, received, *messageArgs):
    if expected != received:
        import pprint
        msg = ' '.join(map(getPrintable, messageArgs)) if messageArgs else ''
        msg += '\nassertion failed, expected:\n'
        msg += getPrintable(pprint.pformat(expected))
        msg += '\nbut got:\n'
        msg += getPrintable(pprint.pformat(received))
        raise AssertionError(msg)

def getPrintable(s):
    # see ben_python_common for full implementation
    return str(s)
            
def myfilesreadall(path):
    f=open(path, encoding='utf-8')
    txt = f.read()
    f.close()
    return txt
    
def myfileswriteall(path, txt):
    f=open(path, 'w', encoding='utf-8')
    f.write(txt)
    f.close()
    
def delIfExists(path):
    if _os.path.exists(path):
        _os.unlink(path)
    
def getInputBool(prompt, flushOutput=True):
    prompt += ' '
    while True:
        s = getRawInput(prompt, flushOutput).strip()
        if s == 'y':
            return True
        if s == 'n':
            return False
        if s == 'Y':
            return 1
        if s == 'N':
            return 0
        if s == 'BRK':
            raise KeyboardInterrupt()

def warn(s):
    print('WARNING ' + s)
    if not getInputBool('continue?'):
        raise RuntimeError()

def getRawInput(prompt, flushOutput=True):
    import sys
    print(getPrintable(prompt))
    if flushOutput:
        sys.stdout.flush()
    if sys.version_info[0] <= 2:
        return raw_input(getPrintable(''))
    else:
        return input(getPrintable(''))

def runProcess(listArgs, shell=False, createNoWindow=True,
        throwOnFailure=RuntimeError, stripText=True, captureoutput=True, silenceoutput=False,
        wait=True):
    kwargs = {}
    if sys.platform.startswith('win') and createNoWindow:
        kwargs['creationflags'] = 0x08000000
    
    if captureoutput and not wait:
        raise ValueError('captureoutput implies wait')
    
    if throwOnFailure and not wait:
        raise ValueError('throwing on failure implies wait')
    
    retcode = -1
    stdout = None
    stderr = None
    
    if captureoutput:
        sp = subprocess.Popen(listArgs, shell=shell,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs)
        
        comm = sp.communicate()
        stdout = comm[0]
        stderr = comm[1]
        retcode = sp.returncode
        if stripText:
            stdout = stdout.rstrip()
            stderr = stderr.rstrip()

    else:
        if silenceoutput:
            stdoutArg = open(_os.devnull, 'wb')
            stderrArg = open(_os.devnull, 'wb')
        else:
            stdoutArg = None
            stderrArg = None
        
        if wait:
            retcode = subprocess.call(listArgs, stdout=stdoutArg, stderr=stderrArg, shell=shell, **kwargs)
        else:
            subprocess.Popen(listArgs, stdout=stdoutArg, stderr=stderrArg, shell=shell, **kwargs)
        
    if throwOnFailure and retcode != 0:
        if throwOnFailure is True:
            throwOnFailure = RuntimeError

        exceptionText = 'retcode is not 0 for process ' + \
            str(listArgs) + '\nstdout was ' + str(stdout) + \
            '\nstderr was ' + str(stderr)
        raise throwOnFailure(getPrintable(exceptionText))
    
    return retcode, stdout, stderr

def takeBatchOnArbitraryIterable(iterable, size):
    import itertools
    it = iter(iterable)
    item = list(itertools.islice(it, size))
    while item:
        yield item
        item = list(itertools.islice(it, size))

def takeBatch(l, n):
    """ Yield successive n-sized chunks from l."""
    return list(takeBatchOnArbitraryIterable(l, n))
