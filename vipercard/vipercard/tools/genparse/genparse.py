
# genparse...
# currently very basic -- doesn't support anything nested, which is fine

from ben_python_common import *
import re,os,sys
def getSection(s, sectname):
    ss = f'\n----Begin:{sectname}--------\n'
    sse = f'\n----End:{sectname}--------\n'
    return s.split(ss)[1].split(sse)[0]

symManyStart = '\x04'
symManyEnd = '\x05'
symManySepStart = '\x06'
symManySepEnd = '\x07'
symAtLeastOneStart = '\x11'
symAtLeastOneEnd = '\x12'
symAtLeastOneSepStart = '\x13'
symAtLeastOneSepEnd = '\x14'
tabs1 = '    '
tabs2 = tabs1 * 2

def processTokens(tokens, allout):
    thetokens = {}
    allTokens = ['export const allTokens = [ // note: order matters here']
    for line in tokens:
        line = line.strip()
        if not line:
            continue
        opts = ''
        if '|||||' in line:
            line, opts =  line.split('|||||')
        linepts = line.split('=', 1)
        if len(linepts) == 2:
            name = linepts[0]
            pattern = linepts[1]
        else:
            assertTrue(False, line)
        
        if pattern=='SAME':
            # use lookahead --- otherwise incorrect matches 
            # if there are tokens "the", "then" -- "then" will be lexed as "the" "n" instead of "then"
            # positive lookahead (?=[^a-zA-Z0-9_]) almost works but fails at the end of string
            pattern= '/'+name+'(?![a-zA-Z0-9_])/i'
        if not pattern.startswith('new RegExp'):
            assertTrue(pattern.startswith('/'), line)
            assertTrue(pattern.endswith('/') or pattern.endswith('/i'), line)
        name = getFullTokenName(name)
        thetokens[name] = True
        allTokens.append(f'{tabs1}{name},')
        allout.append(f'export class {name} extends ChvToken {{')
        allout.append(f'{tabs1}static PATTERN = {pattern}')
        if opts :
            opts = opts.replace(';', f';\n{tabs1}')
            allout.append(f'{tabs1}{opts}')
        allout.append(f'}}')
    
    allTokens.append(f'];')
    allout.extend(allTokens)
    return thetokens

def getFullTokenName(s):
    return 'Token'+s[0].upper() + s[1:]

def lexrule(thetokens, b, rule, rulesDefined=None):
    b=b.strip()
    b = b.replace('MANYSEP{{', symManySepStart)
    b = b.replace('}}ENDMANYSEP', symManySepEnd)
    b = b.replace('MANY{{', symManyStart)
    b = b.replace('}}ENDMANY', symManyEnd)
    b = b.replace('ATLEASTONESEP{{', symAtLeastOneSepStart)
    b = b.replace('}}ENDATLEASTONESEP', symAtLeastOneSepEnd)
    b = b.replace('ATLEASTONE{{', symAtLeastOneStart)
    b = b.replace('}}ENDATLEASTONE', symAtLeastOneEnd)
    
    b=b.replace(f'{symManyStart}', f' {symManyStart} ')
    b=b.replace(f'{symManyEnd}', f' {symManyEnd} ')
    b=b.replace(f'{symManySepStart}', f' {symManySepStart} ')
    b=b.replace(f'{symManySepEnd}', f' {symManySepEnd} ')
    b=b.replace(f'{symAtLeastOneStart}', f' {symAtLeastOneStart} ')
    b=b.replace(f'{symAtLeastOneEnd}', f' {symAtLeastOneEnd} ')
    b=b.replace(f'{symAtLeastOneSepStart}', f' {symAtLeastOneSepStart} ')
    b=b.replace(f'{symAtLeastOneSepEnd}', f' {symAtLeastOneSepEnd} ')
    if len(b.split(symManyStart)) >= 3:
        assertTrue(False, f"in rule {rule} we don't yet support multiple MANY(), to add support we'd want MANY1() MANY2() etc")
    if len(b.split(symManySepStart)) >= 3:
        assertTrue(False, f"in rule {rule} we don't yet support multiple MANY_SEP(), to add support we'd want MANY1() MANY2() etc")
    if len(b.split(symAtLeastOneStart)) >= 3:
        assertTrue(False, f"in rule {rule} we don't yet support multiple AtLeastOne(), to add support we'd want AtLeastOne1() AtLeastOne2() etc")
    if len(b.split(symAtLeastOneSepStart)) >= 3:
        assertTrue(False, f"in rule {rule} we don't yet support multiple AtLeastOne_SEP(), to add support we'd want AtLeastOne1() AtLeastOne2() etc")
    b=b.replace('{', ' { ')
    b=b.replace('}', ' } ')
    b=b.replace('|', ' | ')
    b=b.replace('[', ' [ ')
    b=b.replace(']', ' ] ')
    b = re.sub(r'\t+', ' ', b)
    b = re.sub(r' +', ' ', b)
    out = []
    for part in b.split(' '):
        if not len(part): continue
        if part.startswith('<'):
            assertTrue(re.match(r'^<[0-9a-zA-Z_]+>$', part), part)
            if rulesDefined is not None:
                rname = part[1:-1]
                assertTrue(rname in rulesDefined, f' {part} not seen in rules')
        elif len(part) > 1:
            part = getFullTokenName(part)
            assertTrue(part in thetokens, f' {part} not seen in tokens')
        out.append(part)
    return out

