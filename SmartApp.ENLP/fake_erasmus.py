"""
This is a fake GNLP fact inserter
"""
import sys

sys.path.insert(0, '../SmartApp.KB/')

import kb
from constants import TAG_ANSWER

def __main__():
    myID = kb.register()    
    obj_from_erasmus = {

        TAG_ANSWER: "Professor Gervasi is giving classes of the Smart Application course in room L on Wednesday at 14:00"
    }
    kb.addFact(myID, "GNLP_ANSWER", 1, 100, False, obj_from_erasmus)

__main__()
