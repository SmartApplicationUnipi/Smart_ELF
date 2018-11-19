import cv2
import sys
from online import FacePlusPlus as online
from controller import Controller
from queue import *
from threading import *
# from offline import offline_interface as offline
import external.kb_client as kb

q = Queue(maxsize= 3)

def worker(myAPI):
     while True:
        myAPI.watch(q.get())
        q.task_done()

def demo(myAPI, *args, **kwargs):
    key = 0
    myAPI.setAttr(*args, **kwargs)
    video_capture = cv2.VideoCapture(0)
    print("Press q to quit: ")

    t = Thread(target=worker, args=[myAPI])
    t.daemon = True
    t.start()

    while key != ord('q'):
        # Capture frame-by-frame
        ret, frame = video_capture.read() #np.arra
        frame = cv2.resize(frame, (320, 240))
        q.put(frame)

        if q.full():
            q.get()

        key = cv2.waitKey(100) & 0xFF
        cv2.imshow('Video', frame)

    # When everything is done, release the capture
    q.join()
    video_capture.release()
    cv2.destroyAllWindows()

#demo(online.FacePlusPlus(), return_landmark = 1)
#demo(offline.FaceOffDetect())
demo(Controller())
