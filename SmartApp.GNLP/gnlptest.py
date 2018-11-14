import json
import pprint
import sys

PATH_TO_KB_MODULE = '../SmartApp.KB/bindings/python/'
sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import *
from nlp import *
      
myID = register()

#print(queryBind({"string_req": "$input"}))
    
def nlp_callb(res):
	question = res[0]["$input"]["text"]
	analysis = NLP_Understand(question)
	print("Callback")
	pp = pprint.PrettyPrinter()
	pp.pprint(analysis)
	print("str: ", end="")
	print(question)

	answer = "Hi, I'm Elf"

	addFact(myID, "NLP_Answer", 1, 50, 'false', { "TAG" : "NLP_Answer",
												  "TEXT": answer,
												  "USER_QUERY": question,
												  "TIME_STAMP": 1 # TODO
												  })

subscribe(myID, {"text_f_audio": "$input"}, nlp_callb)
print("Listening...")

#addFact(myID, "test", 1, 50, 'false', {"text_f_audio": {"time_stamp": "here an integer with the time", "text": "At which time Prof Poloni has lecture?"} })

