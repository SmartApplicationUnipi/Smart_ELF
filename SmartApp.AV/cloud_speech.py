#!/usr/bin/env python3
import io
import speech_recognition as sr
#from pocketsphinx import get_model_path
from time import time
import subprocess
import os
from os import path
from google.cloud import speech
from google.cloud.speech import enums
from google.cloud.speech import types

AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)),"data_audio/easy.wav")


# use the audio file as the audio source
r = sr.Recognizer()
with sr.AudioFile(AUDIO_FILE) as source:
    audio = r.record(source)  # read the entire audio file


#Run from terminal: export GOOGLE_APPLICATION_CREDENTIALS=creds.json

#env = {
#    **os.environ,
#    "GOOGLE_APPLICATION_CREDENTIALS": "Smart_app-cc943e9bbe3a.json",
#}
#subprocess.Popen('/usr/bin/mybinary', env=env).wait()


# Loads the audio into memory
with io.open(AUDIO_FILE, 'rb') as audio_file:
    content = audio_file.read()
    audio = types.RecognitionAudio(content=content)

# Instantiates a client
client = speech.SpeechClient()
config = types.RecognitionConfig(
    encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
   # sample_rate_hertz=16000,
    language_code='en-US')

response = client.recognize(config, audio)
print(response)

print(response.results[0].alternatives[0].transcript)

exit()
for result in response.results:
    print('Transcript: {}'.format(result.alternatives[0].transcript))
