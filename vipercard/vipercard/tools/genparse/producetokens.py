from readgrammarinput import *

import re

def goTokensDefnOne(st):
    out = []
    out.append('')
    
    assertEq('tkIdentifier', st.tokens[-1].name,
        'expect the last to be tkIdentifier')
    
    # the map, and the creation
    out.append('/* as a map so that we get quick access */')
    out.append('export const tks = {')
    for tk in st.tokens:
        out.append(f'{tk.name}: chevrotain.createToken' + '({')
        out.append(f'name: "{tk.name}",')
        out.append(f'pattern: {getPatternFromTk(tk)},')
        if tk.tokenParams:
            out.append(tk.tokenParams + ',')
        out.append('}),')
    out.append('}')
    out.append('')
    out.append('')
    
    # the array (needed since order matters)
    out.append('/* as an array, since order matters */')
    out.append('export const allVpcTokens = [')
    for tk in st.tokens:
        out.append(f'tks.{tk.name},')
    out.append(f']')
    out.append('')
    out.append('')
    
    # add to list of alsoReservedWordsList
    addToListOfReservedWords(st, out, st.tokens)
    
    # this simply helps us syntax-check for spelling typos
    out.append('/* so that we\'ll get compile-time error if a rule name is misspelled */')
    out.append('export const tkstr = {')
    for rule in st.rules:
        out.append(f"    Rule{rule.name}: 'Rule{rule.name}',")
    for tk in st.tokens:
        out.append(f"    {tk.name}: '{tk.name}',")
    out.append('}')
    out.append('')
    out.append('')
    
    return out

def getPatternFromTk(tk):
    if tk.type == 'regex':
        theRe = tk.val
    elif tk.type == 'OneOfWords':
        theRe = '/'
        # why not put it into one group, like (abc|def){{nothingdirectlyafter}}
        # for a simpler expression? I think this led to problems in safari browser.
        for item in tk.val:
            theRe += '(?:' # start non capturing group
            theRe += item
            theRe += '{{nothingdirectlyafter}}'
            theRe += ')' # end non capturing group
            theRe += '|'
            
        if theRe.endswith('|'):
            theRe = theRe[0:-1]
        theRe += '/'
    elif tk.type == 'OneOfOr':
        # similar to OneOfWords, but something can come directly after
        theRe = '/'
        for item in tk.val:
            theRe += '(?:' # start non capturing group
            theRe += item
            theRe += ')' # end non capturing group
            theRe += '|'
            
        if theRe.endswith('|'):
            theRe = theRe[0:-1]
        theRe += '/'
    else:
        assertTrue('unknown type', tk.type)
    
    theRe = theRe.replace('{{nothingdirectlyafter}}', '(?![a-zA-Z0-9_])')
    assertTrue(theRe.startswith('/'), theRe)
    assertTrue(theRe.endswith('/'), theRe)
    theRe += 'i' # everything is case insensitive
    return theRe

def getListOfWordLikeTokens(tokens, includeAllProperties):
    skipped = 0
    propertiesToSkip = ('tkAllUnaryPropertiesIfNotAlready', 'tkAllNullaryOrUnaryPropertiesIfNotAlready', 'tkUnaryVipercardProperties')
    for tk in tokens:
        if not includeAllProperties and tk.name in propertiesToSkip:
            skipped += 1
            continue
        if tk.type == 'OneOfWords':
            for v in tk.val:
                if v != v.lower():
                    assertTrue(False, 'probably safer to make this lowercase', tk.origLine)
                v = v.lower()
                isPlural = None
                if v.endswith('?'):
                    isPlural = v[-2]
                    v = v[0:-2]
                assertTrue(v.isalnum(), "does not look like a word? we don't really yet support regex in OneOfWords", tk.origLine)
                if isPlural:
                    yield (v + isPlural, tk)
                yield (v, tk)
        elif tk.type == 'OneOfOr':
            for v in tk.val:
                if v.isalnum():
                    warn(f'this looks like a word, maybe use OneOfWords and not OneOfOr?', tk.val, tk.origLine)
        elif tk.type == 'regex':
            if tk.val.replace('/', '').isalnum():
                warn(f'this looks like a word, maybe use OneOfWords and not regex?', tk.val, tk.origLine)
        else:
            assertTrue('unknown type', tk.type)
    if not includeAllProperties:
        assertEq(3, skipped, 'expected to skip prooperties- were any of these renamed?\n', propertiesToSkip)

