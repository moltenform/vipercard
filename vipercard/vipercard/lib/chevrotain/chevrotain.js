/*! chevrotain - v0.34.0 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("chevrotain", [], factory);
	else if(typeof exports === 'object')
		exports["chevrotain"] = factory();
	else
		root["chevrotain"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 20);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/*
 Utils using lodash style API. (not necessarily 100% compliant) for functional and other utils.
 These utils should replace usage of lodash in the production code base. not because they are any better...
 but for the purpose of being a dependency free library.

 The hotspots in the code are already written in imperative style for performance reasons.
 so writing several dozen utils which may be slower than the original lodash, does not matter as much
 considering they will not be invoked in hotspots...
 */
function isEmpty(arr) {
    return arr && arr.length === 0;
}
exports.isEmpty = isEmpty;
function keys(obj) {
    if (obj === undefined || obj === null) {
        return [];
    }
    return Object.keys(obj);
}
exports.keys = keys;
function values(obj) {
    var vals = [];
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        vals.push(obj[keys[i]]);
    }
    return vals;
}
exports.values = values;
function mapValues(obj, callback) {
    var result = [];
    var objKeys = keys(obj);
    for (var idx = 0; idx < objKeys.length; idx++) {
        var currKey = objKeys[idx];
        result.push(callback.call(null, obj[currKey], currKey));
    }
    return result;
}
exports.mapValues = mapValues;
function map(arr, callback) {
    var result = [];
    for (var idx = 0; idx < arr.length; idx++) {
        result.push(callback.call(null, arr[idx], idx));
    }
    return result;
}
exports.map = map;
function flatten(arr) {
    var result = [];
    for (var idx = 0; idx < arr.length; idx++) {
        var currItem = arr[idx];
        if (Array.isArray(currItem)) {
            result = result.concat(flatten(currItem));
        }
        else {
            result.push(currItem);
        }
    }
    return result;
}
exports.flatten = flatten;
function first(arr) {
    return isEmpty(arr) ? undefined : arr[0];
}
exports.first = first;
function last(arr) {
    var len = arr && arr.length;
    return len ? arr[len - 1] : undefined;
}
exports.last = last;
function forEach(collection, iteratorCallback) {
    if (Array.isArray(collection)) {
        for (var i = 0; i < collection.length; i++) {
            iteratorCallback.call(null, collection[i], i);
        }
    }
    else if (isObject(collection)) {
        var colKeys = keys(collection);
        for (var i = 0; i < colKeys.length; i++) {
            var key = colKeys[i];
            var value = collection[key];
            iteratorCallback.call(null, value, key);
        }
    }
    else {
        /* istanbul ignore next */
        throw Error("non exhaustive match");
    }
}
exports.forEach = forEach;
function isString(item) {
    return typeof item === "string";
}
exports.isString = isString;
function isUndefined(item) {
    return item === undefined;
}
exports.isUndefined = isUndefined;
function isFunction(item) {
    return item instanceof Function;
}
exports.isFunction = isFunction;
function drop(arr, howMuch) {
    if (howMuch === void 0) { howMuch = 1; }
    return arr.slice(howMuch, arr.length);
}
exports.drop = drop;
function dropRight(arr, howMuch) {
    if (howMuch === void 0) { howMuch = 1; }
    return arr.slice(0, arr.length - howMuch);
}
exports.dropRight = dropRight;
function filter(arr, predicate) {
    var result = [];
    if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (predicate.call(null, item)) {
                result.push(item);
            }
        }
    }
    return result;
}
exports.filter = filter;
function reject(arr, predicate) {
    return filter(arr, function (item) { return !predicate(item); });
}
exports.reject = reject;
function pick(obj, predicate) {
    var keys = Object.keys(obj);
    var result = {};
    for (var i = 0; i < keys.length; i++) {
        var currKey = keys[i];
        var currItem = obj[currKey];
        if (predicate(currItem)) {
            result[currKey] = currItem;
        }
    }
    return result;
}
exports.pick = pick;
function has(obj, prop) {
    if (isObject(obj)) {
        return obj.hasOwnProperty(prop);
    }
    return false;
}
exports.has = has;
function contains(arr, item) {
    return find(arr, function (currItem) { return currItem === item; }) !== undefined ? true : false;
}
exports.contains = contains;
/**
 * shallow clone
 */
function cloneArr(arr) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        newArr.push(arr[i]);
    }
    return newArr;
}
exports.cloneArr = cloneArr;
/**
 * shallow clone
 */
function cloneObj(obj) {
    var clonedObj = {};
    for (var key in obj) {
        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = obj[key];
        }
    }
    return clonedObj;
}
exports.cloneObj = cloneObj;
function find(arr, predicate) {
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (predicate.call(null, item)) {
            return item;
        }
    }
    return undefined;
}
exports.find = find;
function findAll(arr, predicate) {
    var found = [];
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (predicate.call(null, item)) {
            found.push(item);
        }
    }
    return found;
}
exports.findAll = findAll;
function reduce(arrOrObj, iterator, initial) {
    var vals = Array.isArray(arrOrObj)
        ? arrOrObj
        : values(arrOrObj);
    var accumulator = initial;
    for (var i = 0; i < vals.length; i++) {
        accumulator = iterator.call(null, accumulator, vals[i], i);
    }
    return accumulator;
}
exports.reduce = reduce;
function compact(arr) {
    return reject(arr, function (item) { return item === null || item === undefined; });
}
exports.compact = compact;
function uniq(arr, identity) {
    if (identity === void 0) { identity = function (item) { return item; }; }
    var identities = [];
    return reduce(arr, function (result, currItem) {
        var currIdentity = identity(currItem);
        if (contains(identities, currIdentity)) {
            return result;
        }
        else {
            identities.push(currIdentity);
            return result.concat(currItem);
        }
    }, []);
}
exports.uniq = uniq;
function partial(func) {
    var restArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        restArgs[_i - 1] = arguments[_i];
    }
    var firstArg = [null];
    var allArgs = firstArg.concat(restArgs);
    return Function.bind.apply(func, allArgs);
}
exports.partial = partial;
function isArray(obj) {
    return Array.isArray(obj);
}
exports.isArray = isArray;
function isRegExp(obj) {
    return obj instanceof RegExp;
}
exports.isRegExp = isRegExp;
function isObject(obj) {
    return obj instanceof Object;
}
exports.isObject = isObject;
function every(arr, predicate) {
    for (var i = 0; i < arr.length; i++) {
        if (!predicate(arr[i], i)) {
            return false;
        }
    }
    return true;
}
exports.every = every;
function difference(arr, values) {
    return reject(arr, function (item) { return contains(values, item); });
}
exports.difference = difference;
function some(arr, predicate) {
    for (var i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) {
            return true;
        }
    }
    return false;
}
exports.some = some;
function indexOf(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            return i;
        }
    }
    return -1;
}
exports.indexOf = indexOf;
function sortBy(arr, orderFunc) {
    var result = cloneArr(arr);
    result.sort(function (a, b) { return orderFunc(a) - orderFunc(b); });
    return result;
}
exports.sortBy = sortBy;
function zipObject(keys, values) {
    if (keys.length !== values.length) {
        throw Error("can't zipObject with different number of keys and values!");
    }
    var result = {};
    for (var i = 0; i < keys.length; i++) {
        result[keys[i]] = values[i];
    }
    return result;
}
exports.zipObject = zipObject;
/**
 * mutates! (and returns) target
 */
function assign(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var i = 0; i < sources.length; i++) {
        var curSource = sources[i];
        var currSourceKeys = keys(curSource);
        for (var j = 0; j < currSourceKeys.length; j++) {
            var currKey = currSourceKeys[j];
            target[currKey] = curSource[currKey];
        }
    }
    return target;
}
exports.assign = assign;
/**
 * mutates! (and returns) target
 */
function assignNoOverwrite(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var i = 0; i < sources.length; i++) {
        var curSource = sources[i];
        if (isUndefined(curSource)) {
            continue;
        }
        var currSourceKeys = keys(curSource);
        for (var j = 0; j < currSourceKeys.length; j++) {
            var currKey = currSourceKeys[j];
            if (!has(target, currKey)) {
                target[currKey] = curSource[currKey];
            }
        }
    }
    return target;
}
exports.assignNoOverwrite = assignNoOverwrite;
exports.defaults = partial(assignNoOverwrite, {});
function groupBy(arr, groupKeyFunc) {
    var result = {};
    forEach(arr, function (item) {
        var currGroupKey = groupKeyFunc(item);
        var currGroupArr = result[currGroupKey];
        if (currGroupArr) {
            currGroupArr.push(item);
        }
        else {
            result[currGroupKey] = [item];
        }
    });
    return result;
}
exports.groupBy = groupBy;
/**
 * Merge obj2 into obj1.
 * Will overwrite existing properties with the same name
 */
function merge(obj1, obj2) {
    var result = cloneObj(obj1);
    var keys2 = keys(obj2);
    for (var i = 0; i < keys2.length; i++) {
        var key = keys2[i];
        var value = obj2[key];
        result[key] = value;
    }
    return result;
}
exports.merge = merge;
function NOOP() { }
exports.NOOP = NOOP;
function IDENTITY(item) {
    return item;
}
exports.IDENTITY = IDENTITY;
function getSuperClass(clazz) {
    return Object.getPrototypeOf(clazz.prototype).constructor;
}
exports.getSuperClass = getSuperClass;
//# sourceMappingURL=utils.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(0);
var tokens_public_1 = __webpack_require__(2);
var gast;
(function (gast) {
    var AbstractProduction = /** @class */ (function () {
        function AbstractProduction(definition) {
            this.definition = definition;
        }
        AbstractProduction.prototype.accept = function (visitor) {
            visitor.visit(this);
            utils_1.forEach(this.definition, function (prod) {
                prod.accept(visitor);
            });
        };
        return AbstractProduction;
    }());
    gast.AbstractProduction = AbstractProduction;
    var NonTerminal = /** @class */ (function (_super) {
        __extends(NonTerminal, _super);
        function NonTerminal(nonTerminalName, referencedRule, occurrenceInParent, implicitOccurrenceIndex) {
            if (referencedRule === void 0) { referencedRule = undefined; }
            if (occurrenceInParent === void 0) { occurrenceInParent = 1; }
            if (implicitOccurrenceIndex === void 0) { implicitOccurrenceIndex = false; }
            var _this = _super.call(this, []) || this;
            _this.nonTerminalName = nonTerminalName;
            _this.referencedRule = referencedRule;
            _this.occurrenceInParent = occurrenceInParent;
            _this.implicitOccurrenceIndex = implicitOccurrenceIndex;
            return _this;
        }
        Object.defineProperty(NonTerminal.prototype, "definition", {
            get: function () {
                if (this.referencedRule !== undefined) {
                    return this.referencedRule.definition;
                }
                return [];
            },
            set: function (definition) {
                // immutable
            },
            enumerable: true,
            configurable: true
        });
        NonTerminal.prototype.accept = function (visitor) {
            visitor.visit(this);
            // don't visit children of a reference, we will get cyclic infinite loops if we do so
        };
        return NonTerminal;
    }(AbstractProduction));
    gast.NonTerminal = NonTerminal;
    var Rule = /** @class */ (function (_super) {
        __extends(Rule, _super);
        function Rule(name, definition, orgText) {
            if (orgText === void 0) { orgText = ""; }
            var _this = _super.call(this, definition) || this;
            _this.name = name;
            _this.orgText = orgText;
            return _this;
        }
        return Rule;
    }(AbstractProduction));
    gast.Rule = Rule;
    var Flat = /** @class */ (function (_super) {
        __extends(Flat, _super);
        // A named Flat production is used to indicate a Nested Rule in an alternation
        function Flat(definition, name) {
            var _this = _super.call(this, definition) || this;
            _this.name = name;
            return _this;
        }
        return Flat;
    }(AbstractProduction));
    gast.Flat = Flat;
    var Option = /** @class */ (function (_super) {
        __extends(Option, _super);
        function Option(definition, occurrenceInParent, name, implicitOccurrenceIndex) {
            if (occurrenceInParent === void 0) { occurrenceInParent = 1; }
            if (implicitOccurrenceIndex === void 0) { implicitOccurrenceIndex = false; }
            var _this = _super.call(this, definition) || this;
            _this.occurrenceInParent = occurrenceInParent;
            _this.name = name;
            _this.implicitOccurrenceIndex = implicitOccurrenceIndex;
            return _this;
        }
        return Option;
    }(AbstractProduction));
    gast.Option = Option;
    var RepetitionMandatory = /** @class */ (function (_super) {
        __extends(RepetitionMandatory, _super);
        function RepetitionMandatory(definition, occurrenceInParent, name, implicitOccurrenceIndex) {
            if (occurrenceInParent === void 0) { occurrenceInParent = 1; }
            if (implicitOccurrenceIndex === void 0) { implicitOccurrenceIndex = false; }
            var _this = _super.call(this, definition) || this;
            _this.occurrenceInParent = occurrenceInParent;
            _this.name = name;
            _this.implicitOccurrenceIndex = implicitOccurrenceIndex;
            return _this;
        }
        return RepetitionMandatory;
    }(AbstractProduction));
    gast.RepetitionMandatory = RepetitionMandatory;
    var RepetitionMandatoryWithSeparator = /** @class */ (function (_super) {
        __extends(RepetitionMandatoryWithSeparator, _super);
        function RepetitionMandatoryWithSeparator(definition, separator, occurrenceInParent, name, implicitOccurrenceIndex) {
            if (occurrenceInParent === void 0) { occurrenceInParent = 1; }
            if (implicitOccurrenceIndex === void 0) { implicitOccurrenceIndex = false; }
            var _this = _super.call(this, definition) || this;
            _this.separator = separator;
            _this.occurrenceInParent = occurrenceInParent;
            _this.name = name;
            _this.implicitOccurrenceIndex = implicitOccurrenceIndex;
            return _this;
        }
        return RepetitionMandatoryWithSeparator;
    }(AbstractProduction));
    gast.RepetitionMandatoryWithSeparator = RepetitionMandatoryWithSeparator;
    var Repetition = /** @class */ (function (_super) {
        __extends(Repetition, _super);
        function Repetition(definition, occurrenceInParent, name, implicitOccurrenceIndex) {
            if (occurrenceInParent === void 0) { occurrenceInParent = 1; }
            if (implicitOccurrenceIndex === void 0) { implicitOccurrenceIndex = false; }
            var _this = _super.call(this, definition) || this;
            _this.occurrenceInParent = occurrenceInParent;
            _this.name = name;
            _this.implicitOccurrenceIndex = implicitOccurrenceIndex;
            return _this;
        }
        return Repetition;
    }(AbstractProduction));
    gast.Repetition = Repetition;
    var RepetitionWithSeparator = /** @class */ (function (_super) {
        __extends(RepetitionWithSeparator, _super);
        function RepetitionWithSeparator(definition, separator, occurrenceInParent, name, implicitOccurrenceIndex) {
            if (occurrenceInParent === void 0) { occurrenceInParent = 1; }
            if (implicitOccurrenceIndex === void 0) { implicitOccurrenceIndex = false; }
            var _this = _super.call(this, definition) || this;
            _this.separator = separator;
            _this.occurrenceInParent = occurrenceInParent;
            _this.name = name;
            _this.implicitOccurrenceIndex = implicitOccurrenceIndex;
            return _this;
        }
        return RepetitionWithSeparator;
    }(AbstractProduction));
    gast.RepetitionWithSeparator = RepetitionWithSeparator;
    var Alternation = /** @class */ (function (_super) {
        __extends(Alternation, _super);
        function Alternation(definition, occurrenceInParent, name, implicitOccurrenceIndex) {
            if (occurrenceInParent === void 0) { occurrenceInParent = 1; }
            if (implicitOccurrenceIndex === void 0) { implicitOccurrenceIndex = false; }
            var _this = _super.call(this, definition) || this;
            _this.occurrenceInParent = occurrenceInParent;
            _this.name = name;
            _this.implicitOccurrenceIndex = implicitOccurrenceIndex;
            return _this;
        }
        return Alternation;
    }(AbstractProduction));
    gast.Alternation = Alternation;
    var Terminal = /** @class */ (function () {
        function Terminal(terminalType, occurrenceInParent, implicitOccurrenceIndex) {
            if (occurrenceInParent === void 0) { occurrenceInParent = 1; }
            if (implicitOccurrenceIndex === void 0) { implicitOccurrenceIndex = false; }
            this.terminalType = terminalType;
            this.occurrenceInParent = occurrenceInParent;
            this.implicitOccurrenceIndex = implicitOccurrenceIndex;
        }
        Terminal.prototype.accept = function (visitor) {
            visitor.visit(this);
        };
        return Terminal;
    }());
    gast.Terminal = Terminal;
    var GAstVisitor = /** @class */ (function () {
        function GAstVisitor() {
        }
        GAstVisitor.prototype.visit = function (node) {
            if (node instanceof NonTerminal) {
                return this.visitNonTerminal(node);
            }
            else if (node instanceof Flat) {
                return this.visitFlat(node);
            }
            else if (node instanceof Option) {
                return this.visitOption(node);
            }
            else if (node instanceof RepetitionMandatory) {
                return this.visitRepetitionMandatory(node);
            }
            else if (node instanceof RepetitionMandatoryWithSeparator) {
                return this.visitRepetitionMandatoryWithSeparator(node);
            }
            else if (node instanceof RepetitionWithSeparator) {
                return this.visitRepetitionWithSeparator(node);
            }
            else if (node instanceof Repetition) {
                return this.visitRepetition(node);
            }
            else if (node instanceof Alternation) {
                return this.visitAlternation(node);
            }
            else if (node instanceof Terminal) {
                return this.visitTerminal(node);
            }
            else if (node instanceof Rule) {
                return this.visitRule(node);
            }
            else {
                /* istanbul ignore next */
                throw Error("non exhaustive match");
            }
        };
        GAstVisitor.prototype.visitNonTerminal = function (node) { };
        GAstVisitor.prototype.visitFlat = function (node) { };
        GAstVisitor.prototype.visitOption = function (node) { };
        GAstVisitor.prototype.visitRepetition = function (node) { };
        GAstVisitor.prototype.visitRepetitionMandatory = function (node) { };
        GAstVisitor.prototype.visitRepetitionMandatoryWithSeparator = function (node) { };
        GAstVisitor.prototype.visitRepetitionWithSeparator = function (node) { };
        GAstVisitor.prototype.visitAlternation = function (node) { };
        GAstVisitor.prototype.visitTerminal = function (node) { };
        GAstVisitor.prototype.visitRule = function (node) { };
        return GAstVisitor;
    }());
    gast.GAstVisitor = GAstVisitor;
    function serializeGrammar(topRules) {
        return utils_1.map(topRules, serializeProduction);
    }
    gast.serializeGrammar = serializeGrammar;
    function serializeProduction(node) {
        function convertDefinition(definition) {
            return utils_1.map(definition, serializeProduction);
        }
        if (node instanceof NonTerminal) {
            return {
                type: "NonTerminal",
                name: node.nonTerminalName,
                occurrenceInParent: node.occurrenceInParent
            };
        }
        else if (node instanceof Flat) {
            return {
                type: "Flat",
                definition: convertDefinition(node.definition)
            };
        }
        else if (node instanceof Option) {
            return {
                type: "Option",
                definition: convertDefinition(node.definition)
            };
        }
        else if (node instanceof RepetitionMandatory) {
            return {
                type: "RepetitionMandatory",
                definition: convertDefinition(node.definition)
            };
        }
        else if (node instanceof RepetitionMandatoryWithSeparator) {
            return {
                type: "RepetitionMandatoryWithSeparator",
                separator: serializeProduction(new Terminal(node.separator)),
                definition: convertDefinition(node.definition)
            };
        }
        else if (node instanceof RepetitionWithSeparator) {
            return {
                type: "RepetitionWithSeparator",
                separator: serializeProduction(new Terminal(node.separator)),
                definition: convertDefinition(node.definition)
            };
        }
        else if (node instanceof Repetition) {
            return {
                type: "Repetition",
                definition: convertDefinition(node.definition)
            };
        }
        else if (node instanceof Alternation) {
            return {
                type: "Alternation",
                definition: convertDefinition(node.definition)
            };
        }
        else if (node instanceof Terminal) {
            var serializedTerminal = {
                type: "Terminal",
                name: tokens_public_1.tokenName(node.terminalType),
                label: tokens_public_1.tokenLabel(node.terminalType),
                occurrenceInParent: node.occurrenceInParent
            };
            var pattern = node.terminalType.PATTERN;
            if (node.terminalType.PATTERN) {
                serializedTerminal.pattern = utils_1.isRegExp(pattern)
                    ? pattern.source
                    : pattern;
            }
            return serializedTerminal;
        }
        else if (node instanceof Rule) {
            // IGNORE ABOVE ELSE
            return {
                type: "Rule",
                name: node.name,
                definition: convertDefinition(node.definition)
            };
        }
        else {
            /* istanbul ignore next */
            throw Error("non exhaustive match");
        }
    }
    gast.serializeProduction = serializeProduction;
})(gast = exports.gast || (exports.gast = {}));
//# sourceMappingURL=gast_public.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(0);
var lang_extensions_1 = __webpack_require__(3);
var tokens_1 = __webpack_require__(4);
/**
 *  This can be used to improve the quality/readability of error messages or syntax diagrams.
 *
 * @param {Function} clazz - A constructor for a Token subclass
 * @returns {string} - The Human readable label for a Token if it exists.
 */
function tokenLabel(clazz) {
    if (hasTokenLabel(clazz)) {
        return clazz.LABEL;
    }
    else {
        return tokenName(clazz);
    }
}
exports.tokenLabel = tokenLabel;
function hasTokenLabel(clazz) {
    return utils_1.isString(clazz.LABEL) && clazz.LABEL !== "";
}
exports.hasTokenLabel = hasTokenLabel;
function tokenName(clazz) {
    // The tokenName property is needed under some old versions of node.js (0.10/0.12)
    // where the Function.prototype.name property is not defined as a 'configurable' property
    // enable producing readable error messages.
    /* istanbul ignore if -> will only run in old versions of node.js */
    if (utils_1.isObject(clazz) &&
        clazz.hasOwnProperty("tokenName") &&
        utils_1.isString(clazz.tokenName)) {
        return clazz.tokenName;
    }
    else {
        return lang_extensions_1.functionName(clazz);
    }
}
exports.tokenName = tokenName;
var PARENT = "parent";
var LABEL = "label";
var GROUP = "group";
var PUSH_MODE = "push_mode";
var POP_MODE = "pop_mode";
var LONGER_ALT = "longer_alt";
var LINE_BREAKS = "line_breaks";
/**
 * @param {ITokenConfig} config - The configuration for
 * @returns {TokenConstructor} - A constructor for the new Token subclass
 */
function createToken(config) {
    if (!utils_1.has(config, PARENT)) {
        config.parent = Token;
    }
    return createTokenInternal(config);
}
exports.createToken = createToken;
function createTokenInternal(config) {
    var tokenName = config.name;
    var parentConstructor = config.parent;
    var pattern = config.pattern;
    var derivedConstructor = function () {
        parentConstructor.apply(this, arguments);
    };
    // can be overwritten according to:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/
    // name?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FFunction%2Fname
    /* istanbul ignore if -> will only run in old versions of node.js */
    if (!lang_extensions_1.defineNameProp(derivedConstructor, tokenName)) {
        // hack to save the tokenName in situations where the constructor's name property cannot be reconfigured
        derivedConstructor.tokenName = tokenName;
    }
    derivedConstructor.prototype = Object.create(parentConstructor.prototype);
    derivedConstructor.prototype.constructor = derivedConstructor;
    if (!utils_1.isUndefined(pattern)) {
        derivedConstructor.PATTERN = pattern;
    }
    tokens_1.augmentTokenClasses([derivedConstructor]);
    // static properties mixing
    derivedConstructor = utils_1.assignNoOverwrite(derivedConstructor, parentConstructor);
    if (utils_1.has(config, LABEL)) {
        derivedConstructor.LABEL = config[LABEL];
    }
    if (utils_1.has(config, GROUP)) {
        derivedConstructor.GROUP = config[GROUP];
    }
    if (utils_1.has(config, POP_MODE)) {
        derivedConstructor.POP_MODE = config[POP_MODE];
    }
    if (utils_1.has(config, PUSH_MODE)) {
        derivedConstructor.PUSH_MODE = config[PUSH_MODE];
    }
    if (utils_1.has(config, LONGER_ALT)) {
        derivedConstructor.LONGER_ALT = config[LONGER_ALT];
    }
    if (utils_1.has(config, LINE_BREAKS)) {
        derivedConstructor.LINE_BREAKS = config[LINE_BREAKS];
    }
    return derivedConstructor;
}
var Token = /** @class */ (function () {
    /**
     * This class is never meant to be initialized.
     * The class hierarchy is used to organize Token metadata, not to create instances of Tokens.
     * Tokens are simple JavaScript objects which are NOT created using the <new> operator.
     * To get the class of a Token "instance" use <getTokenConstructor>.
     */
    function Token() {
        // this marks if a Token does not really exist and has been inserted "artificially" during parsing in rule error recovery
        this.isInsertedInRecovery = false;
    }
    /**
     * A "human readable" Label for a Token.
     * Subclasses of Token may define their own static LABEL property.
     * This label will be used in error messages and drawing syntax diagrams.
     *
     * For example a Token constructor may be called LCurly, which is short for LeftCurlyBrackets, These names are either too short
     * or too unwieldy to be used in error messages.
     *
     * Imagine : "expecting LCurly but found ')'" or "expecting LeftCurlyBrackets but found ')'"
     *
     * However if a static property LABEL with the value '{' exists on LCurly class, that error message will be:
     * "expecting '{' but found ')'"
     */
    Token.LABEL = undefined;
    return Token;
}());
exports.Token = Token;
var EOF = /** @class */ (function (_super) {
    __extends(EOF, _super);
    function EOF() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EOF;
}(Token));
exports.EOF = EOF;
tokens_1.augmentTokenClasses([EOF]);
/**
 * Utility to create Chevrotain Token "instances"
 * Note that Chevrotain tokens are not real instances, and thus the instanceOf cannot be used.
 *
 * @param tokClass
 * @param image
 * @param startOffset
 * @param endOffset
 * @param startLine
 * @param endLine
 * @param startColumn
 * @param endColumn
 * @returns {{image: string,
 *            startOffset: number,
 *            endOffset: number,
 *            startLine: number,
 *            endLine: number,
 *            startColumn: number,
 *            endColumn: number,
 *            tokenType}}
 */
function createTokenInstance(tokClass, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn) {
    return {
        image: image,
        startOffset: startOffset,
        endOffset: endOffset,
        startLine: startLine,
        endLine: endLine,
        startColumn: startColumn,
        endColumn: endColumn,
        tokenType: tokClass.tokenType
    };
}
exports.createTokenInstance = createTokenInstance;
/**
 * Given a Token instance, will return the Token Constructor.
 * Note that this function is not just for convenience, Because a Token "instance'
 * Does not use standard prototype inheritance and thus it's constructor cannot be accessed
 * by traversing the prototype chain.
 *
 * @param tokenInstance {IToken}
 * @returns {TokenConstructor}
 */
function getTokenConstructor(tokenInstance) {
    var tokenIdx;
    tokenIdx = tokenInstance.tokenType;
    return tokens_1.tokenIdxToClass.get(tokenIdx);
}
exports.getTokenConstructor = getTokenConstructor;
/**
 * A Utility method to check if a token is of the type of the argument Token class.
 * Not that while this utility has similar semantics to ECMAScript "instanceOf"
 * As Chevrotain tokens support inheritance.
 *
 * It is not actually implemented using the "instanceOf" operator because
 * Chevrotain Tokens have their own performance optimized inheritance mechanism.
 *
 * @param tokInstance {IToken}
 * @param tokClass {TokenConstructor}
 * @returns {boolean}
 */
