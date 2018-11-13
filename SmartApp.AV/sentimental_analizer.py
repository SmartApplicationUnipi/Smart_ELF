import sys
import os

sys.path.insert(0, './pyAudioAnalysis')

from pyAudioAnalysis import *
from pyAudioAnalysis import audioTrainTest as aT
import scipy.io.wavfile

sys.path.insert(0, './OpenVokaturi-3-0a/api/')
import Vokaturi

Vokaturi.load("./OpenVokaturi-3-0a/lib/open/linux/OpenVokaturi-3-0-linux64.so")

input_file = "data_audio/Trump_We_will_build_a_great_wall.wav"
models = ["svm","svm_rbf", "randomforest"]
models_name =["pyAudioAnalysis/pyAudioAnalysis/data/svmSpeechEmotion","pyAudioAnalysis/pyAudioAnalysis/data/svmSpeechEmotion_rbf","pyAudioAnalysis/pyAudioAnalysis/data/svmSpeechEmotion_randomforest"]
model = models[1]
model_name = models_name[1]

def my_regressionFileWrapper(inputFile, model_type, model_name):
    if not os.path.isfile(inputFile):
        raise Exception("Input audio file not found!")

    R, regressionNames = aT.fileRegression(inputFile, model_name, model_type)

    return (R[0],R[1])

a = my_regressionFileWrapper(input_file, model, model_name)
print ("pyAudioAnalysis " + str(a))


def my_vokaturi(file_name):
	(sample_rate, samples) = scipy.io.wavfile.read(file_name)

	buffer_length = len(samples)
	c_buffer = Vokaturi.SampleArrayC(buffer_length)
	if samples.ndim == 1:  # mono
		c_buffer[:] = samples[:] / 32768.0
	else:  # stereo
		c_buffer[:] = 0.5*(samples[:,0]+0.0+samples[:,1]) / 32768.0

	voice = Vokaturi.Voice (sample_rate, buffer_length)

	voice.fill(buffer_length, c_buffer)

	quality = Vokaturi.Quality()
	emotionProbabilities = Vokaturi.EmotionProbabilities()
	voice.extract(quality, emotionProbabilities)


	if quality.valid:
		return (emotionProbabilities.neutrality,emotionProbabilities.happiness,emotionProbabilities.sadness,emotionProbabilities.anger,emotionProbabilities.fear)
		#print ("Neutral: %.3f" % emotionProbabilities.neutrality)
		#print ("Happy: %.3f" % emotionProbabilities.happiness)
		#print ("Sad: %.3f" % emotionProbabilities.sadness)
		#print ("Angry: %.3f" % emotionProbabilities.anger)
		#print ("Fear: %.3f" % emotionProbabilities.fear)
	else:
		#print ("Not enough sonorancy to determine emotions")
		return None

	voice.destroy()

a = my_vokaturi(input_file)
print("OpenVokaturi-3 " + str(a))
