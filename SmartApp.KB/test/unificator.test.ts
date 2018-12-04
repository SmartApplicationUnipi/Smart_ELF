import { findCompatibleRules } from '../src/matcher';

import { expect } from 'chai';
import 'mocha';

describe('single key', () => {
    let query;
    let data;
    let res;
    let expected: object[];

    it('should match ground query and ground data', () => {

        query = { a: 'a' };
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'a' } });
        res = findCompatibleRules(query, data);
        expected = [{ _head: { a: 'a' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should fail if query keys are not in data', () => {
        query = { a: 'a' };
        data = new Map<number, object>();
        data.set(0, { _head: { b: 'b' } });
        res = findCompatibleRules(query, data);
        expected = [];
        expect(res).to.deep.equal(expected);
    });

    it('should match variable in query with ground data', () => {
        query = { a: '$x' };
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'a' } });
        res = findCompatibleRules(query, data);
        expected = [{ _head: { a: 'a' } }];
        expect(res).to.deep.equal(expected);

    });

    it('should match ground query with variable data', () => {
        query = { k: 'a' };
        data = new Map<number, object>();
        data.set(0, { _head: { k: '$x' } });
        res = findCompatibleRules(query, data);
        expected = [{ _head: { k: '$x' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should match variable query in variable data', () => {
        query = { k: '$x' };
        data = new Map<number, object>();
        data.set(0, { _head: { k: '$x' } });
        res = findCompatibleRules(query, data);
        expected = [{ _head: { k: '$x' } }];
        expect(res).to.deep.equal(expected);
    });

});

describe('two keys', () => {
    let query;
    let data;
    let res;
    let expected: object[];

    it('should fail if query has more keys than data', () => {
        query = { k: '$x', kk: '$y' };
        data = new Map<number, object>();
        data.set(0, { _head: { k: '$x' } });
        res = findCompatibleRules(query, data);
        expected = [];
        expect(res).to.deep.equal(expected);
    });

    it('should match if query has less keys than data', () => {
        query = { k: '$x' };
        data = new Map<number, object>();
        data.set(0, { _head: { k: '$x', kk: '$y' } });
        res = findCompatibleRules(query, data);
        expected = [{ _head: { k: '$x', kk: '$y' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should match and bind mixed query to ground data', () => {
        query = { a: 1, b: '$b' };
        data = new Map<number, object>();
        data.set(0, { _head: { a: 1, b: 2 } });
        res = findCompatibleRules(query, data);
        expected = [{ _head: { a: 1, b: 2 } }];
        expect(res).to.deep.equal(expected);
    });

    it('should match and bind mixed query to variable data', () => {
        query = { a: 1, b: '$b' };
        data = new Map<number, object>();
        data.set(0, { _head: { a: '$a', b: '$b' } });
        res = findCompatibleRules(query, data);
        expected = [{ _head: { a: '$a', b: '$b' } }];
        expect(res).to.deep.equal(expected);
    });

});
