
# Ben Fisher, 2018
# MIT license

import os
import sys
import re
sys.path.append('../typescript-super-auto-import/bn_python_common.zip')
from bn_python_common import *

def readGrammarFiles(files, skipGenerated):
    result = Bucket(tokens=[], rules=[])
    for file in files:
        readGrammarFile(file, result, skipGenerated)
    return result

def readGrammarFile(file, result, skipGenerated):
    content = files.readall(file, encoding='utf-8')
    content = content.replace('\\\n', ' ') # continued lines
    if skipGenerated and gStart in content:
        content = content.split(gStart)[0] + '\n' + content.split(gEnd)[1]
    if 'list-all' in files.getname(file):
        return readListFile(result, file, content.split('\n'))
    for line in content.split('\n'):
        line = line.strip()
        if not line or line.startswith('//') or line.startswith('/*'):
            continue
        
        withoutLetters = re.sub('\w+', '', line).strip()
        if withoutLetters.startswith(':='):
            # it is a Rule
            processRule(result, line)
        elif withoutLetters.startswith('='):
            # it is a Token
            processToken(result, line)
        else:
            assertTrue(False, f'unknown type ({withoutLetters})', line)


def processToken(result, line):
    ret = Bucket()
    tokenName, tokenDefn = (s.strip() for s in line.split('=', 1))
    if '|||||' in tokenDefn:
        tokenDefn, tokenParams = (s.strip() for s in tokenDefn.split('|||||'))
    else:
        tokenParams = ''
    
    if tokenDefn.startswith('/') and tokenDefn.endswith('/'):
        ret.type = 'regex'
        ret.val = tokenDefn
    elif tokenDefn.startswith('OneOfWords(') and tokenDefn.endswith(')'):
        tokenDefn = tokenDefn[len('OneOfWords('): -len(')')]
        ret.type = 'OneOfWords'
        ret.val = [s.strip() for s in tokenDefn.split(',')]
    elif tokenDefn.startswith('OneOfOr(') and tokenDefn.endswith(')'):
        tokenDefn = tokenDefn[len('OneOfOr('): -len(')')]
        assertTrue('|or|' in line, line)
        ret.type = 'OneOfOr'
        ret.val = [s.strip() for s in tokenDefn.split('|or|')]
    else:
        assertTrue(False, f'unknown type ({tokenDefn})', line)
    
    ret.tokenParams = tokenParams
    ret.origLine = line
    ret.name = tokenName
    result.tokens.append(ret)

def processRule(result, line):
    ret = Bucket()
    ruleName, ruleDefn = (s.strip() for s in line.split(':=', 1))
    if ruleName.startswith('BuiltinCmd'):
        assertTrue(ruleDefn.startswith('...'), line)
        if not '--->' in ruleDefn:
            ruleDefn += '    --->BuildMap'
    
    ruleVisitor = ''
    ruleVisitorReturnType = ''
    if '--->' in ruleDefn:
        ruleDefn, ruleVisitor = (s.strip() for s in ruleDefn.split('--->', 1))
        if '--->' in ruleVisitor:
            ruleVisitor, ruleVisitorReturnType = (s.strip() for s in ruleVisitor.split('--->', 1))
    else:
        warn("---> not seen. this is fine if you're not making visitors yet", line)
    
    ret.ruleVisitorOpts = [s.strip() for s in ruleVisitor.split('|') if s.strip()]
    if ret.ruleVisitorOpts and ret.ruleVisitorOpts[0] == 'Constant' and (ret.ruleVisitorOpts[1].startswith("'") or ret.ruleVisitorOpts[1].startswith('"')) and not ruleVisitorReturnType:
        ruleVisitorReturnType = 'string'
    if ret.ruleVisitorOpts and ret.ruleVisitorOpts[0] == 'BuildExpr':
        ruleVisitorReturnType = 'VpcVal'
    if ret.ruleVisitorOpts and ret.ruleVisitorOpts[0] == 'BuildMap':
        ruleVisitorReturnType = 'IntermedMapOfIntermedVals'
    if ruleVisitorReturnType == 'IToken':
        ruleVisitorReturnType = 'ChvITk'
    if not ruleVisitorReturnType:
        ruleVisitorReturnType = 'string | VpcIntermedValBase'
    ruleDefn = ruleDefn.replace('...', 'tkSyntaxPlaceholder tkSyntaxPlaceholder tkSyntaxPlaceholder ')
    ret.ruleVisitorReturnType = ruleVisitorReturnType
    ret.origLine = line
    ret.name = ruleName
    ret.val = ruleDefn
    
    
    result.rules.append(ret)
 
def readListFile(result, file, lines):
    result.listPropertiesNullary = []
    result.listPropertiesNullaryOrUnary = []
    for line in lines:
        line = line.strip()
        line = line.split('//')[0]
        line = line.strip()
        if line:
            if line.startswith('begin-'):
                category = 'list' + line[len('begin-'):].title()
                assertTrue(not hasattr(result, category))
                curLst = []
                setattr(result, category, curLst)
            else:
                if '-' in line:
                    assertTrue(category == 'listProperties', 'only properties has -')
                    line, subcategory = line.split('-')
                    if subcategory == 'nullary':
                        result.listPropertiesNullary.append(line)
                    elif subcategory == 'nullaryOrUnary':
                        result.listPropertiesNullaryOrUnary.append(line)
                    else:
                        assertTrue(False, 'unknown subcategory', line)
                else:
                    curLst.append(line)

gStart = '/* generated code, any changes past this point will be lost: --------------- */'
gEnd = '/* generated code, any changes above this point will be lost: --------------- */'

 