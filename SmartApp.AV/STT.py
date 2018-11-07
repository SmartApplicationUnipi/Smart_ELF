import io
import speech_recognition as sr
from multiprocessing import Queue, Process


def speech_to_text(queue):
    """

    :param queue:
    :return:
    """
    r = sr.Recognizer()
    while(True):
        # Data is a list with:
        #   - timestamp
        #   - string that represent the wav audio
        data = queue.get()
        raw_audio = io.BytesIO(data[1])
        audio = r.record(sr.AudioFile(raw_audio))

        try:
            print("Sphinx thinks you said--->: " + r.recognize_sphinx(audio, "en-US"))
        except sr.UnknownValueError:
            print("Sphinx could not understand audio")
        except sr.RequestError as e:
            print("Sphinx error; {0}".format(e))

        # recognize speech using Google Speech Recognition
        req_err = False
        try:
            print("\n\nGoogle Speech Recognition thinks you said --->: " + r.recognize_google(audio, language="en-US"))
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand audio")
        except sr.RequestError as e:
            print("Could not request results from Google Speech Recognition service; {0}".format(e))
            req_err = True

        if req_err == True:
            print("Insert into KB only Sphinx result")
            #TODO add to KB Sphinx result with timestamp in data[0]
        else:
            print("Insert into KB Sphinx and Google results")
            # TODO add to KB Sphinx and Google results  with timestamp in data[0]
        #TODO handle other error
