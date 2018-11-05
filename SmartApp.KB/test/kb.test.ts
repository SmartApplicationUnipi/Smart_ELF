import * as kb from '../src/kb';

const myid = kb.register();
let result;

result = kb.addFact(myid, 'rdf', 3, 90, false,
  { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' },
);

result = kb.addFact(myid, 'rdf', 7, 100, true,
  { relation: 'follows', subject: 'Ferrante Francesco', object: 'SmartApplication' },
);

result = kb.addFact(myid, 'rdf', 3, 50, false,
  { relation: 'isIn', object: 'Aula L', subject: 'SmartApplication' },
);

// should retrieve { $X: 'SmartApplication', $Y: 'teaches' }
console.log(kb.query({ subject: 'Gervasi', object: '$X', relation: '$Y' }));

// should retrieve 2 solution  { '$X': 'Gervasi', '$Y': 'teaches' }, { '$X': 'Ferrante Francesco', '$Y': 'follows' }
console.log(kb.query({ subject: '$X', object: 'SmartApplication', relation: '$Y' }));

result = kb.subscribe(myid, { sessionID: 1, emotion: '$E' },
  (r) => { console.log('subscription callback!'); console.log(r); },
);

result = kb.addFact(myid, 'emo', 1, 70, false,
  { sessionID: 1, emotion: 'neutral', emoCoords: { angry: 10, neutral: 90, happy: 10 } },
);

result = kb.removeFact(myid, { relation: '$r', object: 'SmartApplication' });

// should now retrieve 0 solution
console.log(kb.query({ object: 'SmartApplication', relation: '$rel' }));
