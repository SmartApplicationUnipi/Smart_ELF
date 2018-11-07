#!/usr/bin/env python3

import speech_recognition as sr
from pocketsphinx import get_model_path
from time import time


# obtain path to "english.wav" in the same folder as this script
from os import path
AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "Trump_We_will_build_a_great_wall.wav")


# use the audio file as the audio source
r = sr.Recognizer()
with sr.AudioFile(AUDIO_FILE) as source:
    audio = r.record(source)  # read the entire audio file

start = time()

# recognize speech using IBM Speech to Text
IBM_USERNAME = "f0d932bf-d278-41aa-b6fe-fa48221d5bea"  
IBM_PASSWORD = "2FpiMenNFn6C"  
try:
    print("IBM Speech to Text thinks you said --->: " + r.recognize_ibm(audio,language = "en-US", username=IBM_USERNAME, password=IBM_PASSWORD))
except sr.UnknownValueError:
    print("IBM Speech to Text could not understand audio")
except sr.RequestError as e:
    print("Could not request results from IBM Speech to Text service; {0}".format(e))
m, s = divmod(time() - start, 60)
h, m = divmod(m, 60)
print("%d:%02d:%02f" % (h, m, s))

print("----------- \n\n\n")

WIT_AI_KEY = "C6ACPLI4NZB76TUHUAQF3U5XIUF6AMQC"  


start = time()
'''
try:
    print("Wit.ai thinks you said --->: " + r.recognize_wit(audio, key=WIT_AI_KEY))
except sr.UnknownValueError:
    print("Wit.ai could not understand audio")
except sr.RequestError as e:
    print("Could not request results from Wit.ai service; {0}".format(e))
m, s = divmod(time() - start, 60)
h, m = divmod(m, 60)
print("%d:%02d:%02f" % (h, m, s))

print("----------- \n\n\n")
'''
start = time()

try:
    print("Sphinx thinks you said--->: " + r.recognize_sphinx(audio,"en-US"))
except sr.UnknownValueError:
    print("Sphinx could not understand audio")
except sr.RequestError as e:
    print("Sphinx error; {0}".format(e))
m, s = divmod(time() - start, 60)
h, m = divmod(m, 60)
print("%d:%02d:%02f" % (h, m, s))
start = time()

# recognize speech using Google Speech Recognition
try:
    print("\n\nGoogle Speech Recognition thinks you said --->: " + r.recognize_google(audio,language = "en-US"))
except sr.UnknownValueError:
    print("Google Speech Recognition could not understand audio")
except sr.RequestError as e:
    print("Could not request results from Google Speech Recognition service; {0}".format(e))



m, s = divmod(time() - start, 60)
h, m = divmod(m, 60)
print("%d:%02d:%02f" % (h, m, s))