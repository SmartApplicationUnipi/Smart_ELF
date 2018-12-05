from nltk.parse import load_parser
from nltk.sem.drt import DrtParser


def f(s,p,debug="no"):
    res = []

    #remove punctuation ad go lowercase

    parser = load_parser(p, trace=0, logic_parser=DrtParser())
    for tree in parser.parse(s.split()):
        if(debug == "yes"):
            res.append(str(tree))
        elif(debug == "no"):
            res.append(str(tree.label()['SEM'].simplify()))
    return res
