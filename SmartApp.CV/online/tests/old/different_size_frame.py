import cv2
from PIL import Image
import numpy as np
import time


api = FacePlusPlus()
api.setAttr()
img = np.asarray(Image.open("imgTest.jpg"))
w, h, _ = img.shape
frames = [cv2.resize(img, (w//i, h//i)) for i in range(1,5)]
for frame in frames:
    start = time.clock()
    api.simple_demo(frame)
    print("size: " + str(frame.shape) +" time: " + str(time.clock() - start))
print("OK")
