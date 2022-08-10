////////////////////////////////////////////////
// UGResult
////////////////////////////////////////////////

const okResultKey = "ok"
const errResultKey = "err"

export type OkResult<T> = { [okResultKey]: T }
export type ErrResult<T> = { [errResultKey]: T }
export type UGResult<S, F> = OkResult<S> | ErrResult<F>

export type UGError = "retry" | "fatal"

export const isOk = <T>(obj: T): obj is T & OkResult<unknown> => {
    return hasOwnProperty(obj, okResultKey)
}

export const isErr = <T>(obj: T): obj is T & ErrResult<unknown> => {
    return hasOwnProperty(obj, errResultKey)
}

export const createOkResult = <T>(value: T): OkResult<T> => {
    return {[okResultKey]: value}
}

export const createErrResult = <T>(value: T): ErrResult<T> => {
    return {[errResultKey]: value}
}

export const createErrFatal = (): ErrResult<UGError> => {
    return createErrResult("fatal")
}

export const createErrRetry = (): ErrResult<UGError> => {
    return createErrResult("retry")
}

export const getICFirstKey = <T>(obj: T): string => {
    return Object.keys(obj)[0]
}

export function getICOptional<T>(value?: [] | [T]): T | undefined {
    return value != undefined ?
        value.length === 1 ? value[0] : undefined
        : undefined
}

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type RemoteActionFnResult<ErrorReason, SuccessResult extends any = undefined> = {
    status: "success"
    result: SuccessResult
} | {
    status: "error",
    reason: KeysOfUnion<ErrorReason>
} | {
    status: "unknownError",
    error: Error
}

/**
 * We want to check if prop is a property key of obj
 * @param obj - object
 * @param prop - property
 * @link https://fettblog.eu/typescript-hasownproperty/
 */
export function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop)
}

export const delayPromise = (duration) => {
    return new Promise(resolve => setTimeout(resolve, duration));
}

///////////////////////////////////////////////////////
// Logging
///////////////////////////////////////////////////////

export function log(...args) {
    dumpToWindow("log", args)
    // if (process.env.NODE_ENV === "development") {
    //     console.log.apply(null, ["DEV LOG", ...args])
    // }
}

export const warn = (...args) => {
    dumpToWindow("warn", args)
    // if (process.env.NODE_ENV === "development") {
    //     console.warn.apply(null, ["DEV WARN", ...args])
    // }
}

const logName = "ConfigeekLog";

let debugSequenceId: number = 0

const hasWindow = typeof window !== "undefined"

function dumpToWindow(ctx: "log" | "warn", value) {
    if (hasWindow) {
        window[logName] = window[logName] || {}
        window[logName][ctx] = window[logName][ctx] || []
        window[logName][ctx].push([debugSequenceId++, new Date().getTime(), ...value])
        if (window[logName][ctx].length >= 1000) {
            window[logName][ctx].splice(0, 100)
        }
    }
}