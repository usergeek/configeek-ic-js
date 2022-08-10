import type {ActorMethod} from '@dfinity/agent';

export type AccessToken = string;
export type ConfigDeltaPair = [ConfigKey, [] | [ConfigValue]];

export interface ConfigFullPartial {
    'data': Array<ConfigPair>,
    'continuation': [] | [PartialContinuation],
}

export type ConfigKey = string;
export type ConfigPair = [ConfigKey, ConfigValue];
export type ConfigRequestError = { 'invalidate': null } |
    { 'wrongToken': null } |
    { 'outdatedReplica': null };

export interface ConfigRequestResult {
    'data': ConfigVariant,
    'lastRegisteredUpdateId': UpdateId,
}

export type ConfigValue = { 'none': null } |
    { 'text': string };
export type ConfigVariant = { 'fullPartial': ConfigFullPartial } |
    { 'full': Array<ConfigPair> } |
    { 'deltaPartial': Array<ConfigDeltaPair> } |
    { 'delta': Array<ConfigDeltaPair> };
export type GetConfigFullPartialResult = { 'ok': ConfigFullPartial } |
    { 'err': ConfigRequestError };
export type GetConfigResult = { 'ok': ConfigRequestResult } |
    { 'err': ConfigRequestError };
export type PartialContinuation = [UpdateId, ConfigKey];
export type UpdateId = number;

export interface _SERVICE {
    'getConfig': ActorMethod<[AccessToken, UpdateId], GetConfigResult>,
    'getConfigFullContinuation': ActorMethod<[AccessToken, PartialContinuation],
        GetConfigFullPartialResult>,
}
