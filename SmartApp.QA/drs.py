from nltk import *
from nltk.parse import load_parser
from nltk.sem.drt import DrtParser
from interface_tags import TAG_DRS

def drs_matcher(s,p,QA_services,debug="no"):
    res = []

    parser = load_parser(p, trace=0, logic_parser=DrtParser())
    #NotImlementedError,ValueError
    try:
        for tree in parser.parse(s.split()):
            if(debug == "yes"): #forwarding output to do further testing when developing new grammar rules
                res.append(tree)
            elif(debug == "no"):
                res.append(str(tree.label()['SEM'].simplify()))
    #if we have a failure in the parser tree, return False or rethrow exception
    except ValueError: #TODO: THIS SHOULD CATCH ALL EXCEPTIONS! (Especially ValueError and NotImplementedError)
        if(debug == "yes"): #forwarding output to do further testing when developing new grammar rules
            raise
        elif(debug == "no"):
            print("Error occurred while parsing sentence. No DRS could be obtained")
            return False

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
            print("Couldn't obtain a DRS")
            return False
