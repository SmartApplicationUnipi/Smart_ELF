import paralleldots
from constants import EMOTIONS_COORD, TAG_USER_EMOTION

key='bCXPeaKixa4dsKkMgX6s0kXott7oXTaZDBJ9XrxaZI8'

def emotion_to_circumplex(emotion):
    '''
    Compute valence and arousal from categorical emotion

    :require emotion: the string representing one of the allowed emotions
    :return (valence, arousal): tuple containing valence and arousal values. None if emotion is not recognized.
    '''

    if emotion not in EMOTIONS_COORD:
        return None
    else:
        return EMOTIONS_COORD[emotion]

def vector_to_circumplex(vector):
    '''
    Compute valence and arousal from softmaxed vector of emotion probabilities

    :require vector: softmaxed vector of emotion probabilities in the form { 'emotion' : probability } or 'Neutral'
    :return (valence, arousal): tuple containing valence and arousal values. None if vector is not well made.
    '''

    # dictionary containing emotion : (valence, arousal)
    circumplex = {}

    # weighted average of the emotions
    valence = 0.
    arousal = 0.
    probs_sum = 0.

    if vector == 'Neutral':
        return emotion_to_circumplex(vector)

    if type(vector) != dict:
        print("Input is not 'Neutral' nor a dictionary")
        return None

    for emotion in vector.keys():
        coords = emotion_to_circumplex(emotion)
        if coords is None:
            print('Emotion inside dictionary not recognized.')
            return None
        circumplex[emotion] = coords

        valence += coords[0] * vector[emotion]
        arousal += coords[1] * vector[emotion]
        probs_sum += vector[emotion]

    final_point = (valence / probs_sum, arousal / probs_sum)

    return final_point

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