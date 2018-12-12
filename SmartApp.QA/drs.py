from nltk.parse import load_parser
from nltk.sem.drt import DrtParser
from nltk import *
from interface_tags import TAG_DRS

def drs_matcher(s,p,kb_client,kb_ID,debug="no"):
    res = []

    #remove punctuation ad go lowercase

    parser = load_parser(p, trace=0, logic_parser=DrtParser())
    #NotImlementedError
    try:
        for tree in parser.parse(s.split()):
            if(debug == "yes"):
                res.append(tree)
            elif(debug == "no"):
                res.append(str(tree.label()['SEM'].simplify()))
    #if we have a failure in the parser tree, return false
    except Exception():
        return False

    #otherwise return our result
    DRS= res[0]

    #TODO: write DRS tuple to KB, if not debug mode

    if(debug == "yes"):
        return res
    elif(debug == "no"):
        kb_client.addFact(kb_ID, TAG_DRS, 1, 100, DRS)
        return True #used to do further testing when developing new grammar rules
