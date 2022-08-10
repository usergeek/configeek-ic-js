"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
var KeyValueStoreFacade_1 = require("./store/KeyValueStoreFacade");
var KEY__UPDATE_ID = "updateId";
var KEY__DICTIONARY = "dictionary";
var Storage = /** @class */ (function () {
    function Storage(apiKey) {
        var _this = this;
        this.getUpdateId = function () { return _this.store.get(KEY__UPDATE_ID) || 0; };
        this.setUpdateId = function (value) { return _this.store.set(KEY__UPDATE_ID, value); };
        this.getDictionary = function () { return _this.store.get(KEY__DICTIONARY) || {}; };
        this.setDictionary = function (value) { return _this.store.set(KEY__DICTIONARY, value); };
        this.destroy = function () { return _this.store.clearAll(); };
        this.store = KeyValueStoreFacade_1.KeyValueStoreFacade.createStore("configeek-configuration-store--".concat(apiKey, "--"));
    }
    return Storage;
}());
exports.Storage = Storage;
//# sourceMappingURL=Storage.js.map