def getEndOfBlock(rulename, ruleparts, searchFor, allowed):
    for i in range(len(ruleparts)):
        if i==0: continue
        if len(ruleparts[i]) == 1:
            if ruleparts[i] == searchFor:
                return i
            elif ruleparts[i] != allowed:
                assertTrue(False, f"{rulename}: we currently don't allow nesting this type of expression! (lame, I know) got {ruleparts[i]} when wanted {searchFor}. {ruleparts}")
    assertTrue(False, f"{rulename}: no terminating {searchFor} seen to close. {ruleparts}")

def getEndOfBlockSearchLevel(rulename, ruleparts, inc, dec, allowed):
    lvl = 0
    assertTrue(inc != dec and len(inc)==1 and len(dec)==1)
    for i in range(len(ruleparts)):
        if len(ruleparts[i]) == 1:
            if ruleparts[i] == inc:
                lvl += 1
            elif ruleparts[i] == dec:
                lvl -= 1
                if lvl == 0:
                    return i
            elif ruleparts[i] != allowed and allowed!='(allowall)':
                assertTrue(False, f"{rulename}: we currently don't allow nesting this type of expression! (lame, I know) got {ruleparts[i]} when wanted {inc} or {dec}. {ruleparts}")
    assertTrue(False, f"{rulename}: no terminating  {dec} seen to close. {ruleparts}")

def recurseThroughRuleManyOrAtLeastOne(rulename, ruleparts, symStart, symEnd, startcode):
    divpoint = getEndOfBlock(rulename, ruleparts, symEnd, None)
    current = ruleparts[1:divpoint]
    next = ruleparts[divpoint+1:]
    out = [startcode]
    for pt in current:
        gotpt = recurseThroughRule(rulename, [pt])
        out.append(f"{tabs1}{gotpt[0]}")
    out.append('});')
    return out + recurseThroughRule(rulename, next)
    
def recurseThroughRuleManyOrAtLeastOneSep(rulename, ruleparts, symStart, symEnd, startcode):
    divpoint = getEndOfBlock(rulename, ruleparts, symEnd, '/')
    protocurrent = ruleparts[1:divpoint]
    if len(protocurrent) < 3 or protocurrent[1] != '/':
        assertTrue(False, rulename+': use the syntax MANYSEP{{ tokencomma / word1 word2 }}ENDMANYSEP but got ' + ruleparts)
    theSeparator = protocurrent[0]
    current = protocurrent[2:]
    next = ruleparts[divpoint+1:]
    out = [startcode]
    theSeparatorGot = recurseThroughRule(rulename, [theSeparator])
    assertTrue('this.CONSUME000' in theSeparatorGot[0], f'in {rulename} the sep should be token but got {theSeparator}')
    out.append('SEP:' + theSeparator + ',')
    out.append('DEF: () => {')
    for pt in current:
        gotpt = recurseThroughRule(rulename, [pt])
        out.append(f"{tabs1}{gotpt[0]}")
    out.append('}')
    out.append('});')
    return out + recurseThroughRule(rulename, next)
    
