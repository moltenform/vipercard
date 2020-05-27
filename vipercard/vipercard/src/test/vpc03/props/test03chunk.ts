
/* auto */ import { ScriptTestBatch } from './../../vpc/vpcTestScriptRunBase';
/* auto */ import { assertTrue } from './../../../ui512/utils/util512Assert';
/* auto */ import { Util512, longstr } from './../../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../../testUtils/testUtils';
/* auto */ import { h3 } from './../test03lexer';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */



let t = new SimpleUtil512TestCollection('testCollection03propsChunk');
export let testCollection03propsChunk = t;

t.atest('--init--testCollection03propsChunk', async () => {
    assertTrue(h3, longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`))
});
t.test('03chunkTestReadStyle', () => {
    let b = new ScriptTestBatch();
    b.t(`go to card id ${h3.ids.cdBC}\\1`, '1')
    setupManyFonts(b)
    b.t(`the textstyle of cd fld 1`, 'bold')
    b.t(`put "" into cd fld 1\\1`, '1')
    b.batchEvaluate(h3);
});

function setupManyFonts(b:ScriptTestBatch) {
    b.t(`put "abc" into cd fld 1\\1`, '1')
    b.t(`set the textsize of cd fld 1 to 14\\the textsize of cd fld 1`, '14')
    b.t(`set the textfont of cd fld 1 to "courier"\\the textfont of cd fld 1`, 'courier')
    b.t(`set the textstyle of cd fld 1 to "bold"\\the textstyle of cd fld 1`, 'bold')
    assertTrue(sizes.length === styles.length, '')
    assertTrue(sizes.length === fonts.length, '')
    let a = 'a'.charCodeAt(0)
    let s = Util512.range(a, a+(3+3*sizes.length)).map(n=>String.fromCharCode(a)).join('')
    b.t(`put "${s}" into cd fld 1\\1`, '1')
    for (let i=0; i<sizes.length; i++) {
        b.t(`set the textsize of char ${1+3*i} to ${1+3*i+3} of cd fld 1 to ${sizes[i]}\\the textsize of char ${1+3*i} to ${1+3*i+3} of cd fld 1`, `${sizes[i]}`)
        b.t(`set the textfont of char ${2+3*i} to ${2+3*i+3} of cd fld 1 to "${fonts[i]}"\\the textfont of char ${2+3*i} to ${2+3*i+3} of cd fld 1`, `${fonts[i]}`)
        b.t(`set the textstyle of char ${3+3*i} to ${3+3*i+3} of cd fld 1 to "${styles[i]}"\\the textstyle of char ${3+3*i} to ${3+3*i+3} of cd fld 1`, `${styles[i]}`)
    }
    return s
}

const sizes = [9,10,12,14,18,24,9,10,12,14,18,24,9,10,12]
const styles=['plain', 'bold', 'italic', 'underline', 'outline', 'grayed', 
    'bold,italic','bold,italic,underline','bold,italic,underline,outline','bold,italic,underline,outline,grayed',
    'italic,outline','italic,underline,outline','italic,underline,outline,grayed',
    'bold,grayed','outline,grayed',
]
const fonts = ['chicago', 'courier', 'geneva', 'new york', 'times', 'helvetica', 'monaco', 'symbol', 'chicago', 'courier', 'geneva', 'new york', 'times', 'helvetica', 'monaco']
