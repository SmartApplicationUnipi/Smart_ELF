import * as kb from '../src/kb';

const myid = kb.register();
let result;

result = kb.addFact(myid, 'rdf', 3, 90,
  { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' },
);

result = kb.addFact(myid, 'rdf', 7, 100,
  { relation: 'follows', subject: 'Ferrante Francesco', object: 'SmartApplication' },
);

result = kb.addFact(myid, 'rdf', 3, 50,
  { relation: 'isIn', object: 'Aula L', subject: 'SmartApplication' },
);

// should retrieve { $X: 'SmartApplication', $Y: 'teaches' }
console.log(kb.queryBind({ subject: 'Gervasi', object: '$X', relation: '$Y' }));

// should retrieve 2 solution  { '$X': 'Gervasi', '$Y': 'teaches' }, { '$X': 'Ferrante Francesco', '$Y': 'follows' }
console.log(kb.queryBind({ subject: '$X', object: 'SmartApplication', relation: '$Y' }));

// should retrieve the whole document that matches the query
console.log(kb.queryFact({subject: 'Gervasi', object: '$obj', relation: 'teaches'}));

result = kb.subscribe(myid, { sessionID: 1, emotion: '$E' },
  (r) => { console.log('subscription callback!'); console.log(r); },
);

// should trigger the registered callback
result = kb.addFact(myid, 'emo', 1, 70,
  { sessionID: 1, emotion: 'neutral', emoCoords: { angry: 10, neutral: 90, happy: 10 } },
);

result = kb.removeFact(myid, { relation: '$r', object: 'SmartApplication' });

// should now retrieve 0 solution
console.log(kb.queryBind({ object: 'SmartApplication', relation: '$rel' }));

kb.addFact(myid, 'emo', 1, 70,
  { x: {a: 1, y: 2}, y: 2 },
);

kb.addFact(myid, 'emo', 1, 70,
  { x: {a: 1, y: 2}, y: 3 },
);

kb.addFact(myid, 'emo', 1, 70,
  { x: {a: 1, y: 2}, z: 2  },
);

console.log();
console.log(kb.queryBind({x: '$x', y: '$y'}));
console.log(kb.queryBind({x: { a: 1, y: '$y'}, y: '$z'}));
