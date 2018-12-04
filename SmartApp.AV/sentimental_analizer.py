import sys
import os
sys.path.insert(0, './pyAudioAnalysis')
from pyAudioAnalysis import audioTrainTest as aT
from pyAudioAnalysis import audioFeatureExtraction as aF
import glob
import numpy as np
import pickle


def emotion_from_speech(Fs, x, model_name="pyAudioAnalysis/pyAudioAnalysis/data/svmSpeechEmotion", model_type="svm"):
    """

    :param Fs: frame rate
    :param x: data
    :param model_name:
    :param model_type:
    :return:
    """
    regression_models = glob.glob(model_name + "_*")
    regression_models2 = []
    for r in regression_models:
        if r[-5::] != "MEANS":
            regression_models2.append(r)
    regression_models = regression_models2
    regression_names = []
    for r in regression_models:
        regression_names.append(r[r.rfind("_")+1::])

    # Feature extraction
    x = np.fromstring(x, np.int16)
    if model_type == 'svm' or model_type == "svm_rbf" or model_type == 'randomforest':
        [_, _, _, mt_win, mt_step, st_win, st_step, compute_beat] = aT.load_model(regression_models[0], True)
    else:
        return None

    [mt_features, s, _] = aF.mtFeatureExtraction(x, Fs, mt_win * Fs, mt_step * Fs, round(Fs * st_win), round(Fs * st_step))
    mt_features = mt_features.mean(axis=1)        # long term averaging of mid-term statistics
    if compute_beat:
        [beat, beatConf] = aF.beatExtraction(s, st_step)
        mt_features = np.append(mt_features, beat)
        mt_features = np.append(mt_features, beatConf)

    # Regression
    R = []
    for ir, r in enumerate(regression_models):
        if not os.path.isfile(r):
            print("fileClassification: input model_name not found!")
            return None
        if model_type == 'svm' or model_type == "svm_rbf" or model_type == 'randomforest':
            [model, MEAN, STD, mt_win, mt_step, st_win, st_step, compute_beat] = aT.load_model(r, True)
        curFV = (mt_features - MEAN) / STD                  # normalization
        R.append(aT.regressionWrapper(model, model_type, curFV))
    return R, regression_names

'''
type_model = "svm"
model_name = "pyAudioAnalysis/pyAudioAnalysis/data/svmSpeechEmotion"
d = pickle.load(open("d.p", "rb"))
print(emotion_from_speech(d["sr"], d["data"], model_name, type_model))
'''
