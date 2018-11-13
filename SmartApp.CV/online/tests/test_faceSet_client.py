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
    # print(client.getFaceSets())

def test_deleteFaceSet(client):

    with pytest.raises(AttributeError):
        client.deleteFaceSet()

    with pytest.raises(AttributeError):
        client.deleteFaceSet(outer_id = "fiss", faceset_token = "aca2e06780a707b8cac736a71be546b0")

    with pytest.raises(AttributeError):
        client.deleteFaceSet(outer_id = "fiss", check_empty = "-1")

    with pytest.raises(AttributeError):
        client.deleteFaceSet(outer_id = "fiss", check_empty = -1)

    with pytest.raises(AttributeError):
        client.deleteFaceSet(outer_id = "fiss", check_empty = 2)


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
