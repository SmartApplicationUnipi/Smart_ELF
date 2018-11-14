import * as matcher from '../src/matcher';

const dataset = [
    {nome: 'pino', cognome: 'albero', titolo: { tipo: 'diploma', grado: 'scuolamedia' } },
    {nome: 'lino', cognome: 'tessuto', titolo: { tipo: 'diploma', grado: 'scuolasuperiore' }, residenza: 'via seta'},
    {nome: 'pino', cognome: 'radice', titolo: { tipo: 'laurea', grado: 'magistrale' , voto: '45'} },
    {nome: 'dino', cognome: 'sauro', grado: { tipo: 'laurea', grado: 'magistrale' , voto: '45'} },
    {nome: 'gianni', cognome: 'sauro', grado: { tipo: 'laurea', grado: 'triennale' , voto: '20', qi:'100'} },
    {nome: 'gianni', cognome: 'gianni', grado: { gianni: 'nome',  qi:'900'} },
    {nome: 'gianni', cognome: 'pinotto', gianni: 'nome',  qi:'900' }
];

let matches = matcher.findMatchesBind({nome: 'pino', cognome: '$cognome'}, dataset);
let answer = [ [ {'$cognome' : 'albero' } ], [{'$cognome' : 'radice' } ]]
test(matches, answer, 1);

let matches2 = matcher.findMatchesBind({nome: 'pino', titolo: '$titolo'}, dataset);
let answer2 = [ [ { '$titolo': { tipo: 'diploma', grado: 'scuolamedia' } } ],
                [ { '$titolo': { tipo: 'laurea', grado: 'magistrale' , voto: '45'} } ] ]
test(matches2, answer2, 2);

let mat3 = matcher.findMatchesBind({nome: '$nome', cognome : '$nome'}, dataset);
let ans3 = [ [ { '$nome' : 'gianni' } ] ];
test(mat3, ans3, 3);

let mat4 = matcher.findMatchesBind({nome: '$n', $n : 'nome'}, dataset);
let ans4 = [ [ { '$n' : 'gianni' } ] ];
test(mat4, ans4, 4);

let mat5 = matcher.findMatchesBind({nome: '$n', grado: { $n : 'nome' }}, dataset);
let ans5 = [ [ { '$n' : 'gianni' } ] ];
test(mat5, ans5, 5);

let mat6 = matcher.findMatchesBind({nome: '$n', $obj: { $n : 'nome' }}, dataset);
let ans6 = [ [ { '$n' : 'gianni', '$obj' : 'grado'} ] ];
test(mat6, ans6, 6);

let mat7 = matcher.findMatchesBind({$x : {'$x1' : 'laurea'} , $y : {'$y1' : 'triennale'}}, dataset);
let ans7 = [ [ { '$x': 'grado', '$x1': 'tipo', '$y': 'grado', '$y1': 'grado' } ] ];
test(mat7, ans7, 7);

let mat8 = matcher.findMatchesBind({$x : {'$x1' : 'laurea'} , $y : {'$y1' : 'barbagianni'}}, dataset);
let ans8:any[] = [];
test(mat8, ans8, 8);

/*
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
*/



function test(matches:any[], answer:any[], index: number) {
    console.log('************************* TEST' + index +' *************************');
    if (isEqual(matches, answer)) {
        console.log('\x1b[1;32mOK!\x1b[0m');
    } else {
        console.log('\x1b[1;31mERROR!\x1b[0m');
    }
     console.log();
}

function isEqual (value:any[], other:any[]) :boolean {

	// Get the value type
	var type = Object.prototype.toString.call(value);

	// If the two objects are not the same type, return false
	if (type !== Object.prototype.toString.call(other)) return false;

	// If items are not an object or array, return false
	if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

	// Compare the length of the length of the two items
	var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
	var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
	if (valueLen !== otherLen) return false;

	// Compare two items
    var compare = function (item1:any, item2:any) {

		// Get the object type
		var itemType = Object.prototype.toString.call(item1);

		// If an object or array, compare recursively
		if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
			if (!isEqual(item1, item2)) return false;
		}

		// Otherwise, do a simple comparison
		else {

			// If the two items are not the same type, return false
			if (itemType !== Object.prototype.toString.call(item2)) return false;

			// Else if it's a function, convert to a string and compare
			// Otherwise, just compare
			if (itemType === '[object Function]') {
				if (item1.toString() !== item2.toString()) return false;
			} else {
				if (item1 !== item2) return false;
			}

		}
	};

	// Compare properties
	if (type === '[object Array]') {
		for (var i = 0; i < valueLen; i++) {
			if (compare(value[i], other[i]) === false) return false;
		}
	} else {
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				if (compare(value[key], other[key]) === false) return false;
			}
		}
	}

	// If nothing failed, return true
	return true;

};
