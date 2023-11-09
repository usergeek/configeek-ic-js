import {Controller, FetchResult} from "./controller/Controller";
import {log, warn} from "./utils";
import {ReplicaConfig} from "./ic/ActorFactory";

/**
 * Configeek configuration
 */
export type InitConfig = {
    /**
     * Project API key
     */
    apiKey: string,
    /**
     * Whether to fetch the configuration periodically. `false` by default
     */
    periodicFetchingEnabled?: boolean
    /**
     * Callback that notifies about updated keys in configuration
     * @param {{ updatedKeys: Array<string> }} result
     */
    onConfigurationUpdatedCallback?: (result: { updatedKeys: Array<string> }) => void
    /**
     * Periodic fetch interval. `300000` by default (5 minutes in milliseconds). One minute minimal.
     */
    fetchIntervalMillis?: number
    /**
     * Actor configuration. Used when Configeek library is used in a project running on local replica.
     */
    localReplicaConfig?: ReplicaConfig
}

const DEFAULT_FETCH_INTERVAL = process.env.NODE_ENV === "development" ? 10 * 1000 : 1000 * 60 * 5 //5min
const MIN_FETCH_INTERVAL = process.env.NODE_ENV === "development" ? 10 * 1000 : 1000 * 60 // 1min

export class ConfigeekClient {
    private config: InitConfig;

    private controller: Controller;

    private fetchConfigPromiseInProgress: Promise<FetchResult | undefined>
    private fetchTimeoutHandle: number

    /**
     * Creates a new instance of
     */
    public newInstance = () => new ConfigeekClient()

    public init = (config: InitConfig) => {
        this.destroy()
        this.config = config;

        validateApiParameters(this.config?.apiKey)
        this.controller = new Controller(config)

        try {
            log(this.config?.apiKey, `Configeek: initialized with config: ${JSON.stringify(config)}`);
        } catch (e) {
        }

        // noinspection JSIgnoredPromiseFromCall
        this.fetchConfig()
    }

    /**
     * Gets the value for the given key
     * @param {string} key
     * @return {string | undefined} Value of the configuration key or `undefined` if there is no such key or configuration is not yet initialized/loaded or can't be loaded.
     */
    public getValue(key: string): string | undefined {
        try {
            this.assertInitialization()
            return this.controller.getDictionary()[key];
        } catch (e) {
            warn(this.config?.apiKey, "ConfigeekClient.getValue", e)
        }
    }

    /**
     * Gets all config
     * @return {Record<string, string> | undefined} Configuration or `undefined` if configuration is not yet initialized.
     */
    public getAll = (): Record<string, string> | undefined => {
        try {
            this.assertInitialization()
            return {
                ...this.controller.getDictionary()
            }
        } catch (e) {
            warn(this.config?.apiKey, "ConfigeekClient.getAll", e)
        }
    }

    /**
     * Fetches configuration
     */
    public fetchConfig = () => {
        (async () => {
            try {
                this.assertInitialization()
                if (!this.fetchConfigPromiseInProgress) {
                    this.fetchConfigPromiseInProgress = Promise.resolve().then(this.controller.fetch)
                } else {
                    this.fetchConfigPromiseInProgress = this.fetchConfigPromiseInProgress.then(this.controller.fetch)
                }
                const result: FetchResult | undefined = await this.fetchConfigPromiseInProgress
                log(this.config?.apiKey, "ConfigeekClient.fetchConfig: result", result);
                if (result) {
                    const updatedKeys: Array<string> | undefined = result.updatedKeys;
                    if (updatedKeys?.length > 0 && typeof this.config.onConfigurationUpdatedCallback == "function") {
                        this.config.onConfigurationUpdatedCallback({
                            updatedKeys: updatedKeys
                        })
                    }
                    if (result.continuationHint === true) {
                        log(this.config?.apiKey, "ConfigeekClient.fetchConfig: will fetch again");
                        this.fetchConfig()
                        return
                    }
                }

                if (this.isInitialized && this.config.periodicFetchingEnabled === true) {
                    this.scheduleFetching()
                }
            } catch (e) {
                warn(this.config?.apiKey, "ConfigeekClient.fetchConfig", e)
            }
        })()
    }

    public startPeriodicFetching = () => {
        try {
            this.assertInitialization()
            this.config.periodicFetchingEnabled = true
            this.scheduleFetching()
        } catch (e) {
            warn(this.config?.apiKey, "ConfigeekClient.startPeriodicFetching", e)
        }
    }

    public stopPeriodicFetching = () => {
        try {
            this.assertInitialization()
            this.config.periodicFetchingEnabled = false
            window.clearTimeout(this.fetchTimeoutHandle)
        } catch (e) {
            warn(this.config?.apiKey, "ConfigeekClient.stopPeriodicFetching", e)
        }
    }

    public get isPeriodicFetchingEnabled(): boolean {
        try {
            this.assertInitialization()
            return this.config.periodicFetchingEnabled
        } catch (e) {
            warn(this.config?.apiKey, "ConfigeekClient.isPeriodicFetchingEnabled", e)
            return false
        }
    }

    public get isInitialized(): boolean {
        return this.controller != undefined
    }

    /**
     * Deactivate configuration and clear storage
     */
    public destroy = () => {
        window.clearTimeout(this.fetchTimeoutHandle)
        if (this.controller) {
            this.controller.destroy();
            this.controller = undefined
        }
    }

    ////////////////////////////////////////////////
    // Private
    ////////////////////////////////////////////////

    private scheduleFetching = () => {
        this.assertInitialization()
        window.clearTimeout(this.fetchTimeoutHandle)
        const this_ = this
        const timeout = Math.max(this.config.fetchIntervalMillis || DEFAULT_FETCH_INTERVAL, MIN_FETCH_INTERVAL);
        this.fetchTimeoutHandle = window.setTimeout(function () {
            // noinspection JSIgnoredPromiseFromCall
            this_.fetchConfig()
        }, timeout)
    }

    private assertInitialization = (): boolean => {
        if (this.controller == undefined) {
            throw new Error("Configeek: Please initialize SDK.")
        }
        validateApiParameters(this.config?.apiKey)
        return true
    }
}

const validateApiParameters = (apiKey: string | undefined) => {
    if (!isApiKeyValid(apiKey)) {
        throw "Configeek: Please initialize SDK with non empty apiKey."
    }
};
const isApiKeyValid = (apiKey: string | undefined): boolean => typeof apiKey == "string" && apiKey.length > 0