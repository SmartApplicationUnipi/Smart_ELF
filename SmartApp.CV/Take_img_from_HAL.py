
import hal_client as hal
from online.SDK.face_client import Facepp_Client as online
import time
import numpy as np
import cv2

from PIL import Image
import io

def handleVideoMessages(videoMessage):
    print("Received video:\n\tTimestamp:%d\n\tFaces:" % videoMessage.timestamp)
    client = online()
    for face in videoMessage.faces:
        print("\t\tid: %d, %d bytes\n" % (face.id, len(face.data)))

        # print(face.data[:100])
        # img = cv2.imdecode(np.frombuffer(face.data, np.uint8), -1)
        # img = np.array(Image.open(io.BytesIO(face.data)))
        gen = np.array(np.frombuffer(face.data, np.uint8) ,dtype=np.uint8)
        gen = np.reshape(gen, (face.rect.height, face.rect.width, 3))

        cv2.imshow('i',gen)
        cv2.waitKey(0)
        cv2.destroyWindow('i')
        # result = client.detect(img)
        # imag = np.frombuffer(face.data, np.uint8)
        #
        # img = np.reshape(imag, (face.rect.height, face.rect.width, 3))
        # print(img.shape)
        # cv2.imwrite('color_img.jpg', img)
        # # print(img[:100])
        # # img = cv2.imencode('.jpg', img)[1]
        #
        # cv2.imshow('Video', img)
        # print(result)


HALAddress = "10.101.31.10"
_hal = hal.HALInterface(HALAddress=HALAddress)

import cv2
import numpy as np

videoID = _hal.registerAsVideoReceiver(handleVideoMessages)
if videoID == -1:
    print("Ops!, something wrong happens during the interaction with the HALModule. (Video)")
    exit(-1)

time.sleep(5)
_hal.unregister(videoID)
_hal.quit()
