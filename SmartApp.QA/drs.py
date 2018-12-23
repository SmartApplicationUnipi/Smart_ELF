from nltk.sem.drt import DrtParser
from nltk import *
from interface_tags import TAG_DRS

def drs_matcher(s, p, drs_service, debug="no"):
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
    except:
        print('Error occurred while parsing sentence, due to insufficient or wrong rules. No DRS could be produced')
        if(debug == "yes"): #forwarding output to do further testing when developing new grammar rules
            raise
        elif(debug == "no"):
            return False

    if(debug == "yes"): #forwarding output to do further testing when developing new grammar rules
        return res
    elif(debug == "no"):
        if res!=[]:
            #return the DRS obtained from the first tree of the forest, if it exist
            #TODO: look for a tree with same structure as published by GNLP (provided it exist and it makes sense)
            DRS= res[0]
            # TODO qggiungere un field query_text con dentro la query da passare al query manager
            drs_service.write_to_KB(DRS, TAG_DRS)
            return True
        else:
            print('No DRS could be produced')
            return False
