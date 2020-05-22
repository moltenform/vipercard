
from gendocs2 import *

def addFormattingMarkdown(s):
    # first, escape characters that happen to be markdown formatters
    # not needed because the symbols are in `code` blocks treated as literal
    # s = s.replace('\\', '\\\\')
    # s = s.replace('#', '\\#')
    # s = s.replace('*', '\\*')
    # s = s.replace('_', '\\_')
    # s = s.replace('~', '\\~')
    
    # need to double newlines! except for * lists
    s = re.sub(r'(\S) *\n *([^*\s])', r'\1'+'\n\n'+r'\2', s)
    
    # then do formatting
    s = s.replace('^', '**')
    
    r = re.compile('\n`(.*?)`\n    ([a-zA-Z0-9].*)')
    s = r.sub('\n\n$backtic1$\\1$backtic1$ (\\2)\n\n', s)
    
    r = re.compile('\n`([^`]+?)`\n', re.DOTALL)
    s = r.sub('\n\n```\n\\1\n```\n\n', s)
    
    # if a subheader bold, should not be a newline right there, add more space
    r = re.compile('\\*\\*\n(?=[A-Za-z0-9])', re.DOTALL)
    s = r.sub('**\n\n', s)
    

    s = s.replace('$caret$', '^').replace('$backtic1$', '`').replace('$backtic$', '\\`')
    return s


def goSection(section, sectionfulltitle, outname, outfile, myHeaderLinks):
    out = ''
    out += '''<!---
this is a generated file, changes will be lost.
-->'''
    out+='\n\n'+myHeaderLinks+'\n\n'
    for item in section:
        shortTitle, title, body = item
        out += f'## {title}\n\n'
        out += addFormattingMarkdown(body)
    
    trace('write to', outfile)
    files.writeall(outfile, out, encoding='utf-8')
    


def makeHeaderLinks(data, mapIt, outname1):
    headerLinks = []
    for key in data:
        outname = key.split('_')[-1].lower()
        sectionfulltitle = mapIt[outname].replace('lng', '')
        if outname==outname1:
            headerLinks.append(sectionfulltitle)
        else:
            headerLinks.append(f'[{sectionfulltitle}](./{key}.md)')
            
    return ' | '.join(headerLinks)

def goToMarkdown(indir):
    data = parseAll(indir)
    trace('outputting...')
    mapIt = dict(overview='lngOverview',
        commands='lngCommands',
        syntax='lngSyntax',
        properties='lngProperties',
        functions='lngFunctions',
        events='lngEvent Handlers',
        compatibility='lngCompatibility')
    
    for key in data:
        section = data[key]
        outname = key.split('_')[-1].lower()
        sectionfulltitle = mapIt[outname]
        outfile = key + '.md'
        myHeaderLinks = makeHeaderLinks(data, mapIt, outname)
        goSection(section, sectionfulltitle, outname, outfile, myHeaderLinks)
    trace('done.')

if __name__=='__main__':
    goToMarkdown('.')
    