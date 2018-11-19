import {security} from '../src/config';
import * as kb from '../src/kb';

const myid = kb.register( { RDF: 'desc1', TAG2: 'desc2' }).details;

let result;

console.log('\x1b[1;32KBTEST\x1b[0m');

console.log(
    kb.addFact(myid, 'rdf', 3, 90,
        { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' },
    ));

result = kb.addFact(myid, 'rdf', 7, 100,
    { relation: 'follows', subject: 'Ferrante Francesco', object: 'SmartApplication' },
);

result = kb.addFact(myid, 'rdf', 3, 50,
    { relation: 'isIn', object: 'Aula L', subject: 'SmartApplication' },
);

// should retrieve { $X: 'SmartApplication', $Y: 'teaches' }
console.log(kb.queryBind( {_data: { subject: 'Gervasi', object: '$X', relation: '$Y' }}));

// should retrieve 2 solution  { '$X': 'Gervasi', '$Y': 'teaches' }, { '$X': 'Ferrante Francesco', '$Y': 'follows' }
console.log(kb.queryBind( {_data: { subject: '$X', object: 'SmartApplication', relation: '$Y' }}));

// should retrieve the whole document that matches the query
console.log(kb.queryFact( {_data: {subject: 'Gervasi', object: '$obj', relation: 'teaches' }}));

result = kb.subscribe(myid, { sessionID: 1, emotion: '$E' },
    (r) => { console.log('subscription callback!'); console.log(r); },
);

// should trigger the registered callback
result = kb.addFact(myid, 'emo', 1, 70,
    { sessionID: 1, emotion: 'neutral', emoCoords: { angry: 10, neutral: 90, happy: 10 } },
);

result = kb.removeFact(myid, {_data: { relation: '$r', object: 'SmartApplication' }});

// should now retrieve 0 solution
console.log(kb.queryBind({_data: { object: 'SmartApplication', relation: '$rel' }}));

kb.addFact(myid, 'emo', 1, 70,
    { x: { a: 1, y: 2 }, y: 2 },
);

kb.addFact(myid, 'emo', 1, 70,
    { x: { a: 1, y: 2 }, y: 3 },
);

kb.addFact(myid, 'emo', 1, 70,
    { x: { a: 1, y: 2 }, z: 2 },
);

console.log();
<<<<<<< HEAD
console.log(kb.queryBind( { _data: {x: '$x', y: '$y'} } ));
console.log(kb.queryBind( {_data: {x: { a: 1, y: '$y'}, y: '$z'}}));

console.log(kb.queryBind({ _meta: { info: '$cazzo' } }));
=======
console.log(kb.queryBind(myid, {x: '$x', y: '$y'}));
console.log(kb.queryBind(myid, {x: { a: 1, y: '$y'}, y: '$z'}));
>>>>>>> afe004a8617b0d4598d898cb87f024fa6f1d75e7
