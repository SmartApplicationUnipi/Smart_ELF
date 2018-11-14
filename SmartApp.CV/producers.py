class FacesetProducer():
    """
    Interface for a producer of facesets
    """
    def __call__(self):
        """
        Retrieves the new set of faces of the last frame
        :return: a list of opencv frames of the faces
        """
        raise NotImplementedError()


class KinectFacesetProducer(FacesetProducer):
    """
    Acquisition of face frame sets from Kinect
    """
    def __init__(self):
        pass

    def __call__(self):
        # TODO: write here the code of frameset acquisition
        return []


class OpencvFacesetProducer(FacesetProducer):
    """
    Acquisition of face frame sets from local camera via opencv
    """
    def __init__(self):
        pass

    def __call__(self):
        pass