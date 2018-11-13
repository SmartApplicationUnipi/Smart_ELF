import { security } from './config';
import { checkRules } from './inferenceStub';
import * as matcher from './matcher';

type SubCallback = (r: object[]) => any;
const TOKEN = security.token;

export const databaseFact = new Map<number, object>();
export const databaseRule = new Map<number, object>();
const subscriptions = new Map<object, SubCallback[]>();
const registered = new Array();
registered.push('inference');

let uniqueFactId = 0;
let uniqueRuleId = 0;

class Metadata {
    public idSource: string;
    public info: string;
    public timestamp: number;
    public TTL: number;
    public reliability: number;

    constructor(idSource: string, info: string, timestamp: number, TTL: number, reliability: number) {
        this.idSource = idSource;
        this.info = info;
        this.timestamp = timestamp;
        this.TTL = TTL;
        this.reliability = reliability;
    }
}

export function register(token: string): string {
    if (token === TOKEN) {
        const newid = 'proto' + (registered.length + 1).toString();
        registered.push(newid);
        return newid;
    }
    return '';
}

// tslint:disable-next-line:max-line-length
export function addFact(idSource: string, infoSum: string, TTL: number, reliability: number, jsonFact: object): boolean {
    if (!registered.includes(idSource)) { return false; }
    const metadata = new Metadata(idSource, infoSum, Date.now(), TTL, reliability);
    const dataobject = {
        _data: jsonFact,
        _id: uniqueFactId_gen(),
        _meta: metadata,
    };
    databaseFact.set(dataobject._id, dataobject);
    checkSubscriptions(dataobject);
    checkRules(jsonFact);
    return true;
}

// tslint:disable-next-line:max-line-length
export function updateFactbyId(id: number, idSource: string, infoSum: string, TTL: number, reliability: number, jsonFact: object): boolean {
    if (!registered.includes(idSource)) { return false; }
    // TODO (forse): X può aggiornare i dati di Y o ne voglio limitare l'aggiornamento al solo Y?
    if (!databaseFact.has(id)) {
        return false;
    }

    const metadata = new Metadata(idSource, infoSum, Date.now(), TTL, reliability);
    const dataobject = {
        _data: jsonFact,
        _id: id,
        _meta: metadata,
    };
    databaseFact.set(id, dataobject);
    return true;
}

export function queryFact(idSource: string, jreq: object): any[] {
    // this function will return the whole object that contains a match
    const q = {
        _data: jreq,
    };
    return matcher.findMatchesAll(q, Array.from(databaseFact.values()));
}

export function queryBind(idSource: string, jreq: object): any[] {
    // this function will return metadata and the bounded values
    const q = {
        _data: jreq,
        _id: '$_id',
        _meta: '$_metadata',
    };
    return matcher.findMatchesBind(q, Array.from(databaseFact.values()));
}

export function subscribe(idSource: string, jreq: object, callback: SubCallback): boolean {
    if (registered.includes(idSource) === false) { return false; }
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
    const res = queryBind(idSource, jreq);
    subscribe(idSource, jreq, callback);
    return res;
}

export function removeFact(idSource: string, jreq: object): boolean {
    if (!registered.includes(idSource)) { return false; }
    const res = queryBind(idSource, jreq);
    for (const k of res) {
        databaseFact.delete(k._id);
    }
    return true;
}

export function addRule(idSource: string, ruleSum: string, jsonRule: any) {
    // controllo se la regola è valida
    if (!jsonRule.hasOwnProperty('body') || !jsonRule.hasOwnProperty('head')) { return -1; }
    if (!registered.includes(idSource)) { return -1; }
    const metadata = new Metadata(idSource, ruleSum, Date.now(), 0, 0);
    const dataobject = {
        _data: jsonRule,
        _id: uniqueRuleId_gen(),
        _meta: metadata,
    };
    databaseRule.set(dataobject._id, dataobject);
    return dataobject._id;
}

export function removeRule(idSource: string, idRule: number) {
    if (!registered.includes(idSource)) { return false; }
    databaseRule.delete(idRule);
    return true;
}

function checkSubscriptions(obj: object) {
    // this function will check if the new data inserted matches some "notification rule"
    const q = {
        _data: {},
        _id: '$_id',
        _meta: '$_metadata',
    };
    subscriptions.forEach((callbArray, k, m) => {
        q._data = k;
        const r = matcher.findMatchesBind(q, [obj]);
        if (r.length > 0) { callbArray.forEach((c) => c(r)); }
    });
}

function uniqueFactId_gen() {
    uniqueFactId++;
    return uniqueFactId;
}

function uniqueRuleId_gen() {
    uniqueRuleId++;
    return uniqueRuleId;
}
