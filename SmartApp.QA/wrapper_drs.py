from drs import f

#parstring = 'rules.fcfg'; sentence = 'Angus knows Irene'
#parstring = 'ELF_rules.fcfg'; sentence = 'dove posso trovare la lezione del professor Attardi'
#parstring = 'SEM_rules.fcfg'; sentence = 'lezione del professor Attardi'
#parstring = 'prove.fcfg'; sentence = 'one two three four'
#parstring = 'properties.fcfg'; sentence = '<object1> <relation> <property2> <property3> <object2> <relation> <property3> <object2>'
#parstring = 'properties.fcfg'; sentence = '<object1> <property2> <object2> <object1>'
#parstring = 'grammar_rules.fcfg'; sentence = 'professor'
#parstring = 'grammar_rules.fcfg'; sentence = 'Attardi'
#parstring = 'grammar_rules.fcfg'; sentence = 'professor Attardi'
#parstring = 'binary.fcfg'; sentence = 'one two'
#parstring = 'TEST_rules.fcfg'; sentence = 'dove posso trovare la lezione del professor Attardi'
parstring = 'TEST_rules.fcfg'; sentence = 'dov è la lezione del professor Attardi'
#parstring = 'TEST_rules.fcfg'; sentence = 'dove'

#tree = True
tree = False

if __name__ == "__main__":
    res = f(sentence,parstring,debug="yes")
    for el in res:
        if (tree):
            print(el)
        else:
            print(el.label()['SEM'].simplify())
