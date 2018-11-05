#!/usr/bin/env python3

# NOTE: this example requires PyAudio because it uses the Microphone class

import speech_recognition as sr
from time import time


# obtain audio from the microphone
r = sr.Recognizer()
with sr.Microphone() as source:
    r.adjust_for_ambient_noise(source)  # listen for 1 second to calibrate the energy threshold for ambient noise levels
    print("Say something!")
    audio = r.listen(source)

print("---------------\n\n\n")
start = time()

# recognize speech using IBM Speech to Text
IBM_USERNAME = "f0d932bf-d278-41aa-b6fe-fa48221d5bea"  # IBM Speech to Text usernames are strings of the form XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
IBM_PASSWORD = "2FpiMenNFn6C"  # IBM Speech to Text passwords are mixed-case alphanumeric strings
try:
    print("IBM Speech to Text thinks you said " + r.recognize_ibm(audio, username=IBM_USERNAME, password=IBM_PASSWORD))
except sr.UnknownValueError:
    print("IBM Speech to Text could not understand audio")
except sr.RequestError as e:
    print("Could not request results from IBM Speech to Text service; {0}".format(e))
m, s = divmod(time() - start, 60)
h, m = divmod(m, 60)
print("%d:%02d:%02f" % (h, m, s))

print("----------- \n\n\n")

WIT_AI_KEY = "C6ACPLI4NZB76TUHUAQF3U5XIUF6AMQC"  # Wit.ai keys are 32-character uppercase alphanumeric strings


start = time()

try:
    print("Wit.ai thinks you said -->>" + r.recognize_wit(audio, key=WIT_AI_KEY))
except sr.UnknownValueError:
    print("Wit.ai could not understand audio")
except sr.RequestError as e:
    print("Could not request results from Wit.ai service; {0}".format(e))
m, s = divmod(time() - start, 60)
h, m = divmod(m, 60)
print("%d:%02d:%02f" % (h, m, s))

print("----------- \n\n\n")

start = time()

try:
    print("Sphinx thinks you said---> " + r.recognize_sphinx(audio,"en-US"))
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
    # for testing purposes, we're just using the default API key
    # to use another API key, use `r.recognize_google(audio, key="GOOGLE_SPEECH_RECOGNITION_API_KEY")`
    # instead of `r.recognize_google(audio)`
    print("\n\nGoogle Speech Recognition thinks you said " + r.recognize_google(audio))
except sr.UnknownValueError:
    print("Google Speech Recognition could not understand audio")
except sr.RequestError as e:
    print("Could not request results from Google Speech Recognition service; {0}".format(e))



m, s = divmod(time() - start, 60)
h, m = divmod(m, 60)
print("%d:%02d:%02f" % (h, m, s))