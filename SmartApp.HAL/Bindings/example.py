from Bindings import HALInterface  # Update import path!
import time as Time


def handleAudioMessages(audioMessage):
    print("Received audio:\n\tTimestamp:%d\n\tChannels:%d\n\tSampleRate:%d\n\tBitPerSample:%d\n\t%d bytes of data\n\n" %
          (audioMessage.timestamp, audioMessage.channels, audioMessage.sampleRate, audioMessage.bitsPerSample, len(audioMessage.data)))


def handleVideoMessages(videoMessage):
    print("Received video:\n\tTimestamp:%d\n\tFaces:" % videoMessage.timestamp)
    for face in videoMessage.faces:
        print("\t\tid: %d, %d bytes\n" % (face.id, len(face.data)))

    # hal.setFrameRate(videoID, 60fps)


if __name__ == '__main__':
    # create interface object
    HALAddress = "127.0.0.1"    # default
    HALAudioPort = 2001         # default
    HALVideoPort = 2002         # default
    hal = HALInterface(HALAddress=HALAddress, HALAudioPort=HALAudioPort, HALVideoPort=HALVideoPort)

    # Audio
    audioID = hal.registerAsAudioReceiver(handleAudioMessages)
    if audioID == -1:
        print("Ops!, something wrong happens during the interaction with the HALModule. (Audio)")
        exit(-1)
    # From now handleAudioMessages() will be called (on a different thread) for each new audio message

    videoID = hal.registerAsVideoReceiver(handleVideoMessages)
    if videoID == -1:
        print("Ops!, something wrong happens during the interaction with the HALModule. (Video)")
        exit(-1)
    # From now handleVideoMessages() will be called (on a different thread) for each new video message

    Time.sleep(30)
    # unregister
    hal.unregister(audioID)
    hal.unregister(videoID)
    hal.quit()
