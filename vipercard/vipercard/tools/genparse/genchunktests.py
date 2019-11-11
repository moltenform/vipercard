
from ben_python_common import *

indices = [
    '0',
    '1',
    '2',
    '4',
    '5',
    '0 to 0',
    '0 to 2',
    '0 to 4',
    '0 to 5',
    '1 to 0',
    '1 to 1',
    '1 to 2',
    '1 to 3',
    '1 to 4',
    '1 to 5',
    '2 to 1',
    '2 to 2',
    '2 to 3',
    '2 to 4',
    '2 to 5',
    '3 to 1',
    '3 to 3',
    '3 to 5',
    '4 to 4',
    '4 to 5',
    '4 to 6',
    '5 to 5']
indices = ['5 to 7']

templateGetChar = 'put char %ind of "abc" into line %outln of cd fld 1'
templateGetItem1 = 'put item %ind of "a,b,c" into line %outln of cd fld 1'
templateGetItem2 = 'put item %ind of ",,c," into line %outln of cd fld 1'
templateGetWord1 = 'put word %ind of "  abc  .def gh.i   " into line %outln of cd fld 1'
templateGetWord2 = 'put word %ind of "ABC   DEF  GHI" into line %outln of cd fld 1'
templateSetChar = 'put "abc" into x \nput "123" into char %ind of x \nput x into line %outln of cd fld 1'
templateSetItem1 = 'put "a,b,c" into x \nput "123" into item %ind of x \nput x into line %outln of cd fld 1'
templateSetItem2 = 'put ",,c," into x \nput "123" into item %ind of x \nput x into line %outln of cd fld 1'
templateSetWord1 = 'put "  abc  .def gh.i   " into x \nput "123" into word %ind of x \nput x into line %outln of cd fld 1'
templateSetWord2 = 'put "ABC   DEF  GHI" into x \nput "123" into word %ind of x \nput x into line %outln of cd fld 1'

genTestGetChar = ''
genTestGetItem1 =  ''
genTestGetItem2 = ''
genTestGetWord1 = ''
genTestGetWord2 = ''
genTestSetChar = ''
genTestSetItem1 = ''
genTestSetItem2 = ''
genTestSetWord1 = ''
genTestSetWord2 =''


outGetChar ='''
(start)

a
b







a
ab
abc
abc
abc

b
bc
bc
bc

c
c




(end)
'''
outGetItem1 ='''
(start)

a
b






a
a
a,b
a,b,c
a,b,c
a,b,c
b
b
b,c
b,c
b,c
c
c
c




(end)
'''
outGetItem2 ='''
(start)











,
,,c
,,c,
,,c,


,c
,c,
,c,
c
c
c,




(end)

(end)

'''
outGetWord1 ='''
(start)

abc
.def






abc
abc
abc  .def
abc  .def gh.i
abc  .def gh.i
abc  .def gh.i
.def
.def
.def gh.i
.def gh.i
.def gh.i
gh.i
gh.i
gh.i




(end)

'''
outGetWord2 ='''
(start)

ABC
DEF






ABC
ABC
ABC   DEF
ABC   DEF  GHI
ABC   DEF  GHI
ABC   DEF  GHI
DEF
DEF
DEF  GHI
DEF  GHI
DEF  GHI
GHI
GHI
GHI




(end)

'''
outSetChar ='''
(start)
123abc
123bc
a123c
abc123
abc123
123abc
123abc
123abc
123abc
123abc
123bc
123c
123
123
123
a123bc
a123c
a123
a123
a123
ab123c
ab123
ab123
abc123
abc123
abc123
abc123
(end)

'''
outSetItem1 ='''
(start)
123a,b,c
123,b,c
a,123,c
a,b,c,123
a,b,c,,123
123a,b,c
123a,b,c
123a,b,c
123a,b,c
123,b,c
123,b,c
123,c
123
123
123
a,123,c
a,123,c
a,123
a,123
a,123
a,b,123
a,b,123
a,b,123
a,b,c,123
a,b,c,123
a,b,c,123
a,b,c,,123
(end)

'''
outSetItem2 ='''
(start)
123,,c,
123,,c,
,123,c,
,,c,123
,,c,,123
123,,c,
123,,c,
123,,c,
123,,c,
123,,c,
123,,c,
123,c,
123,
123
123
,123,c,
,123,c,
,123,
,123
,123
,,123,
,,123,
,,123
,,c,123
,,c,123
,,c,123
,,c,,123
(end)

'''
outSetWord1 ='''
(start)
123  abc  .def gh.i   
  123  .def gh.i   
  abc  123 gh.i   
  abc  .def gh.i   123
  abc  .def gh.i   123
123  abc  .def gh.i   
123  abc  .def gh.i   
123  abc  .def gh.i   
123  abc  .def gh.i   
  123  .def gh.i   
  123  .def gh.i   
  123 gh.i   
  123   
  123   
  123   
  abc  123 gh.i   
  abc  123 gh.i   
  abc  123   
  abc  123   
  abc  123   
  abc  .def 123   
  abc  .def 123   
  abc  .def 123   
  abc  .def gh.i   123
  abc  .def gh.i   123
  abc  .def gh.i   123
  abc  .def gh.i   123
(end)

'''
outSetWord2 ='''
(start)
123ABC   DEF  GHI
123   DEF  GHI
ABC   123  GHI
ABC   DEF  GHI123
ABC   DEF  GHI123
123ABC   DEF  GHI
123ABC   DEF  GHI
123ABC   DEF  GHI
123ABC   DEF  GHI
123   DEF  GHI
123   DEF  GHI
123  GHI
123
123
123
ABC   123  GHI
ABC   123  GHI
ABC   123
ABC   123
ABC   123
ABC   DEF  123
ABC   DEF  123
ABC   DEF  123
ABC   DEF  GHI123
ABC   DEF  GHI123
ABC   DEF  GHI123
ABC   DEF  GHI123
(end)

'''


