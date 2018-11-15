const DEBUG = 0;

const ID_AA = 0;
const ID_AO = 1;
const ID_AP = 2;
const ID_PA = 3;
const ID_PO = 4;
const ID_PP = 5;

const WHITE = '\x1b[0m';
const RED = '\x1b[1;31m';
const GREEN = '\x1b[1;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[1;34m';
const PINK = '\x1b[1;35m';

function clog_old(msg: any, level: number) {
    if (level < DEBUG) {
        console.log(msg);
    }
}

function clog(color: string, kind: string, id: number, before: string, msg: string, level: number) {
    if (level < DEBUG) {
        console.log(before + color + kind + '(' + id + ')' + WHITE + ' ' + msg);
    }
}

export function findMatchesBind(query: any, Dataset: any[]) {
    const matches = new Array();
    const sorted = sort(query);
    // inefficient lookup with a loop onto dataset array
    for (const data of Dataset) {
        const mb = matchBind(query, sorted, 0, 0, data, []);
        if (mb.match) {
            matches.push(mb.binds);
        }
    }
    return matches;
}

export function findMatchesBind2(query: any, Dataset: any[], initBinds: any[]) {
    const matches = new Array();
    const sorted = sort(query);
    // inefficient lookup with a loop onto dataset array
    for (const data of Dataset) {
        const mb = matchBind(query, sorted, 0, 0, data, initBinds);
        // clog_old(mb);
        if (mb.match) {
            matches.push(mb.binds);
        }
    }
    return matches;
}

export function findMatchesAll(query: any, Dataset: any[]) {
    const matches = new Array();
    const sorted = sort(query);
    // inefficient lookup with a loop onto dataset array
    for (const data of Dataset) {
        const mb = matchBind(query, sorted, 0, 0, data, []);
        if (mb.match) {
            matches.push(data);
        }
    }
    return matches;
}

