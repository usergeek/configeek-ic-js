import {KeyValueStoreFacade} from "./store/KeyValueStoreFacade";
import {KeyValueStore} from "./store/KeyValueStore";

export type Dictionary = Record<string, any>

const KEY__UPDATE_ID = "updateId";
const KEY__DICTIONARY = "dictionary";

export class Storage {

    private store: KeyValueStore

    constructor(apiKey: string) {
        this.store = KeyValueStoreFacade.createStore(`configeek-configuration-store--${apiKey}--`)
    }

    public getUpdateId = (): number => this.store.get(KEY__UPDATE_ID) || 0

    public setUpdateId = (value: number) => this.store.set(KEY__UPDATE_ID, value)

    public getDictionary = (): Dictionary => this.store.get(KEY__DICTIONARY) || {}

    public setDictionary = (value: Dictionary) => this.store.set(KEY__DICTIONARY, value)

    public destroy = () => this.store.clearAll()

}