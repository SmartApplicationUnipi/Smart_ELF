import json
import pprint
import sys

PATH_TO_KB_MODULE = '../SmartApp.KB/bindings/python/'
sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import KnowledgeBaseClient
from nlp import *
from dep_tree import get_dependency_tree

class GNLP_Service:

	def __init__(self):
		listTag = {'NLP_ANSWER': {'desc': 'general_nlp_answer', 'doc': 'nlp_answer_doc'}, 'NLP_ANALYSIS': {'desc': 'parse_trees_and_entity_rec', 'doc': 'nlp_analysis_doc'}}
		self.KBC = KnowledgeBaseClient(True)
		self.ID = (self.KBC.register())['details']
		nlp_answer_info = {'desc': 'Query answer from General NLP', 'doc': 'doc about nlp_answer'}
		nlp_analysis_info = {'desc': 'Query analysis from General NLP', 'doc': 'doc about nlp_analysis'}
		self.KBC.registerTags(self.ID, {'NLP_ANSWER': nlp_answer_info, 'NLP_ANALYSIS': nlp_analysis_info})
		print("Registered to the KB")

	def analyse(self, *res):
		'''
		Callback that analyse the user query
		TODO: Handle the different intents and querys the KB for the
			needed informations
		'''
		print("Analysing...")

		print(res)
		obj      = res[0]['details'][0]['object']['_data']
		question = obj['text']
		lang     = obj['language']
		ts		 = obj['timestamp']
		print(question)
		#question = question['text']
		luis_analysis = NLP_Understand(question, language = lang)
		spacy_analysis = get_dependency_tree(question, language = lang)
		self.KBC.addFact(self.ID, "NLP_ANALYSIS", 1, 50, {
			"tag" : "NLP_ANALYSIS",
			"language": lang,
			"entities": luis_analysis,
			"dependencies": spacy_analysis,
			"user_query": question,
			"timestamp": ts
			}
		)
		# Logging some infos

		pp = pprint.PrettyPrinter()
		pp.pprint(luis_analysis)
		pp.pprint(spacy_analysis)
		print(question)

		self.answer(question, lang, ts)

	def answer(self, question, lang, ts):
		'''
		Callback that answer the user query
		'''

		print("Answering...")
		answer = "I don't have any jokes for you at the moment, sorry!"


		self.KBC.addFact(self.ID, "NLP_ANSWER", 1, 50, {
			"tag" : "NLP_ANSWER",
			"language" : lang,
			"text": answer,
			"user_query": question,
			"timestamp": ts
			}
		)


	def start_service(self):

		TAG_USER_TRANSCRIPT = "AV_IN_TRANSC_EMOTION"
		TAG_CRW_RAW_INFO = "CRAWLER_DATA_ENTRY"
		TAG_REASONER_OUTPUT = "REASONING_FRAME"

		self.KBC.subscribe(self.ID, {"_data": { "tag": TAG_USER_TRANSCRIPT ,"text": "$d", "language": "$lang", "timestamp": "$ts"} }, self.analyse)

		print("Subscribed to the KB")


if __name__ == '__main__':

	gnlp = GNLP_Service()
	gnlp.start_service()
