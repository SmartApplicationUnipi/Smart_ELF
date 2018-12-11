/**
 * Interface that defines a logger for ELF.
 */
export abstract class ILogger {
    private enabled: boolean = true;

    abstract onLog(level: LEVEL, ...messages: Array<any>): void;

    public log(level: LEVEL, ...messages: Array<any>): void {
        if(this.enabled) {
            this.onLog(level, messages);
        }
    }

    /**
     * Disable the logger
     * @param b 
     */
    public enable(b: boolean): void {
        this.enabled = b;
    }
}

/**
 * This class handles logging to ELF logging system
 */
export class ConsoleLogger extends ILogger {

    /**
     * Log a message in the logging system.
     * @param message The message to be logged
     * @param level The priority of the message
     */
    public onLog(level: LEVEL, ...messages: Array<any>): void {
        var logFun = null;
        switch (level) {
            case LEVEL.WARNING:
                logFun = console.warn;
                break;
            case LEVEL.ERROR:
                logFun = console.error;
                break;
            default:
                logFun = console.log;
                break;
        }

        (messages || []).forEach(m => logFun(m));
    }
}

export enum LEVEL {
    INFO,
    WARNING,
    ERROR
}

/**
 * Singleton pattern.
 */
var _instance: ILogger;

export function getInstance(): ILogger {
    if (!_instance) {
        _instance = new ConsoleLogger();
    }
    return _instance;
}