
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ElementObserverNoOp } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { TextSelModifyImpl } from '../../ui512/textedit/ui512TextSelModifyImpl.js';
/* auto */ import { TextSelModify } from '../../ui512/textedit/ui512TextSelModify.js';

export class TestUI512TextSelectEvents extends UI512TestBase {
    constructor() {
        super();
    }

    tests = [
        'testchangeSelSelectAll',
        () => {
            /* no current selection */
            this.testChangeSel('^abc#', '^#abc', TextSelModifyImpl.changeSelSelectAll);
            this.testChangeSel('^abc#', 'a^#bc', TextSelModifyImpl.changeSelSelectAll);
            this.testChangeSel('^abc#', 'abc^#', TextSelModifyImpl.changeSelSelectAll);
            this.testChangeSel('^a#', 'a^#', TextSelModifyImpl.changeSelSelectAll);
            this.testChangeSel('^\n#', '\n^#', TextSelModifyImpl.changeSelSelectAll);
            this.testChangeSel('^\n#', '^#\n', TextSelModifyImpl.changeSelSelectAll);
            /* with current selection */
            this.testChangeSel('^abc#', '^abc#', TextSelModifyImpl.changeSelSelectAll);
            this.testChangeSel('^abc#', '#abc^', TextSelModifyImpl.changeSelSelectAll);
            this.testChangeSel('^abc#', 'a^b#c', TextSelModifyImpl.changeSelSelectAll);
            this.testChangeSel('^ab\nc#', 'a^#b\nc', TextSelModifyImpl.changeSelSelectAll);
        },
        'testchangeSelGoDocHomeEnd',
        () => {
            /* go to start, no extend */
            this.testChangeSel('^#abc', '^#abc', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a^#bc', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a^b#c', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a#b^c', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel('^#abc', 'abc^#', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);
            /* go to start, extend */
            this.testChangeSel('^#abc', '^#abc', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel('^a#bc', 'a^#bc', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel('^ab#c', 'a^b#c', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel('^a#bc', 'a#b^c', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel('^abc#', 'abc^#', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);
            /* go to end, no extend */
            this.testChangeSel('abc#^', '^#abc', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a^#bc', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a^b#c', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a#b^c', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel('abc#^', 'abc^#', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);
            /* go to end, extend */
            this.testChangeSel('#abc^', '^#abc', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel('a#bc^', 'a^#bc', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel('ab#c^', 'a^b#c', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel('a#bc^', 'a#b^c', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel('abc#^', 'abc^#', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
        },
        'testchangeSelLeftRight',
        () => {
            /* move left, no extend */
            this.testChangeSel('^#abcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel('^#abcd', 'a^#bcd', TextSelModifyImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel('a^#bcd', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel('ab^#cd', 'abc^#d', TextSelModifyImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel('abc^#d', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, true, false, false);
            /* move left, extend */
            this.testChangeSel('^#abcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('^a#bcd', 'a^#bcd', TextSelModifyImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('a^b#cd', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('ab^c#d', 'abc^#d', TextSelModifyImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('abc^d#', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('^abc#d', '^abc#d', TextSelModifyImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('^abc#d', 'a^bc#d', TextSelModifyImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('#ab^cd', '#abc^d', TextSelModifyImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel('a#b^cd', 'a#bc^d', TextSelModifyImpl.changeSelLeftRight, true, true, false);
            /* move right, no extend */
            this.testChangeSel('a^#bcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel('ab^#cd', 'a^#bcd', TextSelModifyImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel('abc^#d', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel('abcd^#', 'abc^#d', TextSelModifyImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel('abcd^#', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, false, false, false);
            /* move right, extend */
            this.testChangeSel('#a^bcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('a#b^cd', 'a^#bcd', TextSelModifyImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('ab#c^d', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('abc#d^', 'abc^#d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('abcd#^', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('a^bc#d', '^abc#d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('ab^c#d', 'a^bc#d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('#abcd^', '#abc^d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel('a#bcd^', 'a#bc^d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
        },
        'testchangeSelGoLineHomeEnd',
        () => {
            /* middle line, go to start, no extend */
            this.testChangeSel('qr|^#abc|st', 'qr|^#abc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|^#abc|st', 'qr|a^#bc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|^#abc|st', 'qr|a^b#c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|^#abc|st', 'qr|a#b^c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|^#abc|st', 'qr|abc^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            /* middle line, go to start, extend */
            this.testChangeSel('qr|^#abc|st', 'qr|^#abc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|^a#bc|st', 'qr|a^#bc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|^ab#c|st', 'qr|a^b#c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|^a#bc|st', 'qr|a#b^c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|^abc#|st', 'qr|abc^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            /* middle line, go to end, no extend */
            this.testChangeSel('qr|abc#^|st', 'qr|^#abc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('qr|abc#^|st', 'qr|a^#bc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('qr|abc#^|st', 'qr|a^b#c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('qr|abc#^|st', 'qr|a#b^c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('qr|abc#^|st', 'qr|abc^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            /* middle line, go to end, extend */
            this.testChangeSel('qr|#abc^|st', 'qr|^#abc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|a#bc^|st', 'qr|a^#bc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|ab#c^|st', 'qr|a^b#c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|a#bc^|st', 'qr|a#b^c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|abc#^|st', 'qr|abc^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            /* one line, go to start, no extend */
            this.testChangeSel('^#abc', '^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a^b#c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#abc', 'a#b^c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#abc', 'abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            /* one line, go to start, extend */
            this.testChangeSel('^#abc', '^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^a#bc', 'a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^ab#c', 'a^b#c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^a#bc', 'a#b^c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^abc#', 'abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            /* one line, go to end, no extend */
            this.testChangeSel('abc#^', '^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a^b#c', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('abc#^', 'a#b^c', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel('abc#^', 'abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            /* one line, go to end, extend */
            this.testChangeSel('#abc^', '^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('a#bc^', 'a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('ab#c^', 'a^b#c', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('a#bc^', 'a#b^c', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('abc#^', 'abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            /* empty line in middle */
            this.testChangeSel('qr|#^|st', 'qr|^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|#^|st', 'qr|^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|#^|st', 'qr|^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|#^|st', 'qr|^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            /* empty line at end */
            this.testChangeSel('qr|#^', 'qr|^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('qr|#^', 'qr|^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('qr|#^', 'qr|^#', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel('qr|#^', 'qr|^#', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
            /* go to whitespace start, no extend */
            this.testChangeSel('   ^#abc', '   abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('   ^#abc   def', '   abc   def^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('\t^#abc\tdef', '\tabc\tdef^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel(
                '\t\t\t^#abc\t\t\tdef',
                '\t\t\tabc\t\t\tdef^#',
                TextSelModifyImpl.changeSelGoLineHomeEnd,
                true,
                false
            );
            this.testChangeSel('   ^#abc', '   ab^#c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('   ^#abc', '   a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   abc', '   ^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   abc', '  ^# abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   abc', ' ^#  abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   abc', '^#   abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   ', '   ^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#   ', '  ^# ', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^# ', ' ^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#\t\t\t', '\t\t\t^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel('^#\t', '\t^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
            /* go to whitespace start, extend */
            this.testChangeSel('   ^abc#', '   abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('   ^abc   def#', '   abc   def^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('\t^abc\tdef#', '\tabc\tdef^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel(
                '\t\t\t^abc\t\t\tdef#',
                '\t\t\tabc\t\t\tdef^#',
                TextSelModifyImpl.changeSelGoLineHomeEnd,
                true,
                true
            );
            this.testChangeSel('   ^ab#c', '   ab^#c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('   ^a#bc', '   a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^   #abc', '   ^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^  # abc', '  ^# abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^ #  abc', ' ^#  abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^#   abc', '^#   abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^   #', '   ^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^  # ', '  ^# ', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^ #', ' ^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^\t\t\t#', '\t\t\t^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel('^\t#', '\t^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        },
        'testchangeSelLeftRightUntilWord',
        () => {
            /* move left by words */
            this.testChangeSel('#^abcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd ', 'abcd ^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd  ', 'abcd  ^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('#^abcd\t', 'abcd\t^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abcd ^#d', 'abcd d^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abcd ^#de', 'abcd de^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abcd ^#\n', 'abcd \n^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abcd \n^#d', 'abcd \nd^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abc ^#123 abc', 'abc 123^# abc', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('^#abc 123 abc', 'abc^# 123 abc', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abc.123.^#abc', 'abc.123.abc^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel('abc.123^#.abc', 'abc.123.^#abc', TextSelModifyImpl.changeSelLeftRight, true, false, true);

            /* move right by words */
            this.testChangeSel('abcd^#', '^#abcd', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd^#', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd^#', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd #^', 'abcd ^#', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel(' #^abcd', '^# abcd', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd  #^', '^#abcd  ', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd\t#^', '^#abcd\t', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd ^#d', '^#abcd d', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd ^#de', '^#abcd de', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd ^#\n', '^#abcd \n', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel('abcd ^#\nd', '^#abcd \nd', TextSelModifyImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel(
                'abc 123 ^#abc',
                'abc ^#123 abc',
                TextSelModifyImpl.changeSelLeftRight,
                false,
                false,
                true
            );
            this.testChangeSel(
                'abc 123 abc^#',
                'abc 123 ^#abc',
                TextSelModifyImpl.changeSelLeftRight,
                false,
                false,
                true
            );
            this.testChangeSel(
                'abc^#.123.abc',
                '^#abc.123.abc',
                TextSelModifyImpl.changeSelLeftRight,
                false,
                false,
                true
            );
            this.testChangeSel(
                'abc.^#123.abc',
                'abc^#.123.abc',
                TextSelModifyImpl.changeSelLeftRight,
                false,
                false,
                true
            );
        },
        'testchangeSelCurrentWord',
        () => {
            this.testChangeSel('^#', '^#', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('^a#', '^#a', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('^abc#', '^#abc', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel(' ^abc#', ' ^#abc', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('^abc# ', '^#abc ', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('test1 test2^ #test3', 'test1 test2^# test3', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('test1 ^test2# test3', 'test1 test^#2 test3', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('test1 ^test2# test3', 'test1 tes^#t2 test3', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('test1 ^test2# test3', 'test1 te^#st2 test3', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('test1 ^test2# test3', 'test1 ^#test2 test3', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('test1^ #test2 test3', 'test1^# test2 test3', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('.^a#.', '.^#a.', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('.a^.#', '.a^#.', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('.^abc#.', '.ab^#c.', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('1 ^a# 2', '1 ^#a 2', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('1 ^abc# 2', '1 ab^#c 2', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('1 abc ^2#', '1 abc ^#2', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('1 abc^ #2', '1 abc^# 2', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('1 abc^  #2', '1 abc^#  2', TextSelModifyImpl.changeSelCurrentWord);
            this.testChangeSel('1 abc^  #2', '1 abc ^# 2', TextSelModifyImpl.changeSelCurrentWord);
        },
        'test_selectLineInField,selectByLinesWhichLine',
        () => {
            /* empty field */
            let el = new UI512ElTextField('test', new ElementObserverNoOp());
            let gel = new UI512ElTextFieldAsGeneric(el);
            el.setftxt(FormattedText.newFromUnformatted(''));
            TextSelModify.selectLineInField(gel, 0);
            assertEq(0, el.getN('selcaret'), '');
            assertEq(0, el.getN('selend'), '');
            assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 2);
            assertEq(0, el.getN('selcaret'), '');
            assertEq(0, el.getN('selend'), '');
            assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), '');

            /* field with no empty lines */
            el.setftxt(FormattedText.newFromUnformatted('abc\ndef\nghi'));
            TextSelModify.selectLineInField(gel, 0);
            assertEq(0, el.getN('selcaret'), '');
            assertEq(4, el.getN('selend'), '');
            assertEq(0, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 1);
            assertEq(4, el.getN('selcaret'), '');
            assertEq(8, el.getN('selend'), '');
            assertEq(1, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 2);
            assertEq(8, el.getN('selcaret'), '');
            assertEq(11, el.getN('selend'), '');
            assertEq(2, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 3);
            assertEq(11, el.getN('selcaret'), '');
            assertEq(11, el.getN('selend'), '');
            assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 4);
            assertEq(11, el.getN('selcaret'), '');
            assertEq(11, el.getN('selend'), '');
            assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), '');

            /* field with some empty lines */
            el.setftxt(FormattedText.newFromUnformatted('\nabc\n\ndef\n'));
            TextSelModify.selectLineInField(gel, 0);
            assertEq(0, el.getN('selcaret'), '');
            assertEq(1, el.getN('selend'), '');
            assertEq(0, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 1);
            assertEq(1, el.getN('selcaret'), '');
            assertEq(5, el.getN('selend'), '');
            assertEq(1, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 2);
            assertEq(5, el.getN('selcaret'), '');
            assertEq(6, el.getN('selend'), '');
            assertEq(2, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 3);
            assertEq(6, el.getN('selcaret'), '');
            assertEq(10, el.getN('selend'), '');
            assertEq(3, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 4);
            assertEq(10, el.getN('selcaret'), '');
            assertEq(10, el.getN('selend'), '');
            assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), '');
            TextSelModify.selectLineInField(gel, 5);
            assertEq(10, el.getN('selcaret'), '');
            assertEq(10, el.getN('selend'), '');
            assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), '');
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
