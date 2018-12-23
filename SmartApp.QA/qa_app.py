"""
Entry point of QA application
"""

import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_DRS, DESC_DRS, DESC_ANSWER,\
TAG_ANSWER, TAG_BINDINGS, DESC_TAG_BINDINGS, TAG_FINAL_ANSW, DESC_TAG_FINAL_ANSW
sys.path.insert(0, PATH_TO_KB_MODULE)

from TemplateService import TemplateService
from kb import KnowledgeBaseClient
from DrsService import DrsService
from QueryManager import QueryManager
from Constant_from_kB import ConstantFromkB
from ResultManager import ResultManager
import threading
import argparse
import logging

class DRS_thread (threading.Thread):
    """ Thread class for drs service"""
    def __init__(self, drs_obj):
        threading.Thread.__init__(self)
        self.drs_obj = drs_obj

    def run(self):
        self.drs_obj.start()

class ResultManager_thread (threading.Thread):
    """ Thread class for Result manager service"""
    def __init__(self, drs_obj):
        threading.Thread.__init__(self)
        self.drs_obj = drs_obj

    def run(self):
        self.drs_obj.start()

class TemplateService_thread (threading.Thread):
    """ Thread class for template matcher service"""
    def __init__(self, qa_obj):
        threading.Thread.__init__(self)
        self.qa_obj = qa_obj

    def run(self):
        self.qa_obj.start()

class QueryManager_thread (threading.Thread):
    """ Thread class for Query manager service"""
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
    This function will read args from command line interface
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
        TAG_ANSWER : {'desc' : 'stupid answer', 'doc' : DESC_ANSWER},
        TAG_BINDINGS : {'desc' : 'bindings', 'doc' : DESC_TAG_BINDINGS},
        TAG_FINAL_ANSW : {'desc' : 'final answer', 'doc' : DESC_TAG_FINAL_ANSW}

    }

    logging.info("\tQA module registered")

    kb_client.registerTags(kb_ID, tags)

    qa_service = TemplateService(kb_ID,logging_lvl)
    t1 = TemplateService_thread(qa_service)
    t1.start()

    k_service = ConstantFromkB(kb_ID,logging_lvl)
    t2 = K_Thread(k_service)
    t2.start()

    drs_service = DrsService(kb_ID,logging_lvl)
    t3 = DRS_thread(drs_service)
    t3.start()

    query_manag_service = QueryManager(kb_ID,logging_lvl)
    t4 = QueryManager_thread(query_manag_service)
    t4.start()

    result_manag_service = ResultManager(kb_ID,logging_lvl)
    t5 = ResultManager_thread(result_manag_service)
    t5.start()

__main__()
