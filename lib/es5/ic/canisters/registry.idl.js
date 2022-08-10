"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.idlFactory = void 0;
var idlFactory = function (_a) {
    var IDL = _a.IDL;
    var TopologyId = IDL.Nat32;
    var AccessToken = IDL.Text;
    var Topology = IDL.Record({
        'topologyId': TopologyId,
        'principals': IDL.Vec(IDL.Principal),
    });
    var ProjectApiKey = IDL.Text;
    var GetConfigStoreApiResult = IDL.Record({
        'canister': IDL.Principal,
        'accessToken': AccessToken,
    });
    var GetRegistryValueResult = IDL.Variant({
        'ok': IDL.Opt(GetConfigStoreApiResult),
        'temporaryUnavailable': IDL.Null,
        'changeTopology': Topology,
        'redirect': IDL.Principal,
        'retryWithConsensusRequest': IDL.Null,
    });
    var GetRegistryValueWithConsensusResult = IDL.Variant({
        'ok': IDL.Opt(GetConfigStoreApiResult),
        'temporaryUnavailable': IDL.Null,
        'error': IDL.Text,
        'redirect': IDL.Principal,
    });
    var ConfRegistry = IDL.Service({
        'getConfigStoreApi': IDL.Func([IDL.Opt(TopologyId), ProjectApiKey], [GetRegistryValueResult], ['query']),
        'getConfigStoreApiWithConsensus': IDL.Func([ProjectApiKey], [GetRegistryValueWithConsensusResult], []),
    });
    return ConfRegistry;
};
exports.idlFactory = idlFactory;
var init = function (_a) {
    var IDL = _a.IDL;
    return [];
};
exports.init = init;
//# sourceMappingURL=registry.idl.js.map