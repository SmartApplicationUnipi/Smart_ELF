"""
This is a fake GNLP fact inserter

"""

import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_ANSWER

sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import KnowledgeBaseClient
from interface_tags import TAG_ANSWER

def __main__():
    kb_client = KnowledgeBaseClient(False)
    tags = { TAG_ANSWER : {'desc' : 'Fake by ENLP', 'doc' : 'FAKE by ENLP'} }
    kb_client.registerTags(tags)
    obj_from_erasmus = {
        "tag": TAG_ANSWER,
        "text": "Professor Gervasi is giving classes of the Smart Application course in room L on Wednesday at 14:00",
        "user_query" : "What time Prof. Gervasi teaches Smart Application?",
        "time_stamp" : 1
    }
    myID = 'Fake_Gnlp'
    kb_client.addFact(myID, TAG_ANSWER, 1, 100, obj_from_erasmus)

__main__()
