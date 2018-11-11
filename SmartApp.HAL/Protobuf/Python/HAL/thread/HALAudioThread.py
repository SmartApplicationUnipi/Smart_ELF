from HAL.thread import HALThreads as Threads
from HAL.model import AudioPacket_pb2 as Protobuf
import socket as Socket
import logging

Log = logging.getLogger("HALInteractionLib.Thread")


class HALAudioThread(Threads.HALThread):

    def handleMessage(self, data):
        audioMessage = Protobuf.AudioDataPacket()
        audioMessage.ParseFromString(data)
        Log.debug("Received audio message: %s" % str(audioMessage))
        return audioMessage