def addToListOfReservedWords(st, out, tokens):
    out.append('')
    out.append('')
    for v, tk in getListOfWordLikeTokens(tokens, False):
        out.append(f"alsoReservedWordsList['{v.lower()}'] = true;")
    out.append('')
    out.append('')
    
    out.append('/* map word-like tokens to the token type, useful for ')
    out.append(' fabricating new tokens in rewrite stage. */')
    out.append('export const listOfAllWordLikeTokens:{ [key: string]: chevrotain.TokenType } = { }')
    for v, tk in getListOfWordLikeTokens(tokens, True):
        out.append(f"listOfAllWordLikeTokens['{v.lower()}'] = tks.{tk.name};")
    out.append('')
    out.append('')
    
    out.append('/* list commands, even the ones we don\'t support. */')
    out.append('export const listOfAllBuiltinCommandsInOriginalProduct:{ [key: string]: boolean } = { }')
    out.append('')
    did = {}
    for v in st.listCommands:
        s = v.split(' ')[0].lower()
        did[s] = True
        out.append(f"listOfAllBuiltinCommandsInOriginalProduct['{s}'] = true;")
    out.append("/* ones we've defined */")
    for rule in st.rules:
        if rule.name.startswith('BuiltinCmd'):
            s = rule.name[len('BuiltinCmd'):].lower()
            if s not in did:
                out.append(f"listOfAllBuiltinCommandsInOriginalProduct['{s}'] = true;")
    out.append('')
    
    out.append('/* list events, even the ones we don\'t support. */')
    out.append('export const listOfAllBuiltinEventsInOriginalProduct:{ [key: string]: boolean } = { }')
    out.append('')
    for v in st.listEvents:
        out.append(f"listOfAllBuiltinEventsInOriginalProduct['{v.split(' ')[0].lower()}'] = true;")
    out.append('')
    
    out.append('/* it would be too restrictive to say a variable can only be a tkidentifier. */')
    out.append('export function couldTokenTypeBeAVariableName(t: chevrotain.IToken) {')
    for rule in st.rules:
        if rule.name == 'HAnyAllowedVariableName':
            s = 'return '
            for item in re.split(r'\s+', rule.val):
                if item != '{' and item != '|' and item != '}' and item:
                    s += f't.tokenType === tks.{item} ||'
            s = s[0:-2]
            out.append(s)
    out.append('}')
    out.append('')
    

def writePropertiesListIntoGrammar(infiles):
    # a first pass without our generated ones
    tempst = readGrammarFiles(infiles, skipGenerated=True)
    tempst.listPropertiesUnary = tempst.listProperties
    alreadyAToken = {}
    for wordLikeToken, tk in getListOfWordLikeTokens(tempst.tokens, True):
        alreadyAToken[wordLikeToken] = True
        
    s = ''
    s += '\ntkAllUnaryPropertiesIfNotAlready=OneOfWords('
    s += ','.join((s.lower().strip() for s in tempst.listProperties if not s.lower().strip() in alreadyAToken))
    s += ')'
    s += '\n'
    s += '\ntkAllNullaryOrUnaryPropertiesIfNotAlready=OneOfWords('
    s += ','.join((s.lower().strip() for s in tempst.listPropertiesNullaryOrUnary if not s.lower().strip() in alreadyAToken))
    s += ')'
    s += '\n'
    
    s += "\n/* we've automatically searched through all word-like tokens to check for any overlap (like how _id is both a token and a property name) */"
    
    addAlreadyTokens = [('_' + s.lower().strip()) for s in tempst.listPropertiesUnary if s.lower().strip() in alreadyAToken]
    addAlreadyTokens.extend([('_' + s.lower().strip()) for s in tempst.listPropertiesNullaryOrUnary if s.lower().strip() in alreadyAToken])
    if addAlreadyTokens:
        s += '\nHAllPropertiesThatCouldBeUnary:={tkAllUnaryPropertiesIfNotAlready | tkUnaryVipercardProperties | tkAllNullaryOrUnaryPropertiesIfNotAlready |'
        s += '|'.join(addAlreadyTokens)
        s += '}'
    else:
        s += '\nHAllPropertiesThatCouldBeUnary:={ tkAllUnaryPropertiesIfNotAlready | tkUnaryVipercardProperties | tkAllNullaryOrUnaryPropertiesIfNotAlready }'
    s += '                      --->ProcessOr--->IToken'
    
    addAlreadyTokens = [('_' + s.lower().strip()) for s in tempst.listPropertiesNullary if s.lower().strip() in alreadyAToken]
    addAlreadyTokens.extend([('_' + s.lower().strip()) for s in tempst.listPropertiesNullaryOrUnary if s.lower().strip() in alreadyAToken])
    if addAlreadyTokens:
        s += '\nHAnyFnNameOrAllPropertiesThatCouldBeNullary:={ <HAnyFnName> | tkAllNullaryOrUnaryPropertiesIfNotAlready |'
        s += '|'.join(addAlreadyTokens)
        s += '}'
    else:
        s += '\nHAnyFnNameOrAllPropertiesThatCouldBeNullary:={ <HAnyFnName> | tkAllNullaryOrUnaryPropertiesIfNotAlready }'
    s += '                      --->ProcessOr--->IToken'
    
    addAlreadyTokens = [('_' + s.lower().strip()) for s in tempst.listFunctions if s.lower().strip() in alreadyAToken]
    if addAlreadyTokens:
        s += '\nHAnyFnName:= { tkIdentifier | '
        s += '|'.join(addAlreadyTokens)
        s += '}'
    else:
        s += '\nHAnyFnName:=  tkIdentifier '
    s += '                      --->ProcessOr--->IToken'
    
    s += '\n'
    return s
    
def checkThatEveryTokensIsReferencedInARule(st, outfiles):
    trace('checking that every token is referenced in the parser...')
    contents = files.readall(outfiles.parse, encoding = 'utf-8')
    inside = contents.split(gStart)[1].split(gEnd)[0]
    namesOkIfNotSeen = dict(tkNewLine=True, tkSyntaxMark=True)
    for token in st.tokens:
        if 'SKIPPED' not in token.tokenParams and not token.name in namesOkIfNotSeen:
            searchFor = r'\btks\.' + token.name + r'\b'
            found = re.search(searchFor, inside)
            if not found:
                trace('warn: not found: ', token.name)
    trace('done.')
    