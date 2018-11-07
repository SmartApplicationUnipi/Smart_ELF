"""
This is the entry point of the TTe module
"""
import sys

sys.path.insert(0, '../SmartApp.KB/')

from kb import *
from KB_hook import read_from_ELF, write_to_ELF
from user_emotion import extract_emotion

#READ FROM KB
TAG_USER_TRANSCRIPT = "text_f_audio" # user query transcript
TAG_ANSWER = "ERASMUS_TODO" # nlp answer to provide AFTER addition of emotions

# WRITE TO ELF
TAG_COLORED_ANSWER = "ENLP_EMOTIVE_ANSWER" # answer to provide with added emotion
TAG_USER_EMOTION = "ENLP_USER_EMOTION" # our guess for user emotion
TAG_ELF_EMOTION = "ENLP_ELF_EMOTION" # our guess for elf internal status

def get_user_emotion(param):

    sentence = read_from_ELF(param)
    fact = extract_emotion(sentence)
    write_to_ELF(fact)

def __main__():
    myID = register()
    subscribe(myID, {"TAG": TAG_USER_TRANSCRIPT, "text": "$input"}, get_user_emotion) #from the 'text to speech' module

__main__()
