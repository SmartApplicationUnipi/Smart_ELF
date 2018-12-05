from nltk.parse import load_parser
from nltk.sem.drt import DrtParser
parser = load_parser('ELF_rules.fcfg', trace=0, logic_parser=DrtParser())
#parser = load_parser('rules.fcfg', trace=0, logic_parser=DrtParser())

#remove punctuation ad go lowercase

#sentence = 'a professor knows Mia'
#sentence = 'dove posso trovare la lezione del professor Attardi'
sentence = 'la lezione del professor Attardi'
#sentence = 'Angus knows Irene'

def f(s):
    for tree in parser.parse(sentence.split()):
        print(tree)
        #print(tree.label()['SEM'].simplify())

if __name__ == "__main__":
    f(sentence)