import * as matcher from '../../src/matcher';
import * as testUtil from '../testUtil';

let opt = testUtil.parseOptions(process.argv);

const dataset = [
    {
        i: '3', j: '5',
    },
    {
        i: '2', j: '10', k: '10',
    },
    {
        i: '100', j: '23',
    },
    {
        i: '42', j: '42',
    },
];

const matches = matcher.findMatches2({ _predicates: [['isGreater', ['$i', '$j']]] }, dataset, [[{ $i: 3, $j: 5}],
[{ $i: 2, $j: 10}],
[{ $i: 100, $j: 23}],
[{ $i: 42, $j: 42}],
]);

const answer: Map<object, object[]> = new Map<object, object[]>();
answer.set({
    i: '100', j: '23'
}, [{ '$i': '100', '$j': '23' }]);

testUtil.test(matches, answer, opt.verbose);

