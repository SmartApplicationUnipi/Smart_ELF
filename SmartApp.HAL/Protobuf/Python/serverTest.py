from HAL.model import AudioPacket_pb2 as Audio
from HAL.model import VideoPacket_pb2 as Video
import socket
import sys
import wave
import audioop
import time


def buildAudioPacket():
    with wave.open('./test.wav', 'r') as fd:
        params = fd.getparams()
        frames = fd.readframes(fd.getnframes())
        print("Frames: %d type: %s" % (fd.getnframes(), type(frames)))
        p = Audio.AudioDataPacket()
        p.channels = params.nchannels
        p.timestamp = int(round(time.time() * 1000))
        p.sampleRate = params.framerate
        p.bitsPerSample = params.sampwidth
        # p.data = frames doesn't work yet
        p.data = str.encode("Tutti Bravi Così")
        return p
    return Audio.AudioDataPacket()


def buildVideoPacket():
    p = Video.VideoDataPacket()
    p.timestamp = int(round(time.time() * 1000))
    face = p.faces.add()
    face.id = 1
    face.data = b'1234'
    return p


if __name__ == '__main__':

    try:
        print("Waiting example program to connect...")
        audioSoc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        audioSoc.bind(("127.0.0.1", 1234))
        audioSoc.listen()

        videoSoc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        videoSoc.bind(("127.0.0.1", 4321))
        videoSoc.listen()

        controlSoc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        controlSoc.bind(("127.0.0.1", 2314))
        controlSoc.listen()

        audioCon, _ = audioSoc.accept()
        videoCon, _ = videoSoc.accept()
        controlCon, _ = controlSoc.accept()
        print("Connected! Write a to send an AudioMessage, v for a VideoMessage and q to quit.")

        for line in sys.stdin:
            command = line.rstrip()
            if command == "a":
                print("Sending audio message")
                audio = buildAudioPacket()
                # print(len(audio.data))
                # print(audio.data)
                audioCon.send(audio.SerializeToString())

            elif command == "v":
                print("Sending video message")
                video = buildVideoPacket()
                videoCon.send(video.SerializeToString())

                print("Receiving framerate request")
                data = controlCon.recv(1024*1024)
                frameRateRequest = Video.VideoControlPacket()
                frameRateRequest.ParseFromString(data)
                print(str(frameRateRequest))

            elif command == "q":
                print("Bye!")
                break
            else:
                print("Write a to send an AudioMessage, v for a VideoMessage and q to quit.")
    finally:
        try:
            audioSoc.shutdown(socket.SHUT_RDWR)
        except socket.error:
            pass
        try:
            videoSoc.shutdown(socket.SHUT_RDWR)
        except socket.error:
            pass
        try:
            controlSoc.shutdown(socket.SHUT_RDWR)
        except socket.error:
            pass
        try:
            audioSoc.close()
        except socket.error:
            pass
        try:
            videoSoc.close()
        except socket.error:
            pass
        try:
            controlSoc.close()
        except socket.error:
            pass
