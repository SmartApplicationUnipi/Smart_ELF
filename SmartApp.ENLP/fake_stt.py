"""
This is a fake STT fact inserter
"""
import sys
from interface_tags import PATH_TO_KB_MODULE

sys.path.insert(0, PATH_TO_KB_MODULE)

import kb
from interface_tags import TAG_USER_TRANSCRIPT

def __main__():
    myID = kb.register()
    obj_from_stt = {
	"TAG": TAG_USER_TRANSCRIPT,
	"text": "We will build a great wall",
    "language": "en"
	}
    kb.addFact(myID, TAG_USER_TRANSCRIPT, 1, 100, False, obj_from_stt)

__main__()
