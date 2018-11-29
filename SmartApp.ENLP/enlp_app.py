"""
Entry point of enlp application
This will create two services running in diffenrent threads
that will provide facts by extracting emotion from
user's query.
"""
import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_COLORED_ANSWER, TAG_USER_EMOTION, TAG_ELF_EMOTION, DESC_ELF_EMOTION, DESC_COLORED_ANSWER, DESC_USER_EMOTION

sys.path.insert(0, PATH_TO_KB_MODULE)

from EttService_c import EttService
from TteService_c import TteService
from IESService_c import IESService
from kb import KnowledgeBaseClient
import threading
import argparse
import logging

class TteThread (threading.Thread):
    """ Thread class for tte service"""
    def __init__(self, tte_obj):
        threading.Thread.__init__(self)
        self.tte_obj = tte_obj

    def run(self):
        self.tte_obj.start()

class EttThread (threading.Thread):
    """ Thread class for ett service"""
    def __init__(self, ett_obj):
        threading.Thread.__init__(self)
        self.ett_obj = ett_obj

    def run(self):
        self.ett_obj.start()

class IESThread (threading.Thread):
    """ Thread class for ett service"""
    def __init__(self, ies_obj):
        threading.Thread.__init__(self)
        self.ies_obj = ies_obj

    def run(self):
        self.ies_obj.start()

def _get_cl_args():
    """
    This function will read args from commanda line intarface
    """
    parser = argparse.ArgumentParser(description="Start the ENLP module's services")
    parser.add_argument('--debug', default=logging.INFO, help= "DEBUG: shows debug info")
    args = parser.parse_args()
    return args


def __main__():
    logging_lvl = logging.INFO

    args = _get_cl_args()
    if args.debug == "DEBUG":
        logging_lvl = logging.DEBUG
    else:
        # set level to display nothing
        logging_lvl = logging.INFO

    kb_client = KnowledgeBaseClient(True)
    global kb_ID
    kb_ID = (kb_client.register())['details']

    logging.basicConfig(stream=sys.stderr, level=logging_lvl)

    tags = { TAG_USER_EMOTION : {'desc' : 'Emotion of what user said', 'doc' : DESC_USER_EMOTION},
            TAG_ELF_EMOTION : {'desc' : 'Internal emotion of ELF', 'doc' : DESC_ELF_EMOTION},
            TAG_COLORED_ANSWER : {'desc' : 'Reply to the user with emotion content in it', 'doc' : DESC_COLORED_ANSWER}
    }

    tag_list = [TAG_USER_EMOTION, TAG_ELF_EMOTION, TAG_COLORED_ANSWER]
    kb_client.registerTags(kb_ID, tags)
    """
    for tag in tag_list:
        check_tag = kb_client.getTagDetails([tag])
        if not check_tag['success']:
            res = kb_client.registerTags(kb_ID, { tag : tags[tag] } )
            if not res['success']:
                logging.critical(res['details'])
                return
    """

    logging.info("Emotional NLP module registered")

    ett_service = EttService(kb_ID, logging_lvl)
    t1 = EttThread(ett_service)
    t1.start()

    tte_service = TteService(kb_ID,logging_lvl)
    t2 = TteThread(tte_service)
    t2.start()

    ies_service = IESService(kb_ID, logging_lvl)
    t3 = IESThread(ies_service)
    t3.start()

__main__()
