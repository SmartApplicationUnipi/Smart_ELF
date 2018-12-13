import io
import speech_recognition as sr
from multiprocessing import Queue, Process
from os import path
import sys
sys.path.insert(0, '../SmartApp.KB/')
import kb
import time


def recognize(model, audio, res_queue, timestamp, r, language="en-US"):
        """
        This function implements the trancription from speech to text
        :param model: name of the API to use (google / sphinx)
        :param audio: wav audio to transcribe
        :param res_queue: queue in which the results are stored
        :param timestamp: timestamp of the auido
        :param r: recognizer
        :param language: wav audio's language

        """
        res = {"model": model, "lang": language, "text": None, "error": None, "timestamp": timestamp}
        try:
            if model == "sphinx":
                res["text"] = r.recognize_sphinx(audio)
            else:

                res["text"] = r.recognize_google(audio, language=language)
            print(res["text"])
        except sr.UnknownValueError:
            print(model + " could not understand audio")
            res["error"] = "UnknownValueError"
            # TODO logs
        except sr.RequestError as e:
            print(model + " error; {0}".format(e))
            res["error"] = "RequestError"
            #TODO logs

        res_queue.put(res)


def speech_to_text(queue):
    """
    This function implements the translation from speech to text with online and offline services, and compute the
    emotion related to the speech
    :param queue: process shared queue
    """
    myID = kb.register()
    # TODO handle error of registration to KB
    r = sr.Recognizer()
    queue_transc = Queue()
    while True:

        # Data stored in the queue contain all the information needed to create AudioData object
        timestamp, channels, sampleRate, bitPerSample, data = queue.get()
        audio = sr.AudioData(data, sampleRate, bitPerSample/8)

        #TODO detect language
        #TODO add emotion from speech
        emotion = None

        # Transcribe audio with google speech recognition and sphinx
        sphinx_rec = Process(target=recognize, args=("sphinx", audio,  queue_transc, timestamp, r))
        sphinx_rec.start()
        google_rec = Process(target=recognize, args=("google", audio, queue_transc, timestamp, r))
        google_rec.start()

        req_err = False
        res = queue_transc.get()
        models_res = {"google": None, "sphinx": None}

        while not res["timestamp"] == timestamp:
            # this case ensure that the results is not related to old queries
            res = queue_transc.get()

        models_res[res["model"]] = res
        if models_res["google"] is None:
            res = queue_transc.get()
            while not res["timestamp"] == timestamp:
                # this case ensure that the results is not related to old queries
                res = queue_transc.get()
            models_res["google"] = res


        if models_res["google"]["error"] == None:
            # Add to KB Google result with timestamp and ID
            print("Insert into KB only Google result")
            print(kb.addFact(myID, "text_f_audio", 2, 50, 'false', {"TAG": "text_f_audio",
                                                                    "ID": timestamp,
                                                                    "timestamp": timestamp,
                                                                    "text": models_res["google"]["text"],
                                                                    "language":language,
                                                                    "emotion": emotion})) #TODO adjust "text_f_audio", 2, 50, 'false'
        else:
            if models_res["sphinx"] == None:
                res = queue_transc.get()
                while not res["timestamp"] == timestamp:
                    # this case ensure that the results is not related to old queries
                    res = queue_transc.get()
                models_res["sphinx"] = res

            if models_res["sphinx"]["error"] == None:
                # Add to KB Sphinx result with timestamp and ID
                print("Insert into KB only Sphinx result")
                print(kb.addFact(myID, "text_f_audio", 2, 50, 'false', {"TAG": "text_f_audio",
                                                                        "ID": timestamp,
                                                                        "timestamp": timestamp,
                                                                        "text": models_res["sphinx"]["text"],
                                                                        "language":language,
                                                                        "emotion": emotion}))#TODO adjust "text_f_audio", 2, 50, 'false'
            else:
                # Add to KB that none of google and sphinx retrieved a result
                print("Insert into KB that no Google or Sphinx result")
                print(kb.addFact(myID, "text_f_audio", 2, 50, 'false', {"TAG": "text_f_audio",
                                                                        "ID": timestamp,
                                                                        "timestamp": timestamp,
                                                                        "text": "",
                                                                        "language":language,
                                                                        "emotion": emotion})) #TODO adjust "text_f_audio", 2, 50, 'false' #TODO probably better way to define the error for other module

        #TODO handle other error
