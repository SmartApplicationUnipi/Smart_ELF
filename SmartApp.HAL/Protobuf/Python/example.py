from HAL import HALInterface as HAL
import time as Time

# Ugly but needed to easily test the setFrameRateRequest
# create interface object
HALAddress = "127.0.0.1"    # default
HALAudioPort = 1234         # default
HALVideoPort = 4321         # default
HALControlPort = 2314       # default
hal = HAL.HALInterface(HALAddress=HALAddress, HALAudioPort=HALAudioPort, HALVideoPort=HALVideoPort, HALControlPort=HALControlPort)


def handleAudioMessages(audioMessage):
    print("Received audio:")
    print(audioMessage.channels)
    print(audioMessage.timestamp)
    print(audioMessage.sampleRate)
    print(audioMessage.bitsPerSample)
    print(audioMessage.data)


def handleVideoMessages(videoMessage):
    print("Received video:\n%s" % str(videoMessage))
    # Ugly but needed to easily test the setFrameRateRequest
    hal.setFrameRate(1, 60)  # should be videoID, fps


if __name__ == '__main__':
    # Audio
    audioID = hal.registerAsAudioReceiver(handleAudioMessages)
    if audioID == -1:
        print("Ops!, something wrong happens during the interaction with the HALModule. (Audio)")
        exit(-1)
    # From now handleAudioMessages() will be called (on a different thread) for each new audio message

    Time.sleep(1)

    videoID = hal.registerAsVideoReceiver(handleVideoMessages)
    if videoID == -1:
        print("Ops!, something wrong happens during the interaction with the HALModule. (Video)")
        exit(-1)
    # From now handleVideoMessages() will be called (on a different thread) for each new video message

    Time.sleep(15000000)
    # unregister
    hal.unregister(audioID)
    hal.unregister(videoID)
    hal.quit()
