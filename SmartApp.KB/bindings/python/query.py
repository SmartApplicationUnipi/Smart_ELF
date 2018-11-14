from kb import queryBind
import sys
import json

print(json.dumps(queryBind(json.loads(sys.argv[1])), indent=2, sort_keys=True))

