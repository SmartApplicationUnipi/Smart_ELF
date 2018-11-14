import json
import pprint
import sys

PATH_TO_KB_MODULE = '../SmartApp.KB/bindings/python/'
sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import *
from nlp import *
      
myID = register()

#addFact(myID, "JOKE", 1, 50, 'false', { "INFO" : "JOKE",
#										"TEXT": "Hear about the new restaurant called Karma? There’s no menu: You get what you deserve."})



addFact(myID, "test", 1, 50, 'false', {"text_f_audio": {
									   "time_stamp": "here an integer with the time",
									   "text": "At which time Prof Poloni has lecture?"} })
		
		
