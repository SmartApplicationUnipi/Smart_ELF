import cv2
import sys
from online import FacePlusPlus as online
from controller import Controller
# from offline import offline_interface as offline

import kb_client as kb

def demo(myAPI, *args, **kwargs):
    myAPI.setAttr(*args, **kwargs)
    video_capture = cv2.VideoCapture(0)
    print("Press q to quit: ")
    while True:
        # Capture frame-by-frame
        ret, frame = video_capture.read() #np.array

        frame = cv2.resize(frame, (320, 240))

        key = cv2.waitKey(100) & 0xFF
        if  key == ord('q'):
            break
        elif key == ord('r'):
            pass
        frame = myAPI.simple_demo(frame)

        # Display the resulting frame
        cv2.imshow('Video', frame)

    # When everything is done, release the capture
    video_capture.release()
    cv2.destroyAllWindows()


#demo(online.FacePlusPlus(), return_landmark = 1)
#demo(offline.FaceOffDetect())
demo(Controller())
