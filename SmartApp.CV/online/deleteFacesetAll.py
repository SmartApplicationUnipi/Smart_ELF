from SDK.face_client import Facepp_Client

client = Facepp_Client()
client.setParamsDetect()

response = client.getFaceSets()
for faceset_token in response['facesets']:
    client.deleteFaceSet(faceset_token = faceset_token)

print("delete ALl facesets!\n")

response = client.getFaceSets()
print(response['facesets'])
