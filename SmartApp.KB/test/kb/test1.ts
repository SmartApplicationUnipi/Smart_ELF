import * as kb from '../../src/kb';

import { expect } from 'chai';
import 'mocha';

const idSource = kb.register().details;

describe('registerTags', () => {
    it('should return success', () => {
        const tag1det = new kb.TagInfo('desc1', 'doc1');
        const tag2det = new kb.TagInfo('desc2', 'doc2');
        const tag3det = new kb.TagInfo('desc3', 'doc3');
        const tags =  {tag1: tag1det, tag2: tag2det, tag3: tag3det};
        const response = kb.registerTags(idSource, tags);
        const expected = new kb.Response(true, ['tag1', 'tag2', 'tag3']);
        expect(response).to.deep.equal(expected);
    });

    it('should overwrite already registered tags', () => {
        const tag1det = new kb.TagInfo('desc1', 'doc1');
        const tag4det = new kb.TagInfo('desc4', 'doc4');
        const tag3det = new kb.TagInfo('desc3', 'doc3');
        const tag6det = new kb.TagInfo('desc6', 'doc6');
        const tags =  {tag1: new kb.TagInfo('desc1', 'doc1'), tag4: tag4det,  tag6: tag6det, tag3: tag3det};
        const response = kb.registerTags(idSource, tags);
        const expected = new kb.Response(true, ['tag1', 'tag4', 'tag6', 'tag3']);
        expect(response).to.deep.equal(expected);
    });

    it('should fail if not registered', () => {
        const tag1det = new kb.TagInfo('desc1', 'doc1');
        const tag4det = new kb.TagInfo('desc4', 'doc4');
        const tag3det = new kb.TagInfo('desc3', 'doc3');
        const tag6det = new kb.TagInfo('desc6', 'doc6');
        const tags =  {tag1: tag1det};
        const response = kb.registerTags('pippo', tags);
        const expected = new kb.Response(false, {});
        expect(response).to.deep.equal(expected);
    });
});

describe('getAllTags', () => {
    it('should return all registered tags and corresponding user', () => {
        const response = kb.getAllTags();
        const expected = { 'id0' : {tag1 : {desc: 'desc1', doc: 'doc1'}, tag2: {desc: 'desc2', doc: 'doc2'}, 
        tag3 : {desc: 'desc3', doc: 'doc3'}, tag4 : {desc: 'desc4', doc: 'doc4'}, tag6: {desc: 'desc6', doc: 'doc6'}}}
        const expectedResponse = new kb.Response(true, expected);
        expect(response).to.deep.equal(expectedResponse);
    });
});

describe ('getTagDetails', () => {
    it('should retrieve the documentation of the existing tags', () => {
        const tagsDoc = ['tag1', 'tag999'];
        const response = kb.getTagDetails(idSource, tagsDoc);
        const expected = new kb.Response(true, {tag1 : new kb.TagInfo('desc1', 'doc1')});
        expect(response).to.deep.equal(expected);
    });

    it('should fail if none of the tags is existing', () => {
        const tagsDoc = ['tag998', 'tag999'];
        const response = kb.getTagDetails(idSource, tagsDoc);
        const expected = { success : false, details : {}};
        expect(response).to.deep.equal(expected);
    });
});

