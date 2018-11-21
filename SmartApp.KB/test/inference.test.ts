import { security } from '../src/config';
import * as kb from '../src/kb';

const myid = 'testodio';
kb.registerTags({ rdf: 'desc1', tag2: 'desc2' });

const rule1 = new kb.DataRule( { subject: '$prof', relation: 'is in', object: '$room' },
    [{ subject: '$prof', relation: 'teaches', object: '$course' },
    { subject: '$course', relation: 'is in room', object: '$room' }] );

const rule2 = new kb.DataRule(
    { sessionID: 1, emotion: 'switch', emoCoords: { angry: 20, neutral: '$h', happy: '$n' } },
    [{ emoCoords: { angry: 10, neutral: '$n', happy: '$h' } }]);

kb.addRule(myid, 'test', rule1);

kb.addRule(myid, 'test', rule2);

const newFact = { subject: 'Gervasi', relation: 'teaches', object: 'SmartApplication' };

kb.addFact(myid, 'rdf', 7, 100,
    { subject: 'SmartApplication', relation: 'is in room', object: 'Aula X1' },
);

kb.addFact(myid, 'rdf', 7, 100,
    { subject: 'SmartApplication', relation: 'is in room', object: 'Aula A' },
);

kb.addFact(myid, 'rdf', 7, 100,
    { subject: 'SmartApplication', relation: 'is in room', object: 'Aula X3' },
);

kb.subscribe(myid, { subject: 'Gervasi', relation: 'is in', object: '$aula' }, (r) => console.log(r));

kb.addFact(myid, 'rdf', 3, 90, newFact);

kb.subscribe(myid, { emotion: '$e', emoCoords: '$ec' }, (r) => console.log(r));

kb.addFact(myid, 'emo', 1, 70,
    { sessionID: 1, emotion: 'neutral', emoCoords: { angry: 10, neutral: 90, happy: 10 } },
);
