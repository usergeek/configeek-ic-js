import { AccessToken, ConfigDeltaPair, ConfigPair, ConfigRequestError } from "../ic/canisters/configStore.did";
import { KeysOfUnion } from "../utils";
import { ActorFactory } from "../ic/ActorFactory";
export declare type FetchParameters = {
    canisterPrincipal: string;
    accessToken: AccessToken;
    updateId: number;
    actorFactory: ActorFactory;
};
export declare type KeyValuePair = {
    key: string;
    value: string;
};
export declare type FetchResponse = {
    status: ConfigStatus;
    updateId: number;
    updatedKeys: Array<KeyValuePair>;
    removedKeys: Array<string>;
} | {
    status: "error";
    reason: GetConfigErrorType;
};
export declare class Fetcher {
    fetch: (parameters: FetchParameters, apiKey: string) => Promise<FetchResponse | undefined>;
}
export declare type ConfigStatus = "full" | "delta" | "deltaPartial";
declare type GetConfigRecursivelyResultDataCommon<T extends ConfigStatus> = {
    status: T;
    updateId: number;
};
declare type ConfigurationValueFull = GetConfigRecursivelyResultDataCommon<"full"> & {
    full: Array<ConfigPair>;
};
declare type ConfigurationValueDelta = GetConfigRecursivelyResultDataCommon<"delta"> & {
    delta: Array<ConfigDeltaPair>;
};
declare type ConfigurationValueDeltaPartial = GetConfigRecursivelyResultDataCommon<"deltaPartial"> & {
    delta: Array<ConfigDeltaPair>;
};
export declare type GetConfigRecursivelyResultData = ConfigurationValueFull | ConfigurationValueDelta | ConfigurationValueDeltaPartial;
export declare type GetConfigErrorType = KeysOfUnion<ConfigRequestError>;
export {};
