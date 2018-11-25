#READ FROM KB
TAG_USER_TRANSCRIPT = "AV_IN_TRANSC_EMOTION" # user query transcript
TAG_ANSWER = "NLP_ANSWER" # nlp answer to provide BEFORE addition of emotions

# WRITE TO KB
TAG_COLORED_ANSWER = "ENLP_EMOTIVE_ANSWER" # answer to provide with added emotion
TAG_USER_EMOTION = "ENLP_USER_EMOTION" # our guess for user emotion
TAG_ELF_EMOTION = "ENLP_ELF_EMOTION" # our guess for elf internal status

PATH_TO_KB_MODULE = '../SmartApp.KB/bindings/python/'

DESC_ELF_EMOTION = 'emotion = {"time_stamp" : int, "valence" : float,  "arousal" : float, "query" : user_query,  "answer" : nlp_answer, "tag": "' + TAG_ELF_EMOTION + '"}'
DESC_USER_EMOTION = '{ "time_stamp": int, "valence": float, "arousal": float, "tag": "'+ TAG_USER_EMOTION + '"}'
DESC_COLORED_ANSWER = '{ "time_stamp": int, "text" : colored_answer, "valence" : float, "arousal" : float, "tag": "'+ TAG_COLORED_ANSWER + '"}'
