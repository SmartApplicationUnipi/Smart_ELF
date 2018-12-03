import { isObject } from 'util';
import { Colors, Debugger } from './debugger';
import { checkSubscriptions, databaseFact, databaseRule, DataObject, DataRule, Metadata } from './kb';
import { findMatches, findMatches2, isPlaceholder, findCompatibleRules } from './matcher';
import { unify } from './unificator';

const INFERENCE_TAG = 'INFERENCE'; // TODO: change this. the user will specify the tag in the rule head!
const debug = new Debugger(11);

export function checkRules(fact: object) {
    for (const rule of databaseRule.values()) {
        const data = rule._data as DataRule;
        checkRule(data._head, data._body, fact);
    }
}

function checkRule(head: object, body: object[], fact: object) {
    // se il fatto è uno dei predicati nel body della regola
    debug.clog(Colors.BLUE, 'INFO', 0, '', 'checkRule entered', 10);

    let matches;
    let binds;
    for (const pred of body) {
        debug.clog(Colors.BLUE, 'INFO', 1, '', 'guardo il predicato', 10);

        // cerco se fact matcha un pred nel body
        matches = findMatches(pred, [fact]);
        debug.clog(Colors.BLUE, 'INFO', 2, '', 'primo match ha length ' + matches.size, 10);
        // console.log();
        if (matches.size > 0) {
            break;
        }
    }

    if (matches.size > 0) {
        debug.clog(Colors.BLUE, 'INFO', 3, '', 'ho matchato un predicato ', 10);
        // console.log();

        // se ho matchato un predicato del body,
        // cerco nel dataset se esiste soluzione per ciascun degli altri pred
        for (const pred of body) { // TODO: GLI ALTRI! bisogna filtrare
            debug.clog(Colors.BLUE, 'INFO', 4, '', 'guardo il predicato ', 10);
            // console.log(pred);

            let tempbinds: any[] = [];
            for (const match of matches.keys()) {

                const bi = matches.get(match);
                debug.clog(Colors.BLUE, 'INFO', 5, '', 'guardo il binding ', 10);
                // console.log(bi);
                // console.log();

                const b = findMatches(pred, Array.from(databaseFact.values()), bi);
                // b se non è vuoto contiene i nuovi bindings (che contengono bi)

                debug.clog(Colors.GREEN, 'OK', 5, '', 'trovata soluzione: ', 5);
                // console.log(b);
                // console.log();
                tempbinds = tempbinds.concat([...b.values()]);

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
        //        console.log(binds);
        //        console.log();
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

                const inFact = magia(head);

                let tag = '_INFERENCE';
                let idSource = '_INFERENCE';
                let ttl = 1;
                let reli = 0;

                if (inFact.hasOwnProperty('_meta')) {

                    if (inFact.hasOwnProperty('tag')) { tag = inFact._meta.tag; }
                    if (inFact.hasOwnProperty('idSource')) { idSource = inFact._meta.idSource; }
                    if (inFact.hasOwnProperty('ttl')) { ttl = inFact._meta.ttl; }
                    if (inFact.hasOwnProperty('reliability')) { reli = inFact._meta.reliability; }

                }
                const metadata = new Metadata(idSource, tag, undefined, ttl, reli);
                const headFact = new DataObject(-1, metadata, inFact._data);
                const addres = checkSubscriptions(headFact);
                //                console.log('AGGIUNGO FATTO INFERITO ', addres);
                //                console.log(inFact);
                //                console.log();
                debug.clog(Colors.BLUE, 'DEBUG', 1, '', 'INFERENCE CHECK SUBS' + headFact, 1);
            }
        }
    }
}

export function queryRules(jReq: object) {
    let rule;
    const matches = new Array();

    const goodRules = findCompatibleRules(jReq, databaseRule);

    for (const entry of goodRules) {
        rule = entry._data as DataRule;
        //const b = unify(jReq, rule._head, {});
        if (b.s) {
            const m = findBodySolutions(rule._body);

            for (const binds of m.values()) {
                for (const bind of binds) {
                    const bAny = bind as any; // TODO: find a better way!we need to have bind explicitly declared as any

                    const magia = (h: any) => {
                        const hh = Object.assign({}, h);
                        const ks = Object.keys(h);
                        for (const key of ks) {
                            if (isPlaceholder(h[key])) {
                                hh[key] = bAny[h[key]]; // becouse of this we needed bany
                            }
                            if (isObject(h[key])) {
                                hh[key] = magia(h[key]);
                            }
                        }
                        return hh;
                    };

                    const instHead = magia(rule._head);

                    let tag = '_INFERENCE';
                    let idSource = '_INFERENCE';
                    let ttl = 1;
                    let reli = 0;

                    if (instHead.hasOwnProperty('_meta')) {

                        if (instHead.hasOwnProperty('tag')) { tag = instHead._meta.tag; }
                        if (instHead.hasOwnProperty('idSource')) { idSource = instHead._meta.idSource; }
                        if (instHead.hasOwnProperty('ttl')) { ttl = instHead._meta.ttl; }
                        if (instHead.hasOwnProperty('reliability')) { reli = instHead._meta.reliability; }

                    }

                    const metadata = new Metadata(idSource, tag, undefined, ttl, reli);
                    const headFact = new DataObject(-1, metadata, instHead._data);

                    debug.clogNoID(Colors.BLUE, 'DEBUG', '', 'INFERENCE ADDFACT' + headFact, 1);

                    matches.push(headFact);
                }
            }
        }
    }

    return findMatches(jReq, matches);

}

function findBodySolutions(body: object[]) {
    // se il fatto è uno dei predicati nel body della regola
    debug.clogNoID(Colors.BLUE, 'INFO', '', 'findBodySolutions entered', 10);

    let i = 0;
    debug.clog(Colors.BLUE, 'INFO', 1, '', 'guardo il predicato ' + i, 10);
    let matches = findMatches(body[i], Array.from(databaseFact.values()));

    // cerco nel dataset se esiste soluzione per ciascun pred
    while (i < body.length && matches.size > 0) {
        debug.clogNoID(Colors.GREEN, 'OK', '', 'trovata soluzione: ', 5);

        debug.clogNoID(Colors.BLUE, 'INFO', '', 'guardo il predicato ' + i, 10);
        // console.log(pred);

        matches = findMatches2(body[i], Array.from(matches.keys()), Array.from(matches.values()));
    }
    if (matches.size > 0) {
        debug.clogNoID(Colors.GREEN, 'OK', '', 'trovata soluzione per tutti i predicati! ', 5);
        i++;
    } else {
        debug.clogNoID(Colors.RED, 'FAIL', '', 'la regola non matcha', 10);
    }
    return matches;
}
