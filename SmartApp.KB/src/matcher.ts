import { Colors, Debugger } from './debugger';
import { executeSpecialPredicate } from './dispatcher';

/*                                             ,--,  ,.-.
               ,                   \,       '-,-`,'-.' | ._
              /|           \    ,   |\         }  )/  / `-,',
              [ ,          |\  /|   | |        /  \|  |/`  ,`
              | |       ,.`  `,` `, | |  _,...(   (      .',
              \  \  __ ,-` `  ,  , `/ |,'      Y     (   /_L\
               \  \_\,``,   ` , ,  /  |         )         _,/
                \  '  `  ,_ _`_,-,<._.<        /         /
                 ', `>.,`  `  `   ,., |_      |         /
                   \/`  `,   `   ,`  | /__,.-`    _,   `\
               -,-..\  _  \  `  /  ,  / `._) _,-\`       \
                \_,,.) /\    ` /  / ) (-,, ``    ,        |
               ,` )  | \_\       '-`  |  `(               \
              /  /```(   , --, ,' \   |`<`    ,            |
             /  /_,--`\   <\  V /> ,` )<_/)  | \      _____)
       ,-, ,`   `   (_,\ \    |   /) / __/  /   `----`
      (-, \           ) \ ('_.-._)/ /,`    /
      | /  `          `/ \\ V   V, /`     /
   ,--\(        ,     <_/`\\     ||      /
  (   ,``-     \/|         \-A.A-`|     /
 ,>,_ )_,..(    )\          -,,_-`  _--`
(_ \|`   _,/_  /  \_            ,--`
 \( `   <.,../`     `-.._   _,-`
 */

const D: Debugger = new Debugger();

export type Matches = Map<object, object[]>;

