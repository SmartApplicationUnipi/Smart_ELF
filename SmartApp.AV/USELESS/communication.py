
from multiprocessing import Queue, Process
import time
from os import path
import speech_recognition as sr
import sys
sys.path.insert(0, "../SmartApp.HAL")
from Bindings import HALInterface


def myHandler(queue):
    def handleAudioMessages(audioMessage):
        print("Received audio:\n\tTimestamp:%d\n\tChannels:%d\n\tSampleRate:%d\n\tBitPerSample:%d\n\t%d bytes of data\n\n" %
              (audioMessage.timestamp, audioMessage.channels, audioMessage.sampleRate, audioMessage.bitsPerSample, len(audioMessage.data)))
        queue.put([audioMessage.timestamp, audioMessage.channels, audioMessage.sampleRate, audioMessage.bitsPerSample, audioMessage.data])
    return handleAudioMessages


def receiver(HALAddress, HALAudioPort, queue, testing):
    """
    This function implements the communication with the microphone, appending all the message received to a queue.
    :param HALAddress: address of the endpoint
    :param HALAudioPort: port of the endpoint
    :param queue: process shared queue
    :param testing:  if is true, read audio sample/register from mic
    """
    if testing:
        AUDIO_FILE = path.join(path.dirname(path.realpath(__file__)), "demo/Trump_We_will_build_a_great_wall.wav")

        r = sr.Recognizer()
        mic = True
        if mic:
            with sr.AudioFile(AUDIO_FILE) as source:
                raw_audio = r.record(source)  # read the entire audio file
        else:
            with sr.Microphone() as source:
                r.adjust_for_ambient_noise(source)  # listen for 1 second to calibrate the energy threshold for ambient noise levels
                print("Say something!")
                raw_audio = r.listen(source)
    else:
        # create interface object
        hal = HALInterface(HALAddress=HALAddress, HALAudioPort=HALAudioPort)

        # Audio
        audioID = hal.registerAsAudioReceiver(myHandler(queue))

        while True:
            time.sleep(1)
