import type {Principal} from '@dfinity/principal';

export type AccessToken = string;

export interface ConfRegistry {
    'getConfigStoreApi': (
        arg_0: [] | [TopologyId],
        arg_1: ProjectApiKey,
    ) => Promise<GetRegistryValueResult>,
    'getConfigStoreApiWithConsensus': (
        arg_0: ProjectApiKey,
    ) => Promise<GetRegistryValueWithConsensusResult>,
}

export interface GetConfigStoreApiResult {
    'canister': Principal,
    'accessToken': AccessToken,
}

export type GetRegistryValueResult = { 'ok': [] | [GetConfigStoreApiResult] } |
    { 'temporaryUnavailable': null } |
    { 'changeTopology': Topology } |
    { 'redirect': Principal } |
    { 'retryWithConsensusRequest': null };
export type GetRegistryValueWithConsensusResult = { 'ok': [] | [GetConfigStoreApiResult] } |
    { 'temporaryUnavailable': null } |
    { 'error': string } |
    { 'redirect': Principal };
export type ProjectApiKey = string;

export interface Topology {
    'topologyId': TopologyId,
    'principals': Array<Principal>,
}

export type TopologyId = number;

export interface _SERVICE extends ConfRegistry {
}
