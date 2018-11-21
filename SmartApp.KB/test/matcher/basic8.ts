import * as matcher from '../../src/matcher';
import * as testUtil from '../testUtil';

let opt	= testUtil.parseOptions(process.argv);

const dataset = [
    {nome: 'pino', cognome: 'albero', titolo: { tipo: 'diploma', grado: 'scuolamedia' } },
    {nome: 'lino', cognome: 'tessuto', titolo: { tipo: 'diploma', grado: 'scuolasuperiore' }, residenza: 'via seta'},
    {nome: 'pino', cognome: 'radice', titolo: { tipo: 'laurea', grado: 'magistrale' , voto: '45'} },
    {nome: 'dino', cognome: 'sauro', grado: { tipo: 'laurea', grado: 'magistrale' , voto: '45'} },
    {nome: 'gianni', cognome: 'sauro', grado: { tipo: 'laurea', grado: 'triennale' , voto: '20', qi:'100'} },
    {nome: 'gianni', cognome: 'gianni', grado: { gianni: 'nome',  qi:'900'} },
    {nome: 'gianni', cognome: 'pinotto', gianni: 'nome',  qi:'900' }
];

const matches = matcher.findMatchesBind({$x : {'$x1' : 'laurea'} , $y : {'$y1' : 'barbagianni'}}, dataset);
const answer:any[] = [];

testUtil.test(matches, answer, opt.verbose);
