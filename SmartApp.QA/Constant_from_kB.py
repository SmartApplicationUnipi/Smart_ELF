import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_PROF, TAG_COURSE, TAG_ROOM, RULE_FILE_NAME, EXPANDED_RULE_FILE_NAME
sys.path.insert(0, PATH_TO_KB_MODULE)
from kb import KnowledgeBaseClient
import logging

"""
This service is used to extract "constants" from KB such as professor's, course's and room's names

"""
class ConstantFromkB:

    def __init__(self, kb_ID, logging_lvl):
        self.logging_lvl = logging_lvl
        self.kb_ID = kb_ID
        logging.info("\tConstant_from_kB Service Handler created")
        self.kb_client = KnowledgeBaseClient(True)


    def extract_rooms_courses_from_KB(self,tag, file):
        """This method is the one devoted to extract "constants" information from the KB
        First it performs a query to retrieve the facts interested, then write them in file (2° parameter)
        """

        #answer query
        answ = self.kb_client.query({"_meta": {"tag": tag}})
        if answ['success'] == False:
            return
        else:
            file.write("\n#section for " +tag + ":\n")

        ris = []
        #get results and append them in to ris list
        for obj in answ['details']:
            ris.append(obj['object']['_data']['data']['name'])

        #write them in rules file
        for r in ris:
            string = str(r).lower()
            predicate = "_".join(string.split(" "))
            #create strings to write
            if len(string) > 1 and tag==TAG_COURSE:
                string2 = string.split(" ")[0]
                str_to_write = "PNOUN[SEM=<\\x.(DRS([],[" + predicate + "]))>] -> '" + string + "' | '" + string2 + "'"  + "\n"
            else:
                str_to_write = "PNOUN[SEM=<\\x.(DRS([],[" + predicate + "]))>] -> '" + string + "\n"
            file.write(str_to_write)


    def extract_teachers_from_KB(self,tag, file):
        """This method is the one devoted to extract "constants" information from the KB
        First it perform a query to retrieve the facts interested, then write them in file (2° parameter)
        """

        #answer query
        answ = self.kb_client.query({"_meta": {"tag": tag}})
        if answ['success'] == False:
            return
        else:
            file.write("\n#section for " +tag + ":\n")

        #write them directly in to rules file
        for r in answ["details"][0]["object"]["_data"]["data"]:
            #create strings (one forn full name, one for surname) to write
            name = str(r).lower().split(" ")
            # heuristic to take the surname
            n = len(name)
            if name[n-2] == "DE" or name[n-2] == "DEL" or name[n-2] == "DI" or name[n-2] == "DELLA":
                tmp = name[n-2:]
                surname = " ".join(tmp)
            else:
                surname = name[-1]

            name2write = " ".join(name)
            predicate = "_".join(name) + "(x)"

            if name=='': #TODO when finally crawler groupi implements filter, we caan delete this rusles
                continue

            str1_to_write = "PNOUN[SEM=<\\x.(DRS([],[" + predicate + "]))>] -> '" + name2write + "'|'" + surname + "'\n"
            file.write(str1_to_write)


    def start(self):
        "ask for 'constants' facts"
        logging.info("\tConstant_from_kB Service started")

        #open file containing rules and copy them in another file
        rules_file = open(RULE_FILE_NAME)
        rules_plus_constants_files = open(EXPANDED_RULE_FILE_NAME, "w+")
        rules_plus_constants_files.write(rules_file.read())

        #extraxt info from KB
        self.extract_teachers_from_KB(TAG_PROF,rules_plus_constants_files)
        self.extract_rooms_courses_from_KB(TAG_ROOM, rules_plus_constants_files)
        self.extract_rooms_courses_from_KB(TAG_COURSE, rules_plus_constants_files)

if __name__ == "__main__":

    global myID
    service_qa = ConstantFromkB(myID,logging_lvl=logging.DEBUG)
    service_qa.start()