function tokenMatcher(tokInstance, tokClass) {
    return tokens_1.tokenStructuredMatcher(tokInstance, tokClass);
}
exports.tokenMatcher = tokenMatcher;
//# sourceMappingURL=tokens_public.js.map

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utils = __webpack_require__(0);
var utils_1 = __webpack_require__(0);
function classNameFromInstance(instance) {
    return functionName(instance.constructor);
}
exports.classNameFromInstance = classNameFromInstance;
var FUNC_NAME_REGEXP = /^\s*function\s*(\S*)\s*\(/;
var NAME = "name";
/* istanbul ignore next too many hacks for IE/old versions of node.js here*/
function functionName(func) {
    // Engines that support Function.prototype.name OR the nth (n>1) time after
    // the name has been computed in the following else block.
    var existingNameProp = func.name;
    if (existingNameProp) {
        return existingNameProp;
    }
    // hack for IE and engines that do not support Object.defineProperty on function.name (Node.js 0.10 && 0.12)
    var computedName = func.toString().match(FUNC_NAME_REGEXP)[1];
    return computedName;
}
exports.functionName = functionName;
/**
 * @returns {boolean} - has the property been successfully defined
 */
function defineNameProp(obj, nameValue) {
    var namePropDescriptor = Object.getOwnPropertyDescriptor(obj, NAME);
    /* istanbul ignore else -> will only run in old versions of node.js */
    if (utils_1.isUndefined(namePropDescriptor) || namePropDescriptor.configurable) {
        Object.defineProperty(obj, NAME, {
            enumerable: false,
            configurable: true,
            writable: false,
            value: nameValue
        });
        return true;
    }
    /* istanbul ignore next -> will only run in old versions of node.js */
    return false;
}
exports.defineNameProp = defineNameProp;
/**
 * simple Hashtable between a string and some generic value
 * this should be removed once typescript supports ES6 style Hashtable
 */
var HashTable = /** @class */ (function () {
    function HashTable() {
        this._state = {};
    }
    HashTable.prototype.keys = function () {
        return utils.keys(this._state);
    };
    HashTable.prototype.values = function () {
        return utils.values(this._state);
    };
    HashTable.prototype.put = function (key, value) {
        this._state[key] = value;
    };
    HashTable.prototype.putAll = function (other) {
        this._state = utils.assign(this._state, other._state);
    };
    HashTable.prototype.get = function (key) {
        // To avoid edge case with a key called "hasOwnProperty" we need to perform the commented out check below
        // -> if (Object.prototype.hasOwnProperty.call(this._state, key)) { ... } <-
        // however this costs nearly 25% of the parser's runtime.
        // if someone decides to name their Parser class "hasOwnProperty" they deserve what they will get :)
        return this._state[key];
    };
    HashTable.prototype.containsKey = function (key) {
        return utils.has(this._state, key);
    };
    HashTable.prototype.clear = function () {
        this._state = {};
    };
    return HashTable;
}());
exports.HashTable = HashTable;
//# sourceMappingURL=lang_extensions.js.map

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(0);
var tokens_public_1 = __webpack_require__(2);
var lang_extensions_1 = __webpack_require__(3);
function tokenStructuredMatcher(tokInstance, tokConstructor) {
    var instanceType = tokInstance.tokenType;
    if (instanceType === tokConstructor.tokenType) {
        return true;
    }
    else {
        return (tokConstructor.isParent === true &&
            tokConstructor.extendingTokenTypesMap[instanceType] === true);
    }
}
exports.tokenStructuredMatcher = tokenStructuredMatcher;
// Optimized tokenMatcher in case our grammar does not use token inheritance
// Being so tiny it is much more likely to be in-lined and this avoid the function call overhead
function tokenStructuredMatcherNoInheritance(tokInstance, tokConstructor) {
    return tokInstance.tokenType === tokConstructor.tokenType;
}
exports.tokenStructuredMatcherNoInheritance = tokenStructuredMatcherNoInheritance;
function isBaseTokenOrObject(tokClass) {
    return isBaseTokenClass(tokClass) || tokClass === Object;
}
exports.isBaseTokenOrObject = isBaseTokenOrObject;
function isBaseTokenClass(tokClass) {
    return tokClass === tokens_public_1.Token;
}
exports.isBaseTokenClass = isBaseTokenClass;
exports.tokenShortNameIdx = 1;
exports.tokenIdxToClass = new lang_extensions_1.HashTable();
function augmentTokenClasses(tokenClasses) {
    // 1. collect the parent Token classes as well.
    var tokenClassesAndParents = expandTokenHierarchy(tokenClasses);
    // 2. add required tokenType and extendingTokenTypes properties
    assignTokenDefaultProps(tokenClassesAndParents);
    // 3. fill up the extendingTokenTypes
    assignExtendingTokensProp(tokenClassesAndParents);
    assignExtendingTokensMapProp(tokenClassesAndParents);
    utils_1.forEach(tokenClassesAndParents, function (tokClass) {
        tokClass.isParent = tokClass.extendingTokenTypes.length > 0;
    });
}
exports.augmentTokenClasses = augmentTokenClasses;
function expandTokenHierarchy(tokenClasses) {
    var tokenClassesAndParents = utils_1.cloneArr(tokenClasses);
    utils_1.forEach(tokenClasses, function (currTokClass) {
        var currParentClass = utils_1.getSuperClass(currTokClass);
        while (!isBaseTokenOrObject(currParentClass)) {
            if (!utils_1.contains(tokenClassesAndParents, currParentClass)) {
                tokenClassesAndParents.push(currParentClass);
            }
            currParentClass = utils_1.getSuperClass(currParentClass);
        }
    });
    return tokenClassesAndParents;
}
exports.expandTokenHierarchy = expandTokenHierarchy;
function assignTokenDefaultProps(tokenClasses) {
    utils_1.forEach(tokenClasses, function (currTokClass) {
        if (!hasShortKeyProperty(currTokClass)) {
            exports.tokenIdxToClass.put(exports.tokenShortNameIdx, currTokClass);
            currTokClass.tokenType = exports.tokenShortNameIdx++;
        }
        if (!hasExtendingTokensTypesProperty(currTokClass)) {
            currTokClass.extendingTokenTypes = [];
        }
        if (!hasExtendingTokensTypesMapProperty(currTokClass)) {
            currTokClass.extendingTokenTypesMap = {};
        }
        if (!hasTokenNameProperty(currTokClass)) {
            // saved for fast access during CST building.
            currTokClass.tokenName = tokens_public_1.tokenName(currTokClass);
        }
    });
}
exports.assignTokenDefaultProps = assignTokenDefaultProps;
function assignExtendingTokensProp(tokenClasses) {
    utils_1.forEach(tokenClasses, function (currTokClass) {
        var currSubClassesExtendingTypes = [currTokClass.tokenType];
        var currParentClass = utils_1.getSuperClass(currTokClass);
        while (!isBaseTokenClass(currParentClass) &&
            currParentClass !== Object) {
            var newExtendingTypes = utils_1.difference(currSubClassesExtendingTypes, currParentClass.extendingTokenTypes);
            currParentClass.extendingTokenTypes = currParentClass.extendingTokenTypes.concat(newExtendingTypes);
            currSubClassesExtendingTypes.push(currParentClass.tokenType);
            currParentClass = utils_1.getSuperClass(currParentClass);
        }
    });
}
exports.assignExtendingTokensProp = assignExtendingTokensProp;
function assignExtendingTokensMapProp(tokenClasses) {
    utils_1.forEach(tokenClasses, function (currTokClass) {
        utils_1.forEach(currTokClass.extendingTokenTypes, function (currExtendingType) {
            currTokClass.extendingTokenTypesMap[currExtendingType] = true;
        });
    });
}
exports.assignExtendingTokensMapProp = assignExtendingTokensMapProp;
function hasShortKeyProperty(tokClass) {
    return utils_1.has(tokClass, "tokenType");
}
exports.hasShortKeyProperty = hasShortKeyProperty;
function hasExtendingTokensTypesProperty(tokClass) {
    return utils_1.has(tokClass, "extendingTokenTypes");
}
exports.hasExtendingTokensTypesProperty = hasExtendingTokensTypesProperty;
function hasExtendingTokensTypesMapProperty(tokClass) {
    return utils_1.has(tokClass, "extendingTokenTypesMap");
}
exports.hasExtendingTokensTypesMapProperty = hasExtendingTokensTypesMapProperty;
function hasTokenNameProperty(tokClass) {
    return utils_1.has(tokClass, "tokenName");
}
exports.hasTokenNameProperty = hasTokenNameProperty;
function isExtendingTokenType(tokType) {
    return tokens_public_1.Token.prototype.isPrototypeOf(tokType.prototype);
}
exports.isExtendingTokenType = isExtendingTokenType;
//# sourceMappingURL=tokens.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var cache = __webpack_require__(6);
var cache_1 = __webpack_require__(6);
var exceptions_public_1 = __webpack_require__(12);
var lang_extensions_1 = __webpack_require__(3);
var resolver_1 = __webpack_require__(21);
var checks_1 = __webpack_require__(13);
var utils_1 = __webpack_require__(0);
var follow_1 = __webpack_require__(22);
var tokens_public_1 = __webpack_require__(2);
var lookahead_1 = __webpack_require__(14);
var gast_builder_1 = __webpack_require__(23);
var interpreter_1 = __webpack_require__(9);
var constants_1 = __webpack_require__(17);
var gast_public_1 = __webpack_require__(1);
var gast_1 = __webpack_require__(7);
var tokens_1 = __webpack_require__(4);
var cst_1 = __webpack_require__(15);
var keys_1 = __webpack_require__(16);
var cst_visitor_1 = __webpack_require__(25);
var errors_public_1 = __webpack_require__(18);
var serializeGrammar = gast_public_1.gast.serializeGrammar;
var ParserDefinitionErrorType;
(function (ParserDefinitionErrorType) {
    ParserDefinitionErrorType[ParserDefinitionErrorType["INVALID_RULE_NAME"] = 0] = "INVALID_RULE_NAME";
    ParserDefinitionErrorType[ParserDefinitionErrorType["DUPLICATE_RULE_NAME"] = 1] = "DUPLICATE_RULE_NAME";
    ParserDefinitionErrorType[ParserDefinitionErrorType["INVALID_RULE_OVERRIDE"] = 2] = "INVALID_RULE_OVERRIDE";
    ParserDefinitionErrorType[ParserDefinitionErrorType["DUPLICATE_PRODUCTIONS"] = 3] = "DUPLICATE_PRODUCTIONS";
    ParserDefinitionErrorType[ParserDefinitionErrorType["UNRESOLVED_SUBRULE_REF"] = 4] = "UNRESOLVED_SUBRULE_REF";
    ParserDefinitionErrorType[ParserDefinitionErrorType["LEFT_RECURSION"] = 5] = "LEFT_RECURSION";
    ParserDefinitionErrorType[ParserDefinitionErrorType["NONE_LAST_EMPTY_ALT"] = 6] = "NONE_LAST_EMPTY_ALT";
    ParserDefinitionErrorType[ParserDefinitionErrorType["AMBIGUOUS_ALTS"] = 7] = "AMBIGUOUS_ALTS";
    ParserDefinitionErrorType[ParserDefinitionErrorType["CONFLICT_TOKENS_RULES_NAMESPACE"] = 8] = "CONFLICT_TOKENS_RULES_NAMESPACE";
    ParserDefinitionErrorType[ParserDefinitionErrorType["INVALID_TOKEN_NAME"] = 9] = "INVALID_TOKEN_NAME";
    ParserDefinitionErrorType[ParserDefinitionErrorType["INVALID_NESTED_RULE_NAME"] = 10] = "INVALID_NESTED_RULE_NAME";
    ParserDefinitionErrorType[ParserDefinitionErrorType["DUPLICATE_NESTED_NAME"] = 11] = "DUPLICATE_NESTED_NAME";
    ParserDefinitionErrorType[ParserDefinitionErrorType["NO_NON_EMPTY_LOOKAHEAD"] = 12] = "NO_NON_EMPTY_LOOKAHEAD";
    ParserDefinitionErrorType[ParserDefinitionErrorType["AMBIGUOUS_PREFIX_ALTS"] = 13] = "AMBIGUOUS_PREFIX_ALTS";
})(ParserDefinitionErrorType = exports.ParserDefinitionErrorType || (exports.ParserDefinitionErrorType = {}));
var IN_RULE_RECOVERY_EXCEPTION = "InRuleRecoveryException";
exports.END_OF_FILE = tokens_public_1.createTokenInstance(tokens_public_1.EOF, "", NaN, NaN, NaN, NaN, NaN, NaN);
Object.freeze(exports.END_OF_FILE);
var DEFAULT_PARSER_CONFIG = Object.freeze({
    recoveryEnabled: false,
    maxLookahead: 4,
    ignoredIssues: {},
    dynamicTokensEnabled: false,
    // TODO: Document this breaking change, can it be mitigated?
    // TODO: change to true
    outputCst: false,
    errorMessageProvider: errors_public_1.defaultErrorProvider
});
var DEFAULT_RULE_CONFIG = Object.freeze({
    recoveryValueFunc: function () { return undefined; },
    resyncEnabled: true
});
/**
 * Convenience used to express an empty alternative in an OR (alternation).
 * can be used to more clearly describe the intent in a case of empty alternation.
 *
 * For example:
 *
 * 1. without using EMPTY_ALT:
 *
 *    this.OR([
 *      {ALT: () => {
 *        this.CONSUME1(OneTok)
 *        return "1"
 *      }},
 *      {ALT: () => {
 *        this.CONSUME1(TwoTok)
 *        return "2"
 *      }},
 *      {ALT: () => { // implicitly empty because there are no invoked grammar rules (OR/MANY/CONSUME...) inside this alternative.
 *        return "666"
 *      }},
 *    ])
 *
 *
 * 2. using EMPTY_ALT:
 *
 *    this.OR([
 *      {ALT: () => {
 *        this.CONSUME1(OneTok)
 *        return "1"
 *      }},
 *      {ALT: () => {
 *        this.CONSUME1(TwoTok)
 *        return "2"
 *      }},
 *      {ALT: EMPTY_ALT("666")}, // explicitly empty, clearer intent
 *    ])
 *
 */
function EMPTY_ALT(value) {
    if (value === void 0) { value = undefined; }
    return function () {
        return value;
    };
}
exports.EMPTY_ALT = EMPTY_ALT;
var EOF_FOLLOW_KEY = {};
/**
 * A Recognizer capable of self analysis to determine it's grammar structure
 * This is used for more advanced features requiring such information.
 * For example: Error Recovery, Automatic lookahead calculation.
 */
var Parser = /** @class */ (function () {
    function Parser(input, tokensDictionary, config) {
        if (config === void 0) { config = DEFAULT_PARSER_CONFIG; }
        this._errors = [];
        this.isBackTrackingStack = [];
        this.RULE_STACK = [];
        this.RULE_OCCURRENCE_STACK = [];
        this.CST_STACK = [];
        this.tokensMap = undefined;
        this.definedRulesNames = [];
        this.shortRuleNameToFull = new lang_extensions_1.HashTable();
        this.fullRuleNameToShort = new lang_extensions_1.HashTable();
        // The shortName Index must be coded "after" the first 8bits to enable building unique lookahead keys
        this.ruleShortNameIdx = 256;
        this.LAST_EXPLICIT_RULE_STACK = [];
        this.selfAnalysisDone = false;
        this.currIdx = -1;
        /**
         * Only used internally for storing productions as they are built for the first time.
         * The final productions should be accessed from the static cache.
         */
        this._productions = new lang_extensions_1.HashTable();
        this.input = input;
        // configuration
        this.recoveryEnabled = utils_1.has(config, "recoveryEnabled")
            ? config.recoveryEnabled
            : DEFAULT_PARSER_CONFIG.recoveryEnabled;
        // performance optimization, NOOP will be inlined which
        // effectively means that this optional feature does not exist
        // when not used.
        if (!this.recoveryEnabled) {
            this.attemptInRepetitionRecovery = utils_1.NOOP;
        }
        this.dynamicTokensEnabled = utils_1.has(config, "dynamicTokensEnabled")
            ? config.dynamicTokensEnabled
            : DEFAULT_PARSER_CONFIG.dynamicTokensEnabled;
        this.maxLookahead = utils_1.has(config, "maxLookahead")
            ? config.maxLookahead
            : DEFAULT_PARSER_CONFIG.maxLookahead;
        this.ignoredIssues = utils_1.has(config, "ignoredIssues")
            ? config.ignoredIssues
            : DEFAULT_PARSER_CONFIG.ignoredIssues;
        this.outputCst = utils_1.has(config, "outputCst")
            ? config.outputCst
            : DEFAULT_PARSER_CONFIG.outputCst;
        this.errorMessageProvider = utils_1.defaults(config.errorMessageProvider, DEFAULT_PARSER_CONFIG.errorMessageProvider);
        if (!this.outputCst) {
            this.cstInvocationStateUpdate = utils_1.NOOP;
            this.cstFinallyStateUpdate = utils_1.NOOP;
            this.cstPostTerminal = utils_1.NOOP;
            this.cstPostNonTerminal = utils_1.NOOP;
            this.getLastExplicitRuleShortName = this.getLastExplicitRuleShortNameNoCst;
            this.getPreviousExplicitRuleShortName = this.getPreviousExplicitRuleShortNameNoCst;
            this.getPreviousExplicitRuleOccurenceIndex = this.getPreviousExplicitRuleOccurenceIndexNoCst;
            this.manyInternal = this.manyInternalNoCst;
            this.orInternal = this.orInternalNoCst;
            this.optionInternal = this.optionInternalNoCst;
            this.atLeastOneInternal = this.atLeastOneInternalNoCst;
            this.manySepFirstInternal = this.manySepFirstInternalNoCst;
            this.atLeastOneSepFirstInternal = this.atLeastOneSepFirstInternalNoCst;
        }
        this.className = lang_extensions_1.classNameFromInstance(this);
        this.firstAfterRepMap = cache.getFirstAfterRepForClass(this.className);
        this.classLAFuncs = cache.getLookaheadFuncsForClass(this.className);
        this.cstDictDefForRule = cache.getCstDictDefPerRuleForClass(this.className);
        if (!cache.CLASS_TO_DEFINITION_ERRORS.containsKey(this.className)) {
            this.definitionErrors = [];
            cache.CLASS_TO_DEFINITION_ERRORS.put(this.className, this.definitionErrors);
        }
        else {
            this.definitionErrors = cache.CLASS_TO_DEFINITION_ERRORS.get(this.className);
        }
        if (utils_1.isArray(tokensDictionary)) {
            this.tokensMap = utils_1.reduce(tokensDictionary, function (acc, tokenClazz) {
                acc[tokens_public_1.tokenName(tokenClazz)] = tokenClazz;
                return acc;
            }, {});
        }
        else if (utils_1.has(tokensDictionary, "modes") &&
            utils_1.every(utils_1.flatten(utils_1.values(tokensDictionary.modes)), tokens_1.isExtendingTokenType)) {
            var allTokenTypes = utils_1.flatten(utils_1.values(tokensDictionary.modes));
            var uniqueTokens = utils_1.uniq(allTokenTypes);
            this.tokensMap = utils_1.reduce(uniqueTokens, function (acc, tokenClazz) {
                acc[tokens_public_1.tokenName(tokenClazz)] = tokenClazz;
                return acc;
            }, {});
        }
        else if (utils_1.isObject(tokensDictionary)) {
            this.tokensMap = utils_1.cloneObj(tokensDictionary);
        }
        else {
            throw new Error("<tokensDictionary> argument must be An Array of Token constructors" +
                " A dictionary of Token constructors or an IMultiModeLexerDefinition");
        }
        var noTokenInheritanceUsed = utils_1.every(utils_1.values(tokensDictionary), function (tokenConstructor) { return utils_1.isEmpty(tokenConstructor.extendingTokenTypes); });
        this.tokenMatcher = noTokenInheritanceUsed
            ? tokens_1.tokenStructuredMatcherNoInheritance
            : tokens_1.tokenStructuredMatcher;
        // always add EOF to the tokenNames -> constructors map. it is useful to assure all the input has been
        // parsed with a clear error message ("expecting EOF but found ...")
        /* tslint:disable */
        this.tokensMap["EOF"] = tokens_public_1.EOF;
        /* tslint:enable */
        // Because ES2015+ syntax should be supported for creating Token classes
        // We cannot assume that the Token classes were created using the "extendToken" utilities
        // Therefore we must augment the Token classes both on Lexer initialization and on Parser initialization
        tokens_1.augmentTokenClasses(utils_1.values(this.tokensMap));
    }
    Parser.performSelfAnalysis = function (parserInstance) {
        var definitionErrors = [];
        var defErrorsMsgs;
        parserInstance.selfAnalysisDone = true;
        var className = lang_extensions_1.classNameFromInstance(parserInstance);
        // can't test this with nyc tool, instrumentation causes the class name to be not empty.
        /* istanbul ignore if */
        if (className === "") {
            // just a simple "throw Error" without any fancy "definition error" because the logic below relies on a unique parser name to
            // save/access those definition errors...
            /* istanbul ignore next */
            throw Error("A Parser's constructor may not be an anonymous Function, it must be a named function\n" +
                "The constructor's name is used at runtime for performance (caching) purposes.");
        }
        // this information should only be computed once
        if (!cache.CLASS_TO_SELF_ANALYSIS_DONE.containsKey(className)) {
            cache.CLASS_TO_SELF_ANALYSIS_DONE.put(className, true);
            var orgProductions_1 = parserInstance._productions;
            var clonedProductions_1 = new lang_extensions_1.HashTable();
            // clone the grammar productions to support grammar inheritance. requirements:
            // 1. We want to avoid rebuilding the grammar every time so a cache for the productions is used.
            // 2. We need to collect the production from multiple grammars in an inheritance scenario during constructor invocation
            //    so the myGast variable is used.
            // 3. If a Production has been overridden references to it in the GAST must also be updated.
            utils_1.forEach(orgProductions_1.keys(), function (key) {
                var value = orgProductions_1.get(key);
                clonedProductions_1.put(key, gast_1.cloneProduction(value));
            });
            cache.getProductionsForClass(className).putAll(clonedProductions_1);
            // assumes this cache has been initialized (in the relevant parser's constructor)
            // TODO: consider making the self analysis a member method to resolve this.
            // that way it won't be callable before the constructor has been invoked...
            definitionErrors = cache.CLASS_TO_DEFINITION_ERRORS.get(className);
            var resolverErrors = resolver_1.resolveGrammar(clonedProductions_1);
            definitionErrors.push.apply(definitionErrors, resolverErrors); // mutability for the win?
            // only perform additional grammar validations IFF no resolving errors have occurred.
            // as unresolved grammar may lead to unhandled runtime exceptions in the follow up validations.
            if (utils_1.isEmpty(resolverErrors)) {
                var validationErrors = checks_1.validateGrammar(clonedProductions_1.values(), parserInstance.maxLookahead, utils_1.values(parserInstance.tokensMap), parserInstance.ignoredIssues);
                definitionErrors.push.apply(definitionErrors, validationErrors); // mutability for the win?
            }
            if (!utils_1.isEmpty(definitionErrors) &&
                !Parser.DEFER_DEFINITION_ERRORS_HANDLING) {
                defErrorsMsgs = utils_1.map(definitionErrors, function (defError) { return defError.message; });
                throw new Error("Parser Definition Errors detected\n: " + defErrorsMsgs.join("\n-------------------------------\n"));
            }
            if (utils_1.isEmpty(definitionErrors)) {
                // this analysis may fail if the grammar is not perfectly valid
                var allFollows = follow_1.computeAllProdsFollows(clonedProductions_1.values());
                cache.setResyncFollowsForClass(className, allFollows);
            }
            var cstAnalysisResult = cst_1.analyzeCst(clonedProductions_1.values(), parserInstance.fullRuleNameToShort);
            cache
                .getCstDictDefPerRuleForClass(className)
                .putAll(cstAnalysisResult.dictDef);
            cache.CLASS_TO_ALL_RULE_NAMES.put(className, cstAnalysisResult.allRuleNames);
        }
        // reThrow the validation errors each time an erroneous parser is instantiated
        if (!utils_1.isEmpty(cache.CLASS_TO_DEFINITION_ERRORS.get(className)) &&
            !Parser.DEFER_DEFINITION_ERRORS_HANDLING) {
            defErrorsMsgs = utils_1.map(cache.CLASS_TO_DEFINITION_ERRORS.get(className), function (defError) { return defError.message; });
            throw new Error("Parser Definition Errors detected\n: " + defErrorsMsgs.join("\n-------------------------------\n"));
        }
    };
    Object.defineProperty(Parser.prototype, "errors", {
        get: function () {
            return utils_1.cloneArr(this._errors);
        },
        set: function (newErrors) {
            this._errors = newErrors;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Resets the parser state, should be overridden for custom parsers which "carry" additional state.
     * When overriding, remember to also invoke the super implementation!
     */
    Parser.prototype.reset = function () {
        this.resetLexerState();
        this.isBackTrackingStack = [];
        this.errors = [];
        this.RULE_STACK = [];
        this.LAST_EXPLICIT_RULE_STACK = [];
        this.CST_STACK = [];
        this.RULE_OCCURRENCE_STACK = [];
    };
    Parser.prototype.isAtEndOfInput = function () {
        return this.tokenMatcher(this.LA(1), tokens_public_1.EOF);
    };
    Parser.prototype.getBaseCstVisitorConstructor = function () {
        var cachedConstructor = cache_1.CLASS_TO_BASE_CST_VISITOR.get(this.className);
        if (utils_1.isUndefined(cachedConstructor)) {
            var allRuleNames = cache_1.CLASS_TO_ALL_RULE_NAMES.get(this.className);
            cachedConstructor = cst_visitor_1.createBaseSemanticVisitorConstructor(this.className, allRuleNames);
            cache_1.CLASS_TO_BASE_CST_VISITOR.put(this.className, cachedConstructor);
        }
        return cachedConstructor;
    };
    Parser.prototype.getBaseCstVisitorConstructorWithDefaults = function () {
        var cachedConstructor = cache_1.CLASS_TO_BASE_CST_VISITOR_WITH_DEFAULTS.get(this.className);
        if (utils_1.isUndefined(cachedConstructor)) {
            var allRuleNames = cache_1.CLASS_TO_ALL_RULE_NAMES.get(this.className);
            var baseConstructor = this.getBaseCstVisitorConstructor();
            cachedConstructor = cst_visitor_1.createBaseVisitorConstructorWithDefaults(this.className, allRuleNames, baseConstructor);
            cache_1.CLASS_TO_BASE_CST_VISITOR_WITH_DEFAULTS.put(this.className, cachedConstructor);
        }
        return cachedConstructor;
    };
    Parser.prototype.getGAstProductions = function () {
        return cache.getProductionsForClass(this.className);
    };
    // This is more than a convenience method.
    // It is mostly used to draw the diagrams and having this method present on the parser instance
    // can avoid certain situations in which the serialization logic would fail due to multiple versions of chevrotain
    // bundled (due to multiple prototype chains and "instanceof" usage).
    Parser.prototype.getSerializedGastProductions = function () {
        return serializeGrammar(cache.getProductionsForClass(this.className).values());
    };
    /**
     * @param startRuleName {string}
     * @param precedingInput {IToken[]} - The token vector up to (not including) the content assist point
     * @returns {ISyntacticContentAssistPath[]}
     */
    Parser.prototype.computeContentAssist = function (startRuleName, precedingInput) {
        var startRuleGast = cache
            .getProductionsForClass(this.className)
            .get(startRuleName);
        if (utils_1.isUndefined(startRuleGast)) {
            throw Error("Rule ->" + startRuleName + "<- does not exist in this grammar.");
        }
        return interpreter_1.nextPossibleTokensAfter([startRuleGast], precedingInput, this.tokenMatcher, this.maxLookahead);
    };
    Parser.prototype.isBackTracking = function () {
        return !utils_1.isEmpty(this.isBackTrackingStack);
    };
    Parser.prototype.getCurrRuleFullName = function () {
        var shortName = this.getLastExplicitRuleShortName();
        return this.shortRuleNameToFull.get(shortName);
    };
    Parser.prototype.shortRuleNameToFullName = function (shortName) {
        return this.shortRuleNameToFull.get(shortName);
    };
    Parser.prototype.getHumanReadableRuleStack = function () {
        var _this = this;
        if (!utils_1.isEmpty(this.LAST_EXPLICIT_RULE_STACK)) {
            return utils_1.map(this.LAST_EXPLICIT_RULE_STACK, function (currIdx) {
                return _this.shortRuleNameToFullName(_this.RULE_STACK[currIdx]);
            });
        }
        else {
            return utils_1.map(this.RULE_STACK, function (currShortName) {
                return _this.shortRuleNameToFullName(currShortName);
            });
        }
    };
    Parser.prototype.SAVE_ERROR = function (error) {
        if (exceptions_public_1.exceptions.isRecognitionException(error)) {
            error.context = {
                ruleStack: this.getHumanReadableRuleStack(),
                ruleOccurrenceStack: utils_1.cloneArr(this.RULE_OCCURRENCE_STACK)
            };
            this._errors.push(error);
            return error;
        }
        else {
            throw Error("Trying to save an Error which is not a RecognitionException");
        }
    };
    /**
     * @param grammarRule - The rule to try and parse in backtracking mode.
     * @param isValid - A predicate that given the result of the parse attempt will "decide" if the parse was successfully or not.
     *
     * @return {Function():boolean} a lookahead function that will try to parse the given grammarRule and will return true if succeed.
     */
    Parser.prototype.BACKTRACK = function (grammarRule, isValid) {
        return function () {
            // save org state
            this.isBackTrackingStack.push(1);
            var orgState = this.saveRecogState();
            try {
                var ruleResult = grammarRule.call(this);
                return isValid(ruleResult);
            }
            catch (e) {
                if (exceptions_public_1.exceptions.isRecognitionException(e)) {
                    return false;
                }
                else {
                    throw e;
                }
            }
            finally {
                this.reloadRecogState(orgState);
                this.isBackTrackingStack.pop();
            }
        };
    };
    // Parsing DSL
    /**
     * Convenience method equivalent to CONSUME1.
     * @see CONSUME1
     */
    Parser.prototype.CONSUME = function (tokClass) {
        return this.CONSUME1(tokClass);
    };
    /**
     *
     * A Parsing DSL method use to consume a single terminal Token.
     * a Token will be consumed, IFF the next token in the token vector is an instanceof tokClass.
     * otherwise the parser will attempt to perform error recovery.
     *
     * The index in the method name indicates the unique occurrence of a terminal consumption
     * inside a the top level rule. What this means is that if a terminal appears
     * more than once in a single rule, each appearance must have a difference index.
     *
     * for example:
     *
     * function parseQualifiedName() {
     *    this.CONSUME1(Identifier);
     *    this.MANY(()=> {
     *       this.CONSUME1(Dot);
     *       this.CONSUME2(Identifier); // <-- here we use CONSUME2 because the terminal
     *    });                           //     'Identifier' has already appeared previously in the
     *                                  //     the rule 'parseQualifiedName'
     * }
     *
     * @param {Function} tokClass - A constructor function specifying the type of token to be consumed.
     *
     * @returns {Token} - The consumed token.
     */
    Parser.prototype.CONSUME1 = function (tokClass) {
        return this.consumeInternal(tokClass, 1);
    };
    /**
     * @see CONSUME1
     */
    Parser.prototype.CONSUME2 = function (tokClass) {
        return this.consumeInternal(tokClass, 2);
    };
    /**
     * @see CONSUME1
     */
    Parser.prototype.CONSUME3 = function (tokClass) {
        return this.consumeInternal(tokClass, 3);
    };
    /**
     * @see CONSUME1
     */
    Parser.prototype.CONSUME4 = function (tokClass) {
        return this.consumeInternal(tokClass, 4);
    };
    /**
     * @see CONSUME1
     */
    Parser.prototype.CONSUME5 = function (tokClass) {
        return this.consumeInternal(tokClass, 5);
    };
    /**
     * Convenience method equivalent to SUBRULE1
     * @see SUBRULE1
     */
    Parser.prototype.SUBRULE = function (ruleToCall, args) {
        if (args === void 0) { args = undefined; }
        return this.subruleInternal(ruleToCall, 1, args);
    };
    /**
     * The Parsing DSL Method is used by one rule to call another.
     *
     * This may seem redundant as it does not actually do much.
     * However using it is mandatory for all sub rule invocations.
     * calling another rule without wrapping in SUBRULE(...)
     * will cause errors/mistakes in the Recognizer's self analysis,
     * which will lead to errors in error recovery/automatic lookahead calculation
     * and any other functionality relying on the Recognizer's self analysis
     * output.
     *
     * As in CONSUME the index in the method name indicates the occurrence
     * of the sub rule invocation in its rule.
     *
     * @param {Function} ruleToCall - The rule to invoke.
     * @param {*[]} args - The arguments to pass to the invoked subrule.
     * @returns {*} - The result of invoking ruleToCall.
     */
    Parser.prototype.SUBRULE1 = function (ruleToCall, args) {
        if (args === void 0) { args = undefined; }
        return this.subruleInternal(ruleToCall, 1, args);
    };
    /**
     * @see SUBRULE1
     */
    Parser.prototype.SUBRULE2 = function (ruleToCall, args) {
        if (args === void 0) { args = undefined; }
        return this.subruleInternal(ruleToCall, 2, args);
    };
    /**
     * @see SUBRULE1
     */
    Parser.prototype.SUBRULE3 = function (ruleToCall, args) {
        if (args === void 0) { args = undefined; }
        return this.subruleInternal(ruleToCall, 3, args);
    };
    /**
     * @see SUBRULE1
     */
    Parser.prototype.SUBRULE4 = function (ruleToCall, args) {
        if (args === void 0) { args = undefined; }
        return this.subruleInternal(ruleToCall, 4, args);
    };
    /**
     * @see SUBRULE1
     */
    Parser.prototype.SUBRULE5 = function (ruleToCall, args) {
        if (args === void 0) { args = undefined; }
        return this.subruleInternal(ruleToCall, 5, args);
    };
    /**
     * Convenience method equivalent to OPTION1.
     * @see OPTION1
     */
    Parser.prototype.OPTION = function (actionORMethodDef) {
        return this.OPTION1(actionORMethodDef);
    };
    /**
     * Parsing DSL Method that Indicates an Optional production
     * in EBNF notation: [...].
     *
     * Note that there are two syntax forms:
     * - Passing the grammar action directly:
     *      this.OPTION(()=> {
     *        this.CONSUME(Digit)}
     *      );
     *
     * - using an "options" object:
     *      this.OPTION({
     *        GATE:predicateFunc,
     *        DEF: ()=>{
     *          this.CONSUME(Digit)
     *        }});
     *
     * The optional 'GATE' property in "options" object form can be used to add constraints
     * to invoking the grammar action.
     *
     * As in CONSUME the index in the method name indicates the occurrence
     * of the optional production in it's top rule.
     *
     * @param  actionORMethodDef - The grammar action to optionally invoke once
     *                             or an "OPTIONS" object describing the grammar action and optional properties.
     *
     * @returns {OUT}
     */
    Parser.prototype.OPTION1 = function (actionORMethodDef) {
        return this.optionInternal(actionORMethodDef, 1);
    };
    /**
     * @see OPTION1
     */
    Parser.prototype.OPTION2 = function (actionORMethodDef) {
        return this.optionInternal(actionORMethodDef, 2);
    };
    /**
     * @see OPTION1
     */
    Parser.prototype.OPTION3 = function (actionORMethodDef) {
        return this.optionInternal(actionORMethodDef, 3);
    };
    /**
     * @see OPTION1
     */
    Parser.prototype.OPTION4 = function (actionORMethodDef) {
        return this.optionInternal(actionORMethodDef, 4);
    };
    /**
     * @see OPTION1
     */
    Parser.prototype.OPTION5 = function (actionORMethodDef) {
        return this.optionInternal(actionORMethodDef, 5);
    };
    /**
     * Convenience method equivalent to OR1.
     * @see OR1
     */
    Parser.prototype.OR = function (altsOrOpts) {
        return this.OR1(altsOrOpts);
    };
    /**
     * Parsing DSL method that indicates a choice between a set of alternatives must be made.
     * This is equivalent to EBNF alternation (A | B | C | D ...)
     *
     * There are a couple of syntax forms for the inner alternatives array.
     *
     * Passing alternatives array directly:
     *        this.OR([
     *           {ALT:()=>{this.CONSUME(One)}},
     *           {ALT:()=>{this.CONSUME(Two)}},
     *           {ALT:()=>{this.CONSUME(Three)}}
     *        ])
     *
     * Passing alternative array directly with predicates (GATE).
     *        this.OR([
     *           {GATE: predicateFunc1, ALT:()=>{this.CONSUME(One)}},
     *           {GATE: predicateFuncX, ALT:()=>{this.CONSUME(Two)}},
     *           {GATE: predicateFuncX, ALT:()=>{this.CONSUME(Three)}}
     *        ])
     *
     * These syntax forms can also be mixed:
     *        this.OR([
     *           {GATE: predicateFunc1, ALT:()=>{this.CONSUME(One)}},
     *           {ALT:()=>{this.CONSUME(Two)}},
     *           {ALT:()=>{this.CONSUME(Three)}}
     *        ])
     *
     * Additionally an "options" object may be used:
     * this.OR({
     *          DEF:[
     *            {ALT:()=>{this.CONSUME(One)}},
     *            {ALT:()=>{this.CONSUME(Two)}},
     *            {ALT:()=>{this.CONSUME(Three)}}
     *          ],
     *          // OPTIONAL property
     *          ERR_MSG: "A Number"
     *        })
     *
     * The 'predicateFuncX' in the long form can be used to add constraints to choosing the alternative.
     *
     * As in CONSUME the index in the method name indicates the occurrence
     * of the alternation production in it's top rule.
     *
     * @param altsOrOpts - A set of alternatives or an "OPTIONS" object describing the alternatives and optional properties.
     *
     * @returns {*} - The result of invoking the chosen alternative.
     */
    Parser.prototype.OR1 = function (altsOrOpts) {
        return this.orInternal(altsOrOpts, 1);
    };
    /**
     * @see OR1
     */
    Parser.prototype.OR2 = function (altsOrOpts) {
        return this.orInternal(altsOrOpts, 2);
    };
    /**
     * @see OR1
     */
    Parser.prototype.OR3 = function (altsOrOpts) {
        return this.orInternal(altsOrOpts, 3);
    };
    /**
     * @see OR1
     */
    Parser.prototype.OR4 = function (altsOrOpts) {
        return this.orInternal(altsOrOpts, 4);
    };
    /**
     * @see OR1
     */
    Parser.prototype.OR5 = function (altsOrOpts) {
        return this.orInternal(altsOrOpts, 5);
    };
    /**
     * Convenience method equivalent to MANY1.
     * @see MANY1
     */
    Parser.prototype.MANY = function (actionORMethodDef) {
        return this.MANY1(actionORMethodDef);
    };
    /**
     * Parsing DSL method, that indicates a repetition of zero or more.
     * This is equivalent to EBNF repetition {...}.
     *
     * Note that there are two syntax forms:
     * - Passing the grammar action directly:
     *        this.MANY(()=>{
     *                        this.CONSUME(Comma)
     *                        this.CONSUME(Digit)
     *                      })
     *
     * - using an "options" object:
     *        this.MANY({
     *                   GATE: predicateFunc,
     *                   DEF: () => {
     *                          this.CONSUME(Comma)
     *                          this.CONSUME(Digit)
     *                        }
     *                 });
     *
     * The optional 'GATE' property in "options" object form can be used to add constraints
     * to invoking the grammar action.
     *
     * As in CONSUME the index in the method name indicates the occurrence
     * of the repetition production in it's top rule.
     *
     * @param {Function} actionORMethodDef - The grammar action to optionally invoke multiple times
     *                             or an "OPTIONS" object describing the grammar action and optional properties.
     *
     * @returns {OUT[]}
     */
    Parser.prototype.MANY1 = function (actionORMethodDef) {
        return this.manyInternal(1, actionORMethodDef, []);
    };
    /**
     * @see MANY1
     */
    Parser.prototype.MANY2 = function (actionORMethodDef) {
        return this.manyInternal(2, actionORMethodDef, []);
    };
    /**
     * @see MANY1
     */
    Parser.prototype.MANY3 = function (actionORMethodDef) {
        return this.manyInternal(3, actionORMethodDef, []);
    };
    /**
     * @see MANY1
     */
    Parser.prototype.MANY4 = function (actionORMethodDef) {
        return this.manyInternal(4, actionORMethodDef, []);
    };
    /**
     * @see MANY1
     */
    Parser.prototype.MANY5 = function (actionORMethodDef) {
        return this.manyInternal(5, actionORMethodDef, []);
    };
    /**
     * Convenience method equivalent to MANY_SEP1.
     * @see MANY_SEP1
     */
    Parser.prototype.MANY_SEP = function (options) {
        return this.MANY_SEP1(options);
    };
    /**
     * Parsing DSL method, that indicates a repetition of zero or more with a separator
     * Token between the repetitions.
     *
     * Example:
     *
     * this.MANY_SEP({
     *                  SEP:Comma,
     *                  DEF: () => {
     *                         this.CONSUME(Number};
     *                         ...
     *                       );
     *              })
     *
     * Note that because this DSL method always requires more than one argument the options object is always required
     * and it is not possible to use a shorter form like in the MANY DSL method.
     *
     * Note that for the purposes of deciding on whether or not another iteration exists
     * Only a single Token is examined (The separator). Therefore if the grammar being implemented is
     * so "crazy" to require multiple tokens to identify an item separator please use the more basic DSL methods
     * to implement it.
     *
     * As in CONSUME the index in the method name indicates the occurrence
     * of the repetition production in it's top rule.
     *
     * Note that due to current limitations in the implementation the "SEP" property must appear BEFORE the "DEF" property.
     *
     * @param options - An object defining the grammar of each iteration and the separator between iterations
     *
     * @return {ISeparatedIterationResult<OUT>}
     */
    Parser.prototype.MANY_SEP1 = function (options) {
        return this.manySepFirstInternal(1, options, {
            values: [],
            separators: []
        });
    };
    /**
     * @see MANY_SEP1
     */
    Parser.prototype.MANY_SEP2 = function (options) {
        return this.manySepFirstInternal(2, options, {
            values: [],
            separators: []
        });
    };
    /**
     * @see MANY_SEP1
     */
    Parser.prototype.MANY_SEP3 = function (options) {
        return this.manySepFirstInternal(3, options, {
            values: [],
            separators: []
        });
    };
    /**
     * @see MANY_SEP1
     */
    Parser.prototype.MANY_SEP4 = function (options) {
        return this.manySepFirstInternal(4, options, {
            values: [],
            separators: []
        });
    };
    /**
     * @see MANY_SEP1
     */
    Parser.prototype.MANY_SEP5 = function (options) {
        return this.manySepFirstInternal(5, options, {
            values: [],
            separators: []
        });
    };
    /**
     * Convenience method equivalent to AT_LEAST_ONE1.
     * @see AT_LEAST_ONE1
     */
    Parser.prototype.AT_LEAST_ONE = function (actionORMethodDef) {
        return this.AT_LEAST_ONE1(actionORMethodDef);
    };
    /**
     * Convenience method, same as MANY but the repetition is of one or more.
     * failing to match at least one repetition will result in a parsing error and
     * cause a parsing error.
     *
     * @see MANY1
     *
     * @param actionORMethodDef  - The grammar action to optionally invoke multiple times
     *                             or an "OPTIONS" object describing the grammar action and optional properties.
     *
     * @return {OUT[]}
     */
    Parser.prototype.AT_LEAST_ONE1 = function (actionORMethodDef) {
        return this.atLeastOneInternal(1, actionORMethodDef, []);
    };
    /**
     * @see AT_LEAST_ONE1
     */
    Parser.prototype.AT_LEAST_ONE2 = function (actionORMethodDef) {
        return this.atLeastOneInternal(2, actionORMethodDef, []);
    };
    /**
     * @see AT_LEAST_ONE1
     */
    Parser.prototype.AT_LEAST_ONE3 = function (actionORMethodDef) {
        return this.atLeastOneInternal(3, actionORMethodDef, []);
    };
    /**
     * @see AT_LEAST_ONE1
     */
    Parser.prototype.AT_LEAST_ONE4 = function (actionORMethodDef) {
        return this.atLeastOneInternal(4, actionORMethodDef, []);
    };
    /**
     * @see AT_LEAST_ONE1
     */
    Parser.prototype.AT_LEAST_ONE5 = function (actionORMethodDef) {
        return this.atLeastOneInternal(5, actionORMethodDef, []);
    };
    /**
     * Convenience method equivalent to AT_LEAST_ONE_SEP1.
     * @see AT_LEAST_ONE1
     */
    Parser.prototype.AT_LEAST_ONE_SEP = function (options) {
        return this.AT_LEAST_ONE_SEP1(options);
    };
    /**
     * Convenience method, same as MANY_SEP but the repetition is of one or more.
     * failing to match at least one repetition will result in a parsing error and
     * cause the parser to attempt error recovery.
     *
     * Note that an additional optional property ERR_MSG can be used to provide custom error messages.
     *
     * @see MANY_SEP1
     *
     * @param options - An object defining the grammar of each iteration and the separator between iterations
     *
     * @return {ISeparatedIterationResult<OUT>}
     */
    Parser.prototype.AT_LEAST_ONE_SEP1 = function (options) {
        return this.atLeastOneSepFirstInternal(1, options, {
            values: [],
            separators: []
        });
    };
    /**
     * @see AT_LEAST_ONE_SEP1
     */
    Parser.prototype.AT_LEAST_ONE_SEP2 = function (options) {
        return this.atLeastOneSepFirstInternal(2, options, {
            values: [],
            separators: []
        });
    };
    /**
     * @see AT_LEAST_ONE_SEP1
     */
    Parser.prototype.AT_LEAST_ONE_SEP3 = function (options) {
        return this.atLeastOneSepFirstInternal(3, options, {
            values: [],
            separators: []
        });
    };
    /**
     * @see AT_LEAST_ONE_SEP1
     */
    Parser.prototype.AT_LEAST_ONE_SEP4 = function (options) {
        return this.atLeastOneSepFirstInternal(4, options, {
            values: [],
            separators: []
        });
    };
    /**
     * @see AT_LEAST_ONE_SEP1
     */
    Parser.prototype.AT_LEAST_ONE_SEP5 = function (options) {
        return this.atLeastOneSepFirstInternal(5, options, {
            values: [],
            separators: []
        });
    };
    /**
     *
     * @param {string} name - The name of the rule.
     * @param {Function} implementation - The implementation of the rule.
     * @param {IRuleConfig} [config] - The rule's optional configuration.
     *
     * @returns {Function} - The parsing rule which is the production implementation wrapped with the parsing logic that handles
     *                     Parser state / error recovery&reporting/ ...
     */
    Parser.prototype.RULE = function (name, implementation, 
        // TODO: how to describe the optional return type of CSTNode? T|CstNode is not good because it is not backward
        // compatible, T|any is very general...
        config) {
        // TODO: how to describe the optional return type of CSTNode? T|CstNode is not good because it is not backward
        // compatible, T|any is very general...
        if (config === void 0) { config = DEFAULT_RULE_CONFIG; }
        var ruleErrors = checks_1.validateRuleName(name);
        ruleErrors = ruleErrors.concat(checks_1.validateRuleDoesNotAlreadyExist(name, this.definedRulesNames, this.className));
        this.definedRulesNames.push(name);
        this.definitionErrors.push.apply(this.definitionErrors, ruleErrors); // mutability for the win
        // only build the gast representation once.
        if (!this._productions.containsKey(name)) {
            var gastProduction = gast_builder_1.buildTopProduction(implementation.toString(), name, this.tokensMap);
            this._productions.put(name, gastProduction);
        }
        else {
            var parserClassProductions = cache.getProductionsForClass(this.className);
            var cachedProduction = parserClassProductions.get(name);
            // in case of duplicate rules the cache will not be filled at this point.
            if (!utils_1.isUndefined(cachedProduction)) {
                // filling up the _productions is always needed to inheriting grammars can access it (as an instance member)
                // otherwise they will be unaware of productions defined in super grammars.
                this._productions.put(name, cachedProduction);
            }
        }
        var ruleImplementation = this.defineRule(name, implementation, config);
        this[name] = ruleImplementation;
        return ruleImplementation;
    };
    /**
     * @See RULE
     * Same as RULE, but should only be used in "extending" grammars to override rules/productions
     * from the super grammar.
     */
    Parser.prototype.OVERRIDE_RULE = function (name, impl, config) {
        if (config === void 0) { config = DEFAULT_RULE_CONFIG; }
        var ruleErrors = checks_1.validateRuleName(name);
        ruleErrors = ruleErrors.concat(checks_1.validateRuleIsOverridden(name, this.definedRulesNames, this.className));
        this.definitionErrors.push.apply(this.definitionErrors, ruleErrors); // mutability for the win
        var alreadyOverridden = cache.getProductionOverriddenForClass(this.className);
        // only build the GAST of an overridden rule once.
        if (!alreadyOverridden.containsKey(name)) {
            alreadyOverridden.put(name, true);
            var gastProduction = gast_builder_1.buildTopProduction(impl.toString(), name, this.tokensMap);
            this._productions.put(name, gastProduction);
        }
        else {
            var parserClassProductions = cache.getProductionsForClass(this.className);
            // filling up the _productions is always needed to inheriting grammars can access it (as an instance member)
            // otherwise they will be unaware of productions defined in super grammars.
            this._productions.put(name, parserClassProductions.get(name));
        }
        return this.defineRule(name, impl, config);
    };
    Parser.prototype.ruleInvocationStateUpdate = function (shortName, fullName, idxInCallingRule) {
        this.RULE_OCCURRENCE_STACK.push(idxInCallingRule);
        this.RULE_STACK.push(shortName);
        // NOOP when cst is disabled
        this.cstInvocationStateUpdate(fullName, shortName);
    };
    Parser.prototype.ruleFinallyStateUpdate = function () {
        this.RULE_STACK.pop();
        this.RULE_OCCURRENCE_STACK.pop();
        // NOOP when cst is disabled
        this.cstFinallyStateUpdate();
        if (this.RULE_STACK.length === 0 && !this.isAtEndOfInput()) {
            var firstRedundantTok = this.LA(1);
            var errMsg = this.errorMessageProvider.buildNotAllInputParsedMessage({
                firstRedundant: firstRedundantTok,
                ruleName: this.getCurrRuleFullName()
            });
            this.SAVE_ERROR(new exceptions_public_1.exceptions.NotAllInputParsedException(errMsg, firstRedundantTok));
        }
    };
    Parser.prototype.nestedRuleInvocationStateUpdate = function (nestedRuleName, shortNameKey) {
        this.RULE_OCCURRENCE_STACK.push(1);
        this.RULE_STACK.push(shortNameKey);
        this.cstNestedInvocationStateUpdate(nestedRuleName, shortNameKey);
    };
    Parser.prototype.nestedRuleFinallyStateUpdate = function () {
        this.RULE_STACK.pop();
        this.RULE_OCCURRENCE_STACK.pop();
        // NOOP when cst is disabled
        this.cstNestedFinallyStateUpdate();
    };
    /**
     * Returns an "imaginary" Token to insert when Single Token Insertion is done
     * Override this if you require special behavior in your grammar.
     * For example if an IntegerToken is required provide one with the image '0' so it would be valid syntactically.
     */
    Parser.prototype.getTokenToInsert = function (tokClass) {
        var tokToInsert = tokens_public_1.createTokenInstance(tokClass, "", NaN, NaN, NaN, NaN, NaN, NaN);
        tokToInsert.isInsertedInRecovery = true;
        return tokToInsert;
    };
    /**
     * By default all tokens type may be inserted. This behavior may be overridden in inheriting Recognizers
     * for example: One may decide that only punctuation tokens may be inserted automatically as they have no additional
     * semantic value. (A mandatory semicolon has no additional semantic meaning, but an Integer may have additional meaning
     * depending on its int value and context (Inserting an integer 0 in cardinality: "[1..]" will cause semantic issues
     * as the max of the cardinality will be greater than the min value (and this is a false error!).
     */
    Parser.prototype.canTokenTypeBeInsertedInRecovery = function (tokClass) {
        return true;
    };
    Parser.prototype.getCurrentGrammarPath = function (tokClass, tokIdxInRule) {
        var pathRuleStack = this.getHumanReadableRuleStack();
        var pathOccurrenceStack = utils_1.cloneArr(this.RULE_OCCURRENCE_STACK);
        var grammarPath = {
            ruleStack: pathRuleStack,
            occurrenceStack: pathOccurrenceStack,
            lastTok: tokClass,
            lastTokOccurrence: tokIdxInRule
        };
        return grammarPath;
    };
    // TODO: should this be a member method or a utility? it does not have any state or usage of 'this'...
    // TODO: should this be more explicitly part of the public API?
    Parser.prototype.getNextPossibleTokenTypes = function (grammarPath) {
        var topRuleName = utils_1.first(grammarPath.ruleStack);
        var gastProductions = this.getGAstProductions();
        var topProduction = gastProductions.get(topRuleName);
        var nextPossibleTokenTypes = new interpreter_1.NextAfterTokenWalker(topProduction, grammarPath).startWalking();
        return nextPossibleTokenTypes;
    };
    Parser.prototype.subruleInternal = function (ruleToCall, idx, args) {
        var ruleResult = ruleToCall.call(this, idx, args);
        this.cstPostNonTerminal(ruleResult, ruleToCall.ruleName);
        return ruleResult;
    };
    /**
     * @param tokClass - The Type of Token we wish to consume (Reference to its constructor function).
     * @param idx - Occurrence index of consumed token in the invoking parser rule text
     *         for example:
     *         IDENT (DOT IDENT)*
     *         the first ident will have idx 1 and the second one idx 2
     *         * note that for the second ident the idx is always 2 even if its invoked 30 times in the same rule
     *           the idx is about the position in grammar (source code) and has nothing to do with a specific invocation
     *           details.
     *
     * @returns {Token} - The consumed Token.
     */
    Parser.prototype.consumeInternal = function (tokClass, idx) {
        var consumedToken;
        try {
            var nextToken = this.LA(1);
            if (this.tokenMatcher(nextToken, tokClass) === true) {
                this.consumeToken();
                consumedToken = nextToken;
            }
            else {
                var msg = this.errorMessageProvider.buildMismatchTokenMessage({
                    expected: tokClass,
                    actual: nextToken,
                    ruleName: this.getCurrRuleFullName()
                });
                throw this.SAVE_ERROR(new exceptions_public_1.exceptions.MismatchedTokenException(msg, nextToken));
            }
        }
        catch (eFromConsumption) {
            // no recovery allowed during backtracking, otherwise backtracking may recover invalid syntax and accept it
            // but the original syntax could have been parsed successfully without any backtracking + recovery
            if (this.recoveryEnabled &&
                // TODO: more robust checking of the exception type. Perhaps Typescript extending expressions?
                eFromConsumption.name === "MismatchedTokenException" &&
                !this.isBackTracking()) {
                var follows = this.getFollowsForInRuleRecovery(tokClass, idx);
                try {
                    consumedToken = this.tryInRuleRecovery(tokClass, follows);
                }
                catch (eFromInRuleRecovery) {
                    if (eFromInRuleRecovery.name === IN_RULE_RECOVERY_EXCEPTION) {
                        // failed in RuleRecovery.
                        // throw the original error in order to trigger reSync error recovery
                        throw eFromConsumption;
                    }
                    else {
                        throw eFromInRuleRecovery;
                    }
                }
            }
            else {
                throw eFromConsumption;
            }
        }
        this.cstPostTerminal(tokClass, consumedToken);
        return consumedToken;
    };
    // other functionality
    Parser.prototype.saveRecogState = function () {
        // errors is a getter which will clone the errors array
        var savedErrors = this.errors;
        var savedRuleStack = utils_1.cloneArr(this.RULE_STACK);
        return {
            errors: savedErrors,
            lexerState: this.exportLexerState(),
            RULE_STACK: savedRuleStack,
            CST_STACK: this.CST_STACK,
            LAST_EXPLICIT_RULE_STACK: this.LAST_EXPLICIT_RULE_STACK
        };
    };
    Parser.prototype.reloadRecogState = function (newState) {
        this.errors = newState.errors;
        this.importLexerState(newState.lexerState);
        this.RULE_STACK = newState.RULE_STACK;
    };
    Parser.prototype.defineRule = function (ruleName, impl, config) {
        if (this.selfAnalysisDone) {
            throw Error("Grammar rule <" + ruleName + "> may not be defined after the 'performSelfAnalysis' method has been called'\n" +
                "Make sure that all grammar rule definitions are done before 'performSelfAnalysis' is called.");
        }
        var resyncEnabled = utils_1.has(config, "resyncEnabled")
            ? config.resyncEnabled
            : DEFAULT_RULE_CONFIG.resyncEnabled;
        var recoveryValueFunc = utils_1.has(config, "recoveryValueFunc")
            ? config.recoveryValueFunc
            : DEFAULT_RULE_CONFIG.recoveryValueFunc;
        // performance optimization: Use small integers as keys for the longer human readable "full" rule names.
        // this greatly improves Map access time (as much as 8% for some performance benchmarks).
        /* tslint:disable */
        var shortName = this.ruleShortNameIdx <<
            (keys_1.BITS_FOR_METHOD_IDX + keys_1.BITS_FOR_OCCURRENCE_IDX);
        /* tslint:enable */
        this.ruleShortNameIdx++;
        this.shortRuleNameToFull.put(shortName, ruleName);
        this.fullRuleNameToShort.put(ruleName, shortName);
        function invokeRuleWithTry(args) {
            try {
                // TODO: dynamically get rid of this?
                if (this.outputCst === true) {
                    impl.apply(this, args);
                    return this.CST_STACK[this.CST_STACK.length - 1];
                }
                else {
                    return impl.apply(this, args);
                }
            }
            catch (e) {
                var isFirstInvokedRule = this.RULE_STACK.length === 1;
                // note the reSync is always enabled for the first rule invocation, because we must always be able to
                // reSync with EOF and just output some INVALID ParseTree
                // during backtracking reSync recovery is disabled, otherwise we can't be certain the backtracking
                // path is really the most valid one
                var reSyncEnabled = resyncEnabled &&
                    !this.isBackTracking() &&
                    this.recoveryEnabled;
                if (exceptions_public_1.exceptions.isRecognitionException(e)) {
                    if (reSyncEnabled) {
                        var reSyncTokType = this.findReSyncTokenType();
                        if (this.isInCurrentRuleReSyncSet(reSyncTokType)) {
                            e.resyncedTokens = this.reSyncTo(reSyncTokType);
                            if (this.outputCst) {
                                var partialCstResult = this.CST_STACK[this.CST_STACK.length - 1];
                                partialCstResult.recoveredNode = true;
                                return partialCstResult;
                            }
                            else {
                                return recoveryValueFunc();
                            }
                        }
                        else {
                            if (this.outputCst) {
                                // recovery is only for "real" non nested rules
                                var prevRuleShortName = this.getLastExplicitRuleShortNameNoCst();
                                var preRuleFullName = this.shortRuleNameToFull.get(prevRuleShortName);
                                var partialCstResult = this.CST_STACK[this.CST_STACK.length - 1];
                                partialCstResult.recoveredNode = true;
                                this.cstPostNonTerminalRecovery(partialCstResult, preRuleFullName);
                            }
                            // to be handled farther up the call stack
                            throw e;
                        }
                    }
                    else if (isFirstInvokedRule) {
                        // otherwise a Redundant input error will be created as well and we cannot guarantee that this is indeed the case
                        this.moveToTerminatedState();
                        // the parser should never throw one of its own errors outside its flow.
                        // even if error recovery is disabled
                        return recoveryValueFunc();
                    }
                    else {
                        // to be handled farther up the call stack
                        throw e;
                    }
                }
                else {
                    // some other Error type which we don't know how to handle (for example a built in JavaScript Error)
                    throw e;
                }
            }
            finally {
                this.ruleFinallyStateUpdate();
            }
        }
        var wrappedGrammarRule;
        wrappedGrammarRule = function (idxInCallingRule, args) {
            if (idxInCallingRule === void 0) { idxInCallingRule = 1; }
            this.ruleInvocationStateUpdate(shortName, ruleName, idxInCallingRule);
            return invokeRuleWithTry.call(this, args);
        };
        var ruleNamePropName = "ruleName";
        wrappedGrammarRule[ruleNamePropName] = ruleName;
        return wrappedGrammarRule;
    };
    Parser.prototype.tryInRepetitionRecovery = function (grammarRule, grammarRuleArgs, lookAheadFunc, expectedTokType) {
        var _this = this;
        // TODO: can the resyncTokenType be cached?
        var reSyncTokType = this.findReSyncTokenType();
        var savedLexerState = this.exportLexerState();
        var resyncedTokens = [];
        var passedResyncPoint = false;
        var nextTokenWithoutResync = this.LA(1);
        var currToken = this.LA(1);
        var generateErrorMessage = function () {
            // we are preemptively re-syncing before an error has been detected, therefor we must reproduce
            // the error that would have been thrown
            var msg = _this.errorMessageProvider.buildMismatchTokenMessage({
                expected: expectedTokType,
                actual: nextTokenWithoutResync,
                ruleName: _this.getCurrRuleFullName()
            });
            var error = new exceptions_public_1.exceptions.MismatchedTokenException(msg, nextTokenWithoutResync);
            // the first token here will be the original cause of the error, this is not part of the resyncedTokens property.
            error.resyncedTokens = utils_1.dropRight(resyncedTokens);
            _this.SAVE_ERROR(error);
        };
        while (!passedResyncPoint) {
            // re-synced to a point where we can safely exit the repetition/
            if (this.tokenMatcher(currToken, expectedTokType)) {
                generateErrorMessage();
                return; // must return here to avoid reverting the inputIdx
            }
            else if (lookAheadFunc.call(this)) {
                // we skipped enough tokens so we can resync right back into another iteration of the repetition grammar rule
                generateErrorMessage();
                // recursive invocation in other to support multiple re-syncs in the same top level repetition grammar rule
                grammarRule.apply(this, grammarRuleArgs);
                return; // must return here to avoid reverting the inputIdx
            }
            else if (this.tokenMatcher(currToken, reSyncTokType)) {
                passedResyncPoint = true;
            }
            else {
                currToken = this.SKIP_TOKEN();
                this.addToResyncTokens(currToken, resyncedTokens);
            }
        }
        // we were unable to find a CLOSER point to resync inside the Repetition, reset the state.
        // The parsing exception we were trying to prevent will happen in the NEXT parsing step. it may be handled by
        // "between rules" resync recovery later in the flow.
        this.importLexerState(savedLexerState);
    };
    Parser.prototype.shouldInRepetitionRecoveryBeTried = function (expectTokAfterLastMatch, nextTokIdx) {
        // arguments to try and perform resync into the next iteration of the many are missing
        if (expectTokAfterLastMatch === undefined || nextTokIdx === undefined) {
            return false;
        }
        // no need to recover, next token is what we expect...
        if (this.tokenMatcher(this.LA(1), expectTokAfterLastMatch)) {
            return false;
        }
        // error recovery is disabled during backtracking as it can make the parser ignore a valid grammar path
        // and prefer some backtracking path that includes recovered errors.
        if (this.isBackTracking()) {
            return false;
        }
        // if we can perform inRule recovery (single token insertion or deletion) we always prefer that recovery algorithm
        // because if it works, it makes the least amount of changes to the input stream (greedy algorithm)
        //noinspection RedundantIfStatementJS
        if (this.canPerformInRuleRecovery(expectTokAfterLastMatch, this.getFollowsForInRuleRecovery(expectTokAfterLastMatch, nextTokIdx))) {
            return false;
        }
        return true;
    };
    // Error Recovery functionality
    Parser.prototype.getFollowsForInRuleRecovery = function (tokClass, tokIdxInRule) {
        var grammarPath = this.getCurrentGrammarPath(tokClass, tokIdxInRule);
        var follows = this.getNextPossibleTokenTypes(grammarPath);
        return follows;
    };
    Parser.prototype.tryInRuleRecovery = function (expectedTokType, follows) {
        if (this.canRecoverWithSingleTokenInsertion(expectedTokType, follows)) {
            var tokToInsert = this.getTokenToInsert(expectedTokType);
            return tokToInsert;
        }
        if (this.canRecoverWithSingleTokenDeletion(expectedTokType)) {
            var nextTok = this.SKIP_TOKEN();
            this.consumeToken();
            return nextTok;
        }
        throw new InRuleRecoveryException("sad sad panda");
    };
    Parser.prototype.canPerformInRuleRecovery = function (expectedToken, follows) {
        return (this.canRecoverWithSingleTokenInsertion(expectedToken, follows) ||
            this.canRecoverWithSingleTokenDeletion(expectedToken));
    };
    Parser.prototype.canRecoverWithSingleTokenInsertion = function (expectedTokType, follows) {
        var _this = this;
        if (!this.canTokenTypeBeInsertedInRecovery(expectedTokType)) {
            return false;
        }
        // must know the possible following tokens to perform single token insertion
        if (utils_1.isEmpty(follows)) {
            return false;
        }
        var mismatchedTok = this.LA(1);
        var isMisMatchedTokInFollows = utils_1.find(follows, function (possibleFollowsTokType) {
            return _this.tokenMatcher(mismatchedTok, possibleFollowsTokType);
        }) !== undefined;
        return isMisMatchedTokInFollows;
    };
    Parser.prototype.canRecoverWithSingleTokenDeletion = function (expectedTokType) {
        var isNextTokenWhatIsExpected = this.tokenMatcher(this.LA(2), expectedTokType);
        return isNextTokenWhatIsExpected;
    };
    Parser.prototype.isInCurrentRuleReSyncSet = function (tokenType) {
        var followKey = this.getCurrFollowKey();
        var currentRuleReSyncSet = this.getFollowSetFromFollowKey(followKey);
        return utils_1.contains(currentRuleReSyncSet, tokenType);
    };
    Parser.prototype.findReSyncTokenType = function () {
        var allPossibleReSyncTokTypes = this.flattenFollowSet();
        // this loop will always terminate as EOF is always in the follow stack and also always (virtually) in the input
        var nextToken = this.LA(1);
        var k = 2;
        while (true) {
            var nextTokenType = tokens_public_1.getTokenConstructor(nextToken);
            if (utils_1.contains(allPossibleReSyncTokTypes, nextTokenType)) {
                return nextTokenType;
            }
            nextToken = this.LA(k);
            k++;
        }
    };
    Parser.prototype.getCurrFollowKey = function () {
        // the length is at least one as we always add the ruleName to the stack before invoking the rule.
        if (this.RULE_STACK.length === 1) {
            return EOF_FOLLOW_KEY;
        }
        var currRuleShortName = this.getLastExplicitRuleShortName();
        var prevRuleShortName = this.getPreviousExplicitRuleShortName();
        var prevRuleIdx = this.getPreviousExplicitRuleOccurenceIndex();
        return {
            ruleName: this.shortRuleNameToFullName(currRuleShortName),
            idxInCallingRule: prevRuleIdx,
            inRule: this.shortRuleNameToFullName(prevRuleShortName)
        };
    };
    Parser.prototype.buildFullFollowKeyStack = function () {
        var _this = this;
        var explicitRuleStack = this.RULE_STACK;
        var explicitOccurrenceStack = this.RULE_OCCURRENCE_STACK;
        if (!utils_1.isEmpty(this.LAST_EXPLICIT_RULE_STACK)) {
            explicitRuleStack = utils_1.map(this.LAST_EXPLICIT_RULE_STACK, function (idx) { return _this.RULE_STACK[idx]; });
            explicitOccurrenceStack = utils_1.map(this.LAST_EXPLICIT_RULE_STACK, function (idx) { return _this.RULE_OCCURRENCE_STACK[idx]; });
        }
        // TODO: only iterate over explicit rules here
        return utils_1.map(explicitRuleStack, function (ruleName, idx) {
            if (idx === 0) {
                return EOF_FOLLOW_KEY;
            }
            return {
                ruleName: _this.shortRuleNameToFullName(ruleName),
                idxInCallingRule: explicitOccurrenceStack[idx],
                inRule: _this.shortRuleNameToFullName(explicitRuleStack[idx - 1])
            };
        });
    };
    Parser.prototype.flattenFollowSet = function () {
        var _this = this;
        var followStack = utils_1.map(this.buildFullFollowKeyStack(), function (currKey) {
            return _this.getFollowSetFromFollowKey(currKey);
        });
        return utils_1.flatten(followStack);
    };
    Parser.prototype.getFollowSetFromFollowKey = function (followKey) {
        if (followKey === EOF_FOLLOW_KEY) {
            return [tokens_public_1.EOF];
        }
        var followName = followKey.ruleName +
            followKey.idxInCallingRule +
            constants_1.IN +
            followKey.inRule;
        return cache.getResyncFollowsForClass(this.className).get(followName);
    };
    // It does not make any sense to include a virtual EOF token in the list of resynced tokens
    // as EOF does not really exist and thus does not contain any useful information (line/column numbers)
    Parser.prototype.addToResyncTokens = function (token, resyncTokens) {
        if (!this.tokenMatcher(token, tokens_public_1.EOF)) {
            resyncTokens.push(token);
        }
        return resyncTokens;
    };
    Parser.prototype.reSyncTo = function (tokClass) {
        var resyncedTokens = [];
        var nextTok = this.LA(1);
        while (this.tokenMatcher(nextTok, tokClass) === false) {
            nextTok = this.SKIP_TOKEN();
            this.addToResyncTokens(nextTok, resyncedTokens);
        }
        // the last token is not part of the error.
        return utils_1.dropRight(resyncedTokens);
    };
    Parser.prototype.attemptInRepetitionRecovery = function (prodFunc, args, lookaheadFunc, dslMethodIdx, prodOccurrence, nextToksWalker) {
        var key = this.getKeyForAutomaticLookahead(dslMethodIdx, prodOccurrence);
        var firstAfterRepInfo = this.firstAfterRepMap.get(key);
        if (firstAfterRepInfo === undefined) {
            var currRuleName = this.getCurrRuleFullName();
            var ruleGrammar = this.getGAstProductions().get(currRuleName);
            var walker = new nextToksWalker(ruleGrammar, prodOccurrence);
            firstAfterRepInfo = walker.startWalking();
            this.firstAfterRepMap.put(key, firstAfterRepInfo);
        }
        var expectTokAfterLastMatch = firstAfterRepInfo.token;
        var nextTokIdx = firstAfterRepInfo.occurrence;
        var isEndOfRule = firstAfterRepInfo.isEndOfRule;
        // special edge case of a TOP most repetition after which the input should END.
        // this will force an attempt for inRule recovery in that scenario.
        if (this.RULE_STACK.length === 1 &&
            isEndOfRule &&
            expectTokAfterLastMatch === undefined) {
            expectTokAfterLastMatch = tokens_public_1.EOF;
            nextTokIdx = 1;
        }
        if (this.shouldInRepetitionRecoveryBeTried(expectTokAfterLastMatch, nextTokIdx)) {
            // TODO: performance optimization: instead of passing the original args here, we modify
            // the args param (or create a new one) and make sure the lookahead func is explicitly provided
            // to avoid searching the cache for it once more.
            this.tryInRepetitionRecovery(prodFunc, args, lookaheadFunc, expectTokAfterLastMatch);
        }
    };
    Parser.prototype.cstNestedInvocationStateUpdate = function (nestedName, shortName) {
        var initDef = this.cstDictDefForRule.get(shortName);
        this.CST_STACK.push({
            name: nestedName,
            fullName: this.shortRuleNameToFull.get(this.getLastExplicitRuleShortName()) + nestedName,
            children: initDef()
        });
    };
    Parser.prototype.cstInvocationStateUpdate = function (fullRuleName, shortName) {
        this.LAST_EXPLICIT_RULE_STACK.push(this.RULE_STACK.length - 1);
        var initDef = this.cstDictDefForRule.get(shortName);
        this.CST_STACK.push({
            name: fullRuleName,
            children: initDef()
        });
    };
    Parser.prototype.cstFinallyStateUpdate = function () {
        this.LAST_EXPLICIT_RULE_STACK.pop();
        this.CST_STACK.pop();
    };
    Parser.prototype.cstNestedFinallyStateUpdate = function () {
        this.CST_STACK.pop();
    };
    // Implementation of parsing DSL
    Parser.prototype.optionInternal = function (actionORMethodDef, occurrence) {
        var key = this.getKeyForAutomaticLookahead(keys_1.OPTION_IDX, occurrence);
        var nestedName = this.nestedRuleBeforeClause(actionORMethodDef, key);
        try {
            return this.optionInternalLogic(actionORMethodDef, occurrence, key);
        }
        finally {
            if (nestedName !== undefined) {
                this.nestedRuleFinallyClause(key, nestedName);
            }
        }
    };
    Parser.prototype.optionInternalNoCst = function (actionORMethodDef, occurrence) {
        var key = this.getKeyForAutomaticLookahead(keys_1.OPTION_IDX, occurrence);
        return this.optionInternalLogic(actionORMethodDef, occurrence, key);
    };
    Parser.prototype.optionInternalLogic = function (actionORMethodDef, occurrence, key) {
        var _this = this;
        var lookAheadFunc = this.getLookaheadFuncForOption(key, occurrence);
        var action;
        var predicate;
        if (actionORMethodDef.DEF !== undefined) {
            action = actionORMethodDef.DEF;
            predicate = actionORMethodDef.GATE;
            // predicate present
            if (predicate !== undefined) {
                var orgLookaheadFunction_1 = lookAheadFunc;
                lookAheadFunc = function () {
                    return (predicate.call(_this) && orgLookaheadFunction_1.call(_this));
                };
            }
        }
        else {
            action = actionORMethodDef;
        }
        if (lookAheadFunc.call(this) === true) {
            return action.call(this);
        }
        return undefined;
    };
    Parser.prototype.atLeastOneInternal = function (prodOccurrence, actionORMethodDef, result) {
        var laKey = this.getKeyForAutomaticLookahead(keys_1.AT_LEAST_ONE_IDX, prodOccurrence);
        var nestedName = this.nestedRuleBeforeClause(actionORMethodDef, laKey);
        try {
            return this.atLeastOneInternalLogic(prodOccurrence, actionORMethodDef, result, laKey);
        }
        finally {
            if (nestedName !== undefined) {
                this.nestedRuleFinallyClause(laKey, nestedName);
            }
        }
    };
    Parser.prototype.atLeastOneInternalNoCst = function (prodOccurrence, actionORMethodDef, result) {
        var key = this.getKeyForAutomaticLookahead(keys_1.AT_LEAST_ONE_IDX, prodOccurrence);
        return this.atLeastOneInternalLogic(prodOccurrence, actionORMethodDef, result, key);
    };
    Parser.prototype.atLeastOneInternalLogic = function (prodOccurrence, actionORMethodDef, result, key) {
        var _this = this;
        var lookAheadFunc = this.getLookaheadFuncForAtLeastOne(key, prodOccurrence);
        var action;
        var predicate;
        if (actionORMethodDef.DEF !== undefined) {
            action = actionORMethodDef.DEF;
            predicate = actionORMethodDef.GATE;
            // predicate present
            if (predicate !== undefined) {
                var orgLookaheadFunction_2 = lookAheadFunc;
                lookAheadFunc = function () {
                    return (predicate.call(_this) && orgLookaheadFunction_2.call(_this));
                };
            }
        }
        else {
            action = actionORMethodDef;
        }
        if (lookAheadFunc.call(this) === true) {
            result.push(action.call(this));
            while (lookAheadFunc.call(this) === true) {
                result.push(action.call(this));
            }
        }
        else {
            throw this.raiseEarlyExitException(prodOccurrence, lookahead_1.PROD_TYPE.REPETITION_MANDATORY, actionORMethodDef.ERR_MSG);
        }
        // note that while it may seem that this can cause an error because by using a recursive call to
        // AT_LEAST_ONE we change the grammar to AT_LEAST_TWO, AT_LEAST_THREE ... , the possible recursive call
        // from the tryInRepetitionRecovery(...) will only happen IFF there really are TWO/THREE/.... items.
        // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
        this.attemptInRepetitionRecovery(this.atLeastOneInternal, [prodOccurrence, actionORMethodDef, result], lookAheadFunc, keys_1.AT_LEAST_ONE_IDX, prodOccurrence, interpreter_1.NextTerminalAfterAtLeastOneWalker);
        return result;
    };
    Parser.prototype.atLeastOneSepFirstInternal = function (prodOccurrence, options, result) {
        var laKey = this.getKeyForAutomaticLookahead(keys_1.AT_LEAST_ONE_SEP_IDX, prodOccurrence);
        var nestedName = this.nestedRuleBeforeClause(options, laKey);
        try {
            return this.atLeastOneSepFirstInternalLogic(prodOccurrence, options, result, laKey);
        }
        finally {
            if (nestedName !== undefined) {
                this.nestedRuleFinallyClause(laKey, nestedName);
            }
        }
    };
    Parser.prototype.atLeastOneSepFirstInternalNoCst = function (prodOccurrence, options, result) {
        var laKey = this.getKeyForAutomaticLookahead(keys_1.AT_LEAST_ONE_SEP_IDX, prodOccurrence);
        return this.atLeastOneSepFirstInternalLogic(prodOccurrence, options, result, laKey);
    };
    Parser.prototype.atLeastOneSepFirstInternalLogic = function (prodOccurrence, options, result, key) {
        var _this = this;
        var action = options.DEF;
        var separator = options.SEP;
        var firstIterationLookaheadFunc = this.getLookaheadFuncForAtLeastOneSep(key, prodOccurrence);
        var values = result.values;
        var separators = result.separators;
        // 1st iteration
        if (firstIterationLookaheadFunc.call(this) === true) {
            values.push(action.call(this));
            var separatorLookAheadFunc = function () {
                return _this.tokenMatcher(_this.LA(1), separator);
            };
            // 2nd..nth iterations
            while (this.tokenMatcher(this.LA(1), separator) === true) {
                // note that this CONSUME will never enter recovery because
                // the separatorLookAheadFunc checks that the separator really does exist.
                separators.push(this.CONSUME(separator));
                values.push(action.call(this));
            }
            // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
            this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
                prodOccurrence,
                separator,
                separatorLookAheadFunc,
                action,
                interpreter_1.NextTerminalAfterAtLeastOneSepWalker,
                result
            ], separatorLookAheadFunc, keys_1.AT_LEAST_ONE_SEP_IDX, prodOccurrence, interpreter_1.NextTerminalAfterAtLeastOneSepWalker);
        }
        else {
            throw this.raiseEarlyExitException(prodOccurrence, lookahead_1.PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR, options.ERR_MSG);
        }
        return result;
    };
    Parser.prototype.manyInternal = function (prodOccurrence, actionORMethodDef, result) {
        var laKey = this.getKeyForAutomaticLookahead(keys_1.MANY_IDX, prodOccurrence);
        var nestedName = this.nestedRuleBeforeClause(actionORMethodDef, laKey);
        try {
            return this.manyInternalLogic(prodOccurrence, actionORMethodDef, result, laKey);
        }
        finally {
            if (nestedName !== undefined) {
                this.nestedRuleFinallyClause(laKey, nestedName);
            }
        }
    };
    Parser.prototype.manyInternalNoCst = function (prodOccurrence, actionORMethodDef, result) {
        var laKey = this.getKeyForAutomaticLookahead(keys_1.MANY_IDX, prodOccurrence);
        return this.manyInternalLogic(prodOccurrence, actionORMethodDef, result, laKey);
    };
    Parser.prototype.manyInternalLogic = function (prodOccurrence, actionORMethodDef, result, key) {
        var _this = this;
        var lookaheadFunction = this.getLookaheadFuncForMany(key, prodOccurrence);
        var action;
        var predicate;
        if (actionORMethodDef.DEF !== undefined) {
            action = actionORMethodDef.DEF;
            predicate = actionORMethodDef.GATE;
            // predicate present
            if (predicate !== undefined) {
                var orgLookaheadFunction_3 = lookaheadFunction;
                lookaheadFunction = function () {
                    return (predicate.call(_this) && orgLookaheadFunction_3.call(_this));
                };
            }
        }
        else {
            action = actionORMethodDef;
        }
        while (lookaheadFunction.call(this)) {
            result.push(action.call(this));
        }
        // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
        this.attemptInRepetitionRecovery(this.manyInternal, [prodOccurrence, actionORMethodDef, result], lookaheadFunction, keys_1.MANY_IDX, prodOccurrence, interpreter_1.NextTerminalAfterManyWalker);
        return result;
    };
    Parser.prototype.manySepFirstInternal = function (prodOccurrence, options, result) {
        var laKey = this.getKeyForAutomaticLookahead(keys_1.MANY_SEP_IDX, prodOccurrence);
        var nestedName = this.nestedRuleBeforeClause(options, laKey);
        try {
            return this.manySepFirstInternalLogic(prodOccurrence, options, result, laKey);
        }
        finally {
            if (nestedName !== undefined) {
                this.nestedRuleFinallyClause(laKey, nestedName);
            }
        }
    };
    Parser.prototype.manySepFirstInternalNoCst = function (prodOccurrence, options, result) {
        var laKey = this.getKeyForAutomaticLookahead(keys_1.MANY_SEP_IDX, prodOccurrence);
        return this.manySepFirstInternalLogic(prodOccurrence, options, result, laKey);
    };
    Parser.prototype.manySepFirstInternalLogic = function (prodOccurrence, options, result, key) {
        var _this = this;
        var action = options.DEF;
        var separator = options.SEP;
        var firstIterationLaFunc = this.getLookaheadFuncForManySep(key, prodOccurrence);
        var values = result.values;
        var separators = result.separators;
        // 1st iteration
        if (firstIterationLaFunc.call(this) === true) {
            values.push(action.call(this));
            var separatorLookAheadFunc = function () {
                return _this.tokenMatcher(_this.LA(1), separator);
            };
            // 2nd..nth iterations
            while (this.tokenMatcher(this.LA(1), separator) === true) {
                // note that this CONSUME will never enter recovery because
                // the separatorLookAheadFunc checks that the separator really does exist.
                separators.push(this.CONSUME(separator));
                values.push(action.call(this));
            }
            // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
            this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
                prodOccurrence,
                separator,
                separatorLookAheadFunc,
                action,
                interpreter_1.NextTerminalAfterManySepWalker,
                result
            ], separatorLookAheadFunc, keys_1.MANY_SEP_IDX, prodOccurrence, interpreter_1.NextTerminalAfterManySepWalker);
        }
        return result;
    };
    Parser.prototype.repetitionSepSecondInternal = function (prodOccurrence, separator, separatorLookAheadFunc, action, nextTerminalAfterWalker, result) {
        while (separatorLookAheadFunc()) {
            // note that this CONSUME will never enter recovery because
            // the separatorLookAheadFunc checks that the separator really does exist.
            result.separators.push(this.CONSUME(separator));
            result.values.push(action.call(this));
        }
        // we can only arrive to this function after an error
        // has occurred (hence the name 'second') so the following
        // IF will always be entered, its possible to remove it...
        // however it is kept to avoid confusion and be consistent.
        // Performance optimization: "attemptInRepetitionRecovery" will be defined as NOOP unless recovery is enabled
        /* istanbul ignore else */
        this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
            prodOccurrence,
            separator,
            separatorLookAheadFunc,
            action,
            nextTerminalAfterWalker,
            result
        ], separatorLookAheadFunc, keys_1.AT_LEAST_ONE_SEP_IDX, prodOccurrence, nextTerminalAfterWalker);
    };
    Parser.prototype.orInternalNoCst = function (altsOrOpts, occurrence) {
        var alts = utils_1.isArray(altsOrOpts)
            ? altsOrOpts
            : altsOrOpts.DEF;
        var laFunc = this.getLookaheadFuncForOr(occurrence, alts);
        var altIdxToTake = laFunc.call(this, alts);
        if (altIdxToTake !== undefined) {
            var chosenAlternative = alts[altIdxToTake];
            return chosenAlternative.ALT.call(this);
        }
        this.raiseNoAltException(occurrence, altsOrOpts.ERR_MSG);
    };
    Parser.prototype.orInternal = function (altsOrOpts, occurrence) {
        var laKey = this.getKeyForAutomaticLookahead(keys_1.OR_IDX, occurrence);
        var nestedName = this.nestedRuleBeforeClause(altsOrOpts, laKey);
        try {
            var alts = utils_1.isArray(altsOrOpts)
                ? altsOrOpts
                : altsOrOpts.DEF;
            var laFunc = this.getLookaheadFuncForOr(occurrence, alts);
            var altIdxToTake = laFunc.call(this, alts);
            if (altIdxToTake !== undefined) {
                var chosenAlternative = alts[altIdxToTake];
                var nestedAltBeforeClauseResult = this.nestedAltBeforeClause(chosenAlternative, occurrence, keys_1.OR_IDX, altIdxToTake);
                try {
                    return chosenAlternative.ALT.call(this);
                }
                finally {
                    if (nestedAltBeforeClauseResult !== undefined) {
                        this.nestedRuleFinallyClause(nestedAltBeforeClauseResult.shortName, nestedAltBeforeClauseResult.nestedName);
                    }
                }
            }
            this.raiseNoAltException(occurrence, altsOrOpts.ERR_MSG);
        }
        finally {
            if (nestedName !== undefined) {
                this.nestedRuleFinallyClause(laKey, nestedName);
            }
        }
    };
    // this actually returns a number, but it is always used as a string (object prop key)
    Parser.prototype.getKeyForAutomaticLookahead = function (dslMethodIdx, occurrence) {
        var currRuleShortName = this.getLastExplicitRuleShortName();
        /* tslint:disable */
        return keys_1.getKeyForAutomaticLookahead(currRuleShortName, dslMethodIdx, occurrence);
        /* tslint:enable */
    };
    Parser.prototype.getLookaheadFuncForOr = function (occurrence, alts) {
        var key = this.getKeyForAutomaticLookahead(keys_1.OR_IDX, occurrence);
        var laFunc = this.classLAFuncs.get(key);
        if (laFunc === undefined) {
            var ruleName = this.getCurrRuleFullName();
            var ruleGrammar = this.getGAstProductions().get(ruleName);
            // note that hasPredicates is only computed once.
            var hasPredicates = utils_1.some(alts, function (currAlt) {
                return utils_1.isFunction(currAlt.GATE);
            });
            laFunc = lookahead_1.buildLookaheadFuncForOr(occurrence, ruleGrammar, this.maxLookahead, hasPredicates, this.dynamicTokensEnabled, this.lookAheadBuilderForAlternatives);
            this.classLAFuncs.put(key, laFunc);
            return laFunc;
        }
        else {
            return laFunc;
        }
    };
    // Automatic lookahead calculation
    Parser.prototype.getLookaheadFuncForOption = function (key, occurrence) {
        return this.getLookaheadFuncFor(key, occurrence, this.maxLookahead, lookahead_1.PROD_TYPE.OPTION);
    };
    Parser.prototype.getLookaheadFuncForMany = function (key, occurrence) {
        return this.getLookaheadFuncFor(key, occurrence, this.maxLookahead, lookahead_1.PROD_TYPE.REPETITION);
    };
    Parser.prototype.getLookaheadFuncForManySep = function (key, occurrence) {
        return this.getLookaheadFuncFor(key, occurrence, this.maxLookahead, lookahead_1.PROD_TYPE.REPETITION_WITH_SEPARATOR);
    };
    Parser.prototype.getLookaheadFuncForAtLeastOne = function (key, occurrence) {
        return this.getLookaheadFuncFor(key, occurrence, this.maxLookahead, lookahead_1.PROD_TYPE.REPETITION_MANDATORY);
    };
    Parser.prototype.getLookaheadFuncForAtLeastOneSep = function (key, occurrence) {
        return this.getLookaheadFuncFor(key, occurrence, this.maxLookahead, lookahead_1.PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR);
    };
    // TODO: consider caching the error message computed information
    Parser.prototype.raiseNoAltException = function (occurrence, errMsgTypes) {
        var ruleName = this.getCurrRuleFullName();
        var ruleGrammar = this.getGAstProductions().get(ruleName);
        // TODO: getLookaheadPathsForOr can be slow for large enough maxLookahead and certain grammars, consider caching ?
        var lookAheadPathsPerAlternative = lookahead_1.getLookaheadPathsForOr(occurrence, ruleGrammar, this.maxLookahead);
        var actualTokens = [];
        for (var i = 1; i < this.maxLookahead; i++) {
            actualTokens.push(this.LA(i));
        }
        var errMsg = this.errorMessageProvider.buildNoViableAltMessage({
            expectedPathsPerAlt: lookAheadPathsPerAlternative,
            actual: actualTokens,
            customUserDescription: errMsgTypes,
            ruleName: this.getCurrRuleFullName()
        });
        throw this.SAVE_ERROR(new exceptions_public_1.exceptions.NoViableAltException(errMsg, this.LA(1)));
    };
    Parser.prototype.getLookaheadFuncFor = function (key, occurrence, maxLookahead, prodType) {
        var laFunc = this.classLAFuncs.get(key);
        if (laFunc === undefined) {
            var ruleName = this.getCurrRuleFullName();
            var ruleGrammar = this.getGAstProductions().get(ruleName);
            laFunc = lookahead_1.buildLookaheadFuncForOptionalProd(occurrence, ruleGrammar, maxLookahead, this.dynamicTokensEnabled, prodType, this.lookAheadBuilderForOptional);
            this.classLAFuncs.put(key, laFunc);
            return laFunc;
        }
        else {
            return laFunc;
        }
    };
    // TODO: consider caching the error message computed information
    Parser.prototype.raiseEarlyExitException = function (occurrence, prodType, userDefinedErrMsg) {
        var ruleName = this.getCurrRuleFullName();
        var ruleGrammar = this.getGAstProductions().get(ruleName);
        var lookAheadPathsPerAlternative = lookahead_1.getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, this.maxLookahead);
        var insideProdPaths = lookAheadPathsPerAlternative[0];
        var actualTokens = [];
        for (var i = 1; i < this.maxLookahead; i++) {
            actualTokens.push(this.LA(i));
        }
        var msg = this.errorMessageProvider.buildEarlyExitMessage({
            expectedIterationPaths: insideProdPaths,
            actual: actualTokens,
            customUserDescription: userDefinedErrMsg,
            ruleName: ruleName
        });
        throw this.SAVE_ERROR(new exceptions_public_1.exceptions.EarlyExitException(msg, this.LA(1)));
    };
    Parser.prototype.getLastExplicitRuleShortName = function () {
        var lastExplictIndex = this.LAST_EXPLICIT_RULE_STACK[this.LAST_EXPLICIT_RULE_STACK.length - 1];
        return this.RULE_STACK[lastExplictIndex];
    };
    Parser.prototype.getLastExplicitRuleShortNameNoCst = function () {
        var ruleStack = this.RULE_STACK;
        return ruleStack[ruleStack.length - 1];
    };
    Parser.prototype.getPreviousExplicitRuleShortName = function () {
        var lastExplicitIndex = this.LAST_EXPLICIT_RULE_STACK[this.LAST_EXPLICIT_RULE_STACK.length - 2];
        return this.RULE_STACK[lastExplicitIndex];
    };
    Parser.prototype.getPreviousExplicitRuleShortNameNoCst = function () {
        var ruleStack = this.RULE_STACK;
        return ruleStack[ruleStack.length - 2];
    };
    Parser.prototype.getPreviousExplicitRuleOccurenceIndex = function () {
        var lastExplicitIndex = this.LAST_EXPLICIT_RULE_STACK[this.LAST_EXPLICIT_RULE_STACK.length - 2];
        return this.RULE_OCCURRENCE_STACK[lastExplicitIndex];
    };
    Parser.prototype.getPreviousExplicitRuleOccurenceIndexNoCst = function () {
        var occurrenceStack = this.RULE_OCCURRENCE_STACK;
        return occurrenceStack[occurrenceStack.length - 2];
    };
    Parser.prototype.nestedRuleBeforeClause = function (methodOpts, laKey) {
        var nestedName;
        if (methodOpts.NAME !== undefined) {
            nestedName = methodOpts.NAME;
            this.nestedRuleInvocationStateUpdate(nestedName, laKey);
            return nestedName;
        }
        else {
            return undefined;
        }
    };
    Parser.prototype.nestedAltBeforeClause = function (methodOpts, occurrence, methodKeyIdx, altIdx) {
        var ruleIdx = this.getLastExplicitRuleShortName();
        var shortName = keys_1.getKeyForAltIndex(ruleIdx, methodKeyIdx, occurrence, altIdx);
        var nestedName;
        if (methodOpts.NAME !== undefined) {
            nestedName = methodOpts.NAME;
            this.nestedRuleInvocationStateUpdate(nestedName, shortName);
            return {
                shortName: shortName,
                nestedName: nestedName
            };
        }
        else {
            return undefined;
        }
    };
    Parser.prototype.nestedRuleFinallyClause = function (laKey, nestedName) {
        var cstStack = this.CST_STACK;
        var nestedRuleCst = cstStack[cstStack.length - 1];
        this.nestedRuleFinallyStateUpdate();
        // this return a different result than the previous invocation because "nestedRuleFinallyStateUpdate" pops the cst stack
        var parentCstNode = cstStack[cstStack.length - 1];
        cst_1.addNoneTerminalToCst(parentCstNode, nestedName, nestedRuleCst);
    };
    Parser.prototype.cstPostTerminal = function (tokClass, consumedToken) {
        var currTokTypeName = tokClass.tokenName;
        var rootCst = this.CST_STACK[this.CST_STACK.length - 1];
        cst_1.addTerminalToCst(rootCst, consumedToken, currTokTypeName);
    };
    Parser.prototype.cstPostNonTerminal = function (ruleCstResult, ruleName) {
        cst_1.addNoneTerminalToCst(this.CST_STACK[this.CST_STACK.length - 1], ruleName, ruleCstResult);
    };
    Parser.prototype.cstPostNonTerminalRecovery = function (ruleCstResult, ruleName) {
        // TODO: assumes not first rule, is this assumption always correct?
        cst_1.addNoneTerminalToCst(this.CST_STACK[this.CST_STACK.length - 2], ruleName, ruleCstResult);
    };
    Object.defineProperty(Parser.prototype, "input", {
        get: function () {
            return this.tokVector;
        },
        // lexer related methods
        set: function (newInput) {
            this.reset();
            this.tokVector = newInput;
            this.tokVectorLength = newInput.length;
        },
        enumerable: true,
        configurable: true
    });
    // skips a token and returns the next token
    Parser.prototype.SKIP_TOKEN = function () {
        if (this.currIdx <= this.tokVector.length - 2) {
            this.consumeToken();
            return this.LA(1);
        }
        else {
            return exports.END_OF_FILE;
        }
    };
    // Lexer (accessing Token vector) related methods which can be overridden to implement lazy lexers
    // or lexers dependent on parser context.
    Parser.prototype.LA = function (howMuch) {
        // TODO: is this optimization (saving tokVectorLength benefits?)
        if (this.tokVectorLength <= this.currIdx + howMuch) {
            return exports.END_OF_FILE;
        }
        else {
            return this.tokVector[this.currIdx + howMuch];
        }
    };
    Parser.prototype.consumeToken = function () {
        this.currIdx++;
    };
    Parser.prototype.exportLexerState = function () {
        return this.currIdx;
    };
    Parser.prototype.importLexerState = function (newState) {
        this.currIdx = newState;
    };
    Parser.prototype.resetLexerState = function () {
        this.currIdx = -1;
    };
    Parser.prototype.moveToTerminatedState = function () {
        this.currIdx = this.tokVector.length - 1;
    };
    Parser.prototype.lookAheadBuilderForOptional = function (alt, tokenMatcher, dynamicTokensEnabled) {
        return lookahead_1.buildSingleAlternativeLookaheadFunction(alt, tokenMatcher, dynamicTokensEnabled);
    };
    Parser.prototype.lookAheadBuilderForAlternatives = function (alts, hasPredicates, tokenMatcher, dynamicTokensEnabled) {
        return lookahead_1.buildAlternativesLookAheadFunc(alts, hasPredicates, tokenMatcher, dynamicTokensEnabled);
    };
    Parser.NO_RESYNC = false;
    // Set this flag to true if you don't want the Parser to throw error when problems in it's definition are detected.
    // (normally during the parser's constructor).
    // This is a design time flag, it will not affect the runtime error handling of the parser, just design time errors,
    // for example: duplicate rule names, referencing an unresolved subrule, ect...
    // This flag should not be enabled during normal usage, it is used in special situations, for example when
    // needing to display the parser definition errors in some GUI(online playground).
    Parser.DEFER_DEFINITION_ERRORS_HANDLING = false;
    return Parser;
}());
exports.Parser = Parser;
function InRuleRecoveryException(message) {
    this.name = IN_RULE_RECOVERY_EXCEPTION;
    this.message = message;
}
InRuleRecoveryException.prototype = Error.prototype;
//# sourceMappingURL=parser_public.js.map

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * module used to cache static information about parsers,
 */
