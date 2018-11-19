import websocket
import json
import typing
import threading
import configparser
import os

from websocket import create_connection

base_dir = os.path.dirname(os.path.abspath(__file__))
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
		if(self.persistence): # TODO: controllo se persistente E se e' viva
			return self.ws
		self.ws = create_connection("%s:%s"%(self.host, self.port))
		return self.ws

	def close_ws(self):
		if(not self.persistence):
			self.ws.close()

	def send_request(self, request:map ):
		ws = self.create_ws()
		ws.send(json.dumps(request))
		rep = json.loads(ws.recv())
		self.close_ws()
		return rep


	def register(self, tags: map):
		return self.send_request({"method": "register", "params": { "tags": tags }, "token": self.token})	

	def addFact(self, idSource: str, tag: str, TTL: int, reliability: int, jsonFact: map):
		return self.send_request({"method": "addFact", "params": {"idSource": idSource, "tag":tag, "TTL": TTL, "reliability":reliability, "jsonFact": jsonFact} , "token": self.token})

	def addRule(self, idSource: str, tag: str, jsonRule: map):
	    return self.send_request({"method": "addRule", "params": {"idSource": idSource, "tag": tag, "jsonRule": jsonRule}, "token": self.token})
	    
	def updateFactByID(self, idFact:str, idSource: str, tag: str, TTL: int, reliability: int, jsonFact: map ):
		return self.send_request({"method": "updateFactByID", "params": {"idFact": idFact, "idSource": idSource, "tag":tag, "TTL": TTL, "reliability":reliability, "jsonFact": jsonFact} , "token": self.token})

	def queryBind(self, jsonReq: map):
		return self.send_request({"method": "queryBind", "params": { "jsonReq": jsonReq}, "token": self.token})
		
	def queryFact(self, jsonReq: map):
		return self.send_request({"method": "queryFact", "params": { "jsonReq": jsonReq}, "token": self.token})

	def removeFact(self, idSource: str, jsonReq: map):
		return self.send_request({"method": "removeFact", "params": {"idSource": idSource, "jsonReq": jsonReq}, "token": self.token})

	def removeRule(self, idSource: str, idRule: int):
		return self.send_request({"method": "removeRule", "params": {"idSource": idSource, "idRule": idRule}, "token": self.token})

	def subscribe(self, idSource: str, jsonReq: map, callback):
		rep =  self.send_request({"method": "subscribe", "params": {"idSource": idSource, "jsonReq": jsonReq}, "token": self.token})
		if (rep['success']):
			t = subscrThr(self.ws, callback)
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
