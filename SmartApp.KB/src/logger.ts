enum MsgKind {
    debug = 'DEBUG',
    info = 'INFO',
    warn = 'WARN',
    error = 'ERROR',
}

export class Logger {

    private static _instance: Logger;

    private constructor() {
        // far partire un thread che alle 00.00 cambia file di log

    }
    /*
        public foo() {
            const date: string = 'log_' + (new Date(Date.now())).toISOString().substring(0, 10) + '.txt';
            console.log(date);
        }
    */
    public static getInstance() {
        if (!this._instance) {
            this._instance = new Logger();
        }
        return this._instance;
    }

    public debug(mod: string, msg: string, ...data: any[]): void {
        this.emitMessageLog(MsgKind.debug, mod, msg, data);
    }

    public warn(mod: string, msg: string, ...data: any[]): void {
        this.emitMessageLog(MsgKind.warn, mod, msg, data);

    }

    public error(mod: string, msg: string, ...data: any[]): void {
        this.emitMessageLog(MsgKind.error, mod, msg, data);

    }

    public info(mod: string, msg: string, ...data: any[]): void {
        this.emitMessageLog(MsgKind.info, mod, msg, data);

    }

    private emitMessageLog(type: MsgKind, mod: string, msg: string, data: any[]) {
        console.log('[' + (new Date(Date.now())).toISOString() + '] - {' + mod + '} - ' + type + ': ' + msg, data);
    }
}
