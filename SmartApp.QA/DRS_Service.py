import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_PARSE_TREE, TAG_DRS
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient
import logging


class DRSService():
    def __init__(self, kb_ID, logging_lvl):
        self.logging_lvl = logging_lvl
        self.kb_ID = kb_ID
        self.kb_client = KnowledgeBaseClient(True)
        logging.info('\tDRS Service started')

    def write_to_KB(self, fact):
        """
        Post a tuple to the KB
        """

        self.kb_client.addFact(self.kb_ID, TAG_DRS, 1, 100, fact)
        return

    def create_drs(self, *param):
        tree = param[0][0][0]['tree']
        entities = param[0][0][0]['entities']
        
        logging.info("\tcallback DRS called")

        drs_structure = None # TODO: create drs!!
        drs = {
            "time_stamp": 2, # fix this!!!
            "tag" : TAG_DRS,
            "drs" : drs_structure
        }

        self.write_to_KB(drs)
        pass

    def start(self):
        self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_PARSE_TREE, "dependencies": "$tree", "entities": "$entities"}}, self.create_drs)
