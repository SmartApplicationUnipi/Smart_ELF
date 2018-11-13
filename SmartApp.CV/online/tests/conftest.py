import pytest
from online.SDK.face_client import Facepp_Client

@pytest.fixture
def client():
    client = Facepp_Client()
    client.setParamsDetect()
    return client

@pytest.fixture
def filepath():
    return "online/tests/faces/f1.PNG"

@pytest.fixture
def getFacesetInstance(arg):

    class FaceSetFactory():

        __init__():
        

    return
