"""
This module generate a DRS from a parse tree of a sentence
CURRENTLY NOT USED. A grammar approach is used instead. See DrsService.py
"""
import nltk
import json

nltk.download('omw')
nltk.download('wordnet')
from nltk.corpus import wordnet


def load_templates(file_path):

    f = open(file_path)
    data = json.load(f)

    return data

def match_tree(sample, template):

    # matching the content of the root
    # To have a match, the Template should not contain any punctuation

    sample_lemmas = wordnet.lemmas(sample['2_lemma'], lang='ita')
    template_lemmas = wordnet.lemmas(template['2_lemma'], lang='ita')

    sample_synset = set()
    template_synset = set()

    for lem in sample_lemmas:
        lem.synset().name()
        sample_synset |= set([lem.synset().name()])

    for lem in template_lemmas:
        lem.synset().name()
        template_synset |= set([lem.synset().name()])

    if len(sample_synset.intersection(template_synset))==0:
        return False

    for t_root in template['7_children']:

        if t_root['0_text'] == '$':
            continue

        found = False
        for s_root in sample['7_children']:

            if match_tree(s_root, t_root):
                found = True
                break

        if not found:
            return False


    return True

def get_class(tree_input):
    template_list = load_templates("query_template.json")

    for template_tree in template_list:

        if match_tree(tree_input, template_tree):
            return template_tree['8_class']

    return "NoClass"


def get_id(tree_input):
    template_list = load_templates("query_template.json")

    for template_tree in template_list:

        if match_tree(tree_input, template_tree):
            return template_tree['9_id']

    return "NoId"
