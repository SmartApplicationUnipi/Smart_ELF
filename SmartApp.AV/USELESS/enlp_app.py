"""
This is the entry point of the enlp module
"""
import kb #todo risolvere import da relative path
from user_emotion import get_user_emotion
from answer_with_emotion import prepare_answer
import json

#READ FROM KB
TAG_USER_TRANSCRIPT = "text_f_audio" # user query transcript
TAG_ANSWER = "ERASMUS_TODO" # nlp answer to provide AFTER addition of emotions

# WRITE TO ELF
TAG_COLORED_ANSWER = "ENLP_EMOTIVE_ANSWER" # answer to provide with added emotion
TAG_USER_EMOTION = "ENLP_USER_EMOTION" # our guess for user emotion
TAG_ELF_EMOTION = "ENLP_ELF_EMOTION" # our guess for elf internal status





"""def write_to_ELF(tuple):

    #Post a tuple to the KB

    fact = "ELF_must_answer(ID,blabla,answer:" + colored_answer + ",valence:" + valence + ",arousal:" + arousal + ")"
    addFact(myID,)
    # write fact to ELF!!!!
    return"""



TAG_USELESS = "UNUSED" # this tag is nedeed but not used
"""def write_to_ELF(subscrib_id, fact):

    # write fact to ELF!!!!

    kb.addFact(subscrib_id, TAG_USELESS, 1, 100, False, fact)
    print("added", str(fact))
    return

def read_from_ELF(topic):
    #print("topic", topic)
    a = (topic[0]["$input"], "en")
    print("Callback clean: " + str(a))
    return a[0]


def get_answer(kb_fact):
    a = (kb_fact[0]["$resp"], "en")
    print(a)
    return (kb_fact[0]["$resp"], "en")

"""

def __main__():
    myID = kb.register()
    #print("ID:" + str(myID))
    #kb.subscribe(myID, {"TAG": TAG_USER_TRANSCRIPT, "text": "$input"}, get_user_emotion) # text to speech
    kb.subscribe(myID, { "NLP_Answer": "$input"}, prepare_answer) # add emotion to answer

    # create json objec
    obj = {
        "text": "Ciao!",
        "emot_answ": "Ciao oggi ti odio.",
        "TAG": TAG_USER_TRANSCRIPT
    }
    obj_from_erasmus = {

        "NLP_Answer": "Vado a fare la doccia."
    }
    #kb.removeFact(myID, obj)
    #kb.addFact(myID, TAG_COLORED_ANSWER, 1, 100, False, obj)
    kb.addFact(myID, TAG_USER_TRANSCRIPT, 1, 100, False, obj_from_erasmus)
    #kb.addFact(myID, TAG_COLORED_ANSWER, 1, 30, False, obj)
    #resp = kb.queryBind({"obj": "$orig_answ"})
    #resp = kb.queryBind({"orig_answ": "$orig_answ"})

    #print(resp)


__main__()
