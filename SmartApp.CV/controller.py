from external_modules.kb_client import KnowledgeBaseClient as kb
import external_modules.hal_client as hal
from online.interface import online_connector as online
from offline.offvision import OffVision as offline
import numpy as np

from threading import *
from queue import Queue
import cv2


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
#

DOCS = {
'VISION_FACE_ANALYSIS': {
    'doc':"""{
        'personID': identifier of the face descriptor,
        'emotion': {
            'sadness':   confidence in float [0,1],
            'calm':      confidence in float [0,1],
            'disgust':   confidence in float [0,1],
            'anger':     confidence in float [0,1],
            'surprise':  confidence in float [0,1],
            'fear':      confidence in float [0,1],
            'happiness': confidence in float [0,1]
        },
        'gender': predicted gender of person ['Male', 'Female', 'Unknown']
        'age': predicted age of person -- int [0-99] U {-1} if unknown,
        'smile': whether the person is smiling -- ['True', 'False', 'Unknown'],
        'known': whether the person has been already seen -- ['True', 'False', 'Unknown'],
        'confidence_identity': confidence of face matching -- float [0-1],
        'look_at': {
            'pinch': position to look in y axis -- float [-1 - +1],
            'yaw': position to look in y axis -- float [-1 - +1]
        }
        'is_interlocutor': whether the person is the interlocutor -- ['True', 'False']
        'z_index': distance of person from kinekt -- {-1} if unknown
    }""",
    'desc': """Json that contain all needed information of single face, the TTL of
        this information is about 2 seconds (time of elaboration of single file)"""
}}

class Controller():

    #FIFO queue
    q = Queue(maxsize= 5)

    def __init__(self, host = "127.0.0.1"):
        """
            se host è webcam uso la webcam
        """
        # Ops for KB
        self._kb = kb(persistence = True)
        # mi registrerò
        self._kb.registerTags(DOCS)

        # Ops for stram in input
        self.is_host = not (host == "webcam")

        self._hal = None
        self._videoID = None
        self.video_capture = None

        if self.is_host:
            self._hal = hal.HALInterface(HALAddress= host)
            self._videoID = self._hal.registerAsVideoReceiver(Controller._take_frame)
            if self._videoID == -1:
                print("Ops!, something wrong happens during the interaction with the HALModule. (Video)")
                exit(-1)
        else:
            self.video_capture = cv2.VideoCapture(0)

        # Initialization of Online Module
        try:
            self.online_module = online()
            self.has_api_problem = False
        except AttributeError as e:
            self.has_api_problem = True

        # Initialization of Offline Module
        self.offline_module = offline()

        # Select module available
        self.module = self._getResolver()

        # Ops for worker that compute all the analyzes
        # TODO Creare 6 thread che lavoreano su più persone
        self.t = Thread(target=Controller._worker, args=[self, Controller.q])
        self.t.daemon = True
        self.t.start()

    def _take_frame(frame_obj):
        """
            Function of callback used from HAL group to send a frame

            Params:
                frame_obj (object): object that contain all image of face in a
                    frame
        """
        if Controller.q.full():
            Controller.q.get()
        for face in frame_obj:
            Controller.q.put((face, frame_obj.frame_original_size))

    def _worker(self, queue):
        """
            Function of thread that compute all the analyzes of frame.

            Params:
                queue (Queue): queue associated at thrad of frame
        """

        try:
            while True:
                if self.is_host:
                    face_obj, frame_size  = queue.get()
                    self.watch(face_obj, frame_size)
                    queue.task_done()
                else: # TODO: delete this option only for test
                    ret, frame = self.video_capture.read()
                    frame = cv2.resize(frame, (320, 240))
                    self.watch(frame)

        except Exception as e:
            print(e)

    def _getResolver(self):
        """
            Get the resolver of detection.

            Params:

            Return:
                result (interface): Return an object that will resolve the detection
                    of attributes and identity of person.
        """
        if not self.has_api_problem:
            if self.online_module.is_available():
                print("using online vision module")
                res = self.online_module
        elif self.offline_module.is_available():
            print("using offline vision module")
            res = self.offline_module
        else:
            raise Exception("Vision Module is not available")
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

    def watch(self, face, frame_size = (0,0)):

        try:
            fact = self.module.analyze_face(face.img)
            print(fact)
            if not fact:
                print("Non vedo nessuno")
            else:
                look_at = {'pinch': 0, 'yaw':0}
                if face.frame_original_size is not (0,0):
                    look_at = list( (p/(s/2))-1 for p,s in zip(face.face_position, face.frame_original_size))
                    look_at = {'pinch': look_at[0], 'yaw': look_at[1]}

                fact.update({"look_at": look_at})
                fact.update({"is_interlocutor": face.is_interlocutor})
                fact.update({"z_index": face.z_index})

                self._kb.addFact("face", "VISION_FACE_ANALYSIS", 1, fact['confidence_identity'], fact)
                print(fact)

        except Exception as e:# TODO: delete this option only for test
            print("here", e)
            fact = self.module.analyze_face(face)
            if not fact:
                print("Non vedo nessuno")
            else:
                self._kb.addFact("face", "VISION_FACE_ANALYSIS", 1, fact['confidence_identity'], fact)
                print(fact)

    def __del__(self):
        if self._hal is not None:
            self._hal.unregister(self._videoID)
            self._hal.quit()
        Controller.q.join()
        self.t.join()


if __name__ == '__main__':
    controller = Controller(host = "webcam")
    input('Enter anything to close:')
