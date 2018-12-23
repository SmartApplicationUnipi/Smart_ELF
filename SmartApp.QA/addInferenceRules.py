"""
Script created to test the inference engine of the Knowledge Base
"""
import sys
from interface_tags import PATH_TO_KB_MODULE
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient

client = KnowledgeBaseClient(False)
kb_id = (client.register())['details']

rules = [
    '{"_meta":{"tag":"TEACHING"}, "teach": "$prof", "room": "$room", "course" : "$course" } <- {"_meta":{"tag":"crawler_course"}, "_data":{"data": {"name" : "$course", "teacher_name": "$prof"}}};{"_meta":{"tag":"crawler_room_event"},"_predicates":[["containsString", ["$course2", "$course"]]], "_data": {"data": {"aula" : "$room", "descrizione" : "$course2"}}}'
    #'{"_meta":{"tag":"TEACHING"}, "teach": "$prof", "room": "$room", "course" : "$course" } <- {"_meta":{"tag":"crawler_course"}, "_data":{"data": {"name" : "$course", "teacher_name": "$prof"}}};{"_meta":{"tag":"crawler_room_event"}, "_data": {"data": {"aula" : "$room", "descrizione" : "$course"}}}'
    #'{"tag":"teaching": "$prof", "room": "$room", "course" : "$course" } <- {"data":{"name" : "$course", "teacher_name": "$prof"}};{"data":{"aula" : "$room", "descrizione" : "$course"}}'
]
"""client.removeRule(kb_id,2)
for rule in rules:
    x = client.addRule(kb_id, "ENLP_EMOTIVE_ANSWER", rule)
    print(x)
"""
#print(client.query({"_data" : {"name" : "nlpcourse", "teacher_name": "Giuseppe Attardi"}}))
#print(client.query({"_data" : {"aula" : "$X1", "descrizione": "nlpcourse"}}))


res = client.query({"_data": {"teach" : "GIUSEPPE ATTARDI", "room" : "$x"}})
#res = client.query({"_data":{"teach":"$x"}})

print(res)

# DO NOT THIS ANYMORE
#res = client.query({"_data": "$x"})
