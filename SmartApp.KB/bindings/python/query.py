from kb import queryBind
import sys
import json

print(queryBind(json.loads(sys.argv[1])))

