import sys
from interface_tags import PATH_TO_KB_MODULE, EXPANDED_RULE_FILE_NAME, TAG_ANSWER, TAG_BINDINGS, TAG_FINAL_ANSW
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient

import logging
import json as json

#  libreria spacy matcher per

"""
This service is in charge of choosing the best result and forwarding it to the
answer generation module.
"""
class ResultManager:

    def __init__(self, kb_ID, logging_lvl):
        self.logging_lvl = logging_lvl
        self.kb_ID = kb_ID
        #logging.basicConfig(stream=sys.stderr, level=logging_lvl)
        logging.info('\tResult Manager Service Handler created')
        self.kb_client = KnowledgeBaseClient(True)


    def write_to_KB(self, fact, tag):
        """
        Post a tuple to the KB
        """
        self.kb_client.addFact(self.kb_ID, tag, 1, 100, fact)
        return

    def generate_answer(self, *param):
        """Receive and decide if perform a query or not to the kb
        """
        query = self._get_query_from_kb(param)
        print(query)
        logging.info("\tcallback ResultManager called")
        fact =   {
            "tag": TAG_FINAL_ANSW,
            "final_answer": "Non ho capito. Puoi ripetere?",
            "timestamp" : 1
        }
        self.write_to_KB(fact, TAG_FINAL_ANSW)


    def _get_query_from_kb(self, response):
        """Exctract the user query from the kb response object"""
        answer_arr = response[0] # first field of the tuple. It contains the resp
        #print(answer_arr)
        query = answer_arr["details"][0]["object"]["_data"]["raw_data"]
        return query



    def start(self):
        """Subscribe and wait for data"""
        self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_BINDINGS, "raw_data": "$input"}}, self.generate_answer) #
        #self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_USER_TRANSCRIPT, "text": "$input", "language": "$lang"}}, self.answer_query) # from the 'gnlp' module
        logging.info("\tResult manager service started")


if __name__ == "__main__":

    """global myID
    service_qa = QaService(myID,logging_lvl=logging.DEBUG)
    service_qa.start()"""
