import { ActorConfig, ActorSubclass, HttpAgentOptions } from '@dfinity/agent';
import { _SERVICE as ServiceConfigRegistry } from "./canisters/registry.did";
import { _SERVICE as ServiceConfigStore } from "./canisters/configStore.did";
export declare type CreateActorOptions = {
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
};
export declare type ConfigRegistryActor = ActorSubclass<ServiceConfigRegistry>;
export declare type ConfigStoreActor = ActorSubclass<ServiceConfigStore>;
export declare type ReplicaConfig = {
    /**
     * The host of the environment (used in HttpAgent for calls to Configeek backend). `https://ic0.app` by default.
     */
    host?: string;
    /**
     * Whether to fetch root key of a local replica. `false` by default.
     */
    isLocalReplica?: boolean;
};
export declare class ActorFactory {
    private replicaConfig;
    constructor(replicaConfig: ReplicaConfig | undefined);
    createConfigRegistryActor: (canisterId: string) => ConfigRegistryActor;
    createConfigStoreActor: (canisterId: string) => ConfigStoreActor;
}
