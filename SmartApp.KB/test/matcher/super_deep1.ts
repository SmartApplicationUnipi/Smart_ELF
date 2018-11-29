import * as matcher from '../../src/matcher';
import * as testUtil from '../testUtil';
import { DataObject } from '../../src/kb';

let opt = testUtil.parseOptions(process.argv);

const dataset: DataObject[] = [
    {
        _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 0,
        _data: { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 'A', b: 2, c: 'C', d: 'D', e: 'E', f: 6 } } }
    },
    {
        _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 1,
        _data: { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } } }
    },
    {
        _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 2,
        _data: { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5 } } }
    },
    {
        _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 3,
        _data: { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 'A', b: 2, c: 'C', d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 'A', b: 2, c: 'C', d: 4, e: 5, f: 6 } } }
    },
    {
        _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 4,
        _data: { k1: 't1', t1: { b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } } }
    },
    {
        _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 5,
        _data: { k1: 't1', t1: { a: 1, b: 2, c: 'af', d: 4, af: { a: 1, b: 2, c: 'af', d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } } }
    }
];

const matches = matcher.findMatches({ _data: { $key: '$k', '$k': { a: '$a', c: '$c', $af: { a: '$a', b: 2, c: '$c', f: 6 } } } }, dataset);
const answer = new Map<object, object[]>();
answer.set({
    _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 0,
    _data: { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 'A', b: 2, c: 'C', d: 'D', e: 'E', f: 6 } } }
},
    [{ $key: 'k1', $k: 't1', $a: 1, $c: 3, $af: 'af' }, { $key: 'k2', $k: 't2', $a: 'A', $c: 'C', $af: 'af' }]);
answer.set({
    _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 2,
    _data: { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5 } } }
},
    [{ $key: 'k1', $k: 't1', $a: 1, $c: 3, $af: 'af' }]);
answer.set({
    _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 3,
    _data: { k1: 't1', t1: { a: 1, b: 2, c: 3, d: 4, af: { a: 'A', b: 2, c: 'C', d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 'A', b: 2, c: 'C', d: 4, e: 5, f: 6 } } }
},
    [{ $key: 'k2', $k: 't2', $a: 'A', $c: 'C', $af: 'af' }]);
answer.set({
    _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: new Date(Date.now()) }, _id: 5,
    _data: { k1: 't1', t1: { a: 1, b: 2, c: 'af', d: 4, af: { a: 1, b: 2, c: 'af', d: 4, e: 5, f: 6 } }, k2: 't2', t2: { a: 'A', b: 'B', c: 'C', d: 'D', af: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } } }
},
    [{ $key: 'k1', $k: 't1', $a: 1, $c: 'af', $af: 'af' }]);

testUtil.test(matches, answer, opt.verbose);
