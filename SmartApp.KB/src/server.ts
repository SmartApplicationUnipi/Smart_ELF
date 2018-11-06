import * as WebSocket from 'ws';
import * as kb from './kb';

const port = 5666;

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
                    reply = kb.register();
                    break;
                case 'addFact':
                    // tslint:disable-next-line:max-line-length
                    kb.addFact(j.params.idSource, j.params.infoSum, j.params.TTL, j.params.reli, j.params.revi, j.params.jsonFact);
                    reply = 'done';
                    break;
                case 'removeFact':
                    if (kb.removeFact(j.params.idSource, j.params.jsonReq)) {
                        reply = 'done';
                    }
                    break;
                case 'queryBind':
                    const res = kb.queryBind(j.params.jsonReq);
                    reply = JSON.stringify(res);
                    break;
                case 'subscribe':
                    // tslint:disable-next-line:max-line-length
                    const callback = (r: any) => {
                        try { ws.send(JSON.stringify(r));
                        } catch (e) { console.log(e); }
                    } ;
                    if (kb.subscribe(j.params.idSource, j.params.jsonReq, callback )) {
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