function matchBind(query: any, sorted: any, listIndex: number, index: number, data: any, initBinds: any[]): any {
    const queryKeys = Object.keys(query);
    let binds = initBinds.map( (x) => Object.assign({}, x));
    const match = true;

    // TODO check sugli indici
    // clog_old('Query:', 10);
    // clog_old(query, 10);
    //    clog_old('Sorted:');
    //    clog_old(sorted);

    // binds : list of map <placeholder : bind>
    clog_old('', 1);
    for ( let i = listIndex; i < sorted.size; ++i) {
        switch (i) {
            case ID_AA: {
                // atom : atom
                if (!matchAllAtomAtom(query, sorted, data)) {
                    return {match : false, binds: []};
                }
                break;
            }
            case ID_AO: {
                // atom : object
                if (!matchAllAtomObject(query, sorted, data, binds)) {
                    return {match : false, binds: []};
                }
                break;
            }
            case ID_AP: {
                // atom : placeholder
                if (!matchAllAtomPlaceholder(query, sorted, data, binds)) {
                    return {match : false, binds: []};
                }
                break;
            }
            case ID_PA: {
                // placeholder : atom
                if (!matchAllPlaceholderAtom(query, sorted, data, binds)) {
                    return {match : false, binds: []};
                }
                break;
            }
            case 4: {
                // placeholder : object
                clog_old('\x1b[1;34mINFO(' + i + ')\x1b[0m Enter case placeholder : object', 5);
                const list = sorted.get(i);
                const dataKeys = Object.keys(data);
                for (let j = index; j < list.length; ++j) {
                    clog_old('\x1b[1;35mINFO(' + i + ')\x1b[0m key => ' + list[j], 5);
                    const newBinds = [...binds];
                    let flag = false;
                    if (newBinds.length > 0) {
                        flag = true;
                    }
                    for (let k = 0; k < newBinds.length || k === 0; ++k) {
                        // already bound to a non object
                        if (newBinds[k] && newBinds[k].hasOwnProperty(list[j])
                            && data.hasOwnProperty(newBinds[k][list[j]])
                            && !isObject(data[newBinds[k][list[j]]])) {
                            clog_old('\x1b[1;31mFAIL(' + i + ')\x1b[0m: isObject(data[binds[list[j]]]', 2);
                            delete binds[k];
                            continue;
                        }

                        // already bound to an object (check + possible new binds)
                        if (newBinds[k] && newBinds[k].hasOwnProperty(list[j])
                            && data.hasOwnProperty(newBinds[k][list[k]])
                            && isObject(data[newBinds[k][list[j]]])) {
                            clog_old('\x1b[1;32mOK(' + i + '):\x1b[0m bind già esistente', 3);
                            const innerSorted = sort(query[list[j]]); // TODO remove
                            clog_old('\t\x1b[1;34mINFO(' + i + ')\x1b[0m Entering recursion', 5);
                            const result = matchBind(query[list[j]], innerSorted, 0, 0, data[list[j]], [newBinds[k]]);
                            clog_old('\t\x1b[1;34mINFO(' + i + ')\x1b[0m Exit recursion', 5);
                            if (!result.match) {
                                clog_old('\x1b[1;31mFAIL(' + i + ')\x1b[0m: inner objects are different.', 2);
                                delete binds[k];
                            } else {
                                clog_old('\x1b[1;32mOK(' + i + '):\x1b[0m: updated already existent bind', 3);
                                delete binds[k];
                                binds = binds.concat(result.binds);
                            }
                            continue;
                        }

                        // still to bound
                        for (const dataKey of dataKeys) {
                            if (!isObject(data[dataKey])) {
                                clog_old('\x1b[1;31mFAIL(' + i + ')\x1b[0m: !isObject(data[dataKey]).', 2);
                                continue;
                            }
                            if (!newBinds[k]) {
                                clog_old('\x1b[1;34mINFO(' + i + ')\x1b[0m Added first bind', 5);
                                const b: any = {};
                                b[list[j]] = dataKey;
                                newBinds.push(b);
                            } else {
                                newBinds[k][list[j]] = dataKey;
                            }
                            const innerSorted = sort(query[list[j]]); // TODO remove
                            clog_old('\t\x1b[1;34mINFO(' + i + ')\x1b[0m Entering recursion', 5);
                            const result = matchBind(query[list[j]], innerSorted, 0, 0, data[dataKey], [newBinds[k]]);
                            clog_old('\t\x1b[1;34mINFO(' + i + ')\x1b[0m Exit recursion', 5);
                            if (!result.match) {
                                clog_old('\x1b[1;31mFAIL(' + i + ')\x1b[0m: inner objects are different.', 2);
                            } else {
                                clog_old('\x1b[1;32mOK(' + i + '):\x1b[0m: updated already existent bind', 3);
                                binds = binds.concat(result.binds);
                            }
                        }
                        if (flag) {
                            delete binds[k];
                        }
                    }
                    binds = binds.filter( (el) => el !== null);
                    if (binds.length === 0) {
                        clog_old('\x1b[1;33mEXIT(' + i + '): \x1b[0m binds.length === 0', 4);
                        return {match: false, binds: {}};
                    }
                }
                clog_old('\x1b[1;34mINFO(' + i + ')\x1b[0m Exit case placeholder : object', 5);
                break;
            }
            case 5: {
                clog_old('\x1b[1;34mINFO(' + i + ')\x1b[0m Enter case placeholder : placeholder', 5);

                clog_old('\x1b[1;34mINFO(' + i + ')\x1b[0m Exit case placeholder : placeholder', 5);
                break;
            }
            default: {
                clog_old ('sei proprio un ritardato', 0);
                break;
            }
        } // end switch
    } // end for

    return { match: true, binds };
}

function matchAllAtomAtom(query: any, sorted: any, data: any): boolean {
    clog(BLUE, 'INFO', ID_AA, '', 'Enter case Atom : Atom', 5);
    for (const queryKey of sorted.get(ID_AA)) {
        if (!matchAtomAtom(queryKey, query[queryKey], data)) {
            return false;
        }
    }
    clog(BLUE, 'INFO', ID_AA, '', 'Exit case Atom : Atom', 5);
    return true;
}

