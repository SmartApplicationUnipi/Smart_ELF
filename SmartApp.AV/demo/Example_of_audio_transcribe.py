#!/usr/bin/env python3

import speech_recognition as sr
#from pocketsphinx import get_model_path
from time import time


# obtain path to "english.wav" in the same folder as this script
from os import path
AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "Trump_We_will_build_a_great_wall.wav")


# use the audio file as the audio source
r = sr.Recognizer()
with sr.AudioFile(AUDIO_FILE) as source:
    audio = r.record(source)  # read the entire audio file



export GOOGLE_APPLICATION_CREDENTIALS="Smart_app-cc943e9bbe3a.json"


def implicit():
    from google.cloud import storage

    # If you don't specify credentials when constructing the client, the
    # client library will look for credentials in the environment.
    storage_client = storage.Client()

    # Make an authenticated API request
    buckets = list(storage_client.list_buckets())
    print(buckets)

implicit()

start = time()



# recognize speech using Google Cloud Speech
GOOGLE_CLOUD_SPEECH_CREDENTIALS = r"""{
  "type": "service_account",
  "project_id": "smart-app-222309",
  "private_key_id": "cc943e9bbe3a22cf5c0dfcd8825299cd5c94e99a",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDJum01J1VPwBrQ\nW9B35hTGmmATpbyKr+HLkkCq+OpDX3bpn6MOKuBii6oDfZNwY1OtpvHd0G4iTIrJ\n5QIIWGvKNZbZzksNcU7twCbGfBrSrlupXJxE1VWKU9xJmQ6Sub+i3juBtM+95iJZ\nFbfFZ5qRZghYoGVVk1yaFFeEHfgLT9rOXaPl4EKC7D5ddsdoJqn6GeRbf3AN3jRt\nFU2i0VvznZ/lZ+J9xW3GnQpQjzwMXVlqyC22qnWRNfAftRxrpJHjc0cKLKhKZfh4\niV+woTJzYAZXqtot2hScWKzD03JHov9PcOf8JwOf8zQzaXJ+RPi9bVscXk/TActz\nIi6HLbAFAgMBAAECggEAUGK5LPK5FLgNF1VW+8hUJBYVTg7/1FYlCI2FtnvNQj6y\n8ILcI4OjebGE9LIgRCtYh3zcqdLqaEGPFsfqqO+vOFtlevKxRrCNzsEA0pxWxfiT\n7yfH38gRN7eWMz/KJl7dhiW/mb62/8nKiyxT2FaiKel6TvLPnqvDvWR4wV193+di\njExEajSI+kihCTAcfRI60iS2OFKOggRgNtRsQ7dmNcLrKX3TRbO9lZNRxd9uXL03\nN24oA8+4nES8bKsJ5fyr9CvTSxO2ZdzU+ILADtyqnG8ZZ3X/hBelc4Ssgb/qiLxP\nA5ZFifQNtdK2IJNBrqi4X2cS1ve4zwkBSO/PcXAqqwKBgQD/CdSlXmagviwRvjn4\nbU4avFk8n0Y6sTKl3xEqlmRsik1oyiGBZKS7rgnBtINI5IF0PFOkrs1PK9LEifWh\nfTervMFPKoUVmQIWgKqQrokIfdTx4VTPZPLLzPNjbZSHQ1dxI/Xx/gz+dDdzWsKV\neCjPIo27fZhJMtc1+Lr1pZbovwKBgQDKfSPANtvld5ah84OWJb/zfmVBzXBk1dYf\nVlYEZPiLbtm936kVhRBpJtWLvGXvemGm+kMxw2jyG+nXa7M2KnIxaYbRSWFrwFd/\nrJRJ3Pg/M061DsrIF4ONYLVR0mHA88oBrMxlFBQDtiHeGC8DoJre5yrxwsDfNPO/\n99YhTHD0OwKBgQC2EI2GVELNY5VQQU1fBKDqQyUtOsLG6XKvqPO3RE+CkKS8Nvf+\nSBu1g4OhjbzfD4k+skY/3S3h4/X9qkL4usxARGp3mnIRPf6Yk9evm3ll33ZiCisi\nNv2A8dmaVELg4PkOYs6Tp3odOFfReKxKSdJQNGmbvAg30RyDggHtlP2LPwKBgA0Y\n4QoawkhqXszk4lsA4BSQ1V3XOvDav/nQ7Mll+omSRvU4FUi2DaSvhVp/ehxuTwis\n4VHDsPMQCSUM60+SmUZG7Bh3ZZzBmSdB82l/qHL2D544cbdVhgXL/o5nTDldy3Am\nTCYxkUXYLwKdj9TtO3c1fpqanT0SwL1m+2u19QxnAoGBAM0bSKs1T/6klRl6+NyC\nUCdsFmVl0p3disLZfX+HotPJgfs4Y+axmXmkZcvunxZ08W/3qhjNikjtVgKbKQgc\n5/PxLzOurCvhRFOv9QsrW3gdtiq0+wdsVz1B0/zNOObmTs6/X7ABCiq2i7OQmUZV\n5gPq5+6Gt10xm3lqRHUfUYb+\n-----END PRIVATE KEY-----\n",
  "client_email": "starting-account-w5n9kbz2chxr@smart-app-222309.iam.gserviceaccount.com",
  "client_id": "106653757429626479988",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/starting-account-w5n9kbz2chxr%40smart-app-222309.iam.gserviceaccount.com"
}
"""
try:
    print("Google Cloud Speech thinks you said " + r.recognize_google_cloud(audio, credentials_json=GOOGLE_CLOUD_SPEECH_CREDENTIALS))
except sr.UnknownValueError:
    print("Google Cloud Speech could not understand audio")
except sr.RequestError as e:
    print("Could not request results from Google Cloud Speech service; {0}".format(e))


m, s = divmod(time() - start, 60)
h, m = divmod(m, 60)
print("%d:%02d:%02f" % (h, m, s))




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




