import speech_recognition as sr
import sys
sys.path.insert(0, '../SmartApp.KB/bindings/python')
import kb
import asyncio
from concurrent.futures import ThreadPoolExecutor
import janus
from google.cloud.speech_v1p1beta1 import enums
from google.cloud.speech_v1p1beta1 import types
from google.cloud import speech_v1p1beta1 as speech
sys.path.insert(0, "../SmartApp.HAL")
from Bindings import HALInterface

#TODO: Run from terminal: export GOOGLE_APPLICATION_CREDENTIALS=creds.json


def recognize(model, audio, timestamp, recognizer, language="en-US"):
        """
        This function implements the trancription from speech to text
        :param model: name of the API to use (google / sphinx)
        :param audio: wav audio to transcribe
        :param timestamp: timestamp of the audio
        :param recognizer: recognizer (google cloud speech recognition client/ speech_recognition Recognizer)
        :param language: wav audio's language
        """
        res = {"model": model, "lang": language, "text": None, "error": None, "timestamp": timestamp}
        try:
            if model == "sphinx":
                res["text"] = recognizer.recognize_sphinx(audio)
            else:
                if "google.cloud.speech_v1p1beta1.SpeechClient" in type(recognizer):
                    config = types.RecognitionConfig(
                        encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
                       #sample_rate_hertz=16000,
                        language_code='en-US',
                        #enable_automatic_punctuation=True,
                        alternative_language_codes=['it'])
                    response = recognizer.recognize(config, audio)
                    res["text"] = response["results"]["alternatives"]["transcript"]
                    res["lang"] = response["results"]["language_code"]
                else:
                    res["text"] = recognizer.recognize_google(audio, language=language)

            print(res["text"])
        except sr.UnknownValueError:
            print(model + " could not understand audio")
            res["error"] = "UnknownValueError"
            # TODO logs
        except sr.RequestError as e:
            print(model + " error; {0}".format(e))
            res["error"] = "RequestError"
            #TODO logs

        return res


async def speech_to_text(queue):
    """
    This function implements the translation from speech to text with online and offline services, and compute the
    emotion related to the speech
    :param queue: process shared queue
    """
    myID = kb.register()
    # TODO handle error of registration to KB

    r = sr.Recognizer()
    google_client = speech.SpeechClient()
    # TODO handle error of creation of recognizer
    with ThreadPoolExecutor() as executor:

        while True:

            # Data stored in the queue contain all the information needed to create AudioData object
            timestamp, channels, sampleRate, bitPerSample, data = await queue.get()
            audio = sr.AudioData(data, sampleRate, bitPerSample/8)

            #TODO add emotion from speech
            emotion = None

            google_cloud = executor.submit(recognize, "google-cloud", audio, timestamp, google_client)
            google = executor.submit(recognize, "google", audio, timestamp, r)
            sphinx = executor.submit(recognize, "sphinx", audio, timestamp, r)

            res = google_cloud.result()
            if res["error"] is None:
                # Add to KB Google cloud speech recognition result with timestamp and ID
                print("Insert into KB --> Google cloud speech recognition result")

            else:
                res = google.result()
                if res["error"] is None:
                    # Add to KB Google result with timestamp and ID
                    print("Insert into KB --> Google result")
                else:
                    res = sphinx.result()
                    if res["error"] is None:
                        # Add to KB Sphinx result with timestamp and ID
                        print("Insert into KB --> Sphinx result")

            if res["error"] is None:
                print(kb.addFact(myID, "text_f_audio", 2, 50, 'false', {"TAG": "text_f_audio",
                                                                        "ID": timestamp,
                                                                        "timestamp": timestamp,
                                                                        "text": res["text"],
                                                                        "language": res["lang"],
                                                                        "emotion": emotion}))  # TODO adjust "text_f_audio", 2, 50, 'false'

            else:
                # Add to KB that none of google and sphinx retrieved a result
                print("Insert into KB that no Google or Sphinx result")
                print(kb.addFact(myID, "text_f_audio", 2, 50, 'false', {"TAG": "text_f_audio",
                                                                        "ID": timestamp,
                                                                        "timestamp": timestamp,
                                                                        "text": "",
                                                                        "language": "en-US",
                                                                        "emotion": emotion}))  # TODO adjust "text_f_audio", 2, 50, 'false' #TODO probably better way to define the error for other module

            #TODO handle other error


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

    hal = HALInterface(HALAddress=HALAddress, HALAudioPort=HALAudioPort)
    hal.registerAsAudioReceiver(handleAudioMessages)


if __name__ == '__main__':
    HALAddress = "localhost"  # default
    HALAudioPort = 2001  # default

    loop = asyncio.get_event_loop()
    q = janus.Queue(loop=loop)

    loop.run_until_complete(myHandler(q.sync_q))
    loop.run_until_complete(speech_to_text(q.async_q))
    loop.run_forever()
