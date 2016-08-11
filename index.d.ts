interface config {}

interface LogDictionnary {
    httpMethod?: string;
    httpURL?: string;
    [field: string]: any;
}

declare class RequestLogger {
    constructor(
        logger: any,
        logLevel: string,
        dumpThreshold: string,
        endLevel: string,
        uids?: string|Array<string>
    );
    getUids(): Array<string>;
    getSerializedUids(): string;
    addDefaultFields(fields: LogDictionnary): LogDictionnary;
    trace(msg: string, data?: LogDictionnary): void;
    debug(msg: string, data?: LogDictionnary): void;
    info(msg: string, data?: LogDictionnary): void;
    warn(msg: string, data?: LogDictionnary): void;
    error(msg: string, data?: LogDictionnary): void;
    fatal(msg: string, data?: LogDictionnary): void;
    end(msg: string, data?: LogDictionnary): void;
}

declare module 'werelogs' {
    export class Logger {
        name: string;

        constructor(name: string, config?: config);
        setLevel(levelName: string): void;
        setDumpLevelThreshold(levelName: string): void;
        newRequestLogger(uids?: string|Array<string>): RequestLogger;
        newRequestLoggerFromSerializedUids(uids: string): RequestLogger;
        trace(msg: string, data?: LogDictionnary): void;
        debug(msg: string, data?: LogDictionnary): void;
        info(msg: string, data?: LogDictionnary): void;
        warn(msg: string, data?: LogDictionnary): void;
        error(msg: string, data?: LogDictionnary): void;
        fatal(msg: string, data?: LogDictionnary): void;
    }
}
