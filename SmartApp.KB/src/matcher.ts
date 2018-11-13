export function findMatchesBind(query: any, Dataset: any[]) {
    const matches = new Array();
    const sorted = sort(query);
    // inefficient lookup with a loop onto dataset array
    for (const data of Dataset) {
        const mb = matchBind(query, sorted, 0, 0, data, {});
        if (mb.match) {
            matches.push(mb.binds);
        }
    }
    return matches;
}

export function findMatchesBind2(query: any, Dataset: any[], initBinds: object) {
    const matches = new Array();
    const sorted = sort(query._data);
    // inefficient lookup with a loop onto dataset array
    for (const data of Dataset) {
        const mb = matchBind(query, sorted, 0, 0, data, initBinds);
        // console.log(mb);
        if (mb.match) {
            matches.push(mb.binds);
        }
    }
    return matches;
}

export function findMatchesAll(query: any, Dataset: any[]) {
    const matches = new Array();
    const sorted = sort(query._data);
    // inefficient lookup with a loop onto dataset array
    for (const data of Dataset) {
        const mb = matchBind(query, sorted, 0, 0, data, {});
        if (mb.match) {
            matches.push(data);
        }
    }
    return matches;
}

function matchBind(query: any, sorted: any, listIndex: number, index: number, data: any, initBinds: any): any {
    const queryKeys = Object.keys(query);
    let binds = Object.assign({}, initBinds);
    let match = true;

    // TODO check sugli indici
//    console.log('Query:');
//    console.log(query);
//    console.log('Sorted:');
//    console.log(sorted);
    for ( let i = listIndex; i < sorted.size; ++i) {
        //console.log('index ' + i);
        switch (i) {
            case 0: {
                for (const queryKey of sorted.get(i)) {
                    console.log('key: ' + queryKey);
                    if (!data.hasOwnProperty(queryKey) || query[queryKey] !== data[queryKey]) {
                        console.log('FAIL: !data.hasOwnProperty(queryKey) || query[queryKey] !== data[queryKey]');
                        return {match: false, binds: {}};
                    }
                }
                console.log('FINITO 0');
                break;
            }
            case 1: {
                for (const queryKey of sorted.get(i)) {
                    console.log('key: ' + queryKey);
                    if (!data.hasOwnProperty(queryKey) || !isObject(data[queryKey])) {
                        // Se non ha la chiave, o ha la chiave ma non è un oggetto ESPLODI
                        console.log('FAIL: !data.hasOwnProperty(queryKey) || !isObject(data[queryKey])');
                        return {match: false, binds: {}};
                    }
                    const innerSorted = sort(query[queryKey]);
                    const result = matchBind(query[queryKey], innerSorted, 0, 0, data[queryKey], binds);
                    if (!result.match) {
                        console.log('FAIL: !result.match');
                        return {match: false, binds: {}};
                    }
                    binds = result.binds; // è un'unione
                }
                console.log('FINITO 1');
                break;
            }
            case 2: {
                for (const queryKey of sorted.get(i)) {
                    console.log('key: ' + queryKey);
                    if (!data.hasOwnProperty(queryKey)) {
                        console.log('FAIL: !data.hasOwnProperty(queryKey)');
                        return {match: false, binds: {}};
                    }
                    if (binds.hasOwnProperty(query[queryKey])) {
                        if (binds[query[queryKey]] != data[queryKey]) {
                            console.log('FAIL: binds[query[queryKey]] != data[queryKey]');
                            return {match: false, binds: {}};
                        }
                    } else {
                        console.log('binds[query[queryKey]] = data[queryKey]');
                        binds[query[queryKey]] = data[queryKey];
                    }
                }
                console.log('FINITO 2');
                break;
            }
            case 3: {
                const list = sorted.get(i);
                const dataKeys = Object.keys(data);
                for(let j = index; j < list.size; ++j) {
                    if (!(binds.hasOwnProperty(list[j]) && data.hasOwnProperty(binds[list[j]]) &&
                          query[list[j]] === data[binds[list[j]]])) {
                        console.log('FAIL query[list[j]] === data[binds[list[j]]]');
                        return {match: false, binds: {}};
                    }
                    for (const dataKey of dataKeys) {
                        if (query[list[j]] === data[dataKey]) {
                            let newBinds = binds;
                            newBinds[list[j]] = dataKey;
                            const result = matchBind(query, sorted, i, j+1, data, newBinds);
                            if (result.match) {
                                resultBinds = resultBinds.concat(result.binds);
                            }
                        }
                    }
                }
                break;
            }
            case 4: {
                const list = sorted.get(i);
                const dataKeys = Object.keys(data);
                for(let j = index; j < list.size; ++j) {
                    if (!(binds.hasOwnProperty(list[j]) && data.hasOwnProperty(binds[list[j]]) &&
                          isObject(data[binds[list[j]]]))) {
                        console.log('FAIL: isObject(data[binds[list[j]]]')
                        return {match: false, binds: {}};
                    }
                    if (binds.hasOwnProperty(list[j]) && data.hasOwnProperty(binds[list[j]])) {
                        const innerSorted = sort(query[list[j]]);
                        const result = matchBind(query[list[j]], innerSorted, 0, 0, data[binds[list[j]]], binds);
                        if (!result.match) {
                            console.log('FAIL: !result.match');
                            return {match: false, binds: {}};
                        }
                        binds = result.binds; // è un'unione
                        continue;
                    }
                    for (const dataKey of dataKeys) {
                        if (!isObject(dataKey)) {
                            continue;
                        }
                        const innerSorted = sort(query[list[j]]);
                        const result = matchBind(query[list[j]], innerSorted, 0, 0, data[dataKey], binds);
                        if (!result.match) {
                            console.log('FAIL: !result.match');
                            continue;
                        }
                        // TODO: fare copie vere
                        let newBinds = binds;
                        newBinds += result.binds;
                        newBinds[list[j]] = dataKey;
                        const result2 = matchBind(query, sorted, i, j+1, data, newBinds);
                        if (result.match) {
                            resultBinds = resultBinds.concat(result.binds);
                        }

                        // TODO: incrementare j da qualche parte
                        // TODO: capire cosa succede fra liste e liste di liste
                        // TODO fare dei for each da qualhe parte
                        // TODO: pregare
                        // TODO: controllare che non vengano vettori di vettori di vettori....
                    }
                }
                break;
            }
            case 5: {
                
                break;
            }
            default: {
                console.log ('sei proprio un ritardato');
                break;
            }
        } // end switch
    } // end for

    resultBinds = resultBinds.concat(binds);
    return { match: true, binds: resultBinds };


    /*
    let i = 0;

    while (i < queryKeys.length && match) {
        const queryKey = queryKeys[i];
        console.log('analyzing key: ' + queryKey);

        if (isAtom(queryKey)) {
            // the object d is good if contains all the keys in q
            if (data.hasOwnProperty(queryKey)) {
                const queryValue = query[queryKey];
                const dataValue = data[queryKey];

                // console.log('try to match/bind key vaulues ' + queryValue + ' and ' + dataValue);

                if (isAtom(queryValue)) {
                // the value of the current query key is an atom, so we need the value of the data key to be equal
                    if (queryValue !== dataValue) {
                        // console.log('is atom fail');
                        match = false;
                    }
                }
                if (isPlaceholder(queryValue)) {
                // the value of the current query key is a placeholder,
                // so we need to check if we can bind the value to it
                    if (binds.hasOwnProperty(queryValue) && binds[queryValue] !== dataValue) {
                        // console.log('binding fail');
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
            console.log(data);
            const dataKeys = Object.keys(data);
            for (const dataKey of dataKeys) {
                const dataValue = data[dataKey];
                if (isAtom(queryValue)) {
                    console.log('case placeholder : atom');
                    if (isAtom(dataValue) && queryValue === dataValue) {
                        console.log('values are equal, so we bind ' + queryKey  + ' to ' + dataKey);
                        // TODO
                    }
                }
                if (isPlaceholder(queryValue)) {
                    console.log('case placeholder : placeholder');
                    if (binds.hasOwnProperty(queryValue)) {
                        // caso: queryValue è già bindata
                        // MI SONO PERSOOOOOOOOOOOOOO
                        // non va un cazzo
                        // voglio morire
                    } else {
                        if (queryKey === queryValue) {
                            if (dataKey === dataValue) {
                                console.log('che schifo! Bind' + queryKey + ' to ' + dataKey);
                            }
                        } else {
                            console.log('bind ' + queryKey + ' to ' + dataKey);
                            // FIXME: dataValue can be an atom or an object...
                            console.log('bind ' + queryValue + ' to ' + dataValue);
                        }
                    }
                }
                if (isObject(queryValue) && isObject(dataValue)) {
                    console.log('case placeholder : object');
                    const result = matchBind(queryValue, dataValue, binds);
                    if (result.match) {
                        console.log('object match hoooray, so we bind ' + queryKey  + ' to ' + dataKey);
                        console.log('and also the inner binds')
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
