# OpenVokaWavMean-linux64.py
# public-domain sample code by Vokaturi, 2018-02-20
#
# A sample script that uses the VokaturiPlus library to extract the emotions from
# a wav file on disk. The file has to contain a mono recording.
#
# Call syntax:
#   python3 OpenVokaWavMean-linux64.py path_to_sound_file.wav
#
# For the sound file hello.wav that comes with OpenVokaturi, the result should be:
#	Neutral: 0.760
#	Happy: 0.000
#	Sad: 0.238
#	Angry: 0.001
#	Fear: 0.000

import sys
import scipy.io.wavfile

sys.path.append("../api")
import Vokaturi

Vokaturi.load("../lib/open/linux/OpenVokaturi-3-0-linux64.so")

def my_vokaturi(file_nameeeeeeeeeeeeeeee):
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

