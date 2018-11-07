import * as matcher from './matcher';
import { checkRules } from './inferenceStub';

type SubCallback = (r: object[]) => any;

export const databaseFact = new Map<number, object>();
export const databaseRule = new Array();
const subscriptions = new Map<object, SubCallback[]>();
const registered = new Array();
registered.push('inference');

let uniqueid = 0;

export function register() {
    const newid = 'proto' + (register.length + 1).toString();
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
    checkRules(jsonFact);
    return true;
}

export function queryFact(jreq: object): any[] {
    // this function will return the whole object that contains a match
    const q = {
        _data: jreq,
    };
    return matcher.findMatchesAll(q, Array.from(databaseFact.values()));
}

export function queryBind(jreq: object): any[] {
    // this function will return metadata and the bounded values
    const q = {
        _data: jreq,
        _id: '$_id',
        _infoSum: '$_infoSum',
        _reliability: '$_reliability',
        _revisioning: '$_revisioning',
        _source: '$_source',
        _ttl: '$_ttl',
    };
    return matcher.findMatchesBind(q, Array.from(databaseFact.values()));
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
    const res = queryBind(jreq);
    subscribe(idSource, jreq, callback);
    return res;
}

export function removeFact(idSource: string, jreq: object): boolean {
    if (!registered.includes(idSource)) { return false; }
    const res = queryBind(jreq);
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
        _infoSum: '$_infoSum',
        _reliability: '$_reliability',
        _revisioning: '$_revisioning',
        _source: '$_source',
        _ttl: '$_ttl',
    };
    subscriptions.forEach((callbArray, k, m) => {
        q._data = k;
        const r = matcher.findMatchesBind(q, [obj]);
        if (r.length > 0) { callbArray.forEach((c) => c(r)); }
    });
}
