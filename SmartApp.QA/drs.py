from nltk.parse import load_parser
from nltk.sem.drt import DrtParser
parser = load_parser('ELF_rules.fcfg', trace=0, logic_parser=DrtParser())

#remove punctuation ad go lowercase

for tree in parser.parse('dove posso trovare la lezione del professor C'.split()):
    #print(tree)
    print(tree.label()['SEM'].simplify())
