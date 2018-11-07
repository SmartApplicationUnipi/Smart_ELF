from kb import queryFact
import sys
import json

print(queryFact(json.loads(sys.argv[1])))

