import * as matcher from '../src/matcher';

const dataset = [
    {nome: 'pino', cognome: 'albero', titolo: { tipo: 'diploma', grado: 'scuolamedia' } },
    {nome: 'lino', cognome: 'tessuto', titolo: { tipo: 'diploma', grado: 'scuolasuperiore' }, residenza: 'via seta'},
    {nome: 'pino', cognome: 'radice', titolo: { tipo: 'laurea', grado: 'magistrale' , voto: '45'} },
    {nome: 'dino', cognome: 'sauro', grado: { tipo: 'laurea', grado: 'magistrale' , voto: '45'} },
];

let matches = matcher.findMatchesBind({nome: 'pino', cognome: 'albero'}, dataset);

console.log(matches);
console.log();

matches = matcher.findMatchesBind({nome: 'pino', cognome: '$cognome'}, dataset);
console.log(matches);
console.log();

matches = matcher.findMatchesBind({nome: 'pino', titolo: '$titolo'}, dataset);
console.log(matches);
console.log();

matches = matcher.findMatchesBind({nome: '$nome', titolo: { tipo: 'laurea', grado: '$grado'}}, dataset);
console.log(matches);
console.log();

matches = matcher.findMatchesAll({ titolo: '$titolo' }, dataset);
console.log(matches);
console.log();

matches = matcher.findMatchesAll({ grado: '$grado' }, dataset);
console.log(matches);
console.log();

matches = matcher.findMatchesBind({ $X: '$Y' }, dataset);
console.log(matches);
console.log();

matches = matcher.findMatchesBind({ $X: 'magistrale'}, dataset);
console.log(matches);
console.log();
