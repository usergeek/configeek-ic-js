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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorFactory = void 0;
var agent_1 = require("@dfinity/agent");
var registry_idl_1 = require("./canisters/registry.idl");
var configStore_idl_1 = require("./canisters/configStore.idl");
var DEFAULT_HOST = "https://ic0.app";
var ActorFactory = /** @class */ (function () {
    function ActorFactory(replicaConfig) {
        var _this = this;
        this.createConfigRegistryActor = function (canisterId) {
            var options = { agentOptions: { identity: new agent_1.AnonymousIdentity(), host: _this.replicaConfig.host } };
            return createActor(canisterId, registry_idl_1.idlFactory, options, _this.replicaConfig.isLocalReplica);
        };
        this.createConfigStoreActor = function (canisterId) {
            var options = { agentOptions: { identity: new agent_1.AnonymousIdentity(), host: _this.replicaConfig.host } };
            return createActor(canisterId, configStore_idl_1.idlFactory, options, _this.replicaConfig.isLocalReplica);
        };
        this.replicaConfig = __assign(__assign({}, replicaConfig), { host: (replicaConfig === null || replicaConfig === void 0 ? void 0 : replicaConfig.host) || DEFAULT_HOST });
    }
    return ActorFactory;
}());
exports.ActorFactory = ActorFactory;
var createActor = function (canisterId, idlFactory, options, isLocalReplica) {
    if (isLocalReplica === void 0) { isLocalReplica = false; }
    var agent = new agent_1.HttpAgent(__assign({}, options === null || options === void 0 ? void 0 : options.agentOptions));
    // Fetch root key for certificate validation during development
    if (isLocalReplica === true) {
        agent.fetchRootKey().catch(function (err) {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
            console.error(err);
        });
    }
    // Creates an actor with using the candid interface and the HttpAgent
    return agent_1.Actor.createActor(idlFactory, __assign({ agent: agent, canisterId: canisterId }, options === null || options === void 0 ? void 0 : options.actorOptions));
};
//# sourceMappingURL=ActorFactory.js.map