Object.defineProperty(exports, "__esModule", { value: true });
var lang_extensions_1 = __webpack_require__(3);
var utils_1 = __webpack_require__(0);
exports.CLASS_TO_DEFINITION_ERRORS = new lang_extensions_1.HashTable();
exports.CLASS_TO_SELF_ANALYSIS_DONE = new lang_extensions_1.HashTable();
exports.CLASS_TO_GRAMMAR_PRODUCTIONS = new lang_extensions_1.HashTable();
function getProductionsForClass(className) {
    return getFromNestedHashTable(className, exports.CLASS_TO_GRAMMAR_PRODUCTIONS);
}
exports.getProductionsForClass = getProductionsForClass;
exports.CLASS_TO_RESYNC_FOLLOW_SETS = new lang_extensions_1.HashTable();
function getResyncFollowsForClass(className) {
    return getFromNestedHashTable(className, exports.CLASS_TO_RESYNC_FOLLOW_SETS);
}
exports.getResyncFollowsForClass = getResyncFollowsForClass;
function setResyncFollowsForClass(className, followSet) {
    exports.CLASS_TO_RESYNC_FOLLOW_SETS.put(className, followSet);
}
exports.setResyncFollowsForClass = setResyncFollowsForClass;
exports.CLASS_TO_LOOKAHEAD_FUNCS = new lang_extensions_1.HashTable();
function getLookaheadFuncsForClass(className) {
    return getFromNestedHashTable(className, exports.CLASS_TO_LOOKAHEAD_FUNCS);
}
exports.getLookaheadFuncsForClass = getLookaheadFuncsForClass;
exports.CLASS_TO_FIRST_AFTER_REPETITION = new lang_extensions_1.HashTable();
function getFirstAfterRepForClass(className) {
    return getFromNestedHashTable(className, exports.CLASS_TO_FIRST_AFTER_REPETITION);
}
exports.getFirstAfterRepForClass = getFirstAfterRepForClass;
exports.CLASS_TO_PRODUCTION_OVERRIDEN = new lang_extensions_1.HashTable();
function getProductionOverriddenForClass(className) {
    return getFromNestedHashTable(className, exports.CLASS_TO_PRODUCTION_OVERRIDEN);
}
exports.getProductionOverriddenForClass = getProductionOverriddenForClass;
exports.CLASS_TO_CST_DICT_DEF_PER_RULE = new lang_extensions_1.HashTable();
function getCstDictDefPerRuleForClass(className) {
    return getFromNestedHashTable(className, exports.CLASS_TO_CST_DICT_DEF_PER_RULE);
}
exports.getCstDictDefPerRuleForClass = getCstDictDefPerRuleForClass;
exports.CLASS_TO_BASE_CST_VISITOR = new lang_extensions_1.HashTable();
exports.CLASS_TO_BASE_CST_VISITOR_WITH_DEFAULTS = new lang_extensions_1.HashTable();
exports.CLASS_TO_ALL_RULE_NAMES = new lang_extensions_1.HashTable();
// TODO reflective test to verify this has not changed, for example (OPTION6 added)
exports.MAX_OCCURRENCE_INDEX = 5;
function getFromNestedHashTable(className, hashTable) {
    var result = hashTable.get(className);
    if (result === undefined) {
        hashTable.put(className, new lang_extensions_1.HashTable());
        result = hashTable.get(className);
    }
    return result;
}
function clearCache() {
    var hasTables = utils_1.filter(utils_1.values(module.exports), function (currHashTable) { return currHashTable instanceof lang_extensions_1.HashTable; });
    utils_1.forEach(hasTables, function (currHashTable) { return currHashTable.clear(); });
}
exports.clearCache = clearCache;
//# sourceMappingURL=cache.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var gast_public_1 = __webpack_require__(1);
var utils_1 = __webpack_require__(0);
function isSequenceProd(prod) {
    return (prod instanceof gast_public_1.gast.Flat ||
        prod instanceof gast_public_1.gast.Option ||
        prod instanceof gast_public_1.gast.Repetition ||
        prod instanceof gast_public_1.gast.RepetitionMandatory ||
        prod instanceof gast_public_1.gast.RepetitionMandatoryWithSeparator ||
        prod instanceof gast_public_1.gast.RepetitionWithSeparator ||
        prod instanceof gast_public_1.gast.Terminal ||
        prod instanceof gast_public_1.gast.Rule);
}
exports.isSequenceProd = isSequenceProd;
function isOptionalProd(prod, alreadyVisited) {
    if (alreadyVisited === void 0) { alreadyVisited = []; }
    var isDirectlyOptional = prod instanceof gast_public_1.gast.Option ||
        prod instanceof gast_public_1.gast.Repetition ||
        prod instanceof gast_public_1.gast.RepetitionWithSeparator;
    if (isDirectlyOptional) {
        return true;
    }
    // note that this can cause infinite loop if one optional empty TOP production has a cyclic dependency with another
    // empty optional top rule
    // may be indirectly optional ((A?B?C?) | (D?E?F?))
    if (prod instanceof gast_public_1.gast.Alternation) {
        // for OR its enough for just one of the alternatives to be optional
        return utils_1.some(prod.definition, function (subProd) {
            return isOptionalProd(subProd, alreadyVisited);
        });
    }
    else if (prod instanceof gast_public_1.gast.NonTerminal &&
        utils_1.contains(alreadyVisited, prod)) {
        // avoiding stack overflow due to infinite recursion
        return false;
    }
    else if (prod instanceof gast_public_1.gast.AbstractProduction) {
        if (prod instanceof gast_public_1.gast.NonTerminal) {
            alreadyVisited.push(prod);
        }
        return utils_1.every(prod.definition, function (subProd) {
            return isOptionalProd(subProd, alreadyVisited);
        });
    }
    else {
        return false;
    }
}
exports.isOptionalProd = isOptionalProd;
function isBranchingProd(prod) {
    return prod instanceof gast_public_1.gast.Alternation;
}
exports.isBranchingProd = isBranchingProd;
function getProductionDslName(prod) {
    if (prod instanceof gast_public_1.gast.NonTerminal) {
        return "SUBRULE";
    }
    else if (prod instanceof gast_public_1.gast.Option) {
        return "OPTION";
    }
    else if (prod instanceof gast_public_1.gast.Alternation) {
        return "OR";
    }
    else if (prod instanceof gast_public_1.gast.RepetitionMandatory) {
        return "AT_LEAST_ONE";
    }
    else if (prod instanceof gast_public_1.gast.RepetitionMandatoryWithSeparator) {
        return "AT_LEAST_ONE_SEP";
    }
    else if (prod instanceof gast_public_1.gast.RepetitionWithSeparator) {
        return "MANY_SEP";
    }
    else if (prod instanceof gast_public_1.gast.Repetition) {
        return "MANY";
    }
    else if (prod instanceof gast_public_1.gast.Terminal) {
        return "CONSUME";
    }
    else {
        /* istanbul ignore next */
        throw Error("non exhaustive match");
    }
}
exports.getProductionDslName = getProductionDslName;
var GastCloneVisitor = /** @class */ (function (_super) {
    __extends(GastCloneVisitor, _super);
    function GastCloneVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GastCloneVisitor.prototype.visitNonTerminal = function (node) {
        return new gast_public_1.gast.NonTerminal(node.nonTerminalName, undefined, node.occurrenceInParent, node.implicitOccurrenceIndex);
    };
    GastCloneVisitor.prototype.visitFlat = function (node) {
        var _this = this;
        var definition = utils_1.map(node.definition, function (currSubDef) {
            return _this.visit(currSubDef);
        });
        return new gast_public_1.gast.Flat(definition, node.name);
    };
    GastCloneVisitor.prototype.visitOption = function (node) {
        var _this = this;
        var definition = utils_1.map(node.definition, function (currSubDef) {
            return _this.visit(currSubDef);
        });
        return new gast_public_1.gast.Option(definition, node.occurrenceInParent, node.name, node.implicitOccurrenceIndex);
    };
    GastCloneVisitor.prototype.visitRepetition = function (node) {
        var _this = this;
        var definition = utils_1.map(node.definition, function (currSubDef) {
            return _this.visit(currSubDef);
        });
        return new gast_public_1.gast.Repetition(definition, node.occurrenceInParent, node.name, node.implicitOccurrenceIndex);
    };
    GastCloneVisitor.prototype.visitRepetitionMandatory = function (node) {
        var _this = this;
        var definition = utils_1.map(node.definition, function (currSubDef) {
            return _this.visit(currSubDef);
        });
        return new gast_public_1.gast.RepetitionMandatory(definition, node.occurrenceInParent, node.name, node.implicitOccurrenceIndex);
    };
    GastCloneVisitor.prototype.visitRepetitionMandatoryWithSeparator = function (node) {
        var _this = this;
        var definition = utils_1.map(node.definition, function (currSubDef) {
            return _this.visit(currSubDef);
        });
        return new gast_public_1.gast.RepetitionMandatoryWithSeparator(definition, node.separator, node.occurrenceInParent, node.name, node.implicitOccurrenceIndex);
    };
    GastCloneVisitor.prototype.visitRepetitionWithSeparator = function (node) {
        var _this = this;
        var definition = utils_1.map(node.definition, function (currSubDef) {
            return _this.visit(currSubDef);
        });
        return new gast_public_1.gast.RepetitionWithSeparator(definition, node.separator, node.occurrenceInParent, node.name, node.implicitOccurrenceIndex);
    };
    GastCloneVisitor.prototype.visitAlternation = function (node) {
        var _this = this;
        var definition = utils_1.map(node.definition, function (currSubDef) {
            return _this.visit(currSubDef);
        });
        return new gast_public_1.gast.Alternation(definition, node.occurrenceInParent, node.name, node.implicitOccurrenceIndex);
    };
    GastCloneVisitor.prototype.visitTerminal = function (node) {
        return new gast_public_1.gast.Terminal(node.terminalType, node.occurrenceInParent, node.implicitOccurrenceIndex);
    };
    GastCloneVisitor.prototype.visitRule = function (node) {
        var _this = this;
        var definition = utils_1.map(node.definition, function (currSubDef) {
            return _this.visit(currSubDef);
        });
        return new gast_public_1.gast.Rule(node.name, definition, node.orgText);
    };
    return GastCloneVisitor;
}(gast_public_1.gast.GAstVisitor));
function cloneProduction(prod) {
    var cloningVisitor = new GastCloneVisitor();
    return cloningVisitor.visit(prod);
}
exports.cloneProduction = cloneProduction;
//# sourceMappingURL=gast.js.map

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var gast_public_1 = __webpack_require__(1);
var gast_1 = __webpack_require__(7);
var utils_1 = __webpack_require__(0);
function first(prod) {
    if (prod instanceof gast_public_1.gast.NonTerminal) {
        // this could in theory cause infinite loops if
        // (1) prod A refs prod B.
        // (2) prod B refs prod A
        // (3) AB can match the empty set
        // in other words a cycle where everything is optional so the first will keep
        // looking ahead for the next optional part and will never exit
        // currently there is no safeguard for this unique edge case because
        // (1) not sure a grammar in which this can happen is useful for anything (productive)
        return first(prod.referencedRule);
    }
    else if (prod instanceof gast_public_1.gast.Terminal) {
        return firstForTerminal(prod);
    }
    else if (gast_1.isSequenceProd(prod)) {
        return firstForSequence(prod);
    }
    else if (gast_1.isBranchingProd(prod)) {
        return firstForBranching(prod);
    }
    else {
        /* istanbul ignore next */
        throw Error("non exhaustive match");
    }
}
exports.first = first;
function firstForSequence(prod) {
    var firstSet = [];
    var seq = prod.definition;
    var nextSubProdIdx = 0;
    var hasInnerProdsRemaining = seq.length > nextSubProdIdx;
    var currSubProd;
    // so we enter the loop at least once (if the definition is not empty
    var isLastInnerProdOptional = true;
    // scan a sequence until it's end or until we have found a NONE optional production in it
    while (hasInnerProdsRemaining && isLastInnerProdOptional) {
        currSubProd = seq[nextSubProdIdx];
        isLastInnerProdOptional = gast_1.isOptionalProd(currSubProd);
        firstSet = firstSet.concat(first(currSubProd));
        nextSubProdIdx = nextSubProdIdx + 1;
        hasInnerProdsRemaining = seq.length > nextSubProdIdx;
    }
    return utils_1.uniq(firstSet);
}
exports.firstForSequence = firstForSequence;
function firstForBranching(prod) {
    var allAlternativesFirsts = utils_1.map(prod.definition, function (innerProd) {
        return first(innerProd);
    });
    return utils_1.uniq(utils_1.flatten(allAlternativesFirsts));
}
exports.firstForBranching = firstForBranching;
function firstForTerminal(terminal) {
    return [terminal.terminalType];
}
exports.firstForTerminal = firstForTerminal;
//# sourceMappingURL=first.js.map

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-use-before-declare */
var rest_1 = __webpack_require__(10);
var gast_public_1 = __webpack_require__(1);
var utils_1 = __webpack_require__(0);
var tokens_public_1 = __webpack_require__(2);
var first_1 = __webpack_require__(8);
/* tslint:enable:no-use-before-declare */
var AbstractNextPossibleTokensWalker = /** @class */ (function (_super) {
    __extends(AbstractNextPossibleTokensWalker, _super);
    function AbstractNextPossibleTokensWalker(topProd, path) {
        var _this = _super.call(this) || this;
        _this.topProd = topProd;
        _this.path = path;
        _this.possibleTokTypes = [];
        _this.nextProductionName = "";
        _this.nextProductionOccurrence = 0;
        _this.found = false;
        _this.isAtEndOfPath = false;
        return _this;
    }
    AbstractNextPossibleTokensWalker.prototype.startWalking = function () {
        this.found = false;
        if (this.path.ruleStack[0] !== this.topProd.name) {
            throw Error("The path does not start with the walker's top Rule!");
        }
        // immutable for the win
        this.ruleStack = utils_1.cloneArr(this.path.ruleStack).reverse(); // intelij bug requires assertion
        this.occurrenceStack = utils_1.cloneArr(this.path.occurrenceStack).reverse(); // intelij bug requires assertion
        // already verified that the first production is valid, we now seek the 2nd production
        this.ruleStack.pop();
        this.occurrenceStack.pop();
        this.updateExpectedNext();
        this.walk(this.topProd);
        return this.possibleTokTypes;
    };
    AbstractNextPossibleTokensWalker.prototype.walk = function (prod, prevRest) {
        if (prevRest === void 0) { prevRest = []; }
        // stop scanning once we found the path
        if (!this.found) {
            _super.prototype.walk.call(this, prod, prevRest);
        }
    };
    AbstractNextPossibleTokensWalker.prototype.walkProdRef = function (refProd, currRest, prevRest) {
        // found the next production, need to keep walking in it
        if (refProd.referencedRule.name === this.nextProductionName &&
            refProd.occurrenceInParent === this.nextProductionOccurrence) {
            var fullRest = currRest.concat(prevRest);
            this.updateExpectedNext();
            this.walk(refProd.referencedRule, fullRest);
        }
    };
    AbstractNextPossibleTokensWalker.prototype.updateExpectedNext = function () {
        // need to consume the Terminal
        if (utils_1.isEmpty(this.ruleStack)) {
            // must reset nextProductionXXX to avoid walking down another Top Level production while what we are
            // really seeking is the last Terminal...
            this.nextProductionName = "";
            this.nextProductionOccurrence = 0;
            this.isAtEndOfPath = true;
        }
        else {
            this.nextProductionName = this.ruleStack.pop();
            this.nextProductionOccurrence = this.occurrenceStack.pop();
        }
    };
    return AbstractNextPossibleTokensWalker;
}(rest_1.RestWalker));
exports.AbstractNextPossibleTokensWalker = AbstractNextPossibleTokensWalker;
var NextAfterTokenWalker = /** @class */ (function (_super) {
    __extends(NextAfterTokenWalker, _super);
    function NextAfterTokenWalker(topProd, path) {
        var _this = _super.call(this, topProd, path) || this;
        _this.path = path;
        _this.nextTerminalName = "";
        _this.nextTerminalOccurrence = 0;
        _this.nextTerminalName = tokens_public_1.tokenName(_this.path.lastTok);
        _this.nextTerminalOccurrence = _this.path.lastTokOccurrence;
        return _this;
    }
    NextAfterTokenWalker.prototype.walkTerminal = function (terminal, currRest, prevRest) {
        if (this.isAtEndOfPath &&
            tokens_public_1.tokenName(terminal.terminalType) === this.nextTerminalName &&
            terminal.occurrenceInParent === this.nextTerminalOccurrence &&
            !this.found) {
            var fullRest = currRest.concat(prevRest);
            var restProd = new gast_public_1.gast.Flat(fullRest);
            this.possibleTokTypes = first_1.first(restProd);
            this.found = true;
        }
    };
    return NextAfterTokenWalker;
}(AbstractNextPossibleTokensWalker));
exports.NextAfterTokenWalker = NextAfterTokenWalker;
/**
 * This walker only "walks" a single "TOP" level in the Grammar Ast, this means
 * it never "follows" production refs
 */
