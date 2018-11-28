import * as WebSocket from 'ws';
import { security, server } from './config';
import * as kb from './kb';
import { Logger } from './logger';
import { Matches } from './matcher';
import { debug } from 'util';

const port = server.port ;
const log = Logger.getInstance();
const LOGMODNAME = 'SERVER';

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ port });

wss.on('connection', (ws: WebSocket) => {

    // connection is up
    ws.on('message', (message: string) => {
        let reply = JSON.stringify({ success: false, details: 'some error occurred'});

        try {
            const j = JSON.parse(message);
            log.info(LOGMODNAME, 'received websocket message: ', j);

            if (j.token !== security.token) {
                reply = JSON.stringify({success: false, details: 'not authorized action'});
                log.warn(LOGMODNAME, 'unauthorized access with token', j.token);
                ws.send(reply);
                return;
            }

            switch (j.method) {
                case 'register':
                    reply = JSON.stringify(kb.register());
                    break;
                case 'registerTags':
                    reply = JSON.stringify(kb.registerTags(j.params.idSource, j.params.tagsList));
                    break;
                case 'getTagDetails':
                    reply = JSON.stringify(kb.getTagDetails(j.params.idSource, j.params.tagsList));
                    break;
                case 'addFact':
                    // tslint:disable-next-line:max-line-length
                    reply = JSON.stringify(kb.addFact(j.params.idSource, j.params.tag, j.params.TTL, j.params.reliability, j.params.jsonFact));
                    break;
                case 'addRule':
                    reply = JSON.stringify(kb.addRule(j.params.idSource, j.params.tag, j.params.jsonRule));
                    break;
                case 'removeFact':
                    reply = JSON.stringify(kb.removeFact(j.params.idSource, j.params.jsonReq));
                    break;
                case 'removeRule':
                    reply = JSON.stringify(kb.removeRule(j.params.idSource, j.params.idRule));
                    break;
                case 'updateFactByID':
                    // tslint:disable-next-line:max-line-length
                    reply = JSON.stringify(kb.updateFactByID(j.params.idFact, j.params.idSource, j.params.tag, j.params.TTL, j.params.reliability, j.params.jsonFact));
                    break;
                case 'query':
                    const r = kb.query(j.params.jsonReq);
                    if (r.success) {
                        // need to convert map type in something jsonable
                        const details = r.details as Matches;
                        const d = {objects: new Array(), binds: new Array()};
                        details.forEach( (val, key) => { d.objects.push(key); d.binds.push(val); } );
                        reply = JSON.stringify({success: r.success, details: d});
                    } else { reply = JSON.stringify(r); }
                    break;
                case 'queryBind': // note: this is deprecated: will be removed 1st december 2018
                    const res = kb.query(j.params.jsonReq);
                    const bind = res.details as Matches;
                    reply = JSON.stringify({success: res.success, details: bind.values()});
                    break;
                case 'queryFact': // note: this is deprecated: will be removed 1st december 2018
                    reply = JSON.stringify(kb.query(j.params.jsonReq));
                    break;
                case 'subscribe':
                    const callback = (re: any) => {
                        try {
                            ws.send(JSON.stringify(re));
                        } catch (e) { log.error(LOGMODNAME, 'subscribe websocket connection error: ', e); }
                    };
                    reply = JSON.stringify(kb.subscribe(j.params.idSource, j.params.jsonReq, callback));
                    break;
                default:
                    reply = JSON.stringify(new kb.Response(false, 'Method ' + j.method + ' not supported'));
                    log.warn(LOGMODNAME, 'unsupported method requested', j.method);
            }
        } catch (e) {
            log.error( LOGMODNAME, 'error handling connection: ' + e);
             // TODO: specialize the error in order to send back the json errors
        }
        try {
            ws.send(reply);
            log.info(LOGMODNAME, 'replied: ', reply);
        } catch (e) { log.error(LOGMODNAME, 'error sending reply', e); }
    });

});

log.info(LOGMODNAME, 'Server started at port ', port);
