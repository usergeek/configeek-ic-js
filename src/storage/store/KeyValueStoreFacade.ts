import {LocalStorageKeyValueStore} from "./LocalStorageKeyValueStore";
import {InMemoryKeyValueStore} from "./InMemoryKeyValueStore";
import {KeyValueStore} from "./KeyValueStore";

export const grabLocalStorage = (): Storage | undefined => {
    return window.localStorage
}

const checkLocalStorage = () => {
    try {
        const storage = grabLocalStorage()
        const testKey = `kvsf-0123456789-ic_test_ls`;
        // @ts-ignore
        storage.setItem(testKey, "_");
        // @ts-ignore
        storage.removeItem(testKey);
        return true
    } catch (e) {
        return false
    }
}

const isLocalStorageSupported = checkLocalStorage()

const createStore = (namespace: string): KeyValueStore => {
    if (isLocalStorageSupported) {
        return new LocalStorageKeyValueStore(namespace)
    } else {
        return new InMemoryKeyValueStore()
    }
}

export const KeyValueStoreFacade = {
    createStore: createStore,
}