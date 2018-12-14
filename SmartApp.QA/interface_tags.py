#READ FROM KB
TAG_PARSE_TREE = "NLP_ANALYSIS"

# WRITE TO KB
TAG_DRS = "QA_DRS"

PATH_TO_KB_MODULE = '../SmartApp.KB/bindings/python/'

DESC_DRS = 'drs = {"time_stamp": int, "drs": drs_structure , "tag": "' + TAG_DRS + '"}'

TAG_ANSWER = "NLP_ANSWER"
DESC_ANSWER = 'answer = {"time_stamp": int, "text": testop , "tag": "' + TAG_ANSWER + '"}'

TAG_PROF = "crawler_teacher"
TAG_COURSE = "crawler_course"
TAG_ROOM = "crawler_room"

RULE_FILE_NAME = "DRS_rules.fcfg"
EXPANDED_RULE_FILE_NAME = "DRS_rules+constants.fcfg" #TO BE GIT-IGNORED!
