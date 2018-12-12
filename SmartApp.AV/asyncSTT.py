import speech_recognition as sr
import sys
sys.path.insert(0, "../SmartApp.HAL")
sys.path.insert(0, '../SmartApp.KB/bindings/python/')
import kb
import asyncio
from concurrent.futures import ThreadPoolExecutor
import janus
from google.cloud.speech_v1p1beta1 import enums
from google.cloud.speech_v1p1beta1 import types
from google.auth import exceptions
from google.cloud import speech_v1p1beta1 as speech
from Bindings import HALInterface
from os import path
import time
import io
#import sentimental_analizer
import logging

#TODO: Run from terminal: export GOOGLE_APPLICATION_CREDENTIALS=creds.json
logging.basicConfig(filename='STT.log', filemode='w', format='%(asctime)s - [%(levelname)s] - %(message)s', datefmt='%d-%b-%y %H:%M:%S', level=logging.DEBUG)
log = logging.getLogger()

def recognize(model, audio, recognizer, language="it_IT"): #en_US"):
        """
        This function implements the trancription from speech to text
        :param model: name of the API to use (google / sphinx)
        :param audio: wav audio to transcribe
        :param recognizer: recognizer (google cloud speech recognition client/ speech_recognition Recognizer)
        :param language: wav audio's language
        """
        res = {"model": model, "lang": language, "text": None, "error": None}
        try:
            if model == "sphinx":
                res["text"] = recognizer.recognize_sphinx(audio)
            elif "google.cloud.speech_v1p1beta1.SpeechClient" in str(type(recognizer)):
                config = types.RecognitionConfig(
                    encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
                   #sample_rate_hertz=16000,
                    language_code='en-US',
                    #enable_automatic_punctuation=True,
                    alternative_language_codes=['it'])
                response = recognizer.recognize(config, audio)
                res["text"] = response.results[0].alternatives[0].transcript
                res["lang"] = response.results[0].language_code
            elif "speech_recognition.Recognizer" in str(type(recognizer)):
                res["text"] = recognizer.recognize_google(audio, language=language)
            else:
                res["error"] = "Error"

            print(res["text"])
        except sr.UnknownValueError:
            #print(model + " could not understand audio")
            res["error"] = "UnknownValueError"
        except sr.RequestError as e:
            #print(model + " error; {0}".format(e))
            res["error"] = "RequestError"

        return res


async def speech_to_text(queue):
    """
    This function implements the translation from speech to text with online and offline services, and compute the
    emotion related to the speech
    :param queue: process shared queue
    """

    kb_client = KnowledgeBaseClient(False)
    kb_ID = (kb_client.register())['details']
    kb_client.registerTags(kb_ID, { 'AV_IN_TRANSC_EMOTION' : {'desc' : 'text from audio', 'doc' : 'text from audio '} })


    # Create new recogniers for all the services used
    r = sr.Recognizer()
    google_client = None
    try:
        google_client = speech.SpeechClient()
    except exceptions.DefaultCredentialsError as e:
        log.error("Failed to authenticate with Google Cloud Speech recognition" + str(e))
    except :
        log.error("Unexpected error. Failed to authenticate with Google Cloud Speech recognition:"+ str(sys.exc_info()[0]))

    with ThreadPoolExecutor() as executor:

        while True:

            # Data stored in the queue contain all the information needed to create AudioData object
            timestamp, channels, sampleRate, bitPerSample, data = await queue.get()

            audio = sr.AudioData(data, sampleRate, bitPerSample/8)
            audio_gc = types.RecognitionAudio(content=data)

            # Compute the transcription of the audio
            google_cloud = executor.submit(recognize, "google-cloud", audio_gc, google_client)
            google = executor.submit(recognize, "google", audio, r)
            sphinx = executor.submit(recognize, "sphinx", audio, r)

            # Compute the emotion related to the audio
            #emotion = executor.submit(sentimental_analizer.emotion_from_speech, sampleRate, audio, log)

            res = google_cloud.result()
            if res["error"] is None:
                # Add to KB Google cloud speech recognition result with timestamp and ID
                log.info("Insert into KB --> Google cloud speech recognition result: " + str(res["text"]))

            else:
                log.error("Google cloud speech recognition retrieved an error: " + str(res["error"]))
                res = google.result()
                if res["error"] is None:
                    # Add to KB Google result with timestamp and ID
                    log.info("Insert into KB --> Google result: " + str(res["text"]))
                else:
                    log.error("Google retrieved an error: " + str(res["error"]))
                    res = sphinx.result()
                    if res["error"] is None:
                        # Add to KB Sphinx result with timestamp and ID
                        log.info("Insert into KB --> Sphinx result: " + str(res["text"]))
                    else:
                        log.error("Sphinx retrieved an error: " + str(res["error"]))

            emotion = None #emotion.result()

            myID = 'stt'
            if res["error"] is None:
                # Add to KB that the transcription of the audio
                kb_client.addFact(kb_ID, 'AV_IN_TRANSC_EMOTION', 1, 100, {"tag": 'AV_IN_TRANSC_EMOTION',
                                                                         "timestamp": timestamp,
                                                                         "ID": timestamp,
                                                                         "text": res["text"],
                                                                         "language": res["lang"],
                                                                         "valence": emotion["valence"],
                                                                         "arousal": emotion["arousal"]
                                                                         })
                # TODO adjust "text_f_audio", 2, 50, 'false'

            else:
                # Add to KB that none of google and sphinx retrieved a result
                log.critical("Insert into KB that no Google or Sphinx result")
                kb_client.addFact(kb_ID, 'AV_IN_TRANSC_EMOTION', 1, 100, {"tag": 'AV_IN_TRANSC_EMOTION',
                                                                         "timestamp": timestamp,
                                                                         "ID": timestamp,
                                                                         "text": "",
                                                                         "language": res["lang"],
                                                                         "valence": emotion["valence"],
                                                                         "arousal": emotion["arousal"]
                                                                         })


async def myHandler(queue):
    """
    This function implements the communication with the microphone, appending all the message
    received to a queue.
    :param queue: async queue in which append the audioMessage
    """
    def handleAudioMessages(audioMessage):
        print("Received audio:\n\tTimestamp:%d\n\tChannels:%d\n\tSampleRate:%d\n\tBitPerSample:%d\n\t%d bytes of data\n\n" %
              (audioMessage.timestamp, audioMessage.channels, audioMessage.sampleRate, audioMessage.bitsPerSample, len(audioMessage.data)))
        queue.put([audioMessage.timestamp, audioMessage.channels, audioMessage.sampleRate, audioMessage.bitsPerSample, audioMessage.data])

    def handleError():
        backoff += 5
        log.warning("Disconnected from HAL. Waiting " + str(backoff) + "sec")
        time.sleep(backoff)
        hal.registerAsAudioReceiver(handleAudioMessages, handleError)

    backoff = 0
    hal = HALInterface(HALAddress=HALAddress, HALAudioPort=HALAudioPort)
    hal.registerAsAudioReceiver(handleAudioMessages, handleError)


if __name__ == '__main__':
    HALAddress = "10.101.60.139"  # default
    HALAudioPort = 2001  # default

    log.info("Start STT process")

    loop = asyncio.get_event_loop()
    q = janus.Queue(loop=loop)

    loop.run_until_complete(myHandler(q.sync_q))
    loop.run_until_complete(speech_to_text(q.async_q))
    loop.run_forever()
