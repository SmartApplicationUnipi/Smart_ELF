import kb

myID = "enlp" # fake id at the moment

TAG_USELESS = "UNUSED" # this tag is nedeed but not used
def write_to_ELF(fact):
    """
    Post a tuple to the KB
    """
    # write fact to ELF!!!!

    kb.addFact(myID, TAG_USELESS, 1, 100, False, fact)
    print("added", str(fact))
    return

def read_from_ELF(topic):
    #print("topic", topic)
    a = (topic[0]["$input"], "en")
    print("Callback clean: " + str(a))
    return a[0]


def get_answer(kb_fact):
    a = (kb_fact[0]["$resp"], "en")
    print(a)
    return (kb_fact[0]["$resp"], "en")
