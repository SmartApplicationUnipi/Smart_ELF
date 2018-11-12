import os

from online.SDK.face_client import Facepp_Client as online
# from offline import offline_interface as offline

import kb_client as kb


class Controller():
    __init__():
        self.kbID = kb.register()
        self.facesetID = "xx"

        # Initialization of Online Module
        self.client = online()
        # Initialization of Offline Module

        return


    def _thereIsNet():
        """
            Check there is an Internet connection.

            Params:
                None

            Return:
                thereIsNet (bool):
                    True if there is False otherwise
        """
        response = os.system("ping -n 1 www.api-us.faceplusplus.com")
        return response == 0

    def _online_module(frame):
        """
            Utilizza delle API (Face++)

            Params:
                None

            Return:

        """
        client = self.client
        # take respose from server of face present in the frame
        result = client.detect(frame)
        # take list of faces
        faces = result["faces"]
        kb.addFact(self.kbID, "There are N people", 1, 95, True, len(faces))
        kb.addFact(self.kbID, "List faces in frame", 1, 95, True, faces)

        for face in faces:
            indentity = client.search(fece["face_token"], faceset_token = self.facesetID)
            for id in indentity["results"]:
                kb.removeFact(faces)
                face["face_token"] = id["face_token"]
                face.update({"identity_checked": True})
                face.update({"confidence_identity": id["confidence"]})
                kb.addFact(self.kbID, "List faces in frame", 1, id["confidence"], True, faces)


    def _offline_module(frame):
        pass

    def setAttr(*args, **kwargs):
        online.setAttr(*args, **kwargs)
        offline.setAttr(*args, **kwargs)

    def simple_demo(frame):
        if _thereIsNet():
            _online_module(frame)
        else:
            _offline_module(frame)

        return frame
