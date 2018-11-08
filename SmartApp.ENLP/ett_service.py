"""
This is the entry point of the eTT module
"""
import sys

sys.path.insert(0, '../SmartApp.KB/')

import kb
from ett import prepare_answer
from constants import TAG_ANSWER, TAG_ELF_EMOTION, TAG_COLORED_ANSWER

def read_from_KB(pattern):
	"""
    Read a tuple from the KB
    """
	# needed to query kb for tuples on which assess ELF's emotion for the answer
    return

def write_to_KB(fact, tag):
    """
    Post a tuple to the KB
    """
    kb.addFact(myID, tag, 1, 100, False, fact)
    return

def callback(param):
    """
    Offers the service of eTT, consisting in manipulating an answer
    to the user in order to transform it with respect to some emotion
    extrapolated by ELF internal state (tuples)
    """
    answer = param[0]["$input"]
    a_fact, e_fact = prepare_answer(answer)
    write_to_KB(a_fact, TAG_COLORED_ANSWER)
    write_to_KB(e_fact, TAG_ELF_EMOTION)


def __main__():
	global myID
    myID = register()
    subscribe(myID, {TAG_ANSWER: "$input"}, callback) # from the 'gnlp' module

__main__()
