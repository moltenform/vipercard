
# Ben Fisher, 2018
# MIT license

from producetokens import *
from produceparser import *
from producevisitor import *

'''
make oneofwords case insensitive

need to transform "the selection" into "selection" which is a special variable to read from/write to
need to remember through which card it was accessed, "bg fld 1 of card 2" is different than "bg fld 1 of card 1"
look for tokenpart and raise an error saying "we don't support part yet"
rewrite put 4 => put 4 into message box?

https://github.com/SAP/chevrotain/blob/master/examples/implementation_languages/typescript/typescript_json.ts

https://sap.github.io/chevrotain/docs/tutorial/step4_fault_tolerance.html#introduction


Tip: if produced code has a syntax error, Prettier won't format it
So open the file in vscode, select all, rightclick-> format selection with... and choose Typescript language features
This formatter is more lenient

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
    infiles = ['bgrammar_01.ccc', 'bgrammarcmds_00.ccc', 'list-all.ccc']
    outfiles = Bucket(
        parse = dir + '/vpc/codeparse/vpcParser.ts',
        tokens = dir + '/vpc/codeparse/vpcTokens.ts',
        visitor = dir + '/vpc/codeparse/vpcVisitor.ts',
        visitorInterface = dir + '/vpc/codeparse/vpcVisitorInterface.ts',
        )
    go(dir, infiles, outfiles)

