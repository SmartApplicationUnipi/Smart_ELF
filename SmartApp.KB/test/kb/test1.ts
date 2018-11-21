import * as kb from '../../src/kb';

import { expect } from 'chai';
import 'mocha';


describe('registerTags', () => {
    it('should return succes', () => {
        const tags =  {tag1: new kb.TagInfo('desc1', 'doc1'), tag2: new kb.TagInfo('desc2', 'doc2'), tag3: new kb.TagInfo('desc3', 'doc3')};
        const response = kb.registerTags(tags);
        const expected = new kb.Response(true, {});
        expect(response).to.deep.equal(expected);
    });

    it('should return the already registered tags', () => {
        const tags =  {tag1: new kb.TagInfo('desc1', 'doc1'), tag4: new kb.TagInfo('desc4', 'doc4'), tag6: new kb.TagInfo('desc6', 'doc6'), tag3: new kb.TagInfo('desc3', 'doc3')};
        const response = kb.registerTags(tags);
        const expected = new kb.Response(false, ['tag1', 'tag3']);
        expect(response).to.deep.equal(expected);
    });
});


describe ('getTagDetails', () => {
    it('should retrieve the documentation of the existing tags', () => {
        const tagsDoc = ['tag1', 'tag999'];
        const response = kb.getTagDetails(tagsDoc);
        const expected = new kb.Response(true, {tag1 : new kb.TagInfo('desc1', 'doc1')});
        expect(response).to.deep.equal(expected);
    });

    it('should fail if none of the tags is existing', () => {
        const tagsDoc = ['tag998', 'tag999'];
        const response = kb.getTagDetails(tagsDoc);
        const expected = { success : false, details : {}};
        expect(response).to.deep.equal(expected);
    });
});

