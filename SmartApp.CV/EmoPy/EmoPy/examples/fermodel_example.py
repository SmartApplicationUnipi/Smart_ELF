from EmoPy.src.fermodel import FERModel
from pkg_resources import resource_filename
import cv2 as cv

target_emotions = ['surprise', 'anger', 'fear'] #['calm', 'anger', 'happiness']
#target_emotions = ['calm', 'anger', 'happiness', 'disgust', 'surprise', 'sadness', 'fear']
model = FERModel(target_emotions, verbose=True)

print('Predicting on happy image...')
model.predict(resource_filename('EmoPy.examples','image_data/sample_happy_image.png'))

print('Predicting on disgust image...')
model.predict(resource_filename('EmoPy.examples','image_data/sample_disgust_image.png'))

print('Predicting on anger image...')
model.predict(resource_filename('EmoPy.examples','image_data/sample_anger_image2.png'))

### added lines
cam = cv.VideoCapture(0)

while True:
	retval, frame = cam.read()
	if retval == False:
		print ("errore")
		break
	
	model.predict_frame(image=frame)

	cv.imshow('cam', frame)
	cv.waitKey(1) & 0xFF == ord('q')
	if cv.waitKey(1) & 0xFF == ord('q'):
		break


