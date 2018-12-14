from math import sqrt

# emotion : (valence, arousal)
EMOTIONS_COORD = {
    'excited' : (0.5,0.8),
    'angry' : (-0.8,0.5),
    'anger' : (-0.8,0.5),
    'bored' : (-0.5,-0.8),
    'happy' : (0.8,0.5),
    'happiness' : (0.8,0.5),
    'fear' : (-0.6,0.8),
    'sarcasm' : (0.,0.3),
    'sad' : (-0.9,-0.6),
    'sadness' : (-0.9,-0.6),
    'neutral' : (0.,0.),
    'calm' : (0.,0.),
    'surprise' : (0., 1.),
    'disgust' : (-0.9, 0.1)
}

def _distance(a,b):
    """
    Calculate distance between a and b.
    a and b are tuple with two coordinates.
    Pitagora to the rescue.
    """
    x_dist = a[0] - b[0]
    y_dist = a[1] - b[1]
    return sqrt(x_dist**2 + y_dist**2)

def circumplex_to_emotion(valence, arousal):
    """
    This functions convert valence and arousal values to the most probable
    emotion of the 6 emotions model
    To do this we first calculate the distance between all 6 emotions point,then
    we return the minimum, that is the nearest emotion
    """
    emotion_coord = (valence, arousal)
    distancies = []
    for emotion in EMOTIONS_COORD:
        distance = _distance(EMOTIONS_COORD[emotion], emotion_coord)
        curr_dist = (distance, emotion)
        distancies.append(curr_dist)
    return min(distancies)[1]

def emotion_to_circumplex(emotion):
    '''
    Compute valence and arousal from categorical emotion

    :require emotion: the string representing one of the allowed emotions
    :return (valence, arousal): tuple containing valence and arousal values. None if emotion is not recognized.
    '''
    emotion = emotion.lower()
    if emotion not in EMOTIONS_COORD:
        return None
    else:
        return EMOTIONS_COORD[emotion]

def vector_to_circumplex(vector):
    '''
    Compute valence and arousal from softmaxed dictionaries of emotion probabilities

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