def recurseThroughRule(rulename, ruleparts):
    # use the classic car/cdr pattern!
    if not len(ruleparts):
        return []
    if ruleparts[0]=='{':
        divpoint = getEndOfBlock(rulename, ruleparts, '}', '|')
        current = ruleparts[1:divpoint]
        next = ruleparts[divpoint+1:]
        out = ['this.OR([']
        for j in range(len(current)):
            if j%2 == 1:
                assertTrue(current[j] == '|', ruleparts)
            else:
                pt = current[j]
                gotpt = recurseThroughRule(rulename, [pt])
                out.append(f"{tabs1}{{ ALT: () => {gotpt[0]} }},")
        out.append(']);')
        return out + recurseThroughRule(rulename, next)
    elif ruleparts[0]=='[':
        divpoint = getEndOfBlockSearchLevel(rulename, ruleparts, '[', ']', '(allowall)')
        current = ruleparts[1:divpoint]
        next = ruleparts[divpoint+1:]
        out = ['this.OPTION(() => {']
        addToOut = recurseThroughRule(rulename, current)
        out += [(tabs1 + line) for line in addToOut]
        out.append('});')
        return out + recurseThroughRule(rulename, next)
    elif ruleparts[0] == symManyStart:
        return recurseThroughRuleManyOrAtLeastOne(rulename, ruleparts, symManyStart, symManyEnd, 'this.MANY(() => {')
    elif ruleparts[0] == symAtLeastOneStart:
        return recurseThroughRuleManyOrAtLeastOne(rulename, ruleparts, symAtLeastOneStart, symAtLeastOneEnd, 'this.AT_LEAST_ONE(() => {')
    elif ruleparts[0] == symManySepStart:
        return recurseThroughRuleManyOrAtLeastOneSep(rulename, ruleparts, symManySepStart, symManySepEnd, 'this.MANY_SEP({ ')
    elif ruleparts[0] == symAtLeastOneSepStart:
        return recurseThroughRuleManyOrAtLeastOneSep(rulename, ruleparts, symAtLeastOneSepStart, symAtLeastOneSepEnd, 'this.AT_LEAST_ONE_SEP({ ')
    elif len(ruleparts[0]) > 2 and ruleparts[0].startswith('<'):
        ref = 'Rule' + ruleparts[0].replace('<', '').replace('>', '')
        return [f'this.SUBRULE000(this.{ref})'] + recurseThroughRule(rulename, ruleparts[1:])
    elif len(ruleparts[0]) > 2:
        return [f'this.CONSUME000({ruleparts[0]})'] + recurseThroughRule(rulename, ruleparts[1:])
    else:
        assertTrue(False, rulename+f': invalid rulepart {ruleparts[0]}', ruleparts)

def addNumeralsIm(s, search, haveSeen):
    def dorepl(matchobj):
        fnd = matchobj.group(0)
        if fnd in haveSeen:
            haveSeen[fnd] += 1
            n = haveSeen[fnd]
        else:
            haveSeen[fnd] = 1
            n = 1
        assertTrue('E000(' in fnd, fnd)
        return fnd.replace('E000(', f'E{n}(')
        
    return re.sub(search + r'(\([^)]+\))', dorepl, s)

def addNumerals(got):
    seenConsumes = {}
    seenSubrules = {}
    for i in range(len(got)):
        got[i] = addNumeralsIm(got[i], 'this.CONSUME000', seenConsumes)
        got[i] = addNumeralsIm(got[i], 'this.SUBRULE000', seenSubrules)
    
