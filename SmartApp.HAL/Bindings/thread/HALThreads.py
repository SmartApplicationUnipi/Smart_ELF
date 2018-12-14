import threading as Threading
import socket as Socket
import time as Time
import google.protobuf.internal.decoder as Decoder
import logging

Log = logging.getLogger("HALInteractionLib.Thread")

"""
Seconds the thread has to wait trying to receive something.
After that the thread checks if it has to terminate. If not, it goes back in receiving state.
"""
_THREAD_RECEIVE_TIMEOUT = 2


class HALThread(Threading.Thread):
    """
    A generic Thread that interacts with the HALModule.
    Override the `handleSoc`
    """

    def __init__(self, HALAddress, HALReadingPort, clientID, callback, errback, *args, **kwargs):
        Threading.Thread.__init__(self)
        # Config
        self.HALAddress = HALAddress
        self.HALReadingPort = HALReadingPort
        # Client managment
        self.clientID = clientID
        self.callback = callback
        self.callback_params = {'args': args, 'kwargs': kwargs}
        self.errback = errback
        # HALCommunication
        self.mustTerminate = False
        self.isConnected = False
        self.socket = None

    def _connect(self):
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
                    # read from the buffer
                    data, size, position = self._readFromStream()
                    if data == None and size == None and position == None:
                        Log.error("Socket closed by HALModule.")
                        self.errback()
                        break

                    # subclasses MUST specify how to handle the message
                    message = self.handleMessage(data, size, position)
                    if message == None:  # error during parsing
                        continue

                    if not(self.mustTerminate):
                        self.callback(message, *self.callback_params['args'], **self.callback_params['kwargs'])

                except Socket.timeout as e:
                    Log.debug("HALThread for client %s. Socket timeouts %s" % (self.clientID, e))
                    continue  # check if must terminate
                except Socket.error as e:
                    Log.error("HALThread for client %s. Socket error occurs %s" % (self.clientID, e))
                    self.errback()
                    break
        finally:
            self._cleanUp()

    def handleMessage(self, data, size, position):
        """
        This function transforms the data read from the socket into a message object.
        It will be passed as argument to the registered callback.
        Override it in order to provide the right message handling.
        """
        return object()

    def _readFromStream(self):
        buf = []
        # read the varint
        # documentation says "few bytes" (should be at most a 64bit int).
        # The part of the message read is buffered and not discarded
        data = self.socket.recv(20)
        rCount = len(data)
        if (rCount == 0):
            # connection closed by HALModule
            return None, None, None  # buuu

        (size, position) = Decoder._DecodeVarint(data, 0)
        buf.append(data)
        # read the message
        while rCount < size+position:
            data = self.socket.recv(size+position-rCount)
            rCount += len(data)
            buf.append(data)
        return b''.join(buf), size, position

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
        self.callback_params = None
        self.errback = None