function matchAllAtomObject(query: any, sorted: any, data: any, binds: any[]): boolean {
    clog(BLUE, 'INFO', ID_AO, '', 'Enter case Atom : Object', 5);
    for (const queryKey of sorted.get(ID_AO)) {
        if (!matchAtomObject(queryKey, query[queryKey], data, binds)) {
            return false;
        }
    }
    clog(BLUE, 'INFO', ID_AO, '', 'Exit case Atom : Object', 5);
    return true;
}

function matchAllAtomPlaceholder(query: any, sorted: any, data: any, binds: any[]): boolean {
    clog(BLUE, 'INFO', ID_AP, '', 'Enter case Atom : Placeholder', 5);
    for (const queryKey of sorted.get(ID_AP)) {
        if (!matchAtomPlaceholder(queryKey, query[queryKey], data, binds)) {
            return false;
        }
    }
    clog(BLUE, 'INFO', ID_AP, '', 'Exit case Atom : Placeholder', 5);
    return true;
}

function matchAllPlaceholderAtom(query: any, sorted: any, data: any, binds: any[]): boolean {
    clog(BLUE, 'INFO', ID_PA, '', 'Enter case Placeholder : Atom', 5);
    for (const queryKey of sorted.get(ID_PA)) {
        if (!matchPlaceholderAtom(queryKey, query[queryKey], data, binds)) {
            return false;
        }
    }
    clog(BLUE, 'INFO', ID_PA, '', 'Exit case Placeholder : Atom', 5);
    return true;
}

function matchAllPlaceholderObject(query: any, sorted: any, data: any, binds: any[]): boolean {
    return true;
}

function matchAllPlaceholderPlaceholder(query: any, sorted: any, data: any, binds: any[]): boolean {
    return true;
}

function matchAtomAtom(queryKey: string, queryValue: string, data: any ): boolean {
    clog(PINK, 'INFO', ID_AA, '', 'key =>' + queryKey, 5);
    if (!data.hasOwnProperty(queryKey) || queryValue !== data[queryKey]) {
        clog(RED, 'FAIL', ID_AA, '', 'match failed', 2);
        return false;
    }
    clog(GREEN, 'OK', ID_AA, '', 'match succeded', 2);
    return true;
}

function matchAtomObject(queryKey: string, queryValue: object, data: any, binds: any[]): boolean {
    clog(PINK, 'INFO', ID_AO, '', 'key => ' + queryKey, 5);
    if (!data.hasOwnProperty(queryKey) || !isObject(data[queryKey])) {
        // Se non ha la chiave, o ha la chiave ma non è un oggetto ESPLODI
        // tslint:disable-next-line:max-line-length
        clog(RED, 'FAIL', ID_AO, '', 'it doesn\'t have the key, or it has it but it\'s not associated to an object ', 2);
        return false;
    }
    const innerSorted = sort(queryValue); // TODO remove!
    clog(BLUE, 'INDO', ID_AO, '\t', 'Entering recursion', 5);
    const result = matchBind(queryValue, innerSorted, 0, 0, data[queryKey], binds);
    clog(BLUE, 'INDO', ID_AO, '\t', 'Exit recursion', 5);
    if (!result.match) {
        clog(RED, 'FAIL', ID_AO, '', 'inner objects are different.', 2);
        return false;
    } else {
        // TODO prove it is correct
        binds = [...result.binds];
    }
    return true;
}