var AbstractNextTerminalAfterProductionWalker = /** @class */ (function (_super) {
    __extends(AbstractNextTerminalAfterProductionWalker, _super);
    function AbstractNextTerminalAfterProductionWalker(topRule, occurrence) {
        var _this = _super.call(this) || this;
        _this.topRule = topRule;
        _this.occurrence = occurrence;
        _this.result = {
            token: undefined,
            occurrence: undefined,
            isEndOfRule: undefined
        };
        return _this;
    }
    AbstractNextTerminalAfterProductionWalker.prototype.startWalking = function () {
        this.walk(this.topRule);
        return this.result;
    };
    return AbstractNextTerminalAfterProductionWalker;
}(rest_1.RestWalker));
exports.AbstractNextTerminalAfterProductionWalker = AbstractNextTerminalAfterProductionWalker;
var NextTerminalAfterManyWalker = /** @class */ (function (_super) {
    __extends(NextTerminalAfterManyWalker, _super);
    function NextTerminalAfterManyWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NextTerminalAfterManyWalker.prototype.walkMany = function (manyProd, currRest, prevRest) {
        if (manyProd.occurrenceInParent === this.occurrence) {
            var firstAfterMany = utils_1.first(currRest.concat(prevRest));
            this.result.isEndOfRule = firstAfterMany === undefined;
            if (firstAfterMany instanceof gast_public_1.gast.Terminal) {
                this.result.token = firstAfterMany.terminalType;
                this.result.occurrence = firstAfterMany.occurrenceInParent;
            }
        }
        else {
            _super.prototype.walkMany.call(this, manyProd, currRest, prevRest);
        }
    };
    return NextTerminalAfterManyWalker;
}(AbstractNextTerminalAfterProductionWalker));
exports.NextTerminalAfterManyWalker = NextTerminalAfterManyWalker;
var NextTerminalAfterManySepWalker = /** @class */ (function (_super) {
    __extends(NextTerminalAfterManySepWalker, _super);
    function NextTerminalAfterManySepWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NextTerminalAfterManySepWalker.prototype.walkManySep = function (manySepProd, currRest, prevRest) {
        if (manySepProd.occurrenceInParent === this.occurrence) {
            var firstAfterManySep = utils_1.first(currRest.concat(prevRest));
            this.result.isEndOfRule = firstAfterManySep === undefined;
            if (firstAfterManySep instanceof gast_public_1.gast.Terminal) {
                this.result.token = firstAfterManySep.terminalType;
                this.result.occurrence = firstAfterManySep.occurrenceInParent;
            }
        }
        else {
            _super.prototype.walkManySep.call(this, manySepProd, currRest, prevRest);
        }
    };
    return NextTerminalAfterManySepWalker;
}(AbstractNextTerminalAfterProductionWalker));
exports.NextTerminalAfterManySepWalker = NextTerminalAfterManySepWalker;
var NextTerminalAfterAtLeastOneWalker = /** @class */ (function (_super) {
    __extends(NextTerminalAfterAtLeastOneWalker, _super);
    function NextTerminalAfterAtLeastOneWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NextTerminalAfterAtLeastOneWalker.prototype.walkAtLeastOne = function (atLeastOneProd, currRest, prevRest) {
        if (atLeastOneProd.occurrenceInParent === this.occurrence) {
            var firstAfterAtLeastOne = utils_1.first(currRest.concat(prevRest));
            this.result.isEndOfRule = firstAfterAtLeastOne === undefined;
            if (firstAfterAtLeastOne instanceof gast_public_1.gast.Terminal) {
                this.result.token = firstAfterAtLeastOne.terminalType;
                this.result.occurrence = firstAfterAtLeastOne.occurrenceInParent;
            }
        }
        else {
            _super.prototype.walkAtLeastOne.call(this, atLeastOneProd, currRest, prevRest);
        }
    };
    return NextTerminalAfterAtLeastOneWalker;
}(AbstractNextTerminalAfterProductionWalker));
exports.NextTerminalAfterAtLeastOneWalker = NextTerminalAfterAtLeastOneWalker;
// TODO: reduce code duplication in the AfterWalkers
var NextTerminalAfterAtLeastOneSepWalker = /** @class */ (function (_super) {
    __extends(NextTerminalAfterAtLeastOneSepWalker, _super);
    function NextTerminalAfterAtLeastOneSepWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NextTerminalAfterAtLeastOneSepWalker.prototype.walkAtLeastOneSep = function (atleastOneSepProd, currRest, prevRest) {
        if (atleastOneSepProd.occurrenceInParent === this.occurrence) {
            var firstAfterfirstAfterAtLeastOneSep = utils_1.first(currRest.concat(prevRest));
            this.result.isEndOfRule =
                firstAfterfirstAfterAtLeastOneSep === undefined;
            if (firstAfterfirstAfterAtLeastOneSep instanceof gast_public_1.gast.Terminal) {
                this.result.token =
                    firstAfterfirstAfterAtLeastOneSep.terminalType;
                this.result.occurrence =
                    firstAfterfirstAfterAtLeastOneSep.occurrenceInParent;
            }
        }
        else {
            _super.prototype.walkAtLeastOneSep.call(this, atleastOneSepProd, currRest, prevRest);
        }
    };
    return NextTerminalAfterAtLeastOneSepWalker;
}(AbstractNextTerminalAfterProductionWalker));
exports.NextTerminalAfterAtLeastOneSepWalker = NextTerminalAfterAtLeastOneSepWalker;
function possiblePathsFrom(targetDef, maxLength, currPath) {
    if (currPath === void 0) { currPath = []; }
    // avoid side effects
    currPath = utils_1.cloneArr(currPath);
    var result = [];
    var i = 0;
    function remainingPathWith(nextDef) {
        return nextDef.concat(utils_1.drop(targetDef, i + 1));
    }
    function getAlternativesForProd(definition) {
        var alternatives = possiblePathsFrom(remainingPathWith(definition), maxLength, currPath);
        return result.concat(alternatives);
    }
    /**
     * Mandatory productions will halt the loop as the paths computed from their recursive calls will already contain the
     * following (rest) of the targetDef.
     *
     * For optional productions (Option/Repetition/...) the loop will continue to represent the paths that do not include the
     * the optional production.
     */
    while (currPath.length < maxLength && i < targetDef.length) {
        var prod = targetDef[i];
        if (prod instanceof gast_public_1.gast.Flat) {
            return getAlternativesForProd(prod.definition);
        }
        else if (prod instanceof gast_public_1.gast.NonTerminal) {
            return getAlternativesForProd(prod.definition);
        }
        else if (prod instanceof gast_public_1.gast.Option) {
            result = getAlternativesForProd(prod.definition);
        }
        else if (prod instanceof gast_public_1.gast.RepetitionMandatory) {
            return getAlternativesForProd(prod.definition);
        }
        else if (prod instanceof gast_public_1.gast.RepetitionMandatoryWithSeparator) {
            var newDef = [
                new gast_public_1.gast.Flat(prod.definition),
                new gast_public_1.gast.Repetition([
                    new gast_public_1.gast.Terminal(prod.separator)
                ].concat(prod.definition))
            ];
            return getAlternativesForProd(newDef);
        }
        else if (prod instanceof gast_public_1.gast.RepetitionWithSeparator) {
            var newDef = prod.definition.concat([
                new gast_public_1.gast.Repetition([
                    new gast_public_1.gast.Terminal(prod.separator)
                ].concat(prod.definition))
            ]);
            result = getAlternativesForProd(newDef);
        }
        else if (prod instanceof gast_public_1.gast.Repetition) {
            result = getAlternativesForProd(prod.definition);
        }
        else if (prod instanceof gast_public_1.gast.Alternation) {
            utils_1.forEach(prod.definition, function (currAlt) {
                result = getAlternativesForProd(currAlt.definition);
            });
            return result;
        }
        else if (prod instanceof gast_public_1.gast.Terminal) {
            currPath.push(prod.terminalType);
        }
        else {
            /* istanbul ignore next */
            throw Error("non exhaustive match");
        }
        i++;
    }
    result.push({
        partialPath: currPath,
        suffixDef: utils_1.drop(targetDef, i)
    });
    return result;
}
exports.possiblePathsFrom = possiblePathsFrom;
function nextPossibleTokensAfter(initialDef, tokenVector, tokMatcher, maxLookAhead) {
    var EXIT_NON_TERMINAL = "EXIT_NONE_TERMINAL";
    // to avoid creating a new Array each time.
    var EXIT_NON_TERMINAL_ARR = [EXIT_NON_TERMINAL];
    var EXIT_ALTERNATIVE = "EXIT_ALTERNATIVE";
    var foundCompletePath = false;
    var tokenVectorLength = tokenVector.length;
    var minimalAlternativesIndex = tokenVectorLength - maxLookAhead - 1;
    var result = [];
    var possiblePaths = [];
    possiblePaths.push({
        idx: -1,
        def: initialDef,
        ruleStack: [],
        occurrenceStack: []
    });
    while (!utils_1.isEmpty(possiblePaths)) {
        var currPath = possiblePaths.pop();
        // skip alternatives if no more results can be found (assuming deterministic grammar with fixed lookahead)
        if (currPath === EXIT_ALTERNATIVE) {
            if (foundCompletePath &&
                utils_1.last(possiblePaths).idx <= minimalAlternativesIndex) {
                // remove irrelevant alternative
                possiblePaths.pop();
            }
            continue;
        }
        var currDef = currPath.def;
        var currIdx = currPath.idx;
        var currRuleStack = currPath.ruleStack;
        var currOccurrenceStack = currPath.occurrenceStack;
        // For Example: an empty path could exist in a valid grammar in the case of an EMPTY_ALT
        if (utils_1.isEmpty(currDef)) {
            continue;
        }
        var prod = currDef[0];
        if (prod === EXIT_NON_TERMINAL) {
            var nextPath = {
                idx: currIdx,
                def: utils_1.drop(currDef),
                ruleStack: utils_1.dropRight(currRuleStack),
                occurrenceStack: utils_1.dropRight(currOccurrenceStack)
            };
            possiblePaths.push(nextPath);
        }
        else if (prod instanceof gast_public_1.gast.Terminal) {
            if (currIdx < tokenVectorLength - 1) {
                var nextIdx = currIdx + 1;
                var actualToken = tokenVector[nextIdx];
                if (tokMatcher(actualToken, prod.terminalType)) {
                    var nextPath = {
                        idx: nextIdx,
                        def: utils_1.drop(currDef),
                        ruleStack: currRuleStack,
                        occurrenceStack: currOccurrenceStack
                    };
                    possiblePaths.push(nextPath);
                }
                // end of the line
            }
            else if (currIdx === tokenVectorLength - 1) {
                // IGNORE ABOVE ELSE
                result.push({
                    nextTokenType: prod.terminalType,
                    nextTokenOccurrence: prod.occurrenceInParent,
                    ruleStack: currRuleStack,
                    occurrenceStack: currOccurrenceStack
                });
                foundCompletePath = true;
            }
            else {
                /* istanbul ignore next */
                throw Error("non exhaustive match");
            }
        }
        else if (prod instanceof gast_public_1.gast.NonTerminal) {
            var newRuleStack = utils_1.cloneArr(currRuleStack);
            newRuleStack.push(prod.nonTerminalName);
            var newOccurrenceStack = utils_1.cloneArr(currOccurrenceStack);
            newOccurrenceStack.push(prod.occurrenceInParent);
            var nextPath = {
                idx: currIdx,
                def: prod.definition.concat(EXIT_NON_TERMINAL_ARR, utils_1.drop(currDef)),
                ruleStack: newRuleStack,
                occurrenceStack: newOccurrenceStack
            };
            possiblePaths.push(nextPath);
        }
        else if (prod instanceof gast_public_1.gast.Option) {
            // the order of alternatives is meaningful, FILO (Last path will be traversed first).
            var nextPathWithout = {
                idx: currIdx,
                def: utils_1.drop(currDef),
                ruleStack: currRuleStack,
                occurrenceStack: currOccurrenceStack
            };
            possiblePaths.push(nextPathWithout);
            // required marker to avoid backtracking paths whose higher priority alternatives already matched
            possiblePaths.push(EXIT_ALTERNATIVE);
            var nextPathWith = {
                idx: currIdx,
                def: prod.definition.concat(utils_1.drop(currDef)),
                ruleStack: currRuleStack,
                occurrenceStack: currOccurrenceStack
            };
            possiblePaths.push(nextPathWith);
        }
        else if (prod instanceof gast_public_1.gast.RepetitionMandatory) {
            // TODO:(THE NEW operators here take a while...) (convert once?)
            var secondIteration = new gast_public_1.gast.Repetition(prod.definition, prod.occurrenceInParent);
            var nextDef = prod.definition.concat([secondIteration], utils_1.drop(currDef));
            var nextPath = {
                idx: currIdx,
                def: nextDef,
                ruleStack: currRuleStack,
                occurrenceStack: currOccurrenceStack
            };
            possiblePaths.push(nextPath);
        }
        else if (prod instanceof gast_public_1.gast.RepetitionMandatoryWithSeparator) {
            // TODO:(THE NEW operators here take a while...) (convert once?)
            var separatorGast = new gast_public_1.gast.Terminal(prod.separator);
            var secondIteration = new gast_public_1.gast.Repetition([separatorGast].concat(prod.definition), prod.occurrenceInParent);
            var nextDef = prod.definition.concat([secondIteration], utils_1.drop(currDef));
            var nextPath = {
                idx: currIdx,
                def: nextDef,
                ruleStack: currRuleStack,
                occurrenceStack: currOccurrenceStack
            };
            possiblePaths.push(nextPath);
        }
        else if (prod instanceof gast_public_1.gast.RepetitionWithSeparator) {
            // the order of alternatives is meaningful, FILO (Last path will be traversed first).
            var nextPathWithout = {
                idx: currIdx,
                def: utils_1.drop(currDef),
                ruleStack: currRuleStack,
                occurrenceStack: currOccurrenceStack
            };
            possiblePaths.push(nextPathWithout);
            // required marker to avoid backtracking paths whose higher priority alternatives already matched
            possiblePaths.push(EXIT_ALTERNATIVE);
            var separatorGast = new gast_public_1.gast.Terminal(prod.separator);
            var nthRepetition = new gast_public_1.gast.Repetition([separatorGast].concat(prod.definition), prod.occurrenceInParent);
            var nextDef = prod.definition.concat([nthRepetition], utils_1.drop(currDef));
            var nextPathWith = {
                idx: currIdx,
                def: nextDef,
                ruleStack: currRuleStack,
                occurrenceStack: currOccurrenceStack
            };
            possiblePaths.push(nextPathWith);
        }
        else if (prod instanceof gast_public_1.gast.Repetition) {
            // the order of alternatives is meaningful, FILO (Last path will be traversed first).
            var nextPathWithout = {
                idx: currIdx,
                def: utils_1.drop(currDef),
                ruleStack: currRuleStack,
                occurrenceStack: currOccurrenceStack
            };
            possiblePaths.push(nextPathWithout);
            // required marker to avoid backtracking paths whose higher priority alternatives already matched
            possiblePaths.push(EXIT_ALTERNATIVE);
            // TODO: an empty repetition will cause infinite loops here, will the parser detect this in selfAnalysis?
            var nthRepetition = new gast_public_1.gast.Repetition(prod.definition, prod.occurrenceInParent);
            var nextDef = prod.definition.concat([nthRepetition], utils_1.drop(currDef));
            var nextPathWith = {
                idx: currIdx,
                def: nextDef,
                ruleStack: currRuleStack,
                occurrenceStack: currOccurrenceStack
            };
            possiblePaths.push(nextPathWith);
        }
        else if (prod instanceof gast_public_1.gast.Alternation) {
            // the order of alternatives is meaningful, FILO (Last path will be traversed first).
            for (var i = prod.definition.length - 1; i >= 0; i--) {
                var currAlt = prod.definition[i];
                var currAltPath = {
                    idx: currIdx,
                    def: currAlt.definition.concat(utils_1.drop(currDef)),
                    ruleStack: currRuleStack,
                    occurrenceStack: currOccurrenceStack
                };
                possiblePaths.push(currAltPath);
                possiblePaths.push(EXIT_ALTERNATIVE);
            }
        }
        else if (prod instanceof gast_public_1.gast.Flat) {
            possiblePaths.push({
                idx: currIdx,
                def: prod.definition.concat(utils_1.drop(currDef)),
                ruleStack: currRuleStack,
                occurrenceStack: currOccurrenceStack
            });
        }
        else if (prod instanceof gast_public_1.gast.Rule) {
            // last because we should only encounter at most a single one of these per invocation.
            possiblePaths.push(expandTopLevelRule(prod, currIdx, currRuleStack, currOccurrenceStack));
        }
        else {
            /* istanbul ignore next */
            throw Error("non exhaustive match");
        }
    }
    return result;
}
exports.nextPossibleTokensAfter = nextPossibleTokensAfter;
function expandTopLevelRule(topRule, currIdx, currRuleStack, currOccurrenceStack) {
    var newRuleStack = utils_1.cloneArr(currRuleStack);
    newRuleStack.push(topRule.name);
    var newCurrOccurrenceStack = utils_1.cloneArr(currOccurrenceStack);
    // top rule is always assumed to have been called with occurrence index 1
    newCurrOccurrenceStack.push(1);
    return {
        idx: currIdx,
        def: topRule.definition,
        ruleStack: newRuleStack,
        occurrenceStack: newCurrOccurrenceStack
    };
}
//# sourceMappingURL=interpreter.js.map

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var gast_public_1 = __webpack_require__(1);
var utils_1 = __webpack_require__(0);
/**
 *  A Grammar Walker that computes the "remaining" grammar "after" a productions in the grammar.
 */
