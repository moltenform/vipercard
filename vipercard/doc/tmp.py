    def doRep(sIn):
        pts = re.split('\n=====*\n',sIn)
        if len(pts)%2 != 1:
            trace('hmm')
            return sIn
        else:
            div1 = '='*60
            div2 = '='*25 + ' '
            s = ''
            for bb in takeBatchOnArbitraryIterable(pts, 2):
                if len(bb)==2:
                    body, title = bb
                    s += '\n' + body + '\n'
                    middle = div2 + title.replace('\n','\n' + div2)
                    s += div1 + '\n' + middle + '\n' + div1 + '\n'
                else:
                    s += '\n' + bb[0]
            return s
    
    for f, short in files.listfiles(work_dir):
        txt = files.readall(f, encoding='utf-8')
        txt = doRep(txt)
        files.writeall(f, txt, encoding='utf-8')
    