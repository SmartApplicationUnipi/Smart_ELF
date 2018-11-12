from emopy import FERModel
from FERModelEnsemble import *
import cv2 as cv
#from offline_interface import *

# these are all the emotions but there are pretrained models only for subsets
#target_emotions = ['calm', 'anger', 'happiness', 'disgust', 'surprise', 'sadness', 'fear']

target_emotions = ['surprise', 'anger', 'fear'] #['calm', 'anger', 'happiness']
#model = FERModel(target_emotions, verbose=True)
model = FERModelEnsemble()

cam = cv.VideoCapture(0)

while True:
	retval, frame = cam.read()
	
	print(model.predict_frame(image=frame))
	print()

	cv.imshow('cam', frame)
	cv.waitKey(1) & 0xFF == ord('q')
	if cv.waitKey(1) & 0xFF == ord('q'):
		break
