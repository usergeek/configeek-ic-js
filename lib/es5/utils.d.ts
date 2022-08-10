declare const okResultKey = "ok";
declare const errResultKey = "err";
export declare type OkResult<T> = {
    [okResultKey]: T;
};
export declare type ErrResult<T> = {
    [errResultKey]: T;
};
export declare type UGResult<S, F> = OkResult<S> | ErrResult<F>;
export declare type UGError = "retry" | "fatal";
export declare const isOk: <T>(obj: T) => obj is T & OkResult<unknown>;
export declare const isErr: <T>(obj: T) => obj is T & ErrResult<unknown>;
export declare const createOkResult: <T>(value: T) => OkResult<T>;
export declare const createErrResult: <T>(value: T) => ErrResult<T>;
export declare const createErrFatal: () => ErrResult<UGError>;
export declare const createErrRetry: () => ErrResult<UGError>;
export declare const getICFirstKey: <T>(obj: T) => string;
export declare function getICOptional<T>(value?: [] | [T]): T | undefined;
export declare type KeysOfUnion<T> = T extends T ? keyof T : never;
export declare type RemoteActionFnResult<ErrorReason, SuccessResult extends any = undefined> = {
    status: "success";
    result: SuccessResult;
} | {
    status: "error";
    reason: KeysOfUnion<ErrorReason>;
} | {
    status: "unknownError";
    error: Error;
};
/**
 * We want to check if prop is a property key of obj
 * @param obj - object
 * @param prop - property
 * @link https://fettblog.eu/typescript-hasownproperty/
 */
export declare function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown>;
export declare const delayPromise: (duration: any) => Promise<unknown>;
export declare function log(...args: any[]): void;
export declare const warn: (...args: any[]) => void;
export {};
