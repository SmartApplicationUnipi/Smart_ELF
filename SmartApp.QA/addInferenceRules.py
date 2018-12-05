import sys
from interface_tags import PATH_TO_KB_MODULE
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient

client = KnowledgeBaseClient(False)
kb_id = (client.register())['details']

rules = [
    '{"teach": "$prof", "room": "$room", "course" : "$course" } <- {"name" : "$course", "teacher_name": "$prof"};{"aula" : "$room", "descrizione" : "$course2"};["containsString", ["$course2", "$course"]]'
]
for rule in rules:
    x = client.addRule(kb_id, "ENLP_EMOTIVE_ANSWER", rule)
    print(x)

res = client.query({"teach" : "Giuseppe Attardi", "room" : "$x"})
print(res)

# DO NOT THIS ANYMORE
#res = client.query({"_data": "$x"})
