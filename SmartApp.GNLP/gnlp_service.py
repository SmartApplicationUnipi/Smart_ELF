import json
import pprint
import sys

PATH_TO_KB_MODULE = '../SmartApp.KB/bindings/python/'
sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import *
from nlp import *
from dep_tree import get_dependency_tree

class GNLP_Service:

	def __init__(self):
		self.ID = register()
		print("Registered to the KB")

	def analyse(self, res):
		'''
		Callback that analyse the user query
		TODO: Handle the different intents and querys the KB for the
			needed informations
		'''
		print("Analysing...")


		question = res[0]["$input"]
		luis_analysis = NLP_Understand(question)
		spacy_analysis = get_dependency_tree(question)

		addFact(self.ID, "NLP_ANALYSIS", 1, 50, 'false', {
			"TAG" : "NLP_ANALYSIS",
			"ENTITIES": luis_analysis,
			"DEPENDENCIES": spacy_analysis,
			"USER_QUERY": question,
			"TIME_STAMP": 1 # TODO
			}
		)

		# Logging some infos

		pp = pprint.PrettyPrinter()
		pp.pprint(luis_analysis)
		pp.pprint(spacy_analysis)
		print(question)
		print (answer)

	def answer(self, res):
		'''
		Callback that answer the user query
		'''

		print("Answering...")
		answer = ""

		if len(res) == 0:
			answer = "I don't have any jokes for you at the moment, sorry!"
		else:
			answer = query[0]["$joke"]

		addFact(self.ID, "NLP_ANSWER", 1, 50, 'false', {
			"TAG" : "NLP_ANSWER",
			"TEXT": answer,
			"USER_QUERY": question,
			"TIME_STAMP": 1 # TODO
			}
		)


	def start_service(self):

		TAG_USER_TRANSCRIPT = "AV_IN_TRANSC_EMOTION"
		TAG_CRW_RAW_INFO = "CRAWLER_DATA_ENTRY"
		TAG_REASONER_OUTPUT = "REASONING_FRAME"
		subscribe(self.ID, {"TAG": TAG_USER_TRANSCRIPT, "text": "$input"}, self.analyse)
		subscribe(self.ID, {"TAG": TAG_CRW_RAW_INFO, "data": "$input"}, self.analyse)
		subscribe(self.ID, {"TAG": TAG_REASONER_OUTPUT, "data": "$input"}, self.answer)

		#subscribe(self.ID, {"text_f_audio": "$input"}, self.callback)
		print("Subscribed to the KB")


if __name__ == '__main__':

	gnlp = GNLP_Service()
	gnlp.start_service()
