import yarp

yarp.Network.init()

def receiver(AV_port_name, HW_port_name, queue):
    """
    This function implements the communication with the microphone through YARP
    framework, appending all the message received to a queue.
    :param AV_port_name: name of the receiver port
    :param HW_port_name: name of the sender port
    :param queue: process shared queue
    """

    # Create and connect the port
    AV_port = yarp.BufferedPortBottle()
    AV_port.open(AV_port_name)
    yarp.Network.connect(HW_port_name, AV_port_name)

    while True:

        # Read the bottle message and convert to AudioData type
        btl = AV_port.read()
        print(btl)
        timestamp = btl.get(0).asInt64()
        print(timestamp)
        raw_audio = btl.get(1).asBlob()
        print(raw_audio)

        queue.put([timestamp, raw_audio])

    # Cleanup
    AV_port.close()

