#!/bin/python3
import os
import cv2
import dlib
import numpy as np
import uuid

from emopy import FERModel

class OffVision:
    def __init__(self, match_dist_threshold=0.6, target_emotions=['calm', 'anger', 'happiness']):
        """
        New offline vision thing
        :param match_dist_threshold: threshold of descriptor distance for a face match
        :param target_emotions: subset of emotions for the emopy model
        """
        # configuration parameters
        self.match_dist_threshold = match_dist_threshold
        self.target_emotions = target_emotions
        # load pre-trained models
        models_path = os.path.abspath(os.path.dirname(__file__))
        self.detector = dlib.get_frontal_face_detector()
        self.shape_pred = dlib.shape_predictor(os.path.join(models_path, 'models/shape_predictor_68_face_landmarks.dat'))
        self.face_rec = dlib.face_recognition_model_v1(os.path.join(models_path, 'models/dlib_face_recognition_resnet_model_v1.dat'))
        self.emotion_model = FERModel(self.target_emotions, verbose=True)
        # dictionary containing id->face associations
        self.people = {}

    def analyze_frame(self, frame):
        """
        Analyzes and performs detection+matching on a single frame
        :param frame: an opencv frame
        :return: the detection information as structured dictionary (see specs)
        """
        # detect faces present
        detected_faces = self.detector(frame, 1)
        # match each face with an identifier
        detected_people = {}
        for rect in detected_faces:
            face_desc = self.compute_face_descriptor(frame, rect)
            # find the closest match, within threshold
            assigned_id = self.face_matching(face_desc)
            # update face descriptor
            self.people[assigned_id] = face_desc
            # adjust rectangle
            rrect = {'top': max(rect.top(), 0),
                    'bottom': min(rect.bottom(), frame.shape[0]),
                    'left': max(rect.left(), 0),
                    'right': min(rect.right(), frame.shape[1])}
            # predict emotion
            face = frame[rrect['top']:rrect['bottom'], rrect['left']:rrect['right']]
            emotion = self.emotion_model.predict_frame(face)
            # add to detected dictionary
            detected_people[assigned_id] = {'rect': rrect, 'emo': emotion}
        return detected_people

    def analyze_face(self, face_frame):
        """
        Analyzes and performs matching on a single face image
        :param face_frame: an opencv image of the face
        :return: the matching and analysis information as structured dictionary (see specs)
        """
        face_desc = self.compute_face_descriptor(face_frame)
        # find the closest match, within threshold
        assigned_id = self.face_matching(face_desc)
        # predict emotion
        emotion = self.emotion_model.predict_frame(face_frame)
        return {assigned_id: {'emo': emotion}}

    def face_matching(self, face_desc):
        """
        Checks whether the face descriptor was already present (i.e. the face has been already seen before).
        The face descriptor 'face_desc' gets a new ID if it is not similar to an existing descriptor,
        it gets the most similar descriptor's ID otherwise.
        :param face_desc: face descriptor
        :return: previous ID if matching succeeded, new ID otherwise.
        """
        min_distance = float('inf')
        match_id = None
        for person_id, person_desc in self.people.items():
            distance = np.linalg.norm(person_desc - face_desc)
            if distance < min_distance:
                min_distance = distance
                match_id = person_id
        if min_distance > self.match_dist_threshold:
            # no match, assign a new identifier
            match_id = str(uuid.uuid4())
        return match_id

    def compute_face_descriptor(self, frame, rect=None):
        """
        Computes the face descriptor
        :param frame: frame captured by the camera
        :param rect: position of the detected face, the whole frame if not specified
        :return:
        """
        if rect is None:
            rect = dlib.rectangle(top=0, left=0, bottom=frame.shape[1]-1, right=frame.shape[0]-1)
        shape = self.shape_pred(frame, rect)
        face_desc = self.face_rec.compute_face_descriptor(frame, shape)
        face_desc = np.array(face_desc)
        return face_desc

    def bootstrap_from_frame(self, frame, detected_people):
        """
        Bootstraps the face matching from a frame detection
        :param frame: an opencv frame
        :param detected_people: the detection information of the frame as structured dictionary (see specs)
        """
        self.people = {}
        for match_id, desc in detected_people.items():
            # rectangle of face in image
            rect = desc['rect']
            rect = dlib.rectangle(top=rect['top'], left=rect['left'], bottom=rect['bottom'], right=rect['right'])
            # set person face descriptor
            self.people[match_id] = self.compute_face_descriptor(frame, rect)

    def bootstrap_from_faceset(self, faceset):
        """
        Bootstraps the face matching forma a face set
        :param faceset: a dictionary of person_id->face_frame
        """
        self.people = {}
        for person_id, face_frame in faceset.items():
            self.people[person_id] = self.compute_face_descriptor(face_frame)

    def remove_person(self, person_id):
        """
        Removes a person from known faces
        :param person_id: the person identifier
        """
        self.people.pop(person_id, None)


if __name__ == "__main__":
    # use local camera as input device
    cam = cv2.VideoCapture(0)
    # offline video analysis with defaul parameters
    off_vision = OffVision()
    while True:
        # next frame from camera
        _, frame = cam.read()
        # analyze it
        detected_people = off_vision.analyze_frame(frame)
        # visualize matches in this frame
        for match_id, desc in detected_people.items():
            rect = desc['rect']
            cv2.rectangle(frame, (rect['left'], rect['top']), (rect['right'], rect['bottom']), (0, 255, 0))
            cv2.putText(frame, match_id, (rect['left'], rect['top']), cv2.FONT_HERSHEY_PLAIN, 1, (0, 0, 255))
        cv2.imshow('cam', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
                break
