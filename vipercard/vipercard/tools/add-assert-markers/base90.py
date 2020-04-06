
import os
import sys
import re
sys.path.append('../typescript-super-auto-import/bn_python_common.zip')
from bn_python_common import *
sys.path.append('../typescript-super-auto-import')
from ts_parsing import *

base90Chars = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    ' ',
    '!',
    '#',
    '%',
    '&',
    '(',
    ')',
    '*',
    '+',
    ',',
    '-',
    '.',
    '/',
    ':',
    ';',
    '<',
    '=',
    '>',
    '?',
    '@',
    '[',
    ']',
    '^',
    '_',
    '{',
    '|',
    '}',
    '~'
    ]

# all ascii printable except
# ' " ` which can interfere with js strings
# $ which when paired with ${  can interfere with js ` style strings
# \ which can interfere with js strings
# that's 95 - 5 = base 90

def toBase90(n):
    s = ''
    while n >= 90:
        digit = n%90
        s = base90Chars[digit] + s
        n = n // 90
    s = base90Chars[n] + s
    return s
    
def tests():
    assertEq(90, len(base90Chars))
    assertEq('0', toBase90(0))
    assertEq('A', toBase90(10))
    assertEq('}', toBase90(88))
    assertEq('~', toBase90(89))
    assertEq('10', toBase90(90))
    assertEq('11', toBase90(91))
    assertEq('~}', toBase90(8098))
    assertEq('~~', toBase90(8099))
    assertEq('100', toBase90(8100))
    assertEq('101', toBase90(8101))

tests()
