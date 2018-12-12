const WebSocket = require('ws');
const debug = require('debug')('kb-analytics:kbclient');
const config = require('../config.json');

class Deferred {
    constructor(id, timeout = 5000) {

        this.id = id;

        // Register the timeout handler
        const t = setTimeout(() => {
            this.reject(new Error('Timeout.'));
        }, timeout);

        // Create a new unresolved promise and keep a reference to the `resolve` and `reject` methods
        this.promise = new Promise((resolve, reject) => {
            this.resolve = x => {
                clearTimeout(t);
                resolve(x);
            };
            this.reject = e => {
                clearTimeout(t);
                reject(e);
            };
        });

    }
};

module.exports = class KBClient {
    
    constructor(ws, token) {
        if (!ws || !(ws instanceof WebSocket) || ws.readyState !== WebSocket.OPEN) {
            throw new Error('KBClient must be initialized with an already connected WebSocket.');
        }
        this._ws = ws;
        this._token = token;
        this._lastRequestId = 0;
        this._pendingRequests = {};
        this._activeSubscriptions = {};

        ws.on('error', this._onError.bind(this));
        ws.on('close', this._onError.bind(this));
        ws.on('message', this._onMessage.bind(this));

        // Helpers for known methods that do not require idSource
        for (let k of ['getAllTags', 'getTagDetails', 'query', 'register']) {
            this[k] = params => this.invoke(k, params);
        }
    }

    /**
     * Connects to the KB and returns a new instance of a `KBClient`.
     * 
     * @param {string} url WebSocket endpoint of the KB.
     * @param {string} token Authentication token.
     * @param {*} [options] Optional options to be passed to the `WebSocket` constructor.
     */
    static connect(url, token, options) {
        const ws = new WebSocket(url, options);
        return new Promise((resolve, reject) => {
            const onopen = () => {
                debug('Connected to %s', url);
                ws.removeListener('error', onerror);
                resolve(new KBClient(ws, token));
            };

            const onerror = e => {
                debug('Error connecting to %s: %o', url, e);
                ws.removeListener('open', onopen);
                reject(e);
            };

            ws.once('open', onopen);
            ws.once('error', onerror);
        });
    }

    /**
     * Asynchronously invokes a remote method on the KB.
     * 
     * @param {string} method Remote method name.
     * @param {*} [params] Method parameters.
     */
    invoke(method, params = null) {
        return this._invoke(method, params).promise;
    }

    /**
     * Registers a callback to be invoked when a new tuple matching the given filter is added to the KB.
     * 
     * @param {string} idSource ID received after a call to `register`.
     * @param {*} filter Filter object.
     * @param {Function} cb Callback to invoke when a new tuple matches the filter.
     * @returns {Function} Returns a function that can be called to stop the subscription.
     */
    subscribe(idSource, filter, cb) {
        const d = this._invoke('subscribe', { idSource, jsonReq: filter });
        return d.promise.then(() => {
            this._activeSubscriptions[d.id] = cb;
            return () => {
                delete this._activeSubscriptions[d.id];
            };
        });
    }

    _invoke(method, params) {

        const d = new Deferred(this._lastRequestId++);
        this._pendingRequests[d.id] = d;

        // Sends the request
        this._ws.send(JSON.stringify({
            reqId: d.id,
            method,
            params,
            token: this._token
        }), e => {
            if (e) {
                d.reject(e);
                delete this._pendingRequests[d.id];
            } else {
                debug('Request sent. Method: %s, params: %o.', method, params);
            }
        });

        return d;

    }

    _onMessage(message) {
        
        // Parse the message from the server
        let m;
        try {
            m = JSON.parse(message);
        } catch (e) {
            d.reject(e);
            return;
        }

        const d = this._pendingRequests[m.reqId];
        const cb = this._activeSubscriptions[m.reqId];

        if (d) {
            
            // This message is the response to a request
            debug('Response from server to request #%d: %o', m.reqId, m);
            if (m.success) {
                d.resolve(m.details);
            } else {
                d.reject(new Error('KB error: ' + m.details));
            }
            delete this._pendingRequests[d.id];

        } else if (cb) {

            // This is the notification for a subscription
            debug('Subscription #%d notification: %o', m.reqId, m);
            if (m.success) {
                cb(null, m.details);
            } else {
                cb(m.details);
            }

        } else {
            debug('Got spurious response from server. Ignored: %o', m);
        }
        
    }

    _onError(e) {
        debug('Connection terminated: %o', e);

        // Reject all the pending promises for the responses
        e = e || new Error('Underlying connection terminated.');
        for (var k in this._pendingRequests) {
            if (Object.prototype.hasOwnProperty.call(this._pendingRequests, k)) {
                this._pendingRequests[k].reject(e);
            }
        }
        this._pendingRequests = {};

        // Signal an error to all the subscription handlers
        for (var k in this._activeSubscriptions) {
            if (Object.prototype.hasOwnProperty.call(this._activeSubscriptions, k)) {
                this._activeSubscriptions[k](e);
            }
        }
        this._activeSubscriptions = {};
    }

};