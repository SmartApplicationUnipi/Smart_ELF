import * as matcher from '../src/matcher';

const dataset = [
    {nome: 'pino', cognome: 'albero', titolo: { tipo: 'diploma', grado: 'scuolamedia' } },
    {nome: 'lino', cognome: 'tessuto', titolo: { tipo: 'diploma', grado: 'scuolasuperiore' } },
    {nome: 'pino', cognome: 'radice', titolo: { tipo: 'laurea', grado: 'magistrale' } },
];

let matches = matcher.findMatches({nome: 'pino', cognome: 'albero'}, dataset);
console.log(matches);

matches = matcher.findMatches({nome: 'pino', cognome: '$X'}, dataset);
console.log(matches);

matches = matcher.findMatches({nome: 'pino', titolo: '$X'}, dataset);
console.log(matches);

matches = matcher.findMatches({nome: '$X', titolo: { tipo: 'laurea', grado: '$Y'}}, dataset);
console.log(matches);
