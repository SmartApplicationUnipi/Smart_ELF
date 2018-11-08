"""
This is the entry point of the TTe module
"""
import sys

sys.path.insert(0, '../SmartApp.KB/')

import kb
from tte import extract_emotion
from interface_tags import TAG_USER_TRANSCRIPT, TAG_USER_EMOTION

def read_from_KB(pattern):
    """
    Read a tuple from the KB
    """
    # not needed here
    return

def write_to_KB(fact):
    """
    Post a tuple to the KB
    """

    kb.addFact(myID, TAG_USER_EMOTION, 1, 100, False, fact)
    return

def callback(param):
    """
    Assess user emotion fro a given sentence
    """
    sentence = param[0]["$input"]
    fact = extract_emotion(sentence)
    write_to_KB(fact)
    return

def __main__():
    """
    Registers the module and subscribe to transcripts tuples
    """
    global myID
    myID = kb.register()
    kb.subscribe(myID, {"TAG": TAG_USER_TRANSCRIPT, "text": "$input"}, callback) #from the 'text to speech' module

__main__()
