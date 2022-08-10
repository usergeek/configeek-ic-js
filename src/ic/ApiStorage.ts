import {KeyValueStoreFacade} from "../storage/store/KeyValueStoreFacade";
import {KeyValueStore} from "../storage/store/KeyValueStore";
import {TopologyId} from "./canisters/registry.did";
import {warn} from "../utils";

const KEY__TOPOLOGY = "topology";
const KEY__REGISTRY_CANISTERS = "registryCanisters";

const DEFAULT_TOPOLOGY = 1

export class ApiStorage {

    private store: KeyValueStore

    constructor(apiKey: string) {
        this.store = KeyValueStoreFacade.createStore(`configeek-configuration-api--${apiKey}--`)
    }

    public getTopologyId = (): TopologyId => {
        const value = this.store.get(KEY__TOPOLOGY);
        if (value != undefined) {
            return Number(value)
        }
        return DEFAULT_TOPOLOGY
    }

    public setTopologyId = (value: TopologyId) => this.store.set(KEY__TOPOLOGY, value)

    public getRegistryCanisterIds = (): Array<string> => {
        try {
            const valueFromStorage = this.store.get(KEY__REGISTRY_CANISTERS);
            if (valueFromStorage && Array.isArray(valueFromStorage)) {
                return valueFromStorage
            }
        } catch (e) {
            warn("ApiServiceStorage.getRegistryCanisterIds caught error", e);
        }
        return []
    }

    public setRegistryCanisterIds = (value: Array<string>) => {
        this.store.set(KEY__REGISTRY_CANISTERS, JSON.stringify(value))
    }

    public destroy = () => this.store.clearAll()
}