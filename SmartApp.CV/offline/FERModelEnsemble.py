from keras.models import load_model
import os
import numpy as np

try:
    from .emopy import FERModel
except:
    from emopy import FERModel

class FERModelEnsemble:
    """
    Ensemble model for emotion prediction.

    The predictions of each sub-set models are fed as input into a pre-trained ensamble model,
    which is just a linear combination of the sub-predictions.
    The ensemble model is defined in `scripts/fer_ensemble_train.py` and has been trained on the FER2013 dataset.
    """
    
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

        # load the ensemble model
        self.ensemble_model = load_model((os.path.join(os.path.dirname(__file__), 'models/ensemble_emotion.h5')))
        self.ensemble_model._make_predict_function()

        # load each sub-set model
        for subset in self.supported_emotion_subsets:
            self.models.append(FERModel(subset, verbose=False))

    def predict_frame(self, image):
        """
        Computes a probability distribution on the set of all emotions.

        Arguments:
            - image: an opencv image of the face to be analyzed
        
        Returns:
            a dictionary of emotion->probability
        """
        # get the predictions from the ensemble model
        raw_results = np.array([self.predict_raw_results(image)])
        raw_predictions = self.ensemble_model.predict(raw_results)[0]
        # arrange them nicely in a dictionary
        predictions = {k: v for k, v in zip(self.emotions, raw_predictions)}
        return predictions

    def predict_raw_results(self, image):
        """
        Computes the predictions of each sub-set model, and then joins them in a list,
        to be passed as input in the ensemble model.

        Arguments:
            - image: an opencv image of the face to be analyzed
        
        Returns:
            the raw predictions vector
        """
        # concatenate the prediction of each sub-model in a list
        results = []
        for model in self.models:
            results += model.predict_frame(image).values()
        return results
