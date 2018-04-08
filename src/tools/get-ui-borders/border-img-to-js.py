from ben_python_common import *
from PIL import Image
import json
from itertools import groupby

commentOutTransparent = True
pixelWhite = (255, 255, 255, 255)
pixelBlack = (0, 0, 0, 255)


def pixelToShorthand(p, x, rownum):
    if p == pixelWhite or p == (254, 254, 254, 255):
        return 'w'
    elif p == pixelBlack:
        return 'b'
    elif p[3] == 255 and (p[1] - p[0]) > 200 and (p[1]-p[2]) > 200:
        # use green to represent transparent
        return 't'
    else:
        assertTrue(False, f'unknown pixel {p} ({x}, {rownum})')

def rowToShorthand(piecewidth, pieceheight, pix, rownum):
    s = ''
    for x in range(piecewidth):
        s += pixelToShorthand(pix[x, rownum], x, rownum)
    return s

def colToShorthand(piecewidth, pieceheight, pix, colnum):
    s = ''
    for y in range(pieceheight):
        s += pixelToShorthand(pix[colnum, y], colnum, y)
    return s

def getFallbackRect(nameWithoutR):
    isclicked = 'true' if 'clicked' in nameWithoutR else 'false'
    return f'return this.fallbackToSimpleRect({isclicked});'

def processOneSide(nameWithoutR, piecewidth, pieceheight, im, pix, isleftside, codelines):
    middleRowNum = pieceheight//2
    middleRow = rowToShorthand(piecewidth, pieceheight, pix, middleRowNum)
    if 'markedcenter-' in nameWithoutR:
        assertTrue('t' in middleRow, 'expect middle row to have a transparent(green) pixel ' + middleRow)
    
    # find first offset where the image becomes the same as the center part
    firstOffset = -1
    for y in range(1, pieceheight):
        if rowToShorthand(piecewidth, pieceheight, pix, y) == middleRow:
            firstOffset = y
            break
    assertTrue(firstOffset > 0)
    
    # find last offset where the image becomes the same as the center part
    lastOffset = -1
    for ym in range(1, pieceheight):
        y= (pieceheight-1)-ym
        if rowToShorthand(piecewidth, pieceheight, pix, y) == middleRow:
            lastOffset = y
            break
    assertTrue(lastOffset > 0)
    
    lengthOfFillerMiddle = lastOffset - firstOffset
    totalheightneeded = 1 + (pieceheight - lengthOfFillerMiddle)
    codelines.checkdims += f'\n\tif (height < {totalheightneeded}) {{ {getFallbackRect(nameWithoutR)} }}'
    
    if isleftside:
        startx = 'basex'
    else:
        startx = '(basex + width - ' + str(im.size[0]) + ')'
    
    codelines.append(f'amountToStretch=(height - ({pieceheight} - {lengthOfFillerMiddle}))')
    for colnum in range(piecewidth):
        listofchars = [c for c in colToShorthand(piecewidth, pieceheight, pix, colnum)]
        
        # draw the top part
        codelines.append('y = basey')
        topPart = listofchars[0:firstOffset]
        drawLines(codelines, startx, colnum, topPart)
        
        # draw the middle part (the part that stretches based on image height)
        assertEq(listofchars[middleRowNum], middleRow[colnum])
        colorOfMiddle = listofchars[middleRowNum]
        codelines.append(f'this.drawRect({startx} + {colnum}, basey + {firstOffset}, 1, amountToStretch, "{colorOfMiddle}")')
        
        # draw the bottom part
        codelines.append(f'y=basey + {firstOffset} + amountToStretch')
        bottomPart = listofchars[lastOffset:]
        drawLines(codelines, startx, colnum, bottomPart)
        codelines.append('')
    
    if isleftside:
        codelines.append('/* drawing middle */')
        middlePartPixels = colToShorthand(im.size[0], im.size[1], pix, im.size[0]-1)
        
        # draw the middle top part
        codelines.append('y = basey')
        topPart = middlePartPixels[0:firstOffset]
        drawLinesMiddle(codelines, startx, colnum, topPart, im.size[0])
        
        # draw the middle middle part (the part that stretches based on both width + height)
        assertEq(middlePartPixels[middleRowNum], middleRow[im.size[0] - 1])
        colorOfMiddle = middlePartPixels[middleRowNum]
        codelines.append(f'this.drawRect({startx} + {colnum}, basey + {firstOffset}, amountToStretchHoriz, amountToStretch, "{colorOfMiddle}")')
        
        # draw the middle bottom part
        codelines.append(f'y=basey + {firstOffset} + amountToStretch')
        bottomPart = middlePartPixels[lastOffset:]
        drawLinesMiddle(codelines, startx, colnum, bottomPart, im.size[0])
        codelines.append('')
        
