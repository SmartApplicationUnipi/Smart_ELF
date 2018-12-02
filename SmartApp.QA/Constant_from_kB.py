import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_PROF, TAG_COURSE, TAG_ROOM
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient
import logging
import templates as tp


"""
This service is used to answer user's query
"""
class ConstantFromkB:

    def __init__(self, kb_ID, logging_lvl):
        self.logging_lvl = logging_lvl
        self.kb_ID = kb_ID
        #logging.basicConfig(stream=sys.stderr, level=logging_lvl)
        logging.info('\tConstant_from_kB Service started')
        self.kb_client = KnowledgeBaseClient(True)

    def get_constants(self, *param):
        a = 2
        print("printing param", param)
        return

    def start(self):
        """Subscribe and wait for data"""
        a = self.kb_client.query( {"_data": {"tag": "NLP_ANSWER"}})
        print( "results:\n",a)
        #self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_USER_TRANSCRIPT, "text": "$input", "language": "$lang"}}, self.answer_query) # from the 'gnlp' module
        logging.info("\tConstant form Kb service started")


if __name__ == "__main__":

    global myID
    service_qa = ConstantFromkB(myID,logging_lvl=logging.DEBUG)
    service_qa.start()
