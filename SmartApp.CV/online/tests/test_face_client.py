import pytest
import cv2
import os
from online.SDK.face_client import Facepp_Client

@pytest.fixture
def client():
    client = Facepp_Client()
    client.setParamsDetect()
    return client

def test_setParamsDetect(client):

    with pytest.raises(AttributeError):
        client.setParamsDetect(return_landmark = "c")

    with pytest.raises(TypeError):
        client.setParamsDetect(return_attributes = 1)

    with pytest.raises(AttributeError):
        client.setParamsDetect(calculate_all = "c")

    with pytest.raises(TypeError):
        client.setParamsDetect(face_rectangle = 1)

    client.setParamsDetect(return_landmark = 1, return_attributes = "gender,age,emotion", calculate_all = 1, face_rectangle = "10,20,30,40")

    correct_params = { "return_landmark": 1,
    "return_attributes": "gender,age,emotion",
    "calculate_all" : 1,
    "face_rectangle": "10,20,30,40"
    }

    assert client.detect_params == correct_params

def test_detect(client):

    with pytest.raises(AttributeError):
        client.setParamsDetect(return_landmark = "c")
