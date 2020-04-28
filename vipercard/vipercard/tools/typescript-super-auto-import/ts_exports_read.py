
# Ben Fisher, 2018
# MIT license

import os
import sys
import re
from collections import OrderedDict
from ts_parsing import *

tryToStripComments = 'multilineonly'

def collectExportsLine(line, found, which):
    pts = re.split(' +', line)
    ret = pts[which]
    ret = ret.split('<')[0]
    ret = ret.split('(')[0]
    ret = ret.split(':')[0]
    if ret in found:
        if found[ret] == 'ignore':
            pass
        else:
            trace('warning: apparently exported twice', ret)
    else:
        found[ret] = 1

def collectExports(file):
    lines = getFileLines(file, tryToStripComments)
    found = OrderedDict()
    for line in lines:
        if line.startswith('export class ') or \
            line.startswith('export function ') or \
            line.startswith('export enum ') or \
            line.startswith('export interface ') or \
            line.startswith('export let ') or \
            line.startswith('export var ') or \
            line.startswith('export namespace ') or \
            line.startswith('export type ') or \
            (line.startswith('export const ') and not line.startswith('export const enum')):
            collectExportsLine(line, found, 2)
        elif line.startswith('export abstract class ') or \
            line.startswith('export async function ') or \
            line.startswith('export const enum ') or \
            line.startswith('export declare class ') or \
            line.startswith('export declare function ') or \
            line.startswith('export declare enum ') or \
            line.startswith('export declare interface ') or \
            line.startswith('export declare const ') or \
            line.startswith('export declare let ') or \
            line.startswith('export declare var ') or \
            line.startswith('export declare namespace ') or \
            line.startswith('export declare type '):
            collectExportsLine(line, found, 3)
        elif line.startswith('export declare abstract class ') or \
            line.startswith('export declare async function ') or \
            line.startswith('export declare const enum '):
            collectExportsLine(line, found, 4)
        elif line.startswith('/* ts_exports_read.py add '):
            collectExportsAddedManually(line, found)
        elif line.startswith('/* ts_exports_read.py ignore '):
            collectExportsIgnoredManually(line, found)
    
    found = {k:found[k] for k in found if found[k] != 'ignore'}
    return found

def readAlreadyImportedNotByUs(filelines):
    # not supported:
    # 1) many prettifiers want to put the imports on multiple lines, so it's annoying to parse
    # 2) typescript will warn us if a symbol is imported twice, so no need.
    return {}
    if False:
        imports = dict()
        for line in filelines:
            if line.startswith('import ') and '{' in line and not '/* auto */' in line:
                a, b = line.split('{')
                c, d = line.split('}')
                for item in c.split(','):
                    imports[item.strip()] = True
        return imports

def collectExportsAddedManually(line, found):
    assertTrueMsg(line.startswith('/* ts_exports_read.py add '), 'internal error, no prefix', line)
    pts = line.replace('*/', '').replace('/* ', '').split(' ')
    pts.pop(0) # remove "ts_exports_read.py"
    pts.pop(0) # remove "add"
    for pt in pts:
        found[pt.strip()] = 1
    
def collectExportsIgnoredManually(line, found):
    assertTrueMsg(line.startswith('/* ts_exports_read.py ignore '), 'internal error, no prefix', line)
    pts = line.replace('*/', '').replace('/* ', '').split(' ')
    pts.pop(0) # remove "ts_exports_read.py"
    pts.pop(0) # remove "ignore"
    for pt in pts:
        found[pt.strip()] = 'ignore'
    
