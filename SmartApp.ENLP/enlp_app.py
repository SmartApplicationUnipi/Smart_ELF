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

class TteThread (threading.Thread):
    """ Thread class for tte service"""
    def __init__(self, tte_obj):
        threading.Thread.__init__(self)
        self.tte_obj = tte_obj

    def run(self):
        self.tte_obj.start_service()

class EttThread (threading.Thread):
    """ Thread class for ett service"""
    def __init__(self, ett_obj):
        threading.Thread.__init__(self)
        self.ett_obj = ett_obj

    def run(self):
        self.ett_obj.start_service()

class IESThread (threading.Thread):
    """ Thread class for ett service"""
    def __init__(self, ies_obj):
        threading.Thread.__init__(self)
        self.ies_obj = ies_obj

    def run(self):
        self.ies_obj.start_service()

def __main__():
    global kb_ID
    kb_ID = kb.register()
    print("Emotional NLP module registered")

    ett_service = EttService(kb_ID)
    t1 = EttThread(ett_service)
    t1.start()

    tte_service = TteService(kb_ID)
    t2 = TteThread(tte_service)
    t2.start()

    ies_service = IESService(kb_ID)
    t3 = IESThread(ies_service)
    t3.start()

__main__()
