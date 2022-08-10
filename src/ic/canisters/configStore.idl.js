export const idlFactory = ({IDL}) => {
    const AccessToken = IDL.Text;
    const UpdateId = IDL.Nat32;
    const ConfigKey = IDL.Text;
    const ConfigRequestError = IDL.Variant({
        'invalidate': IDL.Null,
        'wrongToken': IDL.Null,
        'outdatedReplica': IDL.Null,
    });
    const PartialContinuation = IDL.Tuple(UpdateId, ConfigKey);
    const ConfigValue = IDL.Variant({'none': IDL.Null, 'text': IDL.Text});
    const ConfigPair = IDL.Tuple(ConfigKey, ConfigValue);
    const ConfigDeltaPair = IDL.Tuple(ConfigKey, IDL.Opt(ConfigValue));
    const ConfigFullPartial = IDL.Record({
        'data': IDL.Vec(ConfigPair),
        'continuation': IDL.Opt(PartialContinuation),
    });
    const ConfigVariant = IDL.Variant({
        'fullPartial': ConfigFullPartial,
        'full': IDL.Vec(ConfigPair),
        'deltaPartial': IDL.Vec(ConfigDeltaPair),
        'delta': IDL.Vec(ConfigDeltaPair),
    });
    const ConfigRequestResult = IDL.Record({
        'data': ConfigVariant,
        'lastRegisteredUpdateId': UpdateId,
    });
    const GetConfigResult = IDL.Variant({
        'ok': ConfigRequestResult,
        'err': ConfigRequestError,
    });
    const GetConfigFullPartialResult = IDL.Variant({
        'ok': ConfigFullPartial,
        'err': ConfigRequestError,
    });

    return IDL.Service({
        'getConfig': IDL.Func(
            [AccessToken, UpdateId],
            [GetConfigResult],
            ['query'],
        ),
        'getConfigFullContinuation': IDL.Func(
            [AccessToken, PartialContinuation],
            [GetConfigFullPartialResult],
            ['query'],
        ),
    });
};
export const init = ({IDL}) => {
    return [];
};
