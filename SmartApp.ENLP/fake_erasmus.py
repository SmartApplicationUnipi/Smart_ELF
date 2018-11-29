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
    kb_ID = (kb_client.register())['details']
    tags = { TAG_ANSWER : {'desc' : 'Fake by ENLP', 'doc' : 'FAKE by ENLP'} }
    kb_client.registerTags(kb_ID, tags)
    obj_from_erasmus = {
        "tag": TAG_ANSWER,
        "text": "Professor Attardi",
        "user_query" : "What time Prof. Gervasi teaches Smart Application?",
        "time_stamp" : 1
    }
    res = kb_client.addFact(kb_ID, TAG_ANSWER, 1, 100, obj_from_erasmus)
    print(res)

__main__()
