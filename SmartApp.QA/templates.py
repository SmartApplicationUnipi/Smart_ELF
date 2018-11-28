import sys
from simple_queries import query_prof_t, query_prof


def __main__():
    n_args = len(sys.argv)
    if n_args == 2:
        input_q = sys.argv[1]
    else:
        input_q = "Dove si trova la Lezione del Professor Gervasi?"
    dict_q, dict_answ = init_templates_dict()
    check_exact_match(input_q, dict_q, dict_answ)



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
        dict_q[tup[1].lower()] = tup[0]

    dict_answ = {}
    
    for tup in query_prof_t:
        dict_answ[tup[0]] = (tup[1], tup[2])
    return dict_q, dict_answ


def check_exact_match(input_q, dict_q, dict_answ):
    """TODO should be a class method of gnlp Service
    Silliest matching attempt: a list of keywords to find in the user's sentence
    After removing professor's name, we check inside dict_q for a match.
    If found, a query is retrieved from dict_answ and sent to KB,
    the correspondig template of the answer should be filled with datas received
    input_q= user's question to ELF
    """
    
    keywords = ["professor"]
    input_q = input_q.lower().replace("?","")
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
        else:
            print("sentence:\t" + input_q)
            sentence_id = dict_q.get(input_q, -1)
            
            print("answer:\t" + dict_answ[sentence_id][1])
    

    
    

__main__()