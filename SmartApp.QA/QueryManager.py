import sys
from interface_tags import PATH_TO_KB_MODULE, EXPANDED_RULE_FILE_NAME, TAG_ANSWER, TAG_BINDINGS
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient

import logging
import json as json

#  libreria spacy matcher per

"""
This service is used to answer user's query
"""
class QueryManager:

    def __init__(self, kb_ID, logging_lvl):
        self.logging_lvl = logging_lvl
        self.kb_ID = kb_ID
        #logging.basicConfig(stream=sys.stderr, level=logging_lvl)
        logging.info('\tQuery manager Service Handler created')
        self.kb_client = KnowledgeBaseClient(True)


    def write_to_KB(self, fact, tag):
        """
        Post a tuple to the KB
        """
        self.kb_client.addFact(self.kb_ID, tag, 1, 100, fact)
        return

    def perform_query(self, *param):
        """Receive and decide if perform a query or not to the kb
        """
        query = self._get_query_from_kb(param)
        print(query)
        logging.info("\tcallback QueryManager called")
        fact =   {
            "tag": TAG_BINDINGS,
            "raw_data": "Non ho capito. Puoi ripetere?",
            "timestamp" : 1
        }
        self.write_to_KB(fact, TAG_BINDINGS)


    def _get_query_from_kb(self, response):
        """Exctract the user query from the kb response object"""
        answer_arr = response[0] # first field of the tuple. It contains the resp
        #print(answer_arr)
        query = answer_arr["details"][0]["object"]["_data"]["query_text"]
        return query



    def start(self):
        """Subscribe and wait for data"""
        self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_ANSWER, "query_text": "$input"}}, self.perform_query) #
        #self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_USER_TRANSCRIPT, "text": "$input", "language": "$lang"}}, self.answer_query) # from the 'gnlp' module
        logging.info("\tQuery manager service started")


if __name__ == "__main__":

    """global myID
    service_qa = QaService(myID,logging_lvl=logging.DEBUG)
    service_qa.start()"""
