from Bindings.thread import HALThread
from Bindings.model.HALVideoPacket import HALVideoPacket  # Hal implementation with methods (protobuf no subclasses)
from Bindings.model import VideoPacket_pb2 as VideoPacket  # protobuf original
from google.protobuf.internal.encoder import _VarintBytes
import socket as Socket
import logging


Log = logging.getLogger("HALInteractionLib.Thread")


class HALVideoThread(HALThread):

    def handleMessage(self, data, size, position):
        try:
            videoMessage = VideoPacket.VideoDataPacket()
            videoMessage.ParseFromString(data[position:position + size])
            # Log.debug("Received video message: %s" % str(videoMessage))
            Log.info("Received video message")
            return HALVideoPacket(videoMessage)
        except Exception as e:
            Log.error("Receiving video message error: %s" % e)
            return None

    def setFramerate(self, newFramerate):
        try:
            videoControlPacket = VideoPacket.VideoControlPacket()
            videoControlPacket.framerateRequest.framerate = newFramerate
            self.socket.send(_VarintBytes(videoControlPacket.ByteSize()))
            sent = self.socket.send(videoControlPacket.SerializeToString())
            return sent != 0
        except Exception as e:
            Log.error("Setting framerate error: %s" % e)
            return False
