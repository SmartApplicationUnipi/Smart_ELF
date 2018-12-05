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
        logging.info('\tConstant_from_kB Service started')
        self.kb_client = KnowledgeBaseClient(True)


    def extract_rooms_courses_from_KB(self,tag, file):
        """This method is the one devoted to extract "constants" information from the KB
        First it perform a query to retrieve the facts interested, then write them in file (2° parameter)
        """

        #answer query
        answ = self.kb_client.query({"_meta": {"tag": tag}})
        if answ['success'] == False:
            return
        else:
            file.write("\n#section for " +tag + ":\n")

        #get results
        ris = []
        for obj in answ['details']:
            ris.append(obj['object']['_data']['data']['name'])

        #write them in rules file
        for r in ris:
            #create strings to write
            str_tmp = str(r)+ ("(x)")
            str_to_write = "PNOUN[SEM=<\\x.(DRS([],[" + str_tmp + "]))>] -> '" + str(r) + "'\n"
            file.write(str_to_write)

            #if the tuple concerns a course, add  to rules the first word of full name as well
            if (tag==TAG_COURSE):
                name = str(r).split(" ")
                if len(name) > 1:
                    str_to_write2 = "PNOUN[SEM=<\\x.(DRS([],[" + name[0] + ("(x)") + "]))>] -> '" + str(r) + "'\n"
                    file.write(str_to_write2)

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

        #write them in rules file
        for r in answ["details"][0]["object"]["_data"]["data"]:
            #create strings (one forn full name, one for surname) to write
            name = str(r).split(" ")
            n = len(name)
            if name[n-2] == "DE" or name[n-2] == "DEL" or name[n-2] == "DI" or name[n-2] == "DELLA":
                tmp = name[n-2:]
                surname = " ".join(tmp)
            else:
                surname = name[-1]

            name_x = str(r)+ ("(x)")

            surname_x = surname + ("(x)")
            str1_to_write = "PNOUN[SEM=<\\x.(DRS([],[" + name_x + "]))>] -> '" + str(r) + "'\n"
            file.write(str1_to_write)

            str2_to_write = "PNOUN[SEM=<\\x.(DRS([],[" + surname_x + "]))>] -> '" + str(r) + "'\n"
            file.write(str2_to_write)


    def start(self):
        "ask for 'constants' facts"
        logging.info("\tConstant form Kb service started")

        #open file containing rules and copy them in another file
        rules_file = open("TEST_rules.fcfg")
        rules_plus_constants_files = open("TEST_rules+constants.fcfg", "w+")
        rules_plus_constants_files.write(rules_file.read())

        #extraxt info from KB
        self.extract_teachers_from_KB(TAG_PROF,rules_plus_constants_files)
        self.extract_rooms_courses_from_KB(TAG_ROOM, rules_plus_constants_files)
        self.extract_rooms_courses_from_KB(TAG_COURSE, rules_plus_constants_files)

if __name__ == "__main__":

    global myID
    service_qa = ConstantFromkB(myID,logging_lvl=logging.DEBUG)
    service_qa.start()
