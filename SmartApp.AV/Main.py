from multiprocessing import Queue, Process
import yarp_communication
import STT


if __name__ == '__main__':
    HWPort_sample = "/microphone/samples"
    q = Queue()
    yarp_process = Process(target=yarp_communication.receiver(), args=("/av/transcriber", HWPort_sample, q))
    STT_process = Process(target=STT.speech_to_text, args=(q,))
    STT_process.start()
    yarp_process.start()
