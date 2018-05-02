
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ElementObserverNoOp } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { TextSelModifyImpl } from '../../ui512/textedit/ui512TextSelModifyImpl.js';
/* auto */ import { TextSelModify } from '../../ui512/textedit/ui512TextSelModify.js';

/**
 * tests on TextSelModifyImpl
 *
 * To make the tests easier to read, we use the symbol
 * ^ to mean the selcaret (start of selection)
 * # to mean the selend (end of selection)
 * and
 * | to mean a newline character
 *
 *
 * For example, to say that the second word should be selected, we can write
 * "abc ^def# ghi"
 */
let mTests: (string | Function)[] = [
    'testChangeSelSelectAll',
    () => {
        /* no current selection */
        testChangeSel('^abc#', '^#abc', TextSelModifyImpl.changeSelSelectAll);
        testChangeSel('^abc#', 'a^#bc', TextSelModifyImpl.changeSelSelectAll);
        testChangeSel('^abc#', 'abc^#', TextSelModifyImpl.changeSelSelectAll);
        testChangeSel('^a#', 'a^#', TextSelModifyImpl.changeSelSelectAll);
        testChangeSel('^\n#', '\n^#', TextSelModifyImpl.changeSelSelectAll);
        testChangeSel('^\n#', '^#\n', TextSelModifyImpl.changeSelSelectAll);

        /* with current selection */
        testChangeSel('^abc#', '^abc#', TextSelModifyImpl.changeSelSelectAll);
        testChangeSel('^abc#', '#abc^', TextSelModifyImpl.changeSelSelectAll);
        testChangeSel('^abc#', 'a^b#c', TextSelModifyImpl.changeSelSelectAll);
        testChangeSel('^ab\nc#', 'a^#b\nc', TextSelModifyImpl.changeSelSelectAll);
    },
    'testChangeSelGoDocHomeEnd',
    () => {
        /* go to start, no extend */
        testChangeSel('^#abc', '^#abc', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);
        testChangeSel('^#abc', 'a^#bc', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);
        testChangeSel('^#abc', 'a^b#c', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);
        testChangeSel('^#abc', 'a#b^c', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);
        testChangeSel('^#abc', 'abc^#', TextSelModifyImpl.changeSelGoDocHomeEnd, true, false);

        /* go to start, extend */
        testChangeSel('^#abc', '^#abc', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);
        testChangeSel('^a#bc', 'a^#bc', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);
        testChangeSel('^ab#c', 'a^b#c', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);
        testChangeSel('^a#bc', 'a#b^c', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);
        testChangeSel('^abc#', 'abc^#', TextSelModifyImpl.changeSelGoDocHomeEnd, true, true);

        /* go to end, no extend */
        testChangeSel('abc#^', '^#abc', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);
        testChangeSel('abc#^', 'a^#bc', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);
        testChangeSel('abc#^', 'a^b#c', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);
        testChangeSel('abc#^', 'a#b^c', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);
        testChangeSel('abc#^', 'abc^#', TextSelModifyImpl.changeSelGoDocHomeEnd, false, false);

        /* go to end, extend */
        testChangeSel('#abc^', '^#abc', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
        testChangeSel('a#bc^', 'a^#bc', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
        testChangeSel('ab#c^', 'a^b#c', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
        testChangeSel('a#bc^', 'a#b^c', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
        testChangeSel('abc#^', 'abc^#', TextSelModifyImpl.changeSelGoDocHomeEnd, false, true);
    },
    'testChangeSelLeftRight',
    () => {
        /* move left, no extend */
        testChangeSel('^#abcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, true, false, false);
        testChangeSel('^#abcd', 'a^#bcd', TextSelModifyImpl.changeSelLeftRight, true, false, false);
        testChangeSel('a^#bcd', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, true, false, false);
        testChangeSel('ab^#cd', 'abc^#d', TextSelModifyImpl.changeSelLeftRight, true, false, false);
        testChangeSel('abc^#d', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, true, false, false);

        /* move left, extend */
        testChangeSel('^#abcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, true, true, false);
        testChangeSel('^a#bcd', 'a^#bcd', TextSelModifyImpl.changeSelLeftRight, true, true, false);
        testChangeSel('a^b#cd', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, true, true, false);
        testChangeSel('ab^c#d', 'abc^#d', TextSelModifyImpl.changeSelLeftRight, true, true, false);
        testChangeSel('abc^d#', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, true, true, false);
        testChangeSel('^abc#d', '^abc#d', TextSelModifyImpl.changeSelLeftRight, true, true, false);
        testChangeSel('^abc#d', 'a^bc#d', TextSelModifyImpl.changeSelLeftRight, true, true, false);
        testChangeSel('#ab^cd', '#abc^d', TextSelModifyImpl.changeSelLeftRight, true, true, false);
        testChangeSel('a#b^cd', 'a#bc^d', TextSelModifyImpl.changeSelLeftRight, true, true, false);

        /* move right, no extend */
        testChangeSel('a^#bcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, false, false, false);
        testChangeSel('ab^#cd', 'a^#bcd', TextSelModifyImpl.changeSelLeftRight, false, false, false);
        testChangeSel('abc^#d', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, false, false, false);
        testChangeSel('abcd^#', 'abc^#d', TextSelModifyImpl.changeSelLeftRight, false, false, false);
        testChangeSel('abcd^#', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, false, false, false);

        /* move right, extend */
        testChangeSel('#a^bcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, false, true, false);
        testChangeSel('a#b^cd', 'a^#bcd', TextSelModifyImpl.changeSelLeftRight, false, true, false);
        testChangeSel('ab#c^d', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, false, true, false);
        testChangeSel('abc#d^', 'abc^#d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
        testChangeSel('abcd#^', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, false, true, false);
        testChangeSel('a^bc#d', '^abc#d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
        testChangeSel('ab^c#d', 'a^bc#d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
        testChangeSel('#abcd^', '#abc^d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
        testChangeSel('a#bcd^', 'a#bc^d', TextSelModifyImpl.changeSelLeftRight, false, true, false);
    },
    'testChangeSelGoLineHomeEnd',
    () => {
        /* middle line, go to start, no extend */
        testChangeSel('qr|^#abc|st', 'qr|^#abc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('qr|^#abc|st', 'qr|a^#bc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('qr|^#abc|st', 'qr|a^b#c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('qr|^#abc|st', 'qr|a#b^c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('qr|^#abc|st', 'qr|abc^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);

        /* middle line, go to start, extend */
        testChangeSel('qr|^#abc|st', 'qr|^#abc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('qr|^a#bc|st', 'qr|a^#bc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('qr|^ab#c|st', 'qr|a^b#c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('qr|^a#bc|st', 'qr|a#b^c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('qr|^abc#|st', 'qr|abc^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);

        /* middle line, go to end, no extend */
        testChangeSel('qr|abc#^|st', 'qr|^#abc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
        testChangeSel('qr|abc#^|st', 'qr|a^#bc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
        testChangeSel('qr|abc#^|st', 'qr|a^b#c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
        testChangeSel('qr|abc#^|st', 'qr|a#b^c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
        testChangeSel('qr|abc#^|st', 'qr|abc^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);

        /* middle line, go to end, extend */
        testChangeSel('qr|#abc^|st', 'qr|^#abc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('qr|a#bc^|st', 'qr|a^#bc|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('qr|ab#c^|st', 'qr|a^b#c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('qr|a#bc^|st', 'qr|a#b^c|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('qr|abc#^|st', 'qr|abc^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);

        /* one line, go to start, no extend */
        testChangeSel('^#abc', '^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#abc', 'a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#abc', 'a^b#c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#abc', 'a#b^c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#abc', 'abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);

        /* one line, go to start, extend */
        testChangeSel('^#abc', '^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^a#bc', 'a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^ab#c', 'a^b#c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^a#bc', 'a#b^c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^abc#', 'abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);

        /* one line, go to end, no extend */
        testChangeSel('abc#^', '^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
        testChangeSel('abc#^', 'a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
        testChangeSel('abc#^', 'a^b#c', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
        testChangeSel('abc#^', 'a#b^c', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);
        testChangeSel('abc#^', 'abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);

        /* one line, go to end, extend */
        testChangeSel('#abc^', '^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('a#bc^', 'a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('ab#c^', 'a^b#c', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('a#bc^', 'a#b^c', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('abc#^', 'abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);

        /* empty line in middle */
        testChangeSel('qr|#^|st', 'qr|^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('qr|#^|st', 'qr|^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('qr|#^|st', 'qr|^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('qr|#^|st', 'qr|^#|st', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);

        /* empty line at end */
        testChangeSel('qr|#^', 'qr|^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('qr|#^', 'qr|^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('qr|#^', 'qr|^#', TextSelModifyImpl.changeSelGoLineHomeEnd, false, true);
        testChangeSel('qr|#^', 'qr|^#', TextSelModifyImpl.changeSelGoLineHomeEnd, false, false);

        /* go to whitespace start, no extend */
        testChangeSel('   ^#abc', '   abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('   ^#abc   def', '   abc   def^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('\t^#abc\tdef', '\tabc\tdef^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('   ^#abc', '   ab^#c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('   ^#abc', '   a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#   abc', '   ^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#   abc', '  ^# abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#   abc', ' ^#  abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#   abc', '^#   abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#   ', '   ^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#   ', '  ^# ', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^# ', ' ^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#\t\t\t', '\t\t\t^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        testChangeSel('^#\t', '\t^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);
        let expected = '\t\t\t^#abc\t\t\tdef';
        let input = '\t\t\tabc\t\t\tdef^#';
        testChangeSel(expected, input, TextSelModifyImpl.changeSelGoLineHomeEnd, true, false);

        /* go to whitespace start, extend */
        testChangeSel('   ^abc#', '   abc^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('   ^abc   def#', '   abc   def^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('\t^abc\tdef#', '\tabc\tdef^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('   ^ab#c', '   ab^#c', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('   ^a#bc', '   a^#bc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^   #abc', '   ^#abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^  # abc', '  ^# abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^ #  abc', ' ^#  abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^#   abc', '^#   abc', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^   #', '   ^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^  # ', '  ^# ', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^ #', ' ^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^\t\t\t#', '\t\t\t^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        testChangeSel('^\t#', '\t^#', TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
        expected = '\t\t\t^abc\t\t\tdef#';
        input = '\t\t\tabc\t\t\tdef^#';
        testChangeSel(expected, input, TextSelModifyImpl.changeSelGoLineHomeEnd, true, true);
    },
    'testChangeSelLeftRightUntilWord',
    () => {
        /* move left by words */
        testChangeSel('#^abcd', '^#abcd', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('#^abcd', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('#^abcd', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('#^abcd ', 'abcd ^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('#^abcd  ', 'abcd  ^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('#^abcd\t', 'abcd\t^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('abcd ^#d', 'abcd d^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('abcd ^#de', 'abcd de^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('abcd ^#\n', 'abcd \n^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('abcd \n^#d', 'abcd \nd^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('abc ^#123 abc', 'abc 123^# abc', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('^#abc 123 abc', 'abc^# 123 abc', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('abc.123.^#abc', 'abc.123.abc^#', TextSelModifyImpl.changeSelLeftRight, true, false, true);
        testChangeSel('abc.123^#.abc', 'abc.123.^#abc', TextSelModifyImpl.changeSelLeftRight, true, false, true);

        /* move right by words */
        testChangeSel('abcd^#', '^#abcd', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel('abcd^#', 'ab^#cd', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel('abcd^#', 'abcd^#', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel('abcd #^', 'abcd ^#', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel(' #^abcd', '^# abcd', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel('abcd  #^', '^#abcd  ', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel('abcd\t#^', '^#abcd\t', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel('abcd ^#d', '^#abcd d', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel('abcd ^#de', '^#abcd de', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel('abcd ^#\n', '^#abcd \n', TextSelModifyImpl.changeSelLeftRight, false, false, true);
        testChangeSel('abcd ^#\nd', '^#abcd \nd', TextSelModifyImpl.changeSelLeftRight, false, false, true);

        /* move right by words, longer input strings */
        let expected = 'abc 123 ^#abc';
        let input = 'abc ^#123 abc';
        testChangeSel(expected, input, TextSelModifyImpl.changeSelLeftRight, false, false, true);

        expected = 'abc 123 abc^#';
        input = 'abc 123 ^#abc';
        testChangeSel(expected, input, TextSelModifyImpl.changeSelLeftRight, false, false, true);

        expected = 'abc^#.123.abc';
        input = '^#abc.123.abc';
        testChangeSel(expected, input, TextSelModifyImpl.changeSelLeftRight, false, false, true);

        expected = 'abc.^#123.abc';
        input = 'abc^#.123.abc';
        testChangeSel(expected, input, TextSelModifyImpl.changeSelLeftRight, false, false, true);
    },
    'testChangeSelCurrentWord',
    () => {
        testChangeSel('^#', '^#', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('^a#', '^#a', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('^abc#', '^#abc', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel(' ^abc#', ' ^#abc', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('^abc# ', '^#abc ', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('test1 test2^ #test3', 'test1 test2^# test3', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('test1 ^test2# test3', 'test1 test^#2 test3', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('test1 ^test2# test3', 'test1 tes^#t2 test3', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('test1 ^test2# test3', 'test1 te^#st2 test3', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('test1 ^test2# test3', 'test1 ^#test2 test3', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('test1^ #test2 test3', 'test1^# test2 test3', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('.^a#.', '.^#a.', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('.a^.#', '.a^#.', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('.^abc#.', '.ab^#c.', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('1 ^a# 2', '1 ^#a 2', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('1 ^abc# 2', '1 ab^#c 2', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('1 abc ^2#', '1 abc ^#2', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('1 abc^ #2', '1 abc^# 2', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('1 abc^  #2', '1 abc^#  2', TextSelModifyImpl.changeSelCurrentWord);
        testChangeSel('1 abc^  #2', '1 abc ^# 2', TextSelModifyImpl.changeSelCurrentWord);
    },
    'testSelectLineInField,selectByLinesWhichLine.EmptyField',
    () => {
        let el = new UI512ElTextField('test', new ElementObserverNoOp());
        let gel = new UI512ElTextFieldAsGeneric(el);
        el.setFmTxt(FormattedText.newFromUnformatted(''));
        TextSelModify.selectLineInField(gel, 0);
        assertEq(0, el.getN('selcaret'), 'C8|');
        assertEq(0, el.getN('selend'), 'C7|');
        assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), 'C6|');
        TextSelModify.selectLineInField(gel, 2);
        assertEq(0, el.getN('selcaret'), 'C5|');
        assertEq(0, el.getN('selend'), 'C4|');
        assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), 'C3|');
    },
    'testSelectLineInField,selectByLinesWhichLine.FieldWithNoEmptyLines',
    () => {
        let el = new UI512ElTextField('test', new ElementObserverNoOp());
        let gel = new UI512ElTextFieldAsGeneric(el);
        el.setFmTxt(FormattedText.newFromUnformatted('abc\ndef\nghi'));
        TextSelModify.selectLineInField(gel, 0);
        assertEq(0, el.getN('selcaret'), 'C2|');
        assertEq(4, el.getN('selend'), 'C1|');
        assertEq(0, TextSelModify.selectByLinesWhichLine(gel), 'C0|');

        TextSelModify.selectLineInField(gel, 1);
        assertEq(4, el.getN('selcaret'), 'B~|');
        assertEq(8, el.getN('selend'), 'B}|');
        assertEq(1, TextSelModify.selectByLinesWhichLine(gel), 'B||');

        TextSelModify.selectLineInField(gel, 2);
        assertEq(8, el.getN('selcaret'), 'B{|');
        assertEq(11, el.getN('selend'), 'B`|');
        assertEq(2, TextSelModify.selectByLinesWhichLine(gel), 'B_|');

        TextSelModify.selectLineInField(gel, 3);
        assertEq(8, el.getN('selcaret'), 'B^|');
        assertEq(11, el.getN('selend'), 'B]|');
        assertEq(2, TextSelModify.selectByLinesWhichLine(gel), 'B[|');

        TextSelModify.selectLineInField(gel, 4);
        assertEq(8, el.getN('selcaret'), 'B@|');
        assertEq(11, el.getN('selend'), 'B?|');
        assertEq(2, TextSelModify.selectByLinesWhichLine(gel), 'B>|');
    },
    'testSelectLineInField,selectByLinesWhichLine.FieldWithSomeEmptyLines',
    () => {
        let el = new UI512ElTextField('test', new ElementObserverNoOp());
        let gel = new UI512ElTextFieldAsGeneric(el);
        el.setFmTxt(FormattedText.newFromUnformatted('\nabc\n\ndef\n'));
        TextSelModify.selectLineInField(gel, 0);
        assertEq(0, el.getN('selcaret'), 'B=|');
        assertEq(1, el.getN('selend'), 'B<|');
        assertEq(0, TextSelModify.selectByLinesWhichLine(gel), 'B;|');
        TextSelModify.selectLineInField(gel, 1);
        assertEq(1, el.getN('selcaret'), 'B:|');
        assertEq(5, el.getN('selend'), 'B/|');
        assertEq(1, TextSelModify.selectByLinesWhichLine(gel), 'B.|');
        TextSelModify.selectLineInField(gel, 2);
        assertEq(5, el.getN('selcaret'), 'B-|');
        assertEq(6, el.getN('selend'), 'B,|');
        assertEq(2, TextSelModify.selectByLinesWhichLine(gel), 'B+|');
        TextSelModify.selectLineInField(gel, 3);
        assertEq(6, el.getN('selcaret'), 'B*|');
        assertEq(10, el.getN('selend'), 'B)|');
        assertEq(3, TextSelModify.selectByLinesWhichLine(gel), 'B(|');
        TextSelModify.selectLineInField(gel, 4);
        assertEq(10, el.getN('selcaret'), 'B&|');
        assertEq(10, el.getN('selend'), 'B%|');
        assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), 'B$|');
        TextSelModify.selectLineInField(gel, 5);
        assertEq(10, el.getN('selcaret'), 'B#|');
        assertEq(10, el.getN('selend'), 'B!|');
        assertEq(undefined, TextSelModify.selectByLinesWhichLine(gel), 'B |');
    }
];

/**
 * exported test class for mTests
 */
export class TestUI512TextSelectEvents extends UI512TestBase {
    tests = mTests;

    /**
     * From one string with ^ and # markers,
     * to [FormattedText, selcaret, selend]
     *
     * To make the tests easier to read, we use the symbol
     * ^ to mean the selcaret (start of selection)
     * # to mean the selend (end of selection)
     */
    static fromPlainText(s: string): [FormattedText, number, number] {
        /* step 1) get a string without the font changes */
        let tToGetUnformatted = FormattedText.newFromSerialized(s);
        let sUnformatted = tToGetUnformatted.toUnformatted();
        assertTrue(
            scontains(sUnformatted, '^') && scontains(sUnformatted, '#'),
            `1m|string "${sUnformatted}" needs ^ and #`
        );

        /* step 2) get caret positions */
        let selCaret;
        let selEnd;
        if (sUnformatted.indexOf('^') < sUnformatted.indexOf('#')) {
            selCaret = sUnformatted.indexOf('^');
            sUnformatted = sUnformatted.replace(/\^/g, '');
            selEnd = sUnformatted.indexOf('#');
            sUnformatted = sUnformatted.replace(/#/g, '');
        } else {
            selEnd = sUnformatted.indexOf('#');
            sUnformatted = sUnformatted.replace(/#/g, '');
            selCaret = sUnformatted.indexOf('^');
            sUnformatted = sUnformatted.replace(/\^/g, '');
        }

        /* step 3) create formatted text */
        let t = FormattedText.newFromSerialized(s.replace(/#/g, '').replace(/\^/g, ''));
        return [t, selCaret, selEnd];
    }
}

/**
 * run fromPlainText to get the selcaret and selend markers,
 * then run the callback with the provided args,
 * then compare expected and received results
 */
function testChangeSel(expected: string, input: string, fn: Function, ...moreargs: any[]) {
    expected = expected.replace(/\|/g, '\n');
    input = input.replace(/\|/g, '\n');
    let [t, selcaret, selend] = TestUI512TextSelectEvents.fromPlainText(input);
    let args = [t, selcaret, selend, ...moreargs];
    let [gotSelCaret, gotSelEnd] = fn.apply(null, args);
    let [expectedTxt, expectedCaret, expectedEnd] = TestUI512TextSelectEvents.fromPlainText(expected);
    assertEq(expectedTxt.toSerialized(), t.toSerialized(), '1s|');
    assertEq(expectedCaret, gotSelCaret, '1r|incorrect caret position');
    assertEq(expectedEnd, gotSelEnd, '1q|incorrect select-end position');
}
