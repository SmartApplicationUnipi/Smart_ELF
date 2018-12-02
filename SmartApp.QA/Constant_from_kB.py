import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_PROF, TAG_COURSE, TAG_ROOM
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient
import logging


"""
This service is used to extract "constants" from KB such as professor's, course's and room's name

"""
class ConstantFromkB:

    def __init__(self, kb_ID, logging_lvl):
        self.logging_lvl = logging_lvl
        self.kb_ID = kb_ID
        #logging.basicConfig(stream=sys.stderr, level=logging_lvl)
        logging.info('\tConstant_from_kB Service started')
        self.kb_client = KnowledgeBaseClient(True)


    def extract_constant_from_KB(self,tag, file):
        """This method is the one devoted to extract "constants" information from the KB
        First it perform a query to retrive the facts interested, then write them in rules.fcfg file
        """

        #answer query
        answ = self.kb_client.query({"object": {"_data": {"tag": tag}}})
        if answ['success'] == False:
            return
        else:
            file.write("\n#section for " +tag + ":\n")

        #get results
        ris = []
        for obj in answ['details']:
            ris.append(obj['object']['_data']['object']['_data']['data']['name'])

        #write them in rules file
        for r in ris:
            if (tag==TAG_ROOM):
                loc = "+LOC"
            else:
                loc = "-LOC"
            #create string to write
            str = "PropN[" + loc + ",NUM=sg,SEM=<\P.(DRS([x],[Attardi(x)])+P(x))>] -> " + "'" + r + "'" + "\n"
            file.write(str)


    def start(self):
        "ask for 'constants' facts"

        logging.info("\tConstant form Kb service started")
        #open file containing rules
        rules_file = open("rules.fcfg", "a")
        rules_file.write("\n\n#constants taken from KB\n")

        #extraxt info from KB
        self.extract_constant_from_KB(TAG_ROOM, rules_file)
        self.extract_constant_from_KB(TAG_COURSE, rules_file)
        self.extract_constant_from_KB(TAG_PROF, rules_file)



if __name__ == "__main__":

    global myID
    service_qa = ConstantFromkB(myID,logging_lvl=logging.DEBUG)
    service_qa.start()
