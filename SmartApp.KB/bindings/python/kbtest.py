import json

from kb import KnowledgeBaseClient

k = KnowledgeBaseClient(True)

registering = k.register({"RDF": "an rdf triple", "TEST": "test data"})
if (registering['success'] == 1):
     print('registration failed')
myID = registering['details']


print(k.addFact(myID, "TEST", 1, 50, {"prova": 1}))
print(k.addFact(myID, "TEST", 1, 50, {"prova": 2}))
print(k.addFact(myID, "TEST", 1, 50, {"prova": 3}))

print(k.removeFact(myID, {"prova": 2}))
print(k.queryBind({"_data":{"prova": "$x"}}))

def callbfun(res):
    print("callback:")
    print(res)

print(k.subscribe(myID, {"_data":{"prova": "$x"}}, callbfun))

print(k.addFact(myID, "TEST", 1, 50, {"prova": "callb"}))
