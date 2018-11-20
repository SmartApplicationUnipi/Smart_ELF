import deepEqual from 'deep-equal';

export function parseOptions(opts:string[]): any {
    let verbose:boolean = false;
    let debug:number = 0;
    for (let i = 0; i < opts.length; ++i) {
        if (opts[i] === "verbose") {
            i++;
	    verbose = (opts[i] === "1");
        }
        if (opts[i] === "debug") {
            i++;
            debug = +(opts[i]);
        }
    }
    return { verbose, debug };
}

export function test(query:any[], answer:any[], verbose:boolean) {
    const res:boolean = isEqual(query, answer);
    if (res) {
        process.exit(0);
    } else {
        if (verbose) {
            console.log(query);
        }
        process.exit(1);
    }
}

export function isEqual(value: any, other: any): boolean {
    return deepEqual(value, other);
}
