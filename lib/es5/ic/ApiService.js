"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeout = exports.APIService = exports.timeoutBetweenRetriesSec = void 0;
var utils_1 = require("../utils");
var constants_1 = require("./canisters/constants");
var ApiStorage_1 = require("./ApiStorage");
exports.timeoutBetweenRetriesSec = 2;
var GLOBAL_RETRIES = 3;
var REGISTRY_REDIRECT_RETRIES = 3;
var currentSessionTopologyId;
var APIService = /** @class */ (function () {
    function APIService(apiKey) {
        var _this = this;
        this.destroyed = false;
        this.destroy = function () {
            _this.destroyed = true;
            _this.storage.destroy();
            (0, utils_1.warn)("APIService: destroyed");
        };
        ////////////////////////////////////////////////
        // Private
        ////////////////////////////////////////////////
        this.callConfigRegistryRecursively = function (apiParameters, retriesLeft) { return __awaiter(_this, void 0, void 0, function () {
            var configRegistryResponse, _a, timeout, timeout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, utils_1.log)("APIService.callConfigRegistryRecursively: start with", { retriesLeft: retriesLeft });
                        return [4 /*yield*/, this.getResult(apiParameters, REGISTRY_REDIRECT_RETRIES)];
                    case 1:
                        configRegistryResponse = _b.sent();
                        (0, utils_1.log)("APIService.callConfigRegistryRecursively: result", configRegistryResponse);
                        if (!(0, utils_1.isOk)(configRegistryResponse)) return [3 /*break*/, 2];
                        return [2 /*return*/, configRegistryResponse];
                    case 2:
                        if (!(0, utils_1.isErr)(configRegistryResponse)) return [3 /*break*/, 13];
                        _a = configRegistryResponse.err;
                        switch (_a) {
                            case "changeTopology": return [3 /*break*/, 3];
                            case "retry": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 12];
                    case 3:
                        if (!!this.destroyed) return [3 /*break*/, 5];
                        timeout = (0, exports.getTimeout)(GLOBAL_RETRIES - retriesLeft, exports.timeoutBetweenRetriesSec);
                        (0, utils_1.log)("APIService.callConfigRegistryRecursively: changeTopology : sleep for ".concat(timeout, "ms"));
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 4:
                        _b.sent();
                        if (!this.destroyed) {
                            return [2 /*return*/, this.callConfigRegistryRecursively(apiParameters, retriesLeft - 1)];
                        }
                        _b.label = 5;
                    case 5:
                        (0, utils_1.warn)("APIService.callConfigRegistryRecursively: changeTopology : skipped - destroyed");
                        return [3 /*break*/, 13];
                    case 6:
                        if (!!this.destroyed) return [3 /*break*/, 10];
                        if (!(retriesLeft > 0)) return [3 /*break*/, 8];
                        timeout = (0, exports.getTimeout)(GLOBAL_RETRIES - retriesLeft, exports.timeoutBetweenRetriesSec);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, this.callConfigRegistryRecursively(apiParameters, retriesLeft - 1)];
                    case 8:
                        (0, utils_1.warn)("APIService.callConfigRegistryRecursively: retry : skipped - no more retries");
                        _b.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        (0, utils_1.warn)("APIService.callConfigRegistryRecursively: retry : skipped - destroyed");
                        _b.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        {
                        }
                        _b.label = 13;
                    case 13: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        }); };
        this.getResult = function (apiParameters, retriesLeft) { return __awaiter(_this, void 0, void 0, function () {
            var canisterIds, canisterId;
            return __generator(this, function (_a) {
                currentSessionTopologyId = this.storage.getTopologyId();
                canisterIds = this.storage.getRegistryCanisterIds();
                if (canisterIds.length === 0) {
                    canisterIds = Array.from(constants_1.configRegistry_canister_ids);
                }
                if (canisterIds.length === 0) {
                    (0, utils_1.warn)("APIService.getResult: no registry canisters - exit");
                    return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
                (0, utils_1.log)("APIService.getResult: using", { canisterIds: canisterIds, currentSessionTopologyId: currentSessionTopologyId });
                canisterId = APIService.getCanisterId(canisterIds);
                if (canisterId) {
                    return [2 /*return*/, this.callActorRecursively(canisterId, apiParameters, retriesLeft, false)];
                }
                return [2 /*return*/, (0, utils_1.createErrFatal)()];
            });
        }); };
        this.callActorRecursively = function (canisterId, apiParameters, retriesLeft, useActorMethodWithConsensus) { return __awaiter(_this, void 0, void 0, function () {
            var result, e_1, apiResult, changeTopology, newTopologyId, newPrincipals, newCanisterIds, i, principalToRedirectTo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, utils_1.log)("CoordinatorApi.callActorRecursively: start with", { currentSessionTopologyId: currentSessionTopologyId, canisterId: canisterId, useActorMethodWithConsensus: useActorMethodWithConsensus, retriesLeft: retriesLeft });
                        if (!canisterId) return [3 /*break*/, 5];
                        result = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.callActor(canisterId, apiParameters, useActorMethodWithConsensus)];
                    case 2:
                        result = _a.sent();
                        (0, utils_1.log)("APIService.callActorRecursively: result", result);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        (0, utils_1.warn)("APIService.callActorRecursively: caught error", e_1);
                        return [2 /*return*/, (0, utils_1.createErrRetry)()];
                    case 4:
                        if ((0, utils_1.isOk)(result)) {
                            if (result.ok.length === 1) {
                                apiResult = result.ok[0];
                                return [2 /*return*/, (0, utils_1.createOkResult)(apiResult)];
                            }
                        }
                        else if ((0, utils_1.hasOwnProperty)(result, "changeTopology")) {
                            changeTopology = result.changeTopology;
                            newTopologyId = changeTopology.topologyId;
                            newPrincipals = changeTopology.principals;
                            newCanisterIds = [];
                            for (i = 0; i < newPrincipals.length; i++) {
                                newCanisterIds.push(newPrincipals[i].toText());
                            }
                            (0, utils_1.log)("APIService.callActorRecursively: changeTopology : new canisterIds from new topology", newCanisterIds);
                            if (newCanisterIds.length > 0) {
                                currentSessionTopologyId = newTopologyId;
                                this.storage.setTopologyId(newTopologyId);
                                this.storage.setRegistryCanisterIds(newCanisterIds);
                            }
                            return [2 /*return*/, (0, utils_1.createErrResult)("changeTopology")];
                        }
                        else if ((0, utils_1.hasOwnProperty)(result, "redirect")) {
                            if (!this.destroyed) {
                                if (retriesLeft > 0) {
                                    principalToRedirectTo = result.redirect;
                                    return [2 /*return*/, this.callActorRecursively(principalToRedirectTo.toText(), apiParameters, retriesLeft - 1, false)];
                                }
                                else {
                                    (0, utils_1.warn)("APIService.callActorRecursively: redirect : skip - no more retries");
                                }
                            }
                            else {
                                (0, utils_1.warn)("APIService.callActorRecursively: redirect : skip - destroyed");
                            }
                            return [2 /*return*/, (0, utils_1.createErrFatal)()];
                        }
                        else if ((0, utils_1.hasOwnProperty)(result, "retryWithConsensusRequest")) {
                            if (!this.destroyed) {
                                if (retriesLeft > 0) {
                                    return [2 /*return*/, this.callActorRecursively(canisterId, apiParameters, retriesLeft - 1, true)];
                                }
                                else {
                                    (0, utils_1.warn)("APIService.callActorRecursively: retryWithConsensusRequest : skip - no more retries");
                                }
                            }
                            else {
                                (0, utils_1.warn)("APIService.callActorRecursively: retryWithConsensusRequest : skip - destroyed");
                            }
                        }
                        //"temporaryUnavailable"/"error" case
                        return [2 /*return*/, (0, utils_1.createErrFatal)()];
                    case 5: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        }); };
        this.callActor = function (canisterId, apiParameters, useActorMethodWithConsensus) { return __awaiter(_this, void 0, void 0, function () {
            var actor, topologyId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actor = apiParameters.actorFactory.createConfigRegistryActor(canisterId);
                        if (!useActorMethodWithConsensus) return [3 /*break*/, 2];
                        return [4 /*yield*/, actor.getConfigStoreApiWithConsensus(apiParameters.apiKey)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        topologyId = currentSessionTopologyId;
                        return [4 /*yield*/, actor.getConfigStoreApi(topologyId ? [topologyId] : [], apiParameters.apiKey)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this.storage = new ApiStorage_1.ApiStorage(apiKey);
    }
    APIService.prototype.getConfigStoreApi = function (apiParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var result, apiResult, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        (0, utils_1.log)("APIService.getConfigStoreApi: start with", apiParameters);
                        return [4 /*yield*/, this.callConfigRegistryRecursively(apiParameters, GLOBAL_RETRIES)];
                    case 1:
                        result = _a.sent();
                        (0, utils_1.log)("APIService.getConfigStoreApi: result", result);
                        if (!this.destroyed) {
                            if ((0, utils_1.isOk)(result)) {
                                apiResult = result.ok;
                                return [2 /*return*/, {
                                        status: "success",
                                        canisterPrincipal: apiResult.canister.toText(),
                                        accessToken: apiResult.accessToken
                                    }];
                            }
                        }
                        else {
                            (0, utils_1.warn)("APIService.getConfigStoreApi: result skipped - destroyed");
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        (0, utils_1.warn)("APIService.getConfigStoreApi: caught error", e_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, {
                            status: "error"
                        }];
                }
            });
        });
    };
    APIService.getRandomCanisterId = function (array) {
        var index = Math.floor(Math.random() * array.length);
        return array[index];
    };
    APIService.getCanisterId = function (canisterIds) {
        if (canisterIds.length == 0) {
            return undefined;
        }
        return APIService.getRandomCanisterId(canisterIds);
    };
    return APIService;
}());
exports.APIService = APIService;
var getTimeout = function (retryIndex, baseTimeout) {
    return Math.max(baseTimeout, Math.pow(baseTimeout, retryIndex + 1)) * 1000;
};
exports.getTimeout = getTimeout;
//# sourceMappingURL=ApiService.js.map