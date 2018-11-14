import os

from online.SDK.face_client import Facepp_Client as online
# from offline import offline_interface as offline

import kb_client as kb


class Controller():
    def __init__(self):
        self.kbID = kb.register()
        self.faceset_outer_id = "Fibonacci_FaceSet_0001"
        self.faceset_token = ""

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

        return


    def _thereIsNet(self):
        """
            Check there is an Internet connection.

            Params:
                None

            Return:
                thereIsNet (bool):
                    True if there is False otherwise
        """
        response = os.system("ping -n 1 www.api-eu.faceplusplus.com")
        return response == 0

    def _online_module(self,frame):
        """
            Utilizza delle API (Face++)

            Params:
                None

            Return:

        """
        # take respose from server of face present in the frame
        result = self.client.detect(frame)
        # take list of faces
        faces = result["faces"]

        for face in faces:

            info = "face"
            confidence = 0
            del face["face_rectangle"]
            face.update({"TAG": "VISION"})
            face.update({"known": False})
            face.update({"confidence_identity": 0})

            print(face)

            facesetInfo = self.client.getFaceSetDetail(faceset_token = self.faceset_token )
            confidence = 0

            if facesetInfo['face_count'] > 0:
                res = self.client.search(face_token = face["face_token"], faceset_token = self.faceset_token)

                if len(res["results"]) > 0:
                    for candidate in res["results"]:
                        if candidate["confidence"] < 80:

                            self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
                            print("non ti conosco.. mi ricordero")
                        else:
                            print("ti conosco")

                            face["face_token"] = candidate["face_token"]
                            face.update({"known": True})
                            face.update({"confidence_identity": candidate["confidence"]})
                            confidence = candidate["confidence"]

                            kb.addFact(self.kbID, info, 1, confidence, True, face)

                else:
                    self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
                    print("non ti conosco.. mi ricordero")
                    kb.addFact(self.kbID, info, 1, confidence, True, face)
            else:
                self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
                print("non ti conosco.. mi ricordero")
                kb.addFact(self.kbID, info, 1, confidence, True, face)

            face.update({"TAG": "VISION"})
            kb.addFact(self.kbID, info, 1, confidence, True, face)

    def _offline_module(self,frame):
        pass

    def setAttr(self,*args, **kwargs):
        self.client.setParamsDetect(*args, **kwargs)
        #self.offline.setParamsDetect(*args, **kwargs)

    def simple_demo(self,frame):
        # if self._thereIsNet():
        #     self._online_module(frame)
        # else:
        #     self._offline_module(frame)
        self._online_recognition_module(frame)

        return frame
