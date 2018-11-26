import { security } from './config';
import { Debugger } from './debugger';
import { checkRules } from './inferenceStub';
import * as matcher from './matcher';

const debug = new Debugger();

type SubCallback = (r: any) => any;
const TOKEN = security.token;

export type DatabaseFact = Map<number, DataObject>;
export type DatabaseRule = Map<number, DataObject>;

export const databaseFact = new Map<number, DataObject>();
export const databaseRule = new Map<number, DataObject>();
const subscriptions = new Map<object, SubCallback[]>();

export const tagDetails = new Map<string, TagInfo>(); // map <tag, {desc, documentation}>
export const moduleTags = new Map<string, string[]>(); // map<idSource, tags> // useless?

let uniqueFactId = 0; // move in server part
let uniqueRuleId = 0; // move in server part

export class Response {
    public success: boolean;
    public details: any;
    // if success === false, report a message to explain the error. Else we return the result e.g.:idSource

    constructor(success: boolean, details: any) {
        this.success = success;
        this.details = details;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Metadata {
    public idSource: string;
    public tag: string;
    public TTL: number;
    public reliability: number;
    public creationTime: string;

    constructor(idSource: string, tag: string, creationTime: string, TTL: number, reliability: number) {
        this.idSource = idSource;
        this.tag = tag;
        this.creationTime = creationTime;
        this.TTL = TTL;
        this.reliability = reliability;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class DataObject {
    public _id: number;
    public _meta: Metadata;
    public _data: object;

    constructor(id: number, metadata: Metadata, data: object) {
        this._id = id;
        this._meta = metadata;
        this._data = data;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class DataRule {
    public _body: object[];
    public _head: object;

    constructor(head: object, body: object[]) {
        this._body = body;
        this._head = head;
    }
}

// tslint:disable-next-line:max-classes-per-file
export class TagInfo {
    public desc: string;
    public doc: string;

    constructor(description: string, documentation: string) {
        this.desc = description;
        this.doc = documentation;
    }
}

// tagsList = [ { nome_tag : {desc: , doc: } } ]
export function registerTags(tagsList: any): Response { // tagsList is a map tag_i : tag_desc_i
    const tags = Object.keys(tagsList);
    const errors: string[] = [];

    // check uniqueness of tags
    for (const tag of tags) {
        if (tagDetails.has(tag)) { errors.push(tag); }
    }

    if (errors.length > 0) {
        return new Response(false, errors);
    }

    for (const tag of tags) { // populate the map tag_i : desc_tagi
        tagDetails.set(tag, tagsList[tag]);
    }

    return new Response(true, {});
}

registerTags({ INFERENCE: new TagInfo('inference', 'inference fact added by the inference engine stub') });

export function getTagDetails(tags: string[]) {
    const res: any = {};
    let found: boolean = false;
    tags.forEach((tag) => {
        if (tagDetails.has(tag)) {
            res[tag] = tagDetails.get(tag);
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
    // aggiungi controllo documentazione presente tag
    if (!(tagDetails.has(tag))) { return new Response(false, tag); }

    const metadata = new Metadata(idSource, tag, new Date(Date.now()).toLocaleDateString('en-GB'), TTL, reliability);
    const currentFactId = uniqueFactId_gen();
    const dataobject = {
        _data: jsonFact,
        _id: currentFactId,
        _meta: metadata,
    };
    databaseFact.set(dataobject._id, dataobject);
    checkSubscriptions(dataobject);
    checkRules(jsonFact);
    return new Response(true, currentFactId);
}

// tslint:disable-next-line:max-line-length
export function updateFactByID(id: number, idSource: string, tag: string, TTL: number, reliability: number, jsonFact: object) {
    if (!(tagDetails.has(tag))) { return new Response(false, tag); }

    if (!databaseFact.has(id)) { return new Response(false, id); }
    const metadata = new Metadata(idSource, tag, new Date(Date.now()).toLocaleDateString('en-GB'), TTL, reliability);

    const dataobject = {
        _data: jsonFact,
        _id: id,
        _meta: metadata,
    };
    databaseFact.set(id, dataobject);
    return new Response(true, id);
}

export function query(jreq: any) {
    const queryobj: any = {};

    if (jreq.hasOwnProperty('_id')) { queryobj._id = jreq._id; delete jreq._id; }

    if (jreq.hasOwnProperty('_meta')) { queryobj._meta = jreq._meta;  delete jreq._meta; }

    if (jreq.hasOwnProperty('_data')) {
        queryobj._data = jreq._data;
    } else {
        if (Object.keys(jreq).length > 0) {queryobj._data = jreq; }
    }

    const m = matcher.findMatches(queryobj, Array.from(databaseFact.values()));

    if (m.size === 0) { return new Response(false, {});
    } else { return new Response(true, m); }
}

export function subscribe(idSource: string, jreq: object, callback: SubCallback) {
    if (!subscriptions.has(jreq)) { subscriptions.set(jreq, [callback]);
    } else { subscriptions.get(jreq).push(callback); }
    return new Response(true, 'Subscribed');
}

export function removeFact(idSource: string, jreq: object) {
    const removedFactsId: number[] = [];
    const res = query(jreq);
    if (res.success) {
        const resmap = res.details as Map<any, object[]>;
        for (const k of resmap.keys()) {
            removedFactsId.push(k._id);
            databaseFact.delete(k._id);
        }
        return new Response(true, removedFactsId);
    } else { return new Response(false, 'no matching facts'); }
}

export function addRule(idSource: string, ruleTag: string, jsonRule: DataRule) {
    // controllo se la regola è valida
    // if (!jsonRule.hasOwnProperty('body') || !jsonRule.hasOwnProperty('head')) {
    //     return new Response(false, 'Rules must have a \'head\' and a \'body\'');
    // }
    const metadata = new Metadata(idSource, ruleTag, new Date(Date.now()).toLocaleDateString('en-GB'), 0, 0);
    const dataobject = {
        _data: jsonRule,
        _id: uniqueRuleId_gen(),
        _meta: metadata,
    };
    databaseRule.set(dataobject._id, dataobject);
    return new Response(true, dataobject._id);
}

export function removeRule(idSource: string, idRule: number) {
    if (!databaseRule.delete(idRule)) {
        return new Response(false, idRule);
    }
    return new Response(true, idRule);
}

function checkSubscriptions(obj: object) { // object is the created fact
    // this function will check if the new data inserted matches some "notification rule"

    subscriptions.forEach((callbArray, k, m) => {
        const r = matcher.findMatches(k, [obj]);
        if (r.size > 0) { callbArray.forEach((c) => c(r)); }
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
