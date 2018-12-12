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

export function findOnlyBinds(query: object, dataset: object[], initBind: object[] = []): object[] {
    const m = findMatches(query, dataset, initBind);
    let result: object[] = [];
    for (const v of m.values()) {
        result = result.concat(v);
    }
    return result;
}

// per ogni oggetto ho dei bind iniziali diversi
export function findMatches2(query: object, dataset: object[], initBinds: object[][]): Matches {
    const matches = new Map<object, object[]>();
    let m;
    for (let i = 0; i < initBinds.length && i < dataset.length; i++) {
        m = findMatches(query, [dataset[i]], initBinds[i]);
        if (m.size > 0) { matches.set(dataset[i], m.get(dataset[i])); }
    }
    return matches;
}

export function findCompatibleRules(query: object, ruleSet: object[] ): { [index: string]: any }[] {
    const matcher = new Matcher();
    return matcher.compareRules(query, ruleSet);
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

    private ID_AA = 0;
    private ID_AO = 1;
    private ID_AP = 2;
    private ID_PA = 3;
    private ID_PO = 4;
    private ID_PP = 5;
    private BINDS_CAT = 6;

    private outerQuery: object;
    private outerSorted: SortMap;
    private initBinds: { [index: string]: any }[];

    private currBinds: { [index: string]: any }[];

    private functions: { [index: string]: string[] }[] = [];

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
                D.resetIndentation();
                D.clogNoID(Colors.GREEN, 'RESULT', '', 'Match success!', 4);
                if (q.hasOwnProperty('_predicates')) {
                    D.clogNoID(Colors.BLUE, 'INFO', '', 'Some predicates to check!', 5);
                    if (!this.evaluatePredicates(q._predicates)) {
                        D.clogNoID(Colors.RED, 'RESULT', '', 'Predicate check failed! Match failed!', 4);
                        continue;
                    }
                }
                matches.set(data, [...this.currBinds]);
            } else {
                D.resetIndentation();
                D.clogNoID(Colors.RED, 'RESULT', '', 'Match failed!', 4);
            }
        }
        return matches;
    }

    public compareRules(q: { [index: string]: any }, ruleSet: { [index: string]: any }[] ): { [index: string]: any }[] {
        this.outerQuery = q;
        this.outerSorted = this.sort(q);
        const result = [];
        for (const rule of ruleSet) {
            const sortedRule = this.sort(rule._head);
            if (this.compareRule(q, this.outerSorted, rule._head, sortedRule)) {
                result.push(rule);
            }

        }
        return result;
    }

    private sortAndMatch(query: any, data: object): boolean {
        const sorted = this.sort(query);
        return this.matchBind(query, sorted, data);
    }

    private compareRule(query: object, sortedQeury: SortMap, rule: object, sortedRule: SortMap): boolean {
        for (let i = 0; i < this.BINDS_CAT; ++i) {
            switch (i) {
                case this.ID_AA: {
                    if (!this.compareAtomAtom(query, sortedQeury, rule, sortedRule)) {
                        return false;
                    }
                    break;
                }
                case this.ID_AO: {
                    if (!this.compareAtomObject(query, sortedQeury, rule, sortedRule)) {
                        return false;
                    }
                    break;
                }
                case this.ID_AP: {
                    if (!this.compareAtomPlaceholder(query, sortedQeury, rule, sortedRule)) {
                        return false;
                    }
                    break;
                }
                case this.ID_PA: {
                    if (!this.comparePlaceholderAtom(query, sortedQeury, rule, sortedRule)) {
                        return false;
                    }
                    break;
                }
                case this.ID_PO: {
                    if (!this.comparePlaceholderObject(query, sortedQeury, rule, sortedRule)) {
                        return false;
                    }
                    break;
                }
                case this.ID_PP: {
                    break;
                }
            }
        }
        return true;
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

    private compareAtomAtom(query: { [index: string]: any }, sortedQuery: SortMap, rule: { [index: string]: any }, sortedRule: SortMap): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_AA, '', 'Enter case compare Atom : Atom', 5);
        for (const queryKey of sortedQuery.get(this.ID_AA)) {
            D.clog(Colors.BLUE, 'KEY', this.ID_AA, '', 'key => ' + queryKey, 4);
            D.clog(Colors.BLUE, 'KEY', this.ID_AA, '', 'value => ' + query[queryKey], 4);
            if (rule.hasOwnProperty(queryKey)) {
                if (query[queryKey] === rule[queryKey]) {
                    D.clog(Colors.GREEN, 'OK', this.ID_AA, '', 'Rule has the same pair key value', 3);
                    continue;
                }
                if (isPlaceholder(rule[queryKey])) {
                    D.clog(Colors.GREEN, 'OK', this.ID_AA, '', 'Rule has the same key associated to a placeholder', 3);
                    continue;
                }
            }

            const checkPA = () => {
                // inner function to move continue int he external loop
                for (const ruleKey of sortedRule.get(this.ID_PA)) {
                    if (rule[ruleKey] === query[queryKey]) {
                        return true;
                    }
                }
                return false;
            };

            if (checkPA()) {
                D.clog(Colors.GREEN, 'OK', this.ID_AA, '', 'Rule has the same value associated to a placeholder', 3);
                continue;
            }

            if (sortedRule.get(this.ID_PP).length > 0) {
                D.clog(Colors.GREEN, 'OK', this.ID_AA, '', 'Rule has a placeholder placehoder pair', 3);
                continue;
            }
            D.clog(Colors.RED, 'FAIL', this.ID_AA, '', 'Found nothing compatible', 3);
            D.clog(Colors.RED, 'INFO', this.ID_AA, '', 'Exit case compare Atom : Atom', 5);
            return false;
        }
        D.clog(Colors.GREEN, 'INFO', this.ID_AA, '', 'Exit case compare Atom : Atom', 5);
        return true;
    }

    private compareAtomObject(_query: { [index: string]: any }, sortedQuery: SortMap, rule: { [index: string]: any }, sortedRule: SortMap): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_AO, '', 'Enter case compare Atom : Object', 5);
        for (const queryKey of sortedQuery.get(this.ID_AO)) {
            D.clog(Colors.BLUE, 'KEY', this.ID_AO, '', 'key => ' + queryKey, 4);
            D.clog(Colors.BLUE, 'KEY', this.ID_AO, '', 'value => some object...', 4);
            if (rule.hasOwnProperty(queryKey)) {
                if (isObject(rule[queryKey])) {
                    D.clog(Colors.YELLOW, 'OK', this.ID_AO, '', '(TOO MUCH RELAXED) Rule has an object associated to the key', 3);
                    continue; // TODO: too much relaxed
                } else if (isPlaceholder(rule[queryKey])) {
                    D.clog(Colors.YELLOW, 'OK', this.ID_AO, '', 'Rule has a placeholder associated to the key', 3);
                    continue; // TODO: too much relaxed
                } else {
                    D.clog(Colors.RED, 'FAIL', this.ID_AO, '', 'In the rule the key `' + queryKey + '\' is associated to an atom', 3);
                    D.clog(Colors.BLUE, 'INFO', this.ID_AO, '', 'Exit case compare Atom : Object', 5);
                    return false;
                }
            }
            if (sortedRule.get(this.ID_PO).length > 0
                || sortedRule.get(this.ID_PP).length > 0) {
                D.clog(Colors.GREEN, 'OK', this.ID_AO, '', 'Rule has a placeholder associated to an object or to another placeholder', 3);
                continue;
            }
            D.clog(Colors.RED, 'FAIL', this.ID_AO, '', 'Found nothing compatible', 3);
            D.clog(Colors.RED, 'INFO', this.ID_AO, '', 'Exit case compare Atom : Object', 5);
            return false;
        }
        D.clog(Colors.GREEN, 'INFO', this.ID_AO, '', 'Exit case compare Atom : Object', 5);
        return true;
    }

    private compareAtomPlaceholder(query: { [index: string]: any }, sortedQuery: SortMap, rule: { [index: string]: any }, sortedRule: SortMap): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_AP, '', 'Enter case compare Atom : Placeholder', 5);
        for (const queryKey of sortedQuery.get(this.ID_AP)) {
            D.clog(Colors.BLUE, 'KEY', this.ID_AP, '', 'key => ' + queryKey, 4);
            D.clog(Colors.BLUE, 'KEY', this.ID_AP, '', 'value => ' + query[queryKey], 4);
            if (rule.hasOwnProperty(queryKey)) {
                D.clog(Colors.GREEN, 'OK', this.ID_AP, '', 'Rule has the same key associated to something (don\'t care what)', 3);
                continue;
            }
            if (sortedRule.get(this.ID_PA).length > 0
                || sortedRule.get(this.ID_PO).length > 0
                || sortedRule.get(this.ID_PP).length > 0) {
                D.clog(Colors.GREEN, 'OK', this.ID_AP, '', 'Rule has a relaxed compatibility (P:A, P:O or P:P)', 3);
                continue;
            }
            D.clog(Colors.RED, 'FAIL', this.ID_AP, '', 'Found nothing compatible', 3);
            D.clog(Colors.RED, 'INFO', this.ID_AP, '', 'Exit case compare Atom : Placeholder', 5);
            return false;
        }
        D.clog(Colors.GREEN, 'INFO', this.ID_AP, '', 'Exit case compare Atom : Placeholder', 5);
        return true;
    }

    private comparePlaceholderAtom(query: { [index: string]: any }, sortedQuery: SortMap, rule: { [index: string]: any }, sortedRule: SortMap): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_PA, '', 'Enter case compare Placeholder : Atom', 5);
        for (const queryKey of sortedQuery.get(this.ID_PA)) {
            D.clog(Colors.BLUE, 'KEY', this.ID_PA, '', 'key => ' + queryKey, 4);
            D.clog(Colors.BLUE, 'KEY', this.ID_PA, '', 'value => ' + query[queryKey], 4);
            const innerAA = () => {
                for (const ruleKey of sortedRule.get(this.ID_AA)) {
                    if (query[queryKey] === rule[ruleKey]) {
                        D.clog(Colors.GREEN, 'OK', this.ID_PA, '', 'Rule has the compatible pair `' + ruleKey + ', '
                            + rule[ruleKey] + '\'.', 3);
                        return true;
                    }
                }
                return false;
            };
            const innerPA = () => {
                for (const ruleKey of sortedRule.get(this.ID_PA)) {
                    if (query[queryKey] === rule[ruleKey]) {
                        D.clog(Colors.GREEN, 'OK', this.ID_PA, '', 'Rule has the compatible pair `' + ruleKey + ', '
                            + rule[ruleKey] + '\'.', 3);
                        return true;;
                    }
                }
                return false;
            };
            if (innerAA()) {
                continue;
            }
            if (innerPA()) {
                continue;
            }
            if (sortedRule.get(this.ID_PP).length > 0) {
                D.clog(Colors.GREEN, 'OK', this.ID_PA, '', 'Rule has a placeholder placehoder pair', 3);
                continue;
            }
            D.clog(Colors.RED, 'FAIL', this.ID_PA, '', 'Found nothing compatible', 3);
            D.clog(Colors.RED, 'INFO', this.ID_PA, '', 'Exit case compare Placeholder : Atom', 5);
            return false;

        }
        D.clog(Colors.GREEN, 'INFO', this.ID_PA, '', 'Exit case compare Placeholder : Atom', 5);
        return true;
    }

    private comparePlaceholderObject(_query: { [index: string]: any }, sortedQuery: SortMap, _rule: { [index: string]: any }, sortedRule: SortMap): boolean {
        D.clog(Colors.BLUE, 'INFO', this.ID_PO, '', 'Enter case compare Placeholder : Object', 5);
        for (const queryKey of sortedQuery.get(this.ID_PO)) {
            D.clog(Colors.BLUE, 'KEY', this.ID_PO, '', 'key => ' + queryKey, 4);
            D.clog(Colors.BLUE, 'KEY', this.ID_PO, '', 'value => some object...', 4);
            if (sortedRule.get(this.ID_AO).length > 0
                || sortedRule.get(this.ID_AP).length > 0
                || sortedRule.get(this.ID_PO).length > 0
                || sortedRule.get(this.ID_PP).length > 0) {
                D.clog(Colors.YELLOW, 'OK', this.ID_PO, '', '(TOO MUCH RELAXED) Rule has a relaxed compatibility (A:O, A:P, P:O or P:P)', 3);
                continue;
                // TODO: too much relaxed
            }
            D.clog(Colors.RED, 'FAIL', this.ID_PO, '', 'Found nothing compatible', 3);
            D.clog(Colors.RED, 'INFO', this.ID_PO, '', 'Exit case compare Placeholder : Object', 5);
            return false;
        }
        D.clog(Colors.GREEN, 'INFO', this.ID_PO, '', 'Exit case compare Placeholder : Object', 5);
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
