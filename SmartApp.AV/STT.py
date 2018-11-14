import io
import speech_recognition as sr
from multiprocessing import Queue, Process
from os import path
import sys
sys.path.insert(0, '../SmartApp.KB/')
from kb import *
import time

AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "demo/Trump_We_will_build_a_great_wall.wav")


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
        res = {"model":model, "lang":language, "text":None, "error": None, "timestamp":timestamp}
        try:
            if model == "sphinx":
                res["text"] = r.recognize_sphinx(audio)
            else:

                res["text"] = r.recognize_google(audio, language = language)
        except sr.UnknownValueError:
            print(model + " could not understand audio")
            res["error"] = "UnknownValueError"
            # TODO logs
        except sr.RequestError as e:
            print(model+ " error; {0}".format(e))
            res["error"] = "RequestError"
            #TODO logs

        res_queue.put(res)


def speech_to_text(queue,testing):
    """
    This function implements the translation from speech to text with online and offline services, and compute the
    emotion related to the speech
    :param queue: process shared queue
    """
    myID = register()
    # TODO handle error of registration to KB
    r = sr.Recognizer()
    queue_transc = Queue()
    while(True):
        # Data stored in the queue consist of:
        #   - timestamp
        #   - string that represent the wav audio
        if (testing):
            with sr.AudioFile(AUDIO_FILE) as source:
                    audio = r.record(source)  # read the entire audio file
            timestamp = time.time()

        else:

            timestamp, raw_audio = queue.get()
            raw_audio = io.BytesIO(raw_audio)
            audio = r.record(sr.AudioFile(raw_audio))

        #TODO detect language
        #TODO add emoction from speech

        # Transcribe audio with google speech recognition and sphinx
        sphinx_rec = Process(target=recognize, args=("sphinx", audio,  queue_transc, timestamp, r ))
        sphinx_rec.start()
        google_rec = Process(target=recognize, args=("google", audio, queue_transc, timestamp, r ))
        google_rec.start()

        req_err = False
        res = queue_transc.get()
        models_res = {"google":None, "sphinx":None}
        
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

        text_transcribed = None

        if models_res["google"]["error"] == None:
            # Add to KB Google result with timestamp and ID
            print("Insert into KB only Google result")
            print(addFact(myID, "text_f_audio", 2, 50, 'false', {"TAG":"text_f_audio", "ID":timestamp, "timestamp":timestamp, "text": models_res["google"]["text"], "emotion": text_transcribed})) #TODO adjust "text_f_audio", 2, 50, 'false'
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
                print(addFact(myID, "text_f_audio", 2, 50, 'false', {"TAG":"text_f_audio", "ID":timestamp, "timestamp":timestamp, "text": models_res["sphinx"]["text"], "emotion": text_transcribed}))#TODO adjust "text_f_audio", 2, 50, 'false'
            else:
                # Add to KB that none of google and sphinx retrieved a result
                print("Insert into KB that no Google or Sphinx result")
                print(addFact(myID, "text_f_audio", 2, 50, 'false', {"TAG":"text_f_audio", "ID":timestamp, "timestamp":timestamp, "text": "", "emotion": text_transcribed})) #TODO adjust "text_f_audio", 2, 50, 'false' #TODO probably better way to define the error for other module

        #TODO handle other error





#speech_to_text(None,True)