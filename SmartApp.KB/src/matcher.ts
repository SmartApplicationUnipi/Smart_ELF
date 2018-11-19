const DEBUG = 0;

const ID_AA = 0;
const ID_AO = 1;
const ID_AP = 2;
const ID_PA = 3;
const ID_PO = 4;
const ID_PP = 5;
const BINDS_CAT = 6;

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

export function findMatchesBind(query: any, Dataset: any[], initBinds: any[] = []) {
    const matches = new Array();
    // inefficient lookup with a loop onto dataset array
    for (const data of Dataset) {
        const mb = matchBind(query, data, initBinds);
        if (mb.match) {
            matches.push(mb.binds);
        }
    }
    return matches;
}

export function findMatchesAll(query: any, Dataset: any[]) {
    const matches = new Array();
    // inefficient lookup with a loop onto dataset array
    for (const data of Dataset) {
        const mb = matchBind(query, data, []);
        if (mb.match) {
            matches.push(data);
        }
    }
    return matches;
}

function matchBind(query: any, data: any, initBinds: any[]): any {
    let binds = initBinds.map((x) => Object.assign({}, x));
    const sorted = sort(query);

    clog_old('', 1);
    let result = { binds, match: true };
    for (let i = 0; i < BINDS_CAT; ++i) {
        switch (i) {
            case ID_AA: {
                // atom : atom
                if (!matchAllAtomAtom(query, sorted, data)) {
                    return { match: false, binds: [] };
                }
                break;
            }
            case ID_AO: {
                // atom : object
                result = matchAllAtomObject(query, sorted, data, result.binds);
                if (!result.match) {
                    return result;
                }
                break;
            }
            case ID_AP: {
                // atom : placeholder
                result = matchAllAtomPlaceholder(query, sorted, data, result.binds);
                if (!result.match) {
                    return result;
                }
                break;
            }
            case ID_PA: {
                // placeholder : atom
                result = matchAllPlaceholderAtom(query, sorted, data, result.binds);
                if (!result.match) {
                    return result;
                }
                break;
            }
            case 4: {
                // placeholder : object
                result = matchAllPlaceholderObject(query, sorted, data, result.binds);
                if (!result.match) {
                    return result;
                }
                break;
            }
            case 5: {
                // placeholder : placeholder
                result = matchAllPlaceholderPlaceholder(query, sorted, data, result.binds);
                if (!result.match) {
                    return result;
                }
                break;
            }
            default: {
                clog_old('sei proprio un ritardato', 0);
                break;
            }
        } // end switch
    } // end for
    return result;
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

function matchAllAtomObject(query: any, sorted: any, data: any, initBinds: any[]): any {
    clog(BLUE, 'INFO', ID_AO, '', 'Enter case Atom : Object', 5);
    let result: any = { binds: initBinds, match: true };
    for (const queryKey of sorted.get(ID_AO)) {
        result = matchAtomObject(queryKey, query[queryKey], data, result.binds);
        if (!result.match) {
            return result;
        }
    }
    clog(BLUE, 'INFO', ID_AO, '', 'Exit case Atom : Object', 5);
    return result;
}

function matchAllAtomPlaceholder(query: any, sorted: any, data: any, initBinds: any[]): any {
    clog(BLUE, 'INFO', ID_AP, '', 'Enter case Atom : Placeholder', 5);
    let result: any = { binds: initBinds, match: true };
    for (const queryKey of sorted.get(ID_AP)) {
        result = matchAtomPlaceholder(queryKey, query[queryKey], data, result.binds);
        if (!result.match) {
            return result;
        }
    }
    clog(BLUE, 'INFO', ID_AP, '', 'Exit case Atom : Placeholder', 5);
    return result;
}

function matchAllPlaceholderAtom(query: any, sorted: any, data: any, initBinds: any[]): any {
    clog(BLUE, 'INFO', ID_PA, '', 'Enter case Placeholder : Atom', 5);
    let result: any = { binds: initBinds, match: true };
    for (const queryKey of sorted.get(ID_PA)) {
        result = matchPlaceholderAtom(queryKey, query[queryKey], data, result.binds)
        if (!result.match) {
            return result;
        }
    }
    clog(BLUE, 'INFO', ID_PA, '', 'Exit case Placeholder : Atom', 5);
    return result;
}

function matchAllPlaceholderObject(query: any, sorted: any, data: any, initBinds: any[]): any {
    clog(BLUE, 'INFO', ID_PO, '', 'Enter case Placeholder : Object', 5);
    let result: any = { binds: initBinds, match: true };
    for (const queryKey of sorted.get(ID_PO)) {
        result = matchPlaceholderObject(queryKey, query[queryKey], data, result.binds);
        if (!result.match) {
            return result;
        }
    }
    clog(BLUE, 'INFO', ID_PO, '', 'Exit case Placeholder : Object', 5);
    return result;
}

function matchAllPlaceholderPlaceholder(query: any, sorted: any, data: any, initBinds: any[]): any {
    clog(BLUE, 'INFO', ID_PP, '', 'Enter case Placeholder : Placeholder', 5);
    let result: any = { binds: initBinds, match: true };
    clog(RED, 'WARN', ID_PP, '', 'Functionality still not implemented', 0);
    clog(BLUE, 'INFO', ID_PP, '', 'Exit case Placeholder : Placeholder', 5);
    return result;
}

function matchAtomAtom(queryKey: string, queryValue: string, data: any): boolean {
    clog(PINK, 'INFO', ID_AA, '', 'key =>' + queryKey, 5);
    if (!data.hasOwnProperty(queryKey) || queryValue !== data[queryKey]) {
        clog(RED, 'FAIL', ID_AA, '', 'match failed', 2);
        return false;
    }
    clog(GREEN, 'OK', ID_AA, '', 'match succeded', 2);
    return true;
}

function matchAtomObject(queryKey: string, queryValue: object, data: any, binds: any[]): any {
    clog(PINK, 'INFO', ID_AO, '', 'key => ' + queryKey, 5);
    if (!data.hasOwnProperty(queryKey) || !isObject(data[queryKey])) {
        // Se non ha la chiave, o ha la chiave ma non è un oggetto ESPLODI
        // tslint:disable-next-line:max-line-length
        clog(RED, 'FAIL', ID_AO, '', 'it doesn\'t have the key, or it has it but it\'s not associated to an object ', 2);
        return { binds: [], match: false };
    }
    clog(BLUE, 'INFO', ID_AO, '\t', 'Entering recursion', 5);
    const result = matchBind(queryValue, data[queryKey], binds);
    clog(BLUE, 'INFO', ID_AO, '\t', 'Exit recursion', 5);
    if (!result.match) {
        clog(RED, 'FAIL', ID_AO, '', 'inner objects are different.', 2);
        return { binds: [], match: false };
    } else {
        // TODO prove it is correct
        binds = [...result.binds];
    }
    return { binds, match: true };
}

function matchAtomPlaceholder(queryKey: string, queryValue: string, data: any, binds: any[]): any {
    clog(PINK, 'INFO', ID_AP, '', 'key => ' + queryKey, 5);
    if (!data.hasOwnProperty(queryKey)) {
        clog(RED, 'FAIL', ID_AP, '', 'Key is not in the data', 2);
        return { binds: [], match: false };
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
    return filterAndReturn(binds, ID_PO);
}

function matchPlaceholderAtom(queryKey: string, queryValue: string, data: any, binds: any[]): any {
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
                const tmp: any = { ...newBinds[k] };
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
    return filterAndReturn(binds, ID_PO);
}

function matchPlaceholderObject(queryKey: string, queryValue: object, data: any, binds: any[]): any {
    clog(PINK, 'INFO', ID_PO, '', 'key => ' + queryKey, 5);
    const newBinds = [...binds];
    const dataKeys = Object.keys(data);
    const flag = (newBinds.length > 0);
    for (let k = 0; k < newBinds.length || k == 0; ++k) {
        // already bound to a non object
        if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
            && data.hasOwnProperty(newBinds[k][queryKey])
            && !isObject(data[newBinds[k][queryKey]])) {
            clog(RED, 'FAIL', ID_PO, '', 'invalid bind: name already bound to a non-object', 2);
            delete binds[k];
            continue;
        }

        // already bound to an object (check + possible new binds)
        if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
            && data.hasOwnProperty(newBinds[k][queryKey])
            && isObject(data[newBinds[k][queryKey]])) {
            clog(GREEN, 'OK', ID_PO, '', 'already existent correct bind', 3);
            clog(BLUE, 'INFO', ID_PO, '\t', 'Entering recursion', 5);
            const result = matchBind(queryValue, data[newBinds[k][queryKey]], [newBinds[k]]);
            clog(BLUE, 'INFO', ID_PO, '\t', 'Exit recursion', 5);
            if (!result.match) {
                clog(RED, 'FAIL', ID_PO, '', 'inner objects are different', 2);
            } else {
                clog(GREEN, 'OK', ID_PO, '', 'updated an already existent bind', 3);
                binds = binds.concat(result.binds);
            }
            delete binds[k];
            continue;
        }

        // still to bound
        for (const dataKey of dataKeys) {
            if (!isObject(data[dataKey])) {
                clog(RED, 'FAIL', ID_PO, '', 'key associated to a non-object', 2);
                continue;
            }
            if (!newBinds[k]) {
                clog(BLUE, 'INFO', ID_PO, '', 'It\'s the first bind', 5);
                const b: any = {};
                b[queryKey] = dataKey;
                newBinds.push(b);
            } else {
                newBinds[k][queryKey] = dataKey;
            }
            clog(BLUE, 'INFO', ID_PO, '\t', 'Entering recursion', 5);
            const result = matchBind(queryValue, data[dataKey], [newBinds[k]]);
            clog(BLUE, 'INFO', ID_PO, '\t', 'Exit recursion', 5);
            if (!result.match) {
                clog(RED, 'FAIL', ID_PO, '', 'inner objects are different', 2);
            } else {
                clog(GREEN, 'OK', ID_PO, '', 'updated an already existent bind', 3);
                binds = binds.concat(result.binds);
            }
        }
        if (flag) {
            delete binds[k];
        }
    }
    return filterAndReturn(binds, ID_PO);
}

