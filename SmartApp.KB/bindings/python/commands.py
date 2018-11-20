import sys
import json

from kb import KnowledgeBaseClient

kb = KnowledgeBaseClient(True)

if (sys.argv[1] == "query"): r = kb.queryBind(json.loads(sys.argv[2]))['details']
elif (sys.argv[1] == "addfact"): r = kb.addFact(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6])
elif (sys.argv[1] == "addrule"): r = kb.addRule(sys.argv[2], sys.argv[3], sys.argv[4])
elif (sys.argv[1] == "removefact"): r = kb.removeFact(sys.argv[2], sys.argv[3])
elif (sys.argv[1] == "removerule"): r = kb.removeRule(sys.argv[2], sys.argv[3])
elif (sys.argv[1] == "updatefact"): r = kb.updateFactByID(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], sys.argv[7])
elif (sys.argv[1] == "registertags"): r = kb.registerTags(sys.argv[2])
elif (sys.argv[1] == "tagdetail"): r = kb.getTagDetails(sys.argv[2])
else: r = "invalid argument"
print(r)
