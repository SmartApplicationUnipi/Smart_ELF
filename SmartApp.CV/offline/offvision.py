#!/bin/python3
import os
import dlib
import numpy as np
from offline.FERModelEnsemble import FERModelEnsemble

from numpy.linalg import norm

try:
     from .emopy import FERModel
except:
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
        # default requested attributes
        self.requested_attributes = ['emotion', 'gender', 'age', 'smile']
        # load pre-trained models
        models_path = os.path.abspath(os.path.dirname(__file__))
        self.detector = dlib.get_frontal_face_detector()
        self.shape_pred = dlib.shape_predictor(os.path.join(models_path, 'models/shape_predictor_68_face_landmarks.dat'))
        self.face_rec = dlib.face_recognition_model_v1(os.path.join(models_path, 'models/dlib_face_recognition_resnet_model_v1.dat'))
        self.emotion_model = FERModelEnsemble()

    def is_available(self):
        """
        Check module availability
        :return: always true, since it's offline
        """
        return True

    # TODO: delete
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

    def analyze_face(self, frame):
        """
        Analyzes and describes a single face image
        :param frame: numpy frame of the face
        :param return_desc: true if the descriptor is also requested (optional)
        :return: the requested attributes' values (as in KB fact specification), and the descriptor (if requested)
        """
        face_facts = {}
        if 'emotion' in self.requested_attributes: # TODO: delete if statements
            # predict emotion
            face_facts['emotion'] = self.emotion_model.predict_frame(frame)
            face_facts['emotion'] = {k: round(v, 4) for k, v in face_facts['emotion'].items()}
        if 'gender' in self.requested_attributes:
            face_facts['gender'] = 'Unknown'
        if 'age' in self.requested_attributes:
            face_facts['age'] = -1 # unknown
        if 'smile' in self.requested_attributes:
            face_facts['smile'] = 'Unknown'

        descriptor = self.get_descriptor(frame)

        return face_facts, (descriptor, None)

    def get_match(self, db, descriptor, desc_position, id_position, return_index=False, return_confidence=False):
        """
        Finds the matching id of the descriptor in the db, if there is one
        :param db: list of tuples, which contain descriptors and ids
        :param descriptor: the descriptor to match
        :param desc_position: position of the descriptor field in db tuples
        :param id_position: position of the id field in db tuples
        :param return_index: if true returns also the position in db (None if not found)
        :param return_confidence: if true returns also the confidence of the match (None if not found)
        :return: an id if matching succeeded, else None; also index or confidence, if requested
        """
        min_distance = float('inf')
        match_id = None
        match_index = None
        confidence = None
        # find closest descriptor
        for i, entry in enumerate(db):
            distance = norm(descriptor - entry[desc_position])
            if distance < min_distance:
                min_distance = distance
                match_id = entry[id_position]
                match_index = i
        # no match above threshold
        if min_distance > self.match_dist_threshold:
            match_id = None
            match_index = None
        else:
            # confidence is normalized distance
            confidence = 1 - min_distance / self.match_dist_threshold
        # return desired stuff
        if not return_confidence and not return_index:
            return match_id
        else:
            return (match_id,) + ((match_index,) if return_index else ()) + ((confidence,) if return_confidence else ())
