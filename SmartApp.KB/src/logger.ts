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

    public debug(msg: string, ...data: any[]): void {
        this.emitMessageLog(MsgKind.debug, msg, data);
    }

    public warn(msg: string, ...data: any[]): void {
        this.emitMessageLog(MsgKind.warn, msg, data);

    }

    public error(msg: string, ...data: any[]): void {
        this.emitMessageLog(MsgKind.error, msg, data);

    }

    public info(msg: string, ...data: any[]): void {
        this.emitMessageLog(MsgKind.info, msg, data);

    }

    private emitMessageLog(type: MsgKind, msg: string, data: any[]) {
        console.log('[' + (new Date(Date.now())).toISOString() + '] - ' + type + ': ' + msg);
    }

}

const l = Logger.getInstance();
l.warn("provaprova");
