import { isObject } from 'util';
import { addFact, databaseFact  } from './kb';
import { findMatchesBind, findMatchesBind2, isPlaceholder} from './matcher';

const databaseRule = [
    { _data:
        { body: [{subject: '$prof' , relation: 'teaches', object: '$course'  },
           {subject: '$course', relation: 'is in room',  object: '$room'}],
        head: { subject: '$prof', relation: 'is in', object: '$room'} },
    },
    { _data:
        { body: [ { emoCoords: { angry: 10, neutral: '$n', happy: '$h' } }],
          head: { sessionID: 1, emotion: 'switch', emoCoords: { angry: 20, neutral: '$h', happy: '$n'}},
        },
    },
];

export function checkRules(fact: object) {
    for (const rule of databaseRule) {
        checkRule(rule._data.head, rule._data.body, fact);
    }
}

function checkRule(head: object, body: object[], fact: object) {
    // se il fatto è uno dei predicati nel body della regola
    console.log('Sono dentro.');
    console.log(fact);
    console.log();

    // let binds;
    // tslint:disable-next-line:max-line-length
    // const matchedBodyPred = body.findIndex( (b) => { binds = findMatchesBind(b, [fact]);  return binds.length > 0; });

    let binds;
    for (const pred of body) {
        // console.log('guardo il predicato');
        // console.log(pred);
        // console.log();

        // cerco se fact matcha un pred nel body
        binds = findMatchesBind(pred, [fact]);

        // console.log('primo match ha length');
        // console.log(binds.length);
        // console.log();

        if (binds.length > 0) {
            break;
        }
    }

    if (binds.length > 0) {
        // console.log('ho mathacto un predicato');
        // console.log();

        // se ho matchato un predicato del body,
        // cerco nel dataset se esiste soluzione per ciascun degli altri pred
        for (const pred of body) {
            // console.log('guardo il predicato');
            // console.log(pred);
            // console.log();

            let tempbinds: any[] = [];
            for (const bi of binds) {
                // console.log('guardo il binding');
                // console.log(bi);
                // console.log();

                const b = findMatchesBind2({_data: pred }, Array.from(databaseFact.values()), bi);
                // b se non è vuoto contiene i nuovi bindings (che contengono bi)
                // console.log('trovo la soluzione');
                // console.log(b);
                // console.log();

                tempbinds = tempbinds.concat(b);
            }
            binds = tempbinds;
            if (binds.length === 0) {
                 // ho fallito e la regola non va applicata() vai alla prossima REGOLA)
                // console.log('NON HO SOLUZIONI');
                // console.log();

                return false;
            }
        }
        // ho matchato tutti i body
        // console.log('SONO USCITO!');
        // console.log(binds);
        // console.log();

        for (const b of binds) {

            const magia = (h: any) => {
                const hh = Object.assign({}, h);
                const ks = Object.keys(h);
                for (const key of ks) {
                    if (isPlaceholder(h[key])) {
                        hh[key] = b[h[key]];
                    }
                    if (isObject(h[key])) {
                        hh[key] = magia(h[key]);
                    }
                }
                return hh;
            };
            // tslint:disable-next-line:max-line-length
            // addFact('inference', 'infoSum', 1, 100, true, {subject: b.$prof, relation: 'is in room', object: b.$room});
            addFact('inference', 'infoSum', 1, 100, true, magia(head));
        }
    }
}

//     if (matchesArray.length > 0) {

//         for (const match of matchesArray) {
//             // cerco fatti degli altri predicati del body
//             const solutions = queryBind( {subject: match.$course, relation: 'is in room',  object: '$room'} );

//             for (const sol of solutions) {
//                  // e genero la testa di cazzo che mi pare
//                 addFact('KB', 'infoSum', 1, 100, true, {subject: match.$prof, relation: 'is in', object: sol.$room});
//             }
//     }
