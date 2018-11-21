import * as matcher from '../../src/matcher';
import * as testUtil from '../testUtil';

let opt = testUtil.parseOptions(process.argv);

const dataset = [
    { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 'A', b: 2, c: 'C', d: 'D', e: 'E', f: 6 } } },
    { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } } },
    { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5 } } },
    { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 'A', b: 2, c: 'C', d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 'A', b: 2, c: 'C', d: 4, e: 5, f: 6 } } },
    { k1: 't1', t1: { b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } } },
    { k1: 't1', t1: { a: 1, b: 2, c: 'af', d: 4, af: { a: 1, b: 2, c: 'af', d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } } }
];

const matches = matcher.findMatchesBind({ $key: '$k', '$k': { a: '$a', c: '$c', $af: { a: '$a', b: 2, c: '$c', f: 6 } } }, dataset);
const answer = [
    [{ $key: 'k1', $k: 't1', $a: 1, $c: 3, $af: 'af' }, { $key: 'k2', $k: 't2', $a: 'A', $c: 'C', $af: 'af' }], // from data 1
    [{ $key: 'k1', $k: 't1', $a: 1, $c: 3, $af: 'af' }], // data data 3
    [{ $key: 'k2', $k: 't2', $a: 'A', $c: 'C', $af: 'af' }], // data 4
    [{ $key: 'k1', $k: 't1', $a: 1, $c: 'af', $af: 'af' }]]; // data 6

testUtil.test(matches, answer, opt.verbose);
