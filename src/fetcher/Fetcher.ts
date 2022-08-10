import {AccessToken, ConfigDeltaPair, ConfigFullPartial, ConfigPair, ConfigRequestError, ConfigRequestResult, ConfigValue, ConfigVariant, GetConfigFullPartialResult, GetConfigResult, PartialContinuation} from "../ic/canisters/configStore.did";
import {getICFirstKey, getICOptional, hasOwnProperty, isErr, isOk, KeysOfUnion, log, RemoteActionFnResult, warn} from "../utils";
import {ActorFactory, ConfigStoreActor} from "../ic/ActorFactory";

export type FetchParameters = {
    canisterPrincipal: string
    accessToken: AccessToken
    updateId: number
    actorFactory: ActorFactory
}

export type KeyValuePair = {
    key: string
    value: string
}

export type FetchResponse = {
    status: ConfigStatus
    updateId: number
    updatedKeys: Array<KeyValuePair>
    removedKeys: Array<string>
} | {
    status: "error",
    reason: GetConfigErrorType
}


export class Fetcher {

    public fetch = async (parameters: FetchParameters): Promise<FetchResponse | undefined> => {
        try {
            log("Fetcher.fetch: start with", parameters);
            const canisterId = parameters.canisterPrincipal;
            const configStoreActor = parameters.actorFactory.createConfigStoreActor(canisterId);
            const context: GetConfigRecursivelyContext = {
                updateId: parameters.updateId,
                accessToken: parameters.accessToken,
                accumulator: [],
                continuation: undefined
            };
            const result: GetConfigRecursivelyResult = await getConfigRecursively(configStoreActor, context)
            log("Fetcher.fetch: getConfigRecursively result", result);
            switch (result.status) {
                case "success": {
                    const resultData: GetConfigRecursivelyResultData = result.result;
                    let responseParameters: Array<ResponseParameter>
                    switch (resultData.status) {
                        case "full": {
                            responseParameters = responseParametersFromFullICResult(resultData.full)
                            break;
                        }
                        case "delta":
                        case "deltaPartial": {
                            responseParameters = responseParametersFromDeltaICResult(resultData.delta)
                            break;
                        }
                    }
                    const {updatedKeys, removedKeys} = mapResponseParameters(responseParameters)
                    return {
                        status: resultData.status,
                        updateId: resultData.updateId,
                        updatedKeys: updatedKeys,
                        removedKeys: removedKeys,
                    }
                }
                case "error": {
                    warn("Fetcher.fetch: getConfigRecursively error", result.reason);
                    return {
                        status: "error",
                        reason: result.reason
                    }
                }
                case "unknownError": {
                    //nop
                    warn("Fetcher.fetch: getConfigRecursively unknownError");
                    return undefined
                }
            }
        } catch (error) {
            warn("Fetcher.fetch: caught error", error);
            throw error
        }
    }
}


export type ConfigStatus = "full" | "delta" | "deltaPartial"
type GetConfigRecursivelyResultDataCommon<T extends ConfigStatus> = {
    status: T
    updateId: number
}
type ConfigurationValueFull = GetConfigRecursivelyResultDataCommon<"full"> & { full: Array<ConfigPair> }
type ConfigurationValueDelta = GetConfigRecursivelyResultDataCommon<"delta"> & { delta: Array<ConfigDeltaPair> }
type ConfigurationValueDeltaPartial = GetConfigRecursivelyResultDataCommon<"deltaPartial"> & { delta: Array<ConfigDeltaPair> }
export type GetConfigRecursivelyResultData = ConfigurationValueFull | ConfigurationValueDelta | ConfigurationValueDeltaPartial

export type GetConfigErrorType = KeysOfUnion<ConfigRequestError>
type GetConfigRecursivelyResult = RemoteActionFnResult<ConfigRequestError, GetConfigRecursivelyResultData>
type GetConfigRecursivelyContext = {
    updateId: number
    accessToken: AccessToken
    accumulator: Array<ConfigPair>,
    continuation: PartialContinuation | undefined
}

