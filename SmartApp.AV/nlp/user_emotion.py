import paralleldots
from coords import EMOTIONS_COORD
from KB_hook import read_from_ELF, write_to_ELF

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

def get_user_emotion(param):

    sentence = read_from_ELF(param)
    vector = analyze_sentence(sentence)
    print(vector)
    point = vector_to_circumplex(vector)
    print("point is:", point)
    fact = {
        "TIME_STAMP": 2,
        "VALENCE": point[0],
        "AROUSAL": point[1],
        "TAG": "ENLP_USER_EMOTION"
    }
    write_to_ELF(fact)


# tests
"""print(emotion_to_circumplex('Happy'))
print(emotion_to_circumplex('dkla'))

print(vector_to_circumplex({'Happy':0.1, 'Sad': 0.4, 'Bored':0.5}))
vector_to_circumplex({'Happy':0.1, 'Sad': 0.4, 'da':0.5})"""
