import { ReplicaConfig } from "./ic/ActorFactory";
/**
 * Configeek configuration
 */
export declare type InitConfig = {
    /**
     * Project API key
     */
    apiKey: string;
    /**
     * Whether to fetch the configuration periodically. `false` by default
     */
    periodicFetchingEnabled?: boolean;
    /**
     * Callback that notifies about updated keys in configuration
     * @param {{ updatedKeys: Array<string> }} result
     */
    onConfigurationUpdatedCallback?: (result: {
        updatedKeys: Array<string>;
    }) => void;
    /**
     * Periodic fetch interval. `300000` by default (5 minutes in milliseconds). One minute minimal.
     */
    fetchIntervalMillis?: number;
    /**
     * Actor configuration. Used when Configeek library is used in a project running on local replica.
     */
    localReplicaConfig?: ReplicaConfig;
};
export declare class ConfigeekClient {
    private config;
    private controller;
    private fetchConfigPromiseInProgress;
    private fetchTimeoutHandle;
    init: (config: InitConfig) => void;
    /**
     * Gets the value for the given key
     * @param key
     */
    getValue(key: string): string | undefined;
    /**
     * Gets all config
     */
    getAll: () => Record<string, string> | undefined;
    /**
     * Fetches configuration
     */
    fetchConfig: () => void;
    startPeriodicFetching: () => void;
    stopPeriodicFetching: () => void;
    get isPeriodicFetchingEnabled(): boolean;
    get isInitialized(): boolean;
    /**
     * Deactivate configuration and clear storage
     */
    destroy: () => void;
    private scheduleFetching;
    private assertInitialization;
}
