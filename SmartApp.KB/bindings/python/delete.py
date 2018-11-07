import sys
import kb

# Assume input is always well-formatted (check in the bash)
idSource = sys.argv[1]
jsonReq = sys.argv[2]
# TODO: maybe add some type checking
print(kb.removeFact(idSource, jsonReq))
