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
    tags = { "crawler_room" : {'desc' : 'Fake by ENLP', 'doc' : 'FAKE by ENLP'} }
    kb_client.registerTags(kb_ID, tags)
    obj_from_erasmus = {

        "object": {
            "_data": {
                "source": "http://margot.di.unipi.it/test12/goa/2018/1/getfullroomlist",
                "tag": "crawler_room",
                "timestamp": 1543596093462,
                "type": "json",
                "data": {
                    "name": "Fib C",
                    "seats": "217",
                    "location": "piano terra",
                    "building": "Polo Fibonacci B",
                    "features": "VHRA",
                    "note": "",
                    "owner": [
                        "Ateneo",
                        "Fisica",
                        ":Fisica",
                        "Informatica",
                        ":Informatica",
                        "Fibonacci"
                    ],
                    "guest": [],
                    "class": {
                        "Ateneo": "0",
                        "Fisica": "1",
                        ":Fisica": "1",
                        "Informatica": "3",
                        ":Informatica": "3"
                    }
                }
            },
            "_id": 3,
            "_meta": {
                "idSource": "id4",
                "tag": "crawler_room",
                "creationTime": "30/11/2018",
                "TTL": 1,
                "reliability": 100
            }
        },
        "binds": [
            {
                "$X": {
                    "source": "http://margot.di.unipi.it/test12/goa/2018/1/getfullroomlist",
                    "tag": "crawler_room",
                    "timestamp": 1543596093462,
                    "type": "json",
                    "data": {
                        "name": "Fib A",
                        "seats": "217",
                        "location": "piano terra",
                        "building": "Polo Fibonacci B",
                        "features": "VHRA",
                        "note": "",
                        "owner": [
                            "Ateneo",
                            "Fisica",
                            ":Fisica",
                            "Informatica",
                            ":Informatica",
                            "Fibonacci"
                        ],
                        "guest": [],
                        "class": {
                            "Ateneo": "0",
                            "Fisica": "1",
                            ":Fisica": "1",
                            "Informatica": "3",
                            ":Informatica": "3"
                        }
                    }
                }
            }
        ]
    }
    res = kb_client.addFact(kb_ID, "crawler_room", 1, 100, obj_from_erasmus)
    print(res)

__main__()
