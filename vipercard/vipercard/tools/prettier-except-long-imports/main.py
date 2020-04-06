
# Ben Fisher, 2018
# MIT license

from place_imports_one_line import *
import check_for_null_coalesce
import check_for_long_lines
import check_tests_referenced
import help_fix_long_lines

doPlaceImportsOnOneLine = True
prettierCfg = '../../.prettierrc.js'
prettierPath = '../../node_modules/prettier/bin-prettier.js'
allowLongerLinesOn = ['../../src/vpc/codeparse/vpcVisitor.ts', '../../src/vpc/codeparse/vpcVisitorMixin.ts']

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
    files.run(args)
    
    # allow long lines in certain files
    if allowLongerLinesOn:
        prettierCfgLonger = prettierCfg.replace('prettierrc', 'prettierrc_longer')
        for file in allowLongerLinesOn:
            args = ['node', prettierPath, '--config', prettierCfgLonger, '--write', file]
            files.run(args)
    
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
    check_for_long_lines.checkText(f, lines, prettierCfg)

if __name__ == '__main__':
    dir = os.path.abspath('../../src')
    go(dir)

