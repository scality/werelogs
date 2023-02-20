interface WerelogsConfigOptions {
    level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    dump?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    streams?: object[];
}

declare class WerelogsConfig {
    constructor(config?: WerelogsConfigOptions);
    reset(): WerelogsConfig;
    update(config: WerelogsConfig): WerelogsConfig;
    logger: any;
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    dump: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    end: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
}

interface LogDictionary {
    httpMethod?: string;
    httpURL?: string;
    [field: string]: any;
}

declare module 'werelogs' {
    export class RequestLogger {
        constructor(
            logger: any,
            logLevel: string,
            dumpThreshold: string,
            endLevel: string,
            uids?: string|Array<string>
        );
        getUids(): Array<string>;
        getSerializedUids(): string;
        addDefaultFields(fields: LogDictionary): LogDictionary;
        trace(msg: string, data?: LogDictionary): void;
        debug(msg: string, data?: LogDictionary): void;
        info(msg: string, data?: LogDictionary): void;
        warn(msg: string, data?: LogDictionary): void;
        error(msg: string, data?: LogDictionary): void;
        fatal(msg: string, data?: LogDictionary): void;
        end(msg: string, data?: LogDictionary): void;
        errorEnd(msg: string, data?:LogDictionary): void;
    }

    export class Logger {
        name: string;
        constructor(name: string);
        newRequestLogger(uids?: string|Array<string>): RequestLogger;
        newRequestLoggerFromSerializedUids(uids: string): RequestLogger;
        trace(msg: string, data?: LogDictionary): void;
        debug(msg: string, data?: LogDictionary): void;
        info(msg: string, data?: LogDictionary): void;
        warn(msg: string, data?: LogDictionary): void;
        error(msg: string, data?: LogDictionary): void;
        fatal(msg: string, data?: LogDictionary): void;
    }

    export function configure(config: WerelogsConfigOptions): void;

    export class API {
        constructor(config: WerelogsConfigOptions);
        reconfigure(config: WerelogsConfigOptions): void;
        Logger: Logger;
    }
}
