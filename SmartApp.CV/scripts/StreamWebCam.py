import cv2
import sys
from queue import *
from threading import *
try:
    import online
except ImportError:
    sys.path.insert(0, '../../SmartApp.CV')

from online import FacePlusPlus as online
from controller import Controller
import external_modules.kb_client as kb

#FIFO queue
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

    try:
        t = Thread(target=worker, args=[myAPI])
        t.daemon = True
        t.start()

        while key != ord('q'):
            # Capture frame-by-frame
            ret, frame = video_capture.read() #np.arra
            frame = cv2.resize(frame, (320, 240))

            #discard the older frame
            if q.full():
                q.get()

            q.put(frame)

            key = cv2.waitKey(100) & 0xFF
            cv2.imshow('Video', frame)

        while q.get() is not None:
            q.task_done()

    except NotImplementedError as err:
        print(err)

    # When everything is done, release the capture
    video_capture.release()
    cv2.destroyAllWindows()
    q.join()

#demo(online.FacePlusPlus(), return_landmark = 1)
#demo(offline.FaceOffDetect())
demo(Controller( host = "webcam" ))
