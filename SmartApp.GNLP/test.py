import json
import pprint
import sys

PATH_TO_KB_MODULE = '../SmartApp.KB/bindings/python/'
sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import *
from nlp import *

KBC = KnowledgeBaseClient(True)

#addFact(myID, "JOKE", 1, 50, 'false', { "INFO" : "JOKE",
#										"TEXT": "Hear about the new restaurant called Karma? There’s no menu: You get what you deserve."})



print(KBC.addFact('GNLP', "AV_IN_TRANSC_EMOTION", 1, 50, {"time_stamp": 1,
									          "text": "At which time Prof Poloni has lecture?"} ) )
