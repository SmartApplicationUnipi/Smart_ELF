import json
import pprint
import sys

PATH_TO_KB_MODULE = '../SmartApp.KB/bindings/python/'
sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import *
from nlp import *

class GNLP_Service:
	
	def __init__(self):
		self.ID = register()
		print("Registered to the KB")
	
	def callback(self, res):
		'''
		Callback that analyse the user query and generates a response
		TODO: Handle the different intents and querys the KB for the
			needed informations
		'''
		
		question = res[0]["$input"]["text"]
		analysis = NLP_Understand(question)

		query = queryBind({"INFO": "JOKE",
						   "TEXT" : "$joke"
							})
			
		answer = ""				
		
		if len(query) == 0:
			answer = "I don't have any jokes for you at the moment, sorry!"
		else:
			answer = query[0]["$joke"]
		
		addFact(self.ID, "NLP_Answer", 1, 50, 'false', { "TAG" : "NLP_Answer",
													  "TEXT": answer,
													  "USER_QUERY": question,
													  "TIME_STAMP": 1 # TODO
													  })
		
		# Logging some infos
		print("Callback")
		pp = pprint.PrettyPrinter()
		pp.pprint(analysis)
		print("str: ", end="")
		print(question)
		print (answer)	
		
	def start_service(self):
		
		subscribe(self.ID, {"text_f_audio": "$input"}, self.callback)
		print("Subscribed to the KB")


if __name__ == '__main__':
	
	gnlp = GNLP_Service()
	gnlp.start_service()
	
