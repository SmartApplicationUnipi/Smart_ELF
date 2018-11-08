from math import sqrt
from constants import EMOTIONS_COORD, TAG_ELF_EMOTION, TAG_COLORED_ANSWER

def valence_2_emo(valence, arousal):
    """
    This functions convert valence and arousal values to the most probable
    emotion of the 6 emotions model
    To do this we first calculate the distance between all 6 emotions point,then
    we return the minimum, that is the nearest emotion
    """
    emotion_coord = (valence, arousal)
    distancies = []
    #print('Current point(valence, arousal) -> ' + str(emotion_coord)) #debug
    for emotion in EMOTIONS_COORD:
        distance = _distance(EMOTIONS_COORD[emotion], emotion_coord)
        #print('emotion:' + emotion + '\tdistance: ' + str(distance))
        curr_dist = (distance, emotion)
        distancies.append(curr_dist)
    print(min(distancies)[1]) #debug
    return min(distancies)[1]

def _distance(a,b):
    """
    Calculate distance between a and b.
    a and b are tuple with two coordinates.
    Pitagora to the rescue.
    """
    x_dist = a[0] - b[0]
    y_dist = a[1] - b[1]
    return sqrt(x_dist**2 + y_dist**2)


def put_imperative(text,language):
    """
    Changes verbs to imperative form, typical of angry sentences
    """

    if (language == "it"):
        imperative_text = text#do something in Italian
    elif (language == "en"):
        text = text.replace("you can","go") #you-can templates
        imperative_text = text.replace("i have a","'s the") #joke template
    else:
        text = text.replace("you can","go") #you-can templates
        imperative_text = text.replace("i have a","'s the") #joke template

    return "uff..." + imperative_text + "!"

def add_sarcasm(text,language): #TODO: add random negations or "probably" here or there
    """
    Adds some ironic nonsense typical of sarcasm
    """
    if (language == "it"):
        sarcastic_text = text#do something in Italian
    elif (language == "en"):
        text = text.replace("professor","super-wonderful professor") #professor templates
        sarcastic_text = text.replace("have","don't have") #joke template
    else:
        text = text.replace("professor","super-wonderful professor") #professor templates
        sarcastic_text = text.replace("have","don't have") #joke template

    return sarcastic_text

def color_answer(answer, emotion, language="en"):
    """
    Changes the text of the answer with the emotion described by
    the given valence and arousal
    """

    if(emotion=='sad' or emotion=='bored'):
        colored_answer = "ok..." + answer
    elif(emotion=='excited' or emotion=='happy'):
        if (language=="it"):
            sure_string = "sure"
        elif(language=="en"):
            sure_string = "ma certo"
        else:
            sure_string = "sure"
        colored_answer = sure_string + "! " + answer
    elif(emotion=='fear'):
        colored_answer = "ok, ok, " + answer
    elif(emotion=='angry'):
        colored_answer = put_imperative(answer,language)
    elif(emotion=='sarcasm'):
        colored_answer = add_sarcasm(answer,language)
    else: #neutral (?)
        colored_answer = answer

    return colored_answer

def emotion_from_ELF():
    """
    Assess the emotion that ELF needs to use given its state (tuples)
    """
    #read tuples from ELF state, use DBI to assess valence and arousal values that ELF needs to answer
    import random #remove bipolarism!!!!!
    valence = random.uniform(-1.0, 1.0) #remove bipolarism!!!!!
    arousal = random.uniform(-1.0, 1.0) #remove bipolarism!!!!!

    return valence_2_emo(valence, arousal), valence, arousal

def correct_grammar(answer):
    """
    Hard-coded corrections for first-test templates
    """
    answer = answer.replace("helded","held")
    answer = answer.replace("is in","in")
    answer = answer.replace("is at","at")

    return answer

def prepare_answer(answer):#to be used as callback
    """
    Offers the service of eTT, consisting in manipulating an answer
    to the user in order to transform it with respect to some emotion
    extrapolated by ELF internal state (tuples)
    """
    emotion, valence, arousal = emotion_from_ELF()
    answer = answer.lower() #go lowercase
    answer = correct_grammar(answer) #just for first templates, remove later!!!!
    colored_answer = color_answer(answer, emotion, "en")
    answer_fact = {
        "TIME_STAMP": 3, #fix this!!!!!
        "text": colored_answer,
        "VALENCE": valence,
        "AROUSAL" : arousal,
        "TAG": TAG_COLORED_ANSWER
    }
    emotion_fact = {
        "TIME_STAMP": 3, #fix this!!!!!
        "VALENCE" : valence,
        "AROUSAL" : arousal,
        "TAG": TAG_ELF_EMOTION
    }
    return answer_fact, emotion_fact