var RestWalker = /** @class */ (function () {
    function RestWalker() {
    }
    RestWalker.prototype.walk = function (prod, prevRest) {
        var _this = this;
        if (prevRest === void 0) { prevRest = []; }
        utils_1.forEach(prod.definition, function (subProd, index) {
            var currRest = utils_1.drop(prod.definition, index + 1);
            if (subProd instanceof gast_public_1.gast.NonTerminal) {
                _this.walkProdRef(subProd, currRest, prevRest);
            }
            else if (subProd instanceof gast_public_1.gast.Terminal) {
                _this.walkTerminal(subProd, currRest, prevRest);
            }
            else if (subProd instanceof gast_public_1.gast.Flat) {
                _this.walkFlat(subProd, currRest, prevRest);
            }
            else if (subProd instanceof gast_public_1.gast.Option) {
                _this.walkOption(subProd, currRest, prevRest);
            }
            else if (subProd instanceof gast_public_1.gast.RepetitionMandatory) {
                _this.walkAtLeastOne(subProd, currRest, prevRest);
            }
            else if (subProd instanceof gast_public_1.gast.RepetitionMandatoryWithSeparator) {
                _this.walkAtLeastOneSep(subProd, currRest, prevRest);
            }
            else if (subProd instanceof gast_public_1.gast.RepetitionWithSeparator) {
                _this.walkManySep(subProd, currRest, prevRest);
            }
            else if (subProd instanceof gast_public_1.gast.Repetition) {
                _this.walkMany(subProd, currRest, prevRest);
            }
            else if (subProd instanceof gast_public_1.gast.Alternation) {
                _this.walkOr(subProd, currRest, prevRest);
            }
            else {
                /* istanbul ignore next */
                throw Error("non exhaustive match");
            }
        });
    };
    RestWalker.prototype.walkTerminal = function (terminal, currRest, prevRest) { };
    RestWalker.prototype.walkProdRef = function (refProd, currRest, prevRest) { };
    RestWalker.prototype.walkFlat = function (flatProd, currRest, prevRest) {
        // ABCDEF => after the D the rest is EF
        var fullOrRest = currRest.concat(prevRest);
        this.walk(flatProd, fullOrRest);
    };
    RestWalker.prototype.walkOption = function (optionProd, currRest, prevRest) {
        // ABC(DE)?F => after the (DE)? the rest is F
        var fullOrRest = currRest.concat(prevRest);
        this.walk(optionProd, fullOrRest);
    };
    RestWalker.prototype.walkAtLeastOne = function (atLeastOneProd, currRest, prevRest) {
        // ABC(DE)+F => after the (DE)+ the rest is (DE)?F
        var fullAtLeastOneRest = [
            new gast_public_1.gast.Option(atLeastOneProd.definition)
        ].concat(currRest, prevRest);
        this.walk(atLeastOneProd, fullAtLeastOneRest);
    };
    RestWalker.prototype.walkAtLeastOneSep = function (atLeastOneSepProd, currRest, prevRest) {
        // ABC DE(,DE)* F => after the (,DE)+ the rest is (,DE)?F
        var fullAtLeastOneSepRest = restForRepetitionWithSeparator(atLeastOneSepProd, currRest, prevRest);
        this.walk(atLeastOneSepProd, fullAtLeastOneSepRest);
    };
    RestWalker.prototype.walkMany = function (manyProd, currRest, prevRest) {
        // ABC(DE)*F => after the (DE)* the rest is (DE)?F
        var fullManyRest = [
            new gast_public_1.gast.Option(manyProd.definition)
        ].concat(currRest, prevRest);
        this.walk(manyProd, fullManyRest);
    };
    RestWalker.prototype.walkManySep = function (manySepProd, currRest, prevRest) {
        // ABC (DE(,DE)*)? F => after the (,DE)* the rest is (,DE)?F
        var fullManySepRest = restForRepetitionWithSeparator(manySepProd, currRest, prevRest);
        this.walk(manySepProd, fullManySepRest);
    };
    RestWalker.prototype.walkOr = function (orProd, currRest, prevRest) {
        var _this = this;
        // ABC(D|E|F)G => when finding the (D|E|F) the rest is G
        var fullOrRest = currRest.concat(prevRest);
        // walk all different alternatives
        utils_1.forEach(orProd.definition, function (alt) {
            // wrapping each alternative in a single definition wrapper
            // to avoid errors in computing the rest of that alternative in the invocation to computeInProdFollows
            // (otherwise for OR([alt1,alt2]) alt2 will be considered in 'rest' of alt1
            var prodWrapper = new gast_public_1.gast.Flat([alt]);
            _this.walk(prodWrapper, fullOrRest);
        });
    };
    return RestWalker;
}());
exports.RestWalker = RestWalker;
function restForRepetitionWithSeparator(repSepProd, currRest, prevRest) {
    var repSepRest = [
        new gast_public_1.gast.Option([new gast_public_1.gast.Terminal(repSepProd.separator)].concat(repSepProd.definition))
    ];
    var fullRepSepRest = repSepRest.concat(currRest, prevRest);
    return fullRepSepRest;
}
//# sourceMappingURL=rest.js.map

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// needs a separate module as this is required inside chevrotain productive code
// and also in the entry point for webpack(api.ts).
// A separate file avoids cyclic dependencies and webpack errors.
exports.VERSION = "0.34.0";
//# sourceMappingURL=version.js.map

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(0);
var exceptions;
(function (exceptions) {
    var MISMATCHED_TOKEN_EXCEPTION = "MismatchedTokenException";
    var NO_VIABLE_ALT_EXCEPTION = "NoViableAltException";
    var EARLY_EXIT_EXCEPTION = "EarlyExitException";
    var NOT_ALL_INPUT_PARSED_EXCEPTION = "NotAllInputParsedException";
    var RECOGNITION_EXCEPTION_NAMES = [
        MISMATCHED_TOKEN_EXCEPTION,
        NO_VIABLE_ALT_EXCEPTION,
        EARLY_EXIT_EXCEPTION,
        NOT_ALL_INPUT_PARSED_EXCEPTION
    ];
    Object.freeze(RECOGNITION_EXCEPTION_NAMES);
    // hacks to bypass no support for custom Errors in javascript/typescript
    function isRecognitionException(error) {
        // can't do instanceof on hacked custom js exceptions
        return utils_1.contains(RECOGNITION_EXCEPTION_NAMES, error.name);
    }
    exceptions.isRecognitionException = isRecognitionException;
    function MismatchedTokenException(message, token) {
        this.name = MISMATCHED_TOKEN_EXCEPTION;
        this.message = message;
        this.token = token;
        this.resyncedTokens = [];
    }
    exceptions.MismatchedTokenException = MismatchedTokenException;
    // must use the "Error.prototype" instead of "new Error"
    // because the stack trace points to where "new Error" was invoked"
    MismatchedTokenException.prototype = Error.prototype;
    function NoViableAltException(message, token) {
        this.name = NO_VIABLE_ALT_EXCEPTION;
        this.message = message;
        this.token = token;
        this.resyncedTokens = [];
    }
    exceptions.NoViableAltException = NoViableAltException;
    NoViableAltException.prototype = Error.prototype;
    function NotAllInputParsedException(message, token) {
        this.name = NOT_ALL_INPUT_PARSED_EXCEPTION;
        this.message = message;
        this.token = token;
        this.resyncedTokens = [];
    }
    exceptions.NotAllInputParsedException = NotAllInputParsedException;
    NotAllInputParsedException.prototype = Error.prototype;
    function EarlyExitException(message, token) {
        this.name = EARLY_EXIT_EXCEPTION;
        this.message = message;
        this.token = token;
        this.resyncedTokens = [];
    }
    exceptions.EarlyExitException = EarlyExitException;
    EarlyExitException.prototype = Error.prototype;
})(exceptions = exports.exceptions || (exports.exceptions = {}));
//# sourceMappingURL=exceptions_public.js.map

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var utils = __webpack_require__(0);
var utils_1 = __webpack_require__(0);
var parser_public_1 = __webpack_require__(5);
var gast_public_1 = __webpack_require__(1);
var gast_1 = __webpack_require__(7);
var tokens_public_1 = __webpack_require__(2);
var first_1 = __webpack_require__(8);
var lookahead_1 = __webpack_require__(14);
var version_1 = __webpack_require__(11);
var cst_1 = __webpack_require__(15);
function validateGrammar(topLevels, maxLookahead, tokens, ignoredIssues) {
    var duplicateErrors = utils.map(topLevels, validateDuplicateProductions);
    var leftRecursionErrors = utils.map(topLevels, function (currTopRule) {
        return validateNoLeftRecursion(currTopRule, currTopRule);
    });
    var emptyAltErrors = [];
    var ambiguousAltsErrors = [];
    // left recursion could cause infinite loops in the following validations.
    // It is safest to first have the user fix the left recursion errors first and only then examine farther issues.
    if (utils_1.every(leftRecursionErrors, utils_1.isEmpty)) {
        emptyAltErrors = utils_1.map(topLevels, validateEmptyOrAlternative);
        ambiguousAltsErrors = utils_1.map(topLevels, function (currTopRule) {
            return validateAmbiguousAlternationAlternatives(currTopRule, maxLookahead, ignoredIssues);
        });
    }
    var ruleNames = utils_1.map(topLevels, function (currTopLevel) { return currTopLevel.name; });
    var tokenNames = utils_1.map(tokens, function (currToken) { return tokens_public_1.tokenName(currToken); });
    var termsNamespaceConflictErrors = checkTerminalAndNoneTerminalsNameSpace(ruleNames, tokenNames);
    var tokenNameErrors = utils.map(tokenNames, validateTokenName);
    var nestedRulesNameErrors = validateNestedRulesNames(topLevels);
    var nestedRulesDuplicateErrors = validateDuplicateNestedRules(topLevels);
    var emptyRepetitionErrors = validateSomeNonEmptyLookaheadPath(topLevels, maxLookahead);
    return utils.flatten(duplicateErrors.concat(tokenNameErrors, nestedRulesNameErrors, nestedRulesDuplicateErrors, emptyRepetitionErrors, leftRecursionErrors, emptyAltErrors, ambiguousAltsErrors, termsNamespaceConflictErrors));
}
exports.validateGrammar = validateGrammar;
function validateNestedRulesNames(topLevels) {
    var result = [];
    utils_1.forEach(topLevels, function (curTopLevel) {
        var namedCollectorVisitor = new cst_1.NamedDSLMethodsCollectorVisitor("");
        curTopLevel.accept(namedCollectorVisitor);
        var nestedNamesPerRule = utils_1.map(namedCollectorVisitor.result, function (currItem) { return currItem.name; });
        var currTopRuleName = curTopLevel.name;
        result.push(utils_1.map(nestedNamesPerRule, function (currNestedName) {
            return validateNestedRuleName(currNestedName, currTopRuleName);
        }));
    });
    return utils_1.flatten(result);
}
function validateDuplicateProductions(topLevelRule) {
    var collectorVisitor = new OccurrenceValidationCollector();
    topLevelRule.accept(collectorVisitor);
    var allRuleProductions = collectorVisitor.allProductions;
    var productionGroups = utils.groupBy(allRuleProductions, identifyProductionForDuplicates);
    var duplicates = utils.pick(productionGroups, function (currGroup) {
        return currGroup.length > 1;
    });
    var errors = utils.map(utils.values(duplicates), function (currDuplicates) {
        var firstProd = utils.first(currDuplicates);
        var msg = createDuplicatesErrorMessage(currDuplicates, topLevelRule.name);
        var dslName = gast_1.getProductionDslName(firstProd);
        var defError = {
            message: msg,
            type: parser_public_1.ParserDefinitionErrorType.DUPLICATE_PRODUCTIONS,
            ruleName: topLevelRule.name,
            dslName: dslName,
            occurrence: firstProd.occurrenceInParent
        };
        var param = getExtraProductionArgument(firstProd);
        if (param) {
            defError.parameter = param;
        }
        return defError;
    });
    return errors;
}
function createDuplicatesErrorMessage(duplicateProds, topLevelName) {
    var firstProd = utils.first(duplicateProds);
    var index = firstProd.occurrenceInParent;
    var dslName = gast_1.getProductionDslName(firstProd);
    var extraArgument = getExtraProductionArgument(firstProd);
    var msg = "->" + dslName + "<- with occurrence index: ->" + index + "<-\n                  " + (extraArgument ? "and argument: " + extraArgument : "") + "\n                  appears more than once (" + duplicateProds.length + " times) in the top level rule: " + topLevelName + ".\n                  " + (index === 1
        ? "note that " + dslName + " and " + dslName + "1 both have the same occurrence index 1}"
        : "") + "}\n                  to fix this make sure each usage of " + dslName + " " + (extraArgument
        ? "with the argument: " + extraArgument
        : "") + "\n                  in the rule " + topLevelName + " has a different occurrence index (1-5), as that combination acts as a unique\n                  position key in the grammar, which is needed by the parsing engine.";
    // white space trimming time! better to trim afterwards as it allows to use WELL formatted multi line template strings...
    msg = msg.replace(/[ \t]+/g, " ");
    msg = msg.replace(/\s\s+/g, "\n");
    return msg;
}
function identifyProductionForDuplicates(prod) {
    return gast_1.getProductionDslName(prod) + "_#_" + prod.occurrenceInParent + "_#_" + getExtraProductionArgument(prod);
}
exports.identifyProductionForDuplicates = identifyProductionForDuplicates;
function getExtraProductionArgument(prod) {
    if (prod instanceof gast_public_1.gast.Terminal) {
        return tokens_public_1.tokenName(prod.terminalType);
    }
    else if (prod instanceof gast_public_1.gast.NonTerminal) {
        return prod.nonTerminalName;
    }
    else {
        return "";
    }
}
var OccurrenceValidationCollector = /** @class */ (function (_super) {
    __extends(OccurrenceValidationCollector, _super);
    function OccurrenceValidationCollector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allProductions = [];
        return _this;
    }
    OccurrenceValidationCollector.prototype.visitNonTerminal = function (subrule) {
        this.allProductions.push(subrule);
    };
    OccurrenceValidationCollector.prototype.visitOption = function (option) {
        this.allProductions.push(option);
    };
    OccurrenceValidationCollector.prototype.visitRepetitionWithSeparator = function (manySep) {
        this.allProductions.push(manySep);
    };
    OccurrenceValidationCollector.prototype.visitRepetitionMandatory = function (atLeastOne) {
        this.allProductions.push(atLeastOne);
    };
    OccurrenceValidationCollector.prototype.visitRepetitionMandatoryWithSeparator = function (atLeastOneSep) {
        this.allProductions.push(atLeastOneSep);
    };
    OccurrenceValidationCollector.prototype.visitRepetition = function (many) {
        this.allProductions.push(many);
    };
    OccurrenceValidationCollector.prototype.visitAlternation = function (or) {
        this.allProductions.push(or);
    };
    OccurrenceValidationCollector.prototype.visitTerminal = function (terminal) {
        this.allProductions.push(terminal);
    };
    return OccurrenceValidationCollector;
}(gast_public_1.gast.GAstVisitor));
exports.OccurrenceValidationCollector = OccurrenceValidationCollector;
exports.validTermsPattern = /^[a-zA-Z_]\w*$/;
exports.validNestedRuleName = new RegExp(exports.validTermsPattern.source.replace("^", "^\\$"));
function validateRuleName(ruleName) {
    var errors = [];
    var errMsg;
    if (!ruleName.match(exports.validTermsPattern)) {
        errMsg = "Invalid Grammar rule name: ->" + ruleName + "<- it must match the pattern: ->" + exports.validTermsPattern.toString() + "<-";
        errors.push({
            message: errMsg,
            type: parser_public_1.ParserDefinitionErrorType.INVALID_RULE_NAME,
            ruleName: ruleName
        });
    }
    return errors;
}
exports.validateRuleName = validateRuleName;
function validateNestedRuleName(nestedRuleName, containingRuleName) {
    var errors = [];
    var errMsg;
    if (!nestedRuleName.match(exports.validNestedRuleName)) {
        errMsg =
            "Invalid nested rule name: ->" + nestedRuleName + "<- inside rule: ->" + containingRuleName + "<-\n" +
                ("it must match the pattern: ->" + exports.validNestedRuleName.toString() + "<-.\n") +
                "Note that this means a nested rule name must start with the '$'(dollar) sign.";
        errors.push({
            message: errMsg,
            type: parser_public_1.ParserDefinitionErrorType.INVALID_NESTED_RULE_NAME,
            ruleName: nestedRuleName
        });
    }
    return errors;
}
exports.validateNestedRuleName = validateNestedRuleName;
function validateTokenName(tokenNAme) {
    var errors = [];
    var errMsg;
    if (!tokenNAme.match(exports.validTermsPattern)) {
        errMsg = "Invalid Grammar Token name: ->" + tokenNAme + "<- it must match the pattern: ->" + exports.validTermsPattern.toString() + "<-";
        errors.push({
            message: errMsg,
            type: parser_public_1.ParserDefinitionErrorType.INVALID_TOKEN_NAME
        });
    }
    return errors;
}
exports.validateTokenName = validateTokenName;
function validateRuleDoesNotAlreadyExist(ruleName, definedRulesNames, className) {
    var errors = [];
    var errMsg;
    if (utils.contains(definedRulesNames, ruleName)) {
        errMsg = "Duplicate definition, rule: ->" + ruleName + "<- is already defined in the grammar: ->" + className + "<-";
        errors.push({
            message: errMsg,
            type: parser_public_1.ParserDefinitionErrorType.DUPLICATE_RULE_NAME,
            ruleName: ruleName
        });
    }
    return errors;
}
exports.validateRuleDoesNotAlreadyExist = validateRuleDoesNotAlreadyExist;
// TODO: is there anyway to get only the rule names of rules inherited from the super grammars?
function validateRuleIsOverridden(ruleName, definedRulesNames, className) {
    var errors = [];
    var errMsg;
    if (!utils.contains(definedRulesNames, ruleName)) {
        errMsg =
            "Invalid rule override, rule: ->" + ruleName + "<- cannot be overridden in the grammar: ->" + className + "<-" +
                "as it is not defined in any of the super grammars ";
        errors.push({
            message: errMsg,
            type: parser_public_1.ParserDefinitionErrorType.INVALID_RULE_OVERRIDE,
            ruleName: ruleName
        });
    }
    return errors;
}
exports.validateRuleIsOverridden = validateRuleIsOverridden;
function validateNoLeftRecursion(topRule, currRule, path) {
    if (path === void 0) { path = []; }
    var errors = [];
    var nextNonTerminals = getFirstNoneTerminal(currRule.definition);
    if (utils.isEmpty(nextNonTerminals)) {
        return [];
    }
    else {
        var ruleName = topRule.name;
        var foundLeftRecursion = utils.contains(nextNonTerminals, topRule);
        var pathNames = utils.map(path, function (currRule) { return currRule.name; });
        var leftRecursivePath = ruleName + " --> " + pathNames
            .concat([ruleName])
            .join(" --> ");
        if (foundLeftRecursion) {
            var errMsg = "Left Recursion found in grammar.\n" +
                ("rule: <" + ruleName + "> can be invoked from itself (directly or indirectly)\n") +
                ("without consuming any Tokens. The grammar path that causes this is: \n " + leftRecursivePath + "\n") +
                " To fix this refactor your grammar to remove the left recursion.\n" +
                "see: https://en.wikipedia.org/wiki/LL_parser#Left_Factoring.";
            errors.push({
                message: errMsg,
                type: parser_public_1.ParserDefinitionErrorType.LEFT_RECURSION,
                ruleName: ruleName
            });
        }
        // we are only looking for cyclic paths leading back to the specific topRule
        // other cyclic paths are ignored, we still need this difference to avoid infinite loops...
        var validNextSteps = utils.difference(nextNonTerminals, path.concat([topRule]));
        var errorsFromNextSteps = utils.map(validNextSteps, function (currRefRule) {
            var newPath = utils.cloneArr(path);
            newPath.push(currRefRule);
            return validateNoLeftRecursion(topRule, currRefRule, newPath);
        });
        return errors.concat(utils.flatten(errorsFromNextSteps));
    }
}
exports.validateNoLeftRecursion = validateNoLeftRecursion;
function getFirstNoneTerminal(definition) {
    var result = [];
    if (utils.isEmpty(definition)) {
        return result;
    }
    var firstProd = utils.first(definition);
    if (firstProd instanceof gast_public_1.gast.NonTerminal) {
        result.push(firstProd.referencedRule);
    }
    else if (firstProd instanceof gast_public_1.gast.Flat ||
        firstProd instanceof gast_public_1.gast.Option ||
        firstProd instanceof gast_public_1.gast.RepetitionMandatory ||
        firstProd instanceof gast_public_1.gast.RepetitionMandatoryWithSeparator ||
        firstProd instanceof gast_public_1.gast.RepetitionWithSeparator ||
        firstProd instanceof gast_public_1.gast.Repetition) {
        result = result.concat(getFirstNoneTerminal(firstProd.definition));
    }
    else if (firstProd instanceof gast_public_1.gast.Alternation) {
        // each sub definition in alternation is a FLAT
        result = utils.flatten(utils.map(firstProd.definition, function (currSubDef) {
            return getFirstNoneTerminal(currSubDef.definition);
        }));
    }
    else if (firstProd instanceof gast_public_1.gast.Terminal) {
        // nothing to see, move along
    }
    else {
        /* istanbul ignore next */
        throw Error("non exhaustive match");
    }
    var isFirstOptional = gast_1.isOptionalProd(firstProd);
    var hasMore = definition.length > 1;
    if (isFirstOptional && hasMore) {
        var rest = utils.drop(definition);
        return result.concat(getFirstNoneTerminal(rest));
    }
    else {
        return result;
    }
}
exports.getFirstNoneTerminal = getFirstNoneTerminal;
var OrCollector = /** @class */ (function (_super) {
    __extends(OrCollector, _super);
    function OrCollector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.alternations = [];
        return _this;
    }
    OrCollector.prototype.visitAlternation = function (node) {
        this.alternations.push(node);
    };
    return OrCollector;
}(gast_public_1.gast.GAstVisitor));
function validateEmptyOrAlternative(topLevelRule) {
    var orCollector = new OrCollector();
    topLevelRule.accept(orCollector);
    var ors = orCollector.alternations;
    var errors = utils.reduce(ors, function (errors, currOr) {
        var exceptLast = utils.dropRight(currOr.definition);
        var currErrors = utils.map(exceptLast, function (currAlternative, currAltIdx) {
            if (utils.isEmpty(first_1.first(currAlternative))) {
                return {
                    message: "Ambiguous empty alternative: <" + (currAltIdx +
                        1) + ">" +
                        (" in <OR" + currOr.occurrenceInParent + "> inside <" + topLevelRule.name + "> Rule.\n") +
                        "Only the last alternative may be an empty alternative.",
                    type: parser_public_1.ParserDefinitionErrorType.NONE_LAST_EMPTY_ALT,
                    ruleName: topLevelRule.name,
                    occurrence: currOr.occurrenceInParent,
                    alternative: currAltIdx + 1
                };
            }
            else {
                return null;
            }
        });
        return errors.concat(utils.compact(currErrors));
    }, []);
    return errors;
}
exports.validateEmptyOrAlternative = validateEmptyOrAlternative;
function validateAmbiguousAlternationAlternatives(topLevelRule, maxLookahead, ignoredIssues) {
    var orCollector = new OrCollector();
    topLevelRule.accept(orCollector);
    var ors = orCollector.alternations;
    var ignoredIssuesForCurrentRule = ignoredIssues[topLevelRule.name];
    if (ignoredIssuesForCurrentRule) {
        ors = utils_1.reject(ors, function (currOr) {
            return ignoredIssuesForCurrentRule[gast_1.getProductionDslName(currOr) + currOr.occurrenceInParent];
        });
    }
    var errors = utils.reduce(ors, function (result, currOr) {
        var currOccurrence = currOr.occurrenceInParent;
        var alternatives = lookahead_1.getLookaheadPathsForOr(currOccurrence, topLevelRule, maxLookahead);
        var altsAmbiguityErrors = checkAlternativesAmbiguities(alternatives, currOr, topLevelRule.name);
        var altsPrefixAmbiguityErrors = checkPrefixAlternativesAmbiguities(alternatives, currOr, topLevelRule.name);
        return result.concat(altsAmbiguityErrors, altsPrefixAmbiguityErrors);
    }, []);
    return errors;
}
exports.validateAmbiguousAlternationAlternatives = validateAmbiguousAlternationAlternatives;
var RepetionCollector = /** @class */ (function (_super) {
    __extends(RepetionCollector, _super);
    function RepetionCollector() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allProductions = [];
        return _this;
    }
    RepetionCollector.prototype.visitRepetitionWithSeparator = function (manySep) {
        this.allProductions.push(manySep);
    };
    RepetionCollector.prototype.visitRepetitionMandatory = function (atLeastOne) {
        this.allProductions.push(atLeastOne);
    };
    RepetionCollector.prototype.visitRepetitionMandatoryWithSeparator = function (atLeastOneSep) {
        this.allProductions.push(atLeastOneSep);
    };
    RepetionCollector.prototype.visitRepetition = function (many) {
        this.allProductions.push(many);
    };
    return RepetionCollector;
}(gast_public_1.gast.GAstVisitor));
exports.RepetionCollector = RepetionCollector;
function validateSomeNonEmptyLookaheadPath(topLevelRules, maxLookahead) {
    var errors = [];
    utils_1.forEach(topLevelRules, function (currTopRule) {
        var collectorVisitor = new RepetionCollector();
        currTopRule.accept(collectorVisitor);
        var allRuleProductions = collectorVisitor.allProductions;
        utils_1.forEach(allRuleProductions, function (currProd) {
            var prodType = lookahead_1.getProdType(currProd);
            var currOccurrence = currProd.occurrenceInParent;
            var paths = lookahead_1.getLookaheadPathsForOptionalProd(currOccurrence, currTopRule, prodType, maxLookahead);
            var pathsInsideProduction = paths[0];
            if (utils_1.isEmpty(utils_1.flatten(pathsInsideProduction))) {
                var implicitOccurrence = currProd.implicitOccurrenceIndex;
                var dslName = gast_1.getProductionDslName(currProd);
                if (!implicitOccurrence) {
                    dslName += currOccurrence;
                }
                var errMsg = "The repetition <" + dslName + "> within Rule <" + currTopRule.name + "> can never consume any tokens.\n" +
                    "This could lead to an infinite loop.";
                errors.push({
                    message: errMsg,
                    type: parser_public_1.ParserDefinitionErrorType.NO_NON_EMPTY_LOOKAHEAD,
                    ruleName: currTopRule.name
                });
            }
        });
    });
    return errors;
}
exports.validateSomeNonEmptyLookaheadPath = validateSomeNonEmptyLookaheadPath;
function checkAlternativesAmbiguities(alternatives, alternation, topRuleName) {
    var foundAmbiguousPaths = [];
    var identicalAmbiguities = utils_1.reduce(alternatives, function (result, currAlt, currAltIdx) {
        utils_1.forEach(currAlt, function (currPath) {
            var altsCurrPathAppearsIn = [currAltIdx];
            utils_1.forEach(alternatives, function (currOtherAlt, currOtherAltIdx) {
                if (currAltIdx !== currOtherAltIdx &&
                    lookahead_1.containsPath(currOtherAlt, currPath)) {
                    altsCurrPathAppearsIn.push(currOtherAltIdx);
                }
            });
            if (altsCurrPathAppearsIn.length > 1 &&
                !lookahead_1.containsPath(foundAmbiguousPaths, currPath)) {
                foundAmbiguousPaths.push(currPath);
                result.push({
                    alts: altsCurrPathAppearsIn,
                    path: currPath
                });
            }
        });
        return result;
    }, []);
    var currErrors = utils.map(identicalAmbiguities, function (currAmbDescriptor) {
        var ambgIndices = utils_1.map(currAmbDescriptor.alts, function (currAltIdx) { return currAltIdx + 1; });
        var pathMsg = utils_1.map(currAmbDescriptor.path, function (currtok) {
            return tokens_public_1.tokenLabel(currtok);
        }).join(", ");
        var occurrence = alternation.implicitOccurrenceIndex
            ? ""
            : alternation.occurrenceInParent;
        var currMessage = "Ambiguous alternatives: <" + ambgIndices.join(" ,") + "> in <OR" + occurrence + ">" +
            (" inside <" + topRuleName + "> Rule,\n") +
            ("<" + pathMsg + "> may appears as a prefix path in all these alternatives.\n");
        var docs_version = version_1.VERSION.replace(/\./g, "_");
        // Should this information be on the error message or in some common errors docs?
        currMessage =
            currMessage +
                "To Resolve this, try one of of the following: \n" +
                "1. Refactor your grammar to be LL(K) for the current value of k (by default k=5)\n" +
                "2. Increase the value of K for your grammar by providing a larger 'maxLookahead' value in the parser's config\n" +
                "3. This issue can be ignored (if you know what you are doing...), see" +
                " http://sap.github.io/chevrotain/documentation/" +
                docs_version +
                "/interfaces/_chevrotain_d_.iparserconfig.html#ignoredissues for more" +
                " details\n";
        return {
            message: currMessage,
            type: parser_public_1.ParserDefinitionErrorType.AMBIGUOUS_ALTS,
            ruleName: topRuleName,
            occurrence: alternation.occurrenceInParent,
            alternatives: [currAmbDescriptor.alts]
        };
    });
    return currErrors;
}
function checkPrefixAlternativesAmbiguities(alternatives, alternation, ruleName) {
    var errors = [];
    // flatten
    var pathsAndIndices = utils_1.reduce(alternatives, function (result, currAlt, idx) {
        var currPathsAndIdx = utils_1.map(currAlt, function (currPath) {
            return { idx: idx, path: currPath };
        });
        return result.concat(currPathsAndIdx);
    }, []);
    utils_1.forEach(pathsAndIndices, function (currPathAndIdx) {
        var targetIdx = currPathAndIdx.idx;
        var targetPath = currPathAndIdx.path;
        var prefixAmbiguitiesPathsAndIndices = utils_1.findAll(pathsAndIndices, function (searchPathAndIdx) {
            // prefix ambiguity can only be created from lower idx (higher priority) path
            return (searchPathAndIdx.idx < targetIdx &&
                // checking for strict prefix because identical lookaheads
                // will be be detected using a different validation.
                lookahead_1.isStrictPrefixOfPath(searchPathAndIdx.path, targetPath));
        });
        var currPathPrefixErrors = utils_1.map(prefixAmbiguitiesPathsAndIndices, function (currAmbPathAndIdx) {
            var ambgIndices = [currAmbPathAndIdx.idx + 1, targetIdx + 1];
            var pathMsg = utils_1.map(currAmbPathAndIdx.path, function (currTok) {
                return tokens_public_1.tokenLabel(currTok);
            }).join(", ");
            var occurrence = alternation.implicitOccurrenceIndex
                ? ""
                : alternation.occurrenceInParent;
            var currMessage = "Ambiguous alternatives: <" + ambgIndices.join(" ,") + "> due to common lookahead prefix\n" +
                ("in <OR" + occurrence + "> inside <" + ruleName + "> Rule,\n") +
                ("<" + pathMsg + "> may appears as a prefix path in all these alternatives.\n") +
                "See https://github.com/SAP/chevrotain/blob/master/docs/resolving_grammar_errors.md#COMMON_PREFIX\n" +
                "For farther details.";
            return {
                message: currMessage,
                type: parser_public_1.ParserDefinitionErrorType.AMBIGUOUS_PREFIX_ALTS,
                ruleName: ruleName,
                occurrence: occurrence,
                alternatives: ambgIndices
            };
        });
        errors = errors.concat(currPathPrefixErrors);
    });
    return errors;
}
function checkTerminalAndNoneTerminalsNameSpace(ruleNames, terminalNames) {
    var errors = [];
    utils_1.forEach(ruleNames, function (currRuleName) {
        if (utils_1.contains(terminalNames, currRuleName)) {
            var errMsg = "Namespace conflict found in grammar.\n" +
                ("The grammar has both a Terminal(Token) and a Non-Terminal(Rule) named: <" + currRuleName + ">.\n") +
                "To resolve this make sure each Terminal and Non-Terminal names are unique\n" +
                "This is easy to accomplish by using the convention that Terminal names start with an uppercase letter\n" +
                "and Non-Terminal names start with a lower case letter.";
            errors.push({
                message: errMsg,
                type: parser_public_1.ParserDefinitionErrorType.CONFLICT_TOKENS_RULES_NAMESPACE,
                ruleName: currRuleName
            });
        }
    });
    return errors;
}
function validateDuplicateNestedRules(topLevelRules) {
    var errors = [];
    utils_1.forEach(topLevelRules, function (currTopRule) {
        var namedCollectorVisitor = new cst_1.NamedDSLMethodsCollectorVisitor("");
        currTopRule.accept(namedCollectorVisitor);
        var nestedNames = utils_1.map(namedCollectorVisitor.result, function (currItem) { return currItem.name; });
        var namesGroups = utils_1.groupBy(nestedNames, function (item) { return item; });
        var duplicates = utils_1.pick(namesGroups, function (currGroup) {
            return currGroup.length > 1;
        });
        utils_1.forEach(utils_1.values(duplicates), function (currDuplicates) {
            var duplicateName = utils.first(currDuplicates);
            var errMsg = "Duplicate nested rule name: ->" + duplicateName + "<- inside rule: ->" + currTopRule.name + "<-\n" +
                "A nested name must be unique in the scope of a top level grammar rule.";
            errors.push({
                message: errMsg,
                type: parser_public_1.ParserDefinitionErrorType.DUPLICATE_NESTED_NAME,
                ruleName: currTopRule.name
            });
        });
    });
    return errors;
}
//# sourceMappingURL=checks.js.map

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(0);
var gast_public_1 = __webpack_require__(1);
var interpreter_1 = __webpack_require__(9);
var rest_1 = __webpack_require__(10);
var tokens_1 = __webpack_require__(4);
var PROD_TYPE;
(function (PROD_TYPE) {
    PROD_TYPE[PROD_TYPE["OPTION"] = 0] = "OPTION";
    PROD_TYPE[PROD_TYPE["REPETITION"] = 1] = "REPETITION";
    PROD_TYPE[PROD_TYPE["REPETITION_MANDATORY"] = 2] = "REPETITION_MANDATORY";
    PROD_TYPE[PROD_TYPE["REPETITION_MANDATORY_WITH_SEPARATOR"] = 3] = "REPETITION_MANDATORY_WITH_SEPARATOR";
    PROD_TYPE[PROD_TYPE["REPETITION_WITH_SEPARATOR"] = 4] = "REPETITION_WITH_SEPARATOR";
    PROD_TYPE[PROD_TYPE["ALTERNATION"] = 5] = "ALTERNATION";
})(PROD_TYPE = exports.PROD_TYPE || (exports.PROD_TYPE = {}));
function getProdType(prod) {
    if (prod instanceof gast_public_1.gast.Option) {
        return PROD_TYPE.OPTION;
    }
    else if (prod instanceof gast_public_1.gast.Repetition) {
        return PROD_TYPE.REPETITION;
    }
    else if (prod instanceof gast_public_1.gast.RepetitionMandatory) {
        return PROD_TYPE.REPETITION_MANDATORY;
    }
    else if (prod instanceof gast_public_1.gast.RepetitionMandatoryWithSeparator) {
        return PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR;
    }
    else if (prod instanceof gast_public_1.gast.RepetitionWithSeparator) {
        return PROD_TYPE.REPETITION_WITH_SEPARATOR;
    }
    else if (prod instanceof gast_public_1.gast.Alternation) {
        return PROD_TYPE.ALTERNATION;
    }
    else {
        /* istanbul ignore next */
        throw Error("non exhaustive match");
    }
}
exports.getProdType = getProdType;
function buildLookaheadFuncForOr(occurrence, ruleGrammar, k, hasPredicates, dynamicTokensEnabled, laFuncBuilder) {
    var lookAheadPaths = getLookaheadPathsForOr(occurrence, ruleGrammar, k);
    var tokenMatcher = isTokenInheritanceNotUsed(lookAheadPaths)
        ? tokens_1.tokenStructuredMatcherNoInheritance
        : tokens_1.tokenStructuredMatcher;
    return laFuncBuilder(lookAheadPaths, hasPredicates, tokenMatcher, dynamicTokensEnabled);
}
exports.buildLookaheadFuncForOr = buildLookaheadFuncForOr;
/**
 *  When dealing with an Optional production (OPTION/MANY/2nd iteration of AT_LEAST_ONE/...) we need to compare
 *  the lookahead "inside" the production and the lookahead immediately "after" it in the same top level rule (context free).
 *
 *  Example: given a production:
 *  ABC(DE)?DF
 *
 *  The optional '(DE)?' should only be entered if we see 'DE'. a single Token 'D' is not sufficient to distinguish between the two
 *  alternatives.
 *
 *  @returns A Lookahead function which will return true IFF the parser should parse the Optional production.
 */
