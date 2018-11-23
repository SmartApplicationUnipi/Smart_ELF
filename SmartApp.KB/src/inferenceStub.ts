import { isObject } from 'util';
import { Colors, Debugger } from './debugger';
import { addFact, databaseFact, databaseRule, DataRule } from './kb';
import { findMatches, isPlaceholder } from './matcher';

const INFERENCE_TAG = 'INFERENCE'; // TODO: change this. the user will specify the tag in the rule head!
const debug = new Debugger();

export function checkRules(fact: object) {
    for (const rule of databaseRule.values()) {
        const data = rule._data as DataRule;
        checkRule(data._head, data._body, fact);
    }
}

function checkRule(head: object, body: object[], fact: object) {
    // se il fatto è uno dei predicati nel body della regola
    debug.clog(Colors.BLUE, 'INFO', 0, '', 'checkRule entered', 10);

    let binds;
    for (const pred of body) {
        debug.clog(Colors.BLUE, 'INFO', 1, '', 'guardo il predicato', 10);

        // cerco se fact matcha un pred nel body
        binds = findMatches(pred, [fact]);

        debug.clog(Colors.BLUE, 'INFO', 2, '', 'primo match ha length ' + binds.size, 10);
        // console.log();
        if (binds.size > 0) {
            break;
        }
    }

    if (binds.size > 0) {
        debug.clog(Colors.BLUE, 'INFO', 3, '', 'ho matchato un predicato ', 10);
        // console.log();

        // se ho matchato un predicato del body,
        // cerco nel dataset se esiste soluzione per ciascun degli altri pred
        for (const pred of body) {
            debug.clog(Colors.BLUE, 'INFO', 4, '', 'guardo il predicato ', 10);

            let tempbinds: any[] = [];
            for (const bi of binds) {
                debug.clog(Colors.BLUE, 'INFO', 5, '', 'guardo il binding ', 10);
                // console.log(bi);
                // console.log();

                const b = findMatches({ _data: pred }, Array.from(databaseFact.values()), bi);
                // b se non è vuoto contiene i nuovi bindings (che contengono bi)
                debug.clog(Colors.GREEN, 'OK', 5, '', 'trovata soluzione: ', 5);
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
        debug.clog(Colors.GREEN, 'OK', 7, '', 'HO MATCHATO TUTTI BODY', 5);
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
                debug.clog(Colors.BLUE, 'DEBUG', 1, '', 'INFERENCE MAGIA ' + magia(head), 1);
                const addres = addFact('inference', INFERENCE_TAG, 1, 100, magia(head));
                debug.clog(Colors.BLUE, 'DEBUG', 1, '', 'INFERENCE ADDFACT' + addres, 1);
            }
        }
    }
}