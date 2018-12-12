import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_ANSWER
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient
from tree_templates.tree_matcher import match_tree
from drs import f
import logging
import json as json
import templates as tp
#  libreria spacy matcher per


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
        logging.info("\tcallback QA called")
        query = self._get_query_from_kb(param)

        question_answered = self.qa_exact_temp_matching(query)
        if question_answered==True:
            return
        else:
            question_answered = match_tree(answer_arr)
            if question_answered==True:
                return
            else:
                question_answered = f(answer_arr,"TEST_rules+constants.fcfg",self.kb_client,self.kb_ID)
                return question_answered

    def _get_query_from_kb(self, response):
        """Exctract the user query from the kb response object"""
        answer_arr = response[0] # first field of the tuple. It contains the resp
        #print(answer_arr)
        query = answer_arr["details"][0]["object"]["_data"]["user_query"]
        return query



    def qa_exact_temp_matching(self, input_q):
        """This function tries to match exactly the query of a user to a
        template. Templates are in templates.py file in this module
        If a match is found this function returns True
        """

        print("input query: " + input_q)
        # try to match
        res_1 = tp.check_exact_match(input_q, self.query_prof, self.q_prof_answ, ["professor", "professore", "prof"])
        if (res_1[0] is True):
            query = res_1[1]
            query = query.replace("<prof-placeholder>", res_1[3])
            print("Sto per fare la query sulla kB")
            print(query)
            #query = '{"_data": {"tag" : "crawler_course"}}'
            query = json.loads(query)
            resp = self.kb_client.query(query)
            print(resp)

            # produce answer
            return True
        else:
            res = tp.check_exact_match(input_q, self.query_corso, self.q_corso_answ, ["corso", "corso di"])
            if (res[0] == True):
                # perform query to kb
                #produce answer
                return True
            else:
                res = tp.check_exact_match(input_q, self.query_corso, self.q_corso_answ, ["aula"])
                if (res[0] == True):
                    # perform query to kb
                    #produce answer
                    return True
                else:
                    return False


    def start(self):
        """Subscribe and wait for data"""
        self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_ANSWER, "text": "$input"}}, self.answer_query)
        #self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_USER_TRANSCRIPT, "text": "$input", "language": "$lang"}}, self.answer_query) # from the 'gnlp' module
        logging.info("\tQA service started")


if __name__ == "__main__":

    global myID
    service_qa = QaService(myID,logging_lvl=logging.DEBUG)
    service_qa.start()
