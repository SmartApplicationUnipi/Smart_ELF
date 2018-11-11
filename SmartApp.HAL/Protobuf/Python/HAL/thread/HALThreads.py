import threading as Threading
import socket as Socket
import logging
import time as Time


def __setupLogger(name):
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s"))

    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(handler)
    return logger


Log = __setupLogger("HALInteractionLib.Thread")


"""
Seconds the thread has to wait trying to receive something.
After that the thread checks if it has to terminate. If not, it goes back in receiving state.
"""
_THREAD_RECEIVE_TIMEOUT = 2

"""
Max bytes read for each receive call
"""
_RECEIVE_BUFFER_SIZE = 1024 * 1024  # 1MB


class HALThread(Threading.Thread):
    """
    A generic Thread that interacts with the HALModule.
    Override the `handleSoc`
    """

    def __init__(self, HALAddress, HALReadingPort, clientID, callback):
        Threading.Thread.__init__(self)
        # Config
        self.HALAddress = HALAddress
        self.HALReadingPort = HALReadingPort
        # Client managment
        self.clientID = clientID
        self.callback = callback
        # HALCommunication
        self.mustTerminate = False
        self.isConnected = False
        self.socket = None

    def connect(self):
        """
        Try to connect to the HAL Module through the audio socket.
        It returns `True` if the connection succeeded, `False` otherwise.
        """
        try:
            self.socket = Socket.socket(Socket.AF_INET, Socket.SOCK_STREAM)
            self.socket.connect((self.HALAddress, self.HALReadingPort))
            self.socket.settimeout(_THREAD_RECEIVE_TIMEOUT)
            self.isConnected = True
            Log.debug("Reading connection setup for client %d" % self.clientID)
            return True
        except Exception as e:
            Log.error("Error thrown while trying to connect to %s:%d. Exception is: %s" % (self.HALAddress, self.HALReadingPort, e))
            return False

    def run(self):
        try:
            while True:
                Log.debug("I'm the HALThread for client %d" % self.clientID)
                if not(self.isConnected):
                    Log.error("I'm the HALThread for client %s. You MUST call connect() (and get a positive result) before starting this thread." % self.clientID)
                    break
                if self.mustTerminate:
                    Log.debug("I'm the HALThread for client %s and I'm terminating." % str(self.clientID))
                    break
                try:
                    data = self.socket.recv(_RECEIVE_BUFFER_SIZE)
                    if data == '':
                        Log.warning("Socket closed by the HALModule.")
                        break
                    message = self.handleMessage(data)
                    if not(self.mustTerminate):
                        self.callback(message)
                except Socket.timeout as e:
                    Log.debug("HALThread for client %s. Socket timeouts %s" % (self.clientID, e))
                    continue  # check if must terminate
                except Socket.error as e:
                    Log.error("HALThread for client %s. Socket error occurs %s" % (self.clientID, e))
                    break
        finally:
            self._cleanUp()

    def handleMessage(self, data):
        """
        This function transforms the data read from the socket into a message object.
        It will be passed as argument to the registered callback.
        Override it in order to provide the right message handling.
        """
        return object()

    def terminate(self):
        """
        Ask the thread to terminate.
        """
        self.mustTerminate = True

    def _cleanUp(self):
        """
        Private cleanup function.
        Close the commmunication channel an release the client callback.
        """
        if not(self.socket == None):
            try:
                self.socket.shutdown(Socket.SHUT_RDWR)
            except Socket.error:
                pass
            try:
                self.socket.close()
            except Socket.error:
                pass
            self.socket = None
        self.callback = None


class HALThreadWithControlChannel(HALThread):
    """
    A generic Thread that interacts with the HALModule using also a control channel.
    """

    def __init__(self, HALAddress, HALReadingPort, HALControlPort, clientID, callback):
        HALThread.__init__(self, HALAddress, HALReadingPort, clientID, callback)
        self.controlSocket = None
        self.HALControlPort = HALControlPort

    def connect(self):
        if super().connect():
            try:
                self.controlSocket = Socket.socket(Socket.AF_INET, Socket.SOCK_STREAM)
                self.controlSocket.connect((self.HALAddress, self.HALControlPort))
                # self.controlSocket.settimeout(_THREAD_RECEIVE_TIMEOUT) ??
                self.isConnected = True
                Log.debug("controll connection setup for client %d" % self.clientID)
                return True
            except Exception as e:
                Log.error("Error thrown while trying to estabilish control connection to %s:%d. Exception is: %s" % (self.HALAddress, self.HALControlPort, e))
                return False
        return False

    def _cleanUp(self):
        HALThread._cleanUp(self)
        if not(self.controlSocket == None):
            try:
                self.controlSocket.shutdown(Socket.SHUT_RDWR)
            except Socket.error:
                pass
            try:
                self.controlSocket.close()
            except Socket.error:
                pass
            self.controlSocket = None
