#!/usr/bin/env python3

import speech_recognition as sr
from pocketsphinx import get_model_path
from time import time
from os import path
import datetime


import json
from kb import *




      
myID = register()


AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "Trump_We_will_build_a_great_wall.wav")

r = sr.Recognizer()
with sr.AudioFile(AUDIO_FILE) as source:
    audio = r.record(source)  # read the entire audio file
# recognize speech using Google Speech Recognition


text_transcribed = r.recognize_google(audio,language = "en-US")
try:
    print("\n\nGoogle Speech Recognition thinks you said --->: " +text_transcribed )
except sr.UnknownValueError:
    print("Google Speech Recognition could not understand audio")
except sr.RequestError as e:
    print("Could not request results from Google Speech Recognition service; {0}".format(e))


# salvare nella kb il testo  prodotto da un audio

#text_f_audio nome della tupla

# 2 rimane per due giorni
#50 reliability
# false: the data culd not be modified in future

ts = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S') # temponary timestamp

print(addFact(myID, "text_f_audio", 2, 50, 'false', {"time_stamp": ts, "text": text_transcribed}))
