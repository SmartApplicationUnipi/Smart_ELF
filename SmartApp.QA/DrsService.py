import sys
from interface_tags import PATH_TO_KB_MODULE, EXPANDED_RULE_FILE_NAME, TAG_USER_TRANSCRIPT, TAG_ANSWER
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient
from tree_templates.tree_matcher import match_tree
from drs import drs_matcher
import logging
import json as json
import templates as tp
#  libreria spacy matcher per

"""
This service is used to extract a DRS from a sentence.
After the DRS is built this module shoul produce a query which will be forwarded
to the Query manager module.
"""
class DrsService:

    def __init__(self, kb_ID, logging_lvl):
        self.logging_lvl = logging_lvl
        self.kb_ID = kb_ID
        logging.basicConfig(stream=sys.stderr, level=logging_lvl)
        logging.info('\tDRS Service Handler created')
        self.kb_client = KnowledgeBaseClient(True)


    def write_to_KB(self, fact, tag):
        """
        Post a tuple to the KB
        """
        self.kb_client.addFact(self.kb_ID, tag, 1, 100, fact)
        return

    def answer_query(self, *param):
        """This function extract DRS from a sentence and writes it to the KB
        """
        #TODO write the query
        logging.info("\tCallback DRS called")
        query = self._get_query_from_kb(param)
        question_answered = drs_matcher(query, EXPANDED_RULE_FILE_NAME, self)

        response = {
            "tag": TAG_ANSWER,
            "query_text": "Non ho capito. Puoi ripetere?",
            "time_stamp" : 1
        }
        self.write_to_KB(response, TAG_ANSWER)



    def _get_query_from_kb(self, response):
        """Exctract the user query from the kb response object"""
        answer_arr = response[0] # first field of the tuple. It contains the resp
        #print(answer_arr)
        query = answer_arr["details"][0]["object"]["_data"]["text"]
        return query



    def start(self):
        """Subscribe and wait for data"""
        self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_USER_TRANSCRIPT, "text": "$input"}}, self.answer_query)
        #self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_USER_TRANSCRIPT, "text": "$input", "language": "$lang"}}, self.answer_query) # from the 'gnlp' module
        logging.info("\tDRS service started")


if __name__ == "__main__":

    global myID
    service_drs = DrsService(myID,logging_lvl=logging.DEBUG)
    service_drs.start()
