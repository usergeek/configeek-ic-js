import { AccessToken } from "./canisters/configStore.did";
import { UGError, UGResult } from "../utils";
import { GetConfigStoreApiResult } from "./canisters/registry.did";
import { ActorFactory } from "./ActorFactory";
export declare const timeoutBetweenRetriesSec = 2;
export declare type ConfigStoreApiResult = {
    status: "success";
    canisterPrincipal: string;
    accessToken: AccessToken;
} | {
    status: "error";
};
export declare type ConfigRegistryResponse = UGResult<GetConfigStoreApiResult, "changeTopology" | UGError>;
export interface ApiParameters {
    apiKey: string;
    actorFactory: ActorFactory;
}
export declare class APIService {
    private storage;
    private destroyed;
    constructor(apiKey: string);
    getConfigStoreApi(apiParameters: ApiParameters): Promise<ConfigStoreApiResult>;
    destroy: (apiKey?: string) => void;
    private callConfigRegistryRecursively;
    private getResult;
    private callActorRecursively;
    private callActor;
    private static getRandomCanisterId;
    private static getCanisterId;
}
export declare const getTimeout: (retryIndex: number, baseTimeout: number) => number;
