import * as WebSocket from 'ws';
import { security, server } from './config';
import { Colors, Debugger } from './debugger';
import * as kb from './kb';
import { Matches } from './matcher';

const port = server.port ;
const debug = new Debugger(1);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ port });

wss.on('connection', (ws: WebSocket) => {

    // connection is up
    ws.on('message', (message: string) => {
        let reply = JSON.stringify({ success: false, details: 'some error occurred'});

        debug.clog(Colors.WHITE, 'INFO', 1, '', 'received: ' + message, 1);
        try {
            const j = JSON.parse(message);

            if (j.token !== security.token) {
                reply = JSON.stringify({success: false, details: 'not authorized action'});
                ws.send(reply);
                return;
            }

            switch (j.method) {
                case 'registerTags':
                    reply = JSON.stringify(kb.registerTags(j.params.tagsList));
                    break;
                case 'getTagDetails':
                    reply = JSON.stringify(kb.getTagDetails(j.params.tagsList));
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
                    reply = JSON.stringify(kb.query(j.params.jsonReq));
                    break;
                case 'queryBind': // note: this is deprecated: will be removed 1st december 2018
                    const res = kb.query(j.params.jsonReq);
                    const bind = res.details as Matches;
                    reply = JSON.stringify({success: res.success, details: bind.values});
                    break;
                case 'queryFact': // note: this is deprecated: will be removed 1st december 2018
                    reply = JSON.stringify(kb.query(j.params.jsonReq));
                    break;
                case 'subscribe':
                    const callback = (re: any) => {
                        try {
                            ws.send(JSON.stringify(re));
                        } catch (e) { console.log(e); }
                    };
                    reply = JSON.stringify(kb.subscribe(j.params.idSource, j.params.jsonReq, callback));
                    break;
                default:
                    reply = JSON.stringify(new kb.Response(false, 'Method not allowed'));
            }
        } catch (e) {
            debug.clog(Colors.RED, 'ERROR', 1, '', 'error handling connection: ' + e, 2);
             // TODO: specialize the error in order to send back the json errors
        }
        debug.clog(Colors.WHITE, 'INFO', 1, '', 'reply: ' + reply, 1);
        ws.send(reply);
    });

});

debug.clog(Colors.GREEN, 'INFO', 1, '', 'Server started at port ' + port, 0);
