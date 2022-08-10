import { InitConfig } from "../ConfigeekClient";
import { Dictionary } from "../storage/Storage";
export declare type FetchResult = {
    updatedKeys?: Array<string>;
    continuationHint?: boolean;
};
export declare class Controller {
    private configStoreApiPromise;
    private readonly config;
    private readonly fetcher;
    private readonly storage;
    private dictionary;
    private readonly actorFactory;
    private apiService;
    private destroyed;
    constructor(config: InitConfig);
    getDictionary: () => Dictionary;
    fetch: () => Promise<FetchResult | undefined>;
    destroy: () => void;
    private analyzeConfigurationResponseStore;
    private askForConfigStoreApi;
    private getConfigStoreApi;
}
