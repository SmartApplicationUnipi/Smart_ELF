from SDK.face_client import Facepp_Client

client = Facepp_Client()
client.setParamsDetect()

response = client.getFaceSets()
for faceset in response['facesets']:
    if not faceset["display_name"] == "ELF_Fibonacci_FaceSet_1":
        client.deleteFaceSet(faceset_token = faceset['faceset_token'])

print("delete all facesets!\n")

response = client.getFaceSets()
print(response['facesets'])

# client.createFaceSet(display_name = "ELF_Fibonacci_FaceSet_1", outer_id = "Fibonacci_FaceSet_0001", tags = "ELF,Fibinacci")
# response = client.getFaceSets()
# print(response['facesets'])
