"""
This is a fake GNLP fact inserter

N.B.: IT'S NOT UPDATED ANYMORE!!!!!!
"""
import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_ANSWER

sys.path.insert(0, PATH_TO_KB_MODULE)

import kb
from interface_tags import TAG_ANSWER

def __main__():
    myID = kb.register()
    obj_from_erasmus = {
        "TAG": TAG_ANSWER,
        "text": "Professor Gervasi is giving classes of the Smart Application course in room L on Wednesday at 14:00"
    }
    kb.addFact(myID, "GNLP_ANSWER", 1, 100, False, obj_from_erasmus)

__main__()
