from .SDK import Facepp_Client
import os
import cv2


"""
    Image Requirements
    Format : JPG (JPEG), PNG
    Size : between 48*48 and 4096*4096 (pixels)
    File size : no larger than 2MB
    Minimal size of face : the bounding box of a detected face is a square. The minimal side length of a square should be no less than 1/48 of the short side of image, and no less than 48 pixels. For example if the size of image is 4096 * 3200px, the minimal size of face should be 66 * 66px.
"""

class FacePlusPlus():

    def __init__(self, FACEpp_Key = None, FACEpp_Secret = None):
        key = os.getenv('FACEpp_KEY', None) if FACEpp_Key==None else FACEpp_Key
        secret = os.getenv('FACEpp_SECRET', None) if FACEpp_Secret==None else FACEpp_Secret

        if key == None or secret == None:
            raise ValueError("You must set Env with FACEpp_KEY and FACEpp_SECRET (value of your application) or indicate them as parameters.")
        else:
            self.client = Facepp_Client(key, secret)

    def simple_demo(self, frame):
        response = self.client.detect(frame = frame)
        r = self.client.search(image_file = cv2.imencode('.jpg', frame)[1], outer_id = 'fiss')
        frame = drawRectFace(frame, response)
        print(r)
        return frame

    def setAttr(self, attributes=None):
        """
            set attribute to be returned in the response
            for a complete list of attributes and returned json see: https://console.faceplusplus.com/documents/5679127

            params:
                attributes: list of attributes to return
        """
        if attributes is not None:
            if type(attributes) is str:
                self.client.setAttr(attributes)
            else:
                raise TypeError("attributes should be a str. You've provided a " + type(attributes).__name__ + ", instead.")
        else:
            #all attributes
            self.client.setAttr("all")



def drawRectFace(image, jsonResult):
    faces = jsonResult["faces"]
    img_h, img_w, _ = image.shape
    size = (img_w, img_h)
    for face in faces:
        # Draw Rectangle
        w, y, x, h = tuple(map(abs, face["face_rectangle"].values()))
        end_face = tuple(map(lambda x, y: x+y, (x, y), (w, h)))
        cv2.rectangle(image, (x, y), end_face, (0,255,0), 3)

        # Draw Landmarks
        fl = face["landmark"]
        for key, pos in fl.items():
            xy = (int(pos["x"]), int(pos["y"]))
            cv2.circle(image, xy, 1, (0,0,255), -1)

    return image
