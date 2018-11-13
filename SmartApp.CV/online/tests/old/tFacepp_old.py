import unittest
import pytest
import cv2
import os
from online.FacePlusPlus import FacePlusPlus

PATH = "online/tests/faces"

class Test(unittest.TestCase):

    @classmethod
    def setUpClass(self):
        self.client = FacePlusPlus()
        self.client.setAttr()

    def test_face_frame_only(self):


        files = [os.path.join(PATH, f) for f in os.listdir(PATH) if os.path.isfile(os.path.join(PATH, f))]

        for file in files:
            json = self.client.client.detect(file = file)
            self.assertEqual(json.get('error_message'), None)
        return

    def test_detect_with_path(self):
        self.client.setAttr()
        files = [os.path.join(PATH, f) for f in os.listdir(PATH) if os.path.isfile(os.path.join(PATH, f))]

        for file in files:
            json = self.client.client.detect(file = file)
            self.assertEqual(json.get('error_message'), None)
        return

    def test_detect_different_attributes(self):
        self.client.setAttr()
        files = [os.path.join(PATH, f) for f in os.listdir(PATH) if os.path.isfile(os.path.join(PATH, f))]

        json = self.client.client.detect(file = files[0], return_attributes = 'gender,age,emotion')
        print(json)
        self.assertTrue('emotion' in json['faces'][0]['attributes'])
        self.assertTrue('age' in json['faces'][0]['attributes'])
        self.assertTrue('gender' in json['faces'][0]['attributes'])
        return


    def test_SetAttr(self):

        self.client.__init__()
        self.client.setAttr()
        self.assertEqual(self.client.client.detect_params['return_attributes'], "gender,age,smiling,emotion" )

        self.client.setAttr(return_attributes = "gender,age,smiling,facequality,blur,eyestatus")
        self.assertEqual(self.client.client.detect_params['return_attributes'], "gender,age,smiling,facequality,blur,eyestatus" )
