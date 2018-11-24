import numpy as np


class HALFace():

    def __init__(self, id, data):
        self.id = id
        self.data = data


class HALVideoPacket():
    """
    VideoPacket wrapper with additional methods
    """

    def __init__(self, videoDataPacket_pb2):
        self.packet = videoDataPacket_pb2

    def get_numpyFaces(self):
        f = []
        for face in self.packet.faces:
            array = np.array(np.frombuffer(face.data, np.uint8), dtype=np.uint8)
            f.append(HALFace(face.id, np.reshape(array, (face.rect.height, face.rect.width, 3))))
        return f

    numpyFaces = property(get_numpyFaces)

    ######################################################################
    # EXPOSE INNER FIELDS
    ######################################################################

    def get_faces(self):
        return self.packet.faces

    def get_timestamp(self):
        return self.packet.timestamp

    faces = property(get_faces)
    timestamp = property(get_timestamp)
