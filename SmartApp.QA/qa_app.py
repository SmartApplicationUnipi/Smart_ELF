"""
Entry point of QA application
"""

import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_DRS, DESC_DRS
sys.path.insert(0, PATH_TO_KB_MODULE)

from DRS_Service import DRSService
from kb import KnowledgeBaseClient
import threading
import argparse
import logging

class DRS_thread (threading.Thread):
    """ Thread class for ett service"""
    def __init__(self, drs_obj):
        threading.Thread.__init__(self)
        self.drs_obj = drs_obj

    def run(self):
        self.ett_obj.start()

def _get_cl_args():
    """
    This function will read args from commanda line intarface
    """
    parser = argparse.ArgumentParser(description="Start the QA module's services")
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

    global kb_ID
    kb_client = KnowledgeBaseClient(False)
    kb_ID = (kb_client.register())['details']
    print(kb_ID)

    logging.basicConfig(stream=sys.stderr, level=logging_lvl)

    tags = {
        TAG_DRS : {'desc' : 'DRS structure', 'doc' : DESC_DRS}
    }

    logging.info("QA module registered")

    drs_service = DRSService(kb_ID, logging_lvl)
    t1 = DRS_thread(drs_service)
    t1.start()

__main__()
