from emopy import FERModel
from FERModelEnsemble import *
import cv2 as cv
import numpy as np
#from offvision import OffVision as offline

# these are all the emotions but there are pretrained models only for subsets
#target_emotions = ['calm', 'anger', 'happiness', 'disgust', 'surprise', 'sadness', 'fear']

target_emotions = ['surprise', 'anger', 'fear'] #['calm', 'anger', 'happiness']
#model = FERModel(target_emotions, verbose=True)
model = FERModelEnsemble()
#model = offline()

cam = cv.VideoCapture(0)

while False:
	retval, frame = cam.read()

	print(model.predict_frame(frame))

	cv.imshow('cam', frame)
	cv.waitKey(1) & 0xFF == ord('q')
	if cv.waitKey(1) & 0xFF == ord('q'):
		break

# try
happy_face = np.array(cv.imread('../../happy_face.jpeg'))
anger_face = np.array(cv.imread('../../angered.jpeg'))
disgust_face = np.array(cv.imread('../../disgust_face.png'))
sad_face = np.array(cv.imread('../../sad_face.jpg'))

res = model.predict_frame(happy_face)
res_happy = {k: round(v, 4) for k, v in res.items()}
print("happy", res_happy)


res = model.predict_frame(anger_face)
res_anger = {k: round(v, 4) for k, v in res.items()}
print("anger", res_anger)

res = model.predict_frame(disgust_face)
res_disg = {k: round(v, 4) for k, v in res.items()}
print("disgust", res_disg)


res = model.predict_frame(sad_face)
res_sad = {k: round(v, 4) for k, v in res.items()}
print("sad",res_sad)


"""
happy {'calm': 0.1412, 'happiness': 0.2251, 'anger': 0.3147, 'disgust': 0.006, 'surprise': 0.1151, 'fear': 0.1559, 'sadness': 0.042}
anger {'calm': 0.1218, 'happiness': 0.1541, 'anger': 0.4128, 'disgust': 0.007, 'surprise': 0.1153, 'fear': 0.1244, 'sadness': 0.0645}
disgust {'calm': 0.1111, 'happiness': 0.1653, 'anger': 0.2775, 'disgust': 0.002, 'surprise': 0.2888, 'fear': 0.1552, 'sadness': 0.0}
sad {'calm': 0.1593, 'happiness': 0.2291, 'anger': 0.3187, 'disgust': 0.0237, 'surprise': 0.0695, 'fear': 0.1224, 'sadness': 0.0773}
"""


"""
happy {'surprise': 0.1192, 'fear': 0.1778, 'sadness': 0.042, 'happiness': 0.1988, 'disgust': 0.006, 'calm': 0.1474, 'anger': 0.3088}
anger {'surprise': 0.1263, 'fear': 0.1395, 'sadness': 0.0645, 'happiness': 0.1541, 'disgust': 0.007, 'calm': 0.1218, 'anger': 0.3868}
disgust {'surprise': 0.3036, 'fear': 0.1702, 'sadness': 0.0, 'happiness': 0.1653, 'disgust': 0.002, 'calm': 0.1111, 'anger': 0.2479}
sad {'surprise': 0.0814, 'fear': 0.1427, 'sadness': 0.0773, 'happiness': 0.1982, 'disgust': 0.0237, 'calm': 0.1632, 'anger': 0.3136}

"""
