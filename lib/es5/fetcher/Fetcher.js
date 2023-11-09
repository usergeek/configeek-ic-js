"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.Fetcher = void 0;
var utils_1 = require("../utils");
var Fetcher = /** @class */ (function () {
    function Fetcher() {
        var _this = this;
        this.fetch = function (parameters, apiKey) { return __awaiter(_this, void 0, void 0, function () {
            var canisterId, configStoreActor, context, result, resultData, responseParameters, _a, updatedKeys, removedKeys, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        (0, utils_1.log)(apiKey, "Fetcher.fetch: start with", parameters);
                        canisterId = parameters.canisterPrincipal;
                        configStoreActor = parameters.actorFactory.createConfigStoreActor(canisterId);
                        context = {
                            updateId: parameters.updateId,
                            accessToken: parameters.accessToken,
                            accumulator: [],
                            continuation: undefined
                        };
                        return [4 /*yield*/, getConfigRecursively(configStoreActor, context, apiKey)];
                    case 1:
                        result = _b.sent();
                        (0, utils_1.log)(apiKey, "Fetcher.fetch: getConfigRecursively result", result);
                        switch (result.status) {
                            case "success": {
                                resultData = result.result;
                                responseParameters = void 0;
                                switch (resultData.status) {
                                    case "full": {
                                        responseParameters = responseParametersFromFullICResult(resultData.full);
                                        break;
                                    }
                                    case "delta":
                                    case "deltaPartial": {
                                        responseParameters = responseParametersFromDeltaICResult(resultData.delta);
                                        break;
                                    }
                                }
                                _a = mapResponseParameters(responseParameters), updatedKeys = _a.updatedKeys, removedKeys = _a.removedKeys;
                                return [2 /*return*/, {
                                        status: resultData.status,
                                        updateId: resultData.updateId,
                                        updatedKeys: updatedKeys,
                                        removedKeys: removedKeys,
                                    }];
                            }
                            case "error": {
                                (0, utils_1.warn)(apiKey, "Fetcher.fetch: getConfigRecursively error", result.reason);
                                return [2 /*return*/, {
                                        status: "error",
                                        reason: result.reason
                                    }];
                            }
                            case "unknownError": {
                                //nop
                                (0, utils_1.warn)(apiKey, "Fetcher.fetch: getConfigRecursively unknownError");
                                return [2 /*return*/, undefined];
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        (0, utils_1.warn)(apiKey, "Fetcher.fetch: caught error", error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return Fetcher;
}());
exports.Fetcher = Fetcher;
var getConfigRecursively = function (actor, context, apiKey) { return __awaiter(void 0, void 0, void 0, function () {
    var result, validationErrorName, result, configRequestResult, updateId, configVariant, full, delta, fullPartial, newContext, deltaPartial, validationErrorName;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                (0, utils_1.log)(apiKey, "Fetcher.getConfigRecursively: start with", context);
                if (!context.continuation) return [3 /*break*/, 5];
                return [4 /*yield*/, actor.getConfigFullContinuation(context.accessToken, context.continuation)];
            case 1:
                result = _a.sent();
                (0, utils_1.log)(apiKey, "Fetcher.getConfigRecursively: getConfigFullContinuation result", result);
                if (!(0, utils_1.isOk)(result)) return [3 /*break*/, 3];
                return [4 /*yield*/, processFullPartial(actor, context, result.ok, apiKey)];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                if ((0, utils_1.isErr)(result)) {
                    validationErrorName = (0, utils_1.getICFirstKey)(result.err);
                    return [2 /*return*/, {
                            status: "error", reason: validationErrorName
                        }];
                }
                _a.label = 4;
            case 4: return [3 /*break*/, 13];
            case 5: return [4 /*yield*/, actor.getConfig(context.accessToken, context.updateId)];
            case 6:
                result = _a.sent();
                (0, utils_1.log)(apiKey, "Fetcher.getConfigRecursively: getConfig result", result);
                if (!(0, utils_1.isOk)(result)) return [3 /*break*/, 12];
                configRequestResult = result.ok;
                updateId = configRequestResult.lastRegisteredUpdateId;
                configVariant = configRequestResult.data;
                if (!(0, utils_1.hasOwnProperty)(configVariant, "full")) return [3 /*break*/, 7];
                full = configVariant.full;
                return [2 /*return*/, {
                        status: "success",
                        result: {
                            status: "full",
                            updateId: updateId,
                            full: full
                        }
                    }];
            case 7:
                if (!(0, utils_1.hasOwnProperty)(configVariant, "delta")) return [3 /*break*/, 8];
                delta = configVariant.delta;
                return [2 /*return*/, {
                        status: "success",
                        result: {
                            status: "delta",
                            updateId: updateId,
                            delta: delta
                        }
                    }];
            case 8:
                if (!(0, utils_1.hasOwnProperty)(configVariant, "fullPartial")) return [3 /*break*/, 10];
                fullPartial = configVariant.fullPartial;
                newContext = __assign(__assign({}, context), { updateId: updateId });
                return [4 /*yield*/, processFullPartial(actor, newContext, fullPartial, apiKey)];
            case 9: return [2 /*return*/, _a.sent()];
            case 10:
                if ((0, utils_1.hasOwnProperty)(configVariant, "deltaPartial")) {
                    deltaPartial = configVariant.deltaPartial;
                    return [2 /*return*/, {
                            status: "success",
                            result: {
                                status: "deltaPartial",
                                updateId: updateId,
                                delta: deltaPartial
                            }
                        }];
                }
                _a.label = 11;
            case 11: return [3 /*break*/, 13];
            case 12:
                if ((0, utils_1.isErr)(result)) {
                    validationErrorName = (0, utils_1.getICFirstKey)(result.err);
                    return [2 /*return*/, {
                            status: "error", reason: validationErrorName
                        }];
                }
                _a.label = 13;
            case 13: return [2 /*return*/, {
                    status: "unknownError", error: new Error("unknown")
                }];
        }
    });
}); };
var processFullPartial = function (actor, context, fullPartial, apiKey) { return __awaiter(void 0, void 0, void 0, function () {
    var continuation, newAccumulator, newContext;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                continuation = (0, utils_1.getICOptional)(fullPartial.continuation);
                newAccumulator = __spreadArray(__spreadArray([], context.accumulator, true), fullPartial.data, true);
                if (!continuation) return [3 /*break*/, 2];
                newContext = __assign(__assign({}, context), { continuation: continuation, accumulator: newAccumulator });
                return [4 /*yield*/, getConfigRecursively(actor, newContext, apiKey)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2: return [2 /*return*/, {
                    status: "success",
                    result: {
                        status: "full",
                        updateId: context.updateId,
                        full: newAccumulator
                    }
                }];
        }
    });
}); };
var responseParametersFromDeltaICResult = function (icConfigParameters) {
    return icConfigParameters.map(function (v) {
        var key = v[0];
        var valueOptional = (0, utils_1.getICOptional)(v[1]);
        if (valueOptional) {
            return {
                key: key,
                configValue: valueOptional
            };
        }
        return {
            key: key,
            configValue: undefined
        };
    });
};
var responseParametersFromFullICResult = function (icConfigParameters) {
    return icConfigParameters.map(function (v) {
        var key = v[0];
        var value = v[1];
        return {
            key: key,
            configValue: value
        };
    });
};
var mapResponseParameters = function (responseParameters) {
    var updatedKeys = [];
    var removedKeys = [];
    responseParameters.forEach(function (v) {
        if (v.configValue != undefined) {
            if ((0, utils_1.hasOwnProperty)(v.configValue, "text")) {
                updatedKeys.push({
                    key: v.key,
                    value: v.configValue.text
                });
            }
        }
        else {
            removedKeys.push(v.key);
        }
    });
    return {
        updatedKeys: updatedKeys,
        removedKeys: removedKeys
    };
};
//# sourceMappingURL=Fetcher.js.map