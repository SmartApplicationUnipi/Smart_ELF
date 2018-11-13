from SDK.face_client import Facepp_Client

client = Facepp_Client()
client.setParamsDetect()

response = client.getFaceSets()
for faceset in response['facesets']:
    client.deleteFaceSet(faceset_token = faceset['faceset_token'])

print("delete all facesets!\n")

response = client.getFaceSets()
print(response['facesets'])
