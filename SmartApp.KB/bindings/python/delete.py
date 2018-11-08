from kb import removeFact
import sys
import json

# Assume input is always well-formatted (check in the bash)
idSource = sys.argv[1]
jsonReq = sys.argv[2]
# TODO: maybe add some type checking
print(removeFact(idSource, json.loads(jsonReq)))
