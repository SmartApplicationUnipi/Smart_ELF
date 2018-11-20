import * as kb from '../../src/kb';
import * as testUtil from '../testUtil';

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

/*
describe('registerTagDoc', () => {
    it('should register the documentation successfully', () => {
        const doc = {tag1 : 'complete_documentation_tag1'};
        const response = kb.registerTagDocumentation(doc);
        const expected = new kb.Response(true, ['tag1']);
        expect(response).to.deep.equal(expected);
    });

    it('should register the documentation only for existing tag without failing', () => {
        const doc = {tag123 : 'complete_documentation_tag123', tag3: 'complete_documentation_tag3'}
        const response = kb.registerTagDocumentation(doc);
        const expected = new kb.Response(true, ['tag3'])
        expect(response).to.deep.equal(expected);
    });

    it('should fail if only unregistered tags are provided', () => {
        const doc = {tag123 : 'complete_documentation_tag123', tag321: 'complete_documentation_tag321'};
        const response = kb.registerTagDocumentation(doc);
        const expected = new kb.Response(false, []);
        expect(response).to.deep.equal(expected);
    });

});
*/

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
/*
    it('should fail trying to add a fact with an unregistered idSource', () => {
        const response = kb.addFact('sourceACaso', 'tag1', 3, 100, { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' });
        const expected = new kb.Response(false, 'Client sourceACaso not registered');
        expect(response).to.deep.equal(expected);
    });
*/
});

describe ('removeFact', () => {
    it('should correctly remove a fact from the KB', () => {
        const metadata = {idSource: 'proto2', tag: 'tag1', TTL: 3, reliability: 100, timestamp: '$time'};
        const fact = {relation: 'teaches', subject: 'Gervasi', object: '$course'};
        const response = kb.removeFact('proto2', {_id: '$id', _meta : metadata, _data: fact});
        const expected = new kb.Response(true, [1]);
        expect(response).to.deep.equal(expected);
    });
});