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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigeekClient = void 0;
var Controller_1 = require("./controller/Controller");
var utils_1 = require("./utils");
var DEFAULT_FETCH_INTERVAL = process.env.NODE_ENV === "development" ? 10 * 1000 : 1000 * 60 * 5; //5min
var MIN_FETCH_INTERVAL = process.env.NODE_ENV === "development" ? 10 * 1000 : 1000 * 60; // 1min
var ConfigeekClient = /** @class */ (function () {
    function ConfigeekClient() {
        var _this = this;
        this.init = function (config) {
            var _a;
            _this.destroy();
            _this.config = config;
            validateApiParameters((_a = _this.config) === null || _a === void 0 ? void 0 : _a.apiKey);
            _this.controller = new Controller_1.Controller(config);
            try {
                (0, utils_1.log)("Configeek: initialized with config: ".concat(JSON.stringify(config)));
            }
            catch (e) {
            }
            // noinspection JSIgnoredPromiseFromCall
            _this.fetchConfig();
        };
        /**
         * Gets all config
         */
        this.getAll = function () {
            try {
                _this.assertInitialization();
                return __assign({}, _this.controller.getDictionary());
            }
            catch (e) {
                (0, utils_1.warn)("ConfigeekClient.getAll", e);
            }
        };
        /**
         * Fetches configuration
         */
        this.fetchConfig = function () {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var result, updatedKeys, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.assertInitialization();
                            if (!this.fetchConfigPromiseInProgress) {
                                this.fetchConfigPromiseInProgress = Promise.resolve().then(this.controller.fetch);
                            }
                            else {
                                this.fetchConfigPromiseInProgress = this.fetchConfigPromiseInProgress.then(this.controller.fetch);
                            }
                            return [4 /*yield*/, this.fetchConfigPromiseInProgress];
                        case 1:
                            result = _a.sent();
                            (0, utils_1.log)("ConfigeekClient.fetchConfig: result", result);
                            if (result) {
                                updatedKeys = result.updatedKeys;
                                if ((updatedKeys === null || updatedKeys === void 0 ? void 0 : updatedKeys.length) > 0 && typeof this.config.onConfigurationUpdatedCallback == "function") {
                                    this.config.onConfigurationUpdatedCallback({
                                        updatedKeys: updatedKeys
                                    });
                                }
                                if (result.continuationHint === true) {
                                    (0, utils_1.log)("ConfigeekClient.fetchConfig: will fetch again");
                                    this.fetchConfig();
                                    return [2 /*return*/];
                                }
                            }
                            if (this.isInitialized && this.config.periodicFetchingEnabled === true) {
                                this.scheduleFetching();
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            e_1 = _a.sent();
                            (0, utils_1.warn)("ConfigeekClient.fetchConfig", e_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })();
        };
        this.startPeriodicFetching = function () {
            try {
                _this.assertInitialization();
                _this.config.periodicFetchingEnabled = true;
                _this.scheduleFetching();
            }
            catch (e) {
                (0, utils_1.warn)("ConfigeekClient.startPeriodicFetching", e);
            }
        };
        this.stopPeriodicFetching = function () {
            try {
                _this.assertInitialization();
                _this.config.periodicFetchingEnabled = false;
                window.clearTimeout(_this.fetchTimeoutHandle);
            }
            catch (e) {
                (0, utils_1.warn)("ConfigeekClient.stopPeriodicFetching", e);
            }
        };
        /**
         * Deactivate configuration and clear storage
         */
        this.destroy = function () {
            window.clearTimeout(_this.fetchTimeoutHandle);
            if (_this.controller) {
                _this.controller.destroy();
                _this.controller = undefined;
            }
        };
        ////////////////////////////////////////////////
        // Private
        ////////////////////////////////////////////////
        this.scheduleFetching = function () {
            _this.assertInitialization();
            window.clearTimeout(_this.fetchTimeoutHandle);
            var this_ = _this;
            var timeout = Math.max(_this.config.fetchIntervalMillis || DEFAULT_FETCH_INTERVAL, MIN_FETCH_INTERVAL);
            _this.fetchTimeoutHandle = window.setTimeout(function () {
                // noinspection JSIgnoredPromiseFromCall
                this_.fetchConfig();
            }, timeout);
        };
        this.assertInitialization = function () {
            var _a;
            if (_this.controller == undefined) {
                throw new Error("Configeek: Please initialize SDK.");
            }
            validateApiParameters((_a = _this.config) === null || _a === void 0 ? void 0 : _a.apiKey);
            return true;
        };
    }
    /**
     * Gets the value for the given key
     * @param key
     */
    ConfigeekClient.prototype.getValue = function (key) {
        try {
            this.assertInitialization();
            return this.controller.getDictionary()[key];
        }
        catch (e) {
            (0, utils_1.warn)("ConfigeekClient.getValue", e);
        }
    };
    Object.defineProperty(ConfigeekClient.prototype, "isPeriodicFetchingEnabled", {
        get: function () {
            try {
                this.assertInitialization();
                return this.config.periodicFetchingEnabled;
            }
            catch (e) {
                (0, utils_1.warn)("ConfigeekClient.isPeriodicFetchingEnabled", e);
                return false;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConfigeekClient.prototype, "isInitialized", {
        get: function () {
            return this.controller != undefined;
        },
        enumerable: false,
        configurable: true
    });
    return ConfigeekClient;
}());
exports.ConfigeekClient = ConfigeekClient;
var validateApiParameters = function (apiKey) {
    if (!isApiKeyValid(apiKey)) {
        throw "Configeek: Please initialize SDK with non empty apiKey.";
    }
};
var isApiKeyValid = function (apiKey) { return typeof apiKey == "string" && apiKey.length > 0; };
//# sourceMappingURL=ConfigeekClient.js.map