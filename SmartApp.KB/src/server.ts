import * as WebSocket from 'ws';
import { security, server } from './config';
import * as kb from './kb';
import { Logger } from './logger';
import { Matches } from './matcher';

const port = server.port ;
const log = Logger.getInstance();
const LOGMODNAME = 'SERVER';

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ port });

wss.on('connection', (ws: WebSocket) => {

    // connection is up
    ws.on('message', (message: string) => {
        let reply: any = { success: false, details: 'some error occurred'};
        let j: any;

        try {
            j = JSON.parse(message);
            log.info(LOGMODNAME, 'received websocket message: ', j);

            if (j.token !== security.token) {
                reply = {success: false, details: 'not authorized action', reqId: j.reqId};
                log.warn(LOGMODNAME, 'unauthorized access with token', j.token);
                ws.send(JSON.stringify(reply));
                return;
            }

            switch (j.method) {
                case 'getAllTags':
                    reply = kb.getAllTags(j.params.includeShortDesc);
                    break;
                case 'register':
                    reply = kb.register();
                    break;
                case 'registerTags':
                    // TODO: validate the input!
                    // since tagslist is an any, we need to check it is at least an object and not an array!
                    reply = kb.registerTags(j.params.idSource, j.params.tagsList);
                    break;
                case 'getTagDetails':
                    reply = kb.getTagDetails(j.params.idSource, j.params.tagsList);
                    break;
                case 'addFact':
                    // tslint:disable-next-line:max-line-length
                    reply = kb.addFact(j.params.idSource, j.params.tag, j.params.TTL, j.params.reliability, j.params.jsonFact);
                    break;
                case 'addRule':
                    reply = kb.addRule(j.params.idSource, j.params.tag, j.params.jsonRule);
                    break;
                case 'removeFact':
                    reply = kb.removeFact(j.params.idSource, j.params.jsonReq);
                    break;
                case 'removeRule':
                    reply = kb.removeRule(j.params.idSource, j.params.idRule);
                    break;
                case 'updateFactByID':
                    // tslint:disable-next-line:max-line-length
                    reply = kb.updateFactByID(j.params.idFact, j.params.idSource, j.params.tag, j.params.TTL, j.params.reliability, j.params.jsonFact);
                    break;
                case 'queryBind': // note: queryBind and queryFact are deprecated: will be removed 3rd december 2018
                    const res = kb.query(j.params.jsonReq);
                    const bind = res.details as Matches;
                    reply = {success: res.success, details: bind.values()};
                    break;
                case 'queryFact': // note: queryBind and queryFact are deprecated: will be removed 3rd december 2018
                case 'query':
                    const r = kb.query(j.params.jsonReq);
                    if (r.success) {
                        // need to convert map type in something jsonable
                        const details = r.details as Matches;
                        const d = new Array();
                        details.forEach( (val, key) => { d.push({object: key, binds: val} ); });
                        reply = {success: r.success, details: d};
                    } else { reply = r; }
                    break;
                case 'subscribe':
                    const callback = (re: Matches) => {
                        if (re.size > 0) {
                            // need to convert map type in something jsonable
                            const d = new Array();
                            re.forEach((val, key) => { d.push({ object: key, binds: val }); });
                            try {
                                ws.send(JSON.stringify({ success: true, details: d, reqId: j.reqId }));
                            } catch (e) { log.error(LOGMODNAME, 'subscribe websocket connection error'); }
                        } else {
                            ws.send(JSON.stringify({success: false, details: {}, reqId: j.reqId }));
                        }
                    };
                    reply = kb.subscribe(j.params.idSource, j.params.jsonReq, callback);
                    break;
                default:
                    reply = new kb.Response(false, 'Method ' + j.method + ' not supported');
                    log.warn(LOGMODNAME, 'unsupported method requested', j.method);
                    break;
            }
        } catch (e) {
            log.error( LOGMODNAME, 'error handling connection: ' + e);
             // TODO: specialize the error in order to send back the json errors
        }
        try {
            reply = {...reply, reqId: j.reqId};
            ws.send(JSON.stringify(reply));
            // log.info(LOGMODNAME, 'replied: ', reply);
        } catch (e) { log.error(LOGMODNAME, 'error sending reply', e); }
    });

});

log.info(LOGMODNAME, 'Server started at port ', port);