function buildLookaheadFuncForOptionalProd(occurrence, ruleGrammar, k, dynamicTokensEnabled, prodType, lookaheadBuilder) {
    var lookAheadPaths = getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, k);
    var tokenMatcher = isTokenInheritanceNotUsed(lookAheadPaths)
        ? tokens_1.tokenStructuredMatcherNoInheritance
        : tokens_1.tokenStructuredMatcher;
    return lookaheadBuilder(lookAheadPaths[0], tokenMatcher, dynamicTokensEnabled);
}
exports.buildLookaheadFuncForOptionalProd = buildLookaheadFuncForOptionalProd;
function buildAlternativesLookAheadFunc(alts, hasPredicates, tokenMatcher, dynamicTokensEnabled) {
    var numOfAlts = alts.length;
    var areAllOneTokenLookahead = utils_1.every(alts, function (currAlt) {
        return utils_1.every(currAlt, function (currPath) {
            return currPath.length === 1;
        });
    });
    // This version takes into account the predicates as well.
    if (hasPredicates) {
        /**
         * @returns {number} - The chosen alternative index
         */
        return function (orAlts) {
            // unfortunately the predicates must be extracted every single time
            // as they cannot be cached due to keep references to parameters(vars) which are no longer valid.
            // note that in the common case of no predicates, no cpu time will be wasted on this (see else block)
            var predicates = utils_1.map(orAlts, function (currAlt) { return currAlt.GATE; });
            for (var t = 0; t < numOfAlts; t++) {
                var currAlt = alts[t];
                var currNumOfPaths = currAlt.length;
                var currPredicate = predicates[t];
                if (currPredicate && !currPredicate.call(this)) {
                    // if the predicate does not match there is no point in checking the paths
                    continue;
                }
                nextPath: for (var j = 0; j < currNumOfPaths; j++) {
                    var currPath = currAlt[j];
                    var currPathLength = currPath.length;
                    for (var i = 0; i < currPathLength; i++) {
                        var nextToken = this.LA(i + 1);
                        if (tokenMatcher(nextToken, currPath[i]) === false) {
                            // mismatch in current path
                            // try the next pth
                            continue nextPath;
                        }
                    }
                    // found a full path that matches.
                    // this will also work for an empty ALT as the loop will be skipped
                    return t;
                }
                // none of the paths for the current alternative matched
                // try the next alternative
            }
            // none of the alternatives could be matched
            return undefined;
        };
    }
    else if (areAllOneTokenLookahead && !dynamicTokensEnabled) {
        // optimized (common) case of all the lookaheads paths requiring only
        // a single token lookahead. These Optimizations cannot work if dynamically defined Tokens are used.
        var singleTokenAlts = utils_1.map(alts, function (currAlt) {
            return utils_1.flatten(currAlt);
        });
        var choiceToAlt_1 = utils_1.reduce(singleTokenAlts, function (result, currAlt, idx) {
            utils_1.forEach(currAlt, function (currTokClass) {
                if (!utils_1.has(result, currTokClass.tokenType)) {
                    result[currTokClass.tokenType] = idx;
                }
                utils_1.forEach(currTokClass.extendingTokenTypes, function (currExtendingType) {
                    if (!utils_1.has(result, currExtendingType)) {
                        result[currExtendingType] = idx;
                    }
                });
            });
            return result;
        }, {});
        /**
         * @returns {number} - The chosen alternative index
         */
        return function () {
            var nextToken = this.LA(1);
            return choiceToAlt_1[nextToken.tokenType];
        };
    }
    else {
        // optimized lookahead without needing to check the predicates at all.
        // this causes code duplication which is intentional to improve performance.
        /**
         * @returns {number} - The chosen alternative index
         */
        return function () {
            for (var t = 0; t < numOfAlts; t++) {
                var currAlt = alts[t];
                var currNumOfPaths = currAlt.length;
                nextPath: for (var j = 0; j < currNumOfPaths; j++) {
                    var currPath = currAlt[j];
                    var currPathLength = currPath.length;
                    for (var i = 0; i < currPathLength; i++) {
                        var nextToken = this.LA(i + 1);
                        if (tokenMatcher(nextToken, currPath[i]) === false) {
                            // mismatch in current path
                            // try the next pth
                            continue nextPath;
                        }
                    }
                    // found a full path that matches.
                    // this will also work for an empty ALT as the loop will be skipped
                    return t;
                }
                // none of the paths for the current alternative matched
                // try the next alternative
            }
            // none of the alternatives could be matched
            return undefined;
        };
    }
}
exports.buildAlternativesLookAheadFunc = buildAlternativesLookAheadFunc;
function buildSingleAlternativeLookaheadFunction(alt, tokenMatcher, dynamicTokensEnabled) {
    var areAllOneTokenLookahead = utils_1.every(alt, function (currPath) {
        return currPath.length === 1;
    });
    var numOfPaths = alt.length;
    // optimized (common) case of all the lookaheads paths requiring only
    // a single token lookahead.
    if (areAllOneTokenLookahead && !dynamicTokensEnabled) {
        var singleTokensClasses = utils_1.flatten(alt);
        if (singleTokensClasses.length === 1 &&
            utils_1.isEmpty(singleTokensClasses[0].extendingTokenTypes)) {
            var expectedTokenType = singleTokensClasses[0];
            var expectedTokenUniqueKey_1 = expectedTokenType.tokenType;
            return function () {
                return this.LA(1).tokenType === expectedTokenUniqueKey_1;
            };
        }
        else {
            var choiceToAlt_2 = utils_1.reduce(singleTokensClasses, function (result, currTokClass, idx) {
                result[currTokClass.tokenType] = true;
                utils_1.forEach(currTokClass.extendingTokenTypes, function (currExtendingType) {
                    result[currExtendingType] = true;
                });
                return result;
            }, {});
            return function () {
                var nextToken = this.LA(1);
                return choiceToAlt_2[nextToken.tokenType] === true;
            };
        }
    }
    else {
        return function () {
            nextPath: for (var j = 0; j < numOfPaths; j++) {
                var currPath = alt[j];
                var currPathLength = currPath.length;
                for (var i = 0; i < currPathLength; i++) {
                    var nextToken = this.LA(i + 1);
                    if (tokenMatcher(nextToken, currPath[i]) === false) {
                        // mismatch in current path
                        // try the next pth
                        continue nextPath;
                    }
                }
                // found a full path that matches.
                return true;
            }
            // none of the paths matched
            return false;
        };
    }
}
exports.buildSingleAlternativeLookaheadFunction = buildSingleAlternativeLookaheadFunction;
var RestDefinitionFinderWalker = /** @class */ (function (_super) {
    __extends(RestDefinitionFinderWalker, _super);
    function RestDefinitionFinderWalker(topProd, targetOccurrence, targetProdType) {
        var _this = _super.call(this) || this;
        _this.topProd = topProd;
        _this.targetOccurrence = targetOccurrence;
        _this.targetProdType = targetProdType;
        return _this;
    }
    RestDefinitionFinderWalker.prototype.startWalking = function () {
        this.walk(this.topProd);
        return this.restDef;
    };
    RestDefinitionFinderWalker.prototype.checkIsTarget = function (node, expectedProdType, currRest, prevRest) {
        if (node.occurrenceInParent === this.targetOccurrence &&
            this.targetProdType === expectedProdType) {
            this.restDef = currRest.concat(prevRest);
            return true;
        }
        // performance optimization, do not iterate over the entire Grammar ast after we have found the target
        return false;
    };
    RestDefinitionFinderWalker.prototype.walkOption = function (optionProd, currRest, prevRest) {
        if (!this.checkIsTarget(optionProd, PROD_TYPE.OPTION, currRest, prevRest)) {
            _super.prototype.walkOption.call(this, optionProd, currRest, prevRest);
        }
    };
    RestDefinitionFinderWalker.prototype.walkAtLeastOne = function (atLeastOneProd, currRest, prevRest) {
        if (!this.checkIsTarget(atLeastOneProd, PROD_TYPE.REPETITION_MANDATORY, currRest, prevRest)) {
            _super.prototype.walkOption.call(this, atLeastOneProd, currRest, prevRest);
        }
    };
    RestDefinitionFinderWalker.prototype.walkAtLeastOneSep = function (atLeastOneSepProd, currRest, prevRest) {
        if (!this.checkIsTarget(atLeastOneSepProd, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR, currRest, prevRest)) {
            _super.prototype.walkOption.call(this, atLeastOneSepProd, currRest, prevRest);
        }
    };
    RestDefinitionFinderWalker.prototype.walkMany = function (manyProd, currRest, prevRest) {
        if (!this.checkIsTarget(manyProd, PROD_TYPE.REPETITION, currRest, prevRest)) {
            _super.prototype.walkOption.call(this, manyProd, currRest, prevRest);
        }
    };
    RestDefinitionFinderWalker.prototype.walkManySep = function (manySepProd, currRest, prevRest) {
        if (!this.checkIsTarget(manySepProd, PROD_TYPE.REPETITION_WITH_SEPARATOR, currRest, prevRest)) {
            _super.prototype.walkOption.call(this, manySepProd, currRest, prevRest);
        }
    };
    return RestDefinitionFinderWalker;
}(rest_1.RestWalker));
/**
 * Returns the definition of a target production in a top level level rule.
 */
var InsideDefinitionFinderVisitor = /** @class */ (function (_super) {
    __extends(InsideDefinitionFinderVisitor, _super);
    function InsideDefinitionFinderVisitor(targetOccurrence, targetProdType) {
        var _this = _super.call(this) || this;
        _this.targetOccurrence = targetOccurrence;
        _this.targetProdType = targetProdType;
        _this.result = [];
        return _this;
    }
    InsideDefinitionFinderVisitor.prototype.checkIsTarget = function (node, expectedProdName) {
        if (node.occurrenceInParent === this.targetOccurrence &&
            this.targetProdType === expectedProdName) {
            this.result = node.definition;
        }
    };
    InsideDefinitionFinderVisitor.prototype.visitOption = function (node) {
        this.checkIsTarget(node, PROD_TYPE.OPTION);
    };
    InsideDefinitionFinderVisitor.prototype.visitRepetition = function (node) {
        this.checkIsTarget(node, PROD_TYPE.REPETITION);
    };
    InsideDefinitionFinderVisitor.prototype.visitRepetitionMandatory = function (node) {
        this.checkIsTarget(node, PROD_TYPE.REPETITION_MANDATORY);
    };
    InsideDefinitionFinderVisitor.prototype.visitRepetitionMandatoryWithSeparator = function (node) {
        this.checkIsTarget(node, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR);
    };
    InsideDefinitionFinderVisitor.prototype.visitRepetitionWithSeparator = function (node) {
        this.checkIsTarget(node, PROD_TYPE.REPETITION_WITH_SEPARATOR);
    };
    InsideDefinitionFinderVisitor.prototype.visitAlternation = function (node) {
        this.checkIsTarget(node, PROD_TYPE.ALTERNATION);
    };
    return InsideDefinitionFinderVisitor;
}(gast_public_1.gast.GAstVisitor));
function lookAheadSequenceFromAlternatives(altsDefs, k) {
    function getOtherPaths(pathsAndSuffixes, filterIdx) {
        return utils_1.reduce(pathsAndSuffixes, function (result, currPathsAndSuffixes, currIdx) {
            if (currIdx !== filterIdx) {
                var currPartialPaths = utils_1.map(currPathsAndSuffixes, function (singlePathAndSuffix) { return singlePathAndSuffix.partialPath; });
                return result.concat(currPartialPaths);
            }
            return result;
        }, []);
    }
    function isUniquePrefix(arr, item) {
        return (utils_1.find(arr, function (currOtherPath) {
            return utils_1.every(item, function (currPathTok, idx) { return currPathTok === currOtherPath[idx]; });
        }) === undefined);
    }
    function initializeArrayOfArrays(size) {
        var result = [];
        for (var i = 0; i < size; i++) {
            result.push([]);
        }
        return result;
    }
    var partialAlts = utils_1.map(altsDefs, function (currAlt) { return interpreter_1.possiblePathsFrom([currAlt], 1); });
    var finalResult = initializeArrayOfArrays(partialAlts.length);
    var newData = partialAlts;
    // maxLookahead loop
    for (var pathLength = 1; pathLength <= k; pathLength++) {
        var currDataset = newData;
        newData = initializeArrayOfArrays(currDataset.length);
        // alternatives loop
        for (var resultIdx = 0; resultIdx < currDataset.length; resultIdx++) {
            var currAltPathsAndSuffixes = currDataset[resultIdx];
            var otherPaths = getOtherPaths(currDataset, resultIdx);
            // paths in current alternative loop
            for (var currPathIdx = 0; currPathIdx < currAltPathsAndSuffixes.length; currPathIdx++) {
                var currPathPrefix = currAltPathsAndSuffixes[currPathIdx].partialPath;
                var suffixDef = currAltPathsAndSuffixes[currPathIdx].suffixDef;
                var isUnique = isUniquePrefix(otherPaths, currPathPrefix);
                // even if a path is not unique, but there are no longer alternatives to try
                // or if we have reached the maximum lookahead (k) permitted.
                if (isUnique ||
                    utils_1.isEmpty(suffixDef) ||
                    currPathPrefix.length === k) {
                    var currAltResult = finalResult[resultIdx];
                    if (!containsPath(currAltResult, currPathPrefix)) {
                        currAltResult.push(currPathPrefix);
                    }
                }
                else {
                    var newPartialPathsAndSuffixes = interpreter_1.possiblePathsFrom(suffixDef, pathLength + 1, currPathPrefix);
                    newData[resultIdx] = newData[resultIdx].concat(newPartialPathsAndSuffixes);
                }
            }
        }
    }
    return finalResult;
}
exports.lookAheadSequenceFromAlternatives = lookAheadSequenceFromAlternatives;
function getLookaheadPathsForOr(occurrence, ruleGrammar, k) {
    var visitor = new InsideDefinitionFinderVisitor(occurrence, PROD_TYPE.ALTERNATION);
    ruleGrammar.accept(visitor);
    return lookAheadSequenceFromAlternatives(visitor.result, k);
}
exports.getLookaheadPathsForOr = getLookaheadPathsForOr;
function getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, k) {
    var insideDefVisitor = new InsideDefinitionFinderVisitor(occurrence, prodType);
    ruleGrammar.accept(insideDefVisitor);
    var insideDef = insideDefVisitor.result;
    var afterDefWalker = new RestDefinitionFinderWalker(ruleGrammar, occurrence, prodType);
    var afterDef = afterDefWalker.startWalking();
    var insideFlat = new gast_public_1.gast.Flat(insideDef);
    var afterFlat = new gast_public_1.gast.Flat(afterDef);
    return lookAheadSequenceFromAlternatives([insideFlat, afterFlat], k);
}
exports.getLookaheadPathsForOptionalProd = getLookaheadPathsForOptionalProd;
function containsPath(alternative, path) {
    var found = utils_1.find(alternative, function (otherPath) {
        return (path.length === otherPath.length &&
            utils_1.every(path, function (targetItem, idx) {
                return targetItem === otherPath[idx];
            }));
    });
    return found !== undefined;
}
exports.containsPath = containsPath;
function isStrictPrefixOfPath(prefix, other) {
    return (prefix.length < other.length &&
        utils_1.every(prefix, function (tokType, idx) {
            return tokType === other[idx];
        }));
}
exports.isStrictPrefixOfPath = isStrictPrefixOfPath;
function isTokenInheritanceNotUsed(lookAheadPaths) {
    return utils_1.every(lookAheadPaths, function (singleAltPaths) {
        return utils_1.every(singleAltPaths, function (singlePath) {
            return utils_1.every(singlePath, function (token) { return utils_1.isEmpty(token.extendingTokenTypes); });
        });
    });
}
exports.isTokenInheritanceNotUsed = isTokenInheritanceNotUsed;
//# sourceMappingURL=lookahead.js.map

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var tokens_public_1 = __webpack_require__(2);
var gast_public_1 = __webpack_require__(1);
var utils_1 = __webpack_require__(0);
var lang_extensions_1 = __webpack_require__(3);
var keys_1 = __webpack_require__(16);
var GAstVisitor = gast_public_1.gast.GAstVisitor;
function addTerminalToCst(node, token, tokenTypeName) {
    ;
    node.children[tokenTypeName].push(token);
}
exports.addTerminalToCst = addTerminalToCst;
function addNoneTerminalToCst(node, ruleName, ruleResult) {
    ;
    node.children[ruleName].push(ruleResult);
}
exports.addNoneTerminalToCst = addNoneTerminalToCst;
var NamedDSLMethodsCollectorVisitor = /** @class */ (function (_super) {
    __extends(NamedDSLMethodsCollectorVisitor, _super);
    function NamedDSLMethodsCollectorVisitor(ruleIdx) {
        var _this = _super.call(this) || this;
        _this.result = [];
        _this.ruleIdx = ruleIdx;
        return _this;
    }
    NamedDSLMethodsCollectorVisitor.prototype.collectNamedDSLMethod = function (node, newNodeConstructor, methodIdx) {
        if (!utils_1.isUndefined(node.name)) {
            // copy without name so this will indeed be processed later.
            var nameLessNode = void 0;
            if (utils_1.has(node, "separator")) {
                // hack to avoid code duplication and refactoring the Gast type declaration / constructors arguments order.
                nameLessNode = new newNodeConstructor(node.definition, node.separator, node.occurrenceInParent);
            }
            else {
                nameLessNode = new newNodeConstructor(node.definition, node.occurrenceInParent);
            }
            var def = [nameLessNode];
            var key = keys_1.getKeyForAutomaticLookahead(this.ruleIdx, methodIdx, node.occurrenceInParent);
            this.result.push({ def: def, key: key, name: node.name });
        }
    };
    NamedDSLMethodsCollectorVisitor.prototype.visitOption = function (node) {
        this.collectNamedDSLMethod(node, gast_public_1.gast.Option, keys_1.OPTION_IDX);
    };
    NamedDSLMethodsCollectorVisitor.prototype.visitRepetition = function (node) {
        this.collectNamedDSLMethod(node, gast_public_1.gast.Repetition, keys_1.MANY_IDX);
    };
    NamedDSLMethodsCollectorVisitor.prototype.visitRepetitionMandatory = function (node) {
        this.collectNamedDSLMethod(node, gast_public_1.gast.RepetitionMandatory, keys_1.AT_LEAST_ONE_IDX);
    };
    NamedDSLMethodsCollectorVisitor.prototype.visitRepetitionMandatoryWithSeparator = function (node) {
        this.collectNamedDSLMethod(node, gast_public_1.gast.RepetitionMandatoryWithSeparator, keys_1.AT_LEAST_ONE_SEP_IDX);
    };
    NamedDSLMethodsCollectorVisitor.prototype.visitRepetitionWithSeparator = function (node) {
        this.collectNamedDSLMethod(node, gast_public_1.gast.RepetitionWithSeparator, keys_1.MANY_SEP_IDX);
    };
    NamedDSLMethodsCollectorVisitor.prototype.visitAlternation = function (node) {
        var _this = this;
        this.collectNamedDSLMethod(node, gast_public_1.gast.Alternation, keys_1.OR_IDX);
        var hasMoreThanOneAlternative = node.definition.length > 1;
        utils_1.forEach(node.definition, function (currFlatAlt, altIdx) {
            if (!utils_1.isUndefined(currFlatAlt.name)) {
                var def = currFlatAlt.definition;
                if (hasMoreThanOneAlternative) {
                    def = [new gast_public_1.gast.Option(currFlatAlt.definition)];
                }
                else {
                    // mandatory
                    def = currFlatAlt.definition;
                }
                var key = keys_1.getKeyForAltIndex(_this.ruleIdx, keys_1.OR_IDX, node.occurrenceInParent, altIdx);
                _this.result.push({
                    def: def,
                    key: key,
                    name: currFlatAlt.name
                });
            }
        });
    };
    return NamedDSLMethodsCollectorVisitor;
}(GAstVisitor));
exports.NamedDSLMethodsCollectorVisitor = NamedDSLMethodsCollectorVisitor;
function analyzeCst(topRules, fullToShortName) {
    var result = { dictDef: new lang_extensions_1.HashTable(), allRuleNames: [] };
    utils_1.forEach(topRules, function (currTopRule) {
        var currChildrenNames = buildChildDictionaryDef(currTopRule.definition);
        var currTopRuleShortName = fullToShortName.get(currTopRule.name);
        result.dictDef.put(currTopRuleShortName, buildInitDefFunc(currChildrenNames));
        result.allRuleNames.push(currTopRule.name);
        var namedCollectorVisitor = new NamedDSLMethodsCollectorVisitor(currTopRuleShortName);
        currTopRule.accept(namedCollectorVisitor);
        utils_1.forEach(namedCollectorVisitor.result, function (_a) {
            var def = _a.def, key = _a.key, name = _a.name;
            var currNestedChildrenNames = buildChildDictionaryDef(def);
            result.dictDef.put(key, buildInitDefFunc(currNestedChildrenNames));
            result.allRuleNames.push(currTopRule.name + name);
        });
    });
    return result;
}
exports.analyzeCst = analyzeCst;
function buildInitDefFunc(childrenNames) {
    var oneOfTheseObjects = {}
    utils_1.map(childrenNames, function (currName) {
        oneOfTheseObjects[currName] = []
    })

    // ben fisher, 2017:
    // I don't want to use new Function() because it's basically eval
    // this workaround should provide the same behavior.
    // is it really true that it needs to create a new object every time?
    // if so, it's correct that I am creating an entirely new object.
    // I'm using JSON to make a clone. 
    var serialized = JSON.stringify(oneOfTheseObjects)
        
    return function() {
        return JSON.parse(serialized)
    }

    // var funcString = "return {\n";
    // funcString += utils_1.map(childrenNames, function (currName) { return "\"" + currName + "\" : []"; }).join(",\n");
    // funcString += "}";
    // major performance optimization, faster to create the children dictionary this way
    // versus iterating over the childrenNames each time.
    // return Function(funcString);
}
function buildChildDictionaryDef(initialDef) {
    var result = [];
    var possiblePaths = [];
    possiblePaths.push({ def: initialDef });
    var currDef;
    var currInIteration;
    var currInOption;
    var currResult;
    function addSingleItemToResult(itemName) {
        result.push(itemName);
        var nextPath = {
            def: utils_1.drop(currDef),
            inIteration: currInIteration,
            inOption: currInOption,
            currResult: utils_1.cloneObj(currResult)
        };
        possiblePaths.push(nextPath);
    }
    while (!utils_1.isEmpty(possiblePaths)) {
        var currPath = possiblePaths.pop();
        currDef = currPath.def;
        currInIteration = currPath.inIteration;
        currInOption = currPath.inOption;
        currResult = currPath.currResult;
        // For Example: an empty path could exist in a valid grammar in the case of an EMPTY_ALT
        if (utils_1.isEmpty(currDef)) {
            continue;
        }
        var prod = currDef[0];
        if (prod instanceof gast_public_1.gast.Terminal) {
            var terminalName = tokens_public_1.tokenName(prod.terminalType);
            addSingleItemToResult(terminalName);
        }
        else if (prod instanceof gast_public_1.gast.NonTerminal) {
            var nonTerminalName = prod.nonTerminalName;
            addSingleItemToResult(nonTerminalName);
        }
        else if (prod instanceof gast_public_1.gast.Option) {
            if (!utils_1.isUndefined(prod.name)) {
                addSingleItemToResult(prod.name);
            }
            else {
                var nextPathWith = {
                    def: prod.definition.concat(utils_1.drop(currDef))
                };
                possiblePaths.push(nextPathWith);
            }
        }
        else if (prod instanceof gast_public_1.gast.RepetitionMandatory ||
            prod instanceof gast_public_1.gast.Repetition) {
            if (!utils_1.isUndefined(prod.name)) {
                addSingleItemToResult(prod.name);
            }
            else {
                var nextDef = prod.definition.concat(utils_1.drop(currDef));
                var nextPath = {
                    def: nextDef
                };
                possiblePaths.push(nextPath);
            }
        }
        else if (prod instanceof gast_public_1.gast.RepetitionMandatoryWithSeparator ||
            prod instanceof gast_public_1.gast.RepetitionWithSeparator) {
            if (!utils_1.isUndefined(prod.name)) {
                addSingleItemToResult(prod.name);
            }
            else {
                var separatorGast = new gast_public_1.gast.Terminal(prod.separator);
                var secondIteration = new gast_public_1.gast.Repetition([separatorGast].concat(prod.definition), prod.occurrenceInParent);
                // Hack: X (, X)* --> (, X) because it is identical in terms of identifying "isCollection?"
                var nextDef = [secondIteration].concat(utils_1.drop(currDef));
                var nextPath = {
                    def: nextDef
                };
                possiblePaths.push(nextPath);
            }
        }
        else if (prod instanceof gast_public_1.gast.Alternation) {
            /* istanbul ignore else */
            // IGNORE ABOVE ELSE
            if (!utils_1.isUndefined(prod.name)) {
                addSingleItemToResult(prod.name);
            }
            else {
                // the order of alternatives is meaningful, FILO (Last path will be traversed first).
                for (var i = prod.definition.length - 1; i >= 0; i--) {
                    var currAlt = prod.definition[i];
                    // named alternatives
                    if (!utils_1.isUndefined(currAlt.name)) {
                        addSingleItemToResult(currAlt.name);
                    }
                    else {
                        var newDef = currAlt.definition.concat(utils_1.drop(currDef));
                        var currAltPath = {
                            def: newDef
                        };
                        possiblePaths.push(currAltPath);
                    }
                }
            }
        }
        else {
            /* istanbul ignore next */ throw Error("non exhaustive match");
        }
    }
    return result;
}
exports.buildChildDictionaryDef = buildChildDictionaryDef;
//# sourceMappingURL=cst.js.map

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Lookahead keys are 32Bit integers in the form
// TTTTTTTTT-ZZZZZZZZZZZZZZZ-YYYY-XXXX
// XXXX -> Occurrence Index bitmap.
// YYYY -> DSL Method Name bitmap.
// ZZZZZZZZZZZZZZZ -> Rule short Index bitmap.
// TTTTTTTTT -> alternation alternative index bitmap
Object.defineProperty(exports, "__esModule", { value: true });
exports.BITS_FOR_METHOD_IDX = 4;
exports.BITS_FOR_OCCURRENCE_IDX = 4;
exports.BITS_FOR_RULE_IDX = 24;
// TODO: validation, this means that there may at most 2^8 --> 256 alternatives for an alternation.
exports.BITS_FOR_ALT_IDX = 8;
// short string used as part of mapping keys.
// being short improves the performance when composing KEYS for maps out of these
// The 5 - 8 bits (16 possible values, are reserved for the DSL method indices)
/* tslint:disable */
exports.OR_IDX = 1 << exports.BITS_FOR_METHOD_IDX;
exports.OPTION_IDX = 2 << exports.BITS_FOR_METHOD_IDX;
exports.MANY_IDX = 3 << exports.BITS_FOR_METHOD_IDX;
exports.AT_LEAST_ONE_IDX = 4 << exports.BITS_FOR_METHOD_IDX;
exports.MANY_SEP_IDX = 5 << exports.BITS_FOR_METHOD_IDX;
exports.AT_LEAST_ONE_SEP_IDX = 6 << exports.BITS_FOR_METHOD_IDX;
/* tslint:enable */
// this actually returns a number, but it is always used as a string (object prop key)
function getKeyForAutomaticLookahead(ruleIdx, dslMethodIdx, occurrence) {
    /* tslint:disable */
    return occurrence | dslMethodIdx | ruleIdx;
    /* tslint:enable */
}
exports.getKeyForAutomaticLookahead = getKeyForAutomaticLookahead;
var BITS_START_FOR_ALT_IDX = 32 - exports.BITS_FOR_ALT_IDX;
function getKeyForAltIndex(ruleIdx, dslMethodIdx, occurrence, altIdx) {
    /* tslint:disable */
    // alternative indices are zero based, thus must always add one (turn on one bit) to guarantee uniqueness.
    var altIdxBitMap = (altIdx + 1) << BITS_START_FOR_ALT_IDX;
    return (getKeyForAutomaticLookahead(ruleIdx, dslMethodIdx, occurrence) |
        altIdxBitMap);
    /* tslint:enable */
}
exports.getKeyForAltIndex = getKeyForAltIndex;
//# sourceMappingURL=keys.js.map

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// TODO: can this be removed? where is it used?
exports.IN = "_~IN~_";
//# sourceMappingURL=constants.js.map

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tokens_public_1 = __webpack_require__(2);
var utils_1 = __webpack_require__(0);
/**
 * This is the default logic Chevrotain uses to construct error messages.
 * When constructing a custom error message provider it may be used as a reference
 * or reused.
 */
