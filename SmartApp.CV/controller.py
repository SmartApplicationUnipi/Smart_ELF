from external.kb_client import KnowledgeBaseClient as kb
import external.hal_client as hal
from online.interface import online_connector as online
# import offline.interface as offline

import threading as Threading
from queue import *
import time


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

class Controller():

    #FIFO queue
    q = Queue(maxsize= 5)

    def _take_frame(frame_obj):
        """
            Function of callback used from HAL group to send a frame

            Params:
                frame_obj (object): object that contain all image of face in a
                    frame
        """
        print("frame preso")
        if Controller.q.full():
            Controller.q.get()

        Controller.q.put(frame_obj)

    def _woker(self, queue):
        """
            Function of thread that compute analyzation of frame.

            Params:
                queue (Queue): queue associated at thrad of frame
        """


        try:
            while True:

                if self.webcam:
                    ret, frame = self.video_capture.read() #np.arra
                    frame = cv2.resize(frame, (320, 240))
                    queue.put(frame)

                self.watch(queue.get())
                print("lavoro")
                queue.task_done()
        except Exception as e:
            print(e)

    def __init__(self, startWorker = False, webcam = False):
        self._kb = kb(True)
        self._kb.registerTags({'vis':{}})

        self.webcam = webcam

        self._hal = None
        self._videoID = None
        self.video_capture = None

        if not webcam:
            self._hal = hal.HALInterface(HALAddress= "10.101.53.14")
            self._videoID = self._hal.registerAsVideoReceiver(Controller._take_frame)
            if self._videoID == -1:
                print("Ops!, something wrong happens during the interaction with the HALModule. (Video)")
                exit(-1)
        else:
            import cv2
            self.video_capture = cv2.VideoCapture(0)

        # Initialization of Online Module
        self.online_module = online()

        # Initialization of Offline Module
        # self.offline_client = offline()

        self.module = self._getResolver()

        self.t = None
        if not startWorker:
            # Creare 6 thread che lavoreano su più persone
            self.t = Thread(target=_worker, args=[self, Controller.q])
            self.t.daemon = True
            self.t.start()

    def _getResolver(self):
        """
            Get the resolver of detection.

            Params:

            Return:
                result (interface): Return an object that will resolve the detection
                    of attributes and identity of person.
        """
        if self.online_module.is_available():
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

        print("sto guardando")
        fact = module.analyze_face(frame)
        fact.update({"TAG": "VISION_FACE_ANALYSIS"})

        if fact is not None:
            self._kb.addFact("face", "vis", 1, fact['confidence_identity'], fact)

        print(fact)

    def __del__(self):
        if self._hal is None:
            self._hal.unregister(self._videoID)
            self._hal.quit()
        Controller.q.join()
        if self.t is not None:
            self.t.join()


if __name__ == '__main__':
    controller = Controller(True)
    time.sleep(15)
