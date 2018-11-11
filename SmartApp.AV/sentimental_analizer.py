import sys

sys.path.insert(0, './pyAudioAnalysis/pyAudioAnalysis')
sys.path.insert(0, './OpenVokaturi-3-0a/examples/')
sys.path.insert(0, './OpenVokaturi-3-0a')

from audioAnalysis import *
#from my_OpenVokaWavMean_linux64.py import *


# comando python da teminale da questa cartella, prossimamente faccio un python che chiama il teminale 

# python audioAnalysis.py regressionFile -i angry1.wav --model svm --regression  pyAudioAnalysis/pyAudioAnalysis/data/svmSpeechEmotion


#prima bisogna installare la libreria

input_file = "data_audio/Trump_We_will_build_a_great_wall.wav"
model = "svm"
model_name ="pyAudioAnalysis/pyAudioAnalysis/data/svmSpeechEmotion"

a = my_regressionFileWrapper(input_file, model, model_name)

#a = my_vokaturi(input_file)

print (a)