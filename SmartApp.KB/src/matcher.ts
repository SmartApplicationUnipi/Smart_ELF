const DEBUG = 0;

function clog(msg: any, level: number) {
    if (level < DEBUG)
        console.log(msg);
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
        // clog(mb);
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
    let binds = initBinds.map(x => Object.assign({}, x));
    let match = true;

    // TODO check sugli indici
    // clog('Query:', 10);
    // clog(query, 10);
    //    clog('Sorted:');
    //    clog(sorted);

    // binds : list of map <placeholder : bind>
    clog('', 1);
    for ( let i = listIndex; i < sorted.size; ++i) {
        switch (i) {
            case 0: {
                // atom : atom
                clog('\x1b[1;34mINFO(' + i +')\x1b[0m Enter case atom : atom', 5);
                for (const queryKey of sorted.get(i)) {
                    clog('\x1b[1;35mINFO(' + i +')\x1b[0m key => ' + queryKey, 5);
                    if (!data.hasOwnProperty(queryKey) || query[queryKey] !== data[queryKey]) {
                        clog('\x1b[1;31mFAIL('+i+')\x1b[0m: !data.hasOwnProperty(queryKey) || query[queryKey] !== data[queryKey]', 2);
                        return {match: false, binds: []};
                    }
                }
                clog('\x1b[1;34mINFO(' + i +')\x1b[0m Exit case atom : atom', 5);
                break;
            }
            case 1: {
                // atom : object
                clog('\x1b[1;34mINFO(' + i +')\x1b[0m Enter case atom : object', 5);
                for (const queryKey of sorted.get(i)) {
                    clog('\x1b[1;35mINFO(' + i +')\x1b[0m key => ' + queryKey, 5);
                    if (!data.hasOwnProperty(queryKey) || !isObject(data[queryKey])) {
                        // Se non ha la chiave, o ha la chiave ma non è un oggetto ESPLODI
                        clog('\x1b[1;31mFAIL('+i+')\x1b[0m: !data.hasOwnProperty(queryKey) || !isObject(data[queryKey])', 2);
                        return {match: false, binds: []};
                    }
                    const innerSorted = sort(query[queryKey]); // TODO remove!
                    clog('\t\x1b[1;34mINFO(' + i +')\x1b[0m Entering recursion', 5);
                    const result = matchBind(query[queryKey], innerSorted, 0, 0, data[queryKey], binds);
                    clog('\t\x1b[1;34mINFO(' + i +')\x1b[0m Exit recursion', 5);
                    if (!result.match) {
                        clog('\x1b[1;31mFAIL('+i+')\x1b[0m: inner objects are different.', 2);
                        return {match: false, bind: [] };
                    } else {
                        // TODO prove it is correct
                        binds = [...result.binds];
                    }
                }
                clog('\x1b[1;34mINFO(' + i +')\x1b[0m Exit case atom : object', 5);
                break;
            }
            case 2: {
                // atom : placeholder
                clog('\x1b[1;34mINFO('+i+')\x1b[0m Enter case atom : placeholder', 5);
                for (const queryKey of sorted.get(i)) {
                    clog('\x1b[1;35mINFO(' + i +')\x1b[0m key => ' + queryKey, 5);
                    if (!data.hasOwnProperty(queryKey)) {
                        clog('\x1b[1;31mFAIL('+i+')\x1b[0m: !data.hasOwnProperty(queryKey)', 2);
                        return {match: false, binds: {}};
                    }
                    if (binds.length === 0) {
                        clog('\x1b[1;32mINFO('+i+')\x1b[0m: It\'s the first bind', 5);
                        const b:any = {};
                        b[query[queryKey]] = data[queryKey];
                        binds.push(b);
                    } else {
                        for (let k = 0; k < binds.length; ++k) {
                            if (binds[k].hasOwnProperty(query[queryKey])) {
                                if (binds[k][query[queryKey]] != data[queryKey]) {
                                    clog('\x1b[1;31mFAIL('+i+')\x1b[0m: binds[query[queryKey]] != data[queryKey]', 2);
                                    delete binds[k];
                                continue;
                                } else {
                                    clog('\x1b[1;32mOK('+i+'): \x1b[0m OK', 3);
                                }
                            } else {
                                clog('\x1b[1;31mFAIL('+i+'): \x1b[0m binds[query[queryKey]] = data[queryKey]', 2);
                            binds[k][query[queryKey]] = data[queryKey];
                            }
                        }
                    }
                    binds = binds.filter(el => {return el != null});
                    if (binds.length === 0) {
                        clog('\x1b[1;33mEXIT('+i+'): \x1b[0m binds.length === 0', 4);
                        return {match: false, binds: {}};
                    }
                }
                clog('\x1b[1;34mINFO(' + i +')\x1b[0m Exit case atom : placeholder', 5);
                break;
            }
            case 3: {
                // placeholder : atom
                clog('\x1b[1;34mINFO(' + i +')\x1b[0m Enter case placeholder : atom', 5);
                const list = sorted.get(i);
                const dataKeys = Object.keys(data);
                for(let j = index; j < list.length; ++j) {
                    clog('\x1b[1;35mINFO(' + i +')\x1b[0m key => ' + list[j], 5);
                    const newBinds = [...binds]
                    for (let k = 0; k < newBinds.length || k == 0; ++k) {
                        if (newBinds[k] && newBinds[k].hasOwnProperty(list[j]) && data.hasOwnProperty(newBinds[k][list[j]]) &&
                            !(query[list[j]] === data[newBinds[k][list[j]]])) {
                            clog('\x1b[1;31mFAIL(3): \x1b[0m query[list[j]] === data[binds[list[j]]]', 2);
                            delete binds[k];
                            continue;
                        }
                        if (newBinds[k] && newBinds[k].hasOwnProperty(list[j]) && data.hasOwnProperty(newBinds[k][list[k]]) &&
                            query[list[j]] === data[newBinds[k][list[j]]]) {
                            clog('\x1b[1;32mOK(3):\x1b[0m bind già esistente', 3);
                            continue;
                        }
                        for (const dataKey of dataKeys) {
                            if (query[list[j]] === data[dataKey]) {
                                clog('\x1b[1;32mOK(3):\x1b[0m match and new branch', 3);
                                let tmp:any = {...newBinds[k]};
                                tmp[list[j]] = dataKey;
                                binds.push(tmp);
                            } else {
                                clog('\x1b[1;32mOK(3):\x1b[0m No match here', 3);
                            }
                            if (newBinds[k]) {
                                delete binds[k];
                            }
                        }
                    }
                    binds = binds.filter(el => {return el != null});
                    if (binds.length === 0) {
                        clog('\x1b[1;33mEXIT(3): \x1b[0m binds.length === 0', 4);
                        return {match: false, binds: {}};
                    }
                }
                clog('\x1b[1;34mINFO(' + i +')\x1b[0m Exit case placeholder : atom', 5);
                break;
            }
            case 4: {
                // placeholder : object
                clog('\x1b[1;34mINFO(' + i +')\x1b[0m Enter case placeholder : object', 5);
                const list = sorted.get(i);
                const dataKeys = Object.keys(data);
                for(let j = index; j < list.length; ++j) {
                    clog('\x1b[1;35mINFO(' + i +')\x1b[0m key => ' + list[j], 5);
                    const newBinds = [...binds];
                    let flag = false;
                    if (newBinds.length > 0) {
                        flag = true;
                    }
                    for (let k = 0; k < newBinds.length || k == 0; ++k) {
                        // already bound to a non object
                        if (newBinds[k] && newBinds[k].hasOwnProperty(list[j])
                            && data.hasOwnProperty(newBinds[k][list[j]])
                            && !isObject(data[newBinds[k][list[j]]])) {
                            clog('\x1b[1;31mFAIL('+i+')\x1b[0m: isObject(data[binds[list[j]]]', 2)
                            delete binds[k];
                            continue;
                        }

                        // already bound to an object (check + possible new binds)
                        if (newBinds[k] && newBinds[k].hasOwnProperty(list[j])
                            && data.hasOwnProperty(newBinds[k][list[k]])
                            && isObject(data[newBinds[k][list[j]]])) {
                            clog('\x1b[1;32mOK('+i+'):\x1b[0m bind già esistente', 3);
                            const innerSorted = sort(query[list[j]]); // TODO remove
                            clog('\t\x1b[1;34mINFO(' + i +')\x1b[0m Entering recursion', 5);
                            const result = matchBind(query[list[j]], innerSorted, 0, 0, data[list[j]], [newBinds[k]]);
                            clog('\t\x1b[1;34mINFO(' + i +')\x1b[0m Exit recursion', 5);
                            if (!result.match) {
                                clog('\x1b[1;31mFAIL('+i+')\x1b[0m: inner objects are different.', 2);
                                delete binds[k];
                            } else {
                                clog('\x1b[1;32mOK('+i+'):\x1b[0m: updated already existent bind', 3);
                                delete binds[k];
                                binds = binds.concat(result.binds);
                            }
                            continue;
                        }

                        // still to bound
                        for (const dataKey of dataKeys) {
                            if (!isObject(data[dataKey])) {
                                clog('\x1b[1;31mFAIL('+i+')\x1b[0m: !isObject(data[dataKey]).', 2);
                                continue;
                            }
                            if (!newBinds[k]) {
                                clog('\x1b[1;34mINFO(' + i +')\x1b[0m Added first bind', 5);
                                const b:any = {};
                                b[list[j]] = dataKey;
                                newBinds.push(b);
                            } else {
                                newBinds[k][list[j]] = dataKey;
                            }
                            const innerSorted = sort(query[list[j]]); // TODO remove
                            clog('\t\x1b[1;34mINFO(' + i +')\x1b[0m Entering recursion', 5);
                            const result = matchBind(query[list[j]], innerSorted, 0, 0, data[dataKey], [newBinds[k]]);
                            clog('\t\x1b[1;34mINFO(' + i +')\x1b[0m Exit recursion', 5);
                            if (!result.match) {
                                clog('\x1b[1;31mFAIL('+i+')\x1b[0m: inner objects are different.', 2);
                            } else {
                                clog('\x1b[1;32mOK('+i+'):\x1b[0m: updated already existent bind', 3);
                                binds = binds.concat(result.binds);
                            }
                        }
                        if (flag) {
                            delete binds[k];
                        }
                    }
                    binds = binds.filter(el => {return el != null});
                    if (binds.length === 0) {
                        clog('\x1b[1;33mEXIT('+i+'): \x1b[0m binds.length === 0', 4);
                        return {match: false, binds: {}};
                    }
                }
                clog('\x1b[1;34mINFO('+i+')\x1b[0m Exit case placeholder : object', 5);
                break;
            }
            case 5: {
                clog('\x1b[1;34mINFO('+i+')\x1b[0m Enter case placeholder : placeholder', 5);
                // placeholder : placeholder
                // TODO 
                clog('\x1b[1;34mINFO('+i+')\x1b[0m Exit case placeholder : placeholder', 5);
                break;
            }
            default: {
                clog ('sei proprio un ritardato', 0);
                break;
            }
        } // end switch
    } // end for

//    resultBinds = resultBinds.concat(binds);
    return { match: true, binds };


    /*
    let i = 0;

    while (i < queryKeys.length && match) {
        const queryKey = queryKeys[i];
        clog('analyzing key: ' + queryKey);

        if (isAtom(queryKey)) {
            // the object d is good if contains all the keys in q
            if (data.hasOwnProperty(queryKey)) {
                const queryValue = query[queryKey];
                const dataValue = data[queryKey];

                // clog('try to match/bind key vaulues ' + queryValue + ' and ' + dataValue);

                if (isAtom(queryValue)) {
                // the value of the current query key is an atom, so we need the value of the data key to be equal
                    if (queryValue !== dataValue) {
                        // clog('is atom fail');
                        match = false;
                    }
                }
                if (isPlaceholder(queryValue)) {
                // the value of the current query key is a placeholder,
                // so we need to check if we can bind the value to it
                    if (binds.hasOwnProperty(queryValue) && binds[queryValue] !== dataValue) {
                        // clog('binding fail');
                        match = false;
                    } else { binds[queryValue] = dataValue; }
                }
                if (isObject(queryValue)) {

                // the value of the current query key is an object,
                // so we can do recursive call to check if they can be matched
                    const result = matchBind(queryValue, dataValue, binds);
                    match = result.match;
                    binds = result.binds;
                }
            } else {
                return {match : false, binds : {}};
            }
        }
        if (isPlaceholder(queryKey)) {
            let success = false;
            const queryValue = query[queryKey];
            clog(data);
            const dataKeys = Object.keys(data);
            for (const dataKey of dataKeys) {
                const dataValue = data[dataKey];
                if (isAtom(queryValue)) {
                    clog('case placeholder : atom');
                    if (isAtom(dataValue) && queryValue === dataValue) {
                        clog('values are equal, so we bind ' + queryKey  + ' to ' + dataKey);
                        // TODO
                    }
                }
                if (isPlaceholder(queryValue)) {
                    clog('case placeholder : placeholder');
                    if (binds.hasOwnProperty(queryValue)) {
                        // caso: queryValue è già bindata
                        // MI SONO PERSOOOOOOOOOOOOOO
                        // non va un cazzo
                        // voglio morire
                    } else {
                        if (queryKey === queryValue) {
                            if (dataKey === dataValue) {
                                clog('che schifo! Bind' + queryKey + ' to ' + dataKey);
                            }
                        } else {
                            clog('bind ' + queryKey + ' to ' + dataKey);
                            // FIXME: dataValue can be an atom or an object...
                            clog('bind ' + queryValue + ' to ' + dataValue);
                        }
                    }
                }
                if (isObject(queryValue) && isObject(dataValue)) {
                    clog('case placeholder : object');
                    const result = matchBind(queryValue, dataValue, binds);
                    if (result.match) {
                        clog('object match hoooray, so we bind ' + queryKey  + ' to ' + dataKey);
                        clog('and also the inner binds')
                    }
                }
            }
        }
        i++;
    }
    return {match, binds};
*/
}

function sort(j: any): object {
    if (!j) {
        return {}
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
