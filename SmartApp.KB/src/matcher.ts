import { Colors, Debugger } from './debugger';
import { DataObject } from './kb';
import { Logger } from './logger';

const D: Debugger = new Debugger(4);

export type Response = Map<object, object[]>;

export function findMatches(query: object, dataset: object[], initBinds: object[] = []): Response {
    let matcher = new Matcher();
    return matcher.start(query, dataset, initBinds);
}

export function isPlaceholder(v: any) {
    return (typeof (v) === 'string' && v.charAt(0) === '$');
}
export function isObject(v: any) {
    // util.isObject - Deprecated: Use value !== null && typeof value === 'object' instead.
    return (v !== null && typeof (v) === 'object');
}
export function isAtom(v: any) {
    return (!isPlaceholder(v) && !isObject(v));
}

type SortMap = Map<number, string[]>;

class Matcher {

    ID_AA = 0;
    ID_AO = 1;
    ID_AP = 2;
    ID_PA = 3;
    ID_PO = 4;
    ID_PP = 5;
    BINDS_CAT = 6;

    outerQuery: object;
    outerSorted: SortMap;
    initBinds: { [index: string]: any }[];

    currBinds: { [index: string]: any }[];

    public start(q: object, dataset: object[], iBinds: object[] = []) {
        const matches: Response = new Map<object, object[]>();
        this.outerQuery = q;
        this.outerSorted = this.sort(q);
        this.initBinds = iBinds;
        for (const data of dataset) {
            this.currBinds = [...this.initBinds];
            D.newLine(1);
            if (this.matchBind(this.outerQuery, this.outerSorted, data)) {
                D.resetIndentation()
                D.clogNoID(Colors.GREEN, 'RESULT', '', 'Match success!', 4);
                matches.set(data, [...this.currBinds]);
            } else {
                D.resetIndentation()
                D.clogNoID(Colors.RED, 'RESULT', '', 'Match failed!', 4);
            }
        }
        return matches;
    }

    private sortAndMatch(query: any, data: object): boolean {
        const sorted = this.sort(query);
        return this.matchBind(query, sorted, data);
    }

    private matchBind(query: any, sorted: SortMap, data: object): boolean {
        //        Logger.getInstance().info('Matcher', 'Start visit on object', data);

        for (let i = 0; i < this.BINDS_CAT; ++i) {
            switch (i) {
                case this.ID_AA: {
                    // atom : atom
                    if (!this.matchAllAtomAtom(query, sorted, data)) {
                        return false;
                    }
                    break;
                }
                case this.ID_AO: {
                    // atom : object
                    if (!this.matchAllAtomObject(query, sorted, data)) {
                        return false;
                    }
                    break;
                }
                case this.ID_AP: {
                    // atom : placeholder
                    if (!this.matchAllAtomPlaceholder(query, sorted, data)) {
                        return false;
                    }
                    break;
                }
                case this.ID_PA: {
                    // placeholder : atom
                    if (!this.matchAllPlaceholderAtom(query, sorted, data)) {
                        return false;
                    }
                    break;
                }
                case 4: {
                    // placeholder : object
                    if (!this.matchAllPlaceholderObject(query, sorted, data)) {
                        return false;
                    }
                    break;
                }
                case 5: {
                    // placeholder : placeholder
                    if (!this.matchAllPlaceholderPlaceholder(query, sorted, data)) {
                        return false;
                    }
                    break;
                }
                default: {
                    Debugger.staticClogNoID(Colors.RED, 'FAIL', '', 'Sei proprio un ritardato!!');
                    break;
                }
            } // end switch
        } // end for
        return true;
    }

