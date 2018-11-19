import external.kb_client as kb
from online.interface import online_connector as online
# import offline.interface as offline

#  Si può in modo che ci sono più queue 6 che matengo in memoria i frame di ogni
#  faccia che ha lo stesso id (dato da HAL-kinekt) cosi i vari threade che fanno
#  le richieste possono identificare separatamente le persone la prima volta e
#  non eseguire più l'identificazione fino a quando non subentra una nuova
#  immagine con un nuovo id.
#  Vedere il file StreamWebCam per un esempio di implementazione fatto da Michele

class Controller():

    def __init__(self):
        self.kbID = kb.register()

        # Initialization of Online Module
        self.online_module = online()

        # Initialization of Offline Module
        #self.offline_client = offline()

        # self.setAttr("initial attibutes")

    def _getResolver(self):
        """
            Get the resolver of detection.

            Params:

            Return:
                result (interface): Return object that will resolve the detection
                    of attributes and identity of person.
        """
        if self.online_module.isAvailable():
            res = self.online_module
        # elif self.offline_module.isAvailable():
        #     res = self.offline_module
        return res

    def setAttr(self, *args, **kwargs):
        """
            Set attributes that the module must be detect form future frame.

            Params:
                depends on the module

            Return:
        """
        self.online_module.setParamsToDetect(*args, **kwargs)
        #self.online_module.setParamsToDetect(*args, **kwargs)

    def watch(self, frame):
        module = self._getResolver()
        if module is not None:
            fact = module.worker(frame)
            fact.update({"TAG": "VISION_FACE_ANALYSIS"})

            if fact is not None:
                kb.addFact(self.kbID, "face", 1, fact['confidence_identity'], True, fact)

            print(fact)
        else:
            print("There aren't module available")
