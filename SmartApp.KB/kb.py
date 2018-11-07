import websocket
import json
import typing
import threading

from websocket import create_connection
port = 5666
host = 'ws://131.114.3.213'

def register():
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "register", "params": {}}
	ws.send(json.dumps(req))
	rep = ws.recv()
	ws.close()
	return rep

def addFact(idSource: str, infoSum: str, TTL: int, reliability: int, revisioning: bool, jsonFact: map):
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "addFact", "params": {"idSource": idSource, "infoSum":infoSum, "TTL": TTL, "reliability":reliability, "revisioning": revisioning, "jsonFact": jsonFact}}
	ws.send(json.dumps(req))
	rep = ws.recv()
	ws.close()
	return rep

def queryBind(jsonReq: map):
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "queryBind", "params": {"jsonReq": jsonReq}}
	ws.send(json.dumps(req))
	rep = json.loads(ws.recv())
	ws.close()
	return rep

def removeFact(idSource: str, jsonReq: map):
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "removeFact", "params": {"idSource": idSource, "jsonReq": jsonReq}}
	ws.send(json.dumps(req))
	rep = ws.recv()
	ws.close()
	return rep

def subscribe(idSource: str, jsonReq: map, callback):
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "subscribe", "params": {"idSource": idSource, "jsonReq": jsonReq}}
	ws.send(json.dumps(req))
	rep = ws.recv()
	if (rep == "done"):
		t = subscrThr(ws, callback)
		t.start()
	return rep


class subscrThr (threading.Thread):
	def __init__(self, ws, callback):
		threading.Thread.__init__(self)
		self.callback = callback
		self.ws = ws

	def run(self):
		try:
			while(1):
				rep = self.ws.recv()
				self.callback(json.loads(rep))
		except:
			print("subcription socket error")
