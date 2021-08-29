
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
    files.ensureEmptyDirectory(tmpdir)
    manifest = '''
# These are temporary files belonging to vipercard

titleprefix=title
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
            
    headerfragment = files.readall(outdir+'/../noship_headerfragment.html', encoding='utf-8')
    
    for f, short in files.listfiles(tmpdir):
        if short.endswith('.html'):
            dest = files.join(outdir, short)
            files.move(f, dest, False)
            alltxt = files.readall(dest, encoding='utf-8')
            alltxt = fixuphtml(short, alltxt, headerfragment)
            files.writeall(dest, alltxt, encoding='utf-8')
    
    import shutil
    shutil.rmtree(tmpdir)
    movePagesUp(outdir)

g_titles = {}
g_titles['page_404'] = 'ViperCard - Page not found'
g_titles['page_terms'] = 'ViperCard - Terms and Content Policies'
g_titles['page_video'] = 'ViperCard - Tutorial Videos'
g_titles['page_video1'] = 'ViperCard - Tutorial Videos - Making a GIF'
g_titles['page_video2'] = 'ViperCard - Tutorial Videos - Making a game'
g_titles['page_video3'] = 'ViperCard - Tutorial Videos - Making interactive art'
g_titles['page_why'] = 'ViperCard - Rationale'
g_titles['reference_01_overview'] = 'ViperCard - Script Reference - overview'
g_titles['reference_02_commands'] = 'ViperCard - Script Reference - commands'
g_titles['reference_03_syntax'] = 'ViperCard - Script Reference - syntax'
g_titles['reference_04_properties'] = 'ViperCard - Script Reference - properties'
g_titles['reference_05_functions'] = 'ViperCard - Script Reference - functions'
g_titles['reference_06_events'] = 'ViperCard - Script Reference - events'
g_titles['reference_07_compatibility'] = 'ViperCard - Script Reference - compatibility'
navScrRef = '<div class="smalltheme-uppernavbox"><span class="linktilebuttonhspace"></span><a class="smalltheme-textwithinbox" href="/">vipercard</a><span class="smalltheme-textwithinbox"> &gt; </span><a class="smalltheme-textwithinbox" href="reference_01_overview.html">script reference</a><span class="linktilebuttonhspace"></span></div>'
navVideo = '<div class="smalltheme-uppernavbox"><span class="linktilebuttonhspace"></span><a class="smalltheme-textwithinbox" href="/">vipercard</a><span class="smalltheme-textwithinbox"> &gt; </span><a class="smalltheme-textwithinbox" href="video.html">tutorial vids</a><span class="linktilebuttonhspace"></span></div>'
g_nav = {}
g_nav['page_404'] = '<div class="smalltheme-uppernavbox"><span class="linktilebuttonhspace"></span><a class="smalltheme-textwithinbox" href="/">vipercard</a><span class="smalltheme-textwithinbox"><span class="linktilebuttonhspace"></span></div>'
g_nav['page_terms'] = '<div class="smalltheme-uppernavbox"><span class="linktilebuttonhspace"></span><a class="smalltheme-textwithinbox" href="/">vipercard</a><span class="smalltheme-textwithinbox"><span class="linktilebuttonhspace"></span></div>'
g_nav['page_video'] = navVideo
g_nav['page_video1'] = navVideo
g_nav['page_video2'] = navVideo
g_nav['page_video3'] = navVideo
g_nav['page_why'] = '<div class="smalltheme-uppernavbox"><span class="linktilebuttonhspace"></span><a class="smalltheme-textwithinbox" href="/">vipercard</a><span class="smalltheme-textwithinbox"> &gt; </span><a class="smalltheme-textwithinbox" href="#">Why</a><span class="linktilebuttonhspace"></span></div>'
g_nav['reference_01_overview'] = navScrRef
g_nav['reference_02_commands'] = navScrRef
g_nav['reference_03_syntax'] = navScrRef
g_nav['reference_04_properties'] = navScrRef
g_nav['reference_05_functions'] = navScrRef
g_nav['reference_06_events'] = navScrRef
g_nav['reference_07_compatibility'] = navScrRef
g_descriptions={}
g_descriptions['page_404'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['page_terms'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['page_video'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['page_video1'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['page_video2'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['page_video3'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['page_why'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['reference_01_overview'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['reference_02_commands'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['reference_03_syntax'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['reference_04_properties'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['reference_05_functions'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['reference_06_events'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'
g_descriptions['reference_07_compatibility'] = 'ViperCard, an open source HyperCard, make interactive 1 bit art and games like Macintosh'

def fixuphtml(short, alltxt, headerfragment):
    
    def replExpectAtLeastOne(s1, s2):
        nonlocal alltxt
        assertTrue(s1 in alltxt, "not seen", s1)
        alltxt = alltxt.replace(s1, s2)
    if not 'page' in short:
        replExpectAtLeastOne('md">', 'html">')
    key = short.split('.')[0]
    replExpectAtLeastOne('<head>', '<head><!-- Styles by GithubMarkdown, MIT license, Sindre Sorhus -->\n'+headerfragment+'\n')
    replExpectAtLeastOne('<div class="smalltheme-uppernavbox"><span class="linktilebuttonhspace"></span><a href="/"><div class="linktilebutton linktilebutton_narrow linktilebutton_homenarrow"><img class="linktilebuttonicon linktilebuttonicon_home" src="/resources03a/images/pages/hm.png" alt="home" /><br />Home</div></a><span class="linktilebuttonhspace"></span></div>', 
        g_nav[key])
    replExpectAtLeastOne('<link rel="stylesheet" href="../github-markdown/github-markdown.css">', '<link rel="stylesheet" href="./github-markdown.css">')
    replExpectAtLeastOne('<link rel="stylesheet" href="../smalltheme.css">', '<link rel="stylesheet" href="./smalltheme.css">')
    alltxt = alltxt.replace('example videos.', 'example videos (<a href="../video.html">here</a>).')
    alltxt = re.sub(r'<title>(.*?)</title>', rf'<title>{g_titles[key]}</title>', alltxt)
    alltxt = alltxt.replace('%%keywords%%', g_descriptions[key]+', '+g_titles[key])
    alltxt = alltxt.replace('%%description%%', g_descriptions[key]+', '+g_titles[key])
    return alltxt

def fixuphtmlpage(alltxt):
    def replExpectAtLeastOne(s1, s2):
        nonlocal alltxt
        assertTrue(s1 in alltxt, "not seen", s1)
        alltxt = alltxt.replace(s1, s2)
    
    replExpectAtLeastOne('<link rel="stylesheet" href="./smalltheme.css">', '<link rel="stylesheet" href="./script_reference/smalltheme.css">')
    replExpectAtLeastOne('<link rel="stylesheet" href="./github-markdown.css">', '<link rel="stylesheet" href="./script_reference/github-markdown.css">')
    return alltxt

def movePagesUp(outdir):
    for f, short in files.listfiles(outdir):
        if short.startswith('page_'):
            dest = f'{outdir}/../{short.replace("page_", "")}'
            files.move(f, dest, True) # overwrite existing
            # fix html
            alltxt = files.readall(dest, encoding='utf-8')
            alltxt = fixuphtmlpage(alltxt)
            files.writeall(dest, alltxt, encoding='utf-8')

if __name__=='__main__':
    outdir = r'..\vipercard\0.3\html\script_reference'
    transformToHtml('.', outdir)
    