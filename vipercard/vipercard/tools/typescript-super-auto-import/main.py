
# Ben Fisher, 2018
# MIT license

from ts_exports_read import *
from ts_layers_read import *
from ts_parsing import *
from ts_add_copyright import *
import readconfig

def go():
    dir, useSingleQuotes, config = readconfig.readconfig()
    confirmNoDuplicateFilenames(dir)
    layers, filesReferencedInLayers, filenamesReferencedInLayers, layersCfg = readLayersFile(dir)
    confirmLayersIncludesFiles(layersCfg, dir, filenamesReferencedInLayers)
    autoAddImports(config, dir, layers, useSingleQuotes)
    enforceLayering(config, dir)

def autoAddImports(config, srcdirectory, layers, useSingleQuotes):
    mapSymbolNameToLayer = {}
    
    # get a map of symbol to filename where exported from
    for layer in layers:
        layerfullpath, layershortnoext, layerdepth = layer
        symbolsInLayer = collectExports(layerfullpath)
            
        for symbol in symbolsInLayer:
            symbol = symbol.strip()
            if symbol:
                if symbol in mapSymbolNameToLayer:
                    prevFound = mapSymbolNameToLayer[symbol]
                    assertTrueMsg(symbol == 'runTestsImpl', f'dupe symbol in both {prevFound[0]} and {layer[0]}', symbol, file=layer[0])
                mapSymbolNameToLayer[symbol] = layer
    
    # add the imports
    for layer in layers:
        lines = None
        layerfullpath, layershortnoext, layerdepth = layer
        trace(layerfullpath)
        lines = getFileLines(layerfullpath, tryToStripComments)
        
        addNewForThisFile = []
        for line in lines:
            if not line.strip().startswith('import ') and not line.strip().startswith('/* auto */ import') and not 'import {' in line:
                for symbol in getSymbolsFromLine(line):
                    foundFromExports = mapSymbolNameToLayer.get(symbol, None)
                    if foundFromExports is not None:
                        if foundFromExports[0] == layerfullpath:
                            pass # we don't need to import from ourself
                        else:
                            addNewForThisFile.append((symbol, foundFromExports[0], foundFromExports[1]))
        
        addNewForThisFile.sort()
        # remove duplicates
        addNewForThisFile = removeListDuplicates(addNewForThisFile)
        # sort by level , low-level to high-level
        addNewForThisFile.sort(reverse=True, key=lambda item:item[2])
        
        whatToAdd = []
        currentFilename = None
        for symbol, foundFromExports0, foundFromExports1 in addNewForThisFile:
            if currentFilename != foundFromExports0:
                whatToAdd.append([foundFromExports0])
                currentFilename = foundFromExports0
            whatToAdd[-1].append(symbol)
        
        newLinesToAdd = []
        for parts in whatToAdd:
            theImports = parts[1:]
            importFromFile = getImportFromFile(config, srcdirectory, layerfullpath, parts[0])
            quote = "'" if useSingleQuotes else '"'
            s = f'''/* auto */ import {{ {', '.join(theImports)} }} from {quote}{importFromFile}{quote};'''
            newLinesToAdd.append(s)
        
        if newLinesToAdd:
            linesOrigFile = getFileLines(layerfullpath, False)
            linesWithNoAuto = [line for line in linesOrigFile if not (line.startswith('/* auto */ import') and '{' in line )]
            assertTrueMsg(linesWithNoAuto[0] == '', 'expected file to start with an empty line ', layer[0], file=layer[0])
            addNewLine = linesWithNoAuto[1] != ''
            if addNewLine:
                newLinesToAdd.append('')
            addCopyrightIfEnabled(config, layerfullpath, linesWithNoAuto, newLinesToAdd)
            linesWithNoAuto[1:1] = newLinesToAdd
            
            alltxtNew = '\n'.join(linesWithNoAuto)
            if alltxtNew != '\n'.join(linesOrigFile):
                print('Writing')
                print('\n'.join(newLinesToAdd))
                files.writeAll(layerfullpath, alltxtNew, encoding='utf-8')

def getImportFromFile(config, srcdirectory, layerfullpath, srcfilename):
    srcfilenameWithoutExt = files.splitExt(srcfilename)[0]
    startdir = files.getParent(layerfullpath)
    s = './' + os.path.relpath(srcfilenameWithoutExt, startdir).replace('\\', '/')
    s += config['main']['fileExtensionInImportStatement'].strip()
    return s
    
def countDirDepth(s):
    return len(s.replace('\\', '/').split('/')) - 1

def enforceLayering(config, srcdirectory):
    if not int(config['main']['enforceLayersOrder']):
        print('complete')
        return
    
    print('running enforceLayering...')
    layers, filesReferencedInLayers, filenamesReferencedInLayers, layersCfg = readLayersFile(srcdirectory)
    for layer in layers:
        # read file
        basefilecontents = '\n'.join(getFileLines(layer[0], tryToStripComments))
        
        # this layer should not be able to import from anything above it
        disallowImportsFromGreaterThan = layer[2]
        for jlayer in layers:
            if jlayer[2] < disallowImportsFromGreaterThan:
                # check that the current layer didn't import from this greaterthan one
                disallowedfilename = re.escape(jlayer[1])
                assertTrueMsg(not disallowedfilename.endswith('.js') and not disallowedfilename.endswith('.ts'), disallowedfilename)
                
                # disallow "example.js", allow "_example.js_"
                if re.search(r'\b' + disallowedfilename + r'\.(ts|js)\b', basefilecontents) or \
                 re.search(r'\bfrom "[^"]*?' + disallowedfilename + r'"', basefilecontents) or \
                 re.search(r"\bfrom '[^']*?" + disallowedfilename + r"'", basefilecontents):
                    sErr = f'file {layer[0]} referred to a layer above it "{disallowedfilename}" ({jlayer[0]})'
                    showWarningGccStyle(layer[0], 1, sErr)
                    warn(sErr)
    
    print('layer check complete')

if __name__ == '__main__':
    go()
