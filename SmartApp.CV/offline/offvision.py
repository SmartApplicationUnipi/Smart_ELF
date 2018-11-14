#!/bin/python3
import cv2
import dlib
import numpy as np
import uuid

from emopy import FERModel


# load configuration parameters
from conf import *

# use local camera as input device
cam = cv2.VideoCapture(0)

# load pre-trained models
detector = dlib.get_frontal_face_detector()
shape_pred = dlib.shape_predictor('models/shape_predictor_68_face_landmarks.dat')
face_rec = dlib.face_recognition_model_v1('models/dlib_face_recognition_resnet_model_v1.dat')
emotion_model = FERModel(TARGET_EMOTIONS, verbose=True)

# dictionary containing id->face associations
people = {}

while True:
    # next frame from camera
    _, frame = cam.read()
    # detect faces present
    detected_faces = detector(frame, 1)

    # match each face with an identifier
    detected_people = {}
    for rect in detected_faces:
        # compute the descriptor of this face
        shape = shape_pred(frame, rect)
        face_desc = face_rec.compute_face_descriptor(frame, shape)
        face_desc = np.array(face_desc)

        # find the closest match, within threshold
        max_distance = float('inf')
        match_id = None
        for person_id, person_desc in people.items():
            distance = np.linalg.norm(person_desc - face_desc)
            if distance < max_distance:
                max_distance = distance
                match_id = person_id
        
        if max_distance > MATCH_DIST_THRESHOLD:
            # no match, assign a new identifier
            match_id = str(uuid.uuid4())
        
        # update face descriptor
        people[match_id] = face_desc

        # adjust rectangle
        rrect = {'top': max(rect.top(), 0),
                'bottom': min(rect.bottom(), frame.shape[0]),
                'left': max(rect.left(), 0),
                'right': min(rect.right(), frame.shape[1])}
        
        # predict emotion
        face_frame = frame[rrect['top']:rrect['bottom'], rrect['left']:rrect['right']]
        emotion = emotion_model.predict_frame(face_frame)
        
        # add to detected dictionary
        detected_people[match_id] = {'rect': rrect, 'emo': emotion}
    
    # this should go to the "presence" module
    print(detected_people)

    # visualize matches in this frame, if requested
    if SHOW_FRAME_WINDOW:
        for match_id, desc in detected_people.items():
            rect = desc['rect']
            cv2.rectangle(frame, (rect['left'], rect['top']), (rect['right'], rect['bottom']), (0, 255, 0))
            cv2.putText(frame, match_id, (rect['left'], rect['top']), cv2.FONT_HERSHEY_PLAIN, 1, (0, 0, 255))
        cv2.imshow('cam', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
                break
