import json
import pprint

from kb import *
from nlp import *
      
myID = register()

#print(queryBind({"string_req": "$input"}))

def callbfun(res):
    print("callback:")
    print(res)
    
def nlp_callb(res):
    answer = NLP_Understand(res[0]["$input"]["text"])
    pp = pprint.PrettyPrinter()
    pp.pprint(answer)
    print("str: ", end="")
    print(res[0]["$input"]["text"])
    addFact(myID, "test", 1, 50, 'false', {"NLP_Answer": "Hi, I'm Elf"})

subscribe(myID, {"text_f_audio": "$input"}, nlp_callb)
addFact(myID, "test", 1, 50, 'false', {"text_f_audio": {"time_stamp": "here an integer with the time", "text": "At which time Prof Poloni has lecture?"} })
