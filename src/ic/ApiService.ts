import {Principal} from "@dfinity/principal";
import {AccessToken} from "./canisters/configStore.did";
import {createErrFatal, createErrResult, createErrRetry, createOkResult, delayPromise, hasOwnProperty, isErr, isOk, log, UGError, UGResult, warn} from "../utils";
import {GetConfigStoreApiResult, GetRegistryValueResult, GetRegistryValueWithConsensusResult, Topology, TopologyId} from "./canisters/registry.did";
import {configRegistry_canister_ids} from "./canisters/constants";
import {ApiStorage} from "./ApiStorage";
import {ActorFactory} from "./ActorFactory";

export const timeoutBetweenRetriesSec = 2
const GLOBAL_RETRIES: number = 3

const REGISTRY_REDIRECT_RETRIES: number = 3

export type ConfigStoreApiResult = {
    status: "success"
    canisterPrincipal: string
    accessToken: AccessToken
} | {
    status: "error"
}

export type ConfigRegistryResponse = UGResult<GetConfigStoreApiResult, "changeTopology" | UGError>

export interface ApiParameters {
    apiKey: string
    actorFactory: ActorFactory
}

let currentSessionTopologyId

export class APIService {
    private storage
    private destroyed: boolean = false

    constructor(apiKey: string) {
        this.storage = new ApiStorage(apiKey)
    }

    public async getConfigStoreApi(apiParameters: ApiParameters): Promise<ConfigStoreApiResult> {
        try {
            log("APIService.getConfigStoreApi: start with", apiParameters);
            const result: ConfigRegistryResponse = await this.callConfigRegistryRecursively(apiParameters, GLOBAL_RETRIES);
            log(`APIService.getConfigStoreApi: result`, result);
            if (!this.destroyed) {
                if (isOk(result)) {
                    const apiResult: GetConfigStoreApiResult = result.ok;
                    return {
                        status: "success",
                        canisterPrincipal: apiResult.canister.toText(),
                        accessToken: apiResult.accessToken
                    }
                }
            } else {
                warn("APIService.getConfigStoreApi: result skipped - destroyed")
            }
        } catch (e) {
            warn("APIService.getConfigStoreApi: caught error", e);
        }
        return {
            status: "error"
        }
    }

    public destroy = () => {
        this.destroyed = true
        this.storage.destroy()
        warn("APIService: destroyed")
    }

    ////////////////////////////////////////////////
    // Private
    ////////////////////////////////////////////////

    private callConfigRegistryRecursively = async (apiParameters: ApiParameters, retriesLeft: number): Promise<ConfigRegistryResponse> => {
        log(`APIService.callConfigRegistryRecursively: start with`, {retriesLeft});
        const configRegistryResponse: ConfigRegistryResponse = await this.getResult(apiParameters, REGISTRY_REDIRECT_RETRIES);
        log(`APIService.callConfigRegistryRecursively: result`, configRegistryResponse);
        if (isOk<ConfigRegistryResponse>(configRegistryResponse)) {
            return configRegistryResponse
        } else if (isErr<ConfigRegistryResponse>(configRegistryResponse)) {
            switch (configRegistryResponse.err) {
                case "changeTopology": {
                    if (!this.destroyed) {
                        const timeout = getTimeout(GLOBAL_RETRIES - retriesLeft, timeoutBetweenRetriesSec)
                        log(`APIService.callConfigRegistryRecursively: changeTopology : sleep for ${timeout}ms`);
                        await delayPromise(timeout)
                        if (!this.destroyed) {
                            return this.callConfigRegistryRecursively(apiParameters, retriesLeft - 1)
                        }
                    }
                    warn("APIService.callConfigRegistryRecursively: changeTopology : skipped - destroyed")
                    break
                }
                case "retry": {
                    if (!this.destroyed) {
                        if (retriesLeft > 0) {
                            const timeout = getTimeout(GLOBAL_RETRIES - retriesLeft, timeoutBetweenRetriesSec)
                            log("sleep for", timeout, "ms");
                            await delayPromise(timeout)
                            return this.callConfigRegistryRecursively(apiParameters, retriesLeft - 1)
                        } else {
                            warn("APIService.callConfigRegistryRecursively: retry : skipped - no more retries")
                        }
                    } else {
                        warn("APIService.callConfigRegistryRecursively: retry : skipped - destroyed")
                    }
                    break
                }
                default: {
                }
            }
        }
        return createErrFatal()
    }

