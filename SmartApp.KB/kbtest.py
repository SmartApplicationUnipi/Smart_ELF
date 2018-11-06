import json

from kb import *
      
myID = register()

print(addFact(myID, "test", 1, 50, 'false', {"prova": 1}))
print(addFact(myID, "test", 1, 50, 'false', {"prova": 2}))
print(addFact(myID, "test", 1, 50, 'false', {"prova": 3}))

print(removeFact(myID, {"prova": 2}))
print(queryBind({"prova": "$x"}))

def callbfun(res):
    print("callback:")
    print(res)

subscribe(myID, {"prova": "$x"}, callbfun)
addFact(myID, "test", 1, 50, 'false', {"prova": "callb"})