
# gendocs.py
# Ben Fisher, 2017

import re
import json
import sys
from collections import OrderedDict

sys.path.append('../build')
from ts_exports_util import *

outloc = '../vipercard/resources/docs/'


specialCharFontChange = "\x02"

def map(iterable, func):
    for i in iterable:
        yield func(i)

changeFontTitle = f'{specialCharFontChange}times_24_biuosdce{specialCharFontChange}'
changeFontBody = f'{specialCharFontChange}times_12_biuosdce{specialCharFontChange}'
changeFontBold = f'{specialCharFontChange}times_12_+biuosdce{specialCharFontChange}'
changeFontCode = f'{specialCharFontChange}monaco_9_biuosdce{specialCharFontChange}'

def addFormatting(s):
    # ^ for bold
    # ` for code
    
    spl = s.split('^')
    assertTrue( len(spl)%2==1, 'extra ^?', len(spl), '\n\n'.join(map(spl, repr)))
    spl = s.split('`')
    assertTrue( len(spl)%2==1, 'extra `?', len(spl), '\n\n'.join(map(spl, repr)))
    counter = 0
    def doReplaceBold(np):
        nonlocal counter
        counter += 1
        if counter % 2 == 1:
            return changeFontBold
        else:
            return changeFontBody
    s = re.sub(r'\^',doReplaceBold,s)
    
    counter = 0
    def doReplaceCodef(np):
        nonlocal counter
        counter += 1
        if counter % 2 == 1:
            return changeFontCode
        else:
            return changeFontBody
    s = re.sub(r'`',doReplaceCodef,s)
    
    s = s.replace(f'\nExamples:\n', f'\nExamples:\n{changeFontCode}')
    s = changeFontBody + s
    s = s.replace('$caret$', '^').replace('$backtic$', '`')
    return s
    
def addFormattingFinish(s):
    return s.replace(f'{specialCharFontChange}Examples:\n', f'{specialCharFontChange}Examples:\n{changeFontCode}')

def addFormattingMarkdown(s):
    # first, escape characters that happen to be markdown formatters
    # actually, not needed because the symbols are usually in `code` blocks treated as literal
    # s = s.replace('\\', '\\\\')
    # s = s.replace('#', '\\#')
    # s = s.replace('*', '\\*')
    # s = s.replace('_', '\\_')
    # s = s.replace('~', '\\~')
    
    # then do formatting
    s = s.replace('^', '**')
    
    r = re.compile('\n`(.*?)`\n    ([a-zA-Z0-9].*)')
    s = r.sub('\n\n$backtic1$\\1$backtic1$ (\\2)\n\n', s)
    
    r = re.compile('\n`([^`]+?)`\n', re.DOTALL)
    s = r.sub('\n\n```\n\\1\n```\n\n', s)
    
    # if a subheader bold, should not be a newline right there, add more space
    r = re.compile('\\*\\*\n(?=[A-Za-z0-9])', re.DOTALL)
    s = r.sub('**\n\n', s)
    
    r = re.compile('(\n|^)Examples:\n(.*)', re.DOTALL)
    s = r.sub('\n\nExamples:\n\n```\\2\n```\n\n', s)

    s = s.replace('$caret$', '^').replace('$backtic1$', '`').replace('$backtic$', '\\`')
    return s

def addFormattingMarkdownFinish(s):
    return s

