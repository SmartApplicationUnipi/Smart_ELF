from keras.models import load_model
import os
import numpy as np

try:
    from .emopy import FERModel
except:
    from emopy import FERModel

class FERModelEnsemble:
    def __init__(self):
        self.emotions = ['anger', 'disgust', 'fear', 'happiness', 'sadness', 'surprise', 'calm']
        self.models = [] # list of pretrained FER models
        self.supported_emotion_subsets = [
            set(['anger', 'fear', 'surprise', 'calm']),
            set(['happiness', 'disgust', 'surprise']),
            set(['anger', 'fear', 'surprise']),
            set(['anger', 'fear', 'calm']),
            set(['anger', 'happiness', 'calm']),
            set(['anger', 'fear', 'disgust']),
            set(['calm', 'disgust', 'surprise']),
            set(['sadness', 'disgust', 'surprise']),
            set(['anger', 'happiness'])]
        self.ensemble_model = load_model((os.path.join(os.path.dirname(__file__), 'models/ensemble_emotion.h5')))
        self.ensemble_model._make_predict_function()

        for subset in self.supported_emotion_subsets:
            self.models.append(FERModel(subset, verbose=False))

    def predict_frame(self, image):
        # list of dictionaries, each containing the predictions of one FER model
        raw_results = np.array([self.predict_raw_results(image)])
        raw_predictions = self.ensemble_model.predict(raw_results)[0]
        predictions = {k: v for k, v in zip(self.emotions, raw_predictions)}

        return predictions

    def predict_raw_results(self, image):
        # list of dictionaries, each containing the predictions of one FER model
        results = []
        for model in self.models:
            results += model.predict_frame(image).values()
        return results
