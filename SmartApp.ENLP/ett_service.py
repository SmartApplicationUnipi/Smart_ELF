"""
This is the entry point of the eTT module
"""
import sys
from interface_tags import PATH_TO_KB_MODULE

sys.path.insert(0, PATH_TO_KB_MODULE)

import kb
from ett import prepare_answer
from interface_tags import TAG_ANSWER, TAG_ELF_EMOTION, TAG_COLORED_ANSWER

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
    print("Received ", answer)
    a_fact, e_fact = prepare_answer(answer)
    write_to_KB(a_fact, TAG_COLORED_ANSWER)
    print("Written ", a_fact)
    write_to_KB(e_fact, TAG_ELF_EMOTION)
    print("Written ", e_fact)

def __main__():
    global myID
    myID = kb.register()
    kb.subscribe(myID, {TAG_ANSWER: "$input"}, callback) # from the 'gnlp' module

__main__()
