export const enum Colors {
    WHITE = '\x1b[0m',
    RED = '\x1b[1;31m',
    GREEN = '\x1b[1;32m',
    YELLOW = '\x1b[1;33m',
    BLUE = '\x1b[1;34m',
    PINK = '\x1b[1;35m'
};

export class Debugger {
    debugLevel: number = 0;
    indentation: number = 0;

    public constructor(i: number = 0) {
        this.debugLevel = i;
    }

    public increaseIndentation() {
        this.indentation++;
    }

    public decreaseIndentation() {
        this.indentation--;
    }

    public resetIndentation() {
        this.indentation = 0;
    }

    public setDebugLevel(i: number) {
        this.debugLevel = i;
    }

    public newLine(level: number) {
        if (level <= this.debugLevel) {
            console.log('');
        }
    }

    public clog(color: string, kind: string, id: number, before: string, msg: string, level: number) {
        if (level <= this.debugLevel) {
            let ind: string = '';
            for (let i = 0; i < this.indentation; ++i) {
                ind += '\t';
            }
            console.log(ind + before + color + kind + '(' + id + ')' + Colors.WHITE + ' ' + msg);
        }
    }

    public clogNoID(color: string, kind: string, before: string, msg: string, level: number) {
        if (level <= this.debugLevel) {
            let ind: string = '';
            for (let i = 0; i < this.indentation; ++i) {
                ind += '\t';
            }
            console.log(ind + before + color + kind + Colors.WHITE + ' ' + msg);
        }
    }

    public static staticClog(color: string, kind: string, id: number, before: string, msg: string) {
        console.log(before + color + kind + '(' + id + ')' + Colors.WHITE + ' ' + msg);
    }

    public static staticClogNoID(color: string, kind: string, before: string, msg: string) {
        console.log(before + color + kind + Colors.WHITE + ' ' + msg);
    }
}