def genRetrieve(template):
    count = 1
    print(f'put "(start)" into line {count} of cd fld 1')
    count += 1
    for sind in indices:
        print(template.replace('%ind', sind).replace('%outln',str( count)))
        count += 1
    print(f'put "(end)" into line {count} of cd fld 1')
    count += 1

def genTestCase(testtemplate, results, testname, inputstring):
    results = results.replace('\r\n', '\n')
    results = results.split('(start)\n')[1].split('\n(end)\n')[0]
    results = results.split('\n')
    assertEq(len(results), len(indices))
    print(f'"test_chunk{testname}", ')
    print ('() => {')
    for i, sind in enumerate(indices):
        if ' to ' in sind:
            first = int(sind.split(' to ')[0])
            last = int(sind.split(' to ')[1])
        else:
            first = int(sind)
            last = 'undefined'
        helpermethod = 'testGetChunk' if testname.startswith('Get') else 'testSetChunk'
        chktype = testname[3:].replace('1', '').replace('2', '') + 's'
        print(f"this.{helpermethod}('{results[i]}', '{inputstring}', RequestedChunkTextType.{chktype}, {first}, {last})")
    print('},')
a= '''
put "" into x
 set char 0 to 0 of x to "123"
 put x into line 1 of cd fld 1
put "" into x
 set char 0 to 2 of x to "123"
 put x into line 2 of cd fld 1
put "" into x
 set char 1 to 1 of x to "123"
 put x into line 3 of cd fld 1
put "" into x
 set char 1 to 3 of x to "123"
 put x into line 4 of cd fld 1
put "" into x
 set item 0 to 0 of x to "123"
 put x into line 5 of cd fld 1
put "" into x
 set item 0 to 2 of x to "123"
 put x into line 6 of cd fld 1
put "" into x
 set item 1 to 1 of x to "123"
 put x into line 7 of cd fld 1
put "" into x
 set item 1 to 3 of x to "123"
 put x into line 8 of cd fld 1
put "" into x
 set word 0 to 0 of x to "123"
 put x into line 9 of cd fld 1
put "" into x
 set word 0 to 2 of x to "123"
 put x into line 10 of cd fld 1
put "" into x
 set word 1 to 1 of x to "123"
 put x into line 11 of cd fld 1
put "" into x
 set word 1 to 3 of x to "123"
 put x into line 12 of cd fld 1
put item 1 to 2 of ",,cd," into line 13 of cd fld 1
put item 1 to 3 of ",,cd," into line 14 of cd fld 1
put item 1 to 4 of ",,cd," into line 15 of cd fld 1
put "(start)" into line 1 of cd fld 1
put "abc" into x 
put "123" into char 5 to 7 of x 
put x into line 2 of cd fld 1
put "(end)" into line 3 of cd fld 1
put "(start)" into line 1 of cd fld 1
put "a,b,c" into x 
put "123" into item 5 to 7 of x 
put x into line 2 of cd fld 1
put "(end)" into line 3 of cd fld 1
put "(start)" into line 1 of cd fld 1
put ",,c," into x 
put "123" into item 5 to 7 of x 
put x into line 2 of cd fld 1
put "(end)" into line 3 of cd fld 1
put "(start)" into line 1 of cd fld 1
put "  abc  .def gh.i   " into x 
put "123" into item 5 to 7 of x 
put x into line 2 of cd fld 1
put "(end)" into line 3 of cd fld 1
put "(start)" into line 1 of cd fld 1
put "ABC   DEF  GHI" into x 
put "123" into item 5 to 7 of x 
put x into line 2 of cd fld 1
put "(end)" into line 3 of cd fld 1

'''

if __name__=='__main__':
    #~ genRetrieve(templateGetChar )
    #~ genRetrieve(templateGetItem1 )
    #~ genRetrieve(templateGetItem2 )
    #~ genRetrieve(templateGetWord1 )
    #~ genRetrieve(templateGetWord2 )
    genRetrieve(templateSetChar )
    genRetrieve(templateSetItem1 )
    genRetrieve(templateSetItem2 )
    genRetrieve(templateSetWord1 )
    genRetrieve(templateSetWord2 )

    #~ genTestCase(genTestGetChar , outGetChar, "GetChar", 'abc')
    #~ genTestCase(genTestGetItem1 , outGetItem1, "GetItem1", 'a,b,c')
    #~ genTestCase(genTestGetItem2 , outGetItem2, "GetItem2", ",,c,")
    #~ genTestCase(genTestGetWord1 , outGetWord1, "GetWord1", "  abc  .def gh.i   ")
    #~ genTestCase(genTestGetWord2 , outGetWord2, "GetWord2", "ABC   DEF  GHI")
    #~ genTestCase(genTestSetChar , outSetChar, "SetChar", 'abc')
    #~ genTestCase(genTestSetItem1 , outSetItem1, "SetItem1", 'a,b,c')
    #~ genTestCase(genTestSetItem2 , outSetItem2, "SetItem2", ",,c,")
    #~ genTestCase(genTestSetWord1 , outSetWord1, "SetWord1", "  abc  .def gh.i   ")
    #~ genTestCase(genTestSetWord2 , outSetWord2, "SetWord2", "ABC   DEF  GHI")
