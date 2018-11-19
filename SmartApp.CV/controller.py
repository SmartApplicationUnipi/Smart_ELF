import os
import urllib
import kb_client as kb
from online.SDK.face_client import Facepp_Client as online
#from offline.offvision import OffVision as offline

class Controller():
    def __init__(self):
        self.kbID = kb.register()
        self.faceset_outer_id = "Fibonacci_FaceSet_0001"
        self.faceset_token = ""
        self.HOST = "http://api-eu.faceplusplus.com"

        # Initialization of Online Module
        self.client = online()
        res = self.client.getFaceSets()
        for faceset in res['facesets']:
            if faceset['outer_id'] == self.faceset_outer_id:
                self.faceset_token = faceset['faceset_token']
                break

        if self.faceset_token == "":
            res = self.client.createFaceSet(outer_id = self.faceset_outer_id)
            self.faceset_token = res['faceset_token']

        # Initialization of Offline Module
        #self.offline_client = offline()
        return


    def _checkConnection(self, reference):
        """
        Check server availability
            Params:
                None
            Return:
                    True if is possible to connect to the service, False otherwise
        """
        try:
            urllib.request.urlopen(reference, timeout=1)
            return True
        except urllib.request.URLError:
            return False

    def jsonFace2Fact(self, json):
        """
            produce a fact according to KB-format tha encapsulates information about faces
            Params:
                json: json response from API
            return:
                fact: json fact in KB-format
        """
        attr = json['attributes']
        norm = lambda x : round(x/100, 4)
        attr['emotion'] = { k : norm(v) for k, v in  attr['emotion'].items()}
        attr['gender'] = attr['gender']['value']
        attr['age'] = attr['age']['value']
        attr['smile'] = 'True' if attr['smile']['value'] >= attr['smile']['threshold'] else 'False'
        attr['emotion']['calm'] = attr['emotion'].pop('neutral')

        del json['attributes']
        del json['face_rectangle']

        if 'known' not in json:
            json.update({"known": False})
        if 'confidence_identity' in json:
            json['confidence_identity']  = round(json['confidence_identity']/100, 3)
        else:
            json.update({"confidence_identity": 0})

        json['personID'] = json.pop('face_token')
        json.update({"TAG": "VISION_FACE_ANALYSIS"})
        json.update(attr)

        return json

    def _online_module(self,frame):
        """
            Implement the Controller'logic
            recognition routine using API (Face++). It provide recognition and emotion detection
            Params:
                frame: matrix-like, filepath, file descriptor of the image.
            Return:
        """
        # take respose from server of face present in the frame
        result = self.client.detect(frame)
        # take list of faces
        faces = result["faces"]
        info = "face"
        to_check = True

        for face in faces:

            if to_check:
                facesetInfo = self.client.getFaceSetDetail(faceset_token = self.faceset_token )

            if facesetInfo['face_count'] > 0:
                res = self.client.search(face_token = face["face_token"], faceset_token = self.faceset_token)

                if len(res["results"]) > 0:
                    for candidate in res["results"]:
                        if candidate["confidence"] < 80:
                            #new face add it
                            self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
                            to_check = True
                            print("non ti conosco.. mi ricordero")
                        else:
                            #I know it and push a tuple to KB
                            print("ti conosco. Sei {}".format(candidate["face_token"]))

                            face["face_token"] = candidate["face_token"]
                            face.update({"known": True})
                            face.update({'confidence_identity' : candidate["confidence"]})
                            to_check = False
                else:
                    #face doesn't match add it
                    print("non ti conosco.. mi ricordero")
                    self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
                    to_check = True
            else:
                #faceset is empty add the new face
                print("faceset vuoto")
                self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
                to_check = True

            face = self.jsonFace2Fact(face)
            print(face)
            kb.addFact(self.kbID, info, 1, face['confidence_identity'], True, face)


    # def _offline_module(self, frame):
    #     return self.offline_client.analyze_frame(frame)

    def setAttr(self,*args, **kwargs):
        """
            set attributes for the module
            Params:
                depends on the module
            Return:
        """
        self.client.setParamsDetect(*args, **kwargs)
        #self.offline.setParamsDetect(*args, **kwargs)

    def watch(self,frame):
        #TODO manage check connection in Event-listener style
        if self._checkConnection(self.HOST):
            self._online_module(frame)

        else:
            print("no connection")
