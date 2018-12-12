import sys
from interface_tags import PATH_TO_KB_MODULE
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient

client = KnowledgeBaseClient(False)
kb_id = (client.register())['details']

rules = [
    #'{"teach": "$prof", "room": "$room", "course" : "$course" } <- {"name" : "$course", "teacher_name": "$prof"};{"aula" : "$room", "descrizione" : "$course2"};["containsString", ["$course2", "$course"]]'
    '{"teach": "$prof", "room": "$room", "course" : "$course" } <- {"data":{"name" : "$course", "teacher_name": "$prof"}};{"data":{"aula" : "$room", "descrizione" : "$course"}}'
]
for rule in rules:
    x = client.addRule(kb_id, "ENLP_EMOTIVE_ANSWER", rule)
    print(x)


print(client.query({"_data" : {"name" : "nlpcourse", "teacher_name": "Giuseppe Attardi"}}))
print(client.query({"_data" : {"aula" : "$X1", "descrizione": "nlpcourse"}}))


res = client.query({"_data": {"teach" : "Giuseppe Attardi", "room" : "$x"}})
print(res)

# DO NOT THIS ANYMORE
#res = client.query({"_data": "$x"})
