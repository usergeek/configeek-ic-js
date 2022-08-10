"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiStorage = void 0;
var KeyValueStoreFacade_1 = require("../storage/store/KeyValueStoreFacade");
var utils_1 = require("../utils");
var KEY__TOPOLOGY = "topology";
var KEY__REGISTRY_CANISTERS = "registryCanisters";
var DEFAULT_TOPOLOGY = 1;
var ApiStorage = /** @class */ (function () {
    function ApiStorage(apiKey) {
        var _this = this;
        this.getTopologyId = function () {
            var value = _this.store.get(KEY__TOPOLOGY);
            if (value != undefined) {
                return Number(value);
            }
            return DEFAULT_TOPOLOGY;
        };
        this.setTopologyId = function (value) { return _this.store.set(KEY__TOPOLOGY, value); };
        this.getRegistryCanisterIds = function () {
            try {
                var valueFromStorage = _this.store.get(KEY__REGISTRY_CANISTERS);
                if (valueFromStorage && Array.isArray(valueFromStorage)) {
                    return valueFromStorage;
                }
            }
            catch (e) {
                (0, utils_1.warn)("ApiServiceStorage.getRegistryCanisterIds caught error", e);
            }
            return [];
        };
        this.setRegistryCanisterIds = function (value) {
            _this.store.set(KEY__REGISTRY_CANISTERS, JSON.stringify(value));
        };
        this.destroy = function () { return _this.store.clearAll(); };
        this.store = KeyValueStoreFacade_1.KeyValueStoreFacade.createStore("configeek-configuration-api--".concat(apiKey, "--"));
    }
    return ApiStorage;
}());
exports.ApiStorage = ApiStorage;
//# sourceMappingURL=ApiStorage.js.map