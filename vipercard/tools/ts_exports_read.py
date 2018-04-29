
# ts_exports_read.py
# Ben Fisher, 2017

from ts_exports_util import *
import os
import sys
import re

def collectExportsLine(line, found, which):
    pts = re.split(' +', line)
    ret = pts[which]
    ret = ret.split('<')[0]
    ret = ret.split('(')[0]
    ret = ret.split(':')[0]
    if ret not in found:
        found.append(ret)

def collectExports(file):
    # nb: will grab anything starting with export class, even if within a commented out /* */ section
    short = os.path.split(file)[-1]
    shortd = short.replace('.ts', '.js')
    f = open(file, 'r', encoding='utf8')
    found = []
    for line in f:
        line = line.rstrip()
        if line.startswith('export class ') or line.startswith('export function ') \
            or line.startswith('export enum ') or line.startswith('export type ')  \
                or line.startswith('export interface ') or line.startswith('export const ') or line.startswith('export let ') or line.startswith('export var ') or line.startswith('export type '):
            collectExportsLine(line, found, 2)
        elif line.startswith('export abstract class ') or line.startswith('export async function '):
            collectExportsLine(line, found, 3)
    
    return found

def readAlreadyImportedNotByUs(filelines):
    imports = dict()
    for line in filelines:
        if line.startswith('import ') and '{' in line and not '/* auto */' in line:
            a, b = line.split('{')
            c, d = line.split('}')
            for item in c.split(','):
                imports[item.strip()] = True
    return imports


