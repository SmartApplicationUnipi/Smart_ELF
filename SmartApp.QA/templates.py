import sys
from simple_queries import query_prof_t, query_prof, query_corso, query_corso_t, query_cancellazione, query_cancellazione_t
from nltk.tokenize import RegexpTokenizer

tokenizer = RegexpTokenizer(r'\w+')

def __main__():
    n_args = len(sys.argv)
    if n_args == 2:
        input_q = sys.argv[1]
    else:
        input_q = "Dove si trova la Lezione del Professor Gervasi?"
    dict_q, dict_answ, dict_q_corso, dict_answ_corso = init_templates_dict()
    check_exact_match(input_q, dict_q, dict_answ, ["professor", "professore"])
    check_exact_match(input_q, dict_q_corso, dict_answ_corso, ["corso", "corso di"])



def init_templates_dict():
    """TODO should be a class method of gnlp Service
    dict_q is a dictionary with queries
        - key= query sentence
        - value= sentence_id
    dict_answ is a dictionary of associated query to send to KB and answer with placeholder
        - key= sentence_id
        - value= (KB_query, answer with placeholders)
    """

    dict_q = {}
    for tup in query_prof:
        dict_q[preprocess_sentence(tup[1])] = tup[0]

    dict_answ = {}

    for tup in query_prof_t:
        dict_answ[tup[0]] = (tup[1], tup[2])
        
    dict_q_corso = {}
    for tup in query_corso:
        dict_q_corso[preprocess_sentence(tup[1])] = tup[0]

    dict_answ_corso = {}

    for tup in query_corso_t:
        dict_answ_corso[tup[0]] = (tup[1], tup[2])
    

    # repeat for all the tuples?
    
    return dict_q, dict_answ, dict_q_corso, dict_answ_corso


def check_exact_match(input_q, dict_q, dict_answ, kwrd_list):
    """TODO should be a class method of gnlp Service
    Silliest matching attempt: a list of keywords to find in the user's sentence
    After removing professor's name, we check inside dict_q for a match.
    If found, a query is retrieved from dict_answ and sent to KB,
    the correspondig template of the answer should be filled with datas received
    input_q= user's question to ELF
    """

    keywords = kwrd_list 
    input_q = preprocess_sentence(input_q)
    for kwrd in keywords:
        found_idx = input_q.find(kwrd)
        if (found_idx != -1):
            index = len(kwrd) + found_idx + 1
            prof = input_q[index:]
            print(prof)
            input_q = input_q[:index].rstrip()
            print(input_q)
        if (dict_q.get(input_q, -1) == -1):
            print("key not found")
            return (False, "Not found")
        else:
            print("sentence:\t" + input_q)
            sentence_id = dict_q.get(input_q, -1)
            kb_q = dict_answ[sentence_id][0]
            templ_answ = dict_answ[sentence_id][1]
            print("answer:\t" + dict_answ[sentence_id][1])
            return (True, kb_q, templ_answ)


def preprocess_sentence(sentence):
    preprocessed = sentence.lower()
    # tokens not usable in dict
    #preprocessed = tokenizer.tokenize(preprocessed)
    
    # add stopword removal?
    #print(preprocessed)
    return preprocessed


__main__()
