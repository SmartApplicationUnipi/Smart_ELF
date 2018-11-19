from kb import register, registerTagDoc, getTagDoc

print(register({"prova1": 'p1', "prova2": 'p2'}))
print(registerTagDoc({"prova1": 'doc prova 1', "prova2": 'doc prova 2'}))
print(getTagDoc(['prova1', 'prova2', 'prova3']))

print(register({"prova1": 'p1', "prova2": 'p2', "prova3" : "p3"}))
