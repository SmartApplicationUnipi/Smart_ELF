import external.kb_client as kb
import external.hal_client as hal
from online.interface import online_connector as online
# import offline.interface as offline

import threading as Threading

#  Si possono avere più queue (almeno 6 dato che 6 è il numero massimo di facce
#  riconosciute simultaneamente dal kinekt) che matengo in memoria i frame di
#  ogni faccia che ha lo stesso id (dato da HAL-kinekt) cosi da poter avere
#  diversi thread che eseguono le richieste al modulo separatamente per ogni
#  persona. Cosi facendo sarà necesssario eseguire l'identifica solo una volta,
#  la prima volta, e non eseguirla più fino a quando non subentra una nuova
#  immagine con un nuovo id (l'id è un id generato dal kinekt per quella faccia)
#
#  Vedere il file StreamWebCam per un esempio di implementazione
#  (fatto da Michele in script/StreamWebCam)

class Controller(Threading.Thread):

    #FIFO queue
    q = Queue(maxsize= 5)

    def take_frame(frame_obj):
        if Controller.q.full():
            Controller.q.get()

        Controller.q.put(frame)

    def __init__(self):
        self._kbID = kb.register()

        _hal = HALInterface(HALAddress= "10.101.53.14")
        _videoID = _hal.registerAsVideoReceiver(take_frame)
        if _videoID == -1:
            print("Ops!, something wrong happens during the interaction with the HALModule. (Video)")
            exit(-1)

        # Initialization of Online Module
        self.online_module = online()
        self.available = self.online_module.is_available()

        # Initialization of Offline Module
        #self.offline_client = offline()

        # self.setAttr("initial attibutes")
        self.start()

    def _getResolver(self):
        """
            Get the resolver of detection.

            Params:

            Return:
                result (interface): Return an object that will resolve the detection
                    of attributes and identity of person.
        """
        if self.available:
            res = self.online_module

        else:
            raise NotImplementedError( " Sorry :( ..offline connector not yet available .." )
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
        self.online_module.set_detect_attibutes(*args, **kwargs)
        #self.online_module.set_detect_attibutes(*args, **kwargs)

    def watch(self, frame):
        module = self._getResolver()
        if module is not None:
            fact = module.analyze_face(frame)
            fact.update({"TAG": "VISION_FACE_ANALYSIS"})

            if fact is not None:
                kb.addFact(self.kbID, "face", 1, fact['confidence_identity'], True, fact)

            print(fact)
        else:
            print("There aren't module available")

    def run(self):
        try:
            while True:
                self.watch(Controller.q.get())
                Controller.q.task_done()
        except Exception as e:
            exit(-1)

    def __del__(self):
        _hal.unregister(videoID)
        _hal.quit()


Controller()
print("avviato")
