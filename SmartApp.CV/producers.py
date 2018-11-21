import cv2
import dlib

class FacesetProducer():
    """
    Interface for a producer of facesets
    """
    def __call__(self):
        """
        Retrieves the new set of faces of the last frame
        :return: a pair with: a list of opencv frames of the faces, and frame metadata (i.e., position, size)
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
        self.cam = cv2.VideoCapture(0)
        self.detector = dlib.get_frontal_face_detector()

    def __call__(self):
        # acquire new frame
        _, frame = self.cam.read()
        # detect its faces
        detected_faces = self.detector(frame, 1)
        # build lists to return
        face_frames, face_infos = [], []
        for rect in detected_faces:
            # delimit face rectangle
            top = max(rect.top(), 0)
            bottom = min(rect.bottom(), frame.shape[0])
            left = max(rect.left(), 0)
            right = min(rect.right(), frame.shape[1])
            # extract face ROI from frame
            face_frames.append(frame[top:bottom, left:right])
            face_infos.append({'position': {'x': left, 'y': top}, 'size': {'height': bottom-top, 'width': right-left}})
        return face_frames, face_infos
    
    def __del__(self):
        self.cam.release()
