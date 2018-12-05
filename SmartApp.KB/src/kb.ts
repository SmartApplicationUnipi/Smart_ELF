import { readFileSync, writeFile } from 'fs';
import { transformRule } from './compiler';
import { security } from './config';
import { Debugger } from './debugger';
import { checkRules, queryRules } from './inferenceStub';
import { Logger } from './logger';
import * as matcher from './matcher';

const debug = new Debugger();
const log = Logger.getInstance();

type SubCallback = (r: any) => any;
const TOKEN = security.token;

export type DatabaseFact = Map<number, DataObject>;
export type DatabaseRule = Map<number, DataObject>;

export let databaseFact = new Map<number, DataObject>();
export const databaseInference = new Map<number, DataObject>(); // TODO: remove this asap
export let databaseRule = new Map<number, DataObject>();
let subscriptions = new Map<object, SubCallback[]>();
let userTags = new Map<string, Map<string, TagInfo>>();
let baseIdSource = 0;
let uniqueFactId = 0;
let uniqueRuleId = 0;

const DATABASEFACTPATH = './db/databaseFact';
const DATABASERULEPATH = './db/databaseRule';
const SUBSCRIPTIONSPATH = './db/subscriptions';
const USERTAGSPATH = './db/userTags';
const UNIQUEFACTIDPATH = './db/uniqueFactId';
const UNIQUERULEIDPATH = './db/uniqueRuleId';

// TODO: this has to be a nice init fuction
let file = readFileSync(DATABASEFACTPATH, 'utf8');
databaseFact = new Map(JSON.parse(file));

file = readFileSync(DATABASERULEPATH, 'utf8');
databaseRule = new Map(JSON.parse(file));

file = readFileSync('./db/subscriptions', 'utf8');
subscriptions = new Map(JSON.parse(file));

file = readFileSync(USERTAGSPATH, 'utf8');
userTags = new Map(JSON.parse(file));

file = readFileSync(UNIQUEFACTIDPATH, 'utf8');
uniqueFactId = parseInt(file, 10);

file = readFileSync(UNIQUERULEIDPATH, 'utf8');
uniqueRuleId = parseInt(file, 10);

// const repetitionTime = 86400000 / 2;
const repetitionTime = 30 * 60 * 1000;
const now = new Date();
const dumpDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);
const millsToDump = dumpDate.getTime() - now.getTime();
// if (millsToDump <= 0) {
//     millsToDump += 86400000; // now it's after dumpTime, try tomorrow.
// }

function writeCallback(filename: string, err: any) {
    if (err) { log.error('KB', 'error saving ' + filename, err); } else { log.info('KB', filename + ' saved'); }
}

function dumpDatabase() {
    // tslint:disable-next-line:max-line-length
    const f1 = () => { writeFile(DATABASEFACTPATH, JSON.stringify([...databaseFact]), 'utf8', (e) => writeCallback('databaseFact', e) ); };
    // tslint:disable-next-line:max-line-length
    const f2 = () => { writeFile(DATABASERULEPATH, JSON.stringify([...databaseRule]), 'utf8', (e) => writeCallback('databaseRule', e) ); };
    // tslint:disable-next-line:max-line-length
    const f3 = () => { writeFile(SUBSCRIPTIONSPATH, JSON.stringify([...subscriptions]), 'utf8', (e) => writeCallback('subscriptions', e) ); };
    // tslint:disable-next-line:max-line-length
    const f4 = () => { writeFile(USERTAGSPATH, JSON.stringify([...userTags]), 'utf8', (e) => writeCallback('userTags', e) ); };
    const f5 = () => { writeFile(UNIQUEFACTIDPATH, uniqueFactId, 'utf8', (e) => writeCallback('uniqueFactId', e)); };
    const f6 = () => { writeFile(UNIQUERULEIDPATH, uniqueFactId, 'utf8' , (e) => writeCallback('uniqueRuleId', e)); };
    Promise.all([f1(), f2(), f3(), f4(), f5(), f6()])
    .then(() => { setTimeout(dumpDatabase, repetitionTime ); });
}