describe ('addFact', () => {
    it('should correctly add a fact to the KB', () => {
        const response = kb.addFact('proto2', 'tag1', 3, 100, { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' });
        const expected = new kb.Response(true, 1);
        expect(response).to.deep.equal(expected);
    });

    it('should fail trying to add a fact with an unregistered tag', () => {
        const response = kb.addFact('proto2', 'rdf', 3, 100, { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' });
        const expected = new kb.Response(false, 'rdf');
        expect(response).to.deep.equal(expected);
    });
});


describe('queryFact', () => {
    it('should correctly retrieve a fact querying the _id', () => {
        const query = {_id: 1 };
        const response = kb.queryFact(query);

        const id = 1;
        const data = {relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication'};
        const meta = {idSource:'proto2', tag: 'tag1', TTL : 3, reliability : 100, timestamp : new Date(Date.now()).toLocaleDateString('en-GB')}

        const expected = [{_id : id, _meta : meta, _data: data}];
        const expectedResponse = new kb.Response(true, expected);
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should correctly retrieve an empty array querying a missing _id', () => {
        const query = {_id: 17289461};
        const response = kb.queryFact(query);
        const expectedResponse = new kb.Response(true, []);
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should correctly retrieve a fact querying the _meta', () => {
        const query = {_meta: {tag: 'tag1'}};
        const response = kb.queryFact(query);


        const id = 1;
        const data = {relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication'};
        const meta = {idSource:'proto2', tag: 'tag1', TTL : 3, reliability : 100, timestamp : new Date(Date.now()).toLocaleDateString('en-GB')}

        const expected = [{_id : id, _meta : meta, _data: data}];
        const expectedResponse = new kb.Response(true, expected);
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should correctly retrieve a fact querying the _data', () => {
        const query = {_data: {subject: 'Gervasi', object: '$s'}};
        const response = kb.queryFact(query);

        const id = 1;
        const data = {relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication'};
        const meta = {idSource:'proto2', tag: 'tag1', TTL : 3, reliability : 100, timestamp : new Date(Date.now()).toLocaleDateString('en-GB')}
        console.log(response.details[0]._meta.timestamp);

        const expected = [{_id : id, _meta : meta, _data: data}];
        const expectedResponse = new kb.Response(true, expected);
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should correctly retrieve an empty array querying missing _data', () => {
        const query = {_data: {subject: 'Frommegolde', object: '$s'}};
        const response = kb.queryFact(query);
        const expectedResponse = new kb.Response(true, []);
        expect(response).to.deep.equal(expectedResponse);
    });
});

describe ('removeFact', () => {
    it('should correctly remove a fact from the KB', () => {
        const metadata = {idSource: 'proto2', tag: 'tag1', TTL: 3, reliability: 100, timestamp: '$time'};
        const data = {relation: 'teaches', subject: 'Gervasi', object: '$course'};
        const response = kb.removeFact('proto2', {_id: '$id', _meta : metadata, _data: data});
        const expected = new kb.Response(true, [1]);
        expect(response).to.deep.equal(expected);
    });

    it('should have actually deleted the fact', () => {
        const data = {relation: 'teaches', subject: 'Gervasi', object: '$course'};
        const query = {_data: data};
        const response = kb.queryFact(query);
        const expected = new kb.Response(true, []);
        expect(response).to.deep.equal(expected);
    });

    it('should correctly remove many facts from the KB through _data', () => {
        kb.addFact('proto2', 'tag1', 3, 100, { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' }); 
        kb.addFact('proto2', 'tag1', 5, 10, { relation: 'plays', subject: 'Gervasi', object: 'Mandolino' });
        kb.addFact('proto2', 'tag1', 7, 80, { relation: 'dances', subject: 'Gervasi', object: 'Tektokik' });
        kb.addFact('proto2', 'tag1', 8, 100, { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' });
        kb.addFact('proto2', 'tag1', 4, 59, { relation: 'writes', subject: 'FromGold', object: 'tests' });
        kb.addFact('proto2', 'tag1', 6, 100, { relation: 'plays', subject: 'Frommegolde', object: 'Pharah' });

        //const metadata = {idSource: 'proto2', tag: 'tag1', TTL: 3, reliability: 100, timestamp: '$time'};
        const data = {subject: 'Gervasi'};
        const response = kb.removeFact('proto2', {_data: data});
        const expected = new kb.Response(true, [2,3,4,5]);
        expect(response).to.deep.equal(expected);
    });

    it('should correctly remove many facts from the KB through _data', () => {
        const data = {relation: 'plays'};
        const response = kb.removeFact('proto2', {_data: data});
        const expected = new kb.Response(true, [7]);
        expect(response).to.deep.equal(expected);
    });

    it('should correctly remove many facts from the KB through _meta', () => {
        const meta = {timestamp: new Date(Date.now()).toLocaleDateString('en-GB')};
        const response = kb.removeFact('proto2', {_meta: meta});
        const expected = new kb.Response(true, [6]);
        expect(response).to.deep.equal(expected);
    });
});


describe ('updateFactByID', () => {
    it('should update an existing fact through its id', () => {
        kb.addFact('proto2', 'tag1', 3, 100, { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' });
        kb.addFact('proto2', 'tag1', 5, 10, { relation: 'plays', subject: 'Gervasi', object: 'Mandolino' });
        kb.addFact('proto2', 'tag1', 7, 80, { relation: 'dances', subject: 'Gervasi', object: 'Tektokik' });
        kb.addFact('proto2', 'tag1', 8, 100, { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' });
        kb.addFact('proto2', 'tag1', 4, 59, { relation: 'writes', subject: 'FromGold', object: 'tests' }); //id : 12
        kb.addFact('proto2', 'tag1', 6, 100, { relation: 'plays', subject: 'Frommegolde', object: 'Pharah' });

        const id = 12;
        const response = kb.updateFactByID( id, 'proto2', 'tag1', 7, 100, { relation: 'modifies', subject: 'FromGold', object: 'stuff' });
        const expected = new kb.Response(true, id);
        expect(response).to.deep.equal(expected);
    });

    it('should have actually updated the fact', () => {
        const query = {_data : {object: 'stuff'}}
        const response = kb.queryFact(query);

        const id = 12;
        const data = {relation: 'modifies', subject: 'FromGold', object: 'stuff'};
        const meta = {idSource:'proto2', tag: 'tag1', TTL : 7, reliability : 100, timestamp : new Date(Date.now()).toLocaleDateString('en-GB')}
        const expected = [{_id : id, _meta : meta, _data : data}]
        const expectedResponse = new kb.Response(true, expected);
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should fail to update a non-existing id', () => {
        const id = 237842;
        const response = kb.updateFactByID(id, 'proto2',  'tag1', 7, 100, { relation: 'modifies', subject: 'FromGold', object: 'stuff' });
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
        const response = kb.addRule('proto2', 'myRuleTag', rule);
        const expected = new kb.Response(true, id);
        expect(response).to.deep.equal(expected);
    });

    it('should correctly delete a rule', () => {
        const id = 1;
        const response = kb.removeRule('proto2', id);
        const expected = new kb.Response(true, id);
        expect(response).to.deep.equal(expected);
    });

    // it('should fail adding an invalid rule', () => {
    //     const rule = new kb.DataRule(
    //         body: [{ subject: '$prof', relation: 'teaches', object: '$course' },
    //         { subject: '$course', relation: 'is in room', object: '$room' }]
    //     };

    //     const response = kb.addRule('proto2', 'myRuleTag', rule);
    //     const expected = new kb.Response(false, 'Rules must have a \'head\' and a \'body\'');
    //     expect(response).to.deep.equal(expected);
    // });

    it('should fail removing a non-existing rule', () => {
        const id = 123123;
        const response = kb.removeRule('proto2', id);
        const expected = new kb.Response(false, id);
        expect(response).to.deep.equal(expected);
    });
});

