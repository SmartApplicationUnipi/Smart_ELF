This is a first prototype implemetation of the knowledge base.
We do accept feedbacks on this.

Current implementation supports:
* register
* addFact
* queryBind
* subscribe

Will soon support:
* queryFact
* getAndSubscribe

Will later support:
* addRule
* removeRule

This implemetation is in typescript and offers a typescript library and a websocket server interface on node.js



*src/kb.ts* is exporting the typescript module of the knowledge base implementation.

*src/matcher.ts* contains the implementation of the jsonObject matching

*src/server.ts* is the websocket server that can run on node.js.

*test/* contains some function call to test the kb.ts and matcher.ts code

*package.json* is the npm configuration file

*tsconfig.json* is the typescript compiler configuration file

*tslint.json* is a configuration for a typescript linter

*kb.py* is an ugly python3 bind to use the websocketAPI

*kbtest.py* is an ugly test for kb.py library

## HOW TO

If you use typescript you can import directly the *kb.ts* module.

For other languages we provided a websocket communication server in order to interact with this module

In order to run this server you should need `npm` and `tsc`

1. install npm: `sudo apt install npm tsc (or your system equivalent command) `
2. install the necessary module: `npm install`
3. run the test: `npm test`
4. run the websocket server: `npm start`

The server accept websocket connections at `ws://localhost:5666`.

The server awaits for messages in a json-rpc-like format 
```
{ "method": MNAME, "params": { ... } }
```
please refer [https://docs.google.com/document/d/1Cfxh3eiGwdGtffHhX_c1PB0b6AeNFIb_UyT_d-sOtrU](documentation file] and *kb.py* to a sample of usage.


The file *kb.py* gives you a ugly bind in python3 that you can use to invoke kb methods via websocket.

Setting up python virtualenvironment for a local installation:

1. install virtualenv module: `[sudo] pip install virtualenv`
2. create the virtualenvironment: `python3 -m virtualenv venv`
3. activate the virtualenvironment: `source venv/bin/activate`
4. install required packages: `pip install -r requirements.txt`