function matchAtomPlaceholder(queryKey: string, queryValue: string, data: any, binds: any[]): boolean {
    clog(PINK, 'INFO', ID_AP, '', 'key => ' + queryKey, 5);
    if (!data.hasOwnProperty(queryKey)) {
        clog(RED, 'FAIL', ID_AP, '', 'Key is not in the data', 2);
        return false;
    }
    if (binds.length === 0) {
        clog(BLUE, 'INFO', ID_AP, '', 'It\'s thefirst bind', 5);
        const b: any = {};
        b[queryValue] = data[queryKey];
        binds.push(b);
    } else {
        for (let k = 0; k < binds.length; ++k) {
            if (binds[k].hasOwnProperty(queryValue)) {
                if (binds[k][queryValue] !== data[queryKey]) {
                    clog(RED, 'FAIL', ID_AP, '', 'invalid bind', 2);
                    delete binds[k];
                    continue;
                } else {
                    clog(GREEN, 'OK', ID_AP, '', 'already bound', 3);
                }
            } else {
                clog(GREEN, 'OK', ID_AP, '', 'add new bind in current bind list', 2);
                binds[k][queryValue] = data[queryKey];
            }
        }
    }
    binds = binds.filter( (el) => el != null);
    if (binds.length === 0) {
        clog(YELLOW, 'EXIT', ID_AP, '', 'No more possible binds!', 4);
        return false;
    }
    return true;
}

function matchPlaceholderAtom(queryKey: string, queryValue: string, data: any, binds: any[]): boolean {
    clog(PINK, 'INFO', ID_PA, '', 'key => ' + queryKey, 5);
    const newBinds = [...binds];
    const dataKeys = Object.keys(data);
    for (let k = 0; k < newBinds.length || k === 0; ++k) {
        if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
            && data.hasOwnProperty(newBinds[k][queryKey]) &&
            !(queryValue === data[newBinds[k][queryKey]])) {
            clog(RED, 'FAIL', ID_PA, '', 'this bind is invalid', 2);
            delete binds[k];
            continue;
        }
        if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
            && data.hasOwnProperty(newBinds[k][queryKey]) &&
            queryValue === data[newBinds[k][queryKey]]) {
            clog(GREEN, 'OK', ID_PA, '', 'bind already existent and correct', 3);
            continue;
        }
        for (const dataKey of dataKeys) {
            if (queryValue === data[dataKey]) {
                clog(GREEN, 'OK', ID_PA, '', 'match and new branch', 3);
                const tmp: any = {...newBinds[k]};
                tmp[queryKey] = dataKey;
                binds.push(tmp);
            } else {
                clog(GREEN, 'OK', ID_PA, '', 'no match here', 3);
            }
            if (newBinds[k]) {
                delete binds[k];
            }
        }
    }
    binds = binds.filter( (el) => el != null);
    if (binds.length === 0) {
        clog(YELLOW, 'EXIT', ID_PA, '', 'No more possible bind!', 4);
        return false;
    }
    return true;
}

function sort(j: any): object {
    if (!j) {
        return {};
    }
    const keys = Object.keys(j);
    const stack = new Map<number, string[]>();

// ./query '{"ph":"$a", "ob":{}, "ob2":{}, "$a":"$a", "vaiprima":"oh si", "$lasss":{}, "last":"$nope"}'

/*
  expected output should be:

  Map {
  0 => [ 'vaiprima' ],
  1 => [ 'ob', 'ob2' ],
  2 => [ 'ph', 'last' ],
  3 => [],
  4 => [ '$lasss' ],
  5 => [ '$a' ] }

*/

    for (let i = 0; i < 6; ++i) {
        stack.set(i, new Array());
    }

    for (const k of keys) {
        if (isAtom(k)) {
            if (isAtom(j[k])) {
                stack.get(0).push(k);
            } else if (isObject(j[k])) {
                stack.get(1).push(k);
            } else if (isPlaceholder(j[k])) {
                stack.get(2).push(k);
            }
        } else {
            if (isAtom(j[k])) {
                stack.get(3).push(k);
            } else if (isObject(j[k])) {
                stack.get(4).push(k);
            } else if (isPlaceholder(j[k])) {
                stack.get(5).push(k);
            }
        }
    }
    return stack;
}

export function isPlaceholder(v: any) {
    return (typeof (v) === 'string' && v.charAt(0) === '$');
}
function isObject(v: any) { // TODO: import {isObject} from util
    return (typeof (v) === 'object');
}
function isAtom(v: any) {
    return (!isPlaceholder(v) && !isObject(v));
}
