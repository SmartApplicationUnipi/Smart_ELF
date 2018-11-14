import os

from online.SDK.face_client import Facepp_Client as online
from offline.offvision import OffVision as offline

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
        self.offline_client = offline()
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
        kb.addFact(self.kbID, "There are N people", 1, 95, True, len(faces))
        kb.addFact(self.kbID, "List faces in frame", 1, 95, True, faces)

        for face in faces:

            facesetInfo = self.client.getFaceSetDetail(faceset_token = self.faceset_token )

            if facesetInfo['face_count']  > 0:
                indentity = self.client.search(face_token = face["face_token"], faceset_token = self.faceset_token)
                if indentity["results"]:
                    for id in indentity["results"]:
                        kb.removeFact(faces)
                        face["face_token"] = id["face_token"]
                        face.update({"identity_checked": True})
                        face.update({"confidence_identity": id["confidence"]})
                        kb.addFact(self.kbID, "List faces in frame", 1, id["confidence"], True, faces)

                        print("ti conosco")
                else:
                    self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
                    print("non ti conosco.. ti aggiungo")
            else:
                self.client.addFace(faceset_token = self.faceset_token, face_tokens = face["face_token"])
                print("non ti conosco.. ti aggiungo")

    def _offline_module(self, frame):
        return self.offline_client.analyze_frame(frame)


    def setAttr(self,*args, **kwargs):
        self.client.setParamsDetect(*args, **kwargs)
        #self.offline.setParamsDetect(*args, **kwargs)

    def simple_demo(self,frame):
        if self._thereIsNet():
            self._online_module(frame)
        else:
            self._offline_module(frame)

        return frame
