import * as WebSocket from 'ws';
import * as kb from './kb';

const port = 5666;

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ port });

wss.on('connection', (ws: WebSocket) => {

    // connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
        let reply;

        // log the received message and send it back to the client
        console.log('received: %s', message);
        try {
            const j = JSON.parse(message);
            switch (j.method) {
                case 'register':
                    reply = JSON.stringify(kb.register(j.params));
                    break;
                case 'registerTagDoc':
                    reply = JSON.stringify(kb.registerTagDocumentation(j.params));
                    break;
                case 'getTagDoc':
                    reply = JSON.stringify(kb.getTagDoc(j.params));
                    break;
                case 'addFact':
                    // tslint:disable-next-line:max-line-length
                    reply = JSON.stringify(kb.addFact(j.params.idSource, j.params.tag, j.params.TTL, j.params.reliability, j.params.jsonFact));
                    break;
                case 'removeFact':
                    reply = JSON.stringify(kb.removeFact(j.params.idSource, j.params.jsonReq));
                    break;
                case 'updateFact':
                    reply = JSON.stringify(kb.updateFactbyId(j.params.idSource, j.params.id, j.params.tag, j.params.TTL, j.params.reliability, j.params.jsonFact));
                    break;
                case 'addRule':
                    reply = JSON.stringify(kb.addRule(j.params.idSource, j.params.ruleTag, j.params.jsonRule));
                    break;
                case 'removeRule':
                    reply = JSON.stringify(kb.removeRule(j.params.idSource, j.params.idRule));
                    break;
                case 'queryBind':
                    reply = JSON.stringify(kb.queryBind(j.params.jsonReq));
                    break;
                case 'queryFact':
                    reply = JSON.stringify(kb.queryFact(j.params.jsonReq));
                    break;
                case 'subscribe':
                    // tslint:disable-next-line:max-line-length
                    const callback = (r: any) => {
                        try {
                            ws.send(JSON.stringify(r));
                        } catch (e) { console.log(e); }
                    };
                    reply = JSON.stringify(kb.subscribe(j.params.idSource, j.params.jsonReq, callback));
                    break;
                default:
                    reply = JSON.stringify(new kb.Response(false, 'Method not allowed'));
            }
        } catch (e) {
            console.log(e);
        }
        console.log('reply: ' + reply)
        ws.send(reply);
    });

});

console.log('Server started at port ' + port);
