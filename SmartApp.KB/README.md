This is a first prototype implemetation of the knowledge base.
We do accept feedbacks on this.

Current implementation supports:
* register
* addFact
* addRule
* removeFact
* removeRule
* queryBind
* queryFact
* subscribe

Will soon support:

* getAndSubscribe

This implemetation is in typescript and offers a typescript library and a websocket server interface on node.js


**src/kb.ts** is exporting the typescript module of the knowledge base implementation.

**src/matcher.ts** contains the implementation of the jsonObject matching.

**src/server.ts** is the websocket server that can run on node.js.

**src/inferenceStub.ts** is a rough implementation of an inference engine with simple plain rules

**test/** contains some function call to test the *kb.ts* and *matcher.ts* code.

**bindings/** contains websocket bindings in different languages (only python currently supported by us)

**cli/** contains command line scripts to interact with *kb.py*

**cli/kbman** a bash script that gives documentation about kb functions

**package.json** is the npm configuration file.

**tsconfig.json** is the typescript compiler configuration file.

**tslint.json** is a configuration for a typescript linter.

**requirements.txt** required packages to run the python binding

## HOW TO

If you use typescript you can import directly the *kb.ts* module.

For other languages we provided a websocket communication server in order to interact with this module

In order to run this server you should need `npm` (or a node.js package manager for your system)  and `tsc` (a typescript compiler)

1. install npm and typescript compiler: `sudo apt install npm node-typescript` (or your system equivalent command to install things)
2. move in `SmartApp.KB` folder 
3. install the necessary module: `npm install`
4. run the test: `npm test`
5. run the websocket server: `npm start`

The server accept websocket connections on port 5666`.

The server awaits for messages in a json-rpc-like format 
```
{ "method": MNAME, "params": { ... }, "token": TOKENSTR }
```
please refer `cli/kbman` script for detailed documentation and *kb.py* to a sample of usage.


The file *kb.py* gives you a ugly bind in python3 that you can use to invoke kb methods via websocket.

Setting up python virtualenvironment for a local installation:

1. install virtualenv module: `[sudo] pip install virtualenv`
2. create the virtualenvironment: `python3 -m virtualenv venv`
3. activate the virtualenvironment: `source venv/bin/activate`

Install the requirements:
4. install required packages: `pip install -r requirements.txt`
