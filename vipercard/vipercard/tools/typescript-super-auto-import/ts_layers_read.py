
# Ben Fisher, 2018
# MIT license

import os
import sys
import re
from collections import OrderedDict
from ts_parsing import *

def readLayersFile(dir):
    ret = None
    for f, short in files.recurseFiles(dir):
        if short == 'layers.cfg':
            if ret:
                assertTrueMsg(False, 'more than one layers.cfg seen.', file=f)
            ret = parseLayersFile(f, dir)
    if not ret:
        warn('no layers.cfg file seen.')
    return ret

def parseLayersFile(f, root):
    filesReferencedInLayers = {}
    filenamesReferencedInLayers = {}
    layers = []
    state = Bucket(currentDir=None, count = 0)
    
    def processLineDir(line):
        state.currentDir = line[1:]
        
    def processLineFile(short):
        fullpath = files.join(root, state.currentDir, short)
        if not files.exists(fullpath):
            showWarningGccStyle(f, 1, 'file not found')
            warn('file not found:', fullpath, short)
        
        if short.lower() in filenamesReferencedInLayers:
            showWarningGccStyle(f, 1, 'filename seen twice')
            warn('filename seen twice:', short)
        filenamesReferencedInLayers[short.lower()] = 1
        
        filesReferencedInLayers[fullpath] = 1
        state.count += 1
        layers.append((fullpath, files.splitExt(short)[0], state.count))
        
    with open(f, 'r', encoding='utf-8') as fin:
        for line in fin:
            line = line.strip()
            if line and not line.startswith('//'):
                if line.endswith('.ts'):
                    processLineFile(line)
                elif line.startswith('/'):
                    processLineDir(line)
                else:
                    showWarningGccStyle(f, 1, 'wrong line syntax')
                    warn('in layers.cfg, each line should start with / (a dir) or end with .ts (a file)', line)
    
    layers.sort(key=lambda o:o[1], reverse=True)
    return layers, filesReferencedInLayers, filenamesReferencedInLayers, f

def confirmNoDuplicateFilenames(dir):
    filenamesSeen = {}
    for f, short in files.recurseFiles(dir, allowedExts=['ts']):
        if not short.endswith('.d.ts'):
            if short.lower() in filenamesSeen:
                warn('duplicate filename:', f, filenamesSeen[short.lower()])
            filenamesSeen[short.lower()] = f

def confirmLayersIncludesFiles(layersCfg, dir, filenamesReferencedInLayers):
    for f, short in files.recurseFiles(dir, allowedExts=['ts']):
        if not short.endswith('.d.ts'):
            if short.lower() not in filenamesReferencedInLayers:
                showWarningGccStyle(layersCfg, 1, 'not seen in layers.cfg')
                warn('exists on disk but not in layers.cfg?', f)

def removeListDuplicates(lst):
    return list(OrderedDict.fromkeys(lst))
