from nltk.parse import load_parser
from nltk.sem.drt import DrtParser
from nltk import *
from interface_tags import TAG_DRS
import logging

def drs_matcher(s,p,QA_services,debug="no"):
    res = []

    parser = load_parser(p, trace=0, logic_parser=DrtParser())
    #NotImlementedError
    try:
        for tree in parser.parse(s.split()):
            if(debug == "yes"): #forwarding output to do further testing when developing new grammar rules
                res.append(tree)
            elif(debug == "no"):
                res.append(str(tree.label()['SEM'].simplify()))
    #if we have a failure in the parser tree, return False or rethrow exception
    except ValueError:
        logging.exception('ValueError')
        if(debug == "yes"): #forwarding output to do further testing when developing new grammar rules
            raise
        elif(debug == "no"):
            return False

    except NotImplementedError:
        logging.exception('NotImplementedError')

    if(debug == "yes"): #forwarding output to do further testing when developing new grammar rules
        return res
    elif(debug == "no"):
        if res!=[]:
            #return the DRS obtained from the first tree of the forest, if it exist
            #TODO: look for a tree with same structure as published by GNLP (provided it exist and it makes sense)
            DRS= res[0]
            QA_services.write_to_KB(DRS, TAG_DRS)
            return True
        else:
            return False
