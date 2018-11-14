import sys
from interface_tags import TAG_USER_TRANSCRIPT, TAG_USER_EMOTION, PATH_TO_KB_MODULE
sys.path.insert(0, PATH_TO_KB_MODULE)
import kb
from tte import extract_emotion


class TteService:

    def __init__(self, kb_ID):
        self.kb_ID = kb_ID
        print("init tte Service")

    def read_from_KB(pattern):
        """
        Read a tuple from the KB
        """
        # not needed here
        return

    def write_to_KB(self, fact):
        """
        Post a tuple to the KB
        """

        kb.addFact(self.kb_ID, TAG_USER_EMOTION, 1, 100, False, fact)
        return

    def callback(self, *param):
        """
        Assess user emotion from a given sentence
        """
        sentence = param[0][0]["$input"]
        print("callback TTE called")
        fact = extract_emotion(sentence)
        self.write_to_KB(fact)
        return

    def start_service(self):
        kb.subscribe(self.kb_ID, {"TAG": TAG_USER_TRANSCRIPT, "TEXT": "$input"}, self.callback) #from the 'text to speech' module

if __name__ == "__main__":
    global myID
    myID = kb.register()
    tte = TteService(myID)
    tte.start_service()