/*
  TODO (parallel performance improvment)
  Move the main (parallel) loop in this function and create a new instance of the Matcher
  for each element of the dataset.
  To see the previous implementation (similar to what we want to achieve):
  git show bbc78e1541af473d9d2f55c93c57c7f64033dffb
*/
export function findMatches(query: object, dataset: object[], initBinds: object[] = []): Matches {
    const matcher = new Matcher();
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

    functions: { [index: string]: string[] }[] = [];

    public start(q: { [index: string]: any }, dataset: object[], iBinds: object[] = []) {
        const matches: Matches = new Map<object, object[]>();
        this.outerQuery = q;
        this.outerSorted = this.sort(q);
        this.initBinds = [...iBinds];
        for (const data of dataset) {
            this.currBinds = this.initBinds.map((x) => Object.assign({}, x));
            // this.currBinds = [...this.initBinds];
            D.newLine(1);
            if (this.matchBind(this.outerQuery, this.outerSorted, data)) {
                D.resetIndentation()
                D.clogNoID(Colors.GREEN, 'RESULT', '', 'Match success!', 4);
                if (q.hasOwnProperty('_predicates')) {
                    D.clogNoID(Colors.BLUE, 'INFO', '', 'Some predicates to check!', 5);
                    if (!this.evaluatePredicates(q['_predicates'])) {
                        D.clogNoID(Colors.RED, 'RESULT', '', 'Predicate check failed! Match failed!', 4);
                        continue;
                    }
                }
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
                case this.ID_PO: {
                    // placeholder : object
                    if (!this.matchAllPlaceholderObject(query, sorted, data)) {
                        return false;
                    }
                    break;
                }
                case this.ID_PP: {
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
            D.clog(Colors.RED, 'FAIL', this.ID_AO, '', 'Inner objects can\'t be matched.', 2);
            return false;
        }
        return true;
    }

    private matchAtomPlaceholder(queryKey: string, queryValue: string, data: { [index: string]: any }): boolean {
        D.clog(Colors.PINK, 'VAL', this.ID_AP, '', 'key => ' + queryKey, 4);
        D.clog(Colors.PINK, 'VAL', this.ID_AP, '', 'value => ' + queryValue, 4);
        if (!data.hasOwnProperty(queryKey)) {
            D.clog(Colors.RED, 'FAIL', this.ID_AP, '', 'Key `' + queryKey + '\' not found.', 2);
            this.currBinds = [];
            return false;
        }
        if (this.currBinds.length === 0) {
            D.clog(Colors.YELLOW, 'BIND', this.ID_AP, '', 'Create a new set of bind containing only the bind: <`' + queryValue + '\':`' + data[queryKey] + '\'>.', 4);
            const tmp: { [index: string]: string } = {};
            tmp[queryValue] = data[queryKey];
            this.currBinds.push(tmp); // FIXME: There must exists a way to push directly the new object instead of creating a temp.
        } else {
            for (let k = 0; k < this.currBinds.length; ++k) {
                if (this.currBinds[k].hasOwnProperty(queryValue)) {
                    if (this.currBinds[k][queryValue] !== data[queryKey]) {
                        D.clog(Colors.YELLOW, 'SBIND', this.ID_AP, '', 'Remove the set of bind containing <`' + queryValue + '\':`'
                            + this.currBinds[k][queryValue] + '\'>, because it\'s inconsistent with the bind <`' + queryValue
                            + '\' : `' + data[queryKey] + '\'>.', 2);
                        delete this.currBinds[k];
                        continue;
                    } else {
                        D.clog(Colors.GREEN, 'OK', this.ID_AP, '', 'Current set of bind contains <`' + queryValue + '\':`' + data[queryKey] + '\'>, nothing to do.', 3);
                    }
                } else {
                    D.clog(Colors.YELLOW, 'BIND', this.ID_AP, '', 'Extend the current set of bind with <`' + queryValue + '\':`' + data[queryKey] + '\'>.', 2);
                    this.currBinds[k][queryValue] = data[queryKey];
                }
            }
        }
        return this.filterAndReturn(this.ID_AP);
    }

    private matchPlaceholderAtom(queryKey: string, queryValue: string, data: { [index: string]: any }): boolean {
        D.clog(Colors.PINK, 'KEY', this.ID_PA, '', 'key => ' + queryKey, 4);
        D.clog(Colors.PINK, 'VAL', this.ID_PA, '', 'value => ' + queryValue, 4);
        const dataKeys = Object.keys(data);

        if (this.currBinds.length === 0) {
            for (const dataKey of dataKeys) {
                if (queryValue === data[dataKey]) {
                    D.clog(Colors.YELLOW, 'BIND', this.ID_PA, '', 'Create a new set of bind containing only `' + queryKey + '\':`' + dataKey + '\'>.', 3);
                    const tmp: { [index: string]: string } = {};
                    tmp[queryKey] = dataKey;
                    this.currBinds.push(tmp);
                } else {
                    D.clog(Colors.GREEN, 'OK', this.ID_PA, '', 'No match between `' + queryValue + '\' and `' + data[dataKey] + '\' here, nothing to do.', 3);
                }
            }
            // Here there can't exist deleted binds, but we use the function
            // to check if the array is empty and maintaing coherent style.
            return this.filterAndReturn(this.ID_PA);
        }

        // we don't want to cut our legs during the loop.
        const newBinds: { [index: string]: any }[] = [...this.currBinds];
        for (let k = 0; k < newBinds.length; ++k) {
            if (newBinds[k].hasOwnProperty(queryKey)
                && data.hasOwnProperty(newBinds[k][queryKey]) &&
                !(queryValue === data[newBinds[k][queryKey]])) {
                D.clog(Colors.YELLOW, 'SBIND', this.ID_PA, '', 'Remove the set of bind containing <`' + queryKey + '\':`' + this.currBinds[k][queryKey]
                    + '\'>, because is inconsistent with the bind <`' + queryValue + '\':`' + data[newBinds[k][queryKey]] + '\'>.', 2);
                delete this.currBinds[k];
                continue;
            }
            if (newBinds[k].hasOwnProperty(queryKey)
                && data.hasOwnProperty(newBinds[k][queryKey]) &&
                queryValue === data[newBinds[k][queryKey]]) {
                D.clog(Colors.GREEN, 'OK', this.ID_PA, '', 'Current set of bind contains <`' + queryKey + '\':`'
                    + newBinds[k][queryKey] + '\'>, skip to next set.', 3);
                continue;
            }
            for (const dataKey of dataKeys) {
                if (queryValue === data[dataKey]) {
                    D.clog(Colors.YELLOW, 'BIND', this.ID_PA, '', 'Create a new set of bind extending the current with <`' + queryKey + '\':`' + dataKey + '\'>', 3);
                    const tmp: any = { ...newBinds[k] };
                    tmp[queryKey] = dataKey;
                    this.currBinds.push(tmp);
                } else {
                    D.clog(Colors.GREEN, 'OK', this.ID_PA, '', 'No match between `' + queryValue + '\' and `' + data[dataKey] + '\', but this doesn\'t invalidate the current set.', 3);
                }
            }
            D.clog(Colors.YELLOW, 'SBIND', this.ID_PA, '', 'Remove the current set of bind because is obsolete.', 3);
            delete this.currBinds[k];
        }
        return this.filterAndReturn(this.ID_PA);
    }

    private matchPlaceholderObject(queryKey: string, queryValue: object, data: { [index: string]: any }): boolean {
        D.clog(Colors.PINK, 'KEY', this.ID_PO, '', 'key => ' + queryKey, 4);
        D.clog(Colors.PINK, 'VAL', this.ID_PO, '', 'value => ' + queryValue, 4);
        const newBinds = [... this.currBinds];
        const dataKeys = Object.keys(data);
        let flag = false;
        for (let k = 0; k < newBinds.length || k === 0; ++k) {
            // already bound to a non object
            if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
                && data.hasOwnProperty(newBinds[k][queryKey])
                && !isObject(data[newBinds[k][queryKey]])) {
                D.clog(Colors.YELLOW, 'SBIND', this.ID_PO, '', 'Remove the set of bind containing <`' + queryKey + '\':`' + this.currBinds[k][queryKey]
                    + '\'> because `' + this.currBinds[k][queryKey] + '\' should be associated to an object.', 2);
                delete this.currBinds[k];
                continue;
            }

            // already bound to an object (check + possible new binds)
            if (newBinds[k] && newBinds[k].hasOwnProperty(queryKey)
                && data.hasOwnProperty(newBinds[k][queryKey])
                && isObject(data[newBinds[k][queryKey]])) {
                D.clog(Colors.GREEN, 'OK', this.ID_PO, '', 'Found a set containing a coherent bind <`' + queryKey + '\':`' + this.currBinds[k][queryKey]
                    + '\', now check if inner object are the same.', 3);
                D.increaseIndentation();
                D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Entering recursion', 4);
                const result = this.sortAndMatch(queryValue, data[newBinds[k][queryKey]]);
                D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Exit recursion', 4);
                D.decreaseIndentation();
                if (!result) {
                    D.clog(Colors.RED, 'FAIL', this.ID_PO, '', 'Inner objects can\'t be mached, the set of bind should have been removed in the inner match.', 2);
                } else {
                    D.clog(Colors.GREEN, 'OK', this.ID_PO, '', 'Maybe updated the current set of bind.', 3);
                }
                continue;
            }

            // still to bound
            for (const dataKey of dataKeys) {
                if (!isObject(data[dataKey])) {
                    D.clog(Colors.RED, 'FAIL', this.ID_PO, '', 'Key `' + dataKey + '\' associated to a non-object', 2);
                    continue;
                }
                // FIXME move outside
                if (!newBinds[k]) {
                    D.clog(Colors.YELLOW, 'BIND', this.ID_PO, '', 'Create a new set of bind containing only `' + queryKey + '\':`' + dataKey + '\'>.', 3);
                    const b: any = {};
                    b[queryKey] = dataKey;
                    this.currBinds.push(b);
                } else {
                    this.currBinds[k][queryKey] = dataKey;
                }
                D.increaseIndentation();
                D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Entering recursion', 4);
                const result = this.sortAndMatch(queryValue, data[dataKey]);
                D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Exit recursion', 4);
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

    private evaluatePredicates(predicates: any[][]): boolean {
        // TODO: if we have only constant predicates it might go terribly wrong.
        for (const predicate of predicates) {
            D.clogNoID(Colors.BLUE, 'PRED', '', 'Evaluating predicate `' + predicate[0] + '\'.', 4);
            const predName = predicate[0];
            for (let i = 1; i < predicate.length; ++i) {
                D.clogNoID(Colors.BLUE, 'ARGS', '  ', 'Arguments set (' + i + '): [' + predicate[i] + '].', 4);
                let debugString: string = '';
                const argss: string[][] = [];
                for (const bindSet of this.currBinds) {
                    const args: string[] = []
                    for (const param of predicate[i]) {
                        if (isPlaceholder(param) && bindSet.hasOwnProperty(param)) {
                            args.push(bindSet[param])
                        } else {
                            args.push(param);
                        }
                    }
                    argss.push(args);
                    if (debugString.charAt(debugString.length - 1) === ']') {
                        debugString += ', '
                    }
                    debugString += '[' + args.toString() + ']';
                }
                D.clogNoID(Colors.BLUE, 'ARGS', '  ', 'Instantiated parameters for set (' + i + '): [' + debugString + '].', 4);
                const res: boolean[] = executeSpecialPredicate(predName, argss);
                D.clogNoID(Colors.YELLOW, 'FILTER', '  ', 'Result: [' + res + '].', 4);
                for (let j = 0; j < res.length; ++j) {
                    if (!res[j]) {
                        D.clogNoID(Colors.YELLOW, 'SBIND', '   ', 'Remove set of bind ' + j + '.', 4);
                        delete this.currBinds[j];
                    }
                }
                if (this.filterAndReturn(0)) {
                    D.clogNoID(Colors.GREEN, 'OK', '  ', 'There are still ' + this.currBinds.length + ' sets of bind.', 4);
                } else {
                    return false;
                }
            }
        }
        return true;
    }

    //    { _data: {... }, _meta: {... }, _func: { k : '&...'  } _args:
    // func:[
    //[&f, [x1,x2], [...], []],
    //[&foo, [],[]...]

    // _func: [foo, [x1, x2], [..], [...], bar, [[.....],[...]]]

    //&isGreater: [$x, 3] }
    // &function(...){...} : [p1, p2]

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
            if (k === '_predicates') {
                continue;
            }
            if (isAtom(k) && k) {
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
