
from gendocs import *
import os

def addFormattingMarkdown(s):
    # first, escape characters that happen to be markdown formatters
    # not needed because the symbols are in `code` blocks treated as literal
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
    

    s = s.replace('$caret$', '^').replace('$backtic1$', '`').replace('$backtic$', '\\`')
    
    # need to double newlines! except for * lists. and not inside a ``` block
    pts = s.split('```')
    for i, item in enumerate(pts):
        if i%2==0:
            pts[i] = re.sub(r'(\S) *\n *([^*\s])', r'\1'+'\n\n'+r'\2', pts[i])
    
    s = '```'.join(pts)
    
    return s


def goSection(section, sectionfulltitle, outname, outfile, myHeaderLinks):
    out = ''
    out += '''<!---
this is a generated file, changes will be lost.
-->'''
    out+='\n\n'+myHeaderLinks+'\n\n'
    for item in section:
        shortTitle, title, body = item
        out += f'\n\n## {title}\n\n'
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

def transformToHtml(indir, outdir):
    indir = os.path.abspath(indir)
    outdir = os.path.abspath(outdir)
    goToMarkdown(indir)
    tmpdir = r'C:\b\devarchive\moltenform\static\page' + '\\TEMP'
    if not os.path.exists(tmpdir):
        os.mkdir(tmpdir)
    files.ensure_empty_directory(tmpdir)
    manifest = '''
# This directory has the raw markdown,
# you should instead go to https://moltenform.com

titleprefix=ViperCard - Script Reference
contentprefix=
contentprefix_ifnotindex=
contentprefix_ifindex=
csspath=../github-markdown/github-markdown.css
header=
headernavparts=vipercard.net=/;script reference=./reference_01_overview.html

header_generated_by_makelinkchain=<div class="smalltheme-uppernavbox"><span class="linktilebuttonhspace"></span><a href="/"><div class="linktilebutton linktilebutton_narrow linktilebutton_homenarrow"><img class="linktilebuttonicon linktilebuttonicon_home" src="/resources03a/images/pages/hm.png" alt="home" /><br />Home</div></a><span class="linktilebuttonhspace"></span></div>
end_header_generated_by_makelinkchain=
    
    '''
    files.writeall(f'{tmpdir}/mdnotjekyll_info.txt', manifest)
    
    for f, short in files.listfiles(indir):
        if short.endswith('.md') and not 'readme' in short.lower() and not 'rationale' in short.lower():
            dest = files.join(tmpdir, short).replace('.md','.mdnotjekyll')
            files.copy(f, dest, False)
    prevpath = os.path.abspath('.')
    scr = r"C:\b\devarchive\moltenform\site-make-pages\markdown\goMarkdown.py"
    os.chdir(files.getparent(scr))
    args = [r"C:\data\e5\unzipped\devkits\py_64_37\pythonw", scr]
    files.run(args)
    os.chdir(prevpath)
    
    for f, short in files.listfiles(outdir):
        if f.lower().endswith('.html'):
            files.delete(f)
            
    headerfragment = files.readall(outdir+'../noship_headerfragment.html', encoding='utf-8')
    
    for f, short in files.listfiles(tmpdir):
        if short.endswith('.html'):
            dest = files.join(outdir, short)
            files.move(f, dest, False)
            alltxt = files.readall(dest, encoding='utf-8')
            alltxt = fixuphtml(alltxt, headerfragment)
            files.writeall(dest, alltxt, encoding='utf-8')
    import shutil
    shutil.rmtree(tmpdir)

def fixuphtml(alltxt, headerfragment):
    def replExpectAtLeastOne(s1, s2):
        nonlocal alltxt
        assertTrue(s1 in alltxt, "not seen", s1)
        alltxt = alltxt.replace(s1, s2)
    replExpectAtLeastOne('md">', 'html">')
    replExpectAtLeastOne('<head>', '<head><!-- Styles by GithubMarkdown, MIT license, Sindre Sorhus -->\n'+headerfragment+'\n')
    replExpectAtLeastOne('<div class="smalltheme-uppernavbox"><span class="linktilebuttonhspace"></span><a href="/"><div class="linktilebutton linktilebutton_narrow linktilebutton_homenarrow"><img class="linktilebuttonicon linktilebuttonicon_home" src="/resources03a/images/pages/hm.png" alt="home" /><br />Home</div></a><span class="linktilebuttonhspace"></span></div>', 
        '<div class="smalltheme-uppernavbox"><span class="linktilebuttonhspace"></span><a class="smalltheme-textwithinbox" href="/">vipercard</a><span class="smalltheme-textwithinbox"> &gt; </span><a class="smalltheme-textwithinbox" href="reference_01_overview.html">script reference</a><span class="linktilebuttonhspace"></span></div>')
    replExpectAtLeastOne('<link rel="stylesheet" href="../github-markdown/github-markdown.css">', '<link rel="stylesheet" href="./github-markdown.css">')
    replExpectAtLeastOne('<link rel="stylesheet" href="../smalltheme.css">', '<link rel="stylesheet" href="./smalltheme.css">')
    alltxt = alltxt.replace('example videos.', 'example videos (<a href="../video.html">here</a>).')
    return alltxt

if __name__=='__main__':
    outdir = r'..\vipercard\0.3\html\script_reference'
    transformToHtml('.', outdir)
    