def processRules(rules, thetokens, allout):
    rulesDefined = {}
    # first pass get the rulenames
    for rule in rules:
        rule = rule.strip()
        if not rule or rule.startswith('//'):
            continue
        
        rulename,b = rule.split(':=')
        rulename=rulename.strip()
        assertTrue(re.match(r'^[0-9a-zA-Z_]+$', rulename), rulename)
        rulesDefined[rulename] = True
        
    # second pass confirm we have valid rulenames, then go!
    lexed = []
    for rule in rules:
        rule = rule.strip()
        if not rule or rule.startswith('//'):
            continue
            
        if '{custom definition above}' in rule:
            continue
        
        rulename,b = rule.split(':=')
        rulename=rulename.strip()
        if '--->' in b:
            b, visitor = b.split('--->')
        else:
            visitor = None
        ruleparts = lexrule(thetokens, b, rule, rulesDefined)
        lexed.append([rulename, ruleparts, visitor])
        got = recurseThroughRule(rulename, ruleparts)
        addNumerals(got)
        allout.append('')
        allout.append(f'{tabs1}private Rule{rulename} = this.RULE("Rule{rulename}", () => {{')
        allout.extend([f'{tabs1}{tabs1}'+ln for ln in got])
        allout.append(f'{tabs1}}})')
    return lexed

warnmsg = '// generated code, any changes past this point will be lost:'
def sendToFile(allout, foutname):
    print('writing to ' + foutname)
    fout = open(foutname, 'r', encoding='utf8')
    prevcontents = fout.read()
    fout.close()
    pts = prevcontents.split(warnmsg)
    assertEq(2, len(pts), 'did not see warning in file.')
    s = pts[0] + '\n'.join(allout)
    fout = open(foutname, 'w', encoding='utf8')
    fout.write(s)
    fout.close()

templateGenerateInfix = r'''
protected %method%(ctx:any) {
    if (!ctx.%child%.length || ctx.%operatorrule%.length + 1 !== ctx.%child%.length) {
        throw makeVpcRuntimeError(`internal error in %method%. len operators=${ctx.%operatorrule%.length} but len children=${ctx.%child%.length}.`);
    }
    
    let total = this.visit(ctx.%child%[0]);
    for (let i = 0; i < ctx.%operatorrule%.length; i++) {
        let whichop = this.visit(ctx.%operatorrule%[i]);
        let val1 = total;
        let val2 = this.visit(ctx.%child%[i + 1]);
        total = %evalmethod%(val1, val2, whichop);
    }

    return total;
}'''

templateWhicheverIsNotAToken = r'''
protected %method%(ctx: any) {
    if (ctx.%child%) {
        return this.visit(ctx.%child%);
    } else {
        throw makeVpcRuntimeError(`internal error in %method%. %child% not present.`);
    }
}'''

templateReturnLiteral = r'''
protected %method%(ctx: any) {
    return %lit%
}'''

templateNotYetImplemented = r'''
protected %method%(ctx: any) {
    assertTrue(false, '%method% not yet implemented')
    throw makeVpcRuntimeError('%method% not yet implemented')
}'''

templateWhicheverIsDefinedInclImage = r'''
protected %method%(ctx: any) {%pieces%
    } else {
        throw makeVpcRuntimeError(`internal error in %method%. all children null.`);
    }
}'''

templateWhicheverIsDefinedInclImageRlPiece = r'''    } else if (ctx.%child%) {
        return this.visit(ctx.%child%);'''
templateWhicheverIsDefinedInclImageImPiece = r'''    } else if (ctx.%child%) {
        return ctx.%child%.image;'''

def readRuleParts(ruleparts, thetokens):
    rulesReferenced = []
    tokensReferenced = []
    for part in ruleparts:
        if len(part) >= 3 and part.startswith('<') and part.endswith('>'):
            rulesReferenced.append('Rule' + part[1:-1])
        elif len(part) > 1:
            assertTrue(part in thetokens, f'{part}')
            tokensReferenced.append(part)
    return rulesReferenced, tokensReferenced

