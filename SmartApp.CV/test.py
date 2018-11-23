import cv2
from offline.offvision import OffVision as offline

ov = offline()
cam = cv2.VideoCapture(0)
while True:
    _, frame = cam.read()
    fact, desc = ov.analyze_face(frame)
    print(fact)
    input()

