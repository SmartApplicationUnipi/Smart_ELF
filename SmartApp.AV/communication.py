
from multiprocessing import Queue, Process
import time
from os import path
import speech_recognition as sr

def receiver(AV_port_name, HW_port_name, queue, testing):
    """
    This function implements the communication with the microphone through YARP
    framework, appending all the message received to a queue.
    :param AV_port_name: name of the receiver port
    :param HW_port_name: name of the sender port
    :param queue: process shared queue
    :param testing:  if is true, read audio sample/register from mic
    """
    if testing:
        AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "demo/Trump_We_will_build_a_great_wall.wav")

        r = sr.Recognizer()

        if(True):
            with sr.AudioFile(AUDIO_FILE) as source:
                raw_audio = r.record(source)  # read the entire audio file
        else:
            with sr.Microphone() as source:
                r.adjust_for_ambient_noise(source)  # listen for 1 second to calibrate the energy threshold for ambient noise levels
                print("Say something!")
                raw_audio = r.listen(source)
    else:
        pass
        #todo

    timestamp = time.time()
    queue.put([timestamp, raw_audio])



