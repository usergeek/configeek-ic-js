import { TopologyId } from "./canisters/registry.did";
export declare class ApiStorage {
    private store;
    constructor(apiKey: string);
    getTopologyId: () => TopologyId;
    setTopologyId: (value: TopologyId) => void;
    getRegistryCanisterIds: () => Array<string>;
    setRegistryCanisterIds: (value: Array<string>) => void;
    destroy: () => void;
}
