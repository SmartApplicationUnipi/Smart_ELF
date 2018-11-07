from kb import *
import sys

idSource = sys.argv[1]
infoSum = sys.argv[2]
TTL = 1
reliability = 100
revisioning = True
jsonFact = sys.argv[3]

addFact(idSource, infoSum, 1, 100, True, jsonFact)