def goSection(s, sname, fnAddFormatting, fnAddFormattingFinish):
    sname = sname[0].upper() + sname[1:]
    section = {}
    section['name'] = sname
    section['entries'] = []
    spl = s.split('=====\n')
    assertTrue( len(spl)%2==1, 'extra ====?', len(spl))
    assertTrue(spl[0].strip() =='', spl[0].strip())
    spl.pop(0)
    for shortheader, body in takeBatch(spl, 2):
        ret = {}
        header = shortheader.strip()
        body = body.strip()
        if sname.lower() in ['properties']:
            ret['title'] = header
            header = header.split(': ')[1]
        elif sname.lower() not in ['fundamentals']:
            ret['title'] = header
            ret['title'] = ret['title'].split(' ')[0]
            ret['title'] = ret['title'].split('(')[0]
            ret['title'] = ret['title'].replace('___', ' ')
            header = header.replace('___', ' ')
        else:
            ret['title'] = header
        
        body = fnAddFormatting(body)
        ret['body'] = ''
        ret['body'] += changeFontTitle
        ret['body'] +=header
        ret['body'] +='\n\n'
        ret['body'] += changeFontBody
        ret['body'] +=body
        ret['body'] = fnAddFormattingFinish(ret['body'])
        section['entries'].append(ret)
    
    if sname.lower() not in ['fundamentals']:
        section['entries'].sort(key=lambda x: x['title'])
    return section
    
def loadSections():
    sections = OrderedDict()
    sections['fundamentals'] = ['reference_01_fundamentals', myfilesreadall('reference_01_fundamentals')]
    sections['functions'] = ['reference_02_functions', myfilesreadall('reference_02_functions')]
    sections['event_handlers'] = ['reference_03_events', myfilesreadall('reference_03_events')]
    sections['commands'] = ['reference_04_commands', myfilesreadall('reference_04_commands')]
    sections['properties'] = ['reference_05_properties', myfilesreadall('reference_05_properties')]
    return sections

def goMakeJson(sections, sectionname):
    s = sections[sectionname][1]
    sectionVpc = goSection(s, sectionname, addFormatting, addFormattingFinish)
    path = f'{outloc}ref_{sectionname}.json'
    
    f = open(path, 'w', encoding='utf-8')
    f.write(json.dumps(sectionVpc))
    f.write('\n')
    f.close()

def goMakeMarkdown(sections, sectionname):
    s = sections[sectionname][1]
    sectionMd = goSection(s, sectionname, addFormattingMarkdown, addFormattingMarkdownFinish)
    
    header = '''<!---
this is a generated file, changes will be lost.
-->'''
    markd = ''
    markd += header + '\n'
    for se in sectionMd['entries']:
        #~ markd += '##' + se['title'] + '\n'+ '\n'
        #~ markd += se['body'] + '\n'+ '\n'
        body = se['body']
        body = body.replace(changeFontTitle, '## ')
        body = body.replace(changeFontBody, '')
        markd += '\n\n' +body + '\n\n'
    
    filename = sections[sectionname][0]
    assertTrue(not '/' in filename and not '\\' in filename and not '.' in filename, filename)
    myfileswriteall('./' + filename + '.md', markd)

def goMakeJsonIndexEntries(sections, sectionname):
    s = sections[sectionname][1]
    sectionVpc = goSection(s, sectionname, addFormatting, addFormattingFinish)
    titlesWithSingleQuote = [se['title'] for se in sectionVpc['entries'] if "'" in se['title']]
    assertTrue(not len(titlesWithSingleQuote), titlesWithSingleQuote)
    
    theArr = [se['title'] for se in sectionVpc['entries']]
    theArrS = json.dumps(theArr).replace('"', "'")
    assertTrue(not '===' in theArrS)
    mapIt = dict(fundamentals='lngFundamentals',
        commands='lngCommands',
        functions='lngFunctions',
        event_handlers='lngEvent Handlers',
        properties='lngProperties')
    
    print('// prettier-ignore')
    print(f"['{sectionname}', '{mapIt[sectionname]}', {theArrS}],")

def go():
    print('')
    print('')
    print('Please place the following into vpcDocViewer.ts:')
    sections = loadSections()
    for sectionname in sections:
        goMakeJson(sections, sectionname)
        goMakeMarkdown(sections, sectionname)
        goMakeJsonIndexEntries(sections, sectionname)
        
        
        
if __name__=='__main__':
    go()

