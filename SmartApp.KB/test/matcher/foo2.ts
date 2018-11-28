import * as matcher from '../../src/matcher';
import * as testUtil from '../testUtil';

let opt = testUtil.parseOptions(process.argv);

const dataset = [
    {
        i: '3', j: '5'
    },
    {
        i: '2', j: '10', k: '10'
    },
    {
        i: '100', j: '23'
    },
    {
        i: '42', j: '42'
    },
];

const matches = matcher.findMatches({ '_predicates': [['isLess', ['3', '5']]], 'i': '3', 'j': '5' }, dataset);
const answer: Map<object, object[]> = new Map<object, object[]>();
answer.set({
    i: '3', j: '5'
}, []);

testUtil.test(matches, answer, opt.verbose);
