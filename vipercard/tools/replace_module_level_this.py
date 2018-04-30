
# https://github.com/downpoured/vipercard
# replace_module_level_this.py
#
# the typescript-emitted javascript contains a lot of code referring to module-level this,
# such as var __read = (this && this.__read)
# which (understandable) triggers a warning in rollup.js, although it's not dangerous
#
# this script safely replaces known instances of module-level this
# so that rollup.js can complete cleanly

import os
import fnmatch
import sys
import shutil
import re

def find_replace(directory, search_pattern, replacement, glob_pattern, create_backup, previewonly):
    for path, dirs, files in os.walk(os.path.abspath(directory)):
        for filename in fnmatch.filter(files, glob_pattern):
            pardir = os.path.normpath(os.path.join(path, '..'))
            pardir = os.path.split(pardir)[-1]
            filepath = os.path.join(path, filename)
            
            # backup orig file
            if create_backup:
                backup_path = filepath + '.bak'
                print('DBG: creating backup', backup_path)
                shutil.copyfile(filepath, backup_path)
                
            with open(filepath, 'r', encoding='utf8') as f:
                data = f.read()
                
            isPresent = re.search(search_pattern, data)
            if isPresent:
                print('\nreplacing in file ' + filepath)
            
            def fnReplace(match):
                context = data[(match.span()[0]-40):(match.span()[1]+40)]
                context = context.replace('\r\n', '|')
                context = context.replace('\n', '|')
                print('saw '+str(context))
                return replacement
            
            newdata = re.sub(search_pattern, fnReplace, data)
            if not previewonly:
                with open(filepath, "w", encoding='utf8') as f:
                    f.write(newdata)

def go_replace_module_level_this(targetdir):
    # the typescript-emitted js will cause rollup to warn: `this` has been rewritten to `undefined`
    pairs = [
        [r'var __read = (this && this.__read) || function (o, n) {', r'var __read = function (o, n) {'],
        [r'var __extends = (this && this.__extends) || (function () {', r'var __extends = (function () {'],
        [r'var __values = (this && this.__values) || function (o) {', r'var __values = function (o) {'],
        [r'var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {', r'var __awaiter = function (thisArg, _arguments, P, generator) {'],
        [r'var __generator = (this && this.__generator) || function (thisArg, body) {', r'var __generator = function (thisArg, body) {'],
        [r'var __spread = (this && this.__spread) || function () {', r'var __spread = function () {'],
    ]
    
    glob_pattern = '*.js'
    dobackup = False
    previewonly = False
    for a, b in pairs:
        search_regex = re.escape(a)
        replacement = b
        find_replace(targetdir, search_regex, replacement, glob_pattern, dobackup, previewonly)

if __name__ == '__main__':
    if len(sys.argv) == 1:
        print('missing argument')
        sys.exit(-1)
    targetdir = sys.argv[1]
    operation = sys.argv[2]
    if not os.path.isdir(targetdir):
        print('not a directory')
        sys.exit(-1)
    if operation == 'do_replace_module_level_this':
        go_replace_module_level_this(targetdir)
    else:
        print('unknown operation')
        sys.exit(-1)
        
    
    
        
    
    