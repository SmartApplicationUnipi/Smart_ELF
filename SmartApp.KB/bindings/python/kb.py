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
		self.websocket = None
		if(persistence):
			self.websocket = create_connection("%s:%s"%(self.host, self.port))
		
	def config_websocket(self):
		cParser = configparser.RawConfigParser()
		cParser.read(os.path.join(base_dir, config_file_path))
		port = cParser.get('host-config','port')
		host = cParser.get('host-config','host-name')
		token = cParser.get('security', 'token')
		return port, host, token

	def get_websocket(self):
		if(self.persistence): # TODO: controllo se persistente E se e' viva
			return self.websocket
		self.websocket = create_connection("%s:%s"%(self.host, self.port))

	def close_websocket(self):
		if(not self.persistence):
			self.websocket.close()

	def send_request(self, request: map ):
		self.get_websocket()
		self.websocket.send(json.dumps(request))
		reply = json.loads(self.websocket.recv())
		self.close_websocket()
		return reply

	# used as a login 
	def registerTags(self, tagsList: map):
		return self.send_request({"method": "registerTags", "params": {"tagsList": tagsList}, "token": self.token})
 
#	def registerTagDoc(tagsMap: map):
#		return self.send_request({"method": "registerTagDoc", "params": {"tagsMap": tagsMap}, "token": self.token});

	def getTagDetails(self, tagsList: list):
		return self.send_request({"method": "getTagDoc", "params": {"tagsList": tagsList}, "token": self.token})

	def addFact(self, idSource: str, tag: str, TTL: int, reliability: int, jsonFact: map):
		return self.send_request({"method": "addFact", "params": {"idSource": idSource, "tag":tag, "TTL": TTL, "reliability": reliability, "jsonFact": jsonFact} , "token": self.token})

	def addRule(self, idSource: str, tag: str, jsonRule: map):
		return self.send_request({"method": "addRule", "params": {"idSource": idSource, "tag": tag, "jsonRule": jsonRule}, "token": self.token})

	def updateFactByID(self, idFact:str, idSource: str, tag: str, TTL: int, reliability: int, jsonFact: map ):
		return self.send_request({"method": "updateFactByID", "params": {"idFact": idFact, "idSource": idSource, "tag": tag, "TTL": TTL, "reliability": reliability, "jsonFact": jsonFact} , "token": self.token})

	def queryBind(self, jsonReq: map):
		return self.send_request({"method": "queryBind", "params": {"jsonReq": jsonReq}, "token": self.token})

	def queryFact(self, jsonReq: map):
		return self.send_request({"method": "queryFact", "params": {"jsonReq": jsonReq}, "token": self.token})

	def removeFact(self, idSource: str, jsonReq: map):
		return self.send_request({"method": "removeFact", "params": {"idSource": idSource, "jsonReq": jsonReq}, "token": self.token})

	def removeRule(self, idSource: str, idRule: int):
		return self.send_request({"method": "removeRule", "params": {"idSource": idSource, "idRule": idRule}, "token": self.token})

	def subscribe(self, idSource: str, jsonReq: map, callback):
		websocketSub = create_connection("%s:%s"%(self.host, self.port))
		request = {"method": "subscribe", "params": {"idSource": idSource, "jsonReq": jsonReq}, "token": self.token}
		websocketSub.send(json.dumps(request))
		reply = json.loads(websocketSub.recv())
		if (reply['success']):
			t = subscrThr(websocketSub, callback)
			t.start()
		return reply

class subscrThr (threading.Thread):
	def __init__(self, websocket, callback):
		threading.Thread.__init__(self)
		self.callback = callback
		self.websocket = websocket
	def run(self):
		try:
			while(1):
				reply = self.websocket.recv()
				self.callback(json.loads(reply))
		except:
			print("subcription socket error")
