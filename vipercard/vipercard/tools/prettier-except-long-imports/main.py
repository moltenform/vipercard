
# Ben Fisher, 2018
# MIT license

from place_imports_one_line import *
import check_for_null_coalesce
import check_for_long_lines
import check_tests_referenced
import check_more
import help_fix_long_lines
import readconfig

def go(srcdirectory):
    global counting
    counting = [0, 0]
    goPrettierAll(srcdirectory, prettierPath, prettierCfg)
    trace('count of files, longer lines not accepted:', counting[0])
    trace('count of files, longer lines accepted:', counting[1])

def runPrettier(args):
    retcode, stderr, stdout = files.run(args, throwOnFailure=None)
    if retcode != 0:
        s = (stdout + b'\n' + stderr).decode('utf-8')
        # make links clickable
        # example [error] ..\..\src\test\util512ui\testUI512Composites.ts: SyntaxError: ',' expected. (6:54)
        search = r'\[error\] ([^ ]+\.ts): ([\w]+Error: [^\n]+)\(([^)]+)\)'
        def getReplaced(r):
            result = '\n$1:$3 error $2'
            result = result.replace('$1', os.path.abspath(r.group(1))).replace('\\', '/')
            result = result.replace('$2', r.group(2))
            lineInfo = r.group(3) if len(r.groups()) >= 3 else '1:1'
            result = result.replace('$3', lineInfo)
            return result
        s = re.sub(search, getReplaced, s)
        search = r'\[error\] ([^ ]+\.ts): ([\w]+Error: [^\n]+)'
        s = re.sub(search, getReplaced, s)
        trace(s)
        assertTrueMsg(False, "prettier returned failure", file=os.path.abspath(__file__), linenum=4)

def goPrettierAll(srcdirectory, prettierPath, prettierCfg):
    # we used to run prettier individually for each file,
    # but it is a lot faster to run prettier in batch for all files at once.
    # if you need to skip prettier, add a comment in the file or make a .prettierignore file.
    trace('running prettier...')
    check_for_long_lines.checkCurrentQuoteChar(prettierCfg)
    assertTrueMsg(files.exists(prettierPath), 'does not exist', prettierPath)
    assertTrueMsg(files.exists(prettierCfg), 'does not exist', prettierCfg)
    assertTrueMsg(not srcdirectory.endswith('/'))
    assertTrueMsg(not srcdirectory.endswith('\\'))
    args = ['node', prettierPath, '--config', prettierCfg, '--write', srcdirectory.replace('\\', '/') + '/**/*.ts']
    runPrettier(args)
    
    # allow long lines in certain files
    if allowLongerLinesOn:
        prettierCfgLonger = prettierCfg.replace('prettierrc', 'prettierrc_longer')
        assertTrueMsg(files.isfile(prettierCfgLonger), f"file not found: '{prettierCfgLonger}'")
        for file in allowLongerLinesOn:
            args = ['node', prettierPath, '--config', prettierCfgLonger, '--write', file]
            runPrettier(args)
    
    # do other checks per file
    for f, short in files.recursefiles(srcdirectory):
        f = f.replace('\\', '/')
        if short.endswith('.ts'):
            trace(f)
            goPerFile(srcdirectory, f, prettierPath, prettierCfg)
    
    if not tasksDisabled.check_tests_referenced:
        check_tests_referenced.checkTestCollectionsReferenced()

def goPerFile(srcdirectory, f, prettierPath, prettierCfg):
    # first do operations that potentially change file contents
    # must be done in this order, or the file will appear to change out from under you while editing.
    lines = doOperationsThatMightChangeFile(srcdirectory, f, prettierPath, prettierCfg)
    
    # then do operations that ask the user questions
    doOperationsThatAskQuestions(srcdirectory, f, lines, prettierPath, prettierCfg)

def doOperationsThatMightChangeFile(srcdirectory, f, prettierPath, prettierCfg):
    # put long import statements on one line
    # we don't want the import to spill across multiple lines.
    # could maybe do this by passing a range-start to prettier, but let's write it ourselves.
    if not tasksDisabled.doPlaceImportsOnOneLine:
        alltxt = files.readall(f, encoding='utf-8')
        alltxtNew = placeImportsOnOneLine(alltxt)
        if alltxt != alltxtNew:
            print('placing import {} back all on one line')
            files.writeall(f, alltxtNew, encoding='utf-8')
    
    # some simple formatting
    lines = getFileLines(f, False)
    linesOrig = list(lines)
    if not tasksDisabled.addFinalLineAndRemoveRightWhitespace:
        addFinalLineAndRemoveRightWhitespace(lines)
    
    if not tasksDisabled.autoHelpIfTestNamesTooLong:
        help_fix_long_lines.autoHelpIfTestNamesTooLong(f, lines)
        
    if not tasksDisabled.autoHelpLongLines:
        help_fix_long_lines.autoHelpLongLines(f, lines, prettierCfg)
    
    if not tasksDisabled.autoHelpSetTestCollectionName:
        check_tests_referenced.autoHelpSetTestCollectionName(f, lines)
    
    if linesOrig != lines:
        files.writeall(f, '\n'.join(lines), encoding='utf-8')
    return lines

def doOperationsThatAskQuestions(srcdirectory, f, lines, prettierPath, prettierCfg):
    if not tasksDisabled.check_tests_referenced:
        check_tests_referenced.checkText(f, lines)
        
    if not tasksDisabled.check_for_null_coalesce:
        check_for_null_coalesce.checkText(f, lines)
    
    if not readconfig.shouldAllowLongerLinesOn(f, allowLongerLinesOn):
        check_for_long_lines.checkText(f, lines, prettierCfg)
        counting[0] += 1
    else:
        counting[1] += 1
   
    if not tasksDisabled.additional_checks:
        check_more.checkText(f, lines)

if __name__ == '__main__':
    srcdirectory, prettierCfg, prettierPath, allowLongerLinesOn, tasksDisabled = readconfig.readconfig()
    go(srcdirectory)

