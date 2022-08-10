export const idlFactory = ({IDL}) => {
    const TopologyId = IDL.Nat32;
    const AccessToken = IDL.Text;
    const Topology = IDL.Record({
        'topologyId': TopologyId,
        'principals': IDL.Vec(IDL.Principal),
    });
    const ProjectApiKey = IDL.Text;
    const GetConfigStoreApiResult = IDL.Record({
        'canister': IDL.Principal,
        'accessToken': AccessToken,
    });
    const GetRegistryValueResult = IDL.Variant({
        'ok': IDL.Opt(GetConfigStoreApiResult),
        'temporaryUnavailable': IDL.Null,
        'changeTopology': Topology,
        'redirect': IDL.Principal,
        'retryWithConsensusRequest': IDL.Null,
    });
    const GetRegistryValueWithConsensusResult = IDL.Variant({
        'ok': IDL.Opt(GetConfigStoreApiResult),
        'temporaryUnavailable': IDL.Null,
        'error': IDL.Text,
        'redirect': IDL.Principal,
    });
    const ConfRegistry = IDL.Service({
        'getConfigStoreApi': IDL.Func(
            [IDL.Opt(TopologyId), ProjectApiKey],
            [GetRegistryValueResult],
            ['query'],
        ),
        'getConfigStoreApiWithConsensus': IDL.Func(
            [ProjectApiKey],
            [GetRegistryValueWithConsensusResult],
            [],
        ),
    });
    return ConfRegistry;
};
export const init = ({IDL}) => {
    return [];
};
