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
        // console.log(mb);
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
    console.log('Query:');
    console.log(query);
    //    console.log('Sorted:');
    //    console.log(sorted);

    // binds : list of map <placeholder : bind>

    for ( let i = listIndex; i < sorted.size; ++i) {
        //console.log('index ' + i);
        switch (i) {
            case 0: {
                // atom : atom
                console.log('Working on atom : atom');
                for (const queryKey of sorted.get(i)) {
                    console.log('key: ' + queryKey);
                    if (!data.hasOwnProperty(queryKey) || query[queryKey] !== data[queryKey]) {
                        console.log('FAIL: !data.hasOwnProperty(queryKey) || query[queryKey] !== data[queryKey]');
                        return {match: false, binds: []};
                    }
                }
                console.log('FINITO 0');
                break;
            }
            case 1: {
                // atom : object
                console.log('Working on atom : object');
                for (const queryKey of sorted.get(i)) {
                    console.log('key: ' + queryKey);
                    if (!data.hasOwnProperty(queryKey) || !isObject(data[queryKey])) {
                        // Se non ha la chiave, o ha la chiave ma non è un oggetto ESPLODI
                        console.log('FAIL: !data.hasOwnProperty(queryKey) || !isObject(data[queryKey])');
                        return {match: false, binds: []};
                    }
                    const innerSorted = sort(query[queryKey]);
                    let newBinds = new Array();
                    let success = false;
                    for (let k = 0; k < binds.length; ++k) {
                        const innerBind = Object.assign({}, binds[k]);
                        innerBind[queryKey] = data[queryKey];
                        const result = matchBind(query[queryKey], innerSorted, 0, 0, data[queryKey], innerBind);
                        if (!result.match) {
                            console.log('FAIL: !result.match');
                        } else {
                            success = true;
                            for (const resBind of result.binds) {
                                newBinds.push(resBind); //???
                            }
                        }
                    }
                    if (!success) {
                        return {match: false, binds: []};
                    }
                    binds = newBinds;
                }
                console.log('FINITO 1');
                break;
            }
            case 2: {
                // atom : placeholder
                console.log('Working on atom : placeholder');
                for (const queryKey of sorted.get(i)) {
                    console.log('key: ' + queryKey);
                    if (!data.hasOwnProperty(queryKey)) {
                        console.log('FAIL: !data.hasOwnProperty(queryKey)');
                        return {match: false, binds: {}};
                    }
                    
                    if (binds.length === 0) {
                        console.log('length è giusto');
                        const b:any = {};
                        b[query[queryKey]] = data[queryKey];
                        binds.push(b);
                    } else {
                        for (let k = 0; k < binds.length; ++k) {
                            console.log('sono dentro');
                            if (binds[k].hasOwnProperty(query[queryKey])) {
                                if (binds[k][query[queryKey]] != data[queryKey]) {
                                    console.log('FAIL: binds[query[queryKey]] != data[queryKey]');
                                    delete binds[k];
                                continue;
                                } else {
                                    console.log('OK');
                                }
                            } else {
                                console.log('binds[query[queryKey]] = data[queryKey]');
                            binds[k][query[queryKey]] = data[queryKey];
                            }
                        }
                    }
                    console.log(binds);
                }
                console.log('FINITO 2');
                break;
            }
            case 3: {
                
                // placeholder : atom
                console.log('Working on placeholder : atom');
                /*
                const list = sorted.get(i);
                const dataKeys = Object.keys(data);
                for(let j = index; j < list.size; ++j) {
                    for (const bind of binds) {
                        if (!(bind.hasOwnProperty(list[j]) && data.hasOwnProperty(bind[list[j]]) &&
                              query[list[j]] === data[bind[list[j]]])) {
                            console.log('FAIL query[list[j]] === data[binds[list[j]]]');
                            // return {match: false, binds: {}};
                            // TODO: togli bind da binds
                        }
                        for (const dataKey of dataKeys) {
                            if (query[list[j]] === data[dataKey]) {
                                let newBinds = Object.assign({}, bind);
                                newBinds[list[j]] = dataKey;
                                const result = matchBind(query, sorted, i, j+1, data, newBinds);
                                if (result.match) {
                                    // TODO per ogni bind in result.Binds, lo aggiungo a binds
                                    //resultBinds = resultBinds.concat(result.binds);
                                }
                            }
                        }
                    }
                    if (binds.length == 0) {
                        return {match: false, binds: {}};
                    }
                }
                */
                break; 
            }
            case 4: {
                
                // placeholder : object
                console.log('Working on placeholder : object');
                /*
                const list = sorted.get(i);
                const dataKeys = Object.keys(data);
                for(let j = index; j < list.size; ++j) {
                    for (const bind of binds) {
                        if (!(bind.hasOwnProperty(list[j]) && data.hasOwnProperty(bind[list[j]]) &&
                              isObject(data[bind[list[j]]]))) {
                            console.log('FAIL: isObject(data[binds[list[j]]]')
                            //return {match: false, binds: {}};
                            // TODO: togli bind da binds
                        }
                        if (bind.hasOwnProperty(list[j]) && data.hasOwnProperty(bind[list[j]])) {
                            const innerSorted = sort(query[list[j]]);
                            const innerBind = Object.assing({}, bind);
                            const result = matchBind(query[list[j]], innerSorted, 0, 0, data[bind[list[j]]], innerBind);
                            if (!result.match) {
                                console.log('FAIL: !result.match');
                                //return {match: false, binds: {}};
                                // TODO: togli bind da binds
                            }
                            //                            binds = result.binds; // è un'unione
                            // TODO per ogni bind in result.Binds, lo aggiungo a binds
                            continue;
                        }
                        for (const dataKey of dataKeys) {
                            if (!isObject(dataKey)) {
                                continue;
                            }
                            const innerSorted = sort(query[list[j]]);
                            const innerBind = Object.assing({}, bind);
                            innerBind[list[j]] = dataKey;
                            const result = matchBind(query[list[j]], innerSorted, 0, 0, data[dataKey], innerBind);
                            if (!result.match) {
                                // TODO: togli bind da binds
                                console.log('FAIL: !result.match');
                                continue;
                            }
                            for (const resultBind of result.binds) {
                                const nextResult = matchBind(query, sorted, i, j+1, data, resultBinds);
                                if (!nextResult.match) {
                                    // TODO: togli bind da binds
                                    console.log('FAIL: !nextResult.match');
                                    continue;
                                }
                                // TODO per ogni bind in nextResult.Binds, lo aggiungo a binds
                            }

                            // TODO: incrementare j da qualche parte
                            // TODO: capire cosa succede fra liste e liste di liste
                            // TODO fare dei for each da qualhe parte
                            // TODO: pregare
                            // TODO: controllare che non vengano vettori di vettori di vettori....
                        }
                    }
                }
                */
                break;
                
            }
            case 5: {
                console.log('Working on placeholder : placeholder');
                // placeholder : placeholder
                // TODO 
                break;
            }
            default: {
                console.log ('sei proprio un ritardato');
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
