from drs import drs_matcher

#parstring = 'property_rules_structure.fcfg'; sentence = '<object1> <relation> <property2> <property3> <object2> <relation> <property3> <object2>'
#parstring = 'property_rules_structure.fcfg'; sentence = '<object1> <property2> <object2> <object1>'
#parstring = 'property_rules_structure.fcfg'; sentence = '<object1> <relation> <object2>'
#parstring = 'DRS_rules.fcfg'; sentence = 'dove posso trovare la lezione del professor Attardi'
parstring = 'DRS_rules.fcfg'; sentence = 'dov è la lezione del professor Attardi'

#display_parse_tree = True
display_parse_tree = False

if __name__ == "__main__":
    res = drs_matcher(sentence,parstring,"",debug="yes") #do not change this call!
    for el in res:
        if (display_parse_tree):
            print(el)
        else:
            print(el.label()['SEM'].simplify())
