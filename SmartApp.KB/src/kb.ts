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

//TAGS
const userTags = new Map<string, Map<string, TagInfo> >();

let idSource = 0;
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
    public creationTime: Date;

    constructor(idSource: string, tag: string, creationTime: Date, TTL: number, reliability: number) {
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

export function getAllTags() {
    const allTags : any = {};
    for (const [user, tags] of userTags.entries()) {
        var tagsArray: any = {};
        for (const [tag, tagInfo] of tags.entries()) {
            tagsArray[tag] = tagInfo;
        }
        allTags[user] = tagsArray;
    }
    return new Response(true, allTags);
}

export function register() {
    var id = "id"+idSource++;
    userTags.set(id, new Map<string, TagInfo>());
    return new Response(true, id);
}

// tagsList = [ { nome_tag : {desc: , doc: } } ]
export function registerTags(idSource: string, tagsList: any): Response { // tagsList is a map tag_i : tag_desc_i
    if (!userTags.has(idSource)) { return new Response(false, {}) };

    const tags = Object.keys(tagsList);
    const map = userTags.get(idSource);
    const result : string[] = []
    for (const tag of tags) {
        map.set(tag, tagsList[tag]);
        result.push(tag);
    }
    return new Response(true, result);
}

export function getTagDetails(idSource: string, tags : string[]) {
    if (!userTags.has(idSource)) { return new Response(false, {}) };

    const result: any = {};
    let map = userTags.get(idSource);
    tags.forEach(tag => {
        if (map.has(tag)) {
            result[tag] = map.get(tag);
        }
    });
    if (Object.keys(result).length == 0) {
        return new Response(false, {})
    }
    return new Response(true, result);
}

// tslint:disable-next-line:max-line-length
export function addFact(idSource: string, tag: string, TTL: number, reliability: number, jsonFact: object) {
    if (!(userTags.has(idSource))) { return new Response(false, {}); }
    if (!(userTags.get(idSource).has(tag))) { return new Response(false, tag); }

    const metadata = new Metadata(idSource, tag, new Date(Date.now()), TTL, reliability);
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
    if (!(userTags.has(idSource))) { return new Response(false, idSource); }
    if (!databaseFact.has(id)) { return new Response(false, id); }
    const metadata = new Metadata(idSource, tag, new Date(Date.now()), TTL, reliability);

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
    const metadata = new Metadata(idSource, ruleTag, new Date(Date.now()), 0, 0);
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
