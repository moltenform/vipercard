
/* autoimport:start */
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { cProductName, cTkSyntaxMarker, makeVpcScriptErr, makeVpcInternalErr, checkThrow, checkThrowEq, FormattedSubstringUtil, CodeLimits, VpcIntermedValBase, IntermedMapOfIntermedVals, VpcVal, VpcValS, VpcValN, VpcValBool, VarCollection, VariableCollectionConstants, ReadableContainer, WritableContainer, RequestedChunk, CountNumericId, VpcScriptErrorBase, VpcScriptRuntimeError, VpcScriptSyntaxError, VpcUI512Serialization } from "../vpcscript/vpcutil.js";
import { RequestedChunkType, PropAdjective, SortStyle, OrdinalOrPosition, RequestedChunkTextPreposition, VpcElType, vpcElTypeToString, VpcTool, toolToPaintOntoCanvasShapes, VpcToolCtg, getToolCategory, VpcBuiltinMsg, getMsgNameFromType, VpcOpCtg, getPositionFromOrdinalOrPosition } from "../vpcscript/vpcenums.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

declare var LZString: any;

export class Test_ui512Utils extends Tests_BaseClass {
    tests = [
        "testAssertThrow",
        () => {
            this.assertThrows("", "mymessage", () => {
                throw makeUI512Error("1N|1 mymessage 2");
            });

            this.assertThrows("", "xyz", () => {
                throw new Error("1 xyz 2");
            });
        },
        "test_defaultSortString",
        () => {
            assertEq(0, defaultSort("", ""), "1M|");
            assertEq(0, defaultSort("a", "a"), "1L|");
            assertEq(1, defaultSort("abc", "abb"), "1K|");
            assertEq(-1, defaultSort("abb", "abc"), "1J|");
            assertEq(1, defaultSort("abcd", "abc"), "1I|");
            assertEq(-1, defaultSort("abc", "abcd"), "1H|");
            assertEq(0, defaultSort("aunicode\u2666char", "aunicode\u2666char"), "1G|");
            assertEq(1, defaultSort("aunicode\u2667char", "aunicode\u2666char"), "1F|");
            assertEq(-1, defaultSort("aunicode\u2666char", "aunicode\u2667char"), "1E|");
            assertEq(0, defaultSort("accented\u00e9letter", "accented\u00e9letter"), "1D|");
            assertEq(1, defaultSort("accented\u00e9letter", "accented\u0065\u0301letter"), "1C|");
            assertEq(-1, defaultSort("accented\u0065\u0301letter", "accented\u00e9letter"), "1B|");
        },
        "test_defaultSortBool",
        () => {
            assertEq(0, defaultSort(false, false), "1A|");
            assertEq(0, defaultSort(true, true), "19|");
            assertEq(1, defaultSort(true, false), "18|");
            assertEq(-1, defaultSort(false, true), "17|");
        },
        "test_defaultSortNumber",
        () => {
            assertEq(0, defaultSort(0, 0), "16|");
            assertEq(0, defaultSort(1, 1), "15|");
            assertEq(0, defaultSort(12345, 12345), "14|");
            assertEq(0, defaultSort(-11.15, -11.15), "13|");
            assertEq(-1, defaultSort(0, 1), "12|");
            assertEq(1, defaultSort(1, 0), "11|");
            assertEq(1, defaultSort(1.4, 1.3), "10|");
            assertEq(1, defaultSort(0, -1), "0~|");
            assertEq(1, defaultSort(Number.POSITIVE_INFINITY, 12345), "0}|");
            assertEq(-1, defaultSort(Number.NEGATIVE_INFINITY, -12345), "0||");
        },
        "test_defaultSortArraySameLength",
        () => {
            assertEq(0, defaultSort([], []), "0{|");
            assertEq(0, defaultSort([5, "a"], [5, "a"]), "0`|");
            assertEq(1, defaultSort([5, "a", 7], [5, "a", 6]), "0_|");
            assertEq(-1, defaultSort([5, "a", 6], [5, "a", 7]), "0^|");
            assertEq(1, defaultSort([5, 7, "a"], [5, 6, "a"]), "0]|");
            assertEq(1, defaultSort([5, 7, "a", 600], [5, 6, "a", 700]), "0[|");

            assertEq(0, defaultSort([5, "a", "abcdef"], [5, "a", "abcdef"]), "0@|");
            assertEq(1, defaultSort([5, "a", "abc"], [5, "a", "abb"]), "0?|");
            assertEq(-1, defaultSort([5, "a", "abb"], [5, "a", "abc"]), "0>|");
        },
        "test_defaultSortArrayDifferentLength",
        () => {
            assertEq(1, defaultSort([1], []), "0=|");
            assertEq(-1, defaultSort([], [1]), "0<|");
            assertEq(1, defaultSort([10, 20], [10]), "0;|");
            assertEq(-1, defaultSort([10], [10, 20]), "0:|");
        },
        "test_defaultSortArrayNested",
        () => {
            assertEq(0, defaultSort([[]], [[]]), "0/|");
            assertEq(0, defaultSort([[], []], [[], []]), "0.|");
            assertEq(0, defaultSort([[1, 2], []], [[1, 2], []]), "0-|");
            assertEq(0, defaultSort([[10, 20], [30]], [[10, 20], [30]]), "0,|");
            assertEq(1, defaultSort([[10, 20], [30]], [[10, 20], [-30]]), "0+|");
            assertEq(-1, defaultSort([[10, 20], [-30]], [[10, 20], [30]]), "0*|");
            assertEq(1, defaultSort([[10, 20], [1, 30]], [[10, 20], [1, -30]]), "0)|");
            assertEq(-1, defaultSort([[10, 20], [1, -30]], [[10, 20], [1, 30]]), "0(|");
            assertEq(1, defaultSort([[10, 20], [30, 31]], [[10, 20], [30]]), "0&|");
            assertEq(-1, defaultSort([[10, 20], [30]], [[10, 20], [30, 31]]), "0%|");
            assertEq(0, defaultSort([[10, 20], 50, [30]], [[10, 20], 50, [30]]), "0$|");
            assertEq(1, defaultSort([[10, 20], 60, [30]], [[10, 20], 50, [30]]), "0#|");
            assertEq(-1, defaultSort([[10, 20], 50, [30]], [[10, 20], 60, [30]]), "0!|");
        },
        "testSetArrEmptyZeroth",
        () => {
            let ar: O<string>[] = [];
            setarr(ar, 0, "a");
            assertEq(["a"], ar, "0 |");
        },
        "testSetArrEmptyThird",
        () => {
            let ar: O<string>[] = [];
            setarr(ar, 3, "a");
            assertEq([undefined, undefined, undefined, "a"], ar, "0z|");
        },
        "testSetArrZeroth",
        () => {
            let ar: O<string>[] = ["a"];
            setarr(ar, 0, "b");
            assertEq(["b"], ar, "0y|");
        },
        "testSetArrFirst",
        () => {
            let ar: O<string>[] = ["a", "b", "c", "d"];
            setarr(ar, 1, "x");
            assertEq(["a", "x", "c", "d"], ar, "0x|");
        },
        "testSetArrThird",
        () => {
            let ar: O<string>[] = ["a", "b", "c", "d"];
            setarr(ar, 3, "x");
            assertEq(["a", "b", "c", "x"], ar, "0w|");
        },
        "testSetArrFourth",
        () => {
            let ar: O<string>[] = ["a", "b", "c", "d"];
            setarr(ar, 4, "x");
            assertEq(["a", "b", "c", "d", "x"], ar, "0v|");
        },
        "testSetArrFifth",
        () => {
            let ar: O<string>[] = ["a", "b", "c", "d"];
            setarr(ar, 5, "x");
            assertEq(["a", "b", "c", "d", undefined, "x"], ar, "0u|");
        },
        "test_forofarray",
        () => {
            let ar = [11, 22, 33];
            let result: number[] = [];
            for (let item of ar) {
                result.push(item);
            }
            assertEq([11, 22, 33], result, "0t|");
        },
        "test_forofgenerator",
        () => {
            // if targeting Es3 or Es5, must run typescript with downlevelIteration
            function* myGenerator() {
                yield 10;
                yield 20;
                yield 30;
                yield 40;
            }
            let result: number[] = [];
            for (let item of myGenerator()) {
                result.push(item);
            }
            assertEq([10, 20, 30, 40], result, "0s|");
        },
        "test_forofgeneratorexitearly",
        () => {
            function* myGenerator() {
                yield 10;
                yield 20;
                yield 30;
                yield 40;
            }
            let result: number[] = [];
            for (let item of myGenerator()) {
                result.push(item);
                if (item === 20) {
                    break;
                }
            }
            assertEq([10, 20], result, "0r|");
        },
        "test_orderedhashiterkeys",
        () => {
            let hash = new OrderedHash<number>();
            hash.insertNew("ccc", 30);
            hash.insertNew("ccb", 29);
            hash.insertNew("cca", 28);
            let result: string[] = [];
            for (let item of hash.iterKeys()) {
                result.push(item);
            }
            assertEq(["ccc", "ccb", "cca"], result, "0q|");
        },
        "test_orderedhashitervals",
        () => {
            let hash = new OrderedHash<number>();
            hash.insertNew("ccc", 30);
            hash.insertNew("ccb", 29);
            hash.insertNew("cca", 28);
            let result: number[] = [];
            for (let item of hash.iter()) {
                result.push(item);
            }
            assertEq([30, 29, 28], result, "0p|");
        },
        "test_orderedhashitervalsreversed",
        () => {
            let hash = new OrderedHash<number>();
            hash.insertNew("ccc", 30);
            hash.insertNew("ccb", 29);
            hash.insertNew("cca", 28);
            let result: number[] = [];
            for (let item of hash.iterReversed()) {
                result.push(item);
            }
            assertEq([28, 29, 30], result, "0o|");
        },
        "test_orderedhashitervalsreversedexit",
        () => {
            let hash = new OrderedHash<number>();
            hash.insertNew("A5", 555);
            hash.insertNew("A4", 444);
            hash.insertNew("A7", 777);
            let result: number[] = [];
            for (let item of hash.iterReversed()) {
                result.push(item);
                if (item === 444) {
                    break;
                }
            }
            assertEq([777, 444], result, "0n|");
        },
        "test_strToEnum",
        () => {
            // no item should be 0
            assertTrue(RequestedChunkType.Chars !== 0, "0m|no item should be 0");
            // alternates have same val
            assertEq(RequestedChunkType.alternateforms_word, RequestedChunkType.Words, "0l|");
            // alternates have same val
            assertEq(RequestedChunkType.alternateforms_words, RequestedChunkType.Words, "0k|");
            // we disallow this even though it's in the enum
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, "alternateforms_word"), "0j|");
            // or this
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, "__isUI512Enum"), "0i|");
            // can't find empty string
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, ""), "0h|");
            // can't find non-existant
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, "abc"), "0g|");
            // can't find non-existant that is close 1
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, "words "), "0f|");
            // can't find non-existant that is close 2
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, "_words"), "0e|");
            // look up by canonical form
            assertEq(RequestedChunkType.Words, findStrToEnum<RequestedChunkType>(RequestedChunkType, "Words"), "0d|");
            // look up by alt form
            assertEq(RequestedChunkType.Words, findStrToEnum<RequestedChunkType>(RequestedChunkType, "word"), "0c|");
            // look up by another alt form
            assertEq(RequestedChunkType.Words, findStrToEnum<RequestedChunkType>(RequestedChunkType, "words"), "0b|");
            // look up by another alt form
            assertEq(RequestedChunkType.Chars, findStrToEnum<RequestedChunkType>(RequestedChunkType, "characters"), "0a|");
        },
        "test_enumToStr",
        () => {
            // can't find 0
            assertEq(undefined, findEnumToStr<RequestedChunkType>(RequestedChunkType, 0), "0Z|");
            // can't find non-existant
            assertEq(undefined, findEnumToStr<RequestedChunkType>(RequestedChunkType, 99), "0Y|");
            // don't allow lookup on marker
            assertEq(undefined, findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.__isUI512Enum), "0X|");
            // get canonical string for lines
            assertEq("Lines", findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.alternateforms_lines), "0W|");
            // get canonical string for items
            assertEq("Items", findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.alternateforms_items), "0V|");
            // get canonical string for words
            assertEq("Words", findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.alternateforms_words), "0U|");
            // get canonical string for chars
            assertEq("Chars", findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.alternateforms_chars), "0T|");
        },
        "test_utils_isMapEmpty",
        () => {
            let map0 = {}
            let map1 = {a:true}
            let map2 = {abc:'abc', def:'def'}
            let cls0 = new TestClsEmpty()
            let cls1 = new TestClsOne()
            let cls2 = new TestClsOne();
            (cls2 as any).aSingleAdded = 1

            assertTrue(Util512.isMapEmpty(map0), "")
            assertTrue(!Util512.isMapEmpty(map1), "")
            assertTrue(!Util512.isMapEmpty(map2), "")
            assertTrue(Util512.isMapEmpty(cls0 as any), "")
            assertTrue(!Util512.isMapEmpty(cls1 as any), "")
            assertTrue(!Util512.isMapEmpty(cls2 as any), "")
        },
        "test_utils_freezeProperty",
        () => {
            let map1 = {a:true, b: true}
            Util512.freezeProperty(map1, 'a')
            map1.b = false
            this.assertThrows("", 'read only property', () => {
                map1.a = false})
        },
        "test_utils_freezeRecurse",
        () => {
            // freeze a simple object
            let simple = {a:true, b: true}
            assertTrue(!Object.isFrozen(simple), "")
            Util512.freezeRecurse(simple)
            this.assertThrows("", 'read only property', () => {
                simple.a = false})
            
            // freeze a complex object
            let c1 = new TestClsOne();
            let c2 = new TestClsOne();
            let c3 = new TestClsOne();
            (c1 as any).child = c2;
            (c2 as any).child = c3;
            (c3 as any).nullchild = undefined;
            assertTrue(!Object.isFrozen(c1), "")
            Util512.freezeRecurse(c1)
            assertTrue(Object.isFrozen(c1), "")
            assertTrue(Object.isFrozen(c2), "")
            assertTrue(Object.isFrozen(c3), "")
            this.assertThrows("", 'read only property', () => {
                c1.aSingleProp = false})
            this.assertThrows("", 'not extensible', () => {
                (c1 as any).newProp = true})
        },
        "test_utils_getMapKeys_shallowClone",
        () => {
            let map0 = {}
            let map1 = {a:true}
            let map2 = {abc:'abc', def:'_def'}
            let cls0 = new TestClsEmpty()
            let cls1 = new TestClsOne()
            let cls2 = new TestClsOne();
            (cls2 as any).aSingleAdded = 1

            // test getMapKeys
            assertEq('', this.getMapKeysString(map0), "")
            assertEq('a:true,', this.getMapKeysString(map1), "")
            assertEq('abc:abc,def:_def,', this.getMapKeysString(map2), "")
            assertEq('', this.getMapKeysString(cls0 as any), "")
            assertEq('aSingleProp:true,', this.getMapKeysString(cls1 as any), "")
            assertEq('aSingleAdded:1,aSingleProp:true,', this.getMapKeysString(cls2 as any), "")
            
            // test getMapVals
            assertEq('', this.getMapValsString(map0), "")
            assertEq('true', this.getMapValsString(map1), "")
            assertEq('_def,abc', this.getMapValsString(map2), "")
            assertEq('', this.getMapValsString(cls0 as any), "")
            assertEq('true', this.getMapValsString(cls1 as any), "")
            assertEq('1,true', this.getMapValsString(cls2 as any), "")
            
            // test shallowClone
            assertEq('', this.getMapKeysString(Util512.shallowClone(map0)), "")
            assertEq('a:true,', this.getMapKeysString(Util512.shallowClone(map1)), "")
            assertEq('abc:abc,def:_def,', this.getMapKeysString(Util512.shallowClone(map2)), "")
            assertEq('', this.getMapKeysString(Util512.shallowClone(cls0 as any)), "")
            assertEq('aSingleProp:true,', this.getMapKeysString(Util512.shallowClone(cls1 as any)), "")
            assertEq('aSingleAdded:1,aSingleProp:true,', this.getMapKeysString(Util512.shallowClone(cls2 as any)), "")
        },
        "test_utils_escapeForRegex",
        () => {
            assertEq("", Util512.escapeForRegex(""), "")
            assertEq("abc", Util512.escapeForRegex("abc"), "")
            assertEq("\\[abc\\]", Util512.escapeForRegex("[abc]"), "")
            assertEq("123\\[abc\\]456", Util512.escapeForRegex("123[abc]456"), "")
            assertEq("\\.\\.", Util512.escapeForRegex(".."), "")
            assertEq("\\|\\|", Util512.escapeForRegex("||"), "")
            assertEq("\\[\\[", Util512.escapeForRegex("[["), "")
            assertEq("\\]\\]", Util512.escapeForRegex("]]"), "")
            assertEq("\\(\\(", Util512.escapeForRegex("(("), "")
            assertEq("\\)\\)", Util512.escapeForRegex("))"), "")
            assertEq("\\/\\/", Util512.escapeForRegex("//"), "")
            assertEq("\\\\\\\\", Util512.escapeForRegex("\\\\"), "")
        },
        "test_utils_callAsMethodOnClassInvalid",
        () => {
            // should throw on invalid method name
            let c = new TestClsWithMethods()
            for (let okIfNotExists of [false, true]) {
                this.assertThrows("", "requires alphanumeric", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, "", [true, 1], okIfNotExists))
                this.assertThrows("", "requires alphanumeric", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, "a", [true, 1], okIfNotExists))
                this.assertThrows("", "requires alphanumeric", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, "?", [true, 1], okIfNotExists))
                this.assertThrows("", "requires alphanumeric", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, "a b", [true, 1], okIfNotExists))
                this.assertThrows("", "requires alphanumeric", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, "1a", [true, 1], okIfNotExists))
                this.assertThrows("", "requires alphanumeric", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, "_c", [true, 1], okIfNotExists))
                this.assertThrows("", "requires alphanumeric", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, "__c", [true, 1], okIfNotExists))
                this.assertThrows("", "requires alphanumeric", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, ".", [true, 1], okIfNotExists))
                this.assertThrows("", "requires alphanumeric", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, "a.b", [true, 1], okIfNotExists))
            }
            
            // attempt to call missing method
            Util512.callAsMethodOnClass("TestClsWithMethods", c, "notExist", [true, 1], true)
            this.assertThrows("", "could not find", () =>
                    Util512.callAsMethodOnClass("TestClsWithMethods", c, "notExist", [true, 1], false))
                
        },
        "test_utils_callAsMethodOnClassValid",
        () => {
            // call a valid method
            let c1 = new TestClsWithMethods()
            Util512.callAsMethodOnClass("TestClsWithMethods", c1, "go_abc", [true, 1], false)
            assertEq(true, c1.calledAbc, "")
            assertEq(false, c1.calledZ, "")
            let c2 = new TestClsWithMethods()
            Util512.callAsMethodOnClass("TestClsWithMethods", c2, "go_z", [true, 1], false)
            assertEq(false, c2.calledAbc, "")
            assertEq(true, c2.calledZ, "")
        },
        "test_utils_listUnique",
        () => {
            assertEq([], Util512.listUnique([]), "")
            assertEq(["1"], Util512.listUnique(["1"]), "")
            assertEq(["1", "2", "3"], Util512.listUnique(["1", "2", "3"]), "")
            assertEq(["1", "2", "3"], Util512.listUnique(["1", "2", "2", "3"]), "")
            assertEq(["1", "2", "3"], Util512.listUnique(["1", "2", "3", "3"]), "")
            assertEq(["1", "2", "3"], Util512.listUnique(["1", "2", "2", "3", "2"]), "")
            assertEq(["1", "2", "3"], Util512.listUnique(["1", "2", "2", "3", "3"]), "")
            assertEq(["1", "2", "3"], Util512.listUnique(["1", "2", "3", "2", "3"]), "")
        },
        "test_utils_fitIntoInclusive",
        () => {
            assertEq(1, fitIntoInclusive(0, 1, 1), "")
            assertEq(1, fitIntoInclusive(1, 1, 1), "")
            assertEq(1, fitIntoInclusive(2, 1, 1), "")
            assertEq(1, fitIntoInclusive(0, 1, 3), "")
            assertEq(1, fitIntoInclusive(1, 1, 3), "")
            assertEq(2, fitIntoInclusive(2, 1, 3), "")
            assertEq(3, fitIntoInclusive(3, 1, 3), "")
            assertEq(3, fitIntoInclusive(4, 1, 3), "")
        },
        "test_utils_compressString",
        () => {
            // simple compress and uncompress
            for (let escapeNewlines of [false, true]) {
                assertEq("\u2020 ", Util512.compressString("", escapeNewlines), "")
                assertEq("\u10E8 ", Util512.compressString("a", escapeNewlines), "")
                assertEq("\u10E6\u4866\u4AEA  ", Util512.compressString("aaaaaaaabbbbbbbb", escapeNewlines), "")
                assertEq("\u10E6\u4866\u4AE8\u31B0 ", Util512.compressString("aaaaaaaabbbbbbbbc", escapeNewlines), "")
                assertEq("\u10E6\u7070\u0256\u4CF0 ", Util512.compressString("aaaaaaa\nbbbbbbbbb", escapeNewlines), "")
                assertEq("", Util512.decompressString("\u2020 ", escapeNewlines), "")
                assertEq("a", Util512.decompressString("\u10E8 ", escapeNewlines), "")
                assertEq("aaaaaaaabbbbbbbb", Util512.decompressString("\u10E6\u4866\u4AEA  ", escapeNewlines), "")
                assertEq("aaaaaaaabbbbbbbbc", Util512.decompressString("\u10E6\u4866\u4AE8\u31B0 ", escapeNewlines), "")
                assertEq("aaaaaaa\nbbbbbbbbb", Util512.decompressString("\u10E6\u7070\u0256\u4CF0 ", escapeNewlines), "")
            }

            // test the case where compresing a string results in a string with newline(s)
            let realCompress = LZString.compressToUTF16
            try {
                LZString.compressToUTF16 = (s:string) => "fake\nfake"
                assertEq("fake\nfake", Util512.compressString("a", false), "")                
                assertEq("fake##Newline##fake", Util512.compressString("a", true), "")                
                LZString.compressToUTF16 = (s:string) => "fake\nfake\nfake"
                assertEq("fake\nfake\nfake", Util512.compressString("a", false), "")                
                assertEq("fake##Newline##fake##Newline##fake", Util512.compressString("a", true), "")                
            } finally {
                LZString.compressToUTF16 = realCompress
            }

            // test the case where compresing a string results in a string with our newline marker
            // (mathematically extremely unlikely)
            try {
                LZString.compressToUTF16 = (s:string) => "fake##Newline##fake"
                assertEq("fake##Newline##fake", Util512.compressString("a", false), "")                
                this.assertThrows("", "cannot compress", () => Util512.compressString("a", true))
            } finally {
                LZString.compressToUTF16 = realCompress
            }
        },
    ];

    protected getMapKeysString<T>(map:{ [key: string]: T }) {
        let keys = Util512.getMapKeys(map)
        keys.sort()
        let ret=''
        for (let key of keys) {
            ret += key+':'+map[key]+','
        }
        
        return ret
    }

    protected getMapValsString<T>(map:{ [key: string]: T }) {
        let vals = Util512.getMapVals(map)
        vals.sort()
        return vals.join(',')
    }
}

