import pytest
from online.SDK.face_client import Facepp_Client

class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

@pytest.fixture
def client():
    client = Facepp_Client()
    client.setParamsDetect()
    return client

@pytest.fixture
def filepath():
    return "online/tests/faces/f1.PNG"
