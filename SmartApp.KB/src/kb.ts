import { readFileSync, writeFile } from 'fs';
import { transformRule } from './compiler';
import { Debugger } from './debugger';
import { checkRules, queryRules } from './inferenceStub';
import { Logger } from './logger';
import * as matcher from './matcher';

const debug = new Debugger();
const log = Logger.getInstance();

type SubCallback = (r: any) => any;

export type DatabaseFact = Map<number, DataObject>;
export type DatabaseRule = Map<number, DataObject>;

export let databaseFact = new Map<number, DataObject>();
export let databaseRule = new Map<number, DataObject>();
const subscriptions = new Map<object, SubCallback[]>();
let userTags = new Map<string, Map<string, TagInfo>>();
let baseIdSource = 0;
let uniqueFactId = 0;
let uniqueRuleId = 0;

const DATABASEFACTPATH = './db/databaseFact';
const DATABASERULEPATH = './db/databaseRule';
// const SUBSCRIPTIONSPATH = './db/subscriptions';
const USERTAGSPATH = './db/userTags';
const UNIQUEFACTIDPATH = './db/uniqueFactId';
const UNIQUERULEIDPATH = './db/uniqueRuleId';

// TODO: this has to be a nice init fuction
let file;
try {
    file = readFileSync(DATABASEFACTPATH, 'utf8');
    databaseFact = new Map(JSON.parse(file));
} catch (e) {
    log.warn('KB', 'error loading ' + DATABASEFACTPATH, e);
}
try {
    file = readFileSync(DATABASERULEPATH, 'utf8');
    databaseRule = new Map(JSON.parse(file));
} catch (e) {
    log.warn('KB', 'error loading ' + DATABASERULEPATH, e);
}
// TODO: think a way to save subscriptions.
// at this time it has no sense because the majority are incapsulating
// websockets that will be closed if we restart the kb
// try {
//     file = readFileSync('./db/subscriptions', 'utf8');
//     subscriptions = new Map(JSON.parse(file));

// } catch (e) {
//     log.warn('KB', 'error loading ' + SUBSCRIPTIONSPATH, e);
// }
try {
    file = readFileSync(USERTAGSPATH, 'utf8');
    userTags = objectToMapNested(JSON.parse(file), 1);
} catch (e) {
    log.warn('KB', 'error loading ' + USERTAGSPATH, e);
}
try {
    file = readFileSync(UNIQUEFACTIDPATH, 'utf8');
    uniqueFactId = parseInt(file, 10);
} catch (e) {
    log.warn('KB', 'error loading ' + UNIQUEFACTIDPATH, e);
}
try {
    file = readFileSync(UNIQUERULEIDPATH, 'utf8');
    uniqueRuleId = parseInt(file, 10);
} catch (e) {
    log.warn('KB', 'error loading ' + UNIQUERULEIDPATH, e);
}

if (!databaseFact.has(42)) {
    databaseFact.set(42, {
        _data: { text: 'That\'s the answer.' }, _id: 42,
        _meta: { idSource: 'God', tag: 'Everything', TTL: 42, reliability: 100, creationTime: new Date() },
    });
}

// const repetitionTime = 86400000 / 2;
// const now = new Date();
// const dumpDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1, 0, 0);
const repetitionTime = 60 * 1000;
const millsToDump = 60 * 1000; // dumpDate.getTime() - now.getTime();
// if (millsToDump <= 0) {
//     millsToDump += 86400000; // now it's after dumpTime, try tomorrow.
// }

function mapToObjectNested<T>(map: Map<string, T>): Object {
    const obj = Object.create(null);
    for (let [k, v] of map) {
        obj[k] = v instanceof Map ? mapToObjectNested(v) : v;
    }
    return obj;
}

function objectToMapNested<T>(obj: { [index: string]: any }, maxDepth = Infinity): Map<string, T> {
    const map = new Map<string, T>();
    for (let k of Object.keys(obj)) {
        map.set(k, (typeof obj[k] === 'object' && maxDepth > 0) ? objectToMapNested(obj[k], maxDepth - 1) : obj[k]);
    }
    return map;
}

