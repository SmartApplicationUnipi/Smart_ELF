import json

from kb import KnowledgeBaseClient

k = KnowledgeBaseClient(True)

myID = k.register()

print(k.addFact(myID, "test", 1, 50, 'false', {"prova": 1}))
print(k.addFact(myID, "test", 1, 50, 'false', {"prova": 2}))
print(k.addFact(myID, "test", 1, 50, 'false', {"prova": 3}))

print(k.removeFact(myID, {"prova": 2}))
print(k.queryBind({"prova": "$x"}))

def callbfun(res):
    print("callback:")
    print(res)

k.subscribe(myID, {"prova": "$x"}, callbfun)
k.addFact(myID, "test", 1, 50, 'false', {"prova": "callb"})
