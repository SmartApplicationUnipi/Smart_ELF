#!/usr/bin/env python3

import speech_recognition as sr
from time import time
from os import path
import datetime
import sys
import time
import json

from sentimental_analizer import *

sys.path.insert(0, '../SmartApp.KB/')

from kb import *
      


from_wave = True




myID = register()


AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "demo/Trump_We_will_build_a_great_wall.wav")

r = sr.Recognizer()


if(from_wave):
	with sr.AudioFile(AUDIO_FILE) as source:
	    audio = r.record(source)  # read the entire audio file
else:
	with sr.Microphone() as source:
	    r.adjust_for_ambient_noise(source)  # listen for 1 second to calibrate the energy threshold for ambient noise levels
	    print("Say something!")
	    audio = r.listen(source)



	
text_transcribed = r.recognize_google(audio,language = "en-US")
try:
    print("\n\nGoogle Speech Recognition thinks you said --->: " + text_transcribed +"\n")
except sr.UnknownValueError:
    print("Google Speech Recognition could not understand audio")
except sr.RequestError as e:
    print("Could not request results from Google Speech Recognition service; {0}".format(e))


# salvare nella kb il testo  prodotto da un audio
#text_f_audio nome della tupla
# 2 rimane per due giorni
#50 reliability
# false: the data culd not be modified in future

ts = time.time()

detect_language= "en-US"

#print(addFact(myID, "text_f_audio", 2, 50, 'false', {"TAG":"AV_IN_TRANSC_EMOTION","text": ts, "emotion": text_transcribed}))

emotion = my_regressionFileWrapper(input_file, model, model_name)

print(addFact(myID, "text_f_audio", 2, 50, 'false', 
				{"TAG":"AV_IN_TRANSC_EMOTION","id": ts, "timestamp": ts, 
						"text":text_transcribed,"language":detect_language,"valence":emotion[0],"arousal":emotion[1]}))


