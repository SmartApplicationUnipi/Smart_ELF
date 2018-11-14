from kb import queryFact
import sys
import json

print(json.dumps(queryFact(json.loads(sys.argv[1])), indent=2, sort_keys=True))

