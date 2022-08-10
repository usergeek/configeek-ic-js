"use strict";
////////////////////////////////////////////////
// UGResult
////////////////////////////////////////////////
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.warn = exports.log = exports.delayPromise = exports.hasOwnProperty = exports.getICOptional = exports.getICFirstKey = exports.createErrRetry = exports.createErrFatal = exports.createErrResult = exports.createOkResult = exports.isErr = exports.isOk = void 0;
var okResultKey = "ok";
var errResultKey = "err";
var isOk = function (obj) {
    return hasOwnProperty(obj, okResultKey);
};
exports.isOk = isOk;
var isErr = function (obj) {
    return hasOwnProperty(obj, errResultKey);
};
exports.isErr = isErr;
var createOkResult = function (value) {
    var _a;
    return _a = {}, _a[okResultKey] = value, _a;
};
exports.createOkResult = createOkResult;
var createErrResult = function (value) {
    var _a;
    return _a = {}, _a[errResultKey] = value, _a;
};
exports.createErrResult = createErrResult;
var createErrFatal = function () {
    return (0, exports.createErrResult)("fatal");
};
exports.createErrFatal = createErrFatal;
var createErrRetry = function () {
    return (0, exports.createErrResult)("retry");
};
exports.createErrRetry = createErrRetry;
var getICFirstKey = function (obj) {
    return Object.keys(obj)[0];
};
exports.getICFirstKey = getICFirstKey;
function getICOptional(value) {
    return value != undefined ?
        value.length === 1 ? value[0] : undefined
        : undefined;
}
exports.getICOptional = getICOptional;
/**
 * We want to check if prop is a property key of obj
 * @param obj - object
 * @param prop - property
 * @link https://fettblog.eu/typescript-hasownproperty/
 */
function hasOwnProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
}
exports.hasOwnProperty = hasOwnProperty;
var delayPromise = function (duration) {
    return new Promise(function (resolve) { return setTimeout(resolve, duration); });
};
exports.delayPromise = delayPromise;
///////////////////////////////////////////////////////
// Logging
///////////////////////////////////////////////////////
function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    dumpToWindow("log", args);
    // if (process.env.NODE_ENV === "development") {
    //     console.log.apply(null, ["DEV LOG", ...args])
    // }
}
exports.log = log;
var warn = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    dumpToWindow("warn", args);
    // if (process.env.NODE_ENV === "development") {
    //     console.warn.apply(null, ["DEV WARN", ...args])
    // }
};
exports.warn = warn;
var logName = "ConfigeekLog";
var debugSequenceId = 0;
var hasWindow = typeof window !== "undefined";
function dumpToWindow(ctx, value) {
    if (hasWindow) {
        window[logName] = window[logName] || {};
        window[logName][ctx] = window[logName][ctx] || [];
        window[logName][ctx].push(__spreadArray([debugSequenceId++, new Date().getTime()], value, true));
        if (window[logName][ctx].length >= 1000) {
            window[logName][ctx].splice(0, 100);
        }
    }
}
//# sourceMappingURL=utils.js.map