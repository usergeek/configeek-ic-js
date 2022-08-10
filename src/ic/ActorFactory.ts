import {Actor, ActorConfig, ActorSubclass, AnonymousIdentity, HttpAgent, HttpAgentOptions} from '@dfinity/agent';
import {idlFactory as idlFactoryConfigRegistry} from "./canisters/registry.idl";
import {_SERVICE as ServiceConfigRegistry} from "./canisters/registry.did"
import {idlFactory as idlFactoryConfigStore} from "./canisters/configStore.idl";
import {_SERVICE as ServiceConfigStore} from "./canisters/configStore.did"
import {IDL} from '@dfinity/candid';

export type CreateActorOptions = { agentOptions?: HttpAgentOptions; actorOptions?: ActorConfig }

export type ConfigRegistryActor = ActorSubclass<ServiceConfigRegistry>
export type ConfigStoreActor = ActorSubclass<ServiceConfigStore>

const DEFAULT_HOST = "https://ic0.app"

export type ReplicaConfig = {
    /**
     * The host of the environment (used in HttpAgent for calls to Configeek backend). `https://ic0.app` by default.
     */
    host?: string,
    /**
     * Whether to fetch root key of a local replica. `false` by default.
     */
    isLocalReplica?: boolean,
}

export class ActorFactory {

    private replicaConfig: ReplicaConfig

    constructor(replicaConfig: ReplicaConfig | undefined) {
        this.replicaConfig = {
            ...replicaConfig,
            host: replicaConfig?.host || DEFAULT_HOST,
        }
    }

    public createConfigRegistryActor = (canisterId: string): ConfigRegistryActor => {
        const options = {agentOptions: {identity: new AnonymousIdentity(), host: this.replicaConfig.host}};
        return createActor<ConfigRegistryActor>(canisterId, idlFactoryConfigRegistry, options, this.replicaConfig.isLocalReplica)
    }

    public createConfigStoreActor = (canisterId: string): ConfigStoreActor => {
        const options = {agentOptions: {identity: new AnonymousIdentity(), host: this.replicaConfig.host}};
        return createActor<ConfigStoreActor>(canisterId, idlFactoryConfigStore, options, this.replicaConfig.isLocalReplica)
    }

}

const createActor = function <T>(canisterId: string, idlFactory: IDL.InterfaceFactory, options?: CreateActorOptions, isLocalReplica: boolean = false): ActorSubclass<T> {
    const agent = new HttpAgent({...options?.agentOptions});
    // Fetch root key for certificate validation during development
    if (isLocalReplica === true) {
        agent.fetchRootKey().catch(err => {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
            console.error(err);
        });
    }

    // Creates an actor with using the candid interface and the HttpAgent
    return Actor.createActor<T>(idlFactory, {
        agent,
        canisterId: canisterId,
        ...options?.actorOptions
    });
}