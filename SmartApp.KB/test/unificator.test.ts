import { unify } from '../src/unificator';

import { expect } from 'chai';
import 'mocha';

describe('single key', () => {
    let query;
    let data;
    let res;

    it('should match ground query and ground data', () => {

        query = { a: 'a' };
        data = { a: 'a' };
        res = unify(query, data, {});
        return res.s === true;
    });

    it('should fail if query keys are not in data',() => {
        query = { a: 'a' };
        data = { b: 'b' };
        res = unify(query, data, {});
        return res.s === false;
    });

    it('should match variable in query with ground data', () => {
        query = {a: '$x'};
        data = {a: 'a'};
        res = unify(query, data, {});
        return res.binds.$x === 'a';

    });

    it('should match ground query with variable data', () => {
        query = { k: 'a' };
        data = { k: '$x' };
        res = unify(query, data, {});
        return res.binds.$x === 'a';
    });

    it('should match variable query in variable data', () => {
        query = {k: '$x'};
        data = {k: '$x'};
        res = unify(query, data, {});
        return res.s;
    });

});

describe('two keys', () => {
    let query;
    let data;
    let res;
    it('should fail if query has more keys than data', () => {
        query = { k: '$x', kk: '$y' };
        data = { k: '$x' };
        res = unify(query, data, {});
        return !res.s;

    });

    it('should match if query has less keys than data', () => {
        query = { k: '$x' };
        data = { k: '$x', kk: '$y' };
        res = unify(query, data, {});
        return res.s;
    });

    it('should match and bind mixed query to ground data', () => {
        query = {a: 1, b: '$b' };
        data = {a: 1, b: 2 };
        res = unify(query, data, {});
        return res.s;
    });

    it('should match and bind mixed query to variable data', () => {
        query = {a: 1, b: '$b' };
        data = {a: '$a', b: '$b' };
        res = unify(query, data, {});
        return res.s && res.binds.$a === 1 ;
    });

});
