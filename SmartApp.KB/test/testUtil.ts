import deepEqual from 'deep-equal';
import { Response } from '../src/matcher';

export function parseOptions(opts: string[]): any {
    let verbose: boolean = false;
    let debug: number = 0;
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

export function test(answer: Response, expected: Response, verbose: boolean) {
    const res: boolean = isEqual(answer, expected);
    if (res) {
        process.exit(0);
    } else {
        if (verbose) {
            console.log(answer);
        }
        process.exit(1);
    }
}

export function isEqual(answer: Response, expected: Response): boolean {
    for (let i of expected.keys()) {
        if (!(answer.has(i))) {
            return false;
        }
    }
    for (let i of answer.keys()) {
        if (!(expected.has(i) && deepEqual(answer.get(i), expected.get(i)))) {
            return false;
        }
    }
    return true;
}
