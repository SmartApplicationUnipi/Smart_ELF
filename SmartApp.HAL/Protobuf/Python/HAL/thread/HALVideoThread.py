from HAL.thread import HALThreads as Threads
from HAL.model import VideoPacket_pb2 as Protobuf
import socket as Socket
import logging

Log = logging.getLogger("HALInteractionLib.Thread")


class HALVideoThread(Threads.HALThreadWithControlChannel):

    def handleMessage(self, data):
        videoMessage = Protobuf.VideoDataPacket()
        videoMessage.ParseFromString(data)
        Log.debug("Received video message: %s" % str(videoMessage))
        return videoMessage

    def setFramerate(self, newFramerate):
        videoControlPacket = Protobuf.VideoControlPacket()
        videoControlPacket.framerateRequest.framerate = newFramerate
        sent = self.controlSocket.send(videoControlPacket.SerializeToString())
        return sent != 0
