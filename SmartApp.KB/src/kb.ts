import { security } from './config';
import { checkRules } from './inferenceStub';
import * as matcher from './matcher';

type SubCallback = (r: object[]) => any;
const TOKEN = security.token;

export const databaseFact = new Map<number, object>();
export const databaseRule = new Map<number, object>();
const subscriptions = new Map<object, SubCallback[]>();

const registered = new Array();

export const tagMap = new Map<string, string>(); // map <tag, description>
export const docMap = new Map<string, string>(); // map <tag, documentation>

registered.push('inference');

let uniqueFactId = 0;
let uniqueRuleId = 0;

export class Response {
    success: boolean;
    details: any;     // se success=false, spiego l'errore. Altrimenti restituisco l'eventuale risultato (es:idSource)

    constructor(success: boolean, details: any) {
        this.success = success;
        this.details = details;
    }
}

// tslint:disable-next-line:max-classes-per-file
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
    const keys = Object.keys(tags);
    const errors: string[] = [];
    console.log('registering ', tags);

    for (const tag of keys) {
        console.log('tagmap:', tagMap);
        if (tagMap.has(tag)) {
            errors.push(tag);
        }
    }

    if (errors.length > 0) {
        return new Response(false, errors);
    }

    for (const tag of keys) {
        tagMap.set(tag, tags[tag]);
    }
    const newid = 'proto' + (registered.length + 1).toString();
    registered.push(newid);
    return new Response(true, newid);
}

export function registerTagDocumentation(tags: any) {
    const keys = Object.keys(tags);
    const res: string[] = [];
    for (const k of keys) {
        if (tagMap.has(k)) {
            docMap.set(k, tags[k]);
            res.push(k);
        }
    }
    if (!res.length) {
        return new Response(false, []);
    }
    return new Response(true, res);
}

export function getTagDoc(tags: string[]) {
    const res: any = {};
    let found: boolean = false;
    tags.forEach((tag) => {
        if (docMap.has(tag)) {
            res[tag] = docMap.get(tag);
            found = true;
        }
    });
    if (!found) {
        return new Response(false, {});
    }
    return new Response(true, res);
}

// tslint:disable-next-line:max-line-length
export function addFact(idSource: string, tag: string, TTL: number, reliability: number, jsonFact: object) {
    console.log('idsource', idSource);
    if (!(registered.includes(idSource))) { return new Response(false, 'Client ' + idSource + ' not registered'); }
    const metadata = new Metadata(idSource, tag, Date.now(), TTL, reliability);
    const currentFactId = uniqueFactId_gen();
    const dataobject = {
        _data: jsonFact,
        _id: currentFactId,
        _meta: metadata,
    };
    if (!tagMap.has(tag)) {
        return new Response(false, tag);
    }
    databaseFact.set(dataobject._id, dataobject);
    checkSubscriptions(dataobject);
    checkRules(jsonFact);
    return new Response(true, currentFactId);
}

// tslint:disable-next-line:max-line-length
export function updateFactByID(idSource: string, id: number, tag: string, TTL: number, reliability: number, jsonFact: object) {
    if (!registered.includes(idSource)) { return new Response(false, 'Client ' + idSource + ' not registered.'); }
    if (!databaseFact.has(id)) {
        return new Response(false, id);
    }

    const metadata = new Metadata(idSource, tag, Date.now(), TTL, reliability);
    const dataobject = {
        _data: jsonFact,
        _id: id,
        _meta: metadata,
    };
    databaseFact.set(id, dataobject);
    return new Response(true, id);
}

export function queryFact(jreq: object) {
    return new Response(true, matcher.findMatchesAll(jreq, Array.from(databaseFact.values())));
}

export function queryBind(jreq: object) {
    return new Response(true, matcher.findMatchesBind(jreq, Array.from(databaseFact.values())));
}

export function subscribe(idSource: string, jreq: object, callback: SubCallback) {
    if (!registered.includes(idSource)) { return new Response(false, 'Client ' + idSource + ' not registered.'); }
    if (!subscriptions.has(jreq)) {
        subscriptions.set(jreq, [callback]);
    } else {
        subscriptions.get(jreq).push(callback);
    }
    return new Response(true, 'Subscribed');
}

export function getAndSubscribe(idSource: string, jreq: object, callback: SubCallback) {
    const res = queryBind(jreq);
    const subres = subscribe(idSource, jreq, callback);
    if (!subres.success) {
        return subres;
    }
    return new Response(true, res);
}

export function removeFact(idSource: string, jreq: object) {
    if (!registered.includes(idSource)) { return new Response(false, 'Client ' + idSource + ' not registered.'); }
    const removedFactsId: number[] = [];
    const res = queryFact(jreq);
    for (const k of res.details) {
        removedFactsId.push(k._id);
        databaseFact.delete(k._id);
    }
    return new Response(true, removedFactsId);
}

export function removeFactByID(idSource: string, idFact: number) {
    if (!registered.includes(idSource)) { return new Response(false, 'Client ' + idSource + ' not registered.'); }
    databaseFact.delete(idFact);
    return new Response(true, idFact);
}

export function addRule(idSource: string, ruleTag: string, jsonRule: any) {
    // controllo se la regola è valida
    if (!jsonRule.hasOwnProperty('body') || !jsonRule.hasOwnProperty('head')) {
        return new Response(false, 'Rules must have a \'head\' and a \'body\'');
    }
    if (!registered.includes(idSource)) { return new Response(false, 'Client ' + idSource + ' not registered.'); }
    const metadata = new Metadata(idSource, ruleTag, Date.now(), 0, 0);
    const dataobject = {
        _data: jsonRule,
        _id: uniqueRuleId_gen(),
        _meta: metadata,
    };
    databaseRule.set(dataobject._id, dataobject);
    return new Response(true, dataobject._id);
}

export function removeRule(idSource: string, idRule: number) {
    if (!registered.includes(idSource)) { return new Response(false, 'Client ' + idSource + ' not registered.'); }
    if (!databaseRule.delete(idRule)) {
        return new Response(false, 'Rule ' + idRule + ' not found.');
    }
    return new Response(true, idRule);
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