setTimeout(dumpDatabase, millsToDump);

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
export class Metadata {
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
    public _body: any[];
    public _head: any;

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

export function getAllTags(includeShortDesc: boolean) {
    const allTags: any = {};
    for (const [user, tags] of userTags.entries()) {
        const tagsArray: any = {};
        for (const [tag, tagInfo] of tags.entries()) {
            tagsArray[tag] = includeShortDesc ? tagInfo.desc : null;
        }
        allTags[user] = tagsArray;
    }
    return new Response(true, allTags);
}

export function register() {
    const id = 'id' + baseIdSource++;
    userTags.set(id, new Map<string, TagInfo>());
    return new Response(true, id);
}

// tagsList = [ { nome_tag : {desc: , doc: } } ]
export function registerTags(idSource: string, tagsList: any): Response { // tagsList is a map tag_i : tag_desc_i
    if (!userTags.has(idSource)) { return new Response(false, {}); }

    const tags = Object.keys(tagsList);
    const map = userTags.get(idSource);
    const result: string[] = [];
    for (const tag of tags) {
        map.set(tag, tagsList[tag]);
        result.push(tag);
    }
    return new Response(true, result);
}

export function getTagDetails(idSource: string, tags: string[]) {
    if (!userTags.has(idSource)) { return new Response(false, {}); }

    const result: any = {};
    const map = userTags.get(idSource);
    tags.forEach((tag) => {
        if (map.has(tag)) {
            result[tag] = map.get(tag);
        }
    });
    if (Object.keys(result).length === 0) {
        return new Response(false, {});
    }
    return new Response(true, result);
}

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
    checkRules(dataobject);
    return new Response(true, currentFactId);
}

// tslint:disable-next-line:max-line-length
export function updateFactByID(id: number, idSource: string, tag: string, TTL: number, reliability: number, jsonFact: object) {
    if (!(userTags.has(idSource))) { return new Response(false, {}); }
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

    if (jreq.hasOwnProperty('_meta')) { queryobj._meta = jreq._meta; delete jreq._meta; }

    if (jreq.hasOwnProperty('_data')) {
        queryobj._data = jreq._data;
    } else {
        if (Object.keys(jreq).length > 0) { queryobj._data = jreq; }
    }

    let m = matcher.findMatches(queryobj, Array.from(databaseFact.values()));
    const m2 = queryRules(jreq);
    m = new Map([...m, ...m2]);

    if (m.size === 0) {
        return new Response(false, {});
    } else { return new Response(true, m); }
}

export function subscribe(idSource: string, subreq: object, callback: SubCallback) {
    const jreq = normalizeObj(subreq);
    if (!subscriptions.has(jreq)) {
        subscriptions.set(jreq, [callback]);
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

export function addRule(idSource: string, ruleTag: string, jsonRule: string) {
    if (!(userTags.has(idSource))) { return new Response(false, {}); }
    const jsonObj = transformRule(jsonRule);

    const metadata = new Metadata(idSource, ruleTag, new Date(Date.now()), 0, 0);
    const dataobject = {
        _data: normalizeRule(jsonObj),
        // TODO: check this. Stiamo imponendo un formato interno di rappresentazione per le head e i body
        _id: uniqueRuleId_gen(),
        _meta: metadata,
    };

    databaseRule.set(dataobject._id, dataobject);
    return new Response(true, dataobject._id);
}

function normalizeRule(rule: any): DataRule {
    const norm: DataRule = new DataRule({}, []);

    if (rule._head.hasOwnProperty('_meta')) { norm._head._meta = rule._head._meta; delete rule._head._meta; }

    if (rule._head.hasOwnProperty('_data')) {
        norm._head._data = rule._head._data;
    } else {
        if (Object.keys(rule._head).length > 0) { norm._head._data = rule._head; }
    }
    for (const pred of rule._body) {
        const normb: any = {};
        if (pred.hasOwnProperty('_meta')) { normb._meta = pred._meta; delete pred._meta; }

        if (pred.hasOwnProperty('_data')) {
            normb._data = pred._data;
        } else {
            if (Object.keys(pred).length > 0) { normb._data = pred; }
        }
        norm._body.push(normb);
    }
    return norm;
}

function normalizeObj(sub: any) {
    const norm: any = {};

    if (sub.hasOwnProperty('_meta')) { norm._meta = sub._meta; delete sub._meta; }

    if (sub.hasOwnProperty('_data')) {
        norm._data = sub._data;
    } else {
        if (Object.keys(sub).length > 0) { norm._data = sub; }
    }

    return norm;

}

export function removeRule(idSource: string, idRule: number) {
    if (!databaseRule.delete(idRule)) {
        return new Response(false, idRule);
    }
    return new Response(true, idRule);
}

export function checkSubscriptions(obj: object) { // object is the created fact
    // this function will check if the new data inserted matches some "notification rule"
    subscriptions.forEach((callbArray, k, m) => {
        const r = matcher.findMatches(k, [obj]);
        if (r.size > 0) {
            // log.info('KB', 'Subscription triggered ', k);
            // log.info('KB', 'triggered by ', obj);
            callbArray.forEach((c) => c(r));
        }
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
