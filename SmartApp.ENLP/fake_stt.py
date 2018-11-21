"""
This is a fake STT fact inserter

N.B.: IT'S NOT UPDATED ANYMORE!!!!!!
"""
import sys
from interface_tags import PATH_TO_KB_MODULE

sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import KnowledgeBaseClient
from interface_tags import TAG_USER_TRANSCRIPT

def __main__():
    kb_client = KnowledgeBaseClient(False)
    kb_client.registerTags({ TAG_USER_TRANSCRIPT : {'desc' : 'Fake by ENLP', 'doc' : 'FAKE by ENLP'} })
    obj_from_stt = {
	"tag": TAG_USER_TRANSCRIPT,
	"text": "We will build a great wall",
    "language": "en"
	}
    myID='fake_stt'
    kb_client.addFact(myID, TAG_USER_TRANSCRIPT, 1, 100, obj_from_stt)

__main__()
