from external_modules.kb_client import KnowledgeBaseClient as kb
import external_modules.hal_client as hal
from online.online_module import online_module as online
from offline.offvision import OffVision as offline

import numpy as np
from threading import *
from queue import Queue
import cv2

from face_db import face_db as db

import traceback


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

    def __init__(self, host = "10.101.41.242"):
        """
            se host è webcam uso la webcam
        """
        # Ops for KB
        #self._kb = kb(persistence = True)
        # mi registrerò
        #self._kb.registerTags(DOCS)

        # Ops for stream in input
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
            print(type(e).__name__, e)
            print("\n It seems that there is a problem with the online module: I'm swithing to offline module...")

        # Initialization of Offline Module
        try:
            self.offline_module = offline()
        except Exception as e:
            print(type(e).__name__, e)
            print("\n It seems that there is a problem in the initialization!")

        # DB initialization
        self.db = db()

        # Ops for worker that compute all the analyzes
        # TODO Creare 6 thread che lavoreano su più persone
        self.t = Thread(target=Controller._worker, args=[self, Controller.q])
        self.t.daemon = True
        self.t.start()

        # Initialization of exponential backoff machanism
        # (note: for multithreading, this needs to be in the local storage!)
        self.attempt = 0
        self.exponent = 1
        self.max_exponent = 8
        # never attempt online module if it isn't available
        if self.has_api_problem:
            self.attempt = float('inf')

    def _take_frame(frame_obj):
        """
            Function of callback used from HAL group to send a frame

            Params:
                frame_obj (object): object that contain all image of face in a
                    frame
        """
        if Controller.q.full():
            Controller.q.get()
        for face in frame_obj.faces:
            Controller.q.put((face.img, frame_obj.frame_original_size))

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
                    fact, tuple = self.watch(face_obj, frame_size)

                    if fact is not None and tuple is not None:
                        res = self.db.get(tuple)
                        # res = [ [ tuple1, confidence1 ] ... [tuple_n, confidence_n] ]

                        if len(res) > 0:
                            #something matches
                            fact['personID'] = res[0][0]
                            fact['confidence_identity'] = res[0][1]
                            fact['known'] = True

                        elif self.has_api_problem:
                            #offline module case
                            fact['personID'] = self.db.insert(tuple)
                            fact['confidence_identity'] = 0
                            fact['known'] = False

                        else:
                            #online module case
                            #compute descriptor
                            descriptor = offline.get_descriptor(face_obj.img)
                            #search descriptor
                            res = self.db.get(( descriptor, None )

                            if len(res) > 0:
                                #something matches
                                #return ID and update record
                                fact['personID'] = res[0][0]
                                fact['confidence_identity'] = res[0][1]
                                fact['known'] = True
                                self.db.modify( descriptor, fact['personID'] )
                            else:
                                #no match add it to db
                                fact['personID'] = self.db.insert(( descriptor, None ))
                                fact['confidence_identity'] = 0
                                fact['known'] = False

                    #self._add_fact_to_kb(fact)
                    queue.task_done()
                else: # TODO: delete this option only for test
                    ret, frame = self.video_capture.read()
                    frame = cv2.resize(frame, (320, 240))
                    fact = self.watch(frame)
        except Exception as e:
            print(type(e).__name__, e)

    def _add_fact_to_kb(self, fact, tag='VISION_FACE_ANALYSIS'):
        try:
            self._kb.addFact("face", tag, 1, jsonFact=fact, reliability=fact['confidence_identity'])
        except Exception as e:
            print ("could not add fact", e)

    def _getResolver(self):
        """
            Get the resolver of detection.

            Params:

            Return:
                result (interface): Return an object that will resolve the detection
                    of attributes and identity of person.
        """
        res = None
        if not self.has_api_problem:
            if self.online_module.is_available():
                print("Using online vision module")
                res = self.online_module
                return res

        if self.offline_module.is_available():
            print("Using offline vision module")
            res = self.offline_module
            return res

        if res == None:
            raise Exception("Vision Module is not available")

    def setAttr(self, *args, **kwargs):
        """
            Set attributes that the module must be detect form future frame.

            Params:
                depends on the module

            Return:
        """
        self.online_module.set_detect_attibutes(*args, **kwargs)

    def watch(self, face, frame_size = (0,0)):
        img = face.img if hasattr(face, "img") else face
        is_interlocutor = face.is_interlocutor if hasattr(face, "is_interlocutor") else False
        face_position = face.face_position if hasattr(face, "face_position") else (0, 0)
        z_index = face.z_index if hasattr(face, "z_index") else -1

        # Exponential backoff mechanism
        try:
            if self.attempt < 1:
                # attempt an online analysis
                fact, tuple = self.online_module.analyze_face(img)
                # all fine, reset backoff
                self.exponent = 1
            else:
                # we're in the backoff interval, work offline
                fact, tuple = self.offline_module.analyze_face(img)
                # one more attempt done
                self.attempt -= 1
                # print('*** BACKOFF attempt', self.attempt, 'of exponent', self.exponent, '***')
        except:
            traceback.print_exc()
            # something went wrong, double the attempt interval (until maximum length)
            if self.exponent < self.max_exponent:
                self.exponent += 1
            # begin the new backoff interval
            self.attempt = 2 ** self.exponent
            # remeber, we've still to analyze this face:
            fact, tuple = self.offline_module.analyze_face(img)

        if not fact:
            print("Non vedo nessuno")
        else:
            look_at = {'pinch': 0, 'yaw':0}
            if set(frame_size)==0:
                look_at = list( (p/(s/2))-1 for p,s in zip(face_position, frame_size))
                look_at = {'pinch': look_at[0], 'yaw': look_at[1]}

            fact.update({"look_at": look_at})
            fact.update({"is_interlocutor": is_interlocutor})
            fact.update({"z_index": z_index})

        return fact, tuple

    def __del__(self):
        if self._hal is not None:
            self._hal.unregister(self._videoID)
            self._hal.quit()
        Controller.q.join()
        #self.t.join()


if __name__ == '__main__':
    controller = Controller(host = "webcam")
    input('Enter anything to close:')
