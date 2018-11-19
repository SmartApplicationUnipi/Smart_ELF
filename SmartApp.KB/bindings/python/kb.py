import websocket
import json
import typing
import threading
import configparser
import os

from websocket import create_connection

base_dir = os.path.dirname(os.path.abspath(__file__))

cParser = configparser.RawConfigParser()
configFilePath = r'./config2'

cParser.read(os.path.join(base_dir, configFilePath))

port = cParser.get('host-config','port')
host = cParser.get('host-config','host-name')

def register(tags: map):
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "register", "params": tags}
	ws.send(json.dumps(req))
	rep = ws.recv()
	ws.close()
	return rep

def registerTagDoc(tags: map):
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "registerTagDoc", "params": tags}
	ws.send(json.dumps(req))
	rep = ws.recv()
	ws.close()
	return rep

def getTagDoc(tags: list):
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "getTagDoc", "params": tags}
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

def addRule(idSource: str, ruleSum: str, jsonRule: map):
    ws = create_connection("%s:%s"%(host,port))
    req = {"method": "addRule", "params": {"idSource": idSource, "ruleSum": ruleSum, "jsonRule": jsonRule}}
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

def queryFact(jsonReq: map):
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "queryFact", "params": {"jsonReq": jsonReq}}
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

def removeRule(idSource: str, idRule: int):
	ws = create_connection("%s:%s"%(host,port))
	req = {"method": "removeRule", "params": {"idSource": idSource, "idRule": idRule}}
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
