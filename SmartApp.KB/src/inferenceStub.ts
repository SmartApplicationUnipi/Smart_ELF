import { isObject } from 'util';
import { addFact, databaseFact, databaseRule, DataRule } from './kb';
import { findMatchesBind, isPlaceholder } from './matcher';

const INFERENCE_TAG = 'INFERENCE';
const DEBUG = 6;

const WHITE = '\x1b[0m';
const RED = '\x1b[1;31m';
const GREEN = '\x1b[1;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[1;34m';
const PINK = '\x1b[1;35m';

function clog(color: string, kind: string, id: number, before: string, msg: string, level: number) {
    if (level < DEBUG) {
        console.log(before + color + kind + '(' + id + ')' + WHITE + ' ' + msg);
    }
}

export function checkRules(fact: object) {
    for (const rule of databaseRule.values()) {
        const data = rule._data as DataRule;
        checkRule(data._head, data._body, fact);
    }
}

function checkRule(head: object, body: object[], fact: object) {
    // se il fatto è uno dei predicati nel body della regola
    clog(BLUE, 'INFO', 0, '', 'checkRule entered', 10);

    let binds;
    for (const pred of body) {
        clog(BLUE, 'INFO', 1, '', 'guardo il predicato', 10);

        // cerco se fact matcha un pred nel body
        binds = findMatchesBind(pred, [fact]);

        clog(BLUE, 'INFO', 2, '', 'primo match ha length ' + binds.length, 10);
        // console.log();
        if (binds.length > 0) {
            break;
        }
    }

    if (binds.length > 0) {
        clog(BLUE, 'INFO', 3, '', 'ho matchato un predicato ', 10);
        // console.log();

        // se ho matchato un predicato del body,
        // cerco nel dataset se esiste soluzione per ciascun degli altri pred
        for (const pred of body) {
            clog(BLUE, 'INFO', 4, '', 'guardo il predicato ', 10);

            let tempbinds: any[] = [];
            for (const bi of binds) {
                clog(BLUE, 'INFO', 5, '', 'guardo il binding ', 10);
                // console.log(bi);
                // console.log();

                const b = findMatchesBind({ _data: pred }, Array.from(databaseFact.values()), bi);
                // b se non è vuoto contiene i nuovi bindings (che contengono bi)
                clog(GREEN, 'OK', 5, '', 'trovata soluzione: ', 5);
                console.log(b);
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
        clog(GREEN, 'OK', 7, '', 'HO MATCHATO TUTTII BODY', 5);
        console.log(binds);
        // console.log();
        for (const bind of binds) {
            for (const b of bind) {

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
                console.log('INFERENCE MAGIA ', magia(head));
                console.log('INFERENCE ADDFACT ', addFact('inference', INFERENCE_TAG, 1, 100, magia(head)));
            }
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
