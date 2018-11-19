"""
Entry point of enlp application
This will create two services running in diffenrent threads
that will provide facts by extracting emotion from
user's query.
"""
import sys
from interface_tags import PATH_TO_KB_MODULE

sys.path.insert(0, PATH_TO_KB_MODULE)

from EttService_c import EttService
from TteService_c import TteService
from IESService_c import IESService
import kb
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

    global kb_ID
    kb_ID = kb.register()
    logging.basicConfig(stream=sys.stderr, level=logging_lvl)
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