describe ('addFact', () => {
    it('should correctly add a fact to the KB', () => {
        const data = { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' };
        const response = kb.addFact(idSource, 'tag1', 3, 100, data);
        const expected = new kb.Response(true, 1);
        expect(response).to.deep.equal(expected);
    });

    it('should fail trying to add a fact with an unregistered tag', () => {
        const data = { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' };
        const response = kb.addFact(idSource, 'rdf', 3, 100, data );
        const expected = new kb.Response(false, 'rdf');
        expect(response).to.deep.equal(expected);
    });
});

describe('query', () => {
    it('should correctly retrieve a fact querying the _id', () => {
        const query = {_id: 1 };
        const response = kb.query(query);

        const id = 1;
        const data = {relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication'};
        const meta = {idSource: idSource,  reliability : 100, tag: 'tag1',
                      creationTime : new Date(Date.now()), TTL : 3};

        const expected = new Map<object, object[]>();
        expected.set({_id : id, _meta : meta, _data: data}, []);
        const expectedResponse = new kb.Response(true, expected);
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should correctly fail for queryin a missing _id', () => {
        const query = {_id: 17289461};
        const response = kb.query(query);
        const expectedResponse = new kb.Response(false, {});
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should correctly retrieve a fact querying the _meta', () => {
        const query = {_meta: {tag: 'tag1'}};
        const response = kb.query(query);

        const id = 1;
        const data = {relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication'};
        const meta = {idSource: idSource, tag: 'tag1', TTL : 3,
                       reliability : 100, creationTime : new Date(Date.now())};
        
        const expected = new Map<object, object[]>();
        expected.set({_id : id, _meta : meta, _data: data}, []);
        const expectedResponse = new kb.Response(true, expected);
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should correctly retrieve a fact querying the _data', () => {
        const query = { _data: {subject: 'Gervasi', object: '$s'} };
        const response = kb.query(query);

        const id = 1;
        const data = {relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication'};
        const meta = {idSource: idSource, tag: 'tag1', TTL : 3, reliability : 100,
                      creationTime : new Date(Date.now())};

        const expected = new Map<object, object[]>();
        expected.set({_id : id, _meta : meta, _data: data}, [ { $s: 'SmartApplication' } ]);
        const expectedResponse = new kb.Response(true, expected);
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should correctly fail querying missing _data', () => {
        const query = {_data: {subject: 'Frommegolde', object: '$s'}};
        const response = kb.query(query);
        const expectedResponse = new kb.Response(false, {});
        expect(response).to.deep.equal(expectedResponse);
    });
});

describe ('removeFact', () => {
    it('should correctly remove a fact from the KB', () => {
        const data = {testkey: 'testdata'};
        const id = (kb.addFact(idSource, 'tag1', 3, 100, data)).details;

        const response = kb.removeFact(idSource, data);
        const expected = new kb.Response(true, [id]);
        expect(response).to.deep.equal(expected);
    });

    it('should have actually deleted the previous fact', () => {
        const data = {testkey: 'testdata'};
        const response = kb.query(data);
        const expected = new kb.Response(false, {});
        expect(response).to.deep.equal(expected);
    });

    it('should correctly remove many facts from the KB through _data', () => {
        const res1 = kb.addFact(idSource, 'tag1', 3, 100, {testkey: 'k' , testkey2: 'test1'});
        const res2 = kb.addFact(idSource, 'tag1', 5, 10,  {testkey: 'k', testkey2: 'test2'});
        const res3 = kb.addFact(idSource, 'tag1', 7, 80,  {testkey: 'k', testkey2: 'test3'});
        const res4 = kb.addFact(idSource, 'tag1', 8, 100, {testkey: 'SmartApplication' });

        const data = {testkey: 'k'};
        const response = kb.removeFact(idSource, {_data: data});
        const expected = new kb.Response(true, [res1.details , res2.details, res3.details]);
        expect(response).to.deep.equal(expected);
    });

    it('should correctly remove many facts from the KB through _meta', () => {
        const idSource2 = kb.register().details;
        kb.registerTags(idSource2, {pippo: new kb.TagInfo('desc1', 'doc1')});
        const res1 = kb.addFact(idSource2, 'pippo', 3, 100, {testkey: 'k' , testkey2: 'test1'});
        const res2 = kb.addFact(idSource2, 'pippo', 7, 10,  {testkey: 'k', testkey2: 'test2'});
        const res3 = kb.addFact(idSource2, 'pippo', 7, 80,  {testkey: 'k', testkey2: 'test3'});
        const res4 = kb.addFact(idSource2, 'pippo', 7, 100, {testkey: 'SmartApplication' });
        const meta = {idSource: idSource2};
        const response = kb.removeFact(idSource2, {_meta: meta});
        const expected = new kb.Response(true, [res1.details, res2.details, res3.details, res4.details]);
        expect(response).to.deep.equal(expected);
    });
});

describe ('updateFactByID', () => {
    it('should update an existing fact through its id', () => {
        const res1 = kb.addFact(idSource, 'tag1', 3, 100, {testkey: 'k' });
        const updata = { relation: 'updates', subject: 'FromGold', object: 'this' };

        const response = kb.updateFactByID(res1.details, idSource, 'tag1', 7, 100, updata );
        const expected = new kb.Response(true, res1.details);
        expect(response).to.deep.equal(expected);
    });

    it('should have actually updated the fact', () => {
        const query = { relation: 'updates', subject: 'FromGold', object: 'this' };
        const response = kb.query(query);

        expect(response.success).to.deep.equal(true);
    });

    it('should fail to update a non-existing id', () => {
        const id = 237842;
        const updata = { relation: 'modifies', subject: 'FromGold', object: 'stuff' };
        const response = kb.updateFactByID(id, idSource,  'tag1', 7, 100, updata );
        const expected = new kb.Response(false, id);
        expect(response).to.deep.equal(expected);
    });
});

describe ('addRule and removeRule', () => {
    it('should correctly add a new rule', () => {
        const rule = new kb.DataRule({ subject: '$prof', relation: 'is in', object: '$room' },
        [{ subject: '$prof', relation: 'teaches', object: '$course' },
        { subject: '$course', relation: 'is in room', object: '$room' }]);

        const id = 1;
        const response = kb.addRule(idSource, 'myRuleTag', rule);
        const expected = new kb.Response(true, id);
        expect(response).to.deep.equal(expected);
    });

    it('should correctly delete a rule', () => {
        const id = 1;
        const response = kb.removeRule(idSource, id);
        const expected = new kb.Response(true, id);
        expect(response).to.deep.equal(expected);
    });

    // it('should fail adding an invalid rule', () => {
    //     const rule = new kb.DataRule(
    //         body: [{ subject: '$prof', relation: 'teaches', object: '$course' },
    //         { subject: '$course', relation: 'is in room', object: '$room' }]
    //     };

    //     const response = kb.addRule(idSource, 'myRuleTag', rule);
    //     const expected = new kb.Response(false, 'Rules must have a \'head\' and a \'body\'');
    //     expect(response).to.deep.equal(expected);
    // });

    it('should fail removing a non-existing rule', () => {
        const id = 123123;
        const response = kb.removeRule(idSource, id);
        const expected = new kb.Response(false, id);
        expect(response).to.deep.equal(expected);
    });
});