exports.defaultErrorProvider = {
    buildMismatchTokenMessage: function (_a) {
        var expected = _a.expected, actual = _a.actual, ruleName = _a.ruleName;
        var hasLabel = tokens_public_1.hasTokenLabel(expected);
        var expectedMsg = hasLabel
            ? "--> " + tokens_public_1.tokenLabel(expected) + " <--"
            : "token of type --> " + tokens_public_1.tokenName(expected) + " <--";
        var msg = "Expecting " + expectedMsg + " but found --> '" + actual.image + "' <--";
        return msg;
    },
    buildNotAllInputParsedMessage: function (_a) {
        var firstRedundant = _a.firstRedundant, ruleName = _a.ruleName;
        return ("Redundant input, expecting EOF but found: " + firstRedundant.image);
    },
    buildNoViableAltMessage: function (_a) {
        var expectedPathsPerAlt = _a.expectedPathsPerAlt, actual = _a.actual, customUserDescription = _a.customUserDescription, ruleName = _a.ruleName;
        var errPrefix = "Expecting: ";
        // TODO: issue: No Viable Alternative Error may have incomplete details. #502
        var actualText = utils_1.first(actual).image;
        var errSuffix = "\nbut found: '" + actualText + "'";
        if (customUserDescription) {
            return errPrefix + customUserDescription + errSuffix;
        }
        else {
            var allLookAheadPaths = utils_1.reduce(expectedPathsPerAlt, function (result, currAltPaths) { return result.concat(currAltPaths); }, []);
            var nextValidTokenSequences = utils_1.map(allLookAheadPaths, function (currPath) {
                return "[" + utils_1.map(currPath, function (currTokenClass) {
                    return tokens_public_1.tokenLabel(currTokenClass);
                }).join(", ") + "]";
            });
            var nextValidSequenceItems = utils_1.map(nextValidTokenSequences, function (itemMsg, idx) { return "  " + (idx + 1) + ". " + itemMsg; });
            var calculatedDescription = "one of these possible Token sequences:\n" + nextValidSequenceItems.join("\n");
            return errPrefix + calculatedDescription + errSuffix;
        }
    },
    buildEarlyExitMessage: function (_a) {
        var expectedIterationPaths = _a.expectedIterationPaths, actual = _a.actual, customUserDescription = _a.customUserDescription, ruleName = _a.ruleName;
        var errPrefix = "Expecting: ";
        // TODO: issue: No Viable Alternative Error may have incomplete details. #502
        var actualText = utils_1.first(actual).image;
        var errSuffix = "\nbut found: '" + actualText + "'";
        if (customUserDescription) {
            return errPrefix + customUserDescription + errSuffix;
        }
        else {
            var nextValidTokenSequences = utils_1.map(expectedIterationPaths, function (currPath) {
                return "[" + utils_1.map(currPath, function (currTokenClass) {
                    return tokens_public_1.tokenLabel(currTokenClass);
                }).join(",") + "]";
            });
            var calculatedDescription = "expecting at least one iteration which starts with one of these possible Token sequences::\n  " +
                ("<" + nextValidTokenSequences.join(" ,") + ">");
            return errPrefix + calculatedDescription + errSuffix;
        }
    }
};
Object.freeze(exports.defaultErrorProvider);
//# sourceMappingURL=errors_public.js.map

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tokens_public_1 = __webpack_require__(2);
var lexer_1 = __webpack_require__(26);
var utils_1 = __webpack_require__(0);
var tokens_1 = __webpack_require__(4);
var LexerDefinitionErrorType;
(function (LexerDefinitionErrorType) {
    LexerDefinitionErrorType[LexerDefinitionErrorType["MISSING_PATTERN"] = 0] = "MISSING_PATTERN";
    LexerDefinitionErrorType[LexerDefinitionErrorType["INVALID_PATTERN"] = 1] = "INVALID_PATTERN";
    LexerDefinitionErrorType[LexerDefinitionErrorType["EOI_ANCHOR_FOUND"] = 2] = "EOI_ANCHOR_FOUND";
    LexerDefinitionErrorType[LexerDefinitionErrorType["UNSUPPORTED_FLAGS_FOUND"] = 3] = "UNSUPPORTED_FLAGS_FOUND";
    LexerDefinitionErrorType[LexerDefinitionErrorType["DUPLICATE_PATTERNS_FOUND"] = 4] = "DUPLICATE_PATTERNS_FOUND";
    LexerDefinitionErrorType[LexerDefinitionErrorType["INVALID_GROUP_TYPE_FOUND"] = 5] = "INVALID_GROUP_TYPE_FOUND";
    LexerDefinitionErrorType[LexerDefinitionErrorType["PUSH_MODE_DOES_NOT_EXIST"] = 6] = "PUSH_MODE_DOES_NOT_EXIST";
    LexerDefinitionErrorType[LexerDefinitionErrorType["MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE"] = 7] = "MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE";
    LexerDefinitionErrorType[LexerDefinitionErrorType["MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY"] = 8] = "MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY";
    LexerDefinitionErrorType[LexerDefinitionErrorType["MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST"] = 9] = "MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST";
    LexerDefinitionErrorType[LexerDefinitionErrorType["LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED"] = 10] = "LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED";
    LexerDefinitionErrorType[LexerDefinitionErrorType["SOI_ANCHOR_FOUND"] = 11] = "SOI_ANCHOR_FOUND";
    LexerDefinitionErrorType[LexerDefinitionErrorType["EMPTY_MATCH_PATTERN"] = 12] = "EMPTY_MATCH_PATTERN";
    LexerDefinitionErrorType[LexerDefinitionErrorType["NO_LINE_BREAKS_FLAGS"] = 13] = "NO_LINE_BREAKS_FLAGS";
})(LexerDefinitionErrorType = exports.LexerDefinitionErrorType || (exports.LexerDefinitionErrorType = {}));
var DEFAULT_LEXER_CONFIG = {
    deferDefinitionErrorsHandling: false,
    positionTracking: "full",
    debug: false,
    lineTerminatorsPattern: /\n|\r\n?/g
};
Object.freeze(DEFAULT_LEXER_CONFIG);
var Lexer = /** @class */ (function () {
    /**
     * @param {SingleModeLexerDefinition | IMultiModeLexerDefinition} lexerDefinition -
     *  Structure composed of constructor functions for the Tokens types this lexer will support.
     *
     *  In the case of {SingleModeLexerDefinition} the structure is simply an array of Token constructors.
     *  In the case of {IMultiModeLexerDefinition} the structure is an object with two properties:
     *    1. a "modes" property where each value is an array of Token.
     *    2. a "defaultMode" property specifying the initial lexer mode.
     *
     *  constructors.
     *
     *  for example:
     *  {
     *     "modes" : {
     *     "modeX" : [Token1, Token2]
     *     "modeY" : [Token3, Token4]
     *     }
     *
     *     "defaultMode" : "modeY"
     *  }
     *
     *  A lexer with {MultiModesDefinition} is simply multiple Lexers where only one (mode) can be active at the same time.
     *  This is useful for lexing languages where there are different lexing rules depending on context.
     *
     *  The current lexing mode is selected via a "mode stack".
     *  The last (peek) value in the stack will be the current mode of the lexer.
     *
     *  Each Token class can define that it will cause the Lexer to (after consuming an instance of the Token):
     *  1. PUSH_MODE : push a new mode to the "mode stack"
     *  2. POP_MODE  : pop the last mode from the "mode stack"
     *
     *  Examples:
     *       export class Attribute extends Token {
     *          static PATTERN = ...
     *          static PUSH_MODE = "modeY"
     *       }
     *
     *       export class EndAttribute extends Token {
     *          static PATTERN = ...
     *          static POP_MODE = true
     *       }
     *
     *  The Token constructors must be in one of these forms:
     *
     *  1. With a PATTERN property that has a RegExp value for tokens to match:
     *     example: -->class Integer extends Token { static PATTERN = /[1-9]\d }<--
     *
     *  2. With a PATTERN property that has the value of the var Lexer.NA defined above.
     *     This is a convenience form used to avoid matching Token classes that only act as categories.
     *     example: -->class Keyword extends Token { static PATTERN = NA }<--
     *
     *
     *   The following RegExp patterns are not supported:
     *   a. '$' for match at end of input
     *   b. /b global flag
     *   c. /m multi-line flag
     *
     *   The Lexer will identify the first pattern that matches, Therefor the order of Token Constructors may be significant.
     *   For example when one pattern may match a prefix of another pattern.
     *
     *   Note that there are situations in which we may wish to order the longer pattern after the shorter one.
     *   For example: keywords vs Identifiers.
     *   'do'(/do/) and 'donald'(/w+)
     *
     *   * If the Identifier pattern appears before the 'do' pattern, both 'do' and 'donald'
     *     will be lexed as an Identifier.
     *
     *   * If the 'do' pattern appears before the Identifier pattern 'do' will be lexed correctly as a keyword.
     *     however 'donald' will be lexed as TWO separate tokens: keyword 'do' and identifier 'nald'.
     *
     *   To resolve this problem, add a static property on the keyword's constructor named: LONGER_ALT
     *   example:
     *
     *       export class Identifier extends Keyword { static PATTERN = /[_a-zA-Z][_a-zA-Z0-9]/ }
     *       export class Keyword extends Token {
     *          static PATTERN = lex.NA
     *          static LONGER_ALT = Identifier
     *       }
     *       export class Do extends Keyword { static PATTERN = /do/ }
     *       export class While extends Keyword { static PATTERN = /while/ }
     *       export class Return extends Keyword { static PATTERN = /return/ }
     *
     *   The lexer will then also attempt to match a (longer) Identifier each time a keyword is matched.
     *
     *
     * @param {ILexerConfig} [config=DEFAULT_LEXER_CONFIG] -
     *                  The Lexer's configuration @see {ILexerConfig} for details.
     */
    function Lexer(lexerDefinition, config) {
        if (config === void 0) { config = DEFAULT_LEXER_CONFIG; }
        var _this = this;
        this.lexerDefinition = lexerDefinition;
        this.lexerDefinitionErrors = [];
        this.patternIdxToConfig = {};
        this.modes = [];
        this.emptyGroups = {};
        this.config = undefined;
        this.trackStartLines = true;
        this.trackEndLines = true;
        this.hasCustom = false;
        if (typeof config === "boolean") {
            throw Error("The second argument to the Lexer constructor is now an ILexerConfig Object.\n" +
                "a boolean 2nd argument is no longer supported");
        }
        // todo: defaults func?
        this.config = utils_1.merge(DEFAULT_LEXER_CONFIG, config);
        if (this.config.lineTerminatorsPattern ===
            DEFAULT_LEXER_CONFIG.lineTerminatorsPattern) {
            // optimized built-in implementation for the defaults definition of lineTerminators
            this.config.lineTerminatorsPattern = lexer_1.LineTerminatorOptimizedTester;
        }
        if (this.config.debug === true) {
            console.log("Running the Lexer in Debug Mode, DO NOT ENABLE THIS IN PRODUCTIVE ENV!");
        }
        this.trackStartLines = /full|onlyStart/i.test(this.config.positionTracking);
        this.trackEndLines = /full/i.test(this.config.positionTracking);
        var hasOnlySingleMode = true;
        var actualDefinition;
        // Convert SingleModeLexerDefinition into a IMultiModeLexerDefinition.
        if (utils_1.isArray(lexerDefinition)) {
            actualDefinition = { modes: {} };
            actualDefinition.modes[lexer_1.DEFAULT_MODE] = utils_1.cloneArr(lexerDefinition);
            actualDefinition[lexer_1.DEFAULT_MODE] = lexer_1.DEFAULT_MODE;
        }
        else {
            // no conversion needed, input should already be a IMultiModeLexerDefinition
            hasOnlySingleMode = false;
            actualDefinition = utils_1.cloneObj(lexerDefinition);
        }
        this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(lexer_1.performRuntimeChecks(actualDefinition, this.trackStartLines));
        // for extra robustness to avoid throwing an none informative error message
        actualDefinition.modes = actualDefinition.modes
            ? actualDefinition.modes
            : {};
        // an error of undefined TokenClasses will be detected in "performRuntimeChecks" above.
        // this transformation is to increase robustness in the case of partially invalid lexer definition.
        utils_1.forEach(actualDefinition.modes, function (currModeValue, currModeName) {
            actualDefinition.modes[currModeName] = utils_1.reject(currModeValue, function (currTokClass) { return utils_1.isUndefined(currTokClass); });
        });
        var allModeNames = utils_1.keys(actualDefinition.modes);
        utils_1.forEach(actualDefinition.modes, function (currModDef, currModName) {
            _this.modes.push(currModName);
            _this.lexerDefinitionErrors = _this.lexerDefinitionErrors.concat(lexer_1.validatePatterns(currModDef, allModeNames));
            // If definition errors were encountered, the analysis phase may fail unexpectedly/
            // Considering a lexer with definition errors may never be used, there is no point
            // to performing the analysis anyhow...
            if (utils_1.isEmpty(_this.lexerDefinitionErrors)) {
                tokens_1.augmentTokenClasses(currModDef);
                var currAnalyzeResult = lexer_1.analyzeTokenClasses(currModDef);
                _this.patternIdxToConfig[currModName] =
                    currAnalyzeResult.patternIdxToConfig;
                _this.emptyGroups = utils_1.merge(_this.emptyGroups, currAnalyzeResult.emptyGroups);
                _this.hasCustom =
                    currAnalyzeResult.hasCustom || _this.hasCustom;
            }
        });
        this.defaultMode = actualDefinition.defaultMode;
        if (!utils_1.isEmpty(this.lexerDefinitionErrors) &&
            !this.config.deferDefinitionErrorsHandling) {
            var allErrMessages = utils_1.map(this.lexerDefinitionErrors, function (error) {
                return error.message;
            });
            var allErrMessagesString = allErrMessages.join("-----------------------\n");
            throw new Error("Errors detected in definition of Lexer:\n" +
                allErrMessagesString);
        }
        // Choose the relevant internal implementations for this specific parser.
        // These implementations should be in-lined by the JavaScript engine
        // to provide optimal performance in each scenario.
        if (lexer_1.SUPPORT_STICKY) {
            this.chopInput = utils_1.IDENTITY;
            this.match = this.matchWithTest;
        }
        else {
            this.updateLastIndex = utils_1.NOOP;
            this.match = this.matchWithExec;
        }
        if (hasOnlySingleMode) {
            this.handleModes = utils_1.NOOP;
        }
        if (this.trackStartLines === false) {
            this.computeNewColumn = utils_1.IDENTITY;
        }
        if (this.trackEndLines === false) {
            this.updateTokenEndLineColumnLocation = utils_1.NOOP;
        }
        if (/full/i.test(this.config.positionTracking)) {
            this.createTokenInstance = this.createFullToken;
        }
        else if (/onlyStart/i.test(this.config.positionTracking)) {
            this.createTokenInstance = this.createStartOnlyToken;
        }
        else if (/onlyOffset/i.test(this.config.positionTracking)) {
            this.createTokenInstance = this.createOffsetOnlyToken;
        }
        else {
            throw Error("Invalid <positionTracking> config option: \"" + this.config
                .positionTracking + "\"");
        }
        if (this.hasCustom) {
            this.addToken = this.addTokenUsingPush;
        }
        else {
            this.addToken = this.addTokenUsingMemberAccess;
        }
    }
    /**
     * Will lex(Tokenize) a string.
     * Note that this can be called repeatedly on different strings as this method
     * does not modify the state of the Lexer.
     *
     * @param {string} text - The string to lex
     * @param {string} [initialMode] - The initial Lexer Mode to start with, by default this will be the first mode in the lexer's
     *                                 definition. If the lexer has no explicit modes it will be the implicit single 'default_mode' mode.
     *
     * @returns {ILexingResult}
     */
    Lexer.prototype.tokenize = function (text, initialMode) {
        if (initialMode === void 0) { initialMode = this.defaultMode; }
        if (!utils_1.isEmpty(this.lexerDefinitionErrors)) {
            var allErrMessages = utils_1.map(this.lexerDefinitionErrors, function (error) {
                return error.message;
            });
            var allErrMessagesString = allErrMessages.join("-----------------------\n");
            throw new Error("Unable to Tokenize because Errors detected in definition of Lexer:\n" +
                allErrMessagesString);
        }
        var lexResult = this.tokenizeInternal(text, initialMode);
        if (this.config.debug === true) {
            this.addTokenTypeNamesToResult(lexResult);
        }
        return lexResult;
    };
    // There is quite a bit of duplication between this and "tokenizeInternalLazy"
    // This is intentional due to performance considerations.
    Lexer.prototype.tokenizeInternal = function (text, initialMode) {
        var _this = this;
        var i, j, matchAltImage, longerAltIdx, matchedImage, imageLength, group, tokType, newToken, errLength, droppedChar, msg, match;
        var orgText = text;
        var orgLength = orgText.length;
        var offset = 0;
        var matchedTokensIndex = 0;
        // initializing the tokensArray to the "guessed" size.
        // guessing too little will still reduce the number of array re-sizes on pushes.
        // guessing too large (Tested by guessing x4 too large) may cost a bit more of memory
        // but would still have a faster runtime by avoiding (All but one) array resizing.
        var guessedNumberOfTokens = this.hasCustom
            ? 0 // will break custom token pattern APIs the matchedTokens array will contain undefined elements.
            : Math.floor(text.length / 10);
        var matchedTokens = new Array(guessedNumberOfTokens);
        var errors = [];
        var line = this.trackStartLines ? 1 : undefined;
        var column = this.trackStartLines ? 1 : undefined;
        var groups = lexer_1.cloneEmptyGroups(this.emptyGroups);
        var trackLines = this.trackStartLines;
        var lineTerminatorPattern = this.config.lineTerminatorsPattern;
        var currModePatternsLength = 0;
        var patternIdxToConfig = [];
        var modeStack = [];
        var pop_mode = function (popToken) {
            // TODO: perhaps avoid this error in the edge case there is no more input?
            if (modeStack.length === 1) {
                // if we try to pop the last mode there lexer will no longer have ANY mode.
                // thus the pop is ignored, an error will be created and the lexer will continue parsing in the previous mode.
                var msg_1 = "Unable to pop Lexer Mode after encountering Token ->" + popToken.image + "<- The Mode Stack is empty";
                errors.push({
                    offset: popToken.startOffset,
                    line: popToken.startLine !== undefined
                        ? popToken.startLine
                        : undefined,
                    column: popToken.startColumn !== undefined
                        ? popToken.startColumn
                        : undefined,
                    length: popToken.image.length,
                    message: msg_1
                });
            }
            else {
                modeStack.pop();
                var newMode = utils_1.last(modeStack);
                patternIdxToConfig = _this.patternIdxToConfig[newMode];
                currModePatternsLength = patternIdxToConfig.length;
            }
        };
        function push_mode(newMode) {
            modeStack.push(newMode);
            patternIdxToConfig = this.patternIdxToConfig[newMode];
            currModePatternsLength = patternIdxToConfig.length;
        }
        // this pattern seems to avoid a V8 de-optimization, although that de-optimization does not
        // seem to matter performance wise.
        push_mode.call(this, initialMode);
        var currConfig;
        while (offset < orgLength) {
            matchedImage = null;
            for (i = 0; i < currModePatternsLength; i++) {
                currConfig = patternIdxToConfig[i];
                var currPattern = currConfig.pattern;
                // manually in-lined because > 600 chars won't be in-lined in V8
                var singleCharCode = currConfig.short;
                if (singleCharCode !== false) {
                    if (orgText.charCodeAt(offset) === singleCharCode) {
                        // single character string
                        matchedImage = currPattern;
                    }
                }
                else if (currConfig.isCustom === true) {
                    match = currPattern.exec(orgText, offset, matchedTokens, groups);
                    matchedImage = match !== null ? match[0] : match;
                }
                else {
                    this.updateLastIndex(currPattern, offset);
                    matchedImage = this.match(currPattern, text, offset);
                }
                if (matchedImage !== null) {
                    // even though this pattern matched we must try a another longer alternative.
                    // this can be used to prioritize keywords over identifiers
                    longerAltIdx = currConfig.longerAlt;
                    if (longerAltIdx !== undefined) {
                        // TODO: micro optimize, avoid extra prop access
                        // by saving/linking longerAlt on the original config?
                        var longerAltConfig = patternIdxToConfig[longerAltIdx];
                        var longerAltPattern = longerAltConfig.pattern;
                        // single Char can never be a longer alt so no need to test it.
                        // manually in-lined because > 600 chars won't be in-lined in V8
                        if (longerAltConfig.isCustom === true) {
                            match = longerAltPattern.exec(orgText, offset, matchedTokens, groups);
                            matchAltImage = match !== null ? match[0] : match;
                        }
                        else {
                            this.updateLastIndex(longerAltPattern, offset);
                            matchAltImage = this.match(longerAltPattern, text, offset);
                        }
                        if (matchAltImage &&
                            matchAltImage.length > matchedImage.length) {
                            matchedImage = matchAltImage;
                            currConfig = longerAltConfig;
                        }
                    }
                    break;
                }
            }
            // successful match
            if (matchedImage !== null) {
                // matchedImage = match[0]
                imageLength = matchedImage.length;
                group = currConfig.group;
                if (group !== undefined) {
                    tokType = currConfig.tokenType;
                    // TODO: "offset + imageLength" and the new column may be computed twice in case of "full" location information inside
                    // createFullToken method
                    newToken = this.createTokenInstance(matchedImage, offset, tokType, line, column, imageLength);
                    if (group === false) {
                        matchedTokensIndex = this.addToken(matchedTokens, matchedTokensIndex, newToken);
                    }
                    else {
                        groups[group].push(newToken);
                    }
                }
                text = this.chopInput(text, imageLength);
                offset = offset + imageLength;
                // TODO: with newlines the column may be assigned twice
                column = this.computeNewColumn(column, imageLength);
                if (trackLines === true &&
                    currConfig.canLineTerminator === true) {
                    var numOfLTsInMatch = 0;
                    var foundTerminator = void 0;
                    var lastLTEndOffset = void 0;
                    lineTerminatorPattern.lastIndex = 0;
                    do {
                        foundTerminator = lineTerminatorPattern.test(matchedImage);
                        if (foundTerminator === true) {
                            lastLTEndOffset =
                                lineTerminatorPattern.lastIndex - 1;
                            numOfLTsInMatch++;
                        }
                    } while (foundTerminator);
                    if (numOfLTsInMatch !== 0) {
                        line = line + numOfLTsInMatch;
                        column = imageLength - lastLTEndOffset;
                        this.updateTokenEndLineColumnLocation(newToken, group, lastLTEndOffset, numOfLTsInMatch, line, column, imageLength);
                    }
                }
                // will be NOOP if no modes present
                this.handleModes(i, currConfig, pop_mode, push_mode, newToken);
            }
            else {
                // error recovery, drop characters until we identify a valid token's start point
                var errorStartOffset = offset;
                var errorLine = line;
                var errorColumn = column;
                var foundResyncPoint = false;
                while (!foundResyncPoint && offset < orgLength) {
                    // drop chars until we succeed in matching something
                    droppedChar = orgText.charCodeAt(offset);
                    // Identity Func (when sticky flag is enabled)
                    text = this.chopInput(text, 1);
                    offset++;
                    for (j = 0; j < currModePatternsLength; j++) {
                        var currConfig_1 = patternIdxToConfig[j];
                        var currPattern = currConfig_1.pattern;
                        // manually in-lined because > 600 chars won't be in-lined in V8
                        var singleCharCode = currConfig_1.short;
                        if (singleCharCode !== false) {
                            if (orgText.charCodeAt(offset) === singleCharCode) {
                                // single character string
                                foundResyncPoint = true;
                            }
                        }
                        else if (currConfig_1.isCustom === true) {
                            foundResyncPoint =
                                currPattern.exec(orgText, offset, matchedTokens, groups) !== null;
                        }
                        else {
                            this.updateLastIndex(currPattern, offset);
                            foundResyncPoint = currPattern.exec(text) !== null;
                        }
                        if (foundResyncPoint === true) {
                            break;
                        }
                    }
                }
                errLength = offset - errorStartOffset;
                // at this point we either re-synced or reached the end of the input text
                msg =
                    "unexpected character: ->" + orgText.charAt(errorStartOffset) + "<- at offset: " + errorStartOffset + "," +
                        (" skipped " + (offset - errorStartOffset) + " characters.");
                errors.push({
                    offset: errorStartOffset,
                    line: errorLine,
                    column: errorColumn,
                    length: errLength,
                    message: msg
                });
            }
        }
        // if we do have custom patterns which push directly into the
        if (!this.hasCustom) {
            // if we guessed a too large size for the tokens array this will shrink it to the right size.
            matchedTokens.length = matchedTokensIndex;
        }
        return {
            tokens: matchedTokens,
            groups: groups,
            errors: errors
        };
    };
    Lexer.prototype.handleModes = function (i, config, pop_mode, push_mode, newToken) {
        if (config.pop === true) {
            // need to save the PUSH_MODE property as if the mode is popped
            // patternIdxToPopMode is updated to reflect the new mode after popping the stack
            var pushMode = config.push;
            pop_mode(newToken);
            if (pushMode !== undefined) {
                push_mode.call(this, pushMode);
            }
        }
        else if (config.push !== undefined) {
            push_mode.call(this, config.push);
        }
    };
    Lexer.prototype.chopInput = function (text, length) {
        return text.substring(length);
    };
    Lexer.prototype.updateLastIndex = function (regExp, newLastIndex) {
        regExp.lastIndex = newLastIndex;
    };
    // TODO: decrease this under 600 characters? inspect stripping comments option in TSC compiler
    Lexer.prototype.updateTokenEndLineColumnLocation = function (newToken, group, lastLTIdx, numOfLTsInMatch, line, column, imageLength) {
        var lastCharIsLT, fixForEndingInLT;
        if (group !== undefined) {
            // a none skipped multi line Token, need to update endLine/endColumn
            lastCharIsLT = lastLTIdx === imageLength - 1;
            fixForEndingInLT = lastCharIsLT ? -1 : 0;
            if (!(numOfLTsInMatch === 1 && lastCharIsLT === true)) {
                // if a token ends in a LT that last LT only affects the line numbering of following Tokens
                newToken.endLine = line + fixForEndingInLT;
                // the last LT in a token does not affect the endColumn either as the [columnStart ... columnEnd)
                // inclusive to exclusive range.
                newToken.endColumn = column - 1 + -fixForEndingInLT;
            }
            // else single LT in the last character of a token, no need to modify the endLine/EndColumn
        }
    };
    Lexer.prototype.computeNewColumn = function (oldColumn, imageLength) {
        return oldColumn + imageLength;
    };
    // Place holder, will be replaced by the correct variant according to the locationTracking option at runtime.
    /* istanbul ignore next - place holder */
    Lexer.prototype.createTokenInstance = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return null;
    };
    Lexer.prototype.createOffsetOnlyToken = function (image, startOffset, tokenType) {
        return {
            image: image,
            startOffset: startOffset,
            tokenType: tokenType
        };
    };
    Lexer.prototype.createStartOnlyToken = function (image, startOffset, tokenType, startLine, startColumn) {
        return {
            image: image,
            startOffset: startOffset,
            startLine: startLine,
            startColumn: startColumn,
            tokenType: tokenType
        };
    };
    Lexer.prototype.createFullToken = function (image, startOffset, tokenType, startLine, startColumn, imageLength) {
        return {
            image: image,
            startOffset: startOffset,
            endOffset: startOffset + imageLength - 1,
            startLine: startLine,
            endLine: startLine,
            startColumn: startColumn,
            endColumn: startColumn + imageLength - 1,
            tokenType: tokenType
        };
    };
    Lexer.prototype.addTokenTypeNamesToResult = function (lexResult) {
        utils_1.forEach(lexResult.tokens, function (currToken) {
            currToken.tokenClassName = tokens_public_1.tokenName(tokens_public_1.getTokenConstructor(currToken));
        });
        utils_1.forEach(lexResult.groups, function (currGroup) {
            utils_1.forEach(currGroup, function (currToken) {
                currToken.tokenClassName = tokens_public_1.tokenName(tokens_public_1.getTokenConstructor(currToken));
            });
        });
    };
    // Place holder, will be replaced by the correct variant according to the locationTracking option at runtime.
    /* istanbul ignore next - place holder */
    Lexer.prototype.addToken = function (tokenVector, index, tokenToAdd) {
        return 666;
    };
    Lexer.prototype.addTokenUsingPush = function (tokenVector, index, tokenToAdd) {
        tokenVector.push(tokenToAdd);
        return index;
    };
    Lexer.prototype.addTokenUsingMemberAccess = function (tokenVector, index, tokenToAdd) {
        tokenVector[index] = tokenToAdd;
        index++;
        return index;
    };
    /* istanbul ignore next - place holder to be replaced with chosen alternative at runtime */
    Lexer.prototype.match = function (pattern, text, offset) {
        return null;
    };
    Lexer.prototype.matchWithTest = function (pattern, text, offset) {
        var found = pattern.test(text);
        if (found === true) {
            return text.substring(offset, pattern.lastIndex);
        }
        return null;
    };
    Lexer.prototype.matchWithExec = function (pattern, text) {
        var regExpArray = pattern.exec(text);
        return regExpArray !== null ? regExpArray[0] : regExpArray;
    };
    Lexer.SKIPPED = "This marks a skipped Token pattern, this means each token identified by it will" +
        "be consumed and then thrown into oblivion, this can be used to for example to completely ignore whitespace.";
    Lexer.NA = /NOT_APPLICABLE/;
    return Lexer;
}());
exports.Lexer = Lexer;
//# sourceMappingURL=lexer_public.js.map

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var parser_public_1 = __webpack_require__(5);
var lexer_public_1 = __webpack_require__(19);
var tokens_public_1 = __webpack_require__(2);
var exceptions_public_1 = __webpack_require__(12);
var gast_public_1 = __webpack_require__(1);
var cache_public_1 = __webpack_require__(27);
var interpreter_1 = __webpack_require__(9);
var version_1 = __webpack_require__(11);
var errors_public_1 = __webpack_require__(18);
var render_public_1 = __webpack_require__(28);
/**
 * defines the public API of
 * changes here may require major version change. (semVer)
 */
var API = {};
// semantic version
API.VERSION = version_1.VERSION;
// runtime API
API.Parser = parser_public_1.Parser;
API.ParserDefinitionErrorType = parser_public_1.ParserDefinitionErrorType;
API.Lexer = lexer_public_1.Lexer;
API.LexerDefinitionErrorType = lexer_public_1.LexerDefinitionErrorType;
API.Token = tokens_public_1.Token;
API.EOF = tokens_public_1.EOF;
// Tokens utilities
API.tokenName = tokens_public_1.tokenName;
API.tokenLabel = tokens_public_1.tokenLabel;
API.tokenMatcher = tokens_public_1.tokenMatcher;
API.createToken = tokens_public_1.createToken;
API.createTokenInstance = tokens_public_1.createTokenInstance;
API.getTokenConstructor = tokens_public_1.getTokenConstructor;
// Other Utilities
API.EMPTY_ALT = parser_public_1.EMPTY_ALT;
API.defaultErrorProvider = errors_public_1.defaultErrorProvider;
API.exceptions = {};
API.exceptions.isRecognitionException = exceptions_public_1.exceptions.isRecognitionException;
API.exceptions.EarlyExitException = exceptions_public_1.exceptions.EarlyExitException;
API.exceptions.MismatchedTokenException = exceptions_public_1.exceptions.MismatchedTokenException;
API.exceptions.NotAllInputParsedException =
    exceptions_public_1.exceptions.NotAllInputParsedException;
API.exceptions.NoViableAltException = exceptions_public_1.exceptions.NoViableAltException;
// grammar reflection API
API.gast = {};
API.gast.GAstVisitor = gast_public_1.gast.GAstVisitor;
API.gast.Flat = gast_public_1.gast.Flat;
API.gast.Repetition = gast_public_1.gast.Repetition;
API.gast.RepetitionWithSeparator = gast_public_1.gast.RepetitionWithSeparator;
API.gast.RepetitionMandatory = gast_public_1.gast.RepetitionMandatory;
API.gast.RepetitionMandatoryWithSeparator =
    gast_public_1.gast.RepetitionMandatoryWithSeparator;