def drawLines(codelines, startx, colnum, chars):
    for k, group in groupby(chars):
        group = list(group)
        numberOfPixels = len(group)
        colorOfPixels = group[0]
        codelines.append(f'this.drawRect({startx} + {colnum}, y, 1, {numberOfPixels}, "{colorOfPixels}")')
        codelines.append(f'y += {numberOfPixels}')

def drawLinesMiddle(codelines, startx, colnum, chars, imleftwidth):
    for k, group in groupby(chars):
        group = list(group)
        numberOfPixels = len(group)
        colorOfPixels = group[0]
        codelines.append(f'this.drawRect(basex + {imleftwidth}, y, amountToStretchHoriz, {numberOfPixels}, "{colorOfPixels}")')
        codelines.append(f'y += {numberOfPixels}')

def goProcess(nameWithoutR, codelines):
    imleft = Image.open(nameWithoutR + '.png')
    imright = Image.open(nameWithoutR + '-r.png')
    imleft = imleft.convert('RGBA')
    imright = imright.convert('RGBA')
    pixleft = imleft.load()
    pixright = imright.load()
    assertEq(imleft.size[1], imright.size[1], "we haven't tested this case")
    
    totalwidthneeded = 1 + imleft.size[0]+ imright.size[0]
    codelines.checkdims = ''
    codelines.append('public draw'+nameWithoutR + '() {')
    codelines.append(f'const width=this.width;')
    codelines.append(f'const height=this.height;')
    codelines.append(f'const basex=this.basex;')
    codelines.append(f'const basey=this.basey;')
    codelines.append(f'let y=0;')
    codelines.append(f'let amountToStretch=0;')
    codelines.append(f'const amountToStretchHoriz=(width - ({imleft.size[0]} + {imright.size[0]})) + 1')
    codelines.append(f'if (width < {totalwidthneeded}) {{ {getFallbackRect(nameWithoutR)} }}')
    codelines.append(f'%checkdims%')
    codelines.append(f'')
    
    # find the decoration heights
    if 'markedcenter-' in nameWithoutR:
        codelines.append("this.drawRect(basex, basey, width, height, 'w');")
    
    codelines.append('/* drawing left side */')
    processOneSide(nameWithoutR, imleft.size[0], imleft.size[1], imleft, pixleft, True, codelines)
    codelines.append('/* drawing right side */')
    processOneSide(nameWithoutR, imright.size[0], imright.size[1], imright, pixright, False, codelines)

    codelines.append(f'return true;')
    codelines.append('}')
        
class Codelines():
    def __init__(self):
        self.lines = []
    def append(self, line):
        self.lines.append(line)
    
def shorten(s):
    s = s.replace('const width = this.width;', 'const w = this.w;')
    s = s.replace('const height = this.height;', 'const h = this.h;')
    s = s.replace('const basex = this.basex;', 'const bx = this.bx;')
    s = s.replace('const basey = this.basey;', 'const by = this.by;')
    s = re_replacewholeword(s, 'width', 'w')
    s = re_replacewholeword(s, 'height', 'h')
    s = re_replacewholeword(s, 'basex', 'bx')
    s = re_replacewholeword(s, 'basey', 'by')
    s = re_replacewholeword(s, 'drawRect', 'dr')
    s = re_replacewholeword(s, 'amountToStretch', 'stre_y')
    s = re_replacewholeword(s, 'amountToStretchHoriz', 'stre_x')
    lines = s.replace('\r\n', '\n').split('\n')
    for i, line in enumerate(lines):
        lstr = line.strip()
        whitespace = '\t'
        if lstr.startswith('this.dr(') and (lstr.endswith(', "t")') or lstr.endswith(', \'t\')')):
            lines[i] = whitespace+'/* (transparent) ' + line.strip() + ' */'
    s = '\n'.join(lines)
    s = s.replace('"t"', 'cT')
    s = s.replace('"w"', 'cW')
    s = s.replace('"b"', 'cB')
    s = s.replace("'t'", 'cT')
    s = s.replace("'w'", 'cW')
    s = s.replace("'b'", 'cB')
    return s

def writeCodelines(codelines):
    codelines.checkdims = codelines.checkdims.lstrip()
    allLines = []
    for line in codelines.lines:
        line = line.replace('%checkdims%', codelines.checkdims)
        if line.startswith('public ') or line == '}':
            allLines.append(line)
        else:
            allLines.append('\t'+line)
    return allLines

def goAll():
    for file, short in files.listfiles('.'):
        if file.endswith('.png') and not '-r' in file:
            print('')
            print('/* ' + short + ' */')
            codelines = Codelines()
            goProcess(short.replace('.png', ''), codelines)
            allLines = writeCodelines(codelines)
            allTxt = '\n'.join(allLines)
            allTxt = shorten(allTxt)
            print(allTxt)
    
if __name__ == '__main__':
    goAll()
    