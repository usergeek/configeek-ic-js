import {InitConfig} from "../ConfigeekClient";
import {Fetcher, FetchParameters, FetchResponse, KeyValuePair} from "../fetcher/Fetcher";
import {Dictionary, Storage} from "../storage/Storage";
import {ApiParameters, APIService, ConfigStoreApiResult} from "../ic/ApiService";
import {delayPromise, log, warn} from "../utils";
import {ActorFactory} from "../ic/ActorFactory";


export type FetchResult = {
    updatedKeys?: Array<string>
    continuationHint?: boolean
}

export class Controller {
    private configStoreApiPromise: Promise<ConfigStoreApiResult | undefined>
    private readonly config: InitConfig
    private readonly fetcher: Fetcher
    private readonly storage: Storage

    private dictionary: Dictionary

    private readonly actorFactory: ActorFactory;

    private apiService: APIService

    private destroyed: boolean = false

    constructor(config: InitConfig) {
        this.config = config
        this.fetcher = new Fetcher()
        this.storage = new Storage(this.config.apiKey)
        this.dictionary = this.storage.getDictionary()
        this.actorFactory = new ActorFactory(this.config?.localReplicaConfig)
    }

    public getDictionary = () => this.dictionary

    public fetch = async (): Promise<FetchResult | undefined> => {
        try {
            this.askForConfigStoreApi()
            const configStoreApiResult: ConfigStoreApiResult = await this.configStoreApiPromise;
            if (configStoreApiResult.status === "success") {
                const updateId = this.storage.getUpdateId();
                const fetchParameters: FetchParameters = {
                    canisterPrincipal: configStoreApiResult.canisterPrincipal,
                    accessToken: configStoreApiResult.accessToken,
                    updateId: updateId,
                    actorFactory: this.actorFactory,
                };
                const result: FetchResponse | undefined = await this.fetcher.fetch(fetchParameters)
                log("Controller.fetch: result", result);
                if (!this.destroyed) {
                    if (result) {
                        if (result.status === "error") {
                            if (result.reason === "invalidate") {
                                //configuration changed during chunks fetching process
                                const isConfigurationEmptyState = updateId === 0;
                                if (isConfigurationEmptyState) {
                                    //will try to fetch configuration
                                    warn("Controller.fetch: error: invalidate - will retry to fetch configuration");
                                    await delayPromise(1000)
                                    return {
                                        continuationHint: true
                                    }
                                }
                            } else if (result.reason === "wrongToken") {
                                //destroy api
                                warn("Controller.fetch: error: wrongToken - destroy api")
                                this.configStoreApiPromise = undefined
                            } else if (result.reason === "outdatedReplica") {
                                //outdatedReplica means that replica has updateId less than SDK sent to it.
                                //do nothing - we hope that next fetch will be processed by up-to-date replica. Outdated replica hopefully soon will sync its state.
                                warn("Controller.fetch: error: outdatedReplica - do nothing")
                            }
                        } else {
                            const updateId = result.updateId;
                            this.storage.setUpdateId(updateId)
                            switch (result.status) {
                                case "full": {
                                    const {updatedKeys} = this.analyzeConfigurationResponseStore(result.updatedKeys, result.removedKeys, true)
                                    return {
                                        updatedKeys: updatedKeys,
                                    }
                                }
                                case "delta": {
                                    const hasKeysToProcess = result.updatedKeys.length > 0 || result.removedKeys.length > 0;
                                    if (hasKeysToProcess) {
                                        const {updatedKeys} = this.analyzeConfigurationResponseStore(result.updatedKeys, result.removedKeys, false)
                                        return {
                                            updatedKeys: updatedKeys,
                                        }
                                    } else {
                                        return undefined
                                    }
                                }
                                case "deltaPartial": {
                                    const {updatedKeys} = this.analyzeConfigurationResponseStore(result.updatedKeys, result.removedKeys, false)
                                    return {
                                        updatedKeys: updatedKeys,
                                        continuationHint: true
                                    }
                                }
                            }

                        }
                    }
                } else {
                    warn("Controller.fetch: result skipped - destroyed")
                }
            } else {
                warn("Controller.fetch: result failed - destroy api")
                this.configStoreApiPromise = undefined
            }
        } catch (e) {
            warn("Controller.fetch: caught error", e);
            //nop
        }
    }

    public destroy = () => {
        this.destroyed = true
        if (this.storage) {
            this.storage.destroy()
        }
        if (this.apiService) {
            this.apiService.destroy()
        }
        warn("Controller: destroyed")
    }

    ////////////////////////////////////////////////
    // Private
    ////////////////////////////////////////////////

    private analyzeConfigurationResponseStore = (updatedKeys_raw: Array<KeyValuePair>, removedKeys_raw: Array<string>, shouldOverwriteStorage: boolean): {
        updatedKeys: Array<string>
    } => {
        const newDictionary: Dictionary = {}
        for (let i = 0; i < updatedKeys_raw.length; i++) {
            const parameter: KeyValuePair = updatedKeys_raw[i];
            newDictionary[parameter.key] = parameter.value
        }
        const updatedKeys: Array<string> = [
            ...Object.keys(newDictionary),
            ...removedKeys_raw
        ]

        const dictionaryFromStorage = this.storage.getDictionary();

        if (shouldOverwriteStorage) {
            //overwrite whole dictionary
            this.dictionary = {
                ...newDictionary
            }
        } else {
            //process removed parameters
            for (let i = 0; i < removedKeys_raw.length; i++) {
                const removedKey: string = removedKeys_raw[i];
                delete dictionaryFromStorage[removedKey]
            }

            //process updated parameters
            this.dictionary = {
                ...dictionaryFromStorage,
                ...newDictionary
            }
        }

        //update storage
        this.storage.setDictionary(this.dictionary)
        return {
            updatedKeys: updatedKeys
        }
    }

    private askForConfigStoreApi = () => {
        if (!this.configStoreApiPromise) {
            this.configStoreApiPromise = Promise.resolve().then(this.getConfigStoreApi)
        }
    }

    private getConfigStoreApi = async (): Promise<ConfigStoreApiResult> => {
        try {
            const apiParameters: ApiParameters = {
                apiKey: this.config.apiKey,
                actorFactory: this.actorFactory,
            };
            if (!this.apiService) {
                this.apiService = new APIService(this.config.apiKey);
            }
            const configStoreApiResult: ConfigStoreApiResult = await this.apiService.getConfigStoreApi(apiParameters)
            log("ConfigeekClient.getConfigStoreApi: result", configStoreApiResult);
            return configStoreApiResult
        } catch (e) {
            warn("ConfigeekClient.getConfigStoreApi: caught error", e)
            return {status: "error"}
        }
    };
}