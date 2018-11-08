import paralleldots
from interface_tags import TAG_USER_EMOTION
from emotion_conversion import vector_to_circumplex

key='bCXPeaKixa4dsKkMgX6s0kXott7oXTaZDBJ9XrxaZI8'

def analyze_sentence(sentence):
    '''
    Return softmaxed probability vector of sentence emotions.
    '''
    paralleldots.set_api_key(key)
    result = paralleldots.emotion(sentence)
	
    return result['emotion']['probabilities']

def extract_emotion(sentence):
    vector = analyze_sentence(sentence)
    point = vector_to_circumplex(vector)
    fact = {
        "TIME_STAMP": 2, #fix this!!!!!
        "VALENCE": point[0],
        "AROUSAL": point[1],
        "TAG": TAG_USER_EMOTION
    }
    return fact