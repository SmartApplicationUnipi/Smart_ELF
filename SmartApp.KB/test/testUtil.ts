import deepEqual from 'deep-equal';
import { Matches } from '../src/matcher';

export function parseOptions(opts: string[]): any {
    let verbose: boolean = false;
    let debug: number = 0;
    for (let i = 0; i < opts.length; ++i) {
        if (opts[i] === 'verbose') {
            i++;
            verbose = (opts[i] === '1');
        }
        if (opts[i] === 'debug') {
            i++;
            debug = +(opts[i]);
        }
    }
    return { verbose, debug };
}

export function test(answer: Matches, expected: Matches, verbose: boolean) {
    const res: boolean = isEqual(answer, expected);
    if (res) {
        process.exit(0);
    } else {
        if (verbose) {
            console.log(answer);
            console.log(expected);
        }
        process.exit(1);
    }
}

export function isEqual(answer: Matches, expected: Matches): boolean {
    if (answer.size !== expected.size) {
        return false;
    }
    for (const [key, val] of expected) {
        for (const k of answer.keys()) {
            if (deepEqual(key, k)) {
                if (!deepEqual(val, answer.get(k))) {
                    return false;
                }
                break;
            }
        }
    }
    return true;
}
