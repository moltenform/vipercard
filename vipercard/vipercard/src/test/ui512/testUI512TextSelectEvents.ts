
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ElementObserverNoOp } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { SelAndEntryImpl } from '../../ui512/textedit/ui512TextModifyClasses.js';
/* auto */ import { SelAndEntry } from '../../ui512/textedit/ui512TextModify.js';

export class TestUI512TextSelectEvents extends UI512TestBase {
    constructor() {
        super();
    }

    tests = [
        'testchangeSelSelectAll',
        () => {
            /* no current selection */
            this.testChangeSel('^abc#', '^#abc', SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel('^abc#', 'a^#bc', SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel('^abc#', 'abc^#', SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel('^a#', 'a^#', SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel('^\n#', '\n^#', SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel('^\n#', '^#\n', SelAndEntryImpl.changeSelSelectAll);
            /* with current selection */
            this.testChangeSel('^abc#', '^abc#', SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel('^abc#', '#abc^', SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel('^abc#', 'a^b#c', SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel('^ab\nc#', 'a^#b\nc', SelAndEntryImpl.changeSelSelectAll);
        },
        'testchangeSelGoDocHomeEnd',
        () => {
            /* go to start, no extend */
            this.testChangeSel('^#abc', '^#abc', SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a^#bc', SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a^b#c', SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a#b^c', SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel('^#abc', 'abc^#', SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            /* go to start, extend */
            this.testChangeSel('^#abc', '^#abc', SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel('^a#bc', 'a^#bc', SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel('^ab#c', 'a^b#c', SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel('^a#bc', 'a#b^c', SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel('^abc#', 'abc^#', SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            /* go to end, no extend */
            this.testChangeSel('abc#^', '^#abc', SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a^#bc', SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a^b#c', SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a#b^c', SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel('abc#^', 'abc^#', SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            /* go to end, extend */
            this.testChangeSel('#abc^', '^#abc', SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel('a#bc^', 'a^#bc', SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel('ab#c^', 'a^b#c', SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel('a#bc^', 'a#b^c', SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel('abc#^', 'abc^#', SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
        },
        'testchangeSelLeftRight',
        () => {
            /* move left, no extend */
            this.testChangeSel('^#abcd', '^#abcd', SelAndEntryImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel('^#abcd', 'a^#bcd', SelAndEntryImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel('a^#bcd', 'ab^#cd', SelAndEntryImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel('ab^#cd', 'abc^#d', SelAndEntryImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel('abc^#d', 'abcd^#', SelAndEntryImpl.changeSelLeftRight, true, false, false);
            /* move left, extend */
            this.testChangeSel('^#abcd', '^#abcd', SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('^a#bcd', 'a^#bcd', SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('a^b#cd', 'ab^#cd', SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('ab^c#d', 'abc^#d', SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('abc^d#', 'abcd^#', SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('^abc#d', '^abc#d', SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('^abc#d', 'a^bc#d', SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('#ab^cd', '#abc^d', SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('a#b^cd', 'a#bc^d', SelAndEntryImpl.changeSelLeftRight, true, true, false);
            /* move right, no extend */
            this.testChangeSel('a^#bcd', '^#abcd', SelAndEntryImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel('ab^#cd', 'a^#bcd', SelAndEntryImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel('abc^#d', 'ab^#cd', SelAndEntryImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel('abcd^#', 'abc^#d', SelAndEntryImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel('abcd^#', 'abcd^#', SelAndEntryImpl.changeSelLeftRight, false, false, false);
            /* move right, extend */
            this.testChangeSel('#a^bcd', '^#abcd', SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('a#b^cd', 'a^#bcd', SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('ab#c^d', 'ab^#cd', SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('abc#d^', 'abc^#d', SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('abcd#^', 'abcd^#', SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('a^bc#d', '^abc#d', SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('ab^c#d', 'a^bc#d', SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('#abcd^', '#abc^d', SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('a#bcd^', 'a#bc^d', SelAndEntryImpl.changeSelLeftRight, false, true, false);
        },
        'testchangeSelGoLineHomeEnd',
        () => {
            /* middle line, go to start, no extend */
            this.testChangeSel('qr|^#abc|st', 'qr|^#abc|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|^#abc|st', 'qr|a^#bc|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|^#abc|st', 'qr|a^b#c|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|^#abc|st', 'qr|a#b^c|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|^#abc|st', 'qr|abc^#|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            /* middle line, go to start, extend */
            this.testChangeSel('qr|^#abc|st', 'qr|^#abc|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|^a#bc|st', 'qr|a^#bc|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|^ab#c|st', 'qr|a^b#c|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|^a#bc|st', 'qr|a#b^c|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|^abc#|st', 'qr|abc^#|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            /* middle line, go to end, no extend */
            this.testChangeSel('qr|abc#^|st', 'qr|^#abc|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('qr|abc#^|st', 'qr|a^#bc|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('qr|abc#^|st', 'qr|a^b#c|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('qr|abc#^|st', 'qr|a#b^c|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('qr|abc#^|st', 'qr|abc^#|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            /* middle line, go to end, extend */
            this.testChangeSel('qr|#abc^|st', 'qr|^#abc|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|a#bc^|st', 'qr|a^#bc|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|ab#c^|st', 'qr|a^b#c|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|a#bc^|st', 'qr|a#b^c|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|abc#^|st', 'qr|abc^#|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            /* one line, go to start, no extend */
            this.testChangeSel('^#abc', '^#abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a^#bc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a^b#c', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a#b^c', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#abc', 'abc^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            /* one line, go to start, extend */
            this.testChangeSel('^#abc', '^#abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^a#bc', 'a^#bc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^ab#c', 'a^b#c', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^a#bc', 'a#b^c', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^abc#', 'abc^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            /* one line, go to end, no extend */
            this.testChangeSel('abc#^', '^#abc', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a^#bc', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a^b#c', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a#b^c', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('abc#^', 'abc^#', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            /* one line, go to end, extend */
            this.testChangeSel('#abc^', '^#abc', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('a#bc^', 'a^#bc', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('ab#c^', 'a^b#c', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('a#bc^', 'a#b^c', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('abc#^', 'abc^#', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            /* empty line in middle */
            this.testChangeSel('qr|#^|st', 'qr|^#|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|#^|st', 'qr|^#|st', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|#^|st', 'qr|^#|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|#^|st', 'qr|^#|st', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            /* empty line at end */
            this.testChangeSel('qr|#^', 'qr|^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|#^', 'qr|^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|#^', 'qr|^#', SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|#^', 'qr|^#', SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            /* go to whitespace start, no extend */
            this.testChangeSel('   ^#abc', '   abc^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('   ^#abc   def', '   abc   def^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('\t^#abc\tdef', '\tabc\tdef^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel(
                '\t\t\t^#abc\t\t\tdef',
                '\t\t\tabc\t\t\tdef^#',
                SelAndEntryImpl.changeSelGoLineHomeEnd,
                true,
                false
            );
            this.testChangeSel('   ^#abc', '   ab^#c', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('   ^#abc', '   a^#bc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   abc', '   ^#abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   abc', '  ^# abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   abc', ' ^#  abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   abc', '^#   abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   ', '   ^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   ', '  ^# ', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^# ', ' ^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#\t\t\t', '\t\t\t^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#\t', '\t^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            /* go to whitespace start, extend */
            this.testChangeSel('   ^abc#', '   abc^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('   ^abc   def#', '   abc   def^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('\t^abc\tdef#', '\tabc\tdef^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel(
                '\t\t\t^abc\t\t\tdef#',
                '\t\t\tabc\t\t\tdef^#',
                SelAndEntryImpl.changeSelGoLineHomeEnd,
                true,
                true
            );
            this.testChangeSel('   ^ab#c', '   ab^#c', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('   ^a#bc', '   a^#bc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^   #abc', '   ^#abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^  # abc', '  ^# abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^ #  abc', ' ^#  abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^#   abc', '^#   abc', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^   #', '   ^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^  # ', '  ^# ', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^ #', ' ^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^\t\t\t#', '\t\t\t^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^\t#', '\t^#', SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
        },
        'testchangeSelLeftRightUntilWord',
        () => {
            /* move left by words */
            this.testChangeSel('#^abcd', '^#abcd', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd', 'ab^#cd', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd', 'abcd^#', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd ', 'abcd ^#', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd  ', 'abcd  ^#', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd\t', 'abcd\t^#', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abcd ^#d', 'abcd d^#', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abcd ^#de', 'abcd de^#', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abcd ^#\n', 'abcd \n^#', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abcd \n^#d', 'abcd \nd^#', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abc ^#123 abc', 'abc 123^# abc', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('^#abc 123 abc', 'abc^# 123 abc', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abc.123.^#abc', 'abc.123.abc^#', SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abc.123^#.abc', 'abc.123.^#abc', SelAndEntryImpl.changeSelLeftRight, true, false, true);

            /* move right by words */
            this.testChangeSel('abcd^#', '^#abcd', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd^#', 'ab^#cd', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd^#', 'abcd^#', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd #^', 'abcd ^#', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel(' #^abcd', '^# abcd', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd  #^', '^#abcd  ', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd\t#^', '^#abcd\t', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd ^#d', '^#abcd d', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd ^#de', '^#abcd de', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd ^#\n', '^#abcd \n', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd ^#\nd', '^#abcd \nd', SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel(
                'abc 123 ^#abc',
                'abc ^#123 abc',
                SelAndEntryImpl.changeSelLeftRight,
                false,
                false,
                true
            );
            this.testChangeSel(
                'abc 123 abc^#',
                'abc 123 ^#abc',
                SelAndEntryImpl.changeSelLeftRight,
                false,
                false,
                true
            );
            this.testChangeSel(
                'abc^#.123.abc',
                '^#abc.123.abc',
                SelAndEntryImpl.changeSelLeftRight,
                false,
                false,
                true
            );
            this.testChangeSel(
                'abc.^#123.abc',
                'abc^#.123.abc',
                SelAndEntryImpl.changeSelLeftRight,
                false,
                false,
                true
            );
        },
        'testchangeSelCurrentWord',
        () => {
            this.testChangeSel('^#', '^#', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('^a#', '^#a', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('^abc#', '^#abc', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel(' ^abc#', ' ^#abc', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('^abc# ', '^#abc ', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('test1 test2^ #test3', 'test1 test2^# test3', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('test1 ^test2# test3', 'test1 test^#2 test3', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('test1 ^test2# test3', 'test1 tes^#t2 test3', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('test1 ^test2# test3', 'test1 te^#st2 test3', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('test1 ^test2# test3', 'test1 ^#test2 test3', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('test1^ #test2 test3', 'test1^# test2 test3', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('.^a#.', '.^#a.', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('.a^.#', '.a^#.', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('.^abc#.', '.ab^#c.', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('1 ^a# 2', '1 ^#a 2', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('1 ^abc# 2', '1 ab^#c 2', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('1 abc ^2#', '1 abc ^#2', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('1 abc^ #2', '1 abc^# 2', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('1 abc^  #2', '1 abc^#  2', SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel('1 abc^  #2', '1 abc ^# 2', SelAndEntryImpl.changeSelCurrentWord);
        },
        'test_selectLineInField,selectByLinesWhichLine',
        () => {
            /* empty field */
            let el = new UI512ElTextField('test', new ElementObserverNoOp());
            let gel = new UI512ElTextFieldAsGeneric(el);
            el.setftxt(FormattedText.newFromUnformatted(''));
            SelAndEntry.selectLineInField(gel, 0);
            assertEq(0, el.getN('selcaret'), '');
            assertEq(0, el.getN('selend'), '');
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 2);
            assertEq(0, el.getN('selcaret'), '');
            assertEq(0, el.getN('selend'), '');
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), '');

            /* field with no empty lines */
            el.setftxt(FormattedText.newFromUnformatted('abc\ndef\nghi'));
            SelAndEntry.selectLineInField(gel, 0);
            assertEq(0, el.getN('selcaret'), '');
            assertEq(4, el.getN('selend'), '');
            assertEq(0, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 1);
            assertEq(4, el.getN('selcaret'), '');
            assertEq(8, el.getN('selend'), '');
            assertEq(1, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 2);
            assertEq(8, el.getN('selcaret'), '');
            assertEq(11, el.getN('selend'), '');
            assertEq(2, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 3);
            assertEq(11, el.getN('selcaret'), '');
            assertEq(11, el.getN('selend'), '');
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 4);
            assertEq(11, el.getN('selcaret'), '');
            assertEq(11, el.getN('selend'), '');
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), '');

            /* field with some empty lines */
            el.setftxt(FormattedText.newFromUnformatted('\nabc\n\ndef\n'));
            SelAndEntry.selectLineInField(gel, 0);
            assertEq(0, el.getN('selcaret'), '');
            assertEq(1, el.getN('selend'), '');
            assertEq(0, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 1);
            assertEq(1, el.getN('selcaret'), '');
            assertEq(5, el.getN('selend'), '');
            assertEq(1, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 2);
            assertEq(5, el.getN('selcaret'), '');
            assertEq(6, el.getN('selend'), '');
            assertEq(2, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 3);
            assertEq(6, el.getN('selcaret'), '');
            assertEq(10, el.getN('selend'), '');
            assertEq(3, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 4);
            assertEq(10, el.getN('selcaret'), '');
            assertEq(10, el.getN('selend'), '');
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), '');
            SelAndEntry.selectLineInField(gel, 5);
            assertEq(10, el.getN('selcaret'), '');
            assertEq(10, el.getN('selend'), '');
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), '');
        }
    ];

    /* ^ is caret, # is end, | is newline */
    testChangeSel(expected: string, input: string, fn: Function, ...moreargs: any[]) {
        expected = expected.replace(/\|/g, '\n');
        input = input.replace(/\|/g, '\n');
        let [t, selcaret, selend] = this.fromPlainText(input);
        let args = [t, selcaret, selend, ...moreargs];
        let [gotSelCaret, gotSelEnd] = fn.apply(null, args);
        let [expectedTxt, expectedCaret, expectedEnd] = this.fromPlainText(expected);
        assertEq(expectedTxt.toSerialized(), t.toSerialized(), '1s|');
        assertEq(expectedCaret, gotSelCaret, '1r|incorrect caret position');
        assertEq(expectedEnd, gotSelEnd, '1q|incorrect select-end position');
    }

    testChangeText(expected: string, input: string, fn: Function, ...moreargs: any[]) {
        expected = expected.replace(/\|/g, '\n');
        input = input.replace(/\|/g, '\n');
        let [t, selcaret, selend] = this.fromPlainText(input);
        let args = [t, selcaret, selend, ...moreargs];
        let [gotTxt, gotSelCaret, gotSelEnd] = fn.apply(null, args);
        let [expectedTxt, expectedCaret, expectedEnd] = this.fromPlainText(expected);
        assertEq(expectedTxt.toSerialized(), gotTxt.toSerialized(), '1p|');
        assertEq(expectedCaret, gotSelCaret, '1o|');
        assertEq(expectedEnd, gotSelEnd, '1n|');
    }

    protected fromPlainText(s: string): [FormattedText, number, number] {
        /* step 1) get a string without the font changes */
        let tToGetUnformatted = FormattedText.newFromSerialized(s);
        let sUnformatted = tToGetUnformatted.toUnformatted();
        assertTrue(
            scontains(sUnformatted, '^') && scontains(sUnformatted, '#'),
            `1m|string "${sUnformatted}" needs ^ and #`
        );

        /* step 2) get caret positions */
        let selcaret;
        let selend;
        if (sUnformatted.indexOf('^') < sUnformatted.indexOf('#')) {
            selcaret = sUnformatted.indexOf('^');
            sUnformatted = sUnformatted.replace(/\^/g, '');
            selend = sUnformatted.indexOf('#');
            sUnformatted = sUnformatted.replace(/#/g, '');
        } else {
            selend = sUnformatted.indexOf('#');
            sUnformatted = sUnformatted.replace(/#/g, '');
            selcaret = sUnformatted.indexOf('^');
            sUnformatted = sUnformatted.replace(/\^/g, '');
        }

        /* step 3) create formatted text */
        let t = FormattedText.newFromSerialized(s.replace(/#/g, '').replace(/\^/g, ''));
        return [t, selcaret, selend];
    }
}
