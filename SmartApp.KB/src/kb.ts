import * as matcher from './matcher';

type SubCallback = (r: object[]) => any;

const databaseFact = new Map<number, object>();
const databaseRule = new Array();
const subscriptions = new Map<object, SubCallback[]>();
const registered = new Array();

let uniqueid = 0;

export function register() {
    const newid = (register.length + 1).toString();
    registered.push(newid);
    return newid;
}

// tslint:disable-next-line:max-line-length
export function addFact(idSource: string, infoSum: string, TTL: number, reliability: number, revisioning: boolean, jsonFact: object): boolean {
    if (!registered.includes(idSource)) { return false; }
    const dataobject = {
        _data: jsonFact,
        _id: uniqueid_gen(),
        _infoSum: infoSum,
        _reliability: reliability,
        _revisioning: revisioning,
        _source: idSource,
        _ttl: TTL,
    };
    databaseFact.set(dataobject._id, dataobject);
    checkSubscriptions(dataobject);
    return true;
}

export function query(jreq: object): any[] {
    // const q = {
    //     _data: jreq,
    // };
    // // TODO: if we add the following key we will return also the "internal data".
    //  We need to decide how to handle this
    //  we could allow user to specify as parameters of the query function the internal data to match,
    //  leading to a query function with a signature similar to addFact
    //  or we can let them filter by internal data or agree with other modules on specific tags :\

    const q = {
        _data: jreq,
        _id: '$_id',
        _infoSum: '$_infos',
        _reliability: '$_reli',
        _revisioning: '$_revi',
        _source: '$_src',
        _ttl: '$_ttl',
    };
    return matcher.findMatches(q, Array.from(databaseFact.values()));
}

export function subscribe(idSource: string, jreq: object, callback: SubCallback): boolean {
    if (!registered.includes(idSource)) { return false; }
    // the idea is that this will be the original signature. Will then wrap this into the communication protocol
    if (!subscriptions.has(jreq)) {
        subscriptions.set(jreq, [callback]);
    } else {
        subscriptions.get(jreq).push(callback);
    }
    return true;
}

export function getAndSubscribe(idSource: string, jreq: object, callback: SubCallback ) {
    // if (!registered.includes(idSource)) { return false; }
    const res = query(jreq);
    subscribe(idSource, jreq, callback);
    return res;
}

export function removeFact(idSource: string, jreq: object): boolean {
    if (!registered.includes(idSource)) { return false; }
    const res = query(jreq);
    for (const k of res) {
        databaseFact.delete(k.$_id);
    }
    return true;
}

// TODO: implement these functions!
// function addRule(idSource:string, ruleSum:string, jsonRule) {}
// function removeRule(jreq: object) {}

function uniqueid_gen() {
    uniqueid++;
    return uniqueid;
}

function checkSubscriptions(obj: object) {
    // this function will check if the new data inserted matches some "notification rule"
    const q = {
        _data: {},
        _id: '$_id',
        _infoSum: '$_infos',
        _reliability: '$_reli',
        _revisioning: '$_revi',
        _source: '$_src',
        _ttl: '$_ttl',
    };
    subscriptions.forEach((callbArray, k, m) => {
        q._data = k;
        const r = matcher.findMatches(q, [obj]);
        if (r.length > 0) { callbArray.forEach((c) => c(r)); }
    });
}