    private matchAllAtomAtom(query: { [index: string]: any }, sorted: SortMap, data: { [index: string]: any }): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_AA, '', 'Enter case Atom : Atom', 5);
        for (const queryKey of sorted.get(this.ID_AA)) {
            if (!this.matchAtomAtom(queryKey, query[queryKey], data)) {
                return false;
            }
        }
        D.clog(Colors.BLUE, 'INFO', this.ID_AA, '', 'Exit case Atom : Atom', 5);
        return true;
    }

    private matchAllAtomObject(query: { [index: string]: any }, sorted: SortMap, data: { [index: string]: any }): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_AO, '', 'Enter case Atom : Object', 5);
        for (const queryKey of sorted.get(this.ID_AO)) {
            if (!this.matchAtomObject(queryKey, query[queryKey], data)) {
                return false;
            }
        }
        D.clog(Colors.BLUE, 'INFO', this.ID_AO, '', 'Exit case Atom : Object', 5);
        return true;
    }

    private matchAllAtomPlaceholder(query: { [index: string]: any }, sorted: SortMap, data: { [index: string]: any }): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_AP, '', 'Enter case Atom : Placeholder', 5);
        for (const queryKey of sorted.get(this.ID_AP)) {
            if (!this.matchAtomPlaceholder(queryKey, query[queryKey], data)) {
                return false;
            }
        }
        D.clog(Colors.BLUE, 'INFO', this.ID_AP, '', 'Exit case Atom : Placeholder', 5);
        return true;
    }

    private matchAllPlaceholderAtom(query: { [index: string]: any }, sorted: SortMap, data: { [index: string]: any }): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_PA, '', 'Enter case Placeholder : Atom', 5);
        for (const queryKey of sorted.get(this.ID_PA)) {
            if (!this.matchPlaceholderAtom(queryKey, query[queryKey], data)) {
                return false;
            }
        }
        D.clog(Colors.BLUE, 'INFO', this.ID_PA, '', 'Exit case Placeholder : Atom', 5);
        return true;
    }

    private matchAllPlaceholderObject(query: { [index: string]: any }, sorted: SortMap, data: { [index: string]: any }): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Enter case Placeholder : Object', 5);
        for (const queryKey of sorted.get(this.ID_PO)) {
            if (!this.matchPlaceholderObject(queryKey, query[queryKey], data)) {
                return false;
            }
        }
        D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Exit case Placeholder : Object', 5);
        return true;
    }

    private matchAllPlaceholderPlaceholder(query: { [index: string]: any }, sorted: SortMap, data: { [index: string]: any }): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_PP, '', 'Enter case Placeholder : Placeholder', 5);
        for (const queryKey of sorted.get(this.ID_PO)) {
            if (!this.matchPlaceholderPlaceholder(queryKey, query[queryKey], data)) {
                return false;
            }
        }
        D.clog(Colors.BLUE, 'INFO', this.ID_PP, '', 'Exit case Placeholder : Placeholder', 5);
        return true;
    }

    private matchAtomAtom(queryKey: string, queryValue: string, data: { [index: string]: any }): boolean {
        D.clog(Colors.PINK, 'KEY', this.ID_AA, '', 'key => ' + queryKey, 4);
        D.clog(Colors.PINK, 'VAL', this.ID_AA, '', 'value => ' + queryValue, 4);
        if (!data.hasOwnProperty(queryKey) || queryValue !== data[queryKey]) {
            D.clog(Colors.RED, 'FAIL', this.ID_AA, '', 'BAD match on key `' +
                queryKey + '\', found `' + data[queryKey] + '\' instead of `' + queryValue + '\'', 2);
            return false;
        }
        D.clog(Colors.GREEN, 'OK', this.ID_AA, '', 'GOOD match on key `' + queryKey + '\' with value `' + queryValue + '\'', 2);
        return true;
    }

    private matchAtomObject(queryKey: string, queryValue: object, data: { [index: string]: any }): boolean {
        D.clog(Colors.PINK, 'KEY', this.ID_AO, '', 'key => ' + queryKey, 4);
        D.clog(Colors.PINK, 'VAL', this.ID_AO, '', 'value => ' + queryValue, 4);
        if (!data.hasOwnProperty(queryKey) || !isObject(data[queryKey])) {
            // Se non ha la chiave, o ha la chiave ma non è un oggetto ESPLODI
            D.clog(Colors.RED, 'FAIL', this.ID_AO, '',
                'key `' + queryKey + '\' is not found, or it isn\'t associated to an object', 2);
            return false;
        }
        D.increaseIndentation();
        D.clog(Colors.BLUE, 'INFO', this.ID_AO, '', 'Entering recursion', 5);
        // FIXME: renounce to debug to have tail recursion
        const result: boolean = this.sortAndMatch(queryValue, data[queryKey]);
        D.clog(Colors.BLUE, 'INFO', this.ID_AO, '', 'Exit recursion', 5);
        D.decreaseIndentation();
        if (!result) {
            D.clog(Colors.RED, 'FAIL', this.ID_AO, '', 'Inner objects are different.', 2);
            return false;
        }
        return true;
    }

    private matchAtomPlaceholder(queryKey: string, queryValue: string, data: { [index: string]: any }): boolean {
        D.clog(Colors.PINK, 'VAL', this.ID_AP, '', 'key => ' + queryKey, 4);
        D.clog(Colors.PINK, 'VAL', this.ID_AP, '', 'value => ' + queryValue, 4);
        if (!data.hasOwnProperty(queryKey)) {
            D.clog(Colors.RED, 'FAIL', this.ID_AP, '', 'Key `' + queryKey + '\' not found', 2);
            return false;
        }
        if (this.currBinds.length === 0) {
            D.clog(Colors.YELLOW, 'BIND', this.ID_AP, '', 'First bind: `' + queryValue + '\' -> `' + data[queryKey] + '\'', 4);
            const b: { [index: string]: string } = {};
            b[queryValue] = data[queryKey];
            this.currBinds.push(b);
        } else {
            for (let k = 0; k < this.currBinds.length; ++k) {
                if (this.currBinds[k].hasOwnProperty(queryValue)) {
                    if (this.currBinds[k][queryValue] !== data[queryKey]) {
                        D.clog(Colors.YELLOW, 'SBIND', this.ID_AP, '', 'Remove old bind: `' + queryValue + '\' -> `'
                            + this.currBinds[k][queryValue] + '\', because we found the pair `' + queryKey + '\' : `' + data[queryKey] + '\'', 2);
                        delete this.currBinds[k];
                        continue;
                    } else {
                        D.clog(Colors.GREEN, 'OK', this.ID_AP, '', 'Found a previous GOOD bind: `' + queryValue + '\' -> `' + data[queryKey] + '\'', 3);
                    }
                } else {
                    D.clog(Colors.YELLOW, 'BIND', this.ID_AP, '', 'Add bind: `' + queryValue + '\' -> `' + data[queryKey] + '\'', 2);
                    this.currBinds[k][queryValue] = data[queryKey];
                }
            }
        }
        return this.filterAndReturn(this.ID_AP);
    }

    private matchPlaceholderAtom(queryKey: string, queryValue: string, data: { [index: string]: any }): boolean {
        D.clog(Colors.PINK, 'KEY', this.ID_PA, '', 'key => ' + queryKey, 5);
        D.clog(Colors.PINK, 'VAL', this.ID_PA, '', 'value => ' + queryValue, 5);
        const newBinds: { [index: string]: any }[] = [...this.currBinds];
        const dataKeys = Object.keys(data);
        for (let k = 0; k < newBinds.length || k === 0; ++k) {
            if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
                && data.hasOwnProperty(newBinds[k][queryKey]) &&
                !(queryValue === data[newBinds[k][queryKey]])) {
                D.clog(Colors.RED, 'FAIL', this.ID_PA, '', 'this bind is invalid', 2);
                delete this.currBinds[k];
                continue;
            }
            if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
                && data.hasOwnProperty(newBinds[k][queryKey]) &&
                queryValue === data[newBinds[k][queryKey]]) {
                D.clog(Colors.GREEN, 'OK', this.ID_PA, '', 'bind already existent and correct', 3);
                continue;
            }
            for (const dataKey of dataKeys) {
                if (queryValue === data[dataKey]) {
                    D.clog(Colors.GREEN, 'OK', this.ID_PA, '', 'match and new branch', 3);
                    const tmp: any = { ...newBinds[k] };
                    tmp[queryKey] = dataKey;
                    this.currBinds.push(tmp);
                } else {
                    D.clog(Colors.GREEN, 'OK', this.ID_PA, '', 'no match here', 3);
                }
                if (newBinds[k]) {
                    delete this.currBinds[k];
                }
            }
        }
        return this.filterAndReturn(this.ID_PA);
    }

    private matchPlaceholderObject(queryKey: string, queryValue: object, data: { [index: string]: any }): boolean {
        D.clog(Colors.PINK, 'KEY', this.ID_PO, '', 'key => ' + queryKey, 5);
        D.clog(Colors.PINK, 'VAL', this.ID_PO, '', 'value => ' + queryValue, 5);
        const newBinds = [... this.currBinds];
        const dataKeys = Object.keys(data);
        let flag = false;
        for (let k = 0; k < newBinds.length || k === 0; ++k) {
            // already bound to a non object
            if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
                && data.hasOwnProperty(newBinds[k][queryKey])
                && !isObject(data[newBinds[k][queryKey]])) {
                D.clog(Colors.RED, 'FAIL', this.ID_PO, '', 'invalid bind: name already bound to a non-object', 2);
                delete this.currBinds[k];
                continue;
            }

            // already bound to an object (check + possible new binds)
            if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
                && data.hasOwnProperty(newBinds[k][queryKey])
                && isObject(data[newBinds[k][queryKey]])) {
                D.clog(Colors.GREEN, 'OK', this.ID_PO, '', 'already existent correct bind', 3);
                D.increaseIndentation();
                D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Entering recursion', 5);
                const result = this.sortAndMatch(queryValue, data[newBinds[k][queryKey]]);
                D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Exit recursion', 5);
                D.decreaseIndentation();
                if (!result) {
                    D.clog(Colors.RED, 'FAIL', this.ID_PO, '', 'inner objects are different', 2);
                } else {
                    D.clog(Colors.GREEN, 'OK', this.ID_PO, '', 'updated an already existent bind', 3);
                }
                delete this.currBinds[k];
                continue;
            }

            // still to bound
            for (const dataKey of dataKeys) {
                if (!isObject(data[dataKey])) {
                    D.clog(Colors.RED, 'FAIL', this.ID_PO, '', 'key associated to a non-object', 2);
                    continue;
                }
                if (!newBinds[k]) {
                    D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'It\'s the first bind', 5);
                    const b: any = {};
                    b[queryKey] = dataKey;
                    this.currBinds.push(b);
                } else {
                    this.currBinds[k][queryKey] = dataKey;
                }
                D.increaseIndentation();
                D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Entering recursion', 5);
                const result = this.sortAndMatch(queryValue, data[dataKey]);
                D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Exit recursion', 5);
                D.decreaseIndentation();
                if (!result) {
                    D.clog(Colors.RED, 'FAIL', this.ID_PO, '', 'inner objects are different', 2);
                } else {
                    D.clog(Colors.GREEN, 'OK', this.ID_PO, '', 'updated an already existent bind', 3);
                    flag = true;
                }
            }
            if (!flag) {
                delete this.currBinds[k];
            }
        }
        return this.filterAndReturn(this.ID_PO);
    }

    private matchPlaceholderPlaceholder(queryKey: string, queryValue: object, data: { [index: string]: any }): boolean {
        // TO BE IMPLEMENTED
        D.clog(Colors.RED, 'WARN', this.ID_PP, '', 'Functionality still not implemented', 1);
        return this.filterAndReturn(this.ID_PP);
    }

    private filterAndReturn(id: number): boolean {
        this.currBinds = this.currBinds.filter(el => { return el != null });
        if (this.currBinds.length === 0) {
            D.clog(Colors.RED, 'FAIL', id, '', 'No more possible bind!', 4);
            return false;
        }
        return true;
    }
    /*
        public parseFunctions(query: object): number {
            let result: number = 0;
            if (!query) {
                return result;
            }
            for (const k of Object.keys(query)) {
                if (ifFunction(k) {
    
                }
            }
    
        }
    */
    //    { _data: {... }, _meta: {... }, & isGreater: [$x, 3] }
    // callFunctionBool('isGreater',[$x, 3]);
    // callFunctions('isGreater', [[$x0, 3], [$x1, 2]])

    private sort(j: any): SortMap {
        const stack = new Map<number, string[]>();
        if (!j) {
            return stack;
        }
        const keys = Object.keys(j);

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

        for (let i = 0; i < this.BINDS_CAT; ++i) {
            stack.set(i, new Array());
        }

        for (const k of keys) {
            if (isAtom(k)) {
                if (isAtom(j[k])) {
                    stack.get(this.ID_AA).push(k);
                } else if (isObject(j[k])) {
                    stack.get(this.ID_AO).push(k);
                } else if (isPlaceholder(j[k])) {
                    stack.get(this.ID_AP).push(k);
                }
            } else {
                if (isAtom(j[k])) {
                    stack.get(this.ID_PA).push(k);
                } else if (isObject(j[k])) {
                    stack.get(this.ID_PO).push(k);
                } else if (isPlaceholder(j[k])) {
                    stack.get(this.ID_PP).push(k);
                }
            }
        }
        return stack;
    }
}