function matchPlaceholderPlaceholder(queryKey: string, queryValue: object, data: any, binds: any[]): any {
    // TO BE IMPLEMENTED
    return filterAndReturn(binds, ID_PP);
}

function filterAndReturn(binds: any[], id: number): any {
    binds = binds.filter(el => { return el != null });
    if (binds.length === 0) {
        clog(YELLOW, 'EXIT', id, '', 'No more possible bind!', 4);
        return { binds, match: false };
    }
    return { binds, match: true };
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

    for (let i = 0; i < BINDS_CAT; ++i) {
        stack.set(i, new Array());
    }

    for (const k of keys) {
        if (isAtom(k)) {
            if (isAtom(j[k])) {
                stack.get(ID_AA).push(k);
            } else if (isObject(j[k])) {
                stack.get(ID_AO).push(k);
            } else if (isPlaceholder(j[k])) {
                stack.get(ID_AP).push(k);
            }
        } else {
            if (isAtom(j[k])) {
                stack.get(ID_PA).push(k);
            } else if (isObject(j[k])) {
                stack.get(ID_PO).push(k);
            } else if (isPlaceholder(j[k])) {
                stack.get(ID_PP).push(k);
            }
        }
    }
    return stack;
}

export function isPlaceholder(v: any) {
    return (typeof (v) === 'string' && v.charAt(0) === '$');
}
function isObject(v: any) {
    // util.isObject - Deprecated: Use value !== null && typeof value === 'object' instead.
    return (v !== null && typeof (v) === 'object');
}
function isAtom(v: any) {
    return (!isPlaceholder(v) && !isObject(v));
}
