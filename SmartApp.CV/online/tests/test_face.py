import pytest
import cv2
import os
from online.SDK.face_client import Facepp_Client

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

def test_detect(client, filepath):

    #check filepath
    response = client.detect(file = filepath)
    assert "error_message" not in response

    #check frame
    frame = cv2.imread(filepath , -1)
    response = client.detect(frame = frame)
    assert "error_message" not in response

    #check file
    file = open(filepath, 'rb')
    response = client.detect(file = file)
    file.close()
    assert "error_message" not in response

    #check invalid parameters
    with pytest.raises(AttributeError):
        client.detect()

def test_search(client, filepath):

    #detect a face
    res = client.detect(file = filepath)
    #get token
    face_token = res['faces'][0]['face_token']
    fake_outer_id = 'fakeSet'

    #create a faceset and add the detected token
    client.createFaceSet(outer_id = fake_outer_id, face_tokens = [face_token])

    #check filepath
    response = client.search(image_file = filepath, outer_id = fake_outer_id)
    assert "error_message" not in response
    assert len(response['faces']) > 0

    #check frame
    frame = cv2.imread(filepath , -1)
    response = client.search(image_file = frame,  outer_id = fake_outer_id)
    assert "error_message" not in response
    assert len(response['faces']) > 0

    #check file
    file = open(filepath, 'rb')
    response = client.search(image_file = file,  outer_id = fake_outer_id)
    file.close()
    assert "error_message" not in response
    assert len(response['faces']) > 0

    #check face_token
    response = client.search(face_token = 'fake_token',  outer_id = fake_outer_id)
    file.close()
    assert "error_message" not in response
    assert len(response['faces']) > 0

    #check invalid parameters
    with pytest.raises(AttributeError):
        client.search()

    #delete created FaceSet
    client.deleteFaceSet(outer_id = fake_outer_id)