export class Test_CanvasWrapper extends Tests_BaseClass {
    tests = [
        "test_getRectClippedFullyContained",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, w, h];
            assertEq(expected, got, "0S|");
        },
        "test_getRectClippedSidesSame",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            x0 = boxx0;
            w = boxw;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, w, h];
            assertEq(expected, got, "0R|");
        },
        "test_getRectClippedTopsSame",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            y0 = boxy0;
            h = boxh;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, w, h];
            assertEq(expected, got, "0Q|");
        },
        "test_getRectProtrudesLeft",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            x0 = 6;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [10, y0, 30 - (10 - 6), h];
            assertEq(expected, got, "0P|");
        },
        "test_getRectProtrudesTop",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            y0 = 50;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, 60, w, 22 - (60 - 50)];
            assertEq(expected, got, "0O|");
        },
        "test_getRectProtrudesRight",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            w = 300;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, 200 + 10 - 15, h];
            assertEq(expected, got, "0N|");
        },
        "test_getRectProtrudesBottom",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            h = 400;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, w, 130 + 60 - 65];
            assertEq(expected, got, "0M|");
        },
        "test_getRectCompletelyCovers",
        () => {
            let boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            let x0 = boxx0 - 5,
                y0 = boxy0 - 7,
                w = boxw + 24,
                h = boxh + 31;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, boxw, boxh];
            assertEq(expected, got, "0L|");
        },
        "test_getRectOutsideLeft",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            x0 = 3;
            w = 6;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, 0, 0];
            assertEq(expected, got, "0K|");
        },
        "test_getRectOutsideLeftTouches",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            x0 = 3;
            w = 7;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, y0, 0, h];
            assertEq(expected, got, "0J|");
        },
        "test_getRectBarelyInsideLeft",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            x0 = 3;
            w = 8;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, y0, 1, h];
            assertEq(expected, got, "0I|");
        },
        "test_getRectOutsideTop",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            y0 = 55;
            h = 4;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, 0, 0];
            assertEq(expected, got, "0H|");
        },
        "test_getRectOutsideTopTouches",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            y0 = 55;
            h = 5;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, boxy0, w, 0];
            assertEq(expected, got, "0G|");
        },
        "test_getRectBarelyInsideTop",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            y0 = 55;
            h = 6;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, boxy0, w, 1];
            assertEq(expected, got, "0F|");
        },
        "test_getRectOutsideRight",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            x0 = boxx0 + boxw;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, 0, 0];
            assertEq(expected, got, "0E|");
        },
        "test_getRectOutsideBottom",
        () => {
            let x0 = 15,
                y0 = 65,
                w = 30,
                h = 22,
                boxx0 = 10,
                boxy0 = 60,
                boxw = 200,
                boxh = 130;
            y0 = boxy0 + boxh;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, 0, 0];
            assertEq(expected, got, "0D|");
        },
    ];
}

class TestClsEmpty {
}

class TestClsOne {
    aSingleProp = true
}

class TestClsWithMethods {
    calledAbc = false
    calledZ = false
    go_abc(p1:boolean, p2:number) {
        assertEq(true, p1, "")
        assertEq(1, p2, "")
        this.calledAbc = true
    }
    go_z(p1:boolean, p2:number) {
        assertEq(true, p1, "")
        assertEq(1, p2, "")
        this.calledZ = true
    }
}
