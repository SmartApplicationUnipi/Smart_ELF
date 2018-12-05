import websocket
import json
import typing
import threading
import configparser
import os

from websocket import create_connection

base_dir = os.path.dirname(os.path.abspath(__file__))
config_file_path = r'./config-api'

class KnowledgeBaseClient():

	def __init__(self, persistence=true):
		self.persistence = persistence
		self.port, self.host, self.token = self.config_websocket()
		self.websocket = None
		if(persistence):
			self.websocket = create_connection("%s:%s"%(self.host, self.port))

	def config_websocket(self):
		cParser = configparser.RawConfigParser()
		cParser.read(os.path.join(base_dir, config_file_path))
		port = cParser.get('host-config','port')
		host = 'ws://127.0.0.1'#cParser.get('host-config','host-name')
		token = cParser.get('security', 'token')
		return port, host, token

	def get_websocket(self):
		if(self.persistence): # TODO: controllo se persistente E se e' viva
			return self.websocket
		self.websocket = create_connection("%s:%s"%(self.host, self.port))

	def close_websocket(self):
		if(not self.persistence):
			self.websocket.close()
	
	# this method sends a message on a websocket
	# the message format to the knowledge base api is
	# { "method": METHODNAME, "params": PARAMSOBJECT, "token": TOKEN}
	# METHODNAME is the method name
	# PARAMSOBJECT is a map in which each key is the name of the parameter
	# TOKEN is the authentiation tocken string
	def remote_call(self, method: str, params: map ):
		
		request = {"method": method, "params": params, "token": self.token}
		self.get_websocket()
		self.websocket.send(json.dumps(request))
		reply = json.loads(self.websocket.recv())
		self.close_websocket()
		return reply

	def register(self):
		return self.remote_call("register", {})
	# used as a login
	def registerTags(self, idSource: str, tagsList: map):
		return self.remote_call("registerTags", {"idSource": idSource, "tagsList": tagsList})

	def getTagDetails(self, tagsList: list):
		return self.remote_call("getTagDetails", {"tagsList": tagsList})

	def getAllTags(self, includeShortDesc):
		return self.remote_call("getAllTags", {"includeShortDesc": includeShortDesc})

	def addFact(self, idSource: str, tag: str, TTL: int, reliability: int, jsonFact: map):
		return self.remote_call("addFact", {"idSource": idSource, "tag":tag, "TTL": TTL, "reliability": reliability, "jsonFact": jsonFact} )

	def addRule(self, idSource: str, tag: str, jsonRule: str):
		return self.remote_call("addRule", {"idSource": idSource, "tag": tag, "jsonRule": jsonRule})

	def updateFactByID(self, idFact:str, idSource: str, tag: str, TTL: int, reliability: int, jsonFact: map ):
		return self.remote_call("updateFactByID", {"idFact": idFact, "idSource": idSource, "tag": tag, "TTL": TTL, "reliability": reliability, "jsonFact": jsonFact} )

	def query(self, jsonReq: map):
		return self.remote_call("query",{ "jsonReq": jsonReq })

	def queryBind(self, jsonReq: map):
		return self.remote_call("queryBind", {"jsonReq": jsonReq})

	def queryFact(self, jsonReq: map):
		return self.remote_call("queryFact", {"jsonReq": jsonReq})
	
	def removeFact(self, idSource: str, jsonReq: map):
		return self.remote_call("removeFact", {"idSource": idSource, "jsonReq": jsonReq})

	def removeRule(self, idSource: str, idRule: int):
		return self.remote_call("removeRule", {"idSource": idSource, "idRule": idRule})

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
		while(1):
			try:
				reply  = self.websocket.recv()
			except:
				print("subcription socket error")
				return 0
			self.callback(json.loads(reply))
