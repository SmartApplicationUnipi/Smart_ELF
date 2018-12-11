import { findCompatibleRules } from '../src/matcher';

import { expect } from 'chai';
import 'mocha';
import { DataObject } from '../src/kb';

// NOTE: use debug level 3 to see the messages

describe('Case Atom Atom', () => {
    const queryobj = { a: 'a' };
    let data;
    let res;
    let expected: object[];

    it('should produce debug message `Rule has the same pair key value`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'a' } });
        res = findCompatibleRules(queryobj, Array.from(data.values()));
        expected = [{ _head: { a: 'a' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Rule has the same key associated to a placeholder`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: '$value' } });
        res = findCompatibleRules(queryobj, Array.from(data.values()));
        expected = [{ _head: { a: '$value' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Rule has the same value associated to a placeholder`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { '$key': 'a' } });
        res = findCompatibleRules(queryobj, Array.from(data.values()));
        expected = [{ _head: { '$key': 'a' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Rule has a placeholder placehoder pair`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { '$key': '$value' } });
        res = findCompatibleRules(queryobj, Array.from(data.values()));
        expected = [{ _head: { '$key': '$value' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Found nothing compatible`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: { b: 'c' } } });
        data.set(1, { _head: { '$key': { b: 'c' } } });
        data.set(2, { _head: { a: 'c' } });
        data.set(3, { _head: { b: 'a' } });
        res = findCompatibleRules(queryobj, Array.from(data.values()));
        expected = [];
        expect(res).to.deep.equal(expected);
    });
});

describe('Case Atom Object', () => {
    let query = { a: {} };
    let data;
    let res;
    let expected: object[];

    it('should produce debug message `(TOO MUCH RELAXED) Rule has an object associated to the key`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: {} } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { a: {} } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Rule has a placeholder associated to the key`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: '$value' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { a: '$value' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `In the rule the key `a\' is associated to an atom`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'a' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Rule has a placeholder associated to an object or to another placeholder`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { '$key': {} } });
        data.set(1, { _head: { '$key': '$value' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { '$key': {} } }, { _head: { '$key': '$value' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Found nothing compatible`', () => {
        data = new Map<number, object>();
        data.set(1, { _head: { '$key': 'a' } });
        data.set(2, { _head: { b: {} } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [];
        expect(res).to.deep.equal(expected);
    });
});

describe('Case Atom Placeholder', () => {
    let query = { a: '$value' };
    let data;
    let res;
    let expected: object[];

    it('should produce debug message `Rule has the same key associated to something (don\'t care what)`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'a' } });
        data.set(1, { _head: { a: {} } });
        data.set(2, { _head: { a: '$val' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { a: 'a' } },
        { _head: { a: {} } },
        { _head: { a: '$val' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Rule has a relaxed compatibility (P:A, P:O or P:P)`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { '$key': 'a' } });
        data.set(1, { _head: { '$key': {} } });
        data.set(2, { _head: { '$key': '$value' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { '$key': 'a' } }, { _head: { '$key': {} } }, { _head: { '$key': '$value' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Found nothing compatible`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { b: 'b' } });
        data.set(1, { _head: { b: {} } });
        data.set(2, { _head: { b: '$val' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [];
        expect(res).to.deep.equal(expected);
    });
});

describe('Case Placeholder Atom', () => {
    let query = { '$a': 'a' };
    let data;
    let res;
    let expected: object[];

    it('should produce debug message `Rule has the compatible pair `a, a\'.`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'a' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { a: 'a' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Rule has the compatible pair `$key, a\'.`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { '$key': 'a' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { '$key': 'a' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Rule has a placeholder placehoder pair`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { '$key': '$value' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { '$key': '$value' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Found nothing compatible`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'b' } });
        data.set(2, { _head: { b: {} } });
        data.set(1, { _head: { '$key': 'b' } });
        data.set(2, { _head: { '$key': {} } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [];
        expect(res).to.deep.equal(expected);
    });
});

describe('Case Placeholder Object', () => {
    let query = { '$key': {} };
    let data;
    let res;
    let expected: object[];

    it('should produce debug message `(TOO MUCH RELAXED) Rule has an object as value of some key or a pair P:P`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: {} } });
        data.set(1, { _head: { a: '$value' } });
        data.set(2, { _head: { '$key': {} } });
        data.set(3, { _head: { '$key': '$val' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { a: {} } },
        { _head: { a: '$value' } },
        { _head: { '$key': {} } },
        { _head: { '$key': '$val' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should produce debug message `Found nothing compatible`', () => {
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'b' } });
        data.set(1, { _head: { '$key': 'a' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [];
        expect(res).to.deep.equal(expected);
    });
});


describe('single key', () => {
    let query;
    let data;
    let res;
    let expected: object[];

    it('should match ground query and ground data', () => {

        query = { a: 'a' };
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'a' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { a: 'a' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should fail if query keys are not in data', () => {
        query = { a: 'a' };
        data = new Map<number, object>();
        data.set(0, { _head: { b: 'b' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [];
        expect(res).to.deep.equal(expected);
    });

    it('should match variable in query with ground data', () => {
        query = { a: '$x' };
        data = new Map<number, object>();
        data.set(0, { _head: { a: 'a' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { a: 'a' } }];
        expect(res).to.deep.equal(expected);

    });

    it('should match ground query with variable data', () => {
        query = { k: 'a' };
        data = new Map<number, object>();
        data.set(0, { _head: { k: '$x' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { k: '$x' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should match variable query in variable data', () => {
        query = { k: '$x' };
        data = new Map<number, object>();
        data.set(0, { _head: { k: '$x' } });
        res = findCompatibleRules(query, Array.from(data.values()));
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
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [];
        expect(res).to.deep.equal(expected);
    });

    it('should match if query has less keys than data', () => {
        query = { k: '$x' };
        data = new Map<number, object>();
        data.set(0, { _head: { k: '$x', kk: '$y' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { k: '$x', kk: '$y' } }];
        expect(res).to.deep.equal(expected);
    });

    it('should match and bind mixed query to ground data', () => {
        query = { a: 1, b: '$b' };
        data = new Map<number, object>();
        data.set(0, { _head: { a: 1, b: 2 } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { a: 1, b: 2 } }];
        expect(res).to.deep.equal(expected);
    });

    it('should match and bind mixed query to variable data', () => {
        query = { a: 1, b: '$b' };
        data = new Map<number, object>();
        data.set(0, { _head: { a: '$a', b: '$b' } });
        res = findCompatibleRules(query, Array.from(data.values()));
        expected = [{ _head: { a: '$a', b: '$b' } }];
        expect(res).to.deep.equal(expected);
    });

});