def processVisitor(rulename, ruleparts, visitor, thetokens, allout):
    rulesReferenced, tokensReferenced = readRuleParts(ruleparts, thetokens)
    #~ print(f'rl:{rulesReferenced} tk:{tokensReferenced}')
    if visitor=='WhicheverIsNotAToken':
        assertEq(1, len(rulesReferenced), f'in {rulename} ambiguous, could be any of {rulesReferenced}')
        return templateWhicheverIsNotAToken.replace('%method%', 'Rule'+rulename).replace('%child%', rulesReferenced[0] + '[0]')
    elif visitor=='WhicheverIsDefinedInclImage':
        assertTrue(ruleparts[0] == '{' and ruleparts[-1]=='}', f"in {rulename} prob too dangerous to use WhicheverIsDefinedInclImage when this isn't a simple choice. {ruleparts}")
        pieces = ''
        for ruleReferenced in rulesReferenced:
            piece = templateWhicheverIsDefinedInclImageRlPiece.replace('%child%', ruleReferenced + '[0]')
            if not pieces: piece = piece.replace('} else if (', 'if (')
            pieces += '\n' + piece
        for tokenReferenced in tokensReferenced:
            piece = templateWhicheverIsDefinedInclImageImPiece.replace('%child%', tokenReferenced + '[0]')
            if not pieces: piece = piece.replace('} else if (', 'if (')
            pieces += '\n' + piece
        return templateWhicheverIsDefinedInclImage.replace('%method%', 'Rule'+rulename).replace('%pieces%', pieces)
            
    elif visitor.startswith('GenerateInfix'):
        vparts = [vpart.strip() for vpart in visitor.split('|')]
        assertEq(4, len(vparts), f'rule {rulename} and {ruleparts}')
        _, childrule, whichoprule, evalmethod = vparts
        return templateGenerateInfix.replace('%method%', 'Rule'+rulename).replace('%child%', 'Rule'+childrule) \
            .replace('%operatorrule%', 'Rule'+whichoprule).replace('%evalmethod%', evalmethod)
    elif visitor.startswith('ReturnLiteral'):
        vparts = [vpart.strip() for vpart in visitor.split('|')]
        assertEq(2, len(vparts), f'rule {rulename} and {ruleparts}')
        return templateReturnLiteral.replace('%method%', 'Rule'+rulename).replace('%lit%', vpart[1])
    elif visitor == 'NotYetImplemented':
        return templateNotYetImplemented.replace('%method%', 'Rule'+rulename)
    else:
        assertTrue(False, f'unknown visitor directive for rule {rulename} and {ruleparts}')


def processVisitors(lexedRules, thetokens, allout):
    for rulename, ruleparts, visitor in lexedRules:
        visitor = visitor.strip()
        if visitor!='(custom)':
            txt = processVisitor(rulename, ruleparts, visitor, thetokens, allout)
            allout.extend(txt.replace('\r\n', '\n').split('\n'))
            
    allout = [tabs2+line for line in allout]
    allout.append(tabs1 + '}')
    allout.append('')
    allout.append(tabs1 + 'return new VPCCustomVisitor();')
    allout.append('}')
    allout.append('')    
    return allout

def goAllReady(fname):
    alllines = open(fname, 'r', encoding='utf8').read().replace('\r\n','\n')
    tokens = getSection(alllines, 'Tokens')
    rules = getSection(alllines, 'Rules')
    tokens = tokens.split('\n')
    rules = rules.split('\n')
    allout = []
    allout.append(warnmsg)
    thetokens = processTokens(tokens, allout)
    allout.append('')
    sendToFile(allout, '../../src/vpc/vpcgentokens.ts')
    
    allout = []
    allout.append(warnmsg)
    lexedRules = processRules(rules, thetokens, allout)
    allout.append('}')
    allout.append('')
    sendToFile(allout, '../../src/vpc/vpcgenrules.ts')
    
    areThereVisitors = any(p[2] is not None for p in lexedRules)
    if areThereVisitors:
        allout = []
        allout = processVisitors(lexedRules, thetokens, allout)
        allout.insert(0, warnmsg)
        sendToFile(allout, '../../src/vpc/vpcgenvisitor.ts')
    print('Done.')

if __name__=='__main__':
    #~ goAllReady('works--chvdemo_and_infix_and_visit.txt')
    goAllReady('works--testnested.txt')
    
    