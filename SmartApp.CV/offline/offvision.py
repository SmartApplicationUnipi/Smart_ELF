#!/bin/python3
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
        self.detector = dlib.get_frontal_face_detector()
        self.shape_pred = dlib.shape_predictor('models/shape_predictor_68_face_landmarks.dat')
        self.face_rec = dlib.face_recognition_model_v1('models/dlib_face_recognition_resnet_model_v1.dat')
        self.emotion_model = FERModel(self.target_emotions, verbose=True)
        # dictionary containing id->face associations
        self.people = {}
    
    def analyze(self, frame):
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
            emotion = self.emotion_model.predict_frame(frame[rrect['top']:rrect['bottom'], rrect['left']:rrect['right']])
            # add to detected dictionary
            detected_people[match_id] = {'rect': rrect, 'emo': emotion}
        return detected_people

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

    def compute_face_descriptor(self, frame, rect):
        """
        Computes the face descriptor
        :param frame: frame captured by the camera
        :param rect: position of the detected face
        :return:
        """
        # TODO: needs to be modified because we directly receive the faces, not the entire frame
        shape = self.shape_pred(frame, rect)
        face_desc = self.face_rec.compute_face_descriptor(frame, shape)
        face_desc = np.array(face_desc)
        return face_desc

    def bootstrap(self, frame, detected_people):
        """
        Bootstraps the face matching from a frame detection
        :param frame: an opencv frame
        :param detected_people: the detection information of the frame as structured dictionary (see specs)
        """
        for match_id, desc in detected_people.items():
            rect = desc['rect']
            rect = dlib.rectangle(top=rect['top'], left=rect['left'], bottom=rect['bottom'], right=rect['right'])
            # compute the descriptor of this face
            shape = self.shape_pred(frame, rect)
            face_desc = self.face_rec.compute_face_descriptor(frame, shape)
            face_desc = np.array(face_desc)
            # set person face descriptor
            self.people[match_id] = face_desc
    
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
        detected_people = off_vision.analyze(frame)
        # visualize matches in this frame
        for match_id, desc in detected_people.items():
            rect = desc['rect']
            cv2.rectangle(frame, (rect['left'], rect['top']), (rect['right'], rect['bottom']), (0, 255, 0))
            cv2.putText(frame, match_id, (rect['left'], rect['top']), cv2.FONT_HERSHEY_PLAIN, 1, (0, 0, 255))
        cv2.imshow('cam', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
                break
