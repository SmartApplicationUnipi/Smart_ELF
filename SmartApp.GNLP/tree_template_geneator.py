from dep_tree import *
import nltk
import json

print("Generating templates...")

array = []
with open("query_template.txt", encoding="utf-8") as f:

    data = f.readlines()
    first = True
    classe = ""

    for row in data:

        row = row.replace("\n", "")

        if first:
            classe = row
            first = False
            continue

        if len(row) != 0:

            tree = get_dependency_tree(row, language='it')
            tree['8_class'] = classe
            #pp = pprint.PrettyPrinter()
            #pp.pprint(tree)
            array += [tree]
        else:
            first = True

def remove_extra(tree):
    del tree['1_norm']
    del tree['3_POS']
    del tree['4_tag']
    del tree['5_parent']
    del tree['6_dep']

    for c in tree['7_children']:
        remove_extra(c)

for t in array:
    remove_extra(t)

with open('query_template.json', 'w') as outfile:
    json.dump(array, outfile, indent=2, sort_keys=True, ensure_ascii=False)
