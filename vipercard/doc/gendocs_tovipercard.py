
from gendocs import *
specialCharFontChange = "\x02"
changeFontTitle = f'{specialCharFontChange}times_24_biuosdce{specialCharFontChange}'
changeFontBody = f'{specialCharFontChange}times_12_biuosdce{specialCharFontChange}'
changeFontBold = f'{specialCharFontChange}times_12_+biuosdce{specialCharFontChange}'
changeFontCode = f'{specialCharFontChange}monaco_9_biuosdce{specialCharFontChange}'

def goItem(item):
    shortTitle, title, body = item
    ret = {}
    
    body = body.replace(specialCharFontChange, '?')
    body = changeFontTitle + title + changeFontBody + '\n\n' + body
    
    counter = 0
    def doReplaceBold(np):
        nonlocal counter
        counter += 1
        if counter % 2 == 1:
            return changeFontBold
        else:
            return changeFontBody
    body = re.sub(r'\^',doReplaceBold,body)
    
    counter = 0
    def doReplaceCodef(np):
        nonlocal counter
        counter += 1
        if counter % 2 == 1:
            return changeFontCode
        else:
            return changeFontBody
    body = re.sub(r'`',doReplaceCodef, body)
    body = changeFontBody + body
    body = body.replace('$caret$', '^').replace('$backtic1$', '`').replace('$backtic$', '\\`')
    ret['title'] = title
    ret['body'] = body
    return ret

def goSection(section, sectionfulltitle, outname, outfile):
    trace(f'{outname}...')
    out = OrderedDict()
    out['name'] = sectionfulltitle
    entries = []
    out['entries'] = entries
    for item in section:
        entries.append(goItem(item))
    alls = json.dumps(out)
    trace('write to ', outfile)
    files.writeall(outfile, alls, encoding='utf-8')

def goTsIndexSection(section, sectionfulltitle, outname):
    trace('/* prettier-ignore */')
    out = []
    out.append(outname)
    out.append(sectionfulltitle)
    entries = []
    out.append(entries)
    for item in section:
        shortTitle, title, body = item
        entries.append(shortTitle)
    j = json.dumps(out)
    assertTrue(not "'" in j, 'has single quote')
    trace(j.replace('"', "'") + ',')
    
def goToVipercard(indir, outdir):
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
        outfile = files.join(outdir, f'ref{outname}.json')
        goSection(section, sectionfulltitle, outname, outfile)
    for key in data:
        section = data[key]
        outname = key.split('_')[-1].lower()
        sectionfulltitle = mapIt[outname]
        goTsIndexSection(section, sectionfulltitle, outname)
    trace('done.')

if __name__=='__main__':
    outdir = '../vipercard/resources03a/docs'
    goToVipercard('.', outdir)
    

