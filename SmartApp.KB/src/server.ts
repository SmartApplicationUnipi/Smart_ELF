import * as WebSocket from 'ws';
import { security, server } from './config';
import * as kb from './kb';

const port = server.port ;

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ port });

wss.on('connection', (ws: WebSocket) => {

    // connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
        let reply = 'fail';

        // log the received message and send it back to the client
        console.log('received: %s', message);
        try {
            const j = JSON.parse(message);
            switch (j.method) {
                case 'register':
                    reply = kb.register(j.params.token);
                    break;
                case 'addFact':
                    // tslint:disable-next-line:max-line-length
                    reply = (kb.addFact(j.params.idSource, j.params.infoSum, j.params.TTL, j.params.reliability, j.params.jsonFact)).toString();
                    break;
                case 'removeFact':
                    if (kb.removeFact(j.params.idSource, j.params.jsonReq)) {
                        reply = 'done';
                    }
                    break;
                case 'addRule':
                    reply = (kb.addRule(j.params.idSource, j.params.ruleSum, j.params.jsonRule)).toString();
                    break;
                case 'removeRule':
                    if (kb.removeRule(j.params.idSource, j.params.idRule)) {
                        reply = 'done';
                    }
                    break;
                case 'queryBind':
                    const rBind = kb.queryBind(j.params.idSource, j.params.jsonReq);
                    reply = JSON.stringify(rBind);
                    break;
                case 'queryFact':
                    const rFact = kb.queryFact(j.params.idSource, j.params.jsonReq);
                    reply = JSON.stringify(rFact);
                    break;
                case 'subscribe':
                    // tslint:disable-next-line:max-line-length
                    const callback = (re: any) => {
                        try {
                            ws.send(JSON.stringify(re));
                        } catch (e) { console.log(e); }
                    };
                    if (kb.subscribe(j.params.idSource, j.params.jsonReq, callback)) {
                        reply = 'done';
                    }
                    break;
                default:
                    reply = 'function not defined';
            }
        } catch (e) {
            console.log(e);
        }
        ws.send(reply);
    });

});

console.log('Server started at port ' + port);
