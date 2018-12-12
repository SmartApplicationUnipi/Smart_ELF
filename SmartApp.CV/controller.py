from external_modules.kb_client import KnowledgeBaseClient as kb
import external_modules.hal_client as hal
from online.online_module import online_module as online
from offline.offvision import OffVision as offline

from face_db import face_db as db

from threading import Thread, Timer, Event
from queue import Queue
import cv2

from time import sleep

#TODO: fuzione di call back che viene chiamata quanto hal si schianta questa funzione non deve fare altro che
#TODO: riprovare a registrarsi e nel caso in cui non avvenga la rigistrazione ho un meno uno quei aspetto e ci riporovo poco dopo


#  IDEA: Si possono avere più queue (almeno 6 dato che 6 è il numero massimo di
#  facce riconosciute simultaneamente dal kinect) che matengo in memoria i frame
#  di ogni faccia che ha lo stesso id (dato da HAL-kinekt) cosi da poter avere
#  diversi thread che eseguono le richieste al modulo separatamente per ogni
#  persona. Cosi facendo sarà necesssario eseguire l'identifica solo una volta,
#  la prima volta, e non eseguirla più fino a quando non subentra una nuova
#  immagine con un nuovo id (l'id è un id generato dal kinekt per quella faccia)
#
#  Vedere il file StreamWebCam per un esempio di implementazione
#  (fatto da Michele in script/StreamWebCam)

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
        'z_index': distance of person from kinect -- {-1} if unknown
    }""",
    'desc': """Json that contain all needed information of single face, the TTL of
        this information is about 2 seconds (time of elaboration of single file)"""
}}

class Controller():

    #FIFO queue
    task_queue = Queue(maxsize= 5)

    def __init__(self, host = "10.101.41.242"):
        """
            se host è webcam uso la webcam
        """
        # KB initialization
        self._kb = kb(True)
        self._kb_ID = (self._kb.register())['details']
        self._kb.registerTags(self._kb_ID, DOCS)

        # input stream setupS
        self.is_host = not (host == "webcam")
        self._hal = None
        self._videoID = None
        self._video_capture = None

        #input stream initialization
        if self.is_host:
            self._hal = hal.HALInterface(HALAddress= host)
            self._videoID = self._hal.registerAsVideoReceiver(callback = self._get_frame, errback = self._crash_of_HAL)
            if self._videoID == -1:
                print("Ops!, something wrong happens during the interaction with the HALModule. (Video)")
                exit(-1) # TODO raise Exception
        else:
            self._video_capture = cv2.VideoCapture(0)

        # DB initialization
        self.db = db()
        self._worker = None

        #switcher setup
        self.terminate = Event()
        self.plan_checking = False
        self.connection_planner = None

        # Modules initialization
        self._online_module = None
        self._offline_module = None
        self.active_module = None

        # Online Module Initialization
        try:
            self._online_module = online()
            self.has_api_problem = False
        except Exception as e:
            self.has_api_problem = True
            print(type(e).__name__, e)
            print("\n It seems that there is a problem with the online module: I'm swithing to offline module...")

        # option to retry initialization if it has failed (eg, no internet connection during init)
        self.retry_init_online_module = False

        # Offline Module Initialization
        try:
            self._offline_module = offline()
        except Exception as e:
            print(type(e).__name__, e)
            print("\n It seems that there is a problem in the initialization!")

        #Active module initializzation
        if self.has_api_problem:
            self.active_module = self._offline_module
        elif self._online_module :
            self.active_module = self._online_module
        else:
            raise Exception("No module available...")

        # worker initialization
        self._worker = Thread(target=Controller._job, args=[self, Controller.task_queue])
        self._worker.daemon = True
        self._worker.start()


    def _crash_of_HAL(self):
        """
            callback function called in case of Hardware module crash
        """
        loop = True
        while loop:
            sleep(5)
            self._videoID = self._hal.registerAsVideoReceiver(callback = Controller._get_frame, errback = Controller._errHAL)
            if self._videoID != -1:
                loop = False

    def _get_frame(self, frame_obj):
        """
            Function of callback used from HAL group to send a frame

            Params:
                frame_obj (object): object that contain all image of face in a
                    frame
        """
        if self.task_queue.full():
            self.task_queue.get()
        for face in frame_obj.faces:
            self.task_queue.put((face.img, frame_obj.frame_original_size))

    def _get_person_id(self, fact, tuple, img):
        """
            Function return the id that matches with internal face_db

            Params:
                fact: fact generated in json-like format
                tuple: tuple to check
                img: img used to generate descriptor
        """
        if fact is not None and tuple is not None:
            res = self.db.soft_get(tuple)
            # res = [ [ tuple1, confidence1 ] ... [tuple_n, confidence_n] ]
            if len(res) > 0: #something matches
                vals = [res[0][0][0], res[0][1], True]
            elif self.has_api_problem: #offline module case
                vals = [self.db.insert(tuple), 0, False]
            else: #online module case
                descriptor = self._offline_module.get_descriptor(img)
                res = self.db.soft_get((descriptor, None))
                if len(res) > 0: #something matches
                    #return ID and update record with the token
                    vals = [res[0][0][0], res[0][1], True]
                    self.db.modify((None, descriptor  , None), (None, None, fact['personID']))
                else:
                    #no match add it to db
                    vals = [self.db.insert((descriptor, fact['personID'])), 0, False]

            atts = ['personID', 'confidence_identity', 'known']
            for att, val in zip(atts, vals):
                fact.update({att:val})

        return fact

    def _job(self, queue):
        """
            Function of thread that compute all the analyzes of frame.

            Params:
                queue (Queue): queue associated at thrad of frame
        """
        face_obj, frame_size, img = None, None, None
        while True:
            if self.terminate.is_set():
                break
            try:
                if self.is_host:
                    face_obj, frame_size  = queue.get() # TODO specify parameter 'block'
                    img = face_obj.img
                    queue.task_done()
                else: # This option is for test purpose, it uses webcam
                    ret, frame = self._video_capture.read()
                    frame_size = (320, 240)
                    img = face_obj = cv2.resize(frame, frame_size)
                fact, tuple = self.watch(face_obj, frame_size)
                # tuple = (descriptor, token)
                if fact and tuple:
                    fact = self._get_person_id(fact, tuple, img)
                    print("++++++++++++++++++++\n")
                    print(fact)
                    print("++++++++++++++++++++\n")
                    res = self._add_fact_to_kb(fact)

            except Exception as e:
                print("_worker function ->"+type(e).__name__, e)
                self.has_api_problem = True
                self.active_module = self._offline_module


    def _add_fact_to_kb(self, fact, tag='VISION_FACE_ANALYSIS'):
        """
            add a fact to kb
            params:
                fact: fact in json-like format
                tag: tag for the current module default is 'VISION_FACE_ANALYSIS'
        """
        try:
            self._kb.addFact(self._kb_ID, tag, 1, jsonFact=fact, reliability=fact['confidence_identity'])
        except Exception as e:
            print("Could not add fact", e)

    # def _add_fact_to_kb(self, fact, tag='VISION_FACE_ANALYSIS'):
    #     try:
    #         result = self._kb.query({"_meta":{"tag":"VISION_FACE_ANALYSIS"}, "_data":{"is_interlocutor":"True"}})
    #         if result["success"]:
    #             if len(result["details"]) > 0:
    #                 self._kb._update_fact_to_kb(fact)
    #             else:
    #                 self._kb.addFact(self._kb_ID, tag, 1, jsonFact=fact, reliability=fact['confidence_identity'])
    #     except Exception as e:
    #         print("Could not add fact", e)
    #
    # def _update_fact_to_kb(self, fact, tag='VISION_FACE_ANALYSIS'):
    #     try:
    #         #res = self._kb.query({"_meta":{"tag":"VISION_FACE_ANALYSIS"}, "_data":{"is_interlocutor":"True"}})
    #         #primo campo inutile per se è adata a buon fine
    #         #ilsecondo list di risultato
    #         self._kb.updateFactByID(self._kb_ID, tag, 1, jsonFact=fact, reliability=fact['confidence_identity'])
    #     except Exception as e:
    #         print("Could not add fact", e)

    def _switch_module_event(self):
        """
            Switch to online/offline according to the network status

        """
        print("\nChecking connection")
        if self._online_module is None:
            #try initialization
            try:
                self._online_module = online()
            except Exception as e:
                print("\nInitializzation Error")
                print(type(e).__name__, e)
                self.active_module = self._offline_module

        if self._online_module.is_available():
            print("\nUsing online module")
            self.active_module = self._online_module
            self.plan_checking = False
            self.has_api_problem = False
        else:
            print("\nUsing offline module")
            self.active_module = self._offline_module

        self.plan_checking = False

    def watch(self, face, frame_size = (0,0)):
        """
            Analyze a frame and return a json-like object and a tuple according to information extracted (typically recognition and emotions)

            Params:
                face: face frame to be analyzed
                frame_size: if provided is considered in computing head posing information like pinch and yaw
            return:
                fact:  in the format required by KB
                tuple:  in form of a triple (id, descriptor, token). the tuple can contain one or more None values.

            N.B. : both face and tuple could be None if it doens't recognize a face in the frame or something inexpected happens.
        """

        if self.has_api_problem and self.plan_checking == False:
            self.connection_planner = Timer(5.0, self._switch_module_event)
            self.connection_planner.start()
            self.plan_checking = True

        if self.has_api_problem == False and self.connection_planner is not None and self.connection_planner.is_alive():
                self.connection_planner.cancel()

        fact, tuple = self.active_module.analyze_face(face)

        if fact:
            look_at = {'pinch': 0, 'yaw':0}
            if set(frame_size)==0:
                face_position = face.face_position if hasattr(face, "face_position") else (0, 0)
                look_at = list( round((p/(s/2))-1, 4) for p,s in zip(face_position, frame_size))
                look_at = {'pinch': look_at[0], 'yaw': look_at[1]}

            fact.update({
                "look_at": look_at,
                "is_interlocutor": face.is_interlocutor if hasattr(face, "is_interlocutor") else False,
                "z_index": face.z_index if hasattr(face, "z_index") else -1,
            })
        else:
            print("I can't see anyone")

        return fact, tuple

    def close(self):
        """
            Close each I/O stream and realease resources.
            N.B. : Since asynchronous calls are running during the execution, some processes could be terminated soon after this call.
        """
        print("turning off the controller...")

        if self._video_capture:
            self._video_capture.release()
        if hasattr(self, "terminate"):
            self.terminate.set()
        if self._hal:
            self._hal.unregister(self._videoID)
            self._hal.quit()
        Controller.task_queue.join()
        self.db.close()
        if self._worker:
            self._worker.join()
        if self.connection_planner:
            self.connection_planner.cancel()

if __name__ == '__main__':
    controller = Controller(host = "webcam")
    input('Enter anything to close:')
    controller.close()