function writeCallback(filename: string, err: any) {
    if (err) { log.error('KB', 'error saving ' + filename, err); } else { log.info('KB', filename + ' saved'); }
}

let currTimeout: NodeJS.Timeout;
function dumpDatabaseRoutine() {
    const f1 = () => {
        writeFile(DATABASEFACTPATH, JSON.stringify([...databaseFact]), 'utf8',
            (e) => writeCallback('databaseFact', e));
    };
    const f2 = () => {
        writeFile(DATABASERULEPATH, JSON.stringify([...databaseRule]), 'utf8',
            (e) => writeCallback('databaseRule', e));
    };
    // const f3 = () => { writeFile(SUBSCRIPTIONSPATH, JSON.stringify([...subscriptions]), 'utf8',
    // (e) => writeCallback('subscriptions', e)); };
    const f4 = () => {
        writeFile(USERTAGSPATH, JSON.stringify(mapToObjectNested(userTags)), 'utf8',
            (e) => writeCallback('userTags', e));
    };
    const f5 = () => { writeFile(UNIQUEFACTIDPATH, uniqueFactId, 'utf8', (e) => writeCallback('uniqueFactId', e)); };
    const f6 = () => { writeFile(UNIQUERULEIDPATH, uniqueRuleId, 'utf8', (e) => writeCallback('uniqueRuleId', e)); };
    log.info('KB', 'starting backup');
    Promise.all([f1(), f2(), f4(), f5(), f6()])
        .then(() => { currTimeout = setTimeout(dumpDatabaseRoutine, repetitionTime); });
}

currTimeout = setTimeout(dumpDatabaseRoutine, millsToDump);

export function stopdump() {
    clearTimeout(currTimeout);
}

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
    userTags.forEach((tags, user, map) => {
        const tagsArray: any = {};
        for (const [tag, tagInfo] of tags) {
            tagsArray[tag] = includeShortDesc ? tagInfo.desc : null;
        }
        allTags[user] = tagsArray;
    });
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
    const queryobj = normalizeQuery(jreq);

    const m = matcher.findMatches(queryobj, Array.from(databaseFact.values()));
    const m2 = queryRules(queryobj);
    const m3 = new Map([...Array.from(m.entries()), ...Array.from(m2.entries())]);

    if (m3.size === 0) {
        return new Response(false, {});
    } else { return new Response(true, m3); }
}

export function subscribe(idSource: string, subreq: object, callback: SubCallback) {
    const jreq = normalizeQuery(subreq);
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
    for (let i = 0; i < rule._body.length; ++i) {
        //        for (const pred of rule._body) {
        const normb: any = {};
        if (rule._body[i].hasOwnProperty('_meta')) { normb._meta = rule._body[i]._meta; delete rule._body[i]._meta; }
        if (rule._body[i].hasOwnProperty('_predicates')) {normb._predicates = rule._body[i]._predicates;
                                                          delete rule._body[i]._predicates; }
        if (rule._body[i].hasOwnProperty('_data')) {
            normb._data = rule._body[i]._data;
        } else {
            if (Object.keys(rule._body[i]).length > 0) { normb._data = rule._body[i]; }
        }


        if (i === rule._body.length - 1) {
            normb._predicates = rule._predicates;
        }
        norm._body.push(normb);
    }

    return norm;
}

function normalizeQuery(jquery: any) {
    const norm: any = {};

    if (jquery.hasOwnProperty('_id')) { norm._id = jquery._id; delete jquery._id; }

    if (jquery.hasOwnProperty('_meta')) { norm._meta = jquery._meta; delete jquery._meta; }

    if (jquery.hasOwnProperty('_predicates')) { norm._predicates = jquery._predicates; delete jquery._predicates; }

    if (jquery.hasOwnProperty('_data')) {
        norm._data = jquery._data;
    } else {
        if (Object.keys(jquery).length > 0) { norm._data = jquery; }
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
    if (uniqueFactId === 41) {
        uniqueFactId++;
    }
    uniqueFactId++;
    return uniqueFactId;
}

function uniqueRuleId_gen() {
    uniqueRuleId++;
    return uniqueRuleId;
}
