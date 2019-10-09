
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
        name = 'Token'+name
        thetokens[name] = True
        allTokens.append(f'\t{name},')
        allout.append(f'export class {name} extends ChvToken {{')
        allout.append(f'\tstatic PATTERN = {pattern}')
        if opts :
            opts = opts.replace(';', ';\n\t')
            allout.append(f'\t{opts}')
        allout.append(f'}}')
    
    allTokens.append(f'];')
    allout.extend(allTokens)
    return thetokens

def lexrule(thetokens, b, rule, rulesDefined=None):
    b=b.strip()
    b = b.replace('MANYSEP{{', symManySepStart)
    b = b.replace('}}ENDMANYSEP', symManySepEnd)
    b = b.replace('MANY{{', symManyStart)
    b = b.replace('}}ENDMANY', symManyEnd)
    
    b=b.replace(f'{symManyStart}', f' {symManyStart} ')
    b=b.replace(f'{symManyEnd}', f' {symManyEnd} ')
    b=b.replace(f'{symManySepStart}', f' {symManySepStart} ')
    b=b.replace(f'{symManySepEnd}', f' {symManySepEnd} ')
    if len(b.split(symManyStart)) >= 3:
        assertTrue(False, f"in rule {rule} we don't yet support multiple MANY(), to add support we'd want MANY1() MANY2() etc")
    if len(b.split(symManySepStart)) >= 3:
        assertTrue(False, f"in rule {rule} we don't yet support multiple MANY_SEP(), to add support we'd want MANY1() MANY2() etc")
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
            part = 'Token' + part
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
                assertTrue(False, f"{rulename}: we currently don't allow nested expressions! (lame, I know) got {ruleparts[i]} when wanted {searchFor}. {ruleparts}")
    assertTrue(False, f"{rulename}: no terminating {searchFor} seen to close. {ruleparts}")

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
                out.append(f"\t{{ ALT: () => {gotpt[0]} }},")
        out.append(']);')
        return out + recurseThroughRule(rulename, next)
    elif ruleparts[0]=='[':
        divpoint = getEndOfBlock(rulename, ruleparts, ']', None)
        current = ruleparts[1:divpoint]
        next = ruleparts[divpoint+1:]
        out = ['this.OPTION(() => {']
        for pt in current:
            gotpt = recurseThroughRule(rulename, [pt])
            out.append(f"\t{gotpt[0]}")
        out.append('});')
        return out + recurseThroughRule(rulename, next)
    elif ruleparts[0] == symManyStart:
        divpoint = getEndOfBlock(rulename, ruleparts, symManyEnd, None)
        current = ruleparts[1:divpoint]
        next = ruleparts[divpoint+1:]
        out = ['this.MANY(() => {']
        for pt in current:
            gotpt = recurseThroughRule(rulename, [pt])
            out.append(f"\t{gotpt[0]}")
        out.append('});')
        return out + recurseThroughRule(rulename, next)
    elif ruleparts[0] == symManySepStart:
        divpoint = getEndOfBlock(rulename, ruleparts, symManySepEnd, '/')
        protocurrent = ruleparts[1:divpoint]
        if len(protocurrent) < 3 or protocurrent[1] != '/':
            assertTrue(False, rulename+': use the syntax MANYSEP{{ tokencomma / word1 word2 }}ENDMANYSEP but got ' + ruleparts)
        theSeparator = protocurrent[0]
        current = protocurrent[2:]
        next = ruleparts[divpoint+1:]
        out = ['this.MANY_SEP({ ']
        theSeparatorGot = recurseThroughRule(rulename, [theSeparator])
        assertTrue('this.CONSUME000' in theSeparatorGot[0], f'in {rulename} the sep should be token but got {theSeparator}')
        out.append('SEP:' + theSeparator + ',')
        out.append('DEF: () => {')
        for pt in current:
            gotpt = recurseThroughRule(rulename, [pt])
            out.append(f"\t{gotpt[0]}")
        out.append('}')
        out.append('});')
        return out + recurseThroughRule(rulename, next)
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
    for rule in rules:
        rule = rule.strip()
        if not rule or rule.startswith('//'):
            continue
            
        if '{custom definition above}' in rule:
            continue
        
        rulename,b = rule.split(':=')
        rulename=rulename.strip()
        ruleparts = lexrule(thetokens, b, rule, rulesDefined)
        got = recurseThroughRule(rulename, ruleparts)
        addNumerals(got)
        allout.append('')
        allout.append(f'\tprivate Rule{rulename} = this.RULE("Rule{rulename}", () => {{')
        allout.extend(['\t\t'+ln for ln in got])
        allout.append('\t})')

warnmsg = '// generated code, any changes past this point will be lost: '
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
    processRules(rules, thetokens, allout)
    allout.append('}')
    allout.append('')
    sendToFile(allout, '../../src/vpc/vpcgenrules.ts')
    print('Done.')

if __name__=='__main__':
    goAllReady('works--chvdemo_and_infix.txt')
    
    