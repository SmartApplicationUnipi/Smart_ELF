import sys
from interface_tags import PATH_TO_KB_MODULE
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient

client= KnowledgeBaseClient(False)

rules = [
    '{"teach": $prof, "room": $room, "course" : "$course" } <- \
    {"name" : "$course", "teacher_name": "$prof2"}\
    {"aula" : "$room", "descrizione" : "$course2"}\
    ["containsString", ["$prof2", "$prof"]]\
    ["containsString", ["$course2", "$course"]]'
]
for rule in rules:
    client.addRule(124, "ENLP_EMOTIVE_ANSWER", rule)

res = client.query({"_data": {"teach" : "Giuseppe Attardi", "room" : "$x"}})
print(res)
