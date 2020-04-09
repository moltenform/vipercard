
from readgrammarinput import *
from produceparser import *
import itertools

def goForVisitorInterface(st):
    out = []
    out.append('')
    out.append('')
    out.append('export interface VpcCompleteVisitor {')
    for rule in st.rules:
        out.append(f'    Rule{rule.name}(ctx: VisitingContext): {rule.ruleVisitorReturnType};')
    out.append('}')
    out.append('')
    out.append('export interface VisitingContext {')
    out.append('[index: string]: any;')
    for rule in st.rules:
        out.append(f'    Rule{rule.name}: any[];')
    for tk in st.tokens:
        out.append(f'    {tk.name}: ChvITk[];')
    out.append('}')
    out.append('')
    out.append('')
    return out
    
def splitListByDelim(lst, delim):
    # credit: https://stackoverflow.com/questions/15357830/python-splitting-a-list-based-on-a-delimiter-word
    # doesn't work as expected with repeated delims or with delim at beginning or end of list
    for i in range(len(lst) - 1):
        if lst[i]==delim and lst[i+1]==delim:
            assertTrue(False, "this doesn't support repeated delims")
    ret = [list(y) for x, y in itertools.groupby(lst, lambda z: z == delim) if not x]
    if lst[0] == delim:
        ret.insert(0, [])
    if lst[-1] == delim:
        ret.append([])
    return ret
    
def checkIfDuplicates(listOfElems):
    # credit: https://thispointer.com/python-3-ways-to-check-if-there-are-duplicates-in-a-list/
    setOfElems = set()
    for elem in listOfElems:
        if elem in setOfElems:
            return elem
        else:
            setOfElems.add(elem)         
    return None

def makeAllVisitors(st):
    out = []
    maker = MakingVisitors()
    for rule in st.rules:
        if rule.ruleVisitorOpts:
            methodName = 'goMake'+rule.ruleVisitorOpts[0]
            method = getattr(maker, methodName)
            assertTrue(method, 'unknown visitor method', methodName)
            out.append('')
            out.append('')
            out.extend(method(rule, rule.ruleVisitorOpts, rule.ruleVisitorReturnType))
    out.append('')
    return out
            
def renderTokenForVisitor(s):
    return s
    
def renderRuleForVisitor(s):
    if s.startswith('<'):
        assertTrue(s.endswith('>'), s)
        s = s[1:-1]
    return f'Rule{s}'

