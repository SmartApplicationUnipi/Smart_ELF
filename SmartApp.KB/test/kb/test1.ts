import * as kb from '../../src/kb';
import * as testUtil from '../testUtil';

import { expect } from 'chai';
import 'mocha';

describe('register', () => {
    it('should return new idSource', () => {
        const tags = {tag1: 't1', tag2: 't2', tag3: 't3'};
        const response = kb.register(tags);
        const expected = new kb.Response(true, 'proto2');
        expect(response).to.deep.equal(expected);
    });

    it('should return the already registered tags', () => {
        const tags = {tag1: 't1', tag4 : 't4', tag6: 't6', tag3: 't3'};
        const response = kb.register(tags);
        const expected = new kb.Response(false, ['tag1', 'tag3']);
        expect(response).to.deep.equal(expected);
    });
});

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

describe ('getTagDoc', () => {
    it('should retrieve the documentation of the existing tags', () => {
        const tags_doc = ['tag1', 'tag999'];
        const response = kb.getTagDoc(tags_doc);
        const expected = new kb.Response(true, {tag1 : 'complete_documentation_tag1'});
        expect(response).to.deep.equal(expected);
    });

    it('should fail if none of the tags is existing', () => {
        const tags_doc = ['tag998', 'tag999'];
        const response = kb.getTagDoc(tags_doc);
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

    it('should fail trying to add a fact with an unregistered idSource', () => {
        const response = kb.addFact('sourceACaso', 'tag1', 3, 100, { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' });
        const expected = new kb.Response(false, 'Client sourceACaso not registered');
        expect(response).to.deep.equal(expected);
    });
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