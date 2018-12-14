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

def extract_emotion(sentence, lang, timestamp):
    vector = analyze_sentence(sentence)
    point = vector_to_circumplex(vector)
    fact = {
        "timestamp": timestamp,
        "valence": point[0],
        "arousal": point[1],
        "language": lang,
        "tag": TAG_USER_EMOTION
    }
    return fact
