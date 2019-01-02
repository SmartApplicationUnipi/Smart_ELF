"""
This is a fake STT fact inserter

"""
import sys
from interface_tags import PATH_TO_KB_MODULE

sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import KnowledgeBaseClient
from interface_tags import TAG_USER_TRANSCRIPT

def __main__():
    kb_client = KnowledgeBaseClient(False)
    kb_ID = (kb_client.register())['details']
    kb_client.registerTags(kb_ID, { TAG_USER_TRANSCRIPT : {'desc' : 'Fake by ENLP', 'doc' : 'FAKE by ENLP'} })
    obj_from_stt = {
	"tag": TAG_USER_TRANSCRIPT,
    "timestamp" : 7,
    "ID": "fake_stt",
	"text": "We will build a great wall",
    "language": "en",
    "valence" :0.5,
    "arousal" : 0.5
	}
    res = kb_client.addFact(kb_ID, TAG_USER_TRANSCRIPT, 1, 100, obj_from_stt)
    print(res)

__main__()
