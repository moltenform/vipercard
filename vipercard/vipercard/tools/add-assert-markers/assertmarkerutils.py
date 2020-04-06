
from base90 import *

def parseArguments(s, begin, f=None):
    # ` until `, ' until ', " until "
    lvl = 0
    arlvl = 0
    stNormal = 9
    stInSingleQt = 10
    stInDblQt = 11
    stInBkQt = 12
    startCharForIt = {"'":stInSingleQt, '"':stInDblQt, '`':stInBkQt}
    getCharForIt = {stInSingleQt:"'", stInDblQt:'"', stInBkQt:'`'}
    s = s[0:begin] + s[begin:].replace('\\\\', '$$$tmp_backslash_backslash$$$').replace('\\"', '$$$tmp_escaped_backslash_dblquote$$$').replace("\\'", '$$$tmp_escaped_backslash_singlequote$$$')
    
    st = stNormal
    i = begin - 1
    args = ['']
    while True:
        i+= 1
        if st==stNormal:
            if s[i] =='[':
                arlvl += 1
                args[-1] += s[i]
            elif s[i] ==']':
                arlvl -= 1
                args[-1] += s[i]
            elif s[i] =='(':
                lvl += 1
                args[-1] += s[i]
            elif s[i] ==')':
                lvl -= 1
                args[-1] += s[i]
                if lvl ==0 and arlvl==0:
                    break
            elif startCharForIt.get(s[i], None) is not None:
                args[-1] += s[i]
                st = startCharForIt.get(s[i], None)
            elif s[i] ==',' and lvl==1 and arlvl==0:
                args.append('')
            else:
                args[-1] += s[i]
            
        else:
            args[-1] += s[i]
            wanted = getCharForIt[st]
            if wanted==s[i]:
                st=stNormal
    
    args = [arg.replace('$$$tmp_escaped_backslash_dblquote$$$', '\\"' ).replace('$$$tmp_escaped_backslash_singlequote$$$', "\\'").replace('$$$tmp_backslash_backslash$$$', "\\\\")
        for arg in args]
    assertTrueMsg('(' in args[0], file=f)
    assertTrueMsg(args[-1].endswith(')'), file=f)
    prefix = args[0].split('(', 1)[0] + '('
    suffix = args[-1][-1]
    args[0] = args[0].split('(', 1)[1]
    args[-1] = args[-1][0:-1]
    totallength = len(prefix) + len(suffix) + len(','.join(args))
    return prefix, args, suffix, totallength
