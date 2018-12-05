import * as matcher from '../../src/matcher';
import * as testUtil from '../testUtil';
import { DataObject } from '../../src/kb';

let opt = testUtil.parseOptions(process.argv);
const  faketime = new Date();

const dataset: DataObject[] = [
    {
        _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: faketime }, _id: 0,
        _data: { nome: 'pino', cognome: 'albero', robba: 'albero' }
    }
];

const matches = matcher.findMatches({ _data: { nome: '$y', $x: 'albero' } }, dataset);
const answer = new Map<object, object[]>();
answer.set({
    _meta: { idSource: '', tag: '', TTL: 0, reliability: 0, creationTime: faketime }, _id: 0,
    _data: { nome: 'pino', cognome: 'albero', robba: 'albero' }
}, [{ '$y': 'pino', '$x': 'cognome' }, { '$y': 'pino', '$x': 'robba' }]);

testUtil.test(matches, answer, opt.verbose);
