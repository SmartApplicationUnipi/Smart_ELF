import paralleldots
from interface_tags import TAG_USER_EMOTION
from emotion_conversion import vector_to_circumplex

key='bCXPeaKixa4dsKkMgX6s0kXott7oXTaZDBJ9XrxaZI8'

def analyze_sentence(sentence):
    '''
    Return softmaxed probability vector of sentence emotions.
    '''
    paralleldots.set_api_key(key)
    if (len(sentence) < 3):
        neutral_fact = {"Sarcasm":0.0, "Angry":0.04090321436524391, "Sad":0.0, "Fear":0.0, "Bored":0.0, "Excited":0.07638891041278839, "Happy":0.1223890483379364}
        return neutral_fact
    result = paralleldots.emotion(sentence)
    print(result)
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
