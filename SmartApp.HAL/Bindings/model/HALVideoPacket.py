import numpy as np


class HALFace():

    def __init__(self, data, id=-1, face_axis_x=0, face_axis_y=0, face_axis_z=-1, is_interlocutor=False):
        """
            Params:
                data (numpy.ndarray): image of face saved in a matrix, the size
                    of image is (h, w, 3). Height, Width, 3 the channels RGB
                id: id that the kinekt have assigned to the face
                    default: -1
                face_axis_x (int): x position of face in the original frame
                    default: 0
                face_axis_y (int): y position of face in the original frame
                    default: 0
                face_axis_z (int): z_index of interlocutor
                    default: -1
                is_interlocutor (bool): whether the person is the interlocutor
                    default: False
        """
        self.id = id
        self.img = data
        self.face_position = (face_axis_x, face_axis_y)
        self.z_index = face_axis_z
        self.is_interlocutor = is_interlocutor


class HALVideoPacket():
    """
    VideoPacket wrapper with additional methods

    Attributes:
        face (list): list of HALFace object
        frame_original_size (tuple): tuple of size of frame (x_size, y_size)
        timestamp (long):
    """

    def __init__(self, videoDataPacket_pb2):
        self.packet = videoDataPacket_pb2

    def get_faces(self):
        f = []
        for face in self.packet.faces:
            array = np.array(np.frombuffer(face.data, np.uint8), dtype=np.uint8)
            reshape_tuple = (face.rect.height, face.rect.width, 3)
            face_data = np.reshape(array, reshape_tuple)
            f.append(HALFace(face_data, face.id, face.rect.left, face.rect.top, face.Z, face.speaking))
        return f

    faces = property(get_faces)

    ######################################################################
    # EXPOSE INNER FIELDS
    ######################################################################

    def get_frameOriginalSize(self):
        return (self.packet.frameWidth, self.packet.frameHeight)

    frame_original_size = property(get_frameOriginalSize)

    def get_timestamp(self):
        return self.packet.timestamp

    timestamp = property(get_timestamp)
