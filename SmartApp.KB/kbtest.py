import websocket
import json
import threading

from kb import *
      
myID = register()

print(addFact(myID, "test", 1, 50, 'false', {"prova": 1}))
print(addFact(myID, "test", 1, 50, 'false', {"prova": 2}))
print(addFact(myID, "test", 1, 50, 'false', {"prova": 3}))

print(removeFact(myID, {"prova": 2}))
print(query({"prova": "$x"}))

def callbfun(res):
    print("callback:")
    print(res)

t = subscrThr(myID, {"prova": "$x"}, callbfun)
t.start()
addFact(myID, "test", 1, 50, 'false', {"prova": "callb"})
t.join()