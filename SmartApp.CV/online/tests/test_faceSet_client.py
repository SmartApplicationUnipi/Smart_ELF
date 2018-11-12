import pytest


def test_getFaceSets(client):

    with pytest.raises(AttributeError):
        client.getFaceSets(tags = 10)

    with pytest.raises(AttributeError):
        client.getFaceSets(start = -1)

    with pytest.raises(AttributeError):
        client.getFaceSets(start = "100")

    assert len(client.getFaceSets(tags = "no-one")["facesets"]) == 0
    assert len(client.getFaceSets(start = 2)["facesets"]) == 0

    # facesets = []
    # assert client.getFaceSets()["facesets"] == facesets


def test_getFaceSetDetail(client):

    with pytest.raises(AttributeError):
        client.getFaceSetDetail()

    with pytest.raises(AttributeError):
        client.getFaceSetDetail(outer_id = "fiss", faceset_token = "aca2e06780a707b8cac736a71be546b0")

    with pytest.raises(AttributeError):
        client.getFaceSetDetail(faceset_token = "aca2e06780a707b8cac736a71be546b0", start = -1)

    with pytest.raises(AttributeError):
        client.getFaceSetDetail(faceset_token = "aca2e06780a707b8cac736a71be546b0", start = 10001)

    with pytest.raises(AttributeError):
        client.getFaceSetDetail(faceset_token = "aca2e06780a707b8cac736a71be546b0", start = "10001")

    # print(client.getFaceSetDetail(faceset_token = "aca2e06780a707b8cac736a71be546b0"))
    # {
    #     'faceset_token': 'aca2e06780a707b8cac736a71be546b0',
    #     'tags': '',
    #     'time_used': 84,
    #     'user_data': '',
    #     'display_name': '',
    #     'face_tokens': [
    #         '1a5df659f8d32ab66a20f42453e23f3c',
    #         '5ad5f16b598562f68da33c64eb2c069e'
    #     ],
    #     'face_count': 2,
    #     'request_id': '1542063583,4e2e8d05-dc7b-47b3-b63b-1657282bb992',
    #     'outer_id': 'fiss'}
