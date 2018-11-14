import { checkRules } from './inferenceStub';
import * as matcher from './matcher';

type SubCallback = (r: object[]) => any;

export const databaseFact = new Map<number, object>();
export const databaseRule = new Map<number, object>();
const subscriptions = new Map<object, SubCallback[]>();

const registered = new Array();

export const tagList = new Map<string, string>(); //map <tag, description>
export const docList = new Map<string, string>(); //map <tag, documentation>

registered.push('inference');

let uniqueFactId = 0;
let uniqueRuleId = 0;

class Metadata {
    idSource: string;
    tag: string;
    TTL: number;
    reliability: number;
    timestamp: number;

    constructor(idSource: string, tag: string, timestamp: number, TTL: number, reliability: number) {
        this.idSource = idSource;
        this.tag = tag;
        this.timestamp = timestamp;
        this.TTL = TTL;
        this.reliability = reliability;
    }
}

export function register(tags: any) {
    const newid = 'proto' + (registered.length + 1).toString();
    var keys = Object.keys(tags);
    for (const k of keys) {
        if (tagList.has(k))
            //ragionare su come restituire l'errore. Oggetto con campi {'result': 'fail', 'details': 'tag "emo" already present'}?
            return '';
    }
    for (const k of keys) {
        tagList.set(k, tags[k]);
    }
    registered.push(newid);
    return newid;
}

export function registerTagDocumentation(tags: any) {
    var keys = Object.keys(tags);
    for (const k of keys) {
        if (docList.has(k)) {
            docList.set(k, tags[k]);
        }
    }
}

// tslint:disable-next-line:max-line-length
export function addFact(idSource: string, tag: string, TTL: number, reliability: number, jsonFact: object): number {
    if (!registered.includes(idSource)) { return -1; }
    const metadata = new Metadata(idSource, tag, Date.now(), TTL, reliability);
    const currentFactId = uniqueFactId_gen();
    const dataobject = {
        _id: currentFactId,
        _data: jsonFact,
        _meta: metadata,
    };
    if (!tagList.has(tag)) {
        return -1;
    }
    databaseFact.set(dataobject._id, dataobject);
    checkSubscriptions(dataobject);
    checkRules(jsonFact);
    return currentFactId;
}

export function updateFactbyId(id: number, idSource: string, tag: string, TTL: number, reliability: number, jsonFact: object): number {
    if (!registered.includes(idSource)) { return -1; }
    //TODO (forse): X può aggiornare i dati di Y o ne voglio limitare l'aggiornamento al solo Y? 
    if (!databaseFact.has(id)) {
        return -1;
    }

    const metadata = new Metadata(idSource, tag, Date.now(), TTL, reliability);
    const dataobject = {
        _id: id,
        _data: jsonFact,
        _meta: metadata,
    };
    databaseFact.set(id, dataobject)
    return id;
}

export function queryFact(jreq: object): any[] {
    // this function will return the whole object that contains a match
    // const q = {
    //     _data: jreq,
    // };
    return matcher.findMatchesAll(jreq, Array.from(databaseFact.values()));
}

export function queryBind(jreq: object): any[] {
    // this function will return metadata and the bounded values
    // const q = {
    //     _id: '$_id',
    //     _data: jreq,
    //     _meta: '$_metadata',
    // };
    return matcher.findMatchesBind(jreq, Array.from(databaseFact.values()));
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

export function getAndSubscribe(idSource: string, jreq: object, callback: SubCallback) {
    // if (!registered.includes(idSource)) { return false; }
    const res = queryBind(jreq);
    subscribe(idSource, jreq, callback);
    return res;
}

export function removeFact(idSource: string, jreq: object): number[] {
    if (!registered.includes(idSource)) { // PLEASE REWRITE THIS IF
        const err: number[] = [];
        err.push(-1);
        return err;
    }
    const removedFactsId: number[] = [];
    const res = queryBind(jreq);
    for (const k of res) {
        removedFactsId.push(k._id);
        databaseFact.delete(k._id);
    }
    return removedFactsId;
}

export function removeFactById(idSource: string, idFact: number): number {
    if (!registered.includes(idSource)) { return -1; }
    databaseFact.delete(idFact);
    return idFact;
}

export function addRule(idSource: string, ruleTag: string, jsonRule: any) {
    // controllo se la regola è valida
    if (!jsonRule.hasOwnProperty('body') || !jsonRule.hasOwnProperty('head')) { return -1; }
    if (!registered.includes(idSource)) { return -1; }
    const metadata = new Metadata(idSource, ruleTag, Date.now(), 0, 0);
    const dataobject = {
        _id: uniqueRuleId_gen(),
        _data: jsonRule,
        _meta: metadata,
    };
    databaseRule.set(dataobject._id, dataobject);
    return dataobject._id;
}

export function removeRule(idSource: string, idRule: number): number {
    if (!registered.includes(idSource)) { return -1; }
    databaseRule.delete(idRule);
    return idRule;
}

function checkSubscriptions(obj: object) {
    // this function will check if the new data inserted matches some "notification rule"
    const q = {
        _data: {},
        _id: '$_id',
        _meta: '$_metadata'
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