class MakingVisitors(object):
    def goMakeProcessOr(self, rule, visitorOpts, returnType):
        # we'll look at the last one before the | 
        assertEq('ProcessOr', visitorOpts[0])
        lst = goPrepRule(rule.val, rule.origLine)
        options = []
        pts = splitListByDelim(lst, '{')
        assertEq(2, len(pts), 'expected to see exactly one {', rule.origLine)
        pts2 = splitListByDelim(pts[1], '}')
        assertEq(2, len(pts2), 'expected to see exactly one }', rule.origLine)
        inside = pts2[0]
        # split by |
        rawOptions = splitListByDelim(inside, '|')
        assertTrue(len(rawOptions) > 1, 'only one option?', rule.origLine)
        for item in rawOptions:
            item = [s for s in item if not s.startswith('MAXLOOKAHEAD')]
            type = determineEntry(item[-1], rule.origLine, otherOk=False, moreContext=\
                'for ProcessOr we take the last of the option (e.g. { a b | c } we check for just b and c, and it must be a plain token or rule')
            options.append(item[-1])
        
        hasDupe = checkIfDuplicates(options)
        assertTrue(not hasDupe, f"can't use processOr because there is a duplicate ({hasDupe})", rule.origLine)
        
        # build the code!
        return self._buildFromCheckingListOfTokensOrRules(rule, visitorOpts, returnType, options)
    
    def goMakeCustomOr(self, rule, visitorOpts, returnType):
        assertEq('CustomOr', visitorOpts[0])
        return self._buildFromCheckingListOfTokensOrRules(rule, visitorOpts, returnType, visitorOpts[1:])
    
    def _buildFromCheckingListOfTokensOrRules(self, rule, visitorOpts, returnType, options):
        assertTrue(len(options) > 0)
        out = []
        out.append(f'Rule{rule.name}(ctx: VisitingContext): {returnType} ' + '{')
        branches = []
        for item in options:
            type = determineEntry(item, rule.origLine, otherOk=False)
            if type == 'rule':
                branches.append(f'if (ctx.{renderRuleForVisitor(item)}[0]) {{\n return this.visit(ctx.{renderRuleForVisitor(item)}[0]); \n}}')
            elif type == 'token':
                maybeGetImage = '.image' if returnType=='string' else ''
                branches.append(f'if (ctx.{renderTokenForVisitor(item)}[0]) {{\n return ctx.{renderTokenForVisitor(item)}[0]{maybeGetImage}; \n}}')
        out.append('\n else \n'.join(branches))
        out.append(" else { throw makeVpcInternalErr('OR in " + rule.name + ", no branch found'); }")
        out.append('}')
        return out
        
    def goMakeBuildMap(self, rule, visitorOpts, returnType):
        assertEq('BuildMap', visitorOpts[0])
        assertEq(1, len(visitorOpts))
        assertEq('IntermedMapOfIntermedVals', returnType)
        out = []
        out.append(f'Rule{rule.name}(ctx: VisitingContext): {returnType} ' + '{')
        out.append('return this.H$BuildMap(ctx);')
        out.append('}')
        return out
    def goMakeConstant(self, rule, visitorOpts, returnType):
        assertEq('Constant', visitorOpts[0])
        assertEq(2, len(visitorOpts))
        out = []
        out.append(f'Rule{rule.name}(ctx: VisitingContext): {returnType} ' + '{')
        out.append(f'return {visitorOpts[1]};')
        out.append('}')
        return out
    def goMakeBuildExpr(self, rule, visitorOpts, returnType):
        template = """
        %METHODNAME%(ctx: VisitingContext): VpcVal {
            if (!ctx.%NEXTRULE%.length || ctx.%OPERATORNAME%.length + 1 !== ctx.%NEXTRULE%.length) {
                throw makeVpcInternalErr(`%METHODNAME%:${ctx.%OPERATORNAME%.length},${ctx.%NEXTRULE%.length}.`);
            }

            let total = this.visit(ctx.%NEXTRULE%[0]) as VpcVal;
            checkThrow(total instanceof VpcVal, '%METHODNAME%: first not a vpcval');
            const oprulecategory = VpcOpCtg.%OPCATEGORY%;
            for (let i = 0; i < ctx.%OPERATORNAME%.length; i++) {
                let whichop = %GETOPIMAGE%;
                checkThrow(isString(whichop), '%METHODNAME%: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.%NEXTRULE%[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, '%METHODNAME%: not a vpcval');
            }

            return total;
        }
        """
        assertEq(4, len(visitorOpts), rule.origLine)
        assertEq('VpcVal', returnType)
        assertEq('BuildExpr', visitorOpts[0])
        operator = visitorOpts[1]
        nextRule = visitorOpts[2]
        opCategory = visitorOpts[3]
        replacements = {}
        replacements['METHODNAME'] = 'Rule' + rule.name
        replacements['NEXTRULE'] = renderRuleForVisitor(nextRule)
        replacements['OPCATEGORY'] = opCategory
        operatorType = determineEntry(operator, rule.origLine, otherOk=False)
        if operatorType=='rule':
            replacements['OPERATORNAME'] = renderRuleForVisitor(operator)
            replacements['GETOPIMAGE'] = f"""this.visit(ctx.{renderRuleForVisitor(operator)}[i])"""
        else:
            replacements['OPERATORNAME'] = renderTokenForVisitor(operator)
            replacements['GETOPIMAGE'] = f"""ctx.{renderTokenForVisitor(operator)}[i].image"""
        
        out = template
        for replacement in replacements:
            out = out.replace(f'%{replacement}%', replacements[replacement])
        
        out = out.replace('\r\n', '\n').split('\n')
        return out
    def goMakeCustom(self, rule, visitorOpts, returnType):
        # do nothing, the user will write it
        assertEq('Custom', visitorOpts[0])
        assertEq(1, len(visitorOpts))
        return []

def tests():
    assertEq([[], ['b', 'c']], splitListByDelim('a,b,c'.split(','), 'a'))
    assertEq([['a'],  ['c']], splitListByDelim('a,b,c'.split(','), 'b'))
    assertEq([['a', 'b'],  []], splitListByDelim('a,b,c'.split(','), 'c'))
    assertException(lambda: splitListByDelim('a,b,b,c'.split(','), 'b'), AssertionError, 'support repeated')
    
tests()

