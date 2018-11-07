import * as kb from '../src/kb';

const myid = kb.register();

const newFact = { subject: 'Gervasi', relation: 'teaches', object: 'SmartApplication' };

kb.addFact(myid, 'rdf', 7, 100, true,
  { subject: 'SmartApplication', relation: 'is in room', object: 'Aula X1' },
);

kb.addFact(myid, 'rdf', 7, 100, true,
  { subject: 'SmartApplication', relation: 'is in room', object: 'Aula A' },
);

kb.addFact(myid, 'rdf', 7, 100, true,
  { subject: 'SmartApplication', relation: 'is in room', object: 'Aula X3' },
);
kb.subscribe(myid, {subject: 'Gervasi', relation: 'is in', object: '$aula'}, (r) => console.log(r) );

kb.addFact(myid, 'rdf', 3, 90, false, newFact);

kb.subscribe(myid, {emotion: '$e', emoCoords: '$ec'}, (r) => console.log(r) );

kb.addFact(myid, 'emo', 1, 70, false,
  { sessionID: 1, emotion: 'neutral', emoCoords: { angry: 10, neutral: 90, happy: 10 } },
);
