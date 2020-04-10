
# Ben Fisher, 2018
# MIT license

from place_imports_one_line import *
import check_for_null_coalesce
import check_for_long_lines
import check_tests_referenced
import check_more
import help_fix_long_lines

doPlaceImportsOnOneLine = True
prettierCfg = '../../.prettierrc.js'
prettierPath = '../../node_modules/prettier/bin-prettier.js'
allowLongerLinesOn = [
    #'../../src/vpc/codeparse/vpcVisitor.ts', '../../src/vpc/codeparse/vpcVisitorMixin.ts',
    '../../src/vpc/**/*.ts',
    '../../src/vpcui/**/*.ts'
]

def go(srcdirectory):
    global prettierCfg, prettierPath
    assertTrueMsg(files.isdir(srcdirectory), 'directory not found', srcdirectory)
    if not files.isfile(prettierCfg):
        prettierCfg = searchForNearbyFile(dir, '.prettierrc.js')
    if not files.isfile(prettierPath):
        prettierPath = searchForNearbyFile(dir, 'node_modules/prettier/bin-prettier.js')
        
    assertTrueMsg(prettierCfg and files.isfile(prettierCfg), 
        'could not find .prettierrc.js')
    assertTrueMsg(prettierPath and files.isfile(prettierPath),
        'could not find node_modules/prettier/bin-prettier.js')
    goPrettierAll(srcdirectory, prettierPath, prettierCfg)

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
    assertTrueMsg(files.exists(prettierPath), 'does not exist', prettierPath)
    assertTrueMsg(files.exists(prettierCfg), 'does not exist', prettierCfg)
    assertTrueMsg(not srcdirectory.endswith('/'))
    assertTrueMsg(not srcdirectory.endswith('\\'))
    args = ['node', prettierPath, '--config', prettierCfg, '--write', srcdirectory.replace('\\', '/') + '/**/*.ts']
    runPrettier(args)
    
    # allow long lines in certain files
    if allowLongerLinesOn:
        prettierCfgLonger = prettierCfg.replace('prettierrc', 'prettierrc_longer')
        for file in allowLongerLinesOn:
            args = ['node', prettierPath, '--config', prettierCfgLonger, '--write', file]
            runPrettier(args)
    
    # do other checks per file
    for f, short in files.recursefiles(srcdirectory):
        f = f.replace('\\', '/')
        if short.endswith('.ts'):
            trace(f)
            goPerFile(srcdirectory, f, prettierPath, prettierCfg)
    
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
    if doPlaceImportsOnOneLine:
        alltxt = files.readall(f, encoding='utf-8')
        alltxtNew = placeImportsOnOneLine(alltxt)
        if alltxt != alltxtNew:
            print('placing import {} back all on one line')
            files.writeall(f, alltxtNew, encoding='utf-8')
    
    # some simple formatting
    lines = getFileLines(f, False)
    linesOrig = list(lines)
    addFinalLineAndRemoveRightWhitespace(lines)
    
    help_fix_long_lines.autoHelpIfTestNamesTooLong(f, lines)
    help_fix_long_lines.autoHelpLongLines(f, lines, prettierCfg)
    check_tests_referenced.autoHelpSetTestCollectionName(f, lines)
    if linesOrig != lines:
        files.writeall(f, '\n'.join(lines), encoding='utf-8')
    return lines
        
def doOperationsThatAskQuestions(srcdirectory, f, lines, prettierPath, prettierCfg):
    check_tests_referenced.checkText(f, lines)
    check_for_null_coalesce.checkText(f, lines)
    assertTrue('../../src/vpc/**/*.ts' in allowLongerLinesOn)
    assertTrue('../../src/vpcui/**/*.ts' in allowLongerLinesOn)
    if '/src/vpc/' not in f.lower().replace('\\', '/') and '/src/vpcui/' not in f.lower().replace('\\', '/'):
        check_for_long_lines.checkText(f, lines, prettierCfg)
    check_more.checkText(f, lines)

if __name__ == '__main__':
    dir = os.path.abspath('../../src')
    go(dir)

