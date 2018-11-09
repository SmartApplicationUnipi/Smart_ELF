import json

import sys

sys.path.insert(0, '../SmartApp.KB/')

from kb import *

myID = register()



#print(queryBind({"text_f_audio": "$x"}))



def callbfun(res):
    print("callback:")
    print(res)

subscribe(myID, {"TAG":"text_f_audio","text": "$x","emotion": "$y"}, callbfun)