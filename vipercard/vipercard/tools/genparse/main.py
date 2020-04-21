
# Ben Fisher, 2018
# MIT license

from producetokens import *
from produceparser import *
from producevisitor import *

'''
Tip: if produced code has a syntax error, sometimes looking at
the prettified code can identify the problem, like where there's a missing }
Prettier won't format it, so use a more lenient formatter:
open the file in vscode, select all, rightclick-> format selection with... and choose Typescript language features
'''
    
def go(dir, infiles, outfiles):
    try:
        out = writePropertiesListIntoGrammar(infiles)
        writeIntoOutput(infiles[0], out)
        st = readGrammarFiles(infiles, skipGenerated=False)
        out = goTokensDefnOne(st)
        writeIntoOutput(outfiles.tokens, '\n'.join(out))
        out = goForRules(st)
        writeIntoOutput(outfiles.parse, '\n'.join(out))
        out = goForVisitorInterface(st)
        writeIntoOutput(outfiles.visitorInterface, '\n'.join(out))
        out = makeAllVisitors(st)
        writeIntoOutput(outfiles.visitor, '\n'.join(out))
        checkThatEveryTokensIsReferencedInARule(st, outfiles)
    except:
        # print gcc-style warning
        trace(f'\n{infiles[0]}:1:1 warning: for convenience, click here to open the first input file\n')
        raise
    
if __name__ == '__main__':
    dir = os.path.abspath('../../src')
    infiles = ['bgrammar_01.ccc', 'bgrammarcmds_01.ccc', 'list-all.ccc']
    outfiles = Bucket(
        parse = dir + '/vpc/codeparse/vpcParser.ts',
        tokens = dir + '/vpc/codeparse/vpcTokens.ts',
        visitor = dir + '/vpc/codeparse/vpcVisitor.ts',
        visitorInterface = dir + '/vpc/codeparse/vpcVisitorInterface.ts',
    )
    
    go(dir, infiles, outfiles)

