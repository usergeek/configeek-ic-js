export declare type Dictionary = Record<string, any>;
export declare class Storage {
    private store;
    constructor(apiKey: string);
    getUpdateId: () => number;
    setUpdateId: (value: number) => void;
    getDictionary: () => Dictionary;
    setDictionary: (value: Dictionary) => void;
    destroy: () => void;
}
