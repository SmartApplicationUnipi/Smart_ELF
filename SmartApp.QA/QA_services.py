import sys
from interface_tags import PATH_TO_KB_MODULE
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient
import logging
import templates as tp


"""
This service is used to answer user's query
"""
class QaService:

    def __init__(self, kb_ID, logging_lvl):
        self.logging_lvl = logging_lvl
        self.kb_ID = kb_ID
        #logging.basicConfig(stream=sys.stderr, level=logging_lvl)
        logging.info('\tETT Service started')
        self.kb_client = KnowledgeBaseClient(True)
        self.query_prof, self.q_prof_answ, self.query_corso, self.q_corso_answ,\
        self.dict_q_aule, self.dict_answ_aule = tp.init_templates_dict()

    def write_to_KB(self, fact, tag):
        """
        Post a tuple to the KB
        """
        self.kb_client.addFact(self.kb_ID, tag, 1, 100, fact)
        return

    def answer_query(self, *param):
        """This function is called by KB once a user ask a question.
           A number of strategies will be tried, in the following order:
           - exact template matching (user's query is = to a question in
                                      simple_queries.py)
           - tree templates matching
           - DRS extraction from the provided
        """
        input_q = param[0][0][0]["$input"]


    def qa_exact_temp_matching(input_q):
        """This function tries to match exactly the query of a user to a
        template. Templates are in templates.py file in this module
        If a match is found this function returns True
        """

        input_q = param[0][0][0]["$input"]
        # try to match
        res_1 = check_exact_match(input_q, query_prof, q_prof_ans, ["professor", "professore", "prof"])
        if (res[0] is True):
            # perform query to kb
            # produce answer
            return True
        else:
            res = check_exact_match(input_q, query_corso, q_corso_answ, ["corso", "corso di"])
            if (res[0] = True):
                # perform query to kb
                #produce answer
                return True
            else:
                res = check_exact_match(input_q, query_corso, q_corso_answ, ["aula"])
                if (res[0] = True):
                    # perform query to kb
                    #produce answer
                    return True
                else:
                    return False


    def start(self):
        """Subscribe and wait for data"""
        self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_USER_TRANSCRIPT, "text": "$input", "language": "$lang"}}, self.answer_query) # from the 'gnlp' module
        logging.info("QA service started")


if __name__ == "__main__":

    global myID
    service_qa = QaService(myID,logging_lvl=logging.DEBUG))
    service_qa.start()
