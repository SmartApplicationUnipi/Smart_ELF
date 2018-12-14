"""
This is a fake GNLP fact inserter, fake STT and fake vision


"""
import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_ANSWER, TAG_VISION, TAG_USER_TRANSCRIPT
import datetime
import time

sys.path.insert(0, PATH_TO_KB_MODULE)

from kb import KnowledgeBaseClient

def __main__():
    kb_client = KnowledgeBaseClient(False)
    kb_ID = (kb_client.register())['details']

    tags = [{ TAG_ANSWER : {'desc' : 'Fake by ENLP', 'doc' : 'FAKE by ENLP'}},
            { TAG_VISION : {'desc' : 'Fake by ENLP', 'doc' : 'FAKE by ENLP'}},
            { TAG_USER_TRANSCRIPT : {'desc' : 'Fake by ENLP', 'doc' : 'FAKE by ENLP'}}]
    kb_client.registerTags(kb_ID, tags[0])
    kb_client.registerTags(kb_ID, tags[1])
    kb_client.registerTags(kb_ID, tags[2])

    obj_from_vision = {
        "tag": TAG_VISION,
        "is_interlocutor" : "True",
        "time_stamp" : str(datetime.datetime.now()),
        'emotion': {
            'sadness':   0.34,
            'calm':      0.48,
            'disgust':   0.54,
            'anger':     0.67,
            'surprise':  0.77,
            'fear':      0.54,
            'happiness': 0.23
            }
        }
    obj_from_erasmus = {
        "tag": TAG_ANSWER,
        "text": "Risposta degli erasmus. bla bla bla",
        "user_query" : "Dove è la lezione del professor attardi?",
        "time_stamp" : 1,
        "language" : "it"
    }

    obj_from_stt = {
    	"tag": TAG_USER_TRANSCRIPT,
    	"text": "Dove è la lezione del professor attardi",
        "language": "it"
	}

    print("sending Vision data:")
    res = kb_client.addFact(kb_ID, TAG_VISION, 1, 100, obj_from_vision)
    print("vision data response:")
    print(res)
    time.sleep(1)

    print("sending STT data:")
    res = kb_client.addFact(kb_ID, TAG_USER_TRANSCRIPT, 1, 100, obj_from_stt)
    print("STT data response:")
    print(res)
    time.sleep(1)

    print("sending erasmus data:")
    res = kb_client.addFact(kb_ID, TAG_ANSWER, 1, 100, obj_from_erasmus)
    print("erasmus data response:")
    print(res)

__main__()
