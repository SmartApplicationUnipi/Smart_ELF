from multiprocessing import Queue, Process
import communication
import STT


if __name__ == '__main__':
    HALAddress = "10.101.48.147"  # default
    HALAddress = "10.101.31.10"
    HALAudioPort = 2001  # default
    q = Queue()
    communication_process = Process(target=communication.receiver, args=(HALAddress, HALAudioPort, q, False))
    STT_process = Process(target=STT.speech_to_text, args=(q,))
    STT_process.start()
    communication_process.start()
