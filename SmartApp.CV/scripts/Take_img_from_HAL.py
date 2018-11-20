from external.hal_client import *
from online.SDK.face_client import Facepp_Client as online
import time
import numpy as np
import cv2

import io

def handleVideoMessages(videoMessage):
    print("Received video:\n\tTimestamp:%d\n\tFaces:" % videoMessage.timestamp)
    client = online()
    for face in videoMessage.numpyFaces:
        print("\t\tid: %d, %d bytes\n" % (face.id, len(face.data)))
        #cv2.imshow('Video', face.data)

HALAddress = "10.101.53.14"
_hal = HALInterface(HALAddress=HALAddress)

import cv2
import numpy as np

videoID = _hal.registerAsVideoReceiver(handleVideoMessages)
if videoID == -1:
    print("Ops!, something wrong happens during the interaction with the HALModule. (Video)")
    exit(-1)

time.sleep(30)
_hal.unregister(videoID)
_hal.quit()