API.gast.Option = gast_public_1.gast.Option;
API.gast.Alternation = gast_public_1.gast.Alternation;
API.gast.NonTerminal = gast_public_1.gast.NonTerminal;
API.gast.Terminal = gast_public_1.gast.Terminal;
API.gast.Rule = gast_public_1.gast.Rule;
API.gast.serializeGrammar = gast_public_1.gast.serializeGrammar;
API.gast.serializeProduction = gast_public_1.gast.serializeProduction;
API.interperter = {};
API.interperter.NextAfterTokenWalker = interpreter_1.NextAfterTokenWalker;
API.clearCache = cache_public_1.clearCache;
API.createSyntaxDiagramsCode = render_public_1.createSyntaxDiagramsCode;
module.exports = API;
//# sourceMappingURL=api.js.map

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var parser_public_1 = __webpack_require__(5);
var gast_public_1 = __webpack_require__(1);
var utils_1 = __webpack_require__(0);
function resolveGrammar(topLevels) {
    var refResolver = new GastRefResolverVisitor(topLevels);
    refResolver.resolveRefs();
    return refResolver.errors;
}
exports.resolveGrammar = resolveGrammar;
var GastRefResolverVisitor = /** @class */ (function (_super) {
    __extends(GastRefResolverVisitor, _super);
    function GastRefResolverVisitor(nameToTopRule) {
        var _this = _super.call(this) || this;
        _this.nameToTopRule = nameToTopRule;
        _this.errors = [];
        return _this;
    }
    GastRefResolverVisitor.prototype.resolveRefs = function () {
        var _this = this;
        utils_1.forEach(this.nameToTopRule.values(), function (prod) {
            _this.currTopLevel = prod;
            prod.accept(_this);
        });
    };
    GastRefResolverVisitor.prototype.visitNonTerminal = function (node) {
        var ref = this.nameToTopRule.get(node.nonTerminalName);
        if (!ref) {
            var msg = "Invalid grammar, reference to a rule which is not defined: ->" +
                node.nonTerminalName +
                "<-\n" +
                "inside top level rule: ->" +
                this.currTopLevel.name +
                "<-";
            this.errors.push({
                message: msg,
                type: parser_public_1.ParserDefinitionErrorType.UNRESOLVED_SUBRULE_REF,
                ruleName: this.currTopLevel.name,
                unresolvedRefName: node.nonTerminalName
            });
        }
        else {
            node.referencedRule = ref;
        }
    };
    return GastRefResolverVisitor;
}(gast_public_1.gast.GAstVisitor));
exports.GastRefResolverVisitor = GastRefResolverVisitor;
//# sourceMappingURL=resolver.js.map

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rest_1 = __webpack_require__(10);
var lang_extensions_1 = __webpack_require__(3);
var gast_public_1 = __webpack_require__(1);
var first_1 = __webpack_require__(8);
var utils_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(17);
var tokens_public_1 = __webpack_require__(2);
// This ResyncFollowsWalker computes all of the follows required for RESYNC
// (skipping reference production).
var ResyncFollowsWalker = /** @class */ (function (_super) {
    __extends(ResyncFollowsWalker, _super);
    function ResyncFollowsWalker(topProd) {
        var _this = _super.call(this) || this;
        _this.topProd = topProd;
        _this.follows = new lang_extensions_1.HashTable();
        return _this;
    }
    ResyncFollowsWalker.prototype.startWalking = function () {
        this.walk(this.topProd);
        return this.follows;
    };
    ResyncFollowsWalker.prototype.walkTerminal = function (terminal, currRest, prevRest) {
        // do nothing! just like in the public sector after 13:00
    };
    ResyncFollowsWalker.prototype.walkProdRef = function (refProd, currRest, prevRest) {
        var followName = buildBetweenProdsFollowPrefix(refProd.referencedRule, refProd.occurrenceInParent) + this.topProd.name;
        var fullRest = currRest.concat(prevRest);
        var restProd = new gast_public_1.gast.Flat(fullRest);
        var t_in_topProd_follows = first_1.first(restProd);
        this.follows.put(followName, t_in_topProd_follows);
    };
    return ResyncFollowsWalker;
}(rest_1.RestWalker));
exports.ResyncFollowsWalker = ResyncFollowsWalker;
function computeAllProdsFollows(topProductions) {
    var reSyncFollows = new lang_extensions_1.HashTable();
    utils_1.forEach(topProductions, function (topProd) {
        var currRefsFollow = new ResyncFollowsWalker(topProd).startWalking();
        reSyncFollows.putAll(currRefsFollow);
    });
    return reSyncFollows;
}
exports.computeAllProdsFollows = computeAllProdsFollows;
function buildBetweenProdsFollowPrefix(inner, occurenceInParent) {
    return inner.name + occurenceInParent + constants_1.IN;
}
exports.buildBetweenProdsFollowPrefix = buildBetweenProdsFollowPrefix;
function buildInProdFollowPrefix(terminal) {
    var terminalName = tokens_public_1.tokenName(terminal.terminalType);
    return terminalName + terminal.occurrenceInParent + constants_1.IN;
}
exports.buildInProdFollowPrefix = buildInProdFollowPrefix;
//# sourceMappingURL=follow.js.map

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var range_1 = __webpack_require__(24);
var gast_public_1 = __webpack_require__(1);
var utils_1 = __webpack_require__(0);
var ProdType;
(function (ProdType) {
    ProdType[ProdType["OPTION"] = 0] = "OPTION";
    ProdType[ProdType["OR"] = 1] = "OR";
    ProdType[ProdType["MANY"] = 2] = "MANY";
    ProdType[ProdType["MANY_SEP"] = 3] = "MANY_SEP";
    ProdType[ProdType["AT_LEAST_ONE"] = 4] = "AT_LEAST_ONE";
    ProdType[ProdType["AT_LEAST_ONE_SEP"] = 5] = "AT_LEAST_ONE_SEP";
    ProdType[ProdType["REF"] = 6] = "REF";
    ProdType[ProdType["TERMINAL"] = 7] = "TERMINAL";
    ProdType[ProdType["FLAT"] = 8] = "FLAT";
})(ProdType = exports.ProdType || (exports.ProdType = {}));
var namePropRegExp = /(?:\s*{\s*NAME\s*:\s*["'`]([\w$]*)["'`])?/;
var namePropRegExpNoCurlyFirstOfTwo = new RegExp(namePropRegExp.source
    .replace("{", "")
    .replace(")?", "\\s*,)?"));
var terminalRegEx = /\.\s*CONSUME(\d)?\s*\(\s*(?:[a-zA-Z_$]\w*\s*\.\s*)*([a-zA-Z_$]\w*)/;
var terminalRegGlobal = new RegExp(terminalRegEx.source, "g");
var refRegEx = /\.\s*SUBRULE(\d)?\s*\(\s*(?:[a-zA-Z_$]\w*\s*\.\s*)*([a-zA-Z_$]\w*)/;
var refRegExGlobal = new RegExp(refRegEx.source, "g");
var optionPrefixRegEx = /\.\s*OPTION(\d)?\s*\(/;
var optionRegEx = new RegExp(optionPrefixRegEx.source + namePropRegExp.source);
var optionRegExGlobal = new RegExp(optionPrefixRegEx.source, "g");
var manyPrefixRegEx = /\.\s*MANY(\d)?\s*\(/;
var manyRegEx = new RegExp(manyPrefixRegEx.source + namePropRegExp.source);
var manyRegExGlobal = new RegExp(manyPrefixRegEx.source, "g");
var sepPropRegEx = /\s*SEP\s*:\s*(?:[a-zA-Z_$]\w*\s*\.\s*)*([a-zA-Z_$]\w*)/;
var manySepPrefixRegEx = /\.\s*MANY_SEP(\d)?\s*\(\s*{/;
var manyWithSeparatorRegEx = new RegExp(manySepPrefixRegEx.source +
    namePropRegExpNoCurlyFirstOfTwo.source +
    sepPropRegEx.source);
var manyWithSeparatorRegExGlobal = new RegExp(manyWithSeparatorRegEx.source, "g");
var atLeastOneSepPrefixRegEx = /\.\s*AT_LEAST_ONE_SEP(\d)?\s*\(\s*{/;
var atLeastOneWithSeparatorRegEx = new RegExp(atLeastOneSepPrefixRegEx.source +
    namePropRegExpNoCurlyFirstOfTwo.source +
    sepPropRegEx.source);
var atLeastOneWithSeparatorRegExGlobal = new RegExp(atLeastOneWithSeparatorRegEx.source, "g");
var atLeastOnePrefixRegEx = /\.\s*AT_LEAST_ONE(\d)?\s*\(/;
var atLeastOneRegEx = new RegExp(atLeastOnePrefixRegEx.source + namePropRegExp.source);
var atLeastOneRegExGlobal = new RegExp(atLeastOnePrefixRegEx.source, "g");
var orPrefixRegEx = /\.\s*OR(\d)?\s*\(/;
var orRegEx = new RegExp(orPrefixRegEx.source + namePropRegExp.source);
var orRegExGlobal = new RegExp(orPrefixRegEx.source, "g");
var orPartSuffixRegEx = /\s*(ALT)\s*:/;
var orPartRegEx = new RegExp(namePropRegExpNoCurlyFirstOfTwo.source + orPartSuffixRegEx.source);
var orPartRegExGlobal = new RegExp(orPartRegEx.source, "g");
exports.terminalNameToConstructor = {};
function buildTopProduction(impelText, name, terminals) {
    // pseudo state. so little state does not yet mandate the complexity of wrapping in a class...
    // TODO: this is confusing, might be time to create a class..
    exports.terminalNameToConstructor = terminals;
    // the top most range must strictly contain all the other ranges
    // which is why we prefix the text with " " (curr Range impel is only for positive ranges)
    var spacedImpelText = " " + impelText;
    // TODO: why do we add whitespace twice?
    var txtWithoutComments = removeComments(" " + spacedImpelText);
    var textWithoutCommentsAndStrings = removeStringLiterals(txtWithoutComments);
    var prodRanges = createRanges(textWithoutCommentsAndStrings);
    var topRange = new range_1.Range(0, impelText.length + 2);
    var topRule = buildTopLevel(name, topRange, prodRanges, impelText);
    return topRule;
}
exports.buildTopProduction = buildTopProduction;
function buildTopLevel(name, topRange, allRanges, orgText) {
    var topLevelProd = new gast_public_1.gast.Rule(name, [], orgText);
    return buildAbstractProd(topLevelProd, topRange, allRanges);
}
function buildProdGast(prodRange, allRanges) {
    ;
    ("use strict");
    switch (prodRange.type) {
        case ProdType.AT_LEAST_ONE:
            return buildAtLeastOneProd(prodRange, allRanges);
        case ProdType.AT_LEAST_ONE_SEP:
            return buildAtLeastOneSepProd(prodRange, allRanges);
        case ProdType.MANY_SEP:
            return buildManySepProd(prodRange, allRanges);
        case ProdType.MANY:
            return buildManyProd(prodRange, allRanges);
        case ProdType.OPTION:
            return buildOptionProd(prodRange, allRanges);
        case ProdType.OR:
            return buildOrProd(prodRange, allRanges);
        case ProdType.FLAT:
            return buildFlatProd(prodRange, allRanges);
        case ProdType.REF:
            return buildRefProd(prodRange);
        case ProdType.TERMINAL:
            return buildTerminalProd(prodRange);
        /* istanbul ignore next */
        default:
            /* istanbul ignore next */
            throw Error("non exhaustive match");
    }
}
exports.buildProdGast = buildProdGast;
function buildRefProd(prodRange) {
    var reResult = refRegEx.exec(prodRange.text);
    var isImplicitOccurrenceIdx = reResult[1] === undefined;
    var refOccurrence = isImplicitOccurrenceIdx ? 1 : parseInt(reResult[1], 10);
    var refProdName = reResult[2];
    var newRef = new gast_public_1.gast.NonTerminal(refProdName, undefined, refOccurrence);
    newRef.implicitOccurrenceIndex = isImplicitOccurrenceIdx;
    return newRef;
}
function buildTerminalProd(prodRange) {
    var reResult = terminalRegEx.exec(prodRange.text);
    var isImplicitOccurrenceIdx = reResult[1] === undefined;
    var terminalOccurrence = isImplicitOccurrenceIdx
        ? 1
        : parseInt(reResult[1], 10);
    var terminalName = reResult[2];
    var terminalType = exports.terminalNameToConstructor[terminalName];
    if (!terminalType) {
        throw Error("Terminal Token name: " + terminalName + " not found");
    }
    var newTerminal = new gast_public_1.gast.Terminal(terminalType, terminalOccurrence);
    newTerminal.implicitOccurrenceIndex = isImplicitOccurrenceIdx;
    return newTerminal;
}
function buildProdWithOccurrence(regEx, prodInstance, prodRange, allRanges) {
    var reResult = regEx.exec(prodRange.text);
    var isImplicitOccurrenceIdx = reResult[1] === undefined;
    prodInstance.occurrenceInParent = isImplicitOccurrenceIdx
        ? 1
        : parseInt(reResult[1], 10);
    prodInstance.implicitOccurrenceIndex = isImplicitOccurrenceIdx;
    var nestedName = reResult[2];
    if (!utils_1.isUndefined(nestedName)) {
        ;
        prodInstance.name = nestedName;
    }
    return buildAbstractProd(prodInstance, prodRange.range, allRanges);
}
function buildAtLeastOneProd(prodRange, allRanges) {
    return buildProdWithOccurrence(atLeastOneRegEx, new gast_public_1.gast.RepetitionMandatory([]), prodRange, allRanges);
}
function buildAtLeastOneSepProd(prodRange, allRanges) {
    return buildRepetitionWithSep(prodRange, allRanges, gast_public_1.gast.RepetitionMandatoryWithSeparator, atLeastOneWithSeparatorRegEx);
}
function buildManyProd(prodRange, allRanges) {
    return buildProdWithOccurrence(manyRegEx, new gast_public_1.gast.Repetition([]), prodRange, allRanges);
}
function buildManySepProd(prodRange, allRanges) {
    return buildRepetitionWithSep(prodRange, allRanges, gast_public_1.gast.RepetitionWithSeparator, manyWithSeparatorRegEx);
}
function buildRepetitionWithSep(prodRange, allRanges, repConstructor, regExp) {
    var reResult = regExp.exec(prodRange.text);
    var isImplicitOccurrenceIdx = reResult[1] === undefined;
    var occurrenceIdx = isImplicitOccurrenceIdx ? 1 : parseInt(reResult[1], 10);
    var sepName = reResult[3];
    var separatorType = exports.terminalNameToConstructor[sepName];
    if (!separatorType) {
        throw Error("Separator Terminal Token name: " + sepName + " not found");
    }
    var repetitionInstance = new repConstructor([], separatorType, occurrenceIdx);
    repetitionInstance.implicitOccurrenceIndex = isImplicitOccurrenceIdx;
    var nestedName = reResult[2];
    if (!utils_1.isUndefined(nestedName)) {
        ;
        repetitionInstance.name = nestedName;
    }
    return buildAbstractProd(repetitionInstance, prodRange.range, allRanges);
}
function buildOptionProd(prodRange, allRanges) {
    return buildProdWithOccurrence(optionRegEx, new gast_public_1.gast.Option([]), prodRange, allRanges);
}
function buildOrProd(prodRange, allRanges) {
    return buildProdWithOccurrence(orRegEx, new gast_public_1.gast.Alternation([]), prodRange, allRanges);
}
function buildFlatProd(prodRange, allRanges) {
    var prodInstance = new gast_public_1.gast.Flat([]);
    var reResult = orPartRegEx.exec(prodRange.text);
    var nestedName = reResult[1];
    if (!utils_1.isUndefined(nestedName)) {
        ;
        prodInstance.name = nestedName;
    }
    return buildAbstractProd(prodInstance, prodRange.range, allRanges);
}
function buildAbstractProd(prod, topLevelRange, allRanges) {
    var secondLevelProds = getDirectlyContainedRanges(topLevelRange, allRanges);
    var secondLevelInOrder = utils_1.sortBy(secondLevelProds, function (prodRng) {
        return prodRng.range.start;
    });
    var definition = [];
    utils_1.forEach(secondLevelInOrder, function (prodRng) {
        definition.push(buildProdGast(prodRng, allRanges));
    });
    prod.definition = definition;
    return prod;
}
function getDirectlyContainedRanges(y, prodRanges) {
    return utils_1.filter(prodRanges, function (x) {
        var isXDescendantOfY = y.strictlyContainsRange(x.range);
        var xDoesNotHaveAnyAncestorWhichIsDecendantOfY = utils_1.every(prodRanges, function (maybeAnotherParent) {
            var isParentOfX = maybeAnotherParent.range.strictlyContainsRange(x.range);
            var isChildOfY = maybeAnotherParent.range.isStrictlyContainedInRange(y);
            return !(isParentOfX && isChildOfY);
        });
        return isXDescendantOfY && xDoesNotHaveAnyAncestorWhichIsDecendantOfY;
    });
}
exports.getDirectlyContainedRanges = getDirectlyContainedRanges;
var singleLineCommentRegEx = /\/\/.*/g;
var multiLineCommentRegEx = /\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g;
var doubleQuoteStringLiteralRegEx = /(NAME\s*:\s*)?"([^\\"]|\\([bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/g;
var singleQuoteStringLiteralRegEx = /(NAME\s*:\s*)?'([^\\']|\\([bfnrtv'\\/]|u[0-9a-fA-F]{4}))*'/g;
function removeComments(text) {
    var noSingleLine = text.replace(singleLineCommentRegEx, "");
    var noComments = noSingleLine.replace(multiLineCommentRegEx, "");
    return noComments;
}
exports.removeComments = removeComments;
function replaceWithEmptyStringExceptNestedRules(match, nestedRuleGroup) {
    // do not replace with empty string if a nest rule (NAME:"bamba") was detected
    if (nestedRuleGroup !== undefined) {
        return match;
    }
    return "";
}
function removeStringLiterals(text) {
    var noDoubleQuotes = text.replace(doubleQuoteStringLiteralRegEx, replaceWithEmptyStringExceptNestedRules);
    var noSingleQuotes = noDoubleQuotes.replace(singleQuoteStringLiteralRegEx, replaceWithEmptyStringExceptNestedRules);
    return noSingleQuotes;
}
exports.removeStringLiterals = removeStringLiterals;
function createRanges(text) {
    var terminalRanges = createTerminalRanges(text);
    var refsRanges = createRefsRanges(text);
    var atLeastOneRanges = createAtLeastOneRanges(text);
    var atLeastOneSepRanges = createAtLeastOneSepRanges(text);
    var manyRanges = createManyRanges(text);
    var manySepRanges = createManySepRanges(text);
    var optionRanges = createOptionRanges(text);
    var orRanges = createOrRanges(text);
    return [].concat(terminalRanges, refsRanges, atLeastOneRanges, atLeastOneSepRanges, manyRanges, manySepRanges, optionRanges, orRanges);
}
exports.createRanges = createRanges;
function createTerminalRanges(text) {
    return createRefOrTerminalProdRangeInternal(text, ProdType.TERMINAL, terminalRegGlobal);
}
exports.createTerminalRanges = createTerminalRanges;
function createRefsRanges(text) {
    return createRefOrTerminalProdRangeInternal(text, ProdType.REF, refRegExGlobal);
}
exports.createRefsRanges = createRefsRanges;
function createAtLeastOneRanges(text) {
    return createOperatorProdRangeParenthesis(text, ProdType.AT_LEAST_ONE, atLeastOneRegExGlobal);
}
exports.createAtLeastOneRanges = createAtLeastOneRanges;
function createAtLeastOneSepRanges(text) {
    return createOperatorProdRangeParenthesis(text, ProdType.AT_LEAST_ONE_SEP, atLeastOneWithSeparatorRegExGlobal);
}
exports.createAtLeastOneSepRanges = createAtLeastOneSepRanges;
function createManyRanges(text) {
    return createOperatorProdRangeParenthesis(text, ProdType.MANY, manyRegExGlobal);
}
exports.createManyRanges = createManyRanges;
function createManySepRanges(text) {
    return createOperatorProdRangeParenthesis(text, ProdType.MANY_SEP, manyWithSeparatorRegExGlobal);
}
exports.createManySepRanges = createManySepRanges;
function createOptionRanges(text) {
    return createOperatorProdRangeParenthesis(text, ProdType.OPTION, optionRegExGlobal);
}
exports.createOptionRanges = createOptionRanges;
function createOrRanges(text) {
    var orRanges = createOperatorProdRangeParenthesis(text, ProdType.OR, orRegExGlobal);
    // have to split up the OR cases into separate FLAT productions
    // (A |BB | CDE) ==> or.def[0] --> FLAT(A) , or.def[1] --> FLAT(BB) , or.def[2] --> FLAT(CCDE)
    var orSubPartsRanges = createOrPartRanges(orRanges);
    return orRanges.concat(orSubPartsRanges);
}
exports.createOrRanges = createOrRanges;
var findClosingCurly = utils_1.partial(findClosingOffset, "{", "}");
var findClosingParen = utils_1.partial(findClosingOffset, "(", ")");
function createOrPartRanges(orRanges) {
    var orPartRanges = [];
    utils_1.forEach(orRanges, function (orRange) {
        var currOrParts = createOperatorProdRangeInternal(orRange.text, ProdType.FLAT, orPartRegExGlobal, findClosingCurly);
        var currOrRangeStart = orRange.range.start;
        // fix offsets as we are working on a subset of the text
        utils_1.forEach(currOrParts, function (orPart) {
            orPart.range.start += currOrRangeStart;
            orPart.range.end += currOrRangeStart;
        });
        orPartRanges = orPartRanges.concat(currOrParts);
    });
    var uniqueOrPartRanges = utils_1.uniq(orPartRanges, function (prodRange) {
        // using "~" as a separator for the identify function as its not a valid char in javascript
        return (prodRange.type +
            "~" +
            prodRange.range.start +
            "~" +
            prodRange.range.end +
            "~" +
            prodRange.text);
    });
    return uniqueOrPartRanges;
}
exports.createOrPartRanges = createOrPartRanges;
function createRefOrTerminalProdRangeInternal(text, prodType, pattern) {
    var prodRanges = [];
    var matched;
    while ((matched = pattern.exec(text))) {
        var start = matched.index;
        var stop_1 = pattern.lastIndex;
        var currRange = new range_1.Range(start, stop_1);
        var currText = matched[0];
        prodRanges.push({
            range: currRange,
            text: currText,
            type: prodType
        });
    }
    return prodRanges;
}
function createOperatorProdRangeParenthesis(text, prodType, pattern) {
    return createOperatorProdRangeInternal(text, prodType, pattern, findClosingParen);
}
function createOperatorProdRangeInternal(text, prodType, pattern, findTerminatorOffSet) {
    var operatorRanges = [];
    var matched;
    while ((matched = pattern.exec(text))) {
        var start = matched.index;
        // note that (start + matched[0].length) is the first character AFTER the match
        var stop_2 = findTerminatorOffSet(start + matched[0].length, text);
        var currRange = new range_1.Range(start, stop_2);
        var currText = text.substr(start, stop_2 - start + 1);
        operatorRanges.push({
            range: currRange,
            text: currText,
            type: prodType
        });
    }
    return operatorRanges;
}
function findClosingOffset(opening, closing, start, text) {
    var parenthesisStack = [1];
    var i = -1;
    while (!utils_1.isEmpty(parenthesisStack) && i + start < text.length) {
        i++;
        var nextChar = text.charAt(start + i);
        if (nextChar === opening) {
            parenthesisStack.push(1);
        }
        else if (nextChar === closing) {
            parenthesisStack.pop();
        }
    }
    // valid termination of the search loop
    if (utils_1.isEmpty(parenthesisStack)) {
        return i + start;
    }
    else {
        throw new Error("INVALID INPUT TEXT, UNTERMINATED PARENTHESIS");
    }
}
exports.findClosingOffset = findClosingOffset;
//# sourceMappingURL=gast_builder.js.map

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Range = /** @class */ (function () {
    function Range(start, end) {
        this.start = start;
        this.end = end;
        if (!isValidRange(start, end)) {
            throw new Error("INVALID RANGE");
        }
    }
    Range.prototype.contains = function (num) {
        return this.start <= num && this.end >= num;
    };
    Range.prototype.containsRange = function (other) {
        return this.start <= other.start && this.end >= other.end;
    };
    Range.prototype.isContainedInRange = function (other) {
        return other.containsRange(this);
    };
    Range.prototype.strictlyContainsRange = function (other) {
        return this.start < other.start && this.end > other.end;
    };
    Range.prototype.isStrictlyContainedInRange = function (other) {
        return other.strictlyContainsRange(this);
    };
    return Range;
}());
exports.Range = Range;
function isValidRange(start, end) {
    return !(start < 0 || end < start);
}
exports.isValidRange = isValidRange;
//# sourceMappingURL=range.js.map

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(0);
var lang_extensions_1 = __webpack_require__(3);
var checks_1 = __webpack_require__(13);
function defaultVisit(ctx, param) {
    var childrenNames = utils_1.keys(ctx);
    var childrenNamesLength = childrenNames.length;
    for (var i = 0; i < childrenNamesLength; i++) {
        var currChildName = childrenNames[i];
        var currChildArray = ctx[currChildName];
        var currChildArrayLength = currChildArray.length;
        for (var j = 0; j < currChildArrayLength; j++) {
            var currChild = currChildArray[j];
            // distinction between Tokens Children and CstNode children
            if (currChild.tokenType === undefined) {
                if (currChild.fullName !== undefined) {
                    this[currChild.fullName](currChild.children, param);
                }
                else {
                    this[currChild.name](currChild.children, param);
                }
            }
        }
    }
    // defaultVisit does not support generic out param
    return undefined;
}
exports.defaultVisit = defaultVisit;
function createBaseSemanticVisitorConstructor(grammarName, ruleNames) {
    var derivedConstructor = function () { };
    // can be overwritten according to:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/
    // name?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FFunction%2Fname
    lang_extensions_1.defineNameProp(derivedConstructor, grammarName + "BaseSemantics");
    var semanticProto = {
        visit: function (cstNode, param) {
            // enables writing more concise visitor methods when CstNode has only a single child
            if (utils_1.isArray(cstNode)) {
                if (cstNode.length > 0) {
                    cstNode = cstNode[0];
                }
                else {
                    // enables passing optional CstNodes concisely.
                    return undefined;
                }
            }
            if (cstNode.fullName !== undefined) {
                return this[cstNode.fullName](cstNode.children, param);
            }
            else {
                return this[cstNode.name](cstNode.children, param);
            }
        },
        validateVisitor: function () {
            var semanticDefinitionErrors = validateVisitor(this, ruleNames);
            if (!utils_1.isEmpty(semanticDefinitionErrors)) {
                var errorMessages = utils_1.map(semanticDefinitionErrors, function (currDefError) { return currDefError.msg; });
                throw Error("Errors Detected in CST Visitor <" + lang_extensions_1.functionName(this.constructor) + ">:\n\t" +
                    ("" + errorMessages.join("\n\n").replace(/\n/g, "\n\t")));
            }
        }
    };
    derivedConstructor.prototype = semanticProto;
    derivedConstructor.prototype.constructor = derivedConstructor;
    derivedConstructor._RULE_NAMES = ruleNames;
    return derivedConstructor;
}
exports.createBaseSemanticVisitorConstructor = createBaseSemanticVisitorConstructor;
function createBaseVisitorConstructorWithDefaults(grammarName, ruleNames, baseConstructor) {
    var derivedConstructor = function () { };
    // can be overwritten according to:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/
    // name?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FFunction%2Fname
    lang_extensions_1.defineNameProp(derivedConstructor, grammarName + "BaseSemanticsWithDefaults");
    var withDefaultsProto = Object.create(baseConstructor.prototype);
    utils_1.forEach(ruleNames, function (ruleName) {
        withDefaultsProto[ruleName] = defaultVisit;
    });
    derivedConstructor.prototype = withDefaultsProto;
    derivedConstructor.prototype.constructor = derivedConstructor;
    return derivedConstructor;
}
exports.createBaseVisitorConstructorWithDefaults = createBaseVisitorConstructorWithDefaults;
var CstVisitorDefinitionError;
(function (CstVisitorDefinitionError) {
    CstVisitorDefinitionError[CstVisitorDefinitionError["REDUNDANT_METHOD"] = 0] = "REDUNDANT_METHOD";
    CstVisitorDefinitionError[CstVisitorDefinitionError["MISSING_METHOD"] = 1] = "MISSING_METHOD";
})(CstVisitorDefinitionError = exports.CstVisitorDefinitionError || (exports.CstVisitorDefinitionError = {}));
function validateVisitor(visitorInstance, ruleNames) {
    var missingErrors = validateMissingCstMethods(visitorInstance, ruleNames);
    var redundantErrors = validateRedundantMethods(visitorInstance, ruleNames);
    return missingErrors.concat(redundantErrors);
}
exports.validateVisitor = validateVisitor;
function validateMissingCstMethods(visitorInstance, ruleNames) {
    var errors = utils_1.map(ruleNames, function (currRuleName) {
        if (!utils_1.isFunction(visitorInstance[currRuleName])) {
            return {
                msg: "Missing visitor method: <" + currRuleName + "> on " + lang_extensions_1.functionName(visitorInstance.constructor) + " CST Visitor.",
                type: CstVisitorDefinitionError.MISSING_METHOD,
                methodName: currRuleName
            };
        }
    });
    return utils_1.compact(errors);
}
exports.validateMissingCstMethods = validateMissingCstMethods;
var VALID_PROP_NAMES = ["constructor", "visit", "validateVisitor"];
function validateRedundantMethods(visitorInstance, ruleNames) {
    var errors = [];
    for (var prop in visitorInstance) {
        if (checks_1.validTermsPattern.test(prop) &&
            utils_1.isFunction(visitorInstance[prop]) &&
            !utils_1.contains(VALID_PROP_NAMES, prop) &&
            !utils_1.contains(ruleNames, prop)) {
            errors.push({
                msg: "Redundant visitor method: <" + prop + "> on " + lang_extensions_1.functionName(visitorInstance.constructor) + " CST Visitor\n" +
                    "There is no Grammar Rule corresponding to this method's name.\n" +
                    ("For utility methods on visitor classes use methods names that do not match /" + checks_1.validTermsPattern.source + "/."),
                type: CstVisitorDefinitionError.REDUNDANT_METHOD,
                methodName: prop
            });
        }
    }
    return errors;
}
exports.validateRedundantMethods = validateRedundantMethods;
//# sourceMappingURL=cst_visitor.js.map

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tokens_public_1 = __webpack_require__(2);
var lexer_public_1 = __webpack_require__(19);
var utils_1 = __webpack_require__(0);
var utils_2 = __webpack_require__(0);
var PATTERN = "PATTERN";
exports.DEFAULT_MODE = "defaultMode";
exports.MODES = "modes";
exports.SUPPORT_STICKY = typeof new RegExp("(?:)").sticky === "boolean";
function disableSticky() {
    exports.SUPPORT_STICKY = false;
}
exports.disableSticky = disableSticky;
function enableSticky() {
    exports.SUPPORT_STICKY = true;
}
exports.enableSticky = enableSticky;
function analyzeTokenClasses(tokenClasses, useSticky) {
    if (useSticky === void 0) { useSticky = exports.SUPPORT_STICKY; }
    var onlyRelevantClasses = utils_1.reject(tokenClasses, function (currClass) {
        return currClass[PATTERN] === lexer_public_1.Lexer.NA;
    });
    var hasCustom = false;
    var allTransformedPatterns = utils_1.map(onlyRelevantClasses, function (currClass) {
        var currPattern = currClass[PATTERN];
        if (utils_1.isRegExp(currPattern)) {
            var regExpSource = currPattern.source;
            if (regExpSource.length === 1 &&
                // only these regExp meta characters which can appear in a length one regExp
                regExpSource !== "^" &&
                regExpSource !== "$" &&
                regExpSource !== ".") {
                return regExpSource;
            }
            else if (regExpSource.length === 2 &&
                regExpSource[0] === "\\" &&
                // not a meta character
                !utils_1.contains([
                    "d",
                    "D",
                    "s",
                    "S",
                    "t",
                    "r",
                    "n",
                    "t",
                    "0",
                    "c",
                    "b",
                    "B",
                    "f",
                    "v",
                    "w",
                    "W"
                ], regExpSource[1])) {
                // escaped meta Characters: /\+/ /\[/
                // or redundant escaping: /\a/
                // without the escaping "\"
                return regExpSource[1];
            }
            else {
                return useSticky
                    ? addStickyFlag(currPattern)
                    : addStartOfInput(currPattern);
            }
        }
        else if (utils_1.isFunction(currPattern)) {
            hasCustom = true;
            // CustomPatternMatcherFunc - custom patterns do not require any transformations, only wrapping in a RegExp Like object
            return { exec: currPattern };
        }
        else if (utils_1.has(currPattern, "exec")) {
            hasCustom = true;
            // ICustomPattern
            return currPattern;
        }
        else if (typeof currPattern === "string") {
            // IGNORE ABOVE ELSE
            if (currPattern.length === 1) {
                return currPattern;
            }
            else {
                var escapedRegExpString = currPattern.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
                var wrappedRegExp = new RegExp(escapedRegExpString);
                // TODO: extract the "?" expression, it is duplicated
                return useSticky
                    ? addStickyFlag(wrappedRegExp)
                    : addStartOfInput(wrappedRegExp);
            }
        }
        else {
            /* istanbul ignore next */
            throw Error("non exhaustive match");
        }
    });
    var patternIdxToType = utils_1.map(onlyRelevantClasses, function (currClass) { return currClass.tokenType; });
    var patternIdxToGroup = utils_1.map(onlyRelevantClasses, function (clazz) {
        var groupName = clazz.GROUP;
        if (groupName === lexer_public_1.Lexer.SKIPPED) {
            return undefined;
        }
        else if (utils_1.isString(groupName)) {
            return groupName;
        }
        else if (utils_1.isUndefined(groupName)) {
            return false;
        }
        else {
            /* istanbul ignore next */
            throw Error("non exhaustive match");
        }
    });
    var patternIdxToLongerAltIdx = utils_1.map(onlyRelevantClasses, function (clazz) {
        var longerAltClass = clazz.LONGER_ALT;
        if (longerAltClass) {
            var longerAltIdx = utils_1.indexOf(onlyRelevantClasses, longerAltClass);
            return longerAltIdx;
        }
    });
    var patternIdxToPushMode = utils_1.map(onlyRelevantClasses, function (clazz) { return clazz.PUSH_MODE; });
    var patternIdxToPopMode = utils_1.map(onlyRelevantClasses, function (clazz) {
        return utils_1.has(clazz, "POP_MODE");
    });
    var patternIdxToCanLineTerminator = utils_1.map(onlyRelevantClasses, function (clazz) { return clazz.LINE_BREAKS === true; });
    var patternIdxToIsCustom = utils_1.map(onlyRelevantClasses, isCustomPattern);
    var patternIdxToShort = utils_1.map(allTransformedPatterns, isShortPattern);
    var emptyGroups = utils_1.reduce(onlyRelevantClasses, function (acc, clazz) {
        var groupName = clazz.GROUP;
        if (utils_1.isString(groupName) && !(groupName === lexer_public_1.Lexer.SKIPPED)) {
            acc[groupName] = [];
        }
        return acc;
    }, {});
    var patternIdxToConfig = utils_1.map(allTransformedPatterns, function (x, idx) {
        return {
            pattern: allTransformedPatterns[idx],
            longerAlt: patternIdxToLongerAltIdx[idx],
            canLineTerminator: patternIdxToCanLineTerminator[idx],
            isCustom: patternIdxToIsCustom[idx],
            short: patternIdxToShort[idx],
            group: patternIdxToGroup[idx],
            push: patternIdxToPushMode[idx],
            pop: patternIdxToPopMode[idx],
            tokenType: patternIdxToType[idx]
        };
    });
    return {
        emptyGroups: emptyGroups,
        patternIdxToConfig: patternIdxToConfig,
        hasCustom: hasCustom
    };
}
exports.analyzeTokenClasses = analyzeTokenClasses;
function validatePatterns(tokenClasses, validModesNames) {
    var errors = [];
    var missingResult = findMissingPatterns(tokenClasses);
    errors = errors.concat(missingResult.errors);
    var invalidResult = findInvalidPatterns(missingResult.valid);
    var validTokenClasses = invalidResult.valid;
    errors = errors.concat(invalidResult.errors);
    errors = errors.concat(validateRegExpPattern(validTokenClasses));
    errors = errors.concat(findInvalidGroupType(validTokenClasses));
    errors = errors.concat(findModesThatDoNotExist(validTokenClasses, validModesNames));
    return errors;
}
exports.validatePatterns = validatePatterns;
function validateRegExpPattern(tokenClasses) {
    var errors = [];
    var withRegExpPatterns = utils_1.filter(tokenClasses, function (currTokClass) {
        return utils_1.isRegExp(currTokClass[PATTERN]);
    });
    errors = errors.concat(findEndOfInputAnchor(withRegExpPatterns));
    errors = errors.concat(findStartOfInputAnchor(withRegExpPatterns));
    errors = errors.concat(findUnsupportedFlags(withRegExpPatterns));
    errors = errors.concat(findDuplicatePatterns(withRegExpPatterns));
    errors = errors.concat(findEmptyMatchRegExps(withRegExpPatterns));
    return errors;
}
function findMissingPatterns(tokenClasses) {
    var tokenClassesWithMissingPattern = utils_1.filter(tokenClasses, function (currClass) {
        return !utils_1.has(currClass, PATTERN);
    });
    var errors = utils_1.map(tokenClassesWithMissingPattern, function (currClass) {
        return {
            message: "Token class: ->" +
                tokens_public_1.tokenName(currClass) +
                "<- missing static 'PATTERN' property",
            type: lexer_public_1.LexerDefinitionErrorType.MISSING_PATTERN,
            tokenClasses: [currClass]
        };
    });
    var valid = utils_1.difference(tokenClasses, tokenClassesWithMissingPattern);
    return { errors: errors, valid: valid };
}
exports.findMissingPatterns = findMissingPatterns;
function findInvalidPatterns(tokenClasses) {
    var tokenClassesWithInvalidPattern = utils_1.filter(tokenClasses, function (currClass) {
        var pattern = currClass[PATTERN];
        return (!utils_1.isRegExp(pattern) &&
            !utils_1.isFunction(pattern) &&
            !utils_1.has(pattern, "exec") &&
            !utils_1.isString(pattern));
    });
    var errors = utils_1.map(tokenClassesWithInvalidPattern, function (currClass) {
        return {
            message: "Token class: ->" +
                tokens_public_1.tokenName(currClass) +
                "<- static 'PATTERN' can only be a RegExp, a" +
                " Function matching the {CustomPatternMatcherFunc} type or an Object matching the {ICustomPattern} interface.",
            type: lexer_public_1.LexerDefinitionErrorType.INVALID_PATTERN,
            tokenClasses: [currClass]
        };
    });
    var valid = utils_1.difference(tokenClasses, tokenClassesWithInvalidPattern);
    return { errors: errors, valid: valid };
}
exports.findInvalidPatterns = findInvalidPatterns;
var end_of_input = /[^\\][\$]/;
function findEndOfInputAnchor(tokenClasses) {
    var invalidRegex = utils_1.filter(tokenClasses, function (currClass) {
        var pattern = currClass[PATTERN];
        return end_of_input.test(pattern.source);
    });
    var errors = utils_1.map(invalidRegex, function (currClass) {
        return {
            message: "Unexpected RegExp Anchor Error:\n" +
                "\tToken class: ->" +
                tokens_public_1.tokenName(currClass) +
                "<- static 'PATTERN' cannot contain end of input anchor '$'\n" +
                "\tSee https://github.com/SAP/chevrotain/blob/master/docs/resolving_lexer_errors.md#ANCHORS \n" +
                "\tfor details.",
            type: lexer_public_1.LexerDefinitionErrorType.EOI_ANCHOR_FOUND,
            tokenClasses: [currClass]
        };
    });
    return errors;
}
exports.findEndOfInputAnchor = findEndOfInputAnchor;
function findEmptyMatchRegExps(tokenClasses) {
    var matchesEmptyString = utils_1.filter(tokenClasses, function (currClass) {
        var pattern = currClass[PATTERN];
        return pattern.test("");
    });
    var errors = utils_1.map(matchesEmptyString, function (currClass) {
        return {
            message: "Token class: ->" +
                tokens_public_1.tokenName(currClass) +
                "<- static 'PATTERN' must not match an empty string",
            type: lexer_public_1.LexerDefinitionErrorType.EMPTY_MATCH_PATTERN,
            tokenClasses: [currClass]
        };
    });
    return errors;
}
exports.findEmptyMatchRegExps = findEmptyMatchRegExps;
var start_of_input = /[^\\[][\^]|^\^/;
function findStartOfInputAnchor(tokenClasses) {
    var invalidRegex = utils_1.filter(tokenClasses, function (currClass) {
        var pattern = currClass[PATTERN];
        return start_of_input.test(pattern.source);
    });
    var errors = utils_1.map(invalidRegex, function (currClass) {
        return {
            message: "Unexpected RegExp Anchor Error:\n" +
                "\tToken class: ->" +
                tokens_public_1.tokenName(currClass) +
                "<- static 'PATTERN' cannot contain start of input anchor '^'\n" +
                "\tSee https://github.com/SAP/chevrotain/blob/master/docs/resolving_lexer_errors.md#ANCHORS\n" +
                "\tfor details.",
            type: lexer_public_1.LexerDefinitionErrorType.SOI_ANCHOR_FOUND,
            tokenClasses: [currClass]
        };
    });
    return errors;
}
exports.findStartOfInputAnchor = findStartOfInputAnchor;
function findUnsupportedFlags(tokenClasses) {
    var invalidFlags = utils_1.filter(tokenClasses, function (currClass) {
        var pattern = currClass[PATTERN];
        return (pattern instanceof RegExp && (pattern.multiline || pattern.global));
    });
    var errors = utils_1.map(invalidFlags, function (currClass) {
        return {
            message: "Token class: ->" +
                tokens_public_1.tokenName(currClass) +
                "<- static 'PATTERN' may NOT contain global('g') or multiline('m')",
            type: lexer_public_1.LexerDefinitionErrorType.UNSUPPORTED_FLAGS_FOUND,
            tokenClasses: [currClass]
        };
    });
    return errors;
}
exports.findUnsupportedFlags = findUnsupportedFlags;
// This can only test for identical duplicate RegExps, not semantically equivalent ones.
function findDuplicatePatterns(tokenClasses) {
    var found = [];
    var identicalPatterns = utils_1.map(tokenClasses, function (outerClass) {
        return utils_1.reduce(tokenClasses, function (result, innerClass) {
            if (outerClass.PATTERN.source === innerClass.PATTERN.source &&
                !utils_1.contains(found, innerClass) &&
                innerClass.PATTERN !== lexer_public_1.Lexer.NA) {
                // this avoids duplicates in the result, each class may only appear in one "set"
                // in essence we are creating Equivalence classes on equality relation.
                found.push(innerClass);
                result.push(innerClass);
                return result;
            }
            return result;
        }, []);
    });
    identicalPatterns = utils_1.compact(identicalPatterns);
    var duplicatePatterns = utils_1.filter(identicalPatterns, function (currIdenticalSet) {
        return currIdenticalSet.length > 1;
    });
    var errors = utils_1.map(duplicatePatterns, function (setOfIdentical) {
        var classNames = utils_1.map(setOfIdentical, function (currClass) {
            return tokens_public_1.tokenName(currClass);
        });
        var dupPatternSrc = utils_1.first(setOfIdentical).PATTERN;
        return {
            message: "The same RegExp pattern ->" + dupPatternSrc + "<-" +
                ("has been used in all the following classes: " + classNames.join(", ") + " <-"),
            type: lexer_public_1.LexerDefinitionErrorType.DUPLICATE_PATTERNS_FOUND,
            tokenClasses: setOfIdentical
        };
    });
    return errors;
}
exports.findDuplicatePatterns = findDuplicatePatterns;
function findInvalidGroupType(tokenClasses) {
    var invalidTypes = utils_1.filter(tokenClasses, function (clazz) {
        if (!utils_1.has(clazz, "GROUP")) {
            return false;
        }
        var group = clazz.GROUP;
        return group !== lexer_public_1.Lexer.SKIPPED && group !== lexer_public_1.Lexer.NA && !utils_1.isString(group);
    });
    var errors = utils_1.map(invalidTypes, function (currClass) {
        return {
            message: "Token class: ->" +
                tokens_public_1.tokenName(currClass) +
                "<- static 'GROUP' can only be Lexer.SKIPPED/Lexer.NA/A String",
            type: lexer_public_1.LexerDefinitionErrorType.INVALID_GROUP_TYPE_FOUND,
            tokenClasses: [currClass]
        };
    });
    return errors;
}
exports.findInvalidGroupType = findInvalidGroupType;
function findModesThatDoNotExist(tokenClasses, validModes) {
    var invalidModes = utils_1.filter(tokenClasses, function (clazz) {
        return (clazz.PUSH_MODE !== undefined &&
            !utils_1.contains(validModes, clazz.PUSH_MODE));
    });
    var errors = utils_1.map(invalidModes, function (clazz) {
        var msg = "Token class: ->" + tokens_public_1.tokenName(clazz) + "<- static 'PUSH_MODE' value cannot refer to a Lexer Mode ->" + clazz.PUSH_MODE + "<-" +
            "which does not exist";
        return {
            message: msg,
            type: lexer_public_1.LexerDefinitionErrorType.PUSH_MODE_DOES_NOT_EXIST,
            tokenClasses: [clazz]
        };
    });
    return errors;
}
exports.findModesThatDoNotExist = findModesThatDoNotExist;
function addStartOfInput(pattern) {
    var flags = pattern.ignoreCase ? "i" : "";
    // always wrapping in a none capturing group preceded by '^' to make sure matching can only work on start of input.
    // duplicate/redundant start of input markers have no meaning (/^^^^A/ === /^A/)
    return new RegExp("^(?:" + pattern.source + ")", flags);
}
exports.addStartOfInput = addStartOfInput;
function addStickyFlag(pattern) {
    var flags = pattern.ignoreCase ? "iy" : "y";
    // always wrapping in a none capturing group preceded by '^' to make sure matching can only work on start of input.
    // duplicate/redundant start of input markers have no meaning (/^^^^A/ === /^A/)
    return new RegExp("" + pattern.source, flags);
}
exports.addStickyFlag = addStickyFlag;
function performRuntimeChecks(lexerDefinition, trackLines) {
    var errors = [];
    // some run time checks to help the end users.
    if (!utils_1.has(lexerDefinition, exports.DEFAULT_MODE)) {
        errors.push({
            message: "A MultiMode Lexer cannot be initialized without a <" +
                exports.DEFAULT_MODE +
                "> property in its definition\n",
            type: lexer_public_1.LexerDefinitionErrorType.MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE
        });
    }
    if (!utils_1.has(lexerDefinition, exports.MODES)) {
        errors.push({
            message: "A MultiMode Lexer cannot be initialized without a <" +
                exports.MODES +
                "> property in its definition\n",
            type: lexer_public_1.LexerDefinitionErrorType.MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY
        });
    }
    if (utils_1.has(lexerDefinition, exports.MODES) &&
        utils_1.has(lexerDefinition, exports.DEFAULT_MODE) &&
        !utils_1.has(lexerDefinition.modes, lexerDefinition.defaultMode)) {
        errors.push({
            message: "A MultiMode Lexer cannot be initialized with a " + exports.DEFAULT_MODE + ": <" + lexerDefinition.defaultMode + ">" +
                "which does not exist\n",
            type: lexer_public_1.LexerDefinitionErrorType.MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST
        });
    }
    if (utils_1.has(lexerDefinition, exports.MODES)) {
        utils_1.forEach(lexerDefinition.modes, function (currModeValue, currModeName) {
            utils_1.forEach(currModeValue, function (currTokClass, currIdx) {
                if (utils_1.isUndefined(currTokClass)) {
                    errors.push({
                        message: "A Lexer cannot be initialized using an undefined Token Class. Mode:" +
                            ("<" + currModeName + "> at index: <" + currIdx + ">\n"),
                        type: lexer_public_1.LexerDefinitionErrorType.LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED
                    });
                }
            });
        });
    }
    var allTokenTypes = utils_2.flatten(utils_1.mapValues(lexerDefinition.modes, function (tokTypes) { return tokTypes; }));
    if (trackLines &&
        utils_1.find(allTokenTypes, function (currTokType) { return currTokType.LINE_BREAKS; }) === undefined) {
        errors.push({
            message: "No LINE_BREAKS Error:\n" +
                "\tThis Lexer has been defined to track line and column information,\n" +
                "\tyet none of the Token definitions contain a LINE_BREAK flag.\n" +
                "\tSee https://github.com/SAP/chevrotain/blob/master/docs/resolving_lexer_errors.md#LINE_BREAKS \n" +
                "\tfor details.",
            type: lexer_public_1.LexerDefinitionErrorType.NO_LINE_BREAKS_FLAGS
        });
    }
    return errors;
}
exports.performRuntimeChecks = performRuntimeChecks;
function cloneEmptyGroups(emptyGroups) {
    var clonedResult = {};
    var groupKeys = utils_1.keys(emptyGroups);
    utils_1.forEach(groupKeys, function (currKey) {
        var currGroupValue = emptyGroups[currKey];
        /* istanbul ignore else */
        if (utils_1.isArray(currGroupValue)) {
            clonedResult[currKey] = [];
        }
        else {
            /* istanbul ignore next */
            throw Error("non exhaustive match");
        }
    });
    return clonedResult;
}
exports.cloneEmptyGroups = cloneEmptyGroups;
// TODO: refactor to avoid duplication
function isCustomPattern(tokenType) {
    var pattern = tokenType.PATTERN;
    if (utils_1.isRegExp(pattern)) {
        return false;
    }
    else if (utils_1.isFunction(pattern)) {
        // CustomPatternMatcherFunc - custom patterns do not require any transformations, only wrapping in a RegExp Like object
        return true;
    }
    else if (utils_1.has(pattern, "exec")) {
        // ICustomPattern
        return true;
    }
    else if (utils_1.isString(pattern)) {
        return false;
    }
    else {
        /* istanbul ignore next */
        throw Error("non exhaustive match");
    }
}
exports.isCustomPattern = isCustomPattern;
function isShortPattern(pattern) {
    if (utils_1.isString(pattern) && pattern.length === 1) {
        return pattern.charCodeAt(0);
    }
    else {
        return false;
    }
}
exports.isShortPattern = isShortPattern;
/**
 * Faster than using a RegExp for default newline detection during lexing.
 */
exports.LineTerminatorOptimizedTester = {
    // implements /\n|\r\n?/g.test
    test: function (text) {
        var len = text.length;
        for (var i = this.lastIndex; i < len; i++) {
            var c = text.charCodeAt(i);
            if (c === 10) {
                this.lastIndex = i + 1;
                return true;
            }
            else if (c === 13) {
                if (text.charCodeAt(i + 1) === 10) {
                    this.lastIndex = i + 2;
                }
                else {
                    this.lastIndex = i + 1;
                }
                return true;
            }
        }
        return false;
    },
    lastIndex: 0
};
//# sourceMappingURL=lexer.js.map

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var cache_1 = __webpack_require__(6);
/**
 * Clears the chevrotain internal cache.
 * This should not be used in regular work flows, This is intended for
 * unique use cases for example: online playground where the a parser with the same name is initialized with
 * different implementations multiple times.
 */
function clearCache() {
    cache_1.clearCache();
}
exports.clearCache = clearCache;
//# sourceMappingURL=cache_public.js.map

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var version_1 = __webpack_require__(11);
function createSyntaxDiagramsCode(grammar, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.resourceBase, resourceBase = _c === void 0 ? "https://unpkg.com/chevrotain@" + version_1.VERSION + "/diagrams/" : _c, _d = _b.css, css = _d === void 0 ? "https://unpkg.com/chevrotain@" + version_1.VERSION + "/diagrams/diagrams.css" : _d;
    var header = "\n<!-- This is a generated file -->\n<!DOCTYPE html>\n<meta charset=\"utf-8\">\n<style>\n  body {\n    background-color: hsl(30, 20%, 95%)\n  }\n</style>\n\n";
    var cssHtml = "\n<link rel='stylesheet' href='" + css + "'>\n";
    var scripts = "\n<script src='" + resourceBase + "vendor/railroad-diagrams.js'></script>\n<script src='" + resourceBase + "src/diagrams_builder.js'></script>\n<script src='" + resourceBase + "src/diagrams_behavior.js'></script>\n<script src='" + resourceBase + "src/main.js'></script>\n";
    var diagramsDiv = "\n<div id=\"diagrams\" align=\"center\"></div>    \n";
    var serializedGrammar = "\n<script>\n    window.serializedGrammar = " + JSON.stringify(grammar, null, "  ") + ";\n</script>\n";
    var initLogic = "\n<script>\n    var diagramsDiv = document.getElementById(\"diagrams\");\n    main.drawDiagramsFromSerializedGrammar(serializedGrammar, diagramsDiv);\n</script>\n";
    return (header + cssHtml + scripts + diagramsDiv + serializedGrammar + initLogic);
}
exports.createSyntaxDiagramsCode = createSyntaxDiagramsCode;
//# sourceMappingURL=render_public.js.map

/***/ })
/******/ ]);
});