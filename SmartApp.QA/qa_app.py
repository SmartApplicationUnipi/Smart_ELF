"""
Entry point of QA application
"""

import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_DRS, DESC_DRS, DESC_ANSWER, TAG_ANSWER
sys.path.insert(0, PATH_TO_KB_MODULE)

from DRS_Service import DRSService
from QA_services import QaService
from kb import KnowledgeBaseClient
from Constant_from_kB import ConstantFromkB
import threading
import argparse
import logging

class DRS_thread (threading.Thread):
    """ Thread class for ett service"""
    def __init__(self, drs_obj):
        threading.Thread.__init__(self)
        self.drs_obj = drs_obj

    def run(self):
        self.drs_obj.start()

class Qa_Thread (threading.Thread):
    """ Thread class for Qa service"""
    def __init__(self, qa_obj):
        threading.Thread.__init__(self)
        self.qa_obj = qa_obj

    def run(self):
        self.qa_obj.start()

class K_Thread (threading.Thread):
    """ Thread class for Constant from KB service"""
    def __init__(self, K_obj):
        threading.Thread.__init__(self)
        self.K_obj = K_obj

    def run(self):
        self.K_obj.start()

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

    logging.basicConfig(stream=sys.stderr, level=logging_lvl)

    tags = {
        TAG_DRS : {'desc' : 'DRS structure', 'doc' : DESC_DRS},
        TAG_ANSWER : {'desc' : 'stupid answer', 'doc' : DESC_ANSWER}
    }

    logging.info("\tQA module registered")
    #TODO register tags nedeed?
    """drs_service = DRSService(kb_ID, logging_lvl)
    t1 = DRS_thread(drs_service)
    t1.start()"""

    qa_service = QaService(kb_ID,logging_lvl)
    t2 = Qa_Thread(qa_service)
    t2.start()

    k_service = ConstantFromkB(kb_ID,logging_lvl)
    t3 = K_Thread(k_service)
    t3.start()



__main__()
