from Bindings.thread import HALThread
from Bindings.model import AudioPacket_pb2 as Protobuf
import socket as Socket
import logging

Log = logging.getLogger("HALInteractionLib.Thread")


class HALAudioThread(HALThread):

    def handleMessage(self, data, size, position):
        try:
            audioMessage = Protobuf.AudioDataPacket()
            audioMessage.ParseFromString(data[position:position + size])
            # Log.debug("Received audio message: %s" % str(audioMessage))
            Log.info("Received audio message")
            return audioMessage
        except Exception as e:
            Log.error("Receiving audio message error: %s" % e)
            return None
