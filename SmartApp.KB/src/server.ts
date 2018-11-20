import * as WebSocket from 'ws';
import { security, server } from './config';
import * as kb from './kb';

const port = server.port ;

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ port });

wss.on('connection', (ws: WebSocket) => {

    // connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
        let reply = JSON.stringify({ success: false, details: 'some error occurred'});

        // log the received message and send it back to the client
        console.log('received: %s', message);
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
/*                 case 'registerTagDoc':
                    reply = JSON.stringify(kb.registerTagDocumentation(j.params.tagsMap));
                    break; */
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
                case 'updateFactByID':
                    // tslint:disable-next-line:max-line-length
                    reply = JSON.stringify(kb.updateFactByID(j.params.idFact, j.params.idSource, j.params.tag, j.params.TTL, j.params.reliability, j.params.jsonFact));
                    break;
                case 'queryBind':
                    reply = JSON.stringify(kb.queryBind(j.params.jsonReq));
                    break;
                case 'queryFact':
                    reply = JSON.stringify(kb.queryFact(j.params.jsonReq));
                    break;
                case 'removeFact':
                    reply = JSON.stringify(kb.removeFact(j.params.idSource, j.params.jsonReq));
                    break;
                case 'removeFactById':
                    reply = JSON.stringify(kb.removeFactByID(j.params.idSource, j.params.idFact));
                    break;
                case 'removeRule':
                    reply = JSON.stringify(kb.removeRule(j.params.idSource, j.params.idRule));
                    break;
                case 'removeFact':
                    reply = JSON.stringify(kb.removeFact(j.params.idSource, j.params.jsonReq));
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
            console.log(e); // TODO: specialize the error in order to send back the json errors
        }
        console.log('reply: ' + reply)
        ws.send(reply);
    });

});

console.log('Server started at port ' + port);
