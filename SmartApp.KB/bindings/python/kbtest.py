import json

from kb import KnowledgeBaseClient

k = KnowledgeBaseClient(True)
myID = k.register()['details']

registering = k.registerTags(myID, {"RDF": "an rdf triple", "TEST": "test data"})
print(registering)
if (registering['success'] == 0):
     print('registration failed')

def callbfun(res):
    print("callback:")
    print(res)

print(k.subscribe(myID, {"_data":{"prova": "$x"}}, callbfun))


print(k.addFact(myID, "TEST", 1, 50, {"prova": 1}))
print(k.addFact(myID, "TEST", 1, 50, {"prova": 2}))
print(k.addFact(myID, "TEST", 1, 50, {"prova": 3}))

print(k.removeFact(myID, {"_data": {"prova": 2}}))
print(k.queryBind({"_data":{"prova": "$x"}}))

print(k.addFact(myID, "TEST", 1, 50, {"prova": "callb"}))
print(k.addFact(myID, "SBAGLIO", 1, 50, {"prova": 4}))
