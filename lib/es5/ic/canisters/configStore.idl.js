"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.idlFactory = void 0;
var idlFactory = function (_a) {
    var IDL = _a.IDL;
    var AccessToken = IDL.Text;
    var UpdateId = IDL.Nat32;
    var ConfigKey = IDL.Text;
    var ConfigRequestError = IDL.Variant({
        'invalidate': IDL.Null,
        'wrongToken': IDL.Null,
        'outdatedReplica': IDL.Null,
    });
    var PartialContinuation = IDL.Tuple(UpdateId, ConfigKey);
    var ConfigValue = IDL.Variant({ 'none': IDL.Null, 'text': IDL.Text });
    var ConfigPair = IDL.Tuple(ConfigKey, ConfigValue);
    var ConfigDeltaPair = IDL.Tuple(ConfigKey, IDL.Opt(ConfigValue));
    var ConfigFullPartial = IDL.Record({
        'data': IDL.Vec(ConfigPair),
        'continuation': IDL.Opt(PartialContinuation),
    });
    var ConfigVariant = IDL.Variant({
        'fullPartial': ConfigFullPartial,
        'full': IDL.Vec(ConfigPair),
        'deltaPartial': IDL.Vec(ConfigDeltaPair),
        'delta': IDL.Vec(ConfigDeltaPair),
    });
    var ConfigRequestResult = IDL.Record({
        'data': ConfigVariant,
        'lastRegisteredUpdateId': UpdateId,
    });
    var GetConfigResult = IDL.Variant({
        'ok': ConfigRequestResult,
        'err': ConfigRequestError,
    });
    var GetConfigFullPartialResult = IDL.Variant({
        'ok': ConfigFullPartial,
        'err': ConfigRequestError,
    });
    return IDL.Service({
        'getConfig': IDL.Func([AccessToken, UpdateId], [GetConfigResult], ['query']),
        'getConfigFullContinuation': IDL.Func([AccessToken, PartialContinuation], [GetConfigFullPartialResult], ['query']),
    });
};
exports.idlFactory = idlFactory;
var init = function (_a) {
    var IDL = _a.IDL;
    return [];
};
exports.init = init;
//# sourceMappingURL=configStore.idl.js.map