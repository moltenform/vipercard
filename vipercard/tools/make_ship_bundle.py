# https://github.com/moltenform/vipercard
# make_release_bundle.py

import os
import sys
import shutil
from ts_exports_util import *
import replace_module_level_this

def selectReleaseFiles(isDebug):
    if isDebug:
        print('going back to debug config...')
    else:
        print('selecting release config...')
    
    fls = [
        '0.2/index$.html', 
        '0.2/index_wtests$.html',
        'tsconfig$.json',
        'src/config$.ts',
    ]
    
    for fl in fls:
        asDebug = fl.replace('$', '.debug')
        asRelease = fl.replace('$', '.ship')
        asCurrent = fl.replace('$', '')
        print(asCurrent)
        assertTrue(os.path.exists(asRelease), 'could not find', asRelease)
        assertTrue(os.path.exists(asDebug), 'could not find', asDebug)
        if (os.path.exists(asCurrent)):
            contentsDebug = myfilesreadall(asDebug)
            contentsRelease = myfilesreadall(asRelease)
            contentsCurrent = myfilesreadall(asCurrent)
            if contentsCurrent != contentsDebug and contentsCurrent != contentsRelease:
                warn('contents of '+asCurrent+' has unique data that will be overwritten.')
        
            os.unlink(asCurrent)
        
        if isDebug:
            shutil.copy(asDebug, asCurrent)
        else:
            shutil.copy(asRelease, asCurrent)
        
def runFullBuild():
    print('running full build...')
    args = ['node', './node_modules/typescript/bin/tsc']
    runProcess(args)

def delPreviouslyBuilt():
    print('deleting previously built...')
    delIfExists('./lib/vpcbundle.js')
    delIfExists('./lib/vpcbundlemin.js')
    delIfExists('./lib/vpcbundle.js.map')
    delIfExists('./lib/vpcbundle_wtests.js')
    delIfExists('./lib/vpcbundlemin_wtests.js')
    delIfExists('./lib/vpcbundle_wtests.js.map')

def runRollupAndUglify(withTests):
    if not withTests:
        print('producing build without test code...')
        contentsEmpty1 = myfilesreadall('./build/test/vpc/testRegistrationEmpty.js')
        contentsEmpty2 = myfilesreadall('./build/test/vpc/testRegistrationEmpty.js.map')
        shutil.rmtree('./build/test')
        os.makedirs('./build/test/vpc')
        myfileswriteall('./build/test/vpc/testRegistration.js', contentsEmpty1)
        myfileswriteall('./build/test/vpc/testRegistration.js.map', contentsEmpty2)
    
    nmbundle = './lib/vpcbundle%s.js' % ('_wtests' if withTests else '')
    nmbundlename = 'vpcbundle'
    nmbundlemap = 'vpcbundlemin%s.js.map' % ('_wtests' if withTests else '')
    nmbundlemin = './lib/vpcbundlemin%s.js' % ('_wtests' if withTests else '')
    print('running rollup... withTests=%s'%withTests)
    args = ('''node ./node_modules/rollup/bin/rollup ./build/ui512/root/rootStartCanvas.js --output.format iife --name %s --output.file %s'''%(nmbundlename, nmbundle)).split(' ')
    print(' '.join(args))
    runProcess(args)
    print('running uglifyjs... withTests%s'%withTests)
    args = ('''node ./node_modules/uglify-js/bin/uglifyjs %s -o %s --keep-fnames --mangle --compress --source-map filename=%s'''%(nmbundle, nmbundlemin, nmbundlemap)).split(' ')
    print(' '.join(args))
    runProcess(args)
    
    if not withTests:
        # destroy some build remnants, to make you do another build before resuming testing.
        shutil.rmtree('./build/test')
        shutil.rmtree('./build/ui512')
        

def go():
    print('reminder :) did you make sure the unit tests pass?')
    input()
    print('reminder :) please close tsc if it is currently running')
    input()
    os.chdir('../vipercard')
    delPreviouslyBuilt()
    selectReleaseFiles(False)
    runFullBuild()
    selectReleaseFiles(True)
    print('removing "module level this" in preparation for rollup...')
    replace_module_level_this.go_replace_module_level_this('./build')
    runRollupAndUglify(True)
    runRollupAndUglify(False)

if __name__=='__main__':
    go()
    

