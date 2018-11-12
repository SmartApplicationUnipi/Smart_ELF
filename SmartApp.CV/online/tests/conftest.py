import pytest
from online.SDK.face_client import Facepp_Client

@pytest.fixture
def client():
    client = Facepp_Client()
    client.setParamsDetect()
    return client
