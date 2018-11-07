# emotion : (valence, arousal)
EMOTIONS_COORD = {
    'Excited' : (0.5,0.8),
    'Angry' : (-0.8,0.5),
    'Bored' : (-0.5,-0.8),
    'Happy' : (0.8,0.5),
    'Fear' : (-0.6,0.8),
    'Sarcasm' : (0.,0.3),
    'Sad' : (-0.9,-0.6),
    'Neutral' : (0.,0.)
}

#READ FROM KB
TAG_USER_TRANSCRIPT = "text_f_audio" # user query transcript
TAG_ANSWER = "NLP_Answer" # nlp answer to provide BEFORE addition of emotions

# WRITE TO KB
TAG_COLORED_ANSWER = "ENLP_EMOTIVE_ANSWER" # answer to provide with added emotion
TAG_USER_EMOTION = "ENLP_USER_EMOTION" # our guess for user emotion
TAG_ELF_EMOTION = "ENLP_ELF_EMOTION" # our guess for elf internal status
