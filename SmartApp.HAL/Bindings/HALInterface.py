import threading as Threading
from Bindings.thread import HALAudioThread as HALAudio
from Bindings.thread import HALVideoThread as HALVideo
import logging

Log = logging.getLogger("HALInteractionLib")


class HALInterface(object):
    def __init__(self, HALAddress="127.0.0.1", HALVideoPort=2002, HALAudioPort=2001):
        # Config
        self.HALAddress = HALAddress
        self.HALVideoPort = HALVideoPort
        self.HALAudioPort = HALAudioPort
        # Clients handling by threads
        self.clientLock = Threading.RLock()
        self.clientsID = 0
        self.registeredClients = {}

    ###############################################################
    # Audio
    ###############################################################
    def registerAsAudioReceiver(self, callback, *args, **kwargs, errback):
        Log.debug("registerAsAudioReceiver")
        id = self.__getClientID()
        clientThread = HALAudio.HALAudioThread(self.HALAddress, self.HALAudioPort, id, callback, *args, **kwargs, errback)
        if clientThread._connect():
            self.registeredClients[id] = clientThread
            clientThread.start()
            return id
        else:
            clientThread._cleanUp()  # better than this??
            return -1  # return false??

    ###############################################################
    # Video
    ###############################################################

    def registerAsVideoReceiver(self, callback, *args, **kwargs, errback):
        Log.debug("registerAsVideoReceiver")
        id = self.__getClientID()
        clientThread = HALVideo.HALVideoThread(self.HALAddress, self.HALVideoPort, id, callback, *args, **kwargs, errback)
        if clientThread._connect():
            self.registeredClients[id] = clientThread
            clientThread.start()
            return id
        else:
            clientThread._cleanUp()  # better than this??
            return -1  # return false??

    def setFrameRate(self, videoID, newFrameRate):
        if not(type(videoID) is int):
            Log.error("The videoID is needed to adapt the framerate. (passed %s)" % str(videoID))
            return False

        client = self.registeredClients[videoID]
        if client == None or not(isinstance(client, HALVideo.HALVideoThread)):
            Log.warning("Invalid videoID %d" % videoID)
            return False

        return client.setFramerate(newFrameRate)

    ###############################################################
    # Common
    ###############################################################
    def unregister(self, clientID):
        if not(type(clientID) is int):
            Log.error("To unregister a client a clientID is required. (passed %s)" % str(clientID))
            return False

        client = self.registeredClients.pop(clientID, None)
        if client == None:
            Log.warning("Try to uregister client with id %d but was not found" % clientID)
            return False

        client.terminate()
        Log.debug("Client %d unregistered." % clientID)
        return True

    def quit(self):
        for registeredClient in self.registeredClients:
            registeredClient.d.terminate()
        self.registeredClients.clear()

    ###############################################################
    # Private
    ###############################################################

    def __getClientID(self):
        with self.clientLock:
            id = self.clientsID
            self.clientsID += 1
            return id
