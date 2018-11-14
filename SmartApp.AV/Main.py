from multiprocessing import Queue, Process
import 	communication
import STT


if __name__ == '__main__':
    HWPort_sample = "/microphone/samples"
    q = Queue()
    communication_process = Process(target=communication.receiver, args=("/av/transcriber", HWPort_sample, q, True))
    STT_process = Process(target=STT.speech_to_text, args=(q,False))
    STT_process.start()
    communication_process.start()
