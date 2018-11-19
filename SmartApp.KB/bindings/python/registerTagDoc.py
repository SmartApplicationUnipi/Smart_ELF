from kb import registerTagDoc
from kb import getTagDoc

print(registerTagDoc({"prova1": 'doc prova 1', "prova2": 'doc prova 2'}))
print(getTagDoc(['prova1', 'prova2', 'prova3']))