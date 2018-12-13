from interface_tags import TAG_ELF_EMOTION, TAG_COLORED_ANSWER
from emotion_conversion import circumplex_to_emotion

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
    #TODO: check language format

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

def emotion_from_ELF(ies):
    """
    Assess the emotion that ELF needs to use given its state (tuples)
    """
    #read tuples from ELF state, use DBI to assess valence and arousal values that ELF needs to answer

    valence = ies[0]
    arousal = ies[1]

    return circumplex_to_emotion(valence, arousal), valence, arousal

def correct_grammar(answer):
    """
    Hard-coded corrections for first-test templates
    """
    answer = answer.replace("helded","held")
    answer = answer.replace("is in","in")
    answer = answer.replace("is at","at")

    return answer

def prepare_answer(answer, ies, timestamp,language):
    """
    Offers the service of eTT, consisting in manipulating an answer
    to the user in order to transform it with respect to some emotion
    extrapolated by ELF internal state (tuples)
    """
    emotion, valence, arousal = emotion_from_ELF(ies)
    answer = answer.lower() #go lowercase
    answer = correct_grammar(answer) #just for first templates, remove later!!!!
    colored_answer = color_answer(answer, emotion, language)
    answer_fact = {
        "timestamp": timestamp,
        "text": colored_answer,
        "valence": valence,
        "arousal" : arousal,
        "tag": TAG_COLORED_ANSWER,
        "language": language
    }

    return answer_fact