    private getResult = async (apiParameters: ApiParameters, retriesLeft: number): Promise<ConfigRegistryResponse> => {
        currentSessionTopologyId = this.storage.getTopologyId()
        let canisterIds: Array<string> = this.storage.getRegistryCanisterIds()
        if (canisterIds.length === 0) {
            canisterIds = Array.from(configRegistry_canister_ids)
        }
        if (canisterIds.length === 0) {
            warn("APIService.getResult: no registry canisters - exit");
            return createErrFatal()
        }
        log("APIService.getResult: using", {canisterIds: canisterIds, currentSessionTopologyId: currentSessionTopologyId});
        const canisterId: string | undefined = APIService.getCanisterId(canisterIds);
        if (canisterId) {
            return this.callActorRecursively(canisterId, apiParameters, retriesLeft, false)
        }
        return createErrFatal()
    }

    private callActorRecursively = async (canisterId: string, apiParameters: ApiParameters, retriesLeft: number, useActorMethodWithConsensus: boolean): Promise<ConfigRegistryResponse> => {
        log("CoordinatorApi.callActorRecursively: start with", {currentSessionTopologyId, canisterId, useActorMethodWithConsensus, retriesLeft});
        if (canisterId) {
            let result: GetRegistryValueResult | GetRegistryValueWithConsensusResult;
            try {
                result = await this.callActor(canisterId, apiParameters, useActorMethodWithConsensus);
                log(`APIService.callActorRecursively: result`, result);
            } catch (e) {
                warn("APIService.callActorRecursively: caught error", e);
                return createErrRetry()
            }
            if (isOk(result)) {
                if (result.ok.length === 1) {
                    const apiResult: GetConfigStoreApiResult = result.ok[0]
                    return createOkResult(apiResult)
                }
            } else if (hasOwnProperty(result, "changeTopology")) {
                const changeTopology: Topology = result.changeTopology;
                const newTopologyId: TopologyId = changeTopology.topologyId;
                const newPrincipals: Array<Principal> = changeTopology.principals;
                const newCanisterIds: Array<string> = []
                for (let i = 0; i < newPrincipals.length; i++) {
                    newCanisterIds.push(newPrincipals[i].toText())
                }
                log("APIService.callActorRecursively: changeTopology : new canisterIds from new topology", newCanisterIds);
                if (newCanisterIds.length > 0) {
                    currentSessionTopologyId = newTopologyId
                    this.storage.setTopologyId(newTopologyId)
                    this.storage.setRegistryCanisterIds(newCanisterIds)
                }
                return createErrResult("changeTopology")
            } else if (hasOwnProperty(result, "redirect")) {
                if (!this.destroyed) {
                    if (retriesLeft > 0) {
                        const principalToRedirectTo: Principal = result.redirect;
                        return this.callActorRecursively(principalToRedirectTo.toText(), apiParameters, retriesLeft - 1, false)
                    } else {
                        warn("APIService.callActorRecursively: redirect : skip - no more retries")
                    }
                } else {
                    warn("APIService.callActorRecursively: redirect : skip - destroyed")
                }
                return createErrFatal()
            } else if (hasOwnProperty(result, "retryWithConsensusRequest")) {
                if (!this.destroyed) {
                    if (retriesLeft > 0) {
                        return this.callActorRecursively(canisterId, apiParameters, retriesLeft - 1, true)
                    } else {
                        warn("APIService.callActorRecursively: retryWithConsensusRequest : skip - no more retries")
                    }
                } else {
                    warn("APIService.callActorRecursively: retryWithConsensusRequest : skip - destroyed")
                }
            }
            //"temporaryUnavailable"/"error" case
            return createErrFatal()
        }
        return createErrFatal()
    }

    private callActor = async (canisterId: string, apiParameters: ApiParameters, useActorMethodWithConsensus: boolean): Promise<GetRegistryValueResult | GetRegistryValueWithConsensusResult> => {
        const actor = apiParameters.actorFactory.createConfigRegistryActor(canisterId)
        if (useActorMethodWithConsensus) {
            return await actor.getConfigStoreApiWithConsensus(apiParameters.apiKey);
        }
        const topologyId = currentSessionTopologyId
        return await actor.getConfigStoreApi(topologyId ? [topologyId] : [], apiParameters.apiKey);
    };

    private static getRandomCanisterId = (array: Array<string>): string => {
        const index = Math.floor(Math.random() * array.length);
        return array[index]
    };

    private static getCanisterId = (canisterIds: Array<string>): string | undefined => {
        if (canisterIds.length == 0) {
            return undefined
        }
        return APIService.getRandomCanisterId(canisterIds)
    };

}

export const getTimeout = (retryIndex: number, baseTimeout: number): number => {
    return Math.max(baseTimeout, Math.pow(baseTimeout, retryIndex + 1)) * 1000
}