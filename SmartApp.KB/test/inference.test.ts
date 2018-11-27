import { security } from '../src/config';
import * as kb from '../src/kb';

const myid = kb.register().details;
kb.registerTags(myid, { rdf: new kb.TagInfo('rdf triple', 'fakedoc'), emo: new kb.TagInfo('emo triple', 'fakedoc')} );

// if $prof teaches $coruse and $course is in room $room then $prof is in $room
// { subj: '$prof', rel: 'is in', obj: '$room' } :-
//        { subject: '$prof', relation: 'teaches', object: '$course' },
//        { subject: '$course', relation: 'is in room', object: '$room' }

const rule1 = new kb.DataRule( { subject: '$prof', relation: 'is in', object: '$room' },
    [{ subject: '$prof', relation: 'teaches', object: '$course' },
    { subject: '$course', relation: 'is in room', object: '$room' }] );

kb.addRule(myid, 'test', rule1);

kb.addFact(myid, 'rdf', 7, 100,
    { subject: 'SmartApplication', relation: 'is in room', object: 'Aula X1' },
);

kb.addFact(myid, 'rdf', 7, 100,
    { subject: 'SmartApplication', relation: 'is in room', object: 'Aula A' },
);

kb.addFact(myid, 'rdf', 7, 100,
    { subject: 'SmartApplication', relation: 'is in room', object: 'Aula X3' },
);

// tslint:disable-next-line:max-line-length
kb.subscribe(myid, { _data: { subject: 'Gervasi', relation: 'is in', object: '$aula' }}, (r) => console.log('callback: ', r));

const newFact = { subject: 'Gervasi', relation: 'teaches', object: 'SmartApplication' };

kb.addFact(myid, 'rdf', 3, 90, newFact);

kb.subscribe(myid, { _data: { emotion: '$e', emoCoords: '$ec' }}, (r) => console.log('callback2', r));

// test variable switch
const rule2 = new kb.DataRule(
    { sessionID: 1, emotion: 'switch', emoCoords: { angry: 20, neutral: '$h', happy: '$n' } },
    [{ emoCoords: { angry: 10, neutral: '$n', happy: '$h' } }]);

kb.addRule(myid, 'rdf', rule2);

kb.addFact(myid, 'emo', 1, 70,
    { sessionID: 1, emotion: 'neutral', emoCoords: { angry: 10, neutral: 90, happy: 10 } },
);
