# ELFVisionModule
ELF Agent Vision Module

*This project is currently under heavy development. Come back often to see what's new.*

## Highlights

APIs integration with:
- *Face++*
- *Azure Face*
- *Skybiometrics*  
for last tow see https://github.com/michelecafagna26/ELFVisionModule.git

that provides the following features:
- Face detection and recognition
- Emotion detection
- Age, gender dstimation

and an Offline neural-network-based model to perform:
- face recognition (not implemented yet)
- face detection
- scene understanding (not implemented yet)
- object tracking (not implemented yet)

## Usage


## Module output
The module receives a frame containing a face and outputs a dictionary structured as follows:

```
{
'TAG': 'VISION_FACE_ANALYSIS',
'personID': identifier of the face descriptor,
'emotion': {
            'sadness':   confidence in [0,1],
            'calm':      confidence in [0,1],
            'disgust':   confidence in [0,1],
            'anger':     confidence in [0,1],
            'surprise':  confidence in [0,1],
            'fear':      confidence in [0,1],
            'happiness': confidence in [0,1]
            },
'gender': predicted gender of person -- 'Male' / 'Female' / 'Unknown',
'age': predicted age of person -- int [0,99] U {-1} if unknown,
'smile': whether the person is smiling -- 'True' / 'False' / 'Unknown',
'known': whether the person has been already seen -- 'True' / 'False' / 'Unknown',
'confidence_identity': confidence of face matching -- float [0,1],
'lookAt': {
  'pinch': position to look in y axis -- float [-1, +1],
  'yaw': position to look in y axis -- float [-1, +1]
}
'isInterlocutor': whether the person is the interlocutor -- 'True' / 'False'
}
```

### Download/Installation

Using pip:
```
pip install -r requirements.txt
```
and run:
```
python StreamWebCam.py
```
**For Windows Users: if you have problem in installing dlib you can install it following https://github.com/charlielito/install-dlib-python-windows guide.**

## Important

- To use it you have to get API_KEY and API_SECRET for at least one of the services listed before.
- set virtual enviroments variables according to the service you want to use

*Variable Enviroment names*

AZURE:
- AZURE_FACE
- AZURE_VISION

SKYBIOMETRICS:
- SKYB_KEY
- SKYB_SECRET

FACE++:
- FACEpp_KEY
- FACEpp_SECRET
