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
exports.Controller = void 0;
var Fetcher_1 = require("../fetcher/Fetcher");
var Storage_1 = require("../storage/Storage");
var ApiService_1 = require("../ic/ApiService");
var utils_1 = require("../utils");
var ActorFactory_1 = require("../ic/ActorFactory");
var Controller = /** @class */ (function () {
    function Controller(config) {
        var _this = this;
        var _a;
        this.destroyed = false;
        this.getDictionary = function () { return _this.dictionary; };
        this.fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var configStoreApiResult, updateId, fetchParameters, result, isConfigurationEmptyState, updateId_1, updatedKeys, hasKeysToProcess, updatedKeys, updatedKeys, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 13, , 14]);
                        this.askForConfigStoreApi();
                        return [4 /*yield*/, this.configStoreApiPromise];
                    case 1:
                        configStoreApiResult = _a.sent();
                        if (!(configStoreApiResult.status === "success")) return [3 /*break*/, 11];
                        updateId = this.storage.getUpdateId();
                        fetchParameters = {
                            canisterPrincipal: configStoreApiResult.canisterPrincipal,
                            accessToken: configStoreApiResult.accessToken,
                            updateId: updateId,
                            actorFactory: this.actorFactory,
                        };
                        return [4 /*yield*/, this.fetcher.fetch(fetchParameters)];
                    case 2:
                        result = _a.sent();
                        (0, utils_1.log)("Controller.fetch: result", result);
                        if (!!this.destroyed) return [3 /*break*/, 9];
                        if (!result) return [3 /*break*/, 8];
                        if (!(result.status === "error")) return [3 /*break*/, 7];
                        if (!(result.reason === "invalidate")) return [3 /*break*/, 5];
                        isConfigurationEmptyState = updateId === 0;
                        if (!isConfigurationEmptyState) return [3 /*break*/, 4];
                        //will try to fetch configuration
                        (0, utils_1.warn)("Controller.fetch: error: invalidate - will retry to fetch configuration");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(1000)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, {
                                continuationHint: true
                            }];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        if (result.reason === "wrongToken") {
                            //destroy api
                            (0, utils_1.warn)("Controller.fetch: error: wrongToken - destroy api");
                            this.configStoreApiPromise = undefined;
                        }
                        else if (result.reason === "outdatedReplica") {
                            //outdatedReplica means that replica has updateId less than SDK sent to it.
                            //do nothing - we hope that next fetch will be processed by up-to-date replica. Outdated replica hopefully soon will sync its state.
                            (0, utils_1.warn)("Controller.fetch: error: outdatedReplica - do nothing");
                        }
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        updateId_1 = result.updateId;
                        this.storage.setUpdateId(updateId_1);
                        switch (result.status) {
                            case "full": {
                                updatedKeys = this.analyzeConfigurationResponseStore(result.updatedKeys, result.removedKeys, true).updatedKeys;
                                return [2 /*return*/, {
                                        updatedKeys: updatedKeys,
                                    }];
                            }
                            case "delta": {
                                hasKeysToProcess = result.updatedKeys.length > 0 || result.removedKeys.length > 0;
                                if (hasKeysToProcess) {
                                    updatedKeys = this.analyzeConfigurationResponseStore(result.updatedKeys, result.removedKeys, false).updatedKeys;
                                    return [2 /*return*/, {
                                            updatedKeys: updatedKeys,
                                        }];
                                }
                                else {
                                    return [2 /*return*/, undefined];
                                }
                            }
                            case "deltaPartial": {
                                updatedKeys = this.analyzeConfigurationResponseStore(result.updatedKeys, result.removedKeys, false).updatedKeys;
                                return [2 /*return*/, {
                                        updatedKeys: updatedKeys,
                                        continuationHint: true
                                    }];
                            }
                        }
                        _a.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        (0, utils_1.warn)("Controller.fetch: result skipped - destroyed");
                        _a.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        (0, utils_1.warn)("Controller.fetch: result failed - destroy api");
                        this.configStoreApiPromise = undefined;
                        _a.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        e_1 = _a.sent();
                        (0, utils_1.warn)("Controller.fetch: caught error", e_1);
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        }); };
        this.destroy = function () {
            _this.destroyed = true;
            if (_this.storage) {
                _this.storage.destroy();
            }
            if (_this.apiService) {
                _this.apiService.destroy();
            }
            (0, utils_1.warn)("Controller: destroyed");
        };
        ////////////////////////////////////////////////
        // Private
        ////////////////////////////////////////////////
        this.analyzeConfigurationResponseStore = function (updatedKeys_raw, removedKeys_raw, shouldOverwriteStorage) {
            var newDictionary = {};
            for (var i = 0; i < updatedKeys_raw.length; i++) {
                var parameter = updatedKeys_raw[i];
                newDictionary[parameter.key] = parameter.value;
            }
            var updatedKeys = __spreadArray(__spreadArray([], Object.keys(newDictionary), true), removedKeys_raw, true);
            var dictionaryFromStorage = _this.storage.getDictionary();
            if (shouldOverwriteStorage) {
                //overwrite whole dictionary
                _this.dictionary = __assign({}, newDictionary);
            }
            else {
                //process removed parameters
                for (var i = 0; i < removedKeys_raw.length; i++) {
                    var removedKey = removedKeys_raw[i];
                    delete dictionaryFromStorage[removedKey];
                }
                //process updated parameters
                _this.dictionary = __assign(__assign({}, dictionaryFromStorage), newDictionary);
            }
            //update storage
            _this.storage.setDictionary(_this.dictionary);
            return {
                updatedKeys: updatedKeys
            };
        };
        this.askForConfigStoreApi = function () {
            if (!_this.configStoreApiPromise) {
                _this.configStoreApiPromise = Promise.resolve().then(_this.getConfigStoreApi);
            }
        };
        this.getConfigStoreApi = function () { return __awaiter(_this, void 0, void 0, function () {
            var apiParameters, configStoreApiResult, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        apiParameters = {
                            apiKey: this.config.apiKey,
                            actorFactory: this.actorFactory,
                        };
                        if (!this.apiService) {
                            this.apiService = new ApiService_1.APIService(this.config.apiKey);
                        }
                        return [4 /*yield*/, this.apiService.getConfigStoreApi(apiParameters)];
                    case 1:
                        configStoreApiResult = _a.sent();
                        (0, utils_1.log)("ConfigeekClient.getConfigStoreApi: result", configStoreApiResult);
                        return [2 /*return*/, configStoreApiResult];
                    case 2:
                        e_2 = _a.sent();
                        (0, utils_1.warn)("ConfigeekClient.getConfigStoreApi: caught error", e_2);
                        return [2 /*return*/, { status: "error" }];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.config = config;
        this.fetcher = new Fetcher_1.Fetcher();
        this.storage = new Storage_1.Storage(this.config.apiKey);
        this.dictionary = this.storage.getDictionary();
        this.actorFactory = new ActorFactory_1.ActorFactory((_a = this.config) === null || _a === void 0 ? void 0 : _a.localReplicaConfig);
    }
    return Controller;
}());
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map