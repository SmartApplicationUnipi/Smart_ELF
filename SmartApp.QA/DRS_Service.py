import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_PARSE_TREE, TAG_DRS
from rules import rules
from constants import PRE,VALUE,VARS,PREDS,DRS
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

    def navigate_tree(self, tree, drs_structure):
        '''
        Navigate the parse tree and apply rules to create DRS
        '''

        children = tree['7_children']

        for child in children:
            drs_structure = self.navigate_tree(child, drs_structure)

        # apply local rules
        for rule in rules['local']:
            values = rule[PRE][VALUE]
            for v in values:
                # matching value
                if tree['0_text'] == v: #TODO: use 1_norm and adapt rules?
                    drs_structure['referents'] = drs_structure['referents'] + rule[DRS][VARS] # add referent
                    drs_structure['constraints'] = drs_structure['constraints'] + rule[DRS][PREDS] # add predicates
                    # rule applied, take next
                    break


        # apply global rules
        for rule in rules['merge']:
            pass

        return drs_structure


    def create_drs(self, *param):
        tree = param[0][0][0]['tree']
        # entities = param[0][0][0]['entities'] 

        logging.info("\tcallback DRS called")

        drs_structure = { "referents" : [], "constraints" : []}
        drs_structure = self.navigate_tree(tree, drs_structure)

        drs = {
            "time_stamp": 2, # fix this!!!
            "tag" : TAG_DRS,
            "drs" : drs_structure
        }

        self.write_to_KB(drs)
        pass

    def start(self):
        self.kb_client.subscribe(self.kb_ID, {"_data": {"tag": TAG_PARSE_TREE, "dependencies": "$tree", "entities": "$entities"}}, self.create_drs)
