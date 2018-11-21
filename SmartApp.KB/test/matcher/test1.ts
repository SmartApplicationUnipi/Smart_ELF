import * as matcher from '../../src/matcher';
import * as testUtil from '../testUtil';

let opt = testUtil.parseOptions(process.argv);

const dataset = [
    { nome: 'pino', cognome: 'albero', robba: 'albero' },
];

const matches = matcher.findMatchesBind({ nome: '$y', $x: 'albero' }, dataset);
const answer = [[{ '$y': 'pino', '$x': 'cognome' },
                 { '$y': 'pino', '$x': 'robba' }]];

testUtil.test(matches, answer, opt.verbose);
