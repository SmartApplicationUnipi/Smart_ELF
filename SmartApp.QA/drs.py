from nltk.parse import load_parser
from nltk.sem.drt import DrtParser
parser = load_parser('rules.fcfg', trace=0, logic_parser=DrtParser())

for tree in parser.parse('un professore conosce una lezione'.split()):
    print(tree.label()['SEM'].simplify())
