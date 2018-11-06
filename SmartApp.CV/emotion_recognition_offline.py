from EmoPy.src.fermodel import FERModel
from pkg_resources import resource_filename
import cv2 as cv

# these are all the emotions but there are pretrained models only for subsets
#target_emotions = ['calm', 'anger', 'happiness', 'disgust', 'surprise', 'sadness', 'fear']

target_emotions = ['surprise', 'anger', 'fear'] #['calm', 'anger', 'happiness']
model = FERModel(target_emotions, verbose=True)

cam = cv.VideoCapture(0)

while True:
	retval, frame = cam.read()
	
	model.predict_frame(image=frame)

	cv.imshow('cam', frame)
	cv.waitKey(1) & 0xFF == ord('q')
	if cv.waitKey(1) & 0xFF == ord('q'):
		break
