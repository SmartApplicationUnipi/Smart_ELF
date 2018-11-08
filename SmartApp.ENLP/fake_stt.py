"""
This is a fake STT fact inserter
"""
import sys

sys.path.insert(0, '../SmartApp.KB/')

import kb
from interface_tags import TAG_USER_TRANSCRIPT

def __main__():
    myID = kb.register()
    obj_from_stt = {
	"TAG": TAG_USER_TRANSCRIPT,
	"text": "We will build a great wall"
	}
    kb.addFact(myID, TAG_USER_TRANSCRIPT, 1, 100, False, obj_from_stt)

__main__()
