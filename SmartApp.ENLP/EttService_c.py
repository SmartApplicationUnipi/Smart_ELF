import sys
from interface_tags import PATH_TO_KB_MODULE, TAG_ANSWER, TAG_ELF_EMOTION, TAG_COLORED_ANSWER
sys.path.insert(0, PATH_TO_KB_MODULE)
import kb
from ett import prepare_answer

class EttService:

    def __init__(self, kb_ID):
        self.kb_ID = kb_ID
        print("init ett Service")

    def read_from_KB(pattern):
        """
        Read a tuple from the KB
        """
        # needed to query kb for tuples on which assess ELF's emotion for the answer
        return

    def write_to_KB(self, fact, tag):
        """
        Post a tuple to the KB
        """
        kb.addFact(self.kb_ID, tag, 1, 100, False, fact)
        return

    def callback(self, *param):
        """
        Offers the service of eTT, consisting in manipulating an answer
        to the user in order to transform it with respect to some emotion
        extrapolated by ELF internal state (tuples)
        """
        answer = param[0][0]["$input"]
        print("callback ett called")
        a_fact, e_fact = prepare_answer(answer)
        self.write_to_KB(a_fact, TAG_COLORED_ANSWER)
        self.write_to_KB(e_fact, TAG_ELF_EMOTION)

    def start_service(self):
        """Subscribe and wait for data"""
        kb.subscribe(self.kb_ID, {"TAG":TAG_ANSWER, "text": "$input"}, self.callback) # from the 'gnlp' module


if __name__ == "__main__":
    global myID
    myID = kb.register()
    ett = EttService(myID)
    ett.start_service()
