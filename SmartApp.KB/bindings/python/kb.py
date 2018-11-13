import websocket
import json
import typing
import threading
import configparser
import os

from websocket import create_connection

base_dir = os.path.dirname(os.path.abspath(__file__))
<<<<<<< HEAD

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
=======
config_file_path = r'./kb_api_config'

class KnowledgeBaseClient():

	def __init__(self, persistence):
		self.persistence = persistence
		self.port, self.host, self.token = self.config_websocket()
		self.ws = None
		if(persistence):
			self.ws = create_connection("%s:%s"%(self.host, self.port))
		
		
	def config_websocket(self):
		
		cParser = configparser.RawConfigParser()
		cParser.read(os.path.join(base_dir, config_file_path))
		port = cParser.get('host-config','port')
		host = cParser.get('host-config','host-name')
		token = cParser.get('security', 'token')
		return port, host, token

	def create_ws(self):
		if(self.persistence): # controllo se persistente E se e' viva
			return self.ws
		self.ws = create_connection("%s:%s"%(self.host, self.port))
		return self.ws

	def close_ws(self):
		if(not self.persistence):
			self.ws.close()

	def register(self):
		ws = self.create_ws()
		req = {"method": "register", "params": { "token": self.token }}
		ws.send(json.dumps(req))
		rep = ws.recv()
		self.close_ws()
		return rep		

	def addFact(self, idSource: str, infoSum: str, TTL: int, reliability: int, revisioning: bool, jsonFact: map):
		ws = self.create_ws()
		req = {"method": "addFact", "params": {"idSource": idSource, "infoSum":infoSum, "TTL": TTL, "reliability":reliability, "revisioning": revisioning, "jsonFact": jsonFact}}
		ws.send(json.dumps(req))
		rep = ws.recv()
		self.close_ws()
		return rep

	def addRule(self, idSource: str, ruleSum: str, jsonRule: map):
	    ws = self.create_ws()
	    req = {"method": "addRule", "params": {"idSource": idSource, "ruleSum": ruleSum, "jsonRule": jsonRule}}
	    ws.send(json.dumps(req))
	    rep = ws.recv()
	    self.close_ws()
	    return rep

	def queryBind(self, jsonReq: map):
		ws = self.create_ws()
		req = {"method": "queryBind", "params": {"jsonReq": jsonReq}}
		ws.send(json.dumps(req))
		rep = json.loads(ws.recv())
		self.close_ws()
		return rep

	def queryFact(self, jsonReq: map):
		ws = self.create_ws()
		req = {"method": "queryFact", "params": {"jsonReq": jsonReq}}
		ws.send(json.dumps(req))
		rep = json.loads(ws.recv())
		self.close_ws()
		return rep

	def removeFact(self, idSource: str, jsonReq: map):
		ws = self.create_ws()
		req = {"method": "removeFact", "params": {"idSource": idSource, "jsonReq": jsonReq}}
		ws.send(json.dumps(req))
		rep = ws.recv()
		self.close_ws()
		return rep

	def removeRule(self, idSource: str, idRule: int):
		ws = self.create_ws()
		req = {"method": "removeRule", "params": {"idSource": idSource, "idRule": idRule}}
		ws.send(json.dumps(req))
		rep = ws.recv()
		self.close_ws()
		return rep

	def subscribe(self, idSource: str, jsonReq: map, callback):
		ws = self.create_ws()
		req = {"method": "subscribe", "params": {"idSource": idSource, "jsonReq": jsonReq}}
		ws.send(json.dumps(req))
		rep = ws.recv()
		if (rep == "done"):
			t = subscrThr(ws, callback)
			t.start()
		return rep
>>>>>>> kb: add token to api


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
