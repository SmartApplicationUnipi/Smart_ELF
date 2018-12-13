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
        # predict emotion
        face_facts['emotion'] = self.emotion_model.predict_frame(frame)
        face_facts['emotion'] = {k: round(float(v), 4) for k, v in face_facts['emotion'].items()}
        face_facts['gender'] = 'unknown'
        face_facts['age'] = -1 # unknown
        face_facts['smile'] = 'unknown'

        descriptor = self.get_descriptor(frame)

        return face_facts, (descriptor, None)