const getConfigRecursively = async (actor: ConfigStoreActor, context: GetConfigRecursivelyContext): Promise<GetConfigRecursivelyResult> => {
    log("Fetcher.getConfigRecursively: start with", context);
    if (context.continuation) {
        const result: GetConfigFullPartialResult = await actor.getConfigFullContinuation(context.accessToken, context.continuation)
        log("Fetcher.getConfigRecursively: getConfigFullContinuation result", result);
        if (isOk(result)) {
            return await processFullPartial(actor, context, result.ok)
        } else if (isErr(result)) {
            const validationErrorName = getICFirstKey(result.err) as GetConfigErrorType
            return {
                status: "error", reason: validationErrorName
            }
        }
    } else {
        const result: GetConfigResult = await actor.getConfig(context.accessToken, context.updateId)
        log("Fetcher.getConfigRecursively: getConfig result", result);
        if (isOk(result)) {
            const configRequestResult: ConfigRequestResult = result.ok
            const updateId: number = configRequestResult.lastRegisteredUpdateId
            const configVariant: ConfigVariant = configRequestResult.data
            if (hasOwnProperty(configVariant, "full")) {
                const full: Array<ConfigPair> = configVariant.full;
                return {
                    status: "success",
                    result: {
                        status: "full",
                        updateId: updateId,
                        full: full
                    }
                }
            } else if (hasOwnProperty(configVariant, "delta")) {
                const delta: Array<ConfigDeltaPair> = configVariant.delta;
                return {
                    status: "success",
                    result: {
                        status: "delta",
                        updateId: updateId,
                        delta: delta
                    }
                }
            } else if (hasOwnProperty(configVariant, "fullPartial")) {
                const fullPartial: ConfigFullPartial = configVariant.fullPartial;
                const newContext = {...context, updateId: updateId};
                return await processFullPartial(actor, newContext, fullPartial)
            } else if (hasOwnProperty(configVariant, "deltaPartial")) {
                const deltaPartial: Array<ConfigDeltaPair> = configVariant.deltaPartial;
                return {
                    status: "success",
                    result: {
                        status: "deltaPartial",
                        updateId: updateId,
                        delta: deltaPartial
                    }
                }
            }
        } else if (isErr(result)) {
            const validationErrorName = getICFirstKey(result.err) as GetConfigErrorType
            return {
                status: "error", reason: validationErrorName
            }
        }
    }
    return {
        status: "unknownError", error: new Error("unknown")
    }
}

const processFullPartial = async (actor: ConfigStoreActor, context: GetConfigRecursivelyContext, fullPartial: ConfigFullPartial): Promise<GetConfigRecursivelyResult> => {
    const continuation: PartialContinuation | undefined = getICOptional(fullPartial.continuation);
    const newAccumulator: Array<ConfigPair> = [
        ...context.accumulator,
        ...fullPartial.data
    ];
    if (continuation) {
        const newContext = {
            ...context,
            continuation: continuation,
            accumulator: newAccumulator
        };
        return await getConfigRecursively(actor, newContext)
    } else {
        return {
            status: "success",
            result: {
                status: "full",
                updateId: context.updateId,
                full: newAccumulator
            }
        }
    }
}


type ResponseParameter = { key: string, configValue: ConfigValue | undefined }
const responseParametersFromDeltaICResult = (icConfigParameters: Array<ConfigDeltaPair>): Array<ResponseParameter> => {
    return icConfigParameters.map<ResponseParameter>((v) => {
        const key = v[0]
        const valueOptional: ConfigValue | undefined = getICOptional(v[1])
        if (valueOptional) {
            return {
                key: key,
                configValue: valueOptional
            }
        }
        return {
            key: key,
            configValue: undefined
        }
    })
}

const responseParametersFromFullICResult = (icConfigParameters: Array<ConfigPair>): Array<ResponseParameter> => {
    return icConfigParameters.map<ResponseParameter>((v) => {
        const key = v[0]
        const value = v[1]
        return {
            key: key,
            configValue: value
        }
    })
}

const mapResponseParameters = (responseParameters: Array<ResponseParameter>): {
    updatedKeys: Array<KeyValuePair>
    removedKeys: Array<string>
} => {
    const updatedKeys: Array<KeyValuePair> = []
    const removedKeys: Array<string> = []
    responseParameters.forEach((v) => {
        if (v.configValue != undefined) {
            if (hasOwnProperty(v.configValue, "text")) {
                updatedKeys.push({
                    key: v.key,
                    value: v.configValue.text
                })
            }
        } else {
            removedKeys.push(v.key)
        }
    })
    return {
        updatedKeys: updatedKeys,
        removedKeys: removedKeys
    }
}
