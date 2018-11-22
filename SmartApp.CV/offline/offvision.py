#!/bin/python3
import os
import dlib
import numpy as np

try:
    from .emopy import FERModel
except Exception as e:
    from emopy import FERModel

class OffVision:
    def __init__(self, match_dist_threshold=0.6, target_emotions=['calm', 'anger', 'happiness']):
        """
        New offline vision thing
        :param match_dist_threshold: threshold of descriptor distance for a face match (optional)
        :param target_emotions: subset of emotions for the emopy model (optional)
        """
        # configuration parameters
        self.match_dist_threshold = match_dist_threshold
        self.requested_attributes = ['emotion']
        # load pre-trained models
        models_path = os.path.abspath(os.path.dirname(__file__))
        self.detector = dlib.get_frontal_face_detector()
        self.shape_pred = dlib.shape_predictor(os.path.join(models_path, 'models/shape_predictor_68_face_landmarks.dat'))
        self.face_rec = dlib.face_recognition_model_v1(os.path.join(models_path, 'models/dlib_face_recognition_resnet_model_v1.dat'))
        self.emotion_model = FERModel(target_emotions, verbose=True)

    def is_available(self):
        """
        Check module availability
        :return: always true, since it's offline
        """
        return True

    def set_detect_attibutes(self, *args, **kwargs):
        """
        Sets the attributes to be analyzed on the face (list of admissible ones follows)
        :param emotion: list of target emotions (as required by emopy)
        :return: list of accepted attributes
        """
        self.requested_attributes = []
        if 'emotion' in kwargs:
            try:
                self.emotion_model = FERModel(kwargs['emotion'], verbose=True)
            except:
                # invalid set of target emotions, attribute ignored
                pass
            else:
                self.requested_attributes.append('emotion')
        return self.requested_attributes

    def get_descriptor(self, frame):
        """
        Computes the face descriptor
        :param frame: numpy frame of the face
        :return: a numpy vector as descriptor
        """
        rect = dlib.rectangle(top=0, left=0, bottom=frame.shape[1]-1, right=frame.shape[0]-1)
        shape = self.shape_pred(frame, rect)
        face_desc = self.face_rec.compute_face_descriptor(frame, shape)
        face_desc = np.array(face_desc)
        return face_desc

    def analyze_face(self, frame, return_desc=True):
        """
        Analyzes and describes a single face image
        :param frame: numpy frame of the face
        :param return_desc: true if the descriptor is also requested (optional)
        :return: the requested attributes' values (as in KB fact specification), and the descriptor (if requested)
        """
        face_facts = {}
        if 'emotion' in self.requested_attributes:
            # predict emotion
            face_facts['emotion'] = self.emotion_model.predict_frame(frame)
        if return_desc:
            # compute face descriptor, if requested
            face_desc = self.get_descriptor(frame)
            return (face_facts, face_desc)
        else:
            return face_facts

    def get_match(self, db, descriptor, desc_position, id_position):
        """
        Finds the matching id of the descriptor in the db, if there is one
        :param db: list of tuples, which contain descriptors and ids
        :param descriptor: the descriptor to match
        :param desc_position: position of the descriptor field in db tuples
        :param id_position: position of the id field in db tuples
        :return: an id if matching succeeded, else None
        """
        min_distance = float('inf')
        match_id = None
        # find closest descriptor
        for entry in db:
            distance = np.linalg.norm(entry[desc_position] - descriptor)
            if distance < min_distance:
                min_distance = distance
                match_id = entry[id_position]
        # no match above threshold
        if min_distance > self.match_dist_threshold:
            match_id = None
        return match_id
